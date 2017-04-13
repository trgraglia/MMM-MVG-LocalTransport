# MMM-MVG-LocalTransport

## Install
- Clone repo into your MagicMirror folder.
```
cd ~/MagigMirror/modules/
git clone https://github.com/trgraglia/MMM-MVG-LocalTransport
```
- Install npm packages
```
cd MMM-MVG-LocalTransport
npm install
```

## Setup
- Find out your Station ID
-- Open a browser and go to: http://anthonygraglia.com/cgi-bin/mvg.py?query=YourStation
-- For example: http://anthonygraglia.com/cgi-bin/mvg.py?query=Petuelring
-- Take note of the `id` property
-- Take note of the `name` property
- Add the module to the MagicMirror config
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