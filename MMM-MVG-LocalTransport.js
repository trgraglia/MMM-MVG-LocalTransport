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
        updateInterval: 30 * 1000, // Update every minute.
        animationSpeed: 2000,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 0, // start delay seconds.
        //apiBase: 'http://anthonygraglia.com/cgi-bin/mvg.py?station=',
        apiBase: 'http://anthonygraglia.com/cgi-bin/mvg.py',
        id: ''
    },
    start: function () {
        var self = this;

        Log.info('--- ' + this.name + ': Starting module');
        this.updateTimer = null;
        this.scheduleUpdate();

        setInterval(function () {
            self.updateDom();
        }, 30000);
    },
    scheduleUpdate: function (delay) {
        var self = this;

        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function () {
            self.sendSocketNotification('GETDATA', self.config);
        }, !!delay ? delay : this.config.updateInterval);
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'DATARECEIVED') {
            this.items = payload;
            this.loaded = true;
            this.updateDom();
            this.scheduleUpdate();
        }
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

        var items = this.items;

        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                var item = items[key];

                var row = document.createElement('tr');
                table.appendChild(row);

                var lineCell = document.createElement('td');
                lineCell.className = item['product'] + ' mmm-mvg-row-line';
                lineCell.innerHTML = item['label'];
                row.appendChild(lineCell);

                var destCell = document.createElement('td');
                destCell.className = 'mmm-mvg-row-destination';
                destCell.innerHTML = key;
                row.appendChild(destCell);

                var minutesCell = document.createElement('td');
                minutesCell.className = 'mmm-mvg-row-minutes';
                minutesCell.innerHTML = item['departureTimes'].join(', ');
                row.appendChild(minutesCell);
            }
        }

        return table;
    }
});
