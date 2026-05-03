const MODULE_ID = "king-of-tower-dice";
const DICE_TYPE = "kot";
const DICE_SHAPE = "d6";
const DSN_SYSTEM = "king-of-tower";
const DSN_COLORSET = "king-of-tower-custom";
const DEFAULT_LABELS = [
  "1",
  "2",
  "3",
  "\uf0e7",
  "\uf71c",
  "\uf004"
];

const SETTING_DEFAULTS = {
  labels: DEFAULT_LABELS.join(","),
  background: "#f4efe4",
  foreground: "#1d1a16",
  outline: "#ffffff",
  edge: "#8d6b37",
  font: "Font Awesome 7 Pro",
  fontScale: 1.00,
  material: "plastic"
};

function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}

function normalizeLabels(rawLabels) {
  const labels = String(rawLabels ?? "")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 6);

  while (labels.length < 6) labels.push(DEFAULT_LABELS[labels.length]);
  return labels;
}

function getLabels() {
  return normalizeLabels(getSetting("labels"));
}

function notifyReloadNeeded() {
  ui.notifications?.info("King of Tower Dice settings changed. Reload Foundry to refresh the Dice So Nice preset.");
}

function registerSetting(key, data) {
  game.settings.register(MODULE_ID, key, {
    scope: "world",
    config: true,
    requiresReload: true,
    ...data,
    onChange: notifyReloadNeeded
  });
}

function registerSettings() {
  registerSetting("labels", {
    name: "KoT Face Labels",
    hint: "Comma-separated labels for faces 1 through 6. Example: Block,Hit,Hit,Crit,Focus,Blank",
    type: String,
    default: SETTING_DEFAULTS.labels
  });

  registerSetting("background", {
    name: "KoT Dice Color",
    hint: "Hex color for the die body.",
    type: String,
    default: SETTING_DEFAULTS.background
  });

  registerSetting("foreground", {
    name: "KoT Label Color",
    hint: "Hex color for the face labels.",
    type: String,
    default: SETTING_DEFAULTS.foreground
  });

  registerSetting("outline", {
    name: "KoT Label Outline Color",
    hint: "Hex color for label outlines, or none.",
    type: String,
    default: SETTING_DEFAULTS.outline
  });

  registerSetting("edge", {
    name: "KoT Edge Color",
    hint: "Hex color for die edges, or none.",
    type: String,
    default: SETTING_DEFAULTS.edge
  });

  registerSetting("font", {
    name: "KoT Label Font",
    hint: "Font family used for the face labels.",
    type: String,
    default: SETTING_DEFAULTS.font
  });

  registerSetting("fontScale", {
    name: "KoT Label Scale",
    hint: "Dice So Nice font scale for the KoT labels.",
    type: Number,
    range: {
      min: 0.5,
      max: 3,
      step: 0.05
    },
    default: SETTING_DEFAULTS.fontScale
  });

  registerSetting("material", {
    name: "KoT Material",
    hint: "Dice So Nice material. Common values: plastic, metal, glass, wood, pristine, iridescent, chrome.",
    type: String,
    default: SETTING_DEFAULTS.material
  });
}

export class KoTDie extends foundry.dice.terms.Die {
  static DENOMINATION = DICE_TYPE;

  constructor(termData = {}) {
    super({
      ...termData,
      faces: 6
    });
    this.faces = 6;
  }

  get denomination() {
    return DICE_TYPE;
  }

  get expression() {
    const number = this.number ?? 1;
    const modifiers = this.modifiers?.join("") ?? "";
    return `${number}d${DICE_TYPE}${modifiers}`;
  }

  getResultLabel(result) {
    return getLabels()[Number(result.result) - 1] ?? String(result.result);
  }

  static matchTerm(expression, { imputeNumber = false } = {}) {
    const numberPattern = imputeNumber ? "\\d*" : "\\d+";
    const pattern = new RegExp(
      `^(${numberPattern})d?${DICE_TYPE}([^ (){}\\[\\]+\\-*/]*)?(?:\\[([^\\]]+)\\])?$`,
      "i"
    );
    return expression.match(pattern);
  }

  static fromMatch(match) {
    const number = Number(match[1]) || 1;
    const modifiers = match[2] ? match[2].match(this.MODIFIER_REGEXP) ?? [match[2]] : [];
    const flavor = match[3];
    return new this({
      number,
      faces: 6,
      modifiers,
      options: flavor ? { flavor } : {}
    });
  }
}

function registerKoTTerm() {
  CONFIG.Dice.terms[DICE_TYPE] = KoTDie;
  CONFIG.Dice.terms[DICE_TYPE.toLowerCase()] = KoTDie;

  if (!CONFIG.Dice.types.includes(KoTDie)) CONFIG.Dice.types.push(KoTDie);
}

function registerDiceSoNicePreset(dice3d) {
  dice3d.addSystem(
    {
      id: DSN_SYSTEM,
      name: "King of Tower"
    },
    "preferred"
  );

  dice3d.addColorset(
    {
      name: DSN_COLORSET,
      description: "King of Tower Custom",
      category: "King of Tower",
      foreground: getSetting("foreground"),
      background: getSetting("background"),
      outline: getSetting("outline") || "none",
      edge: getSetting("edge") || "none",
      texture: "none",
      material: getSetting("material") || SETTING_DEFAULTS.material,
      font: getSetting("font") || SETTING_DEFAULTS.font,
      fontScale: {
        [DICE_TYPE]: Number(getSetting("fontScale")) || SETTING_DEFAULTS.fontScale
      },
      visibility: "visible"
    },
    "default"
  );

  dice3d.addDicePreset(
    {
      type: DICE_TYPE,
      labels: getLabels(),
      values: {
        min: 1,
        max: 6
      },
      colorset: DSN_COLORSET,
      font: getSetting("font") || SETTING_DEFAULTS.font,
      fontScale: Number(getSetting("fontScale")) || SETTING_DEFAULTS.fontScale,
      system: DSN_SYSTEM
    },
    DICE_SHAPE
  );
}

Hooks.once("init", () => {
  registerSettings();
  registerKoTTerm();
});

Hooks.once("diceSoNiceReady", (dice3d) => {
  registerDiceSoNicePreset(dice3d);
});

Hooks.once("ready", () => {
  game.kingOfTowerDice = {
    KoTDie,
    roll: async (number = 1, options = {}) => {
      const roll = await new Roll(`${Number(number) || 1}d${DICE_TYPE}`).evaluate();
      return roll.toMessage(options);
    }
  };
});
