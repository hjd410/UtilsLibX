precision mediump float;

varying vec2 v_width2;
varying vec2 v_normal;
varying float v_gamma_scale;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform highp vec4 u_color;
uniform lowp float u_opacity;

void main() {
    gl_FragColor = texture2D(u_texture, v_uv);
//    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}