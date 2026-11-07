/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Emergency Siren and Kentongan Synthesizer
let audioCtx: AudioContext | null = null;
let sirenOsc: OscillatorNode | null = null;
let lfoOsc: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let kentonganInterval: number | null = null;
let isSirenActive = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a single realistic Kentongan (traditional wooden slit drum) hit
 */
export function playKentonganHit(frequency = 580, pitchDecay = 0.12): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.45, ctx.currentTime + pitchDecay);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, ctx.currentTime);
    filter.Q.setValueAtTime(4, ctx.currentTime);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + pitchDecay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + pitchDecay);
  } catch (err) {
    console.warn('Kentongan audio error:', err);
  }
}

/**
 * Start high-decibel emergency siren loop + kentongan emergency pattern
 */
export function startEmergencySiren(): void {
  if (isSirenActive) return;
  try {
    const ctx = getAudioContext();

    // 1. Dual-tone swept siren oscillator
    sirenOsc = ctx.createOscillator();
    lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    sirenGain = ctx.createGain();

    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.setValueAtTime(900, ctx.currentTime);

    // LFO sweeps siren frequency between ~700 Hz and 1300 Hz
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(1.8, ctx.currentTime); // 1.8 sweeps per second
    lfoGain.gain.setValueAtTime(350, ctx.currentTime);

    lfoOsc.connect(lfoGain);
    lfoGain.connect(sirenOsc.frequency);

    sirenGain.gain.setValueAtTime(0.65, ctx.currentTime);

    sirenOsc.connect(sirenGain);
    sirenGain.connect(ctx.destination);

    sirenOsc.start();
    lfoOsc.start();
    isSirenActive = true;

    // 2. Play urgent double kentongan strike every 600ms
    kentonganInterval = window.setInterval(() => {
      playKentonganHit(620, 0.1);
      setTimeout(() => playKentonganHit(750, 0.08), 90);
    }, 600);
  } catch (err) {
    console.warn('Could not start emergency siren:', err);
  }
}

/**
 * Stop emergency siren immediately
 */
export function stopEmergencySiren(): void {
  try {
    if (sirenOsc) {
      sirenOsc.stop();
      sirenOsc.disconnect();
      sirenOsc = null;
    }
    if (lfoOsc) {
      lfoOsc.stop();
      lfoOsc.disconnect();
      lfoOsc = null;
    }
    if (sirenGain) {
      sirenGain.disconnect();
      sirenGain = null;
    }
    if (kentonganInterval !== null) {
      clearInterval(kentonganInterval);
      kentonganInterval = null;
    }
    isSirenActive = false;
  } catch (err) {
    console.warn('Error stopping siren:', err);
  }
}

export function isEmergencySirenRunning(): boolean {
  return isSirenActive;
}

/**
 * Play a notification chime when a new message or announcement arrives
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn('Chime sound error:', err);
  }
}

/**
 * Microphone Voice Note Recorder helper
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;
  private timerInterval: number | null = null;

  async start(onTick?: (seconds: number) => void): Promise<boolean> {
    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.startTime = Date.now();
      if (onTick) {
        this.timerInterval = window.setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          onTick(elapsed);
        }, 500);
      }

      this.mediaRecorder.start(250);
      return true;
    } catch (err) {
      console.warn('Microphone access failed:', err);
      return false;
    }
  }

  stop(): Promise<{ audioUrl: string; duration: number } | null> {
    return new Promise((resolve) => {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            resolve({ audioUrl: base64Audio, duration });
          };
          reader.readAsDataURL(blob);

          // Stop all audio tracks
          this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
        } catch (e) {
          console.warn('Error reading audio blob:', e);
          resolve(null);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    this.audioChunks = [];
  }
}
