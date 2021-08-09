'use strict';

const Homey = require('homey');
let Slide	= require('include/slidedevice');

class SlideDevice extends Homey.Device {

	/**
	 * This method is called when the Device is inited
	 */
	onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this.registerCapabilityListener('windowcoverings_set', this.onCapabilitySet.bind(this));

		let ImmediateStopAction = new Homey.FlowCardAction('ImmediateStop');
		ImmediateStopAction
			.register()
			.registerRunListener((args, state) => {

				var slide = new Slide(Homey.ManagerSettings.get('token'), this.getData());
				slide.immediateStop();

			});
        
        //Poll the device every 30 seconds
	    this._StatusInterval = setInterval(this.check_status.bind(this), 30000);
		this.check_status();
		
    }

	/**
	 * This method is called when the Device is added
	 */
	onAdded() {
        this.log('device added');
        
        var device_data = this.getData();

		if (device_data.pos < 0) device_data.pos = 0;
		if (device_data.pos > 1) device_data.pos = 1;
        this.setCapabilityValue ("windowcoverings_set", 1 - device_data.pos);
        
    }

	/**
	 * This method is called when the Device is deleted
	 */
	onDeleted() {
        this.log('device deleted');
        clearInterval(this._StatusInterval);
    }

	/**
	 *
	 * @param value
	 * @param opts
	 * @returns {Promise<never>}
	 */
	async onCapabilitySet (value, opts) {
	 	if (value < 0 || value > 1) {
		 	return Promise.reject( new Error('Value must be between 0.00 and 1.00 (' + value + ')') );
	 	} else {
			var slide = new Slide(Homey.ManagerSettings.get('token'), this.getData());
			return slide.setPosition(value);
	    }
    }

	/**
	 *
	 */
	check_status () {
		var slide = new Slide(Homey.ManagerSettings.get('token'), this.getData());
		return slide.getState(this);
    }

}

module.exports = SlideDevice;