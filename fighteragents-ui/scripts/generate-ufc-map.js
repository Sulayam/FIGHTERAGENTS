#!/usr/bin/env node
/**
 * UFC Stadium Map Generator — Madison Square Garden style
 *
 * Generates an 80x80 tilemap with:
 *   - Central octagon cage with blue canvas mat
 *   - Ringside / commentary area
 *   - Floor seating (VIP, red)
 *   - Upper bowl seating (dark/medium alternating rows)
 *   - Concourse walkways between sections
 *   - North & south entrance tunnels with fighter walkout paths
 *   - Radial aisles dividing seating into sections
 *   - Outer arena walls
 *
 * Requires: generate-tileset.js (run first to create the PNG)
 * Usage:    node scripts/generate-ufc-map.js
 */

const fs   = require('fs');
const path = require('path');
const { TILES, getTilesetJSON, TILE_SIZE } = require('./generate-tileset');

// ─── GID CONSTANTS (index + 1) ──────────────────────────────────────────────
const G = {};
TILES.forEach((t, i) => { G[t.name] = i + 1; });
G.EMPTY = 0;

// ─── MAP DIMENSIONS ─────────────────────────────────────────────────────────
const COLS = 80;
const ROWS = 80;
const CX   = 40;  // center col
const CY   = 40;  // center row

// ─── OCTAGON GEOMETRY ────────────────────────────────────────────────────────
// Octagonal distance: a point is at octDist D from center if
//   D = max(|dx|, |dy|, (|dx|+|dy|) * 0.7071)
// The cage sits at octDist ≈ 10 from center.
const CAGE_RADIUS  = 10;
const CAGE_THICK   = 0.9;   // wall is ~1 tile thick

function octDist(dx, dy) {
    return Math.max(Math.abs(dx), Math.abs(dy), (Math.abs(dx) + Math.abs(dy)) * 0.7071);
}

// 8 cage post positions (vertices of the octagon)
function isCagePost(dx, dy) {
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const od = octDist(dx, dy);
    if (od < CAGE_RADIUS - CAGE_THICK || od > CAGE_RADIUS + CAGE_THICK) return false;
    // Posts are where two wall segments meet — at the 45° transitions
    const a = Math.atan2(ady, adx);
    const atCorner = Math.abs(a - Math.PI / 4) < 0.15 ||
                     Math.abs(a) < 0.08 ||
                     Math.abs(a - Math.PI / 2) < 0.08;
    return atCorner && od >= CAGE_RADIUS - 0.5 && od <= CAGE_RADIUS + 0.5;
}

// ─── TUNNEL & AISLE HELPERS ─────────────────────────────────────────────────
// North/south entrance tunnels (3 tiles wide, centered on CX)
function isTunnel(r, c) {
    if (c < CX - 1 || c > CX + 1) return false;
    // South tunnel: from row 52 to edge
    if (r >= 52 && r <= 79) return true;
    // North tunnel: from edge to row 28
    if (r >= 0 && r <= 28) return true;
    return false;
}

// Fighter walkout path (inside tunnel, narrower — center col only)
function isWalkout(r, c) {
    if (c !== CX) return false;
    if (r >= 52 && r <= 79) return true;
    if (r >= 0 && r <= 28) return true;
    return false;
}

// Radial aisles (E/W, 3 tiles wide, centered on CY)
function isEWAisle(r, c) {
    if (r < CY - 1 || r > CY + 1) return false;
    const dx = Math.abs(c - CX);
    return dx >= 14 && dx <= 36;
}

// Cross aisles (diagonal-ish, thinner)
function isDiagAisle(r, c) {
    const dx = c - CX, dy = r - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 14 || dist > 36) return false;
    // 4 diagonal aisles at ±45°
    const diff = Math.abs(Math.abs(dx) - Math.abs(dy));
    return diff <= 1;
}

// Commentary desk (east side of ringside, small block)
function isCommentary(r, c) {
    return r >= CY - 2 && r <= CY + 2 && c >= CX + 12 && c <= CX + 13;
}

// ─── CAGE ENTRANCE (south gate, 3 tiles wide) ──────────────────────────────
function isCageGate(dx, dy) {
    return dx >= -1 && dx <= 1 && dy > 0;
}

// ─── LAYER BUILDERS ─────────────────────────────────────────────────────────

function buildBelowPlayer() {
    const data = new Array(COLS * ROWS);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const dx = c - CX, dy = r - CY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const od = octDist(dx, dy);

            let tile = G.FLOOR;

            // ── Layered zones from outside in ─────────────────────────

            // Outer wall zone
            if (dist >= 38) {
                tile = G.WALL;
            }
            // Outer concourse
            else if (dist >= 35) {
                tile = G.WALKWAY;
            }
            // Upper bowl seating
            else if (dist >= 24) {
                tile = (r % 2 === 0) ? G.SEAT_DARK : G.SEAT_MED;
            }
            // Inner concourse (ring between upper and floor seating)
            else if (dist >= 22) {
                tile = G.WALKWAY;
            }
            // Floor seating (VIP, closer to ring)
            else if (dist >= 14) {
                tile = (r % 2 === 0) ? G.SEAT_RED : G.SEAT_DARK;
            }
            // Barricade ring (visual on below layer)
            else if (dist >= 13) {
                tile = G.RINGSIDE;
            }
            // Ringside area
            else if (od >= CAGE_RADIUS + CAGE_THICK) {
                tile = G.RINGSIDE;
            }
            // Cage wall zone (floor behind cage)
            else if (od >= CAGE_RADIUS - CAGE_THICK) {
                tile = G.RINGSIDE;
            }
            // Octagon mat
            else {
                tile = (dist < 3) ? G.MAT_CENTER : G.MAT;
            }

            // ── Overlays ──────────────────────────────────────────────

            // Entrance tunnels override seating/walkway
            if (isTunnel(r, c) && dist >= 12) {
                tile = isWalkout(r, c) ? G.WALKOUT : G.TUNNEL;
            }

            // E/W aisles
            if (isEWAisle(r, c) && dist >= 14 && dist < 37) {
                tile = G.AISLE;
            }

            // Diagonal aisles
            if (isDiagAisle(r, c) && dist >= 14 && dist < 37) {
                tile = G.AISLE;
            }

            // Commentary desk
            if (isCommentary(r, c)) {
                tile = G.COMMENTARY;
            }

            data[r * COLS + c] = tile;
        }
    }
    return data;
}

