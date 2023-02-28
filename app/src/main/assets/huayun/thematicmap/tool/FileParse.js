//>>built
define("com/huayun/thematicmap/tool/FileParse",["dojo/Deferred","dojo/request","dojo/promise/all","../../util/JSONFormatterUtil","../../vo/DataSourceVo","../../vo/DiagramVo"],function(_1,_2,_3,_4,_5,_6){function _7(){this.root="";this.mapXml="";this.styles=[];this.x2js=new X2JS();};_7.prototype.getAll=function(_8,_9,_a){var _b=[];this.root=_8.root;this.styles=_8.styles;this.mapXml=_8.map;_b.push(this._baseStyleRequest.call(this));_b.push(this._dataSourceRequest.call(this));_b.push(this._mapRequest.call(this));this._stylesRequest(_b);_3(_b).then(function(_c){var _d=_c[0].data;var _e=_c[1].data;var _f=_c[2].data;var _10=_c.slice(3,_c.length);for(var i=0;i<_10.length;i++){var _11=_10[i].data;for(var j=0;j<_11.length;j++){if(!_11[j]){continue;}var _12=_11[j].symbols;if(!_12){continue;}for(var k=0;k<_12.length;k++){var _13=_12[k];_4.merge(_d,_13);}}}_10=this._concatStyles(_10);_9({dataSourceVo:new _5(_e),diagramVo:new _6(_f,_10)});}.bind(this));};_7.prototype._baseStyleRequest=function(){var _14=new _1();_2(this.root+"baseStyle.xml").then.call(this,function(_15){var _16=this.x2js.xml_str2json(_15).style;var _17=[];for(var key in _16){if(_16.hasOwnProperty(key)){_17[_17.length]=_4.formatterKey(_16[key]);}}_14.resolve({data:_17,type:"baseStyle"});}.bind(this));return _14.promise;};_7.prototype._dataSourceRequest=function(){var _18=new _1();_2(this.root+"data/dataSource.xml").then.call(this,function(_19){var _1a=[];var _1b=this.x2js.xml_str2json(_19).cat.dataSources.dataSource;if(Array.isArray(_1b)){_1a=_1b;}else{_1a.push(_1b);}_18.resolve({data:_1a,type:"dataSource"});}.bind(this));return _18.promise;};_7.prototype._mapRequest=function(){var _1c=new _1();_2(this.root+"maps/"+this.mapXml).then.call(this,function(_1d){var _1e=this.x2js.xml_str2json(_1d).root;_1c.resolve({data:_1e,type:"map"});}.bind(this));return _1c.promise;};_7.prototype._stylesRequest=function(_1f){for(var i=0;i<this.styles.length;i++){var _20=function(i){var _21=new _1();var _22=this.styles[i];_2(this.root+"style/"+_22).then(function(_23){var reg=/(\w+)\.(xml)$/;if(reg.test(_22)){var _24=RegExp.$1;var _25=this.x2js.xml_str2json(_23).styles;var _26=[];for(var key in _25){if(_25.hasOwnProperty(key)){var _27=_25[key].style;if(typeof _27!=="undefined"){this._formatterOneTypeStyle(_27,_26,key);}}}_21.resolve({data:_26,type:"style",name:_24});}else{}}.bind(this));return _21.promise;}.call(this,i);_1f.push(_20);}};_7.prototype._formatterOneTypeStyle=function(_28,_29,key){if(Array.isArray(_28)){for(var _2a in _28){if(_28.hasOwnProperty(_2a)){var _2b=_28[_2a];_2b.type=key;_29.push(this._formatterOneStyle(_2b));}}}else{_29.push(this._formatterOneStyle(_28));}};_7.prototype._formatterOneStyle=function(_2c){if(!_2c){return;}var _2d=Object.keys(_2c);var _2e={"symbols":[]};for(var i=0;i<_2d.length;i++){var key=_2d[i];var _2f=_2c[key];if(Object.prototype.toString.call(_2f)==="[object String]"){var _30=Object.keys(_4.formatterKey(_2c));for(var _31 in _30){if(_30.hasOwnProperty(_31)){var _32=_30[_31];_2e[_32]=_4.formatterKey(_2c)[_32];}}}else{if(Object.prototype.toString.call(_2f)==="[object Array]"){var _33=[];for(var j=0;j<_2f.length;j++){var _34=_2f[j];_33[j]=_4.formatterKey(_34);}_2e["symbols"]=_33;}else{if(Object.prototype.toString.call(_2f)==="[object Object]"){_2e["symbols"].push(_4.formatterKey(_2f));}}}}return _2e;};_7.prototype._concatStyles=function(_35){var _36=[];for(var i=0;i<_35.length;i++){var _37=_35[i];var _38=_37.name;for(var j=0,len=_37.data.length;j<len;j++){var _39=_37.data[j];_39.id=_38+"."+_39.id;var _3a=_39.symbols;if(_3a&&_3a.length>0){for(var k=0;k<_3a.length;k++){var _3b=_3a[k];if(_3b.hasOwnProperty("marker")){if(_3b.marker.split(".").length===1){_3b.marker=_38+"."+_3b.marker;}}if(_3b.hasOwnProperty("outline")){if(_3b.outline.split(".").length===1){_3b.outline=_38+"."+_3b.outline;}}}}_36[_36.length]=_39;}}return _36;};return _7;});