'use strict';

const Homey = require('homey');
let Slide	= require('../../include/slidedevice');

class SlideDevice extends Homey.Device {

	/**
	 * This method is called when the Device is inited
	 */
	async onInit() {
        this.log('Device init');
        this.log('Device name:', this.getName());
        this.log('Device class:', this.getClass());

        const capabilitiesToRegister = [
			"windowcoverings_closed",
			"windowcoverings_set",
			"curtain_position",
			"touch_go_state",
		];
		capabilitiesToRegister.forEach(capability => {
			if (!this.hasCapability(capability)) {
				this.addCapability(capability);
			}
		});

        this.registerCapabilityListener('windowcoverings_set', this.onCapabilitySet.bind(this));
        this.registerCapabilityListener('windowcoverings_closed', this.onCapabilitySet.bind(this));

        //Poll the device every 30 seconds
		this.startPolling(0);
    }

	/**
	 * This method is called when the Device is added
	 *
	 * @return void
	 */
	async onAdded() {
        this.log('Device added');
		this.device_data = this.getData();
		this.slide = new Slide(this.homey.settings.get('token'), this.getData(), this);
		this.slide.saveStateToHomey(this.device_data.pos, this.device_data.touch_go, this.device_data.calib_time, true);
    }

	/**
	 * This method is called when the Device is deleted
	 *
	 * @return void
	 */
	async onDeleted() {
        this.log('Device deleted');
        this.deleted = true;
        this.stopPolling();
    }

	/**
	 * This method is called when the app is stopped or restarted
	 *
	 * @return void
	 */
	async onUninit() {
        this.stopPolling();
    }

	/**
	 * Flow card handlers, called from app.js
	 *
	 * @return {Promise<string>}
	 */
	immediateStop() {
		this.slide = new Slide(this.homey.settings.get('token'), this.getData(), this);
		return this.slide.immediateStop();
	}

	calibrate() {
		this.slide = new Slide(this.homey.settings.get('token'), this.getData(), this);
		return this.slide.calibrate();
	}

	setTouchGo(value) {
		this.slide = new Slide(this.homey.settings.get('token'), this.getData(), this);
		return this.slide.toggleTouchGo(value);
	}

	/**
	 * Capability listener for windowcoverings_set and windowcoverings_closed
	 *
	 * @param value
	 * @param opts
	 * @return {Promise<string>}
	 */
	async onCapabilitySet (value, opts) {
		if (value === false) {
			value = 1.00;
		}
		if (value === true) {
			value = 0.00;
		}
		if (value < 0 || value > 1) {
		 	return Promise.reject( new Error('Value must be between 0.00 and 1.00 (' + value + ')') );
	 	}
		// Clear interval to prevent updates during position changes
		this.stopPolling();

		this.slide = new Slide(this.homey.settings.get('token'), this.getData(), this);
		return this.slide.setPosition(value).catch(err => {
			this.log(err);
		}).then(() => {
			this.startPolling(this.calib_time + 3000); // Start polling the device again after motor is done
		});
    }

	/**
	 * Start polling for status updates for device every 30 seconds
	 *
	 * @param timeout
	 * @return void
	 */
    startPolling(timeout) {
		// Never run more than one poll loop per device
		this.stopPolling();

		this.pollTimeout = setTimeout(() => {
			this.pollTimeout = null;
			this.checkStatus().catch(err => {
				this.log(err);
			});
			this.timer = setInterval(() => {
				this.checkStatus().catch(err => {
					this.log(err);
				});
			}, 30000);
		}, timeout || 0);
	}

	/**
	 * Stop polling for status updates for device
	 *
	 * @return void
	 */
	stopPolling() {
		clearTimeout(this.pollTimeout);
		clearInterval(this.timer);
		this.pollTimeout = null;
		this.timer = null;
	}

	/**
	 * Check status and update device
	 */
	checkStatus () {
		if (this.deleted) {
			return Promise.resolve();
		}
		this.slide = new Slide(this.homey.settings.get('token'), this.getData(), this);
		return this.slide.getState();
    }
}

module.exports = SlideDevice;