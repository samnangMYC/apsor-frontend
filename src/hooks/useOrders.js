import { useOrdersData } from "./useOrdersData";

export function useOrders() {
  return useOrdersData().orders;
}
