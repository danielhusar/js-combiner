/*
 * js.combiner for client side js files
 * Copyright(c) 2013 Daniel Husar <dano.husar@gmail.com.com>
 * MIT Licensed
 *
 * @fileoverview
 * An js files combine and minify tool.
 */

/**
 * Module dependencies.
 * @private
 */
var fs      = require('fs'),
    js_min  = require('uglify-js'),
    _       = require('underscore');


//default settings
var config = {
  'files'        : [],             //array of files where search for reauire directives
  'minify'       : false,          //minify the whole files
  'reload'       : false,          //recreate file when theres some change in required files
  'log'          : false,          //output logs
  'packedSuffix' : 'packed',       //suffix of the new recreated file
  'packedFolder' : 'asdasd',             //folder where to put packed files
  'folder'       : '/public/js',   //folder where are the js files located
  'cwd'          : process.cwd(),  //current working directory
  'vars'         : {}              //extra variables to put into client js file
};


/**
 * Main combiner function, combine all js files, and replace ${variable} with real server variable (good mainly for configs)
 * @param  {object} options     object that extend default settings, only property files is required
 * @param  {object} conf        config varialbes to pass into client js
 * @return {void} 
 *
 * @sample usage:
 *  
 *  var packer = require('js-combiner')(
 *     {
 *       'files' : ['/all.js'], 
 *       'vars'  : {
 *         'isProduction' : false
 *       }
 *     });
 */
var combiner = function(options){
  _.extend(config, options);
  var requireMatch  = /require\([',"]?(.*?)[',"]?\);?/gi,
      variableMatch = /\${(.*?)}/gi,
      vars = config.vars;

  //run through all files from config
  config.files.forEach(function (file) {
    fs.readFile(config.cwd + config.folder + file, 'utf8', function (err, data) {
        if (err) {

          log('Error retrieving file: ' + file); 

        } else {

          //replace all require with file contents
          data = data.replace(requireMatch, function(pattern, path){
            var fullPath  = config.cwd + config.folder + path;

            //read file
            if(config.reload){
              listenOnChange(fullPath, combiner); 
            }
            return ('\n\n/*** REQUIRE: ' + path + ' ***/ \n\n' + fs.readFileSync(fullPath) ) || '/* ' + pattern + ' cannot be retrieved */';
          });

          //replace all variables with file contents
          data = data.replace(variableMatch, function(pattern, variable){
            return eval(variable) || '';
          });

          //minify file
          if(config.minify){
            var minify = js_min.parse(data);
            minify.figure_out_scope();
            minify.compute_char_frequency();
            minify.mangle_names();
            data = minify.print_to_string();
          }

          //test if packed folder exist, and eventually create it
          var folder = config.cwd + config.folder;
          if(config.packedFolder){
            folder = folder + '/' + config.packedFolder;
            if(!fs.existsSync(folder)){
              fs.mkdirSync(folder);
            }
          }

          var fileName = folder + file.replace('.js', '.' + config.packedSuffix + '.js');
          fs.writeFile(fileName, data, function (err) {
            if (err){
              log('There was error writing a file: ' + file);
            } else {
              log('Writing file :' + file);
            }
          }); 
          
        }
      }); 

  });

};


var listenOnChange = function(file, callback){
  fs.watchFile(file, function(curr, prev){
    if(curr.size != prev.size){
      log('Reloading file:' + file);
      callback();
    }
  });
};

var log = function(message){
  if(config.log){
    console.dir(message);
  }
}



/**
 * @public
 */
combiner.version = JSON.parse( fs.readFileSync( __dirname + '/../package.json', 'utf8' )).version;

/**
 * Exports module.
 */
module.exports = combiner;
