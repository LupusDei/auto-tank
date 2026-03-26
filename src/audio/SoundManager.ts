/** Wrapper around Web Audio API for game sounds. */
export class SoundManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _volume = 1;
  private _muted = false;
  private _initialized = false;

  /** Initialize the audio context. Must be called after user interaction. */
  initialize(): void {
    if (this._initialized) return;
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = this._volume;
    this._initialized = true;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this._muted) {
      this.masterGain.gain.value = this._volume;
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  set muted(value: boolean) {
    this._muted = value;
    if (this.masterGain) {
      this.masterGain.gain.value = value ? 0 : this._volume;
    }
  }

  /** Get the audio context (for custom audio nodes). */
  getContext(): AudioContext | null {
    return this.context;
  }

  /** Get the master gain node (for connecting sources). */
  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  /** Play a simple tone (for testing / placeholder sounds). */
  playTone(frequency: number, duration: number): void {
    if (!this.context || !this.masterGain) return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }

  /** Suspend audio context. */
  suspend(): void {
    void this.context?.suspend();
  }

  /** Resume audio context. */
  resume(): void {
    void this.context?.resume();
  }
}
