//>>built
define("com/huayun/webgis/utils/DictionaryCoder",[],function(){var _1=function _1(_2){this._stringToNumber={};this._numberToString=[];for(var i=0;i<_2.length;i++){var _3=_2[i];this._stringToNumber[_3]=i;this._numberToString[i]=_3;}};_1.prototype.encode=function encode(_4){return this._stringToNumber[_4];};_1.prototype.decode=function decode(n){return this._numberToString[n];};return _1;});