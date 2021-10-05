#ifdef USE_MAP
    vec4 snowDirection = vec4(0.0, 1.0, 0.0, 0.0);

    vec4 n = vec4(vNormal, 0.0);
    float snowCoverage = ( ( dot( n, snowDirection ) + 1.0 ) / 2.0 );
    snowCoverage = 1.0 - snowCoverage;

    float snowStrength = float(snowCoverage < snowAmount);

    vec4 texelColor = texture2D( map, vUv );
    texelColor = mapTexelToLinear( texelColor );
    diffuseColor *= vec4( texelColor );

    diffuseColor += vec4(vec3( snowStrength), 0.0 );

 #endif