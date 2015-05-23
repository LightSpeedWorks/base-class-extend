// quick.js
  'use strict';

  var constructors = require('get-constructors');

  try {
    var BaseClass = require('../lib/base-class-extend');
  } catch (e) {
    console.log('cant require "../lib/base-class-extend": ' + e);
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
  try {
    myObj.value++; // 6 -> 7 throws Error
  } catch (e) { console.log(e + ''); }

  console.log();
  function nm(elem) { return elem.name; }
  console.log(constructors(MyClass).map(nm).join(' < '), ': MyClass');
  console.log(constructors(myObj  ).map(nm).join(' < '), ': myObj');
