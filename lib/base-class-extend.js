// base-class-extend.js

// TODO support extend: proto.statics
// TODO support extend: mixins

this.BaseClass = function ($debug) {
  'use strict';

  // $pr(msgs...)
  var $pr = $debug ?
  function $pr() {
    var msg = 'base-class-extend: ' + [].slice.call(arguments).join(' ');
    setTimeout(function () {
      if (typeof console !== 'undefined')
        console.log(msg);
      if (typeof document !== 'undefined')
        document.writeln(msg + '<br/>\n');
    }, 1000);
  } :
  function $pr() {
  };

  $pr('debug mode');

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
  var getProto = Object.getPrototypeOf ? Object.getPrototypeOf :
    Object.prototype.__proto__ ?
    function getProto(obj) { return obj.__proto__; } : null;

  // setProto(obj, proto)
  var setProto = Object.setPrototypeOf ? Object.setPrototypeOf :
    Object.prototype.__proto__ ?
    function setProto(obj, proto) { obj.__proto__ = proto; } : null;

  // defGetter
  var defGetter = defProp ?
    function defGetter(obj, prop, getter) {
      return defProp(obj, prop, {get: getter}); } :
    Object.prototype.__defineGetter__ ?
    function defGetter(obj, prop, getter) {
      return obj.__defineGetter__(prop, getter); } :
    function defGetter(obj, prop, getter) {};

  // fnameRegExp: function name regular expression
  var fnameRegExp = /^\s*function\s*\**\s*([^\(\s]*)[\S\s]+$/im;

  // Function.prototype.name
  if (!Function.prototype.hasOwnProperty('name'))
    defGetter(Function.prototype, 'name',
      function name() {
        return ('' + this).replace(fnameRegExp, '$1'); });

  // namedFunc(name, fn)
  function namedFunc(name, fn) {
    if (!name || !fn || typeof fn !== 'function' ||
        fn.hasOwnProperty('name') && fn.name) return fn;
    try { fn.name = name; if (fn.name === name) return fn; } catch (err) {}
    try { var fx = Function('fn', 'return function ' + name +
              '() { return fn.apply(this, arguments); }')(fn);
    } catch (err) {
      try { var fx = Function('fn', 'return function _' + name +
                '() { return fn.apply(this, arguments); }')(fn);
      } catch (err) { return fn; } }
    fx.prototype = fn.prototype;
    // if (fx.name === name || fx.name === '_' + name) return fx;
    // try { fx.name = name; } catch (err) {}
    return fx;
  }

  // names(name, fn)
  function names(name, fn) {
    try {
      if (fn.name !== name)
        fn.name = name;
    } catch (err) {}
  }

  // copy
  var copy = defProp ?
  function copy(base, excl) {
    for (var i = 2, n = arguments.length; i < n; ++i) {
      var from = arguments[i];
      if (from) {
        var props = Object.getOwnPropertyNames(from);
        for (var j = 0, m = props.length; j < m; ++j) {
          var prop = props[j];
          if (!base.hasOwnProperty(prop) &&
              !excl.hasOwnProperty(prop) &&
              base[prop] !== from[prop]) {
            setValue(base, prop, namedFunc(prop, from[prop]));
          }
        }
      }
    }
    return base;
  } :
  function copy(base, excl) {
    for (var i = 2, n = arguments.length; i < n; ++i) {
      var from = arguments[i];
      if (from)
        for (var prop in from)
          if (!base.hasOwnProperty(prop) &&
              !excl.hasOwnProperty(prop) &&
              base[prop] !== from[prop])
            setValue(base, prop, namedFunc(prop, from[prop]));
    }
    return base;
  }

  // Base.create(...args) or Base.new(...args)
  var create = setProto ?
  function create() {
    if (this.prototype instanceof Array) {
      var obj = Array.apply(null, arguments);
      setProto(obj, this.prototype);
    }
    else if (this.prototype instanceof Error) {
      var obj = Error.apply(null, arguments);
      if (!obj.hasOwnProperty('message') &&
          typeof arguments[0] === 'string')
        obj.message = arguments[0];
      if (typeof obj.stack === 'string')
        obj.stack = obj.stack.split('\n').filter(function (str) {
          return !/((base-class-extend.js)|(create))/.test(str);
        }).join('\n');
      setProto(obj, this.prototype);
    }
    else
      var obj = Object.create(this.prototype);
    return this.apply(obj, arguments), obj;
  } :
  Object.create ?
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
  names('create', create);

  // Base.addPrototype(proto)
  var addPrototype = setProto ?
    function addPrototype(proto) {
      setProto(proto, getProto(this));
      setProto(this, proto);
      return proto;
    } :
    function addPrototype(proto) {
      for (var prop in proto)
        if (proto.hasOwnProperty(prop))
          this[prop] = proto[prop];
      return this;
    };
  names('addPrototype', addPrototype);

  // chainProto(obj, proto)
  function chainProto(obj, proto) {
    return addPrototype.call(obj, proto);
  }

  // Base.extend([name], [proto], [statics])
  // Usage:
  //    var SimpleClass =
  //        Base.extend(
  //          {constructor: function SimpleClass() {
  //                  SimpleClass.super_.call(this);
  //                  this.prop1 = 'val'; },
  //           method1: function method1() {},
  //           get prop1() { return this._prop1; },
  //           set prop1(val) { this._prop1 = val; }},
  //          {classMethod1: function () {}});
  var extend = setProto ?
  function extend(name, proto, statics) {
    // check argument: name
    if (typeof name !== 'string')
      statics = proto, proto = name, name = '';

    // check argument: proto
    if (!proto || typeof proto !== 'object') proto = {};

    var _super = typeof this === 'function' ? this : Object;

    var ctor = proto.hasOwnProperty('constructor') ? proto.constructor :
               proto.hasOwnProperty('new')         ? proto['new'] :
      function () {
        if (!(this instanceof proto.constructor) ||
            this instanceof Array && !this.hasOwnProperty('length') ||
            this instanceof Error && !this.hasOwnProperty('message'))
          return create.apply(proto.constructor, arguments);

        if (_super !== Object && _super !== Array && _super !== Error)
          _super.apply(this, arguments); };

    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');

    ctor.prototype = proto;
    ctor = namedFunc(name, ctor);

    // add name to methods/functions if not has name
    //for (var prop in proto)
    //  if (typeof proto[prop] === 'function' && !proto[prop].name)
    //    setValue(proto, prop, namedFunc(prop, proto[prop]));
    copy(proto, {}, proto);

    // delete constructor
    delete proto.constructor;
    delete proto['new'];

    // override constructor
    setValue(proto, 'constructor', ctor);

    // inherits from super constructor
    setProto(proto, _super.prototype);

    if (_super !== Object) copy(ctor, {}, {super_:_super, 'super':_super});

    // constructor.__proto__ -> for inherits class methods
    if (statics == null || typeof statics !== 'object') {
      setProto(ctor, _super === Object ? Function.prototype : _super);
    }
    else {
      // class initializer: init
      var init = statics.hasOwnProperty('init') && statics.init;
      delete statics.init;
      if (typeof init === 'function') init.call(ctor);

      // add name to methods/functions if not has name
      for (var prop in statics)
        if (typeof statics[prop] === 'function' && !statics[prop].name)
          statics[prop] = namedFunc(prop, statics[prop]);

      setProto(ctor, statics);
      setProto(statics, _super === Object ? Function.prototype : _super);
    }

    // add methods and class methods if not found (in prototype chain)
    copy(ctor, {}, {extend:extend, create:create, 'new':create});

    copy(proto, {}, {addPrototype:addPrototype, 'private':addPrototype});

    // constructor.super_ -> for points super class
    //if (_super !== Object) copy(ctor, {}, {super_:_super, 'super':_super});

    return ctor;
  } :
  function extend(name, proto, statics) {
    // check argument: name
    if (typeof name !== 'string')
      statics = proto, proto = name, name = '';

    // check argument: proto
    if (!proto || typeof proto !== 'object') proto = {};

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

    function super_(ctor) { setValue(this, 'constructor', ctor); }
    if (_super !== Object) super_.prototype = _super.prototype;
    ctor.prototype = new super_(ctor);

    copy(ctor.prototype, {'new':0}, proto, {addPrototype:addPrototype, 'private':addPrototype});

    proto = ctor.prototype;

    if (ctor.__proto__) ctor.__proto__ = _super;

    // copy static class methods
    copy(ctor, {}, statics,
        {super_:_super, 'super':_super},
        _super !== Object ? _super : null,
        {extend:extend, create:create, 'new':create});

    // constructor.super_ -> for points super class
    //if (_super !== Object) copy(ctor, {}, {super_:_super, 'super':_super});

    return ctor;
  }; // extend
  names('extend', extend);

  // Base.extendPrototype([ctor = Function.prototype])
  function extendPrototype(ctor) {
    if (typeof ctor !== 'function') ctor = Function.prototype;
    if (ctor.extend !== extend) setValue(ctor, 'extend', extend);
    return this;
  }
  names('extendPrototype', extendPrototype);

  // Base
  var Base = extend('Base', {}, {extendPrototype: extendPrototype});

  // exports
  if (typeof module === 'object' && module && module.exports)
    module.exports = Base;

  return Base;

}(this.$debug);
