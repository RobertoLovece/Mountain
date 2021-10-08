#ifdef USE_MAP
    // make snow direction camera position?
    vec4 snowDirection = vec4(0.0, 1.0, 0.0, 0.0);

    vec4 n = vec4(vNormal, 0.0);
    float snowThreshold = ( ( dot( n, snowDirection ) + 1.0 ) / 2.0 );
    snowThreshold = 1.0 - snowThreshold;

    float snowStrength = float(snowThreshold < snowCoverage);

    vec4 texelColor = texture2D( map, vUv );
    // texelColor = (mapTexelToLinear( texelColor ) * ( 1.0 - snowStrength ));
    texelColor = (mapTexelToLinear( texelColor ));
    diffuseColor *= vec4( texelColor );

    vec4 snowColor = texture2D( snowTexture, vUv );
    snowColor = mapTexelToLinear( snowColor ) * snowStrength;

    diffuseColor += snowColor;

 #endif