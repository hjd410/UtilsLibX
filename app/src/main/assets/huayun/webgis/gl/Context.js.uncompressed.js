/**
 * webgl上下文的封装类
 */
define("com/huayun/webgis/gl/Context", [
    "./BaseValue",
    "./Buffer",
    "./mode",
    "../utils/utils"
], function (BaseValue, Buffer, mode, utils) {
    var id = 0;

    /**
     * webgl上下文的封装类
     * @ignore
     * @private
     * @param {WebGLRenderingContext} gl webgl上下文
     * @constructor
     */
    function Context(gl) {
        this.id = id++;
        this.gl = gl;
        this.extVertexArrayObject = this.gl.getExtension('OES_vertex_array_object');
        this.clearColor = new BaseValue.ClearColor(this);
        this.colorMask = new BaseValue.ColorMask(this);
        this.clearDepth = new BaseValue.ClearDepth(this);
        this.depthRange = new BaseValue.DepthRange(this);
        this.depthMask = new BaseValue.DepthMask(this);
        this.depthTest = new BaseValue.DepthTest(this);
        this.depthFunc = new BaseValue.DepthFunc(this);
        this.cullFace = new BaseValue.CullFace(this);
        this.cullFaceSide = new BaseValue.CullFaceSide(this);
        this.blend = new BaseValue.Blend(this);
        this.blendFunc = new BaseValue.BlendFunc(this);
        this.blendColor = new BaseValue.BlendColor(this);
        this.blendEquation = new BaseValue.BlendEquation(this);
        this.clearStencil = new BaseValue.ClearStencil(this);
        this.stencilMask = new BaseValue.StencilMask(this);
        this.stencilFunc = new BaseValue.StencilFunc(this);
        this.stencilOp = new BaseValue.StencilOp(this);
        this.stencilTest = new BaseValue.StencilTest(this);

        this.frontFace = new BaseValue.FrontFace(this);
        this.program = new BaseValue.Program(this);
        this.activeTexture = new BaseValue.ActiveTextureUnit(this);
        this.viewport = new BaseValue.Viewport(this);

        this.bindFramebuffer = new BaseValue.BindFramebuffer(this);
        this.bindRenderbuffer = new BaseValue.BindRenderbuffer(this);
        this.bindTexture = new BaseValue.BindTexture(this);
        this.bindVertexArrayOES = this.extVertexArrayObject && new BaseValue.BindVertexArrayOES(this);
        this.bindElementBuffer = new BaseValue.BindElementBuffer(this);
        this.bindVertexBuffer = new BaseValue.BindVertexBuffer(this);

        this.pixelStoreUnpack = new BaseValue.PixelStoreUnpack(this);
        this.pixelStoreUnpackPremultiplyAlpha = new BaseValue.PixelStoreUnpackPremultiplyAlpha(this);
        this.pixelStoreUnpackFlipY = new BaseValue.PixelStoreUnpackFlipY(this);

        this.extTextureFilterAnisotropic = (
            gl.getExtension('EXT_texture_filter_anisotropic') ||
            gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
            gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
        );
        if (this.extTextureFilterAnisotropic) {
            this.extTextureFilterAnisotropicMax = gl.getParameter(this.extTextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        }

        this.extTextureHalfFloat = gl.getExtension('OES_texture_half_float');
        if (this.extTextureHalfFloat) {
            gl.getExtension('OES_texture_half_float_linear');
        }

        this.elementIndexUint = gl.getExtension("OES_element_index_uint");
        this.extInstancedArray = gl.getExtension('ANGLE_instanced_arrays');
    }

    Context.prototype.setDefault = function setDefault() {
        this.unbindVAO();

        this.clearColor.setDefault();
        this.clearDepth.setDefault();
        this.clearStencil.setDefault();
        this.colorMask.setDefault();


        this.stencilMask.setDefault();
        this.stencilFunc.setDefault();
        this.stencilOp.setDefault();
        this.stencilTest.setDefault();

        this.depthMask.setDefault();
        this.depthRange.setDefault();
        this.depthTest.setDefault();
        this.depthFunc.setDefault();


        // debugger;
        this.blend.setDefault();
        this.blendFunc.setDefault();
        this.blendColor.setDefault();
        this.blendEquation.setDefault();


        this.cullFace.setDefault();
        this.cullFaceSide.setDefault();
        this.frontFace.setDefault();
        this.program.setDefault();
        this.activeTexture.setDefault();
        this.bindFramebuffer.setDefault();
        this.pixelStoreUnpack.setDefault();
        this.pixelStoreUnpackPremultiplyAlpha.setDefault();
        this.pixelStoreUnpackFlipY.setDefault();
    };

    Context.prototype.setBasic = function setBasic() {
        this.clearColor.setDefault();
        this.clearDepth.setDefault();
        this.clearStencil.setDefault();
        this.colorMask.setDefault();


        this.stencilMask.setDefault();
        this.stencilFunc.setDefault();
        this.stencilOp.setDefault();
        this.stencilTest.setDefault();

        this.depthMask.setDefault();
        this.depthRange.setDefault();
        this.depthTest.setDefault();
        this.depthFunc.setDefault();


        // debugger;
        this.blend.setDefault();
        this.blendFunc.setDefault();
        this.blendColor.setDefault();
        this.blendEquation.setDefault();


        this.cullFace.setDefault();
        this.cullFaceSide.setDefault();
        this.frontFace.setDefault();
        this.program.setDefault();
        this.activeTexture.setDefault();
        this.bindFramebuffer.setDefault();
        this.pixelStoreUnpack.setDefault();
        this.pixelStoreUnpackPremultiplyAlpha.setDefault();
        this.pixelStoreUnpackFlipY.setDefault();
    };

    Context.prototype.setDirty = function setDirty() {
        this.clearColor.dirty = true;
        this.clearDepth.dirty = true;
        this.clearStencil.dirty = true;
        this.colorMask.dirty = true;
        this.depthMask.dirty = true;
        this.stencilMask.dirty = true;
        this.stencilFunc.dirty = true;
        this.stencilOp.dirty = true;
        this.stencilTest.dirty = true;
        this.depthRange.dirty = true;
        this.depthTest.dirty = true;
        this.depthFunc.dirty = true;
        this.blend.dirty = true;
        this.blendFunc.dirty = true;
        this.blendColor.dirty = true;
        this.blendEquation.dirty = true;
        this.cullFace.dirty = true;
        this.cullFaceSide.dirty = true;
        this.frontFace.dirty = true;
        this.program.dirty = true;
        this.activeTexture.dirty = true;
        this.viewport.dirty = true;
        this.bindFramebuffer.dirty = true;
        this.bindRenderbuffer.dirty = true;
        this.bindTexture.dirty = true;
        this.bindVertexBuffer.dirty = true;
        this.bindElementBuffer.dirty = true;
        if (this.extVertexArrayObject) {
            this.bindVertexArrayOES.dirty = true;
        }
        this.pixelStoreUnpack.dirty = true;
        this.pixelStoreUnpackPremultiplyAlpha.dirty = true;
        this.pixelStoreUnpackFlipY.dirty = true;
    };

    Context.prototype.createIndexBuffer = function createIndexBuffer(array, dynamicDraw) {
        return new Buffer.IndexBuffer(this, array, dynamicDraw);
    };

    Context.prototype.createVertexBuffer = function createVertexBuffer(array, attributes, dynamicDraw) {
        return new Buffer.VertexBuffer(this, array, attributes, dynamicDraw);
    };

    Context.prototype.createRenderbuffer = function createRenderbuffer(storageFormat, width, height) {
        var gl = this.gl;
        var rbo = gl.createRenderbuffer();
        this.bindRenderbuffer.set(rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, storageFormat, width, height);
        this.bindRenderbuffer.set(null);
        return rbo;
    };

    Context.prototype.createFramebuffer = function createFramebuffer(width, height) {
        return new Buffer.Framebuffer(this, width, height);
    };

    Context.prototype.clear = function clear(ref) {
        var color = ref.color;
        var depth = ref.depth;

        var gl = this.gl;
        var mask = 0;
        if (color) {
            mask |= gl.COLOR_BUFFER_BIT;
            this.clearColor.set(color);
            this.colorMask.set([true, true, true, true]);
        }
        if (typeof depth !== 'undefined') {
            mask |= gl.DEPTH_BUFFER_BIT;
            this.depthRange.set([0, 1]);
            this.clearDepth.set(depth);
            this.depthMask.set(true);
        }
        gl.clear(mask);
    };

    Context.prototype.setCullFace = function setCullFace(cullFaceMode) {
        if (cullFaceMode.enable === false) {
            this.cullFace.set(false);
        } else {
            this.cullFace.set(true);
            this.cullFaceSide.set(cullFaceMode.mode);
            this.frontFace.set(cullFaceMode.frontFace);
        }
    };
    Context.prototype.setDepthMode = function setDepthMode(depthMode) {
        if (depthMode.func === this.gl.ALWAYS && !depthMode.mask) {
            this.depthTest.set(false);
        } else {
            this.depthTest.set(true);
            this.depthFunc.set(depthMode.func);
            this.depthMask.set(depthMode.mask);
            this.depthRange.set(depthMode.range);
        }
    };

    /*Context.prototype.setDepthMode2 = function setDepthMode2(depthMode) {
        this.depthTest.set(true);
        this.depthFunc.set(depthMode.func);
        this.depthMask.set(depthMode.mask);
    };*/

    Context.prototype.setStencilMode = function setStencilMode(stencilMode) {
        if (stencilMode.test.func === this.gl.ALWAYS && !stencilMode.mask) {
            this.stencilTest.set(false);
        } else {
            this.stencilTest.set(true);
            this.stencilMask.set(stencilMode.mask);
            this.stencilOp.set([stencilMode.fail, stencilMode.depthFail, stencilMode.pass]);
            this.stencilFunc.set({
                func: stencilMode.test.func,
                ref: stencilMode.ref,
                mask: stencilMode.test.mask
            });
        }
    };

    Context.prototype.setColorMode = function setColorMode(colorMode) {
        if (utils.deepEqual(colorMode.blendFunction, mode.ColorMode.Replace)) {
            this.blend.set(false);
        } else {
            this.blend.set(true);
            this.blendFunc.set(colorMode.blendFunction);
            this.blendColor.set(colorMode.blendColor);
        }

        this.colorMask.set(colorMode.mask);
    };

    Context.prototype.unbindVAO = function () {
        if (this.extVertexArrayObject) {
            this.bindVertexArrayOES.set(null);
        }
    };

    return Context;
});
