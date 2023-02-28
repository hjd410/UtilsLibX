attribute vec2 a_pos; // 坐标
attribute vec4 a_data;

uniform highp float u_size;
uniform mat4 u_matrix;
uniform mat4 u_label_plane_matrix;
uniform mat4 u_coord_matrix;
uniform bool u_pitch_with_map;
uniform highp float u_camera_to_center_distance;
uniform vec2 u_texsize;
uniform highp vec4 u_fill_color;
uniform lowp float u_opacity;
uniform bool u_rotate_symbol;
uniform float u_radian;

varying vec2 v_data0;

void main() {
    highp vec4 fill_color = u_fill_color;
    lowp float opacity = u_opacity;
    vec2 a_offset = a_data.xy;
    vec2 a_tex = a_data.zw;
    float size = u_size;
    vec4 projectedPoint = u_matrix * vec4(a_pos, 0, 1);
    highp float camera_to_anchor_distance = projectedPoint.w;
    highp float distance_ratio = u_pitch_with_map ? camera_to_anchor_distance / u_camera_to_center_distance : u_camera_to_center_distance / camera_to_anchor_distance;
    highp float perspective_ratio = clamp(0.5 + 0.5 * distance_ratio, 0.0, 4.0);
    size *= perspective_ratio;
    float fontScale = size / 24.0;
    highp float symbol_rotation = 0.0;
    if (u_rotate_symbol) {
        symbol_rotation = u_radian;
    }
    highp float angle_sin = sin(symbol_rotation);
    highp float angle_cos = cos(symbol_rotation);
    mat2 rotation_matrix = mat2(angle_cos, -1.0 * angle_sin, angle_sin, angle_cos);

    vec4 projected_pos = u_label_plane_matrix * vec4(a_pos, 0.0, 1.0);
    gl_Position = u_coord_matrix * vec4(projected_pos.xy / projected_pos.w + rotation_matrix * (a_offset / 32.0 * fontScale), 0.0, 1.0);
    float gamma_scale = gl_Position.w;

    v_data0 = a_tex / u_texsize;
}