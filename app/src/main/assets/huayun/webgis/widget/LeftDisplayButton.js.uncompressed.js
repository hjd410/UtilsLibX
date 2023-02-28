/*
* 右侧显示隐藏按钮*/
define("com/huayun/webgis/widget/LeftDisplayButton", [
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/_base/fx",
    "./MapModuleX"
], function (declare, domConstruct,domStyle,baseFx, MapModuleX) {
    return declare("com.huayun.webgis.widget.LeftDisplayButton", [MapModuleX], {
        _map: null,
        postCreate:function(){
            this.inherited(arguments);
            domStyle.set(this.domNode,"pointer-events","all");
        },
        doInit:function(){
            this._map = this.get("map");
            domConstruct.create("div",{style:{
                    "width":"30px",
                    "height":"91px",
                    "background":"url('../dojo/com/huayun/webgis/css/images/show_btn.png') no-repeat right"
                },onclick:this._onClickHandler.bind(this)},this.domNode);
        },
        _onClickHandler:function () {
            var temp = this.context.lookUp("tabNavigator");
            baseFx.animateProperty({
                node:temp.domNode,
                properties:{
                    left: 0
                },
                duration: 400
            }).play();
            domStyle.set(this.domNode,"display","none");
        }
    });
});