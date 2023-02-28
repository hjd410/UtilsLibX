//>>built
define("com/huayun/webgis/work/support/VectorTileFeature",["../../geometry/Point"],function(_1){function _2(_3,_4,_5){if(_3==1){_4.id=_5.readVarint();}else{if(_3==2){_6(_5,_4);}else{if(_3==3){_4.type=_5.readVarint();}else{if(_3==4){_4._geometry=_5.pos;}}}}};function _6(_7,_8){var _9=_7.readVarint()+_7.pos;while(_7.pos<_9){var _a=_8._keys[_7.readVarint()];_8.properties[_a]=_8._values[_7.readVarint()];}};function _b(_c){var _d=_c.length;if(_d<=1){return [_c];}var _e=[],_f,ccw;for(var i=0;i<_d;i++){var _10=_11(_c[i]);if(_10===0){continue;}if(ccw===undefined){ccw=_10<0;}if(ccw===_10<0){if(_f){_e.push(_f);}_f=[_c[i]];}else{_f.push(_c[i]);}}if(_f){_e.push(_f);}return _e;};function _11(_12){var sum=0;for(var i=0,len=_12.length,j=len-1,p1,p2;i<len;j=i++){p1=_12[i];p2=_12[j];sum+=(p2.x-p1.x)*(p1.y+p2.y);}return sum;};function _13(pbf,end,_14,_15,_16){this.properties={};this.extent=_14;this.type=0;this._pbf=pbf;this._geometry=-1;this._keys=_15;this._values=_16;pbf.readFields(_2,this,end);this.id=this.properties.id;};_13.types=["Unknown","Point","LineString","Polygon"];_13.prototype.loadGeometry=function(){var pbf=this._pbf;pbf.pos=this._geometry;var end=pbf.readVarint()+pbf.pos,cmd=1,_17=0,x=0,y=0,_18=[],_19;while(pbf.pos<end){if(_17<=0){var _1a=pbf.readVarint();cmd=_1a&7;_17=_1a>>3;}_17--;if(cmd===1||cmd===2){x+=pbf.readSVarint();y+=pbf.readSVarint();if(cmd===1){if(_19){_18.push(_19);}_19=[];}_19.push(new _1(x,y));}else{if(cmd===7){if(_19){_19.push(_19[0].clone());}}else{throw new Error("unknown command "+cmd);}}}if(_19){_18.push(_19);}return _18;};_13.prototype.bbox=function(){var pbf=this._pbf;pbf.pos=this._geometry;var end=pbf.readVarint()+pbf.pos,cmd=1,_1b=0,x=0,y=0,x1=Infinity,x2=-Infinity,y1=Infinity,y2=-Infinity;while(pbf.pos<end){if(_1b<=0){var _1c=pbf.readVarint();cmd=_1c&7;_1b=_1c>>3;}_1b--;if(cmd===1||cmd===2){x+=pbf.readSVarint();y+=pbf.readSVarint();if(x<x1){x1=x;}if(x>x2){x2=x;}if(y<y1){y1=y;}if(y>y2){y2=y;}}else{if(cmd!==7){throw new Error("unknown command "+cmd);}}}return [x1,y1,x2,y2];};_13.prototype.toGeoJSON=function(x,y,z){var _1d=this.extent*Math.pow(2,z),x0=this.extent*x,y0=this.extent*y,_1e=this.loadGeometry(),_1f=_13.types[this.type],i,j;function _20(_21){for(var j=0;j<_21.length;j++){var p=_21[j],y2=180-(p.y+y0)*360/_1d;_21[j]=[(p.x+x0)*360/_1d-180,360/Math.PI*Math.atan(Math.exp(y2*Math.PI/180))-90];}};switch(this.type){case 1:var _22=[];for(i=0;i<_1e.length;i++){_22[i]=_1e[i][0];}_1e=_22;_20(_1e);break;case 2:for(i=0;i<_1e.length;i++){_20(_1e[i]);}break;case 3:_1e=_b(_1e);for(i=0;i<_1e.length;i++){for(j=0;j<_1e[i].length;j++){_20(_1e[i][j]);}}break;}if(_1e.length===1){_1e=_1e[0];}else{_1f="Multi"+_1f;}var _23={type:"Feature",geometry:{type:_1f,coordinates:_1e},properties:this.properties};if("id" in this){_23.id=this.id;}return _23;};return _13;});