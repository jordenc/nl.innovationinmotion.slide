"use strict";

const Homey = require('homey');
let SlideZone = require('./include/slidezone');
let SlideHousehold = require('./include/slidehousehold');

class App extends Homey.App {
	
	onInit() {
		this.log('Slide App init');

		let OpenZoneAction = new Homey.FlowCardAction('OpenZone');
		OpenZoneAction.register().registerRunListener((args, state) => {
			let zone = new SlideZone(Homey.ManagerSettings.get('token'), args.zone.id);
			return zone.setPosition(1);
		}).getArgument('zone').registerAutocompleteListener(this.zoneAutocompleteListener.bind(this));

		let CloseZoneAction = new Homey.FlowCardAction('CloseZone');
		CloseZoneAction.register().registerRunListener((args, state) => {
			let zone = new SlideZone(Homey.ManagerSettings.get('token'), args.zone.id);
			return zone.setPosition(0);
		}).getArgument('zone').registerAutocompleteListener(this.zoneAutocompleteListener.bind(this));

		let SetZoneAction = new Homey.FlowCardAction('SetZone');
		SetZoneAction.register().registerRunListener((args, state) => {
			let zone = new SlideZone(Homey.ManagerSettings.get('token'), args.zone.id);
			return zone.setPosition(args.windowcoverings_set);
		}).getArgument('zone').registerAutocompleteListener(this.zoneAutocompleteListener.bind(this));

		let CalibrateZoneAction = new Homey.FlowCardAction('CalibrateZone');
		CalibrateZoneAction.register().registerRunListener((args, state) => {
			let zone = new SlideZone(Homey.ManagerSettings.get('token'), args.zone.id);
			return zone.calibrate();
		}).getArgument('zone').registerAutocompleteListener(this.zoneAutocompleteListener.bind(this));
	}

	/**
	 * Fill autocomplete for all zone flowcards
	 *
	 * @param query
	 * @param args
	 * @return {Promise<[{some_value_for_myself: string, icon: string, name: string, description: string}, {}]>}
	 */
	zoneAutocompleteListener(query, args) {
		return new Promise(function (resolve, reject) {
			let household = new SlideHousehold(Homey.ManagerSettings.get('token'));
			household.getZones().then(body => {
				let zones = [];
				Object.values(body.data).forEach(function (zone) {
					zones.push({
						id: zone.id,
						name: zone.name,
					});
				});
				resolve(zones);
			}).catch(reject);
		});
	}
}

module.exports = App;