// animal-test.js
  'use strict';

  try {
    var BaseClass = require('../lib/base-class-extend');
  } catch (e) {
    console.log('cant require "../lib/base-class-extend": ' + e);
    var BaseClass = require('base-class-extend');
  }

  var rex = /^[AIUEO]/i;
  function a(s) { return rex.exec(s) ? 'an ' + s : 'a ' + s; }

  // SimpleClass
  var SimpleClass = BaseClass.extend();
  var s1 = new SimpleClass();

  // Animal
  var Animal = BaseClass.extend({
    new: function Animal(name) {
      if (!(this instanceof Animal))
        return Animal.new.apply(Animal, arguments);
      BaseClass.apply(this); // or Animal.super_.apply(this);
      this.name = name;
    },
    get name() { return this._name; }, // getter
    set name(name) { this._name = name; }, // setter
    introduce: function () {
      console.log('My name is ' + this.name + '. ' +
                  'I am ' + a(this.constructor.name) + '.');
    },
  }, {
    init: function () {
      console.log('Animal class init. (' + this.name + ')');
    },
    animalClassMethod: function () {
      console.log('Animal class method. (' + this.name + ')');
    }
  }); // -> Animal class init. (Animal)
  var a1 = new Animal('Annie');
  a1.introduce(); // -> My name is Annie. I am an Animal.
  Animal.animalClassMethod(); // -> Animal class method. (Animal)

  // Bear
  var Bear = Animal.extend('Bear');
  var b1 = Bear('Pooh'); // new less
  b1.introduce(); // -> My name is Pooh. I am a Bear.

  var Cat = Animal.extend({
    new: function Cat() {
      if (!(this instanceof Cat))
        return Cat.new.apply(Cat, arguments);
      Cat.super_.apply(this, arguments);
    }
  });
  var c1 = Cat.new('Kitty');
  c1.introduce(); // -> My name is Kitty. I am a Cat.

  var Dog = Animal.extend({
    new: function Dog() {
      if (!(this instanceof Dog))
        return Dog.new.apply(Dog, arguments);
      Dog.super_.apply(this, arguments);
    },
  }, {
    init: function () {
      console.log('Dog class init. (' + this.name + ')');
    },
    dogClassMethod: function () {
      this.animalClassMethod();
      console.log('Dog class method. (' + this.name + ')');
    }
  }); // -> Dog class init. (Dog)
  var d1 = Dog.create('Hachi'); // Class method new call
  d1.introduce(); // -> My name is Hachi. I am a Dog.
  Dog.dogClassMethod(); // -> Animal class method. (Animal), Dog class method. (Dog)
  Dog.animalClassMethod(); // -> Animal class method. (Dog)

  console.log();
  function mapName(elem) { return elem.name; }
  console.log(a1.constructors.map(mapName).join(' < '));
  console.log(Animal.constructors.map(mapName).join(' < '));
  console.log(b1.constructors.map(mapName).join(' < '));
  console.log(Bear.constructors.map(mapName).join(' < '));
  console.log(c1.constructors.map(mapName).join(' < '));
  console.log(Cat.constructors.map(mapName).join(' < '));
  console.log(d1.constructors.map(mapName).join(' < '));
  console.log(Dog.constructors.map(mapName).join(' < '));

  var Klass = BaseClass.extend.call(Object, 'Klass');
  var k1 = new Klass();
  console.log(Klass.constructors.map(mapName).join(' < '));
  console.log(k1.constructors.map(mapName).join(' < '));
