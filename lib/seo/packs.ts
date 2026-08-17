import type { IconPack } from "@/lib/iconPacks";

export function buildPackSeoTitle(pack: IconPack): string {
  const title = pack.title.trim();
  if (/icons?/i.test(title)) {
    return `${title} — InkMorph`;
  }

  return `${title} 3D Icons — InkMorph`;
}

export function buildPackSeoDescription(pack: IconPack): string {
  const base = pack.description.trim();
  if (base.length >= 120) {
    return `${base} Premium 3D icon pack from InkMorph for modern interfaces, websites and digital products.`;
  }

  return `Explore ${pack.title}, a premium collection of 3D icons from InkMorph, created for modern interfaces, websites and digital products. ${base}`;
}
