define("com/huayun/webgis/action/search/PointSearchAction", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/dom",
    "dojo/query",
    "dojo/topic",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/window",
    "../../geometry/Point2D",
    "../ActiveMapAction"
], function (declare, on, dom, query, topic, domStyle, domConstruct, win, Point2D, ActiveMapAction) {
    return declare("com.huayun.webgis.action.search.PointSearchAction", [ActiveMapAction], {

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.view = params.view;
            this.state = false;
            this.power = this.view.map.findLayerById("power");
            this._onClick = null;
            this.isPoint = true;
        },
        active: function (point) {
            if(point){
                this.point = point;
            }
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
            if(this.isPoint){
                topic.publish("closePoint");
            } else{
                topic.publish("closeDevInfo")
            }
            this._endActionMethod.call(this);
        },
        doAction: function (e) {
            if (this.view.selectEnabled) {
                var geometry = this.view.screenToGeometry(e.clientX, e.clientY);
                var result = this.power.queryFeaturesByGeometry(geometry, 10);
                if(result && result.length > 0 && this.state) {
                    if(this.isPoint){
                        topic.publish("showPoint", result, e);
                    } else {
                        topic.publish("showDevInfo", result, e);
                    }
                } else {
                    if(this.isPoint){
                        topic.publish("closePoint");
                    } else {
                        topic.publish("closeDevInfo");
                    }
                }
            }
        },
        _endActionMethod: function () {
            this.state = false;
            if(this.isPoint){
                topic.publish("closePoint");
            } else {
                topic.publish("closeDevInfo");
            }
            if (this._onClick) {
                this._onClick.remove();
                this._onClick = null;
            }
        }
        // filterResult: function (result) {
        //     var obj = {};
        //     for (var id in result) {
        //         if (id === this.drawLayer.id) {
        //             var value = result[id];
        //             var arr = [];
        //             value.forEach(function (item) {
        //                 arr.push(item.feature);
        //             });
        //             obj[id] = arr;
        //         } else {
        //             obj[id] = result[id][0];
        //         }
        //     }
        //     return obj;
        // }
    });
});
