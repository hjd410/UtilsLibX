define(
    "com/huayun/webgis/symbols/SimpleMarkSymbol", [
        "dojo/_base/declare",
        "./BaseSymbol"
    ], function (declare, BaseSymbol) {
        return declare("com.huayun.webgis.symbols.SimpleMarkSymbol", [BaseSymbol], {

            constructor: function (params) {
                //默认值
                this.type = "circle";
                this.size = "10";
                this.color = "#2883b8";
                this.outline = null;
                this.fixedSize = false;
                this.xoffset = 0;
                this.yoffset = 0;
                //外面传参，修改默认的值
                declare.safeMixin(this, params);
            },
            clone:function(){
                //TODO
            }
        });
    }
);