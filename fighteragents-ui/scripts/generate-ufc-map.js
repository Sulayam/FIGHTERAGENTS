#!/usr/bin/env node
/**
 * UFC Stadium Map Generator
 *
 * Reads the existing tilemap JSON (to preserve tileset metadata/collision properties),
 * then replaces the layer data with a UFC stadium layout and writes it back.
 *
 * Usage: node scripts/generate-ufc-map.js
 */

const fs   = require('fs');
const path = require('path');

// ─── TILE GID CONSTANTS ───────────────────────────────────────────────────────
const T = {
    EMPTY:          0,
    FLOOR_OUTER:    126,  // tuxmon: dark tile → outer seating / arena floor
    FLOOR_WALKWAY:  125,  // tuxmon: slightly lighter → walkways / concourse
    FLOOR_INNER:    174,  // tuxmon: warm brown → inner arena near cage
    FLOOR_MAT:      198,  // tuxmon: textured → octagon mat canvas
    CAGE_WALL:      169,  // tuxmon: wall tile (collides:true) → cage fence
};

const COLS      = 40;
const ROWS      = 40;
const TILE_SIZE = 32;

// ─── OCTAGON CAGE ────────────────────────────────────────────────────────────
const CAGE_TOP    = 14;
const CAGE_BOTTOM = 25;
const CAGE_LEFT   = 14;
const CAGE_RIGHT  = 25;
const FLAT_START  = 17;
const FLAT_END    = 22;
const ENTRANCE_COL = 20;

function buildCageWalls() {
    const walls = new Set();
    const add = (r, c) => walls.add(`${r},${c}`);

    for (let c = FLAT_START; c <= FLAT_END; c++) add(CAGE_TOP, c);
    for (let c = FLAT_START; c <= FLAT_END; c++) {
        if (c !== ENTRANCE_COL) add(CAGE_BOTTOM, c);
    }
    for (let r = FLAT_START; r <= FLAT_END; r++) add(r, CAGE_LEFT);
    for (let r = FLAT_START; r <= FLAT_END; r++) add(r, CAGE_RIGHT);

    // Diagonal corners
    add(CAGE_TOP, CAGE_LEFT+1); add(CAGE_TOP, CAGE_LEFT+2);
    add(CAGE_TOP+1, CAGE_LEFT); add(CAGE_TOP+2, CAGE_LEFT);

    add(CAGE_TOP, CAGE_RIGHT-1); add(CAGE_TOP, CAGE_RIGHT-2);
    add(CAGE_TOP+1, CAGE_RIGHT); add(CAGE_TOP+2, CAGE_RIGHT);

    add(CAGE_BOTTOM, CAGE_LEFT+1); add(CAGE_BOTTOM, CAGE_LEFT+2);
    add(CAGE_BOTTOM-1, CAGE_LEFT); add(CAGE_BOTTOM-2, CAGE_LEFT);

    add(CAGE_BOTTOM, CAGE_RIGHT-1); add(CAGE_BOTTOM, CAGE_RIGHT-2);
    add(CAGE_BOTTOM-1, CAGE_RIGHT); add(CAGE_BOTTOM-2, CAGE_RIGHT);

    return walls;
}

function makeGrid(fill = T.EMPTY) { return new Array(COLS * ROWS).fill(fill); }
function set(grid, r, c, v) { if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r * COLS + c] = v; }
function inR(v, lo, hi) { return v >= lo && v <= hi; }

function buildBelowPlayer(cageWalls) {
    const data = makeGrid(T.FLOOR_OUTER);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const wH = inR(r, 5, 11) || inR(r, 28, 34);
            const wV = inR(c, 5, 11) || inR(c, 28, 34);
            if ((wH && inR(c, 5, 34)) || (wV && inR(r, 5, 34))) set(data, r, c, T.FLOOR_WALKWAY);
            if (inR(r, 12, 27) && inR(c, 12, 27)) set(data, r, c, T.FLOOR_INNER);
            if (inR(r, CAGE_TOP+1, CAGE_BOTTOM-1) && inR(c, CAGE_LEFT+1, CAGE_RIGHT-1) && !cageWalls.has(`${r},${c}`))
                set(data, r, c, T.FLOOR_MAT);
            if (c === ENTRANCE_COL && inR(r, CAGE_BOTTOM, 27)) set(data, r, c, T.FLOOR_MAT);
        }
    }
    return data;
}

function buildWorld(cageWalls) {
    const data = makeGrid(T.EMPTY);
    for (const key of cageWalls) { const [r,c] = key.split(',').map(Number); set(data, r, c, T.CAGE_WALL); }
    return data;
}

function tileCenter(col, row) {
    return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
}

function buildObjects() {
    const spawns = [
        { name: "Spawn Point",          col: 20, row: 37 },
        { name: "Conor McGregor",       col: 20, row: 22 },
        { name: "Khabib Nurmagomedov",  col: 20, row: 17 },
        { name: "Islam Makachev",       col: 16, row: 20 },
        { name: "Dana White",           col: 30, row: 20 },
        { name: "Joe Rogan",            col: 28, row: 15 },
        { name: "Charles Olivera",      col: 10, row: 10 },
        { name: "Nate Diaz",            col: 30, row: 30 },
        { name: "Khamzat Chimaev",      col: 20, row: 6  },
        { name: "Rampage Jackson",      col: 6,  row: 32 },
        { name: "Miguel",               col: 34, row: 20 },
        { name: "Chael Sonnen",         col: 35, row: 3  },
        { name: "Nick Diaz",            col: 3,  row: 3  },
    ];
    return spawns.map((s, i) => {
        const { x, y } = tileCenter(s.col, s.row);
        return { height: 0, id: i+1, name: s.name, point: true, rotation: 0, type: "", visible: true, width: 0, x, y };
    });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
const MAP_PATH = path.join(__dirname, '../public/assets/tilemaps/fighteragents-town.json');
const existingMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
const cageWalls = buildCageWalls();

const newMap = {
    ...existingMap,
    layers: [
        { data: buildBelowPlayer(cageWalls), height: ROWS, id: 1, name: "Below Player", opacity: 1, type: "tilelayer", visible: true, width: COLS, x: 0, y: 0 },
        { data: buildWorld(cageWalls),        height: ROWS, id: 2, name: "World",        opacity: 1, type: "tilelayer", visible: true, width: COLS, x: 0, y: 0 },
        { data: makeGrid(T.EMPTY),            height: ROWS, id: 3, name: "Above Player", opacity: 1, type: "tilelayer", visible: true, width: COLS, x: 0, y: 0 },
        { id: 4, name: "Objects", objects: buildObjects(), opacity: 1, type: "objectgroup", visible: true, x: 0, y: 0 },
    ],
};

fs.writeFileSync(MAP_PATH, JSON.stringify(newMap, null, 1));
console.log('UFC stadium map written to:', MAP_PATH);
console.log('Spawns:', buildObjects().length);
