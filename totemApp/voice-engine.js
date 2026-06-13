// voice-engine.js — síntesis de voz nativa (Web Speech API) para Vera.
// API: window.VoiceEngine.speak(text, options) / .stop()
window.VoiceEngine = {
  speak(text, options = {}) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = options.lang || 'es-AR';
    utt.rate = options.rate || 0.92;
    utt.pitch = options.pitch || 1.05;
    utt.volume = options.volume || 1;
    const voices = window.speechSynthesis.getVoices();
    const femVoice = voices.find(v =>
      v.lang.startsWith('es') && v.name.toLowerCase().includes('female')
    ) || voices.find(v => v.lang.startsWith('es'));
    if (femVoice) utt.voice = femVoice;
    if (options.onStart) utt.onstart = options.onStart;
    if (options.onEnd) utt.onend = options.onEnd;
    window.speechSynthesis.speak(utt);
  },
  stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  },
  // Reconocimiento de voz nativo (Web Speech API). El browser pide el permiso
  // de micrófono automáticamente al llamar rec.start(); no hay setup extra.
  listen(onResult, onError) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onError?.('not-supported'); return; }
    const rec = new SR();
    rec.lang = 'es-AR';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const transcripts = Array.from(e.results[0]).map(r => r.transcript.toLowerCase().trim());
      onResult(transcripts);
    };
    rec.onerror = (e) => onError?.(e.error);
    rec.onend = () => {};
    rec.start();
    return rec;
  },
  // Matchea los transcripts (alternativas del reconocedor) contra el FAQ.
  // faqItems: array de { q, a, keywords? }. Tokeniza y cuenta hits sobre q + keywords.
  matchFaq(transcripts, faqItems) {
    const normalize = s => s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ');

    let best = null;
    let bestScore = 0;

    for (const item of faqItems) {
      const haystack = normalize(item.q + ' ' + (item.keywords || ''));
      for (const transcript of transcripts) {
        const words = normalize(transcript).split(/\s+/).filter(w => w.length > 3);
        const score = words.filter(w => haystack.includes(w)).length;
        if (score > bestScore) { bestScore = score; best = item; }
      }
    }
    return bestScore > 0 ? best : null;
  },
  // Sonido corto de confirmación (alerta enviada). Sintetizado con Web Audio,
  // sin archivos externos para que funcione offline.
  chime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      // dos tonos breves ascendentes
      [[880, 0], [1320, 0.13]].forEach(([freq, t]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.3, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.13);
      });
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, 600);
    } catch (e) {}
  }
};
