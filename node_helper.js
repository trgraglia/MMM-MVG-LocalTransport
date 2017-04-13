'use strict';

/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * Derived from Georg Peters (https://lane6.de)
 * 
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    start: function () {
        this.config = {};
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'GETDATA') {
            this.config = payload;
            this.getStationData(this.config, this.processJson);
            //this.sendSocketNotification('DATARECEIVED', this.config);
        }
    },
    processJson: function (json) {
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
                    'lineColor': departure['lineBackgroundColor'],
                    'departureTimes': []
                };
            items[destination]['departureTimes'].push(departureMinutes);
        }

        return items;
    },
    getStationData: function (config, callback) {
        var self = this;

        request({
            uri: config.apiBase,
            method: 'GET',
            form: {
                station: config.id
            },
            json: true
        }, function (error, response, json) {
            if (!error && response.statusCode == 200) {
                var data = callback(json);
                self.sendSocketNotification('DATARECEIVED', data);
            } else {
                console.log(self.name + ' : ERROR : ' + error)
            }
        });
    }
});
