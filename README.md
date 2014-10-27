base-class.js
====

BaseClass is utility for simple class definition.
easy to use, easy to inherits/extend,
no `constructor`, no `prototype`, no `__proto__`,
no `Object.defineProperty`, no `Object.setPrototypeOf`, etc ...

# USAGE:

```js
var BaseClass = require('base-class');
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
  var BaseClass = require('base-class');

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
```

# LICENSE:

  MIT
