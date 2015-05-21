[base-class-extend](https://www.npmjs.org/package/base-class-extend) - npm
====

[English version](README.md#readme)

[BaseClass.extend](https://www.npmjs.org/package/base-class-extend)はJavaScriptのクラスを定義します。<br/>
これはJavaScriptのクラスを単純に定義する機能を提供するシンプルなモジュールです。

getter/setterをサポートします。

簡単に使えて、簡単に継承できます。<br/>
`Array`, `Error`, やNode.jsの`events.EventEmitter`からの継承をサポートします。

難しいキーワードは全く必要ありません。<br/>
`constructor`も、`prototype`も、`__proto__`も、<br/>
`Object.defineProperty`も、`Object.setPrototypeOf`も、等も不要です。

Chrome, Firefox, ie11/9/8/6 と Node.js/io.js をサポートします。

関連記事: [[JavaScript] getter/setterも使えるエコ楽なクラス定義 - もちろん継承も - private変数も](http://qiita.com/LightSpeedC/items/3946088b58925234cc48) - qiita

![base-class.png](images/base-class.png)

# インストール:

```bash
$ npm install base-class-extend
```

または

http://lightspeedworks.github.io/base-class-extend/lib/base-class-extend.js

```html
<script src="http://lightspeedworks.github.io/base-class-extend/lib/base-class-extend.js"></script>
```

# 使い方:

```js
var BaseClass = require('base-class-extend');
```

## メソッド: Class.extend(name, proto, staticProps)

  基底クラスを継承した新しいクラス(コンストラクタ関数)を定義します。

### 形式

```js
var YourClass = BaseClass.extend([name], [proto], [staticProps]);
var YourSubClass = YourClass.extend([name], [proto], [staticProps]);
```

### パラメータ

  + **BaseClass**: 継承のための基底クラスまたはスーパークラス
  + **name**: 新しいクラス名の文字列 (省略可)
  + **proto**: 新しいクラスのプロトタイプオブジェクト (省略可)
    + **new** または **constructor**: コンストラクタ関数 (省略可)
    + **get** prop(): getter関数 (省略可)
    + **set** prop(value): setter関数 (省略可)
    + **any methods**: メソッドまたはメンバー関数 (省略可)
  + **staticProps**: クラス／静的プロパティのオブジェクト (省略可)
    + **init**: 初期化関数 (省略可)
    + **get** prop(): getter関数 (省略可)
    + **set** prop(value): setter関数 (省略可)
    + **any methods**: 静的メソッドまたはクラス関数 (省略可)

  ※**proto**を省略した場合**staticProps**も省略する必要がある<br/>
  ※**staticProps**を指定したい場合、省略したい**proto**の部分は`{}`と指定すると良い

### 返り値

  新しく定義されたクラス(コンストラクタ関数)。(新しいクラスは基底クラスのサブクラス)

### 詳細

  簡単なサンプル:

```js
var BaseClass = require('base-class-extend');

var MyClass = BaseClass.extend({
  new: function MyClass(value) {
    this.value = value; // setter経由
  },
  show: function show() {
    console.log(this.value); // getter経由
  },
  // getter
  get value() { return this._value; },
  // setter
  set value(value) {
    if (value < 1 || value > 6)
      throw new RangeError('Out of range');
    this._value = value; },
});

var myObj = new MyClass(5);
myObj.value++; // 5 -> 6
myObj.show();
myObj.value++; // 6 -> 7 throws Error
```

## メソッド: Class.new(...) または Class.create(...)

  クラスのインスタンスオブジェクトを作成する。

### 形式

```js
var YourClass = BaseClass.extend('YourClass');
var yourObj = YourClass.new();

// または
var yourObj = YourClass.create();

// または
var yourObj = new YourClass();

// または
var yourObj = YourClass();
// 必須: デフォルトコンストラクタまたは正しい定義のコンストラクタ
```

### パラメータ

  + **arguments**...: コンストラクタ関数に渡される引数 (省略可)

### 返り値

  クラスの新しいインスタンスオブジェクトを返す。

## BaseClass無しで、Objectやその他のクラスからの継承

### Objectクラスからの継承

```js
var BaseClass = require('base-class-extend').extendPrototype(Object);
//  or
// Object.extend = BaseClass.extend;

var SimpleClass = Object.extend('SimpleClass');

// または単純に
var SimpleClass = BaseClass.extend.call(Object, 'SimpleClass');
```

### Arrayクラスからの継承

```js
var BaseClass = require('base-class-extend').extendPrototype(Array);
//  or
// Array.extend = BaseClass.extend;

var CustomArray = Array.extend('CustomArray');

// または単純に
var CustomArray = BaseClass.extend.call(Array, 'CustomArray');

var ca = new CustomArray(1, 2, 3);
// カスタム配列 [1, 2, 3] を返す
```

### Errorクラスからの継承

```js
var BaseClass = require('base-class-extend').extendPrototype(Error);
//  or
// Error.extend = BaseClass.extend;

var CustomError = Error.extend('CustomError');

// または単純に
var CustomError = BaseClass.extend.call(Error, 'CustomError');

var ce = new CustomError('message');
```

### EventEmitterクラスからの継承

```js
var EventEmitter = require('events').EventEmitter;

var BaseClass = require('base-class-extend').extendPrototype(EventEmitter);
//  or
// EventEmitter.extend = BaseClass.extend;

var CustomEventEmitter = EventEmitter.extend('CustomEventEmitter');

// または単純に
var CustomEventEmitter = BaseClass.extend.call(EventEmitter, 'CustomEventEmitter');
```

### 他の全てのクラスつまりコンストラクタ関数からの継承 ... Function

```js
var BaseClass = require('base-class-extend').extendPrototype();
//  or
// Function.prototype.extend = BaseClass.extend;

var SimpleClass = Object.extend('SimpleClass');
var CustomArray = Array.extend('CustomArray');
var CustomError = Error.extend('CustomError');

var EventEmitter = require('events').EventEmitter;
var CustomEventEmitter = EventEmitter.extend('CustomEventEmitter');
```

## メソッド: this.addPrototype(proto)

  プライベート変数または隠された変数を定義できます。<br/>
  getter/setterやプライベート変数をアクセスできる通常のメソッドをサポートします。

### 形式

```js
// 'new'メソッドまたは'constructor'関数の中に定義すること
{
  constructor: function () {
    var private1;
    this.addPrototype({
      method1: function method1() {
        console.log(private1); },
      get prop1() { return private1; },
      set prop1(val) { private1 = val; },
    });
  }
}
```

### パラメータ

  + **proto**: プライベート変数にアクセスできるメソッドが含まれるプロトタイプオブジェクト (必須)
    + **get** prop(): getter関数 (省略可)
    + **set** prop(value): setter関数 (省略可)
    + **any methods**: メソッドまたはメンバー関数 (省略可)

### 返り値

  渡したプロトタイプオブジェクト。

### 詳細

  サンプル:

```js
var YourClass = BaseClass.extend({
  new: function YourClass() {
    var private1 = 123; // getter/setter経由のアクセス
    var private2 = 'abc'; // getter経由のアクセス, setter無し
    this.addPrototype({
      get private1() { return private1; }, // getter
      set private1(val) { private1 = val; }, // setter
      get private2() { return private2; }, // getter
    });
  },
});
```

## メソッド: this.private(proto)

  プライベート変数または隠された変数を定義できます。<br/>
  getter/setterやプライベート変数をアクセスできる通常のメソッドをサポートします。

### 形式

```js
// 'new'メソッドまたは'constructor'関数の中に定義すること
{
  constructor: function () {
    var private1;
    this.private({
      method1: function method1() {
        console.log(private1); },
      get prop1() { return private1; },
      set prop1(val) { private1 = val; },
    });
  }
}
```

### パラメータ

  + **proto**: プライベート変数にアクセスできるメソッドが含まれるプロトタイプオブジェクト (必須)
    + **get** prop(): getter関数 (省略可)
    + **set** prop(value): setter関数 (省略可)
    + **any methods**: メソッドまたはメンバー関数 (省略可)

### 返り値

  渡したプロトタイプオブジェクト。

### 詳細

  サンプル:

```js
var YourClass = BaseClass.extend({
  new: function YourClass() {
    var private1 = 123; // getter/setter経由のアクセス
    var private2 = 'abc'; // getter経由のアクセス, setter無し
    this.private({
      get private1() { return private1; }, // getter
      set private1(val) { private1 = val; }, // setter
      get private2() { return private2; }, // getter
    });
  },
});
```

# 使用例:

```js
// Animal

// BaseClass
var BaseClass = require('base-class-extend');

// SimpleClass
var SimpleClass = BaseClass.extend('SimpleClass');
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
    Cat.super_.apply(this, arguments);
  }
});
var c1 = Cat.new('Kitty');
c1.introduce(); // -> My name is Kitty

var Dog = Animal.extend({
  new: function Dog() {
    if (!(this instanceof Dog))
      return Dog.new.apply(Dog, arguments);
    Dog.super_.apply(this, arguments);
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

```js
// Vector2D/Vector3D

// BaseClass
var BaseClass = require('base-class-extend');

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

# 参考:

## [get-constructors](https://www.npmjs.org/package/get-constructors) - npm

# ライセンス:

  MIT
