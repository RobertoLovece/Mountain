#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

varying vec3 vUv;
uniform vec3 color;

void main() {
  
    gl_FragColor=vec4(color, 1.0);

}