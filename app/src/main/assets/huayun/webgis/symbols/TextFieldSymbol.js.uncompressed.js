/**
 *  @author :   JiGuangJie
 *  @date   :   2019/8/13
 *  @time   :   17:23
 *  @Email  :   530904731@qq.com
 *  @module com/huayun/webgis/symbols
 *  @see com.huayun.webgis.symbols.TextFieldSymbol
 */
define(
    "com/huayun/webgis/symbols/TextFieldSymbol", [
        "dojo/_base/declare",
        "./BaseSymbol"
    ], function (declare, BaseSymbol) {
        /**
         * @alias com.huayun.webgis.symbols.TextFieldSymbol
         * @extends {BaseSymbol}
         * @property {string} type  - 图标类型
         * @property {string} text  - 图标文字内容
         * @property {string} textAlign  - 图标文字对齐方式         
         * @property {string} fontFamily  - 图标字体          
         * @property {string} color  - 图标颜色          
         * @property {string} outline  - 图标轮廓线          
         * @property {string} background  - 图标背景颜色          
         * @property {string} fixedSize  - 是否适应屏幕大小          
         * @property {string} xoffset  - 距离屏幕左侧的距离          
         * @property {number} yoffset  - 距离屏幕顶部的距离
         */
        return declare("com.huayun.webgis.symbols.TextFieldSymbol", [BaseSymbol], {

            constructor: function (params) {
                //默认值
                this.type = "textField";
                this.text = "";
                this.textAlign = null;
                this.fontFamily = null;
                this.color = "#2883b8";
                this.outline = null;
                this.background = null;
                this.fixedSize = false;
                this.xoffset = 0;
                this.yoffset = 0;
                //外面传参，修改默认的值
                declare.safeMixin(this, params);
            },
            /**
             * 克隆当前Symbol
             */
            clone:function(){
                //TODO
            }
        });
    }
);