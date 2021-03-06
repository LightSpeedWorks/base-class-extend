// object-test.js
  'use strict';

  try {
    global.$debug = true;
    global.$print = require('./print');
  } catch (e) {}

  try {
    var BaseClass = require('../lib/base-class-extend');
  } catch (e) {
    console.log('cant require "../lib/base-class-extend": ' + e);
    var BaseClass = require('base-class-extend');
  }

  // BaseClass
  var b1 = new BaseClass();
  var b2 = BaseClass.new();
  var b3 = BaseClass();
  var b4 = BaseClass.create();

  // Prepare
  var extend = BaseClass.extend;

  // SimpleClass0
  var SimpleClass0 = extend('SimpleClass0');

  var s01 = new SimpleClass0();
  var s02 = SimpleClass0.new();
  var s03 = SimpleClass0();
  var s04 = SimpleClass0.create();

  // SimpleClass1
  var SimpleClass1 = BaseClass.extend.call(Object, 'SimpleClass1');

  var s11 = new SimpleClass1();
  var s12 = SimpleClass1.new();
  var s13 = SimpleClass1();
  var s14 = SimpleClass1.create();

  // Prepare for Object
  Object.extend = BaseClass.extend;

  // SimpleClass2
  var SimpleClass2 = Object.extend('SimpleClass2');

  var s21 = new SimpleClass2();
  var s22 = SimpleClass2.new();
  var s23 = SimpleClass2();
  var s24 = SimpleClass2.create();

  checkConstructor(BaseClass, b1, b2, b3, b4);
  checkConstructor(SimpleClass0, s01, s02, s03, s04);
  checkConstructor(SimpleClass1, s11, s12, s13, s14);
  checkConstructor(SimpleClass2, s21, s22, s23, s24);

  function checkConstructor(ctor) {
    var objs = Array.prototype.slice.call(arguments, 1);

    objs.forEach(function (obj) {
      console.log(obj ? obj.constructor.name : '');
      if (obj == null) return;
      if (obj.constructor !== ctor)
        throw new TypeError(obj.constructor.name + ' !== ' + ctor.name);
    });
  }
