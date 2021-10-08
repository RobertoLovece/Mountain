#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

varying vec3 vUv;
uniform vec3 color;
varying float vRand; 

void main() {

    float rand = vRand;

    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
    if (dot(circCoord, circCoord) > rand / 3. ) { // could use fixed value or try something along the lines of rand / 2.
        discard;
    }

    gl_FragColor = vec4( rand ); // vrand w component

}