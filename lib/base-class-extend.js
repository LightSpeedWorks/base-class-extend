// base-class-extend.js

(function () {
  'use strict';

  // defProp
  var defProp = function (obj) {
    if (!Object.defineProperty) return undefined;
    try {
      Object.defineProperty(obj, 'prop', {value: 'value'});
      return obj.prop === 'value' ? Object.defineProperty : undefined;
    } catch (err) { return undefined; }
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

  // setProto(obj, proto)
  var setProto = Object.setPrototypeOf ? Object.setPrototypeOf :
    function setProto(obj, proto) { obj.__proto__ = proto; };

  // getProto(obj)
  var getProto = Object.getPrototypeOf ? Object.getPrototypeOf :
    function getProto(obj) { return obj.__proto__; };

  // fnameRegExp: function name regular expression
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

  // namedFunc(name, fn)
  function namedFunc(name, fn) {
    if (!name || fn.name === name) return fn;
    try {
      var func = Function('fn', 'return function ' + name + '() {' +
        'return fn.apply(this, arguments); }')(fn);
    } catch (err) {
      try {
        var func = Function('fn', 'return function ' + name + '_() {' +
          'return fn.apply(this, arguments); }')(fn);
      } catch (err) {
        return fn;
      }
    }
    func.prototype = fn.prototype;
    return func;
  }

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
  function Base_extend(name, proto, props) {
    // check argument: name
    if (typeof name !== 'string') {
      props = proto;
      proto = name;
      name = '';
    }

    if (!proto || typeof proto !== 'object') proto = {};
    var superCtor = typeof this === 'function' ? this : Object;

    var ctor = proto.hasOwnProperty('constructor') ? proto.constructor :
               proto.hasOwnProperty('new')         ? proto['new'] :
      function() {
        if (!(this instanceof proto.constructor) ||
            this instanceof Array && !this.hasOwnProperty('length') ||
            this instanceof Error && !this.hasOwnProperty('message'))
          return Base_create.apply(proto.constructor, arguments);
        if (superCtor !== Object && superCtor !== Array && superCtor !== Error)
          superCtor.apply(this, arguments); };
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
    setProto(proto, superCtor.prototype);

    // constructor.__proto__ -> for inherits class methods
    if (props == null || typeof props !== 'object') {
      setProto(ctor, superCtor === Object ? Function.prototype : superCtor);
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
      setProto(props, superCtor === Object ? Function.prototype : superCtor);
    }

    // add methods and class methods if not found (in prototype chain)
    if (ctor.extend !== Base_extend) ctor.extend = Base_extend;
    if (ctor.create !== Base_create) ctor.create = Base_create;
    if (ctor['new'] !== Base_create) ctor['new'] = Base_create;

    if (!('private'      in proto)) proto['private']      = Base_addPrototype;
    if (!('addPrototype' in proto)) proto['addPrototype'] = Base_addPrototype;

    // constructor.super_ -> for points super class
    setConst(ctor, 'super_', superCtor);
    setConst(ctor, 'super', superCtor);

    return ctor;
  }

  // Base.new(...args) or Base.create(...args)
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
          return !/((base-class.js)|(Base_create))/.test(str);
        }).join('\n');
      setProto(obj, this.prototype);
    }
    else
      var obj = Object.create(this.prototype);
    return this.apply(obj, arguments), obj;
  }

  // Base.addPrototype(proto)
  function Base_addPrototype(proto) {
    setProto(proto, getProto(this));
    setProto(this, proto);
    return proto;
  }

  // Base.extendPrototype([ctor = Function])
  function Base_extendPrototype(ctor) {
    if (typeof ctor !== 'function') ctor = Function.prototype;
    ctor.extend = Base_extend;
    return this;
  }

  var Base = Base_extend('Base',
                    {'private':       Base_addPrototype,
                     addPrototype :   Base_addPrototype},
                    {extend:          Base_extend,
                     create:          Base_create,
                     'new':           Base_create,
                     extendPrototype: Base_extendPrototype});


  // exports
  if (typeof module !== 'undefined') {
    module.exports = exports = Base;
  }
  else {
    var g = Function('return this')();
    g.BaseClass = Base;
  }

})();
