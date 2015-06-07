this.extend = function () {
  'use strict';

  // $pr(msgs...)
  function $pr() {
    var msg = [].slice.call(arguments).join(' ');
    if (typeof console !== 'undefined')
      console.log(msg);
    if (typeof document !== 'undefined')
      document.writeln(msg + '<br/>');
  }

  function extend() {
  }

  extend.extend = extend;

  if (typeof module === 'object' && module && module.exports)
    module.exports = extend;

  $pr('extend = ' + extend);

  return extend;
}();
