/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * Derived from Georg Peters (https://lane6.de)
 * Based on a script from Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const forge = require('node-forge');
const unirest = require('unirest');

module.exports = NodeHelper.create({

    start: function () {
        this.started = false;
    },

    /* updateTimetable(transports)
     * Calls processTrains on successful response.
     */
    updateTimetable: function () {
        var url = this.config.apiBase + this.config.id;
        var retry = true;
        var data = {};

        unirest.post(url)
            .headers({
                'Content-Type': 'application/json;charset=UTF-8'
            })
            .send(JSON.stringify(data))
            .end(function (json) {
                console.log("RESPONSE: ", JSON.stringify(json.departures));
                this.processTrains(json.departures);

                /*if (retry) {
                    this.scheduleUpdate(this.loaded ? -1 : this.config.retryDelay);
                }*/
            });
    },

    /* processTrains(departures)
     * Uses the received data to build a data structure for rendering.
     */
    processTrains: function (departures) {
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
    },

    /* scheduleUpdate()
     * Schedule next update.
     * argument delay number - Millis econds before next update. If empty, this.config.updateInterval is used.
     */
    scheduleUpdate: function (delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function () {
            self.updateTimetable();
        }, nextLoad);
    },

    socketNotificationReceived: function (notification, payload) {
        const self = this;
        if (notification === 'CONFIG' && this.started == false) {
            this.config = payload;
            this.started = true;
            self.scheduleUpdate(this.config.initialLoadDelay);
        }
    }
});
