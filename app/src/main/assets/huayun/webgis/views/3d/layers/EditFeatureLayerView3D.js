//>>built
define("com/huayun/webgis/views/3d/layers/EditFeatureLayerView3D",["dojo/_base/declare","./LayerView3D"],function(_1,_2){function _3(_4){this.visible=_4.visible;this.layer=_4.layer;this.scale=0;this.graphicsLayerView=_4.graphicsLayerView;};if(_2){_3.__proto__=_2;}_3.prototype=Object.create(_2&&_2.prototype);_3.prototype.constructor=_3;_3.prototype.refresh=function(){this.graphicsLayerView.view.threeRender();};_3.prototype._readyData=function(){};_3.prototype._render=function(){var _5=this.graphicsLayerView.view;if(this.scale!==_5.scale){this.layer.zoomEnd(this.graphicsLayerView.view);}this.graphicsLayerView._render();if(this.scale!==_5.scale){this._updateGraphicsIndex();this.scale=_5.scale;}};_3.prototype.zoom=function(){if(this.visible){this.graphicsLayerView._render();}};_3.prototype._updateGraphicsIndex=function(){var _6=[];var gs=this.layer.editGraphicsLayer.graphics;for(var i=0,ii=gs.length;i<ii;i++){var g=gs[i];if(g.symbol){this.graphicsLayerView.renderer.calculateExtent(this.graphicsLayerView.view,g,g.feature.geometry,g.symbol,_6);}}this.graphicsLayerView.view.loadItem(_6);};return _3;});