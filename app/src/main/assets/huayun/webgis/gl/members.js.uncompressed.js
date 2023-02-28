define("com/huayun/webgis/gl/members", [
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

    var layout$2 = createLayout([
        {name: 'a_pos', components: 2, type: 'Int16'}
    ], 4);

    var lineLayoutAttributes = createLayout([
        {name: 'a_pos_normal', components: 2, type: 'Int16'},
        {name: 'a_data', components: 4, type: 'Uint8'}
    ], 4);

    var layout$3 = createLayout([
        {name: 'a_pos', components: 2, type: 'Int16'},
        {name: 'a_normal_ed', components: 4, type: 'Int16'}], 4);

    var layout$1 = createLayout([
        {name: 'a_pos', components: 2, type: 'Int16'}
    ], 4);

    var layout$4 = createLayout([
        {name: 'a_pos', components: 3, type: 'Int16'}
    ]);

    exports.members = layout$1.members;
    exports.members$1 = layout$2.members;
    exports.members$2 = layout$3.members;
    exports.members$3 = lineLayoutAttributes.members;
    exports.members$4 = layout$4.members;

    exports.symbolLayoutAttributes = createLayout([
        {name: 'a_pos_offset', components: 4, type: 'Int16'},
        {name: 'a_data', components: 4, type: 'Uint16'}
    ]);

    exports.dynamicLayoutAttributes = createLayout([
        {name: 'a_projected_pos', components: 3, type: 'Float32'}
    ], 4);

    exports.posAttributes = createLayout([
        {name: 'a_pos', type: 'Int16', components: 2}
    ]);

    exports.shaderOpacityAttributes = [
        {name: 'a_fade_opacity', components: 1, type: 'Uint8', offset: 0}
    ];

    exports.rasterBoundsAttributes = createLayout([
        {name: 'a_pos', type: 'Int16', components: 2},
        {name: 'a_texture_pos', type: 'Int16', components: 2}
    ]);

    exports.imageBoundsAttributes = createLayout([
        {name: 'a_pos', type: 'Int16', components: 2},
        {name: 'a_texture_pos', type: 'Int16', components: 2}
    ]);
});