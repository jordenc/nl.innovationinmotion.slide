"use strict";

let CloudApi = require('cloudapi');

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
     * @return {Promise<string>}
     */
    login(username, password) {
        return new Promise(function (resolve, reject) {
            this.api.post(
                'auth/login', {'email': username, 'password': password},
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

module.exports = SlideAuth;