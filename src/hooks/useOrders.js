import { useEffect, useState } from "react";
import { fetchMyOrders } from "../api";
import { DEFAULT_ORDERS } from "../data/defaultOrders";
import { getStoredOrders, mapApiOrder, subscribeToOrders } from "../utils/orders";

function getFallbackOrders() {
  return getStoredOrders();
}

export function useOrders() {
  const [orders, setOrders] = useState(() => getFallbackOrders());

  useEffect(() => {
    let isMounted = true;

    const syncOrders = async () => {
      try {
        const remoteOrders = await fetchMyOrders();
        if (!isMounted) {
          return;
        }

        setOrders(remoteOrders.map(mapApiOrder));
      } catch (error) {
        console.error("Failed to load customer orders:", error);

        if (!isMounted) {
          return;
        }

        const localOrders = getStoredOrders();
        setOrders(localOrders.length ? localOrders : DEFAULT_ORDERS);
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
