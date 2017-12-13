"use strict";

'use strict';

const Homey = require('homey');

class SlideDriver extends Homey.Driver {

    onPairListDevices( data, callback ){

        callback( null, [
            {
                name: 'Foo Device',
                data: {
                    id: 'foo'
                }
            }
        ]);

    }

}

module.exports = SlideDriver;

/*
var request = require('request');
var tempIP = '';
var devices = {};

module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {

    Homey.log ('Changed settings: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj));
    
    try {
      changedKeysArr.forEach(function (key) {
        devices[device_data.id].settings[key] = newSettingsObj[key]
      })
      callback(null, true)
    } catch (error) {
      callback(error)
    }

};

module.exports.init = function(devices_data, callback) {
    
    devices_data.forEach(function initdevice(device) {
	    
	    Homey.log('add device: ' + JSON.stringify(device));
	    
	    devices[device.id] = device;    
	    
	    module.exports.getSettings(device, function(err, settings){
		    devices[device.id].settings = settings;
		});
		
	});
	
	Homey.log("Slide app - init done");
	
	callback (null, true);
};

module.exports.deleted = function( device_data ) {
    
    Homey.log('deleted: ' + JSON.stringify(device_data));
    
    devices[device_data.id] = [];
	
};

module.exports.pair = function (socket) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function (data, callback) {

		Homey.log("Slide app - list_devices tempIP is " + tempIP);
		
		var devices = [{
			name				: tempIP,
			data: {
				id				: tempIP,
			},
			settings: {
				"ipaddress" 	: tempIP
			}
		}];

		callback (null, devices);

	});

	// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function (data, callback) {

		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		Homey.log ( "Slide app - got get_devices from front-end, tempIP =" + tempIP );

		// assume IP is OK and continue
		socket.emit ('continue', null);

	});

	socket.on('disconnect', function(){
		Homey.log("Slide app - User aborted pairing, or pairing is finished");
	})
}

// CAPABILITIES
module.exports.capabilities = {
    onoff: {

        get: function( device_data, callback ){

			if (typeof devices[device_data.id] === "undefined") {
				
				callback (null, false);
				
			} else {
			
				Homey.log('Getting device_status of ' + devices[device_data.id].settings.ipaddress);
	            
	            						
            
            }
        },

        set: function( device_data, turnon, callback ) {
	        
	        Homey.log('Setting device_status of ' + devices[device_data.id].settings.ipaddress + ' to ' + turnon);

			if (turnon) {
				
				var r = request.post("http://" + devices[device_data.id].settings.ipaddress + "/api/v1.0/slide/open", requestCallback);
				
				function requestCallback(err, res, body) {
				  	Homey.log(body);
				  	if (typeof body !== "undefined" && typeof body.success !== "undefined") {
		  	
					  	if (body.success == true) callback (null, true);
					  	
					} else {
						
						callback ('Unknown status', false);
						
					}
				}
				
			} else {
				
				var r = request.post("http://" + devices[device_data.id].settings.ipaddress + "/api/v1.0/slide/close", requestCallback);
				
				function requestCallback(err, res, body) {
				  	Homey.log(body);
				  	if (typeof body !== "undefined" && typeof body.success !== "undefined") {
		  	
					  	if (body.success == true) callback (null, true);
					  	
					} else {
						
						callback ('Unknown status', false);
						
					}
				}
				
			}

        }
    }
}

Homey.on('unload', function(){
	
});

// flow action handlers
Homey.manager('flow').on('action.OpenSlide', function (callback, args) {

	var r = request.post("http://" + devices[device_data.id].settings.ipaddress + "/api/v1.0/slide/open", requestCallback);
				
	function requestCallback(err, res, body) {
	  	Homey.log(body);
	  	if (typeof body !== "undefined" && typeof body.success !== "undefined") {
		  	
		  	if (body.success == true) callback (null, true);
		  	
		} else {
			
			callback ('Unknown status', false);
			
		}
	}
				
});

Homey.manager('flow').on('action.CloseSlide', function (callback, args) {
	
	var r = request.post("http://" + devices[device_data.id].settings.ipaddress + "/api/v1.0/slide/close", requestCallback);
				
	function requestCallback(err, res, body) {
	  	Homey.log(body);
	  	if (typeof body !== "undefined" && typeof body.success !== "undefined") {
		  	
		  	if (body.success == true) callback (null, true);
		  	
		} else {
			
			callback ('Unknown status', false);
			
		}
	}

});

Homey.manager('flow').on('action.ImmediateStop', function (callback, args) {
	
	var r = request.post("http://" + devices[device_data.id].settings.ipaddress + "/api/v1.0/slide/stop", requestCallback);
				
	function requestCallback(err, res, body) {
	  	Homey.log(body);
	  	if (typeof body !== "undefined" && typeof body.success !== "undefined") {
		  	
		  	if (body.success == true) callback (null, true);
		  	
		} else {
			
			callback ('Unknown status', false);
			
		}
	}

});
*/