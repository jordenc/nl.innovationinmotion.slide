"use strict";

let CloudApi = require('cloudapi');

class SlideDevice
{
    /**
     * SlideDevice constructor
     *
     * @param token
     * @param device_data
     */
    constructor(token, device_data) {
        this.api = new CloudApi(token);
        this.device_data = device_data;
    }

    /**
     * Get state of this specific Slide
     *
     * @param homeyDevice
     */
    getState(homeyDevice) {
        this.api.get(
            'slide/' + this.device_data.numid + '/info',
            function (status, body) {
                if (status) {
                    if (body.data.pos < 0) body.data.pos = 0;
                    if (body.data.pos > 1) body.data.pos = 1;
                    homeyDevice.setCapabilityValue ("windowcoverings_set", 1 - body.data.pos);
                }
                return Promise.resolve(status);
            });
    }

    /**
     * Stop motor of this specific Slide
     */
    immediateStop() {
        this.api.post(
            'slide/' + this.device_data.numid + '/stop', {},
            function (status, body) {
                return Promise.resolve(status);
            });
    }


    /**
     * Set position of this specific Slide
     *
     * @param value
     * @return {Promise<string>}
     */
    setPosition(value) {
        return new Promise(function (resolve, reject) {
            this.api.post(
                'slide/' + this.device_data.numid + '/position', {"pos": 1 - value},
                function (status, body) {
                    if (status) {
                        resolve(body);
                    } else {
                        reject(body);
                    }
                });
        });
    }

    /**
     * Set Touch&Go for this specific Slide
     *
     * @param value
     */
    toggleTouchGo(value) {
        this.api.patch(
            'slide/' + this.device_data.numid, {"touch_go": value},
            function (status, body) {
                return Promise.resolve(status);
            });
    }
}

module.exports = SlideDevice;