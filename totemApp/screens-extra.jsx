// screens-extra.jsx — BranchesScreen (sucursales) y HelpScreen (atención humana).

function BranchesScreen({ t, lang }) {
  const branches = [
    { name: "Sucursal Centro", addr: "Av. Corrientes 820", dist: "Estás acá", hours: "10:00 – 15:00", atm: 4, open: true },
    { name: "Sucursal Obelisco", addr: "Av. 9 de Julio 1240", dist: "650 m", hours: "10:00 – 15:00", atm: 6, open: true },
    { name: "Sucursal Retiro", addr: "San Martín 145", dist: "1,2 km", hours: "10:00 – 15:00", atm: 3, open: true },
    { name: "Sucursal Tribunales", addr: "Talcahuano 480", dist: "1,5 km", hours: "Cerrado ahora", atm: 2, open: false },
  ];
  const isEs = lang === "es";
  return (
    <div className="faq fade-in" style={{ padding: "0 44px" }}>
      <div className="faq-head">
        <div style={{ width: 78, height: 78, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--brand-soft)", border: "1px solid var(--brand-line)", color: "var(--brand)", flex: "0 0 auto" }}>
          <Icon name="map" size={40} />
        </div>
        <div className="ftxt">
          <b>{t.mod_branches_t}</b>
          <span>{isEs ? "Sucursales y cajeros cerca tuyo" : "Branches and ATMs near you"}</span>
        </div>
      </div>

      {/* mapa placeholder */}
      <div style={{ position: "relative", height: 460, borderRadius: 26, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 24, background: "#EAEDF0" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 50% at 38% 42%, rgba(255,102,0,0.12), transparent 70%)" }} />
        {/* calles */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "44%", height: 18, background: "rgba(0,0,0,0.06)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "38%", width: 18, background: "rgba(0,0,0,0.06)" }} />
        {/* pins */}
        {[["38%","42%",true],["62%","30%",false],["22%","66%",false],["72%","62%",false]].map(([l,topp,me],i)=>(
          <div key={i} style={{ position: "absolute", left: l, top: topp, transform: "translate(-50%,-100%)" }}>
            <div style={{ width: me?34:26, height: me?34:26, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: me?"var(--brand)":"#9aa0a8", boxShadow: me?"0 0 0 6px rgba(255,102,0,0.22)":"none", display:"grid", placeItems:"center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", transform: "rotate(45deg)" }} />
            </div>
          </div>
        ))}
        <div className="op-frame" style={{ position: "absolute", inset: "auto 0 0 0", height: 0 }} />
        <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 17, color: "var(--faint)", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width: 12, height: 12, borderRadius:"50%", background:"var(--brand)" }} /> {isEs ? "Tu ubicación" : "Your location"}
        </div>
      </div>

      <div className="suggest-list" style={{ overflow: "hidden" }}>
        {branches.map((b, i) => (
          <div className="suggest-chip" key={i} style={{ cursor: "default", alignItems: "flex-start" }}>
            <span className="s-ico" style={ b.open ? {} : { background: "var(--surface-3)", color: "var(--faint)" }}><Icon name="map" size={24} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 27, fontWeight: 700 }}>{b.name}</div>
              <div style={{ fontSize: 21, color: "var(--muted)", fontWeight: 500, marginTop: 4 }}>{b.addr} · {b.dist}</div>
              <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 19, fontWeight: 600 }}>
                <span style={{ color: b.open ? "var(--green)" : "#ff6a5d", display:"flex", alignItems:"center", gap:7 }}>
                  <Icon name="clock" size={18} /> {b.hours}
                </span>
                <span style={{ color: "var(--muted)", display:"flex", alignItems:"center", gap:7 }}>
                  <Icon name="card" size={18} /> {b.atm} {isEs ? "cajeros" : "ATMs"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpScreen({ t, lang }) {
  const [connected, setConnected] = React.useState(false);
  React.useEffect(() => { const id = setTimeout(() => setConnected(true), 3200); return () => clearTimeout(id); }, []);
  const isEs = lang === "es";
  return (
    <div className="listen-state fade-in" style={{ padding: "0 70px" }}>
      <div style={{ position: "relative", width: 300, height: 300, borderRadius: "50%", display: "grid", placeItems: "center", background: "radial-gradient(circle at 40% 35%, var(--surface-2), var(--surface))", border: "1px solid var(--line)" }}>
        {!connected && <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "3px solid var(--brand-line)", borderTopColor: "var(--brand)", animation: "spin 1.2s linear infinite" }} />}
        <div style={{ color: connected ? "var(--green)" : "var(--brand)" }}>
          <Icon name={connected ? "video" : "headset"} size={110} stroke={1.6} />
        </div>
      </div>
      <h2>{connected ? (isEs ? "Representante conectado" : "Agent connected") : (isEs ? "Conectando…" : "Connecting…")}</h2>
      <p>{connected
        ? (isEs ? "Camila, de Atención al Cliente, se está sumando a la videollamada." : "Camila from Customer Support is joining the video call.")
        : (isEs ? "Te estamos conectando con un representante por videollamada." : "We're connecting you with an agent by video call.")}</p>
      {connected && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 26px", borderRadius: 999, background: "rgba(52,201,138,0.12)", border: "1px solid rgba(52,201,138,0.34)", color: "var(--green)", fontSize: 22, fontWeight: 700 }}>
          <span className="dot" style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--green)" }} />
          {isEs ? "Llamada segura y cifrada" : "Secure, encrypted call"}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BranchesScreen, HelpScreen });
