# King of Tower Dice

FoundryVTT v14 module that registers a custom six-sided `KoT` die for Dice So Nice.

## Usage

1. Place this folder in your Foundry user data `Data/modules/king-of-tower-dice` directory.
2. Enable both Dice So Nice and King of Tower Dice in your world.
3. Roll with:

```text
/roll 1dKoT
```

The module also exposes a small helper:

```javascript
game.kingOfTowerDice.roll(2);
```

## Customization

Open Foundry's Configure Settings menu for the world and change the King of Tower Dice settings:

- `KoT Face Labels`: comma-separated labels for faces 1 through 6.
- `KoT Dice Color`: die body color.
- `KoT Label Color`: face label color.
- `KoT Label Outline Color`: label outline color, or `none`.
- `KoT Edge Color`: die edge color, or `none`.
- `KoT Label Font`: font family.
- `KoT Label Scale`: Dice So Nice label scale.
- `KoT Material`: Dice So Nice material.

Reload Foundry after changing settings so Dice So Nice refreshes its registered preset.
