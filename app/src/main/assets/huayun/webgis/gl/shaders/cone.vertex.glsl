attribute vec3 a_pos;
attribute vec4 a_color;

varying vec4 v_color;
uniform mat4 u_matrix;

void main() {
    gl_Position = u_matrix * vec4(a_pos, 1.0);
    v_color = a_color;
}
