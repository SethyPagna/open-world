/**
 * One post-processing composer for the whole game (pmndrs `postprocessing`, HalfFloat buffers).
 *
 *   RenderPass
 *   [DoF]            lazy, only while a look asks for depth of field
 *   [Glitch]         only while a look or pulse wants it
 *   Grade            Bloom (mipmap) -> exposure*tint -> AgX -> saturation -> contrast -> flash
 *   [Chromatic]      only while an offset is visible
 *   Final            SMAA -> vignette -> film grain (always on; renders to screen)
 *
 * Scenes pick a look (`setLook`, numeric params blend smoothly); gameplay fires `pulse`s.
 * DoF note: `focalLength` in a PostLook is the in-focus RANGE in metres around `focusDistance`.
 */
import * as THREE from 'three';
import {
  BlendFunction, BloomEffect, BrightnessContrastEffect, ChromaticAberrationEffect, DepthOfFieldEffect, EdgeDetectionMode,
  Effect, EffectComposer, EffectPass, GlitchEffect, GlitchMode, HueSaturationEffect, NoiseEffect, RenderPass, SMAAEffect,
  SMAAPreset, ToneMappingEffect, ToneMappingMode, VignetteEffect,
} from 'postprocessing';
import type { PostApi, PostLook } from './api.ts';

export const DEFAULT_LOOK: Readonly<PostLook> = {
  bloom: { intensity: 1.0, threshold: 0.78, smoothing: 0.22, radius: 0.72 },
  vignette: 0.45,
  chromatic: 0.0005,
  noise: 0.045,
  saturation: 0.08,
  contrast: 0.08,
  exposure: 1,
  tint: '#ffffff',
  glitch: false,
  depthOfField: null,
};

/** Named looks. World layers ("frog in a well"): well -> sky -> space -> beyond; plus room moods. */
export const POST_LOOKS: Readonly<Record<string, PostLook>> = {
  default: DEFAULT_LOOK,
  /** Damp stone shaft, cold moonlight from far above. */
  well: { bloom: { intensity: 0.95, threshold: 0.72, smoothing: 0.25, radius: 0.75 }, vignette: 0.58, chromatic: 0.0006, noise: 0.055, saturation: -0.04, contrast: 0.12, exposure: 1, tint: '#e4ecff' },
  /** Open air, sun-warm, airy. */
  sky: { bloom: { intensity: 1.05, threshold: 0.82, smoothing: 0.3, radius: 0.8 }, vignette: 0.26, chromatic: 0.0003, noise: 0.025, saturation: 0.14, contrast: 0.03, exposure: 1.08, tint: '#fff6ea' },
  /** Deep space: hot highlights, rich blacks. */
  space: { bloom: { intensity: 1.45, threshold: 0.5, smoothing: 0.2, radius: 0.85 }, vignette: 0.6, chromatic: 0.0012, noise: 0.06, saturation: 0.16, contrast: 0.14, exposure: 0.96, tint: '#e9e4ff' },
  /** Surreal outer ring. */
  beyond: { bloom: { intensity: 1.7, threshold: 0.42, smoothing: 0.25, radius: 0.9 }, vignette: 0.5, chromatic: 0.002, noise: 0.05, saturation: 0.3, contrast: 0.1, exposure: 1.02, tint: '#ffe8f6' },
  /** Rooms: tense, dark, lit only by the players (GDD pillar 5). */
  dread: { bloom: { intensity: 1.15, threshold: 0.62, smoothing: 0.2, radius: 0.7 }, vignette: 0.72, chromatic: 0.0008, noise: 0.07, saturation: -0.14, contrast: 0.16, exposure: 0.95, tint: '#e6ebff' },
  /** The Landing between floors: the waltz. Warm and generous. */
  landing: { bloom: { intensity: 1.1, threshold: 0.7, smoothing: 0.3, radius: 0.78 }, vignette: 0.4, chromatic: 0.0004, noise: 0.035, saturation: 0.16, contrast: 0.06, exposure: 1.04, tint: '#fff1de' },
  /** E rooms: glitched, volatile, lonely. */
  enigma: { bloom: { intensity: 1.25, threshold: 0.6, smoothing: 0.2, radius: 0.8 }, vignette: 0.62, chromatic: 0.0028, noise: 0.09, saturation: 0.04, contrast: 0.12, exposure: 0.98, tint: '#efe6ff', glitch: true },
  /** Floor 5: white-gold. */
  crown: { bloom: { intensity: 1.5, threshold: 0.58, smoothing: 0.25, radius: 0.85 }, vignette: 0.5, chromatic: 0.0008, noise: 0.04, saturation: 0.06, contrast: 0.1, exposure: 1.04, tint: '#fff4d6' },
  /** Menus / wardrobe mirror: shallow focus. */
  dream: { bloom: { intensity: 1.2, threshold: 0.7, smoothing: 0.3, radius: 0.85 }, vignette: 0.5, chromatic: 0.0008, noise: 0.04, saturation: 0.1, contrast: 0.05, exposure: 1.02, tint: '#fff8f0', depthOfField: { focusDistance: 11, focalLength: 3.5, bokehScale: 3 } },
};

