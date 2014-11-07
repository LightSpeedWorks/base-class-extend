# getter/setterも使えるエコ楽なクラス定義 - もちろん継承も - private変数も

ゴール：

+ `getter/setter`を含むクラス定義をエコ楽に記述できる(`get`/`set`)
+ クラスの継承もエコ楽に正しく記述できる(`extend`)
+ とにかく長いキーワードや余計なものはプログラマには書かせない
  + `constructor`の代わりに、`new`を使える様にする
  + `prototype`も`__proto__`もプログラマには見せない書かせない
  + `Object.defineProperty`や`Object.setPrototypeOf`なども見せない書かせない
+ ついでに外部からアクセスできない`private`な変数も使える様にする

![base-class.jpg](https://qiita-image-store.s3.amazonaws.com/0/16128/d1000a7b-5667-597b-96aa-0caff2dbc59f.jpeg)

※npmに[base-class-extend](https://www.npmjs.org/package/base-class-extend)として登録しました。
※参考: [[JavaScript] そんな継承はイヤだ - クラス定義 - オブジェクト作成](http://qiita.com/LightSpeedC/items/d307d809ecf2710bd957)

この記事のゴールは、以下の様にクラス定義がエコ楽にできること。

```js:animal-ex.js
  // animal-ex.js
  'use strict';

  var BaseClass = require('base-class-extend');

  var Animal = BaseClass.extend({
    new: function Animal(name) {
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

  var Bear = Animal.extend('Bear');

  var b1 = new Bear('Pooh');
  b1.introduce(); // -> 私の名前はPoohです。私はBearです。
```

[JavaScriptのObject.definePropertyを使ってみよう - SONICMOOV LAB](http://lab.sonicmoov.com/development/javascript-object-defineproperty/)より

```js:vector-ex.js
  // vector-ex.js
  'use strict';

  var BaseClass = require('base-class-extend');

  // JavaScriptのObject.definePropertyを使ってみよう - SONICMOOV LAB
  // http://lab.sonicmoov.com/development/javascript-object-defineproperty/
  // 上記を参照してサンプルを作ってみました。

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

# getter/setterのあるオブジェクト

getter/setterのあるオブジェクトとは、いったいどんなモノかというと、<br/>
`get`とか`set`を使ってアクセサを定義するオブジェクトの事です。

```js:obj-get-set-ex.js
  // obj-get-set-ex.js
  'use strict';

  var obj1 = { _name: 'My Name',
               get name() { return this._name; },
               set name(name) { this._name = name },
              };

  console.log(obj1.name); // -> My Name
  obj1.name = 'New Name';
  console.log(obj1.name); // -> New Name
```

これ、使い勝手は良さそうだけど、たくさん使うと効率は悪そうですよね。<br/>
やっぱり`new Class()`って感じで作りたいし。<br/>
`Object.defineProperty` を使うとできるんだけどキーワード多過ぎだし。

## 関数の名前を取得 `Function.name`

`Object.name`とか`Function.name`など関数の名前が表示できると便利なので、<br/>
FirefoxやChrome以外では、以下のおまじないを実行します。特にIEね。

```js:function-name.js
  // function-name.js
  'use strict';

  var fnameRegExp = /^\s*function\s*\**\s*([^\(\s]*)[\S\s]+$/im;

  // fname: get function name
  function fname() {
    return ('' + this).replace(fnameRegExp, '$1');
  }

  // Function.prototype.name
  if (!Function.prototype.hasOwnProperty('name')) {
    if (Object.defineProperty)
      Object.defineProperty(Function.prototype, 'name', {get: fname});
    else if (Object.prototype.__defineGetter__)
      Function.prototype.__defineGetter__('name', fname);
  }
```

# `newClass`という関数を作ってみよう。

とりあえず継承とか考えずに、getter/setterを簡単に記述できる`newClass`関数を考えてみよう。

JavaScriptで正しくクラスを定義するにはコンストラクタ関数の`prototype`属性に、プロトタイプオブジェクトを置いて、クラス共通のインスタンスメソッドを並べれば良いよね。そしてそのプロトタイプオブジェクトの`constructor`属性からコンストラクタ関数を指せばいいよね。ループしてるんだね。

正しいクラス定義の方法は以下のリンクを参考にしてください。<br/>
[[JavaScript] そんな継承はイヤだ - クラス定義 - オブジェクト作成 - Qiita](http://qiita.com/LightSpeedC/items/d307d809ecf2710bd957)

じゃ、簡単に以下の様に定義してみる。

```js:new-class-ex.js
  // new-class-ex.js
  'use strict';

  function newClass(proto) {
    var ctor = proto.constructor = proto.new;
    ctor.prototype = proto;
    return ctor;
  }

  var Animal = newClass({
    new: function Animal(name) {
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
```

`newClass`は3行でできた。<br/>
たった3行だけど、実はこれで8割完成です。<br/>
(注: 実は`prototype.constructor`が`enumerable`だ。後で直すよ)

今までの`Object.defineProperty`を使った作り方だと、

```js:obj-def-prop-ex.js
  // obj-def-prop-ex.js
  'use strict';

  function Animal(name) {
      this.name = name;
  }
  Animal.prototype.introduce = function () {
      console.log('私の名前は' + this.name + 'です。' +
                  '私は' + this.constructor.name + 'です。');
  };
  Object.defineProperty(Animal.prototype, 'name', {
    get: function () { return this._name; },
    set: function (name) { this._name = name; },
  });

  var a1 = new Animal('Annie');
  a1.introduce(); // -> 私の名前はAnnieです。私はAnimalです。
```

どう見てもわかりにくい。<br/>
読者を煙に巻いてるとしか思えない。<br/>
余計なキーワードが多過ぎるんだね。<br/>
`prototype`とか、<br/>
`Object.defineProperty`とか、<br/>
`get: function () {}`とか、<br/>
非常にわかりにくい。

# `newClass`の改良版として、継承機能を追加した`extend`を作ってみよう。

継承するためのスーパークラスを指す引数がいるけど、クラスメソッドにすることで引数じゃなくて`this`でクラスを指す事にすると良いかな。

```js:extend1-ex.js
  // extend1-ex.js
  'use strict';

  function extend(proto) {
    var ctor = proto.constructor = proto.new;
    ctor.prototype = proto;
    proto.__proto__ = this.prototype; // inherits
    return ctor;
  }

  function BaseClass() {}
  BaseClass.extend = extend;

  var Animal = BaseClass.extend({
    new: function Animal(name) {
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

  Animal.extend = extend;  // これはジャマ(後でネ)
  var Bear = Animal.extend({
    new: function Bear() {
      Animal.apply(this, arguments);
    }});

  var b1 = new Bear('Pooh');
  b1.introduce(); // -> 私の名前はPoohです。私はBearです。
```

`extend`関数は4行でできました。<br/>
たった4行だけど、もう9割完成です。<br/>
(非標準の`__proto__`が出てきた。後で直すよ)

欠点が見えてきた。

+ クラスメソッドなので、いきなり`extend`は呼べない
+ 簡単に継承したいのに`Animal.extend`等をいちいち定義しないといけない
+ 他にもクラスメソッドを追加したい事もある
+ たまにはコンストラクタも省略できる様にしたい

# クラスメソッドの継承も拡張しちゃえ

本格的に使える様にしていこう。

+ `extend`関数をいちいちクラスメソッドに定義しないといけないのは面倒だ。<br/>
そのまま`extend()`で呼び出したら`Object`クラスからの継承にしよう。
+ クラスメソッド群を2番目の引数に追加しよう。
+ クラスメソッドも継承できる様に、コンストラクタ関数のプロトタイプをいじって継承できるようにしちゃうか。<br/>
プロパティ群をコピーするのが面倒だからそのままプロトタイプ・チェインさせるか。
+ `util.inherits`との互換性も考えて、コンストラクタの`super_`属性も定義しちゃうか。

```js:extend2-ex.js
  // extend2-ex.js
  'use strict';

  function extend(proto, classProps) {
    var superCtor = this;
    if (typeof superCtor !== 'function')
      superCtor = Object;

    var ctor = proto.constructor = proto.new;
    ctor.prototype = proto;

    // inherits
    proto.__proto__ = superCtor.prototype;

    // inherits class methods
    ctor.__proto__ = superCtor;
    if (classProps) {
      ctor.__proto__ = classProps;
      classProps.__proto__ = superCtor;
    }

    ctor.super_ = superCtor;
    return ctor;
  }

  var BaseClass = extend(
    {new: function BaseClass() {}},
    {extend: extend});

  var Animal = BaseClass.extend({
    new: function Animal(name) {
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

  var Bear = Animal.extend({
    new: function Bear() {
      Bear.super_.apply(this, arguments);
    }});

  var b1 = new Bear('Pooh');
  b1.introduce(); // -> 私の名前はPoohです。私はBearです。
```

ほぼ完成に近いよ。<br/>
まだ`new`というか`constructor`が省略できないな。

# `new`または`constructor`が省略できるバージョン

+ `new`または`constructor`を省略すると、コンストラクタ関数が無いので自動で作成するよ。<br/>
その関数名(クラス名)は最初のオプショナルな引数で文字列で指定できる様にした。
+ ついでに`new`というRuby風のクラスメソッドも定義してみるか。<br/>
これがあると継承する時に`apply`で可変引数のまま`new`できるよ。

こういうことをやりだすとゴチャゴチャしてくるね。<br/>
もう深く追う必要はないよね。

```js:extend3-ex.js
  // extend3-ex.js
  'use strict';

  function extend(name, proto, classProps) {
    if (typeof name !== 'string') {
      classProps = proto;
      proto = name;
      name = '$NoName$';
    }

    var superCtor = this;
    if (typeof superCtor !== 'function')
      superCtor = Object;

    if (!proto) proto = {};

    var ctor = proto.hasOwnProperty('new')         && proto.new ||
               proto.hasOwnProperty('constructor') && proto.constructor ||
               Function('proto, superCtor, new_',
        'return function ' + name + '() {\n' +
        '  if (!(this instanceof proto.constructor)) \n' +
        '    return new_.apply(proto.constructor, arguments) \n' +
        '  superCtor.apply(this, arguments); }')
        (proto, superCtor, new_);
    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');
    if (!ctor.name) {
      ctor = Function('proto, ctor, new_',
        'return function ' + name + '() {\n' +
        '  if (!(this instanceof proto.constructor)) \n' +
        '    return new_.apply(proto.constructor, arguments) \n' +
        '  ctor.apply(this, arguments); }')
        (proto, ctor, new_);
    }
    proto.constructor = ctor;
    proto.new = ctor;
    ctor.prototype = proto;

    // inherits
    proto.__proto__ = superCtor.prototype;

    // inherits class methods
    ctor.__proto__ = superCtor;
    if (classProps) {
      ctor.__proto__ = classProps;
      classProps.__proto__ = superCtor;
    }

    ctor.super_ = superCtor;
    return ctor;
  }

  function new_() {
    var obj = Object.create(this.prototype);
    return this.apply(obj, arguments), obj;
  }

  var BaseClass = extend(
    {new: function BaseClass() {}},
    {extend: extend, new: new_});

  var Animal = BaseClass.extend({
    new: function Animal(name) {
      if (!(this instanceof Animal))
        return Animal.new.apply(Animal, arguments);
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
        return Bear.new.apply(Bear, arguments);
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
  c1.introduce(); // -> 私の名前はKittyです。私は$NoName$です。
  var c2 = Cat('Kitty');
  c2.introduce(); // -> 私の名前はKittyです。私は$NoName$です。
  var c3 = Cat.new('Kitty');
  c3.introduce(); // -> 私の名前はKittyです。私は$NoName$です。

  var Dog = Animal.extend('Dog');

  var d1 = new Dog('Hachi');
  d1.introduce(); // -> 私の名前はHachiです。私はDogです。
  var d2 = Dog('Hachi');
  d2.introduce(); // -> 私の名前はHachiです。私はDogです。
  var d3 = Dog.new('Hachi');
  d3.introduce(); // -> 私の名前はHachiです。私はDogです。

  var Elephant = Animal.extend('Elephant', {
    new: function () {
      if (!(this instanceof Elephant))
        return Elephant.new.apply(Elephant, arguments);
      Elephant.super_.apply(this, arguments);
    }});

  var e1 = new Elephant('Dumbo');
  e1.introduce(); // -> 私の名前はDumboです。私はElephantです。
  var e2 = Elephant('Dumbo');
  e2.introduce(); // -> 私の名前はDumboです。私はElephantです。
  var e3 = Elephant.new('Dumbo');
  e3.introduce(); // -> 私の名前はDumboです。私はElephantです。
```

# npm に [base-class-extend](https://www.npmjs.org/package/base-class-extend) を登録した

というわけで、npm に登録した。<br/>
https://www.npmjs.org/package/base-class-extend

似たようなのがたくさんあるけど、他よりちょっと便利だと思う。

# [base-class-extend](https://www.npmjs.org/package/base-class-extend) の使い方

`BaseClass`には`extend`メソッドと`new`メソッドがあります。<br/>
インスタンスメソッドに`private`メソッドがあります。

いろいろなサンプルを以下に示します。

```js
var BaseClass = require('base-class-extend');

// 何もしないクラス
var MeanLessClass1 = BaseClass.extend();
var MeanLessClass2 = BaseClass.extend('MeanLessClass2');
var m11 = new MeanLessClass1();
var m12 = MeanLessClass1(); // new無し
var m13 = MeanLessClass1.new(); //  newクラスメソッド

// コンストラクタ関数に関数名がある時
var NewClass1 = BaseClass.extend({
  new: function NewClass1() {},
});
// コンストラクタ関数が匿名関数の時は文字列で指定
var NewClass2 = BaseClass.extend('NewClass2', {
  new: function () {},
});

// getter/setter, methodなど
var NewClass3 = BaseClass.extend({
  new: function NewClass3() { this.prop1 = 123; }, // setter経由
  method1: function () { return this.prop1; }, // getter経由
  get prop1() { return this._prop1; },
  set prop1(val) { this._prop1 = val; },
});

// classのgetter/setterなど(thisはコンストラクタ関数)
var NewClass4 = BaseClass({
  new: function NewClass4() { this.prop1 = 123; },
  method1: function () { return this.prop1; },
}, {
  init: function () { this.classProp1 = 123; }, // 初期化1
  initialize: function () { this.classProp2 = 123; }, // 初期化2
  classMethod1: function () { return this.classProp2; },
  get classProp2() { return this._classProp2; },
  set classProp2(val) { this._classProp2 = val; },
});

// 継承の時のクラスメソッド
var NewClass5 = NewCLass4.extend('NewClass5', {}, {
  init: function () { this.classProp1 = 123; },
  initialize: function () { this.classProp2 = 123; },
  classMethod1: function() {
    return NewClass5.super_.classMethod1() + this.classProp1;
  }
});

// 継承の例
var SuperClass = BaseClass.extend({
  new: function SuperClass(x, y) {
    if (!(this instanceof SuperClass))
      return new SuperClass(x, y); // 引数がはっきりしている場合
    this.x = x;
    this.y = y;
  },
});

// 継承して、追加の属性がある時
var SubClass1 = SuperClass.extend({
  new: function SubClass1(x, y, z) {
    if (!(this instanceof SubClass1))
      return SubClass1.new.apply(SubClass1, arguments);
    SubClass1.super_.apply(this, arguments);
    this.z = z;
  },
});

// 継承して、追加の属性がない時
var SubClass2 = SuperClass.extend({
  new: function SubClass2(x, y, z) {
    if (!(this instanceof SubClass2))
      return SubClass2.new.apply(SubClass2, arguments);
    SubClass2.super_.apply(this, arguments);
  },
});

// new無しでコンストラクタを呼んだらエラーとする
var SubClass3 = SuperClass.extend({
  new: function SubClass3(x, y, z) {
    if (!(this instanceof SubClass3))
      throw new TypeError('Constructor SubClass3 requires new');
    SuperClass.apply(this, arguments);
  },
});

// 継承するだけ
var SubClass4 = SuperClass.extend('SubClass4');

// private変数の例
var PrivateClass1 = BaseClass.extend({
  new: function PrivateClass1(val) {
    if (!(this instanceof PrivateClass1))
      return new PrivateClass1(val);
    var private1 = val;
    this.private({
      showPrivate: function showPrivate() {
        console.log(private1); },
      get private2() { return private1; },
      set private2(val) { private1 = val; },
    });
  }
});
```

※わざと`new`とか`private`という予約語をメソッド名にしています。賛否両論ありそう。

おしまい。

# npmモジュール

良さそうなやつから記述します。

## 簡単に記述できるやつ

### [base-class-extend](https://www.npmjs.org/package/base-class-extend) と [new-base-class](https://www.npmjs.org/package/new-base-class) (npm)

`SubClass = BaseClass.extend(prototype, classProps);`<br/>
`SubClass = BaseClass.extend('name', prototype, classProps);`<br/>
prototype以外にclassPropsあり<br/>
Classメソッドの継承あり(コピーしないので動的)<br/>
getter/setterサポート<br/>
`constructor`の代わりに`new`も使える(`constructor`のままでも良い)<br/>
`Class.new(...)`は`new Class(...)`と同じ意味<br/>
`this.private({})`で`private`な変数にもアクセスできるメソッドが定義できる<br/>
※この記事を書きながらリリースしました。

### [js-class](https://www.npmjs.org/package/js-class) (npm)

使い方が私のパッケージと違うけどかなりイケてる<br/>
`Class(BaseClass, prototype, options);`<br/>
getter/setterサポート<br/>
`constructor`のまま<br/>
options.implements: [EventEmitter, Clearable] // mixin<br/>
options.statics: staticProps // getter/setterもOK<br/>
Class.is(object).typeOf(Type)<br/>
Class.is(object).a(Type)<br/>
Class.is(object).an(Object)

## John Resigさんのコード

### [Blog: ejohn.org/blog/simple-javascript-inheritance](http://ejohn.org/blog/simple-javascript-inheritance/)

John Resigさんのコード<br/>
`constructor`は指定できないが初期化コードは`init`に記述する<br/>
prototypeのみ, prototypeの属性をコピー<br/>
`this._super`の実装が肝だけどちょっとやばい(例外発生時など)<br/>
arguments.calleeを使ってるね→もう使っちゃダメ(Strictモードでは動かない)

以下の本に書いてあります。<br/>
[JavaScript Ninjaの極意 ライブラリ開発のための知識とコーディング (Programmers’ SELECTION)](http://www.amazon.co.jp/gp/product/4798128457/ref=as_li_ss_tl?ie=UTF8&camp=247&creative=7399&creativeASIN=4798128457&linkCode=as2&tag=lightspeedexb-22)

[洋書: Secrets of the JavaScript Ninja](http://www.amazon.co.jp/gp/product/193398869X/ref=as_li_ss_tl?ie=UTF8&camp=247&creative=7399&creativeASIN=193398869X&linkCode=as2&tag=lightspeedexb-22)<br/>
[Blog: State of Secrets](http://ejohn.org/blog/state-of-the-secrets/)

### [define-class](https://www.npmjs.org/package/define-class) (npm)

John Resigさんのコード<br/>
`constructor` → `init`<br/>
prototype以外にstaticPropsあり<br/>
`DefineClass(proto, staticProps);`<br/>
`DefineClass(BaseClass, proto, staticProps);`

### [node.class](https://www.npmjs.org/package/node.class) (npm)

John Resigさんのコード<br/>
`constructor` → `init`<br/>
`Class.inject`という機能がある(mixin)

### [class.extend](https://www.npmjs.org/package/class.extend) (npm)

John Resigさんのコード<br/>
`constructor` → `init`<br/>
prototypeのみ, prototypeの属性をコピー

### [extend.class](https://www.npmjs.org/package/extend.class) (npm)

John Resigさんのコード<br/>
`constructor` → `init`<br/>
prototypeのみ, prototypeの属性をコピー

### [node-base-class](https://www.npmjs.org/package/node-base-class) (npm)

John Resigさんのコード<br/>
`constructor` → `init`<br/>
prototypeのみ, prototypeの属性をコピー

### [prototypejs.org/learn/class-inheritance](http://prototypejs.org/learn/class-inheritance) (prototype)

prototypeのコード<br/>
`Class.create`, `prototype.initialize`, `Object.extend`, ...<br/>
(prototypeはjQueryより前からあるprototype拡張しまくりのライブラリ)

### [code.google.com/p/base2](https://code.google.com/p/base2/) (base2)

base2のコード<br/>
よくわからん。

## Backboneのコード

### [class-extend](https://www.npmjs.org/package/class-extend) (npm)

Backboneのコード<br/>
prototype以外にstaticPropsあり。<br/>
`constructor`のまま<br/>
`Class.__super__` == `SuperClass.prototype`<br/>
依存: lodash

### [compose-extend](https://www.npmjs.org/package/compose-extend) (npm)

Backboneのコード<br/>
Base.extend(proto, staticProps)<br/>
prototypeをコピー(_.extendで)<br/>
staticPropsをコピー(_.extendで)

### [simple-extend](https://www.npmjs.org/package/simple-extend) (npm)

Backboneのコード<br/>
prototype以外にclassPropsあり。<br/>
依存: lodash

### [backbone-class](https://www.npmjs.org/package/backbone-class) (npm)

Backboneのコード<br/>
依存: underscore, backbone, *

### [ampersand-class-extend](https://www.npmjs.org/package/ampersand-class-extend) (npm)

Backboneのコード<br/>
`Class.extend(proto, proto2, proto3, ...);`<br/>
mixin<br/>
依存: extend-object

### [baseclass](https://www.npmjs.org/package/baseclass) (npm)

Backboneのコード<br/>
BaseClass.extend(proto, staticProps);<br/>
constructor

### [base-class](https://www.npmjs.org/package/base-class) (npm)

依存: underscore<br/>
prototypeのみ<br/>
prototypeをコピー(_.extendで)<br/>
constructor, init, defaults, ..., on/once<br/>
なんか最初からEventEmitterを継承してる

### [obstruct](https://www.npmjs.org/package/obstruct) (npm)

prototypeのみ<br/>
prototypeの属性をコピー

### [Class](https://www.npmjs.org/package/Class) (npm)

Class.create({initialize: ...<br/>
Class.create(SuperClass, {initialize: ...

## underscore.extend系 - オブジェクトコピー

### [extend-object](https://www.npmjs.org/package/extend-object) (npm)

1つ目の引数に2番目以降のオブジェクトの属性をコピー<br/>

### [exto](https://www.npmjs.org/package/exto) (npm)

_.extend<br/>
exto(to, from, ...)

### [yiwn-extend](https://www.npmjs.org/package/yiwn-extend) (npm)

_.extend<br/>
extend(to, from, ...)

### [f-extend](https://www.npmjs.org/package/f-extend) (npm)

extend(to, from, isDeep);

### [extend-shallow](https://www.npmjs.org/package/extend-shallow) (npm)

extend(to, from);

## util.inherits系 - 継承の支援

### [inherits](https://www.npmjs.org/package/inherits) (npm)

これぞinheritsの原点<br/>
util.inheritsと同じ<br/>
Browserでも互換性のある実装 (古いブラウザもOK)<br/>
isaacsさんのコード

### [modelo](https://www.npmjs.org/package/modelo) (npm)

util.inheritsの様なやつ<br/>
modelo.inherits(SubClass, BaseClass);<br/>
modelo.inherits(Combined, MixinOne, MixinTwo);

### [tea-inherits](https://www.npmjs.org/package/tea-inherits) (npm)

util.inheritsの様なやつ<br/>
inherits = require('tea-inherits');<br/>
inherits(MyConstructor, EventEmitter);

## 複雑系

### [stdclass](https://www.npmjs.org/package/stdclass) (npm)

複雑<br/>
`extend`, `implement`, `mixin` あり<br/>
`Class.neo()` → `new CLass()`

### [class-extender](https://www.npmjs.org/package/class-extender) (npm)

なんか複雑

### [cextend](https://www.npmjs.org/package/cextend) (npm)

なんか複雑で使いにくそう

### [metaphorjs-class](https://www.npmjs.org/package/metaphorjs-class) (npm)

依存: metaphorjs-namespace<br/>
結構複雑

### [node-class](https://www.npmjs.org/package/node-class) (npm)

依存: function-enhancements, array-enhancements, object-enhancements<br/>
高機能だけど、なんか複雑そう

### [class](https://www.npmjs.org/package/class) (npm)

なんか複雑そう (new, class, subclass, includeとか)

### [nodeBase](https://www.npmjs.org/package/nodeBase) (npm)

なんか高機能過ぎるが、簡単には使えない<br/>
logging, options, defaults, EventEmitter

### [ee-class](https://www.npmjs.org/package/ee-class) (npm)

new Class({inherits: BaseClass, init:...})<br/>
なんか相当複雑

### [obj-extend](https://www.npmjs.org/package/obj-extend) (npm)

prototypeとか出ていて例を見ても意味不明で使えない

### [mixin-class](https://www.npmjs.org/package/mixin-class) (npm)

中国語readme
