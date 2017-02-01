'use strict';

var fsp = require('./index.js');
var cprint = require('color-print');

// ******************************

cprint.white('Listing all js files in current directory and sub-directories...');
fsp.list('./').then((files) => {
  cprint.rainbow('Processing files...');
  cprint.magenta('-----------------');
  cprint.red('print package files as red');
  cprint.cyan('print node_modules as cyan');
  cprint.green('print js files as green');
  cprint.yellow('print everything else as yellow');
  cprint.magenta('-----------------');

  fsp.process(files, (file) => {

    if (file.match(/.git.*/)) {
      //ignore git files

    } else if (file.match(/package\.json/)) {
      cprint.red(file); // print package files as red

    } else if (file.match(/node_modules\/.*/)) {
      cprint.cyan(file); // print node_modules as cyan

    } else if (file.match(/.*\.js/)) {
      cprint.green(file); // print js files as green

    } else {
      cprint.yellow(file); // print everything else as yellow

    }
  });
})


// ******************************
