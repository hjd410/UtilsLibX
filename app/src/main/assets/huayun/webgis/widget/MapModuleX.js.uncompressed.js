/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/18
 *  @time   :   15:18
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/widget/MapModuleX", [
        "dojo/_base/declare",
        "dojo/dom-style",
        "../../widget/ModuleX",
        "../../util/StringHelp"
    ], function (declare, domStyle, ModuleX, StringHelp) {
        return declare("com.huayun.webgis.wedget.MapModuleX", [ModuleX], {
            _map: null,
            _mapModuleBeanId: "",
            _view: null,

            constructor: function (params) {
                // console.log(">>>:组件MapModuleXContainer初始化");
            },

            doInit: function () {

            },
            /**
             * 获取Map
             * @returns {null}
             * @private
             */
            _getMapAttr: function () {
                var propertys = this.get("propertys");
                //console.log(this.id, propertys);
                for (var i = 0; i < propertys.length; i++) {
                    if (propertys[i].name === "mapModuleBeanId") {
                        this._mapModuleBeanId = propertys[i].value;
                        var mapModule = this.context.lookUp(this._mapModuleBeanId);
                        this._map = mapModule.map;
                        return this._map;
                    }
                }
            },
            /**
             * 获取View
             * @returns {null}
             * @private
             */
            _getViewAttr: function () {
                var propertys = this.get("propertys");
                //console.log(this.id, propertys);
                for (var i = 0; i < propertys.length; i++) {
                    if (propertys[i].name === "mapModuleBeanId") {
                        this._mapModuleBeanId = propertys[i].value;
                        // console.log(this._mapModuleBeanId);
                        var mapModule = this.context.lookUp(this._mapModuleBeanId);
                        // console.log(mapModule);
                        return mapModule.view;
                    }
                }
                return null;
            }
        });
    }
);