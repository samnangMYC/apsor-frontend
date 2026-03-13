import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TableLayout from '../components/TableLayout';
import { adminCustomerColumns } from '../../helper/tableColumn';
import { useLang } from '../../i18n/useLang';
import { ADMIN_CUSTOMER_DEFAULT_SORTING } from '../utils/adminCustomerPage';
import { getAdminCustomerText } from '../utils/adminUserPage';
import { fetchAdminCustomers } from '../../api';
import { mapAdminCustomerFilterToApiQuery } from '../utils/adminCategoryPage';

const AdminCustomerPage = () => {
    const { lang, t } = useLang("km");

    const text = useMemo(() => getAdminCustomerText(lang, t), [lang, t]);

    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [sorting, setSorting] = useState(ADMIN_CUSTOMER_DEFAULT_SORTING);
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
            setTotalRows(result.total);

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

    const columns = useMemo(
        () =>
            adminCustomerColumns({
                text,
                // onEdit: (category) => openEditor(category, "edit"),
                // onEditImage: (category) => openEditor(category, "image"),
                // onDelete: requestDelete,
            }),
        [text]
    );

    return (
        <section className="min-w-0 space-y-4">
            <TableLayout
                columns={columns}
                data={customers}
                isLoading={isLoading}
                title="Customers"
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
};

export default AdminCustomerPage;