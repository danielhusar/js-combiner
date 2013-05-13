# js-combiner

An assets combine and minify tool



## Description

Js-combiner is a simple tool to combine and minify javascript files. It can also share server side variables to client side js files.

## Installation
Download and place it inside node_moudles.
Or use npm: npm install js-combiner.
Tested only under express.

# Usage

file: app.js
```javascript
var combiner = require('js-combiner')(
			{
				'files' : ['/bundle.js']
			});
```

file: /public/bundle.js
```javascript
require('/app.js');
require(/config.js);    
require('/events.js')
require("/global.js");
```

New generated file with all the content will be: /public/packed/bundle.packed.js

Combiner settings:
```javascript
{
	'files'        : [],             //array of files where search for require directives
	'minify'       : false,          //minify the whole files
	'reload'       : false,          //recreate file when theres some change in required files
	'log'          : false,          //output logs
	'packedSuffix' : 'packed',       //suffix of the new recreated file
	'packedFolder' : 'packed',       //folder where to put packed files
	'folder'       : '/public/js',   //folder where are the js files located
	'cwd'          : process.cwd(),  //current working directory
	'vars'         : {}              //extra variables to put into client js file
}
```

You can also pass custom variables inside vars property, like:
```javascript
var combiner = require('js-combiner')(
			{
				'files' : ['/bundle.js'],
				'vars'	: {
					'ENV' : 'production'
				}
			});
```
And than acces this variable inside client js files by calling: ${vars.ENV}


