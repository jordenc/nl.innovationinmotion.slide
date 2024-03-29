'use strict';

const Homey = require('homey');
let Slide	= require('../../include/slidedevice_local');

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
			// Not available in local API
			// "touch_go_state",
		];
		capabilitiesToRegister.forEach(capability => {
			if (!this.hasCapability(capability)) {
				this.addCapability(capability);
			}
		});

        this.registerCapabilityListener('windowcoverings_set', this.onCapabilitySet.bind(this));
        this.registerCapabilityListener('windowcoverings_closed', this.onCapabilitySet.bind(this));

		this.ImmediateStopAction = this.homey.flow.getActionCard('ImmediateStop');
		this.ImmediateStopAction.registerRunListener(async (args, state) => {
			this.slide = new Slide(args.device.getData(), args.device);
			return this.slide.immediateStop();
		});

		// Not available in local API:
		// this.enableTouchGoAction = this.homey.flow.getActionCard('EnableTouchGo');
		// this.enableTouchGoAction.registerRunListener(async ( args, state ) => {
		// 	this.slide = new Slide(this.homey.settings.get('token'), args.device.getData(), args.device);
		// 	return this.slide.toggleTouchGo(true);
		// });
		//
		// this.disableTouchGoAction = this.homey.flow.getActionCard('DisableTouchGo');
		// this.disableTouchGoAction.registerRunListener(async ( args, state ) => {
		// 	this.slide = new Slide(this.homey.settings.get('token'), args.device.getData(), args.device);
		// 	return this.slide.toggleTouchGo(false);
		// });

		this.ReCalibrateAction = this.homey.flow.getActionCard('ReCalibrate');
		this.ReCalibrateAction.registerRunListener(async (args, state) => {
			this.slide = new Slide(this.homey.settings.get('token'), args.device.getData(), args.device);
			return this.slide.calibrate();
		});
        
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
		this.slide = new Slide(this.getData(), this);
		slide.saveStateToHomey(this.device_data.pos, this.device_data.touch_go, this.device_data.calib_time, true);
    }

	/**
	 * This method is called when the Device is deleted
	 *
	 * @return void
	 */
	async onDeleted() {
        this.log('Device deleted');
        this.stopPolling();
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
		return this.slide.setPosition(value).then(() => {
			this.startPolling(this.calib_time + 3000); // Start polling the device again after motor is done
		}).catch(err => {
			this.log(err);
		});
    }

	/**
	 * Start polling for status updates for device every 30 seconds
	 *
	 * @param timeout
	 * @return void
	 */

    startPolling(timeout) {
		let polling = () => {
			this.checkStatus().then(() => {
				this.timer = setInterval(async () => {
					// Wrap the call to this.checkStatus in an async function and await its resolution.
					await this.checkStatus().catch(err => {
						// Catch and handle any errors from this.checkStatus.
						this.log(err);
					});
				}, 30000);
			}).catch(err => {
				this.log(err);
			});
		};
		setTimeout(polling, timeout);
	}

	/**
	 * Stop polling for status updates for device
	 *
	 * @return void
	 */
	stopPolling() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	/**
	 * Check status and update device
	 */
	checkStatus () {
		this.slide = new Slide(this.getData(), this);
		return this.slide.getState();
    }
}

module.exports = SlideDevice;