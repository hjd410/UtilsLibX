define("com/huayun/webgis/utils/extendClazz", [], function () {
    function extendClazz(clazz, parent) {
        if (parent) clazz.__proto__ = parent;
        clazz.prototype = Object.create(parent && parent.prototype);
        clazz.prototype.constructor = clazz;
    }

    return extendClazz;
})