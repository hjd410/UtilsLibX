//>>built
define("com/huayun/webgis/layers/support/style/createStyleLayer",["./BackgroundStyleLayer","./FillStyleLayer","./LineStyleLayer","./SymbolStyleLayer","./FillExtrusionStyleLayer"],function(_1,_2,_3,_4,_5){function _6(_7){switch(_7.type){case "fill":return new _2(_7);case "line":return new _3(_7);case "symbol":return new _4(_7);case "background":return new _1(_7);case "fill-extrusion":return new _5(_7);}};return _6;});