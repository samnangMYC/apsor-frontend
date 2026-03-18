import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { adminProviderColumns } from '../../helper/tableColumn';
import { getAdminProviderText } from '../utils/adminUserPage';
import { ADMIN_CUSTOMER_DEFAULT_SORTING } from '../utils/adminCustomerPage';
import { useLang } from '../../i18n/useLang';
import TableLayout from "../components/TableLayout";
import AdminToast from "../components/AdminToast";
import DeleteModal from "../components/DeleteModal";
import ProviderAvatarModal from "../components/ProviderAvatarModal";
import ProviderFormModal from "../components/ProviderFormModal";
import UserFormModal from "../components/UserFormModal";
import { createAdminProvider, deleteAdminProvider, fetchAdminProviderAvatar, fetchAdminProviders, fetchAdminUsers, updateAdminProvider, updateAdminProviderStatus, uploadAdminProviderAvatar } from "../../api";
import { mapAdminCustomerFilterToApiQuery } from "../utils/adminCategoryPage";



const AdminProviderPage = () => {

    const { lang, t } = useLang("km");

    const text = useMemo(() => getAdminProviderText(lang, t), [lang, t]);


    const [provider, setProvider] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [sorting, setSorting] = useState(ADMIN_CUSTOMER_DEFAULT_SORTING);
    const [creator, setCreator] = useState(null);
    const [editor, setEditor] = useState(null);
    const [avatarEditor, setAvatarEditor] = useState(null);
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


    const loadProviders = useCallback(async () => {
        setIsLoading(true);

        try {
            const result = await fetchAdminProviders(customerQuery);
            const itemsWithAvatars = await Promise.all(
                result.items.map(async (item) => {
                    try {
                        const avatarRecord = await fetchAdminProviderAvatar(item.id);

                        if (!avatarRecord?.imageUrl) {
                            return item;
                        }

                        return { ...item, avatarUrl: avatarRecord.imageUrl };
                    } catch (error) {
                        return item;
                    }
                }),
            );

            setProvider(itemsWithAvatars);
            setTotalRows(result.totalElements);

        } catch (error) {
            console.error("Error fetching providers:", error);
            setProvider([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [customerQuery]);

    useEffect(() => {
        loadProviders();
    }, [loadProviders]);

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
                    return normalizedEmail.includes(keyword.toLowerCase());
                });

                setUserMatches(nextMatches);
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to search users for provider creation:", error);
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

    const refreshProviders = useCallback(async () => {
        if (pagination.pageIndex === 0) {
            await loadProviders();
            return;
        }

        setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, [loadProviders, pagination.pageIndex]);

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
            userId: "",
            userEmailSearch: "",
            displayName: "",
            bio: "",
            businessName: "",
            businessType: "COMPANY",
            establishedAt: "",
            websiteUrl: "",
            facebookUrl: "",
            telegram: "",
        });
    }, []);

    const closeCreator = useCallback(() => {
        setFormError("");
        setCreator(null);
    }, []);

    const openEditor = useCallback((item) => {
        setFormError("");
        setEditor({
            id: item?.id ?? "",
            username: item?.user?.username ?? "",
            email: item?.user?.email ?? "",
            firstName: item?.user?.firstName ?? "",
            lastName: item?.user?.lastName ?? "",
            userType: item?.user?.userType ?? "PROVIDER",
            status: item?.status ?? "DRAFT",
            initialStatus: item?.status ?? "DRAFT",
            phoneNumber: item?.user?.phoneNumber ?? "",
            newPassword: "",
        });
    }, []);

    const closeEditor = useCallback(() => {
        setFormError("");
        setEditor(null);
    }, []);

    const openAvatarEditor = useCallback((item) => {
        setFormError("");
        setAvatarEditor({
            id: item?.id ?? "",
            displayName: item?.displayName ?? "",
            email: item?.user?.email ?? "",
            currentImageUrl: item?.avatarUrl ?? "",
            previewUrl: item?.avatarUrl ?? "",
            file: null,
        });
    }, []);

    const closeAvatarEditor = useCallback(() => {
        setFormError("");
        setAvatarEditor(null);
    }, []);

    const requestDelete = useCallback((item) => {
        setDeleteTarget(item);
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

    const updateEditorField = useCallback((field, value) => {
        setFormError("");
        setEditor((current) => (current ? { ...current, [field]: value } : current));
    }, []);

    const updateAvatarField = useCallback((field, value) => {
        setFormError("");
        setAvatarEditor((current) => (current ? { ...current, [field]: value } : current));
    }, []);

    const handleCreateProvider = useCallback(async () => {
        if (!creator) return;

        const normalizedUserId = Number(creator.userId);
        const requiredValues = [
            normalizedUserId > 0,
            String(creator.displayName || "").trim(),
            String(creator.bio || "").trim(),
            String(creator.businessName || "").trim(),
            String(creator.businessType || "").trim(),
            String(creator.establishedAt || "").trim(),
        ];

        if (requiredValues.some((value) => !value)) {
            setFormError(text.validationRequired);
            return;
        }

        setFormError("");
        setIsSubmitting(true);

        try {
            await createAdminProvider({
                userId: normalizedUserId,
                displayName: String(creator.displayName || "").trim(),
                bio: String(creator.bio || "").trim(),
                businessName: String(creator.businessName || "").trim(),
                businessType: creator.businessType,
                establishedAt: creator.establishedAt,
                websiteUrl: String(creator.websiteUrl || "").trim(),
                facebookUrl: String(creator.facebookUrl || "").trim(),
                telegram: String(creator.telegram || "").trim(),
            });
            setCreator(null);
            showToast("success", text.toastCreateSuccess);
            await refreshProviders();
        } catch (error) {
            console.error("Failed to create provider:", error);
            const responseData = error?.response?.data;
            const message = typeof responseData === "string"
                ? responseData
                : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
            setFormError(message);
            showToast("error", message);
        } finally {
            setIsSubmitting(false);
        }
    }, [creator, refreshProviders, showToast, text.requestFailed, text.toastCreateSuccess, text.validationRequired]);

    const handleUpdateProvider = useCallback(async () => {
        if (!editor?.id) return;

        const requiredValues = [
            String(editor.username || "").trim(),
            String(editor.email || "").trim(),
            String(editor.firstName || "").trim(),
            String(editor.lastName || "").trim(),
            String(editor.userType || "").trim(),
            String(editor.status || "").trim(),
            String(editor.phoneNumber || "").trim(),
        ];

        if (requiredValues.some((value) => !value)) {
            setFormError(text.validationRequired);
            return;
        }

        setFormError("");
        setIsSubmitting(true);

        try {
            await updateAdminProvider(editor.id, {
                username: String(editor.username || "").trim(),
                email: String(editor.email || "").trim(),
                firstName: String(editor.firstName || "").trim(),
                lastName: String(editor.lastName || "").trim(),
                userType: editor.userType,
                phoneNumber: String(editor.phoneNumber || "").trim(),
                password: String(editor.newPassword || "").trim(),
            });

            if (editor.status !== editor.initialStatus) {
                await updateAdminProviderStatus(editor.id, editor.status);
            }

            setEditor(null);
            showToast("success", text.toastUpdateSuccess);
            await refreshProviders();
        } catch (error) {
            console.error("Failed to update provider:", error);
            const responseData = error?.response?.data;
            const message = typeof responseData === "string"
                ? responseData
                : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
            setFormError(message);
            showToast("error", message);
        } finally {
            setIsSubmitting(false);
        }
    }, [editor, refreshProviders, showToast, text.requestFailed, text.toastUpdateSuccess, text.validationRequired]);

    const handleDeleteProvider = useCallback(async () => {
        if (!deleteTarget?.id) return;

        setIsSubmitting(true);

        try {
            await deleteAdminProvider(deleteTarget.id);
            setDeleteTarget(null);
            showToast("success", text.toastDeleteSuccess);
            await refreshProviders();
        } catch (error) {
            console.error("Failed to delete provider:", error);
            const responseData = error?.response?.data;
            const message = typeof responseData === "string"
                ? responseData
                : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
            showToast("error", message);
        } finally {
            setIsSubmitting(false);
        }
    }, [deleteTarget, refreshProviders, showToast, text.requestFailed, text.toastDeleteSuccess]);

    const handleUploadAvatar = useCallback(async () => {
        if (!avatarEditor?.id || !avatarEditor?.file) {
            setFormError(text.validationImageRequired);
            return;
        }

        setFormError("");
        setIsSubmitting(true);

        try {
            await uploadAdminProviderAvatar(avatarEditor.id, avatarEditor.file);
            setAvatarEditor(null);
            showToast("success", text.toastUpdateSuccess);
            await refreshProviders();
        } catch (error) {
            console.error("Failed to upload provider avatar:", error);
            const responseData = error?.response?.data;
            const message = typeof responseData === "string"
                ? responseData
                : responseData?.message || responseData?.error || responseData?.detail || text.requestFailed;
            setFormError(message);
            showToast("error", message);
        } finally {
            setIsSubmitting(false);
        }
    }, [avatarEditor, refreshProviders, showToast, text.requestFailed, text.toastUpdateSuccess, text.validationImageRequired]);

    const columns = useMemo(
        () =>
            adminProviderColumns({
                text,
                onEdit: openEditor,
                onDelete: requestDelete,
                onUploadAvatar: openAvatarEditor,
            }),
        [openAvatarEditor, openEditor, requestDelete, text]
    );

    const addProviderButton = (
        <button
            type="button"
            onClick={openCreator}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-brand-hover md:w-auto md:shrink-0"
        >
            <Plus className="h-4 w-4" />
            {text.addProvider}
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
                title={text.deleteTitle}
                message={text.deleteConfirm}
                confirmLabel={text.delete}
                cancelLabel={text.close}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteProvider}
            />

            <TableLayout
                columns={columns}
                data={provider}
                isLoading={isLoading}
                title={text.provider}
                headerAction={addProviderButton}
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

            <ProviderFormModal
                draft={creator}
                userOptions={userMatches}
                isUserSearchLoading={isUserSearchLoading}
                labels={text}
                errorMessage={formError}
                isSubmitting={isSubmitting}
                onClose={closeCreator}
                onSubmit={handleCreateProvider}
                onFieldUpdate={updateDraftField}
            />

            <ProviderAvatarModal
                draft={avatarEditor}
                labels={text}
                errorMessage={formError}
                isSubmitting={isSubmitting}
                onClose={closeAvatarEditor}
                onSubmit={handleUploadAvatar}
                onFieldUpdate={updateAvatarField}
            />

            <UserFormModal
                draft={editor}
                mode="edit"
                statusOptions={[
                    { value: "DRAFT", label: text.providerStatusDraft },
                    { value: "PENDING_VERIFICATION", label: text.providerStatusPendingVerification },
                    { value: "ACTIVE", label: text.statusActive },
                    { value: "REJECTED", label: text.providerStatusRejected },
                    { value: "SUSPENDED", label: text.statusSuspended },
                    { value: "INACTIVE", label: text.providerStatusInactive },
                ]}
                labels={{
                    ...text,
                    editUser: text.editProvider,
                    users: text.providerManagement,
                }}
                errorMessage={formError}
                isSubmitting={isSubmitting}
                onClose={closeEditor}
                onSubmit={handleUpdateProvider}
                onFieldUpdate={updateEditorField}
            />
        </section>
    )
}

export default AdminProviderPage
