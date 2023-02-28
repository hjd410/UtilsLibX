/**
 *  @author :   JiGuangJie
 *  @date   :   2019/8/1
 *  @time   :   15:31
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/views/3d/graphics/GraphicView", [
        "dojo/_base/declare",
        "com/huayun/webgis/geometry/Point2D",
        "com/huayun/webgis/gl/LineBucketCut",
        "../../../../util/BaseGetAndSet"
    ], function (declare, Point2D, LineBucket, BaseGetAndSet) {
        return declare("com.huayun.webgis.views.3d.graphics.GraphicView", [BaseGetAndSet], {

            constructor: function (params) {
                // debugger;
                this._symbol = params.symbol;
                this._graphic = params.graphic;
                // this.scale = 1;
                // this.view = null;
                this._currentGroup = null;

                this.canvas = document.createElement("canvas");
                this.canvas.width = 128;
                this.canvas.height = 64;
                this.ctx = this.canvas.getContext("2d");
                // console.log("graphic view");
                // this.ctx.font = this.font;
                // this.ctx.lineWidth = 1;
                // this.ctx.strokeStyle = this.stroke;
                // this.ctx.fillStyle = this.fill;
            },
            /**
             * 设置Symbol
             * @param value
             * @private
             */
            _setGraphicAttr: function (value) {
                // this._graphic = value;
                // this._symbol = this._graphic.symbol;
                // this._graphic.graphicView = this;
            },
            /**
             * 获取Symbol
             * @returns {null|*}
             * @private
             */
            _getGraphicAttr: function () {
                return this._graphic;
            },
            /**
             * 设置可视化属性
             * @param value 
             */
            _setVisibleAttr: function (value) {
                if (this._graphic.mesh) {
                    this._graphic.mesh.visible = value;
                    this._graphic.mesh.material.visible = value;
                    // this.view.threeRender();
                    this._render();
                }
            },
            /**
             * 刷新
             */
            refresh: function () {
                // console.log("refresh");
                // console.log(this._graphic.layer.layerViews);
                for (var i = 0; i < this._graphic.layer.layerViews.length; i++) {
                    var itemView = this._graphic.layer.layerViews[i];
                    if (itemView.view.name !== "EagleEye") {
                        this.draw(itemView);
                    }
                }
                /*                if (this.view === null) {
                                    this.view = this._graphic.layerView.view;
                                }
                                this.scale = this._graphic.layerView.view.viewpoint.scale;
                                this.draw(this._graphic.layerView._group);*/
            },
            /**
             * 绘制
             * @param view 绘制的上下文
             */
            draw: function (layerView) {
                // console.log("graphic view");
                // this._currentGroup = context;
                // console.log(view);
                var context = layerView._group;
                var view = layerView.view;
                var scale = view.viewpoint.scale;
                // console.log(scale);
                var feature = this._graphic.feature;
                var symbol = this._graphic.symbol;
                var reg = /(\d+)([A-Za-z]*)/;
                if (reg.test(symbol["size"])) {     //如果是px像素值，则把字符串转换
                    symbol["size"] = Number(symbol.size.toString().replace(/(\d+)([A-Za-z]*)/, "$1"));
                }
                // console.log(symbol.type);
                switch (symbol.type) {
                    case "line":
                        this._renderLine2(view, symbol, feature, this._graphic, context, scale);
                        break;
                    case "point":
                        this._renderPoint(view, symbol, feature, this._graphic, context, scale);
                        break;
                    case "polygon":
                        this._renderPolygon(view, symbol, feature, this._graphic, context);
                        break;
                    case "circle":
                        this._renderCircle(view, symbol, feature, this._graphic, context, scale);
                        break;
                    case "image":
                        this._renderImage(view, symbol, feature, this._graphic, context, scale);
                        break;
                    case "sphere":
                        this._renderSphere(view, symbol, feature, this._graphic, context, scale);
                        break;
                    case "textField":
                        this._renderTextField(view, symbol, feature, this._graphic, context, scale);
                        break;
                    case "close":
                        this._renderClose(view, symbol, feature, this._graphic, context, scale);
                        break;

                }
            },
            /**
             * 渲染线
             * @param view     绘制的上下文
             * @param symbol   符号
             * @param feature  特征数据
             * @param graphic  图形
             * @param group    点集
             */
            _renderLine: function (view, symbol, feature, graphic, group) {
                // console.log(graphic.id);
                // console.log(group.children.length);
                // console.log(feature);
                var geometry = feature.geometry;
                var path = geometry.path;
                var geo = new THREE.Geometry();
                var point;
                var pos = group.position;
                // console.log(graphic.id, path[0]);
                for (var i = 0; i < path.length; i++) {
                    var theLinePath = path[i];
                    for (var j = 0; j < theLinePath.length; j++) {
                        var theLinePathElement = theLinePath[j];
                        point = view._geometryToScene(theLinePathElement.x, theLinePathElement.y, theLinePathElement.z);
                        geo.vertices.push(new THREE.Vector3(point.x - pos.x, point.y - pos.y, 0.5));
                    }
                }
                var line = new MeshLine();
                line.setGeometry(geo);
                // console.log(typeof graphic.mesh);
                if (typeof graphic.mesh === "undefined") {
                    var material = symbol.material;
                    material.depthTest = false;
                    // console.log(geo);
                    // console.log(line.geometry);
                    var mesh = new THREE.Mesh(line.geometry, material);
                    mesh.userData = {
                        feature: feature,
                        meshLine: line
                    };
                    graphic.id = mesh.uuid;
                    graphic.rendered = true;
                    graphic.mesh = mesh;
                    mesh.renderOrder = 1;
                    mesh.position.set(0, 0, 1);
                    graphic.sameMaterial = true;
                    group.add(mesh);
                } else {
                    var theMesh = graphic.mesh;
                    // console.log(theMesh);
                    theMesh.renderOrder = 1;
                    theMesh.position.set(0, 0, 1);
                    theMesh.geometry.dispose();
                    theMesh.geometry = line.geometry;
                }
                this._render();
                // console.log("children:",group.children);
            },
            /**
             * 渲染线
             */
            _renderLine2: function (view, symbol, feature, graphic, group, scale) {
                var geometry = feature.geometry;
                var path = geometry.path;
                var point;
                var points = [];
                // debugger;
                for (var i = 0; i < path.length; i++) {
                    var theLinePath = path[i];
                    var line = [];
                    for (var j = 0; j < theLinePath.length; j++) {
                        var theLinePathElement = theLinePath[j];
                        point = view._geometryToScene(theLinePathElement.x, theLinePathElement.y, theLinePathElement.z);
                        line.push(new Point2D(Math.round(point.x), Math.round(point.y)));
                    }
                    points.push(line);
                }
                var lineBucket = new LineBucket();
                lineBucket.addFeature(points, "miter","butt", 2, 1.05);

                var geo = new THREE.BufferGeometry();
                var arrayBuffer = lineBucket.layoutVertexArray.arrayBuffer;
                var posBuffer = new Int16Array(arrayBuffer);
                posBuffer.count = lineBucket.layoutVertexArray.length;

                var posB = new THREE.InterleavedBuffer(posBuffer, 4);

                var dataBuffer = new Uint8Array(arrayBuffer);
                dataBuffer.count = lineBucket.layoutVertexArray.length;
                var dataB = new THREE.InterleavedBuffer(dataBuffer, 8);

                var position = new THREE.InterleavedBufferAttribute(posB, 2, 0);
                var data = new THREE.InterleavedBufferAttribute(dataB, 4, 4);

                geo.addAttribute("position", position);
                geo.addAttribute("a_data", data);

                i = new THREE.BufferAttribute(lineBucket.indexArray.uint16, 1);
                i.count = lineBucket.indexArray.length * 3;
                geo.setIndex(i);

                if (typeof graphic.mesh === "undefined") {
                    var material = symbol.material;

                    material.uniforms.u_ratio.value = 1;
                    material.depthTest = false;
                    var mesh = new THREE.Mesh(geo, material);
                    mesh.userData = {
                        feature: feature
                    };
                    graphic.id = mesh.uuid;
                    graphic.rendered = true;
                    graphic.mesh = mesh;
                    mesh.renderOrder = 1;
                    graphic.sameMaterial = true;
                    group.add(mesh);
                } else {
                    var theMesh = graphic.mesh;

                    // console.log(theMesh);
                    theMesh.renderOrder = 1;
                    theMesh.geometry.dispose();
                    theMesh.geometry = geo;
                    theMesh.material.uniforms.u_ratio.value = 1;
                }
                this._render();
                // console.log("children:",group.children);
            },
            /**
             * 绘制点
             * @param view      绘制的上下文
             * @param symbol    绘制符号
             * @param feature   属性数据
             * @param graphic   图形
             * @param group     点集
             */
            _renderPoint: function (view, symbol, feature, graphic, group) {
                var geometry = feature.geometry;
                var point = view._geometryToScene(geometry.x, geometry.y, geometry.z);

                var mesh;
                if (typeof graphic.mesh === "undefined") {
                    if (!symbol.mesh) {
                        var circle = new THREE.Sprite(symbol.material);
                        symbol.mesh = circle;
                    }
                    mesh = symbol.mesh.clone();
                    var scale = 1 / view.viewpoint.cameraToCenterDistance * symbol.size;
                    mesh.scale.set(scale, scale, 1);
                    mesh.position.set(point.x, point.y, 10);
                    mesh.userData = {
                        feature: feature
                    };
                    graphic.id = mesh.uuid;
                    graphic.rendered = true;
                    graphic.mesh = mesh;
                    graphic.sameMaterial = true;
                    graphic.sameGeometry = true;
                    graphic.hasTexture = true;
                    group.add(mesh);
                } else {
                    var theMesh = graphic.mesh;
                    theMesh.position.set(point.x, point.y, 10);
                    if (symbol.fixedSize) {
                        var scale = 1 / view.viewpoint.cameraToCenterDistance * symbol.size;
                        theMesh.scale.set(scale, scale, 1);
                    }
                }
                this._render();
            },
            /**
             * 绘制多边形
             * @param view      绘制的上下文
             * @param symbol    绘制符号
             * @param feature   属性数据
             * @param graphic   图形
             * @param group     点集
             */
            _renderPolygon: function (view, symbol, feature, graphic, group) {/*画面*/
                // console.log("render polygon");
                var geometry = feature.geometry;
                var path = geometry.path;
                var pos = group.position;
                var startPoint = view._geometryToScene(path[0].x, path[0].y, path[0].z);
                var shape = new THREE.Shape();
                shape.moveTo(startPoint.x - pos.x, startPoint.y - pos.y, 0.5);
                for (var i = 1; i < path.length; i++) {
                    var point = view._geometryToScene(path[i].x, path[i].y, path[i].z);
                    shape.lineTo(point.x - pos.x, point.y - pos.y, 0.5);
                }
                var g = new THREE.ShapeGeometry(shape);
                if (typeof graphic.mesh === "undefined") {
                    var m = symbol.material;
                    m.depthTest = false;
                    var mesh = new THREE.Mesh(g, m);
                    mesh.userData = {
                        feature: feature
                    };
                    graphic.id = mesh.uuid;
                    // graphic.rendered = true;
                    graphic.mesh = mesh;
                    mesh.position.set(0, 0, 1);
                    graphic.sameMaterial = true;
                    group.add(mesh);
                } else {
                    var theMesh = graphic.mesh;
                    theMesh.geometry = g;
                }
                // console.log("polygon draw");
                this._render();
            },
            /**
             * 绘制圆
             * @param view      绘制的上下文
             * @param symbol    绘制符号
             * @param feature   属性数据
             * @param graphic   图形
             * @param group     点集 
             * @param scale     缩放倍数
             */
            _renderCircle: function (view, symbol, feature, graphic, group, scale) {
                var center = feature.geometry.center;
                var radius = feature.geometry.radius;
                center = view._geometryToScene(center.x, center.y, center.z);
                var geometry = new THREE.CircleGeometry(radius, 256);
                if (typeof graphic.mesh === "undefined") {
                    symbol.material.depthTest = false;
                    var circle = new THREE.Mesh(geometry, symbol.material);
                    circle.position.set(center.x, center.y, 1);
                    /*if (symbol.fixedSize) {
                        circle.scale.set(scale, scale, 1);
                    }*/
                    graphic.id = circle.uuid;
                    graphic.mesh = circle;
                    group.add(circle);
                } else {
                    var theMesh = graphic.mesh;
                    theMesh.geometry = geometry;
                    /*if (symbol.fixedSize) {
                        theMesh.scale.set(scale, scale, 1);
                    }*/
                    theMesh.position.set(center.x, center.y, 1);
                }
                this._render();
            },
            /**
             * 绘制图片，标记图片
             * @param view      绘制的上下文
             * @param symbol    绘制符号
             * @param feature   属性数据
             * @param graphic   图形
             * @param group     点集 
             * @param scale     缩放倍数
             */
            _renderImage: function (view, symbol, feature, graphic, group, scale) {/*TODO 根据坐标点画标记点*/
                var geometry = feature.geometry;
                var point = view._geometryToScene(geometry.x, geometry.y, geometry.z);
                var pos = group.position;
                var mesh;

                if (typeof graphic.mesh === "undefined") {
                    if (!symbol.mesh) {
                        var geo = new THREE.PlaneGeometry(symbol.width, symbol.height);
                        symbol.mesh = new THREE.Mesh(geo, symbol.material);
                        symbol.rendered = true;
                        symbol.material.depthTest = false;
                    }
                    mesh = symbol.mesh.clone();
                    mesh.position.set(point.x - pos.x, point.y - pos.y, 1);
                    // console.log(scale);
                    mesh.scale.set(scale, scale, 1);
                    mesh.userData = {
                        feature: feature
                    };
                    graphic.id = mesh.uuid;
                    graphic.rendered = true;
                    graphic.mesh = mesh;
                    graphic.sameMaterial = true;
                    graphic.sameGeometry = true;
                    graphic.hasTexture = true;
                    group.add(mesh);
                } else {
                    var theMesh = graphic.mesh;
                    theMesh.position.set(point.x - pos.x, point.y - pos.y, 1);
                    if (symbol.fixedSize) {
                        theMesh.scale.set(scale, scale, 1);
                    }
                }
                this._render();
            },
            /**
             * 绘制球形
             * @param view      绘制的上下文
             * @param symbol    绘制符号
             * @param feature   属性数据
             * @param graphic   图形
             * @param group     点集 
             * @param scale     缩放倍数
             */
            _renderSphere: function (view, symbol, feature, graphic, group, scale) {/*TODO 根据坐标点画球*/
                var _geometry = feature.geometry;
                // console.log(_geometry.radius);
                var pos = group.position;
                var mesh;
                var sphereGeo = new THREE.SphereGeometry(_geometry.radius, 60, 60);
                if (!symbol.mesh) {
                    symbol.mesh = new THREE.Mesh(sphereGeo, symbol.material);
                    symbol.rendered = true;
                    symbol.material.depthTest = false;
                }
                var scenePoint = view._geometryToScene(_geometry.center.x, _geometry.center.y);
                if (typeof graphic.mesh === "undefined") {
                    mesh = symbol.mesh.clone();
                    mesh.position.set(scenePoint.x - pos.x, scenePoint.y - pos.y, 0.1);
                    graphic.id = mesh.uuid;
                    graphic.mesh = mesh;
                    group.add(mesh);
                } else {
                    var theMesh = graphic.mesh;
                    theMesh.geometry.dispose();
                    theMesh.geometry = sphereGeo;
                    theMesh.position.set(scenePoint.x - pos.x, scenePoint.y - pos.y, 0.1);
                }
                this._render();
            },
            /**
             * 坐标点标注
             * @param view      绘制的上下文
             * @param symbol    绘制符号
             * @param feature   属性数据
             * @param graphic   图形
             * @param group     点集 
             * @param scale     缩放倍数
             */
            _renderTextField: function (view, symbol, feature, graphic, group, scale) {
                // console.log("根据坐标点画标注",symbol.text);
                // console.log(graphic.id);
                this.ctx.strokeStyle = symbol.color;
                this.ctx.fillStyle = symbol.color;
                var _geometry = feature.geometry;
                var point = view._geometryToScene(_geometry.x, _geometry.y, _geometry.z);
                var pos = group.position;
                var mesh;
                var textureObj = this._createTextTexture(symbol.text);
                var mat = new THREE.SpriteMaterial({
                    map: textureObj,
                    depthTest: false,
                    opacity: 1,
                    transparent: true,
                    sizeAttenuation: false
                });
                if (!symbol.mesh) {
                    symbol.mesh = new THREE.Sprite(mat);/*TODO 屏幕缩放字体大小发生变化*/
                    // symbol.mesh.position.set(point.x - pos.x, point.y - pos.y, .1);
                    symbol.mesh.userData = {
                        type: feature.type
                    };
                }
                // console.log(graphic.mesh);
                if (typeof graphic.mesh === "undefined") {
                    mesh = symbol.mesh.clone();
                    if (symbol.fixedSize) {
                        mesh.scale.set(1 / view.initZ * this.canvas.width * scale, 1 / view.initZ * this.canvas.height * scale, 1);
                    }
                    mesh.material = mat;
                    mesh.material.depthTest = false;
                    mesh.renderOrder = 1;
                    mesh.position.set(point.x - pos.x, point.y - pos.y, .1);
                    graphic.id = mesh.uuid;
                    graphic.mesh = mesh;
                    group.add(mesh);
                    // console.log("add text");
                } else {
                    var theMesh = graphic.mesh;
                    theMesh.material = mat;
                    theMesh.material.depthTest = false;
                    theMesh.renderOrder = 1;
                    if (symbol.fixedSize) {
                        theMesh.scale.set(1 / view.initZ * this.canvas.width * scale, 1 / view.initZ * this.canvas.height * scale, 1);
                    }
                    theMesh.position.set(point.x - pos.x, point.y - pos.y, .1);
                }
                // console.log("text draw");
                // console.log("ID:" + graphic.id, "根据坐标点画标注:", graphic.symbol.text);
                // console.log(graphic.id);
                this._render();
            },
            /**
             * 关闭按钮
             * @param view      绘制的上下文
             * @param symbol    绘制符号
             * @param feature   属性数据
             * @param graphic   图形
             * @param group     点集 
             * @param scale     缩放倍数
             */
            _renderClose: function (view, symbol, feature, graphic, group, scale) {/*TODO 根据坐标点画关闭按钮*/
                // console.log("根据坐标点画标注",symbol.text);
                this.canvas.width = symbol.size;
                this.canvas.height = symbol.size;
                this.ctx.strokeStyle = symbol.color;
                this.ctx.fillStyle = symbol.color;
                var _geometry = feature.geometry;
                var point = view._geometryToScene(_geometry.x, _geometry.y, _geometry.z);
                var pos = group.position;
                var mesh;
                var textureObj = this._createCloseTexture(symbol.size, 1);
                // console.log(textureObj);
                var mat = new THREE.SpriteMaterial({
                    map: textureObj,
                    depthTest: false,
                    opacity: 1,
                    transparent: true,
                    sizeAttenuation: false
                });
                if (!symbol.mesh) {
                    symbol.mesh = new THREE.Sprite(mat);
                    symbol.mesh.position.set(point.x - pos.x, point.y - pos.y, 1);
                    symbol.mesh.userData = {
                        type: feature.type
                    };
                }
                // var cos = Math.cos(theta) * 60 * scale;
                if (typeof graphic.mesh === "undefined") {
                    mesh = symbol.mesh.clone();
                    mesh.material = mat;
                    mesh.renderOrder = 1;
                    mesh.scale.set(1 / view.initZ * this.canvas.width * scale, 1 / view.initZ * this.canvas.height * scale, 1);
                    mesh.position.set(point.x - pos.x + 20 * scale, point.y - pos.y, 0.1);
                    // mesh.position.set(point.x, point.y, 1);
                    // mesh.position.set(x - pos.x, y - pos.y, 0.1);
                    graphic.id = mesh.uuid;
                    graphic.mesh = mesh;
                    group.add(mesh);

                    console.log(mesh.position);
                } else {
                    var theMesh = graphic.mesh;
                    theMesh.material = mat;
                    theMesh.renderOrder = 1;
                    if (symbol.fixedSize) {
                        theMesh.scale.set(1 / view.initZ * this.canvas.width * scale, 1 / view.initZ * this.canvas.height * scale, 1);
                    }
                    // theMesh.position.set(x - pos.x, y - pos.y, 0.1);
                    theMesh.position.set(point.x - pos.x + 20 * scale, point.y - pos.y, 0.1);
                    // theMesh.position.set(point.x, point.y, 1);

                    // console.log(theMesh.position);
                }

                this._render();
            },
            /**
             * 文本图形效果
             * @param text 
             */
            _createTextTexture: function (text) {
                this.ctx.clearRect(0, 0, 100, 32);
                this.ctx.fillText(text, 4, 20);
                var texture = new THREE.CanvasTexture(this.canvas);
                texture.needsUpdate = true;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                return texture;
            },
            /**
             * 创建关闭效果
             * @param size      
             * @param lineWidth 线宽
             */
            _createCloseTexture: function (size, lineWidth) {
                var delta = lineWidth + 2;
                this.ctx.lineCap = "round";
                this.ctx.clearRect(0, 0, size, size);
                // this.ctx.strokeRect(this.lineWidth, this.lineWidth, this.size - this.lineWidth * 2, this.size - this.lineWidth * 2);
                this.ctx.strokeRect(0, 0, size, size);
                this.ctx.lineWidth = 2 * lineWidth;
                this.ctx.moveTo(delta, delta);
                this.ctx.lineTo(size - (delta), size - (delta));
                this.ctx.moveTo(delta, size - (delta));
                this.ctx.lineTo(size - delta, delta);
                this.ctx.stroke();
                return new THREE.CanvasTexture(this.canvas);
            },
            /**
             * 渲染
             */
            _render: function () {
                // this.view.threeRender();
                for (var i = 0; i < this._graphic.layer.layerViews.length; i++) {
                    var itemView = this._graphic.layer.layerViews[i];
                    // console.log(itemView.view._group);
                    if (itemView.view !== "EagleEye") {
                        itemView.view.threeRender();
                    }
                }
            },
            /**
             * 移除
             * @param graphic 
             */
            remove: function (graphic) {
                if (graphic) {
                    for (var i = 0; i < this._graphic.layer.layerViews.length; i++) {
                        var itemView = this._graphic.layer.layerViews[i];
                        // console.log(itemView.view);
                        if (itemView.view !== "EagleEye") {
                            var goup = itemView._group;
                            goup.remove(graphic.mesh);
                        }
                    }
                    // this._currentGroup.remove(graphic.mesh);
                    graphic.mesh = undefined;
                    graphic = null;
                    this._render();
                }
            },
            /**
             * 清空
             */
            clear: function () {
                for (var i = 0; i < this._graphic.layer.layerViews.length; i++) {
                    var itemView = this._graphic.layer.layerViews[i];
                    // console.log(itemView.view);
                    if (itemView.view !== "EagleEye") {
                        this.remove(this._graphic);
                    }
                }
                // if (this._currentGroup) {
                //     // this._currentGroup.remove(this._graphic.mesh);
                //     this._graphic.mesh = undefined;
                //     this._render();
                // }
            }
        });
    }
);