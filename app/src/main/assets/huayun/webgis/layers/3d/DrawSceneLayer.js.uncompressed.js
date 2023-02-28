/**
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.DrawSceneLayer
 */
define("com/huayun/webgis/layers/3d/DrawSceneLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/on",
    "./SceneLayer",
    "../../geometry/MapPoint",
    "../../symbols/CircleSpriteSymbol",
    "../../symbols/LineSymbol",
    "../../symbols/PolygonSymbol",
    "../../symbols/CircleSymbol",
    "../../Feature",
    "../../Graphic"
], function (declare, topic, on, SceneLayer, MapPoint, CircleSpriteSymbol, LineSymbol, PolygonSymbol, CircleSymbol, Feature, Graphic) {
    /**
     * @alias com.huayun.webgis.layers.3d.DrawSceneLayer
     * @extends {SceneLayer}
     * @property {null}  group  - 容纳3d模型, 将添加到3d的Scene中 
     * @property {Array}  map  - 引用地图
     * @property {Array}  lineSymbol  - 线符号
     * @property {string}  mainColor  - 主要颜色
     * @property {null}  currentGraphic  - 当前的图形
     * @property {null}  lineMaterial  - 线材质
     * @property {object}  lineObj  - 线对象
     * @property {number}  lineIndex  - 线序号
     * @property {null}  lineNodeMaterial  - 线结点材质
     * @property {point}  linePrevPoint  - 线点 
     * @property {object}  circleObj  - 圆对象 
     * @property {number}  circleIndex  - 圆的序号 
     * @property {null}  circleMaterial  - 圆材质 
     * @property {object}  polygonObj  - 多边形对象 
     * @property {number}  polygonIndex  - 多边形序号
     * @property {Array}  polygonArray  - 多边形数组
     * @property {null}  polygonMaterial  - 多边形材质
     * @property {object}  sphereObj  - 球形对象
     * @property {number}  sphereIndex  - 球形序号
     * @property {null}  sphereMaterial  - 球形材质
     * @property {null}  dotSymbol  - 符号
     * @property {Array}  measureLineNodes  - 测量线的结点 
     * @property {Array}  measureLines  - 测量线
     * @property {Array}  AngleNodes  - 角度结点 
     */
    return declare("com.huayun.webgis.layers.3d.DrawSceneLayer", [SceneLayer], {
        group: null,
        map: null,
        lineSymbol: null,
        mainColor: 0x0000FF,
        currentGraphic: null,
        lineMaterial: null,
        lineObj: null,
        lineIndex: 0,
        lineNodeMaterial: null,
        linePrevPoint: null,
        circleObj: null,
        circleIndex: 0,
        circleMaterial: null,
        polygonObj: null,
        polygonIndex: 0,
        polygonArray: [],
        polygonMaterial: null,
        sphereObj: null,
        sphereIndex: 0,
        sphereMaterial: null,
        name: "画图图层",
        id: "graphic",
        dotSymbol: null,
        measureLineNodes: [],
        measureLines: {},
        AngleNodes: [],
        constructor: function (params) {
            var self = this;
            declare.safeMixin(this, params);
            this.group = new THREE.Group();
            this.dotSymbol = new CircleSpriteSymbol({
                r: 10,
                fill: 0xFF0000,
                initz: this.map.initz
            });
            this.lineSymbol = new LineSymbol({
                color: 0xFF0000,
                isDashLine: false,
                linewidth: 1
            });
            this.polygonSymbol = new PolygonSymbol({
                color: 0xFF0000,
                depthTest: false
            });
            this.circleSymbol = new CircleSymbol({
                color: 0xFF0000,
                fillAlpha: 1,
                depthTest: false
            });


            this.lineMaterial = new THREE.LineBasicMaterial({color: self.mainColor, depthTest: false});
            this.lineNodeMaterial = new THREE.PointsMaterial({size: 2, color: self.mainColor, depthTest: false});
            this.circleMaterial = new THREE.LineBasicMaterial({color: self.mainColor, depthTest: false});
            this.polygonMaterial = new THREE.MeshPhongMaterial({color: self.mainColor, depthTest: false});
            this.sphereMaterial = new THREE.MeshLambertMaterial({color: self.mainColor, wireframe: true});
            this.lineIndex = 0;
            this.circleIndex = 0;
            this.polygonIndex = 0;
            this.sphereIndex = 0;
            this.lineObj = new Object();
            this.circleObj = new Object();
            this.polygonObj = new Object();
            this.polygonArray = new Array();
            this.sphereObj = new Object();

            var obj = this;

            topic.subscribe("calculatePolyArea", function () {
                //计算多边形面积
                var pointArr = obj.polygonArray;
                // pointArr : [{lat1,lng1},{lat2,lng2},{lat3,lng3}...]
                console.log("calculatePolyArea", pointArr);
                var totalArea = 0;
                for (var i = 0; i < pointArr.length - 1; i++) {
                    totalArea += pointArr[i].x * pointArr[i + 1].y - pointArr[i + 1].x * pointArr[i].y;
                }
                console.log("resolution", obj.map.resolution, "initResolution", obj.map.initResolution, "totalArea", totalArea);
                totalArea = totalArea * obj.map.resolution * obj.map.resolution;//乘地图比例
                var firstPoint3d = obj.map.screenTo3dPoint(pointArr[0].x, pointArr[0].y);
                console.log("totalArea", totalArea, pointArr[0].x, pointArr[0].y, firstPoint3d)
                var totalAreaStr = "";
                if (totalArea > 1000000) {
                    totalAreaStr = (totalArea / 1000000).toFixed(2) + "平方千米"
                } else {
                    totalAreaStr = totalArea.toFixed(2) + "平方米"
                }
                console.log(pointArr[pointArr.length - 2])
                obj.addTextTexture({text: totalAreaStr}, obj.map.screenTo3dPoint(pointArr[0].x, pointArr[0].y))

            });

            topic.subscribe("clearMapGraphic", function () {
                var children = obj.group.children;
                obj.lineIndex = 0;
                obj.circleIndex = 0;
                obj.polygonIndex = 0;
                obj.sphereIndex = 0;
                obj.linePrevPoint = {};
                obj.lineObj = {};
                obj.circleObj = {};
                obj.polygonObj = {};
                obj.polygonArray = [];
                obj.sphereObj = {};
                obj.measureLineNodes = [];
                obj.measureLines = {};
                obj.AngleNodes = [];

                for (var i = children.length - 1; i > -1; i--) {
                    obj.group.remove(children[i]);
                }
                console.log(obj.group.children.length);
                obj.map.layerContainer.threeRender();
            });

            /*topic.subscribe("mapDrawDot", function (point) {
                obj.addPoint(point);
            });
            topic.subscribe("mapDrawLineNode", function (point) {
                obj.addLinePoint(point);
            });
            topic.subscribe("mapDrawLine", function (point) {
                obj.addLine(point);
            });
            topic.subscribe("mapDrawPolygonNode", function (point) {
                obj.addPolygonPoint(point);
            });
            topic.subscribe("mapDrawPolygon", function (params) {
                obj.addPolygon(params);
            });
            topic.subscribe("mapDrawPolygonEnd", function () {
                obj.polygonIndex++;
                obj.polygonArray = [];
            });
            topic.subscribe("mapDrawCircle", function (params) {
                obj.addCircle(params);
            });
            topic.subscribe("mapDrawCircleEnd", function () {
                obj.circleIndex++;
            });
            topic.subscribe("mapDrawSphere", function (params) {
                obj.addSphere(params);
            });
            topic.subscribe("mapDrawSphereEnd", function () {
                obj.sphereIndex++;
            });
            topic.subscribe("addText", function (textObj, position3d) {
                obj.addTextTexture(textObj, position3d)
            });*/
        },

        /**
         * 当前图层添加点
         * @param point: 点的3d坐标
         */
        addPoint: function (point) {
            var theta = this.map.rotationAngela / 180 * Math.PI,
                position = this.group.position;
            point = this.map.calRotatePoint(point.x, point.y, theta);
            point.x = point.x - position.x;
            point.y = point.y - position.y;
            var feature = new Feature({
                _geometry: new MapPoint(point.x, point.y, 0.1)
            });
            var graphic = new Graphic({
                feature: feature,
                symbol: this.dotSymbol,
                graphicLayer: this
            });
            this.addGraphic(graphic);
        },
        /**
         * 当前图层添加线上的点
         * @param point  
         */
        addLinePoint: function (point) {
            var position = this.group.position,
                theta = this.map.rotationAngela / 180 * Math.PI;
            var dotGeometry = new THREE.Geometry();
            this.linePrevPoint = point;
            dotGeometry.vertices.push(new THREE.Vector3(point.x, point.y, 0.1));
            var dotPoint = new THREE.Points(dotGeometry, this.lineNodeMaterial);
            dotPoint.rotateZ(theta);
            dotPoint.position.set(-position.x, -position.y, 0.1);
            this.group.add(dotPoint);
            this.lineIndex++;
            this.map.layerContainer.threeRender();
        },

        /*addLine: function(point) {
            var position = this.group.position,
                theta = this.map.rotationAngela / 180 * Math.PI;
            if (this.lineObj[this.lineIndex]) {
                this.group.remove(this.lineObj[this.lineIndex]);
            }
            var lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(new THREE.Vector3(this.linePrevPoint.x, this.linePrevPoint.y, 0.1));
            lineGeo.vertices.push(new THREE.Vector3(point.x, point.y, 0.1));
            var line = new THREE.Line(lineGeo, this.lineMaterial);
            line.computeLineDistances();
            this.lineObj[this.lineIndex] = line;
            line.position.set(-position.x, -position.y, 0.1);
            line.rotateZ(theta);
            this.group.add(line);
            this.map.layerContainer.threeRender();
        },*/
        /**
         * 当前图层添加线
         * @param sp 
         * @param ep 
         */
        addLine: function (sp, ep) {
            var points = [sp.x, sp.y, 0, ep.x, ep.y, 0];
            var feature = new Feature({
                _geometry: points
            });
            var graphic = new Graphic({
                feature: feature,
                symbol: this.lineSymbol,
                graphicLayer: this
            });
            this.currentGraphic = graphic;
            this.addGraphic(graphic);
        },


        /*addPolygonPoint: function(polygon, point) {
            /!*var position = this.group.position,
                theta = this.map.rotationAngela / 180 * Math.PI;*!/
            polygon.push(point.x, point.y);
            var feature = new Feature({
                _geometry: polygon
            });
            var graphic = new Graphic({
                feature: feature,
                symbol: this.polygonSymbol,
                graphicLayer: this
            });
            this.currentGraphic = graphic;
            this.addGraphic(graphic);
        },*/



        /*addPolygon: function(params) {
            if (this.polygonArray.length > 1) {
                var position = this.group.position,
                    theta = this.map.rotationAngela / 180 * Math.PI;
                if (this.polygonObj[this.polygonIndex]) {
                    this.group.remove(this.polygonObj[this.polygonIndex]);
                }
                var shape = new THREE.Shape();
                shape.moveTo(this.polygonArray[0].x, this.polygonArray[0].y);
                for (var i = 1; i < this.polygonArray.length; i++) {
                    shape.lineTo(this.polygonArray[i].x, this.polygonArray[i].y);
                }
                shape.lineTo(params.ex, params.ey);
                shape.lineTo(this.polygonArray[0].x, this.polygonArray[0].y);
                var geo = new THREE.ShapeGeometry(shape);
                var mesh = new THREE.Mesh(geo, this.polygonMaterial);
                mesh.position.set(-position.x, -position.y, 0.1);
                mesh.rotateZ(theta);
                this.polygonObj[this.polygonIndex] = mesh;
                this.group.add(mesh);
                this.map.layerContainer.threeRender();
            }
        },*/
        /**
         * 当前图层添加多边形
         * @param points 
         */
        addPolygon: function (points) {
            var feature = new Feature({
                _geometry: points
            });
            var graphic = new Graphic({
                feature: feature,
                symbol: this.polygonSymbol,
                graphicLayer: this
            });
            this.currentGraphic = graphic;
            this.addGraphic(graphic);
        },


        /*addCircle: function(params){
            var position = this.group.position,
                theta = this.map.rotationAngela / 180 * Math.PI;
            if (this.circleObj[this.circleIndex]) {
                this.group.remove(this.circleObj[this.circleIndex]);
            }
            var circleGeo = new THREE.CircleGeometry(params.r, 32);
            var circleMesh = new THREE.Mesh(circleGeo, this.circleMaterial);
            this.circleObj[this.circleIndex] = circleMesh;
            circleMesh.rotateZ(theta);
            circleMesh.position.set(params.cx - position.x, params.cy - position.y, 0.2);
            circleMesh.renderOrder = 3;
            this.group.add(circleMesh);
            this.map.layerContainer.threeRender();
        },*/

        /**
         * 当前图层添加圆
         * @param cp 圆点
         * @param r  半径
         */
        addCircle: function (cp, r) {
            var feature = new Feature({
                _geometry: new MapPoint(cp.x, cp.y, 0.1)
            });
            this.circleSymbol.r = r;
            var graphic = new Graphic({
                feature: feature,
                symbol: this.circleSymbol,
                graphicLayer: this
            });
            this.currentGraphic = graphic;
            this.addGraphic(graphic);
        },
        /**
         * 添加球面
         * @param params 
         */
        addSphere: function (params) {
            var position = this.group.position,
                theta = this.map.rotationAngela / 180 * Math.PI;
            if (this.sphereObj[this.sphereIndex]) {
                this.group.remove(this.sphereObj[this.sphereIndex]);
            }
            var sphereGeo = new THREE.SphereGeometry(params.r, 60, 60);
            var sphereMesh = new THREE.Mesh(sphereGeo, this.sphereMaterial);
            this.sphereObj[this.sphereIndex] = sphereMesh;
            sphereMesh.rotateZ(theta);
            sphereMesh.position.set(params.cx - position.x, params.cy - position.y, 0.1);
            this.group.add(sphereMesh);
            this.map.layerContainer.threeRender();
        },
        /**
         * 创建地图纹理
         * @param obj 
         */
        createTextTexture: function (obj) {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            ctx.font = obj.font || "Bold 12px Arial";
            ctx.lineWidth = 1;
            var metrics = ctx.measureText(obj.text);
            var textW = metrics.width;
            canvas.width = 128;
            canvas.height = 64;
            this.createTextRect(ctx, 2, 2, textW + 4, 26, 2);
            ctx.strokeStyle = obj.borderColor || "#FF0000";
            ctx.fillStyle = obj.fontColor || "#FF0000";
            ctx.fillText(obj.text, 4, 20);
            ctx.backgroundColor = "#FAFAD2";
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            return {"texture": texture, "canvasW": 128, "textW": textW};
        },
        /**
         * 添加地图纹理
         * @param obj 
         * @param position3d 
         */
        addTextTexture: function (obj, position3d) {
            var textureObj = this.createTextTexture(obj);
            var mat = new THREE.SpriteMaterial({
                map: textureObj.texture,
                opacity: 1,
                transparent: true,
                sizeAttenuation: false
            });
            var particle = new THREE.Sprite(mat);
            particle.scale.set(.08, .04, 1);
            var p = this.group.position;
            particle.position.set(position3d.x - p.x, position3d.y - p.y, .1);
            this.group.add(particle);
            this.map.layerContainer.threeRender();
        },
        
        pan: function (xmove, ymove) {
            this.group.position.x += xmove;
            this.group.position.y -= ymove;
        },
        /**
         * 添加符号
         * @param point 
         * @param symbol 
         */
        addSymbol: function (point, symbol) {
            symbol.draw(this.group, point);
        },
        /**
         * 添加图形
         * @param graphic 
         */
        addGraphic: function (graphic) {
            graphic.draw();
        },
        /**
         * 移除图形
         * @param graphic 
         */
        removeGraphic: function (graphic) {
            if (graphic) {
                var mesh = graphic.symbol.meshs[0];
                mesh.geometry.dispose();
                this.group.remove(mesh);
            }
        },
        /**
         * 设置地图层级
         * @param visible 
         */
        setVisible: function (visible) {
            this.visible = visible;
            this.group.visible = visible;
        },
        /**
         * 经纬度转墨卡托
         * @param poi 
         */
        lonLat2Mercator: function (poi) {
            //poi:[114.32894,30.585748]
            //经纬度转墨卡托
            var mercator = {};
            var R = 6378137;
            mercator.x = poi[0] * Math.PI / 180 * R;
            var a = poi[1] * Math.PI / 180;
            mercator.y = R / 2 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
            console.log(mercator)
            return mercator;
        },
        /**
         * 墨卡托转经纬度
         * @param poi 
         */
        mercator2LonLat: function (poi) {
            //墨卡托转经纬度 lng,经度 lat纬度
            var lnglat = {};
            lnglat.lng = poi.x / 20037508.34 * 180;
            var m = poi.y / 20037508.34 * 180;
            lnglat.lat = 180 / Math.PI * (2 * Math.atan(Math.exp(m * Math.PI / 180)) - Math.PI / 2);
            return lnglat;
        },
        /**
         * 刷新
         */
        refresh: function () {
            this.readyData();
            this.startRender();
        },
        readyData: function () {

        },
        startRender: function () {
        }
    })
});