/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * Derived from Georg Peters (https://lane6.de)
 * Based on a script from Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var forge = require('node-forge');
var unirest = require('unirest');

module.exports = NodeHelper.create({
    start: function () {
        console.log(this.name + ' helper started');
        this.started = false;
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === (this.name + '_CONFIG') && !this.started) {
            this.config = payload;
            this.started = true;
            this.scheduleUpdate(this.config.initialLoadDelay);
        }
    },
    /***
     * scheduleUpdate()
     * Schedules the next update.
     * @integer - Milliseconds before next update. If empty, this.config.updateInterval is used.
     */
    scheduleUpdate: function (delay) {
        var self = this;

        clearTimeout(self.updateTimer);
        self.updateTimer = setTimeout(function () {
            self.updateTimetable();
        }, !!delay ? delay : self.config.updateInterval);
    },
    /***
     * updateTimetable()
     * Calls processTrains on successful response.
     */
    updateTimetable: function () {
        var self = this;
        var retry = true;
        var req = unirest.get(self.config.apiBase + self.config.id);
        req.headers({
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json'
        });
        //var data = {};
        //req.send(JSON.stringify(data));
        req.end(function (response) {
            console.log(self.name + " : " + response);

            if (response.error) {
                this.updateDom(this.config.animationSpeed);

                retry = false;
            } else {
                self.processTrains(response.body);
            }

            if (retry) {
                self.scheduleUpdate();
            }
        });
    },
    /***
     * processTrains(departures)
     * Uses the received data to build a data structure for rendering.
     */
    processTrains: function (data) {
        var departures = data['departures'];
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

        this.items = items;
        this.loaded = true;
        this.sendSocketNotification("TRAINS", this.items);
    }
});
