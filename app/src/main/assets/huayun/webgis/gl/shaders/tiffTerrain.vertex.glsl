precision highp float;

attribute vec3 a_pos;
uniform mat4 u_matrix;

varying vec2 v_texture;

void main() {
    vec2 pos = a_pos.xy * 8192.0;
    float height = a_pos.z;
    gl_Position = u_matrix * vec4(pos, height, 1.0);
    v_texture = a_pos.xy;
}