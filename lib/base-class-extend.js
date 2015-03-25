// base-class-extend.js

(function () {
  'use strict';

  // constructors
  function constructors(obj) {
    // supports: getter and normal function
    if (arguments.length === 0) obj = this;

    // convert to object from primitives
    if (obj != null && typeof obj !== 'object' && typeof obj !== 'function')
      obj = Object(obj);

    var classes = [];

    if (obj instanceof Function) {
      // for Class/constructor
      for (; obj; obj = getProto(obj))
        if (typeof obj === 'function')
          classes.push(obj);
    }
    else {
      // for instance/object
      for (; obj; obj = getProto(obj))
        if (obj.hasOwnProperty('constructor'))
          classes.push(obj.constructor);
    }

    return classes;
  }

  // setConst(obj, prop, val)
  var setConst = Object.defineProperty ?
    function setConst(obj, prop, val) {
      Object.defineProperty(obj, prop, {value: val}); } :
    function setConst(obj, prop, val) { obj[prop] = val; };

  // setValue(obj, prop, val)
  var setValue = Object.defineProperty ?
    function setValue(obj, prop, val) {
      Object.defineProperty(obj, prop, {value: val,
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

  // BaseClass.extend
  // Usage:
  //    var SimpleClass =
  //        BaseClass.extend(
  //          {new: function SimpleClass() {
  //                  SimpleClass.super_.call(this);
  //                  this.prop1 = 'val'; },
  //           method1: function method1() {},
  //           get prop1() { return this._prop1; },
  //           set prop1(val) { this._prop1 = val; }},
  //          {classMethod1: function () {}});
  function BaseClass_extend(name, proto, classProps) {
    // check argument: name
    if (typeof name !== 'string') {
      classProps = proto;
      proto = name;
      name = '';
    }

    if (!proto || typeof proto !== 'object') proto = {};
    var superCtor = typeof this === 'function' ? this : Object;

    var ctor = proto.hasOwnProperty('constructor') ? proto.constructor :
               proto.hasOwnProperty('ctor')        ? proto.ctor :
               proto.hasOwnProperty('new')         ? proto.new :
      Function('proto, superCtor, BaseClass_create',
        'return function ' + name + '() {\n' +
        '  "use strict";' +
        '  if (!(this instanceof proto.constructor) ||\n' +
        '      this instanceof Array && !this.hasOwnProperty("length") ||\n' +
        '      this instanceof Error && !this.hasOwnProperty("message"))\n' +
        '    return BaseClass_create.apply(proto.constructor, arguments);\n' +
        '  if (superCtor !== Object && superCtor !== Array && superCtor !== Error)\n' +
        '    superCtor.apply(this, arguments); }')
        (proto, superCtor, BaseClass_create);
    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');
    if (!ctor.name && name !== '') {
      ctor.prototype = proto;
      ctor = Function('proto, ctor, BaseClass_create',
        'return function ' + name + '() {\n' +
        '  "use strict";' +
        '  if (!(this instanceof proto.constructor) ||\n' +
        '      this instanceof Array && !this.hasOwnProperty("length") ||\n' +
        '      this instanceof Error && !this.hasOwnProperty("message"))\n' +
        '    return BaseClass_create.apply(proto.constructor, arguments);\n' +
        '  ctor.apply(this, arguments); }')
        (proto, ctor, BaseClass_create);
    }
    ctor.prototype = proto;

    // override constructor
    delete proto.ctor;
    delete proto.new;
    setValue(proto, 'constructor', ctor);

    // inherits from super constructor
    setProto(proto, superCtor.prototype);

    // constructor.__proto__ -> for inherits class methods
    if (classProps == null || typeof classProps !== 'object') {
      setProto(ctor, superCtor);
    }
    else {
      setProto(ctor, classProps);
      setProto(classProps, superCtor);

      // class initializer: init
      var init = classProps.hasOwnProperty('init') && classProps.init;
      delete classProps.init;
      if (typeof init === 'function') init.call(ctor);

      // add name to methods/functions if not found
      var keys = Object.keys(classProps);
      for (var i = 0, n = keys.length; i < n; ++i) {
        var key = keys[i];
        if (typeof classProps[key] === 'function' &&
            !classProps[key].name) {
          classProps[key] = Function('fn',
            'return function ' + key + '_() {\n' +
            '  return fn.apply(this, arguments); }')
            (classProps[key]);
        }
      }
    }

    // add methods and class methods if not found (in prototype chain)
    if (ctor.extend !== BaseClass_extend) ctor.extend = BaseClass_extend;
    if (ctor.create !== BaseClass_create) ctor.create = BaseClass_create;
    if (ctor.new    !== BaseClass_create) ctor.new    = BaseClass_create;

    if (!('constructors' in ctor))
      Object.defineProperty(ctor, 'constructors',
        {get: constructors, configurable: true});

    if (!('private' in proto)) proto.private = BaseClass_private;

    if (!('constructors' in proto))
      Object.defineProperty(proto, 'constructors',
        {get: constructors, configurable: true});

    // constructor.super_ -> for points super class
    setConst(ctor, 'super_', superCtor);
    setConst(ctor, 'super', superCtor);

    return ctor;
  }

  // BaseClass.new or BaseClass.create
  function BaseClass_create() {
    if (this.prototype instanceof Array) {
      var obj = Array.apply(null, arguments); // [] or new Array
      setProto(obj, this.prototype);
    }
    else if (this.prototype instanceof Error) {
      var obj = Error.apply(null, arguments); // new Error
      if (!obj.hasOwnProperty('message') &&
          typeof arguments[0] === 'string')
        obj.message = arguments[0];
      if (typeof obj.stack === 'string')
        obj.stack = obj.stack.split('\n').filter(function (str) {
          return !/((base-class.js)|(BaseClass_create))/.test(str);
        }).join('\n');
      setProto(obj, this.prototype);
    }
    else
      var obj = Object.create(this.prototype);
    return this.apply(obj, arguments), obj;
  }

  function assert(bool, msg) {
    if (!bool) throw new Error(msg);
  }

  // BaseClass_private
  function BaseClass_private(proto) {
    setProto(proto, getProto(this));
    setProto(this, proto);
    return proto;
  }

  var BaseClass = BaseClass_extend('BaseClass',
                    {private: BaseClass_private,
                     get constructors() { return constructors.call(this); }},
                    {extend:  BaseClass_extend,
                     create:  BaseClass_create,
                     new:     BaseClass_create,
                     get constructors() { return constructors.call(this); }});


  // exports
  if (typeof module !== 'undefined') {
    module.exports = exports = BaseClass;
  }
  else {
    var g = Function('return this')();
    g.BaseClass = BaseClass;
  }

})();
