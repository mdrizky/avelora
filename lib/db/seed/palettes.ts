import type { ThemeConfig } from "../types";

/** Cover/demo images — Unsplash CDN (dengan fallback gradient elegan di UI). */
export const SAMPLE_IMG = {
  bride: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75",
  groom: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=75",
  couple:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=75",
  table:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=75",
  venue:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=75",
  story1:
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=75",
  baby: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=75",
  baby2:
    "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=900&q=75",
  cake: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=900&q=75",
  confetti:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=75",
  grad: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=75",
  hands:
    "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=75",
} as const;

export type PaletteKey =
  | "evergold"
  | "ivorynavy"
  | "blackpearl"
  | "blushpetal"
  | "sagegarden"
  | "winevelvet"
  | "oceanmoon"
  | "goldenhour"
  | "forest"
  | "midnight"
  | "petrol"
  | "sunset";

export const PALETTES: Record<PaletteKey, ThemeConfig["palette"]> = {
  evergold: { name: "Evergold", background: "#FBF9F4", foreground: "#1F1A15", primary: "#B08D42", accent: "#4E6250", soft: "#F1E9D6", muted: "#8B8176" },
  ivorynavy: { name: "Ivory & Navy", background: "#FDFCF8", foreground: "#1B2735", primary: "#1B4D6B", accent: "#B08D42", soft: "#EDF2F6", muted: "#7A8694" },
  blackpearl: { name: "Black Pearl", background: "#171310", foreground: "#FBF9F4", primary: "#C9A95E", accent: "#8B8176", soft: "#211B16", muted: "#A89E92" },
  blushpetal: { name: "Blush Petal", background: "#FDF7F4", foreground: "#57343A", primary: "#D98E7E", accent: "#B0574F", soft: "#F7E5DF", muted: "#A0817C" },
  sagegarden: { name: "Sage Garden", background: "#F7F9F4", foreground: "#27422E", primary: "#5E7D5B", accent: "#B08D42", soft: "#E6EFE4", muted: "#7E927E" },
  winevelvet: { name: "Wine Velvet", background: "#221214", foreground: "#FBEDE9", primary: "#C08A7A", accent: "#9A5B52", soft: "#331C1F", muted: "#B39A94" },
  oceanmoon: { name: "Ocean Moon", background: "#F4F8FA", foreground: "#0F2A38", primary: "#146C94", accent: "#B08D42", soft: "#E1EEF4", muted: "#6F8996" },
  goldenhour: { name: "Golden Hour", background: "#FFF9F0", foreground: "#3A2A12", primary: "#D98E32", accent: "#8C5B21", soft: "#F7E8CC", muted: "#A08B68" },
  forest: { name: "Forest Romance", background: "#EFF2EA", foreground: "#1E3323", primary: "#3E5C43", accent: "#B08D42", soft: "#DCE3D4", muted: "#7C8A78" },
  midnight: { name: "Midnight Elegance", background: "#101722", foreground: "#EFF3F8", primary: "#B7C9DA", accent: "#6E8EA6", soft: "#1A2432", muted: "#93A4B6" },
  petrol: { name: "Petrol Day", background: "#F1F6F6", foreground: "#173E3B", primary: "#2F7C77", accent: "#0F2A38", soft: "#DCECEA", muted: "#73928F" },
  sunset: { name: "Sunset Ceremony", background: "#FFF6EF", foreground: "#3E2316", primary: "#C96F45", accent: "#9A4B2C", soft: "#F9E3D3", muted: "#A98E7D" },
};

export function theme(
  name: string,
  palette: PaletteKey,
  font: ThemeConfig["font"],
  layout: ThemeConfig["layout"],
): ThemeConfig {
  return { name, palette: PALETTES[palette], font, layout, animation: "subtle" };
}

export interface TplDef {
  name: string;
  slug: string;
  palette: PaletteKey;
  font: ThemeConfig["font"];
  layout: ThemeConfig["layout"];
  premium: boolean;
}

export function templatesFor(category: string, defs: TplDef[], created_at: string) {
  return defs.map((d, i) => ({
    id: `tpl-${category}-${i + 1}`,
    name: d.name,
    slug: d.slug,
    category_id: `cat-${category}`,
    thumbnail_url: "",
    preview_url: "",
    theme_config: theme(d.name, d.palette, d.font, d.layout),
    is_premium: d.premium,
    price: d.premium ? 49_000 : 0,
    is_active: true,
    created_by: "system",
    created_at,
  }));
}

