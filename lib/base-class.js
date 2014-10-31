// base-class.js

(function () {
  'use strict';

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
  //          {constructor: function SimpleClass() {}},
  //          {classMethod: function () {}});
  function BaseClass_extend(name, proto, classProps) {
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
      Function('proto, superCtor, BaseClass_new',
        'return function ' + name + '() {\n' +
        '  "use strict";' +
        '  if (!(this instanceof proto.constructor) ||\n' +
        '      this instanceof Array && !this.hasOwnProperty("length") ||\n' +
        '      this instanceof Error && !this.hasOwnProperty("message"))\n' +
        '    return BaseClass_new.apply(proto.constructor, arguments);\n' +
        '  if (superCtor !== Object && superCtor !== Array && superCtor !== Error)\n' +
        '    superCtor.apply(this, arguments);\n' +
        '  return this; }')
        (proto, superCtor, BaseClass_new);
    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');
    if (!ctor.name && name !== '$NoName$') {
      ctor.prototype = proto;
      ctor = Function('proto, ctor, BaseClass_new',
        'return function ' + name + '() {\n' +
        '  "use strict";' +
        '  if (!(this instanceof proto.constructor) ||\n' +
        '      this instanceof Array && !this.hasOwnProperty("length") ||\n' +
        '      this instanceof Error && !this.hasOwnProperty("message"))\n' +
        '    return BaseClass_new.apply(proto.constructor, arguments);\n' +
        '  return ctor.apply(this, arguments), this; }')
        (proto, ctor, BaseClass_new);
    }
    ctor.prototype = proto;

    delete proto.constructor;
    delete proto.new;
    setValue(proto, 'constructor', ctor);
    setValue(proto, 'new', ctor);

    // inherits
    setProto(proto, superCtor.prototype);

    // constructor.__proto__ -> for inherits class methods
    if (classProps == null || typeof classProps !== 'object') {
      setProto(ctor, superCtor);
    }
    else {
      setProto(ctor, classProps);
      setProto(classProps, superCtor);

      // class initializer: initialize
      var init = classProps.hasOwnProperty('initialize') && classProps.initialize;
      delete classProps.initialize;
      if (typeof init === 'function') init.call(ctor);

      // class initializer: init
      var init = classProps.hasOwnProperty('init') && classProps.init;
      delete classProps.init;
      if (typeof init === 'function') init.call(ctor);

      var keys = Object.keys(classProps);
      for (var i = 0, n = keys.length; i < n; ++i) {
        var key = keys[i];
        if (typeof classProps[key] === 'function' && 
            !classProps[key].name) {
          classProps[key] = Function('fn, superCtor',
            'return function ' + key + '_() {\n' +
            '  return fn.apply(this, arguments); }')
            (classProps[key], superCtor);
        }
      }
    }

    if (!('extend' in ctor)) ctor.extend = BaseClass_extend;
    if (!('new'    in ctor)) ctor.new    = BaseClass_new;

    // constructor.super_ -> for points super class
    setConst(ctor, 'super_', superCtor);

    return ctor;
  }

  // BaseClass.new
  function BaseClass_new() {
    //assert(this === this.prototype.constructor,
    //  'prototype of class/constructor is not class/constructor');
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
          return !/((base-class.js)|(BaseClass_new))/.test(str);
        }).join('\n');
      setProto(obj, this.prototype);
    }
    else
      var obj = Object.create(this.prototype);
    //assert(obj.constructor === this, 'new object is not instance of class (constructor)');
    return this.apply(obj, arguments), obj;
    //var res = this.apply(obj, arguments) || obj;
    //assert(res.constructor === this, 'constructor returns other class object');
    //assert(res === obj, 'constructor returns other object');
    //return obj;
  }

  function assert(bool, msg) {
    if (!bool) throw new Error(msg);
  }

  // BaseClass_private
  function BaseClass_private(proto) {
    var old = getProto(this);
    setProto(this, proto);
    setProto(proto, old);
  }

  var BaseClass = BaseClass_extend('BaseClass',
                    {private: BaseClass_private},
                    {extend:  BaseClass_extend,
                     new:     BaseClass_new});


  // exports
  if (typeof module !== 'undefined') {
    module.exports = exports = BaseClass;
  }
  else {
    var g = Function('return this')();
    g.BaseClass = BaseClass;
  }

})();
