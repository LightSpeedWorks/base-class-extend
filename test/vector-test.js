// vector-test.js
  'use strict';

  try {
    var BaseClass = require('../lib/base-class-extend');
  } catch (e) {
    console.log('cant require "../lib/base-class-extend": ' + e);
    var BaseClass = require('base-class-extend');
  }

  // sample: getter/setter Object.defineProperty (JavaScript) - SONICMOOV LAB (japanese)
  // http://lab.sonicmoov.com/development/javascript-object-defineproperty/

  var Vector2D = BaseClass.extend({
    new: function Vector2D(x, y) {
      this._length = 0;
      this._changed = true;
      this._x = x;
      this._y = y;
    },
    get x()  { return this._x; },
    set x(x) { this._x = x; this._changed = true; },
    get y()  { return this._y; },
    set y(y) { this._y = y; this._changed = true; },
    get length() {
      if (this._changed) {
        this._length = Math.sqrt(this._x * this._x + this._y * this._y);
        this._changed = false;
      }
      return this._length;
    },
    set: function (x, y) { this._x = x; this._y = y; this._changed = true; },
  });

  var v2 = new Vector2D(3, 4);
  console.log('V2D(3, 4):', v2.length);
  v2.set(1, 2);
  console.log('V2D(1, 2):', v2.length);
  v2.set(1, 1);
  console.log('V2D(1, 1):', v2.length);

  var Vector3D = Vector2D.extend({
    new: function Vector3D(x, y, z) {
      Vector2D.call(this, x, y);
      this._z = z;
    },
    get z()  { return this._z; },
    set z(z) { this._z = z; this._changed = true; },
    get length() {
      if (this._changed) {
        this._length = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
        this._changed = false;
      }
      return this._length;
    },
    set: function (x, y, z) { this._x = x; this._y = y; this._z = z; this._changed = true; },
  });

  var v3 = new Vector3D(3, 4, 5);
  console.log('V3D(3, 4, 5):', v3.length);

  console.log();
  function mapName(elem) { return elem.name; }
  console.log(v2.constructors.map(mapName).join(' < '));
  console.log(Vector2D.constructors.map(mapName).join(' < '));
  console.log(v3.constructors.map(mapName).join(' < '));
  console.log(Vector3D.constructors.map(mapName).join(' < '));
