'use client'
import { useEffect, useRef } from 'react'

interface LineWavesProps {
  speed?: number
  innerLineCount?: number
  outerLineCount?: number
  warpIntensity?: number
  rotation?: number
  edgeFadeWidth?: number
  colorCycleSpeed?: number
  brightness?: number
  color1?: string
  color2?: string
  color3?: string
  enableMouseInteraction?: boolean
  mouseInfluence?: number
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

const vert = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const frag = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}
float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}
float displaceA(float coord, float t) {
  float r = sin(coord * 2.123) * 0.2;
  r += sin(coord * 3.234 + t * 4.345) * 0.1;
  r += sin(coord * 0.589 + t * 0.934) * 0.5;
  return r;
}
float displaceB(float coord, float t) {
  float r = sin(coord * 1.345) * 0.3;
  r += sin(coord * 2.734 + t * 3.345) * 0.2;
  r += sin(coord * 0.189 + t * 0.934) * 0.3;
  return r;
}
vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 blended = mix(vec2(warpAx, warpAy), vec2(warpBx, warpBy), 0.5);

  float fadeTop    = smoothstep( uEdgeFadeWidth,  uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;
  float cycleT  = fullT * uColorCycleSpeed;

  float rCh = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gCh = (pattern + vMask  * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bCh = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rCh * uColor1 + gCh * uColor2 + bCh * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`

export default function LineWaves({
  speed = 0.3,
  innerLineCount = 32.0,
  outerLineCount = 36.0,
  warpIntensity = 0.5,
  rotation = -45,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 0.5,
  brightness = 0.5,
  color1 = '#03A7FF',
  color2 = '#0328FF',
  color3 = '#5B03FF',
  enableMouseInteraction = true,
  mouseInfluence = 2.0,
}: LineWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const programRef = useRef<any>(null)

  // Always keep a ref of the latest color props so the async OGL setup
  // reads whatever is current at the time it finishes loading — not stale closure values.
  const colorsRef = useRef({ color1, color2, color3, brightness, colorCycleSpeed })
  useEffect(() => {
    colorsRef.current = { color1, color2, color3, brightness, colorCycleSpeed }
  }, [color1, color2, color3, brightness, colorCycleSpeed])

  // Main setup — runs once
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animId: number
    let cleanupFn: (() => void) | undefined

    import('ogl').then(({ Renderer, Program, Mesh, Triangle }) => {
      if (!containerRef.current) return

      const renderer = new Renderer({ alpha: true, premultipliedAlpha: false })
      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)

      const cvs = gl.canvas as HTMLCanvasElement
      cvs.style.position = 'absolute'
      cvs.style.top = '0'
      cvs.style.left = '0'
      cvs.style.width = '100%'
      cvs.style.height = '100%'
      container.appendChild(cvs)

      let currentMouse = [0.5, 0.5]
      let targetMouse = [0.5, 0.5]

      const onMouseMove = (e: MouseEvent) => {
        const rect = cvs.getBoundingClientRect()
        targetMouse = [
          (e.clientX - rect.left) / rect.width,
          1.0 - (e.clientY - rect.top) / rect.height,
        ]
      }
      const onMouseLeave = () => { targetMouse = [0.5, 0.5] }

      const rotRad = (rotation * Math.PI) / 180
      const geometry = new Triangle(gl)

      // Read from colorsRef so we always get the latest values even if
      // props changed while OGL was loading asynchronously
      const c = colorsRef.current

      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms: {
          uTime:            { value: 0 },
          uResolution:      { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
          uSpeed:           { value: speed },
          uInnerLines:      { value: innerLineCount },
          uOuterLines:      { value: outerLineCount },
          uWarpIntensity:   { value: warpIntensity },
          uRotation:        { value: rotRad },
          uEdgeFadeWidth:   { value: edgeFadeWidth },
          uColorCycleSpeed: { value: c.colorCycleSpeed },
          uBrightness:      { value: c.brightness },
          uColor1:          { value: hexToVec3(c.color1) },
          uColor2:          { value: hexToVec3(c.color2) },
          uColor3:          { value: hexToVec3(c.color3) },
          uMouse:           { value: new Float32Array([0.5, 0.5]) },
          uMouseInfluence:  { value: mouseInfluence },
          uEnableMouse:     { value: enableMouseInteraction },
        },
      })

      programRef.current = program

      const mesh = new Mesh(gl, { geometry, program })

      const resize = () => {
        if (!containerRef.current) return
        renderer.setSize(containerRef.current.offsetWidth, containerRef.current.offsetHeight)
        program.uniforms.uResolution.value = [
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        ]
      }

      window.addEventListener('resize', resize)
      if (enableMouseInteraction) {
        cvs.addEventListener('mousemove', onMouseMove)
        cvs.addEventListener('mouseleave', onMouseLeave)
      }
      resize()

      const update = (time: number) => {
        animId = requestAnimationFrame(update)
        program.uniforms.uTime.value = time * 0.001
        if (enableMouseInteraction) {
          currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0])
          currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1])
          program.uniforms.uMouse.value[0] = currentMouse[0]
          program.uniforms.uMouse.value[1] = currentMouse[1]
        }
        renderer.render({ scene: mesh })
      }
      animId = requestAnimationFrame(update)

      cleanupFn = () => {
        programRef.current = null
        cancelAnimationFrame(animId)
        window.removeEventListener('resize', resize)
        if (enableMouseInteraction) {
          cvs.removeEventListener('mousemove', onMouseMove)
          cvs.removeEventListener('mouseleave', onMouseLeave)
        }
        if (container.contains(cvs)) container.removeChild(cvs)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    })

    return () => { cleanupFn?.() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync effect — patches uniforms live when color props change after mount
  useEffect(() => {
    const p = programRef.current
    if (!p) return
    p.uniforms.uColor1.value = hexToVec3(color1)
    p.uniforms.uColor2.value = hexToVec3(color2)
    p.uniforms.uColor3.value = hexToVec3(color3)
    p.uniforms.uBrightness.value = brightness
    p.uniforms.uColorCycleSpeed.value = colorCycleSpeed
  }, [color1, color2, color3, brightness, colorCycleSpeed])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
}