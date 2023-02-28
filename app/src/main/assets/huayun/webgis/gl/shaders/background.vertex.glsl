attribute vec4 a_pos;

varying float y_screen;
//varying vec2 v_texture;

void main() {
    gl_Position = vec4(a_pos.xy, 0.0, 1.0);
//    v_texture = a_pos.zw;
    y_screen = a_pos.y;
}