const WEDDING: TplDef[] = [
  { name: "Evergold", slug: "evergold", palette: "evergold", font: "serif", layout: "classic", premium: false },
  { name: "Ivory & Navy", slug: "ivory-navy", palette: "ivorynavy", font: "script", layout: "classic", premium: false },
  { name: "Black Pearl", slug: "black-pearl", palette: "blackpearl", font: "serif", layout: "luxe", premium: true },
  { name: "Blush Petal", slug: "blush-petal", palette: "blushpetal", font: "script", layout: "editorial", premium: true },
  { name: "Sage Garden", slug: "sage-garden", palette: "sagegarden", font: "serif", layout: "editorial", premium: true },
  { name: "Wine Velvet", slug: "wine-velvet", palette: "winevelvet", font: "serif", layout: "luxe", premium: true },
  { name: "Ocean Moon", slug: "ocean-moon", palette: "oceanmoon", font: "serif", layout: "classic", premium: false },
  { name: "Golden Hour", slug: "golden-hour", palette: "goldenhour", font: "sans", layout: "editorial", premium: true },
  { name: "Forest Romance", slug: "forest-romance", palette: "forest", font: "script", layout: "classic", premium: true },
  { name: "Midnight Elegance", slug: "midnight-elegance", palette: "midnight", font: "sans", layout: "luxe", premium: true },
];

const AQIQAH: TplDef[] = [
  { name: "Sage Baby", slug: "sage-baby", palette: "sagegarden", font: "sans", layout: "classic", premium: false },
  { name: "Golden Blessing", slug: "golden-blessing", palette: "evergold", font: "script", layout: "classic", premium: false },
  { name: "Blush Little One", slug: "blush-little-one", palette: "blushpetal", font: "sans", layout: "editorial", premium: true },
  { name: "Evergreen Joy", slug: "evergreen-joy", palette: "forest", font: "serif", layout: "editorial", premium: true },
];

const KHITAN: TplDef[] = [
  { name: "Petrol Day", slug: "petrol-day", palette: "petrol", font: "sans", layout: "classic", premium: false },
  { name: "Golden Circumcision", slug: "golden-circumcision", palette: "goldenhour", font: "script", layout: "classic", premium: true },
  { name: "Forest Pride", slug: "forest-pride", palette: "forest", font: "serif", layout: "editorial", premium: true },
];

const BIRTHDAY: TplDef[] = [
  { name: "Confetti Classic", slug: "confetti-classic", palette: "ivorynavy", font: "sans", layout: "editorial", premium: false },
  { name: "Candy Blush", slug: "candy-blush", palette: "blushpetal", font: "script", layout: "classic", premium: false },
  { name: "Midnight Party", slug: "midnight-party", palette: "midnight", font: "sans", layout: "luxe", premium: true },
  { name: "Golden Years", slug: "golden-years", palette: "goldenhour", font: "serif", layout: "classic", premium: true },
  { name: "Sunset Ceremony", slug: "sunset-ceremony", palette: "sunset", font: "sans", layout: "editorial", premium: true },
];

const GRAD: TplDef[] = [
  { name: "Graduate Classic", slug: "graduate-classic", palette: "oceanmoon", font: "serif", layout: "classic", premium: false },
  { name: "Midnight Scholar", slug: "midnight-scholar", palette: "midnight", font: "sans", layout: "editorial", premium: true },
  { name: "Golden Degree", slug: "golden-degree", palette: "goldenhour", font: "script", layout: "classic", premium: true },
];

const CORP: TplDef[] = [
  { name: "Executive", slug: "executive", palette: "petrol", font: "sans", layout: "editorial", premium: false },
  { name: "Noir Summit", slug: "noir-summit", palette: "blackpearl", font: "sans", layout: "luxe", premium: true },
];

const ENG: TplDef[] = [
  { name: "Promise", slug: "promise", palette: "blushpetal", font: "script", layout: "classic", premium: false },
  { name: "Golden Ring", slug: "golden-ring", palette: "evergold", font: "serif", layout: "luxe", premium: true },
];

export function buildTemplates(created_at: string) {
  return [
    ...templatesFor("wedding", WEDDING, created_at),
    ...templatesFor("aqiqah", AQIQAH, created_at),
    ...templatesFor("khitan", KHITAN, created_at),
    ...templatesFor("birthday", BIRTHDAY, created_at),
    ...templatesFor("graduation", GRAD, created_at),
    ...templatesFor("corporate", CORP, created_at),
    ...templatesFor("engagement", ENG, created_at),
  ];
}