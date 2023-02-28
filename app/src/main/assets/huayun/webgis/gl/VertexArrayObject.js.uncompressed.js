define("com/huayun/webgis/gl/VertexArrayObject", [], function () {
    function VertexArrayObject() {
        this.boundProgram = null;
        this.boundLayoutVertexBuffer = null;
        this.boundPaintVertexBuffers = [];
        this.boundIndexBuffer = null;
        this.boundVertexOffset = null;
        this.boundDynamicVertexBuffer = null;
        this.vao = null;
    }

    VertexArrayObject.prototype.bind = function bind(context, program, layoutVertexBuffer, paintVertexBuffers, indexBuffer,
                                                     vertexOffset, dynamicVertexBuffer, dynamicVertexBuffer2) {

        this.context = context;
        var paintBuffersDiffer = this.boundPaintVertexBuffers.length !== paintVertexBuffers.length;
        for (var i = 0; !paintBuffersDiffer && i < paintVertexBuffers.length; i++) {
            if (this.boundPaintVertexBuffers[i] !== paintVertexBuffers[i]) {
                paintBuffersDiffer = true;
            }
        }
        var isFreshBindRequired = (
            !this.vao ||
            this.boundProgram !== program ||
            this.boundLayoutVertexBuffer !== layoutVertexBuffer ||
            paintBuffersDiffer ||
            this.boundIndexBuffer !== indexBuffer ||
            this.boundVertexOffset !== vertexOffset ||
            this.boundDynamicVertexBuffer !== dynamicVertexBuffer ||
            this.boundDynamicVertexBuffer2 !== dynamicVertexBuffer2
        );

        if (!context.extVertexArrayObject || isFreshBindRequired) {
            this.freshBind(program, layoutVertexBuffer, paintVertexBuffers, indexBuffer, vertexOffset, dynamicVertexBuffer, dynamicVertexBuffer2);
        } else {
            context.bindVertexArrayOES.set(this.vao);
            if (dynamicVertexBuffer) {
                dynamicVertexBuffer.bind();
            }
            if (indexBuffer && indexBuffer.dynamicDraw) {
                indexBuffer.bind();
            }
            if (dynamicVertexBuffer2) {
                dynamicVertexBuffer2.bind();
            }
        }
    };

    VertexArrayObject.prototype.freshBind = function freshBind(program, layoutVertexBuffer, paintVertexBuffers, indexBuffer,
                                                               vertexOffset, dynamicVertexBuffer, dynamicVertexBuffer2) {
        var numPrevAttributes;
        var numNextAttributes = program.numAttributes;
        var context = this.context;
        var gl = context.gl;

        if (context.extVertexArrayObject) {
            if (this.vao) {
                this.destroy();
            }
            this.vao = context.extVertexArrayObject.createVertexArrayOES();
            context.bindVertexArrayOES.set(this.vao);
            numPrevAttributes = 0;
            this.boundProgram = program;
            this.boundLayoutVertexBuffer = layoutVertexBuffer;
            this.boundPaintVertexBuffers = paintVertexBuffers;
            this.boundIndexBuffer = indexBuffer;
            this.boundVertexOffset = vertexOffset;
            this.boundDynamicVertexBuffer = dynamicVertexBuffer;
            this.boundDynamicVertexBuffer2 = dynamicVertexBuffer2;
        } else {
            numPrevAttributes = context.currentNumAttributes || 0;
            for (var i = numNextAttributes; i < numPrevAttributes; i++) {
                gl.disableVertexAttribArray(i);
            }
        }
        layoutVertexBuffer.enableAttributes(gl, program);
        for (var i$1 = 0, list = paintVertexBuffers; i$1 < list.length; i$1 += 1) {
            var vertexBuffer = list[i$1];
            vertexBuffer.enableAttributes(gl, program);
        }

        if (dynamicVertexBuffer) {
            dynamicVertexBuffer.enableAttributes(gl, program);
        }
        if (dynamicVertexBuffer2) {
            dynamicVertexBuffer2.enableAttributes(gl, program);
        }

        layoutVertexBuffer.bind();
        layoutVertexBuffer.setVertexAttribPointers(gl, program, vertexOffset);
        for (var i$2 = 0, list$1 = paintVertexBuffers; i$2 < list$1.length; i$2 += 1) {
            var vertexBuffer$1 = list$1[i$2];
            vertexBuffer$1.bind();
            vertexBuffer$1.setVertexAttribPointers(gl, program, vertexOffset);
        }

        if (dynamicVertexBuffer) {
            dynamicVertexBuffer.bind();
            dynamicVertexBuffer.setVertexAttribPointers(gl, program, vertexOffset);
        }
        if (indexBuffer) {
            indexBuffer.bind();
        }

        if (dynamicVertexBuffer2) {
            dynamicVertexBuffer2.bind();
            dynamicVertexBuffer2.setVertexAttribPointers(gl, program, vertexOffset);
        }
        context.currentNumAttributes = numNextAttributes;
    };

    VertexArrayObject.prototype.destroy = function destroy() {
        if (this.vao) {
            this.context.extVertexArrayObject.deleteVertexArrayOES(this.vao);
            this.vao = null;
        }
    };

    return VertexArrayObject;
});