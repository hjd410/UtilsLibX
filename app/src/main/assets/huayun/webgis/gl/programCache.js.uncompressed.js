define("com/huayun/webgis/gl/programCache", [
    "exports",
    "./ProgramSimplify",
    "./VertexFragShader"
], function (exports, ProgramSimplify, VertexFragShader) {
    var programCache = {};

    exports.useProgramSimplify = function (context, name, programConfiguration) {
        var key = name + "-" + context.id;
        if (!programCache[key]) {
            programCache[key] = new ProgramSimplify(context, VertexFragShader[name], programConfiguration, VertexFragShader.programUniforms[name]);
        }
        return programCache[key];
    };
});
