// app.jsx — orquesta el kiosk del tótem.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "es",
  "avatarState": "idle"
}/*EDITMODE-END*/;

function useClock() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const lang = tw.lang === "en" ? "en" : "es";
  const t = window.KIOSK_STRINGS[lang];
  const now = useClock();

  const [route, setRoute] = React.useState("attract"); // attract|home|faq|voice|branches|help
  const [overlay, setOverlay] = React.useState(null);   // null|panic|operator
  const [panicInfo, setPanicInfo] = React.useState({ time: "" });

  const idleTimer = React.useRef(null);
  const resetIdle = React.useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (window.VoiceEngine) window.VoiceEngine.stop();
      setOverlay(null);
      setRoute("attract");
    }, 120000);
  }, []);
  React.useEffect(() => {
    if (route === "attract") { clearTimeout(idleTimer.current); return; }
    resetIdle();
    return () => clearTimeout(idleTimer.current);
  }, [route, resetIdle]);

  function timeNow() {
    return new Date().toLocaleTimeString(t.locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  function triggerPanic() {
    setPanicInfo({ time: timeNow() });
    setOverlay("panic");
  }
  function triggerOperator() {
    setPanicInfo({ time: timeNow() });
    setOverlay("operator");
  }
  function goModule(id) {
    if (id === "voice") setRoute("voice");
    else setRoute(id);
  }

  const showNav = route !== "attract" && route !== "home";
  const onScreen = (e) => { if (route !== "attract") resetIdle(); };

  let content;
  if (route === "attract") content = <AttractScreen t={t} avatarState={tw.avatarState} onStart={() => setRoute("home")} />;
  else if (route === "home") content = <HomeScreen t={t} avatarState={tw.avatarState} onModule={goModule} />;
  else if (route === "faq") content = <FaqScreen t={t} lang={lang} avatarState={tw.avatarState} onVoice={() => setRoute("voice")} key="faq" />;
  else if (route === "voice") content = <VoiceScreen t={t} lang={lang} avatarState={tw.avatarState} onBack={() => setRoute("home")} key="voice" />;
  else if (route === "branches") content = <BranchesScreen t={t} lang={lang} />;
  else if (route === "help") content = <HelpScreen t={t} lang={lang} />;

  return (
    <React.Fragment>
      <div className="screen" onPointerDown={onScreen}>
        {route !== "attract" && (
          <TopBar
            t={t} now={now}
            onHome={() => setRoute("home")}
            showNav={showNav}
            onBack={() => setRoute("home")}
          />
        )}

        <div className="body">{content}</div>

        {route !== "attract" && <Footer t={t} />}

        <EmergencySlider t={t} onTrigger={triggerPanic} />

        {overlay === "panic" && (
          <PanicOverlay t={t} info={panicInfo} onCancel={() => setOverlay(null)} />
        )}
        {overlay === "operator" && (
          <OperatorAlert t={t} info={panicInfo} onClose={() => setOverlay(null)} />
        )}
      </div>

      {/* ===== Consola de presentador (fuera de la pantalla del tótem) ===== */}
      <PresenterConsole
        lang={lang}
        onPanic={triggerPanic}
        onFall={triggerOperator}
        onReset={() => { setOverlay(null); setRoute("attract"); }}
        onHome={() => { setOverlay(null); setRoute("home"); }}
      />

      {/* ===== Tweaks ===== */}
      <TweaksPanel>
        <TweakSection label={lang === "es" ? "Idioma" : "Language"} />
        <TweakRadio
          label={lang === "es" ? "Idioma de la interfaz" : "Interface language"}
          value={tw.lang}
          options={[{ value: "es", label: "Español" }, { value: "en", label: "English" }]}
          onChange={(v) => setTweak("lang", v)}
        />
        <TweakSection label={lang === "es" ? "Avatar (Vera)" : "Avatar (Vera)"} />
        <TweakRadio
          label={lang === "es" ? "Estado en reposo" : "Resting state"}
          value={tw.avatarState}
          options={[
            { value: "idle", label: lang === "es" ? "Reposo" : "Idle" },
            { value: "listening", label: lang === "es" ? "Escucha" : "Listen" },
            { value: "speaking", label: lang === "es" ? "Habla" : "Speak" },
          ]}
          onChange={(v) => setTweak("avatarState", v)}
        />
        <div style={{ padding: "4px 2px 2px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
          {lang === "es"
            ? "Usá la consola inferior para simular el botón de pánico y la detección de persona caída."
            : "Use the bottom console to simulate the panic button and fallen-person detection."}
        </div>
      </TweaksPanel>
    </React.Fragment>
  );
}

function PresenterConsole({ lang, onPanic, onFall, onReset, onHome }) {
  const es = lang === "es";
  const btn = {
    display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)",
    color: "#e8ded3", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
    padding: "11px 18px", borderRadius: 999, backdropFilter: "blur(8px)",
  };
  return (
    <div style={{
      position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 10, zIndex: 200,
      padding: "10px 12px 10px 18px", borderRadius: 999,
      background: "rgba(18,14,10,0.82)", border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 20px 50px -20px rgba(0,0,0,0.8)", backdropFilter: "blur(10px)",
    }}>
      <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginRight: 4 }}>
        {es ? "Demo" : "Demo"}
      </span>
      <button style={{ ...btn, borderColor: "rgba(238,43,30,0.4)", background: "rgba(238,43,30,0.16)", color: "#ff9a90" }} onClick={onPanic}>
        <Icon name="siren" size={17} /> {es ? "Botón de pánico" : "Panic button"}
      </button>
      <button style={{ ...btn, borderColor: "rgba(255,178,61,0.4)", background: "rgba(255,178,61,0.14)", color: "#ffcc85" }} onClick={onFall}>
        <Icon name="person-fall" size={17} /> {es ? "Persona caída" : "Fallen person"}
      </button>
      <button style={btn} onClick={onHome}><Icon name="home" size={17} /> {es ? "Inicio" : "Home"}</button>
      <button style={btn} onClick={onReset}><Icon name="arrow-left" size={17} /> {es ? "Reiniciar" : "Reset"}</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
