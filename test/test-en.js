// test-en.js
  'use strict';

  try {
    var BaseClass = require('../lib/base-class-extend');
  } catch (e) {
    console.log('cant require "../lib/base-class-extend": ' + e);
    var BaseClass = require('base-class-extend');
  }

  var rex = /^[AIUEO]/i;
  function a(s) { return rex.exec(s) ? 'an ' + s : 'a ' + s; }

  var Animal = BaseClass.extend({
    new: function Animal(name) {
      if (!(this instanceof Animal))
        return new Animal(name);
      BaseClass.apply(this); // or Animal.super_.apply(this);
      this.name = name;
    },
    get name() { return this._name; },
    set name(name) { this._name = name; },
    introduce: function () {
      console.log('My name is ' + this.name + '. ' +
                  'I am ' + a(this.constructor.name) + '.');
    },
  });

  var a1 = new Animal('Annie');
  a1.introduce(); // -> My name is Annie. I am an Animal.
  var a2 = Animal('Annie');
  a2.introduce(); // -> My name is Annie. I am an Animal.
  var a3 = Animal.new('Annie');
  a3.introduce(); // -> My name is Annie. I am an Animal.

  var Bear = Animal.extend({
    new: function Bear(name) {
      if (!(this instanceof Bear))
        return new Bear(name);
      Bear.super_.apply(this, arguments);
    }});

  var b1 = new Bear('Pooh');
  b1.introduce(); // -> My name is Pooh. I am a Bear.
  var b2 = Bear('Pooh');
  b2.introduce(); // -> My name is Pooh. I am a Bear.
  var b3 = Bear.new('Pooh');
  b3.introduce(); // -> My name is Pooh. I am a Bear.

  var Cat = Animal.extend();

  var c1 = new Cat('Kitty');
  c1.introduce(); // -> My name is Kitty. I am a .
  var c2 = Cat('Kitty');
  c2.introduce(); // -> My name is Kitty. I am a .
  var c3 = Cat.new('Kitty');
  c3.introduce(); // -> My name is Kitty. I am a .

  var Dog = Animal.extend('Dog');

  var d1 = new Dog('Hachi');
  d1.introduce(); // -> My name is Hachi. I am a Dog.
  var d2 = Dog('Hachi');
  d2.introduce(); // -> My name is Hachi. I am a Dog.
  var d3 = Dog.new('Hachi');
  d3.introduce(); // -> My name is Hachi. I am a Dog.

  var Elephant = Animal.extend('Elephant', {
    new: function (name) {
      if (!(this instanceof Elephant))
        return new Elephant(name);
      Elephant.super_.apply(this, arguments);
    }});

  var e1 = new Elephant('Dumbo');
  e1.introduce(); // -> My name is Dumbo. I am an Elephant.
  var e2 = Elephant('Dumbo');
  e2.introduce(); // -> My name is Dumbo. I am an Elephant.
  var e3 = Elephant.new('Dumbo');
  e3.introduce(); // -> My name is Dumbo. I am an Elephant.

  var assert = require('assert');
  function assertNames(obj, name0, name1, name2) {
    assert(obj.name == name1,
           name0 + '.name = ' + name1);
    assert(obj.constructor.name == name2,
           name0 + '.constructor.name = ' + name2);
  }
  assertNames(a1, 'a1', 'Annie', 'Animal');
  assertNames(a2, 'a2', 'Annie', 'Animal');
  assertNames(a3, 'a3', 'Annie', 'Animal');
  assertNames(b1, 'b1', 'Pooh', 'Bear');
  assertNames(b2, 'b2', 'Pooh', 'Bear');
  assertNames(b3, 'b3', 'Pooh', 'Bear');
  assertNames(c1, 'c1', 'Kitty', '');
  assertNames(c2, 'c2', 'Kitty', '');
  assertNames(c3, 'c3', 'Kitty', '');
  assertNames(d1, 'd1', 'Hachi', 'Dog');
  assertNames(d2, 'd2', 'Hachi', 'Dog');
  assertNames(d3, 'd3', 'Hachi', 'Dog');
  assertNames(e1, 'e1', 'Dumbo', 'Elephant');
  assertNames(e2, 'e2', 'Dumbo', 'Elephant');
  assertNames(e3, 'e3', 'Dumbo', 'Elephant');
