define("com/huayun/webgis/gl/mode", [
    "exports",
    "../utils/Color",
    "../utils/Constant"
], function (exports, Color, Constant) {

    var DepthMode = function DepthMode(depthFunc, depthMask, depthRange) {
        this.func = depthFunc;
        this.mask = depthMask;
        this.range = depthRange;
    };
    DepthMode.ReadOnly = false;
    DepthMode.ReadWrite = true;
    DepthMode.disabled = new DepthMode(Constant.glConstant.ALWAYS, DepthMode.ReadOnly, [0, 1]);
    DepthMode.opaque = new DepthMode(Constant.glConstant.LEQUAL, DepthMode.ReadWrite, [0, 1]);


    /**
     * webgl的cull配置
     * @param enable
     * @param mode
     * @param frontFace
     * @constructor
     */
    var CullFaceMode = function CullFaceMode(enable, mode, frontFace) {
        this.enable = enable;
        this.mode = mode;
        this.frontFace = frontFace;
    };
    CullFaceMode.disabled = new CullFaceMode(false, Constant.glConstant.BACK, Constant.glConstant.CCW);
    CullFaceMode.backCCW = new CullFaceMode(true, Constant.glConstant.BACK, Constant.glConstant.CCW);

    /**
     * webgl颜色相关配置
     * @param blendFunction
     * @param blendColor
     * @param mask
     * @constructor
     */
    var ColorMode = function ColorMode(blendFunction, blendColor, mask) {
        this.blendFunction = blendFunction;
        this.blendColor = blendColor;
        this.mask = mask;
    };
    ColorMode.Replace = [Constant.glConstant.ONE, Constant.glConstant.ZERO];
    ColorMode.disabled = new ColorMode(ColorMode.Replace, Color.transparent, [false, false, false, false]);
    ColorMode.unblended = new ColorMode(ColorMode.Replace, Color.transparent, [true, true, true, true]);
    ColorMode.alphaBlended = new ColorMode([Constant.glConstant.ONE, Constant.glConstant.ONE_MINUS_SRC_ALPHA], Color.transparent, [true, true, true, true]);
    ColorMode.srcBlended = new ColorMode([Constant.glConstant.SRC_ALPHA, Constant.glConstant.ONE_MINUS_SRC_ALPHA], Color.transparent, [true, true, true, true]);

    /**
     * webgl的模板相关配置
     * @param test
     * @param ref
     * @param mask
     * @param fail
     * @param depthFail
     * @param pass
     * @constructor
     */
    var StencilMode = function StencilMode(test, ref, mask, fail, depthFail, pass) {
        this.test = test;
        this.ref = ref;
        this.mask = mask;
        this.fail = fail;
        this.depthFail = depthFail;
        this.pass = pass;
    };
    StencilMode.disabled = new StencilMode({
        func: Constant.glConstant.ALWAYS,
        mask: 0
    }, 0, 0, Constant.glConstant.KEEP, Constant.glConstant.KEEP, Constant.glConstant.KEEP);

    exports.DepthMode = DepthMode;
    exports.CullFaceMode = CullFaceMode;
    exports.ColorMode = ColorMode;
    exports.StencilMode = StencilMode;

});