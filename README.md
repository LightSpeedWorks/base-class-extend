base-class-extend
====

BaseClass define classes in JavaScript.
This is simple module providing a simple Class function to
simplify class definition in JavaScript.

Easy to use, easy to inherits/extend.

no difficult keywords,
no `constructor`, no `prototype`, no `__proto__`,
no `Object.defineProperty`, no `Object.setPrototypeOf`, etc ...

# INSTALL:

```bash
  $ npm install base-class-extend
```

# USAGE:

```js
  var BaseClass = require('base-class-extend');
```

# method: BaseClass.extend

## Prototype

```js
  var YourClass = BaseClass.extend([name], prototype, [classProps]);
```

## Parameters

+ *BaseClass*: Base class or Super class for inherits

+ *name*: string name of your class, optional

+ *prototype*: the prototype object for your class, optional

+ *classProps*: class or static properties object, optional

## Returns

The newly defined class (Your class is subclass of BaseClass)

## Details

A simple and quick sample:

```js
  var BaseClass = require('base-class-extend');

  var MyClass = BaseClass.extend({
    new: function MyClass(value) {
      this.value = value; // via setter
    },
    show: function show() {
      console.log(this.value); // via getter
    },
    get value() { return this._value; },
    set value(value) {
      if (!(value >= 1 && value <= 10))
        throw new Error('Out of range');
      this._value = value; },
  });

  var myObj = new MyClass(5);
  myObj.value++;
  myObj.show();
```

# method: BaseClass.new

## Prototype

```js
  var YourClass = BaseClass.extend('YourClass');
  var yourObj = YourClass.new();

  // or
  var yourObj = new YourClass();
```

## Returns

Your new object

# without BaseClass, inherits from Object, or other Classes

## inherits from Object

```js
  Object.extend = BaseClass.extend;
  var SimpleClass = Object.extend('SimpleClass');

  // or simply
  var SimpleClass = BaseClass.extend.call(Object, 'SimpleClass');
```

## inherits from EventEmitter

```js
  var EventEmitter = require('events').EventEmitter;
  EventEmitter.extend = BaseClass.extend;
  var UsefulClass = EventEmitter.extend('UsefulClass');

  // or simply
  var UsefulClass = BaseClass.extend.call(EventEmitter, 'UsefulClass');
```

# EXAMPLES:

```js

    var BaseClass = require('base-class-extend');

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
