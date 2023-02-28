define("com/huayun/webgis/gl/shaders/postprocessingShaders", [
  "exports",
  "../../data/uniform"
], function (exports, uniform) {
  var blurVertex = "attribute vec2 aPos;\n" +
    "  attribute vec2 uv;\n" +
    "  varying vec2 vUv;\n" +
    "  void main() {\n" +
    "    vUv = uv;\n" +
    "    gl_Position = vec4(aPos, 0.0, 1.0);\n" +
    "  }";
  var blurFragment = "precision mediump float;\n" +
    "  varying vec2 vUv;\n" +
    "  uniform sampler2D colorTexture;\n" +
    "  uniform vec2 texSize;\n" +
    "  uniform vec2 direction;\n" +
    "\n" +
    "  uniform float SIGMA;\n" +
    "  uniform int KERNEL_RADIUS;\n" +
    "\n" +
    "  float gaussianPdf(in float x, in float sigma) {\n" +
    "    return 0.39894 * exp(-0.5 * x * x/(sigma * sigma))/sigma;\n" +
    "  }\n" +
    "  void main() {\n" +
    "    vec2 invSize = 1.0 / texSize;\n" +
    "    float fSigma = float(SIGMA);\n" +
    "    float weightSum = gaussianPdf(0.0, fSigma);\n" +
    "    vec3 diffuseSum = texture2D(colorTexture, vUv).rgb * weightSum;\n" +
    "    for (int i = 1; i < 5; i ++) {\n" +
    "      float x = float(i);\n" +
    "      float w = gaussianPdf(x, fSigma);\n" +
    "      vec2 uvOffset = direction * invSize * x;\n" +
    "      vec3 sample1 = texture2D(colorTexture, vUv + uvOffset).rgb;\n" +
    "      vec3 sample2 = texture2D(colorTexture, vUv - uvOffset).rgb;\n" +
    "      diffuseSum += (sample1 + sample2) * w;\n" +
    "      weightSum += 2.0 * w;\n" +
    "    }\n" +
    "    //    gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n" +
    "    gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n" +
    "  }";

  var blurUniforms = function (context, locations) {
    return {};
  };

  exports.blur = {
    vertexSource: blurVertex,
    fragmentSource: blurFragment
  };

  exports.programUniforms = {
    blur: blurUniforms
  }
});