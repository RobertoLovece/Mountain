export const SIZE = 3.0;
export const HEIGHT = 2.5;
// offset to size in x and z so snow disapears outside of plane
export const OFFSETX = 0.0;
export const OFFSETZ = 0.0;
export const RESOLUTIONX = 256 * 2.0;
export const RESOLUTIONZ = 256 * 2.0;

export const FOGPARAMS = {
    fogNearColor: 0xF8F8FF ,
    fogHorizonColor: 0xD3D3D3 ,
    fogDensity: 0.6,
    fogNoiseSpeed: 100,
    fogNoiseFreq: .0024,
    fogNoiseImpact: .5
};

export const MOUNTAINROUGHNESS = 0.7;

export const SNOW = {
    snowCoverage: 0.4,
    numberOfParticles: 3000,
    snowSize: 1.8,
};
