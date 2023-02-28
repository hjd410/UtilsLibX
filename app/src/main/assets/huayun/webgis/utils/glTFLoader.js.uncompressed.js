define("com/huayun/webgis/utils/glTFLoader", [
    "exports",
    "./Resource",
    "./utils",
    "custom/gl-matrix-min"
], function (exports, Resource, utils, glMatrix) {

    function clone(mesh) {
        var children = mesh.children;
        var obj = {
            children: []
        }
        for (var i=0;i<children.length;i++) {
            var item = children[i];
            obj.children.push({
                drawMode: item.drawMode,
                geometry: item.geometry,
                material: item.material,
                name: item.name
            })
        }
        return obj;
    }

    var defaultMaterial;
    var dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;

    var EXTENSIONS = {
        KHR_BINARY_GLTF: 'KHR_binary_glTF',
        KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
        KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
        KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
        KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
        KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
        MSFT_TEXTURE_DDS: 'MSFT_texture_dds'
    };

    var ALPHA_MODES = {
        OPAQUE: 'OPAQUE',
        MASK: 'MASK',
        BLEND: 'BLEND'
    };

    var ATTRIBUTES = {
        POSITION: 'position',
        NORMAL: 'normal',
        TANGENT: 'tangent',
        TEXCOORD_0: 'uv',
        TEXCOORD_1: 'uv2',
        COLOR_0: 'color',
        WEIGHTS_0: 'skinWeight',
        JOINTS_0: 'skinIndex',
    };

    var WEBGL_TYPE_SIZES = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    var WEBGL_COMPONENT_TYPES = {
        5120: Int8Array,
        5121: Uint8Array,
        5122: Int16Array,
        5123: Uint16Array,
        5125: Uint32Array,
        5126: Float32Array
    };

    var WEBGL_CONSTANTS = {
        FLOAT: 5126,
        //FLOAT_MAT2: 35674,
        FLOAT_MAT3: 35675,
        FLOAT_MAT4: 35676,
        FLOAT_VEC2: 35664,
        FLOAT_VEC3: 35665,
        FLOAT_VEC4: 35666,
        LINEAR: 9729,
        REPEAT: 10497,
        SAMPLER_2D: 35678,
        POINTS: 0,
        LINES: 1,
        LINE_LOOP: 2,
        LINE_STRIP: 3,
        TRIANGLES: 4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN: 6,
        UNSIGNED_BYTE: 5121,
        UNSIGNED_SHORT: 5123
    };

    /**
     * 加载gltf格式的文件, 本质上是个json格式
     * @ignore
     * @private
     * @param url
     * @param onLoad
     * @param onError
     */
    function load(url, onLoad, onError) {
        if (!onError && typeof onError !== 'function') {
            onError = function () {
            }
        }
        Resource.loadJson(url, function (error, response) {
            if (error) {
                onError(error);
            } else {
                if (response.asset === undefined || response.asset.version[0] < 2) {
                    onError(new Error('Unsupported asset. glTF versions >=2.0 are supported'));
                    return;
                }
                var extensions = {};
                if (response.extensionsUsed) {
                    // todo gltf扩展
                }
                var parser = new GLTFParser(response, extensions, {
                    // todo options
                });
                parser.parse(onLoad, onError);
            }
        });
    }

    function assignExtrasToUserData(object, gltfDef) {
        if (gltfDef.extras !== undefined) {
            if (typeof gltfDef.extras === 'object') {
                Object.assign(object.userData, gltfDef.extras);
            } else {
                console.warn('Ignoring primitive type .extras, ' + gltfDef.extras);
            }
        }
    }

    /**
     * GLTF解析类
     * @private
     * @ignore
     * @param json
     * @param extensions
     * @param options
     * @constructor
     */
    function GLTFParser(json, extensions, options) {
        this.json = json || {};
        this.extensions = extensions || {};
        this.options = options || {};

        this.cache = {}; // loader object cache
        this.primitiveCache = {}; // BufferGeometry caching
    }

    GLTFParser.prototype.parse = function (onLoad, onError) {
        var parser = this;
        var json = this.json;
        var extensions = this.extensions;
        this.cache = {}; // Clear the loader cache

        this.markDefs();

        Promise.all([
            this.getDependencies('scene'),
            this.getDependencies('animation'),
            this.getDependencies('camera')
        ]).then(function (dependencies) {
            var result = {
                scene: dependencies[ 0 ][ json.scene || 0 ],
                scenes: dependencies[ 0 ],
                animations: dependencies[ 1 ],
                cameras: dependencies[ 2 ],
                asset: json.asset,
                parser: parser,
                userData: {}
            };
            // addUnknownExtensionsToUserData( extensions, result, json );
            onLoad( result );
        })
    }
    GLTFParser.prototype.markDefs = function () {
        var json = this.json;
        var nodeDefs = json.nodes || [];
        var skinDefs = json.skins || [];
        var meshDefs = json.meshes || [];

        var meshReferences = {};
        var meshUses = {};

        for (var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
            var joints = skinDefs[skinIndex].joints;
            for (var i = 0, il = joints.length; i < il; i++) {
                nodeDefs[joints[i]].isBone = true;
            }
        }
        for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
            var nodeDef = nodeDefs[nodeIndex];
            if (nodeDef.mesh !== undefined) {
                if (meshReferences[nodeDef.mesh] === undefined) {
                    meshReferences[nodeDef.mesh] = meshUses[nodeDef.mesh] = 0;
                }
                meshReferences[nodeDef.mesh]++;
                if (nodeDef.skin !== undefined) {
                    meshDefs[nodeDef.mesh].isSkinnedMesh = true;
                }
            }
        }
        json.meshReferences = meshReferences;
        json.meshUses = meshUses;
    }

    GLTFParser.prototype.getDependencies = function (type) {
        var dependencies = this.cache[type];
        if (!dependencies) {
            var parser = this;
            var defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || [];
            dependencies = Promise.all(defs.map(function (def, index) {
                return parser.getDependency(type, index);
            }));
            this.cache[type] = dependencies;
        }
        return dependencies;
    }

    GLTFParser.prototype.getDependency = function (type, index) {
        var cacheKey = type + ':' + index;
        var dependency = this.cache[cacheKey];
        if (!dependency) {
            switch (type) {
                case 'scene':
                    dependency = this.loadScene(index);
                    break;
                case 'node':
                    dependency = this.loadNode(index);
                    break;
                case 'mesh':
                    dependency = this.loadMesh(index);
                    break;
                case 'accessor':
                    dependency = this.loadAccessor(index);
                    break;
                case 'bufferView':
                    dependency = this.loadBufferView(index);
                    break;
                case 'buffer':
                    dependency = this.loadBuffer(index);
                    break;
                case 'material':
                    dependency = this.loadMaterial(index);
                    break;
                case 'camera':
                    dependency = this.loadCamera(index);
                    break;
                case 'animation':
                    dependency = this.loadAnimation( index );
                    break;
            }
            this.cache[cacheKey] = dependency;
        }
        return dependency;
    }

    function buildNodeHierachy(nodeId, parentObject, json, parser) {
        var nodeDef = json.nodes[nodeId];
        return parser.getDependency('node', nodeId).then(function (node) {
            if (nodeDef.skin === undefined) return node;
            var skinEntry;
            return parser.getDependency('skin', nodeDef.skin).then(function (skin) {
                skinEntry = skin;
                var pendingJoints = [];
                for (var i = 0, il = skinEntry.joints.length; i < il; i++) {
                    pendingJoints.push(parser.getDependency('node', skinEntry.joints[i]));
                }
                return Promise.all(pendingJoints);
            }).then(function (jointNodes) {
                var meshes = node.isGroup === true ? node.children : [node];
                for (var i = 0, il = meshes.length; i < il; i++) {
                    var mesh = meshes[i];
                    var bones = [];
                    var boneInverses = [];
                    for (var j = 0, jl = jointNodes.length; j < jl; j++) {

                        var jointNode = jointNodes[j];

                        if (jointNode) {

                            bones.push(jointNode);

                            var mat = new THREE.Matrix4();

                            if (skinEntry.inverseBindMatrices !== undefined) {

                                mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);

                            }

                            boneInverses.push(mat);

                        } else {

                            console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j]);

                        }

                    }
                    mesh.bind(new THREE.Skeleton(bones, boneInverses), mesh.matrixWorld);
                }
                return node;
            });
        }).then(function (node) {
            // parentObject.add(node);
            if (!parentObject.children) {
                parentObject.children = [];
            }
            parentObject.children.push(node);
            var pending = [];
            if (nodeDef.children) {
                var children = nodeDef.children;
                for (var i = 0, il = children.length; i < il; i++) {
                    var child = children[i];
                    pending.push(buildNodeHierachy(child, node, json, parser));
                }
            }
            return Promise.all(pending);
        });
    }

    /**
     * 加载scene数据
     * @param sceneIndex
     */
    GLTFParser.prototype.loadScene = function (sceneIndex) {
        var json = this.json;
        var extensions = this.extensions;
        var sceneDef = this.json.scenes[sceneIndex];
        var parser = this;

        var scene = {};
        if ( sceneDef.name !== undefined ) scene.name = sceneDef.name;
        assignExtrasToUserData( scene, sceneDef );
        if ( sceneDef.extensions ) addUnknownExtensionsToUserData( extensions, scene, sceneDef );

        var nodeIds = sceneDef.nodes || [];
        var pending = [];
        for (var i = 0, il = nodeIds.length; i < il; i++) {
            pending.push(buildNodeHierachy(nodeIds[i], scene, json, parser));
        }
        return Promise.all(pending).then(function () {
            return scene;
        });
    }

    /**
     * 加载node数据
     * @param nodeIndex
     */
    GLTFParser.prototype.loadNode = function (nodeIndex) {
        var json = this.json;
        var extensions = this.extensions;
        var parser = this;
        var meshReferences = json.meshReferences;
        var meshUses = json.meshUses;
        var nodeDef = json.nodes[nodeIndex];

        var pending;
        if (nodeDef.isBone === true) {
            // todo bone
            console.log("bone");
        } else if (nodeDef.mesh !== undefined) {
            pending = parser.getDependency('mesh', nodeDef.mesh).then(function (mesh) {
                var node;
                if (meshReferences[nodeDef.mesh] > 1) {
                    var instanceNum = meshUses[nodeDef.mesh]++;
                    node = clone(mesh);


                    // node = mesh.clone();
                    // node = utils.clone(mesh);
                    /*node = {
                        children: mesh.children
                    };*/
                    node.name += '_instance_' + instanceNum;
                    // onBeforeRender copy for Specular-Glossiness
                    node.onBeforeRender = mesh.onBeforeRender;

                    for (var i = 0, il = node.children.length; i < il; i++) {
                        node.children[i].name += '_instance_' + instanceNum;
                        node.children[i].onBeforeRender = mesh.children[i].onBeforeRender;
                    }
                } else {
                    node = mesh;
                }
                if (nodeDef.weights !== undefined) {
                    node.traverse(function (o) {
                        if (!o.isMesh) return;
                        for (var i = 0, il = nodeDef.weights.length; i < il; i++) {
                            o.morphTargetInfluences[i] = nodeDef.weights[i];
                        }
                    });
                }
                return node;
            });
        } else if (nodeDef.camera !== undefined) {
            pending = parser.getDependency('camera', nodeDef.camera);
        } else if (nodeDef.extensions
            && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL]
            && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].light !== undefined) {
            // todo extensions
            console.log("extensions");
        } else {
            // console.log("else");
            pending = Promise.resolve({});
        }
        return pending.then(function (node) {
            if (nodeDef.name !== undefined) {
                node.name = nodeDef.name; // THREE.PropertyBinding.sanitizeNodeName( nodeDef.name );
            }
            assignExtrasToUserData(node, nodeDef);
            if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);

            if (nodeDef.matrix !== undefined) {
                /*var matrix = new THREE.Matrix4();
                matrix.fromArray(nodeDef.matrix);
                node.applyMatrix(matrix);*/
                node.matrix = glMatrix.mat4.clone(nodeDef.matrix);
            } else {
                // todo translation-rotation-scale
                /*if (nodeDef.translation !== undefined) {
                    node.position.fromArray(nodeDef.translation);
                }

                if (nodeDef.rotation !== undefined) {
                    node.quaternion.fromArray(nodeDef.rotation);
                }

                if (nodeDef.scale !== undefined) {
                    node.scale.fromArray(nodeDef.scale);
                }*/
            }
            return node;
        });
    }

    function createDefaultMaterial() {
        /*defaultMaterial = defaultMaterial || new THREE.MeshStandardMaterial( {
            color: 0xFFFFFF,
            emissive: 0x000000,
            metalness: 1,
            roughness: 1,
            transparent: false,
            depthTest: true,
            side: THREE.FrontSide
        } );
        return defaultMaterial;*/
        return {
            color: 0xFFFFFF,
            emissive: 0x000000,
            metalness: 1,
            roughness: 1,
            transparent: false,
            depthTest: true,
            side: 1
        };
    }

    GLTFParser.prototype.loadMesh = function (meshIndex) {
        var parser = this;
        var json = this.json;

        var meshDef = json.meshes[meshIndex];
        var primitives = meshDef.primitives;

        var pending = [];

        for (var i = 0, il = primitives.length; i < il; i++) {
            var material = primitives[i].material === undefined
                ? createDefaultMaterial()
                : this.getDependency('material', primitives[i].material);
            pending.push(material);
        }
        return Promise.all(pending).then(function (originalMaterials) {
            return parser.loadGeometries(primitives).then(function (geometries) {
                var meshes = [];
                for (var i = 0, il = geometries.length; i < il; i++) {
                    var geometry = geometries[i];
                    var primitive = primitives[i];

                    // 1. create Mesh
                    var mesh;
                    var material = originalMaterials[i];
                    if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
                        primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
                        primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
                        primitive.mode === undefined) {
                        // .isSkinnedMesh isn't in glTF spec. See .markDefs()
                        mesh = meshDef.isSkinnedMesh === true
                            ? {
                                geometry: geometry,
                                material: material
                            } : {
                                geometry: geometry,
                                material: material
                            };
                        if (mesh.isSkinnedMesh === true) mesh.normalizeSkinWeights(); // #15319

                        if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
                            mesh.drawMode = "TriangleStrip"; //THREE.TriangleStripDrawMode;
                        } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
                            mesh.drawMode = "TriangleFan";//THREE.TriangleFanDrawMode;
                        } else {
                            mesh.drawMode = "TRIANGLES";
                        }
                    } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {

                        // mesh = new THREE.LineSegments(geometry, material);
                        mesh = {
                            geometry: geometry,
                            material: material,
                            drawMode: "Lines"
                        }

                    } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {

                        // mesh = new THREE.Line(geometry, material);
                        mesh = {
                            geometry: geometry,
                            material: material,
                            drawMode: "LineStrip"
                        }

                    } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {

                        // mesh = new THREE.LineLoop(geometry, material);
                        mesh = {
                            geometry: geometry,
                            material: material,
                            drawMode: "LineLoop"
                        }

                    } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
                        // mesh = new THREE.Points(geometry, material);
                        mesh = {
                            geometry: geometry,
                            material: material,
                            drawMode: "Points"
                        }
                    } else {
                        throw new Error('Primitive mode unsupported: ' + primitive.mode);
                    }

                    if (mesh.geometry.morphAttributes && Object.keys(mesh.geometry.morphAttributes).length > 0) {
                        updateMorphTargets(mesh, meshDef);
                    }

                    mesh.name = meshDef.name || ('mesh_' + meshIndex);
                    if (geometries.length > 1) mesh.name += '_' + i;
                    assignExtrasToUserData(mesh, meshDef);
                    parser.assignFinalMaterial(mesh);
                    meshes.push(mesh);
                }
                if (meshes.length === 1) {
                    // return meshes[0];
                    return {
                        children: meshes
                    }
                }

                var group = {
                    children: []
                };

                for (var i = 0, il = meshes.length; i < il; i++) {
                    group.children.push(meshes[i]);
                }

                return group;
            })
        })
    };

    GLTFParser.prototype.assignFinalMaterial = function (mesh) {
        var geometry = mesh.geometry;
        var material = mesh.material;
        var extensions = this.extensions;

        var useVertexTangents = geometry.attributes.tangent !== undefined;
        var useVertexColors = geometry.attributes.color !== undefined;
        var useFlatShading = geometry.attributes.normal === undefined;
        var useSkinning = mesh.isSkinnedMesh === true;
        var useMorphTargets = geometry.morphAttributes && Object.keys(geometry.morphAttributes).length > 0;
        var useMorphNormals = useMorphTargets && geometry.morphAttributes && geometry.morphAttributes.normal !== undefined;

        if (mesh.isPoints) {
            // todo isPoints
            console.log("isPoints");
        } else if (mesh.isLine) {
            // todo isLine
            console.log("isLine");
        }

        if (useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets) {
            var cacheKey = 'ClonedMaterial:' + material.uuid + ':';
            if (material.isGLTFSpecularGlossinessMaterial) cacheKey += 'specular-glossiness:';
            if (useSkinning) cacheKey += 'skinning:';
            if (useVertexTangents) cacheKey += 'vertex-tangents:';
            if (useVertexColors) cacheKey += 'vertex-colors:';
            if (useFlatShading) cacheKey += 'flat-shading:';
            if (useMorphTargets) cacheKey += 'morph-targets:';
            if (useMorphNormals) cacheKey += 'morph-normals:';

            var cachedMaterial = this.cache[cacheKey]

            if (!cachedMaterial) {
                cachedMaterial = material.isGLTFSpecularGlossinessMaterial
                    ? extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].cloneMaterial(material) : material.clone();
                if (useSkinning) cachedMaterial.skinning = true;
                if (useVertexTangents) cachedMaterial.vertexTangents = true;
                if (useVertexColors) cachedMaterial.vertexColors = THREE.VertexColors;
                if (useFlatShading) cachedMaterial.flatShading = true;
                if (useMorphTargets) cachedMaterial.morphTargets = true;
                if (useMorphNormals) cachedMaterial.morphNormals = true;
                this.cache[cacheKey] = cachedMaterial;
            }
            material = cachedMaterial;
        }

        if (material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined) {
            console.log('Duplicating UVs to support aoMap.');
            // geometry.addAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
        }

        if (material.isGLTFSpecularGlossinessMaterial) {
            // for GLTFSpecularGlossinessMaterial(ShaderMaterial) uniforms runtime update
            mesh.onBeforeRender = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].refreshUniforms;
        }
        mesh.material = material;
    };

    GLTFParser.prototype.loadMaterial = function (materialIndex) {
        var parser = this;
        var json = this.json;
        var extensions = this.extensions;
        var materialDef = json.materials[materialIndex];

        var materialType;
        var materialParams = {};
        var materialExtensions = materialDef.extensions || {};
        var pending = [];

        if (materialExtensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {
            // todo EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS
            console.log(EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS);
        } else if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
            // todo EXTENSIONS.KHR_MATERIALS_UNLIT
            console.log(EXTENSIONS.KHR_MATERIALS_UNLIT);
        } else {
            var metallicRoughness = materialDef.pbrMetallicRoughness || {};
            materialParams.color = [1.0, 1.0, 1.0];
            materialParams.opacity = 1.0;
            if (Array.isArray(metallicRoughness.baseColorFactor)) {
                var array = metallicRoughness.baseColorFactor;
                materialParams.color = array.slice(0, 3);
                materialParams.opacity = array[3];
            }
            if (metallicRoughness.baseColorTexture !== undefined) {
                // todo baseColorTexture
                console.log("metallicRoughness.baseColorTexture");
            }
            materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
            materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;
            if (metallicRoughness.metallicRoughnessTexture !== undefined) {
                // todo metallicRoughness.metallicRoughnessTexture
                console.log("metallicRoughness.metallicRoughnessTexture");
            }
        }
        if (materialDef.doubleSided === true) {
            materialParams.side = 2;
        }
        var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
        if (alphaMode === ALPHA_MODES.BLEND) {
            materialParams.transparent = true;
        } else {
            materialParams.transparent = false;
            if (alphaMode === ALPHA_MODES.MASK) {
                materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;
            }
        }
        if (materialDef.normalTexture !== undefined) {
            // todo materialDef.normalTexture
            console.log("materialDef.normalTexture");
        }

        if (materialDef.occlusionTexture !== undefined) {
            // todo materialDef.occlusionTexture
            console.log("materialDef.occlusionTexture");
        }

        if (materialDef.emissiveFactor !== undefined) {
            materialParams.emissive = materialDef.emissiveFactor;
        }

        if (materialDef.emissiveTexture !== undefined) {
            // todo materialDef.emissiveTexture
            console.log("materialDef.emissiveTexture");
        }
        return Promise.all(pending).then(function () {
            return materialParams;
        });
    }

    function createPrimitiveKey(primitiveDef) {
        var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
        var geometryKey;
        if (dracoExtension) {
            geometryKey = 'draco:' + dracoExtension.bufferView + ':' + dracoExtension.indices
                + ':' + createAttributesKey(dracoExtension.attributes);
        } else {
            geometryKey = primitiveDef.indices + ':' + createAttributesKey(primitiveDef.attributes) + ':' + primitiveDef.mode;
        }
        return geometryKey;
    }

    function createAttributesKey(attributes) {
        var attributesKey = '';
        var keys = Object.keys(attributes).sort();
        for (var i = 0, il = keys.length; i < il; i++) {
            attributesKey += keys[i] + ':' + attributes[keys[i]] + ';';
        }
        return attributesKey;
    }

    function addPrimitiveAttributes(geometry, primitiveDef, parser) {
        var attributes = primitiveDef.attributes;
        var pending = [];

        function assignAttributeAccessor(accessorIndex, attributeName) {
            return parser.getDependency('accessor', accessorIndex).then(function (accessor) {
                // geometry.addAttribute(attributeName, accessor);
                geometry.attributes[attributeName] = accessor;
            });
        }

        for (var gltfAttributeName in attributes) {
            var threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
            if (threeAttributeName in geometry.attributes) continue;
            pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
        }

        if (primitiveDef.indices !== undefined && !geometry.index) {
            var accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {
                // geometry.setIndex(accessor);
                geometry.index = accessor;
            });
            pending.push(accessor);
        }

        assignExtrasToUserData(geometry, primitiveDef);

        return Promise.all(pending).then(function () {
            return primitiveDef.targets !== undefined
                ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
        });
    }

    function cloneBufferAttribute(attribute) {
        if (attribute.isInterleavedBufferAttribute) {
            var count = attribute.count;
            var itemSize = attribute.itemSize;
            var array = attribute.array.slice(0, count * itemSize);
            for (var i = 0, j = 0; i < count; ++i) {
                array[j++] = attribute.getX(i);
                if (itemSize >= 2) array[j++] = attribute.getY(i);
                if (itemSize >= 3) array[j++] = attribute.getZ(i);
                if (itemSize >= 4) array[j++] = attribute.getW(i);

            }
            // return new THREE.BufferAttribute( array, itemSize, attribute.normalized );
            return {
                array: array,
                itemSize: itemSize,
                count: array.length / itemSize,
                dynamic: false,
                normalized: attribute.normalized === true
            }
        }
        return attribute.clone();

    }

    function addMorphTargets(geometry, targets, parser) {
        var hasMorphPosition = false;
        var hasMorphNormal = false;
        for (var i = 0, il = targets.length; i < il; i++) {
            var target = targets[i];
            if (target.POSITION !== undefined) hasMorphPosition = true;
            if (target.NORMAL !== undefined) hasMorphNormal = true;
            if (hasMorphPosition && hasMorphNormal) break;
        }

        if (!hasMorphPosition && !hasMorphNormal) return Promise.resolve(geometry);
        var pendingPositionAccessors = [];
        var pendingNormalAccessors = [];

        for (var i = 0, il = targets.length; i < il; i++) {
            var target = targets[i];
            if (hasMorphPosition) {
                var pendingAccessor = target.POSITION !== undefined
                    ? parser.getDependency('accessor', target.POSITION)
                    : geometry.attributes.position;
                pendingPositionAccessors.push(pendingAccessor);
            }
            if (hasMorphNormal) {
                var pendingAccessor = target.NORMAL !== undefined
                    ? parser.getDependency('accessor', target.NORMAL)
                    : geometry.attributes.normal;
                pendingNormalAccessors.push(pendingAccessor);
            }
        }

        return Promise.all([
            Promise.all(pendingPositionAccessors),
            Promise.all(pendingNormalAccessors)
        ]).then(function (accessors) {
            var morphPositions = accessors[0];
            var morphNormals = accessors[1];

            for (var i = 0, il = morphPositions.length; i < il; i++) {
                if (geometry.attributes.position === morphPositions[i]) continue;
                morphPositions[i] = cloneBufferAttribute(morphPositions[i]);
            }

            for (var i = 0, il = morphNormals.length; i < il; i++) {
                if (geometry.attributes.normal === morphNormals[i]) continue;
                morphNormals[i] = cloneBufferAttribute(morphNormals[i]);
            }

            for (var i = 0, il = targets.length; i < il; i++) {
                var target = targets[i];
                var attributeName = 'morphTarget' + i;
                if (hasMorphPosition) {
                    // Three.js morph position is absolute value. The formula is
                    //   basePosition
                    //     + weight0 * ( morphPosition0 - basePosition )
                    //     + weight1 * ( morphPosition1 - basePosition )
                    //     ...
                    // while the glTF one is relative
                    //   basePosition
                    //     + weight0 * glTFmorphPosition0
                    //     + weight1 * glTFmorphPosition1
                    //     ...
                    // then we need to convert from relative to absolute here.
                    if (target.POSITION !== undefined) {
                        var positionAttribute = morphPositions[i];
                        positionAttribute.name = attributeName;
                        var position = geometry.attributes.position;
                        for (var j = 0, jl = positionAttribute.count; j < jl; j++) {
                            positionAttribute.setXYZ(
                                j,
                                positionAttribute.getX(j) + position.getX(j),
                                positionAttribute.getY(j) + position.getY(j),
                                positionAttribute.getZ(j) + position.getZ(j)
                            );
                        }
                    }
                }
                if (hasMorphNormal) {
                    if (target.NORMAL !== undefined) {
                        var normalAttribute = morphNormals[i];
                        normalAttribute.name = attributeName;
                        var normal = geometry.attributes.normal;
                        for (var j = 0, jl = normalAttribute.count; j < jl; j++) {
                            normalAttribute.setXYZ(
                                j,
                                normalAttribute.getX(j) + normal.getX(j),
                                normalAttribute.getY(j) + normal.getY(j),
                                normalAttribute.getZ(j) + normal.getZ(j)
                            );
                        }
                    }
                }
            }
            if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
            if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
            return geometry;
        });

    }

    GLTFParser.prototype.loadGeometries = function (primitives) {
        var parser = this;
        var extensions = this.extensions;
        var cache = this.primitiveCache;
        var pending = [];
        for (var i = 0, il = primitives.length; i < il; i++) {
            var primitive = primitives[i];
            var cacheKey = createPrimitiveKey(primitive);
            var cached = cache[cacheKey];
            if (cached) {
                pending.push(cached.promise);
            } else {
                var geometryPromise;
                if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {
                    // todo EXTENSIONS.KHR_DRACO_MESH_COMPRESSION
                    console.log("EXTENSIONS.KHR_DRACO_MESH_COMPRESSION");
                } else {
                    geometryPromise = addPrimitiveAttributes({
                        attributes: {},
                        index: null
                    }, primitive, parser);
                }
                cache[cacheKey] = {
                    primitive: primitive,
                    promise: geometryPromise
                };
                pending.push(geometryPromise);
            }
        }
        return Promise.all(pending);
    }

    GLTFParser.prototype.loadAccessor = function (accessorIndex) {
        var parser = this;
        var json = this.json;
        var accessorDef = json.accessors[accessorIndex];

        if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
            return Promise.resolve(null);
        }

        var pendingBufferViews = [];

        if (accessorDef.bufferView !== undefined) {
            pendingBufferViews.push(this.getDependency('bufferView', accessorDef.bufferView));
        } else {
            pendingBufferViews.push(null);
        }

        if (accessorDef.sparse !== undefined) {
            pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.indices.bufferView));
            pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.values.bufferView));
        }

        return Promise.all(pendingBufferViews).then(function (bufferViews) {
            var bufferView = bufferViews[0];

            var itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
            var TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];

            var elementBytes = TypedArray.BYTES_PER_ELEMENT;
            var itemBytes = elementBytes * itemSize;
            var byteOffset = accessorDef.byteOffset || 0;
            var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[accessorDef.bufferView].byteStride : undefined;
            var normalized = accessorDef.normalized === true;
            var array, bufferAttribute;

            if (byteStride && byteStride !== itemBytes) {
                var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType;
                var ib = parser.cache[ibCacheKey];
                // todo
                throw new Error("ib");
                /*if (!ib) {
                    array = new TypedArray(bufferView);
                    // ib = new THREE.InterleavedBuffer(array, byteStride / elementBytes);
                    parser.cache[ibCacheKey] = ib;
                }*/
                // bufferAttribute = new THREE.InterleavedBufferAttribute(ib, itemSize, byteOffset / elementBytes, normalized);
            } else {
                if (bufferView === null) {
                    array = new TypedArray(accessorDef.count * itemSize);
                } else {
                    array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
                }
                // bufferAttribute = new THREE.BufferAttribute(array, itemSize, normalized);
                bufferAttribute = {
                    array: array,
                    itemSize: itemSize,
                    count: accessorDef.count,
                    dynamic: false,
                    normalized: normalized === true
                };
            }

            if (accessorDef.sparse !== undefined) {
                var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
                var TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];

                var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
                var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

                var sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
                var sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);

                if (bufferView !== null) {
                    bufferAttribute.setArray(bufferAttribute.array.slice());
                }

                for (var i = 0, il = sparseIndices.length; i < il; i++) {
                    var index = sparseIndices[i];
                    bufferAttribute.setX(index, sparseValues[i * itemSize]);

                    if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
                    if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
                    if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
                    if (itemSize >= 5) throw new Error('Unsupported itemSize in sparse BufferAttribute.');
                }
            }
            return bufferAttribute;
        });
    }

    /**
     * 加载bufferview数据
     * @ignore
     * @private
     * @param json
     * @param extensions
     * @param bufferViewIndex
     * @return {*}
     */
    GLTFParser.prototype.loadBufferView = function (bufferViewIndex) {
        var bufferViewDef = this.json.bufferViews[bufferViewIndex];

        return this.getDependency('buffer', bufferViewDef.buffer).then(function (buffer) {
            var byteLength = bufferViewDef.byteLength || 0;
            var byteOffset = bufferViewDef.byteOffset || 0;
            return buffer.slice(byteOffset, byteOffset + byteLength);
        });
    }

    /**
     * 加载buffer数据
     * @ignore
     * @private
     * @param json
     * @param extensions
     * @param bufferIndex
     * @return {Promise<unknown>}
     */
    GLTFParser.prototype.loadBuffer = function (bufferIndex) {
        var bufferDef = this.json.buffers[bufferIndex];

        if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
            throw new Error(bufferDef.type + ' buffer type is not supported.');
        }

        if (bufferDef.uri === undefined && bufferIndex === 0) {
            return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
        }

        return new Promise(function (resolve, reject) {
            var url = bufferDef.uri;
            var dataUriRegexResult = url.match(dataUriRegex);
            if (dataUriRegexResult) {
                var mimeType = dataUriRegexResult[1];
                var isBase64 = !!dataUriRegexResult[2];
                var data = dataUriRegexResult[3];
                data = decodeURIComponent(data);
                if (isBase64) data = atob(data);
                try {
                    var view = new Uint8Array(data.length);
                    for (var i = 0; i < data.length; i++) {
                        view[i] = data.charCodeAt(i);
                    }
                    resolve(view.buffer);
                } catch (e) {
                    reject(new Error('Failed to load buffer "' + bufferDef.uri + '".'));
                }
            }
        });
    }

    GLTFParser.prototype.loadCamera = function (cameraIndex) {
        var camera;
        var cameraDef = this.json.cameras[cameraIndex];
        var params = cameraDef[cameraDef.type];

        if (!params) {
            console.warn('Missing camera parameters.');
            return;
        }

        if (cameraDef.type === 'perspective') {
            // camera = new THREE.PerspectiveCamera(THREE.Math.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
            var projectionMatrix = glMatrix.mat4.perspective(new Float64Array(16), params.yfov, params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
            camera = {
                projectionMatrix: projectionMatrix
            }
        } else if (cameraDef.type === 'orthographic') {
            // todo orthographic
            console.log("orthographic");
            // camera = new THREE.OrthographicCamera(params.xmag / -2, params.xmag / 2, params.ymag / 2, params.ymag / -2, params.znear, params.zfar);
        }
        if (cameraDef.name !== undefined) camera.name = cameraDef.name;
        assignExtrasToUserData(camera, cameraDef);
        return Promise.resolve(camera);
    }

    GLTFParser.prototype.loadAnimation = function(animationIndex) {

    }

    exports.load = load;
})