"use strict";

let CloudApi = require('./cloudapi');

class SlideAuth
{
    /**
     * SlideAuth constructor
     *
     * @param token
     */
    constructor(token) {
        this.api = new CloudApi(token);
    }

    /**
     * Get Household-wide state overview
     *
     * @param username
     * @param password
     * @return {Promise<string>}
     */
    login(username, password) {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.post('auth/login', {'email': username, 'password': password})
                .then(resolve).catch(reject);
        });
    }
}

module.exports = SlideAuth;