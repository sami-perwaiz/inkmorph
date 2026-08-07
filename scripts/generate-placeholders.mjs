import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const CATEGORIES = [{ dir: "3d-icon", fill: "#202020", label: "3D" }];

const COUNT = 10;

function createSvg(fill, label, index) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${fill}" opacity="0.15"/>
  <rect x="40" y="40" width="320" height="320" fill="${fill}" opacity="0.35" rx="24"/>
  <text x="200" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="${fill}">${label} ${index}</text>
</svg>`;
}

async function main() {
  const root = join(process.cwd(), "public", "illustrations");

  for (const { dir, fill, label } of CATEGORIES) {
    const categoryPath = join(root, dir);
    await mkdir(categoryPath, { recursive: true });

    for (let i = 1; i <= COUNT; i++) {
      const filename = `${String(i).padStart(2, "0")}.svg`;
      await writeFile(
        join(categoryPath, filename),
        createSvg(fill, label, i),
        "utf8"
      );
    }
  }

  console.log(`Generated ${COUNT} placeholders per category.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
