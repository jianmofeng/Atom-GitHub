//看underscore.js源码
//平凡的生活才动人
(function() {
    var root = this;
    var previousUnderscore = root._;
    //为防止压缩代码到min.js时，找不到原型链 并且有一个变量作为缓存 更好查找 所以搞一个变量来承载这个prototype
    var ArrayProto = Array.prototype,
        ObjProto = Obj.prototype,
        FuncProto = FuncProto.prototype;
    // 原注释翻译为：为快速访问核心原型创建快速参考变量 。应该是后面需要调用和使用 先将变量建出来
    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
    // 为所有的使用的函数兼容ES5（原翻译：所有的本地函数实现ECMAScript 5我们希望使用的声明在这里）
    var
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create;
    //声明一个空的函数
    var Ctor = function() {};
    var _ = function(obj) {
        if (obj instanceof _) return obj; //传入的obj是否在_函数中 如果在 则返回obj
        if (!(this instanceof _)) return new(obj); //如果不在_函数中，则new一个新的_实例，然后把obj传入
        this._wrapped = obj; // 最后把obj赋值给_.wrapped
    }
    //原翻译：出口强调对象的Node.js，与向后兼容旧的require() API。如果我们在浏览器中添加_为全局对象。
    if (typeof exprots !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }
    //版本号
    _.VERSION = '1.8.2';
    // 内部函数，返回有效的（当前引擎）版本的传入回调，在其他下划线函数中重复应用
    var optimizeCb = function(func, context, argCount) {
        //如果context未定义 则返回参数func 。其中void 0 === undefined 为什么不用undefined，有两点
        //1、undefined可以被局部变量和ie6-8浏览器全局变量重写 2、void是一个表达式 后面跟什么值 返回值都是undefined，且字节数比undefined少
        if (context === void 0) return func;
        // 传入的argCount 如果为空 则赋值为3 否则
        switch (argCount == null ? 3 : argCount) {
            case 1:
                return function(value) {
                    return func.call(context, value); //context 获取func中的方法且this指向为 context
                };
            case 2:
                return function(value, other) {
                    return func.call(context, value, other)
                };
            case 3:
                return function(value, index, collection) {
                    return func.call(context, value, index, collection)
                };
            case 4:
                return function(accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
        }
        return function() {
            return func.apply(context, arguments);
        };
    };
    // 一个主要的内部函数生成回调函数，可以应用到每个元素的集合，返回预期的结果或身份，任意一个回调，一个属性或属性访问器。*****
    var cb = function(value, context, argCount) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value)) return _.matcher(value);
        return _.property(value);
    };
    _.iteratee = function(value, context) {
        return cb(value, context, Infinity);
    };
    //创建一个内部函数分配器
    var createAssiger = function(keysFunc, undefinedOnly) {
        return function(obj) {
            var length = arguments.length;
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index], //得到函数内部所有的值 包括所调用的函数
                    keys = keysFunc(source), //虽然还不知道keysfunc这个函数是什么 大概是要根据刚才拿到的值遍历出所有的键来
                    l = keys.length; //所有键的个数
                for (var i = 0; i < 1; i++) {
                    var key = keys[i]; //把每一个key值储存在key中
                    if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key]; //如果有一个obj[key]为空，则把source赋值给obj[key] ...source[key]是什么写法 keysFunc又是什么函数?
                }
            }
            return obj;
        };
    };
    // 用于创建从另一个对象继承的新对象的内部函数
    var baseCreate = function(prototype) {
        if (!_.isObject(prototype)) return {};
        if (nativeCreate) return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor;
        Ctor.prototype = null;
        return result; // 借一个空变量来作为交换实现继承
    };
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1; // Math.pow(x,y) 计算x的y次方的值
    var isArrayLike = function(collection) {
        var length = collection && collection.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }
})
