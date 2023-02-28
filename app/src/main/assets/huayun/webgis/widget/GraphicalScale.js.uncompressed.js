require({cache:{
'url:com/huayun/webgis/templates/graphicalScale.html':"<div style=\"height: 20px;\">\r\n    <div id='grapicalScaleTxt' data-dojo-attach-point=\"grapicalScaleTxt\"\r\n         style='text-align: center;font-size: 11px; font-family: Arial,scans-serif'></div>\r\n    <div class='BMap_scaleHBarBG'\r\n         style='position: absolute; width: 100%; height: 5px; left:0; bottom: -1px; font-size: 0; background: #FFFFFF'></div>\r\n    <div class='BMap_scaleLBarBG'\r\n         style='position: absolute; width: 3px; height: 7px; left: -1px; bottom:0;font-size: 0; background: #FFFFFF'></div>\r\n    <div class='BMap_scaleRBarBG'\r\n         style='position: absolute; width: 3px; height: 7px; right:-1px; bottom:0; font-size: 0;background: #FFFFFF'></div>\r\n    <div class='BMap_scaleHBar'\r\n         style='position: absolute; width: 100%; height: 3px; left:0; bottom:0; font-size: 0; background: #000000'></div>\r\n    <div class='BMap_scaleLBar'\r\n         style='position: absolute; width: 1px; height: 6px; left:0; bottom:0;font-size: 0; background: #000000'></div>\r\n    <div class='BMap_scaleRBar'\r\n         style='position: absolute; width: 1px; height: 6px; right:0; bottom:0; font-size: 0;background: #000000'></div>\r\n</div>"}});
/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/26
 *  @time   :   9:08
 *  @Email  :   530904731@qq.com
 */
/**
 * 图示比例尺，用来表示图上距离与实地距离关系;
 */
define(
    "com/huayun/webgis/widget/GraphicalScale", [
        "dojo/_base/declare",
        "dojo/topic",
        "dojo/dom-construct",
        "dojo/dom-style",
        "./MapModuleX",
        "dojo/text!../templates/graphicalScale.html"
    ], function (declare, topic, domConstruct, domStyle, MapModuleX, template) {
        return declare("com.huayun.webgis.widget.GraphicalScale", [MapModuleX], {
            templateString: template,
            map: null,
            view: null,
            // _const_pixel: 50,        //定义一个常量值
            // _const_pixel: 1.5,        //定义一个常量值,计算各个级别下的像素长度
            // _baseFactor: 1,
            _number: "5",
            _unit: "米",
            _numberList: [],

            constructor: function () {
                // this._numberList = [400000, 300000, 200000, 100000, 40000, 30000, 20000, 10000, 5000, 2000, 1000, 500, 400, 200, 100, 50, 20, 10, 5];
                this._numberList = [400000, 300000, 150000, 80000, 40000, 20000, 10000, 5000, 2000, 1000, 500, 400, 200, 100, 50, 20];
            },

            postCreate: function () {
                this.inherited(arguments);
                topic.subscribe("changeLevel", function (data) {
                    this._render(data.level);
                }.bind(this));
                domStyle.set(this.domNode, "pointer-events", "none");
            },

            doInit: function () {
                this.map = this.get("map");
                this.view = this.get("view");
                if (this.view._load) {
                    this._render(this.view.level);
                } else {
                    topic.subscribe("tileInfoComplete", function () {
                        this._render(this.view.level);
                    }.bind(this));
                }
            },

            /**
             * 渲染
             * @private
             */
            _render: function (level) {
                var number = this._numberList[level];
                var resolution = this.view.viewpoint.getResolution(level);
                var scaleW;
                if (number > 500) {
                    this._number = this._numberList[level] / 1000;
                    this._unit = "公里";
                    scaleW = number / resolution;
                } else {
                    this._number = number;
                    this._unit = "米";
                    scaleW = number/resolution;
                }
                domStyle.set(this.domNode, "width", scaleW + "px");
                this.grapicalScaleTxt.innerHTML = this._number + "&nbsp;" + this._unit;
            }

        });
    }
);