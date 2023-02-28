//>>built
define("com/huayun/webgis/symbols/CompositeMarkSymbol",["./Symbol","./CircleSymbol","./TwoCoiltransformerSymbol","./ThreeCoiltransformerSymbol","./AutotransformerSymbol","./FontSymbol","./RectSymbol"],function(_1,_2,_3,_4,_5,_6,_7){function _8(_9){_1.call(this,_9);this.type="compositeMark";this.angle=0;this.offsetX=0;this.offsetY=0;this.symbols=[];this.parseSymbol(_9.symbol);if(_9.size){this.size=Number(_9.size);}if(_9.rotation){if(!this.props){this.props={};}this.props.rotation=_9.rotation;}if(_9.scaleFactor){if(!this.props){this.props={};}this.props.scaleFactor=_9.scaleFactor;}};if(_1){_8.__proto__=_1;}_8.prototype=Object.create(_1&&_1.prototype);_8.prototype.constructor=_8;_8.prototype.parseSymbol=function(_a){for(var i=_a.length-1;i>-1;i--){var _b=_a[i];_b.isFixed=this.isFixed;_b.minScale=this.minScale;_b.maxScale=this.maxScale;var _c=_b["baseid"];this.pushSymbols(_c,_b);}};_8.prototype.pushSymbols=function(_d,_e){switch(_d){case "p_simplemarker_style":break;case "p_circle_style":this.symbols.push(new _2(_e));break;case "p_font_style":this.symbols.push(new _6(_e));break;case "p_twocoiltransformer_style":this.symbols.push(new _3(_e));break;case "p_threecoiltransformer_style":this.symbols.push(new _4(_e));break;case "t_text_style":this.symbols.push(new TextSymbol(_e));break;case "p_autotransformer_style":this.symbols.push(new _5(_e));break;case "p_rectangle_style":this.symbols.push(new _7(_e));break;default:break;}};_8.prototype.clone=function(){var _f=new _8();_f.type="compositeMark";_f.angle=this.angle;_f.offsetX=this.offsetX;_f.offsetY=this.offsetY;_f.symbols=[];if(this.size){_f.size=this.size;}if(this.props.rotation){if(!_f.props){_f.props={};}_f.props.rotation=this.props.rotation;}if(this.props.scaleFactor){if(!_f.props){_f.props={};}_f.props.scaleFactor=this.props.scaleFactor;}if(this.symbols.length>0){this.symbols.forEach(function(_10){var _11=_10.clone();_f.symbols.push(_11);});}return _f;};return _8;});