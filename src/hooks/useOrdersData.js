import { useEffect, useState } from "react";
import { fetchMyOrders } from "../api";
import { DEFAULT_ORDERS } from "../data/defaultOrders";
import {
  getStoredOrders,
  mapApiOrder,
  mergeOrders,
  subscribeToOrders,
} from "../utils/orders";

function getFallbackOrders() {
  return getStoredOrders();
}

export function useOrdersData() {
  const [orders, setOrders] = useState(() => getFallbackOrders());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const syncOrders = async () => {
      if (isMounted) {
        setIsLoading(true);
        setLoadError("");
      }

      try {
        const remoteOrders = await fetchMyOrders();
        if (!isMounted) {
          return;
        }

        const mappedRemoteOrders = remoteOrders.map(mapApiOrder);
        const mergedOrders = mergeOrders(mappedRemoteOrders, getStoredOrders());
        setOrders(mergedOrders.length ? mergedOrders : DEFAULT_ORDERS);
      } catch (error) {
        console.error("Failed to load customer orders:", error);

        if (!isMounted) {
          return;
        }

        const localOrders = getStoredOrders();
        setOrders(localOrders.length ? localOrders : DEFAULT_ORDERS);
        setLoadError("failed");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    syncOrders();
    const unsubscribe = subscribeToOrders(() => {
      syncOrders();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { orders, isLoading, loadError };
}
