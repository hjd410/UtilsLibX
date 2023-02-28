define("com/huayun/webgis/layers/support/expression/types", ["exports"], function (exports) {
    var NullType = {kind: 'null'};
    var NumberType = {kind: 'number'};
    var StringType = {kind: 'string'};
    var BooleanType = {kind: 'boolean'};
    var ColorType = {kind: 'color'};
    var ObjectType = {kind: 'object'};
    var ValueType = {kind: 'value'};
    var ErrorType = {kind: 'error'};
    var CollatorType = {kind: 'collator'};
    var FormattedType = {kind: 'formatted'};

    exports.NullType = NullType;
    exports.NumberType = NumberType;
    exports.StringType = StringType;
    exports.BooleanType = BooleanType;
    exports.ColorType = ColorType;
    exports.ObjectType = ObjectType;
    exports.ValueType = ValueType;
    exports.ErrorType = ErrorType;
    exports.CollatorType = CollatorType;
    exports.FormattedType = FormattedType;

})