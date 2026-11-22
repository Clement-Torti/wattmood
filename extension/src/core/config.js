/*
 * WattMood configuration — the only file to edit when deploying.
 */
(() => {
  const IV = (globalThis.WattMood = globalThis.WattMood || {});
  IV.CONFIG = {
    // Google Apps Script web app URL (see server/SETUP.md). Empty = offline mode (points stay local).
    ENDPOINT: 'https://script.google.com/macros/s/AKfycbxkZBhcxqZRVoQsDGFKT3mdOyKEHD8KLRPB39x2eWzsP_rluj7jbeL4qnVbme0E6oFi4g/exec',
    // Public site (GitHub Pages): landing, share links, privacy policy.
    SITE_URL: 'https://clement-torti.github.io/wattmood/',
    DONATE_URL: 'https://buymeacoffee.com/ctorti',

    // Community points
    POINTS: { share: 5, install: 10, perEuro: 10 },
    PICK_ONE_EUR: 5, // donation ≥ this unlocks one skin of the donor's choice
    ALL_SKINS_EUR: 10, // donation ≥ this unlocks every skin for the donor
    REFRESH_MIN: 20, // how often the points line is refreshed

    // presets[0] ≈ 1 € / 1 $ is the default; the next ones reach the 5 € (pick a skin) and 10 € (all skins) tiers.
    // Approximate value of 1 unit in EUR (for converting pledges into points; donations are verified by hand).
    CURRENCIES: {
      EUR: { rate: 1, symbol: '€', presets: [1, 5, 10, 20] },
      USD: { rate: 0.92, symbol: '$', presets: [1, 6, 11, 22] },
      GBP: { rate: 1.17, symbol: '£', presets: [1, 5, 9, 18] },
      BRL: { rate: 0.17, symbol: 'R$', presets: [6, 30, 60, 120] },
      MXN: { rate: 0.05, symbol: 'MX$', presets: [20, 100, 200, 400] },
      ARS: { rate: 0.001, symbol: 'AR$', presets: [1000, 5000, 10000, 20000] },
      COP: { rate: 0.00023, symbol: 'COL$', presets: [4500, 22000, 44000, 88000] },
      CLP: { rate: 0.001, symbol: 'CLP$', presets: [1000, 5000, 10000, 20000] },
      PEN: { rate: 0.25, symbol: 'S/', presets: [4, 20, 40, 80] },
      CAD: { rate: 0.67, symbol: 'CA$', presets: [2, 8, 15, 30] },
      CHF: { rate: 1.05, symbol: 'CHF', presets: [1, 5, 10, 20] },
    },

    // Default community goals (points). The spreadsheet's "Goals" tab can override them without an update.
    GOALS: {
      classic: 0,
      masquerade: 1000,
      ventana: 2500,
      culpa: 5000,
      after: 8000,
      boulevard: 12000,
      susurro: 17000,
      rancho: 23000,
      cabina: 30000,
      ring: 38000,
      humo: 47000,
      toits: 57000,
    },
  };
})();
