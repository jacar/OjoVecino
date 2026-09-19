// Web Audio API & Sound Synthesizer for OJO VECINO Radio & Intercom

class AudioRadioService {
  private ctx: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;

  public getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'suspended') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Generate tactical static noise burst (squelch)
  public playSquelchNoise(durationMs: number = 180, volume: number = 0.15): void {
    try {
      const ctx = this.getAudioContext();
      const bufferSize = Math.floor(ctx.sampleRate * (durationMs / 1000));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter to sound like walkie-talkie speaker (350Hz to 3200Hz)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1400, ctx.currentTime);
      bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      noiseSource.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
    } catch (e) {
      console.warn('Audio synthesis note:', e);
    }
  }

  // Play PTT Open / Mic Transmit Chirp
  public playPttStartBeep(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Click + rising high tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // Add a quick static pulse
      this.playSquelchNoise(70, 0.08);
    } catch (e) {
      console.warn('PTT start beep note:', e);
    }
  }

  // Play Classic Motorola / Tactical Roger Beep (when releasing PTT button)
  public playRogerBeep(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // First tone: 1050 Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1050, now);
      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.085);

      // Second tone: 1400 Hz (slightly delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1400, now + 0.085);
      gain2.gain.setValueAtTime(0.22, now + 0.085);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.085);
      osc2.stop(now + 0.19);

      // Trailing squelch release
      setTimeout(() => {
        this.playSquelchNoise(140, 0.12);
      }, 190);
    } catch (e) {
      console.warn('Roger beep note:', e);
    }
  }

  private ringtoneInterval: any = null;

  // Vantel Intercom Electronic Telephone Ring (Dual Frequencies 440Hz + 480Hz)
  public playTelephoneRing(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const playBurst = (startTime: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, startTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.setValueAtTime(0.25, startTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + 0.4);
        osc2.stop(startTime + 0.4);
      };

      // Double burst (ring-ring)
      playBurst(now);
      playBurst(now + 0.45);
    } catch (e) {
      console.warn('Telephone ring note:', e);
    }
  }

  // Start continuous telephone ringtone loop (for incoming calls)
  public startIntercomRingtoneLoop(): void {
    if (this.ringtoneInterval) return;
    this.playTelephoneRing();
    this.ringtoneInterval = setInterval(() => {
      this.playTelephoneRing();
    }, 2800);
  }

  public stopIntercomRingtoneLoop(): void {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  // Vantel Remote Door Opener Electronic Buzzer ("Bzzzzzt - Click")
  public playDoorBuzzer(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Magnetic coil AC buzz (50Hz harmonic rich waveform)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.setValueAtTime(0.35, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.98);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);

      // Release latch metallic click at the end
      setTimeout(() => {
        this.playSquelchNoise(80, 0.2);
      }, 950);
    } catch (e) {
      console.warn('Door buzzer note:', e);
    }
  }

  // Telephone Keypad DTMF Tones
  public playDtmfTone(key: string): void {
    try {
      const dtmfFrequencies: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
        'A': [697, 1633], 'B': [770, 1633], 'C': [852, 1633],
      };

      const freqs = dtmfFrequencies[key.toUpperCase()] || [770, 1336];
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freqs[0], now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freqs[1], now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.13);
      osc2.stop(now + 0.13);
    } catch (e) {
      console.warn('DTMF note:', e);
    }
  }

  // Call Connected Chime
  public playCallConnectedTone(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('Call connected tone note:', e);
    }
  }

  // Call Ended Tone (Fast busy)
  public playCallEndedTone(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.25;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
      }
    } catch (e) {
      console.warn('Call ended tone note:', e);
    }
  }

  // Intercom Citófono Doorbell Chime (Ding-Dong polyphonic chime)
  public playIntercomChime(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number, duration: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Polyphonic Ding
      playTone(660, now, 0.6, 0.25);
      playTone(880, now, 0.6, 0.15);

      // Dong
      playTone(550, now + 0.35, 0.9, 0.25);
      playTone(733, now + 0.35, 0.9, 0.15);
    } catch (e) {
      console.warn('Intercom chime note:', e);
    }
  }

  // Emergency Siren Warble (Channel 3 SOS)
  public playEmergencyAlertTone(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.25;
        osc.frequency.setValueAtTime(750, t);
        osc.frequency.setValueAtTime(950, t + 0.125);
      }

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.1);
    } catch (e) {
      console.warn('Emergency alert tone note:', e);
    }
  }

  // Start Real Microphone Recording with Analyser
  public async startRecording(
    onAudioLevel?: (level: number, waveform: Uint8Array) => void
  ): Promise<boolean> {
    try {
      this.playPttStartBeep();
      this.recordedChunks = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioStream = stream;
      const ctx = this.getAudioContext();
      const source = ctx.createMediaStreamSource(stream);

      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      if (onAudioLevel) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const checkLevel = () => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 255) * 100));
          onAudioLevel(normalized, dataArray);
          this.animationFrameId = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      }

      const options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options.mimeType = 'audio/ogg';
        }
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err) {
      console.warn('Microphone access note:', err);
      return false;
    }
  }

  // Stop Recording and convert Audio to Base64 Data URL (for universal cross-device playback)
  public async stopRecording(): Promise<{
    blob: Blob | null;
    audioUrl: string | null;
    durationSeconds: number;
  }> {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.playRogerBeep();

    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanupStream();
        resolve({ blob: null, audioUrl: null, durationSeconds: 0 });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const durationSeconds = Math.max(1, Math.round(this.recordedChunks.length * 0.1));

        // Convert Blob to Base64 Data URL so all devices/browsers can play it via Firestore
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          this.cleanupStream();
          resolve({ blob, audioUrl: base64data, durationSeconds });
        };
        reader.onerror = () => {
          this.cleanupStream();
          const fallbackUrl = URL.createObjectURL(blob);
          resolve({ blob, audioUrl: fallbackUrl, durationSeconds });
        };
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanupStream(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    this.mediaRecorder = null;
    this.analyser = null;
  }

  // Play an audio URL (e.g. from recording or voice note) with subtle radio filter
  public playAudio(url: string, onEnded?: () => void): HTMLAudioElement {
    this.playSquelchNoise(100, 0.08);
    const audio = new Audio(url);
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn('Audio auto-play note (user interaction required):', e);
      });
    }

    audio.onended = () => {
      this.playSquelchNoise(90, 0.06);
      if (onEnded) onEnded();
    };
    audio.onerror = () => {
      console.warn('Error loading audio url, playing simulated transmission beep');
      this.playSquelchNoise(250, 0.15);
      if (onEnded) onEnded();
    };

    return audio;
  }
}

export const audioRadioService = new AudioRadioService();
