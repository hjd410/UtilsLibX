attribute vec2 a_pos;
attribute vec4 a_size;

uniform mat4 u_matrix;
uniform lowp float u_device_pixel_ratio;
uniform highp float u_camera_to_center_distance;
uniform mediump vec2 u_extrude_scale;
uniform highp float u_radian;
uniform bool u_is_stroke;

uniform highp float u_size;

void main() {
    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
    highp float angle_sin = sin(u_radian);
    highp float angle_cos = cos(u_radian);
    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);
    vec2 core_size = a_size.xy / 2.0;
    vec2 stroke_size = a_size.zw / 2.0;
    vec2 rotated_extrude;
    if (u_is_stroke) {
        rotated_extrude = rotation_matrix * stroke_size * u_size;
    } else {
        rotated_extrude = rotation_matrix * core_size * u_size;
    }
    gl_Position.xy += rotated_extrude * u_extrude_scale * u_camera_to_center_distance;
}