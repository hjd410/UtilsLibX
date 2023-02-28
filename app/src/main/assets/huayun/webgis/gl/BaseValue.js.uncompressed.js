define("com/huayun/webgis/gl/BaseValue", [
    "require",
    "exports",
    "../utils/Color"
],function (e, f, Color) {
    Object.defineProperty(f, "__esModule", {value: !0});

    e = function () {
        function BaseValue(context) {
            this.gl = context.gl;
            this.default = this.getDefault();
            this.current = this.default;
            this.dirty = false;
        }
        BaseValue.prototype.get = function get() {
            return this.current;
        };
        BaseValue.prototype.set = function set(value) {};

        BaseValue.prototype.getDefault = function getDefault() {
            return this.default;
        };
        BaseValue.prototype.setDefault = function setDefault() {
            this.set(this.default);
        };
        return BaseValue;
    }();
    f.BaseValue = e;

    var value = (function (BaseValue) {
        function BindVertexArrayOES(context) {
            BaseValue.call(this, context);
            this.vao = context.extVertexArrayObject;
        }

        if (BaseValue) BindVertexArrayOES.__proto__ = BaseValue;
        BindVertexArrayOES.prototype = Object.create(BaseValue && BaseValue.prototype);
        BindVertexArrayOES.prototype.constructor = BindVertexArrayOES;
        BindVertexArrayOES.prototype.getDefault = function getDefault() {
            return null;
        };
        BindVertexArrayOES.prototype.set = function set(v) {
            if (!this.vao || v === this.current && !this.dirty) {
                return;
            }
            this.vao.bindVertexArrayOES(v);
            this.current = v;
            this.dirty = false;
        };

        return BindVertexArrayOES;
    }(e));
    f.BindVertexArrayOES = value;

    value = function (BaseValue) {
        function BindElementBuffer() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) BindElementBuffer.__proto__ = BaseValue;
        BindElementBuffer.prototype = Object.create(BaseValue && BaseValue.prototype);
        BindElementBuffer.prototype.constructor = BindElementBuffer;

        BindElementBuffer.prototype.getDefault = function getDefault() {
            return null;
        };
        BindElementBuffer.prototype.set = function set(v) {
            var gl = this.gl;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, v);
            this.current = v;
            this.dirty = false;
        };
        return BindElementBuffer;
    }(e);
    f.BindElementBuffer = value;

    value = function (BaseValue) {
        function BindVertexBuffer() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) BindVertexBuffer.__proto__ = BaseValue;
        BindVertexBuffer.prototype = Object.create(BaseValue && BaseValue.prototype);
        BindVertexBuffer.prototype.constructor = BindVertexBuffer;

        BindVertexBuffer.prototype.getDefault = function getDefault() {
            return null;
        };
        BindVertexBuffer.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            var gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, v);
            this.current = v;
            this.dirty = false;
        };

        return BindVertexBuffer;
    }(e);
    f.BindVertexBuffer = value;

    value = (function (BaseValue) {
        function BindFramebuffer() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) BindFramebuffer.__proto__ = BaseValue;
        BindFramebuffer.prototype = Object.create(BaseValue && BaseValue.prototype);
        BindFramebuffer.prototype.constructor = BindFramebuffer;

        BindFramebuffer.prototype.getDefault = function getDefault() {
            return null;
        };
        BindFramebuffer.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            var gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, v);
            this.current = v;
            this.dirty = false;
        };

        return BindFramebuffer;
    }(e));
    f.BindFramebuffer = value;

    value = (function (BaseValue) {
        function BindRenderbuffer() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) BindRenderbuffer.__proto__ = BaseValue;
        BindRenderbuffer.prototype = Object.create(BaseValue && BaseValue.prototype);
        BindRenderbuffer.prototype.constructor = BindRenderbuffer;

        BindRenderbuffer.prototype.getDefault = function getDefault() {
            return null;
        };
        BindRenderbuffer.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            var gl = this.gl;
            gl.bindRenderbuffer(gl.RENDERBUFFER, v);
            this.current = v;
            this.dirty = false;
        };

        return BindRenderbuffer;
    }(e));
    f.BindRenderbuffer = value;

    value = (function (BaseValue) {
        function BindTexture() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) BindTexture.__proto__ = BaseValue;
        BindTexture.prototype = Object.create(BaseValue && BaseValue.prototype);
        BindTexture.prototype.constructor = BindTexture;

        BindTexture.prototype.getDefault = function getDefault() {
            return null;
        };
        BindTexture.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, v);
            this.current = v;
            this.dirty = false;
        };

        return BindTexture;
    }(e));
    f.BindTexture = value;

    value = (function (BaseValue) {
        function ClearColor() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) ClearColor.__proto__ = BaseValue;
        ClearColor.prototype = Object.create(BaseValue && BaseValue.prototype);
        ClearColor.prototype.constructor = ClearColor;

        ClearColor.prototype.getDefault = function getDefault() {
            return Color.transparent;
        };
        ClearColor.prototype.set = function set(v) {
            var c = this.current;
            if (v.r === c.r && v.g === c.g && v.b === c.b && v.a === c.a && !this.dirty) {
                return;
            }
            this.gl.clearColor(v.r, v.g, v.b, v.a);
            this.current = v;
            this.dirty = false;
        };

        return ClearColor;
    }(e));
    f.ClearColor = value;

    value = (function (BaseValue) {
        function ClearDepth() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) ClearDepth.__proto__ = BaseValue;
        ClearDepth.prototype = Object.create(BaseValue && BaseValue.prototype);
        ClearDepth.prototype.constructor = ClearDepth;

        ClearDepth.prototype.getDefault = function getDefault() {
            return 1;
        };
        ClearDepth.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            this.gl.clearDepth(v);
            this.current = v;
            this.dirty = false;
        };

        return ClearDepth;
    }(e));
    f.ClearDepth = value;

    value = (function (BaseValue) {
        function ColorMask() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) ColorMask.__proto__ = BaseValue;
        ColorMask.prototype = Object.create(BaseValue && BaseValue.prototype);
        ColorMask.prototype.constructor = ColorMask;

        ColorMask.prototype.getDefault = function getDefault() {
            return [true, true, true, true];
        };
        ColorMask.prototype.set = function set(v) {
            var c = this.current;
            if (v[0] === c[0] && v[1] === c[1] && v[2] === c[2] && v[3] === c[3] && !this.dirty) {
                return;
            }
            this.gl.colorMask(v[0], v[1], v[2], v[3]);
            this.current = v;
            this.dirty = false;
        };

        return ColorMask;
    }(e));
    f.ColorMask = value;

    value = (function (BaseValue) {
        function DepthMask() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) DepthMask.__proto__ = BaseValue;
        DepthMask.prototype = Object.create(BaseValue && BaseValue.prototype);
        DepthMask.prototype.constructor = DepthMask;

        DepthMask.prototype.getDefault = function getDefault() {
            return true;
        };
        DepthMask.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            this.gl.depthMask(v);
            this.current = v;
            this.dirty = false;
        };

        return DepthMask;
    }(e));
    f.DepthMask = value;

    value = (function (BaseValue) {
        function DepthRange() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) DepthRange.__proto__ = BaseValue;
        DepthRange.prototype = Object.create(BaseValue && BaseValue.prototype);
        DepthRange.prototype.constructor = DepthRange;

        DepthRange.prototype.getDefault = function getDefault() {
            return [0, 1];
        };
        DepthRange.prototype.set = function set(v) {
            var c = this.current;
            if (v[0] === c[0] && v[1] === c[1] && !this.dirty) {
                return;
            }
            this.gl.depthRange(v[0], v[1]);
            this.current = v;
            this.dirty = false;
        };

        return DepthRange;
    }(e));
    f.DepthRange =value;

    value = (function (BaseValue) {
        function DepthTest () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) DepthTest.__proto__ = BaseValue;
        DepthTest.prototype = Object.create( BaseValue && BaseValue.prototype );
        DepthTest.prototype.constructor = DepthTest;

        DepthTest.prototype.getDefault = function getDefault ()          {
            return false;
        };
        DepthTest.prototype.set = function set (v         ) {
            if (v === this.current && !this.dirty) { return; }
            var gl = this.gl;
            if (v) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
            this.current = v;
            this.dirty = false;
        };

        return DepthTest;
    }(e));
    f.DepthTest = value;

    value = (function (BaseValue) {
        function DepthFunc () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) DepthFunc.__proto__ = BaseValue;
        DepthFunc.prototype = Object.create( BaseValue && BaseValue.prototype );
        DepthFunc.prototype.constructor = DepthFunc;

        DepthFunc.prototype.getDefault = function getDefault ()                {
            return this.gl.LESS;
        };
        DepthFunc.prototype.set = function set (v               ) {
            if (v === this.current && !this.dirty) { return; }
            this.gl.depthFunc(v);
            this.current = v;
            this.dirty = false;
        };

        return DepthFunc;
    }(e));
    f.DepthFunc = value;

    value = (function (BaseValue) {
        function CullFace() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) CullFace.__proto__ = BaseValue;
        CullFace.prototype = Object.create(BaseValue && BaseValue.prototype);
        CullFace.prototype.constructor = CullFace;

        CullFace.prototype.getDefault = function getDefault() {
            return false;
        };
        CullFace.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            var gl = this.gl;
            if (v) {
                gl.enable(gl.CULL_FACE);
            } else {
                gl.disable(gl.CULL_FACE);
            }
            this.current = v;
            this.dirty = false;
        };

        return CullFace;
    }(e));
    f.CullFace = value;

    value = (function (BaseValue) {
        function CullFaceSide() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) CullFaceSide.__proto__ = BaseValue;
        CullFaceSide.prototype = Object.create(BaseValue && BaseValue.prototype);
        CullFaceSide.prototype.constructor = CullFaceSide;

        CullFaceSide.prototype.getDefault = function getDefault() {
            return this.gl.BACK;
        };
        CullFaceSide.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            this.gl.cullFace(v);
            this.current = v;
            this.dirty = false;
        };

        return CullFaceSide;
    }(e));
    f.CullFaceSide = value;

    value = (function (BaseValue) {
        function Blend () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) Blend.__proto__ = BaseValue;
        Blend.prototype = Object.create( BaseValue && BaseValue.prototype );
        Blend.prototype.constructor = Blend;

        Blend.prototype.getDefault = function getDefault ()          {
            return false;
        };
        Blend.prototype.set = function set (v         ) {
            if (v === this.current && !this.dirty) { return; }
            var gl = this.gl;
            if (v) {
                gl.enable(gl.BLEND);
            } else {
                gl.disable(gl.BLEND);
            }
            this.current = v;
            this.dirty = false;
        };

        return Blend;
    }(e));
    f.Blend = value;

    value = (function (BaseValue) {
        function BlendFunc () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) BlendFunc.__proto__ = BaseValue;
        BlendFunc.prototype = Object.create( BaseValue && BaseValue.prototype );
        BlendFunc.prototype.constructor = BlendFunc;

        BlendFunc.prototype.getDefault = function getDefault ()                {
            var gl = this.gl;
            return [gl.ONE, gl.ZERO];
        };
        BlendFunc.prototype.set = function set (v               ) {
            var c = this.current;
            if (v[0] === c[0] && v[1] === c[1] && !this.dirty) { return; }
            this.gl.blendFunc(v[0], v[1]);
            this.current = v;
            this.dirty = false;
        };

        return BlendFunc;
    }(e));
    f.BlendFunc = value;

    value = (function (BaseValue) {
        function BlendColor () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) BlendColor.__proto__ = BaseValue;
        BlendColor.prototype = Object.create( BaseValue && BaseValue.prototype );
        BlendColor.prototype.constructor = BlendColor;

        BlendColor.prototype.getDefault = function getDefault ()        {
            return Color.transparent;
        };
        BlendColor.prototype.set = function set (v       ) {
            var c = this.current;
            if (v.r === c.r && v.g === c.g && v.b === c.b && v.a === c.a && !this.dirty) { return; }
            this.gl.blendColor(v.r, v.g, v.b, v.a);
            this.current = v;
            this.dirty = false;
        };

        return BlendColor;
    }(e));
    f.BlendColor = value;

    value = (function (BaseValue) {
        function BlendEquation () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) BlendEquation.__proto__ = BaseValue;
        BlendEquation.prototype = Object.create( BaseValue && BaseValue.prototype );
        BlendEquation.prototype.constructor = BlendEquation;

        BlendEquation.prototype.getDefault = function getDefault ()                    {
            return this.gl.FUNC_ADD;
        };
        BlendEquation.prototype.set = function set (v                   ) {
            if (v === this.current && !this.dirty) { return; }
            this.gl.blendEquation(v);
            this.current = v;
            this.dirty = false;
        };

        return BlendEquation;
    }(e));
    f.BlendEquation = value;

    value = (function (BaseValue) {
        function ActiveTextureUnit () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) ActiveTextureUnit.__proto__ = BaseValue;
        ActiveTextureUnit.prototype = Object.create( BaseValue && BaseValue.prototype );
        ActiveTextureUnit.prototype.constructor = ActiveTextureUnit;

        ActiveTextureUnit.prototype.getDefault = function getDefault ()                  {
            return this.gl.TEXTURE0;
        };
        ActiveTextureUnit.prototype.set = function set (v                 ) {
            if (v === this.current && !this.dirty) { return; }
            this.gl.activeTexture(v);
            this.current = v;
            this.dirty = false;
        };

        return ActiveTextureUnit;
    }(e));
    f.ActiveTextureUnit = value;

    value = (function (BaseValue) {
        function PixelStoreUnpack () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) PixelStoreUnpack.__proto__ = BaseValue;
        PixelStoreUnpack.prototype = Object.create( BaseValue && BaseValue.prototype );
        PixelStoreUnpack.prototype.constructor = PixelStoreUnpack;

        PixelStoreUnpack.prototype.getDefault = function getDefault ()         {
            return 4;
        };
        PixelStoreUnpack.prototype.set = function set (v        ) {
            if (v === this.current && !this.dirty) { return; }
            var gl = this.gl;
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, v);
            this.current = v;
            this.dirty = false;
        };

        return PixelStoreUnpack;
    }(e));
    f.PixelStoreUnpack = value;

    value = (function (BaseValue) {
        function PixelStoreUnpackPremultiplyAlpha () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) PixelStoreUnpackPremultiplyAlpha.__proto__ = BaseValue;
        PixelStoreUnpackPremultiplyAlpha.prototype = Object.create( BaseValue && BaseValue.prototype );
        PixelStoreUnpackPremultiplyAlpha.prototype.constructor = PixelStoreUnpackPremultiplyAlpha;

        PixelStoreUnpackPremultiplyAlpha.prototype.getDefault = function getDefault ()          {
            return false;
        };
        PixelStoreUnpackPremultiplyAlpha.prototype.set = function set (v         )       {
            if (v === this.current && !this.dirty) { return; }
            var gl = this.gl;
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, (v     ));
            this.current = v;
            this.dirty = false;
        };

        return PixelStoreUnpackPremultiplyAlpha;
    }(e));
    f.PixelStoreUnpackPremultiplyAlpha = value;

    value = (function (BaseValue) {
        function PixelStoreUnpackFlipY () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) PixelStoreUnpackFlipY.__proto__ = BaseValue;
        PixelStoreUnpackFlipY.prototype = Object.create( BaseValue && BaseValue.prototype );
        PixelStoreUnpackFlipY.prototype.constructor = PixelStoreUnpackFlipY;

        PixelStoreUnpackFlipY.prototype.getDefault = function getDefault ()          {
            return false;
        };
        PixelStoreUnpackFlipY.prototype.set = function set (v         )       {
            if (v === this.current && !this.dirty) { return; }
            var gl = this.gl;
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, (v     ));
            this.current = v;
            this.dirty = false;
        };

        return PixelStoreUnpackFlipY;
    }(e));
    f.PixelStoreUnpackFlipY = value;

    value = (function (BaseValue) {
        function FrontFace () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) FrontFace.__proto__ = BaseValue;
        FrontFace.prototype = Object.create( BaseValue && BaseValue.prototype );
        FrontFace.prototype.constructor = FrontFace;

        FrontFace.prototype.getDefault = function getDefault ()                {
            return this.gl.CCW;
        };
        FrontFace.prototype.set = function set (v               ) {
            if (v === this.current && !this.dirty) { return; }
            this.gl.frontFace(v);
            this.current = v;
            this.dirty = false;
        };

        return FrontFace;
    }(e));
    f.FrontFace = value;

    value = (function (BaseValue) {
        function ClearStencil () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) ClearStencil.__proto__ = BaseValue;
        ClearStencil.prototype = Object.create( BaseValue && BaseValue.prototype );
        ClearStencil.prototype.constructor = ClearStencil;

        ClearStencil.prototype.getDefault = function getDefault ()         {
            return 0;
        };
        ClearStencil.prototype.set = function set (v        ) {
            if (v === this.current && !this.dirty) { return; }
            this.gl.clearStencil(v);
            this.current = v;
            this.dirty = false;
        };

        return ClearStencil;
    }(e));
    f.ClearStencil = value;

    value = (function (BaseValue) {
        function StencilMask () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) StencilMask.__proto__ = BaseValue;
        StencilMask.prototype = Object.create( BaseValue && BaseValue.prototype );
        StencilMask.prototype.constructor = StencilMask;

        StencilMask.prototype.getDefault = function getDefault ()         {
            return 0xFF;
        };
        StencilMask.prototype.set = function set (v        )       {
            if (v === this.current && !this.dirty) { return; }
            this.gl.stencilMask(v);
            this.current = v;
            this.dirty = false;
        };

        return StencilMask;
    }(e));
    f.StencilMask = value;

    value = (function (BaseValue) {
        function StencilFunc () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) StencilFunc.__proto__ = BaseValue;
        StencilFunc.prototype = Object.create( BaseValue && BaseValue.prototype );
        StencilFunc.prototype.constructor = StencilFunc;

        StencilFunc.prototype.getDefault = function getDefault ()                  {
            return {
                func: this.gl.ALWAYS,
                ref: 0,
                mask: 0xFF
            };
        };
        StencilFunc.prototype.set = function set (v                 )       {
            var c = this.current;
            if (v.func === c.func && v.ref === c.ref && v.mask === c.mask && !this.dirty) { return; }
            this.gl.stencilFunc(v.func, v.ref, v.mask);
            this.current = v;
            this.dirty = false;
        };

        return StencilFunc;
    }(e));
    f.StencilFunc =value;

    value = (function (BaseValue) {
        function StencilOp () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) StencilOp.__proto__ = BaseValue;
        StencilOp.prototype = Object.create( BaseValue && BaseValue.prototype );
        StencilOp.prototype.constructor = StencilOp;

        StencilOp.prototype.getDefault = function getDefault ()                {
            var gl = this.gl;
            return [gl.KEEP, gl.KEEP, gl.KEEP];
        };
        StencilOp.prototype.set = function set (v               ) {
            var c = this.current;
            if (v[0] === c[0] && v[1] === c[1] && v[2] === c[2] && !this.dirty) { return; }
            this.gl.stencilOp(v[0], v[1], v[2]);
            this.current = v;
            this.dirty = false;
        };

        return StencilOp;
    }(e));
    f.StencilOp = value;

    value = (function (BaseValue) {
        function StencilTest () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) StencilTest.__proto__ = BaseValue;
        StencilTest.prototype = Object.create( BaseValue && BaseValue.prototype );
        StencilTest.prototype.constructor = StencilTest;

        StencilTest.prototype.getDefault = function getDefault ()          {
            return false;
        };
        StencilTest.prototype.set = function set (v         ) {
            if (v === this.current && !this.dirty) { return; }
            var gl = this.gl;
            if (v) {
                gl.enable(gl.STENCIL_TEST);
            } else {
                gl.disable(gl.STENCIL_TEST);
            }
            this.current = v;
            this.dirty = false;
        };

        return StencilTest;
    }(e));
    f.StencilTest = value;

    value = (function (BaseValue) {
        function Viewport () {
            BaseValue.apply(this, arguments);
        }

        if ( BaseValue ) Viewport.__proto__ = BaseValue;
        Viewport.prototype = Object.create( BaseValue && BaseValue.prototype );
        Viewport.prototype.constructor = Viewport;

        Viewport.prototype.getDefault = function getDefault ()               {
            var gl = this.gl;
            return [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight];
        };
        Viewport.prototype.set = function set (v              ) {
            var c = this.current;
            if (v[0] === c[0] && v[1] === c[1] && v[2] === c[2] && v[3] === c[3] && !this.dirty) { return; }
            this.gl.viewport(v[0], v[1], v[2], v[3]);
            this.current = v;
            this.dirty = false;
        };

        return Viewport;
    }(e));
    f.Viewport = value;

    var FramebufferAttachment = (function (BaseValue) {
        function FramebufferAttachment(context         , parent                  ) {
            BaseValue.call(this, context);
            this.context = context;
            this.parent = parent;
        }

        if ( BaseValue ) FramebufferAttachment.__proto__ = BaseValue;
        FramebufferAttachment.prototype = Object.create( BaseValue && BaseValue.prototype );
        FramebufferAttachment.prototype.constructor = FramebufferAttachment;
        FramebufferAttachment.prototype.getDefault = function getDefault () {
            return null;
        };

        return FramebufferAttachment;
    }(e));
    f.FramebufferAttachment = FramebufferAttachment;

    value = (function (FramebufferAttachment) {
        function ColorAttachment () {
            FramebufferAttachment.apply(this, arguments);
        }

        if ( FramebufferAttachment ) ColorAttachment.__proto__ = FramebufferAttachment;
        ColorAttachment.prototype = Object.create( FramebufferAttachment && FramebufferAttachment.prototype );
        ColorAttachment.prototype.constructor = ColorAttachment;

        ColorAttachment.prototype.setDirty = function setDirty () {
            this.dirty = true;
        };
        ColorAttachment.prototype.set = function set (v               )       {
            if (v === this.current && !this.dirty) { return; }
            this.context.bindFramebuffer.set(this.parent);
            // note: it's possible to attach a renderbuffer to the color
            // attachment point, but thus far MBGL only uses textures for color
            var gl = this.gl;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, v, 0);
            this.current = v;
            this.dirty = false;
        };

        return ColorAttachment;
    }(FramebufferAttachment));
    f.ColorAttachment = value;

    value = (function (FramebufferAttachment) {
        function DepthAttachment () {
            FramebufferAttachment.apply(this, arguments);
        }

        if ( FramebufferAttachment ) DepthAttachment.__proto__ = FramebufferAttachment;
        DepthAttachment.prototype = Object.create( FramebufferAttachment && FramebufferAttachment.prototype );
        DepthAttachment.prototype.constructor = DepthAttachment;

        DepthAttachment.prototype.set = function set (v                    )       {
            if (v === this.current && !this.dirty) { return; }
            this.context.bindFramebuffer.set(this.parent);
            var gl = this.gl;
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, v);
            this.current = v;
            this.dirty = false;
        };

        return DepthAttachment;
    }(FramebufferAttachment));
    f.DepthAttachment = value;

    f.Program = (function (BaseValue) {
        function Program() {
            BaseValue.apply(this, arguments);
        }

        if (BaseValue) Program.__proto__ = BaseValue;
        Program.prototype = Object.create(BaseValue && BaseValue.prototype);
        Program.prototype.constructor = Program;

        Program.prototype.getDefault = function getDefault() {
            return null;
        };
        Program.prototype.set = function set(v) {
            if (v === this.current && !this.dirty) {
                return;
            }
            this.gl.useProgram(v);
            this.current = v;
            this.dirty = false;
        };

        return Program;
    }(e));
});