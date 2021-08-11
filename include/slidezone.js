"use strict";

let CloudApi = require('./cloudapi');

class SlideZone
{
    /**
     * SlideZone constructor
     *
     * @param token
     * @param zone_id
     */
    constructor(token, zone_id) {
        this.api = new CloudApi(token);
        this.zone_id = zone_id;
    }

    /**
     * Set position for all Slides in this specific zone
     *
     * @param value
     * @return {Promise<string>}
     */
    setPosition(value) {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.post('zones/' + self.zone_id + '/position', {"pos": 1 - value})
                .then(resolve).catch(reject);
        });
    }
}

module.exports = SlideZone;