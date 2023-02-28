attribute vec3 a_pos;

#ifdef HAS_PATTERN
attribute vec2 a_uv;
varying vec2 v_uv;
#endif

uniform mat4 u_matrix;
uniform float u_size;

void main() {
    gl_Position = u_matrix * vec4(u_size * a_pos.xy, a_pos.z, 1.0);
    #ifdef HAS_PATTERN
    v_uv = a_uv;
    #endif
}
