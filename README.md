# MMM-MVG-LocalTransport

# Install

1. Clone repository into `../modules/` inside your MagicMirror folder.
2. Run `npm install` inside `../modules/MMM-MVG-LocalTransport/` folder
3. Run `node findStation.js apiKey apiUser stationName` to find out your Station ID.
4. Add the module to the MagicMirror config
```
		{
	        module: 'MMM-MVG-LocalTransport',
	        position: 'bottom_right',
	        header: 'Connections',
	        config: {
	            id: '', // Trainstation ID
	        }
    	},
```
