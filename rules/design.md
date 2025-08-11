Home Poker Manager — Design.md (Neo‑Brutalism)

0. Design Goals
   • Vibe: Bold, blocky, playful neo‑brutalism with sharp geometry, chunky UI, and obvious affordances.
   • Avoided clichés: No casino green, red, or black. No felt textures or card‑table skeuomorphism.
   • Clarity over gloss: Big typography, high contrast, minimal motion, visible borders, honest shadows.
   • One‑hand use: Thumb‑first controls, large hit‑areas, persistent bottom nav.
   • Fast inputs: Numeric pads, stepper chips, and pre‑sets for common actions (buy‑ins, rebuys, blinds).

⸻

1. Brand System

Name (placeholder): Poker League Hero
Tone: Competent, friendly, slightly cheeky. No gambling claims; focus on organizing games.

1.1 Color Palette (non‑casino)

Accessible contrast targets: text on background ≥ 4.5:1; primary on surface ≥ 3:1.

Core
• Ink 900 #131629 — primary text & outlines on light, headers on dark.
• Bone 50 #F6F5F2 — light background.
• Slate 200 #D9DCE3 — dividers, disabled fills.

Brand Accents
• Cobalt 600 #6C6AE9 — primary actions, links.
• Violet 700 #E372E4 — secondary actions, highlight tags.
• Saffron 500 #FDD254 — emphasis, badges, “dealer” markers.
• Tangerine 600 #F18D62 — attention states (non‑error), timers, blinds tickers.
• Cyan 500 #00C2D8 — informational accents, charts, avatars rings.
• green #56A176 —

Surfaces
• Paper #FBFBFA — base app surface.
• Card #FFFFFF — components.
• Night 850 #1A2134 — dark base.
• Panel 800 #222A3F — dark components.

Semantic (no red/green)
• Win / Positive: Cobalt 600 + ✓ icon
• Loss / Negative: Tangerine 600 + – icon
• Neutral / Pending: Slate 400 #B4BAC8 + … icon
(Use icons/shapes + labels to reinforce meaning; do not rely on color alone.)

1.2 Typography
• Display: Space Grotesk (700/600) — headers, numbers.
• Text: Inter (500/400) — body, labels.
• Numerals: Tabular lining for currency, blinds, and totals.

Scale (sp / dp)
• H1 34 • H2 28 • H3 22 • Title 18 • Body 16 • Caption 13 • Mono 12
• Line heights: 1.2 (display), 1.4 (text)

1.3 Iconography & Shape Language
• Thick stroke icons (2.25–2.5px at 24dp), squared corners with subtle rounding (8–12dp).
• Geometry: rectangles, hard cards, dotted grids. Minimal curves; no skeuomorphic suits.

1.4 Shadows & Borders (neo‑brutalist)
• Borders: 2px solid Ink 900 at 20% opacity on light; 2px Paper at 10% on dark.
• Drop shadow: single, unapologetic.
• Light: 0 6 0 0 rgba(19,22,41,0.14)
• Dark: 0 6 0 0 rgba(0,0,0,0.35)
• Elevation: 0 / 2 / 6 / 12 for press feedback.

⸻

2. Layout & Spacing
   • Grid: 8dp base; 16dp gutters; content max‑width 640dp on tablets.
   • Safe areas: Respect notches; bottom nav sits above system bar.
   • Touch targets: 48×48dp minimum.
   • Containers: Card padding 16–20dp, page padding 20–24dp.

Key Patterns
• Top bar: Big title, right‑side contextual action (e.g., “Start Game”).
• Bottom nav (5 tabs): Home, Sessions, Players, Bank, Settings.
• Floating toolbar: Contextual during live session (Timer • Buy‑in • Rebuy • Cash‑out • Notes).

⸻

3. Core Screens (Wireframe Spec)

3.1 Home (Dashboard)
• Hero panel with next session card: date/time, hosts, blinds, seats left.
• Quick actions: New Session, Add Player, Split Pot, IOU.
• Recent activity list: last 5 events (buy‑ins, rebuys, cash‑outs) with chunky tags.

3.2 Create Session
• Blocks: Stakes & Blinds (preset chips), Buy‑in preset, Rebuy rules, Rake/Expenses, Player cap.
• Timer module: level steps (e.g., 20/40 → 30/60), per‑level duration.
• Share: one‑tap invite (deep link / QR).

3.3 Live Session Table
• Top strip: Current level, timer (large digits), table name.
• Players grid: cards with avatar, stack, in/out toggle, notes.
• Action bar: Buy‑in, Rebuy, Add expense, Split pot, Cash‑out.
• Log drawer: chronological ledger with filters and export.

