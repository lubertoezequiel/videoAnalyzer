// screens-overlay.jsx — PanicOverlay (alerta enviada) y OperatorAlert (visión).

function PanicOverlay({ t, info, onCancel }) {
  const [canceling, setCanceling] = React.useState(false);
  // Sonido repetitivo mientras la alerta está activa; se corta al cancelar/cerrar.
  React.useEffect(() => {
    if (canceling || !window.VoiceEngine) return;
    window.VoiceEngine.chime();
    const id = setInterval(() => window.VoiceEngine.chime(), 2000);
    return () => clearInterval(id);
  }, [canceling]);
  function cancel() {
    setCanceling(true);
    setTimeout(onCancel, 900);
  }
  return (
    <div className="overlay panic-overlay">
      <div className="panic-icon"><Icon name="siren" size={96} style={{ color: "#fff" }} /></div>
      <h1 className="panic-title">{t.panic_sent_title}</h1>
      <p className="panic-sub">{t.panic_sent_sub}</p>
      <p className="panic-stay">{t.panic_stay}</p>

      <div className="panic-meta">
        <div className="cell"><div className="k">{t.panic_id}</div><div className="v">GAL-1042</div></div>
        <div className="cell"><div className="k">{t.panic_loc}</div><div className="v">Sucursal Centro</div></div>
        <div className="cell"><div className="k">{t.panic_time}</div><div className="v">{info.time}</div></div>
        <div className="cell"><div className="k">{t.panic_status}</div><div className="v live"><span className="dot" />{t.panic_status_active}</div></div>
      </div>

      <button className="panic-cancel" onClick={cancel} disabled={canceling}>
        {canceling ? t.panic_canceling : t.panic_cancel}
      </button>
    </div>
  );
}

function OperatorAlert({ t, info, onClose }) {
  const [acked, setAcked] = React.useState(false);

  if (acked) {
    return (
      <div className="overlay op-overlay">
        <div className="op-bar">
          <span className="op-badge"><Icon name="eye" size={18} /> {t.op_badge}</span>
          <span className="op-clock">{info.time}</span>
        </div>
        <div className="op-acked">
          <div className="check"><Icon name="check" size={80} /></div>
          <h2>{t.op_acked}</h2>
          <button className="btn btn-ghost" onClick={onClose}>{t.home}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay op-overlay">
      <div className="op-bar">
        <span className="op-badge"><Icon name="eye" size={18} /> {t.op_badge}</span>
        <span className="op-clock">Central de monitoreo · {info.time}</span>
      </div>

      <div className="op-body">
        <div className="op-alert-head">
          <div className="warn"><Icon name="person-fall" size={40} /></div>
          <div>
            <h2>{t.op_alert_title}</h2>
            <p>{t.op_alert_sub}</p>
          </div>
        </div>

        {/* Frame capturado simulado */}
        <div className="op-frame">
          <div className="floor" />
          <div className="cam-grid" />
          <div className="person" />
          <div className="head-blur" />
          <div className="bbox"><span className="tag">Persona · horizontal · 38s</span></div>
          <div className="rec"><span className="d" /> REC · CAM-TÓTEM</div>
          <div className="privacy"><Icon name="lock" size={15} /> {t.op_frame_note}</div>
          <div className="stamp">GAL-1042 · {info.time}</div>
        </div>

        <div className="op-stats">
          <div className="op-stat"><div className="k">{t.op_confidence}</div><div className="v ok">94%</div></div>
          <div className="op-stat"><div className="k">{t.op_duration}</div><div className="v">00:38</div></div>
          <div className="op-stat"><div className="k">{t.panic_id}</div><div className="v">GAL-1042</div></div>
        </div>
      </div>

      <div className="op-actions">
        <button className="btn muted" onClick={onClose}><Icon name="x" size={24} /> {t.op_false}</button>
        <button className="btn primary" onClick={() => setAcked(true)}><Icon name="shield" size={24} /> {t.op_dispatch}</button>
      </div>
    </div>
  );
}

Object.assign(window, { PanicOverlay, OperatorAlert });
