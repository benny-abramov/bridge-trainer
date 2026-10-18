// Card-play, correct-answer and wrong-answer sounds, and the sound on/off button. The sounds are
// generated with the Web Audio API (a filtered burst of noise for a card, a rising chime for a right
// answer, two falling notes for a wrong one), so there are no audio files.

const Sound = (() => {
  let on = true;
  try { on = localStorage.getItem('bridge-sound') !== 'off'; } catch { /* storage may be blocked */ }
  let ctx = null;

  // The shared audio context, or null when sound is off or unavailable.
  function audio() {
    if (!on) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = ctx || new AudioCtx();
    // Browsers start audio suspended until the page has been clicked; resuming is harmless otherwise.
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function cardPlayed() {
    try {
      if (!audio()) return;
      const length = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 0.8;
      const gain = ctx.createGain();
      gain.gain.value = 0.6;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
    } catch { /* no audio available: play silently */ }
  }

  // A short, bright three-note rising chime (C–E–G) for a correct answer.
  function correct() {
    try {
      if (!audio()) return;
      const start = ctx.currentTime;
      [1046.5, 1318.5, 1568].forEach((freq, i) => {
        const t = start + i * 0.09;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    } catch { /* no audio available: stay silent */ }
  }

  // A soft, low two-note falling "uh-oh" for a wrong answer.
  function wrong() {
    try {
      if (!audio()) return;
      const start = ctx.currentTime;
      [392, 311.1].forEach((freq, i) => {
        const t = start + i * 0.16;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch { /* no audio available: stay silent */ }
  }

  function update(btn) {
    btn.textContent = on ? '🔊' : '🔇';
    btn.setAttribute('aria-pressed', on);
    const label = on ? L('Sound on (click to mute)', 'צליל מופעל (לחצו להשתקה)') : L('Sound off (click to turn on)', 'צליל מושתק (לחצו להפעלה)');
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }

  function init() {
    document.querySelectorAll('.sound-toggle').forEach(btn => {
      update(btn);
      btn.addEventListener('click', () => {
        on = !on;
        try { localStorage.setItem('bridge-sound', on ? 'on' : 'off'); } catch { /* not remembered */ }
        document.querySelectorAll('.sound-toggle').forEach(update);
        if (on) cardPlayed(); // a sample, so you hear what you turned on
      });
    });
  }

  return { cardPlayed, correct, wrong, init };
})();
