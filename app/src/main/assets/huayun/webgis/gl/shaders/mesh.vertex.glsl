precision highp float;
attribute vec3 position;
uniform mat4 u_matrix;
uniform mat4 u_model;
void main() {
    gl_Position = u_matrix * u_model * vec4(position, 1.0);
}