// Numeric parameter slots (blended together).
const P = {
  bloomIntensity: 0, bloomThreshold: 1, bloomSmoothing: 2, bloomRadius: 3, vignette: 4, chromatic: 5, noise: 6,
  saturation: 7, contrast: 8, exposure: 9, tintR: 10, tintG: 11, tintB: 12, dofFocus: 13, dofRange: 14, dofBokeh: 15,
} as const;
const N = 16;

const GRADE_IN = /* glsl */ `
uniform float exposure;
uniform vec3 tint;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(inputColor.rgb * tint * exposure, inputColor.a);
}`;
const GRADE_OUT = /* glsl */ `
uniform vec3 flash;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(inputColor.rgb + flash, inputColor.a);
}`;

class GradeInEffect extends Effect {
  constructor() {
    super('GradeInEffect', GRADE_IN, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, THREE.Uniform>([
        ['exposure', new THREE.Uniform(1)],
        ['tint', new THREE.Uniform(new THREE.Vector3(1, 1, 1))],
      ]),
    });
  }
}
class GradeOutEffect extends Effect {
  constructor() {
    super('GradeOutEffect', GRADE_OUT, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, THREE.Uniform>([['flash', new THREE.Uniform(new THREE.Vector3())]]),
    });
  }
}

const _c = new THREE.Color();

export class PostStack implements PostApi {
  readonly composer: EffectComposer;
  /** Name of the last look set by name (debug). */
  lookName = 'default';

  private readonly renderer: THREE.WebGLRenderer;
  private readonly renderPass: RenderPass;
  private readonly bloom: BloomEffect;
  private readonly gradeIn: GradeInEffect;
  private readonly hueSat: HueSaturationEffect;
  private readonly bc: BrightnessContrastEffect;
  private readonly gradeOut: GradeOutEffect;
  private readonly vignette: VignetteEffect;
  private readonly noise: NoiseEffect;
  private readonly ca: ChromaticAberrationEffect;
  private readonly glitch: GlitchEffect;
  private readonly glitchPass: EffectPass;
  private readonly caPass: EffectPass;
  private dof: DepthOfFieldEffect | null = null;
  private dofPass: EffectPass | null = null;
  private scene: THREE.Scene;
  private camera: THREE.Camera;

  private readonly cur = new Float32Array(N);
  private readonly from = new Float32Array(N);
  private readonly to = new Float32Array(N);
  private readonly applied = new Float32Array(N).fill(Number.NaN);
  private blendT = 0;
  private blendDur = 0;
  private glitchLook = false;
  private dofWanted = false;

  private flashPeak = 0;
  private flashT = 0;
  private flashDur = 0;
  private readonly flashColor = new THREE.Color(1, 0.96, 0.9);
  private chromaPeak = 0;
  private chromaT = 0;
  private chromaDur = 0;
  private glitchPulseLeft = 0;
  private appliedFlash = -1;
  private appliedChroma = -1;

