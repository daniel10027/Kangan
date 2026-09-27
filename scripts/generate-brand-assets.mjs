/**
 * Génère les visuels de marque de base (icône app, splash, image Open
 * Graph) directement en pixels + zlib, sans dépendance externe, à partir
 * de la palette Kangan (section 11 du cahier des charges). Sert de socle
 * tant qu'aucune identité graphique finale (logo vectoriel, shooting
 * photo) n'a été produite par un designer — voir SUIVI.md.
 *
 * Usage : node scripts/generate-brand-assets.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const COLORS = {
  vertKangan: [15, 61, 46, 255],
  ocre: [217, 142, 43, 255],
  creme: [246, 239, 227, 255],
  encre: [27, 27, 24, 255],
};

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filtre "none"
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // couleur RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function createCanvas(width, height, bg) {
  const buf = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) buf.set(bg, i * 4);
  return buf;
}

function setPixel(buf, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width) return;
  const i = (y * width + x) * 4;
  if (i < 0 || i + 3 >= buf.length) return;
  buf.set(color, i);
}

function fillCircle(buf, width, height, cx, cy, r, color, predicate) {
  const minY = Math.max(0, Math.floor(cy - r));
  const maxY = Math.min(height - 1, Math.ceil(cy + r));
  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    const dx = Math.sqrt(Math.max(r * r - dy * dy, 0));
    const minX = Math.max(0, Math.floor(cx - dx));
    const maxX = Math.min(width - 1, Math.ceil(cx + dx));
    for (let x = minX; x <= maxX; x++) {
      if (!predicate || predicate(x, y)) setPixel(buf, width, x, y, color);
    }
  }
}

function fillRoundedRect(buf, width, x0, y0, w, h, radius, color) {
  // Important : arrondir avant toute arithmétique d'index pixel. Des bornes
  // de boucle fractionnaires (x0/y0 non entiers) décalent silencieusement
  // l'index mémoire calculé (y * width + x) * 4, car la partie fractionnaire
  // de y se propage dans le produit avant troncature — d'où un rectangle
  // rendu à une position complètement différente de celle voulue.
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  w = Math.round(w);
  h = Math.round(h);
  radius = Math.round(radius);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const inCornerZone =
        (x < x0 + radius && y < y0 + radius) ||
        (x >= x0 + w - radius && y < y0 + radius) ||
        (x < x0 + radius && y >= y0 + h - radius) ||
        (x >= x0 + w - radius && y >= y0 + h - radius);
      if (inCornerZone) {
        const cx = x < x0 + radius ? x0 + radius : x0 + w - radius;
        const cy = y < y0 + radius ? y0 + radius : y0 + h - radius;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > radius * radius) continue;
      }
      setPixel(buf, width, x, y, color);
    }
  }
}

/** Dessine le canari (jarre) centré, occupant environ 55% de la hauteur. */
function drawCanari(buf, size, { fillPercent = 62 } = {}) {
  const cx = size / 2;
  const bodyR = size * 0.28;
  const bodyCy = size * 0.58;

  // Corps de la jarre (crème)
  fillCircle(buf, size, size, cx, bodyCy, bodyR, COLORS.creme);

  // Remplissage ocre (partie basse du corps, hauteur = fillPercent%)
  const fillTopY = bodyCy + bodyR - (fillPercent / 100) * (2 * bodyR);
  fillCircle(buf, size, size, cx, bodyCy, bodyR, COLORS.ocre, (_x, y) => y >= fillTopY);

  // Goulot (rectangle arrondi crème au-dessus du corps)
  const neckW = size * 0.22;
  const neckH = size * 0.16;
  fillRoundedRect(buf, size, cx - neckW / 2, bodyCy - bodyR - neckH + size * 0.02, neckW, neckH, size * 0.02, COLORS.creme);
}

function writeAsset(path, buf) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  console.log(`✔ ${path} (${(buf.length / 1024).toFixed(1)} Ko)`);
}

// --- Icône app (1024×1024, fond vert Kangan plein) --------------------------
{
  const size = 1024;
  const buf = createCanvas(size, size, COLORS.vertKangan);
  drawCanari(buf, size, { fillPercent: 65 });
  writeAsset("apps/mobile/assets/icon.png", encodePng(size, size, buf));
  writeAsset("apps/mobile/assets/adaptive-icon.png", encodePng(size, size, buf));
}

// --- Splash screen (1284×2778, fond vert Kangan, canari centré) -------------
{
  const width = 1284;
  const height = 2778;
  const buf = createCanvas(width, height, COLORS.vertKangan);
  // Dessine le canari dans un canevas carré centré, puis le recopie au milieu du splash.
  const iconSize = 640;
  const iconBuf = createCanvas(iconSize, iconSize, COLORS.vertKangan);
  drawCanari(iconBuf, iconSize, { fillPercent: 70 });
  const offsetX = Math.floor((width - iconSize) / 2);
  const offsetY = Math.floor((height - iconSize) / 2);
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const srcI = (y * iconSize + x) * 4;
      setPixel(buf, width, offsetX + x, offsetY + y, iconBuf.subarray(srcI, srcI + 4));
    }
  }
  writeAsset("apps/mobile/assets/splash.png", encodePng(width, height, buf));
}

// --- Favicon PNG (512×512, secours pour les contextes n'acceptant pas le SVG) ---
{
  const size = 512;
  const buf = createCanvas(size, size, COLORS.vertKangan);
  drawCanari(buf, size, { fillPercent: 65 });
  writeAsset("apps/web/public/icon-512.png", encodePng(size, size, buf));
}

// --- Image Open Graph (1200×630, partage WhatsApp — section 16) -------------
{
  const width = 1200;
  const height = 630;
  const buf = createCanvas(width, height, COLORS.vertKangan);
  const iconSize = 420;
  const iconBuf = createCanvas(iconSize, iconSize, COLORS.vertKangan);
  drawCanari(iconBuf, iconSize, { fillPercent: 68 });
  const offsetX = 90;
  const offsetY = Math.floor((height - iconSize) / 2);
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const srcI = (y * iconSize + x) * 4;
      setPixel(buf, width, offsetX + x, offsetY + y, iconBuf.subarray(srcI, srcI + 4));
    }
  }
  // Bande ocre en pied d'image (repère de marque simple, sans texte).
  for (let y = height - 14; y < height; y++) {
    for (let x = 0; x < width; x++) setPixel(buf, width, x, y, COLORS.ocre);
  }
  writeAsset("apps/web/public/og-image.png", encodePng(width, height, buf));
}

console.log("\nVisuels de base générés à partir de la palette Kangan (section 11).");
console.log("À remplacer par l'identité graphique finale (logo vectoriel + typographie Fraunces) avant la finale.");
