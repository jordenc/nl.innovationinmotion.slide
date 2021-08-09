"use strict";

let CloudApi = require('cloudapi');

class SlideHousehold
{
    /**
     * SlideHousehold constructor
     *
     * @param token
     */
    constructor(token) {
        this.api = new CloudApi(token);
    }

    /**
     * Get Household-wide state overview
     *
     * @return {Promise<string>}
     */
    getOverview() {
        return new Promise(function (resolve, reject) {
            this.api.get(
                'slides/overview',
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

module.exports = SlideHousehold;