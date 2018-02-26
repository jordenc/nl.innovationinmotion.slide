"use strict";

const Homey = require('homey');
let mdns 	= require('mdns-js');
let request	= require('request');
let devices = [];

class SlideDriver extends Homey.Driver {

    onPairListDevices( data, callback ){

	    var browser = mdns.createBrowser(mdns.tcp('slide'));
	    
	    browser.on('ready', function onReady() {
		  console.log('browser is ready');
		  browser.discover();
		});
		
		
		browser.on('update', function onUpdate(data) {
			
			console.log('data:', data);

			if (data.fullname.substr(0, 5) == "slide") {
				  
				request({
					url: 'http://' + data.host + "/rpc/Slide.GetInfo",
					method: "GET"
				},
					function (error, response, body) {
				        
				        var result = JSON.parse(body);
				            
				        if (!error && response.statusCode === 200) {
				            
				             var device = {
								  name: result.device_name,
								  data: {
									  id: data.fullname,
									  ip: data.addresses,
									  mac: result.mac,
									  host: data.host,
									  curtain_type: result.curtain_type,
									  pos: result.pos
								  }
							  }
							  
							  devices.push(device);
				            
				        }
				        else {
				
				            console.log("error: " + error)
				            console.log("response.statusCode: " + response.statusCode)
				            console.log("response.statusText: " + response.statusText)
				        }
				    })
		    } else {
			    
			    console.log (data.fullname + " is not a Slide device");
			    
		    }
		    
		});
		
		//stop after timeout
		setTimeout(function onTimeout() {
			browser.stop();
			console.log ("--TIME OUT--");
			console.log ("DEVICES = " + JSON.stringify (devices));
			callback (null, devices);
		}, 5000);
	    
    }

}

module.exports = SlideDriver;