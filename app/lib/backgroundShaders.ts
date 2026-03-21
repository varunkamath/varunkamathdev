export const starVertexShader = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aBrightness;

uniform float uTime;
uniform float uMorphPulse;

varying float vBrightness;
varying float vPhase;

void main() {
  vBrightness = aBrightness;
  vPhase = aPhase;

  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  float dist = length(mvPos.xyz);
  float pulse = 1.0 + uMorphPulse * 0.15;
  gl_PointSize = aSize * pulse * (200.0 / dist);
  gl_Position = projectionMatrix * mvPos;
}
`;

export const starFragmentShader = /* glsl */ `
uniform vec3 uBaseColor;
uniform float uTime;
uniform float uMorphPulse;

varying float vBrightness;
varying float vPhase;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float soft = 1.0 - smoothstep(0.2, 0.5, d);

  float twinkle = sin(uTime * 1.5 + vPhase) * 0.12 + 0.88;
  float pulse = 1.0 + uMorphPulse * 0.2;
  float brightness = vBrightness * twinkle * pulse;

  vec3 color = mix(vec3(1.0), uBaseColor, 0.35) * brightness;
  gl_FragColor = vec4(color, soft * brightness);
}
`;
