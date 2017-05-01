'use strict';

/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');

module.exports = NodeHelper.create({
    start: function () {
        console.log('--- ' + this.name + ': Node Helper Start');
    },
    socketNotificationReceived: function (notification, config) {
        if (notification === 'MMM-MVG-GETDATA') {
            console.log('--- ' + this.name + ': Socket Notification Received: ' + notification);

            this.config = config;
            this.getStationData(this.processJson);
        }
    },
    processJson: function (json) {
        console.log('--- ' + this.name + ': Process JSON');

        var departures = json['departures'];

        if(this.config.debug) {
            console.log(departures);
        }

        var now = moment();
        var items = {};

        for (var i = 0; i < departures.length; i++) {
            var departure = departures[i];
            var destination = departure['destination'];
            var departureTime = moment(departure['departureTime']);
            var departureMinutes = moment.duration(departureTime.diff(now)).asMinutes();

            items[destination] = items[destination] || {
                    'label': departure['label'],
                    'product': departure['product'],
                    'departureTimes': []
                };
            items[destination]['departureTimes'].push(departureMinutes);
        }

        if(this.config.debug) {
            console.log(items);
        }

        return items;
    },
    getStationData: function (callback) {
        console.log('--- ' + this.name + ': Get Station Data');

        var self = this;

        request({
            uri: self.config.apiBase + '?station=' + self.config.id,
            method: 'GET',
            json: true
        }, function (error, response, json) {
            if (!error && response.statusCode == 200) {
                if(self.config.debug) {
                    console.log(json);
                }
                var data = callback.call(self, json);
                self.sendSocketNotification('MMM-MVG-DATARECEIVED', {id: this.id, data: data});
            } else {
                console.log('--- ' + self.name + ' : ERROR : ' + error);
                console.log('--- ' + 'error: ' + JSON.stringify(json));
                console.log('--- ' + 'response: ' + JSON.stringify(json));
                console.log('--- ' + 'json: ' + JSON.stringify(json));
            }
        }.bind({id: self.config.id}));
    }
});
