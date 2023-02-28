define("com/huayun/webgis/gl/GlProgram", [
], function () {
  var GlProgram = function(context, source, configuration, fixedUniforms) {
    var gl = context.gl;
    this.program = gl.createProgram();

    var defines = configuration.defines();



















    /*var gl = context.gl;
    this.program = gl.createProgram();

    var fragmentSource = source.fragmentSource;
    var vertexSource = source.vertexSource;
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
    this.fixedUniforms = fixedUniforms(context, uniformLocations);*/
  };

  GlProgram.prototype.draw = function(context, drawMode, depthMode, stencilMode, colorMode, cullFaceMode, uniformValues, layerID, layoutVertexBuffer,
                                                 indexBuffer, segments, currentProperties, zoom, configuration, dynamicLayoutBuffer, dynamicLayoutBuffer2) {

  };

  return GlProgram;
});