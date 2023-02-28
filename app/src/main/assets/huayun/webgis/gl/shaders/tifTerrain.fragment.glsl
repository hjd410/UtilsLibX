precision mediump float;

uniform sampler2D u_image;
varying vec2 v_texture;

void main() {
//    vec2 tex_location = vec2(v_texture.x, 1.0 - v_texture.y);
    if(v_texture.x < 0.0 || v_texture.x > 1.0 || v_texture.y < 0.0 || v_texture.y > 1.0) {
        discard;
    }
    gl_FragColor = texture2D(u_image, v_texture);
}