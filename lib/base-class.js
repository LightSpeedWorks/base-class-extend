// base-class.js

(function () {
  'use strict';

  // setConst(obj, prop, val)
  var setConst = typeof Object.defineProperty === 'function' ?
    function setConst(obj, prop, val) {
      Object.defineProperty(obj, prop, {value: val});
    } :
    function setConst(obj, prop, val) {
      obj[prop] = val;
    };

  // setValue(obj, prop, val)
  var setValue = typeof Object.defineProperty === 'function' ?
    function setValue(obj, prop, val) {
      Object.defineProperty(obj, prop, {value: val,
        writable: true, configurable: true});
    } :
    function setValue(obj, prop, val) {
      obj[prop] = val;
    };

  // setProto(obj, proto)
  var setProto = typeof Object.setPrototypeOf === 'function' ?
    Object.setPrototypeOf :
    function setProto(obj, proto) {
      obj.__proto__ = proto;
    };

  // extend
  // Usage:
  //    var SimpleClass =
  //        BaseClass.extend(
  //          {constructor: function SimpleClass() {}},
  //          {classMethod: function () {}});
  function extend(name, proto, classProps) {
    if (typeof name !== 'string') {
      classProps = proto;
      proto = name;
      name = '$NoName$';
    }

    var super_ = this;
    if (typeof super_ !== 'function')
      super_ = Object;

    if (!proto) proto = {};

    var ctor = proto.hasOwnProperty('new')         && proto.new ||
               proto.hasOwnProperty('constructor') && proto.constructor ||
               Function('proto, super_, new_',
        'return function ' + name + '() {\n' +
        '  if (!(this instanceof proto.constructor)) \n' +
        '    return new_.apply(proto.constructor, arguments) \n' +
        '  return super_.apply(this, arguments) || this;\n' +
        '}'
        )(proto, super_, new_);
    if (typeof ctor !== 'function')
      throw new TypeError('constructor must be a function');
    if (!ctor.name && name !== '$NoName$') {
      ctor = Function('proto, ctor, new_',
        'return function ' + name + '() {\n' +
        '  if (!(this instanceof proto.constructor)) \n' +
        '    return new_.apply(proto.constructor, arguments) \n' +
        '  return ctor.apply(this, arguments) || this;\n' +
        '}'
      )(proto, ctor, new_);
    }
    delete proto.constructor;
    delete proto.new;
    setValue(proto, 'constructor', ctor);
    setValue(proto, 'new', ctor);
    ctor.prototype = proto;

    // inherits
    setProto(proto, super_.prototype);

    // inherits class methods
    if (classProps == null || typeof classProps !== 'object') {
      // constructor.__proto__ -> for inherits class methods
      setProto(ctor, super_);
    }
    else {
      // constructor.__proto__ -> for inherits class methods
      setProto(ctor, classProps);
      setProto(classProps, super_);

      // class initializer
      var init = classProps.hasOwnProperty('initialize') && classProps.initialize;
      delete classProps.initialize;
      if (typeof init === 'function') init.call(ctor);

      // class initializer
      var init = classProps.hasOwnProperty('init') && classProps.init;
      delete classProps.init;
      if (typeof init === 'function') init.call(ctor);

      var keys = Object.keys(classProps);
      for (var i = 0, n = keys.length; i < n; ++i) {
        var key = keys[i];
        if (typeof classProps[key] === 'function' && 
            !classProps[key].name) {
          classProps[key] = Function('fn, super_',
            'return function ' + key + '_() {\n' +
            '  return fn.apply(this, arguments); }')
            (classProps[key], super_);
        }
      }
    }

    // constructor.super_ -> for points super class
    setConst(ctor, 'super_', super_);

    return ctor;
  }

  function new_() {
    var obj = Object.create(this.prototype);
    return this.apply(obj, arguments) || obj;
  }

  var BaseClass = extend(
    {new: function BaseClass() {}},
    {extend: extend, new: new_});


  // exports
  if (typeof module !== 'undefined') {
    module.exports = exports = BaseClass;
  }
  else {
    var g = Function('return this');
    g.BaseClass = BaseClass;
  }

})();