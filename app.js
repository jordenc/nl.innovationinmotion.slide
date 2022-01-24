"use strict";

const Homey = require('homey');
const SlideZone = require('./include/slidezone');
const SlideHousehold = require('./include/slidehousehold');

class App extends Homey.App {
	
	async onInit() {
		this.log('Slide App init');

		this.OpenZoneAction = this.homey.flow.getActionCard('OpenZone');
		this.OpenZoneAction.registerRunListener(async (args, state) => {
			this.zone = new SlideZone(this.homey.settings.get('token'), args.zone.id);
			return this.zone.setPosition(1);
		}).registerArgumentAutocompleteListener("zone", this.zoneAutocompleteListener.bind(this));

		this.OpenZoneAction = this.homey.flow.getActionCard('CloseZone');
		this.OpenZoneAction.registerRunListener(async (args, state) => {
			this.zone = new SlideZone(this.homey.settings.get('token'), args.zone.id);
			return this.zone.setPosition(0);
		}).registerArgumentAutocompleteListener("zone", this.zoneAutocompleteListener.bind(this));

		this.SetZoneAction = this.homey.flow.getActionCard('SetZone');
		this.SetZoneAction.registerRunListener(async (args, state) => {
			this.zone = new SlideZone(this.homey.settings.get('token'), args.zone.id);
			return this.zone.setPosition(args.windowcoverings_set);
		}).registerArgumentAutocompleteListener("zone", this.zoneAutocompleteListener.bind(this));

		this.CalibrateZoneAction = this.homey.flow.getActionCard('CalibrateZone');
		this.CalibrateZoneAction.registerRunListener(async (args, state) => {
			this.zone = new SlideZone(this.homey.settings.get('token'), args.zone.id);
			return this.zone.calibrate();
		}).registerArgumentAutocompleteListener ("zone", this.zoneAutocompleteListener.bind(this));
	}

	/**
	 * Fill autocomplete for all zone flowcards
	 *
	 * @param query
	 * @param args
	 * @return {Promise<[{some_value_for_myself: string, icon: string, name: string, description: string}, {}]>}
	 */
	async zoneAutocompleteListener(query, args) {
		this.household = new SlideHousehold(this.homey.settings.get('token'));

		return this.household.getZones().then(body => {
			var zones = [];
			Object.values(body.data).forEach(function (zone) {
				zones.push({
					name: zone.name,
					id: zone.id,
				});
			});

			// filter based on the query
			return zones.filter((zone) => {
				return zone.name.toLowerCase().includes(query.toLowerCase());
			});
		});
	}
}

module.exports = App;