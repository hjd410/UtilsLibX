precision mediump float;

/*uniform sampler2D u_image;
varying vec2 v_texture;*/
varying float y_screen;

void main() {
    //    gl_FragColor = texture2D(u_image, v_texture);
    float fogFactor = 1.0 - smoothstep(0.3, 0.5, y_screen);
    gl_FragColor = vec4(0.94, 0.93, 0.91, 1.0) * (1.0-fogFactor) + vec4(0.0, 0.0, 0.0, 0.0) * fogFactor;
}