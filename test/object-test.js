// object-test.js
  'use strict';

  try {
    var BaseClass = require('../lib/base-class');
  } catch (e) {
    console.log('cant require "../lib/base-class": ' + e);
    var BaseClass = require('base-class-extend');
  }

  // BaseClass
  var b1 = new BaseClass();
  var b2 = BaseClass.new();
  var b3 = BaseClass();

  // Prepare
  var extend = BaseClass.extend;

  // SimpleClass0
  var SimpleClass0 = extend('SimpleClass0');

  var s01 = new SimpleClass0();
  var s02 = SimpleClass0.new();
  var s03 = SimpleClass0();

  // SimpleClass1
  var SimpleClass1 = BaseClass.extend.call(Object, 'SimpleClass1');

  var s11 = new SimpleClass1();
  var s12 = SimpleClass1.new();
  var s13 = SimpleClass1();

  // Prepare for Object
  Object.extend = BaseClass.extend;

  // SimpleClass2
  var SimpleClass2 = Object.extend('SimpleClass2');

  var s21 = new SimpleClass2();
  var s22 = SimpleClass2.new();
  var s23 = SimpleClass2();

  checkConstructor(BaseClass, b1, b2, b3);
  checkConstructor(SimpleClass0, s01, s02, s03);
  checkConstructor(SimpleClass1, s11, s12, s13);
  checkConstructor(SimpleClass2, s21, s22, s23);

  function checkConstructor(ctor) {
    var objs = Array.prototype.slice.call(arguments, 1);

    objs.forEach(function (obj) {
      console.log(obj ? obj.constructor.name : '');
      if (obj == null) return;
      if (obj.constructor !== ctor)
        throw new TypeError(obj.constructor.name + ' !== ' + ctor.name);
    });
  }
