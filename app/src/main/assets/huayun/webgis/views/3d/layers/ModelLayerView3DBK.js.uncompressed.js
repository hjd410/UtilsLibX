define("com/huayun/webgis/views/3d/layers/ModelLayerView3DBK", [
    "dojo/_base/declare",
    "./LayerView3D",
    "../../../gl/mode"
], function (declare, LayerView3D, mode) {
    return declare("com.huayun.webgis.views.3d.layers.ModelLayerView3D", [LayerView3D], {
        constructor: function (params) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();
            this.visible = params.visible;
            this.layer = params.layer;
            this.id = params.id;

            var lights = params.lights;
            lights.forEach(function (item) {
                this.scene.add(item);
            }.bind(this));
            this._loader = this.layer.loader;

            this.view = params.view;
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.view._canvas,
                context: this.view._gl,
                antialias: true
            });
            this.renderer.autoClear = false;
            this.renderingMode = "3d";
        },

        addModel: function (model, callback) {
            this._loader.load(model.url, function (m) {
                /*model.loaded = true;
                model.obj = m;
                this.scene.add(m);
                if (this.view._load) {
                  this.view.threeRender();
                }*/
                callback(model, m);
            }.bind(this))
        },

        refresh: function () {
            this._readyData();
            this.view.threeRender();
        },
        _readyData: function () {
        },
        _render: function () {
            if (this.visible && this.view._load) {
                var context = this.view.context;
                this.view.setCustomLayerDefaults();
                context.setColorMode(this.colorModeForRenderPass());
                context.setStencilMode(mode.StencilMode.disabled);
                this.view.currentLayer++;
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                var depthMode = new mode.DepthMode(context.gl.LEQUAL, mode.DepthMode.ReadWrite, this.depthRangeFor3D);
                context.setDepthMode(depthMode);
                this.doRender(context.gl);
                context.setDirty();
                this.view.setBaseState();
            }
        },
        colorModeForRenderPass: function () {
            return mode.ColorMode.alphaBlended;
        },
        depthModeForSublayer: function (n, mask, func) {
            var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
        },
        doRender: function (gl) {
            /*if (this.model) {
              /!*var matrix = this.transform.getMatrixForModel(position.x, position.y);
              var m = new THREE.Matrix4().fromArray(matrix);

              var rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                Math.PI/2 - this.layer.rotate // todo 待封装
              );
              var r = this.view.viewpoint.tileInfo.getResolution(this.view.level);

              var l = new THREE.Matrix4()
                .makeTranslation(0, 0, 100/r)
                .multiply(rotationZ)
                .scale(new THREE.Vector3(0.06/r, 0.06/r, 0.06/r));*!/
              var m = new THREE.Matrix4().fromArray(this.transform.matrix);
              this.camera.projectionMatrix = m;
              this.renderer.state.reset();
              this.renderer.render(this.scene, this.camera);
            }*/
            var center = this.view.center;
            var matrix = this.transform.getMatrixForModel(center.x, center.y);
            var r = this.view.viewpoint.tileInfo.getResolution(this.view.level);

            this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
            for (var i = 0; i < this.layer.models.length; i++) {
                var model = this.layer.models[i];
                if (model.loaded) {
                    var obj = model.obj;
                    if (model.keepCenter) {
                        obj.position.set(0, 0, model.position.z / r);
                    } else {
                        obj.position.set((model.position.x - center.x) / r, (model.position.y - center.y) / r, model.position.z / r);
                    }
                    obj.scale.set(model.scale.x / r, model.scale.y / r, model.scale.z / r);
                    var rotate = model.rotate;
                    obj.rotation.set(rotate.x, rotate.y, rotate.z, 'XYZ');
                }
            }
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
        },
        zoom: function () {
            this._render();
        }
    });
});