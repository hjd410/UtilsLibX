#ifdef GL_ES
precision mediump float;
#else

#if !defined(lowp)
#define lowp
#endif

#if !defined(mediump)
#define mediump
#endif

#if !defined(highp)
#define highp
#endif

#endif

uniform mat4 u_matrix;
uniform vec3 u_lightcolor;
uniform lowp vec3 u_lightpos;
uniform lowp float u_lightintensity;
uniform float u_vertical_gradient;
uniform lowp float u_opacity;

attribute vec2 a_pos;
attribute vec4 a_normal_ed;

varying vec4 v_color;

// 条件编译
// 颜色
#ifndef HAS_UNIFORM_u_color
uniform lowp float u_color_t;
attribute highp vec4 a_color;
#else
uniform highp vec4 u_color;
#endif

// 高度
#ifndef HAS_UNIFORM_u_height
uniform lowp float u_height_t;
attribute highp vec2 a_height;
#else
uniform highp float u_height;
#endif

// 地形
#ifdef HAS_TERRAIN
uniform sampler2D u_height_image;
uniform highp float u_min_height;
uniform highp float u_delta_height;
#else
// 底部高度
#ifndef HAS_UNIFORM_u_base
uniform lowp float u_base_t;
attribute highp vec2 a_base;
#else
uniform highp float u_base;
#endif
#endif

// 处理函数
vec2 unpack_float(const float packedValue) {
    int packedIntValue = int(packedValue);
    int v0 = packedIntValue/256;
    return vec2(v0, packedIntValue - v0 * 256);
}

float unpack_mix_vec2(const vec2 packedValue, const float t) {
    return mix(packedValue[0], packedValue[1], t);
}

vec4 decode_color(const vec2 encodedColor) {
    return vec4(
    unpack_float(encodedColor[0]) / 255.0,
    unpack_float(encodedColor[1]) / 255.0
    );
}

vec4 unpack_mix_color(const vec4 packedColors, const float t) {
    vec4 minColor = decode_color(vec2(packedColors[0], packedColors[1]));
    vec4 maxColor = decode_color(vec2(packedColors[2], packedColors[3]));
    return mix(minColor, maxColor, t);
}

void main() {

    #ifndef HAS_UNIFORM_u_height
    highp float height = unpack_mix_vec2(a_height, u_height_t);
    #else
    highp float height = u_height;
    #endif

    #ifndef HAS_UNIFORM_u_color
    highp vec4 color = unpack_mix_color(a_color, u_color_t);
    #else
    highp vec4 color = u_color;
    #endif

    #ifdef HAS_TERRAIN
    vec3 rgb = texture2D(u_height_image, a_pos/8192.0).rgb;
    highp float base = rgb.r * u_delta_height + u_min_height;
    #else
    #ifndef HAS_UNIFORM_u_base
    highp float base = unpack_mix_vec2(a_base, u_base_t);
    #else
    highp float base = u_base;
    #endif
    #endif

    vec3 normal = a_normal_ed.xyz;
    float t = mod(normal.x, 2.0);
    gl_Position = u_matrix * vec4(a_pos, t > 0.0 ? height + base : base, 1);
    float colorvalue = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
    v_color = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 ambientlight = vec4(0.03, 0.03, 0.03, 1.0);
    color += ambientlight;
    float directional = clamp(dot(normal / 16384.0, u_lightpos), 0.0, 1.0);
    directional = mix((1.0 - u_lightintensity), max((1.0 - colorvalue + u_lightintensity), 1.0), directional);
    if (normal.y != 0.0) {
        directional *= (
        (1.0 - u_vertical_gradient) +
        (u_vertical_gradient * clamp((t + base) * pow(height / 150.0, 0.5), mix(0.7, 0.98, 1.0 - u_lightintensity), 1.0)));
    }
    v_color.r += clamp(color.r * directional * u_lightcolor.r, mix(0.0, 0.3, 1.0 - u_lightcolor.r), 1.0);
    v_color.g += clamp(color.g * directional * u_lightcolor.g, mix(0.0, 0.3, 1.0 - u_lightcolor.g), 1.0);
    v_color.b += clamp(color.b * directional * u_lightcolor.b, mix(0.0, 0.3, 1.0 - u_lightcolor.b), 1.0);
    v_color *= u_opacity;
}
