require({cache:{
'url:com/huayun/webgis/templates/gridLayerControl.html':"<div class=\"${baseClass}\" style=\"width: 100px;\" data-dojo-attach-event=\"mouseover:_onMouseOverHandler,mouseout:_onMouseOutHandler\">\r\n    <div style=\"border:2px solid #EEEEEE;width: 52px;float:right;background: #EEEEEE\" data-dojo-attach-event=\"onclick:_changeGridState\">\r\n        <div class=\"gridOpenIcon hidden\" data-dojo-attach-point=\"openNode\"\r\n             style=\"height: 27px;background-repeat: no-repeat;\"></div>\r\n        <div class=\"gridCloseIcon hidden\" data-dojo-attach-point=\"closeNode\"\r\n             style=\"height: 27px;background-repeat: no-repeat;\"></div>\r\n        <div data-dojo-attach-point=\"gridTxt\" style=\"font-size: 1px;text-align: center\"></div>\r\n    </div>\r\n</div>"}});
/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/29
 *  @time   :   10:56
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/widget/GridLayerControl", [
        "dojo/_base/declare",
        "dojo/topic",
        "dojo/on",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/dom-style",
        "./MapModuleX",
        "../../util/HashTable",
        "dojo/text!../templates/gridLayerControl.html"
    ], function (declare, topic, on, domConstruct, domClass, domStyle, MapModuleX, HashTable, template) {
        return declare("com.huayun.webgis.widget.GridLayerControl", [MapModuleX], {
            templateString: template,
            baseClass: "gridLayerControlClass",
            _map: null,
            _view: null,
            _visible: true,
            _filters: [],
            _id: "power",
            _floatNode: null,
            _showHash: null,
            _hideHash: null,
            _allHash: null,

            constructor: function () {
                topic.subscribe("layerControllerGridChange", this._layerControllerGridChangeHandler.bind(this));
                topic.subscribe("mapImageLayerVisibleChange", this._mapImageLayerVisibleChange.bind(this));
            },

            postCreate: function () {
                this.inherited(arguments);
                this._showHash = new HashTable();   //存放显示的电网图层
                this._hideHash = new HashTable();   //存放隐藏的电网图层
                this._allHash = new HashTable();    //存放所有的电网图层
                this._floatNode = domConstruct.create("div", {
                    className: "change-control"
                }, this.domNode);
                domClass.add(this._floatNode, "hidden");
            },

            doInit: function () {
                this._map = this.get("map");
                this._view = this.get("view");
                var configData = this.get("configData");
                var gridData = configData["configuration"]["grid"];
                this._visible = gridData.visible;
                this._filters = gridData.filters;
                if (!this._visible) {
                    domClass.remove(this.openNode, "hidden");
                    this.gridTxt.innerHTML = "打开电网";
                } else {
                    domClass.remove(this.closeNode, "hidden");
                    this.gridTxt.innerHTML = "关闭电网";
                }
                if(this._map.findLayerById(this._id)){
                    // this._map.findLayerById(this._id).set("visible", this._visible);
                    this._map.findLayerById(this._id).setVisible(this._visible);
                }else{
                    topic.subscribe("layerComplete", function (target) {
                        // this._map.findLayerById(this._id).set("visible", this._visible);
                        this._map.findLayerById(this._id).setVisible(this._visible);
                    }.bind(this));
                }
                this._createCheckBox();
            },

            _createCheckBox: function () {
                for (var i = 0; i < this._filters.length; i++) {
                    var filter = this._filters[i];
                    this._allHash.put(filter.id, filter);
                    if (filter.visible) {
                        this._showHash.put(filter.id, filter);
                    } else {
                        this._hideHash.put(filter.id, filter);
                    }
                    var div = domConstruct.create("div", {className:"grid-label",innerHTML: filter.label}, this._floatNode, "last");
                    domConstruct.create("input", {
                        type: "checkbox",
                        value: filter.id,
                        checked: filter.visible,
                        onchange: this._visibleSwitch.bind(this)
                    }, div, "first");
                }
            },
            /**
             * 选择显示不同的电网图层
             * @param event
             * @private
             */
            _visibleSwitch: function (event) {
                event.preventDefault();
                event.stopPropagation();
                var theTarget = this._allHash.get(event.target.value);
                if (event.target.checked) {
                    theTarget.visible = true;
                    this._showHash.put(event.target.value, theTarget);
                    this._hideHash.remove(event.target.value);
                    // this._showFilter.indexOf(event.target.value)
                } else {
                    theTarget.visible = false;
                    this._hideHash.put(event.target.value, theTarget);
                    this._showHash.remove(event.target.value);
                }
                var layer = this._map.findLayerById(this._id);
                if (this._isAllShowBoolean()) { //全部显示，无需再计算hide 和 show 的接口
                    /*layer.getImageUrl = function (extent, width, height) {
                        return this.url + "/export?format=png&transparent=true&dpi=96&bboxSR=2385&imageSR=2385&f=image" + "&bbox=" + extent.minx + "," + extent.miny + "," + extent.maxx + "," + extent.maxy + "&size=" + width + "," + height;
                    }*/
                    // layer.url = layer._initUrl;
                    layer.setFilter();
                } else {
                    var hideString = "&layers=hide:" + this._getHideSubLayers(layer).toString();
                    /*layer.getImageUrl = function (extent, width, height) {
                        return this.url + "/export?format=png&transparent=true&dpi=96&bboxSR=2385&imageSR=2385&f=image" + "&bbox=" + extent.minx + "," + extent.miny + "," + extent.maxx + "," + extent.maxy + "&size=" + width + "," + height
                    }*/
                    // layer.url = layer._initUrl  + hideString;
                    layer.setFilter(hideString);
                }
                layer.refresh();
                // layer.layerViews[0].view.threeRender();
            },
            /**
             * 判断是否所有的电网层都需要显示
             * @returns {boolean}
             * @private
             */
            _isAllShowBoolean: function () {
                var allkeyList = this._allHash.getKeyList();
                var flag = true;
                for (var i = 0; i < allkeyList.length; i++) {
                    var key = allkeyList[i];
                    flag = flag & this._allHash.get(key).visible;
                }
                return flag;
            },
            /**
             * 获取需要隐藏的电网图层
             * @param layer
             * @returns {Array}
             * @private
             */
            _getHideSubLayers: function (layer) {
                var hideLayerList = [];
                var hideKeyList = this._hideHash.getKeyList();
                for (var i = 0; i < hideKeyList.length; i++) {
                    var key = hideKeyList[i];
                    for (var j = 0; j < layer.sublayers.length; j++) {
                        var sublayer = layer.sublayers[j];
                        if (sublayer.name === key) {
                            hideLayerList = hideLayerList.concat(sublayer["subLayerIds"]);
                            break;
                        }
                    }
                }
                return hideLayerList;
            },
            /**
             * 选择电网图层的开/关状态
             * @param event
             * @private
             */
            _changeGridState: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this._visible = !this._visible;
                if (!this._visible) {
                    domClass.remove(this.openNode, "hidden");
                    domClass.add(this.closeNode, "hidden");
                    domClass.add(this._floatNode, "hidden");
                    this.gridTxt.innerHTML = "打开电网";
                } else {
                    domClass.remove(this.closeNode, "hidden");
                    domClass.add(this.openNode, "hidden");
                    domClass.remove(this._floatNode, "hidden");
                    this.gridTxt.innerHTML = "关闭电网";
                }
                // this._map.findLayerById(this._id).set("visible", this._visible);
                this._map.findLayerById(this._id).setVisible(this._visible);
                topic.publish("gridLayerControlChange", this._visible);
            },
            /**
             * 鼠标移入
             * @param event
             * @private
             */
            _onMouseOverHandler: function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (this._visible) {
                    domClass.remove(this._floatNode, "hidden");
                }
            },
            /**
             * 鼠标移开
             * @private
             */
            _onMouseOutHandler: function () {
                event.preventDefault();
                event.stopPropagation();
                if (this._visible) {
                    domClass.add(this._floatNode, "hidden");
                }
            },
            /**
             * 接收到其它组件的电网控制的消息触发
             * @param visible
             * @private
             */
            _layerControllerGridChangeHandler: function (visible) {
                this._visible = visible;
                if (!this._visible) {
                    domClass.remove(this.openNode, "hidden");
                    domClass.add(this.closeNode, "hidden");
                    // domClass.add(this._floatNode, "hidden");
                    this.gridTxt.innerHTML = "打开电网";
                } else {
                    domClass.remove(this.closeNode, "hidden");
                    domClass.add(this.openNode, "hidden");
                    // domClass.remove(this._floatNode, "hidden");
                    this.gridTxt.innerHTML = "关闭电网";
                }
                // this._map.findLayerById(this._id).set("visible", this._visible);
            },

            _mapImageLayerVisibleChange: function (visible, sourceId) {
                if (sourceId === this._id) {
                    this._visible = visible;
                    if (!this._visible) {
                        domClass.remove(this.openNode, "hidden");
                        domClass.add(this.closeNode, "hidden");
                        // domClass.add(this._floatNode, "hidden");
                        this.gridTxt.innerHTML = "打开电网";
                    } else {
                        domClass.remove(this.closeNode, "hidden");
                        domClass.add(this.openNode, "hidden");
                        // domClass.remove(this._floatNode, "hidden");
                        this.gridTxt.innerHTML = "关闭电网";
                    }
                }
            }
        });
    }
);
