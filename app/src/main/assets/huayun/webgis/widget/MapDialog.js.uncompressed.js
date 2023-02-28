define("com/huayun/webgis/widget/MapDialog", [
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/_base/fx",
    "dojo/fx/easing",
    "dojo/_base/connect",
    "dojo/dnd/Moveable",
    "../../framework/ModuleXContainer"
], function (declare, domStyle, baseFx, easing, connect,Moveable, ModuleXContainer) {
    return declare("com.huayun.webgis.widget.MapDialog", [ModuleXContainer], {
        durationTime: 500,
        _diaLog: null,
        _map: null,

        postCreate:function(){
            this.inherited(arguments);
            domStyle.set(this.domNode,"pointer-events","all");
            domStyle.set(this.domNode,"display","none");
            var moveable = new Moveable(this.domNode);
        },

        doInit:function(){
            this.inherited(arguments);
        },

        show: function () {
            domStyle.set(this.domNode,"display","block");
        },
        hide: function () {
            domStyle.set(this.domNode,"display","none");
        }
    });
});