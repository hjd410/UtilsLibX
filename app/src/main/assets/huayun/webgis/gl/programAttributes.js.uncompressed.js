define("com/huayun/webgis/gl/programAttributes", [
    "exports",
    "../utils/Constant",
    "../utils/utils"
], function (exports, Constant, utils) {
    function createLayout(members, alignment) {
        if (alignment === void 0) alignment = 1;
        var offset = 0;
        var maxSize = 0;
        var layoutMembers = members.map(function (member) {
            var typeSize = Constant.viewTypes[member.type].BYTES_PER_ELEMENT;
            var memberOffset = offset = utils.align(offset, Math.max(alignment, typeSize));
            var components = member.components || 1;
            maxSize = Math.max(maxSize, typeSize);
            offset += typeSize * components;
            return {
                name: member.name,
                type: member.type,
                components: components,
                offset: memberOffset
            };
        });
        var size = utils.align(offset, Math.max(maxSize, alignment));
        return {
            members: layoutMembers,
            size: size,
            alignment: alignment
        };
    }

    /**
     * 线的着色器的attrs, 目前坐标系中, 若要支持任意点坐标, type必须是Float32, 矢量切片type不是,
     * @type {{size, members, alignment}}
     */
    exports.basicLine = createLayout([
        {name: "a_pos", type: "Float32", components: 3},
        {name: "a_data", type: "Float32", components: 4},
        {name: "a_normal", type: "Int16", components: 2}
    ], 4);
});