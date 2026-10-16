// Card-play sound and the sound on/off button. The sound is generated with the Web Audio API
// (a short, filtered burst of noise, like a card landing on the table), so there is no audio file.

const Sound = (() => {
  let on = true;
  try { on = localStorage.getItem('bridge-sound') !== 'off'; } catch { /* storage may be blocked */ }
  let ctx = null;

  function cardPlayed() {
    if (!on) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      ctx = ctx || new AudioCtx();
      // Browsers start audio suspended until the page has been clicked; resuming is harmless otherwise.
      if (ctx.state === 'suspended') ctx.resume();
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

  return { cardPlayed, init };
})();
