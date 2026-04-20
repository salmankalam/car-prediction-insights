# 🎨 Themes — Plug & Play

Each file in this folder is a **self-contained theme**. To try one, change a single line in `src/App.tsx`:

```tsx
import "@/themes/midnight.css";   // ← swap this filename
```

Available themes:

| File | Vibe | Best for |
|------|------|----------|
| `midnight.css` | Dark luxury, deep blue + cyan glow | **Default** — premium feel |
| `porcelain.css` | Minimal light, soft neutrals | Apple-style elegance |
| `neo-brutalist.css` | Bold type, stark contrast | Bold, attention-grabbing |
| `glassmorphic.css` | Frosted glass, soft gradients | Modern & dreamy |
| `carbon-sport.css` | Racing red on carbon black | Performance / sports cars |

Every theme defines the same set of HSL CSS variables (`--background`, `--foreground`, `--primary`, `--accent`, `--card`, etc.) plus a few extras:

- `--gradient-hero` — main hero background gradient
- `--gradient-accent` — accent gradient for charts/highlights
- `--shadow-glow` — signature glow shadow
- `--font-display` / `--font-body` — typography

All themes support **light & dark modes** via the `.dark` class — toggle from the navbar.

## Adding your own theme

1. Copy any existing file → `src/themes/my-theme.css`
2. Edit the HSL values
3. Import it in `App.tsx`

The rest of the app uses semantic tokens, so your colors propagate everywhere automatically.
