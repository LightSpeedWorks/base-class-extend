// test-jp.js
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
      console.log('私の名前は' + this.name + 'です。' +
                  '私は' + this.constructor.name + 'です。');
    },
  });

  var a1 = new Animal('Annie');
  a1.introduce(); // -> 私の名前はAnnieです。私はAnimalです。
  var a2 = Animal('Annie');
  a2.introduce(); // -> 私の名前はAnnieです。私はAnimalです。
  var a3 = Animal.new('Annie');
  a3.introduce(); // -> 私の名前はAnnieです。私はAnimalです。

  var Bear = Animal.extend({
    new: function Bear(name) {
      if (!(this instanceof Bear))
        return new Bear(name);
      Bear.super_.apply(this, arguments);
    }});

  var b1 = new Bear('Pooh');
  b1.introduce(); // -> 私の名前はPoohです。私はBearです。
  var b2 = Bear('Pooh');
  b2.introduce(); // -> 私の名前はPoohです。私はBearです。
  var b3 = Bear.new('Pooh');
  b3.introduce(); // -> 私の名前はPoohです。私はBearです。

  var Cat = Animal.extend();

  var c1 = new Cat('Kitty');
  c1.introduce(); // -> 私の名前はKittyです。私はです。
  var c2 = Cat('Kitty');
  c2.introduce(); // -> 私の名前はKittyです。私はです。
  var c3 = Cat.new('Kitty');
  c3.introduce(); // -> 私の名前はKittyです。私はです。

  var Dog = Animal.extend('Dog');

  var d1 = new Dog('Hachi');
  d1.introduce(); // -> 私の名前はHachiです。私はDogです。
  var d2 = Dog('Hachi');
  d2.introduce(); // -> 私の名前はHachiです。私はDogです。
  var d3 = Dog.new('Hachi');
  d3.introduce(); // -> 私の名前はHachiです。私はDogです。

  var Elephant = Animal.extend('Elephant', {
    new: function (name) {
      if (!(this instanceof Elephant))
        return new Elephant(name);
      Elephant.super_.apply(this, arguments);
    }});

  var e1 = new Elephant('Dumbo');
  e1.introduce(); // -> 私の名前はDumboです。私はElephantです。
  var e2 = Elephant('Dumbo');
  e2.introduce(); // -> 私の名前はDumboです。私はElephantです。
  var e3 = Elephant.new('Dumbo');
  e3.introduce(); // -> 私の名前はDumboです。私はElephantです。

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
