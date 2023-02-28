define("com/huayun/webgis/gl/ProgramSimplify", [
  "./VertexArrayObject"
], function (VertexArrayObject) {
  /**
   *
   * @param context
   * @param source
   * @param configuration
   * @param fixedUniforms
   */
  var ProgramSimplify = function Program(context, source, configuration, fixedUniforms) {
    var gl = context.gl;
    this.program = gl.createProgram();

    var defines = configuration.defines;
    var fragmentSource, vertexSource
    if (defines) {
      fragmentSource = defines.concat(source.fragmentSource).join('\n');
      vertexSource = defines.concat(source.vertexSource).join('\n');
    } else {
      fragmentSource = source.fragmentSource;
      vertexSource = source.vertexSource;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    gl.attachShader(this.program, fragmentShader);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
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
  };

  ProgramSimplify.prototype.draw = function draw(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer,
                                                 indexBuffer, segments, currentProperties, zoom, configuration, dynamicLayoutBuffer, dynamicLayoutBuffer2) {
    var obj;
    var gl = context.gl;

    context.program.set(this.program);
    context.setDepthMode(depthMode);
    // context.setStencilMode(stencilMode);
    context.setColorMode(colorMode);
    context.setCullFace(cullFaceMode);

    for (var name in this.fixedUniforms) {
      this.fixedUniforms[name].set(uniformValues[name]);
    }

    var primitiveSize = (obj = {}, obj[gl.LINES] = 2, obj[gl.TRIANGLES] = 3, obj[gl.LINE_STRIP] = 1, obj)[drawMode];

    for (var i = 0, list = segments.get(); i < list.length; i += 1) {
      var segment = list[i];
      var vaos = segment.vaos || (segment.vaos = {});
      var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
      vao.bind(context, this, layoutVertexBuffer, [],
        indexBuffer, segment.vertexOffset, dynamicLayoutBuffer, dynamicLayoutBuffer2);
      gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);
      // console.log(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2);
    }
  };

  ProgramSimplify.prototype.draw2 = function draw2(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer, len) {
    var obj;
    var gl = context.gl;

    context.program.set(this.program);
    context.setDepthMode(depthMode);
    context.setColorMode(colorMode);
    context.setCullFace(cullFaceMode);

    for (var name in this.fixedUniforms) {
      this.fixedUniforms[name].set(uniformValues[name]);
    }

    /*for (var i = 0, list = segments.get(); i < list.length; i += 1) {
        var segment = list[i];
        var vaos = segment.vaos || (segment.vaos = {});
        var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
        vao.bind(context, this, layoutVertexBuffer, []);

    }*/

    context.bindVertexBuffer.set(layoutVertexBuffer.buffer);
    gl.drawArrays(drawMode, 0, len);
  };

  ProgramSimplify.prototype.drawArray = function (context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer, indexBuffer, segments) {
    var obj;
    var gl = context.gl;
    context.program.set(this.program);
    context.setDepthMode(depthMode);
    context.setColorMode(colorMode);
    context.setCullFace(cullFaceMode);

    for (var name in this.fixedUniforms) {
      this.fixedUniforms[name].set(uniformValues[name]);
    }

    for (var i = 0, list = segments.get(); i < list.length; i += 1) {
      var segment = list[i];
      var vaos = segment.vaos || (segment.vaos = {});
      var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
      vao.bind(context, this, layoutVertexBuffer, [],
        indexBuffer, segment.vertexOffset, undefined, undefined);
      gl.drawArrays(drawMode, segment.primitiveOffset, segment.vertexLength);
    }

  };
  ProgramSimplify.prototype.drawArraysInstancedANGLE = function (context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer, indexBuffer, segments,
                                                                 dynamicLayoutBuffer, count) {
    var gl = context.gl;
    context.program.set(this.program);
    context.setDepthMode(depthMode);
    context.setColorMode(colorMode);
    context.setCullFace(cullFaceMode);

    for (var name in this.fixedUniforms) {
      this.fixedUniforms[name].set(uniformValues[name]);
    }

    var attrs = dynamicLayoutBuffer.attributes;
    var ext = context.extInstancedArray;

    for (var i = 0, list = segments.get(); i < list.length; i += 1) {
      var segment = list[i];
      var vaos = segment.vaos || (segment.vaos = {});
      var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
      vao.bind(context, this, layoutVertexBuffer, [dynamicLayoutBuffer],
        indexBuffer, segment.vertexOffset, undefined, undefined);

      for (var j = 0; j < attrs.length; j++) {
        var member = attrs[j];
        ext.vertexAttribDivisorANGLE(this.attributes[member.name], 1);
      }
      ext.drawArraysInstancedANGLE(drawMode, segment.primitiveOffset, segment.vertexLength, count);
    }
  };

  ProgramSimplify.prototype.drawInstancedANGLE = function (context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer, indexBuffer, segments,
                                                                 dynamicLayoutBuffer, count) {
    var gl = context.gl;
    context.program.set(this.program);
    context.setDepthMode(depthMode);
    context.setColorMode(colorMode);
    context.setCullFace(cullFaceMode);

    for (var name in this.fixedUniforms) {
      this.fixedUniforms[name].set(uniformValues[name]);
    }

    var attrs = dynamicLayoutBuffer.attributes;
    var ext = context.extInstancedArray;

    var primitiveSize = 3;
    for (var i = 0, list = segments.get(); i < list.length; i += 1) {
      var segment = list[i];
      var vaos = segment.vaos || (segment.vaos = {});
      var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
      vao.bind(context, this, layoutVertexBuffer, [dynamicLayoutBuffer],
        indexBuffer, segment.vertexOffset, undefined, undefined);

      for (var j = 0; j < attrs.length; j++) {
        var member = attrs[j];
        ext.vertexAttribDivisorANGLE(this.attributes[member.name], 1);
      }
      // ext.drawArraysInstancedANGLE(drawMode, segment.primitiveOffset, segment.vertexLength, count);


      ext.drawElementsInstancedANGLE(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2, count);
    }
  };

  /*ProgramSimplify.prototype.drawInstancedANGLE = function draw(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer,
                                                 indexBuffer, segments, divisorANGLE, divisorVertexArrayBuffer, size) {
      var obj;
      var gl = context.gl;

      context.program.set(this.program);
      context.setDepthMode(depthMode);
      // context.setStencilMode(stencilMode);
      context.setColorMode(colorMode);
      context.setCullFace(cullFaceMode);

      for (var name in this.fixedUniforms) {
          this.fixedUniforms[name].set(uniformValues[name]);
      }

      var primitiveSize = (obj = {}, obj[gl.LINES] = 2, obj[gl.TRIANGLES] = 3, obj[gl.LINE_STRIP] = 1, obj)[drawMode];

      debugger;
      for (var i = 0, list = segments.get(); i < list.length; i += 1) {
          var segment = list[i];
          var vaos = segment.vaos || (segment.vaos = {});
          var vao = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());
          vao.bind(context, this, layoutVertexBuffer, [],
            indexBuffer, segment.vertexOffset, undefined, undefined, divisorANGLE, divisorVertexArrayBuffer);
          // context.extInstancedArray.drawElementsInstancedANGLE(drawMode, size * primitiveSize, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2, segment.primitiveLength / size);
          context.extInstancedArray.drawElementsInstancedANGLE(drawMode, 6, gl.UNSIGNED_SHORT, segment.primitiveOffset * primitiveSize * 2, segment.primitiveLength / size);
      }
  };*/

  ProgramSimplify.prototype.drawMassive = function draw(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer,
                                                        indexBuffer, segments, currentProperties, zoom, configuration, dynamicLayoutBuffer, dynamicLayoutBuffer2) {
    var obj;
    var gl = context.gl;

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
      gl.drawElements(drawMode, segment.primitiveLength * primitiveSize, gl.UNSIGNED_INT, segment.primitiveOffset * primitiveSize * 2);
    }
  };

  return ProgramSimplify;
});