function buildWorld() {
    const data = new Array(COLS * ROWS).fill(G.EMPTY);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const dx = c - CX, dy = r - CY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const od = octDist(dx, dy);

            // Entrance tunnels — gap in walls
            if (isTunnel(r, c)) continue;

            // E/W aisles near the barricade — allow passage
            if (isEWAisle(r, c) && dist >= 13 && dist < 14) continue;

            // Outer arena walls
            if (dist >= 38) {
                data[r * COLS + c] = G.WALL;
                continue;
            }

            // Barricade ring between ringside and seating
            if (dist >= 13 && dist < 14) {
                data[r * COLS + c] = G.BARRICADE;
                continue;
            }

            // Cage walls
            if (od >= CAGE_RADIUS - CAGE_THICK && od < CAGE_RADIUS + CAGE_THICK) {
                // Skip cage gate (south entrance)
                if (isCageGate(dx, dy)) continue;

                if (isCagePost(dx, dy)) {
                    data[r * COLS + c] = G.CAGE_POST;
                } else {
                    data[r * COLS + c] = G.CAGE;
                }
            }
        }
    }
    return data;
}

function buildAbovePlayer() {
    return new Array(COLS * ROWS).fill(G.EMPTY);
}

// ─── SPAWN POINTS ───────────────────────────────────────────────────────────

function px(col, row) {
    return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
}

function buildObjects() {
    const spawns = [
        // Player enters from the south tunnel
        { name: "Spawn Point",          col: CX,     row: 72 },

        // Fighters inside the octagon
        { name: "Conor McGregor",       col: CX - 2, row: CY + 4 },
        { name: "Khabib Nurmagomedov",  col: CX + 2, row: CY - 4 },
        { name: "Islam Makachev",       col: CX - 5, row: CY },

        // Ringside / commentary
        { name: "Dana White",           col: CX + 8,  row: CY - 5 },
        { name: "Joe Rogan",            col: CX + 12, row: CY },

        // Floor seating
        { name: "Nate Diaz",            col: CX - 10, row: CY + 16 },
        { name: "Charles Olivera",      col: CX + 10, row: CY - 16 },

        // Concourse / walkway
        { name: "Khamzat Chimaev",      col: CX - 20, row: CY },
        { name: "Rampage Jackson",      col: CX,      row: CY + 24 },

        // Upper bowl seating
        { name: "Chael Sonnen",         col: CX + 20, row: CY - 26 },
        { name: "Nick Diaz",            col: CX - 20, row: CY - 26 },
        { name: "Miguel",               col: CX + 24, row: CY + 10 },
    ];

    return spawns.map((s, i) => ({
        height: 0, id: i + 1, name: s.name, point: true,
        rotation: 0, type: "", visible: true, width: 0,
        ...px(s.col, s.row),
    }));
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

// Generate tileset first
console.log('Generating tileset…');
require('./generate-tileset');

console.log('Generating 80×80 UFC stadium map…');

const mapJSON = {
    compressionlevel: -1,
    width:  COLS,
    height: ROWS,
    infinite: false,
    orientation: "orthogonal",
    renderorder: "right-down",
    tilewidth:  TILE_SIZE,
    tileheight: TILE_SIZE,
    type: "map",
    version: "1.10",
    tiledversion: "1.11.1",
    nextlayerid: 5,
    nextobjectid: 100,
    properties: [{ name: "edges", type: "string", value: "clamped" }],
    tilesets: [getTilesetJSON("../tilesets/ufc_arena.png")],
    layers: [
        { data: buildBelowPlayer(), height: ROWS, id: 1, name: "Below Player", opacity: 1, type: "tilelayer", visible: true, width: COLS, x: 0, y: 0 },
        { data: buildWorld(),       height: ROWS, id: 2, name: "World",        opacity: 1, type: "tilelayer", visible: true, width: COLS, x: 0, y: 0 },
        { data: buildAbovePlayer(), height: ROWS, id: 3, name: "Above Player", opacity: 1, type: "tilelayer", visible: true, width: COLS, x: 0, y: 0 },
        { id: 4, name: "Objects", objects: buildObjects(), opacity: 1, type: "objectgroup", visible: true, x: 0, y: 0 },
    ],
};

const MAP_PATH = path.join(__dirname, '../public/assets/tilemaps/fighteragents-town.json');
fs.writeFileSync(MAP_PATH, JSON.stringify(mapJSON, null, 1));

const spawns = buildObjects();
console.log(`Map written to: ${MAP_PATH}`);
console.log(`  Size    : ${COLS}×${ROWS} tiles (${COLS * TILE_SIZE}×${ROWS * TILE_SIZE} px)`);
console.log(`  Octagon : radius ${CAGE_RADIUS} tiles from center (${CX}, ${CY})`);
console.log(`  Spawns  : ${spawns.length} points`);
console.log(`  Tileset : ufc_arena.png (${TILES.length} tiles)`);
