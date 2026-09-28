// Web Audio API sound effects - no external files needed

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export function playClickSound() {
  playTone(800, 0.05, 'sine', 0.1);
}

export function playAddToCartSound() {
  playTone(523, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 50);
}

export function playRemoveFromCartSound() {
  playTone(400, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(300, 0.15, 'sine', 0.15), 50);
}

export function playOrderPlacedSound() {
  playTone(523, 0.15, 'sine', 0.3);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
}

export function playSyncSuccessSound() {
  playTone(880, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.2), 80);
}

export function playSyncErrorSound() {
  playTone(200, 0.3, 'sawtooth', 0.15);
}

export function playNotificationSound() {
  playTone(660, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.25), 100);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.25), 200);
}

export function resumeAudioContext() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}
