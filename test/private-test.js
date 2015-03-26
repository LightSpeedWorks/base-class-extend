// private-test.js
  'use strict';

  var constructors = require('get-constructors');
  constructors.extendPrototype();

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
  function mapName(elem) { return elem.name; }
  console.log('p1           ', p1.constructors.map(mapName).join(' < '));
  console.log('p2           ', p2.constructors.map(mapName).join(' < '));
  console.log('p3           ', p3.constructors.map(mapName).join(' < '));
  console.log('p4           ', p4.constructors.map(mapName).join(' < '));
  console.log('PrivateClass1', PrivateClass1.constructors.map(mapName).join(' < '));
