"use strict";

const Homey = require('homey');
const SlideAuth = require('../../include/slideauth');
const SlideHousehold = require('../../include/slidehousehold');
let devices = [];
let token = '';

class SlideDriver extends Homey.Driver {

	/**
	 *
	 * @param socket
	 */
	async onPair(session) {

		let username = "";
		let password = "";

		session.setHandler('login', async (data) => {

			username = data.username;
			password = data.password;

			var slideAuth = new SlideAuth();
			const credentialsAreValid = await slideAuth.login(data.username, data.password).then(result => {

				this.homey.settings.set('username', data.username);
				this.homey.settings.set('password', data.password);

				var token = result.access_token;

				this.homey.settings.set('token', token);
				this.homey.settings.set('token_expires', result.expires_at);

				return true;

			}).catch(message => {
				this.log(message);
				return false;
			});

			return credentialsAreValid;

		});

		session.setHandler('list_devices', async () => {

			//const api = await DeviceAPI.login({ username, password });
			//const api = await SlideDriver.login({ username, password });

			var slideAuth = new SlideAuth();
			return slideAuth.login(username, password).then(result => {

				var token = result.access_token;

				this.homey.settings.set('token', token);
				this.homey.settings.set('token_expires', result.expires_at);

				var slideHouseHold = new SlideHousehold(token);

				return slideHouseHold.getOverview().then(result => {

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

					return devices;

				}).catch(err => {
					this.log(err);
					return false;
				});

			}).catch(message => {
				this.log(message);
				return false;
			});

		});
	}

	/**
	 * Driver initialisation done
	 */
	async onInit() {
		this.log("Driver initialisation done");
		this.timer = setInterval(this.checkToken.bind(this), 86400000);
		this.checkToken();
	}

	/**
	 * Checks if access token is still valid
	 */
	async checkToken() {

		var expires = this.homey.settings.get('token_expires');
		var expire_date = new Date(expires);
		var expireDate = expire_date.getTime();

		var date = new Date();
		var renew_date = date.getDate() + 14;	//Renew token after 14 days (30 days validity)
		date.setDate(renew_date);
		var newDate = date.getTime();

		if (newDate > expireDate) {

			var username = this.homey.settings.get('username');
			var password = this.homey.settings.get('password');

			if (username && password) {

				var slideAuth = new SlideAuth();
				slideAuth.login(username, password).then(result => {

					this.homey.settings.set('token', result.access_token);
					this.homey.settings.set('token_expires', result.expires_at)

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