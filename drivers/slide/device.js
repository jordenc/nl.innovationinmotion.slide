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
        
        //this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
        
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
			        
			        if (typeof response.statusCode !== 'undefined') {
				        
				        if (response.statusCode === 200) {
				            
				            return Promise.resolve(true);
				            
				        } else {
				
				            console.log("error: " + error)
				            console.log("response.statusCode: " + response.statusCode)
				            console.log("response.statusText: " + response.statusText)
				        }
				        
				    }
			    })
				
			});
        
        //Poll the device every 30 seconds
	    this._StatusInterval = setInterval(this.check_status.bind(this), 30000);
		this.check_status();
        
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
	 		
	 		this.log("requestData = " + JSON.stringify(requestData));
	 		
	    	request({
			    url: 'http://' + device_data.host + '/rpc/Slide.SetPos',
			    method: "POST",
			    json: requestData
			},
			function (error, response, body) {
				
				if (typeof response.statusCode !== 'undefined') {
					
			        if (response.statusCode === 200) {
			            
			            console.log("response.statusCode: " + response.statusCode)
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
			        
			    }
		    })
			
	    }
	    
    }
    
    check_status () {
	    
	    console.log ("check status...");
	    
	    var device_data = this.getData();
	    
	    var thisdevice = this;
	    
	    request({
			url: 'http://' + device_data.host + "/rpc/Slide.GetInfo",
			method: "GET"
		},
		function (error, response, body) {
	        
	        if (typeof response.statusCode !== 'undefined') {
		        
		        if (response.statusCode === 200) {
			        
			       	try {
			        
				   		var result = JSON.parse(body);
		            
			            if (result.pos < 0) result.pos = 0;
			            
			            console.log("UPDATE dim status naar " + result.pos);
			            thisdevice.setCapabilityValue ("dim", result.pos);
			        
			        } catch (e) {
				        
				        console.log ("Error while retrieving status: " + e);
				        
			        }
		            
		        } else {
		
		            console.log("error: " + error)
		            console.log("response.statusCode: " + response.statusCode)
		            console.log("response.statusText: " + response.statusText)
		        }
	        
	        }
	    })
	    
    }
    
    /*
    onCapabilityOnOff (value, opts, callback) {
	    
	    this.log ("windowcoverings_state capability");
	    
	    this.log ("windowcoverings_state DIM value = " + JSON.stringify (value));
	    
	    var device_data = this.getData();

		if (value) {
			
			var requestData = {"pos":  0.00}
			
		} else {
			
			var requestData = {"pos":  1.00}
			
		}
		
		this.log("requestData = " + JSON.stringify(requestData));
	 		
    	request({
		    url: 'http://' + device_data.host + '/rpc/Slide.SetPos',
		    method: "POST",
		    json: requestData
		},
		function (error, response, body) {
	        if (response.statusCode === 200) {
	            
	            console.log("response.statusCode: " + response.statusCode)
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
    */

}

module.exports = SlideDevice;