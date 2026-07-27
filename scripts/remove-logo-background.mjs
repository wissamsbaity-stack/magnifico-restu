import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { copyFile, unlink, rename } from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath =
  "C:\\Users\\Wissam Sbaity\\.cursor\\projects\\c-Users-Wissam-Sbaity-OneDrive-Desktop-magnifico\\assets\\c__Users_Wissam_Sbaity_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_Jul_21__2026__01_10_07_AM-b53ad982-5e79-4a6e-b1e0-cba004518aca.png";
const outputPath = path.join(__dirname, "..", "public", "logo.png");
const tempPath = outputPath + ".tmp";

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function matchesAny(r, g, b, colors, tolerance) {
  return colors.some(
    ([cr, cg, cb]) => colorDistance(r, g, b, cr, cg, cb) <= tolerance
  );
}

function sampleCornerColors(data, width, height, channels) {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [1, 1],
    [width - 2, 1],
  ];
  const colors = [];
  for (const [x, y] of points) {
    const p = (y * width + x) * channels;
    colors.push([data[p], data[p + 1], data[p + 2]]);
  }
  return colors;
}

function uniqueColors(colors, tolerance = 18) {
  const unique = [];
  for (const color of colors) {
    if (!matchesAny(color[0], color[1], color[2], unique, tolerance)) {
      unique.push(color);
    }
  }
  return unique;
}

async function main() {
  const inputPath = sourcePath;
  await copyFile(inputPath, outputPath);

  const { data, info } = await sharp(outputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const total = width * height;
  const bgColors = uniqueColors(sampleCornerColors(data, width, height, channels));
  const tolerance = 36;

  const edgeBg = new Uint8Array(total);
  const queue = [];

  const idx = (x, y) => (y * width + x) * channels;
  const pushEdge = (x, y) => {
    const i = y * width + x;
    if (edgeBg[i]) return;
    const p = idx(x, y);
    if (!matchesAny(data[p], data[p + 1], data[p + 2], bgColors, tolerance)) return;
    edgeBg[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x++) {
    pushEdge(x, 0);
    pushEdge(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushEdge(0, y);
    pushEdge(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) pushEdge(x - 1, y);
    if (x < width - 1) pushEdge(x + 1, y);
    if (y > 0) pushEdge(x, y - 1);
    if (y < height - 1) pushEdge(x, y + 1);
  }

  let removed = 0;
  for (let i = 0; i < total; i++) {
    if (!edgeBg[i]) continue;
    data[i * channels + 3] = 0;
    removed++;
  }

  // Remove trapped checkerboard gray squares (not pure white fill inside the hand).
  const grayBgColors = bgColors.filter(
    ([r, g, b]) => (r + g + b) / 3 < 252
  );

  for (let i = 0; i < total; i++) {
    const p = i * channels;
    if (data[p + 3] === 0) continue;
    if (!matchesAny(data[p], data[p + 1], data[p + 2], grayBgColors, tolerance)) {
      continue;
    }
    data[p + 3] = 0;
    removed++;
  }

  // Remove neutral halos adjacent to transparency.
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const p = i * channels;
      if (data[p + 3] === 0) continue;

      const touchesTransparent =
        data[idx(x - 1, y) + 3] === 0 ||
        data[idx(x + 1, y) + 3] === 0 ||
        data[idx(x, y - 1) + 3] === 0 ||
        data[idx(x, y + 1) + 3] === 0;

      if (!touchesTransparent) continue;

      if (matchesAny(data[p], data[p + 1], data[p + 2], bgColors, tolerance + 8)) {
        data[p + 3] = 0;
        removed++;
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tempPath);

  await unlink(outputPath).catch(() => {});
  await rename(tempPath, outputPath);

  console.log(
    JSON.stringify({
      width,
      height,
      bgColors,
      removedPixels: removed,
      totalPixels: total,
      removedPercent: Number(((removed / total) * 100).toFixed(2)),
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
