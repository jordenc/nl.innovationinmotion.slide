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

        // Prefer the address from the device settings, then the IP address from mDNS discovery, then
        // the IP from pairing. Resolving the .local hostname is unreliable on Homey, so that is the last resort
        this.addresses = [(homeyDevice.getSetting('address') || '').trim(), homeyDevice.getStoreValue('address'), device_data.ip, device_data.host]
            .filter((address, index, addresses) => address && addresses.indexOf(address) === index);
    }

    /**
     * Post to the local API, try the next known address when the Slide can not be reached
     *
     * @param path
     * @param requestData
     * @return {Promise<string>}
     */
    post(path, requestData) {
        const self = this;
        const tryAddress = (index) => {
            return self.api.post('http://' + self.addresses[index] + path, requestData).catch(err => {
                // Only network errors (ENOTFOUND, ETIMEDOUT, ...) have a code, API errors do not
                if (err && err.code && index + 1 < self.addresses.length) {
                    return tryAddress(index + 1);
                }
                throw err;
            });
        };
        return tryAddress(0);
    }

    /**
     * Get state of this specific Slide
     *
     * @return {Promise<string>}
     */
    getState() {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.post('/rpc/Slide.GetInfo').then(body => {
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
            "touch_go_state": touch_go,
        };
        for (const [capabilityName, capabilityValue] of Object.entries(capabilities)) {
            if (this.homeyDevice.getCapabilityValue(capabilityName) !== capabilityValue) {
                this.setCapability(capabilityName, capabilityValue);
            }
        }

        if (freshDevice) {
            this.setCapability("windowcoverings_closed", false);
        }
        if (position <= 0.1) {
            this.setCapability("windowcoverings_closed", true);
        }
        if (position >= 0.9) {
            this.setCapability("windowcoverings_closed", false);
        }
    }

    /**
     * Set a capability value, the device can be deleted while a request is still running
     *
     * @param name
     * @param value
     * @return void
     */
    setCapability(name, value) {
        this.homeyDevice.setCapabilityValue(name, value).catch(err => {
            this.homeyDevice.log(err);
        });
    }

    /**
     * Use this call to trigger a re-calibration of a specific Slide
     *
     * @return {Promise<string>}
     */
    calibrate() {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.post('/rpc/Slide.Calibrate', {}).then(resolve, reject);
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
            self.post('/rpc/Slide.Stop', {}).then(resolve, reject);
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
            self.post('/rpc/Slide.SetPos', {"pos": 1 - value})
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
     // Now Available in local !!!
    setTouchGo(value) {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.post('/rpc/Slide.touchGo', {"touch_go":  value})
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
}

module.exports = SlideLocalDevice;