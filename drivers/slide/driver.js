"use strict";

const Homey = require('homey');
let request	= require('request');
let devices = [];

class SlideDriver extends Homey.Driver {
	
	onPair( socket ) {
      
	      socket.on('login', ( data, callback ) => {
		      
		      console.log ("mydata = " + JSON.stringify (data));
		      
				var formData = {
					'email':		data.username, 
					'password': 	data.password
				};
	          
				  request(
					  {
					  	method: "post",
					  	url: 'https://api.goslide.io/api/auth/login',
					    body: formData,
					    headers: {  
							"content-type": "application/json",
						},
					  	json: true
					  },
					  function (error, response, body) {
						  
						  console.log ("result = " + response.statusCode + " & body = " + JSON.stringify (body));
						  
						  if (!error && response.statusCode == 200) {
							  
							  var token = body.access_token;
							  
							  Homey.ManagerSettings.set('token', token);
							  
							  request(
								  {
								  	method: "get",
								  	url: 'https://api.goslide.io/api/slides/overview',
								    headers: {  
										"content-type": "application/json",
										"Authorization": 'Bearer ' + token
									},
								  	json: true
								  },
								  function (error, response, body) {
									  
									  console.log ("result = " + response.statusCode + " & body = " + JSON.stringify (body));
									  
									  if (!error && response.statusCode == 200) {
										 
										body.slides.forEach (function(device) {
											
											devices.push(
											{
												data: {
													id			: device.device_id,
													numid		: device.id,
													slide_setup	: device.slide_setup,
													curtain_type	: device.curtain_type,
													pos			: device.device_info.pos,
													zone_id		: device.zone_id,
													touch_go		: device.touch_go,
													
												},
												name: device.device_name
											}
											
											);
											
										});
										
										console.log ("new devices = " + JSON.stringify (devices));
										
										callback( null, devices );
										  
									} else {
										  
										  callback (body.error);
										  
									}
								  }
								);
							  
						} else {
							  
							  callback (body.error);
							  
						}
					  }
					);

	          /*
	          this.login({ username, password })
	            .then(credentialsAreValid => {
	              if( credentialsAreValid === true ) {
	                callback( null, true );
	              } else if( credentialsAreValid === false ) {
	                callback( null, false );
	              } else {
	                throw new Error('Invalid Response');
	              }
	            })
	            .catch(err => {
	              callback(err);
	            });
	            */
	      });
	
	    socket.on('list_devices', function( data, callback ) {
		      
	      // emit when devices are still being searched
	      socket.emit('list_devices', devices );
	
	      // fire the callback when searching is done
	      callback( null, devices );
	
	      // when no devices are found, return an empty array
	      // callback( null, [] );
	
	      // or fire a callback with Error to show that instead
	      // callback( new Error('Something bad has occured!') );
	    });
	  }

}
	  
module.exports = SlideDriver;