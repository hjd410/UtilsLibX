//>>built
define("com/huayun/webgis/work/support/WorkerTile",["com/huayun/webgis/layers/support/OverscaledTileID","com/huayun/webgis/data/ArrayType","com/huayun/webgis/data/FeatureIndex","com/huayun/webgis/gl/GlyphAtlas","com/huayun/webgis/gl/ImageAtlas","com/huayun/webgis/data/bucket/SymbolBucket","com/huayun/webgis/data/bucket/LineBucket","com/huayun/webgis/data/bucket/FillBucket","com/huayun/webgis/data/bucket/FillExtrusionBucket","com/huayun/webgis/layers/support/EvaluationParameters","../../utils/DictionaryCoder","../../utils/utils","../../utils/symbolLayout"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d){var _e=function _e(_f){debugger;this.tileID=new _1(_f.tileID.overscaledZ,_f.tileID.wrap,_f.tileID.canonical.z,_f.tileID.canonical.x,_f.tileID.canonical.y);this.uid=_f.uid;this.zoom=_f.zoom;this.pixelRatio=_f.pixelRatio;this.tileSize=_f.tileSize;this.source=_f.source;this.overscaling=this.tileID.overscaleFactor();this.showCollisionBoxes=_f.showCollisionBoxes;this.collectResourceTiming=!!_f.collectResourceTiming;this.returnDependencies=!!_f.returnDependencies;};_e.prototype.parse=function parse(_10,_11,_12,_13){var _14=this;this.status="parsing";this.data=_10;this.collisionBoxArray=new _2.CollisionBoxArray();var _15=new _b(Object.keys(_10.layers).sort());var _16=new _3(this.tileID);_16.bucketLayerIDs=[];debugger;var _17={};var _18={featureIndex:_16,iconDependencies:{},patternDependencies:{},glyphDependencies:{}};var _19=_11.familiesBySource[this.source];for(var _1a in _19){var _1b=_10.layers[_1a];if(!_1b){continue;}var _1c=_15.encode(_1a);var _1d=[];for(var _1e=0;_1e<_1b.length;_1e++){var _1f=_1b.feature(_1e);_1d.push({feature:_1f,index:_1e,sourceLayerIndex:_1c});}for(var i=0,_20=_19[_1a];i<_20.length;i+=1){var _21=_20[i];var _22=_21[0];if(_22.minzoom&&this.zoom<_22.minzoom){continue;}if(_22.maxzoom&&this.zoom>=_22.maxzoom){continue;}if(_22.visibility==="none"){continue;}_23(_21,this.zoom);var _24=_17[_22.id]=_22.createBucket({index:_16.bucketLayerIDs.length,layers:_21,zoom:this.zoom,pixelRatio:this.pixelRatio,overscaling:this.overscaling,collisionBoxArray:this.collisionBoxArray,sourceLayerIndex:_1c,sourceID:this.source});_24.populate(_1d,_18);_16.bucketLayerIDs.push(_21.map(function(l){return l.id;}));}}var _25;var _26;var _27;var _28;var _29=_c.mapObject(_18.glyphDependencies,function(_2a){return Object.keys(_2a).map(Number);});if(Object.keys(_29).length){_12.send("getGlyphs",{uid:this.uid,stacks:_29},function(err,_2b){if(!_25){_25=err;_26=_2b;_2c.call(_14);}});}else{_26={};}var _2d=Object.keys(_18.iconDependencies);if(_2d.length){_12.send("getImages",{icons:_2d},function(err,_2e){if(!_25){_25=err;_27=_2e;_2c.call(_14);}});}else{_27={};}var _2f=Object.keys(_18.patternDependencies);if(_2f.length){_12.send("getImages",{icons:_2f},function(err,_30){if(!_25){_25=err;_28=_30;_2c.call(_14);}});}else{_28={};}_2c.call(this);function _2c(){if(_25){return _13(_25);}else{if(_26&&_27&&_28){var _31=new _4(_26);var _32=new _5(_27,_28);for(var key in _17){var _33=_17[key];if(_33 instanceof _6){_23(_33.layers,this.zoom);_d.performSymbolLayout(_33,_26,_31.positions,_27,_32.iconPositions,this.showCollisionBoxes);}else{if(_33.hasPattern&&(_33 instanceof _7||_33 instanceof _8||_33 instanceof _9)){_23(_33.layers,this.zoom);_33.addFeatures(_18,_32.patternPositions);}}}this.status="done";_13(null,{buckets:_c.values(_17).filter(function(b){return !b.isEmpty();}),featureIndex:_16,collisionBoxArray:this.collisionBoxArray,glyphAtlasImage:_31.image,imageAtlas:_32,glyphMap:this.returnDependencies?_26:null,iconMap:this.returnDependencies?_27:null,glyphPositions:this.returnDependencies?_31.positions:null});}}};};function _23(_34,_35){var _36=new _a(_35);for(var i=0,_37=_34;i<_37.length;i+=1){var _38=_37[i];_38.recalculate(_36);}};return _e;});