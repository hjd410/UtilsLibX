define("com/huayun/webgis/gl/Buffer", [
    "exports",
    "./BaseValue",
    "../utils/Constant"
], function (f, BaseValue, Constant) {
    function IndexBuffer(context, array, dynamicDraw) {
        this.context = context;
        var gl = context.gl;
        this.buffer = gl.createBuffer();
        this.dynamicDraw = Boolean(dynamicDraw);
        this.context.unbindVAO();
        context.bindElementBuffer.set(this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array.arrayBuffer, this.dynamicDraw ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);

        if (!this.dynamicDraw) {
            delete array.arrayBuffer;
        }
    }

    IndexBuffer.prototype.bind = function bind() {
        this.context.bindElementBuffer.set(this.buffer);
    };

    IndexBuffer.prototype.updateData = function updateData(array) {
        var gl = this.context.gl;
        this.context.unbindVAO();
        this.bind();
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, array.arrayBuffer);
    };
    IndexBuffer.prototype.destroy = function destroy() {
        var gl = this.context.gl;
        if (this.buffer) {
            gl.deleteBuffer(this.buffer);
            delete this.buffer;
        }
    };
    f.IndexBuffer = IndexBuffer;

    var VertexBuffer = function VertexBuffer(context, array, attributes, dynamicDraw) {
        this.length = array.length;
        this.attributes = attributes;
        this.itemSize = array.bytesPerElement;
        this.dynamicDraw = dynamicDraw;
        this.context = context;
        var gl = context.gl;
        this.buffer = gl.createBuffer();
        context.bindVertexBuffer.set(this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array.arrayBuffer, this.dynamicDraw ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);

        if (!this.dynamicDraw) {
            delete array.arrayBuffer;
        }
    };

    VertexBuffer.prototype.bind = function bind() {
        this.context.bindVertexBuffer.set(this.buffer);
    };

    VertexBuffer.prototype.updateData = function updateData(array) {
        var gl = this.context.gl;
        this.bind();
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, array.arrayBuffer);
    };

    VertexBuffer.prototype.enableAttributes = function enableAttributes(gl, program) {
        for (var j = 0; j < this.attributes.length; j++) {
            var member = this.attributes[j];
            var attribIndex = program.attributes[member.name];
            if (attribIndex !== undefined) {
                gl.enableVertexAttribArray(attribIndex);
            }
        }
    };

    VertexBuffer.prototype.setVertexAttribPointers = function setVertexAttribPointers(gl, program, vertexOffset) {
        for (var j = 0; j < this.attributes.length; j++) {
            var member = this.attributes[j];
            var attribIndex = program.attributes[member.name];

            if (attribIndex !== undefined) {
                gl.vertexAttribPointer(
                    attribIndex,
                    member.components,
                    (gl)[Constant.AttributeType[member.type]],
                    false,
                    this.itemSize,
                    member.offset + (this.itemSize * (vertexOffset || 0))
                );
            }
        }
    };

    VertexBuffer.prototype.destroy = function destroy() {
        var gl = this.context.gl;
        if (this.buffer) {
            gl.deleteBuffer(this.buffer);
            delete this.buffer;
        }
    };
    f.VertexBuffer = VertexBuffer;

    var Framebuffer = function Framebuffer(context, width, height) {
        this.context = context;
        this.width = width;
        this.height = height;
        var gl = context.gl;
        var fbo = this.framebuffer = gl.createFramebuffer();

        this.colorAttachment = new BaseValue.ColorAttachment(context, fbo);
        this.depthAttachment = new BaseValue.DepthAttachment(context, fbo);
    };

    Framebuffer.prototype.destroy = function destroy() {
        var gl = this.context.gl;

        var texture = this.colorAttachment.get();
        if (texture) {
            gl.deleteTexture(texture);
        }

        var renderbuffer = this.depthAttachment.get();
        if (renderbuffer) {
            gl.deleteRenderbuffer(renderbuffer);
        }

        gl.deleteFramebuffer(this.framebuffer);
    };
    f.Framebuffer = Framebuffer;
});