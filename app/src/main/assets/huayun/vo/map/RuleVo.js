//>>built
define("com/huayun/vo/map/RuleVo",["../../util/JSONFormatterUtil","./StyleVo","./LabelVo"],function(_1,_2,_3){function _4(_5,_6){this.styles=_6;this.isFixed=(_5.fixedSize===undefined||_5.fixedSize==="")?true:_1.formatterKey(_5.fixedSize).isFixed.toString()==="true";this.type=_5.type;this.addratio=_5.fixedSize===undefined?0:Number(_1.formatterKey(_5.fixedSize).addratio);this.minScale=_5.minScale?1/Number(_5.minScale):-Infinity;this.maxScale=_5.maxScale?1/Number(_5.maxScale):Infinity;this.propertyName=_5.styleGroup&&_1.formatterKey(_5.styleGroup).propertyName;if(_5.hasOwnProperty("label")){this.label=new _3(_5.label,this.type,_6);}this.styles=this.parseStyle(_5.style||_5.styleGroup&&_5.styleGroup.style);};_4.prototype.parseStyle=function(_7){if(Array.isArray(_7)){var _8=[];for(var i=0;i<_7.length;i++){var _9=_1.formatterKey(_7[i]);_9.type=this.type;_8.push(new _2(_9,this.styles));}return _8;}else{_7.type=this.type;_7.propertyValue="";return [new _2(_7,this.styles)];}};return _4;});