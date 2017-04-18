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

        this.config = {};
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MMM-MVG-GETDATA') {
            console.log('--- ' + this.name + ': Socket Notification Received: ' + notification);

            this.config = payload;
            this.getStationData(this.config, this.processJson);
        }
    },
    processJson: function (json) {
        console.log('--- ' + this.name + ': Process JSON');
        //console.log('--- ' + JSON.stringify(json));

        var departures = json['departures'];
        var now = new Date();
        var items = {};

        for (var i = 0; i < departures.length; i++) {
            var departure = departures[i];
            var destination = departure['destination'];
            var departureTime = new Date(departure['departureTime']);
            var departureMinutes = Math.floor((Math.abs(departureTime - now) / 1000) / 60);

            items[destination] = items[destination] || {
                    'label': departure['label'],
                    'product': departure['product'],
                    //'lineColor': departure['lineBackgroundColor'],
                    'departureTimes': []
                };
            items[destination]['departureTimes'].push(departureMinutes);
        }

        return items;
    },
    getStationData: function (config, callback) {
        console.log('--- ' + this.name + ': Get Station Data');

        var self = this;

        request({
            uri: config.apiBase + '?station=' + config.id,
            method: 'GET',
            json: true
        }, function (error, response, json) {
            if (!error && response.statusCode == 200) {
                var data = callback.call(self, json);
                self.sendSocketNotification('MMM-MVG-DATARECEIVED', {id: self.config.id, data: data});
            } else {
                console.log('--- ' + self.name + ' : ERROR : ' + error);
                console.log('--- ' + 'error: ' + JSON.stringify(json));
                console.log('--- ' + 'response: ' + JSON.stringify(json));
                console.log('--- ' + 'json: ' + JSON.stringify(json));
            }
        });
    }
});
