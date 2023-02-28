precision mediump float;

varying vec2 v_width2;
varying vec2 v_normal;
varying float v_gamma_scale;
uniform highp vec4 u_color;
uniform lowp float u_opacity;

void main() {


    highp vec4 color = u_color;
    lowp float blur = 0.0;
    lowp float opacity = u_opacity;
    lowp float u_device_pixel_ratio = 1.0;

    float dist = length(v_normal) * v_width2.s;

    float blur2 = (blur + 1.0 / u_device_pixel_ratio) * v_gamma_scale;
    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);
    gl_FragColor = color * (alpha * opacity);
}