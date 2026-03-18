import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import TableLayout from "../components/TableLayout";
import AdminToast from "../components/AdminToast";
import CustomerFormModal from "../components/CustomerFormModal";
import DeleteModal from "../components/DeleteModal";
import { adminCustomerColumns } from "../../helper/tableColumn";
import { useLang } from "../../i18n/useLang";
import { ADMIN_CUSTOMER_DEFAULT_SORTING } from "../utils/adminCustomerPage";
import { getAdminCustomerText } from "../utils/adminUserPage";
import { createCustomer, fetchAdminCustomers, fetchAdminUsers, hardDeleteCustomer, updateCustomer } from "../../api";
import { mapAdminCustomerFilterToApiQuery } from "../utils/adminCategoryPage";

const AdminCustomerPage = () => {
    const { lang, t } = useLang("km");

    const text = useMemo(() => getAdminCustomerText(lang, t), [lang, t]);

    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [sorting, setSorting] = useState(ADMIN_CUSTOMER_DEFAULT_SORTING);
    const [creator, setCreator] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [userMatches, setUserMatches] = useState([]);
    const [isUserSearchLoading, setIsUserSearchLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [toast, setToast] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const sortQuery = useMemo(() => mapAdminCustomerFilterToApiQuery(sorting), [sorting]);

    const customerQuery = useMemo(() => ({

        pageNumber: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy: sortQuery.sortBy,
        sortOrder: sortQuery.sortOrder,
    }), [
        pagination.pageIndex,
        pagination.pageSize,
        sortQuery.sortBy,
        sortQuery.sortOrder,
    ]);

    const loadCustomers = useCallback(async () => {
        setIsLoading(true);

        try {
            const result = await fetchAdminCustomers(customerQuery);
            setCustomers(result.items);
            setTotalRows(result.totalElements);

        } catch (error) {
            console.error("Error fetching customers:", error);
            setCustomers([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [customerQuery]);


    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    useEffect(() => {
        if (!creator) {
            setUserMatches([]);
            setIsUserSearchLoading(false);
            return undefined;
        }

        const keyword = String(creator.userEmailSearch || "").trim();

        if (!keyword) {
            setUserMatches([]);
            setIsUserSearchLoading(false);
            return undefined;
        }

        let isMounted = true;
        const timerId = window.setTimeout(async () => {
            setIsUserSearchLoading(true);

            try {
                const result = await fetchAdminUsers({
                    keyword,
                    status: "ACTIVE",
                    pageNumber: 0,
                    pageSize: 10,
                    sortBy: "email",
                    sortOrder: "asc",
                });

                if (!isMounted) {
                    return;
                }

                const nextMatches = result.items.filter((user) => {
                    const normalizedEmail = String(user?.email || "").toLowerCase();
                    return user?.userType === "CUSTOMER" && normalizedEmail.includes(keyword.toLowerCase());
                });

                setUserMatches(nextMatches);
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to search users for customer creation:", error);
                    setUserMatches([]);
                }
            } finally {
                if (isMounted) {
                    setIsUserSearchLoading(false);
                }
            }
        }, 300);

        return () => {
            isMounted = false;
            window.clearTimeout(timerId);
        };
    }, [creator]);

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
            const nextSorting =
                typeof updater === "function" ? updater(current) : updater;

            return nextSorting.length
                ? nextSorting
                : ADMIN_CUSTOMER_DEFAULT_SORTING;
        });

        setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, []);

    const refreshCustomers = useCallback(async () => {
        if (pagination.pageIndex === 0) {
            await loadCustomers();
            return;
        }

        setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, [loadCustomers, pagination.pageIndex]);

    const showToast = useCallback((type, message) => {
        setToast({
            type,
            title: type === "error" ? text.toastErrorTitle : text.toastSuccessTitle,
            message,
        });
    }, [text.toastErrorTitle, text.toastSuccessTitle]);

    const openCreator = useCallback(() => {
        setFormError("");
        setCreator({
            mode: "create",
            userId: "",
            userEmailSearch: "",
            dob: "1998-04-12",
            gender: "MALE",
            preferredLanguage: "km-KH",
            bio: "Customer profile for MVP testing. Interested in home services and scheduling.",
            onboardingCompleted: false,
        });
    }, []);

    const openEditor = useCallback((customer) => {
        setFormError("");
        setCreator({
            mode: "edit",
            id: customer?.id ?? "",
            userId: customer?.user?.id ?? "",
            userEmailSearch: customer?.user?.email ?? "",
            dob: customer?.dob ?? "",
            gender: customer?.gender ?? "MALE",
            preferredLanguage: customer?.preferredLanguage ?? "km-KH",
            bio: customer?.bio ?? "",
            onboardingCompleted: Boolean(customer?.onboardingCompleted),
        });
    }, []);

    const closeCreator = useCallback(() => {
        setFormError("");
        setCreator(null);
    }, []);

    const requestDelete = useCallback((customer) => {
        setDeleteTarget(customer);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteTarget(null);
    }, []);

    const updateDraftField = useCallback((field, value) => {
        setFormError("");
        setCreator((current) => {
            if (!current) {
                return current;
            }

            if (field === "selectedUser") {
                return {
                    ...current,
                    userId: value?.id ?? "",
                    userEmailSearch: value?.email ?? "",
                };
            }

            if (field === "userEmailSearch") {
                return {
                    ...current,
                    userEmailSearch: value,
                    userId: current.userEmailSearch === value ? current.userId : "",
                };
            }

            return { ...current, [field]: value };
        });
    }, []);

    const handleCreateCustomer = useCallback(async () => {
        if (!creator) return;

        const normalizedUserId = Number(creator.userId);
        const normalizedBio = String(creator.bio || "").trim();

        if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0 || !creator.dob || !normalizedBio) {
            setFormError(text.validationRequired);
            return;
        }

        setFormError("");
        setIsSubmitting(true);

        try {
            if (creator.mode === "edit") {
                await updateCustomer(creator.id, {
                    dob: creator.dob,
                    gender: creator.gender,
                    preferredLanguage: creator.preferredLanguage,
                    bio: normalizedBio,
                    onboardingCompleted: Boolean(creator.onboardingCompleted),
                });
                showToast("success", text.toastUpdateSuccess);
            } else {
                await createCustomer({
                    userId: normalizedUserId,
                    dob: creator.dob,
                    gender: creator.gender,
                    preferredLanguage: creator.preferredLanguage,
                    bio: normalizedBio,
                    onboardingCompleted: Boolean(creator.onboardingCompleted),
                });
                showToast("success", text.toastCreateSuccess);
            }
            setCreator(null);
            await refreshCustomers();
        } catch (error) {
            console.error(`Failed to ${creator.mode === "edit" ? "update" : "create"} customer:`, error);
            const responseData = error?.response?.data;
            const message = typeof responseData === "string"
                ? responseData
                : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
            setFormError(message);
            showToast("error", message);
        } finally {
            setIsSubmitting(false);
        }
    }, [creator, refreshCustomers, showToast, text.requestFailed, text.toastCreateSuccess, text.toastUpdateSuccess, text.validationRequired]);

    const handleDeleteCustomer = useCallback(async () => {
        if (!deleteTarget?.id) return;

        setIsSubmitting(true);

        try {
            await hardDeleteCustomer(deleteTarget.id);
            setDeleteTarget(null);
            showToast("success", text.toastDeleteSuccess);
            await refreshCustomers();
        } catch (error) {
            console.error("Failed to hard delete customer:", error);
            const responseData = error?.response?.data;
            const message = typeof responseData === "string"
                ? responseData
                : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
            showToast("error", message);
        } finally {
            setIsSubmitting(false);
        }
    }, [deleteTarget, refreshCustomers, showToast, text.requestFailed, text.toastDeleteSuccess]);

    const columns = useMemo(
        () =>
            adminCustomerColumns({
                text,
                onEdit: openEditor,
                onDelete: requestDelete,
            }),
        [openEditor, requestDelete, text]
    );

    const addCustomerButton = (
        <button
            type="button"
            onClick={openCreator}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover md:w-auto md:shrink-0"
        >
            <Plus className="h-4 w-4" />
            {text.addCustomer}
        </button>
    );

    return (
        <section className="min-w-0 space-y-4">
            <AdminToast
                toast={toast}
                onClose={() => setToast(null)}
            />

            <DeleteModal
                open={Boolean(deleteTarget)}
                tone="danger"
                title={text.hardDeleteTitle}
                message={text.hardDeleteConfirm}
                confirmLabel={text.hardDelete}
                cancelLabel={text.close}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteCustomer}
            />

            <TableLayout
                columns={columns}
                data={customers}
                isLoading={isLoading}
                title={text.customer}
                headerAction={addCustomerButton}
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

            <CustomerFormModal
                draft={creator}
                userOptions={userMatches}
                isUserSearchLoading={isUserSearchLoading}
                mode={creator?.mode || "create"}
                labels={text}
                errorMessage={formError}
                isSubmitting={isSubmitting}
                onClose={closeCreator}
                onSubmit={handleCreateCustomer}
                onFieldUpdate={updateDraftField}
            />
        </section>
    );
};

export default AdminCustomerPage;
