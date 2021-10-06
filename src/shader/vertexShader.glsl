
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
        vec2(12.9898,78.233)))*
    43758.5453123); //43758.5453123
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {

    vec2 i = floor(st);
    vec2 f = fract(st);
            
    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
            
    vec2 u = f * f * (vec2(3.0) - 2.0 * f);
            
    return mix(a, b, u.x) +
                        (c - a)* u.y * (1.0 - u.x) +
                        (d - b) * u.x * u.y;
}
            
#define OCTAVES 10
float fbm (in vec2 st) {
	// Initial values
            
	float value = 0.0;	
	float amplitude = .5;
	float frequency = 1.;
            
	// Loop of octaves
	for (int i = 0; i < OCTAVES; i++) {	
		value += amplitude * abs(noise(st));
    	st *= 2.;
    	amplitude *= .5;
	}
            
	return value;
}  
            
// the function which defines the displacement
float displace(vec3 point) {
    return fbm(point.xy);
}

vec3 orthogonal(vec3 v) {
	return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
}
            
void main() {
    vec3 displacedPosition = vec3(position.x, position.y, displace(position));

    float offset = size / resolution;
	vec3 tangent = orthogonal(normal);
    vec3 bitangent = normalize(cross(normal, tangent));
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;
    vec3 displacedNeighbour1 = vec3(neighbour1.xy, displace(neighbour1));
    vec3 displacedNeighbour2 = vec3(neighbour2.xy, displace(neighbour2));
          
    // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
    vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
    vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
          
    // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
    vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
            