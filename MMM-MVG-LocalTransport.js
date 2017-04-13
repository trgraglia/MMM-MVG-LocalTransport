/* Timetable for local transport Module */

/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * Derived from Georg Peters (https://lane6.de)
 *
 * MIT Licensed.
 */

Module.register('MMM-MVG-LocalTransport', {
    defaults: {
        retryDelay: 1000,
        maximumEntries: 10, // Total Maximum Entries
        maxTimeOffset: 200, // Max time in the future for entries
        updateInterval: 30 * 1000, // Update every minute.
        animationSpeed: 2000,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 0, // start delay seconds.
        apiBase: 'http://anthonygraglia.com/cgi-bin/mvg.py?station=',
        id: ''
    },
    start: function () {
        Log.info(this.name + ' : Starting module');
        this.sendSocketNotification(this.name + '_CONFIG', this.config);
        this.items = {};
        this.loaded = false;
        this.url = this.config.apiBase + this.config.id;
        this.updateTimer = null;
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === this.name + '_TRAINS') {
            Log.info('Notification: ' + this.name + '_TRAINS');
            this.items = payload;
            this.loaded = true;
            this.updateDom(this.config.animationSpeed);
        }
    },
    getStyles: function () {
        return ['MMM-MVG-LocalTransport.css', 'font-awesome.css'];
    },
    getDom: function () {
        Log.info(this.name + ' : Getting DOM');
        var wrapper = document.createElement('div');

        if (this.config.id === '') {
            wrapper.innerHTML = 'Please set the correct Station ID: ' + this.name + '.';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = 'Loading connections ...';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        Log.info(this.name + ' : Creating departures table');
        
        var table = document.createElement('table');
        table.className = 'small mmm-mvg-table';

        var items = this.items;

        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                var item = items[key];

                var row = document.createElement('tr');
                table.appendChild(row);

                var lineCell = document.createElement('td');
                lineCell.className = item['product'];
                lineCell.innerHTML = item['label'];
                row.appendChild(lineCell);

                var destCell = document.createElement('td');
                //destCell.className = item['product'];
                destCell.innerHTML = key;
                row.appendChild(destCell);

                var minutesCell = document.createElement('td');
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
    }
});
