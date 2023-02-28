define("com/huayun/webgis/action/select/PointSelected", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-construct",
    "dojo/_base/window",
    "../../geometry/Point2D",
    "../ActiveMapAction"
], function (declare, on, topic, domConstruct, win, Point2D, ActiveMapAction) {
    return declare("com.huayun.webgis.action.select.PointSelected", [ActiveMapAction], {

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.view = params.view;
            this.state = false;
            this.drawLayer = this.view.map.findLayerById("drawLayer");
            this._onClick = null;
            this.showResult = document.getElementById("selectResult");
            if (!this.showResult) {
                this.showResult = domConstruct.create("div", {className: "select-result", id: "selectResult"}, win.body());
            }
        },
        active: function () {
            if (!this.state) {    //当前Action处于未激活状态下的时候，激活该Action
                this.state = true;
                this.view.selectEnabled = true;
                this._onClick = on(this.view.domNode, "click", this._mouseClick.bind(this));
            }
        },
        _mouseClick: function (e) {
            this.doAction(e);
        },
        invalid: function () {
            this.view.panEnabled = true;
            this.showResult.style.display = "none";
            this._endActionMethod.call(this);
        },
        doAction: function (e) {
            if (this.view.selectEnabled) {
                //发布点选择的对象列表
                // topic.publish("pointSelected", this.view.selectObj(x, y));
                var geometry = this.view.screenToGeometry(e.clientX, e.clientY);
                this.view.queryFeaturesByGeometry(new Point2D(geometry.x, geometry.y), 5, function (result) {
                    var obj = this.filterResult(result);
                    this.showResult.innerHTML = JSON.stringify(obj);
                    this.showResult.style.display = "block";
                    this.drawLayer.highlightGraphic(result[this.drawLayer.id]);
                }.bind(this));
            }
        },
        _endActionMethod: function () {
            this.state = false;
            this.showResult.style.display = "none";
            if (this._onClick) {
                this._onClick.remove();
                this._onClick = null;
            }
        },
        filterResult: function (result) {
            var obj = {};
            for (var id in result) {
                if (id === this.drawLayer.id) {
                    var value = result[id];
                    var arr = [];
                    value.forEach(function (item) {
                        arr.push(item.feature);
                    });
                    obj[id] = arr;
                } else {
                    obj[id] = result[id][0];
                }
            }
            return obj;
        }
    });
});