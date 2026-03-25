import { useEffect, useState } from "react";
import { fetchMyOrders } from "../api";
import { DEFAULT_ORDERS } from "../data/defaultOrders";
import { getStoredOrders, mapApiOrder, mergeOrders, subscribeToOrders } from "../utils/orders";

function getFallbackOrders() {
  return mergeOrders(getStoredOrders(), DEFAULT_ORDERS);
}

export function useOrders() {
  const [orders, setOrders] = useState(() => getFallbackOrders());

  useEffect(() => {
    let isMounted = true;

    const syncOrders = async () => {
      const localOrders = getStoredOrders();

      try {
        const remoteOrders = await fetchMyOrders();
        if (!isMounted) {
          return;
        }

        setOrders(mergeOrders(localOrders, remoteOrders.map(mapApiOrder)));
      } catch (error) {
        console.error("Failed to load customer orders:", error);

        if (!isMounted) {
          return;
        }

        setOrders(mergeOrders(localOrders, DEFAULT_ORDERS));
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

  return orders;
}
