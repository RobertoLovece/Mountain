#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

varying vec3 vUv;
uniform vec3 color;

vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
	return a + b * cos(6.28318 * (c * t + d));
}   

void main() {

    // vec3 n = normal;

	// These values are my fav combination, 
    // they remind me of Zach Lieberman's work.
    // You can find more combos in the examples from IQ:
    // https://iquilezles.org/www/articles/palettes/palettes.htm
    // Experiment with these!
    vec3 brightness = vec3(0.85,0.45,0.3);
    vec3 contrast = vec3(0.3,0.5,0);
    vec3 oscilation = vec3(0.5,1.0,1.0);
    vec3 phase = vec3(0.2,0.25,0.25);

    vec3 palette = cosPalette(u_time, brightness, contrast, oscilation, phase);
  
    gl_FragColor = vec4(color, 1.0);

}