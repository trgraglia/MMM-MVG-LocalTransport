# Module: MMM-MVG-LocalTransport

The `MMM-MVG-LocalTransport` module is a module for MagicMirror2 which displays departures time for public transport in Munich, Germany.

## Install

- Clone repo into your MagicMirror modules folder.
```
cd ~/MagigMirror/modules/
git clone https://github.com/trgraglia/MMM-MVG-LocalTransport
```
- Install npm packages
```
cd MMM-MVG-LocalTransport
npm install
```

## Using the module and Setup

- Setup a local Python REST API for the module to call which retrieves MVG data.
  - https://github.com/trgraglia/MVG-APIs/tree/master/rest
- Find out your Station ID
  - Open a browser and go to: http://localhost/_api/mvg/query/YourStation
  - For example: http://localhost/_api/mvg/query/Petuelring
  - Take note of the `id` property
  - Take note of the `name` property
- Add the module to the MagicMirror config, `config/config.js`
```javascript
{
  module: 'MMM-MVG-LocalTransport',
  position: 'bottom_right',
  header: '<name property from above>',
  config: {
    id: '<id property from above>'
  }
},
```
## Configuration options

The following properties can be configured:

| Option                       | Description
| ---------------------------- | -----------
| `initialUpdateInterval`      | The delay before the first API call. (Milliseconds)<br>**Default value:** `15000` (15 Seconds)
| `retryUpdateInterval`        | The delay before calling the API again after the API returns an error. (Milliseconds)<br>**Default value:** `10000` (10 Seconds)
| `dataUpdateInterval`         | The interval between API calls. (Milliseconds)<br>**Default value:** `60000` (60 Seconds)
| `domUpdateInterval`          | The interval for updateing the dom when not explicitly triggered. (Milliseconds)<br>**Default value:** `20000` (20 Seconds)
| `apiBaseStation`             | The REST API url up to the station id.<br>**Default value:** `''`
| `id`                         | The station ID according to MVG.<br>**Default value:** `''`
| `perLineDepartureLimit`      | The number of departures to show per line per direction.<br> **Default value:** `3`

