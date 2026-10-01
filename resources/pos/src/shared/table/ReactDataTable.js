import React, { useState, useEffect, useMemo } from "react";
import { constants, Filters } from "../../constants";
import { Button, Col } from "react-bootstrap-v5";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import FilterComponent from "../components/FilterComponent";
import { renderSortIcons } from "../../config/sortConfig";
import TableButton from "../action-buttons/TableButton";
import EmptyComponent from "../../components/empty-component/EmptyComponent";
import { getFormattedMessage, placeholderText } from "../sharedMethod";
import DateRangePicker from "../datepicker/DateRangePicker";
import FilterDropdown from "../filterMenu/FilterDropdown";
import { setProductUnitId } from "../../store/action/productUnitIdAction";
import { callFetchDataApi } from "../../store/action/updateBrand";
import { callImportProductApi } from "../../store/action/importProductApiAction";

const ReactDataTable = (props) => {
    const {
        columns,
        AddButton,
        items,
        buttonValue,
        to,
        defaultLimit = Filters.OBJ.page,
        onChange,
        totalRows,
        isCallSaleApi,
        isCallFetchDataApi,
        paginationRowsPerPageOptions = [10, 25, 50, 100],
        isLoading,
        isShowDateRangeField,
        isShowFilterField,
        isWarehouseType,
        warehouseOptions,
        isStatus,
        isPaymentStatus,
        warehouseValue,
        isUnitFilter,
        title,
        isPdf,
        isReportPdf,
        isEXCEL,
        onExcelClick,
        isShowSearch,
        isPaymentType,
        subHeader = true,
        buttonImport,
        goToImport,
        isTransferStatus,
        isExport,
        customerId,
        onReportPdfClick,
        importBtnTitle,
        goToImportProduct,
        isExportDropdown,
        isImportDropdown,
        isProductCategoryFilter,
        isBrandFilter,
        brandFilterTitle,
        productCategoryFilterTitle,
        callAPIAfterImport,
        pagination=true,
        selectableRows=false,
        onSelectedRowsChange,
        isShowDeleteButton = false,
        handleDeleteMultiples,
        clearSelectedRows = false,
        isSubscriptionStatus,
        isPlanPaymentType,
        isPlanType,
        isCashPaymentStatus,
        isPlanNameFilter,
        isQuotationStatus = false,
        userData
    } = props;
    const [perPage, setPerPages] = useState(defaultLimit);
    const [pageSize, setPageSize] = useState(Filters.OBJ.pageSize);
    const [adminName, setAdminName] = useState(Filters.OBJ.adminName);
    const [created_at] = useState(Filters.OBJ.created_at);
    const [order_By, setOrderBy] = useState(Filters.OBJ.order_By);
    const [direction, setDirection] = useState(Filters.OBJ.direction);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [selectDate, setSelectDate] = useState();
    const [paymentStatus, setPaymentStatus] = useState();
    const [paymentType, setPaymentType] = useState();
    const [tableWarehouseValue, setTableWarehouseValue] = useState();
    const [status, setStatus] = useState();
    const [transferStatus, setTransferStatus] = useState();
    const [productUnit, setProductUnit] = useState();
    const [brand, setBrand] = useState();
    const [productCategory, setProductCategory] = useState();
    const [planType, setPlanType] = useState();
    const [planName, setPlanName] = useState();

    const [show, setShow] = useState(false);
    const dispatch = useDispatch();

    const tableColumns = useMemo(() => columns, [items]);

    const filters = {
            order_By: order_By,
            page: currentPage,
            pageSize: pageSize,
            direction: direction,
            adminName: adminName,
            created_at: created_at,
            search:
                searchText === ""
                    ? searchText === 1 || searchText === undefined
                        ? ""
                        : searchText.toLowerCase()
                    : "" || searchText !== ""
                    ? searchText.toLowerCase()
                    : "",
            start_date: selectDate ? selectDate.start_date : null,
            end_date: selectDate ? selectDate.end_date : null,
            payment_status: paymentStatus ? paymentStatus.value : null,
            payment_type: paymentType ? paymentType.value : null,
            status: status ? status.value : null,
            product_unit: productUnit ? productUnit.value : null,
            base_unit: productUnit ? productUnit.value : null,
            warehouse_id: warehouseValue
                ? warehouseValue.value
                : tableWarehouseValue
                ? tableWarehouseValue.value
                : null,
            customer_id: customerId ? customerId : null,
            brand_id: brand ? brand.value : null,
            product_category_id: productCategory ? productCategory.value : null,
            plan_type: planType ? planType.value : null,
            plan_id: planName ? planName.value : null,
            user_id: userData?.value || null,
        };


    useEffect(() => {
        if (isCallFetchDataApi) {
            onChangeDidMount(currentPage);
            dispatch(callFetchDataApi(false));
        }
    }, [isCallFetchDataApi]);

    useEffect(() => {
        if (callAPIAfterImport) {
            onChangeDidMount(currentPage);
            dispatch(callImportProductApi(false));
        }
    }, [callAPIAfterImport]);

    useEffect(() => {
        onChangeDidMount(currentPage);
    }, [
        currentPage,
        status,
        transferStatus,
        productUnit,
        warehouseValue,
        tableWarehouseValue,
        isCallSaleApi,
        paymentStatus,
        paymentType,
        perPage,
        order_By,
        direction,
        searchText,
        pageSize,
        // totalRows,
        selectDate,
        brand,
        productCategory,
        planType,
        planName,
        userData?.value
    ]);

    const handleSearch = (searchText) => {
        handlePageChange(1);
        setSearchText(searchText);
    };

    const onDateSelector = (date) => {
        setSelectDate(date.params);
        dispatch({ type: constants.DATE_ACTION, payload: date.params });
    };

    const customSort = (column, sortDirection) => {
        if (column) {
            setOrderBy(column.sortField);
            setDirection(sortDirection);
        }
    };

    const HandleExceClick =()=>{
        onExcelClick(filters);
    }

    const onResetClick = () => {
        dispatch(setProductUnitId(0));
        setStatus({ label: "All", value: "0" });
        setPaymentStatus({ label: "All", value: "0" });
        setPaymentType({ label: "All", value: "0" });
        setTableWarehouseValue({ label: "All", value: "0" });
        setBrand({ label: "All", value: "0" });
        setProductCategory({ label: "All", value: "0" });
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onWarehouseChange = (obj) => {
        setTableWarehouseValue(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const subHeaderComponentMemo = React.useMemo(() => {
        return (
            <>
                {isShowSearch ? (
                    ""
                ) : (
                    <FilterComponent handleSearch={handleSearch} />
                )}

                <Col
                    xxl={isShowSearch ? 12 : 8}
                    className="d-flex flex-wrap align-items-start justify-content-end gap-2 col-12 col-md-9 col-lg-8"
                >
                    {isShowDeleteButton ? (
                        <div className="text-end mb-2 ">
                            <Button
                                type="button"
                                className="btn-danger"
                                onClick={handleDeleteMultiples}
                            >
                                {getFormattedMessage("delete.multiples.title")}
                            </Button>
                        </div>
                    ) : (
                        ""
                    )}
                    {isShowFilterField ? (
                        <FilterDropdown
                            show={show}
                            productUnit={productUnit}
                            setProductUnitData={setProductUnit}
                            setProductCategoryData={setProductCategory}
                            setBrandData={setBrand}
                            setStatusData={setStatus}
                            setTransferStatusData={setTransferStatus}
                            setPaymentTypeData={setPaymentType}
                            setPaymentStatusData={setPaymentStatus}
                            onExcelClick={onExcelClick}
                            goToImport={goToImport}
                            paymentStatus={paymentStatus}
                            status={status}
                            title={title}
                            isPaymentStatus={isPaymentStatus}
                            paymentType={paymentType}
                            isPaymentType={isPaymentType}
                            isStatus={isStatus}
                            isQuotationStatus={isQuotationStatus}
                            isTransferStatus={isTransferStatus}
                            transferStatus={transferStatus}
                            setShow={setShow}
                            isWarehouseType={isWarehouseType}
                            onWarehouseChange={onWarehouseChange}
                            tableWarehouseValue={tableWarehouseValue}
                            warehouseOptions={warehouseOptions}
                            isUnitFilter={isUnitFilter}
                            onResetClick={onResetClick}
                            isExportDropdown={isExportDropdown}
                            isImportDropdown={isImportDropdown}
                            isProductCategoryFilter={isProductCategoryFilter}
                            isBrandFilter={isBrandFilter}
                            productCategory={productCategory}
                            brandFilterTitle={brandFilterTitle}
                            productCategoryFilterTitle={
                                productCategoryFilterTitle
                            }
                            isSubscriptionStatus={isSubscriptionStatus}
                            isPlanPaymentType={isPlanPaymentType}
                            isPlanType={isPlanType}
                            setPlanTypeData={setPlanType}
                            isCashPaymentStatus={isCashPaymentStatus}
                            isPlanNameFilter={isPlanNameFilter}
                            setPlanNameData={setPlanName}
                            filters={filters}
                        />
                    ) : null}
                    {AddButton}
                    {isPdf ? (
                        <div className="text-end mb-2 ">
                            <Button
                                type="button"
                                variant="primary"
                                href={to}
                                className="btn-light-primary"
                            >
                                {getFormattedMessage("pdf.btn.label")}
                            </Button>
                        </div>
                    ) : (
                        ""
                    )}
                    {isReportPdf ? (
                        <div className="text-end mb-2 ">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => onReportPdfClick()}
                                className="btn-light-primary"
                            >
                                {getFormattedMessage("pdf.btn.label")}
                            </Button>
                        </div>
                    ) : (
                        ""
                    )}
                    {isEXCEL ? (
                        <div className="text-end mb-2 ">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => HandleExceClick(filters)}
                                className="btn-light-primary"
                            >
                                {" "}
                                {getFormattedMessage("excel.btn.label")}
                            </Button>
                        </div>
                    ) : (
                        ""
                    )}
                    {isExport ? (
                        <div className="text-end mb-2">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => onExcelClick()}
                                className="me-md-0 btn-light-primary"
                            >
                                {" "}
                                {getFormattedMessage("product.export.title")}
                            </Button>
                        </div>
                    ) : (
                        ""
                    )}
                    {isShowDateRangeField ? (
                        <DateRangePicker
                            onDateSelector={onDateSelector}
                            selectDate={selectDate}
                        />
                    ) : null}
                    {buttonImport ? (
                        <div className="text-end mb-2  order-2">
                            <Button
                                variant="primary"
                                className="mx-md-1 me-0 btn-light-primary table-button"
                                onClick={goToImport}
                            >
                                {importBtnTitle
                                    ? getFormattedMessage(importBtnTitle)
                                    : getFormattedMessage(
                                          "product.import.title"
                                      )}
                            </Button>
                        </div>
                    ) : (
                        ""
                    )}
                    {buttonValue ? (
                        <TableButton buttonValue={buttonValue} to={to} />
                    ) : null}
                </Col>
            </>
        );
    }, [items, isShowDeleteButton]);

    const onChangeDidMount = () => {
        onChange(filters);
    };

    const handlePerRowsChange = async (recordPerPage) => {
        if (perPage !== recordPerPage) {
            setPerPages(recordPerPage);
            setPageSize(recordPerPage);
        }
    };

    const handlePageChange = (page) => {
        if (currentPage !== page) {
            setCurrentPage(page);
        }

        const pagination = document.getElementById("pagination-first-page");
        if (page === 1 && pagination !== null) {
            pagination.click();
        }
    };

    const paginationComponentOptions = {
        rowsPerPageText: getFormattedMessage(
            "react-data-table.records-per-page.label"
        ),
        rangeSeparatorText: placeholderText(
            "table.of.title"
        ),
    };

    const emptyStateProps = {
        isLoading: isLoading,
    };

    return (
        <div className="data-table pt-0">
            <DataTable
                columns={tableColumns}
                noDataComponent={<EmptyComponent {...emptyStateProps} />}
                data={items}
                paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                pagination={pagination}
                onChangePage={handlePageChange}
                paginationServer={true}
                paginationComponentOptions={paginationComponentOptions}
                subHeader={subHeader}
                onSort={customSort}
                sortServer
                paginationTotalRows={totalRows}
                subHeaderComponent={subHeaderComponentMemo}
                onChangeRowsPerPage={handlePerRowsChange}
                sortIcon={renderSortIcons(direction)}
                persistTableHead={false}
                selectableRows={selectableRows}
                selectableRowDisabled={row => row.name === "admin" || row.id === "totalRows"}
                onSelectedRowsChange={onSelectedRowsChange}
                clearSelectedRows={clearSelectedRows}
            />
        </div>
    );
};

ReactDataTable.propTypes = {
    columns: PropTypes.array,
    paginationRowsPerPageOptions: PropTypes.array,
    defaultLimit: PropTypes.number,
    totalRows: PropTypes.number,
    onChange: PropTypes.func,
    sortAction: PropTypes.func,
};
export default ReactDataTable;
