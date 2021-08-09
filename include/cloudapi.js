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
     * @param callback
     */
    get(apiMethod, callback) {
        console.log('CloudApi GET ' +  apiMethod + ' met token ' + this.token);

        request({
            url:  this.base_url + apiMethod,
            method: "GET",
            headers: this.headers,
            json: true,
        }, function (error, response, body) {
            console.log("CloudApi result = " + response.statusCode + " & body = " + JSON.stringify(body));
            callback((!error && response.statusCode === 200), body);
        });

    }

    /**
     * Do post method to Slide cloud API
     *
     * @param apiMethod
     * @param requestData
     * @param callback
     */
    post(apiMethod, requestData, callback) {
        console.log('CloudApi POST ' +  apiMethod + ' met token ' + this.token + ' requestData = ' +
            JSON.stringify(requestData));

        return request({
            url:  this.base_url + apiMethod,
            method: "POST",
            headers: this.headers,
            json: true,
            body: requestData
        },function (error, response, body) {

            //if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
            console.log("CloudApi result = " + response.statusCode + " & body = " + JSON.stringify(body));
            callback((!error && response.statusCode === 200), body);
        });
    }

    /**
     * Do patch method to Slide cloud API
     *
     * @param apiMethod
     * @param requestData
     * @param callback
     */
    patch(apiMethod, requestData, callback) {
        console.log('CloudApi PATCH ' +  apiMethod + ' met token ' + this.token + ' requestData = ' +
            JSON.stringify(requestData));

        return request({
            url:  this.base_url + apiMethod,
            method: "PATCH",
            headers: this.headers,
            json: true,
            body: requestData
        },function (error, response, body) {

            //if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
            console.log("CloudApi result = " + response.statusCode + " & body = " + JSON.stringify(body));
            callback((!error && response.statusCode === 200), body);
        });
    }
}

module.exports = CloudApi;