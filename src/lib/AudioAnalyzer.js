/**
 * AudioAnalyzer streams user microphone input and processes real-time frequency analysis.
 */
export default class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.stream = null;
    this.active = false;
  }

  /**
   * Prompts the user for microphone access and starts analyzing
   */
  async start() {
    if (this.active) {
      return;
    }

    try {
      // 1. Prompt for mic stream
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Initialize AudioContext and AnalyserNode
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // 3. Connect the source
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      
      // 4. Create internal buffer for byte frequency levels
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.active = true;
    } catch (err) {
      console.warn("Unable to capture microphone stream for visualizer context:", err);
      this.active = false;
    }
  }

  /**
   * Tears down microphone connection and cleans up Web Audio nodes
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.active = false;
  }

  /**
   * Computes the normalized average volume of the first 10 frequency bins (Bass range)
   * 
   * @returns {number} Normalized bass energy level from 0.0 to 1.0
   */
  getBassEnergy() {
    if (!this.active || !this.analyser || !this.dataArray) {
      return 0.0;
    }
    
    // Fetch frequency levels
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume of the first 10 bins
    let sum = 0;
    const count = Math.min(10, this.dataArray.length);
    
    for (let i = 0; i < count; i++) {
      sum += this.dataArray[i];
    }
    
    // Values range from 0 (silence) to 255 (maximum volume)
    return count > 0 ? (sum / count) / 255 : 0.0;
  }
}
