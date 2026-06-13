// screens-main.jsx — TopBar, Footer, EmergencySlider, Attract, Home, FAQ.

function TopBar({ t, now, onHome, showNav, onBack }) {
  const time = now.toLocaleTimeString(t.locale, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="topbar">
      {showNav ? (
        <button className="nav-back" onClick={onBack}>
          <Icon name="arrow-left" size={26} /> {t.back}
        </button>
      ) : (
        <div className="brand" onClick={onHome} style={{ cursor: "pointer" }}>
          <div className="brand-mark" />
          <div className="brand-name">Galicia<small>{t.brandSuffix}</small></div>
        </div>
      )}
      <div className="top-right">
        <div className="pill clock"><span className="dot" />{time}</div>
      </div>
    </div>
  );
}

function Footer({ t }) {
  return (
    <div className="footer">
      <div className="secure"><Icon name="lock" size={18} /> {t.footer_secure} · galicia.ar</div>
      <div>Tótem GAL-1042 · Sucursal Centro</div>
    </div>
  );
}

/* ---------- BARRA DE EMERGENCIA (deslizar para activar) ---------- */
function EmergencySlider({ t, onTrigger }) {
  const trackRef = React.useRef(null);
  const [pos, setPos] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const maxRef = React.useRef(0);
  const posRef = React.useRef(0);

  function bounds() {
    const tr = trackRef.current;
    if (!tr) return 0;
    maxRef.current = tr.clientWidth - 80 - 12; // thumb 80 + paddings
    return maxRef.current;
  }

  function onDown(e) {
    e.preventDefault();
    bounds();
    setDragging(true);
    const startX = e.clientX;
    const start = pos;
    const move = (ev) => {
      const x = Math.max(0, Math.min(maxRef.current, start + (ev.clientX - startX)));
      posRef.current = x;
      setPos(x);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const reached = posRef.current >= maxRef.current * 0.88;
      posRef.current = 0;
      setDragging(false);
      setPos(0);
      // El efecto secundario (disparar la alerta) va FUERA del updater de estado:
      // llamar setState del padre dentro de un updater provoca un bucle de render.
      if (reached) onTrigger();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const pct = maxRef.current ? pos / maxRef.current : 0;

  return (
    <div className="emg-bar">
      <div ref={trackRef} className={"emg-track" + (pct > 0.88 ? " armed" : "")}>
        <div className="emg-fill" style={{ width: pos + 80 + "px" }} />
        <div
          className="emg-thumb"
          style={{ transform: `translateX(${pos}px)`, transition: dragging ? "none" : "transform 0.3s cubic-bezier(.2,.8,.2,1)" }}
          onPointerDown={onDown}
        >
          <Icon name="siren" size={34} />
        </div>
        <div className="emg-label" style={{ opacity: pct > 0.15 ? 0 : 1 }}>
          {t.emg_slide} <span className="chev"><Icon name="arrow-right" size={24} /></span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ATTRACT ---------------- */
function AttractScreen({ t, avatarState, onStart }) {
  const greet = t.attract_greeting;
  const last = greet.split(" ").slice(-1)[0];
  const head = greet.split(" ").slice(0, -1).join(" ");
  React.useEffect(() => {
    if (window.VoiceEngine) {
      window.VoiceEngine.speak("¡Hola! Soy Vera, tu asistente del Galicia. Tocá la pantalla para empezar.");
    }
  }, []);
  return (
    <div className="attract fade-in" onClick={onStart}>
      <div className="glow" />
      <div className="voice-avatar"><Avatar state={avatarState} size={480} /></div>
      <h1 className="attract-greeting" style={{ marginTop: 40 }}>{head} <span className="nm">{last}</span></h1>
      <p className="attract-sub">{t.attract_sub}</p>
      <div className="attract-cta"><Icon name="mic" size={28} /> {t.attract_cta}</div>
      <p className="attract-hint">{t.attract_hint}</p>
    </div>
  );
}

/* ---------------- HOME ---------------- */
function HomeScreen({ t, avatarState, onModule }) {
  const mods = [
    { id: "faq", icon: "chat", title: t.mod_faq_t, desc: t.mod_faq_d, act: t.mod_faq_a },
    { id: "branches", icon: "map", title: t.mod_branches_t, desc: t.mod_branches_d, act: t.mod_branches_a },
    { id: "help", icon: "headset", title: t.mod_help_t, desc: t.mod_help_d, act: t.mod_help_a },
  ];
  return (
    <div className="home fade-in">
      <div className="home-head">
        <h2 className="home-title">{t.home_title}</h2>
        <p className="home-sub">{t.home_sub}</p>
      </div>
      <div className="module-grid">
        {mods.map((m) => (
          <button className="module-card" key={m.id} onClick={() => onModule(m.id)}>
            <div className="m-ico"><Icon name={m.icon} size={40} /></div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <span className="m-act">{m.act} <Icon name="arrow-right" size={22} /></span>
          </button>
        ))}
      </div>
      <button className="btn-0800" onClick={() => alert("Función disponible próximamente")}>
        <span className="ico"><Icon name="phone" size={34} /></span>
        <span className="b0800-txt">
          <span className="b0800-main">{t.cta_0800}</span>
          <span className="note">({t.cta_0800_note})</span>
        </span>
      </button>
      <div className="home-avatar-dock" onClick={() => onModule("voice")}>
        <div style={{ flex: "0 0 auto" }}>
          <Avatar state={avatarState} size={230} />
        </div>
        <div className="txt">
          <b>{t.mod_voice_t}</b>
          <span>{t.mod_voice_d}</span>
        </div>
        <Icon name="mic" size={44} style={{ color: "var(--brand)" }} />
      </div>
    </div>
  );
}

/* ---------------- FAQ (consultas: preguntas preparadas + respuesta) ---------------- */
function FaqScreen({ t, lang, avatarState, onVoice }) {
  const FAQ = window.KIOSK_FAQ;
  const [phase, setPhase] = React.useState("idle"); // idle | thinking | answer
  const [current, setCurrent] = React.useState(null);
  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  React.useEffect(() => {
    if (phase === "answer" && current && window.VoiceEngine) {
      window.VoiceEngine.speak(current.a);
    }
  }, [phase, current]);

  function ask(entry) {
    timers.current.forEach(clearTimeout); timers.current = [];
    const data = entry[lang];
    setCurrent({ q: data.q, a: data.a, source: data.source });
    setPhase("thinking");
    timers.current.push(setTimeout(() => setPhase("answer"), 1400));
  }
  function reset() { setPhase("idle"); setCurrent(null); }

  return (
    <div className="faq fade-in">
      <div className="faq-head">
        <div style={{ flex: "0 0 auto" }}><Avatar state={phase === "answer" ? "speaking" : avatarState} size={200} /></div>
        <div className="ftxt">
          <b>Vera</b>
          <span>{t.faq_title}</span>
        </div>
      </div>

      <div className="chat-area">
        {current && <div className="bubble-user">{current.q}</div>}
        {phase === "thinking" && (
          <div className="thinking"><div className="spinner" /> {t.faq_thinking}</div>
        )}
        {phase === "answer" && current && (
          <div className="answer-card fade-in">
            <div className="speak-hint"><Icon name="globe" size={22} /> {t.faq_speak_hint}</div>
            <div className="answer-text">{current.a}</div>
            <div className="answer-source">
              <Icon name="lock" size={18} />
              <span><b>{t.faq_source}:</b> {current.source}</span>
            </div>
          </div>
        )}

        {phase === "idle" && (
          <div className="suggest-wrap">
            <div className="suggest-label">{t.faq_suggest}</div>
            <div className="suggest-list">
              {FAQ.map((e) => (
                <button className="suggest-chip" key={e.id} onClick={() => ask(e)}>
                  <span className="s-ico"><Icon name={e.icon} size={26} /></span>
                  {e[lang].q}
                  <span className="s-go"><Icon name="arrow-right" size={22} /></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="input-dock">
        {phase === "answer" ? (
          <button className="btn btn-ghost" style={{ justifyContent: "center", width: "100%" }} onClick={reset}>
            <Icon name="arrow-left" size={24} /> {t.faq_ask_another}
          </button>
        ) : (
          <button className="btn btn-brand" style={{ justifyContent: "center", width: "100%", display: "flex", alignItems: "center", gap: 14 }} onClick={onVoice}>
            <Icon name="mic" size={28} /> {t.faq_talk_cta}
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TopBar, Footer, EmergencySlider, AttractScreen, HomeScreen, FaqScreen });
