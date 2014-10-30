// base-class-object-test.js
  'use strict';

  try {
    var BaseClass = require('../lib/base-class');
  } catch (e) {
    console.log('cant require "../lib/base-class": ' + e);
    var BaseClass = require('base-class-extend');
  }

  var b1 = new BaseClass();
  var b2 = BaseClass.new();
  var b3 = BaseClass();

  var SimpleClass1 = BaseClass.extend.call(Object, 'SimpleClass1', {});

  var s11 = new SimpleClass1();
  var s12 = SimpleClass1.new();
  var s13 = SimpleClass1();

  Object.extend = BaseClass.extend;
  Object.new = BaseClass.new;
  var SimpleClass2 = Object.extend('SimpleClass2', {});

  var s21 = new SimpleClass2();
  var s22 = SimpleClass2.new();
  var s23 = SimpleClass2();

  checkConstructorName('BaseClass', b1, b2, b3);
  checkConstructorName('SimpleClass1', s11, s12, s13);
  checkConstructorName('SimpleClass2', s21, s22, s23);

  function checkConstructorName(ctorName) {
    var objs = Array.prototype.slice.call(arguments, 1);

    objs.forEach(function (obj) {
      console.log('%j %s', obj, obj?obj.constructor.name:'');
      if (obj == null) return;
      if (obj.constructor.name !== ctorName)
        /*throw new TypeError*/ console.log(obj.constructor.name + ' !== ' + ctorName);
    });
  }
