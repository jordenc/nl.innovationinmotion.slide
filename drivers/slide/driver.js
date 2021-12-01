"use strict";

const Homey = require('homey');
let SlideAuth = require('../../include/slideauth');
let SlideHousehold = require('../../include/slidehousehold');
let devices = [];

class SlideDriver extends Homey.Driver {

	/**
	 *
	 * @param socket
	 */
	onPair(socket) {
      
	      socket.on('login', (data, callback) => {
		      var slideAuth = new SlideAuth();
		      slideAuth.login(data.username, data.password).then(result => {

				  Homey.ManagerSettings.set('username', data.username);
				  Homey.ManagerSettings.set('password', data.password);

				  var token = result.access_token;

				  Homey.ManagerSettings.set('token', token);
				  Homey.ManagerSettings.set('token_expires', result.expires_at);

				  var slideHouseHold = new SlideHousehold(token);
				  slideHouseHold.getOverview().then(result => {
					  result.slides.forEach(function (device) {
						  devices.push({
								  data: {
									  id: device.device_id,
									  numid: device.id,
									  name: device.device_name,
									  calib_time: 30000,
									  slide_setup: device.slide_setup,
									  household_id: device.household_id,
									  zone_id: device.zone_id,
									  touch_go: device.touch_go,
									  pos: device.device_info.pos,
								  },
								  name: device.device_name
							  });
					  });
					  callback(null, devices);

				  }).catch(err => {
				  	this.log(err);
				  })

			  }).catch(message => {
			  	callback(message);
			  	this.log(message);
			  });
	      });

	      socket.on('list_devices', function(data, callback) {
			  // emit when devices are still being searched
			  socket.emit('list_devices', devices);

			  // fire the callback when searching is done
			  callback(null, devices);
	      });
	  }

	/**
	 * Driver initialisation done
	 */
	onInit() {
		  this.log("Driver initialisation done");
		  this.timer = setInterval(this.checkToken.bind(this), 86400000);
		  this.checkToken();
	  }

	/**
	 * Checks if access token is still valid
	 */
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

				var slideAuth = new SlideAuth();
				slideAuth.login(username, password).then(result => {

					Homey.ManagerSettings.set('token', result.access_token);
					Homey.ManagerSettings.set('token_expires', result.expires_at)

				}).catch(err => {
					this.log(err);
				});

			} else {
				this.log("No username and password setup yet");
			}
		} else {
			this.log("Token is still valid for more than 14 days");
		}
	}
}
	  
module.exports = SlideDriver;