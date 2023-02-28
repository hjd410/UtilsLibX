define("com/huayun/webgis/Model", [
    "./utils/glTFLoader",
    "./gl/SegmentVector",
    "custom/gl-matrix-min"
], function (glTFLoader, SegmentVector, glMatrix) {

    var drawModeCount = {
        "TRIANGLES": 3,
        "TriangleFan": 3,
        "TriangleStrip": 3
    }

    var state = {
        unload: 0,
        loading: 1,
        loaded: 2
    }

    function flatMesh(obj, currentRenderList, matrix) {
        var m;
        if (obj.matrix) {
            m = glMatrix.mat4.multiply(new Float32Array(16), matrix, obj.matrix);
        }
        if (obj.geometry) {
            obj.modelMatrix = m ? m : matrix;
            currentRenderList.push(obj);
        }
        if (obj.children) {
            obj.children.forEach(function (o) {
                flatMesh(o, currentRenderList, m ? m : matrix);
            });
        }
    }

    function createVertexArrayForGeometry(context, geometry, drawMode, modelMatrix, material) {
        var attributes = geometry.attributes;
        var position = attributes.position;
        var vertexBuffer = context.createVertexBuffer({
            length: position.count,
            bytesPerElement: position.itemSize * position.array.BYTES_PER_ELEMENT,
            arrayBuffer: position.array
        }, [
            {name: "position", type: "Float32", components: position.itemSize, offset: 0}
        ]);

        var indices = geometry.index;
        var indexBuffer = context.createIndexBuffer({
            arrayBuffer: indices.array
        });
        var segments = SegmentVector.simpleSegment(0, 0, position.count, indices.count / drawModeCount[drawMode]);
        return {
            vertexBuffer: vertexBuffer,
            indexBuffer: indexBuffer,
            segments: segments,
            modelMatrix: modelMatrix,
            material: material
        }
    }

    var uid = 0;

    function Model(props) {
        this.url = props.url;
        this.loaded = false;
        this.state = state.unload;
        this.buckets = [];
        this.id = "model" + (uid++);
    }

    Model.prototype.load = function (view, callback) {
        if (this.state === state.unload) {
            var context = view.context;
            var self = this;
            this.state = state.loading;
            glTFLoader.load(this.url, function (result) {
                self.loaded = true;
                self.state = state.loaded;
                var scene = result.scene;
                var currentRenderList = [];
                var matrix = glMatrix.mat4.create();
                flatMesh(scene, currentRenderList, matrix);
                // self.renderList = currentRenderList;
                for (var i = 0, ii = currentRenderList.length; i < ii; i++) {
                    var obj = currentRenderList[i];
                    var geometry = obj.geometry;
                    self.buckets.push(createVertexArrayForGeometry(context, geometry, obj.drawMode, obj.modelMatrix, obj.material));
                }
                callback();
            });
        }
    }

    return Model;
})