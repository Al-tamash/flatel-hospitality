/**
 * Tile loading state for a Leaflet tile layer.
 * Leaflet fires "load" when a round of tiles settles, even if every tile failed,
 * so the map only counts as failed when a round ends with errors and no successes.
 */
export interface TileStatus {
  loading: boolean;
  error: boolean;
  okTiles: number;
  failedTiles: number;
}

export type TileEvent = "loading" | "tileload" | "tileerror" | "load";

export const INITIAL_TILE_STATUS: TileStatus = { loading: true, error: false, okTiles: 0, failedTiles: 0 };

export function nextTileStatus(state: TileStatus, event: TileEvent): TileStatus {
  switch (event) {
    case "loading":
      return { ...state, loading: true, okTiles: 0, failedTiles: 0 };
    case "tileload":
      return { ...state, okTiles: state.okTiles + 1 };
    case "tileerror":
      return { ...state, failedTiles: state.failedTiles + 1 };
    case "load":
      return { ...state, loading: false, error: state.failedTiles > 0 && state.okTiles === 0 };
  }
}
