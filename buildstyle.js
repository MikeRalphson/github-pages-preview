#!/bin/env node

'use strict';

var fs = require('fs');
var sass = require('node-sass');
var assetFunctions = require('node-sass-asset-functions');

var outputStyle = 'compressed';
var theme = process.argv.length > 2 ? process.argv[2] : 'cayman';

function sassRender(infile,outfile) {
	sass.render({
		file: infile,
		outputStyle : outputStyle,
		functions: assetFunctions({
			http_fonts_path: '../../source/fonts'
		})
	}, function(err, result) {
		if (err) console.error(err)
		else {
			fs.writeFile(outfile,result.css.toString(),'utf8',function(err){
                if (err) console.warn(err.message);
            });
        }
	});
}

sassRender('./themes/'+theme+'/_sass/jekyll-theme-'+theme+'.scss','./themes/'+theme+'.css');