3.4 Players
• Roster with totals: sessions, net, average buy‑in.
• Player detail: profile, preferred stakes, attendance, settle‑ups.

3.5 Bank & Settlements
• Ledger: buy‑ins, rebuys, expenses, payouts.
• Settle up: netting calculator (who owes whom), QR/Share receipt.

3.6 Settings
• Presets: stakes, timers, fees, currencies, number format.
• Privacy: local‑only data, export/import, wipe.
• Appearance: light/dark, high‑contrast, haptics.

⸻

4. Components (Style Spec)

Buttons
• Primary (Cobalt): filled, 2px border, heavy shadow on press.
• Secondary (Violet): filled or outline.
• Tertiary: text + icon only.
• Corners 12dp; spacing 12×16; icon size 18–20.

Chips (Presets)
• Square 40×40 with label (e.g., 50/100, 100/200). Colors rotate: Cobalt, Violet, Saffron, Cyan.

Numeric Pad
• 3×4 grid, tall keys, haptic on tap, large display with tabular numerals.

Cards
• Thick border, flat color header strip (accent), big number, small label.

List Items
• 64dp height, left icon, title, right value tag.

Tags
• Solid block background (Saffron/Cobalt/Cyan), uppercase condensed label.

Timers
• XXL digits (H1), progress bar with blocky ticks, Tangerine accents.

⸻

5. Motion & Interaction
   • Press: scale 0.98 + shadow jump.
   • Transitions: snap‑in/out, 120–180ms. No springy physics.
   • Timer tick: subtle 1dp step flash each second.
   • Haptics: light on confirm, medium on error, success double‑tap on session end.

⸻

6. Accessibility & States
   • Minimum target size: 48dp.
   • Contrast: follow above ratios; verify both themes.
   • Focus/Keyboard: visible outline (dotted Cobalt) on web.
   • Error/Empty/Loading
   • Error: bold headline, exact cause, primary recovery action.
   • Empty: big icon + one
   primary CTA + sample preset.
   • Loading: blocky animated placeholders (skeleton bars).

⸻

7. Dark Theme Mapping
   • Background → Night 850; Cards → Panel 800; Text → Paper.
   • Accents remain the same; reduce saturation by 10% for large fills; keep high‑contrast labels.

⸻

8. Design Tokens (example)

colors:
ink: "#131629"
bone: "#F6F5F2"
slate200: "#D9DCE3"
slate400: "#B4BAC8"
cobalt600: "#3057FF"
violet700: "#6A00FF"
saffron500: "#F5B301"
tangerine600: "#FF7A1A"
cyan500: "#00C2D8"
night850: "#1A2134"
panel800: "#222A3F"

radii: [8, 12, 16]
spacing: [4,8,12,16,20,24,32]
shadows:
sm: "0 2 0 0 rgba(19,22,41,0.10)"
md: "0 6 0 0 rgba(19,22,41,0.14)"
lg: "0 12 0 0 rgba(19,22,41,0.18)"

⸻

9. Content Style
   • Labels: short verbs (Add buy‑in, Split pot, Start timer).
   • Numbers: always tabular, currency symbol aligned.
   • Copy tone: direct, playful headers; straightforward body text.

⸻

10. Illustration & Graphics
    • Flat, geometric shapes (blocks, arcs, grids). No cards/suits. Use checker grids, numeric glyphs, timer rings.

⸻

11. Sample Use Cases & Visual Cues
    • Session about to start: Banner with Saffron block + countdown.
    • Player busted: Tag switches to Tangerine with “OUT”; offer Rebuy chip.
    • Settlement complete: Cobalt check ribbon.

⸻

12. Deliverables
    • Token JSON (above) for theming.
    • Figma library with components (buttons, chips, cards, list items, timer, numeric pad).
    • Icon set (24/32dp) with outlined style.
    • Light/Dark mockups: Home, Create Session, Live Table, Bank.

⸻

13. Non‑Goals
    • Gambling integrations, payment rails.
    • Casino visual tropes (felt, gradients to red/green/black, suit icons).

⸻

14. QA Checklist
    • Tap target audit (48dp+)
    • Contrast checks (WCAG AA)
    • VoiceOver/TalkBack labels
    • Large text mode (up to 120%) without truncation
    • One‑hand reachability on 6.7” devices

⸻

15. Notes for Implementation (Expo/React Native)
    • Use react-native-reanimated for quick, snappy transitions.
    • Use expo-haptics for tactile feedback.
    • Use a design‑token source (JSON) and generate light/dark theme objects.
    • Prefer Pressable with scale + shadow feedback.
    • Ensure tabular numerals via font features (fontVariant: ['tabular-nums']).
