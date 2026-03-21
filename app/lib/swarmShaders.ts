export const swarmVertexShader = /* glsl */ `
varying vec3 vColor;
varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  vColor = instanceColor;
  vec4 instancePos = instanceMatrix * vec4(position, 1.0);
  vec4 worldPos = modelMatrix * instancePos;
  vWorldPos = worldPos.xyz;
  vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * instancePos;
}
`;

export const swarmFragmentShader = /* glsl */ `
uniform vec3 uBaseColor;
uniform float uTime;

varying vec3 vColor;
varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);

  float depth = length(cameraPosition - vWorldPos);
  float depthFade = smoothstep(25.0, 8.0, depth);

  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);

  vec3 color = vColor * (0.5 + depthFade * 0.5);
  color += fresnel * uBaseColor * 0.4;

  float alpha = 0.4 + depthFade * 0.6;

  gl_FragColor = vec4(color, alpha);
}
`;
