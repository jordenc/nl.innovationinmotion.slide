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
						  
						  if (!error && response.statusCode === 200) {
							  
							  Homey.ManagerSettings.set('username', data.username);
							  Homey.ManagerSettings.set('password', data.password);
				
							  var token = body.access_token;
							  
							  Homey.ManagerSettings.set('token', token);
							  Homey.ManagerSettings.set('token_expires', body.expires_at);
							  
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
									  
									  if (!error && response.statusCode === 200) {
										 
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
					
	      });
	
	    socket.on('list_devices', function( data, callback ) {
		      
	      // emit when devices are still being searched
	      socket.emit('list_devices', devices );
	
	      // fire the callback when searching is done
	      callback( null, devices );
	
	    });
	  }

	  onInit() {
		  
		  console.log ("Driver initialisation done");
		  
		  this._StatusInterval = setInterval(this.checkToken.bind(this), 1000 * 60 * 60 * 24);
		  this.checkToken();
		  
	  }


	  checkToken() {
		  
		  	var expires = Homey.ManagerSettings.get('token_expires');
		  	var expire_date = new Date(expires);
			var expireDate = expire_date.getTime();
			
		  	var date = new Date();
			var renew_date = date.getDate() + 14;	//Renew token after 14 days (30 days validity)
			date.setDate(renew_date);
			var newDate = date.getTime();

			if (newDate > expireDate) {
		      	
				var username = Homey.ManagerSettings.get('username');
				var password = Homey.ManagerSettings.get('password');
				
				if (username && password) {
					
					var formData = {
						'email':		username, 
						'password': 	password
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
							  
							  if (!error && response.statusCode === 200) {
								  
								  var token = body.access_token;
								  
								  Homey.ManagerSettings.set('token', token);
								  Homey.ManagerSettings.set('token_expires', body.expires_at);
								  
							} else {
	
								console.log ("Unable to renew token");
								  
							}
						  }
						);
						
					} else {
						
						console.log ("No username and password setup yet");
						
					}
				
			} else {
				
				console.log("Token is still valid for more than 14 days");
				
			}
		  
	  }
}
	  
module.exports = SlideDriver;