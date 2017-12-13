'use strict';

const Homey = require('homey');

class SlideDevice extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        // register a capability listener
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))
        this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this))
        
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device
        this.log ("ONOFF value = " + JSON.stringify (value));
        
        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }
    
    onCapabilityDim (value, callback) {
	    
	 	this.log ("DIM value = " + JSON.stringify (value));
	 	
	 	if (value > 0 || value > 1) {
		 	
		 	return Promise.reject( new Error('Value must be between 0.00 and 1.00 (' + value + ')') );
		 	
	 	} else {
	 	
	 		var requestData = {"pos": value}
	 		
	 		var url = 'http://hostname.local/rpc/Slide.SetPos';
	 		
	    	/*
		    	request({
				    url: url,
				    method: "POST",
				    json: requestData
				},
				function (error, response, body) {
			        if (!error && response.statusCode === 200) {
			            
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
			*/
			
			callback (null);
			
	    }
	    
    }

}

module.exports = SlideDevice;