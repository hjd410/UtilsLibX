precision mediump float;
uniform vec4 u_color;
//varying float color;
uniform sampler2D u_image;
varying vec2 v_texture;
// const float m2d = 111194.872221777 / 2.0;

void main() {
    vec2 tex_location = vec2(v_texture.x, 1.0 - v_texture.y);
    vec4 color0 = texture2D(u_image, tex_location);
    gl_FragColor = color0;
//    gl_FragColor = vec4(color, color, color, 1.0);
//    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}