// base-class-extend.js

// TODO support extend: proto.statics
// TODO support extend: mixins

this.BaseClass = function () {
  'use strict';

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
      function nameOfFunction() {
        return ('' + this).replace(fnameRegExp, '$1'); });

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

  // Base.create(...args) or Base.new(...args)
  var Base_create = setProto ?
  function Base_create() {
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
          return !/((base-class-extend.js)|(Base_create))/.test(str);
        }).join('\n');
      setProto(obj, this.prototype);
    }
    else
      var obj = Object.create(this.prototype);
    return this.apply(obj, arguments), obj;
  } :
  function Base_create() {
    if (typeof this !== 'function')
      return Object.apply(null, arguments);

    function __() {}
    __.prototype = this.prototype;
    var obj = new __();
    return this.apply(obj, arguments), obj;
  };

  // Base.addPrototype(proto)
  var Base_addPrototype = setProto ?
    function Base_addPrototype(proto) {
      setProto(proto, getProto(this));
      setProto(this, proto);
      return proto;
    } :
    function Base_addPrototype(proto) {
      for (var prop in proto)
        if (proto.hasOwnProperty(prop))
          this[prop] = proto[prop];
      return this;
    };

  // chainProto(obj, proto)
  function chainProto(obj, proto) {
    return Base_addPrototype.call(obj, proto);
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
  var Base_extend = setProto ? function Base_extend(name, proto, statics) {
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
          return Base_create.apply(proto.constructor, arguments);

        if (_super !== Object && _super !== Array && _super !== Error)
          _super.apply(this, arguments); };

    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');

    ctor.prototype = proto;
    ctor = namedFunc(name, ctor);

    // add name to methods/functions if not has name
    for (var prop in proto)
      if (typeof proto[prop] === 'function' && !proto[prop].name)
        setValue(proto, prop, namedFunc(prop, proto[prop]));

    // delete constructor
    delete proto.constructor;
    delete proto['new'];

    // override constructor
    setValue(proto, 'constructor', ctor);

    // inherits from super constructor
    setProto(proto, _super.prototype);

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
    if (ctor.extend !== Base_extend) setValue(ctor, 'extend', Base_extend);
    if (ctor.create !== Base_create) setValue(ctor, 'create', Base_create);
    if (ctor['new'] !== Base_create) setValue(ctor, 'new',    Base_create);

    if (proto['private']   !== Base_addPrototype) setValue(proto, 'private',      Base_addPrototype);
    if (proto.addPrototype !== Base_addPrototype) setValue(proto, 'addPrototype', Base_addPrototype);

    // constructor.super_ -> for points super class
    if (_super !== Object) {
      setConst(ctor, 'super_', _super);
      setConst(ctor, 'super', _super);
    }

    return ctor;
  } :
  function Base_extend(name, proto, statics) {
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
          return Base_create.apply(proto.constructor, arguments);

        if (_super !== Object && _super !== Array && _super !== Error)
          _super.apply(this, arguments); };

    ctor = namedFunc(name, ctor);

    function __(ctor) { setValue(this, 'constructor', ctor); }
    __.prototype = _super.prototype;
    ctor.prototype = new __(ctor);

    // delete constructor
    delete proto.constructor;
    delete proto['new'];

    for (var prop in proto)
      if (proto.hasOwnProperty(prop))
        setValue(ctor.prototype, prop, proto[prop]);

    proto = ctor.prototype;
    setValue(proto, 'constructor', ctor);

    // copy super class statics
    for (var prop in _super)
      if (prop !== 'name' && !ctor.hasOwnProperty(prop) &&
          _super.hasOwnProperty(prop))
        setValue(ctor, prop, _super[prop]);

    // copy static class statics
    if (statics)
      for (var prop in statics)
        if (statics.hasOwnProperty(prop))
          setValue(ctor, prop, statics[prop]);

    // add methods and class methods if not found (in prototype chain)
    if (ctor.extend !== Base_extend) setValue(ctor, 'extend', Base_extend);
    if (ctor.create !== Base_create) setValue(ctor, 'create', Base_create);
    if (ctor['new'] !== Base_create) setValue(ctor, 'new',    Base_create);

    if (ctor.prototype['private']   !== Base_addPrototype)
      setValue(ctor.prototype, 'private',      Base_addPrototype);
    if (ctor.prototype.addPrototype !== Base_addPrototype)
      setValue(ctor.prototype, 'addPrototype', Base_addPrototype);

    // constructor.super_ -> for points super class
    if (_super !== Object) {
      setConst(ctor, 'super_', _super);
      setConst(ctor, 'super', _super);
    }

    if (ctor.__proto__) ctor.__proto__ = _super;

    return ctor;
  }; // Base_extend

  // Base.extendPrototype([ctor = Function.prototype])
  function Base_extendPrototype(ctor) {
    if (typeof ctor !== 'function') ctor = Function.prototype;
    if (ctor.extend !== Base_extend) setValue(ctor, 'extend', Base_extend);
    return this;
  }

  // Base
  var Base = Base_extend('Base', {}, {extendPrototype: Base_extendPrototype});

  // exports
  if (typeof module === 'object' && module && module.exports)
    module.exports = Base;

  return Base;
}();
