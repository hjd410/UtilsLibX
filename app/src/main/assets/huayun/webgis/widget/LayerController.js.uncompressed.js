/**
 * 地图图层控制器
 */
define("com/huayun/webgis/widget/LayerController", [
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/dom-construct",
    "../../util/HashTable",
    "./MapModuleX"
], function (declare, topic, domConstruct,  HashTable, MapModuleX) {
    return declare("com.huayun.webgis.widget.LayerController", [MapModuleX], {
        name: "",
        baseClass: "layer-controller",
        backgroundColor: "",
        width: 400,
        height: "100%",
        _inputDomHash: null,

        constructor: function () {
            topic.subscribe("tabChange", this._tabChangeHandler.bind(this));
            topic.subscribe("gridLayerControlChange", this._gridLayerControlChangeHandler.bind(this));
            this._inputDomHash = new HashTable();
        },

        doInit: function (params) {
            // debugger;
            this.map = this.get("map");
            var layers = this.map.findAllLayers();/*findAllLayers是map中的方法,其他交互方式用view*/
            if (layers.length > 0) {
                this._addLayerItem(layers);
            } else {
                topic.subscribe("layerComplete", function () {
                    var layers = this.map.findAllLayers();
                    this._addLayerItem(layers);
                }.bind(this));
            }
        },

        _addLayerItem: function(layers) {
            var item;
            for (var i = layers.length - 1; i> -1; i--) {
                item = layers[i];
                if (item.controlEnabled) {
                    var div = domConstruct.create("div", {
                        innerHTML: item.name,
                        style: {
                            "padding": "6px 12px",
                            "background-color": "rgba(255, 255, 255, 1)",
                            "color": "#333"
                        }
                    }, this.domNode, "last");
                    var inputDom = domConstruct.create("input", {
                        type: "checkbox",
                        value: item.id,
                        checked: item.visible,
                        onchange: this.visibleSwitch.bind(this)
                    }, div, "first");
                    this._inputDomHash.put(item.id, inputDom);
                }
            }
        },

        visibleSwitch: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var id = e.target.value,
                visible = e.target.checked;
                this.map.findLayerById(id).setVisible(visible);
            if(id === "power"){
                topic.publish("layerControllerGridChange",visible);
            }
            /*var index = id.indexOf("-");
            if (index > -1) {
                var groupId = id.substring(0, index),
                    subLayerId = id.substring(index+1);
                console.log("groupId:",groupId,"subLayerId:",subLayerId)
                this.map.findLayerById(groupId).setSubLayerVisible(subLayerId, visible);
            }else {
                this.map.findLayerById(id).setVisible(visible);
            }*/
        },

        _tabChangeHandler: function (target) {
            var dom = this._inputDomHash.get("power");
            dom.checked = this.map.findLayerById("power").visible;
        },

        _gridLayerControlChangeHandler:function (visible) {
            var dom = this._inputDomHash.get("power");
            dom.checked = visible;
        }

    });
});