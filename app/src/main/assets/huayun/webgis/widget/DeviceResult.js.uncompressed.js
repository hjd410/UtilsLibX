require({cache:{
'url:com/huayun/webgis/templates/deviceResult.html':"<div class=\"device-single\">\r\n    <div class=\"device-sequence\">\r\n        <span>${sequence}</span>\r\n    </div>\r\n    <div class=\"device-detail\">\r\n        <div class=\"device-name\">${name}</div>\r\n        <div class=\"device-district\">[单位] : </div>\r\n        <div>\r\n            <button data-dojo-attach-event=\"onclick: locate\">定位</button></div>\r\n        </div>\r\n</div>"}});
/**
 * @ Description: 设备搜索结果组件
 * @ module: DeviceResult
 * @ Author: overfly
 * @ Date: 2019/5/16
 */
define(
    "com/huayun/webgis/widget/DeviceResult", [
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_OnDijitClickMixin",
        "../geometry/Extent",
        "../Feature",
        "../Graphic",
        "dojo/text!../templates/deviceResult.html"
    ], function (declare,_WidgetBase, _TemplatedMixin, _OnDijitClickMixin,Extent, Feature, Graphic,  template) {
        return declare("com.huayun.webgis.widget.DeviceResult", [_WidgetBase, _TemplatedMixin, _OnDijitClickMixin], {
            templateString: template,
            sequence: 1,
            name: "",
            shape: "",
            map: null,
            constructor: function (params) {
                this.sequence = params.sequence;
                this.name = params.name;
                this.shape = params.shape;
                this.map = params.map;
                /*this.lineSymbol = new LineSceneSymbol({
                    color: 0xFF00FF,
                    isDashLine: false,
                    linewidth: 3
                });*/
            },
            locate: function () {
                var obj = this;
                var drawLayer = this.map.findLayerById("drawLayer");
                if (this.shape.startsWith("POINT")) { // 点定位
                    var index = this.shape.indexOf(" "),
                        x = this.shape.substring(6, index)*1,
                        y = this.shape.substring(index+1, this.shape.length-1)*1;
                    drawLayer.clear();
                    /*this.map.centerAt({x: x, y: y, z: 0}, function () {

                    });*/
                    var maxRe = this.map.getMaxResolution();
                    var width = this.map.realWidth,
                        height = this.map.realHeight;
                    this.map.setExtent(new Extent(x - maxRe*width/2, y - maxRe*height/2, x + maxRe*width/2, y + maxRe*height/2));
                    var p = obj.map.geometryTo3D({x: x, y:y});
                    drawLayer.addPoint({
                        x: p.x,
                        y: p.y
                    });
                }else if (this.shape.startsWith("MULTILINESTRING")) {   // 线定位
                    drawLayer.clear();
                    var str = this.shape.substring(17, this.shape.length - 2);
                    var poionts = str.split("),(");
                    var pointsStr, pointStr;
                    var pointArray = [],xy, p, x, y, arrays = [];
                    var minx, maxx = 0, miny, maxy = 0;
                    for (var i = 0, ii = poionts.length; i < ii; i++) {
                        var point = poionts[i].split(",");
                        pointArray = [];
                        for (var j = 0, jj = point.length; j < jj; j++) {
                            pointStr = point[j];
                            xy = pointStr.split(" ");
                            x = Number(xy[0]);
                            y = Number(xy[1]);
                            if (!minx || x < minx) {
                                minx = x;
                            }else if (x > maxx) {
                                maxx = x;
                            }
                            if (!miny || y < miny) {
                                miny = y;
                            }else if (y > maxy) {
                                maxy = y;
                            }
                            pointArray.push({x: x, y:y});
                        }
                        arrays.push(pointArray);
                    }
                    var extent = new Extent(minx, miny, maxx, maxy);
                    this.map.setExtent(extent);
                    var arr = [], p, path = [];
                    x = drawLayer.group.position.x;
                    y = drawLayer.group.position.y;
                    for (var i = 0; i < arrays.length; i++) {
                        arr = arrays[i];
                        path = [];
                        for (var j = 0; j < arr.length; j++) {
                            p = obj.map.geometryTo3D(arr[j]);
                            p.x = p.x - x;
                            p.y = p.y - y;
                            path.push(p);
                        }
                        var feature = new Feature({
                            _geometry: path
                        });
                        var graphic = new Graphic({
                            feature: feature,
                            symbol: obj.lineSymbol,
                            graphicLayer: drawLayer
                        });
                        drawLayer.addGraphic(graphic);
                    }
                    drawLayer.map.layerContainer.threeRender();
                }
            }
        });
    });