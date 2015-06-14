this.$print = function (g, w, d, c) {
  'use strict';

  var msgs = [], isLoaded = !w;

  // printAll()
  function printAll() {
    var msg, div;
    while (msg = msgs.shift()) {
      if (c) c.log(msg);
      if (d) {
        (div = d.createElement('div')).innerHTML = msg;
        d.body.appendChild(div);
      }
    }
  }

  // print(...msgs)
  function print() {
    msgs.push('print: ' + [].slice.call(arguments).join(' '));
    if (isLoaded) printAll();
  }

  // onload()
  if (w) g.onload = function (onload) {
    return function () {
      if (onload) onload();
      isLoaded = true;
      printAll();
    };
  }(g.onload);

  print.$print = print;
  print.print = print;

  if (typeof module === 'object' && module && module.exports)
    module.exports = print;

  return print;
}(this, this.window, this.document, typeof console !== 'undefined' ? console : null);
