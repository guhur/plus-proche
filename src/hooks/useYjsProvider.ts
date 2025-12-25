import { useEffect, useMemo, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import YPartyKitProvider from "y-partykit/provider";
import * as Y from "yjs";

const PARTYKIT_HOST =
  import.meta.env.VITE_PARTYKIT_HOST ?? "plusproche.guhur.partykit.dev";

interface UseYjsProviderResult {
  ydoc: Y.Doc | null;
  isConnected: boolean;
  isSynced: boolean;
  connectedPeers: number;
}

export function useYjsProvider(roomName: string | null): UseYjsProviderResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState(0);

  const ydoc = useMemo(() => {
    if (!roomName) return null;
    return new Y.Doc();
  }, [roomName]);

  useEffect(() => {
    if (!roomName || !ydoc) return;

    // IndexedDB for local persistence
    const idbProvider = new IndexeddbPersistence(
      `plusproche-${roomName}`,
      ydoc,
    );

    idbProvider.on("synced", () => {
      // Local DB synced
    });

    // PartyKit provider for real-time sync
    const provider = new YPartyKitProvider(
      PARTYKIT_HOST,
      `game-${roomName}`,
      ydoc,
    );

    provider.on("sync", (synced: boolean) => {
      setIsSynced(synced);
      setIsConnected(true);
    });

    provider.on("status", ({ status }: { status: string }) => {
      setIsConnected(status === "connected");
      if (status === "connected") {
        setIsSynced(true);
      }
    });

    // Track connected peers via awareness
    const updatePeers = () => {
      const peers = provider.awareness.getStates().size;
      setConnectedPeers(peers);
    };

    provider.awareness.on("change", updatePeers);
    updatePeers();

    // Fallback: consider synced after connection established
    const syncTimeout = setTimeout(() => {
      if (provider.wsconnected) {
        setIsSynced(true);
        setIsConnected(true);
      }
    }, 1500);

    return () => {
      clearTimeout(syncTimeout);
      provider.awareness.off("change", updatePeers);
      provider.destroy();
      idbProvider.destroy();
      ydoc.destroy();
      setIsConnected(false);
      setIsSynced(false);
      setConnectedPeers(0);
    };
  }, [roomName, ydoc]);

  return {
    ydoc,
    isConnected,
    isSynced,
    connectedPeers,
  };
}
