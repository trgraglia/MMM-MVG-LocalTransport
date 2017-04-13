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
        this.items = {};
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'GETDATA') {
            var self = this;
            this.getStationData(self.processJson);
        }
    },
    processJson: function (data) {
        var json = JSON.parse(data);
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
    getStationData: function (callback) {
        var self = this;
        var url = self.url;

        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var structuredData = callback(body);
                self.sendSocketNotification('DATARECEIVED', structuredData);
            } else {
                console.log(self.name + ' : ERROR : ' + error)
            }
        });
    }
});
