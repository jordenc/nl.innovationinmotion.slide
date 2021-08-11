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
	    this._StatusInterval = setInterval(this.check_status.bind(this), 30000);
		this.check_status();
    }

	/**
	 * This method is called when the Device is added
	 */
	onAdded() {
        this.log('Device added');
		let device_data = this.getData();
		let slide = new Slide(Homey.ManagerSettings.get('token'), this.getData(), this);
		slide.saveStateToHomey(device_data.pos, device_data.touch_go, true);
    }

	/**
	 * This method is called when the Device is deleted
	 */
	onDeleted() {
        this.log('Device deleted');
        clearInterval(this._StatusInterval);
    }

	/**
	 *
	 * @param value
	 * @param opts
	 * @returns {Promise<never>}
	 */
	async onCapabilitySet (value, opts) {

		if (value === false) {
			value = 0;
		}
		if (value === true) {
			value = 1;
		}

		if (value < 0 || value > 1) {
		 	return Promise.reject( new Error('Value must be between 0.00 and 1.00 (' + value + ')') );
	 	}

		let slide = new Slide(Homey.ManagerSettings.get('token'), this.getData(), this);
		return slide.setPosition(value);
    }

	/**
	 * Check status and update device
	 */
	check_status () {
		let slide = new Slide(Homey.ManagerSettings.get('token'), this.getData(), this);
		return slide.getState();
    }

}

module.exports = SlideDevice;