/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/5
 *  @time   :   10:30
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/module/supportClass/BaseMapModule", [
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom",
        "dojo/dom-style",
        "dojo/topic",
        "com/huayun/webgis/Map",
        "com/huayun/widget/ModuleX",
        "com/huayun/util/StringHelp"
    ],
    function (declare, domConstruct, dom, domStyle, topic, Map, ModuleX, StringHelp) {
        return declare("com.huayun.module.supportClass.BaseMapModule", [ModuleX], {
            map: null,
            view: null,
            _floatContainer: null,
            width: 0,
            height: 0,
            showLogo: true,
            constructor: function () {

            },

            postCreate: function () {
                this.inherited(arguments);
                // if (this.showLogo) {
                //     domConstruct.create("div", {id: "logoIcon"}, this.domNode);
                // }
            },

            startup: function () {
                this.inherited(arguments);
            },

            doInit: function () {

            },

            _setPorpertyMethod: function (list) {
                if (!StringHelp.isSpace(list) && list.length > 0) {
                    // console.log(this.id, list);
                    for (var i = 0; i < list.length; i++) {
                        // console.log(list[i].name);
                        if (list[i].name === 'showLogo') {
                            this[list[i].name] = list[i].value;
                            // console.log(document.getElementById('logoIcon'));
                            // domConstruct.destroy("logoIcon");
                            // debugger
                            if (list[i].value) {
                                domConstruct.create("div", {id: "logoIcon"}, this.domNode);
                            }
                            // var logoNode = dom.byId('logoIcon');
                            // debugger
                            // if (list[i].value === false) {
                            //     domStyle.set(logoNode, "display", "none");
                            // } else {
                            //     domStyle.set(logoNode, "display", "");
                            // }
                        }
                    }
                }
            },

            /**
             *  获取浮动框
             * @returns {null}
             */
            getFloatContainer: function () {
                return this._floatContainer;
            }
        });
    }
);
