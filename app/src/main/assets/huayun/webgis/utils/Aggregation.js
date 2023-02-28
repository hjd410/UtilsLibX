//>>built
define("com/huayun/webgis/utils/Aggregation",["../geometry/Point","custom/kdbush.min"],function(_1,_2){function _3(_4){this.data=_4;this.index=new _2(_4,function(p){return p["point_x"];},function(p){return p["point_y"];});};_3.prototype.filter=function(_5,_6,_7,_8){var _9=this;var _a=this.index.range(_6.xmin,_6.ymin,_6.xmax,_6.ymax).map(function(id){return _9.data[id];});var _b=_5.width/_7,_c=_5.height/_8,_d=_5.targetZoom||_5.level,_e=_5.viewpoint.tileInfo;if(!_e){return null;}var _f=_e.getResolution(_d);var _10=[];for(var i=0;i<_8+1;i++){_10[i]=[];for(var j=0;j<_7+1;j++){_10[i][j]={value:0,x:0,y:0,len:0,list:[]};}}_a.forEach(function(_11){var x=_11.point_x,y=_11.point_y;var _12=x-_6.xmin,_13=y-_6.ymin;var _14=Math.floor(_12/_f/_b),_15=Math.floor(_13/_f/_c);_10[_15][_14].value+=_11.value;_10[_15][_14].x+=x;_10[_15][_14].y+=y;_10[_15][_14].len+=1;_10[_15][_14].list.push(_11);});for(i=0;i<_8;i++){for(j=0;j<_7;j++){if(_10[i][j].value>0){var len=_10[i][j].len;_10[i][j].position=new _1(_10[i][j].x/len,_10[i][j].y/len);}}}return _10;};return _3;});