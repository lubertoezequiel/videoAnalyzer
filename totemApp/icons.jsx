// icons.jsx — set de íconos de línea (UI). Simples y geométricos.

function Icon({ name, size = 24, stroke = 2.2, style }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round",
    strokeLinejoin: "round", style,
  };
  switch (name) {
    case "chat":
      return (<svg {...p}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.9A8.4 8.4 0 1 1 21 11.5Z"/><path d="M8.5 11h7M8.5 14.5h4"/></svg>);
    case "mic":
      return (<svg {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>);
    case "map":
      return (<svg {...p}><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/></svg>);
    case "video":
      return (<svg {...p}><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/></svg>);
    case "clock":
      return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>);
    case "card":
      return (<svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 9.5h19M6 15h4"/></svg>);
    case "growth":
      return (<svg {...p}><path d="M4 19h16M7 16l3.5-4 3 2.5L20 7"/><path d="M20 11V7h-4"/></svg>);
    case "wallet":
      return (<svg {...p}><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 9h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3"/><circle cx="16.5" cy="12.5" r="1.1" fill="currentColor" stroke="none"/></svg>);
    case "user":
      return (<svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>);
    case "send":
      return (<svg {...p}><path d="M21 4 3 11l7 2 2 7 9-16Z"/><path d="m10 13 5-5"/></svg>);
    case "arrow-right":
      return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case "arrow-left":
      return (<svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>);
    case "home":
      return (<svg {...p}><path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/></svg>);
    case "shield":
      return (<svg {...p}><path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>);
    case "alert":
      return (<svg {...p}><path d="M12 4 2.5 20.5h19L12 4Z"/><path d="M12 10v4M12 17.5v.01"/></svg>);
    case "lock":
      return (<svg {...p}><rect x="4.5" y="10" width="15" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>);
    case "siren":
      return (<svg {...p}><path d="M6 18v-4a6 6 0 0 1 12 0v4"/><path d="M4 18h16v2.5H4zM12 4V2M19 7l1.4-1.4M5 7 3.6 5.6"/></svg>);
    case "eye":
      return (<svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "camera":
      return (<svg {...p}><path d="M3 8h3l1.5-2.5h9L18 8h3v11H3V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>);
    case "check":
      return (<svg {...p}><path d="m5 12 4.5 4.5L19 7"/></svg>);
    case "x":
      return (<svg {...p}><path d="M6 6 18 18M18 6 6 18"/></svg>);
    case "person-fall":
      return (<svg {...p}><circle cx="6" cy="9" r="2.2"/><path d="M3 19h13M9 17l2-4 3 1.5 4-1"/><path d="M20 13.5 18 17"/></svg>);
    case "phone":
      return (<svg {...p}><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>);
    case "globe":
      return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>);
    case "headset":
      return (<svg {...p}><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a4 4 0 0 1-4 3h-2"/></svg>);
    default:
      return null;
  }
}

window.Icon = Icon;
