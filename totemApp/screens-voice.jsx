// screens-voice.jsx — VoiceScreen: hablar con Vera con reconocimiento de voz real
// (Web Speech API nativa). Fases: idle → listening → processing → answer → idle.

function VoiceScreen({ t, lang, avatarState, onBack }) {
  const FAQ = window.KIOSK_FAQ;
  const [phase, setPhase] = React.useState("idle"); // idle | listening | processing | answer
  const [transcript, setTranscript] = React.useState(""); // lo que dijo el usuario
  const [current, setCurrent] = React.useState(null);      // { q, a, source } cuando hay match
  const [noMatch, setNoMatch] = React.useState(false);     // true → "no entendí, repetí"
  const [errorCode, setErrorCode] = React.useState(null);  // código de error real del reconocedor
  const timers = React.useRef([]);
  const recRef = React.useRef(null);

  // Traduce el código de error de la Web Speech API a algo accionable.
  function errorMessage(code) {
    switch (code) {
      case "not-allowed":
      case "service-not-allowed":
        return "Necesito permiso del micrófono. Si abriste el archivo directo (file://), abrilo por http/https o localhost: el navegador bloquea el micrófono en páginas no seguras.";
      case "network":
        return "El reconocimiento de voz de Chrome necesita conexión a internet. Conectá la red e intentá de nuevo.";
      case "audio-capture":
        return "No detecto ningún micrófono conectado.";
      case "not-supported":
        return "Este navegador no soporta reconocimiento de voz. Usá Chrome o Edge.";
      default:
        return t.voice_no_match;
    }
  }

  React.useEffect(() => () => { clearAll(); stopRec(); }, []);

  // Vera lee la respuesta en voz alta al entrar en answer con match.
  React.useEffect(() => {
    if (phase === "answer" && current && window.VoiceEngine) {
      window.VoiceEngine.speak(current.a);
    }
  }, [phase, current]);

  function clearAll() {
    timers.current.forEach(clearTimeout); timers.current = [];
  }
  function later(fn, ms) { const id = setTimeout(fn, ms); timers.current.push(id); }
  function stopRec() {
    if (recRef.current) { try { recRef.current.stop(); } catch (e) {} recRef.current = null; }
  }

  // FAQ aplanado en el idioma activo para el matcher: { q, a, keywords, source }.
  function faqItems() {
    return FAQ.map((e) => ({
      q: e[lang].q, a: e[lang].a, keywords: e.keywords, source: e[lang].source,
    }));
  }

  // ── FASE listening ──────────────────────────────────────────────
  function startListening() {
    clearAll();
    stopRec();
    setCurrent(null);
    setTranscript("");
    setNoMatch(false);
    setErrorCode(null);
    setPhase("listening");
    if (!window.VoiceEngine || !window.VoiceEngine.listen) { onError("not-supported"); return; }
    // El browser pide el permiso de micrófono automáticamente al iniciar.
    recRef.current = window.VoiceEngine.listen(onResult, onError);
  }

  // ── FASE processing → answer ────────────────────────────────────
  function onResult(transcripts) {
    recRef.current = null;
    const said = (transcripts && transcripts[0]) || "";
    setTranscript(said);
    setPhase("processing");
    // ~600ms para dar sensación de que "piensa".
    later(() => {
      const match = window.VoiceEngine.matchFaq(transcripts, faqItems());
      if (match) {
        setCurrent({ q: said || match.q, a: match.a, source: match.source });
        setNoMatch(false);
        setPhase("answer");
        later(() => setPhase((p) => (p === "answer" ? "idle" : p)), 12000);
      } else {
        // No entendió → mostrar aviso y volver a escuchar a los 2s.
        retryListen();
      }
    }, 600);
  }

  function onError(err) {
    recRef.current = null;
    console.error("[VoiceScreen] SpeechRecognition error:", err);
    if (err === "aborted") return; // lo detuvimos nosotros: sin aviso
    if (err === "no-speech" || err === "no-match") { retryListen(); return; }
    // Error real (permiso, red, micrófono…): mostrar el motivo concreto + código.
    setErrorCode(err);
    setNoMatch(true);
    setCurrent(null);
    setPhase("answer");
    later(() => setPhase((p) => (p === "answer" ? "idle" : p)), 6000);
  }

  function retryListen() {
    setNoMatch(true);
    setCurrent(null);
    setPhase("answer");
    later(() => startListening(), 2000);
  }

  // Atajo: elegir una pregunta sugerida (mismo flujo visual).
  function pickChip(entry) {
    clearAll();
    stopRec();
    const data = entry[lang];
    setTranscript(data.q);
    setNoMatch(false);
    setPhase("processing");
    later(() => {
      setCurrent({ q: data.q, a: data.a, source: data.source });
      setPhase("answer");
      later(() => setPhase((p) => (p === "answer" ? "idle" : p)), 12000);
    }, 600);
  }

  function stop() { clearAll(); stopRec(); if (window.VoiceEngine) window.VoiceEngine.stop(); setPhase("idle"); setTranscript(""); setNoMatch(false); }
  function goBack() { stop(); if (onBack) onBack(); }

  function micTap() {
    if (phase === "listening") stop();
    else startListening();
  }

  const listening = phase === "listening";
  const matched = phase === "answer" && current && !noMatch;
  const avState =
    listening ? "listening" :
    phase === "processing" ? "speaking" :
    matched ? "speaking" : avatarState;

  let label = t.voice_idle_title;
  if (listening) label = t.voice_hear_you;
  else if (phase === "processing") label = t.voice_processing;
  else if (matched) label = "Vera";
  else if (phase === "answer" && noMatch) label = errorCode ? errorMessage(errorCode) : t.voice_no_match;

  return (
    <div className="voice fade-in">
      <div className="voice-avatar"><Avatar state={avState} size={560} /></div>
      <div className="voice-state-label">{label}</div>
      {phase === "idle" && <div className="voice-state-sub">{t.voice_idle_sub}</div>}

      <div className="voice-content">
        {phase === "idle" && (
          <div className="voice-suggest">
            <div className="suggest-label">{t.voice_general}</div>
            {FAQ.slice(0, 4).map((e) => (
              <button className="suggest-chip" key={e.id} onClick={() => pickChip(e)}>
                <span className="s-ico"><Icon name={e.icon} size={26} /></span>
                {e[lang].q}
                <span className="s-go"><Icon name="arrow-right" size={22} /></span>
              </button>
            ))}
          </div>
        )}

        {listening && (
          <div className={"transcript" + (transcript ? "" : " ph")}>
            {transcript || t.voice_hear_you}
            <span className="caret" />
          </div>
        )}

        {phase === "processing" && (
          <React.Fragment>
            {transcript && <div className="transcript">{transcript}</div>}
            <div className="thinking"><div className="spinner" /> {t.voice_processing}</div>
          </React.Fragment>
        )}

        {phase === "answer" && noMatch && (
          <div className="voice-answer fade-in" style={{ textAlign: "center" }}>
            <div className="thinking" style={{ justifyContent: "center" }}>
              <Icon name="mic" size={26} /> {errorCode ? errorMessage(errorCode) : t.voice_no_match}
            </div>
            {errorCode && (
              <div style={{ marginTop: 14, fontSize: 18, color: "var(--faint)", fontFamily: "monospace" }}>
                error: {errorCode}
              </div>
            )}
            {errorCode && (
              <button className="btn-ghost" style={{ marginTop: 22 }} onClick={startListening}>
                <Icon name="mic" size={22} /> {t.voice_repeat}
              </button>
            )}
          </div>
        )}

        {matched && (
          <div className="voice-answer fade-in">
            <div className="bubble-user" style={{ alignSelf: "center", marginBottom: 18 }}>{current.q}</div>
            <div className="answer-card">
              <div className="speak-hint"><Icon name="globe" size={22} /> {t.faq_speak_hint}</div>
              <div className="answer-text">{current.a}</div>
              <div className="answer-source">
                <Icon name="lock" size={18} />
                <span><b>{t.faq_source}:</b> {current.source}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 22 }}>
              <button className="btn-ghost" onClick={startListening}>
                <Icon name="mic" size={22} /> {t.voice_repeat}
              </button>
              <button className="btn-ghost" onClick={goBack}>
                <Icon name="arrow-left" size={22} /> {t.back}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="voice-mic-dock">
        <button className={"mic-big" + (listening ? " active" : "")} onClick={micTap}>
          <Icon name="mic" size={52} />
        </button>
        <div className="mic-hint">{listening ? t.voice_mic_stop : t.voice_mic_tap}</div>
      </div>
    </div>
  );
}

window.VoiceScreen = VoiceScreen;
