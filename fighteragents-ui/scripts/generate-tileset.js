#!/usr/bin/env node
/**
 * UFC Arena Tileset Generator
 *
 * Creates a 512x32 PNG tileset (16 solid-color 32x32 tiles) for the arena map.
 * No external dependencies — uses only Node.js built-ins (zlib).
 *
 * Usage: node scripts/generate-tileset.js
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── TILE DEFINITIONS ────────────────────────────────────────────────────────
// index → GID = index + 1 (firstgid = 1 in the tilemap JSON)
const TILES = [
    { name: 'WALL',       rgb: [8,   8,   16],  collides: true  },  // 0 → GID 1
    { name: 'SEAT_DARK',  rgb: [26,  26,  58],  collides: false },  // 1 → GID 2
    { name: 'SEAT_MED',   rgb: [42,  42,  90],  collides: false },  // 2 → GID 3
    { name: 'SEAT_RED',   rgb: [138, 26,  26],  collides: false },  // 3 → GID 4
    { name: 'FLOOR',      rgb: [26,  26,  40],  collides: false },  // 4 → GID 5
    { name: 'WALKWAY',    rgb: [58,  58,  74],  collides: false },  // 5 → GID 6
    { name: 'RINGSIDE',   rgb: [42,  42,  56],  collides: false },  // 6 → GID 7
    { name: 'MAT',        rgb: [34,  85,  170], collides: false },  // 7 → GID 8
    { name: 'MAT_CENTER', rgb: [51,  119, 204], collides: false },  // 8 → GID 9
    { name: 'CAGE',       rgb: [119, 119, 119], collides: true  },  // 9 → GID 10
    { name: 'CAGE_POST',  rgb: [204, 170, 0],   collides: true  },  // 10 → GID 11
    { name: 'TUNNEL',     rgb: [37,  37,  48],  collides: false },  // 11 → GID 12
    { name: 'WALKOUT',    rgb: [204, 102, 0],   collides: false },  // 12 → GID 13
    { name: 'COMMENTARY', rgb: [26,  85,  51],  collides: false },  // 13 → GID 14
    { name: 'BARRICADE',  rgb: [68,  68,  68],  collides: true  },  // 14 → GID 15
    { name: 'AISLE',      rgb: [74,  74,  85],  collides: false },  // 15 → GID 16
];

const TILE_SIZE = 32;
const COLS = TILES.length;  // 16 tiles in a row
const IMG_W = COLS * TILE_SIZE;
const IMG_H = TILE_SIZE;

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
        const [r, g, b] = TILES[i].rgb;
        const xOff = i * TILE_SIZE;
        for (let py = 0; py < TILE_SIZE; py++) {
            for (let px = 0; px < TILE_SIZE; px++) {
                const idx = ((py * IMG_W) + xOff + px) * 4;
                rgba[idx]     = r;
                rgba[idx + 1] = g;
                rgba[idx + 2] = b;
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
console.log(`  ${TILES.length} tiles, ${IMG_W}x${IMG_H} px`);

// Export for use by map generator
module.exports = { TILES, getTilesetJSON, TILE_SIZE };