  constructor(renderer: THREE.WebGLRenderer, opts: { smaa?: boolean } = {}) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: false, multisampling: 0 });

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloom = new BloomEffect({ mipmapBlur: true, intensity: 1, luminanceThreshold: 0.8, luminanceSmoothing: 0.2, radius: 0.72, levels: 8 });
    this.gradeIn = new GradeInEffect();
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.AGX });
    this.hueSat = new HueSaturationEffect({ saturation: 0 });
    this.bc = new BrightnessContrastEffect({ brightness: 0, contrast: 0 });
    this.gradeOut = new GradeOutEffect();
    this.vignette = new VignetteEffect({ offset: 0.32, darkness: 0.45 });
    this.noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false });
    this.ca = new ChromaticAberrationEffect({ offset: new THREE.Vector2(), radialModulation: true, modulationOffset: 0.2 });
    this.glitch = new GlitchEffect({ delay: new THREE.Vector2(1.2, 3.2), duration: new THREE.Vector2(0.08, 0.3), strength: new THREE.Vector2(0.08, 0.35), columns: 0.035, ratio: 0.9 });
    this.glitch.mode = GlitchMode.DISABLED;

    this.glitchPass = new EffectPass(this.camera, this.glitch);
    const gradePass = new EffectPass(this.camera, this.bloom, this.gradeIn, tone, this.hueSat, this.bc, this.gradeOut);
    this.caPass = new EffectPass(this.camera, this.ca);
    const finalEffects: Effect[] = [];
    if (opts.smaa !== false) finalEffects.push(new SMAAEffect({ preset: SMAAPreset.HIGH, edgeDetectionMode: EdgeDetectionMode.COLOR }));
    finalEffects.push(this.vignette, this.noise);
    const finalPass = new EffectPass(this.camera, ...finalEffects);

    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.glitchPass);
    this.composer.addPass(gradePass);
    this.composer.addPass(this.caPass);
    this.composer.addPass(finalPass);

    this.resolveLook(DEFAULT_LOOK, this.cur);
    this.from.set(this.cur);
    this.to.set(this.cur);
    this.applyAll();
  }

  setScene(scene: THREE.Scene, camera: THREE.Camera): void {
    this.scene = scene;
    this.camera = camera;
    this.composer.setMainScene(scene);
    this.composer.setMainCamera(camera);
  }

  setLook(look: PostLook, blendSeconds = 0.6): void {
    this.from.set(this.cur);
    this.resolveLook(look, this.to);
    this.glitchLook = !!look.glitch;
    if (look.depthOfField) {
      const wasOn = this.dofWanted || (this.dofPass?.enabled ?? false);
      this.ensureDof();
      this.dofWanted = true;
      if (!wasOn) {
        this.from[P.dofFocus] = this.to[P.dofFocus];
        this.from[P.dofRange] = this.to[P.dofRange];
        this.from[P.dofBokeh] = 0;
        this.cur[P.dofBokeh] = 0;
      }
    } else {
      this.dofWanted = false;
      this.to[P.dofFocus] = this.cur[P.dofFocus];
      this.to[P.dofRange] = this.cur[P.dofRange];
      this.to[P.dofBokeh] = 0;
    }
    this.blendT = 0;
    this.blendDur = Math.max(0, blendSeconds);
    if (this.blendDur === 0) this.cur.set(this.to);
  }

  /** Set a look from POST_LOOKS by name. */
  setLookByName(name: string, blendSeconds = 0.6): void {
    const look = POST_LOOKS[name];
    if (!look) throw new Error(`Unknown post look "${name}"`);
    this.lookName = name;
    this.setLook(look, blendSeconds);
  }

  pulse(kind: 'flash' | 'chromatic' | 'glitch', strength = 1, seconds?: number): void {
    if (kind === 'flash') {
      this.flash(undefined, strength, seconds ?? 0.22);
    } else if (kind === 'chromatic') {
      this.startChroma(0.006 * strength, seconds ?? 0.35);
    } else {
      this.glitchPulseLeft = Math.max(this.glitchPulseLeft, seconds ?? 0.3);
      this.startChroma(0.004 * strength, (seconds ?? 0.3) + 0.1);
    }
  }

  /** Coloured full-screen flash (added after tone mapping). */
  flash(color?: string, strength = 1, seconds = 0.22): void {
    const current = this.flashEnvelope() * this.flashPeak;
    if (current > strength) return;
    this.flashColor.set(color ?? '#fff5e6');
    this.flashPeak = strength;
    this.flashT = 0;
    this.flashDur = Math.max(0.02, seconds);
  }

  render(dt: number): void {
    const d = Math.max(0, dt);
    if (this.blendT < this.blendDur) {
      this.blendT = Math.min(this.blendDur, this.blendT + d);
      const x = this.blendT / this.blendDur;
      const k = x * x * (3 - 2 * x);
      for (let i = 0; i < N; i++) this.cur[i] = this.from[i] + (this.to[i] - this.from[i]) * k;
    }
    this.flashT += d;
    this.chromaT += d;
    this.glitchPulseLeft = Math.max(0, this.glitchPulseLeft - d);
    this.applyAll();
    this.composer.render(d);
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height, false);
  }

  /** Compile every optional pass once so the first glitch/chromatic pulse does not hitch. */
  warmup(): void {
    const g = this.glitchPass.enabled, c = this.caPass.enabled;
    this.glitchPass.enabled = true;
    this.caPass.enabled = true;
    if (this.dofPass) this.dofPass.enabled = true;
    try {
      this.composer.render(0);
    } finally {
      this.glitchPass.enabled = g;
      this.caPass.enabled = c;
      this.applyAll();
    }
  }

  /** Current resolved numeric state (debug / tests). */
  snapshot(): Record<string, number | boolean> {
    const out: Record<string, number | boolean> = {};
    for (const [k, i] of Object.entries(P)) out[k] = Math.round(this.cur[i] * 10000) / 10000;
    out.glitch = this.glitchPass.enabled;
    out.chromaticPass = this.caPass.enabled;
    out.dof = this.dofPass?.enabled ?? false;
    out.flash = Math.round(this.flashEnvelope() * this.flashPeak * 1000) / 1000;
    out.blending = this.blendT < this.blendDur;
    return out;
  }

  dispose(): void {
    this.composer.dispose();
  }

  // --- internals -------------------------------------------------------------------------------
  private resolveLook(look: PostLook, out: Float32Array): void {
    const d = DEFAULT_LOOK;
    const b = look.bloom ?? d.bloom!;
    out[P.bloomIntensity] = b.intensity;
    out[P.bloomThreshold] = b.threshold;
    out[P.bloomSmoothing] = b.smoothing ?? d.bloom!.smoothing!;
    out[P.bloomRadius] = b.radius ?? d.bloom!.radius!;
    out[P.vignette] = look.vignette ?? d.vignette!;
    out[P.chromatic] = look.chromatic ?? d.chromatic!;
    out[P.noise] = look.noise ?? d.noise!;
    out[P.saturation] = look.saturation ?? d.saturation!;
    out[P.contrast] = look.contrast ?? d.contrast!;
    out[P.exposure] = look.exposure ?? d.exposure!;
    _c.set(look.tint ?? d.tint!); // linear working space
    out[P.tintR] = _c.r;
    out[P.tintG] = _c.g;
    out[P.tintB] = _c.b;
    const dof = look.depthOfField;
    out[P.dofFocus] = dof ? dof.focusDistance : this.cur[P.dofFocus] || 10;
    out[P.dofRange] = dof ? dof.focalLength : this.cur[P.dofRange] || 3;
    out[P.dofBokeh] = dof ? dof.bokehScale : 0;
  }

  private ensureDof(): void {
    if (this.dofPass) return;
    this.dof = new DepthOfFieldEffect(this.camera, { focusDistance: 10, focusRange: 3, bokehScale: 0, resolutionScale: 0.5 });
    this.dofPass = new EffectPass(this.camera, this.dof);
    this.composer.addPass(this.dofPass, 1); // right after the RenderPass
    this.dofPass.mainScene = this.scene;
    this.dofPass.mainCamera = this.camera;
  }

  private flashEnvelope(): number {
    if (this.flashDur <= 0 || this.flashT >= this.flashDur) return 0;
    const x = 1 - this.flashT / this.flashDur;
    return x * x;
  }

  private startChroma(peak: number, seconds: number): void {
    const cur = this.chromaEnvelope() * this.chromaPeak;
    if (cur > peak) return;
    this.chromaPeak = peak;
    this.chromaT = 0;
    this.chromaDur = Math.max(0.02, seconds);
  }

  private chromaEnvelope(): number {
    if (this.chromaDur <= 0 || this.chromaT >= this.chromaDur) return 0;
    const x = 1 - this.chromaT / this.chromaDur;
    return x * x;
  }

  /** True (and remembered) when slot `i` differs from what the effects last received. */
  private changed(i: number): boolean {
    const v = this.cur[i];
    if (this.applied[i] === v) return false;
    this.applied[i] = v;
    return true;
  }

  private applyAll(): void {
    const c = this.cur;
    if (this.changed(P.bloomIntensity)) this.bloom.intensity = c[P.bloomIntensity];
    if (this.changed(P.bloomThreshold)) this.bloom.luminanceMaterial.threshold = c[P.bloomThreshold];
    if (this.changed(P.bloomSmoothing)) this.bloom.luminanceMaterial.smoothing = c[P.bloomSmoothing];
    if (this.changed(P.bloomRadius)) this.bloom.mipmapBlurPass.radius = c[P.bloomRadius];
    if (this.changed(P.vignette)) this.vignette.darkness = c[P.vignette];
    if (this.changed(P.noise)) this.noise.blendMode.opacity.value = c[P.noise];
    if (this.changed(P.saturation)) this.hueSat.saturation = c[P.saturation];
    if (this.changed(P.contrast)) this.bc.contrast = c[P.contrast];
    if (this.changed(P.exposure)) this.gradeIn.uniforms.get('exposure')!.value = c[P.exposure];
    const tint = this.gradeIn.uniforms.get('tint')!.value as THREE.Vector3;
    tint.set(c[P.tintR], c[P.tintG], c[P.tintB]);

    const chroma = c[P.chromatic] + this.chromaPeak * this.chromaEnvelope();
    if (chroma !== this.appliedChroma) {
      this.appliedChroma = chroma;
      this.ca.offset.set(chroma, chroma * 0.6);
    }
    this.caPass.enabled = chroma > 0.00005;

    const flash = this.flashPeak * this.flashEnvelope();
    if (flash !== this.appliedFlash) {
      this.appliedFlash = flash;
      const f = this.gradeOut.uniforms.get('flash')!.value as THREE.Vector3;
      f.set(this.flashColor.r * flash, this.flashColor.g * flash, this.flashColor.b * flash);
    }

    const glitchOn = this.glitchLook || this.glitchPulseLeft > 0;
    this.glitchPass.enabled = glitchOn;
    this.glitch.mode = this.glitchPulseLeft > 0 ? GlitchMode.CONSTANT_WILD : this.glitchLook ? GlitchMode.SPORADIC : GlitchMode.DISABLED;

    if (this.dof && this.dofPass) {
      const bokeh = c[P.dofBokeh];
      this.dofPass.enabled = this.dofWanted || bokeh > 0.01;
      if (this.dofPass.enabled) {
        if (this.changed(P.dofBokeh)) this.dof.bokehScale = c[P.dofBokeh];
        if (this.changed(P.dofFocus)) this.dof.cocMaterial.focusDistance = c[P.dofFocus];
        if (this.changed(P.dofRange)) this.dof.cocMaterial.focusRange = c[P.dofRange];
      }
    }
  }
}
