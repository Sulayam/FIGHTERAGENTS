#!/usr/bin/env node
/**
 * UFC Arena Tileset Generator — Retro Pixel Art Style
 *
 * Creates a textured tileset PNG for the arena map.
 * Each 32x32 tile has procedural pixel-art detail:
 *   - Seats have tiny crowd "head" dots
 *   - Cage has chain-link cross-hatch pattern
 *   - Mat has canvas weave texture
 *   - Walkways have concrete grain
 *   - Barricade has metal railing lines
 *   - etc.
 *
 * Color palette inspired by MSG UFC 205 — warm amber crowd,
 * bright spotlight on a light gray-blue octagon mat.
 *
 * No external dependencies — uses only Node.js built-ins (zlib).
 * Usage: node scripts/generate-tileset.js
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── SEEDED PRNG (deterministic textures) ───────────────────────────────────
let _seed = 42;
function rand() {
    _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
    return (_seed >>> 0) / 0xffffffff;
}

// ─── COLOR HELPERS ──────────────────────────────────────────────────────────
function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

function mix(c1, c2, t) {
    return [
        clamp(c1[0] + (c2[0] - c1[0]) * t),
        clamp(c1[1] + (c2[1] - c1[1]) * t),
        clamp(c1[2] + (c2[2] - c1[2]) * t),
    ];
}

function brighten(c, amt) {
    return [clamp(c[0] + amt), clamp(c[1] + amt), clamp(c[2] + amt)];
}

function darken(c, amt) {
    return brighten(c, -amt);
}

// ─── TILE DEFINITIONS ────────────────────────────────────────────────────────
// Updated palette: warm amber crowd, light gray-blue mat, dark arena
const TILES = [
    { name: 'WALL',       rgb: [12,  10,  18],  collides: true  },  // 0 → GID 1
    { name: 'SEAT_DARK',  rgb: [35,  28,  15],  collides: false },  // 1 → GID 2
    { name: 'SEAT_MED',   rgb: [55,  42,  18],  collides: false },  // 2 → GID 3
    { name: 'SEAT_RED',   rgb: [140, 45,  20],  collides: false },  // 3 → GID 4
    { name: 'FLOOR',      rgb: [22,  20,  30],  collides: false },  // 4 → GID 5
    { name: 'WALKWAY',    rgb: [65,  60,  55],  collides: false },  // 5 → GID 6
    { name: 'RINGSIDE',   rgb: [38,  35,  42],  collides: false },  // 6 → GID 7
    { name: 'MAT',        rgb: [175, 185, 195], collides: false },  // 7 → GID 8
    { name: 'MAT_CENTER', rgb: [190, 200, 210], collides: false },  // 8 → GID 9
    { name: 'CAGE',       rgb: [90,  90,  95],  collides: true  },  // 9 → GID 10
    { name: 'CAGE_POST',  rgb: [180, 160, 40],  collides: true  },  // 10 → GID 11
    { name: 'TUNNEL',     rgb: [18,  16,  24],  collides: false },  // 11 → GID 12
    { name: 'WALKOUT',    rgb: [200, 120, 20],  collides: false },  // 12 → GID 13
    { name: 'COMMENTARY', rgb: [30,  65,  45],  collides: false },  // 13 → GID 14
    { name: 'BARRICADE',  rgb: [75,  75,  80],  collides: true  },  // 14 → GID 15
    { name: 'AISLE',      rgb: [70,  65,  60],  collides: false },  // 15 → GID 16
];

const TILE_SIZE = 32;
const COLS = TILES.length;
const IMG_W = COLS * TILE_SIZE;
const IMG_H = TILE_SIZE;

// ─── TEXTURE RENDERERS ─────────────────────────────────────────────────────
// Each function receives (px, py) in 0..31 and returns [r, g, b]

function texWall(px, py, base) {
    // Dark concrete with occasional mortar lines
    const brickH = 8, brickW = 16;
    const row = Math.floor(py / brickH);
    const offset = (row % 2) * (brickW / 2);
    const bx = (px + offset) % brickW;
    const by = py % brickH;
    // Mortar lines
    if (by === 0 || bx === 0) return darken(base, 5);
    // Noise
    const n = (rand() - 0.5) * 12;
    return brighten(base, n);
}

function texSeat(px, py, base) {
    // Crowd effect: tiny colored dots representing heads on a dark base
    // Each "person" is roughly 3-4px wide, 2-3px tall
    const cellW = 4, cellH = 4;
    const cx = px % cellW, cy = py % cellH;
    const gridX = Math.floor(px / cellW), gridY = Math.floor(py / cellH);

    // Stagger odd rows
    const stagger = (gridY % 2) * 2;
    const adjPx = (px + stagger) % TILE_SIZE;
    const adjCx = adjPx % cellW;

    // "Head" is a 2x2 dot in the center-ish of each cell
    if (adjCx >= 1 && adjCx <= 2 && cy >= 0 && cy <= 1) {
        // Vary head colors — warm tones (skin, hair, clothing)
        _seed = (gridX * 73 + gridY * 137 + base[0]) & 0xffffffff;
        const v = rand();
        if (v < 0.25) return [180, 150, 110];  // light skin/blonde
        if (v < 0.50) return [120, 80,  50];   // dark hair
        if (v < 0.65) return [200, 60,  40];   // red shirt
        if (v < 0.80) return [50,  50,  50];   // dark clothing
        return [180, 170, 50];                  // yellow/gold shirt
    }
    // Dark seat between people
    const n = (rand() - 0.5) * 8;
    return brighten(darken(base, 10), n);
}

function texFloor(px, py, base) {
    // Dark arena floor with subtle concrete texture
    const n = (rand() - 0.5) * 10;
    // Subtle grid every 8px
    if (px % 8 === 0 || py % 8 === 0) return darken(base, 4);
    return brighten(base, n);
}

function texWalkway(px, py, base) {
    // Concrete with fine grain and occasional expansion joints
    const n = (rand() - 0.5) * 15;
    // Expansion joint lines every 16px
    if (px === 15 || py === 15) return darken(base, 15);
    // Fine speckle
    if (rand() < 0.08) return brighten(base, 20);
    return brighten(base, n);
}

function texRingside(px, py, base) {
    // Dark padded area around the cage, smooth with subtle texture
    const n = (rand() - 0.5) * 8;
    // Padding seam lines
    if (py === 0 || py === 31) return brighten(base, 8);
    return brighten(base, n);
}

function texMat(px, py, base) {
    // Canvas mat texture — fine cross-weave pattern
    const weaveX = px % 4, weaveY = py % 4;
    let c = [...base];
    // Horizontal thread emphasis
    if (weaveY === 0) c = brighten(c, 6);
    // Vertical thread emphasis
    if (weaveX === 0) c = darken(c, 4);
    // Subtle overall noise
    const n = (rand() - 0.5) * 8;
    c = brighten(c, n);
    // Octagon border line hints (dark line near edges)
    if (px <= 1 || px >= 30 || py <= 1 || py >= 30) c = darken(c, 10);
    return c;
}

function texMatCenter(px, py, base) {
    // Center mat with a subtle octagonal logo pattern
    let c = texMat(px, py, base);
    // Draw a simple "UFC" / octagon shape in the center
    const cx = px - 16, cy = py - 16;
    const dist = Math.max(Math.abs(cx), Math.abs(cy), (Math.abs(cx) + Math.abs(cy)) * 0.7);
    // Octagon ring at radius ~10-12
    if (dist >= 10 && dist <= 12) {
        c = darken(c, 25);
    }
    // Inner highlight
    if (dist <= 5) {
        c = brighten(c, 8);
    }
    return c;
}

function texCage(px, py, base) {
    // Chain-link fence: diamond/cross-hatch pattern
    const d1 = (px + py) % 6;  // diagonal 1
    const d2 = (px - py + 36) % 6;  // diagonal 2 (offset to keep positive)
    if (d1 === 0 || d2 === 0) {
        // Wire — bright metallic
        return brighten(base, 40 + (rand() - 0.5) * 10);
    }
    // Gaps in fence — semi-transparent dark (see-through effect)
    // Alternate between dark and slightly lighter to give depth
    if ((px + py) % 2 === 0) return darken(base, 30);
    return darken(base, 40);
}

function texCagePost(px, py, base) {
    // Metallic yellow post with cylindrical shading
    const cx = px - 16;
    const dist = Math.abs(cx);
    // Cylindrical highlight: brighter in the center
    const highlight = Math.max(0, 20 - dist * 3);
    let c = brighten(base, highlight);
    // Vertical rivet dots every 8px
    if (py % 8 === 4 && dist <= 4) c = brighten(c, 30);
    // Edge darkening
    if (dist >= 12) c = darken(c, 20);
    // Subtle noise
    const n = (rand() - 0.5) * 8;
    return brighten(c, n);
}

function texTunnel(px, py, base) {
    // Dark tunnel with faint guide lights on the edges
    const n = (rand() - 0.5) * 6;
    // Edge guide lights
    if (px <= 1 || px >= 30) {
        if (py % 8 >= 3 && py % 8 <= 5) return [40, 35, 55]; // dim purple/blue light
    }
    return brighten(base, n);
}

function texWalkout(px, py, base) {
    // Orange walkout path with directional arrows / stripe pattern
    const stripe = py % 16;
    let c = [...base];
    // Alternating bright/dim stripes for directional feel
    if (stripe < 4) c = brighten(c, 15);
    else if (stripe >= 8 && stripe < 12) c = darken(c, 15);
    // Center highlight line
    if (px >= 14 && px <= 17) c = brighten(c, 20);
    // Edge darkening
    if (px <= 2 || px >= 29) c = darken(c, 25);
    // Noise
    const n = (rand() - 0.5) * 10;
    return brighten(c, n);
}

function texCommentary(px, py, base) {
    // Commentary desk: dark green surface with equipment dots
    let c = [...base];
    const n = (rand() - 0.5) * 10;
    c = brighten(c, n);
    // Desk edge
    if (py <= 1 || py >= 30) c = brighten(c, 15);
    if (px <= 1 || px >= 30) c = brighten(c, 10);
    // Equipment dots (microphones, monitors)
    if ((px === 8 || px === 16 || px === 24) && py >= 12 && py <= 14) {
        c = [60, 60, 65]; // small dark equipment
    }
    if ((px === 12 || px === 20) && py >= 18 && py <= 22) {
        c = [30, 90, 60]; // monitor screens
    }
    return c;
}

function texBarricade(px, py, base) {
    // Metal railing/barricade with horizontal bars
    let c = [...base];
    // Horizontal bars at top and bottom
    if (py <= 3 || py >= 28) {
        c = brighten(c, 20);
        // Highlight on top edge of bar
        if (py === 0 || py === 28) c = brighten(c, 15);
    }
    // Vertical posts every 8px
    else if (px % 8 <= 1) {
        c = brighten(c, 10);
    }
    // Middle horizontal bar
    else if (py >= 14 && py <= 17) {
        c = brighten(c, 15);
        if (py === 14) c = brighten(c, 10);
    }
    // Dark gaps between bars
    else {
        c = darken(c, 15);
    }
    const n = (rand() - 0.5) * 6;
    return brighten(c, n);
}

function texAisle(px, py, base) {
    // Concrete aisle with dashed center line
    let c = [...base];
    const n = (rand() - 0.5) * 12;
    c = brighten(c, n);
    // Dashed center line (yellow)
    if (px >= 15 && px <= 16 && py % 8 < 5) {
        c = [180, 160, 40];
    }
    // Edge marking
    if (px === 0 || px === 31) c = darken(c, 10);
    return c;
}

// ─── TEXTURE DISPATCH ───────────────────────────────────────────────────────
const RENDERERS = {
    WALL:       texWall,
    SEAT_DARK:  texSeat,
    SEAT_MED:   texSeat,
    SEAT_RED:   texSeat,
    FLOOR:      texFloor,
    WALKWAY:    texWalkway,
    RINGSIDE:   texRingside,
    MAT:        texMat,
    MAT_CENTER: texMatCenter,
    CAGE:       texCage,
    CAGE_POST:  texCagePost,
    TUNNEL:     texTunnel,
    WALKOUT:    texWalkout,
    COMMENTARY: texCommentary,
    BARRICADE:  texBarricade,
    AISLE:      texAisle,
};

// ─── MINIMAL PNG ENCODER ─────────────────────────────────────────────────────

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c;
    }
    return t;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
}

function createPNG(w, h, rgba) {
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

    const stride = w * 4 + 1;
    const raw = Buffer.alloc(stride * h);
    for (let y = 0; y < h; y++) {
        raw[y * stride] = 0; // filter: None
        rgba.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4);
    }
    return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', zlib.deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0))]);
}

// ─── GENERATE TILESET IMAGE ─────────────────────────────────────────────────

function generateTilesetImage() {
    const rgba = Buffer.alloc(IMG_W * IMG_H * 4);

    for (let i = 0; i < TILES.length; i++) {
        const tile = TILES[i];
        const renderer = RENDERERS[tile.name];
        const xOff = i * TILE_SIZE;

        // Reset seed per tile for determinism
        _seed = i * 9999 + 42;

        for (let py = 0; py < TILE_SIZE; py++) {
            for (let px = 0; px < TILE_SIZE; px++) {
                const [r, g, b] = renderer(px, py, [...tile.rgb]);
                const idx = ((py * IMG_W) + xOff + px) * 4;
                rgba[idx]     = clamp(r);
                rgba[idx + 1] = clamp(g);
                rgba[idx + 2] = clamp(b);
                rgba[idx + 3] = 255;
            }
        }
    }
    return createPNG(IMG_W, IMG_H, rgba);
}

// ─── GENERATE TILESET JSON (for embedding in tilemap) ────────────────────────

function getTilesetJSON(imagePath) {
    return {
        name:        "ufc_arena",
        firstgid:    1,
        image:       imagePath,
        imagewidth:  IMG_W,
        imageheight: IMG_H,
        tilewidth:   TILE_SIZE,
        tileheight:  TILE_SIZE,
        tilecount:   TILES.length,
        columns:     TILES.length,
        margin:      0,
        spacing:     0,
        tiles:       TILES.map((t, id) => ({
            id,
            properties: [{ name: "collides", type: "bool", value: t.collides }],
        })),
    };
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

const OUT_PATH = path.join(__dirname, '../public/assets/tilesets/ufc_arena.png');
const png = generateTilesetImage();
fs.writeFileSync(OUT_PATH, png);
console.log('Tileset written to:', OUT_PATH);
console.log(`  ${TILES.length} tiles, ${IMG_W}x${IMG_H} px (textured)`);

// Export for use by map generator
module.exports = { TILES, getTilesetJSON, TILE_SIZE };
