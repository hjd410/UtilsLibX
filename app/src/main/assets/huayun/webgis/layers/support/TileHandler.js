//>>built
define("com/huayun/webgis/layers/support/TileHandler",["exports","require"],function(_1,_2){var _3={};var _4=[];var w;var _5=[];for(var i=0;i<4;i++){w=new Worker(_2.toUrl("com/huayun/webgis/work/webworker.js"));w.onmessage=function(_6){var _7=_6.data,_8=_3[_7.url];if(_8){_8.data=_7;_8.load=true;if(_8.render){_5.forEach(function(_9){_9._renderWorker(_7);});}}};_4.push(w);}_1.getTile=function(_a){var _b=_3[_a];_b.render=true;if(_b.load){return _b;}};_1.removeTile=function(_c){delete _3[_c];};_1.requestTile=function(_d,_e,_f,row){if(!_3.hasOwnProperty(_d)){var _10=(_e+_f+row)%4;_10=_4[_10];_10.postMessage({type:"getTile",data:_d,level:_e,col:_f,row:row});_3[_d]={load:false,render:false};}};_1.getAll=function(){return _3;};_1.addView=function(_11){_5.push(_11);};_1.send=function(_12,_13){for(var i=0;i<4;i++){_4[i].postMessage({type:_12,data:JSON.stringify(_13.layerFamily)});}};});