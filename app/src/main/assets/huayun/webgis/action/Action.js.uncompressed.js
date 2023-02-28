define(
    "com/huayun/webgis/action/Action", [
        "dojo/_base/declare"
    ], function (declare) {
        return declare("com.huayun.webgis.action.Action", null, {
            id:"",
            isActive:false, //是否是拥有持续行为，false不具有持续行为，true具有持续行为
            params:null,    //当前行为的一些属性
            endActionMethod:null,

            constructor:function (params) {
                this.id = "";
                this.isActive = false;
                this.state = false;
                this.params = null;
                this.endActionMethod = null;
                declare.safeMixin(this, params);
            },

            doActive:function (params) {
                //TODO
            }
        });
    }
);