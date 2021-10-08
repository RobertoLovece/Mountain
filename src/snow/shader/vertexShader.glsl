varying vec3 vUv;
uniform float u_time;
uniform float size_multiplier;

attribute float rands;

varying float vRand;

void main() {

    vec3 p = vec3(position.xyz);
    vRand = fract(rands); // could use another random value to stop patterns between size and shape or colour emerging

    vec4 modelViewPosition = modelViewMatrix * vec4( p, 1.0 );

    gl_PointSize = rands * size_multiplier;
    gl_Position = ( projectionMatrix * modelViewPosition );
}