// base-class-quick.js
  'use strict';

  try {
    var BaseClass = require('../lib/base-class');
  } catch (e) {
    console.log('cant require "../lib/base-class": ' + e);
    var BaseClass = require('base-class-extend');
  }

  var MyClass = BaseClass.extend({
    new: function MyClass(value) {
      this.value = value; // via setter
    },
    show: function show() {
      console.log(this.value); // via getter
    },
    // getter
    get value() { return this._value; },
    // setter
    set value(value) {
      if (value < 1 || value > 6)
        throw new RangeError('Out of range');
      this._value = value; },
  });

  var myObj = new MyClass(5);
  myObj.value++; // 5 -> 6
  myObj.show();
  myObj.value++; // 6 -> 7 throws Error
