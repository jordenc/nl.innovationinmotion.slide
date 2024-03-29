"use strict";

const Homey = require('homey');

class SlideLocalDriver extends Homey.Driver {

	/**
	 *
	 * @param socket
	 */
	async onPair(session) {

		await session.showView("set_local");

		session.setHandler('list_devices', async () => {

			this.log('list_devices searching mDNS');

			const discoveryStrategy = this.getDiscoveryStrategy('mdns-sd');
			const discoveryResults = discoveryStrategy.getDiscoveryResults();

			const devices = Object.values(discoveryResults).map(discoveryResult => {

				this.log('discoveryResult', discoveryResult);

				return {
					name: discoveryResult.txt.name,
					data: {
						id: discoveryResult.id,
						ip: discoveryResult.address,
						host: discoveryResult.host,
						touch_go: false,
						pos: 0
					},
				};
			});

			return devices;

		});
	}

	/**
	 * Driver initialisation done
	 */
	async onInit() {
		this.log("Local driver initialisation done");
	}

}
	  
module.exports = SlideLocalDriver;