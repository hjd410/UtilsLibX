/**
 *  @author :   wushengfei
 *  @date   :   2019/7/17
 *  @description :
 *  @module com/huayun/webgis/views
 *  @see com.huayun.webgis.views.GraphicView
 */
define("com/huayun/webgis/views/GraphicView", [
], function () {
    /**
     * 构造函数
     * @constructor
     * @alias com.huayun.webgis.views.GraphicView
     * @property {Array} _group   - 图形群数组
     * @property {View} view      - 视图
     *  
     */
    function GraphicView(params) {
        this.declaredClass = "com.huayun.webgis.views.GraphicView";
        this._group = params.group;
        this.view = params.view;
    }
    GraphicView.prototype.renderGraphic = function (graphic, group, scale) {
       // console.log(graphic);
        var symbol = graphic.symbol;
        var feature = graphic.feature;
        switch (symbol.type) {
            case "line":
                this._renderLine(symbol, feature, graphic, group);
                break;
            case "point":
                this._renderPoint(symbol, feature, graphic, group, scale);
                break;
            case "polygon":
                this._renderPolygon(symbol, feature, graphic, group);
                break;
            case "image":
                this._renderImage(symbol, feature, graphic, group, scale);
                break;

        }
    };
    GraphicView.prototype._renderLine = function (symbol, feature, graphic, group) {
        var geometry = feature.geometry;
        var g = new THREE.Geometry();
        var point;
        var pos = group.position;
        for (var i = 0; i < geometry.length; i++) {
            point = this.view._geometryToScene(geometry[i].x, geometry[i].y, geometry[i].z);
            g.vertices.push(new THREE.Vector3(point.x - pos.x, point.y - pos.y, 0.5));
        }
        var m = symbol.material;
        var mesh = new THREE.Line(g, m);
        mesh.userData = {
            feature: feature
        };
        graphic.id = mesh.uuid;
        graphic.rendered = true;
        graphic.mesh = mesh;
        graphic.sameMaterial = true;
        group.add(mesh);
    };
    GraphicView.prototype._renderPoint = function (symbol, feature, graphic, group) {
        var geometry = feature.geometry;
        var point = this.view._geometryToScene(geometry.x, geometry.y, geometry.z);
        var pos = group.position;
        var mesh;
        if (!symbol.mesh) {
            var circle = new THREE.Sprite(symbol.material);
            var scale = 1/this.view.initZ*symbol.size;
            circle.scale.set(scale, scale, 1);
            symbol.mesh = circle;
        }
        mesh = symbol.mesh.clone();
        mesh.position.set(point.x - pos.x, point.y - pos.y, point.z - pos.z);
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
    };

    GraphicView.prototype._renderPolygon = function (symbol, feature, graphic, group) {
        var geometry = feature.geometry;
        var path = geometry.path;
        var pos = group.position;
        var startPoint = this.view._geometryToScene(path[0].x, path[0].y, path[0].z);
        var shape = new THREE.Shape();
        shape.moveTo(startPoint.x - pos.x, startPoint.y - pos.y, 0.5);
        for (var i = 1; i < path.length; i++) {
            var point = this.view._geometryToScene(path[i].x, path[i].y, path[i].z);
            shape.lineTo(point.x - pos.x, point.y - pos.y, 0.5);
        }

        var g = new THREE.ShapeGeometry(shape);
        if(graphic.id === 0){
            var m = symbol.material;
            var mesh = new THREE.Mesh(g, m);
            mesh.userData = {
                feature: feature
            };
            graphic.id = mesh.uuid;
            // graphic.rendered = true;
            graphic.mesh = mesh;
            graphic.sameMaterial = true;
            group.add(mesh);
        }else{
            var theMesh = graphic.mesh;
            theMesh.geometry = g;
            // console.log(theMesh);
        }
        // console.log(graphic.id);
        // var g = new THREE.ShapeGeometry(shape);
        // var m = symbol.material;
        // var mesh = new THREE.Mesh(g, m);
        // mesh.userData = {
        //     feature: feature
        // };
        // graphic.id = mesh.uuid;
        // graphic.rendered = true;
        // graphic.mesh = mesh;
        // graphic.sameMaterial = true;
        // group.add(mesh);
    };

    GraphicView.prototype._renderImage = function (symbol, feature, graphic, group, scale) {//根据坐标画标记点
        var geometry = feature.geometry;
        var point = this.view._geometryToScene(geometry.x, geometry.y, geometry.z);
        var pos = group.position;
        var mesh;
        if (!symbol.mesh) {
            var geo = new THREE.PlaneGeometry(symbol.width, symbol.height);
            symbol.mesh = new THREE.Mesh(geo, symbol.material);
            symbol.rendered = true;
        }
        mesh = symbol.mesh.clone();
        mesh.position.set(point.x - pos.x, point.y - pos.y, 0.2);
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
    };
    
    return GraphicView;
});