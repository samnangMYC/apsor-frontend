import { useSyncExternalStore } from "react";
import { getAllOrders, subscribeToOrders } from "../utils/orders";

export function useOrders() {
  return useSyncExternalStore(subscribeToOrders, getAllOrders, getAllOrders);
}
