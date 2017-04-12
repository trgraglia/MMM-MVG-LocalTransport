/* Timetable for local transport Module */

/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * Derived from Georg Peters (https://lane6.de)
 * Based on a script from Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

Module.register("MMM-MVG-LocalTransport", {

    // Define module defaults
    defaults: {
        maximumEntries: 10, // Total Maximum Entries
        maxTimeOffset: 200, // Max time in the future for entries
        useRealtime: true,
        updateInterval: 1 * 60 * 1000, // Update every minute.
        animationSpeed: 2000,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 0, // start delay seconds.
        apiBase: 'http://anthonygraglia.com/cgi-bin/mvg.py?station=',
        id: ''
    },

    // Define required scripts.
    getStyles: function () {
        return ["MMM-MVG-LocalTransport.css", "font-awesome.css"];
    },

    // Define start sequence.
    start: function () {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        this.items = {};
        this.loaded = false;
        this.updateTimer = null;
    },

    // Override dom generator.
    getDom: function () {
        Log.info("Getting DOM: " + this.name);
        var wrapper = document.createElement("div");

        if (this.config.id === "") {
            wrapper.innerHTML = "Please set the correct Station ID: " + this.name + ".";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = "Loading connections ...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        Log.info("Creating departures table: " + this.name);
        var table = document.createElement("table");
        //table.className = "small";

        var items = this.items;

        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                var item = items[key];
                var lineColor = item['lineColor'];

                if (lineColor.indexOf(',') > -1) {
                    var c1 = lineColor.split(',')[0];
                    var c2 = lineColor.split(',')[1];
                    lineColor = 'linear-gradient(135deg, ' + c1 + ' 0%, ' + c1 + ' 50%, ' + c2 + ' 51%, ' + c2 + ' 100%)';
                }

                var row = document.createElement("tr");
                table.appendChild(row);

                var lineCell = document.createElement("td");
                lineCell.className = item['product'];
                lineCell.innerHTML = item['label'];
                row.appendChild(lineCell);

                var destCell = document.createElement("td");
                //destCell.className = item['product'];
                destCell.innerHTML = key;
                row.appendChild(destCell);

                var minutesCell = document.createElement("td");
                //minutesCell.className = item['product'];
                minutesCell.innerHTML = item['departureTimes'].join(', ');
                row.appendChild(minutesCell);

                /*if (this.config.fade && this.config.fadePoint < 1) {
                    if (this.config.fadePoint < 0) {
                        this.config.fadePoint = 0;
                    }
                    var startingPoint = this.items.length * this.config.fadePoint;
                    var steps = this.items.length - startingPoint;
                    if (t >= startingPoint) {
                        var currentStep = t - startingPoint;
                        row.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }*/
            }
        }

        return table;
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === "TRAINS") {
            Log.info("Trains arrived");
            this.items = payload;
            this.loaded = true;
            this.updateDom(this.config.animationSpeed);
        }
    }
});
