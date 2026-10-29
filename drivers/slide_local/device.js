'use strict';

const Homey = require('homey');
let SlideLocal	= require('../../include/slidedevice_local');

class SlideDevice extends Homey.Device {

	/**
	 * This method is called when the Device is inited
	 */
	async onInit() {
        this.log('Device init');
        this.log('Device name:', this.getName());
        this.log('Device getData():', this.getData());
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
        this.registerCapabilityListener('touch_go_state', this.onCapabilitySetTouch.bind(this));

		// Pick up the current IP address right away, instead of waiting for a discovery event
		const discoveryResults = this.driver.getDiscoveryStrategy().getDiscoveryResults();
		const discoveryResult = Object.values(discoveryResults).find(result => this.onDiscoveryResult(result));
		this.log('Discovery result:', discoveryResult ? discoveryResult.address : 'not found');
		if (discoveryResult) {
			await this.saveAddress(discoveryResult.address);
		}

        //Poll the device every 5 seconds
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
		this.slide = new SlideLocal(this.getData(), this);
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
	 * Validate the address entered in the device settings
	 *
	 * @param oldSettings
	 * @param newSettings
	 * @param changedKeys
	 * @return void
	 */
	async onSettings({ oldSettings, newSettings, changedKeys }) {
		if (changedKeys.includes('address')) {
			const address = (newSettings.address || '').trim();
			if (address !== '' && !/^[A-Za-z0-9.-]+$/.test(address)) {
				throw new Error(this.homey.__('settings.invalid_address'));
			}
			this.log('Address setting changed to', address || 'automatic');
		}
	}

	/**
	 * mDNS discovery: match discovery results to this device
	 *
	 * @param discoveryResult
	 * @return {boolean}
	 */
	onDiscoveryResult(discoveryResult) {
		return discoveryResult.id === this.getData().id;
	}

	/**
	 * mDNS discovery: device found, store its current IP address
	 *
	 * @param discoveryResult
	 * @return void
	 */
	async onDiscoveryAvailable(discoveryResult) {
		await this.saveAddress(discoveryResult.address);
	}

	/**
	 * mDNS discovery: IP address of the device changed
	 *
	 * @param discoveryResult
	 * @return void
	 */
	async onDiscoveryAddressChanged(discoveryResult) {
		await this.saveAddress(discoveryResult.address);
	}

	/**
	 * Store the IP address that is used for all local API requests
	 *
	 * @param address
	 * @return void
	 */
	async saveAddress(address) {
		if (address && address !== this.getStoreValue('address')) {
			this.log('Device address changed to', address);
			await this.setStoreValue('address', address);
		}
	}

	/**
	 * Flow card handlers, called from app.js
	 *
	 * @return {Promise<string>}
	 */
	immediateStop() {
		this.slide = new SlideLocal(this.getData(), this);
		return this.slide.immediateStop();
	}

	calibrate() {
		this.slide = new SlideLocal(this.getData(), this);
		return this.slide.calibrate();
	}

	setTouchGo(value) {
		this.slide = new SlideLocal(this.getData(), this);
		return this.slide.setTouchGo(value);
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

		this.slide = new SlideLocal(this.getData(), this);
		return this.slide.setPosition(value).catch(err => {
			this.log(err);
		}).then(() => {
			this.startPolling(this.calib_time + 3000); // Start polling the device again after motor is done
		});
    }

	async onCapabilitySetTouch (value, opts) {

		this.slide = new SlideLocal(this.getData(), this);
		return this.slide.setTouchGo(value).then(() => {
			this.log ("touch go set!")
		}).catch(err => {
			this.log(err);
		});
    }

	/**
	 * Start polling for status updates for device every 5 seconds
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
			}, 5000);
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
		this.slide = new SlideLocal(this.getData(), this);
		return this.slide.getState().then(body => {
			// Homey marks the device unavailable when mDNS discovery loses it, even when the
			// Slide still answers on its IP address. Base availability on the API instead.
			this.failed_polls = 0;
			if (!this.getAvailable()) {
				this.setAvailable().catch(err => this.log(err));
			}
			return body;
		}, err => {
			this.failed_polls = (this.failed_polls || 0) + 1;
			if (this.failed_polls === 3) {
				this.setUnavailable(this.homey.__('device.unreachable')).catch(err => this.log(err));
			}
			throw err;
		});
    }
}

module.exports = SlideDevice;