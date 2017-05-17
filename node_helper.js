'use strict';

/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    start: function () {
        console.log('--- ' + this.name + ': Node Helper Start');
    },
    socketNotificationReceived: function (notification, config) {
        if (notification === 'MMM-MVG-GETDATA') {
            console.log('--- ' + this.name + ': Socket Notification Received: ' + notification);

            this.config = config;
            this.getStationData();
        }
    },
    getStationData: function () {
        console.log('--- ' + this.name + ': Get Station Data');

        var self = this;

        request({
            uri: self.config.apiBaseStation + self.config.id,
            method: 'GET',
            json: true,
            headers: {}
        }, function (error, response, json) {
            if (!error && response['statusCode'] == 200) {
                if (self.config.debug) {
                    console.log(json);
                }
                self.sendSocketNotification('MMM-MVG-DATARECEIVED', {id: this.id, data: json['departures']});
            } else {
                self.sendSocketNotification('MMM-MVG-ERRORRECEIVED', {id: this.id, data: json});
            }
        }.bind({id: self.config.id}));
    }
});
