"use strict";

const Homey = require('homey');
let LocalApi = require('./localapi');

class SlideLocalDevice
{
    /**
     * SlideDevice constructor
     *
     * @param token
     * @param device_data
     * @param homeyDevice
     */
    constructor(device_data, homeyDevice) {
        this.api = new LocalApi();
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
            self.api.post('http://' + self.device_data.host + '/rpc/Slide.GetInfo').then(body => {
                self.saveStateToHomey(body.pos, body.touch_go, body.calib_time, false);
                resolve(body);
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

        let capabilities = {
            "windowcoverings_set": position,
            "curtain_position": position * 100,
            //not available to set in local
            // "touch_go_state": touch_go,
        };
        for (const [capabilityName, capabilityValue] of Object.entries(capabilities)) {
            if (this.homeyDevice.getCapabilityValue(capabilityName) !== capabilityValue) {
                this.homeyDevice.setCapabilityValue(capabilityName, capabilityValue);
            }
        }

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
     * Use this call to trigger a re-calibration of a specific Slide
     *
     * @return {Promise<string>}
     */
    calibrate() {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.post('http://' + self.device_data.host + '/rpc/Slide.Calibrate', {}).then(resolve, reject);
        });
    }

    /**
     * Stop motor of this specific Slide
     *
     * @return {Promise<string>}
     */
    immediateStop() {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.post('http://' + self.device_data.host + '/rpc/Slide.Stop', {}).then(resolve, reject);
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
            self.api.post('http://' + self.device_data.host + '/rpc/Slide.SetPos', {"pos": 1 - value})
                .then(body => {
                    if (body.response === 'success') {
                        resolve();
                    } else {
                        reject();
                    }
                }, message => {
                    reject(message);
                }).catch(message => {
                    reject(message);
                });
        });
    }

    setTouchGo(value) {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.api.post('http://' + self.device_data.host + '/rpc/Slide.SetPos', {"pos": 1 - value})
                .then(body => {
                    if (body.response === 'success') {
                        resolve();
                    } else {
                        reject();
                    }
                }, message => {
                    reject(message);
                }).catch(message => {
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
    // Not available in local
    // toggleTouchGo(value) {
    //     const self = this;
    //     return new Promise(function (resolve, reject) {
    //         self.api.patch('slide/' + self.device_data.numid,{"touch_go": value})
    //             .then(body => {
    //                 if (body.message === 'Slide was successfully updated. ') {
    //
    //                     console.log("toggleTouchGo success: "  + value);
    //                     self.homeyDevice.setCapabilityValue("touch_go_state", value);
    //                     resolve();
    //                 } else {
    //
    //                     console.log("toggleTouchGo reject", body);
    //                     reject();
    //                 }
    //             }).catch(message => {
    //                 reject(message);
    //             });
    //     });
    // }
}

module.exports = SlideLocalDevice;