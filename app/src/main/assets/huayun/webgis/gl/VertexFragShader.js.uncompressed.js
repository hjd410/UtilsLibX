require({cache:{
'url:com/huayun/webgis/gl/shaders/fill_extrusion.vertex.glsl':"#ifdef GL_ES\r\nprecision mediump float;\r\n#else\r\n\r\n#if !defined(lowp)\r\n#define lowp\r\n#endif\r\n\r\n#if !defined(mediump)\r\n#define mediump\r\n#endif\r\n\r\n#if !defined(highp)\r\n#define highp\r\n#endif\r\n\r\n#endif\r\n\r\nuniform mat4 u_matrix;\r\nuniform vec3 u_lightcolor;\r\nuniform lowp vec3 u_lightpos;\r\nuniform lowp float u_lightintensity;\r\nuniform float u_vertical_gradient;\r\nuniform lowp float u_opacity;\r\n\r\nattribute vec2 a_pos;\r\nattribute vec4 a_normal_ed;\r\n\r\nvarying vec4 v_color;\r\n\r\n// 条件编译\r\n// 颜色\r\n#ifndef HAS_UNIFORM_u_color\r\nuniform lowp float u_color_t;\r\nattribute highp vec4 a_color;\r\n#else\r\nuniform highp vec4 u_color;\r\n#endif\r\n\r\n// 高度\r\n#ifndef HAS_UNIFORM_u_height\r\nuniform lowp float u_height_t;\r\nattribute highp vec2 a_height;\r\n#else\r\nuniform highp float u_height;\r\n#endif\r\n\r\n// 地形\r\n#ifdef HAS_TERRAIN\r\nuniform sampler2D u_height_image;\r\nuniform highp float u_min_height;\r\nuniform highp float u_delta_height;\r\n#else\r\n// 底部高度\r\n#ifndef HAS_UNIFORM_u_base\r\nuniform lowp float u_base_t;\r\nattribute highp vec2 a_base;\r\n#else\r\nuniform highp float u_base;\r\n#endif\r\n#endif\r\n\r\n// 处理函数\r\nvec2 unpack_float(const float packedValue) {\r\n    int packedIntValue = int(packedValue);\r\n    int v0 = packedIntValue/256;\r\n    return vec2(v0, packedIntValue - v0 * 256);\r\n}\r\n\r\nfloat unpack_mix_vec2(const vec2 packedValue, const float t) {\r\n    return mix(packedValue[0], packedValue[1], t);\r\n}\r\n\r\nvec4 decode_color(const vec2 encodedColor) {\r\n    return vec4(\r\n    unpack_float(encodedColor[0]) / 255.0,\r\n    unpack_float(encodedColor[1]) / 255.0\r\n    );\r\n}\r\n\r\nvec4 unpack_mix_color(const vec4 packedColors, const float t) {\r\n    vec4 minColor = decode_color(vec2(packedColors[0], packedColors[1]));\r\n    vec4 maxColor = decode_color(vec2(packedColors[2], packedColors[3]));\r\n    return mix(minColor, maxColor, t);\r\n}\r\n\r\nvoid main() {\r\n\r\n    #ifndef HAS_UNIFORM_u_height\r\n    highp float height = unpack_mix_vec2(a_height, u_height_t);\r\n    #else\r\n    highp float height = u_height;\r\n    #endif\r\n\r\n    #ifndef HAS_UNIFORM_u_color\r\n    highp vec4 color = unpack_mix_color(a_color, u_color_t);\r\n    #else\r\n    highp vec4 color = u_color;\r\n    #endif\r\n\r\n    #ifdef HAS_TERRAIN\r\n    vec3 rgb = texture2D(u_height_image, a_pos/8192.0).rgb;\r\n    highp float base = rgb.r * u_delta_height + u_min_height;\r\n    #else\r\n    #ifndef HAS_UNIFORM_u_base\r\n    highp float base = unpack_mix_vec2(a_base, u_base_t);\r\n    #else\r\n    highp float base = u_base;\r\n    #endif\r\n    #endif\r\n\r\n    vec3 normal = a_normal_ed.xyz;\r\n    float t = mod(normal.x, 2.0);\r\n    gl_Position = u_matrix * vec4(a_pos, t > 0.0 ? height + base : base, 1);\r\n    float colorvalue = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;\r\n    v_color = vec4(0.0, 0.0, 0.0, 1.0);\r\n    vec4 ambientlight = vec4(0.03, 0.03, 0.03, 1.0);\r\n    color += ambientlight;\r\n    float directional = clamp(dot(normal / 16384.0, u_lightpos), 0.0, 1.0);\r\n    directional = mix((1.0 - u_lightintensity), max((1.0 - colorvalue + u_lightintensity), 1.0), directional);\r\n    if (normal.y != 0.0) {\r\n        directional *= (\r\n        (1.0 - u_vertical_gradient) +\r\n        (u_vertical_gradient * clamp((t + base) * pow(height / 150.0, 0.5), mix(0.7, 0.98, 1.0 - u_lightintensity), 1.0)));\r\n    }\r\n    v_color.r += clamp(color.r * directional * u_lightcolor.r, mix(0.0, 0.3, 1.0 - u_lightcolor.r), 1.0);\r\n    v_color.g += clamp(color.g * directional * u_lightcolor.g, mix(0.0, 0.3, 1.0 - u_lightcolor.g), 1.0);\r\n    v_color.b += clamp(color.b * directional * u_lightcolor.b, mix(0.0, 0.3, 1.0 - u_lightcolor.b), 1.0);\r\n    v_color *= u_opacity;\r\n}\r\n",
'url:com/huayun/webgis/gl/shaders/fill_extrusion.fragment.glsl':"precision mediump float;\r\nvarying vec4 v_color;\r\n\r\nvoid main() {\r\n    gl_FragColor = v_color;\r\n}\r\n",
'url:com/huayun/webgis/gl/shaders/cylinder.fragment.glsl':"precision mediump float;\r\nuniform float u_opacity;\r\n\r\n#ifdef HAS_PATTERN\r\nvarying vec2 v_uv;\r\nuniform sampler2D u_texture;\r\n#else\r\nuniform vec4 u_color;\r\n#endif\r\n\r\nvoid main() {\r\n    #ifdef HAS_PATTERN\r\n    gl_FragColor = texture2D(u_texture, v_uv) * u_opacity;\r\n    #else\r\n    gl_FragColor = u_color * u_opacity;\r\n    #endif\r\n}",
'url:com/huayun/webgis/gl/shaders/mesh.fragment.glsl':"precision mediump float;\r\nuniform vec3 u_color;\r\nvoid main() {\r\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n}",
'url:com/huayun/webgis/gl/shaders/terrain.vertex.glsl':"const float m2d = 111194.872221777 / 2.0;\r\n\r\nattribute vec4 position3DAndHeight;\r\nattribute vec3 textureCoordAndEncodedNormals;\r\n\r\nuniform mat4 u_matrix;\r\nuniform vec4 u_tileRectangle;\r\nuniform float u_resolution;\r\nvarying vec2 v_texture;\r\n//varying float color;\r\n\r\nfloat get2DGeographicYPositionFraction(vec2 textureCoordinates){\r\n    return 1.0 - textureCoordinates.y;\r\n}\r\n\r\nfloat get2DYPositionFraction(vec2 textureCoordinates) {\r\n    return get2DGeographicYPositionFraction(textureCoordinates);\r\n}\r\n\r\nvec4 getPositionPlanarEarth(vec3 position, float height, vec2 textureCoordinates){\r\n    float yPositionFraction = get2DYPositionFraction(textureCoordinates);\r\n    vec4 rtcPosition2D = vec4(mix(u_tileRectangle.st, u_tileRectangle.pq, vec2(textureCoordinates.x, yPositionFraction)), height/  111194.872221777, 1.0);\r\n    return u_matrix * rtcPosition2D;\r\n}\r\n\r\nvec4 getPositionColumbusViewMode(vec3 position, float height, vec2 textureCoordinates){\r\n    return getPositionPlanarEarth(position, height, textureCoordinates);\r\n}\r\n\r\nvec4 getPosition(vec3 position, float height, vec2 textureCoordinates) {\r\n    return getPositionColumbusViewMode(position, height, textureCoordinates);\r\n}\r\n\r\nvoid main() {\r\n    //    gl_Position = u_matrix * vec4(a_pos, 0, 1);\r\n    vec3 position = position3DAndHeight.xyz;\r\n    float height = position3DAndHeight.w;\r\n    vec2 textureCoordinates = textureCoordAndEncodedNormals.xy;\r\n    gl_Position = getPosition(position, height, textureCoordinates);\r\n    v_texture = textureCoordinates;\r\n    /*float ratio = height / 200.0;\r\n    if (ratio > 1.0) {\r\n        color = 1.0;\r\n    } else {\r\n        color = ratio;\r\n    }*/\r\n    /*if (height > 20.0) {\r\n        color = 1.0;\r\n    } else {\r\n        color = 0.0;\r\n    }*/\r\n}",
'url:com/huayun/webgis/gl/shaders/cone.fragment.glsl':"precision mediump float;\r\nvarying vec4 v_color;\r\n\r\nvoid main() {\r\n    gl_FragColor = v_color;\r\n}",
'url:com/huayun/webgis/gl/shaders/tifTerrain.fragment.glsl':"precision mediump float;\r\n\r\nuniform sampler2D u_image;\r\nvarying vec2 v_texture;\r\n\r\nvoid main() {\r\n//    vec2 tex_location = vec2(v_texture.x, 1.0 - v_texture.y);\r\n    if(v_texture.x < 0.0 || v_texture.x > 1.0 || v_texture.y < 0.0 || v_texture.y > 1.0) {\r\n        discard;\r\n    }\r\n    gl_FragColor = texture2D(u_image, v_texture);\r\n}",
'url:com/huayun/webgis/gl/shaders/line.fragment.glsl':"precision mediump float;\r\n\r\nvarying vec2 v_width2;\r\nvarying vec2 v_normal;\r\nvarying float v_gamma_scale;\r\nuniform highp vec4 u_color;\r\nuniform lowp float u_opacity;\r\n\r\nvoid main() {\r\n\r\n\r\n    highp vec4 color = u_color;\r\n    lowp float blur = 0.0;\r\n    lowp float opacity = u_opacity;\r\n    lowp float u_device_pixel_ratio = 1.0;\r\n\r\n    float dist = length(v_normal) * v_width2.s;\r\n\r\n    float blur2 = (blur + 1.0 / u_device_pixel_ratio) * v_gamma_scale;\r\n    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\r\n    gl_FragColor = color * (alpha * opacity);\r\n}",
'url:com/huayun/webgis/gl/shaders/rect.fragment.glsl':"precision mediump float;\r\nuniform vec4 u_color;\r\n\r\nvoid main() {\r\n    gl_FragColor = u_color;\r\n}",
'url:com/huayun/webgis/gl/shaders/line.vertex.glsl':"precision highp float;\r\n\r\n#define scale 0.01587301\r\n// #define scale 0.007936508\r\n\r\nattribute vec3 a_pos;\r\nattribute vec4 a_data;\r\nattribute vec2 a_normal;\r\n\r\nuniform mat4 u_matrix;\r\nuniform mediump float u_ratio;\r\nuniform vec2 u_units_to_pixels;\r\n\r\nvarying vec2 v_normal;\r\nvarying vec2 v_width2;\r\nvarying float v_gamma_scale;\r\nvarying highp float v_linesofar;\r\n\r\nuniform highp vec4 u_color;\r\nuniform lowp float u_blur;\r\nuniform lowp float u_opacity;\r\nuniform mediump float u_gapwidth;\r\nuniform lowp float u_offset;\r\nuniform mediump float u_width;\r\n\r\nvoid main() {\r\n    highp vec4 color = u_color;\r\n    lowp float blur = u_blur;\r\n    lowp float opacity = u_opacity;\r\n    mediump float gapwidth = u_gapwidth;\r\n    lowp float offset = u_offset;\r\n    mediump float width = u_width;\r\n\r\n    // the distance over which the line edge fades out.\r\n    // Retina devices need a smaller distance to avoid aliasing.\r\n    float ANTIALIASING = 0.5;\r\n\r\n    vec2 a_extrude = a_data.xy - 128.0;\r\n    float a_direction = mod(a_data.z, 4.0) - 1.0;\r\n\r\n    v_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * 2.0;\r\n\r\n    vec2 pos = a_pos.xy;\r\n\r\n    mediump vec2 normal = a_normal;\r\n    normal.y = normal.y * 2.0 - 1.0;\r\n    v_normal = normal;\r\n\r\n    // these transformations used to be applied in the JS and native code bases.\r\n    // moved them into the shader for clarity and simplicity.\r\n    gapwidth = gapwidth / 2.0;\r\n    float halfwidth = width / 2.0;\r\n    offset = -1.0 * offset;\r\n\r\n    float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\r\n    float outset = gapwidth + halfwidth * (gapwidth > 0.0 ? 2.0 : 1.0) + (halfwidth == 0.0 ? 0.0 : ANTIALIASING);\r\n\r\n    // Scale the extrusion vector down to a normal and then up by the line width\r\n    // of this vertex.\r\n    mediump vec2 dist = outset * a_extrude * scale;\r\n\r\n    // Calculate the offset when drawing a line that is to the side of the actual line.\r\n    // We do this by creating a vector that points towards the extrude, but rotate\r\n    // it when we're drawing round end points (a_direction = -1 or 1) since their\r\n    // extrude vector points in another direction.\r\n    mediump float u = 0.5 * a_direction;\r\n    mediump float t = 1.0 - abs(u);\r\n    mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\r\n\r\n    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\r\n    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, a_pos.z, 1.0) + projected_extrude;\r\n\r\n    // calculate how much the perspective view squishes or stretches the extrude\r\n    float extrude_length_without_perspective = length(dist);\r\n    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_units_to_pixels);\r\n    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\r\n\r\n    v_width2 = vec2(outset, inset);\r\n}",
'url:com/huayun/webgis/gl/shaders/height_map.fragment.glsl':"precision mediump float;\r\nvarying float v_color;\r\n\r\nvoid main() {\r\n//    gl_FragColor = vec4(v_color, v_color, v_color, 1.0);\r\n    gl_FragColor = vec4(v_color, v_color, v_color, 1.0);\r\n}",
'url:com/huayun/webgis/gl/shaders/rect.vertex.glsl':"attribute vec2 a_pos;\r\nattribute vec4 a_size;\r\n\r\nuniform mat4 u_matrix;\r\nuniform lowp float u_device_pixel_ratio;\r\nuniform highp float u_camera_to_center_distance;\r\nuniform mediump vec2 u_extrude_scale;\r\nuniform highp float u_radian;\r\nuniform bool u_is_stroke;\r\n\r\nuniform highp float u_size;\r\n\r\nvoid main() {\r\n    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);\r\n    highp float angle_sin = sin(u_radian);\r\n    highp float angle_cos = cos(u_radian);\r\n    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);\r\n    vec2 core_size = a_size.xy / 2.0;\r\n    vec2 stroke_size = a_size.zw / 2.0;\r\n    vec2 rotated_extrude;\r\n    if (u_is_stroke) {\r\n        rotated_extrude = rotation_matrix * stroke_size * u_size;\r\n    } else {\r\n        rotated_extrude = rotation_matrix * core_size * u_size;\r\n    }\r\n    gl_Position.xy += rotated_extrude * u_extrude_scale * u_camera_to_center_distance;\r\n}",
'url:com/huayun/webgis/gl/shaders/tiffTerrain.vertex.glsl':"precision highp float;\r\n\r\nattribute vec3 a_pos;\r\nuniform mat4 u_matrix;\r\n\r\nvarying vec2 v_texture;\r\n\r\nvoid main() {\r\n    vec2 pos = a_pos.xy * 8192.0;\r\n    float height = a_pos.z;\r\n    gl_Position = u_matrix * vec4(pos, height, 1.0);\r\n    v_texture = a_pos.xy;\r\n}",
'url:com/huayun/webgis/gl/shaders/terrain.fragment.glsl':"precision mediump float;\r\nuniform vec4 u_color;\r\n//varying float color;\r\nuniform sampler2D u_image;\r\nvarying vec2 v_texture;\r\n// const float m2d = 111194.872221777 / 2.0;\r\n\r\nvoid main() {\r\n    vec2 tex_location = vec2(v_texture.x, 1.0 - v_texture.y);\r\n    vec4 color0 = texture2D(u_image, tex_location);\r\n    gl_FragColor = color0;\r\n//    gl_FragColor = vec4(color, color, color, 1.0);\r\n//    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\r\n}",
'url:com/huayun/webgis/gl/shaders/background.fragment.glsl':"precision mediump float;\r\n\r\n/*uniform sampler2D u_image;\r\nvarying vec2 v_texture;*/\r\nvarying float y_screen;\r\n\r\nvoid main() {\r\n    //    gl_FragColor = texture2D(u_image, v_texture);\r\n    float fogFactor = 1.0 - smoothstep(0.3, 0.5, y_screen);\r\n    gl_FragColor = vec4(0.94, 0.93, 0.91, 1.0) * (1.0-fogFactor) + vec4(0.0, 0.0, 0.0, 0.0) * fogFactor;\r\n}",
'url:com/huayun/webgis/gl/shaders/mesh.vertex.glsl':"precision highp float;\r\nattribute vec3 position;\r\nuniform mat4 u_matrix;\r\nuniform mat4 u_model;\r\nvoid main() {\r\n    gl_Position = u_matrix * u_model * vec4(position, 1.0);\r\n}",
'url:com/huayun/webgis/gl/shaders/cone.vertex.glsl':"attribute vec3 a_pos;\r\nattribute vec4 a_color;\r\n\r\nvarying vec4 v_color;\r\nuniform mat4 u_matrix;\r\n\r\nvoid main() {\r\n    gl_Position = u_matrix * vec4(a_pos, 1.0);\r\n    v_color = a_color;\r\n}\r\n",
'url:com/huayun/webgis/gl/shaders/water.fragment.glsl':"precision mediump float;\r\nvoid main() {\r\n    gl_FragColor = vec4(0.3, 0.7, 0.72, 1.0);\r\n}",
'url:com/huayun/webgis/gl/shaders/water.vertex.glsl':"attribute vec3 a_pos;\r\nuniform mat4 u_matrix;\r\nuniform float u_water_depth;\r\nvoid main() {\r\n    gl_Position = u_matrix * vec4(a_pos.xy, a_pos.z > 0.0?u_water_depth:0.0, 1.0);\r\n}",
'url:com/huayun/webgis/gl/shaders/height_map.vertex.glsl':"precision highp float;\r\n\r\nattribute vec3 a_pos;\r\n\r\nuniform float u_min_height;\r\nuniform float u_delta_height;\r\nvarying float v_color;\r\n\r\nvoid main() {\r\n    float height = a_pos.z;\r\n    gl_Position = vec4(a_pos.xy * 2.0 - 1.0, 0.0, 1.0);\r\n    v_color = (height - u_min_height) / u_delta_height;\r\n}\r\n\r\n/*\r\nattribute vec4 position3DAndHeight;\r\nattribute vec3 textureCoordAndEncodedNormals;\r\n\r\nuniform float u_min_height;\r\nuniform float u_delta_height;\r\nvarying float v_color;\r\n\r\nvec4 getPosition(vec3 position, float height, vec2 textureCoordinates) {\r\n    float yPositionFraction = 1.0 - textureCoordinates.y;\r\n    return vec4(textureCoordinates.x * 2.0 -1.0, yPositionFraction* 2.0 -1.0, 0.0, 1.0);\r\n}\r\n\r\nvoid main() {\r\n    vec3 position = position3DAndHeight.xyz;\r\n    float height = position3DAndHeight.w;\r\n    vec2 textureCoordinates = textureCoordAndEncodedNormals.xy;\r\n    gl_Position = getPosition(position, 0.0, textureCoordinates);\r\n    v_color = (height - u_min_height) / u_delta_height;\r\n}*/",
'url:com/huayun/webgis/gl/shaders/cylinder.vertex.glsl':"attribute vec3 a_pos;\r\n\r\n#ifdef HAS_PATTERN\r\nattribute vec2 a_uv;\r\nvarying vec2 v_uv;\r\n#endif\r\n\r\nuniform mat4 u_matrix;\r\nuniform float u_size;\r\n\r\nvoid main() {\r\n    gl_Position = u_matrix * vec4(u_size * a_pos.xy, a_pos.z, 1.0);\r\n    #ifdef HAS_PATTERN\r\n    v_uv = a_uv;\r\n    #endif\r\n}\r\n",
'url:com/huayun/webgis/gl/shaders/background.vertex.glsl':"attribute vec4 a_pos;\r\n\r\nvarying float y_screen;\r\n//varying vec2 v_texture;\r\n\r\nvoid main() {\r\n    gl_Position = vec4(a_pos.xy, 0.0, 1.0);\r\n//    v_texture = a_pos.zw;\r\n    y_screen = a_pos.y;\r\n}"}});
define("com/huayun/webgis/gl/VertexFragShader", [
    "exports",
    "../data/uniform",
    "dojo/text!./shaders/rect.vertex.glsl",
    "dojo/text!./shaders/rect.fragment.glsl",
    "dojo/text!./shaders/terrain.vertex.glsl",
    "dojo/text!./shaders/terrain.fragment.glsl",
    "dojo/text!./shaders/height_map.vertex.glsl",
    "dojo/text!./shaders/height_map.fragment.glsl",
    "dojo/text!./shaders/tiffTerrain.vertex.glsl",
    "dojo/text!./shaders/tifTerrain.fragment.glsl",
    "dojo/text!./shaders/water.vertex.glsl",
    "dojo/text!./shaders/water.fragment.glsl",
    "dojo/text!./shaders/fill_extrusion.vertex.glsl",
    "dojo/text!./shaders/fill_extrusion.fragment.glsl",
    "dojo/text!./shaders/background.vertex.glsl",
    "dojo/text!./shaders/background.fragment.glsl",
    "dojo/text!./shaders/mesh.vertex.glsl",
    "dojo/text!./shaders/mesh.fragment.glsl",
    "dojo/text!./shaders/cylinder.vertex.glsl",
    "dojo/text!./shaders/cylinder.fragment.glsl",
    "dojo/text!./shaders/cone.vertex.glsl",
    "dojo/text!./shaders/cone.fragment.glsl",
    "dojo/text!./shaders/line.vertex.glsl",
    "dojo/text!./shaders/line.fragment.glsl"
], function (exports, uniform,
             rectVertex,
             reactFragment,
             terrainVertex,
             terrainFragment,
             heightMapVertex,
             heightMapFragment,
             tiffTerrainVertex,
             tiffTerrainFragment,
             waterVertex,
             waterFragment,
             fillExtrusionVert,
             fillExtrusionFrag,
             bgVertex,
             bgFragment,
             meshVertex,
             meshFragment,
             cylinderVertex,
             cylinderFragment,
             coneVertex,
             coneFragment,
             mylineVertex,
             mylineFragment
) {

    //------------------------------------------------------------------------------------------------------------------background部分
    var backgroundVert = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "#endif\n" +
        "\n" +
        "attribute vec2 a_pos;\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "\n" +
        "void main() {\n" +
        "    gl_Position = u_matrix * vec4(a_pos, -1, 1);\n" +
        "}";

    var backgroundFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform vec4 u_color;\n" +
        "uniform float u_opacity;\n" +
        "\n" +
        "void main() {\n" +
        "    gl_FragColor = u_color * u_opacity;\n" +
        "\n" +
        "#ifdef OVERDRAW_INSPECTOR\n" +
        "    gl_FragColor = vec4(1.0);\n" +
        "#endif\n" +
        "}";

    var backgroundUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_color': new uniform.UniformColor(context, locations.u_color)
        });
    };

    //------------------------------------------------------------------------------------------------------------------模板部分
    var clippingMaskVert = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "attribute vec2 a_pos;\n" +
        "uniform mat4 u_matrix;\n" +
        "\n" +
        "void main() {\n" +
        "    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n" +
        "}";

    var clippingMaskFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "void main() {\n" +
        "    gl_FragColor = vec4(1.0);\n" +
        "}";
    var clippingMaskUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix)
        });
    };
    //------------------------------------------------------------------------------------------------------------------模板部分OK

    //------------------------------------------------------------------------------------------------------------------fill类型部分
    /**
     * 填充多边形的顶点着色器
     * @type {string}
     */
    var fillVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "vec2 unpack_float(const float packedValue) {\n" +
        "    int packedIntValue = int(packedValue);\n" +
        "    int v0 = packedIntValue / 256;\n" +
        "    return vec2(v0, packedIntValue - v0 * 256);\n" +
        "}\n" +
        "\n" +
        "vec4 decode_color(const vec2 encodedColor) {\n" +
        "    return vec4(\n" +
        "        unpack_float(encodedColor[0]) / 255.0,\n" +
        "        unpack_float(encodedColor[1]) / 255.0\n" +
        "    );\n" +
        "}\n" +
        "\n" +
        "float unpack_mix_vec2(const vec2 packedValue, const float t) {\n" +
        "    return mix(packedValue[0], packedValue[1], t);\n" +
        "}\n" +
        "\n" +
        "vec4 unpack_mix_color(const vec4 packedColors, const float t) {\n" +
        "    vec4 minColor = decode_color(vec2(packedColors[0], packedColors[1]));\n" +
        "    vec4 maxColor = decode_color(vec2(packedColors[2], packedColors[3]));\n" +
        "    return mix(minColor, maxColor, t);\n" +
        "}\n" +
        "\n" +
        "attribute vec2 a_pos;\n" +
        "uniform mat4 u_matrix;\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "uniform lowp float u_color_t;\n" +
        "attribute highp vec4 a_color;\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "uniform lowp float u_opacity_t;\n" +
        "attribute lowp vec2 a_opacity;\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "void main() {\n" +
        "    #ifndef HAS_UNIFORM_u_color\n" +
        "        color = unpack_mix_color(a_color, u_color_t);\n" +
        "    #else\n" +
        "        highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_opacity\n" +
        "        opacity = unpack_mix_vec2(a_opacity, u_opacity_t);\n" +
        "    #else\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n" +
        "}";

    /**
     * 填充多边形的片元着色器
     * @type {string}
     */
    var fillFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "void main() {\n" +
        "    #ifdef HAS_UNIFORM_u_color\n" +
        "        highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_opacity\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "    gl_FragColor = color * opacity;\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "        gl_FragColor = vec4(1.0);\n" +
        "    #endif\n" +
        "}";
    /**
     * 填充多边形的着色器中的uniform类型变量
     * @param context
     * @param locations
     */
    var fillUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix)/*,
      'iz': new uniform.Uniform1f(context, locations.iz)*/
        });
    };

    //------------------------------------------------------------------------------------------------------------------fill类型部分

    //------------------------------------------------------------------------------------------------------------------绘制线
    /**
     * 线的顶点着色器
     * @type {string}
     */
    var lineVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "#endif\n" +
        "\n" +
        "vec2 unpack_float(const float packedValue) {\n" +
        "    int packedIntValue = int(packedValue);\n" +
        "    int v0 = packedIntValue / 256;\n" +
        "    return vec2(v0, packedIntValue - v0 * 256);\n" +
        "}\n" +
        "vec4 decode_color(const vec2 encodedColor) {\n" +
        "    return vec4(\n" +
        "        unpack_float(encodedColor[0]) / 255.0,\n" +
        "        unpack_float(encodedColor[1]) / 255.0\n" +
        "    );\n" +
        "}\n" +
        "\n" +
        "float unpack_mix_vec2(const vec2 packedValue, const float t) {\n" +
        "    return mix(packedValue[0], packedValue[1], t);\n" +
        "}\n" +
        "\n" +
        "vec4 unpack_mix_color(const vec4 packedColors, const float t) {\n" +
        "    vec4 minColor = decode_color(vec2(packedColors[0], packedColors[1]));\n" +
        "    vec4 maxColor = decode_color(vec2(packedColors[2], packedColors[3]));\n" +
        "    return mix(minColor, maxColor, t);\n" +
        "}\n" +
        "\n" +
        "#define scale 0.015873016\n" +
        "\n" +
        "attribute vec2 a_pos_normal;\n" +
        "attribute vec4 a_data;\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "uniform mediump float u_ratio;\n" +
        "uniform vec2 u_units_to_pixels;\n" +
        "uniform lowp float u_device_pixel_ratio;\n" +
        "\n" +
        "varying vec2 v_normal;\n" +
        "varying vec2 v_width2;\n" +
        "varying float v_gamma_scale;\n" +
        "varying highp float v_linesofar;\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "uniform lowp float u_color_t;\n" +
        "attribute highp vec4 a_color;\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_blur\n" +
        "uniform lowp float u_blur_t;\n" +
        "attribute lowp vec2 a_blur;\n" +
        "varying lowp float blur;\n" +
        "#else\n" +
        "uniform lowp float u_blur;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "uniform lowp float u_opacity_t;\n" +
        "attribute lowp vec2 a_opacity;\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_gapwidth\n" +
        "uniform lowp float u_gapwidth_t;\n" +
        "attribute mediump vec2 a_gapwidth;\n" +
        "#else\n" +
        "uniform mediump float u_gapwidth;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_offset\n" +
        "uniform lowp float u_offset_t;\n" +
        "attribute lowp vec2 a_offset;\n" +
        "#else\n" +
        "uniform lowp float u_offset;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_width\n" +
        "uniform lowp float u_width_t;\n" +
        "attribute mediump vec2 a_width;\n" +
        "#else\n" +
        "uniform mediump float u_width;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "void main() {\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_color\n" +
        "        color = unpack_mix_color(a_color, u_color_t);\n" +
        "    #else\n" +
        "        highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_blur\n" +
        "        blur = unpack_mix_vec2(a_blur, u_blur_t);\n" +
        "    #else\n" +
        "        lowp float blur = u_blur;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_opacity\n" +
        "        opacity = unpack_mix_vec2(a_opacity, u_opacity_t);\n" +
        "    #else\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_gapwidth\n" +
        "        mediump float gapwidth = unpack_mix_vec2(a_gapwidth, u_gapwidth_t);\n" +
        "    #else\n" +
        "        mediump float gapwidth = u_gapwidth;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_offset\n" +
        "        lowp float offset = unpack_mix_vec2(a_offset, u_offset_t);\n" +
        "    #else\n" +
        "        lowp float offset = u_offset;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_width\n" +
        "        mediump float width = unpack_mix_vec2(a_width, u_width_t);\n" +
        "    #else\n" +
        "        mediump float width = u_width;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    // the distance over which the line edge fades out.\n" +
        "    // Retina devices need a smaller distance to avoid aliasing.\n" +
        "    float ANTIALIASING = 1.0 / u_device_pixel_ratio / 2.0;\n" +
        "\n" +
        "    vec2 a_extrude = a_data.xy - 128.0;\n" +
        "    float a_direction = mod(a_data.z, 4.0) - 1.0;\n" +
        "\n" +
        "    v_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * 2.0;\n" +
        "\n" +
        "    vec2 pos = floor(a_pos_normal * 0.5);\n" +
        "\n" +
        "    // x is 1 if it's a round cap, 0 otherwise\n" +
        "    // y is 1 if the normal points up, and -1 if it points down\n" +
        "    // We store these in the least significant bit of a_pos_normal\n" +
        "    mediump vec2 normal = a_pos_normal - 2.0 * pos;\n" +
        "    normal.y = normal.y * 2.0 - 1.0;\n" +
        "    v_normal = normal;\n" +
        "\n" +
        "    // these transformations used to be applied in the JS and native code bases.\n" +
        "    // moved them into the shader for clarity and simplicity.\n" +
        "    gapwidth = gapwidth / 2.0;\n" +
        "    float halfwidth = width / 2.0;\n" +
        "    offset = -1.0 * offset;\n" +
        "\n" +
        "    float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\n" +
        "    float outset = gapwidth + halfwidth * (gapwidth > 0.0 ? 2.0 : 1.0) + (halfwidth == 0.0 ? 0.0 : ANTIALIASING);\n" +
        "\n" +
        "    // Scale the extrusion vector down to a normal and then up by the line width\n" +
        "    // of this vertex.\n" +
        "    mediump vec2 dist = outset * a_extrude * scale;\n" +
        "\n" +
        "    // Calculate the offset when drawing a line that is to the side of the actual line.\n" +
        "    // We do this by creating a vector that points towards the extrude, but rotate\n" +
        "    // it when we're drawing round end points (a_direction = -1 or 1) since their\n" +
        "    // extrude vector points in another direction.\n" +
        "    mediump float u = 0.5 * a_direction;\n" +
        "    mediump float t = 1.0 - abs(u);\n" +
        "    mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n" +
        "\n" +
        "    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\n" +
        "    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 1.1, 1.0) + projected_extrude;\n" +
        "\n" +
        "    // calculate how much the perspective view squishes or stretches the extrude\n" +
        "    float extrude_length_without_perspective = length(dist);\n" +
        "    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_units_to_pixels);\n" +
        "    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\n" +
        "\n" +
        "    v_width2 = vec2(outset, inset);\n" +
        "}";
    /**
     * 线的片元着色器
     * @type {string}
     */
    var lineFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "#endif\n" +
        "uniform lowp float u_device_pixel_ratio;\n" +
        "varying vec2 v_width2;\n" +
        "varying vec2 v_normal;\n" +
        "varying float v_gamma_scale;\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "#ifndef HAS_UNIFORM_u_blur\n" +
        "varying lowp float blur;\n" +
        "#else\n" +
        "uniform lowp float u_blur;\n" +
        "#endif\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "void main() {\n" +
        "    #ifdef HAS_UNIFORM_u_color\n" +
        "        highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "    #ifdef HAS_UNIFORM_u_blur\n" +
        "        lowp float blur = u_blur;\n" +
        "    #endif\n" +
        "    #ifdef HAS_UNIFORM_u_opacity\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "        float dist = length(v_normal) * v_width2.s;\n" +
        "        float blur2 = (blur + 1.0 / u_device_pixel_ratio) * v_gamma_scale;\n" +
        "        float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\n" +
        "        gl_FragColor = color * (alpha * opacity);\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "        gl_FragColor = vec4(1.0);\n" +
        "    #endif\n" +
        "}\n";
    exports.line = {
        vertexSource: lineVertex,
        fragmentSource: lineFrag
    };

    /**
     * 线段着色器中的uniform类型变量
     * @param context
     * @param locations
     */
    var lineUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_ratio': new uniform.Uniform1f(context, locations.u_ratio),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_units_to_pixels': new uniform.Uniform2f(context, locations.u_units_to_pixels)
        });
    };
    //------------------------------------------------------------------------------------------------------------------线段OK

    //------------------------------------------------------------------------------------------------------------------虚线部分
    /**
     * 虚线的顶点着色器
     * @type {string}
     */
    var lineDashVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "vec2 unpack_float(const float packedValue) {\n" +
        "    int packedIntValue = int(packedValue);\n" +
        "    int v0 = packedIntValue / 256;\n" +
        "    return vec2(v0, packedIntValue - v0 * 256);\n" +
        "}\n" +
        "\n" +
        "vec4 decode_color(const vec2 encodedColor) {\n" +
        "    return vec4(\n" +
        "        unpack_float(encodedColor[0]) / 255.0,\n" +
        "        unpack_float(encodedColor[1]) / 255.0\n" +
        "    );\n" +
        "}\n" +
        "\n" +
        "float unpack_mix_vec2(const vec2 packedValue, const float t) {\n" +
        "    return mix(packedValue[0], packedValue[1], t);\n" +
        "}\n" +
        "\n" +
        "vec4 unpack_mix_color(const vec4 packedColors, const float t) {\n" +
        "    vec4 minColor = decode_color(vec2(packedColors[0], packedColors[1]));\n" +
        "    vec4 maxColor = decode_color(vec2(packedColors[2], packedColors[3]));\n" +
        "    return mix(minColor, maxColor, t);\n" +
        "}\n" +
        "\n" +
        "#define scale 0.015873016\n" +
        "#define LINE_DISTANCE_SCALE 2.0\n" +
        "\n" +
        "attribute vec2 a_pos_normal;\n" +
        "attribute vec4 a_data;\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "uniform mediump float u_ratio;\n" +
        "uniform lowp float u_device_pixel_ratio;\n" +
        "uniform vec2 u_patternscale_a;\n" +
        "uniform float u_tex_y_a;\n" +
        "uniform vec2 u_patternscale_b;\n" +
        "uniform float u_tex_y_b;\n" +
        "uniform vec2 u_units_to_pixels;\n" +
        "\n" +
        "varying vec2 v_normal;\n" +
        "varying vec2 v_width2;\n" +
        "varying vec2 v_tex_a;\n" +
        "varying vec2 v_tex_b;\n" +
        "varying float v_gamma_scale;\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "uniform lowp float u_color_t;\n" +
        "attribute highp vec4 a_color;\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_blur\n" +
        "uniform lowp float u_blur_t;\n" +
        "attribute lowp vec2 a_blur;\n" +
        "varying lowp float blur;\n" +
        "#else\n" +
        "uniform lowp float u_blur;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "uniform lowp float u_opacity_t;\n" +
        "attribute lowp vec2 a_opacity;\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_gapwidth\n" +
        "uniform lowp float u_gapwidth_t;\n" +
        "attribute mediump vec2 a_gapwidth;\n" +
        "#else\n" +
        "uniform mediump float u_gapwidth;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_offset\n" +
        "uniform lowp float u_offset_t;\n" +
        "attribute lowp vec2 a_offset;\n" +
        "#else\n" +
        "uniform lowp float u_offset;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_width\n" +
        "uniform lowp float u_width_t;\n" +
        "attribute mediump vec2 a_width;\n" +
        "varying mediump float width;\n" +
        "#else\n" +
        "uniform mediump float u_width;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_floorwidth\n" +
        "uniform lowp float u_floorwidth_t;\n" +
        "attribute lowp vec2 a_floorwidth;\n" +
        "varying lowp float floorwidth;\n" +
        "#else\n" +
        "uniform lowp float u_floorwidth;\n" +
        "#endif\n" +
        "\n" +
        "void main() {\n" +
        "    #ifndef HAS_UNIFORM_u_color\n" +
        "        color = unpack_mix_color(a_color, u_color_t);\n" +
        "    #else\n" +
        "        highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_blur\n" +
        "        blur = unpack_mix_vec2(a_blur, u_blur_t);\n" +
        "    #else\n" +
        "        lowp float blur = u_blur;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_opacity\n" +
        "        opacity = unpack_mix_vec2(a_opacity, u_opacity_t);\n" +
        "    #else\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_gapwidth\n" +
        "        mediump float gapwidth = unpack_mix_vec2(a_gapwidth, u_gapwidth_t);\n" +
        "    #else\n" +
        "        mediump float gapwidth = u_gapwidth;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_offset\n" +
        "        lowp float offset = unpack_mix_vec2(a_offset, u_offset_t);\n" +
        "    #else\n" +
        "        lowp float offset = u_offset;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_width\n" +
        "        width = unpack_mix_vec2(a_width, u_width_t);\n" +
        "    #else\n" +
        "        mediump float width = u_width;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_floorwidth\n" +
        "        floorwidth = unpack_mix_vec2(a_floorwidth, u_floorwidth_t);\n" +
        "    #else\n" +
        "        lowp float floorwidth = u_floorwidth;\n" +
        "    #endif\n" +
        "\n" +
        "    float ANTIALIASING = 1.0 / u_device_pixel_ratio / 2.0;\n" +
        "    vec2 a_extrude = a_data.xy - 128.0;\n" +
        "    float a_direction = mod(a_data.z, 4.0) - 1.0;\n" +
        "    float a_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * LINE_DISTANCE_SCALE;\n" +
        "\n" +
        "    vec2 pos = floor(a_pos_normal * 0.5);\n" +
        "\n" +
        "    mediump vec2 normal = a_pos_normal - 2.0 * pos;\n" +
        "    normal.y = normal.y * 2.0 - 1.0;\n" +
        "    v_normal = normal;\n" +
        "\n" +
        "    gapwidth = gapwidth / 2.0;\n" +
        "    float halfwidth = width / 2.0;\n" +
        "    offset = -1.0 * offset;\n" +
        "    float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\n" +
        "    float outset = gapwidth + halfwidth * (gapwidth > 0.0 ? 2.0 : 1.0) + (halfwidth == 0.0 ? 0.0 : ANTIALIASING);\n" +
        "    mediump vec2 dist =outset * a_extrude * scale;\n" +
        "    mediump float u = 0.5 * a_direction;\n" +
        "    mediump float t = 1.0 - abs(u);\n" +
        "    mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n" +
        "    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\n" +
        "    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 1.1, 1.0) + projected_extrude;\n" +
        "    float extrude_length_without_perspective = length(dist);\n" +
        "    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_units_to_pixels);\n" +
        "    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\n" +
        "    v_tex_a = vec2(a_linesofar * u_patternscale_a.x / floorwidth, normal.y * u_patternscale_a.y + u_tex_y_a);\n" +
        "    v_tex_b = vec2(a_linesofar * u_patternscale_b.x / floorwidth, normal.y * u_patternscale_b.y + u_tex_y_b);\n" +
        "    v_width2 = vec2(outset, inset);\n" +
        "}";

    /**
     * 虚线的片元着色器
     * @type {string}
     */
    var lineDashFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform lowp float u_device_pixel_ratio;\n" +
        "uniform sampler2D u_image;\n" +
        "uniform float u_sdfgamma;\n" +
        "uniform float u_mix;\n" +
        "\n" +
        "varying vec2 v_normal;\n" +
        "varying vec2 v_width2;\n" +
        "varying vec2 v_tex_a;\n" +
        "varying vec2 v_tex_b;\n" +
        "varying float v_gamma_scale;\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_blur\n" +
        "varying lowp float blur;\n" +
        "#else\n" +
        "uniform lowp float u_blur;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_width\n" +
        "varying mediump float width;\n" +
        "#else\n" +
        "uniform mediump float u_width;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_floorwidth\n" +
        "varying lowp float floorwidth;\n" +
        "#else\n" +
        "uniform lowp float u_floorwidth;\n" +
        "#endif\n" +
        "\n" +
        "void main() {\n" +
        "    #ifdef HAS_UNIFORM_u_color\n" +
        "        highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_blur\n" +
        "        lowp float blur = u_blur;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_opacity\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_width\n" +
        "        mediump float width = u_width;\n" +
        "    #endif\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_floorwidth\n" +
        "        lowp float floorwidth = u_floorwidth;\n" +
        "    #endif\n" +
        "    float dist = length(v_normal) * v_width2.s;\n" +
        "\n" +
        "    float blur2 = (blur + 1.0 / u_device_pixel_ratio) * v_gamma_scale;\n" +
        "    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\n" +
        "    float sdfdist_a = texture2D(u_image, v_tex_a).a;\n" +
        "    float sdfdist_b = texture2D(u_image, v_tex_b).a;\n" +
        "    float sdfdist = mix(sdfdist_a, sdfdist_b, u_mix);\n" +
        "    alpha *= smoothstep(0.5 - u_sdfgamma / floorwidth, 0.5 + u_sdfgamma / floorwidth, sdfdist);\n" +
        "\n" +
        "    gl_FragColor = color * (alpha * opacity);\n" +
        "\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "        gl_FragColor = vec4(1.0);\n" +
        "    #endif\n" +
        "}";

    /**
     * 虚线着色器中的uniform类型变量
     * @param context
     * @param locations
     */
    var lineSDFUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_ratio': new uniform.Uniform1f(context, locations.u_ratio),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_units_to_pixels': new uniform.Uniform2f(context, locations.u_units_to_pixels),
            'u_patternscale_a': new uniform.Uniform2f(context, locations.u_patternscale_a),
            'u_patternscale_b': new uniform.Uniform2f(context, locations.u_patternscale_b),
            'u_sdfgamma': new uniform.Uniform1f(context, locations.u_sdfgamma),
            'u_image': new uniform.Uniform1i(context, locations.u_image),
            'u_tex_y_a': new uniform.Uniform1f(context, locations.u_tex_y_a),
            'u_tex_y_b': new uniform.Uniform1f(context, locations.u_tex_y_b),
            'u_mix': new uniform.Uniform1f(context, locations.u_mix)
        });
    };
    //------------------------------------------------------------------------------------------------------------------虚线部分OK


    //------------------------------------------------------------------------------------------------------------------标注的文字部分
    /**
     * 字体标注的顶点着色器
     * @type {string}
     */
    var symbolVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "vec2 unpack_float(const float packedValue) {\n" +
        "    int packedIntValue = int(packedValue);\n" +
        "    int v0 = packedIntValue / 256;\n" +
        "    return vec2(v0, packedIntValue - v0 * 256);\n" +
        "}\n" +
        "vec2 unpack_opacity(const float packedOpacity) {\n" +
        "    int intOpacity = int(packedOpacity) / 2;\n" +
        "    return vec2(float(intOpacity) / 127.0, mod(packedOpacity, 2.0));\n" +
        "}\n" +
        "vec4 decode_color(const vec2 encodedColor) {\n" +
        "    return vec4(\n" +
        "        unpack_float(encodedColor[0]) / 255.0,\n" +
        "        unpack_float(encodedColor[1]) / 255.0\n" +
        "    );\n" +
        "}\n" +
        "float unpack_mix_vec2(const vec2 packedValue, const float t) {\n" +
        "    return mix(packedValue[0], packedValue[1], t);\n" +
        "}\n" +
        "vec4 unpack_mix_color(const vec4 packedColors, const float t) {\n" +
        "    vec4 minColor = decode_color(vec2(packedColors[0], packedColors[1]));\n" +
        "    vec4 maxColor = decode_color(vec2(packedColors[2], packedColors[3]));\n" +
        "    return mix(minColor, maxColor, t);\n" +
        "}\n" +
        "const float PI = 3.141592653589793;\n" +
        "\n" +
        "attribute vec4 a_pos_offset;\n" +
        "attribute vec4 a_data;\n" +
        "attribute vec3 a_projected_pos;\n" +
        "attribute float a_fade_opacity;\n" +
        "\n" +
        "uniform bool u_is_size_zoom_constant;\n" +
        "uniform bool u_is_size_feature_constant;\n" +
        "uniform highp float u_size_t; \n" +
        "uniform highp float u_size; \n" +
        "uniform mat4 u_matrix;\n" +
        "uniform mat4 u_label_plane_matrix;\n" +
        "uniform mat4 u_coord_matrix;\n" +
        "uniform bool u_is_text;\n" +
        "uniform bool u_pitch_with_map;\n" +
        "uniform highp float u_pitch;\n" +
        "uniform bool u_rotate_symbol;\n" +
        "uniform highp float u_aspect_ratio;\n" +
        "uniform highp float u_camera_to_center_distance;\n" +
        "uniform float u_fade_change;\n" +
        "uniform vec2 u_texsize;\n" +
        "\n" +
        "varying vec2 v_data0;\n" +
        "varying vec3 v_data1;\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_fill_color\n" +
        "uniform lowp float u_fill_color_t;\n" +
        "attribute highp vec4 a_fill_color;\n" +
        "varying highp vec4 fill_color;\n" +
        "#else\n" +
        "uniform highp vec4 u_fill_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_halo_color\n" +
        "uniform lowp float u_halo_color_t;\n" +
        "attribute highp vec4 a_halo_color;\n" +
        "varying highp vec4 halo_color;\n" +
        "#else\n" +
        "uniform highp vec4 u_halo_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "uniform lowp float u_opacity_t;\n" +
        "attribute lowp vec2 a_opacity;\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_halo_width\n" +
        "uniform lowp float u_halo_width_t;\n" +
        "attribute lowp vec2 a_halo_width;\n" +
        "varying lowp float halo_width;\n" +
        "#else\n" +
        "uniform lowp float u_halo_width;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_halo_blur\n" +
        "uniform lowp float u_halo_blur_t;\n" +
        "attribute lowp vec2 a_halo_blur;\n" +
        "varying lowp float halo_blur;\n" +
        "#else\n" +
        "uniform lowp float u_halo_blur;\n" +
        "#endif\n" +
        "\n" +
        "void main() { \n" +
        "    #ifndef HAS_UNIFORM_u_fill_color\n" +
        "        fill_color = unpack_mix_color(a_fill_color, u_fill_color_t);\n" +
        "    #else\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "    #endif\n" +
        "    \n" +
        "        \n" +
        "    #ifndef HAS_UNIFORM_u_halo_color\n" +
        "        halo_color = unpack_mix_color(a_halo_color, u_halo_color_t);\n" +
        "    #else\n" +
        "        highp vec4 halo_color = u_halo_color;\n" +
        "    #endif\n" +
        "    \n" +
        "        \n" +
        "    #ifndef HAS_UNIFORM_u_opacity\n" +
        "        opacity = unpack_mix_vec2(a_opacity, u_opacity_t);\n" +
        "    #else\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "    \n" +
        "        \n" +
        "    #ifndef HAS_UNIFORM_u_halo_width\n" +
        "        halo_width = unpack_mix_vec2(a_halo_width, u_halo_width_t);\n" +
        "    #else\n" +
        "        lowp float halo_width = u_halo_width;\n" +
        "    #endif\n" +
        "    \n" +
        "        \n" +
        "    #ifndef HAS_UNIFORM_u_halo_blur\n" +
        "        halo_blur = unpack_mix_vec2(a_halo_blur, u_halo_blur_t);\n" +
        "    #else\n" +
        "        lowp float halo_blur = u_halo_blur;\n" +
        "    #endif\n" +
        "    vec2 a_pos = a_pos_offset.xy;\n" +
        "    vec2 a_offset = a_pos_offset.zw;\n" +
        "\n" +
        "    vec2 a_tex = a_data.xy;\n" +
        "    vec2 a_size = a_data.zw;\n" +
        "\n" +
        "    highp float segment_angle = -a_projected_pos[2];\n" +
        "    float size;\n" +
        "    if (!u_is_size_zoom_constant && !u_is_size_feature_constant) {\n" +
        "        size = mix(a_size[0], a_size[1], u_size_t) / 256.0;\n" +
        "    } else if (u_is_size_zoom_constant && !u_is_size_feature_constant) {\n" +
        "        size = a_size[0] / 256.0;\n" +
        "    } else if (!u_is_size_zoom_constant && u_is_size_feature_constant) {\n" +
        "        size = u_size;\n" +
        "    } else {\n" +
        "        size = u_size;\n" +
        "    }\n" +
        "    vec4 projectedPoint = u_matrix * vec4(a_pos, 0, 1);\n" +
        "    highp float camera_to_anchor_distance = projectedPoint.w;\n" +
        "    highp float distance_ratio = u_pitch_with_map ? camera_to_anchor_distance / u_camera_to_center_distance : u_camera_to_center_distance / camera_to_anchor_distance;\n" +
        "    highp float perspective_ratio = clamp( 0.5 + 0.5 * distance_ratio, 0.0, 4.0);\n" +
        "    size *= perspective_ratio;\n" +
        "    float fontScale = u_is_text ? size / 24.0 : size;\n" +
        "    highp float symbol_rotation = 0.0;\n" +
        "    if (u_rotate_symbol) {\n" +
        "        vec4 offsetProjectedPoint = u_matrix * vec4(a_pos + vec2(1, 0), 0, 1);\n" +
        "        vec2 a = projectedPoint.xy / projectedPoint.w;\n" +
        "        vec2 b = offsetProjectedPoint.xy / offsetProjectedPoint.w;\n" +
        "        symbol_rotation = atan((b.y - a.y) / u_aspect_ratio, b.x - a.x);\n" +
        "    }\n" +
        "    highp float angle_sin = sin(segment_angle + symbol_rotation);\n" +
        "    highp float angle_cos = cos(segment_angle + symbol_rotation);\n" +
        "    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);\n" +
        "    vec4 projected_pos = u_label_plane_matrix * vec4(a_projected_pos.xy, 0.0, 1.0);\n" +
        "    gl_Position = u_coord_matrix * vec4(projected_pos.xy / projected_pos.w + rotation_matrix * (a_offset / 32.0 * fontScale), 0.0, 1.0);\n" +
        "    float gamma_scale = gl_Position.w;\n" +
        "    vec2 tex = a_tex / u_texsize;\n" +
        "    vec2 fade_opacity = unpack_opacity(a_fade_opacity);\n" +
        "    float fade_change = fade_opacity[1] > 0.5 ? u_fade_change : -u_fade_change;\n" +
        "    float interpolated_fade_opacity = max(0.0, min(1.0, fade_opacity[0] + fade_change));\n" +
        "    v_data0 = vec2(tex.x, tex.y);\n" +
        "    v_data1 = vec3(gamma_scale, size, interpolated_fade_opacity);\n" +
        "}";

    /**
     * 字体标注的片元着色器
     * @type {string}
     */
    var symbolFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "#define SDF_PX 8.0\n" +
        "uniform bool u_is_halo;\n" +
        "uniform sampler2D u_texture;\n" +
        "uniform highp float u_gamma_scale;\n" +
        "uniform lowp float u_device_pixel_ratio;\n" +
        "uniform bool u_is_text;\n" +
        "\n" +
        "varying vec2 v_data0;\n" +
        "varying vec3 v_data1;\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_fill_color\n" +
        "varying highp vec4 fill_color;\n" +
        "#else\n" +
        "uniform highp vec4 u_fill_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_halo_color\n" +
        "varying highp vec4 halo_color;\n" +
        "#else\n" +
        "uniform highp vec4 u_halo_color;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_halo_width\n" +
        "varying lowp float halo_width;\n" +
        "#else\n" +
        "uniform lowp float u_halo_width;\n" +
        "#endif\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_halo_blur\n" +
        "varying lowp float halo_blur;\n" +
        "#else\n" +
        "uniform lowp float u_halo_blur;\n" +
        "#endif\n" +
        "void main() {\n" +
        "    #ifdef HAS_UNIFORM_u_fill_color\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "    #endif\n" +
        "    #ifdef HAS_UNIFORM_u_halo_color\n" +
        "        highp vec4 halo_color = u_halo_color;\n" +
        "    #endif\n" +
        "    #ifdef HAS_UNIFORM_u_opacity\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "    #ifdef HAS_UNIFORM_u_halo_width\n" +
        "        lowp float halo_width = u_halo_width;\n" +
        "    #endif\n" +
        "    #ifdef HAS_UNIFORM_u_halo_blur\n" +
        "        lowp float halo_blur = u_halo_blur;\n" +
        "    #endif\n" +
        "\n" +
        "    float EDGE_GAMMA = 0.105 / u_device_pixel_ratio;\n" +
        "    vec2 tex = v_data0.xy;\n" +
        "    float gamma_scale = v_data1.x;\n" +
        "    float size = v_data1.y;\n" +
        "    float fade_opacity = v_data1[2];\n" +
        "    float fontScale = u_is_text ? size / 24.0 : size;\n" +
        "    lowp vec4 color = fill_color;\n" +
        "    highp float gamma = EDGE_GAMMA / (fontScale * u_gamma_scale);\n" +
        "    lowp float buff = (256.0 - 64.0) / 256.0;\n" +
        "    if (u_is_halo) {\n" +
        "        color = halo_color;\n" +
        "        gamma = (halo_blur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_gamma_scale);\n" +
        "        buff = (6.0 - halo_width / fontScale) / SDF_PX;\n" +
        "    }\n" +
        "    lowp float dist = texture2D(u_texture, tex).a;\n" +
        "    highp float gamma_scaled = gamma * gamma_scale;\n" +
        "    highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);\n" +
        "    gl_FragColor = color * (alpha * opacity * fade_opacity);\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "        gl_FragColor = vec4(1.0);\n" +
        "    #endif\n" +
        "}";

    /**
     * 字体标注着色器中的uniform类型变量
     * @param context
     * @param locations
     */
    var symbolSDFUniforms = function (context, locations) {
        return ({
            'u_is_size_zoom_constant': new uniform.Uniform1i(context, locations.u_is_size_zoom_constant),
            'u_is_size_feature_constant': new uniform.Uniform1i(context, locations.u_is_size_feature_constant),
            'u_size_t': new uniform.Uniform1f(context, locations.u_size_t),
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_pitch': new uniform.Uniform1f(context, locations.u_pitch),
            'u_rotate_symbol': new uniform.Uniform1i(context, locations.u_rotate_symbol),
            'u_aspect_ratio': new uniform.Uniform1f(context, locations.u_aspect_ratio),
            'u_fade_change': new uniform.Uniform1f(context, locations.u_fade_change),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_label_plane_matrix': new uniform.UniformMatrix4f(context, locations.u_label_plane_matrix),
            'u_coord_matrix': new uniform.UniformMatrix4f(context, locations.u_coord_matrix),
            'u_is_text': new uniform.Uniform1f(context, locations.u_is_text),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_texsize': new uniform.Uniform2f(context, locations.u_texsize),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture),
            'u_gamma_scale': new uniform.Uniform1f(context, locations.u_gamma_scale),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_is_halo': new uniform.Uniform1f(context, locations.u_is_halo)
        });
    };
    //------------------------------------------------------------------------------------------------------------------标注的文字部分OK

    //------------------------------------------------------------------------------------------------------------------标注的Icon部分
    /**
     * 图标标注的顶点着色器
     * @type {string}
     */
    var symbolIconVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "vec2 unpack_opacity(const float packedOpacity) {\n" +
        "    int intOpacity = int(packedOpacity) / 2;\n" +
        "    return vec2(float(intOpacity) / 127.0, mod(packedOpacity, 2.0));\n" +
        "}\n" +
        "\n" +
        "float unpack_mix_vec2(const vec2 packedValue, const float t) {\n" +
        "    return mix(packedValue[0], packedValue[1], t);\n" +
        "}\n" +
        "\n" +
        "const float PI = 3.141592653589793;\n" +
        "attribute vec4 a_pos_offset;\n" +
        "attribute vec4 a_data;\n" +
        "attribute vec3 a_projected_pos;\n" +
        "attribute float a_fade_opacity;\n" +
        "\n" +
        "uniform bool u_is_size_zoom_constant;\n" +
        "uniform bool u_is_size_feature_constant;\n" +
        "uniform highp float u_size_t;\n" +
        "uniform highp float u_size;\n" +
        "uniform highp float u_camera_to_center_distance;\n" +
        "uniform highp float u_pitch;\n" +
        "uniform bool u_rotate_symbol;\n" +
        "uniform highp float u_aspect_ratio;\n" +
        "uniform float u_fade_change;\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "uniform mat4 u_label_plane_matrix;\n" +
        "uniform mat4 u_coord_matrix;\n" +
        "\n" +
        "uniform bool u_is_text;\n" +
        "uniform bool u_pitch_with_map;\n" +
        "\n" +
        "uniform vec2 u_texsize;\n" +
        "\n" +
        "varying vec2 v_tex;\n" +
        "varying float v_fade_opacity;\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "uniform lowp float u_opacity_t;\n" +
        "attribute lowp vec2 a_opacity;\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "void main() {\n" +
        "    \n" +
        "    #ifndef HAS_UNIFORM_u_opacity\n" +
        "        opacity = unpack_mix_vec2(a_opacity, u_opacity_t);\n" +
        "    #else\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "    vec2 a_pos = a_pos_offset.xy;\n" +
        "    vec2 a_offset = a_pos_offset.zw;\n" +
        "\n" +
        "    vec2 a_tex = a_data.xy;\n" +
        "    vec2 a_size = a_data.zw;\n" +
        "\n" +
        "    highp float segment_angle = -a_projected_pos[2];\n" +
        "\n" +
        "    float size;\n" +
        "    if (!u_is_size_zoom_constant && !u_is_size_feature_constant) {\n" +
        "        size = mix(a_size[0], a_size[1], u_size_t) / 256.0;\n" +
        "    } else if (u_is_size_zoom_constant && !u_is_size_feature_constant) {\n" +
        "        size = a_size[0] / 256.0;\n" +
        "    } else if (!u_is_size_zoom_constant && u_is_size_feature_constant) {\n" +
        "        size = u_size;\n" +
        "    } else {\n" +
        "        size = u_size;\n" +
        "    }\n" +
        "\n" +
        "    vec4 projectedPoint = u_matrix * vec4(a_pos, 0, 1);\n" +
        "    highp float camera_to_anchor_distance = projectedPoint.w;\n" +
        "    highp float distance_ratio = u_pitch_with_map ? camera_to_anchor_distance / u_camera_to_center_distance : u_camera_to_center_distance / camera_to_anchor_distance;\n" +
        "    highp float perspective_ratio = clamp(0.5 + 0.5 * distance_ratio, 0.0, 4.0);\n" +
        "\n" +
        "    size *= perspective_ratio;\n" +
        "\n" +
        "    float fontScale = u_is_text ? size / 24.0 : size;\n" +
        "\n" +
        "    highp float symbol_rotation = 0.0;\n" +
        "    if (u_rotate_symbol) {\n" +
        "        vec4 offsetProjectedPoint = u_matrix * vec4(a_pos + vec2(1, 0), 0, 1);\n" +
        "        vec2 a = projectedPoint.xy / projectedPoint.w;\n" +
        "        vec2 b = offsetProjectedPoint.xy / offsetProjectedPoint.w;\n" +
        "        symbol_rotation = atan((b.y - a.y) / u_aspect_ratio, b.x - a.x);\n" +
        "    }\n" +
        "    highp float angle_sin = sin(segment_angle + symbol_rotation);\n" +
        "    highp float angle_cos = cos(segment_angle + symbol_rotation);\n" +
        "    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);\n" +
        "    vec4 projected_pos = u_label_plane_matrix * vec4(a_projected_pos.xy, 0.0, 1.0);\n" +
        "    gl_Position = u_coord_matrix * vec4(projected_pos.xy / projected_pos.w + rotation_matrix * (a_offset / 32.0 * fontScale), 0.99, 1.0);\n" +
        "    v_tex = a_tex / u_texsize;\n" +
        "    vec2 fade_opacity = unpack_opacity(a_fade_opacity);\n" +
        "    float fade_change = fade_opacity[1] > 0.5 ? u_fade_change : -u_fade_change;\n" +
        "    v_fade_opacity = max(0.0, min(1.0, fade_opacity[0] + fade_change));\n" +
        "}";

    /**
     * 图标标注的片元着色器
     * @type {string}
     */
    var symbolIconFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "uniform sampler2D u_texture;\n" +
        "varying vec2 v_tex;\n" +
        "varying float v_fade_opacity;\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "void main() {\n" +
        "    #ifdef HAS_UNIFORM_u_opacity\n" +
        "        lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "    lowp float alpha = opacity * v_fade_opacity;\n" +
        "    gl_FragColor = texture2D(u_texture, v_tex) * alpha;\n" +
        "\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "        gl_FragColor = vec4(1.0);\n" +
        "    #endif\n" +
        "}";
    /**
     * 图标标注着色器中的uniform类型变量
     * @param context
     * @param locations
     */
    var symbolIconUniforms = function (context, locations) {
        return ({
            'u_is_size_zoom_constant': new uniform.Uniform1i(context, locations.u_is_size_zoom_constant),
            'u_is_size_feature_constant': new uniform.Uniform1i(context, locations.u_is_size_feature_constant),
            'u_size_t': new uniform.Uniform1f(context, locations.u_size_t),
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_pitch': new uniform.Uniform1f(context, locations.u_pitch),
            'u_rotate_symbol': new uniform.Uniform1i(context, locations.u_rotate_symbol),
            'u_aspect_ratio': new uniform.Uniform1f(context, locations.u_aspect_ratio),
            'u_fade_change': new uniform.Uniform1f(context, locations.u_fade_change),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_label_plane_matrix': new uniform.UniformMatrix4f(context, locations.u_label_plane_matrix),
            'u_coord_matrix': new uniform.UniformMatrix4f(context, locations.u_coord_matrix),
            'u_is_text': new uniform.Uniform1f(context, locations.u_is_text),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_texsize': new uniform.Uniform2f(context, locations.u_texsize),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture)
        });
    };

    var basicSymbolV = "const float PI = 3.141592653589793;\n" +
        "    attribute vec4 a_pos_offset;\n" +
        "    attribute vec4 a_data;\n" +
        "    attribute vec3 a_projected_pos;\n" +
        "\n" +
        "    uniform highp float u_size; // used when size is both zoom and feature constant\n" +
        "    uniform mat4 u_matrix;\n" +
        "    uniform mat4 u_label_plane_matrix;\n" +
        "    uniform mat4 u_coord_matrix;\n" +
        "    uniform bool u_is_text;\n" +
        "    uniform bool u_pitch_with_map;\n" +
        "    uniform highp float u_pitch;\n" +
        "    uniform bool u_rotate_symbol;\n" +
        "    uniform highp float u_aspect_ratio;\n" +
        "    uniform highp float u_camera_to_center_distance;\n" +
        "    uniform float u_fade_change;\n" +
        "    uniform vec2 u_texsize;\n" +
        "\n" +
        "    varying vec2 v_data0;\n" +
        "    varying vec3 v_data1;\n" +
        "\n" +
        "    uniform highp vec4 u_fill_color;\n" +
        "    uniform highp vec4 u_halo_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform lowp float u_halo_width;\n" +
        "    uniform lowp float u_halo_blur;\n" +
        "\n" +
        "    void main() {\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "        highp vec4 halo_color = u_halo_color;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        lowp float halo_width = u_halo_width;\n" +
        "        lowp float halo_blur = u_halo_blur;\n" +
        "\n" +
        "        vec2 a_pos = a_pos_offset.xy;\n" +
        "        vec2 a_offset = a_pos_offset.zw;\n" +
        "        vec2 a_tex = a_data.xy;\n" +
        "        vec2 a_size = a_data.zw;\n" +
        "        highp float segment_angle = -a_projected_pos[2];\n" +
        "        float size = u_size;\n" +
        "\n" +
        "        vec4 projectedPoint = u_matrix * vec4(a_pos, 0, 1);\n" +
        "        highp float camera_to_anchor_distance = projectedPoint.w;\n" +
        "        highp float distance_ratio = u_pitch_with_map ? camera_to_anchor_distance / u_camera_to_center_distance : u_camera_to_center_distance / camera_to_anchor_distance;\n" +
        "        highp float perspective_ratio = clamp(\n" +
        "        0.5 + 0.5 * distance_ratio,\n" +
        "        0.0, // Prevents oversized near-field symbols in pitched/overzoomed tiles\n" +
        "        4.0);\n" +
        "\n" +
        "        size *= perspective_ratio;\n" +
        "        float fontScale = u_is_text ? size / 24.0 : size;\n" +
        "        highp float symbol_rotation = 0.0;\n" +
        "        if (u_rotate_symbol) {\n" +
        "            vec4 offsetProjectedPoint = u_matrix * vec4(a_pos + vec2(1, 0), 0, 1);\n" +
        "            vec2 a = projectedPoint.xy / projectedPoint.w;\n" +
        "            vec2 b = offsetProjectedPoint.xy / offsetProjectedPoint.w;\n" +
        "            symbol_rotation = atan((b.y - a.y) / u_aspect_ratio, b.x - a.x);\n" +
        "        }\n" +
        "\n" +
        "        highp float angle_sin = sin(segment_angle + symbol_rotation);\n" +
        "        highp float angle_cos = cos(segment_angle + symbol_rotation);\n" +
        "        mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);\n" +
        "\n" +
        "        vec4 projected_pos = u_label_plane_matrix * vec4(a_projected_pos.xy, 0.0, 1.0);\n" +
        "        gl_Position = u_coord_matrix * vec4(projected_pos.xy / projected_pos.w + rotation_matrix * (a_offset / 32.0 * fontScale), 0.0, 1.0);\n" +
        "        float gamma_scale = gl_Position.w;\n" +
        "\n" +
        "        vec2 tex = a_tex / u_texsize;\n" +
        "        float interpolated_fade_opacity = 1.0;\n" +
        "\n" +
        "        v_data0 = vec2(tex.x, tex.y);\n" +
        "        v_data1 = vec3(gamma_scale, size, interpolated_fade_opacity);\n" +
        "    }";

    var basicSymbolF = "precision mediump float;\n" +
        "\n" +
        "    #define SDF_PX 8.0\n" +
        "\n" +
        "    uniform bool u_is_halo;\n" +
        "    uniform sampler2D u_texture;\n" +
        "    uniform highp float u_gamma_scale;\n" +
        "    uniform lowp float u_device_pixel_ratio;\n" +
        "    uniform bool u_is_text;\n" +
        "\n" +
        "    varying vec2 v_data0;\n" +
        "    varying vec3 v_data1;\n" +
        "\n" +
        "    uniform highp vec4 u_fill_color;\n" +
        "    uniform highp vec4 u_halo_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform lowp float u_halo_width;\n" +
        "    uniform lowp float u_halo_blur;\n" +
        "\n" +
        "    void main() {\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "        highp vec4 halo_color = u_halo_color;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        lowp float halo_width = u_halo_width;\n" +
        "        lowp float halo_blur = u_halo_blur;\n" +
        "\n" +
        "        float EDGE_GAMMA = 0.105 / u_device_pixel_ratio;\n" +
        "\n" +
        "        vec2 tex = v_data0.xy;\n" +
        "        float gamma_scale = v_data1.x;\n" +
        "        float size = v_data1.y;\n" +
        "        float fade_opacity = v_data1[2];\n" +
        "\n" +
        "        float fontScale = u_is_text ? size / 24.0 : size;\n" +
        "\n" +
        "        lowp vec4 color = fill_color;\n" +
        "        highp float gamma = EDGE_GAMMA / (fontScale * u_gamma_scale);\n" +
        "        lowp float buff = (256.0 - 64.0) / 256.0;\n" +
        "        if (u_is_halo) {\n" +
        "            color = halo_color;\n" +
        "            gamma = (halo_blur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_gamma_scale);\n" +
        "            buff = (6.0 - halo_width / fontScale) / SDF_PX;\n" +
        "        }\n" +
        "        lowp float dist = texture2D(u_texture, tex).a;\n" +
        "        highp float gamma_scaled = gamma * gamma_scale;\n" +
        "        highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);\n" +
        "        gl_FragColor = color * (alpha * opacity * fade_opacity);\n" +
        "    }";

    var basicSymbolUniform = function (context, locations) {
        return ({
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_pitch': new uniform.Uniform1f(context, locations.u_pitch),
            'u_rotate_symbol': new uniform.Uniform1i(context, locations.u_rotate_symbol),
            'u_aspect_ratio': new uniform.Uniform1f(context, locations.u_aspect_ratio),
            'u_fade_change': new uniform.Uniform1f(context, locations.u_fade_change),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_label_plane_matrix': new uniform.UniformMatrix4f(context, locations.u_label_plane_matrix),
            'u_coord_matrix': new uniform.UniformMatrix4f(context, locations.u_coord_matrix),
            'u_is_text': new uniform.Uniform1f(context, locations.u_is_text),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_texsize': new uniform.Uniform2f(context, locations.u_texsize),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture),
            'u_gamma_scale': new uniform.Uniform1f(context, locations.u_gamma_scale),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_is_halo': new uniform.Uniform1f(context, locations.u_is_halo),
            'u_fill_color': new uniform.Uniform4f(context, locations.u_fill_color),
            'u_halo_color': new uniform.Uniform4f(context, locations.u_halo_color),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_halo_width': new uniform.Uniform1f(context, locations.u_halo_width),
            'u_halo_blur': new uniform.Uniform1f(context, locations.u_halo_blur)

        });
    };
    //------------------------------------------------------------------------------------------------------------------标注Icon部分OK


    //------------------------------------------------------------------------------------------------------------------Heatmap部分
    var heatmapVertex = "#define HAS_UNIFORM_u_radius\n" +
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "float unpack_mix_vec2(const vec2 packedValue, const float t) {\n" +
        "    return mix(packedValue[0], packedValue[1], t);\n" +
        "}\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "uniform float u_extrude_scale;\n" +
        "uniform float u_opacity;\n" +
        "uniform float u_intensity;\n" +
        "\n" +
        "attribute vec2 a_pos;\n" +
        "\n" +
        "varying vec2 v_extrude;\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_weight\n" +
        "uniform lowp float u_weight_t;\n" +
        "attribute highp vec2 a_weight;\n" +
        "varying highp float weight;\n" +
        "#else\n" +
        "uniform highp float u_weight;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_radius\n" +
        "uniform lowp float u_radius_t;\n" +
        "attribute mediump vec2 a_radius;\n" +
        "#else\n" +
        "uniform mediump float u_radius;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "const highp float ZERO = 1.0 / 255.0 / 16.0;\n" +
        "\n" +
        "// #define GAUSS_COEF 0.3989422804014327\n" +
        "#define GAUSS_COEF 1.0\n" +
        "\n" +
        "void main(void) {\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_weight\n" +
        "    weight = unpack_mix_vec2(a_weight, u_weight_t);\n" +
        "    #else\n" +
        "    highp float weight = u_weight;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_radius\n" +
        "    mediump float radius = unpack_mix_vec2(a_radius, u_radius_t);\n" +
        "    #else\n" +
        "    mediump float radius = u_radius;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    vec2 unscaled_extrude = vec2(mod(a_pos, 2.0) * 2.0 - 1.0);\n" +
        "\n" +
        "    // S = sqrt(-2.0 * log(ZERO / (weight * u_intensity * GAUSS_COEF))) / 3.0\n" +
        "    float S = sqrt(-2.0 * log(ZERO / weight / u_intensity / GAUSS_COEF)) / 3.0;\n" +
        "\n" +
        "    // Pass the varying in units of radius\n" +
        "    v_extrude = S * unscaled_extrude;\n" +
        "\n" +
        "    // Scale by radius and the zoom-based scale factor to produce actual\n" +
        "    // mesh position\n" +
        "    vec2 extrude = v_extrude * radius * u_extrude_scale;\n" +
        "\n" +
        "    // multiply a_pos by 0.5, since we had it * 2 in order to sneak\n" +
        "    // in extrusion data\n" +
        "    vec4 pos = vec4(floor(a_pos * 0.5) + extrude, 0, 1);\n" +
        "\n" +
        "    gl_Position = u_matrix * pos;\n" +
        "}";

    var heatmapFrag = "#define HAS_UNIFORM_u_radius\n" +
        "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform highp float u_intensity;\n" +
        "\n" +
        "varying vec2 v_extrude;\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_weight\n" +
        "varying highp float weight;\n" +
        "#else\n" +
        "uniform highp float u_weight;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "// Gaussian kernel coefficient: 1 / sqrt(2 * PI)\n" +
        "#define GAUSS_COEF 0.3989422804014327\n" +
        "\n" +
        "void main() {\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_weight\n" +
        "    highp float weight = u_weight;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    // Kernel density estimation with a Gaussian kernel of size 5x5\n" +
        "    float d = -0.5 * 3.0 * 3.0 * dot(v_extrude, v_extrude);\n" +
        "    float val = weight * u_intensity * GAUSS_COEF * exp(d);\n" +
        "\n" +
        "    gl_FragColor = vec4(val, 1.0, 1.0, 1.0);\n" +
        "\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "    gl_FragColor = vec4(1.0);\n" +
        "    #endif\n" +
        "}";

    var heatmapUniforms = function (context, locations) {
        return ({
            'u_extrude_scale': new uniform.Uniform1f(context, locations.u_extrude_scale),
            'u_intensity': new uniform.Uniform1f(context, locations.u_intensity),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix)
        });
    };
    //------------------------------------------------------------------------------------------------------------------heatmap部分OK

    //------------------------------------------------------------------------------------------------------------------heatmap-texture部分
    var heatmapTextureVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "uniform vec2 u_world;\n" +
        "attribute vec2 a_pos;\n" +
        "varying vec2 v_pos;\n" +
        "\n" +
        "void main() {\n" +
        "    gl_Position = u_matrix * vec4(a_pos * u_world, 0, 1);\n" +
        "\n" +
        "    v_pos.x = a_pos.x;\n" +
        "    v_pos.y = 1.0 - a_pos.y;\n" +
        "}";

    var heatmapTextureFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform sampler2D u_image;\n" +
        "uniform sampler2D u_color_ramp;\n" +
        "uniform float u_opacity;\n" +
        "varying vec2 v_pos;\n" +
        "\n" +
        "void main() {\n" +
        "    float t = texture2D(u_image, v_pos).r;\n" +
        "    vec4 color = texture2D(u_color_ramp, vec2(t, 0.5));\n" +
        "    gl_FragColor = color * u_opacity;\n" +
        "\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "    gl_FragColor = vec4(0.0);\n" +
        "    #endif\n" +
        "}";

    var heatmapTextureUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_world': new uniform.Uniform2f(context, locations.u_world),
            'u_image': new uniform.Uniform1i(context, locations.u_image),
            'u_color_ramp': new uniform.Uniform1i(context, locations.u_color_ramp),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity)
        });
    };

    //------------------------------------------------------------------------------------------------------------------静态切片
    var rasterVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "uniform vec2 u_tl_parent;\n" +
        "uniform float u_scale_parent;\n" +
        "uniform float u_buffer_scale;\n" +
        "\n" +
        "attribute vec2 a_pos;\n" +
        "attribute vec2 a_texture_pos;\n" +
        "\n" +
        "varying vec2 v_pos0;\n" +
        "varying vec2 v_pos1;\n" +
        "\n" +
        "void main() {\n" +
        "    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n" +
        "    v_pos0 = (((a_texture_pos / 8192.0) - 0.5) / u_buffer_scale ) + 0.5;\n" +
        "    v_pos1 = (v_pos0 * u_scale_parent) + u_tl_parent;\n" +
        "}";

    var rasterFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform float u_fade_t;\n" +
        "uniform float u_opacity;\n" +
        "uniform sampler2D u_image0;\n" +
        "uniform sampler2D u_image1;\n" +
        "varying vec2 v_pos0;\n" +
        "varying vec2 v_pos1;\n" +
        "\n" +
        "uniform float u_brightness_low;\n" +
        "uniform float u_brightness_high;\n" +
        "\n" +
        "uniform float u_saturation_factor;\n" +
        "uniform float u_contrast_factor;\n" +
        "uniform vec3 u_spin_weights;\n" +
        "\n" +
        "void main() {\n" +
        "    vec4 color0 = texture2D(u_image0, v_pos0);\n" +
        "    vec4 color1 = texture2D(u_image1, v_pos1);\n" +
        "    if (color0.a > 0.0) {\n" +
        "        color0.rgb = color0.rgb / color0.a;\n" +
        "    }\n" +
        "    if (color1.a > 0.0) {\n" +
        "        color1.rgb = color1.rgb / color1.a;\n" +
        "    }\n" +
        "    vec4 color = mix(color0, color1, u_fade_t);\n" +
        "    color.a *= u_opacity;\n" +
        "    vec3 rgb = color.rgb;\n" +
        "\n" +
        "    // spin\n" +
        "    rgb = vec3(\n" +
        "    dot(rgb, u_spin_weights.xyz),\n" +
        "    dot(rgb, u_spin_weights.zxy),\n" +
        "    dot(rgb, u_spin_weights.yzx));\n" +
        "\n" +
        "    // saturation\n" +
        "    float average = (color.r + color.g + color.b) / 3.0;\n" +
        "    rgb += (average - rgb) * u_saturation_factor;\n" +
        "\n" +
        "    // contrast\n" +
        "    rgb = (rgb - 0.5) * u_contrast_factor + 0.5;\n" +
        "\n" +
        "    // brightness\n" +
        "    vec3 u_high_vec = vec3(u_brightness_low, u_brightness_low, u_brightness_low);\n" +
        "    vec3 u_low_vec = vec3(u_brightness_high, u_brightness_high, u_brightness_high);\n" +
        "\n" +
        "    gl_FragColor = vec4(mix(u_high_vec, u_low_vec, rgb) * color.a, color.a);\n" +
        "}";

    var rasterUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_tl_parent': new uniform.Uniform2f(context, locations.u_tl_parent),
            'u_scale_parent': new uniform.Uniform1f(context, locations.u_scale_parent),
            'u_buffer_scale': new uniform.Uniform1f(context, locations.u_buffer_scale),
            'u_fade_t': new uniform.Uniform1f(context, locations.u_fade_t),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_image0': new uniform.Uniform1i(context, locations.u_image0),
            'u_image1': new uniform.Uniform1i(context, locations.u_image1),
            'u_brightness_low': new uniform.Uniform1f(context, locations.u_brightness_low),
            'u_brightness_high': new uniform.Uniform1f(context, locations.u_brightness_high),
            'u_saturation_factor': new uniform.Uniform1f(context, locations.u_saturation_factor),
            'u_contrast_factor': new uniform.Uniform1f(context, locations.u_contrast_factor),
            'u_spin_weights': new uniform.Uniform3f(context, locations.u_spin_weights)
        });
    };

    //------------------------------------------------------------------------------------------------------------------image-texture部分
    var imageTextureVertex = "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "attribute vec2 a_pos;\n" +
        "attribute vec2 a_texture_pos;\n" +
        "varying vec2 v_pos;\n" +
        "\n" +
        "void main() {\n" +
        "    // gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);\n" +
        "    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);\n" +
        "    v_pos = a_texture_pos/8192.0;\n" +
        "}";

    var imageTextureFrag = "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "uniform sampler2D u_image;\n" +
        "uniform float u_opacity;\n" +
        "varying vec2 v_pos;\n" +
        "\n" +
        "void main() {\n" +
        "    vec4 color = texture2D(u_image, v_pos);\n" +
        "    gl_FragColor = color * u_opacity;\n" +
        "}";

    var imageTextureUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_image': new uniform.Uniform1i(context, locations.u_image),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity)
        };
    };

    //------------------------------------------------------------------------------------------------------------------Circle部分
    var circleVertex = "uniform mat4 u_matrix;\n" +
        "  uniform bool u_scale_with_map;\n" +
        "  uniform bool u_pitch_with_map;\n" +
        "  uniform vec2 u_extrude_scale;\n" +
        "  uniform lowp float u_device_pixel_ratio;\n" +
        "  uniform highp float u_camera_to_center_distance;\n" +
        "  attribute vec2 a_pos;\n" +
        "  attribute vec2 a_data;\n" +
        "  varying vec3 v_data;\n" +
        "  varying vec4 v_color;\n" +
        "  uniform mediump float radius;\n" +
        "  uniform mediump float stroke_width;\n" +
        "  void main(void) {\n" +
        "    vec2 extrude = a_data;\n" +
        "    vec2 circle_center = a_pos;\n" +
        "    if (u_pitch_with_map) {\n" +
        "      vec2 corner_position = circle_center;\n" +
        "      if (u_scale_with_map) {\n" +
        "        corner_position += extrude * (radius + stroke_width) * u_extrude_scale;\n" +
        "      } else {\n" +
        "        vec4 projected_center = u_matrix * vec4(circle_center, 0, 1);\n" +
        "        corner_position += extrude * (radius + stroke_width) * u_extrude_scale * (projected_center.w / u_camera_to_center_distance);\n" +
        "      }\n" +
        "\n" +
        "      gl_Position = u_matrix * vec4(corner_position, 0, 1);\n" +
        "    } else {\n" +
        "      gl_Position = u_matrix * vec4(circle_center, 0, 1);\n" +
        "\n" +
        "      if (u_scale_with_map) {\n" +
        "        gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * u_camera_to_center_distance;\n" +
        "      } else {\n" +
        "        gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * gl_Position.w;\n" +
        "      }\n" +
        "    }\n" +
        "    lowp float antialiasblur = 1.0 / u_device_pixel_ratio / (radius + stroke_width);\n" +
        "\n" +
        "    v_data = vec3(extrude.x, extrude.y, antialiasblur);\n" +
        "  }";

    var circleFragment = "precision mediump float;\n" +
        "  varying vec3 v_data;\n" +
        "  uniform highp vec4 color;\n" +
        "  uniform mediump float radius;\n" +
        "  uniform lowp float blur;\n" +
        "  uniform lowp float opacity;\n" +
        "  uniform highp vec4 stroke_color;\n" +
        "  uniform mediump float stroke_width;\n" +
        "  uniform lowp float stroke_opacity;\n" +
        "\n" +
        "  void main() {\n" +
        "\n" +
        "    vec2 extrude = v_data.xy;\n" +
        "    float extrude_length = length(extrude);\n" +
        "\n" +
        "    lowp float antialiasblur = v_data.z;\n" +
        "    float antialiased_blur = -max(blur, antialiasblur);\n" +
        "\n" +
        "    float opacity_t = smoothstep(0.0, antialiased_blur, extrude_length - 1.0);\n" +
        "\n" +
        "    float color_t = stroke_width < 0.01 ? 0.0 : smoothstep(\n" +
        "    antialiased_blur,\n" +
        "    0.0,\n" +
        "    extrude_length - radius / (radius + stroke_width)\n" +
        "    );\n" +
        "\n" +
        "    gl_FragColor = opacity_t * mix(color * opacity, stroke_color * stroke_opacity, color_t);\n" +
        "  }";

    var roundUniforms = function (context, locations) {
        return ({
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_scale_with_map': new uniform.Uniform1i(context, locations.u_scale_with_map),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_extrude_scale': new uniform.Uniform2f(context, locations.u_extrude_scale),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'radius': new uniform.Uniform1f(context, locations.radius),
            'stroke_width': new uniform.Uniform1f(context, locations.stroke_width),
            'color': new uniform.Uniform4f(context, locations.color),
            'stroke_color': new uniform.Uniform4f(context, locations.stroke_color),
            'blur': new uniform.Uniform1f(context, locations.blue),
            'opacity': new uniform.Uniform1f(context, locations.opacity),
            'stroke_opacity': new uniform.Uniform1f(context, locations.stroke_opacity)
        });
    };


    var multiCircleVertex = "uniform mat4 u_matrix;\n" +
        "  uniform bool u_scale_with_map;\n" +
        "  uniform bool u_pitch_with_map;\n" +
        "  uniform vec2 u_extrude_scale;\n" +
        "  uniform lowp float u_device_pixel_ratio;\n" +
        "  uniform highp float u_camera_to_center_distance;\n" +
        "  attribute vec2 a_pos;\n" +
        "  attribute vec4 a_color;\n" +
        "  varying vec3 v_data;\n" +
        "  varying vec4 v_color;\n" +
        "  uniform mediump float radius;\n" +
        "  uniform mediump float stroke_width;\n" +
        "  void main(void) {\n" +
        "    vec2 extrude = vec2(mod(a_pos, 2.0) * 2.0 - 1.0);\n" +
        "    vec2 circle_center = floor(a_pos * 0.5);\n" +
        "    if (u_pitch_with_map) {\n" +
        "      vec2 corner_position = circle_center;\n" +
        "      if (u_scale_with_map) {\n" +
        "        corner_position += extrude * (radius + stroke_width) * u_extrude_scale;\n" +
        "      } else {\n" +
        "        vec4 projected_center = u_matrix * vec4(circle_center, 0, 1);\n" +
        "        corner_position += extrude * (radius + stroke_width) * u_extrude_scale * (projected_center.w / u_camera_to_center_distance);\n" +
        "      }\n" +
        "\n" +
        "      gl_Position = u_matrix * vec4(corner_position, 0, 1);\n" +
        "    } else {\n" +
        "      gl_Position = u_matrix * vec4(circle_center, 0, 1);\n" +
        "\n" +
        "      if (u_scale_with_map) {\n" +
        "        gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * u_camera_to_center_distance;\n" +
        "      } else {\n" +
        "        gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * gl_Position.w;\n" +
        "      }\n" +
        "    }\n" +
        "    lowp float antialiasblur = 1.0 / u_device_pixel_ratio / (radius + stroke_width);\n" +
        "\n" +
        "    v_data = vec3(extrude.x, extrude.y, antialiasblur);\n" +
        "    v_color = a_color;\n" +
        "  }";

    var multiCircleFragment = "precision mediump float;\n" +
        "  varying vec3 v_data;\n" +
        "  varying vec4 v_color;\n" +
        "  uniform mediump float radius;\n" +
        "  uniform lowp float blur;\n" +
        "  uniform lowp float opacity;\n" +
        "  uniform highp vec4 stroke_color;\n" +
        "  uniform mediump float stroke_width;\n" +
        "  uniform lowp float stroke_opacity;\n" +
        "\n" +
        "  void main() {\n" +
        "\n" +
        "    vec2 extrude = v_data.xy;\n" +
        "    float extrude_length = length(extrude);\n" +
        "\n" +
        "    lowp float antialiasblur = v_data.z;\n" +
        "    float antialiased_blur = -max(blur, antialiasblur);\n" +
        "\n" +
        "    float opacity_t = smoothstep(0.0, antialiased_blur, extrude_length - 1.0);\n" +
        "\n" +
        "    float color_t = stroke_width < 0.01 ? 0.0 : smoothstep(\n" +
        "    antialiased_blur,\n" +
        "    0.0,\n" +
        "    extrude_length - radius / (radius + stroke_width)\n" +
        "    );\n" +
        "\n" +
        "    gl_FragColor = opacity_t * mix(v_color * opacity, stroke_color * stroke_opacity, color_t);\n" +
        "  }";

    var multiRoundUniforms = function (context, locations) {
        return ({
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_scale_with_map': new uniform.Uniform1i(context, locations.u_scale_with_map),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_extrude_scale': new uniform.Uniform2f(context, locations.u_extrude_scale),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'radius': new uniform.Uniform1f(context, locations.radius),
            'stroke_width': new uniform.Uniform1f(context, locations.stroke_width),
            'stroke_color': new uniform.Uniform4f(context, locations.stroke_color),
            'blur': new uniform.Uniform1f(context, locations.blue),
            'opacity': new uniform.Uniform1f(context, locations.opacity),
            'stroke_opacity': new uniform.Uniform1f(context, locations.stroke_opacity)
        });
    };

    var fanVertex = "uniform mat4 u_matrix;\n" +
        "  uniform bool u_scale_with_map;\n" +
        "  uniform bool u_pitch_with_map;\n" +
        "  uniform vec2 u_extrude_scale;\n" +
        "  uniform lowp float u_device_pixel_ratio;\n" +
        "  uniform highp float u_camera_to_center_distance;\n" +
        "  attribute vec2 a_pos;\n" +
        "  varying vec3 v_data;\n" +
        "  uniform mediump float radius;\n" +
        "  uniform mediump float stroke_width;\n" +
        "  void main(void) {\n" +
        "    vec2 extrude = vec2(mod(a_pos, 2.0) * 2.0 - 1.0);\n" +
        "    vec2 circle_center = floor(a_pos * 0.5);\n" +
        "    if (u_pitch_with_map) {\n" +
        "      vec2 corner_position = circle_center;\n" +
        "      if (u_scale_with_map) {\n" +
        "        corner_position += extrude * (radius + stroke_width) * u_extrude_scale;\n" +
        "      } else {\n" +
        "        vec4 projected_center = u_matrix * vec4(circle_center, 0, 1);\n" +
        "        corner_position += extrude * (radius + stroke_width) * u_extrude_scale * (projected_center.w / u_camera_to_center_distance);\n" +
        "      }\n" +
        "\n" +
        "      gl_Position = u_matrix * vec4(corner_position, 0, 1);\n" +
        "    } else {\n" +
        "      gl_Position = u_matrix * vec4(circle_center, 0, 1);\n" +
        "\n" +
        "      if (u_scale_with_map) {\n" +
        "        gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * u_camera_to_center_distance;\n" +
        "      } else {\n" +
        "        gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * gl_Position.w;\n" +
        "      }\n" +
        "    }\n" +
        "    lowp float antialiasblur = 1.0 / u_device_pixel_ratio / (radius + stroke_width);\n" +
        "\n" +
        "    v_data = vec3(extrude.x, extrude.y, antialiasblur);\n" +
        "  }";

    var fanFrag = "precision mediump float;\n" +
        "  varying vec3 v_data;\n" +
        "  uniform highp vec4 color;\n" +
        "  uniform mediump float radius;\n" +
        "  uniform lowp float blur;\n" +
        "  uniform lowp float opacity;\n" +
        "  uniform highp vec4 stroke_color;\n" +
        "  uniform mediump float stroke_width;\n" +
        "  uniform lowp float stroke_opacity;\n" +
        "  uniform int quadrant;\n" +
        "  uniform bool border;\n" +
        "  uniform float start;\n" +
        "  uniform float end;\n" +
        "  uniform float gap;\n" +
        "  void main() {\n" +
        "    vec2 extrude = v_data.xy;\n" +
        "    float extrude_length = length(extrude);\n" +
        "\n" +
        "    lowp float antialiasblur = v_data.z;\n" +
        "    float antialiased_blur = -max(blur, antialiasblur);\n" +
        "\n" +
        "    // 实现圆形效果\n" +
        "    float opacity_t = smoothstep(0.0, antialiased_blur, extrude_length - 1.0);\n" +
        "    // 实现边界线效果\n" +
        "    float color_t = stroke_width < 0.01 ? 0.0 : smoothstep(\n" +
        "    antialiased_blur,\n" +
        "    0.0,\n" +
        "    extrude_length - radius / (radius + stroke_width)\n" +
        "    );\n" +
        "\n" +
        "    float tana = v_data.y/v_data.x;\n" +
        "    float opacity_fan = 0.0;\n" +
        "    if (quadrant == 1) {\n" +
        "      opacity_fan =  step(0.0, -tana) * step(0.0, v_data.x);\n" +
        "      if (border) {\n" +
        "        if ((v_data.y > -gap && v_data.x > start) || (v_data.x < gap && v_data.y < -end)) {\n" +
        "          color_t = 1.0;\n" +
        "        }\n" +
        "      }\n" +
        "    } else if (quadrant == 2) {\n" +
        "      opacity_fan =  step(0.0, tana) * step(0.0, -v_data.x);\n" +
        "      if (border) {\n" +
        "        if ((v_data.x > -gap && v_data.y < -start) || (v_data.y > -gap && v_data.x < -end)) {\n" +
        "          color_t = 1.0;\n" +
        "        }\n" +
        "      }\n" +
        "    } else if (quadrant == 3) {\n" +
        "      opacity_fan =  step(0.0, -tana) * step(0.0, -v_data.x);\n" +
        "      if (border) {\n" +
        "        if ((v_data.y < gap && v_data.x < -start) || (v_data.x > -gap && v_data.y > end)) {\n" +
        "          color_t = 1.0;\n" +
        "        }\n" +
        "      }\n" +
        "    } else {\n" +
        "      opacity_fan = step(0.0, tana) * step(0.0, v_data.x);\n" +
        "      if (border) {\n" +
        "        if ((v_data.x < gap && v_data.y > start) || (v_data.y < gap && v_data.x>end)) {\n" +
        "          color_t = 1.0;\n" +
        "        }\n" +
        "      }\n" +
        "    }\n" +
        "    gl_FragColor = opacity_t * mix(color * opacity, stroke_color * stroke_opacity, color_t) * opacity_fan;\n" +
        "  }";
    var fanUniforms = function (context, locations) {
        return ({
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_scale_with_map': new uniform.Uniform1i(context, locations.u_scale_with_map),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_extrude_scale': new uniform.Uniform2f(context, locations.u_extrude_scale),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'radius': new uniform.Uniform1f(context, locations.radius),
            'stroke_width': new uniform.Uniform1f(context, locations.stroke_width),
            'stroke_color': new uniform.Uniform4f(context, locations.stroke_color),
            'blur': new uniform.Uniform1f(context, locations.blue),
            'opacity': new uniform.Uniform1f(context, locations.opacity),
            'stroke_opacity': new uniform.Uniform1f(context, locations.stroke_opacity),
            'color': new uniform.Uniform4f(context, locations.color),
            'quadrant': new uniform.Uniform1i(context, locations.quadrant),
            'border': new uniform.Uniform1i(context, locations.border),
            'start': new uniform.Uniform1f(context, locations.start),
            'end': new uniform.Uniform1f(context, locations.end),
            'gap': new uniform.Uniform1f(context, locations.gap)
        });
    };

    var circlesVertex = "#define HAS_UNIFORM_u_stroke_color\n" +
        "#define HAS_UNIFORM_u_stroke_width\n" +
        "#define HAS_UNIFORM_u_opacity\n" +
        "#define HAS_UNIFORM_u_blur\n" +
        "#define HAS_UNIFORM_u_stroke_opacity\n" +
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "vec2 unpack_float(const float packedValue) {\n" +
        "    int packedIntValue = int(packedValue);\n" +
        "    int v0 = packedIntValue / 256;\n" +
        "    return vec2(v0, packedIntValue - v0 * 256);\n" +
        "}\n" +
        "\n" +
        "vec4 decode_color(const vec2 encodedColor) {\n" +
        "    return vec4(\n" +
        "    unpack_float(encodedColor[0]) / 255.0,\n" +
        "    unpack_float(encodedColor[1]) / 255.0\n" +
        "    );\n" +
        "}\n" +
        "\n" +
        "float unpack_mix_vec2(const vec2 packedValue, const float t) {\n" +
        "    return mix(packedValue[0], packedValue[1], t);\n" +
        "}\n" +
        "\n" +
        "vec4 unpack_mix_color(const vec4 packedColors, const float t) {\n" +
        "    vec4 minColor = decode_color(vec2(packedColors[0], packedColors[1]));\n" +
        "    vec4 maxColor = decode_color(vec2(packedColors[2], packedColors[3]));\n" +
        "    return mix(minColor, maxColor, t);\n" +
        "}\n" +
        "\n" +
        "uniform mat4 u_matrix;\n" +
        "uniform bool u_scale_with_map;\n" +
        "uniform bool u_pitch_with_map;\n" +
        "uniform vec2 u_extrude_scale;\n" +
        "uniform lowp float u_device_pixel_ratio;\n" +
        "uniform highp float u_camera_to_center_distance;\n" +
        "\n" +
        "attribute vec2 a_pos;\n" +
        "\n" +
        "varying vec3 v_data;\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "uniform lowp float u_color_t;\n" +
        "attribute highp vec4 a_color;\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_radius\n" +
        "uniform lowp float u_radius_t;\n" +
        "attribute mediump vec2 a_radius;\n" +
        "varying mediump float radius;\n" +
        "#else\n" +
        "uniform mediump float u_radius;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_blur\n" +
        "uniform lowp float u_blur_t;\n" +
        "attribute lowp vec2 a_blur;\n" +
        "varying lowp float blur;\n" +
        "#else\n" +
        "uniform lowp float u_blur;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "uniform lowp float u_opacity_t;\n" +
        "attribute lowp vec2 a_opacity;\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_stroke_color\n" +
        "uniform lowp float u_stroke_color_t;\n" +
        "attribute highp vec4 a_stroke_color;\n" +
        "varying highp vec4 stroke_color;\n" +
        "#else\n" +
        "uniform highp vec4 u_stroke_color;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_stroke_width\n" +
        "uniform lowp float u_stroke_width_t;\n" +
        "attribute mediump vec2 a_stroke_width;\n" +
        "varying mediump float stroke_width;\n" +
        "#else\n" +
        "uniform mediump float u_stroke_width;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_stroke_opacity\n" +
        "uniform lowp float u_stroke_opacity_t;\n" +
        "attribute lowp vec2 a_stroke_opacity;\n" +
        "varying lowp float stroke_opacity;\n" +
        "#else\n" +
        "uniform lowp float u_stroke_opacity;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "void main(void) {\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_color\n" +
        "    color = unpack_mix_color(a_color, u_color_t);\n" +
        "    #else\n" +
        "    highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_radius\n" +
        "    radius = unpack_mix_vec2(a_radius, u_radius_t);\n" +
        "    #else\n" +
        "    mediump float radius = u_radius;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_blur\n" +
        "    blur = unpack_mix_vec2(a_blur, u_blur_t);\n" +
        "    #else\n" +
        "    lowp float blur = u_blur;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_opacity\n" +
        "    opacity = unpack_mix_vec2(a_opacity, u_opacity_t);\n" +
        "    #else\n" +
        "    lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_stroke_color\n" +
        "    stroke_color = unpack_mix_color(a_stroke_color, u_stroke_color_t);\n" +
        "    #else\n" +
        "    highp vec4 stroke_color = u_stroke_color;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_stroke_width\n" +
        "    stroke_width = unpack_mix_vec2(a_stroke_width, u_stroke_width_t);\n" +
        "    #else\n" +
        "    mediump float stroke_width = u_stroke_width;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifndef HAS_UNIFORM_u_stroke_opacity\n" +
        "    stroke_opacity = unpack_mix_vec2(a_stroke_opacity, u_stroke_opacity_t);\n" +
        "    #else\n" +
        "    lowp float stroke_opacity = u_stroke_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    // unencode the extrusion vector that we snuck into the a_pos vector\n" +
        "    vec2 extrude = vec2(mod(a_pos, 2.0) * 2.0 - 1.0);\n" +
        "\n" +
        "    // multiply a_pos by 0.5, since we had it * 2 in order to sneak\n" +
        "    // in extrusion data\n" +
        "    vec2 circle_center = floor(a_pos * 0.5);\n" +
        "    if (u_pitch_with_map) {\n" +
        "        vec2 corner_position = circle_center;\n" +
        "        if (u_scale_with_map) {\n" +
        "            corner_position += extrude * (radius + stroke_width) * u_extrude_scale;\n" +
        "        } else {\n" +
        "            // Pitching the circle with the map effectively scales it with the map\n" +
        "            // To counteract the effect for pitch-scale: viewport, we rescale the\n" +
        "            // whole circle based on the pitch scaling effect at its central point\n" +
        "            vec4 projected_center = u_matrix * vec4(circle_center, 0, 1);\n" +
        "            corner_position += extrude * (radius + stroke_width) * u_extrude_scale * (projected_center.w / u_camera_to_center_distance);\n" +
        "        }\n" +
        "\n" +
        "        gl_Position = u_matrix * vec4(corner_position, 2, 1);\n" +
        "    } else {\n" +
        "        gl_Position = u_matrix * vec4(circle_center, 2, 1);\n" +
        "\n" +
        "        if (u_scale_with_map) {\n" +
        "            gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * u_camera_to_center_distance;\n" +
        "        } else {\n" +
        "            gl_Position.xy += extrude * (radius + stroke_width) * u_extrude_scale * gl_Position.w;\n" +
        "        }\n" +
        "    }\n" +
        "\n" +
        "        // This is a minimum blur distance that serves as a faux-antialiasing for\n" +
        "        // the circle. since blur is a ratio of the circle's size and the intent is\n" +
        "        // to keep the blur at roughly 1px, the two are inversely related.\n" +
        "        lowp float antialiasblur = 1.0 / u_device_pixel_ratio / (radius + stroke_width);\n" +
        "\n" +
        "    v_data = vec3(extrude.x, extrude.y, antialiasblur);\n" +
        "}";

    var circlesFrag = "#define HAS_UNIFORM_u_stroke_color\n" +
        "#define HAS_UNIFORM_u_stroke_width\n" +
        "#define HAS_UNIFORM_u_opacity\n" +
        "#define HAS_UNIFORM_u_blur\n" +
        "#define HAS_UNIFORM_u_stroke_opacity\n" +
        "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#else\n" +
        "\n" +
        "#if !defined(lowp)\n" +
        "#define lowp\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(mediump)\n" +
        "#define mediump\n" +
        "#endif\n" +
        "\n" +
        "#if !defined(highp)\n" +
        "#define highp\n" +
        "#endif\n" +
        "\n" +
        "#endif\n" +
        "\n" +
        "varying vec3 v_data;\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_color\n" +
        "varying highp vec4 color;\n" +
        "#else\n" +
        "uniform highp vec4 u_color;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_radius\n" +
        "varying mediump float radius;\n" +
        "#else\n" +
        "uniform mediump float u_radius;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_blur\n" +
        "varying lowp float blur;\n" +
        "#else\n" +
        "uniform lowp float u_blur;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_opacity\n" +
        "varying lowp float opacity;\n" +
        "#else\n" +
        "uniform lowp float u_opacity;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_stroke_color\n" +
        "varying highp vec4 stroke_color;\n" +
        "#else\n" +
        "uniform highp vec4 u_stroke_color;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_stroke_width\n" +
        "varying mediump float stroke_width;\n" +
        "#else\n" +
        "uniform mediump float u_stroke_width;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "#ifndef HAS_UNIFORM_u_stroke_opacity\n" +
        "#ifndef HAS_UNIFORM_u_stroke_opacity\n" +
        "varying lowp float stroke_opacity;\n" +
        "#else\n" +
        "uniform lowp float u_stroke_opacity;\n" +
        "#endif\n" +
        "\n" +
        "\n" +
        "void main() {\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_color\n" +
        "    highp vec4 color = u_color;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_radius\n" +
        "    mediump float radius = u_radius;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_blur\n" +
        "    lowp float blur = u_blur;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_opacity\n" +
        "    lowp float opacity = u_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_stroke_color\n" +
        "    highp vec4 stroke_color = u_stroke_color;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_stroke_width\n" +
        "    mediump float stroke_width = u_stroke_width;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    #ifdef HAS_UNIFORM_u_stroke_opacity\n" +
        "    lowp float stroke_opacity = u_stroke_opacity;\n" +
        "    #endif\n" +
        "\n" +
        "\n" +
        "    vec2 extrude = v_data.xy;\n" +
        "    float extrude_length = length(extrude);\n" +
        "\n" +
        "    lowp float antialiasblur = v_data.z;\n" +
        "    float antialiased_blur = -max(blur, antialiasblur);\n" +
        "\n" +
        "    float opacity_t = smoothstep(0.0, antialiased_blur, extrude_length - 1.0);\n" +
        "\n" +
        "    float color_t = stroke_width < 0.01 ? 0.0 : smoothstep(\n" +
        "    antialiased_blur,\n" +
        "    0.0,\n" +
        "    extrude_length - radius / (radius + stroke_width)\n" +
        "    );\n" +
        "\n" +
        "    gl_FragColor = opacity_t * mix(color * opacity, stroke_color * stroke_opacity, color_t);\n" +
        "\n" +
        "}";

    var circleUniforms = function (context, locations) {
        return ({
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_scale_with_map': new uniform.Uniform1i(context, locations.u_scale_with_map),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_extrude_scale': new uniform.Uniform2f(context, locations.u_extrude_scale),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix)
        });
    };
    var basicFillV = "attribute vec2 a_pos;\n" +
        "    uniform mat4 u_matrix;\n" +
        "    void main() {\n" +
        "        gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);\n" +
        "    }";

    var basicFillF = "precision mediump float;\n" +
        "    uniform highp vec4 u_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    void main() {\n" +
        "        gl_FragColor = u_color * u_opacity;\n" +
        "    }";

    var basicFillUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_color': new uniform.Uniform4f(context, locations.u_color),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity)
        });
    };

    var basicFillImageV = "attribute vec4 a_pos;\n" +
        "    uniform mat4 u_matrix;\n" +
        "    varying vec2 v_tex;\n" +
        "    void main() {\n" +
        "        v_tex = a_pos.zw;\n" +
        "        gl_Position = u_matrix * vec4(a_pos.xy, 0.0, 1.0);\n" +
        "    }";

    var basicFillImageF = "precision mediump float;\n" +
        "    uniform sampler2D u_texture;\n" +
        "    varying vec2 v_tex;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    void main() {\n" +
        "        gl_FragColor = texture2D(u_texture, v_tex) * u_opacity;\n" +
        "    }";

    var basicFillImageUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity)
        });
    };

    //------------------------------------------------------------------------------------------------------------------简化部分, 待改进
    // todo
    var lineVertex2 = "precision highp float;\n" +
        "\n" +
        "    #define scale 0.01587301\n" +
        "    // #define scale 0.007936508\n" +
        "\n" +
        "    attribute vec2 a_pos;\n" +
        "    attribute vec4 a_data;\n" +
        "    attribute vec2 a_normal;\n" +
        "\n" +
        "    uniform mat4 u_matrix;\n" +
        "    uniform mediump float u_ratio;\n" +
        "    uniform vec2 u_units_to_pixels;\n" +
        "\n" +
        "    varying vec2 v_normal;\n" +
        "    varying vec2 v_width2;\n" +
        "    varying float v_gamma_scale;\n" +
        "    varying highp float v_linesofar;\n" +
        "\n" +
        "    uniform highp vec4 u_color;\n" +
        "    uniform lowp float u_blur;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform mediump float u_gapwidth;\n" +
        "    uniform lowp float u_offset;\n" +
        "    uniform mediump float u_width;\n" +
        "\n" +
        "    void main() {\n" +
        "        highp vec4 color = u_color;\n" +
        "        lowp float blur = u_blur;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        mediump float gapwidth = u_gapwidth;\n" +
        "        lowp float offset = u_offset;\n" +
        "        mediump float width = u_width;\n" +
        "\n" +
        "        // the distance over which the line edge fades out.\n" +
        "        // Retina devices need a smaller distance to avoid aliasing.\n" +
        "        float ANTIALIASING = 0.5;\n" +
        "\n" +
        "        vec2 a_extrude = a_data.xy - 128.0;\n" +
        "        float a_direction = mod(a_data.z, 4.0) - 1.0;\n" +
        "\n" +
        "        v_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * 2.0;\n" +
        "\n" +
        "        vec2 pos = a_pos;\n" +
        "\n" +
        "        mediump vec2 normal = a_normal;\n" +
        "        normal.y = normal.y * 2.0 - 1.0;\n" +
        "        v_normal = normal;\n" +
        "\n" +
        "        // these transformations used to be applied in the JS and native code bases.\n" +
        "        // moved them into the shader for clarity and simplicity.\n" +
        "        gapwidth = gapwidth / 2.0;\n" +
        "        float halfwidth = width / 2.0;\n" +
        "        offset = -1.0 * offset;\n" +
        "\n" +
        "        float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\n" +
        "        float outset = gapwidth + halfwidth * (gapwidth > 0.0 ? 2.0 : 1.0) + (halfwidth == 0.0 ? 0.0 : ANTIALIASING);\n" +
        "\n" +
        "        // Scale the extrusion vector down to a normal and then up by the line width\n" +
        "        // of this vertex.\n" +
        "        mediump vec2 dist = outset * a_extrude * scale;\n" +
        "\n" +
        "        // Calculate the offset when drawing a line that is to the side of the actual line.\n" +
        "        // We do this by creating a vector that points towards the extrude, but rotate\n" +
        "        // it when we're drawing round end points (a_direction = -1 or 1) since their\n" +
        "        // extrude vector points in another direction.\n" +
        "        mediump float u = 0.5 * a_direction;\n" +
        "        mediump float t = 1.0 - abs(u);\n" +
        "        mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n" +
        "\n" +
        "        vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\n" +
        "        gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 0.0, 1.0) + projected_extrude;\n" +
        "\n" +
        "        // calculate how much the perspective view squishes or stretches the extrude\n" +
        "        float extrude_length_without_perspective = length(dist);\n" +
        "        float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_units_to_pixels);\n" +
        "        v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\n" +
        "\n" +
        "        v_width2 = vec2(outset, inset);\n" +
        "    }";
    var lineFragment2 = "precision mediump float;\n" +
        "\n" +
        "    varying vec2 v_width2;\n" +
        "    varying vec2 v_normal;\n" +
        "    varying float v_gamma_scale;\n" +
        "    uniform highp vec4 u_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "\n" +
        "    void main() {\n" +
        "\n" +
        "\n" +
        "        highp vec4 color = u_color;\n" +
        "        lowp float blur = 0.0;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        lowp float u_device_pixel_ratio = 1.0;\n" +
        "\n" +
        "        float dist = length(v_normal) * v_width2.s;\n" +
        "\n" +
        "        float blur2 = (blur + 1.0 / u_device_pixel_ratio) * v_gamma_scale;\n" +
        "        float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\n" +
        "        gl_FragColor = color * (alpha * opacity);\n" +
        "        // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n" +
        "    }";

    var basicLineUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_ratio': new uniform.Uniform1f(context, locations.u_ratio),
            'u_units_to_pixels': new uniform.Uniform2f(context, locations.u_units_to_pixels),
            'u_color': new uniform.Uniform4f(context, locations.u_color),
            'u_blur': new uniform.Uniform1f(context, locations.u_blur),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_gapwidth': new uniform.Uniform1f(context, locations.u_gapwidth),
            'u_offset': new uniform.Uniform1f(context, locations.u_offset),
            'u_width': new uniform.Uniform1f(context, locations.u_width)
        });
    };

    var lineDashVertexSimplify = "#define scale 0.015873016\n" +
        "  #define LINE_DISTANCE_SCALE 2.0\n" +
        "  attribute vec2 a_pos;\n" +
        "  attribute vec4 a_data;\n" +
        "  attribute vec2 a_normal;\n" +
        "\n" +
        "  uniform mat4 u_matrix;\n" +
        "  uniform mediump float u_ratio;\n" +
        "  uniform vec2 u_patternscale_a;\n" +
        "  uniform float u_tex_y_a;\n" +
        "  uniform vec2 u_patternscale_b;\n" +
        "  uniform float u_tex_y_b;\n" +
        "  uniform vec2 u_units_to_pixels;\n" +
        "\n" +
        "  varying vec2 v_normal;\n" +
        "  varying vec2 v_width2;\n" +
        "  varying vec2 v_tex_a;\n" +
        "  varying vec2 v_tex_b;\n" +
        "  varying float v_gamma_scale;\n" +
        "\n" +
        "  uniform highp vec4 u_color;\n" +
        "  uniform lowp float u_blur;\n" +
        "  uniform lowp float u_opacity;\n" +
        "  uniform mediump float u_gapwidth;\n" +
        "  uniform lowp float u_offset;\n" +
        "  uniform mediump float u_width;\n" +
        "  uniform lowp float u_floorwidth;\n" +
        "\n" +
        "  void main() {\n" +
        "    highp vec4 color = u_color;\n" +
        "    lowp float blur = u_blur;\n" +
        "    lowp float opacity = u_opacity;\n" +
        "    mediump float gapwidth = u_gapwidth;\n" +
        "    lowp float offset = u_offset;\n" +
        "    mediump float width = u_width;\n" +
        "    lowp float floorwidth = u_floorwidth;\n" +
        "\n" +
        "    float ANTIALIASING = 1.0 / 1.0 / 2.0;\n" +
        "\n" +
        "    vec2 a_extrude = a_data.xy - 128.0;\n" +
        "    float a_direction = mod(a_data.z, 4.0) - 1.0;\n" +
        "    float a_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * LINE_DISTANCE_SCALE;\n" +
        "\n" +
        "    vec2 pos = a_pos;\n" +
        "\n" +
        "    // x is 1 if it's a round cap, 0 otherwise\n" +
        "    // y is 1 if the normal points up, and -1 if it points down\n" +
        "    // We store these in the least significant bit of position\n" +
        "    mediump vec2 normal = a_normal;\n" +
        "    normal.y = normal.y * 2.0 - 1.0;\n" +
        "    v_normal = normal;\n" +
        "\n" +
        "    // these transformations used to be applied in the JS and native code bases.\n" +
        "    // moved them into the shader for clarity and simplicity.\n" +
        "    gapwidth = gapwidth / 2.0;\n" +
        "    float halfwidth = width / 2.0;\n" +
        "    offset = -1.0 * offset;\n" +
        "\n" +
        "    float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\n" +
        "    float outset = gapwidth + halfwidth * (gapwidth > 0.0 ? 2.0 : 1.0) + (halfwidth == 0.0 ? 0.0 : ANTIALIASING);\n" +
        "\n" +
        "    // Scale the extrusion vector down to a normal and then up by the line width\n" +
        "    // of this vertex.\n" +
        "    mediump vec2 dist =outset * a_extrude * scale;\n" +
        "\n" +
        "    // Calculate the offset when drawing a line that is to the side of the actual line.\n" +
        "    // We do this by creating a vector that points towards the extrude, but rotate\n" +
        "    // it when we're drawing round end points (a_direction = -1 or 1) since their\n" +
        "    // extrude vector points in another direction.\n" +
        "    mediump float u = 0.5 * a_direction;\n" +
        "    mediump float t = 1.0 - abs(u);\n" +
        "    mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n" +
        "\n" +
        "    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\n" +
        "    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 0.0, 1.0) + projected_extrude;\n" +
        "\n" +
        "    // calculate how much the perspective view squishes or stretches the extrude\n" +
        "    float extrude_length_without_perspective = length(dist);\n" +
        "    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_units_to_pixels);\n" +
        "    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\n" +
        "\n" +
        "    v_tex_a = vec2(a_linesofar * u_patternscale_a.x / floorwidth, normal.y * u_patternscale_a.y + u_tex_y_a);\n" +
        "    v_tex_b = vec2(a_linesofar * u_patternscale_b.x / floorwidth, normal.y * u_patternscale_b.y + u_tex_y_b);\n" +
        "\n" +
        "    v_width2 = vec2(outset, inset);\n" +
        "  }";
    var lineDashFragSimplify = "precision mediump float;\n" +
        "\n" +
        "  uniform sampler2D u_image;\n" +
        "  uniform float u_sdfgamma;\n" +
        "  uniform float u_mix;\n" +
        "\n" +
        "  varying vec2 v_normal;\n" +
        "  varying vec2 v_width2;\n" +
        "  varying vec2 v_tex_a;\n" +
        "  varying vec2 v_tex_b;\n" +
        "  varying float v_gamma_scale;\n" +
        "\n" +
        "  uniform highp vec4 u_color;\n" +
        "  uniform lowp float u_blur;\n" +
        "  uniform lowp float u_opacity;\n" +
        "  uniform mediump float u_width;\n" +
        "  uniform lowp float u_floorwidth;\n" +
        "\n" +
        "  void main() {\n" +
        "\n" +
        "    highp vec4 color = u_color;\n" +
        "    lowp float blur = u_blur;\n" +
        "    lowp float opacity = u_opacity;\n" +
        "    mediump float width = u_width;\n" +
        "    lowp float floorwidth = u_floorwidth;\n" +
        "\n" +
        "    // Calculate the distance of the pixel from the line in pixels.\n" +
        "    float dist = length(v_normal) * v_width2.s;\n" +
        "\n" +
        "    // Calculate the antialiasing fade factor. This is either when fading in\n" +
        "    // the line in case of an offset line (v_width2.t) or when fading out\n" +
        "    // (v_width2.s)\n" +
        "    float blur2 = (blur + 1.0 / 1.0) * v_gamma_scale;\n" +
        "    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\n" +
        "\n" +
        "    float sdfdist_a = texture2D(u_image, v_tex_a).a;\n" +
        "    float sdfdist_b = texture2D(u_image, v_tex_b).a;\n" +
        "    float sdfdist = mix(sdfdist_a, sdfdist_b, u_mix);\n" +
        "    alpha *= smoothstep(0.5 - u_sdfgamma / floorwidth, 0.5 + u_sdfgamma / floorwidth, sdfdist);\n" +
        "\n" +
        "    gl_FragColor = color * (alpha * opacity);\n" +
        "\n" +
        "    #ifdef OVERDRAW_INSPECTOR\n" +
        "    gl_FragColor = vec4(1.0);\n" +
        "    #endif\n" +
        "  }";

    var basicLineDashUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_ratio': new uniform.Uniform1f(context, locations.u_ratio),
            'u_units_to_pixels': new uniform.Uniform2f(context, locations.u_units_to_pixels),
            'u_patternscale_a': new uniform.Uniform2f(context, locations.u_patternscale_a),
            'u_patternscale_b': new uniform.Uniform2f(context, locations.u_patternscale_b),
            'u_tex_y_a': new uniform.Uniform1f(context, locations.u_tex_y_a),
            'u_tex_y_b': new uniform.Uniform1f(context, locations.u_tex_y_b),
            'u_color': new uniform.Uniform4f(context, locations.u_color),
            'u_blur': new uniform.Uniform1f(context, locations.u_blur),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_gapwidth': new uniform.Uniform1f(context, locations.u_gapwidth),
            'u_offset': new uniform.Uniform1f(context, locations.u_offset),
            'u_width': new uniform.Uniform1f(context, locations.u_width),
            'u_floorwidth': new uniform.Uniform1f(context, locations.u_floorwidth),
            'u_image': new uniform.Uniform1i(context, locations.u_image),
            'u_sdfgamma': new uniform.Uniform1f(context, locations.u_sdfgamma),
            'u_mix': new uniform.Uniform1f(context, locations.u_mix)

        });
    };

    /**
     * 拉伸多边形的着色器中的uniform类型变量
     * @param context
     * @param locations
     */
    var fillExtrusionUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_lightpos': new uniform.Uniform3f(context, locations.u_lightpos),
            'u_lightintensity': new uniform.Uniform1f(context, locations.u_lightintensity),
            'u_lightcolor': new uniform.Uniform3f(context, locations.u_lightcolor),
            'u_vertical_gradient': new uniform.Uniform1f(context, locations.u_vertical_gradient),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_height_image': new uniform.Uniform1i(context, locations.u_height_image),
            'u_min_height': new uniform.Uniform1f(context, locations.u_min_height),
            'u_delta_height': new uniform.Uniform1f(context, locations.u_delta_height)
        });
    };

    var multiPointsVertex = " attribute vec2 a_pos;\n" +
        "    uniform mat4 u_matrix;\n" +
        "    void main() {\n" +
        "        gl_Position = u_matrix * vec4(a_pos.xy,0.0, 1.0);\n" +
        "        gl_PointSize = 30.0;\n" +
        "    }";

    var multiPointsFrag = "precision mediump float;\n" +
        "    void main() {\n" +
        "        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
        "    }";

    var multiPointsUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix)
        });
    };

    var imageVertex = "attribute vec2 a_pos;\n" +
        "    attribute vec4 a_data;\n" +
        "\n" +
        "    uniform highp float u_size;\n" +
        "    uniform highp float u_camera_to_center_distance;\n" +
        "    uniform mat4 u_matrix;\n" +
        "    uniform mat4 u_label_plane_matrix;\n" +
        "    uniform mat4 u_coord_matrix;\n" +
        "    uniform bool u_pitch_with_map;\n" +
        "    uniform vec2 u_texsize;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform bool u_rotate_symbol;\n" +
        "    uniform float u_radian;\n" +
        "    uniform mat4 u_modelMatrix;\n" +
        "\n" +
        "    varying vec2 v_tex;\n" +
        "    void main() {\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        vec2 a_offset = a_data.xy;\n" +
        "        vec2 a_tex = a_data.zw;\n" +
        "        float size = u_size;\n" +
        "        vec4 projectedPoint = u_matrix * vec4(a_pos, 10.0, 1);\n" +
        "        highp float camera_to_anchor_distance = projectedPoint.w;\n" +
        "\n" +
        "        highp float distance_ratio = u_pitch_with_map ?\n" +
        "        camera_to_anchor_distance / u_camera_to_center_distance\n" +
        "        :u_camera_to_center_distance / camera_to_anchor_distance;\n" +
        "        highp float perspective_ratio = clamp(0.5 + 0.5 * distance_ratio, 0.0, 4.0);\n" +
        "        size *= perspective_ratio;\n" +
        "        float fontScale = size;\n" +
        "        highp float symbol_rotation = 0.0;\n" +
        "        if (u_rotate_symbol) {\n" +
        "            symbol_rotation = u_radian;\n" +
        "        }\n" +
        "    highp float angle_sin = sin(symbol_rotation);\n" +
        "    highp float angle_cos = cos(symbol_rotation);\n" +
        "    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);\n" +
        "        vec4 projected_pos = u_label_plane_matrix * vec4(a_pos, 0.0, 1.0);\n" +
        "        vec4 glP = u_coord_matrix * vec4(projected_pos.xy / projected_pos.w + rotation_matrix * (a_offset / 32.0 * fontScale), 0.0, 1.0);\n" +
        "        gl_Position = u_modelMatrix * glP;\n" +
        "        v_tex = a_tex / u_texsize;\n" +
        "    }";

    var imageFrag = "precision mediump float;\n" +
        "    uniform sampler2D u_texture;\n" +
        "    varying vec2 v_tex;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    void main() {\n" +
        "        gl_FragColor = texture2D(u_texture, v_tex) * u_opacity;\n" +
        "    }";

    var imageUniforms = function (context, locations) {
        return ({
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_label_plane_matrix': new uniform.UniformMatrix4f(context, locations.u_label_plane_matrix),
            'u_coord_matrix': new uniform.UniformMatrix4f(context, locations.u_coord_matrix),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_texsize': new uniform.Uniform2f(context, locations.u_texsize),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture),
            'u_rotate_symbol': new uniform.Uniform1i(context, locations.u_rotate_symbol),
            'u_radian': new uniform.Uniform1f(context, locations.u_radian),
            'u_modelMatrix': new uniform.UniformMatrix4f(context, locations.u_modelMatrix)
        });
    };

    var textVertex = "attribute vec2 a_pos;\n" +
        "    attribute vec4 a_data;\n" +
        "\n" +
        "    uniform highp float u_size;\n" +
        "    uniform mat4 u_matrix;\n" +
        "    uniform mat4 u_label_plane_matrix;\n" +
        "    uniform mat4 u_coord_matrix;\n" +
        "    uniform bool u_pitch_with_map;\n" +
        "    uniform highp float u_camera_to_center_distance;\n" +
        "    uniform vec2 u_texsize;\n" +
        "    varying vec2 v_data0;\n" +
        "\n" +
        "    uniform highp vec4 u_fill_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform bool u_rotate_symbol;\n" +
        "    uniform float u_radian;\n" +
        "\n" +
        "    void main() {\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        vec2 a_offset = a_data.xy;\n" +
        "        vec2 a_tex = a_data.zw;\n" +
        "        float size = u_size;\n" +
        "\n" +
        "        vec4 projectedPoint = u_matrix * vec4(a_pos, 0, 1);\n" +
        "        highp float camera_to_anchor_distance = projectedPoint.w;\n" +
        "        highp float distance_ratio = u_pitch_with_map ?\n" +
        "        camera_to_anchor_distance / u_camera_to_center_distance :\n" +
        "        u_camera_to_center_distance / camera_to_anchor_distance;\n" +
        "        highp float perspective_ratio = clamp(\n" +
        "        0.5 + 0.5 * distance_ratio,\n" +
        "        0.0, // Prevents oversized near-field symbols in pitched/overzoomed tiles\n" +
        "        4.0);\n" +
        "        size *= perspective_ratio;\n" +
        "        float fontScale = size / 24.0;\n" +
        "        highp float symbol_rotation = 0.0;\n" +
        "        if (u_rotate_symbol) {\n" +
        "            symbol_rotation = u_radian;\n" +
        "        }\n" +
        "    highp float angle_sin = sin(symbol_rotation);\n" +
        "    highp float angle_cos = cos(symbol_rotation);\n" +
        "    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);\n" +
        "\n" +
        "        vec4 projected_pos = u_label_plane_matrix * vec4(a_pos, 0.0, 1.0);\n" +
        "        gl_Position = u_coord_matrix * vec4(projected_pos.xy / projected_pos.w + rotation_matrix * (a_offset / 32.0 * fontScale), 0.0, 1.0);\n" +
        "        float gamma_scale = gl_Position.w;\n" +
        "\n" +
        "        vec2 tex = a_tex / u_texsize;\n" +
        "        float interpolated_fade_opacity = 1.0;\n" +
        "\n" +
        "        v_data0 = vec2(tex.x, tex.y);\n" +
        "    }";

    var textFrag = "precision mediump float;\n" +
        "    #define SDF_PX 8.0\n" +
        "    uniform sampler2D u_texture;\n" +
        "    uniform highp float u_gamma_scale;\n" +
        "\n" +
        "    varying vec2 v_data0;\n" +
        "\n" +
        "    uniform highp vec4 u_fill_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform highp float u_size;\n" +
        "    uniform highp vec4 u_halo_color;\n" +
        "    uniform lowp float u_halo_width;\n" +
        "    uniform lowp float u_halo_blur;\n" +
        "    uniform bool u_is_halo;\n" +
        "\n" +
        "    void main() {\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "\n" +
        "        float EDGE_GAMMA = 0.105;\n" +
        "\n" +
        "        vec2 tex = v_data0.xy;\n" +
        "        float gamma_scale = 1.0;\n" +
        "        float size = u_size;\n" +
        "        float fade_opacity = 1.0;\n" +
        "        float fontScale = size / 24.0;\n" +
        "\n" +
        "        lowp vec4 color = fill_color;\n" +
        "        highp float gamma = EDGE_GAMMA / (fontScale * u_gamma_scale);\n" +
        "        lowp float buff = (256.0 - 64.0) / 256.0;\n" +
        "        if (u_is_halo) {\n" +
        "            color = u_halo_color;\n" +
        "            gamma = (u_halo_blur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_gamma_scale);\n" +
        "            buff = (6.0 - u_halo_width / fontScale) / SDF_PX;\n" +
        "        }\n" +
        "        lowp float dist = texture2D(u_texture, tex).a;\n" +
        "        highp float gamma_scaled = gamma * gamma_scale;\n" +
        "        highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);\n" +
        "\n" +
        "        gl_FragColor = color * (alpha * opacity * fade_opacity);\n" +
        "    }";

    var ztTextVertex = "attribute vec2 a_pos;\n" +
        "    attribute vec4 a_data;\n" +
        "\n" +
        "    uniform highp float u_size;\n" +
        "    uniform mat4 u_matrix;\n" +
        "    uniform mat4 u_label_plane_matrix;\n" +
        "    uniform mat4 u_coord_matrix;\n" +
        "    uniform bool u_pitch_with_map;\n" +
        "    uniform highp float u_camera_to_center_distance;\n" +
        "    uniform vec2 u_texsize;\n" +
        "    varying vec2 v_data0;\n" +
        "\n" +
        "    uniform highp vec4 u_fill_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform bool u_rotate_symbol;\n" +
        "    uniform float u_radian;\n" +
        "\n" +
        "    void main() {\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        vec2 a_offset = a_data.xy;\n" +
        "        vec2 a_tex = a_data.zw;\n" +
        "        float size = u_size;\n" +
        "\n" +
        "        vec4 projectedPoint = u_matrix * vec4(a_pos, 0, 1);\n" +
        "        highp float camera_to_anchor_distance = projectedPoint.w;\n" +
        "        highp float distance_ratio = u_pitch_with_map ?\n" +
        "        camera_to_anchor_distance / u_camera_to_center_distance :\n" +
        "        u_camera_to_center_distance / camera_to_anchor_distance;\n" +
        "        highp float perspective_ratio = clamp(\n" +
        "        0.5 + 0.5 * distance_ratio,\n" +
        "        0.0, // Prevents oversized near-field symbols in pitched/overzoomed tiles\n" +
        "        4.0);\n" +
        "        size *= perspective_ratio;\n" +
        "        float fontScale = size / 96.0;\n" +
        "        highp float symbol_rotation = 0.0;\n" +
        "        if (u_rotate_symbol) {\n" +
        "            symbol_rotation = u_radian;\n" +
        "        }\n" +
        "    highp float angle_sin = sin(symbol_rotation);\n" +
        "    highp float angle_cos = cos(symbol_rotation);\n" +
        "    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);\n" +
        "\n" +
        "        vec4 projected_pos = u_label_plane_matrix * vec4(a_pos, 0.0, 1.0);\n" +
        "        gl_Position = u_coord_matrix * vec4(projected_pos.xy / projected_pos.w + rotation_matrix * (a_offset / 32.0 * fontScale), 0.0, 1.0);\n" +
        "        float gamma_scale = gl_Position.w;\n" +
        "\n" +
        "        vec2 tex = a_tex / u_texsize;\n" +
        "        float interpolated_fade_opacity = 1.0;\n" +
        "\n" +
        "        v_data0 = vec2(tex.x, tex.y);\n" +
        "    }";

    var ztTextFrag = "precision mediump float;\n" +
        "    #define SDF_PX 8.0\n" +
        "    uniform sampler2D u_texture;\n" +
        "    uniform highp float u_gamma_scale;\n" +
        "\n" +
        "    varying vec2 v_data0;\n" +
        "\n" +
        "    uniform highp vec4 u_fill_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    uniform highp float u_size;\n" +
        "    uniform highp vec4 u_halo_color;\n" +
        "    uniform lowp float u_halo_width;\n" +
        "    uniform lowp float u_halo_blur;\n" +
        "    uniform bool u_is_halo;\n" +
        "    uniform lowp float u_buff;\n" +
        "\n" +
        "    void main() {\n" +
        "        highp vec4 fill_color = u_fill_color;\n" +
        "        lowp float opacity = u_opacity;\n" +
        "        lowp float buff = u_buff;\n" +
        "\n" +
        "        float EDGE_GAMMA = 0.105;\n" +
        "\n" +
        "        vec2 tex = v_data0.xy;\n" +
        "        float gamma_scale = 1.0;\n" +
        "        float size = u_size;\n" +
        "        float fade_opacity = 1.0;\n" +
        "        float fontScale = size / 96.0;\n" +
        "\n" +
        "        lowp vec4 color = fill_color;\n" +
        "        highp float gamma = EDGE_GAMMA / (fontScale * u_gamma_scale);\n" +
        "        // lowp float buff = 0.45; //(256.0 - 64.0) / 256.0;\n" +
        "        lowp float dist = texture2D(u_texture, tex).a;\n" +
        "        highp float gamma_scaled = gamma * gamma_scale;\n" +
        "        highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);\n" +
        "\n" +
        "        gl_FragColor = color * (alpha * opacity * fade_opacity);\n" +
        "        // gl_FragColor = vec4(dist/255.0, dist/255.0, dist/255.0, 1.0);\n" +
        "    }";

    var textUniforms = function (context, locations) {
        return ({
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_label_plane_matrix': new uniform.UniformMatrix4f(context, locations.u_label_plane_matrix),
            'u_coord_matrix': new uniform.UniformMatrix4f(context, locations.u_coord_matrix),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_texsize': new uniform.Uniform2f(context, locations.u_texsize),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture),
            'u_fill_color': new uniform.Uniform4f(context, locations.u_fill_color),
            'u_gamma_scale': new uniform.Uniform1f(context, locations.u_gamma_scale),
            'u_rotate_symbol': new uniform.Uniform1i(context, locations.u_rotate_symbol),
            'u_radian': new uniform.Uniform1f(context, locations.u_radian),
            'u_halo_color': new uniform.Uniform4f(context, locations.u_halo_color),
            'u_halo_width': new uniform.Uniform1f(context, locations.u_halo_width),
            'u_halo_blur': new uniform.Uniform1f(context, locations.u_halo_blur),
            'u_is_halo': new uniform.Uniform1i(context, locations.u_is_halo)
        });
    };

    var ztTextUniforms = function (context, locations) {
        return ({
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_label_plane_matrix': new uniform.UniformMatrix4f(context, locations.u_label_plane_matrix),
            'u_coord_matrix': new uniform.UniformMatrix4f(context, locations.u_coord_matrix),
            'u_pitch_with_map': new uniform.Uniform1i(context, locations.u_pitch_with_map),
            'u_texsize': new uniform.Uniform2f(context, locations.u_texsize),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture),
            'u_fill_color': new uniform.Uniform4f(context, locations.u_fill_color),
            'u_gamma_scale': new uniform.Uniform1f(context, locations.u_gamma_scale),
            'u_rotate_symbol': new uniform.Uniform1i(context, locations.u_rotate_symbol),
            'u_radian': new uniform.Uniform1f(context, locations.u_radian),
            'u_halo_color': new uniform.Uniform4f(context, locations.u_halo_color),
            'u_halo_width': new uniform.Uniform1f(context, locations.u_halo_width),
            'u_halo_blur': new uniform.Uniform1f(context, locations.u_halo_blur),
            'u_is_halo': new uniform.Uniform1i(context, locations.u_is_halo),
            'u_buff': new uniform.Uniform1f(context, locations.u_buff)
        });
    };

    var arcVertex = "attribute vec3 a_pos;\n" +
        "  attribute vec3 source;\n" +
        "  attribute vec3 target;\n" +
        "  uniform mat4 u_matrix;\n" +
        "  uniform vec2 u_units_to_pixels;\n" +
        "  uniform float u_device_pixel_ratio;\n" +
        "\n" +
        "  uniform float width;\n" +
        "  uniform float height;\n" +
        "  uniform float tilts;\n" +
        "  uniform float numSegments;\n" +
        "\n" +
        "  float paraboloid(vec3 source, vec3 target, float ratio) {\n" +
        "    vec3 delta = target - source;\n" +
        "    float dh = length(delta.xy) * height;\n" +
        "    float unitZ = delta.z / dh;\n" +
        "    float p2 = unitZ * unitZ + 1.0;\n" +
        "    float dir = step(delta.z, 0.0);\n" +
        "    float z0 = mix(source.z, target.z, dir);\n" +
        "    float r = mix(ratio, 1.0 - ratio, dir);\n" +
        "    return sqrt(r * (p2 - r)) * dh + z0;\n" +
        "  }\n" +
        "  vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {\n" +
        "    vec2 dir_screenspace = normalize(line_clipspace);\n" +
        "    dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);\n" +
        "    return dir_screenspace * offset_direction * width;\n" +
        "  }\n" +
        "\n" +
        "  float getSegmentRatio(float index) {\n" +
        "    return smoothstep(0.0, 1.0, index / (numSegments - 1.0));\n" +
        "  }\n" +
        "\n" +
        "  vec3 getPos(vec3 source, vec3 target, float segmentRatio) {\n" +
        "    float z = paraboloid(source, target, segmentRatio);\n" +
        "    float tiltAngle = radians(tilts);\n" +
        "    vec2 tiltDirection = normalize(target.xy - source.xy);\n" +
        "    vec2 tilt = vec2(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);\n" +
        "    return vec3(mix(source.xy, target.xy, segmentRatio) + tilt,z * cos(tiltAngle));\n" +
        "  }\n" +
        "\n" +
        "  vec2 project_pixel_size_to_clipspace(vec2 pixels) {\n" +
        "    vec2 offset = pixels / u_units_to_pixels * u_device_pixel_ratio * 2.0;\n" +
        "    return offset;\n" +
        "  }\n" +
        "\n" +
        "  void main(void) {\n" +
        "    float segmentIndex = a_pos.x;\n" +
        "    float segmentRatio = getSegmentRatio(segmentIndex);\n" +
        "    float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));\n" +
        "    float nextSegmentRatio = getSegmentRatio(segmentIndex + indexDir);\n" +
        "\n" +
        "    vec3 currPos = getPos(source, target, segmentRatio);\n" +
        "    vec3 nextPos = getPos(source, target, nextSegmentRatio);\n" +
        "    vec4 curr = u_matrix * vec4(currPos, 1.0);\n" +
        "    vec4 next = u_matrix * vec4(nextPos, 1.0);\n" +
        "\n" +
        "    float widthPixels = width;\n" +
        "\n" +
        "    vec3 offset = vec3(getExtrusionOffset((next.xy - curr.xy) * indexDir, a_pos.y, widthPixels), 0.0);\n" +
        "    gl_Position = curr + vec4(offset.xy, 0.0, 0.0);\n" +
        "  }";

    var arcFrag = "precision highp float;\n" +
        "  uniform vec4 color;\n" +
        "  uniform float opacity;\n" +
        "  void main(void) {\n" +
        "    gl_FragColor = vec4(color.xyz, opacity);\n" +
        "  }";

    var arcUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'height': new uniform.Uniform1f(context, locations.height),
            'tilts': new uniform.Uniform1f(context, locations.tilts),
            'numSegments': new uniform.Uniform1f(context, locations.numSegments),
            'width': new uniform.Uniform1f(context, locations.width),
            'u_units_to_pixels': new uniform.Uniform2f(context, locations.u_units_to_pixels),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'color': new uniform.Uniform4f(context, locations.color),
            'opacity': new uniform.Uniform1f(context, locations.opacity)
        });
    };

    var multiFillV = "attribute vec2 a_pos;\n" +
        "    attribute vec4 a_color;\n" +
        "    uniform mat4 u_matrix;\n" +
        "    varying vec4 v_color;\n" +
        "    void main() {\n" +
        "        gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);\n" +
        "        v_color = a_color;\n" +
        "    }";

    var multiFillF = "precision mediump float;\n" +
        "    varying vec4 v_color;\n" +
        "    uniform lowp float u_opacity;\n" +
        "    void main() {\n" +
        "        gl_FragColor = v_color * u_opacity;\n" +
        "    }";

    var multiFillUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity)
        });
    };

    // 从本模块导出, 供其他模块调用
    exports.clippingMask = {
        vertexSource: clippingMaskVert,
        fragmentSource: clippingMaskFrag
    };

    exports.background = {
        vertexSource: backgroundVert,
        fragmentSource: backgroundFrag
    };

    exports.fill = {
        vertexSource: fillVertex,
        fragmentSource: fillFrag
    };
    exports.fillExtrusion = {
        vertexSource: fillExtrusionVert,
        fragmentSource: fillExtrusionFrag
    };

    exports.lineSDF = {
        vertexSource: lineDashVertex,
        fragmentSource: lineDashFrag
    };

    exports.symbolSDF = {
        vertexSource: symbolVertex,
        fragmentSource: symbolFrag
    };

    exports.symbolIcon = {
        vertexSource: symbolIconVertex,
        fragmentSource: symbolIconFrag
    };

    exports.heatmap = {
        vertexSource: heatmapVertex,
        fragmentSource: heatmapFrag
    };

    exports.heatmapTexture = {
        vertexSource: heatmapTextureVertex,
        fragmentSource: heatmapTextureFrag
    };

    exports.raster = {
        vertexSource: rasterVertex,
        fragmentSource: rasterFrag
    };

    exports.image = {
        vertexSource: imageTextureVertex,
        fragmentSource: imageTextureFrag
    };

    exports.circle = {
        vertexSource: circleVertex,
        fragmentSource: circleFragment
    };

    exports.circles = {
        vertexSource: circlesVertex,
        fragmentSource: circlesFrag
    };

    exports.basicLine = {
        vertexSource: lineVertex2,
        fragmentSource: lineFragment2
    };

    exports.basicFill = {
        vertexSource: basicFillV,
        fragmentSource: basicFillF
    };

    exports.basicLineSDF = {
        vertexSource: lineDashVertexSimplify,
        fragmentSource: lineDashFragSimplify
    };

    exports.basicSymbol = {
        vertexSource: basicSymbolV,
        fragmentSource: basicSymbolF
    };

    exports.multiPoints = {
        vertexSource: multiPointsVertex,
        fragmentSource: multiPointsFrag
    };

    exports.images = {
        vertexSource: imageVertex,
        fragmentSource: imageFrag
    };

    exports.text = {
        vertexSource: textVertex,
        fragmentSource: textFrag
    };

    exports.arc = {
        vertexSource: arcVertex,
        fragmentSource: arcFrag
    };

    exports.multiCircles = {
        vertexSource: multiCircleVertex,
        fragmentSource: multiCircleFragment
    };

    exports.multiPolygon = {
        vertexSource: multiFillV,
        fragmentSource: multiFillF
    };

    exports.fan = {
        vertexSource: fanVertex,
        fragmentSource: fanFrag
    };

    var arcParticleVertex = "attribute float a_ratio;\n" +
        "  attribute vec3 source;\n" +
        "  attribute vec3 target;\n" +
        "  uniform mat4 u_matrix;\n" +
        "  uniform float height;\n" +
        "  uniform float tilts;\n" +
        "  uniform float offset;\n" +
        "\n" +
        "  float paraboloid(vec3 source, vec3 target, float ratio) {\n" +
        "    vec3 delta = target - source;\n" +
        "    float dh = length(delta.xy) * height;\n" +
        "    float unitZ = delta.z / dh;\n" +
        "    float p2 = unitZ * unitZ + 1.0;\n" +
        "    float dir = step(delta.z, 0.0);\n" +
        "    float z0 = mix(source.z, target.z, dir);\n" +
        "    float r = mix(ratio, 1.0 - ratio, dir);\n" +
        "    return sqrt(r * (p2 - r)) * dh + z0;\n" +
        "  }\n" +
        "\n" +
        "  vec3 getPos(vec3 source, vec3 target, float segmentRatio) {\n" +
        "    float z = paraboloid(source, target, segmentRatio);\n" +
        "    float tiltAngle = radians(tilts);\n" +
        "    vec2 tiltDirection = normalize(target.xy - source.xy);\n" +
        "    vec2 tilt = vec2(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);\n" +
        "    return vec3(mix(source.xy, target.xy, segmentRatio) + tilt,z * cos(tiltAngle));\n" +
        "  }\n" +
        "\n" +
        "  void main(void) {\n" +
        "    float segmentRatio = a_ratio + offset;\n" +
        "    segmentRatio = segmentRatio > 1.0?segmentRatio-1.0:segmentRatio;\n" +
        "    vec3 currPos = getPos(source, target, segmentRatio);\n" +
        "    gl_Position = u_matrix * vec4(currPos, 1.0);\n" +
        "    gl_PointSize = 20.0;\n" +
        "  }";

    var arcParticleFrag = "precision highp float;\n" +
        "  uniform vec4 color;\n" +
        "  void main(void) {\n" +
        "    float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n" +
        /*"    float opacity = 1.0 - d * 2.0;\n" +
    "    if(opacity > 0.0){\n" +
    "      gl_FragColor = vec4(1.0, 1.0, 0.0, opacity);\n" +
    "    } else {\n" +
    "      discard;\n" +
    "    }\n" +*/
        "if (d < 0.1) {\n" +
        "    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n" +
        "  } else if (d < 0.5) {\n" +
        "    gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5 - d);\n" +
        "  } else {\n" +
        "    discard;\n" +
        "  }\n" +
        "  }";

    var arcParticleUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'height': new uniform.Uniform1f(context, locations.height),
            'tilts': new uniform.Uniform1f(context, locations.tilts),
            'color': new uniform.Uniform4f(context, locations.color),
            'offset': new uniform.Uniform1f(context, locations.offset)
        });
    };
    exports.arcParticle = {
        vertexSource: arcParticleVertex,
        fragmentSource: arcParticleFrag
    };


    var lineParticleVertex = "attribute float a_ratio;\n" +
        "  uniform vec3 u_source_position;\n" +
        "  uniform vec3 u_target_position;\n" +
        "  uniform mat4 u_matrix;\n" +
        "  vec3 getPos(vec3 source, vec3 target, float segmentRatio) {\n" +
        "    return source * (1.0 - segmentRatio) + target * segmentRatio;\n" +
        "  }\n" +
        "\n" +
        "  void main(void) {\n" +
        "    vec3 source = u_source_position;\n" +
        "    vec3 target = u_target_position;\n" +
        "    vec3 currPos = getPos(source, target, a_ratio);\n" +
        "    gl_Position = u_matrix * vec4(currPos, 1.0);\n" +
        "    gl_PointSize = 20.0;\n" +
        "  }";

    var lineParticleFrag = "precision highp float;\n" +
        "  uniform vec4 color;\n" +
        "  void main(void) {\n" +
        "    float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n" +
        "if (d < 0.1) {\n" +
        "    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n" +
        "  } else if (d < 0.5) {\n" +
        "    gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5 - d);\n" +
        "  } else {\n" +
        "    discard;\n" +
        "  }\n" +
        "  }";

    var lineParticleUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_source_position': new uniform.Uniform3f(context, locations.u_source_position),
            'u_target_position': new uniform.Uniform3f(context, locations.u_target_position),
            'color': new uniform.Uniform4f(context, locations.color)
        });
    };
    exports.lineParticle = {
        vertexSource: lineParticleVertex,
        fragmentSource: lineParticleFrag
    };

    var spriteVertex = "attribute vec2 position;\n" +
        "  attribute vec2 uv;\n" +
        "\n" +
        "  uniform vec2 scale;\n" +
        "  uniform mat4 modelViewMatrix;\n" +
        "  uniform mat4 projectionMatrix;\n" +
        "  uniform float rotation;\n" +
        "  uniform vec2 center;\n" +
        "\n" +
        "  varying vec2 vUv;\n" +
        "\n" +
        "  void main() {\n" +
        "    vUv = uv;\n" +
        "    position = position/2.0;\n" +
        "    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n" +
        "\n" +
        "    bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );\n" +
        "    if ( isPerspective ) scale *= - mvPosition.z;\n" +
        "\n" +
        "    vec2 alignedPosition = (position - (center - vec2(0.5))) * scale;\n" +
        "    vec2 rotatedPosition;\n" +
        "    rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;\n" +
        "    rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;\n" +
        "    mvPosition.xy += rotatedPosition;\n" +
        "    gl_Position = projectionMatrix * mvPosition;\n" +
        "  }";

    var spriteFrag = "precision highp float;\n" +
        "\n" +
        "  varying vec2 vUv;\n" +
        "  uniform sampler2D map;\n" +
        "\n" +
        "  void main() {\n" +
        "    gl_FragColor = texture2D(map, vUv);\n" +
        "  }";

    var spriteUniforms = function (context, locations) {
        return ({
            'modelViewMatrix': new uniform.UniformMatrix4f(context, locations.modelViewMatrix),
            'projectionMatrix': new uniform.UniformMatrix4f(context, locations.projectionMatrix),
            'scale': new uniform.Uniform2f(context, locations.scale),
            'center': new uniform.Uniform2f(context, locations.center),
            'rotation': new uniform.Uniform1f(context, locations.rotation),
            'map': new uniform.Uniform1i(context, locations.map)
        });
    };

    exports.sprite = {
        vertexSource: spriteVertex,
        fragmentSource: spriteFrag
    };

    var lineExtrusionVertex = "attribute vec3 a_pos;\n" +
        "  uniform mat4 u_matrix;\n" +
        "  uniform float u_fill_extrusion_base;\n" +
        "  uniform float u_fill_extrusion_height;\n" +
        "\n" +
        "  void main() {\n" +
        "    highp float base = u_fill_extrusion_base;\n" +
        "    highp float height = u_fill_extrusion_height;\n" +
        "    base = max(0.0, base);\n" +
        "    height = max(0.0, height);\n" +
        "    gl_Position = u_matrix * vec4(a_pos.xy, a_pos.z>0.0 ? height : base, 1.0);\n" +
        "  }";
    var lineExtrusionFrag = "precision mediump float;\n" +
        "  uniform vec4 u_fill_extrusion_color;\n" +
        "  void main() {\n" +
        "    gl_FragColor = u_fill_extrusion_color;\n" +
        "  }";

    var lineExtrusionUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix)
        });
    };

    exports.lineExtrusion = {
        vertexSource: lineExtrusionVertex,
        fragmentSource: lineExtrusionFrag
    };

    var moveLineVertex = "attribute vec3 a_data;\n" +
        "  attribute vec2 source;\n" +
        "  attribute vec2 middle;\n" +
        "  attribute vec2 target;\n" +
        "  uniform float ratio;\n" +
        "  uniform float u_len;\n" +
        "  uniform float segment;\n" +
        "  uniform mat4 u_matrix;\n" +
        "  uniform float u_width;\n" +
        "  varying float v_opacity;\n" +
        "\n" +
        "  vec2 getPos(float t) {\n" +
        "    float left = 1.0 - t;\n" +
        "    return left * left * source + 2.0 * t * left * middle + t * t * target;\n" +
        "  }\n" +
        "\n" +
        "  vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {\n" +
        "    vec2 dir_screenspace = normalize(line_clipspace);\n" +
        "    dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);\n" +
        "    return dir_screenspace * offset_direction * width / 2.0;\n" +
        "  }\n" +
        "\n" +
        "  void main() {\n" +
        "    vec2 currPos = getPos(ratio);\n" +
        "    vec2 nextPos = getPos(max(ratio - 1.0/segment, 0.0));\n" +
        "    vec2 normal = normalize(nextPos - currPos)* u_len * a_data.x;\n" +
        "    vec4 curr = u_matrix * vec4(currPos - normal, 0.0, 1.0);\n" +
        "    vec4 next = u_matrix * vec4(nextPos, 0.0, 1.0);\n" +
        "\n" +
        "    vec2 offsetPos = getExtrusionOffset(next.xy - curr.xy, a_data.y, u_width);\n" +
        "    gl_Position = curr + vec4(offsetPos, 0.0, 1.0);\n" +
        "    v_opacity = a_data.z;\n" +
        "//    gl_Position = u_matrix * vec4(source, 0.0, 1.0);\n" +
        "  }";
    var moveLineFrag = "precision mediump float;\n" +
        "  varying float v_opacity;\n" +
        "  uniform vec4 u_color;\n" +
        "  void main() {\n" +
        "    gl_FragColor = vec4(u_color.xyz, mix(0.0, 1.0, v_opacity));\n" +
        "  }";

    var moveLineUniforms = function (context, locations) {
        return ({
            'ratio': new uniform.Uniform1f(context, locations.ratio),
            'u_len': new uniform.Uniform1f(context, locations.u_len),
            'segment': new uniform.Uniform1f(context, locations.segment),
            'u_width': new uniform.Uniform1f(context, locations.u_width),
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_color': new uniform.Uniform4f(context, locations.u_color)
        });
    };

    exports.moveLine = {
        vertexSource: moveLineVertex,
        fragmentSource: moveLineFrag
    };

    var moveArcVertex = "attribute vec3 a_pos;\n" +
        "  attribute vec3 source;\n" +
        "  attribute vec3 target;\n" +
        "  uniform float u_ratio;\n" +
        "  uniform float u_len;\n" +
        "  uniform mat4 u_matrix;\n" +
        "  uniform float u_device_pixel_ratio;\n" +
        "\n" +
        "  uniform float width;\n" +
        "  uniform float height;\n" +
        "  uniform float tilts;\n" +
        "  uniform float numSegments;\n" +
        "  varying float v_opacity;\n" +
        "\n" +
        "  float paraboloid(vec3 source, vec3 target, float ratio) {\n" +
        "    vec3 delta = target - source;\n" +
        "    float dh = length(delta.xy) * height;\n" +
        "    float unitZ = delta.z / dh;\n" +
        "    float p2 = unitZ * unitZ + 1.0;\n" +
        "    float dir = step(delta.z, 0.0);\n" +
        "    float z0 = mix(source.z, target.z, dir);\n" +
        "    float r = mix(ratio, 1.0 - ratio, dir);\n" +
        "    return sqrt(r * (p2 - r)) * dh + z0;\n" +
        "  }\n" +
        "  vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {\n" +
        "    vec2 dir_screenspace = normalize(line_clipspace);\n" +
        "    dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);\n" +
        "    return dir_screenspace * offset_direction * width;\n" +
        "  }\n" +
        "\n" +
        "  vec3 getPos(vec3 source, vec3 target, float segmentRatio) {\n" +
        "    float z = paraboloid(source, target, segmentRatio);\n" +
        "    float tiltAngle = radians(tilts);\n" +
        "    vec2 tiltDirection = normalize(target.xy - source.xy);\n" +
        "    vec2 tilt = vec2(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);\n" +
        "    return vec3(mix(source.xy, target.xy, segmentRatio) + tilt,z * cos(tiltAngle));\n" +
        "  }\n" +
        "\n" +
        "  void main(void) {\n" +
        "    vec3 currPos = getPos(source, target, u_ratio);\n" +
        "    vec3 nextPos = getPos(source, target, max(u_ratio - 0.5/numSegments, 0.0));\n" +
        "    vec3 normal = normalize(nextPos - currPos)* u_len * a_pos.x;\n" +
        "    vec4 curr = u_matrix * vec4(currPos - normal , 1.0);\n" +
        "    vec4 next = u_matrix * vec4(nextPos, 1.0);\n" +

        "\n" +
        "    float widthPixels = width;\n" +
        "\n" +
        "    vec3 offsetPos = vec3(getExtrusionOffset(next.xy - curr.xy, a_pos.y, widthPixels), 0.0);\n" +
        "    gl_Position = curr + vec4(offsetPos.xy, 0.0, 0.0);\n" +
        "    v_opacity = a_pos.z;\n" +
        "  }";

    var moveArcFrag = "precision highp float;\n" +
        "  uniform vec4 color;\n" +
        "  varying float v_opacity;\n" +
        "  void main(void) {\n" +
        "    gl_FragColor = vec4(color.xyz, v_opacity*0.8);\n" +
        "  }";

    var moveArcUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'height': new uniform.Uniform1f(context, locations.height),
            'tilts': new uniform.Uniform1f(context, locations.tilts),
            'numSegments': new uniform.Uniform1f(context, locations.numSegments),
            'width': new uniform.Uniform1f(context, locations.width),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'color': new uniform.Uniform4f(context, locations.color),
            'u_ratio': new uniform.Uniform1f(context, locations.u_ratio),
            'u_len': new uniform.Uniform1f(context, locations.u_len)
        });
    };

    exports.moveArc = {
        vertexSource: moveArcVertex,
        fragmentSource: moveArcFrag
    };

    var blurVertex = "attribute vec4 aPos;\n" +
        "  varying vec2 vUv;\n" +
        "  void main() {\n" +
        "    vUv = aPos.zw;\n" +
        "    gl_Position = vec4(aPos.xy, 0.0, 1.0);\n" +
        "  }";

    var blurFrag = "precision mediump float;\n" +
        "  varying vec2 vUv;\n" +
        "  uniform sampler2D colorTexture;\n" +
        "  uniform vec2 texSize;\n" +
        "  uniform vec2 direction;\n" +
        "\n" +
        "  uniform float SIGMA;\n" +
        "\n" +
        "  float gaussianPdf(in float x, in float sigma) {\n" +
        "    return 0.39894 * exp(-0.5 * x * x/(sigma * sigma))/sigma;\n" +
        "  }\n" +
        "  void main() {\n" +
        "    vec2 invSize = 1.0 / texSize;\n" +
        "    float fSigma = float(SIGMA);\n" +
        "    float weightSum = gaussianPdf(0.0, fSigma);\n" +
        "    vec4 diffuseSum = texture2D(colorTexture, vUv) * weightSum;\n" +
        "    for (int i = 1; i < 8; i ++) {\n" +
        "      float x = float(i);\n" +
        "      float w = gaussianPdf(x, fSigma);\n" +
        "      vec2 uvOffset = direction * invSize * x;\n" +
        "      vec4 sample1 = texture2D(colorTexture, vUv + uvOffset);\n" +
        "      vec4 sample2 = texture2D(colorTexture, vUv - uvOffset);\n" +
        "      diffuseSum += (sample1 + sample2) * w;\n" +
        "      weightSum += 2.0 * w;\n" +
        "    }\n" +
        "    //    gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n" +
        "    // gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n" +
        "    gl_FragColor = diffuseSum/weightSum;\n" +
        "  }";

    var blurUniforms = function (context, locations) {
        return ({
            "colorTexture": new uniform.Uniform1i(context, locations.colorTexture),
            "texSize": new uniform.Uniform2f(context, locations.texSize),
            "direction": new uniform.Uniform2f(context, locations.direction),
            "SIGMA": new uniform.Uniform1f(context, locations.SIGMA)
        });
    };

    exports.blur = {
        vertexSource: blurVertex,
        fragmentSource: blurFrag
    };

    var bloomVertex = "attribute vec4 aPos;\n" +
        "  varying vec2 vUv;\n" +
        "  void main() {\n" +
        "    vUv = aPos.zw;\n" +
        "    gl_Position = vec4(aPos.xy, 0.0, 1.0);\n" +
        "  }";
    var bloomFrag = "precision mediump float;\n" +
        "  varying vec2 vUv;\n" +
        "  uniform sampler2D blurTexture1;\n" +
        "  uniform float bloomStrength;\n" +
        "  uniform float bloomRadius;\n" +

        /*   "  uniform sampler2D blurTexture2;\n" +
      "  uniform sampler2D blurTexture3;\n" +
      "  uniform sampler2D blurTexture4;\n" +
      "  uniform sampler2D blurTexture5;\n" +

      "  uniform float bloomFactors[5];\n" +
      "  uniform vec3 bloomTintColors[5];\n" +
      "\n" +*/
        "  float lerpBloomFactor(const in float factor) {\n" +
        "    float mirrorFactor = 1.2 - factor;\n" +
        "    return mix(factor, mirrorFactor, bloomRadius);\n" +
        "  }\n" +
        "\n" +
        "  void main() {\n" +
        "    gl_FragColor = bloomStrength * (lerpBloomFactor(1.0) * vec4(1.0, 1.0, 1.0, 1.0) * texture2D(blurTexture1, vUv));// +\n" +
        /* "    lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +\n" +
    "    lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +\n" +
    "    lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +\n" +
    "    lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv));\n" +*/
        // "    gl_FragColor = texture2D(blurTexture1, vUv);\n" +
        "  }";

    var bloomUniforms = function (context, locations) {
        return ({
            "blurTexture1": new uniform.Uniform1i(context, locations.blurTexture1),
            "bloomStrength": new uniform.Uniform1f(context, locations.bloomStrength),
            "bloomRadius": new uniform.Uniform1f(context, locations.bloomRadius)
        });
    };

    exports.bloom = {
        vertexSource: bloomVertex,
        fragmentSource: bloomFrag
    };

    var imageFillVertex = "vec2 get_pattern_pos(const vec2 pixel_coord_upper, const vec2 pixel_coord_lower,\n" +
        "  const vec2 pattern_size, const float tile_units_to_pixels, const vec2 pos) {\n" +
        "\n" +
        "    vec2 offset = mod(mod(mod(pixel_coord_upper, pattern_size) * 256.0, pattern_size) * 256.0 + pixel_coord_lower, pattern_size);\n" +
        "    return (tile_units_to_pixels * pos + offset) / pattern_size;\n" +
        "  }\n" +
        "\n" +
        "  uniform mat4 u_matrix;\n" +
        "  uniform vec2 u_pixel_coord_upper;\n" +
        "  uniform vec2 u_pixel_coord_lower;\n" +
        "  uniform vec4 u_scale;\n" +
        "\n" +
        "  attribute vec2 a_pos;\n" +
        "\n" +
        "  varying vec2 v_pos_a;\n" +
        "  varying vec2 v_pos_b;\n" +
        "\n" +
        "\n" +
        "  uniform lowp float u_opacity;\n" +
        "  uniform lowp vec4 u_pattern_from;\n" +
        "  uniform lowp vec4 u_pattern_to;\n" +
        "\n" +
        "  void main() {\n" +
        "    lowp float opacity = u_opacity;\n" +
        "    mediump vec4 pattern_from = u_pattern_from;\n" +
        "    mediump vec4 pattern_to = u_pattern_to;\n" +
        "\n" +
        "    vec2 pattern_tl_a = pattern_from.xy;\n" +
        "    vec2 pattern_br_a = pattern_from.zw;\n" +
        "    vec2 pattern_tl_b = pattern_to.xy;\n" +
        "    vec2 pattern_br_b = pattern_to.zw;\n" +
        "\n" +
        "    float pixelRatio = u_scale.x;\n" +
        "    float tileZoomRatio = u_scale.y;\n" +
        "    float fromScale = u_scale.z;\n" +
        "    float toScale = u_scale.w;\n" +
        "\n" +
        "    vec2 display_size_a = vec2((pattern_br_a.x - pattern_tl_a.x) / pixelRatio, (pattern_br_a.y - pattern_tl_a.y) / pixelRatio);\n" +
        "    vec2 display_size_b = vec2((pattern_br_b.x - pattern_tl_b.x) / pixelRatio, (pattern_br_b.y - pattern_tl_b.y) / pixelRatio);\n" +
        "    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n" +
        "\n" +
        "    v_pos_a = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, fromScale * display_size_a, tileZoomRatio, a_pos);\n" +
        "    v_pos_b = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, toScale * display_size_b, tileZoomRatio, a_pos);\n" +
        "  }";

    var imageFillFrag = "precision mediump float;\n" +
        "\n" +
        "  uniform vec2 u_texsize;\n" +
        "  uniform float u_fade;\n" +
        "  uniform sampler2D u_image;\n" +
        "\n" +
        "  varying vec2 v_pos_a;\n" +
        "  varying vec2 v_pos_b;\n" +
        "\n" +
        "  uniform lowp float u_opacity;\n" +
        "  uniform lowp vec4 u_pattern_from;\n" +
        "  uniform lowp vec4 u_pattern_to;\n" +
        "\n" +
        "  void main() {\n" +
        "    lowp float opacity = u_opacity;\n" +
        "    mediump vec4 pattern_from = u_pattern_from;\n" +
        "    mediump vec4 pattern_to = u_pattern_to;\n" +
        "\n" +
        "\n" +
        "    vec2 pattern_tl_a = pattern_from.xy;\n" +
        "    vec2 pattern_br_a = pattern_from.zw;\n" +
        "    vec2 pattern_tl_b = pattern_to.xy;\n" +
        "    vec2 pattern_br_b = pattern_to.zw;\n" +
        "\n" +
        "    vec2 imagecoord = mod(v_pos_a, 1.0);\n" +
        "    vec2 pos = mix(pattern_tl_a / u_texsize, pattern_br_a / u_texsize, imagecoord);\n" +
        "    vec4 color1 = texture2D(u_image, pos);\n" +
        "\n" +
        "    vec2 imagecoord_b = mod(v_pos_b, 1.0);\n" +
        "    vec2 pos2 = mix(pattern_tl_b / u_texsize, pattern_br_b / u_texsize, imagecoord_b);\n" +
        "    vec4 color2 = texture2D(u_image, pos2);\n" +
        "\n" +
        "    gl_FragColor = mix(color1, color2, u_fade) * opacity;\n" +
        "  }";

    var imageFillUniforms = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_pixel_coord_upper': new uniform.Uniform2f(context, locations.u_pixel_coord_upper),
            'u_pixel_coord_lower': new uniform.Uniform2f(context, locations.u_pixel_coord_lower),
            'u_texsize': new uniform.Uniform2f(context, locations.u_texsize),
            'u_scale': new uniform.Uniform4f(context, locations.u_scale),
            'u_pattern_from': new uniform.Uniform4f(context, locations.u_pattern_from),
            'u_pattern_to': new uniform.Uniform4f(context, locations.u_pattern_to),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_fade': new uniform.Uniform1f(context, locations.u_fade),
            'u_image': new uniform.Uniform1i(context, locations.u_image)
        });
    };

    exports.imageFill = {
        vertexSource: imageFillVertex,
        fragmentSource: imageFillFrag
    };

    var gaussianBlurVertex = "attribute vec4 aPos;\n" +
        "  varying vec2 vUV;\n" +
        "  void main() {\n" +
        "    gl_Position = vec4(aPos.xy, 0.0, 1.0);\n" +
        "    vUV = aPos.zw;\n" +
        "  }";

    var gaussianBlurFrag = "precision mediump float;\n" +
        "  uniform sampler2D uTexture;\n" +
        "  uniform bool uHorizontal;\n" +
        "  // uniform float uSampleStep;\n" +
        "  uniform vec2 uSize;\n" +
        "  varying vec2 vUV;\n" +
        "\n" +
        "  uniform float u_kernel[5];\n" +
        "  void main() {\n" +
        "    vec2 onePixel = vec2(1.0) / uSize;\n" +
        "    vec2 offset = (uHorizontal? vec2(1, 0):vec2(0, 1));\n" +
        "    vec4 colorSum =\n" +
        "    texture2D(uTexture, vUV) * u_kernel[0] +\n" +
        "    texture2D(uTexture, vUV + onePixel * offset) * u_kernel[1] +\n" +
        "    texture2D(uTexture, vUV - onePixel * offset) * u_kernel[1] +\n" +
        "    texture2D(uTexture, vUV + onePixel * 2.0*offset) * u_kernel[2] +\n" +
        "    texture2D(uTexture, vUV - onePixel * 2.0*offset) * u_kernel[2] +\n" +
        "    texture2D(uTexture, vUV + onePixel * 3.0*offset) * u_kernel[3] +\n" +
        "    texture2D(uTexture, vUV - onePixel * 3.0*offset) * u_kernel[3] +\n" +
        "    texture2D(uTexture, vUV + onePixel * 4.0*offset) * u_kernel[4] +\n" +
        "    texture2D(uTexture, vUV - onePixel * 4.0*offset) * u_kernel[4];\n" +
        "    gl_FragColor = vec4(colorSum.rgb / 0.7, colorSum.a);\n" +
        // "    gl_FragColor = vec4(u_kernel[0], u_kernel[0], u_kernel[0], 1.0);\n" +
        "\n" +
        "  }";

    var gaussianBlurUniforms = function (context, locations) {
        return ({
            'uSize': new uniform.Uniform2f(context, locations.uSize),
            'uTexture': new uniform.Uniform1i(context, locations.uTexture),
            'uHorizontal': new uniform.Uniform1i(context, locations.uHorizontal),
            'u_kernel': new uniform.Uniform1fv(context, locations['u_kernel[0]'])
        });
    };

    exports.gaussianBlur = {
        vertexSource: gaussianBlurVertex,
        fragmentSource: gaussianBlurFrag
    };

    var screenFrag = "precision highp float;\n" +
        "  uniform sampler2D uTexture;\n" +
        "  varying vec2 vUV;\n" +
        "\n" +
        "  void main() {\n" +
        "    gl_FragColor = texture2D(uTexture, vUV);\n" +
        "  }";

    exports.screen = {
        vertexSource: gaussianBlurVertex,
        fragmentSource: screenFrag
    };

    var screenUniforms = function (context, locations) {
        return ({
            'uTexture': new uniform.Uniform1i(context, locations.uTexture)
        });
    };

    exports.basicFillImage = {
        vertexSource: basicFillImageV,
        fragmentSource: basicFillImageF
    };

    exports.ztText = {
        vertexSource: ztTextVertex,
        fragmentSource: ztTextFrag
    }


    /**
     * 矩形着色器
     * @type {{fragmentSource: *, vertexSource: *}}
     */
    exports.rect = {
        vertexSource: rectVertex,
        fragmentSource: reactFragment
    }
    /**
     * 矩形着色器的Uniform变量
     * @param context
     * @param locations
     * @returns {{u_extrude_scale, u_color, u_device_pixel_ratio, u_camera_to_center_distance, u_matrix, u_size}}
     */
    var rectUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_device_pixel_ratio': new uniform.Uniform1f(context, locations.u_device_pixel_ratio),
            'u_camera_to_center_distance': new uniform.Uniform1f(context, locations.u_camera_to_center_distance),
            'u_extrude_scale': new uniform.Uniform2f(context, locations.u_extrude_scale),
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_radian': new uniform.Uniform1f(context, locations.u_radian),
            'u_is_stroke': new uniform.Uniform1i(context, locations.u_is_stroke),
            'u_color': new uniform.Uniform4f(context, locations.u_color)/*,
      'u_stroke_width': new uniform.Uniform1f(context, locations['u_stroke_width']),
      'u_stroke_color': new uniform.Uniform4f(context, locations['u_stroke_color'])*/
        };
    };

    exports.terrain = {
        vertexSource: terrainVertex,
        fragmentSource: terrainFragment
    };

    var terrainUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_color': new uniform.Uniform4f(context, locations.u_color),
            'u_tileRectangle': new uniform.Uniform4f(context, locations.u_tileRectangle),
            'u_image': new uniform.Uniform1i(context, locations.u_image)
        };
    };

    exports.tifTerrain = {
        vertexSource: tiffTerrainVertex,
        fragmentSource: tiffTerrainFragment
    };

    var tifTerrainUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_image': new uniform.Uniform1i(context, locations.u_image),

        };
    };

    exports.heightMap = {
        vertexSource: heightMapVertex,
        fragmentSource: heightMapFragment
    }

    var heightMapUniforms = function (context, locations) {
        return {
            'u_min_height': new uniform.Uniform1f(context, locations.u_min_height),
            'u_delta_height': new uniform.Uniform1f(context, locations.u_delta_height)
        };
    };

    exports.water = {
        vertexSource: waterVertex,
        fragmentSource: waterFragment
    };

    var waterUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_water_depth': new uniform.Uniform1f(context, locations.u_water_depth)
        };
    };

    exports.bg = {
        vertexSource: bgVertex,
        fragmentSource: bgFragment
    }

    var bgUniforms = function (context, locations) {
        return {};
    }

    exports.mesh = {
        vertexSource: meshVertex,
        fragmentSource: meshFragment
    }

    var meshUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_model': new uniform.UniformMatrix4f(context, locations.u_model),
            'u_color': new uniform.Uniform3f(context, locations.u_color)
        }
    }

    exports.cylinder = {
        vertexSource: cylinderVertex,
        fragmentSource: cylinderFragment
    };

    var cylinderUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_texture': new uniform.Uniform1i(context, locations.u_texture),
            'u_size': new uniform.Uniform1f(context, locations.u_size),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_color': new uniform.Uniform4f(context, locations.u_color)
        }
    }

    exports.cone = {
        vertexSource: coneVertex,
        fragmentSource: coneFragment
    };

    var coneUniforms = function (context, locations) {
        return {
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix)
        }
    }

    exports.myline = {
        vertexSource: mylineVertex,
        fragmentSource: mylineFragment
    }

    var fillExtrusionUniforms2 = function (context, locations) {
        return ({
            'u_matrix': new uniform.UniformMatrix4f(context, locations.u_matrix),
            'u_lightpos': new uniform.Uniform3f(context, locations.u_lightpos),
            'u_lightintensity': new uniform.Uniform1f(context, locations.u_lightintensity),
            'u_lightcolor': new uniform.Uniform3f(context, locations.u_lightcolor),
            'u_vertical_gradient': new uniform.Uniform1f(context, locations.u_vertical_gradient),
            'u_opacity': new uniform.Uniform1f(context, locations.u_opacity),
            'u_color': new uniform.Uniform4f(context, locations.u_color),
            'u_height': new uniform.Uniform1f(context, locations.u_height),
            'u_base': new uniform.Uniform1f(context, locations.u_base)
        });
    };

    exports.fillExtrusion2 = {
        vertexSource: fillExtrusionVert,
        fragmentSource: fillExtrusionFrag
    };

    exports.programUniforms = {
        fill: fillUniforms,
        line: lineUniforms,
        symbolIcon: symbolIconUniforms,
        symbolSDF: symbolSDFUniforms,
        lineSDF: lineSDFUniforms,
        fillExtrusion: fillExtrusionUniforms,
        fillExtrusion2: fillExtrusionUniforms2,
        lineExtrusion: lineExtrusionUniforms,
        clippingMask: clippingMaskUniforms,
        background: backgroundUniforms,
        heatmap: heatmapUniforms,
        heatmapTexture: heatmapTextureUniforms,
        raster: rasterUniforms,
        image: imageTextureUniforms,
        circles: circleUniforms,
        circle: roundUniforms,
        basicFill: basicFillUniforms,
        basicLine: basicLineUniforms,
        basicSymbol: basicSymbolUniform,
        multiPoints: multiPointsUniforms,
        basicLineSDF: basicLineDashUniforms,
        images: imageUniforms,
        text: textUniforms,
        ztText: ztTextUniforms,
        arc: arcUniforms,
        multiCircles: multiRoundUniforms,
        multiPolygon: multiFillUniforms,
        fan: fanUniforms,
        arcParticle: arcParticleUniforms,
        lineParticle: lineParticleUniforms,
        sprite: spriteUniforms,
        moveLine: moveLineUniforms,
        moveArc: moveArcUniforms,
        blur: blurUniforms,
        bloom: bloomUniforms,
        imageFill: imageFillUniforms,
        gaussianBlur: gaussianBlurUniforms,
        screen: screenUniforms,
        basicFillImage: basicFillImageUniforms,

        rect: rectUniforms,
        terrain: terrainUniforms,
        heightMap: heightMapUniforms,
        tifTerrain: tifTerrainUniforms,

        water: waterUniforms,
        bg: bgUniforms,
        mesh: meshUniforms,
        cylinder: cylinderUniforms,
        cone: coneUniforms,
        myline: basicLineUniforms
    };
});