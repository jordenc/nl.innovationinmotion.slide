"use strict";

let CloudApi = require('./cloudapi');

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
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.get('slides/overview').then(resolve).catch(reject);
        });
    }

    /**
     * Get all zones in this Household
     *
     * @return {Promise<string>}
     */
    getZones() {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.get('zones').then(resolve).catch(reject);
        });
    }
}

module.exports = SlideHousehold;