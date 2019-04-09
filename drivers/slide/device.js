'use strict';

const Homey = require('homey');
let request	= require('request');

class SlideDevice extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
        
        var device_data = this.getData();

		let ImmediateStopAction = new Homey.FlowCardAction('ImmediateStop');
		ImmediateStopAction
			.register()
			.registerRunListener((args, state) => {
				
				var token = Homey.ManagerSettings.get('token');
				var device_data = this.getData();
				
				console.log('stop ' +  device_data.numid + ' met token ' + token);
			  
				request(
				  {
				  	method: "post",
				  	url: 'https://api.goslide.io/api/slide/' + device_data.numid + '/stop',
				    headers: {  
						"content-type": "application/json",
						"Authorization": 'Bearer ' + token
					},
				  	json: true
				  },
				  function (error, response, body) {
					  
					  console.log ("result = " + response.statusCode + " & body = " + JSON.stringify (body));
					  
					  if (!error && response.statusCode == 200) {
						
						return Promise.resolve( true );
						  
					} else {
						  
						return Promise.resolve( false );
						  
					}
				  }
				);
				
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
	 		var token = Homey.ManagerSettings.get('token');
	 		
	 		this.log("requestData = " + JSON.stringify(requestData));
	 		
	 		console.log ('slide ' + device_data.numid + ' moven met token ' + token);
	 		
	    		request({
			    url: 'https://api.goslide.io/api/slide/' + device_data.numid + '/position',
			    method: "POST",
			    headers: {  
					"content-type": "application/json",
					"Authorization": 'Bearer ' + token
				},
			    json: true,
			    body: requestData
			},
			function (error, response, body) {
				
				if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
					
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
	    
	    var device_data = this.getData();
	    var token = Homey.ManagerSettings.get('token');
	    
	    console.log ("check status of " + device_data.numid + "...");
	    
	    
	    var thisdevice = this;
	    
	    request({
			url: 'https://api.goslide.io/api/slide/' + device_data.numid + "/info",
			method: "get",
			headers: {  
				"content-type": "application/json",
				"Authorization": 'Bearer ' + token
			},
			json: true
		},
		function (error, response, body) {
			
			console.log("response.statusCode: " + response.statusCode)
			console.log("body = " + JSON.stringify (body));
	        
	        if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
		        
		        if (response.statusCode === 200) {
			        
			       	try {
			        
				   		//var result = JSON.parse(body);
		            
			            if (body.data.pos < 0) body.data.pos = 0;
			            
			            console.log("UPDATE dim status naar " + body.data.pos);
			            thisdevice.setCapabilityValue ("dim", body.data.pos);
			        
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

}

module.exports = SlideDevice;