precision mediump float;
uniform float u_opacity;

#ifdef HAS_PATTERN
varying vec2 v_uv;
uniform sampler2D u_texture;
#else
uniform vec4 u_color;
#endif

void main() {
    #ifdef HAS_PATTERN
    gl_FragColor = texture2D(u_texture, v_uv) * u_opacity;
    #else
    gl_FragColor = u_color * u_opacity;
    #endif
}