define("com/huayun/webgis/widget/SearchButton", [
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-style",
    "./MapModuleX"
], function (declare, domConstruct,domStyle, MapModuleX) {
    return declare("com.huayun.webgis.widget.MapDialog", [MapModuleX], {
        durationTime: 500,
        _diaLog: null,
        _map: null,

        postCreate:function(){
            this.inherited(arguments);
            domStyle.set(this.domNode,"pointer-events","all");
        },

        doInit:function(){
            this._map = this.get("map");
            domConstruct.create("div",{id:"clickBtn",innerHTML:"位置搜索",onclick:this._onClickHandler.bind(this)},this.domNode);
        },

        _onClickHandler:function () {
            var temp = this.context.lookUp("searchContainer");
            if(temp === null){
                this.context.getBean("searchContainer",null,function (data) {
                    var node = this.context.lookUp("mapViewer");
                    data.placeAt(node);
                    data.startup();
                }.bind(this));
            }else{
                temp.show();
            }
        }
    });
});