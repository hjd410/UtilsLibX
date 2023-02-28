precision highp float;

attribute vec3 a_pos;

uniform float u_min_height;
uniform float u_delta_height;
varying float v_color;

void main() {
    float height = a_pos.z;
    gl_Position = vec4(a_pos.xy * 2.0 - 1.0, 0.0, 1.0);
    v_color = (height - u_min_height) / u_delta_height;
}

/*
attribute vec4 position3DAndHeight;
attribute vec3 textureCoordAndEncodedNormals;

uniform float u_min_height;
uniform float u_delta_height;
varying float v_color;

vec4 getPosition(vec3 position, float height, vec2 textureCoordinates) {
    float yPositionFraction = 1.0 - textureCoordinates.y;
    return vec4(textureCoordinates.x * 2.0 -1.0, yPositionFraction* 2.0 -1.0, 0.0, 1.0);
}

void main() {
    vec3 position = position3DAndHeight.xyz;
    float height = position3DAndHeight.w;
    vec2 textureCoordinates = textureCoordAndEncodedNormals.xy;
    gl_Position = getPosition(position, 0.0, textureCoordinates);
    v_color = (height - u_min_height) / u_delta_height;
}*/