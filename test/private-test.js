// private-test.js
  'use strict';

  try {
    global.$debug = true;
    global.$print = require('./print');
  } catch (e) {}

  var constructors = require('get-constructors');

  try {
    var BaseClass = require('../lib/base-class-extend');
  } catch (e) {
    console.log('cant require "../lib/base-class-extend": ' + e);
    var BaseClass = require('base-class-extend');
  }

  // PrivateClass1
  var PrivateClass1 = BaseClass.extend({
      new: function PrivateClass1(val) {
        if (!(this instanceof PrivateClass1))
          return new PrivateClass1(val);
        var private1 = val;
        this.private({
          showPrivate: function showPrivate() {
            console.log(private1);
          },
          get private2() { return private1; },
          set private2(val) { private1 = val; },
        });
      }
    });

  var p1 = new PrivateClass1(11);
  var p2 = PrivateClass1.new(12);
  var p3 = PrivateClass1(13);
  var p4 = PrivateClass1.create(14);
  p1.showPrivate();
  console.log('p1.private1 = ' + p1.private1);
  console.log('p1.private2 = ' + p1.private2);
  p2.showPrivate();
  console.log('p2.private1 = ' + p2.private1);
  console.log('p2.private2 = ' + p2.private2);
  p3.showPrivate();
  console.log('p3.private1 = ' + p3.private1);
  console.log('p3.private2 = ' + p3.private2);
  p4.showPrivate();
  console.log('p4.private1 = ' + p4.private1);
  console.log('p4.private2 = ' + p4.private2);

  checkConstructor(PrivateClass1, p1, p2, p3, p4);

  function checkConstructor(ctor) {
    var objs = Array.prototype.slice.call(arguments, 1);

    objs.forEach(function (obj) {
      console.log(obj ? obj.constructor.name : '');
      if (obj == null) return;
      if (obj.constructor !== ctor)
        throw new TypeError(obj.constructor.name + ' !== ' + ctor.name);
    });
  }

  console.log();
  function nm(elem) { return elem.name; }
  console.log(constructors(PrivateClass1).map(nm).join(' < '), ': PrivateClass1');
  console.log(constructors(p1           ).map(nm).join(' < '), ': p1');
  console.log(constructors(p2           ).map(nm).join(' < '), ': p2');
  console.log(constructors(p3           ).map(nm).join(' < '), ': p3');
  console.log(constructors(p4           ).map(nm).join(' < '), ': p4');
