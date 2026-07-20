// Inline SVG icons – stroke style, 18px default
window.Icon = function(name, size = 16) {
  const ico = {
    // Nav
    home: '<path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/>',
    inbox: '<path d="M3 12h6l2 3h2l2-3h6"/><path d="M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6"/><path d="M3 6l3-3h12l3 3"/>',
    check: '<path d="M4 7l3.5 9L20 4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M15 20c.2-2.5 1.8-4 4-4s3.8 1.5 4 4"/>',
    flame: '<path d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 1-5-1-9z"/>',
    deal: '<path d="M3 7h18v12H3z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
    box: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    store: '<path d="M3 8l1-4h16l1 4"/><path d="M4 8v12h16V8"/><path d="M3 8h18"/><path d="M9 20v-6h6v6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>',
    sparkles: '<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 14l.7 2L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-1z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 14l3-4 3 3 5-7"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.6 3.6 3 8 3s8-1.4 8-3V5"/><path d="M4 11v6c0 1.6 3.6 3 8 3s8-1.4 8-3v-6"/>',
    plug: '<path d="M9 7V3M15 7V3M7 7h10v6a5 5 0 0 1-10 0z"/><path d="M12 18v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4.5-7 8-7s7 2 8 7"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.5l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2.5-1.5L13.5 2h-3l-.4 3a7 7 0 0 0-2.5 1.5l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .2 1.5l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2.5 1.5l.4 3h3l.4-3a7 7 0 0 0 2.5-1.5l2.4 1 2-3.5-2-1.5A7 7 0 0 0 19 12z"/>',

    // Status / signal
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrowDown: '<path d="M12 5v14M5 12l7 7 7-7"/>',
    download: '<path d="M12 4v12M6 10l6 6 6-6"/><path d="M4 20h16"/>',
    play: '<polygon points="6,4 20,12 6,20"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',

    // Insight icons
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c1 .8 1 1.6 1 3.3h6c0-1.7 0-2.5 1-3.3A7 7 0 0 0 12 2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    phone: '<path d="M5 4h4l2 5-2 1c1 2 3 4 5 5l1-2 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    line: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 11h2v4M11 11v4l2-4v4M16 11h-1v4h1M16 13h-1"/>',
    chat: '<path d="M3 5h18v12H8l-5 4z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M14 4l6 6L8 22H2v-6z"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    close: '<path d="M6 6l12 12M6 18L18 6"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    columns: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    truck: '<path d="M3 7h12v9H3z"/><path d="M15 10h4l2 3v3h-6"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    package: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    flag: '<path d="M5 3v18M5 4h13l-3 4 3 4H5"/>',
    zap: '<polygon points="13,2 4,14 11,14 9,22 20,10 13,10"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/><rect x="9" y="9" width="6" height="6"/>',
  };
  const path = ico[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
};
