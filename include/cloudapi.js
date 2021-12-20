"use strict";

let request	= require('request');

class CloudApi
{
    /**
     * Slide CloudApi constructor
     *
     * @param token
     */
    constructor(token) {
        this.base_url = 'https://api.goslide.io/api/';
        if (typeof token !== 'undefined') {
            this.headers = {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + token
            }
        } else {
            this.headers = {
                "Content-Type": "application/json",
            }
        }
    }

    /**
     * Do get method to Slide cloud API
     *
     * @param apiMethod
     * @return {Promise<string>}
     */
    get(apiMethod) {
        console.log('CloudApi GET ' +  apiMethod);

        const self = this;
        return new Promise(function (resolve, reject) {
            request({
                url: self.base_url + apiMethod,
                method: "GET",
                headers: self.headers,
                json: true,
            }, function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else {
                    if (typeof body !== "undefined" && body.message) {
                        console.error('CloudApi get API error:', body.message);
                        reject(new Error(body.message));
                    } else if(error) {
                        console.error('CloudApi get HTTP error:', error);
                        reject(error);
                    } else {
                        reject(new Error('CloudApi get unknown error'));
                    }
                }
            });
        });
    }

    /**
     * Do post method to Slide cloud API
     *
     * @param apiMethod
     * @param requestData
     * @return {Promise<string>}
     */
    post(apiMethod, requestData) {
        console.log('CloudApi POST ' +  apiMethod + ' requestData = ' +
            JSON.stringify(requestData));

        const self = this;
        return new Promise(function (resolve, reject) {

            return request({
                url: self.base_url + apiMethod,
                method: "POST",
                headers: self.headers,
                json: true,
                body: requestData
            }, function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else {
                    if (typeof body !== "undefined" && body.message) {
                        console.error('CloudApi post API error:', body.message);
                        reject(new Error(body.message));
                    } else if(error) {
                        console.error('CloudApi post HTTP error:', error);
                        reject(error);
                    } else {
                        reject(new Error('CloudApi post unknown error'));
                    }
                }
            });
        });
    }

    /**
     * Do patch method to Slide cloud API
     *
     * @param apiMethod
     * @param requestData
     * @return {Promise<string>}
     */
    patch(apiMethod, requestData) {
        console.log('CloudApi PATCH ' +  apiMethod + ' requestData = ' +
            JSON.stringify(requestData));

        const self = this;
        return new Promise(function (resolve, reject) {

            return request({
                url: self.base_url + apiMethod,
                method: "PATCH",
                headers: self.headers,
                json: true,
                body: requestData
            }, function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else {
                    if (typeof body !== "undefined" && body.message) {
                        console.error('CloudApi patch API error:', body.message);
                        reject(new Error(body.message));
                    } else if(error) {
                        console.error('CloudApi patch HTTP error:', error);
                        reject(error);
                    } else {
                        reject(new Error('CloudApi patch unknown error'));
                    }
                }
            });
        });
    }
}

module.exports = CloudApi;