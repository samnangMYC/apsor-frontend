import React, { useCallback, useEffect, useMemo, useState } from "react";
import { adminProviderColumns } from '../../helper/tableColumn';
import { getAdminProviderText } from '../utils/adminUserPage';
import { ADMIN_CUSTOMER_DEFAULT_SORTING } from '../utils/adminCustomerPage';
import { useLang } from '../../i18n/useLang';
import TableLayout from "../components/TableLayout";
import { fetchAdminProviders } from "../../api";
import { mapAdminCustomerFilterToApiQuery } from "../utils/adminCategoryPage";



const AdminProviderPage = () => {

    const { lang, t } = useLang("km");

    const text = useMemo(() => getAdminProviderText(lang, t), [lang, t]);


    const [provider, setProvider] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [sorting, setSorting] = useState(ADMIN_CUSTOMER_DEFAULT_SORTING);

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


    const loadProviders = useCallback(async (customerQuery) => {
        setIsLoading(true);

        try {
            const result = await fetchAdminProviders(customerQuery);
            console.log("Fetched providers:", result);
            setProvider(result.items);
            setTotalRows(result.total);

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


    const columns = useMemo(
        () =>
            adminProviderColumns({
                text
            }),
        [text]
    );
    return (
        <section className="min-w-0 space-y-4">
            <TableLayout
                columns={columns}
                data={provider}
                isLoading={isLoading}
                title={text.provider}
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
    )
}

export default AdminProviderPage