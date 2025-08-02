varying float vWobble;

uniform vec3 uMainColor;
uniform vec3 uSecondColor;

void main() {
    float colorMix = smoothstep(-1.0, 1.0, vWobble);
    csm_DiffuseColor.rgb = mix(uMainColor, uSecondColor, colorMix);

    // Shinny tip
    csm_Roughness = 1.0 - colorMix;
}
