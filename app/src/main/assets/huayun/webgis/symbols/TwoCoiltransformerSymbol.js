//>>built
define("com/huayun/webgis/symbols/TwoCoiltransformerSymbol",["./Symbol","./LineSymbol","./CircleSymbol"],function(_1,_2,_3){function _4(_5){this.type="twoCoiltransformer";this.subtype=_5.subtype;this.fillOne=_5["fill-one"]||"#FFF";this.fillTwo=_5["fill-two"]||"#FFF";this.stroke=_5.stroke||"#000";this.strokeWidth=Number(_5["stroke-width"]||1);this.scale=Number(_5.scale);this.hConnMode=_5["h-conn"]||_5["h-conn-mode"];this.lConnMode=_5["l-conn"]||_5["l-conn-mode"];this.tapSwitch=_5["tap-switch"]!=="false";this.onLoad=_5["on-load"]!=="false";this.symbols=[];this.symbols.push(new _2({width:3,color:this.stroke}));this.symbols.push(new _3({color:this.fillOne,radius:10,stroke:this.stroke,strokeWidth:this.strokeWidth}));this.symbols.push(new _3({color:this.fillTwo,radius:10,stroke:this.stroke,strokeWidth:this.strokeWidth}));this.symbols.push(new _3({color:this.stroke,radius:10,stroke:this.stroke,strokeWidth:0}));};if(_1){_4.__proto__=_1;}_4.prototype=Object.create(_1&&_1.prototype);_4.prototype.constructor=_4;return _4;});