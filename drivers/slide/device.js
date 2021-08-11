'use strict';

const Homey = require('homey');
let Slide	= require('../../include/slidedevice');

class SlideDevice extends Homey.Device {

	/**
	 * This method is called when the Device is inited
	 */
	onInit() {
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

		let ImmediateStopAction = new Homey.FlowCardAction('ImmediateStop');
		ImmediateStopAction.register().registerRunListener((args, state) => {
				console.log(state);
				let slide = new Slide(Homey.ManagerSettings.get('token'), args.device.getData(), args.device);
				return slide.immediateStop();
			});

		let enableTouchGoAction = new Homey.FlowCardAction('EnableTouchGo');
		enableTouchGoAction.register().registerRunListener(async ( args, state ) => {
			let slide = new Slide(Homey.ManagerSettings.get('token'), args.device.getData(), args.device);
			return slide.toggleTouchGo(true);
		});

		let disableTouchGoAction = new Homey.FlowCardAction('DisableTouchGo');
		disableTouchGoAction.register().registerRunListener(async ( args, state ) => {
			let slide = new Slide(Homey.ManagerSettings.get('token'), args.device.getData(), args.device);
			return slide.toggleTouchGo(false);
		});
        
        //Poll the device every 30 seconds
		this.startPolling(0);
    }

	/**
	 * This method is called when the Device is added
	 *
	 * @return void
	 */
	onAdded() {
        this.log('Device added');
		let device_data = this.getData();
		let slide = new Slide(Homey.ManagerSettings.get('token'), this.getData(), this);
		slide.saveStateToHomey(device_data.pos, device_data.touch_go, device_data.calib_time, true);
    }

	/**
	 * This method is called when the Device is deleted
	 *
	 * @return void
	 */
	onDeleted() {
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

		let slide = new Slide(Homey.ManagerSettings.get('token'), this.getData(), this);
		return slide.setPosition(value).then(() => {
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
				this.timer = setInterval(this.checkStatus.bind(this), 30000);
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
		let slide = new Slide(Homey.ManagerSettings.get('token'), this.getData(), this);
		return slide.getState();
    }
}

module.exports = SlideDevice;