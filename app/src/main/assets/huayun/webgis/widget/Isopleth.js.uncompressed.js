/**
 *  @author :   JiGuangJie
 *  @date   :   2019/4/28
 *  @time   :   13:47
 *  @Email  :   530904731@qq.com
 */
/**
 * 等值线组件
 */
define(
    "com/huayun/webgis/widget/Isopleth", [
        "dojo/_base/declare",
        "dojo/dom",
        "dojo/on",
        "dojo/dom-construct",
        "dojo/dom-style",
        "./MapModuleX"
    ], function (declare, dom, on, domConstruct, domStyle, MapModule) {
        return declare("com.huayun.webgis.widget.Isopleth", [MapModule], {
            _map: null,
            _extent: null,
            _cellWidth: 300,
            _pointGrid: null,
            _graphicSceneLayer: null,   //绘制图层
            _lineMaterial: null,

            constructor: function () {
                this._lineMaterial = new THREE.LineBasicMaterial({color: 0xFF00FF});
            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "pointer-events", "none");
            },

            doInit: function () {
                this._map = this.get("map");
                console.log(this._map.offsetLeft, this._map.height);
                // this._extent = [this._map.extent.minx, this._map.extent.miny, this._map.extent.maxx, this._map.extent.maxy];
                this._extent = [400, 0, this._map.width, this._map.height];
                this._graphicSceneLayer = this._map.findLayerById("graphic");
                // console.log(this._graphicSceneLayer);
                this._pointGrid = turf.pointGrid(this._extent, this._cellWidth, {units: "miles"});
                // console.log(this._pointGrid);
                for (var i = 0; i < this._pointGrid.features.length; i++) {
                    this._pointGrid.features[i].properties.temperature = Math.random() * 10;
                }
                var breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                // var breaks = [0, 1, 2, 3];
                var lines = turf.isolines(this._pointGrid, breaks, {zProperty: "temperature"});
                // console.log(lines);
                var div = domConstruct.create("div", {
                    innerHTML: "等值线",
                    style: "position:absolute;left:200px;background:#eeff00;pointer-events:all"
                }, this.domNode, "last");
                on(div, "click", function () {
                    this._drawLine(lines);
                }.bind(this));
                // console.log(this._pointGrid);
            },

            _drawLine: function (params) {
                // console.log(params);
                var position = this._graphicSceneLayer.group.position;
                var theta = this._map.rotationAngela / 180 * Math.PI;
                params.features.forEach(function (item) {
                    item.geometry.coordinates.forEach(function (geoArr) {
                        var lineGeo = new THREE.Geometry();
                        // console.log(lineGeo);
                        geoArr.forEach(function (geoPoint) {
                            var the3DPoint = this._map.screenTo3dPoint(geoPoint[0], geoPoint[1]);
                            lineGeo.vertices.push(new THREE.Vector3(the3DPoint.x, the3DPoint.y, 1));
                        }.bind(this));
                        var line = new THREE.Line(lineGeo, this._lineMaterial);
                        line.computeLineDistances();
                        line.position.set(-position.x, -position.y, 0.1);
                        line.rotateZ(theta);
                        this._graphicSceneLayer.group.add(line);
                    }.bind(this));
                }.bind(this));
                /*for(var i=0;i<params.features.length;i++){

                }*/
                // var lineGeo = new THREE.Geometry();
                // lineGeo.vertices.push(new THREE.Vector3(obj.linePrevPoint.x, obj.linePrevPoint.y, 0.1));
                // lineGeo.vertices.push(new THREE.Vector3(params.ex, params.ey, 0.1));
                // var line = new THREE.Line(lineGeo, obj.lineMaterial);
                // line.computeLineDistances();
                // obj.lineObj[obj.lineIndex] = line;
                // line.position.set(-position.x, -position.y, 0.1);
                // line.rotateZ(params.theta);
                // obj.group.add(line);
            }
        });
    }
);