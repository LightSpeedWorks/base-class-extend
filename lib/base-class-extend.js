// base-class-extend.js

this.BaseClass = function () {
  'use strict';

  // defProp
  var defProp = function (obj) {
    if (!Object.defineProperty) return null;
    try {
      Object.defineProperty(obj, 'prop', {value: 'value'});
      return obj.prop === 'value' ? Object.defineProperty : null;
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
    if (!name || fn.name === name) return fn;
    try {
      var func = Function('fn', 'return function ' + name + '() { ' +
        'return fn.apply(this, arguments); }')(fn);
    } catch (err) {
      try {
        var func = Function('fn', 'return function ' + name + '_() { ' +
          'return fn.apply(this, arguments); }')(fn);
      } catch (err) {
        return fn;
      }
    }
    func.prototype = fn.prototype;
    return func;
  }

  // Base.new(...args) or Base.create(...args)
  var Base_create = function Base_create() {
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
  };

  // Base.addPrototype(proto)
  var Base_addPrototype = setProto ?
    function Base_addPrototype(proto) {
      setProto(proto, getProto(this));
      setProto(this, proto);
      return proto;
    } :
    function Base_addPrototype(proto) {
      for (var p in proto)
        if (proto.hasOwnProperty(p))
          this[p] = proto[p];
      return this;
    };

  // chainProto(obj, proto)
  var chainProto = setProto ?
    function chainProto(obj, proto) {
      setProto(proto, getProto(obj));
      setProto(obj, proto);
      return obj;
    } :
    function chainProto(obj, proto) {
      for (var p in proto)
        if (proto.hasOwnProperty(p))
          obj[p] = proto[p];
      return obj;
    };

  // Base.extend([name], [proto], [props])
  // Usage:
  //    var SimpleClass =
  //        Base.extend(
  //          {new: function SimpleClass() {
  //                  SimpleClass.super_.call(this);
  //                  this.prop1 = 'val'; },
  //           method1: function method1() {},
  //           get prop1() { return this._prop1; },
  //           set prop1(val) { this._prop1 = val; }},
  //          {classMethod1: function () {}});
  var Base_extend = setProto ? function Base_extend(name, proto, props) {
    // check argument: name
    if (typeof name !== 'string')
      props = proto, proto = name, name = '';

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
    for (var key in proto)
      if (typeof proto[key] === 'function' && !proto[key].name)
        proto[key] = namedFunc(key, proto[key]);

    // delete constructor
    delete proto.constructor;
    delete proto['new'];

    // override constructor
    setValue(proto, 'constructor', ctor);

    // inherits from super constructor
    setProto(proto, _super.prototype);

    // constructor.__proto__ -> for inherits class methods
    if (props == null || typeof props !== 'object') {
      setProto(ctor, _super === Object ? Function.prototype : _super);
    }
    else {
      // class initializer: init
      var init = props.hasOwnProperty('init') && props.init;
      delete props.init;
      if (typeof init === 'function') init.call(ctor);

      // add name to methods/functions if not has name
      for (var key in props)
        if (typeof props[key] === 'function' && !props[key].name)
          props[key] = namedFunc(key, props[key]);

      setProto(ctor, props);
      setProto(props, _super === Object ? Function.prototype : _super);
    }

    // add methods and class methods if not found (in prototype chain)
    if (ctor.extend !== Base_extend) setValue(ctor, 'extend', Base_extend);
    if (ctor.create !== Base_create) setValue(ctor, 'create', Base_create);
    if (ctor['new'] !== Base_create) setValue(ctor, 'new',    Base_create);

    if (proto['private']   !== Base_addPrototype) setValue(proto, 'private',      Base_addPrototype);
    if (proto.addPrototype !== Base_addPrototype) setValue(proto, 'addPrototype', Base_addPrototype);

    // constructor.super_ -> for points super class
    setConst(ctor, 'super_', _super);
    setConst(ctor, 'super', _super);

    return ctor;
  } :
  function Base_extend(name, proto, props) {
    'use strict';

    // check argument: name
    if (typeof name !== 'string')
      props = proto, proto = name, name = '';

    if (!proto || typeof proto !== 'object') proto = {};
    var _super = typeof this === 'function' ? this : Object;

    var ctor = proto.hasOwnProperty('constructor') ? proto.constructor :
               proto.hasOwnProperty('new')         ? proto['new'] :
      function () { _super.apply(this, arguments); };

    function __() { this.constructor = ctor; }
    if (_super !== Object) {
      __.prototype = _super.prototype;
      ctor.prototype = new __();
    }
    ctor = namedFunc(name, ctor);

    // delete constructor
    delete proto.constructor;
    delete proto['new'];

    for (var p in proto)
      if (proto.hasOwnProperty(p))
        setValue(ctor.prototype, p, proto[p]);

    for (var p in _super)
      if (_super.hasOwnProperty(p))
        ctor[p] = _super[p];

    if (props)
      for (var p in props)
        if (props.hasOwnProperty(p))
          ctor[p] = props[p];

    // add methods and class methods if not found (in prototype chain)
    if (ctor.extend !== Base_extend) setValue(ctor, 'extend', Base_extend);
    if (ctor.create !== Base_create) setValue(ctor, 'create', Base_create);
    if (ctor['new'] !== Base_create) setValue(ctor, 'new',    Base_create);

    if (ctor.prototype['private']   !== Base_addPrototype)
      setValue(ctor.prototype, 'private',      Base_addPrototype);
    if (ctor.prototype.addPrototype !== Base_addPrototype)
      setValue(ctor.prototype, 'addPrototype', Base_addPrototype);

    // constructor.super_ -> for points super class
    setConst(ctor, 'super_', _super);
    setConst(ctor, 'super', _super);

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
