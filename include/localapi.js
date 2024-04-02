"use strict";

let request	= require('request');

class LocalApi
{
    /**
     * Slide LocalApi constructor
     *
     * @param token
     */
    constructor() {
        this.headers = {
            "Content-Type": "application/json",
        }
    }

    /**
     * Do get method to Slide local API
     *
     * @param apiMethod
     * @param callback
     */
    get(apiMethod, callback) {
        console.log('localApi GET ' +  apiMethod);

        const self = this;
        return new Promise(function (resolve, reject) {
            request({
                url: apiMethod,
                method: "GET",
                headers: self.headers,
                json: true,
            }, function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else {
                    if (typeof body !== "undefined" && body.message) {
                        console.error('LocalApi get API error:', body.message);
                        reject(new Error(body.message));
                    } else if(error) {
                        console.error('LocalApi get HTTP error:', error);
                        reject(error);
                    } else {
                        reject(new Error('LocalApi get unknown error'));
                    }
                }
            });
        });

    }

    /**
     * Do post method to Slide local API
     *
     * @param apiMethod
     * @param requestData
     * @param callback
     */
    post(apiMethod, requestData, callback) {
        console.log('localApi {POST} ' +  apiMethod);

        const self = this;
        return new Promise(function (resolve, reject) {

            return request({
                url: apiMethod,
                method: "POST",
                headers: self.headers,
                json: true,
                body: requestData
            }, function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else {
                    if (typeof body !== "undefined" && body.message) {
                        console.error('LocalApi post API error:', body.message);
                        reject(new Error(body.message));
                    } else if(error) {
                        console.error('LocalApi post HTTP error:', error);
                        reject(error);
                    } else {
                        reject(new Error('LocalApi post unknown error'));
                    }
                }
            });
        });
    }
}

module.exports = LocalApi;