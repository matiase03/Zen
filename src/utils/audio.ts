/**
 * Audio Controller for Zenonia 3
 * Uses extracted authentic OGG audio from the APK with WebAudio fallback
 */

class SoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private volume: number = 0.7;
  private isMuted: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public playSfx(id: string) {
    if (this.isMuted || this.volume <= 0) return;
    this.initCtx();

    // Map common events to sound files
    let soundFile = id;
    if (!id.endsWith('.ogg')) {
      const mapping: Record<string, string> = {
        menu_select: 's000.ogg',
        attack: 's001.ogg',
        slash: 's002.ogg',
        hit: 's003.ogg',
        dash: 's004.ogg',
        skill_magic: 's005.ogg',
        skill_burst: 's006.ogg',
        potion: 's007.ogg',
        monster_roar: 's008.ogg',
        levelup: 's009.ogg',
        crit_hit: 's014.ogg',
        gold: 's026.ogg',
        quest_done: 's031.ogg',
        equip: 's017.ogg',
        fairy_sparkle: 's021.ogg'
      };
      soundFile = mapping[id] || 's001.ogg';
    }

    const url = `/game_assets/audio/${soundFile}`;
    try {
      const audio = new Audio(url);
      audio.volume = this.volume;
      audio.play().catch(() => {
        // Fallback to synthetic beep if browser blocks local file or unsupported
        this.playSynthetic(soundFile);
      });
    } catch {
      this.playSynthetic(soundFile);
    }
  }

  private playSynthetic(soundFile: string) {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(this.volume * 0.15, now);

      if (soundFile.includes('001') || soundFile.includes('slash')) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (soundFile.includes('009') || soundFile.includes('level')) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.50, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
