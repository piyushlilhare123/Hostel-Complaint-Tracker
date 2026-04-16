export const playLongBeep = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
        
        oscillator.start(audioCtx.currentTime);
        // Quick pulses for a bell alarm sequence
        for (let i = 0.2; i < 1.5; i += 0.2) {
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + i);
            gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + i + 0.1);
        }
        
        oscillator.stop(audioCtx.currentTime + 2.0);
    } catch (e) {
        console.warn('Long audio playback failed:', e);
    }
};

export const playBeep = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        
        // Envelope to make a sharp "ping/beep" sound
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.warn('Audio playback failed or blocked:', e);
    }
};
