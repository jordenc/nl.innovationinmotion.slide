'use strict';

const Homey = require('homey');
let request	= require('request');

class SlideDevice extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        // register a capability listener
        this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
        
        var device_data = this.getData();

		let ImmediateStopAction = new Homey.FlowCardAction('ImmediateStop');
		ImmediateStopAction
			.register()
			.registerRunListener((args, state) => {
				
				request({
					url: 'http://' + device_data.host + "/rpc/Slide.Stop",
					method: "GET"
				},
				function (error, response, body) {
			        
			        var result = JSON.parse(body);
			            
			        if (!error && response.statusCode === 200) {
			            
			            return Promise.resolve(true);
			            
			        }
			        else {
			
			            console.log("error: " + error)
			            console.log("response.statusCode: " + response.statusCode)
			            console.log("response.statusText: " + response.statusText)
			        }
			    })
				
			});
        
        /* ERROR: this.setCapabilityValue is not a function
        request({
			url: 'http://' + device_data.host + "/rpc/Slide.GetInfo",
			method: "GET"
		},
		function (error, response, body) {
	        
	        var result = JSON.parse(body);
	            
	        if (!error && response.statusCode === 200) {
	            
	            if (result.pos < 0) result.pos = 0;
	            
	            this.setCapabilityValue ("dim", result.pos);
	            
	        }
	        else {
	
	            console.log("error: " + error)
	            console.log("response.statusCode: " + response.statusCode)
	            console.log("response.statusText: " + response.statusText)
	        }
	    })
        */
        
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
        
        var device_data = this.getData();

		if (device_data.pos < 0) device_data.pos = 0;
        this.setCapabilityValue ("dim", device_data.pos);
        
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    onCapabilityDim (value, opts, callback) {
	    
	    this.log("opts = " + JSON.stringify (opts));
	    
	 	this.log("callback = " + JSON.stringify (callback));
	    
	    this.log ("DIM value = " + JSON.stringify (value));
	 	
	 	if (value < 0 || value > 1) {
		 	
		 	return Promise.reject( new Error('Value must be between 0.00 and 1.00 (' + value + ')') );
		 	
	 	} else {
	 	
	 		var requestData = {"pos":  value}
	 		var device_data = this.getData();
	 		
	 		//var requestData = '{"pos":  "' + value + '"}';
	 		
	 		this.log("requestData = " + requestData);
	 		
	    	request({
			    url: 'http://' + device_data.host + '/rpc/Slide.SetPos',
			    method: "POST",
			    json: requestData
			},
			function (error, response, body) {
		        if (!error && response.statusCode === 200) {
		            
		            console.log("error: " + error)
		            console.log("response.statusCode: " + response.statusCode)
		            console.log("response.statusText: " + response.statusText)
		            console.log("body = " + JSON.stringify (body));
		            
		            if (body.response == "success") {
			         
			         	callback (null, true);
			            
			        } else {
				     
				     	callback (body.response, false);
				        
				    }
		            
		        }
		        else {
		
		            console.log("error: " + error)
		            console.log("response.statusCode: " + response.statusCode)
		            console.log("response.statusText: " + response.statusText)
		        }
		    })
			
	    }
	    
    }

}

module.exports = SlideDevice;