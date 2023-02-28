attribute vec3 a_pos;
uniform mat4 u_matrix;
uniform float u_water_depth;
void main() {
    gl_Position = u_matrix * vec4(a_pos.xy, a_pos.z > 0.0?u_water_depth:0.0, 1.0);
}