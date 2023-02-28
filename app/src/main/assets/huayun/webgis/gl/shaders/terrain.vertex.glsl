const float m2d = 111194.872221777 / 2.0;

attribute vec4 position3DAndHeight;
attribute vec3 textureCoordAndEncodedNormals;

uniform mat4 u_matrix;
uniform vec4 u_tileRectangle;
uniform float u_resolution;
varying vec2 v_texture;
//varying float color;

float get2DGeographicYPositionFraction(vec2 textureCoordinates){
    return 1.0 - textureCoordinates.y;
}

float get2DYPositionFraction(vec2 textureCoordinates) {
    return get2DGeographicYPositionFraction(textureCoordinates);
}

vec4 getPositionPlanarEarth(vec3 position, float height, vec2 textureCoordinates){
    float yPositionFraction = get2DYPositionFraction(textureCoordinates);
    vec4 rtcPosition2D = vec4(mix(u_tileRectangle.st, u_tileRectangle.pq, vec2(textureCoordinates.x, yPositionFraction)), height/  111194.872221777, 1.0);
    return u_matrix * rtcPosition2D;
}

vec4 getPositionColumbusViewMode(vec3 position, float height, vec2 textureCoordinates){
    return getPositionPlanarEarth(position, height, textureCoordinates);
}

vec4 getPosition(vec3 position, float height, vec2 textureCoordinates) {
    return getPositionColumbusViewMode(position, height, textureCoordinates);
}

void main() {
    //    gl_Position = u_matrix * vec4(a_pos, 0, 1);
    vec3 position = position3DAndHeight.xyz;
    float height = position3DAndHeight.w;
    vec2 textureCoordinates = textureCoordAndEncodedNormals.xy;
    gl_Position = getPosition(position, height, textureCoordinates);
    v_texture = textureCoordinates;
    /*float ratio = height / 200.0;
    if (ratio > 1.0) {
        color = 1.0;
    } else {
        color = ratio;
    }*/
    /*if (height > 20.0) {
        color = 1.0;
    } else {
        color = 0.0;
    }*/
}