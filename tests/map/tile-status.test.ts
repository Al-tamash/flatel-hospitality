import assert from "node:assert/strict";
import { INITIAL_TILE_STATUS, nextTileStatus } from "../../lib/map/tile-status";

console.log("Running Tile Status Tests...");

// 1. Starts loading, no error
assert.deepEqual(INITIAL_TILE_STATUS, { loading: true, error: false, okTiles: 0, failedTiles: 0 });

// 2. Every tile failed, then Leaflet fires "load": the error must survive
let s = nextTileStatus(INITIAL_TILE_STATUS, "tileerror");
s = nextTileStatus(s, "tileerror");
s = nextTileStatus(s, "load");
assert.deepEqual({ loading: s.loading, error: s.error }, { loading: false, error: true });

// 3. Normal load: tiles succeed, no error
let ok = nextTileStatus(INITIAL_TILE_STATUS, "tileload");
ok = nextTileStatus(ok, "load");
assert.deepEqual({ loading: ok.loading, error: ok.error }, { loading: false, error: false });

// 4. A few failures among successful tiles are not a map failure
let mixed = nextTileStatus(INITIAL_TILE_STATUS, "tileload");
mixed = nextTileStatus(mixed, "tileerror");
mixed = nextTileStatus(mixed, "load");
assert.equal(mixed.error, false);

// 5. A new loading round resets the loading flag but keeps counts per round
const again = nextTileStatus(s, "loading");
assert.deepEqual({ loading: again.loading, okTiles: again.okTiles }, { loading: true, okTiles: 0 });

console.log("Tile status tests passed");
