this.extend = function () {
  'use strict';

  // $pr(msgs...)
  function $pr() {
    var msg = [].slice.call(arguments).join(' ');
    if (typeof console !== 'undefined')
      console.log(msg);
    if (typeof document !== 'undefined')
      document.writeln(msg + '<br/>');
  }

  // defProp
  var defProp = function (obj) {
    if (!Object.defineProperty) return null;
    try {
      Object.defineProperty(obj, 'prop', {value: 'test'});
      return obj.prop === 'test' ? Object.defineProperty : null;
    } catch (err) { return null; }
  } ({});

  // setConst(obj, prop, val)
  var setConst = defProp ?
    function setConst(obj, prop, val) {
      defProp(obj, prop, {value: val}); } :
    function setConst(obj, prop, val) { obj[prop] = val; };

  // setValue(obj, prop, val)
  var setValue = defProp ?
    function setValue(obj, prop, val) {
      defProp(obj, prop, {value: val,
        writable: true, configurable: true}); } :
    function setValue(obj, prop, val) { obj[prop] = val; };

  // getProto(obj)
  var getProto = Object.getPrototypeOf || {}.__proto__ ?
    function getProto(obj) { return obj.__proto__; } : null;

  // setProto(obj, proto)
  var setProto = Object.setPrototypeOf || {}.__proto__ ?
    function setProto(obj, proto) { obj.__proto__ = proto; } : null;

  // namedFunc(name, fn)
  function namedFunc(name, fn) {
    if (!name || !fn || typeof fn !== 'function' ||
        fn.name === name || fn.name === '_' + name) return fn;
    try { fn.name = name; if (fn.name === name) return fn; } catch (err) {}
    try { var fx = Function('fn', 'return function ' + name +
              '() { return fn.apply(this, arguments); }')(fn);
    } catch (err) {
      try { var fx = Function('fn', 'return function _' + name +
                '() { return fn.apply(this, arguments); }')(fn);
      } catch (err) { return fn; } }
    fx.prototype = fn.prototype;
    if (fx.name === name || fx.name === '_' + name) return fx;
    try { fx.name = name; } catch (err) {}
    return fx;
  }
/*
  // namedFunc
  function namedFunc(name, fn) {
    if (!name || !fn || typeof fn !== 'function' ||
        fn.name === name) return fn;
    try { fn.name = name; if (fn.name === name) return fn; } catch (err) {}
    var fx = Function('fn', 'return function ' + name +
        '() { return fn.apply(this, arguments) }')(fn);
    fx.prototype = fn.prototype;
    return fx;
  }
*/

  // create
  var create = Object.create ?
  function create() {
    var obj = Object.create(this.prototype);
    return this.apply(obj, arguments), obj;
  } :
  function create() {
    function ctor() {}
    ctor.prototype = this.prototype;
    var obj = new ctor();
    return this.apply(obj, arguments), obj;
  };

/*
  // Object.keys for ie6
  if (!Object.keys)
    Object.keys = function keys(obj) {
      var props = [];
      for (var prop in obj) props.push(prop);
      return props;
    };
*/

  // copy
  var copy = defProp ?
  function copy(base, excl) {
//$pr('base  keys: ' + Object.keys(base));
//$pr('base props: ' + Object.getOwnPropertyNames(base));
    for (var i = 2, n = arguments.length; i < n; ++i) {
      var from = arguments[i];
      if (from) {
//$pr('from  keys: ' + Object.keys(from));
//$pr('from props: ' + Object.getOwnPropertyNames(from));
        var props = Object.getOwnPropertyNames(from);
        for (var j = 0, m = props.length; j < m; ++j) {
          var prop = props[j];
          if (!base.hasOwnProperty(prop) &&
              !excl.hasOwnProperty(prop) &&
              base[prop] !== from[prop])
            setValue(base, prop, namedFunc(prop, from[prop]));
        }
      }
    }
    return base;
  } :
  function copy(base, excl) {
//$pr('base  keys: ' + Object.keys(base));
    for (var i = 2, n = arguments.length; i < n; ++i) {
      var from = arguments[i];
//$pr('from  keys: ' + Object.keys(from));
      if (from)
        for (var prop in from)
          if (!base.hasOwnProperty(prop) &&
              !excl.hasOwnProperty(prop) &&
              base[prop] !== from[prop])
            //base[prop] = namedFunc(prop, from[prop]);
            setValue(base, prop, namedFunc(prop, from[prop]));
    }
    return base;
  }

  // extend
  function extend111111(name, proto, statics) {
    if (typeof name !== 'string') statics = proto, proto = name, name = '';
    if (!proto || typeof proto !== 'object') proto = {};
    statics = copy({}, {}, statics, proto.statics);
    var _super = typeof this === 'function' ? this : Object;

    var ctor = namedFunc(name,
      proto.hasOwnProperty('constructor') && proto.constructor ||
      proto.hasOwnProperty('new')         && proto['new'] ||
    function ctor() {
      if (!(this instanceof proto.constructor))
        return create.apply(proto.constructor, arguments);
      if (_super !== Object && _super !== Array && _super !== Error)
        _super.apply(this, arguments);
    });

    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');

    function super_(ctor) { setValue(this, 'constructor', ctor); }
    if (_super !== Object) super_.prototype = _super.prototype;
    proto = ctor.prototype = copy(new super_(ctor), {statics:0}, proto);
    setProto && _super !== Object && setProto(ctor, _super);
    return copy(ctor, {name:0}, statics, _super !== Object ? _super : null,
        {create:create, extend:extend});
  }

  // extend2
  function extend(name, proto, statics) {
    if (typeof name !== 'string') statics = proto, proto = name, name = '';
    if (!proto || typeof proto !== 'object') proto = {};
    statics = copy({}, {}, statics, proto.statics);
    var _super = typeof this === 'function' ? this : Object;

    var ctor = namedFunc(name,
      proto.hasOwnProperty('constructor') ? proto.constructor :
      proto.hasOwnProperty('new')         ? proto['new'] :
      function () {
        if (!(this instanceof proto.constructor) ||
            this instanceof Array && !this.hasOwnProperty('length') ||
            this instanceof Error && !this.hasOwnProperty('message'))
          return create.apply(proto.constructor, arguments);

        if (_super !== Object && _super !== Array && _super !== Error)
          _super.apply(this, arguments); });

    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');

    function super_(ctor) { setValue(this, 'constructor', ctor); }
    if (_super !== Object) super_.prototype = _super.prototype;
    proto = ctor.prototype = copy(new super_(ctor), {'new':0, statics:0}, proto);
    setProto && _super !== Object && setProto(ctor, _super);
    return copy(ctor, {name:0}, statics, _super !== Object ? _super : null,
        {create:create, extend:extend});
  }

  var SuperClass = extend('SuperClass');
  y('SuperClass', 'su', SuperClass);
  $pr('***************************************');

  var Base = SuperClass.extend('Base', {
    constructor: function () {
      if (!(this instanceof Base)) return new Base();
    },
    method1: function () {
      $pr('method1 Base');
    },
    statics: {
      staticMethod1: function () {
        $pr('staticMethod1 Base');
      }
    }
  });
  y('Base', 'b', Base);

  $pr('***************************************');

  if (!Base.extend) return;

  var SubClass = Base.extend('SubClass', {
    method2: function () {
      $pr('method2 SubClass');
    },
    statics: {
      staticMethod2: function () {
        $pr('staticMethod2 SubClass');
      }
    }
  });
  y('SubClass', 'sc', SubClass);

  $pr('***************************************');

  var SubKlass = Base.extend('SubKlass', {
    constructor: function () {
      if (!(this instanceof SubKlass)) return new SubKlass();
      Base.call(this);
    },
    method2: function () {
      $pr('method2 SubKlass');
    },
    statics: {
      staticMethod2: function () {
        $pr('staticMethod2 SubKlass');
      }
    }
  });
  y('SubKlass', 'sk', SubKlass);

  function y(nm, nm2, clz) {
    $pr(nm + '.name =', clz.name);

    clz.staticMethod1 &&
    $pr(nm + '.staticMethod1.name =', clz.staticMethod1.name);
    clz.staticMethod2 &&
    $pr(nm + '.staticMethod2.name =', clz.staticMethod2.name);

    clz.staticMethod1 &&
    clz.staticMethod1();
    clz.staticMethod2 &&
    clz.staticMethod2();

    x(nm2 + '1', new clz());
    x(nm2 + '2', clz());
    x(nm2 + '3', clz.create());
  }
  function x(nm, ob) {
    $pr(nm + '.constructor.name =', ob.constructor.name);

    ob.method1 &&
    $pr(nm + '.method1.name =', ob.method1.name);
    ob.method2 &&
    $pr(nm + '.method2.name =', ob.method2.name);

    ob.method1 &&
    ob.method1();
    ob.method2 &&
    ob.method2();
  }

  extend.extend = extend;

  if (typeof module === 'module' && module && module.exports)
    module.exports = extend;

  return extend;
}();
