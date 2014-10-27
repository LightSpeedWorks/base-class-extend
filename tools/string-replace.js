// string-replace.js

  'use strict';

  var fs = require('fs');

  var slice = Array.prototype.slice;

  var args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('usage: %s %s {old-string} {new-string} {file1} {file2} ...',
      process.argv[0], process.argv[1]);
    return;
  }
  var oldPat = args.shift();
  var newPat = args.shift();

  var rex = new RegExp(oldPat, 'g');

  args.forEach(function (file) {
    var oldStr = fs.readFileSync(file).toString();
    var newStr = oldStr.replace(rex, newPat);
    if (oldStr === newStr) return;
    fs.writeFileSync(file, newStr);
  });
