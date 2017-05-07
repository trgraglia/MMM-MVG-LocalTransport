'use strict';

/* Timetable for local transport Module */

/* Magic Mirror
 * Module: MVG-LocalTransport
 *
 * By Anthony Graglia
 * MIT Licensed.
 */

Module.register('MMM-MVG-LocalTransport', {
    defaults: {
        initialUpdateInterval: 30000,
        dataUpdateInterval: 30000,
        domUpdateInterval: 20000,
        apiBase: 'http://anthonygraglia.com/cgi-bin/mvg.py',
        id: '',
        debug: false,
        perLineDepartureLimit: 3
    },
    start: function () {
        Log.info('--- ' + this.name + ': Starting module');

        var self = this;
        this.updateTimer = null;
        this.scheduleUpdate(this.config.initialUpdateInterval);

        setInterval(function () {
            self.updateDom();
        }, this.config.domUpdateInterval);
    },
    scheduleUpdate: function (delay) {
        var self = this;

        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function () {
            self.sendSocketNotification('MMM-MVG-GETDATA', self.config);
        }, !!delay ? delay : this.config.dataUpdateInterval);
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MMM-MVG-DATARECEIVED') {
            if (payload.id === this.config.id) {
                this.departures = payload.data;
                this.loaded = true;
            }

            this.updateDom();
            this.scheduleUpdate();
        }
    },
    processJson: function () {
        var departures = this.departures;
        var now = moment();
        var items = {};

        for (var i = 0; i < departures.length; i++) {
            var departure = departures[i];
            var destination = departure['destination'];
            var departureTime = moment(departure['departureTime']);
            var departureMinutes = departureTime.diff(now, 'minutes');

            items[destination] = items[destination] || {
                    'label': departure['label'],
                    'product': departure['product'],
                    'departureTimes': []
                };
            items[destination]['departureTimes'].push(departureMinutes);
        }

        return items;
    },
    getStyles: function () {
        return ['MMM-MVG-LocalTransport.css', 'font-awesome.css'];
    },
    getDom: function () {
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

        var items = this.processJson();

        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                var item = items[key];
                var departureTimes = item['departureTimes'];

                if (departureTimes.length > this.config.perLineDepartureLimit) {
                    departureTimes.length = this.config.perLineDepartureLimit;
                }

                var row = document.createElement('tr');
                row.className = 'mmm-mvg-row normal';
                table.appendChild(row);

                var lineCell = document.createElement('td');
                lineCell.className = item['product'] + ' mmm-mvg-row-line';
                lineCell.innerHTML = item['label'];
                row.appendChild(lineCell);

                var destCell = document.createElement('td');
                destCell.className = 'mmm-mvg-row-destination bright';
                destCell.innerHTML = key;
                row.appendChild(destCell);

                var minutesCell = document.createElement('td');
                minutesCell.className = 'mmm-mvg-row-minutes';
                minutesCell.innerHTML = departureTimes.join(', ');
                row.appendChild(minutesCell);
            }
        }

        return table;
    }
});
