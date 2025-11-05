import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * StoreContext keeps the currently selected store id and its info document
 * from the Firestore `info` collection.
 */
const StoreContext = createContext(undefined);

const normalizeStoreId = (rawId) => {
  if (!rawId) {
    return null;
  }

  return Array.isArray(rawId) ? rawId[0] ?? null : rawId;
};

export const StoreProvider = ({ storeId, children }) => {
  const normalizedStoreId = normalizeStoreId(storeId);
  const [store, setStore] = useState(null);
  const [status, setStatus] = useState(normalizedStoreId ? "loading" : "idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!normalizedStoreId) {
      setStore(null);
      setStatus("idle");
      setError(null);
      return undefined;
    }

    setStatus("loading");
    const unsubscribe = onSnapshot(
      doc(db, "info", normalizedStoreId),
      (snapshot) => {
        if (snapshot.exists()) {
          setStore({ id: snapshot.id, ...snapshot.data() });
        } else {
          setStore(null);
        }
        setStatus("success");
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError);
        setStatus("error");
      }
    );

    return unsubscribe;
  }, [normalizedStoreId]);

  const value = useMemo(
    () => ({
      store,
      storeId: normalizedStoreId,
      status,
      error,
    }),
    [store, normalizedStoreId, status, error]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }

  return context;
};
