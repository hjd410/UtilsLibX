define("com/huayun/webgis/gl/Program", [
    "./VertexArrayObject"
], function (VertexArrayObject) {
    var Program = function Program(context, source, configuration, fixedUniforms, customDefine) {
        if (!customDefine) {
            customDefine = [];
        }
        var gl = context.gl;
        this.program = gl.createProgram();
        var defines = configuration.defines();
        var fragmentSource = defines.concat(source.fragmentSource).join('\n');
        var vertexSource = defines.concat(source.vertexSource).join('\n');
        vertexSource = customDefine.concat(vertexSource).join('\n');
        fragmentSource = customDefine.concat(fragmentSource).join('\n');

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        var compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
        var error;
        if (!compiled) {
            error = gl.getShaderInfoLog(fragmentShader);
            console.log('failed to compile shader: ' + error);
        }

        gl.attachShader(this.program, fragmentShader);

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
        if (!compiled) {
            error = gl.getShaderInfoLog(fragmentShader);
            console.log('failed to compile shader: ' + error);
        }
        gl.attachShader(this.program, vertexShader);

        var layoutAttributes = configuration.layoutAttributes || [];
        for (var i = 0; i < layoutAttributes.length; i++) {
            gl.bindAttribLocation(this.program, i, layoutAttributes[i].name);
        }

        gl.linkProgram(this.program);
        this.numAttributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        this.attributes = {};
        var uniformLocations = {};
        for (var i$1 = 0; i$1 < this.numAttributes; i$1++) {
            var attribute = gl.getActiveAttrib(this.program, i$1);
            if (attribute) {
                this.attributes[attribute.name] = gl.getAttribLocation(this.program, attribute.name);
            }
        }
        var numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (var i$2 = 0; i$2 < numUniforms; i$2++) {
            var uniform = gl.getActiveUniform(this.program, i$2);
            if (uniform) {
                uniformLocations[uniform.name] = gl.getUniformLocation(this.program, uniform.name);
            }
        }
        this.fixedUniforms = fixedUniforms(context, uniformLocations);
        this.binderUniforms = configuration.getUniforms(context, uniformLocations);
    };

    Program.prototype.draw = function draw(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer,
                                             indexBuffer, segments, currentProperties, zoom, configuration, dynamicLayoutBuffer, dynamicLayoutBuffer2) {
        var obj;
        var gl = context.gl;

        context.program.set(this.program);
        context.setDepthMode(depthMode);
        context.setStencilMode(stencilMode);
        context.setColorMode(colorMode);
        context.setCullFace(cullFaceMode);

        for (var name in this.fixedUniforms) {
            this.fixedUniforms[name].set(uniformValues[name]);
        }

        if (configuration) {
            configuration.setUniforms(context, this.binderUniforms, currentProperties, {zoom: (zoom)});
        }

        var primitiveSize = (obj = {}, obj[gl.LINES] = 2, obj[gl.TRIANGLES] = 3, obj[gl.LINE_STRIP] = 1, obj)[drawMode];

        for (var i = 0, list = segments.get(); i < list.length; i += 1) {
            var segment = list[i];
            var vaos = segment.vaos || (segment.vaos = {});
            var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
            vao.bind(context, this, layoutVertexBuffer, configuration ? configuration.getPaintVertexBuffers() : [],
                indexBuffer, segment.vertexOffset, dynamicLayoutBuffer, dynamicLayoutBuffer2);
            gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);
        }
    };

    Program.prototype.draw2 = function draw2(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer,
                                           indexBuffer, segments, currentProperties, zoom, configuration, dynamicLayoutBuffer, dynamicLayoutBuffer2) {
        var obj;
        var gl = context.gl;

        // debugger;
        context.program.set(this.program);
        context.setDepthMode(depthMode);
        // context.setStencilMode(stencilMode);
        context.setColorMode(colorMode);
        context.setCullFace(cullFaceMode);

        for (var name in this.fixedUniforms) {
            this.fixedUniforms[name].set(uniformValues[name]);
        }

        if (configuration) {
            configuration.setUniforms(context, this.binderUniforms, currentProperties, {zoom: (zoom)});
        }

        var primitiveSize = (obj = {}, obj[gl.LINES] = 2, obj[gl.TRIANGLES] = 3, obj[gl.LINE_STRIP] = 1, obj)[drawMode];

        for (var i = 0, list = segments.get(); i < list.length; i += 1) {
            var segment = list[i];
            var vaos = segment.vaos || (segment.vaos = {});
            var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
            vao.bind(context, this, layoutVertexBuffer, configuration ? configuration.getPaintVertexBuffers() : [],
                indexBuffer, segment.vertexOffset, dynamicLayoutBuffer, dynamicLayoutBuffer2);
            gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);
        }

        /*gl.useProgram(this.program);
        var m = gl.getUniformLocation(this.program, "u_matrix");
        gl.uniformMatrix4fv(m, false, uniformValues["u_matrix"]);
        var u_texture = gl.getUniformLocation(this.program, "u_image");
        gl.uniform1i(u_texture, 0);

        var v = new Float32Array([
            -1820/2, -400,
            1820/2, -400,
            -1820/2, 400,
            1820/2, 400
        ]);
        var size = v.BYTES_PER_ELEMENT;
        var i = new Uint8Array([
            0, 1, 2,
            2, 1, 3
        ]);

        var triangleTexCoords = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ];

        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

        var position = gl.getAttribLocation(this.program, "a_pos");
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(position);

        var trianglesTexCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglesTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleTexCoords), gl.STATIC_DRAW);

        // texture coordinate attribute
        var vertexTexCoordAttribute = gl.getAttribLocation(this.program, 'a_texture_pos');
        gl.vertexAttribPointer(vertexTexCoordAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexTexCoordAttribute);

        // 绑定顶点的索引值队列
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, i, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLE_STRIP, 6, gl.UNSIGNED_BYTE, 0);*/
    };

    Program.prototype.draw3 = function draw(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer,
                                           indexBuffer, segments, currentProperties, zoom, configuration, dynamicLayoutBuffer, dynamicLayoutBuffer2) {
        var obj;
        var gl = context.gl;

        context.program.set(this.program);
        context.setDepthMode(depthMode);
        context.setStencilMode(stencilMode);
        context.setColorMode(colorMode);
        context.setCullFace(cullFaceMode);

        for (var name in this.fixedUniforms) {
            this.fixedUniforms[name].set(uniformValues[name]);
        }

        if (configuration) {
            configuration.setUniforms(context, this.binderUniforms, currentProperties, {zoom: (zoom)});
        }

        var primitiveSize = (obj = {}, obj[gl.LINES] = 2, obj[gl.TRIANGLES] = 3, obj[gl.LINE_STRIP] = 1, obj)[drawMode];

        for (var i = 0, list = segments.get(); i < list.length; i += 1) {
            var segment = list[i];
            var vaos = segment.vaos || (segment.vaos = {});
            var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
            vao.bind(context, this, layoutVertexBuffer, configuration ? configuration.getPaintVertexBuffers() : [],
                indexBuffer, segment.vertexOffset, dynamicLayoutBuffer, dynamicLayoutBuffer2);
            /*var level = parseInt(Math.random()*10);
            for (var j=0; j<10; j++) {
                configuration.setUniform(context, "fill-extrusion-base",this.binderUniforms[2].binding, j*5);
                configuration.setUniform(context, "fill-extrusion-height",this.binderUniforms[1].binding, (j+1)*5);
                gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);
            }*/
            configuration.setUniform(context, "fill-extrusion-base",this.binderUniforms[2].binding, 0);
            configuration.setUniform(context, "fill-extrusion-height",this.binderUniforms[1].binding, 20);
            gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);

            configuration.setUniform(context, "fill-extrusion-base",this.binderUniforms[2].binding, 20);
            configuration.setUniform(context, "fill-extrusion-height",this.binderUniforms[1].binding, 50);
            gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);

            configuration.setUniform(context, "fill-extrusion-base",this.binderUniforms[2].binding, 50);
            configuration.setUniform(context, "fill-extrusion-height",this.binderUniforms[1].binding, 80);
            gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);

            /*configuration.setUniform(context, "fill-extrusion-base",this.binderUniforms[2].binding, 80);
            configuration.setUniform(context, "fill-extrusion-height",this.binderUniforms[1].binding, 100);
            gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);*/
        }
    };

    Program.prototype.drawArray = function (context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer, indexBuffer, segments) {
        var obj;
        var gl = context.gl;
        context.program.set(this.program);
        context.setDepthMode(depthMode);
        context.setStencilMode(stencilMode);
        context.setColorMode(colorMode);
        context.setCullFace(cullFaceMode);

        for (var name in this.fixedUniforms) {
            this.fixedUniforms[name].set(uniformValues[name]);
        }

        for (var i = 0, list = segments.get(); i < list.length; i += 1) {
            var segment = list[i];
            var vaos = segment.vaos || (segment.vaos = {});
            var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
            vao.bind(context, this, layoutVertexBuffer,  [],
                indexBuffer, segment.vertexOffset, undefined, undefined);
            console.log(segment);
            // gl.drawArrays(drawMode, segment.primitiveOffset, segment.primitiveLength);
        }
    };

    return Program;
});