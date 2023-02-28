//>>built
define("com/huayun/webgis/layers/support/TileM",["com/huayun/webgis/data/bucket/SymbolBucket","com/huayun/webgis/gl/Texture","../../utils/utils","./EvaluationParameters","com/huayun/webgis/data/Feature"],function(_1,_2,_3,_4,_5){function _6(_7){var re=/(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g;var _8={};_7.replace(re,function($0,$1,$2,$3){var _9=$2||$3;_8[$1]=_9?_9.toLowerCase():true;return "";});if(_8["max-age"]){var _a=parseInt(_8["max-age"],10);if(isNaN(_a)){delete _8["max-age"];}else{_8["max-age"]=_a;}}return _8;};function _b(_c,_d){var _e={};for(var _f=0,_10=_c;_f<_10.length;_f+=1){var _11=_10[_f];var _12=_11.layerIds.map(function(id){return _d[id];}).filter(Boolean);if(_12.length===0){return;}(_11).layers=_12;if((_11).stateDependentLayerIds){(_11).stateDependentLayers=(_11).stateDependentLayerIds.map(function(lId){return _12.filter(function(l){return l.id===lId;})[0];});}for(var i=0,_13=_12;i<_13.length;i+=1){var _14=_13[i];_e[_14.id]=_11;}}return _e;};var id=1;var _15=30000;var _16=function _16(_17,_18){this.tileID=_17;this.uid=id++;this.uses=0;this.tileSize=_18;this.buckets={};this.expirationTime=null;this.queryPadding=0;this.hasSymbolBuckets=false;this.expiredRequestCount=0;this.state="loading";};_16.prototype.registerFadeDuration=function registerFadeDuration(_19){var _1a=_19+this.timeAdded;if(_1a<_3.now()){return;}if(this.fadeEndTime&&_1a<this.fadeEndTime){return;}this.fadeEndTime=_1a;};_16.prototype.wasRequested=function wasRequested(){return this.state==="errored"||this.state==="loaded"||this.state==="reloading";};_16.prototype.loadVectorData=function loadVectorData(_1b,_1c,_1d){if(this.hasData()){this.unloadVectorData();}this.state="loaded";if(!_1b){this.collisionBoxArray=new CollisionBoxArray();return;}if(_1b.featureIndex){this.latestFeatureIndex=_1b.featureIndex;if(_1b.rawTileData){this.latestRawTileData=_1b.rawTileData;this.latestFeatureIndex.rawTileData=_1b.rawTileData;}else{if(this.latestRawTileData){this.latestFeatureIndex.rawTileData=this.latestRawTileData;}}}this.collisionBoxArray=_1b.collisionBoxArray;this.buckets=_b(_1b.buckets,_1c._layers);this.hasSymbolBuckets=false;for(var id in this.buckets){var _1e=this.buckets[id];if(_1e instanceof _1){this.hasSymbolBuckets=true;if(_1d){_1e.justReloaded=true;}else{break;}}}this.queryPadding=0;for(var _1f in this.buckets){var _20=this.buckets[_1f];this.queryPadding=Math.max(this.queryPadding,_1c._layers[_1f].queryRadius(_20));}if(_1b.imageAtlas){this.imageAtlas=_1b.imageAtlas;}if(_1b.glyphAtlasImage){this.glyphAtlasImage=_1b.glyphAtlasImage;}};_16.prototype.unloadVectorData=function unloadVectorData(){for(var id in this.buckets){this.buckets[id].destroy();}this.buckets={};if(this.imageAtlasTexture){this.imageAtlasTexture.destroy();}if(this.imageAtlas){this.imageAtlas=null;}if(this.glyphAtlasTexture){this.glyphAtlasTexture.destroy();}this.latestFeatureIndex=null;this.state="unloaded";};_16.prototype.unloadDEMData=function unloadDEMData(){this.dem=null;this.neighboringTiles=null;this.state="unloaded";};_16.prototype.getBucket=function getBucket(_21){return this.buckets[_21.id];};_16.prototype.upload=function upload(_22){for(var id in this.buckets){var _23=this.buckets[id];if(_23.uploadPending()){_23.upload(_22);}}var gl=_22.gl;if(this.imageAtlas&&!this.imageAtlas.uploaded){this.imageAtlasTexture=new _2(_22,this.imageAtlas.image,gl.RGBA);this.imageAtlas.uploaded=true;}if(this.glyphAtlasImage){this.glyphAtlasTexture=new _2(_22,this.glyphAtlasImage,gl.ALPHA);this.glyphAtlasImage=null;}};_16.prototype.prepare=function prepare(_24){if(this.imageAtlas){this.imageAtlas.patchUpdatedImages(_24,this.imageAtlasTexture);}};_16.prototype.queryRenderedFeatures=function queryRenderedFeatures(_25,_26,_27,_28,_29,_2a,_2b,_2c,_2d){if(!this.latestFeatureIndex||!this.latestFeatureIndex.rawTileData){return {};}return this.latestFeatureIndex.query({queryGeometry:_27,cameraQueryGeometry:_28,scale:_29,tileSize:this.tileSize,pixelPosMatrix:_2d,transform:_2b,params:_2a,queryPadding:this.queryPadding*_2c},_25,_26);};_16.prototype.querySourceFeatures=function querySourceFeatures(_2e,_2f){if(!this.latestFeatureIndex||!this.latestFeatureIndex.rawTileData){return;}var _30=this.latestFeatureIndex.loadVTLayers();var _31=_2f?_2f.sourceLayer:"";var _32=_30._geojsonTileLayer||_30[_31];if(!_32){return;}var _33=createFilter(_2f&&_2f.filter);var ref=this.tileID.canonical;var z=ref.z;var x=ref.x;var y=ref.y;var _34={z:z,x:x,y:y};for(var i=0;i<_32.length;i++){var _35=_32.feature(i);if(_33(new _4(this.tileID.overscaledZ),_35)){var _36=new _5(_35,z,x,y);_36.tile=_34;_2e.push(_36);}}};_16.prototype.clearMask=function clearMask(){if(this.segments){this.segments.destroy();delete this.segments;}if(this.maskedBoundsBuffer){this.maskedBoundsBuffer.destroy();delete this.maskedBoundsBuffer;}if(this.maskedIndexBuffer){this.maskedIndexBuffer.destroy();delete this.maskedIndexBuffer;}};_16.prototype.setMask=function setMask(_37,_38){if(deepEqual(this.mask,_37)){return;}this.mask=_37;this.clearMask();if(deepEqual(_37,{"0":true})){return;}var _39=new StructArrayLayout4i8();var _3a=new StructArrayLayout3ui6();this.segments=new SegmentVector();this.segments.prepareSegment(0,_39,_3a);var _3b=Object.keys(_37);for(var i=0;i<_3b.length;i++){var _3c=_37[+_3b[i]];var _3d=EXTENT>>_3c.z;var _3e=new pointGeometry(_3c.x*_3d,_3c.y*_3d);var _3f=new pointGeometry(_3e.x+_3d,_3e.y+_3d);var _40=(this.segments).prepareSegment(4,_39,_3a);_39.emplaceBack(_3e.x,_3e.y,_3e.x,_3e.y);_39.emplaceBack(_3f.x,_3e.y,_3f.x,_3e.y);_39.emplaceBack(_3e.x,_3f.y,_3e.x,_3f.y);_39.emplaceBack(_3f.x,_3f.y,_3f.x,_3f.y);var _41=_40.vertexLength;_3a.emplaceBack(_41,_41+1,_41+2);_3a.emplaceBack(_41+1,_41+2,_41+3);_40.vertexLength+=4;_40.primitiveLength+=2;}this.maskedBoundsBuffer=_38.createVertexBuffer(_39,rasterBoundsAttributes.members);this.maskedIndexBuffer=_38.createIndexBuffer(_3a);};_16.prototype.hasData=function hasData(){return this.state==="loaded"||this.state==="reloading"||this.state==="expired";};_16.prototype.patternsLoaded=function patternsLoaded(){return this.imageAtlas&&!!Object.keys(this.imageAtlas.patternPositions).length;};_16.prototype.setExpiryData=function setExpiryData(_42){_42.cacheControl="max-age=43200,s-maxage=300";var _43=this.expirationTime;if(_42.cacheControl){var _44=_6(_42.cacheControl);if(_44["max-age"]){this.expirationTime=Date.now()+_44["max-age"]*1000;}}if(this.expirationTime){var now=Date.now();var _45=false;if(this.expirationTime>now){_45=false;}else{if(!_43){_45=true;}else{if(this.expirationTime<_43){_45=true;}else{var _46=this.expirationTime-_43;if(!_46){_45=true;}else{this.expirationTime=now+Math.max(_46,_15);}}}}if(_45){this.expiredRequestCount++;this.state="expired";}else{this.expiredRequestCount=0;}}};_16.prototype.getExpiryTimeout=function getExpiryTimeout(){if(this.expirationTime){if(this.expiredRequestCount){return 1000*(1<<Math.min(this.expiredRequestCount-1,31));}else{return Math.min(this.expirationTime-new Date().getTime(),Math.pow(2,31)-1);}}};_16.prototype.setFeatureState=function setFeatureState(_47,_48){if(!this.latestFeatureIndex||!this.latestFeatureIndex.rawTileData||Object.keys(_47).length===0){return;}var _49=this.latestFeatureIndex.loadVTLayers();for(var id in this.buckets){var _4a=this.buckets[id];var _4b=_4a.layers[0]["sourceLayer"]||"_geojsonTileLayer";var _4c=_49[_4b];var _4d=_47[_4b];if(!_4c||!_4d||Object.keys(_4d).length===0){continue;}_4a.update(_4d,_4c,this.imageAtlas&&this.imageAtlas.patternPositions||{});if(_48&&_48.style){this.queryPadding=Math.max(this.queryPadding,_48.style.getLayer(id).queryRadius(_4a));}}};_16.prototype.holdingForFade=function holdingForFade(){return this.symbolFadeHoldUntil!==undefined;};_16.prototype.symbolFadeFinished=function symbolFadeFinished(){return !this.symbolFadeHoldUntil||this.symbolFadeHoldUntil<exported.now();};_16.prototype.clearFadeHold=function clearFadeHold(){this.symbolFadeHoldUntil=undefined;};_16.prototype.setHoldDuration=function setHoldDuration(_4e){this.symbolFadeHoldUntil=exported.now()+_4e;};return _16;});