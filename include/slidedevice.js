"use strict";

let CloudApi = require('./cloudapi');

class SlideDevice
{
    /**
     * SlideDevice constructor
     *
     * @param token
     * @param device_data
     * @param homeyDevice
     */
    constructor(token, device_data, homeyDevice) {
        this.api = new CloudApi(token);
        this.device_data = device_data;
        this.homeyDevice = homeyDevice;
    }

    /**
     * Get state of this specific Slide
     *
     * @return {Promise<string>}
     */
    getState() {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.get('slide/' + self.device_data.numid + '/info').then(body => {
                self.saveStateToHomey(body.data.pos, body.data.touch_go, body.data.calib_time, false);
                resolve(body.data);
            }).catch(reject);
        });
    }

    /**
     * Save state of curtain to homey device
     *
     * @param position
     * @param touch_go
     * @param calib_time
     * @param freshDevice
     * @return void
     */
    saveStateToHomey(position, touch_go, calib_time, freshDevice) {
        if (position < 0) {
            position = 0;
        }
        if (position > 1) {
            position = 1;
        }
        position = 1 - position;

        this.homeyDevice.calib_time = calib_time;
        this.homeyDevice.pos = position;
        this.homeyDevice.touch_go = touch_go;

        this.homeyDevice.setCapabilityValue("windowcoverings_set", position);
        this.homeyDevice.setCapabilityValue("curtain_position", position * 100);
        this.homeyDevice.setCapabilityValue("touch_go_state", touch_go);

        if (freshDevice) {
            this.homeyDevice.setCapabilityValue("windowcoverings_closed", false);
        }
        if (position <= 0.1) {
            this.homeyDevice.setCapabilityValue("windowcoverings_closed", true);
        }
        if (position >= 0.9) {
            this.homeyDevice.setCapabilityValue("windowcoverings_closed", false);
        }
    }

    /**
     * Stop motor of this specific Slide
     *
     * @return {Promise<string>}
     */
    immediateStop() {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.post('slide/' + self.device_data.numid + '/stop', {}).then(resolve, reject);
        });
    }

    /**
     * Set position of this specific Slide
     *
     * @param value
     * @return {Promise<string>}
     */
    setPosition(value) {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.post('slide/' + self.device_data.numid + '/position', {"pos": 1 - value})
                .then(body => {
                    if (body.data.response === 'success') {
                        resolve();
                    } else {
                        reject();
                    }
                }, message => {
                    reject(message);
                });
        });
    }

    /**
     * Set Touch&Go for this specific Slide
     *
     * @param value
     * @return {Promise<string>}
     */
    toggleTouchGo(value) {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.patch('slide/' + self.device_data.numid,{"touch_go": value})
                .then(body => {
                    if (body.data.response === 'success') {
                        self.homeyDevice.setCapabilityValue("touch_go_state", value);
                        resolve();
                    } else {
                        reject();
                    }
                }).catch(message => {
                    reject(message);
                });
        });
    }
}

module.exports = SlideDevice;