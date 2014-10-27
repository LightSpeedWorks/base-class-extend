new-base-class
====

BaseClass is utility for simple class definition.
easy to use, easy to inherits/extend,
no `constructor`, no `prototype`, no `__proto__`,
no `Object.defineProperty`, no `Object.setPrototypeOf`, etc ...

# USAGE:

```js
var BaseClass = require('new-base-class');
```

## BaseClass.extend([name], proto, [classProps])

### [name] - SubClass name: string

### proto - instance prototype properties: object

#### name / constructor - constructor function: function
#### others - instance method functions: function

### [classProps] - class properties: object

#### init / initialize - class initialize function: function
#### others - class method functions: function

## BaseClass.new(...)

# SAMPLE:

```js
  var BaseClass = require('new-base-class');

  // SimpleClass
  var SimpleClass = BaseClass.extend();
  var s1 = new SimpleClass();

  // Animal
  var Animal = BaseClass.extend({
    new: function Animal(name) {
      if (!(this instanceof Animal))
        return Animal.new.apply(Animal, arguments);
      this.name = name;
    },
    get name() { return this._name; }, // getter
    set name(name) { this._name = name; }, // setter
    introduce: function () {
      console.log('My name is ' + this.name);
    },
  }, {
    init: function () {
      console.log('Animal class init');
    },
    animalClassMethod: function () {
      console.log('Animal class method');
    }
  }); // -> Animal class init
  var a1 = new Animal('Annie');
  a1.introduce(); // -> My name is Annie
  Animal.animalClassMethod(); // -> Animal class method

  // Bear
  var Bear = Animal.extend('Bear');
  var b1 = Bear('Pooh'); // new less
  b1.introduce(); // -> My name is Pooh

  var Cat = Animal.extend({
    new: function Cat() {
      if (!(this instanceof Cat))
        return Cat.new.apply(Cat, arguments);
      return Cat.super_.apply(this, arguments) || this;
    }
  });
  var c1 = Cat.new('Kitty');
  c1.introduce(); // -> My name is Kitty

  var Dog = Animal.extend({
    new: function Dog() {
      if (!(this instanceof Dog))
        return Dog.new.apply(Dog, arguments);
      return Dog.super_.apply(this, arguments) || this;
    },
  }, {
    init: function () {
      console.log('Dog class init');
    },
    dogClassMethod: function () {
      this.animalClassMethod();
      console.log('Dog class method');
    }
  }); // -> Dog init
  var d1 = Dog.new('Hachi'); // Class method new call
  d1.introduce(); // -> My name is Hachi
  Dog.dogClassMethod(); // -> Animal class method, Dog class method
  Dog.animalClassMethod(); // -> Animal class method


  // sample: JavaScript Object.defineProperty - SONICMOOV LAB
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
```

# LICENSE:

  MIT
