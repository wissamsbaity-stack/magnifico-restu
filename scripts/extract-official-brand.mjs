/**
 * Extract official Magnifico logo from PDF and sample brand colors.
 * Usage: node scripts/extract-official-brand.mjs [path-to-pdf]
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const pdfPath =
  process.argv[2] ??
  "C:\\Users\\Wissam Sbaity\\Downloads\\magnifico.pdf";
const publicDir = path.join(root, "public");
const brandingDir = path.join(publicDir, "branding");
const logoOut = path.join(publicDir, "logo.png");

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function colorDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function clusterColors(pixels, k = 8) {
  const samples = pixels.filter((p) => p[3] > 200);
  if (!samples.length) return [];

  const centroids = [];
  for (let i = 0; i < k; i++) {
    const p = samples[(Math.random() * samples.length) | 0];
    centroids.push([p[0], p[1], p[2]]);
  }

  for (let iter = 0; iter < 12; iter++) {
    const buckets = Array.from({ length: k }, () => []);
    for (const p of samples) {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < k; i++) {
        const d = colorDistance(p, centroids[i]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      buckets[best].push(p);
    }
    for (let i = 0; i < k; i++) {
      if (!buckets[i].length) continue;
      centroids[i] = buckets[i]
        .reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0])
        .map((v) => Math.round(v / buckets[i].length));
    }
  }

  const counts = Array(k).fill(0);
  for (const p of samples) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < k; i++) {
      const d = colorDistance(p, centroids[i]);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    counts[best]++;
  }

  return centroids
    .map((rgb, i) => ({ rgb, count: counts[i] }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

function classifyBrandColors(clusters) {
  const scored = clusters.map(({ rgb, count }) => {
    const [r, g, b] = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return { rgb, count, sat, lum };
  });

  const yellow = scored
    .filter((c) => c.rgb[0] > 180 && c.rgb[1] > 120 && c.rgb[2] < 120 && c.sat > 0.25)
    .sort((a, b) => b.count - a.count)[0];
  const pink = scored
    .filter((c) => c.rgb[0] > 150 && c.rgb[1] < 130 && c.rgb[2] > 60 && c.rgb[0] > c.rgb[1])
    .sort((a, b) => b.count - a.count)[0];
  const green = scored
    .filter((c) => c.rgb[1] > c.rgb[0] && c.rgb[1] > c.rgb[2] && c.rgb[1] > 90)
    .sort((a, b) => b.count - a.count)[0];
  const black = scored
    .filter((c) => c.lum < 0.2)
    .sort((a, b) => b.count - a.count)[0];
  const cream = scored
    .filter((c) => c.lum > 0.85 && c.sat < 0.2)
    .sort((a, b) => b.count - a.count)[0];

  return { yellow, pink, green, black, cream, all: scored };
}

async function renderPdfToPng(inputPdf, outputPng) {
  try {
    execFileSync(
      "magick",
      ["-density", "300", `${inputPdf}[0]`, "-background", "none", outputPng],
      { stdio: "pipe" }
    );
    return true;
  } catch {
    return false;
  }
}

async function trimTransparentLogo(inputPath, outputPath) {
  await sharp(inputPath)
    .trim({ threshold: 12 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
  const meta = await sharp(outputPath).metadata();
  return meta;
}

async function sampleColors(imagePath) {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let i = 0; i < data.length; i += info.channels) {
    pixels.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
  }
  return classifyBrandColors(clusterColors(pixels, 10));
}

async function main() {
  await mkdir(brandingDir, { recursive: true });

  const workingPng = path.join(brandingDir, "official-logo-source.png");
  let rendered = await renderPdfToPng(pdfPath, workingPng);

  if (!rendered) {
    // Fallback: if PDF is already a raster image wrapped in PDF, copy existing high-res source
    console.warn("ImageMagick unavailable — copy PDF manually or install magick.");
    process.exitCode = 1;
    return;
  }

  const meta = await trimTransparentLogo(workingPng, logoOut);
  const colors = await sampleColors(logoOut);

  const tokens = {
    logo: {
      path: "/logo.png",
      width: meta.width,
      height: meta.height,
      sourcePdf: pdfPath,
    },
    colors: {
      yellow: colors.yellow?.rgb ?? null,
      pink: colors.pink?.rgb ?? null,
      green: colors.green?.rgb ?? null,
      black: colors.black?.rgb ?? null,
      cream: colors.cream?.rgb ?? null,
    },
    hex: Object.fromEntries(
      Object.entries(colors)
        .filter(([k]) => k !== "all")
        .map(([k, v]) => [k, v?.rgb ? rgbToHex(...v.rgb) : null])
    ),
  };

  await writeFile(
    path.join(root, "src", "lib", "branding", "brand-tokens.json"),
    JSON.stringify(tokens, null, 2)
  );

  console.log(JSON.stringify(tokens, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
