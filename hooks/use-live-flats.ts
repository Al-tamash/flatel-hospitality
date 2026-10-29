"use client";

import * as React from "react";
import type { RoomDetail } from "@/lib/mock-rooms";
import { buildFlatDefinitions, type FlatDefinition } from "@/lib/booking/flat-definitions";

type Status = "loading" | "ready" | "error";

/** One shared request per page load; a retry clears it. */
let inventoryRequest: Promise<RoomDetail[]> | null = null;

function fetchInventory(): Promise<RoomDetail[]> {
  if (!inventoryRequest) {
    inventoryRequest = fetch("/api/inventory")
      .then((res) => res.json())
      .then((data: { success?: boolean; units?: RoomDetail[] }) => {
        if (!data.success || !Array.isArray(data.units)) throw new Error("Inventory unavailable");
        return data.units;
      })
      .catch((error) => {
        inventoryRequest = null;
        throw error;
      });
  }
  return inventoryRequest;
}

/** Live flat types for the selector. Never falls back to sample data. */
export function useLiveFlats(): { flats: FlatDefinition[] | null; status: Status; retry: () => void } {
  const [rooms, setRooms] = React.useState<RoomDetail[] | null>(null);
  const [status, setStatus] = React.useState<Status>("loading");
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    fetchInventory()
      .then((units) => {
        if (cancelled) return;
        setRooms(units);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const flats = React.useMemo(() => (rooms ? buildFlatDefinitions(rooms) : null), [rooms]);

  const retry = React.useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  return { flats, status, retry };
}
