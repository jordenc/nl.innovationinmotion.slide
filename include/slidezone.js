"use strict";

let CloudApi = require('cloudapi');

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
        const zone_id = this.zone_id;
        return new Promise(function (resolve, reject) {
            this.api.post(
                'zones/' + zone_id + '/position', {"pos": 1 - value},
                function (status, body) {
                    if (status) {
                        resolve(body);
                    } else {
                        reject(body);
                    }
                });
        });
    }
}

module.exports = SlideZone;