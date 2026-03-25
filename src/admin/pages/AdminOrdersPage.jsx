import { useCallback, useEffect, useMemo, useState } from "react";
import AdminToast from "../components/AdminToast";
import TableLayout from "../components/TableLayout";
import { adminOrderColumns } from "../../helper/tableColumn";
import { useLang } from "../../i18n/useLang";
import { fetchAdminOrders, updateAdminOrderStatus } from "../../api";

const ADMIN_ORDER_DEFAULT_SORTING = [{ id: "id", desc: true }];

function getOrderText(lang) {
  return {
    orders: lang === "km" ? "ការបញ្ជាទិញ" : "Orders",
    subtitle: lang === "km"
      ? "មើលការបញ្ជាទិញទាំងអស់ពី backend និងស្វែងរកតាមលេខ order ឬ keyword។"
      : "Browse all orders from the backend and search by order number or keyword.",
    searchPlaceholder: lang === "km" ? "ស្វែងរកការបញ្ជាទិញ" : "Search orders",
    emptyMessage: lang === "km" ? "មិនមានការបញ្ជាទិញទេ។" : "No orders found.",
    id: "ID",
    orderNo: lang === "km" ? "លេខបញ្ជាទិញ" : "Order No",
    service: lang === "km" ? "សេវាកម្ម" : "Service",
    provider: lang === "km" ? "អ្នកផ្តល់សេវា" : "Provider",
    customer: lang === "km" ? "អតិថិជន" : "Customer",
    units: lang === "km" ? "ចំនួន" : "Units",
    subtotal: lang === "km" ? "តម្លៃមុនបញ្ចុះ" : "Subtotal",
    discount: lang === "km" ? "បញ្ចុះតម្លៃ" : "Discount",
    total: lang === "km" ? "សរុប" : "Total",
    status: lang === "km" ? "ស្ថានភាព" : "Status",
    changeStatus: lang === "km" ? "ប្តូរស្ថានភាព" : "Change Status",
    created: lang === "km" ? "បង្កើតនៅ" : "Created",
    updated: lang === "km" ? "ធ្វើបច្ចុប្បន្នភាព" : "Updated",
    note: lang === "km" ? "កំណត់ចំណាំ" : "Note",
    pending: lang === "km" ? "កំពុងរង់ចាំ" : "Pending",
    confirmed: lang === "km" ? "បានបញ្ជាក់" : "Confirmed",
    inProgress: lang === "km" ? "កំពុងដំណើរការ" : "In Progress",
    completed: lang === "km" ? "បានបញ្ចប់" : "Completed",
    canceled: lang === "km" ? "បានបោះបង់" : "Canceled",
    toastSuccessTitle: lang === "km" ? "ជោគជ័យ" : "Success",
    toastErrorTitle: lang === "km" ? "បរាជ័យ" : "Error",
    statusUpdateSuccess: lang === "km" ? "បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពការបញ្ជាទិញ។" : "Order status updated.",
    statusUpdateFailed: lang === "km" ? "មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពការបញ្ជាទិញបានទេ។" : "Unable to update order status.",
  };
}

function mapOrderSortingToApiQuery(sorting) {
  const currentSort = Array.isArray(sorting) && sorting.length ? sorting[0] : ADMIN_ORDER_DEFAULT_SORTING[0];
  return {
    sortBy: currentSort?.id || "id",
    sortOrder: currentSort?.desc ? "desc" : "asc",
  };
}

export default function AdminOrdersPage() {
  const { lang } = useLang("km");
  const text = useMemo(() => getOrderText(lang), [lang]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [sorting, setSorting] = useState(ADMIN_ORDER_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortQuery = useMemo(() => mapOrderSortingToApiQuery(sorting), [sorting]);
  const orderQuery = useMemo(() => ({
    keyword: debouncedSearchValue,
    pageNumber: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: sortQuery.sortBy,
    sortOrder: sortQuery.sortOrder,
  }), [
    debouncedSearchValue,
    pagination.pageIndex,
    pagination.pageSize,
    sortQuery.sortBy,
    sortQuery.sortOrder,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timerId);
  }, [searchValue]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAdminOrders(orderQuery);
      setOrders(result.items);
      setTotalRows(result.totalElements);
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
      setOrders([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [orderQuery]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!toast?.message) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timerId);
  }, [toast]);

  const handleSortingChange = useCallback((updater) => {
    setSorting((current) => {
      const nextSorting = typeof updater === "function" ? updater(current) : updater;
      return nextSorting.length ? nextSorting : ADMIN_ORDER_DEFAULT_SORTING;
    });

    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({
      type,
      title: type === "error" ? text.toastErrorTitle : text.toastSuccessTitle,
      message,
    });
  }, [text.toastErrorTitle, text.toastSuccessTitle]);

  const handleStatusChange = useCallback(async (order, nextStatus) => {
    const orderId = order?.id;
    const currentStatus = String(order?.status || "").toUpperCase();
    const normalizedStatus = String(nextStatus || "").toUpperCase();

    if (!orderId || !normalizedStatus || normalizedStatus === currentStatus) {
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      await updateAdminOrderStatus(orderId, normalizedStatus);
      setOrders((current) => current.map((item) => (
        Number(item?.id) === Number(orderId)
          ? { ...item, status: normalizedStatus }
          : item
      )));
      showToast("success", text.statusUpdateSuccess);
    } catch (error) {
      console.error("Failed to update order status:", error);
      showToast(
        "error",
        error?.response?.data?.message
        || error?.response?.data?.error
        || text.statusUpdateFailed,
      );
      await loadOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  }, [loadOrders, showToast, text.statusUpdateFailed, text.statusUpdateSuccess]);

  const columns = useMemo(
    () => adminOrderColumns({ text, lang, onStatusChange: handleStatusChange, updatingOrderId }),
    [handleStatusChange, lang, text, updatingOrderId],
  );

  return (
    <section className="min-w-0 space-y-4">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <TableLayout
        columns={columns}
        data={orders}
        isLoading={isLoading}
        title={text.orders}
        subtitle={text.subtitle}
        searchPlaceholder={text.searchPlaceholder}
        emptyMessage={text.emptyMessage}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        controlledPagination={pagination}
        onControlledPaginationChange={setPagination}
        controlledSorting={sorting}
        onControlledSortingChange={handleSortingChange}
        totalRows={totalRows}
        pageCount={Math.max(1, Math.ceil(totalRows / pagination.pageSize))}
        manualPagination
        manualSorting
        manualFiltering
      />
    </section>
  );
}
