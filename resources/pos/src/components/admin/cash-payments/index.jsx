import moment from "moment";
import React, { useState } from "react";
import { connect } from "react-redux";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    formatDate,
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import { isNepaliDatePickerEnabled } from "../../../utils/nepaliDatePickerUtils";
import TabTitle from "../../../shared/tab-title/TabTitle";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import {
    changeCashPaymentStatus,
    fetchCashPayments,
} from "../../../store/action/admin/cashPaymentsAction";
import MasterLayout from "../../MasterLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap-v5";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const CashPayments = ({
    fetchCashPayments,
    cashPayments,
    totalRecord,
    isLoading,
    allConfigData,
    changeCashPaymentStatus,
}) => {
    const isNepaliEnabled = isNepaliDatePickerEnabled();
    
    const onChange = (filter) => {
        fetchCashPayments(filter, true);
    };
    const [showModal, setShowModal] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState(null);

    const handleViewAttachment = (url) => {
        setSelectedAttachment(url);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedAttachment(null);
    };

    const itemsValue =
        cashPayments.length >= 0 &&
        cashPayments.map((cashPayment) => ({
            date: getFormattedDate(
                cashPayment.attributes.created_at,
                allConfigData && allConfigData
            ),
            time: moment(cashPayment.attributes.created_at).format("LT"),
            id: cashPayment.id,
            payable_amount: `${cashPayment.attributes.currency_symbol} ${cashPayment.attributes.payable_amount}`,
            user_name: cashPayment.attributes.user_name,
            paid_via: getFormattedMessage("manually.title"),
            plan_name: cashPayment.attributes.plan_name,
            price: `${cashPayment.attributes.currency_symbol} ${cashPayment.attributes.plan_amount}`,
            end_date: allConfigData && isNepaliEnabled
                ? getFormattedDate(cashPayment.attributes.end_date, allConfigData)
                : formatDate(cashPayment.attributes.end_date),
            start_date: allConfigData && isNepaliEnabled
                ? getFormattedDate(cashPayment.attributes.start_date, allConfigData)
                : formatDate(cashPayment.attributes.start_date),
            status: cashPayment.attributes.status,
            attachment: cashPayment.attributes.attachment,
            notes: cashPayment.attributes.notes,
        }));

    const onStatusChange = (status, id) => {
        const data = {
            status,
        };
        changeCashPaymentStatus(id, data);
    };

    const columns = [
        {
            name: getFormattedMessage("user-name.title"),
            selector: (row) => row.user_name,
            sortField: "user_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("plan-name.title"),
            selector: (row) => row.plan_name,
            sortField: "plan_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.plan.price.title"),
            selector: (row) => row.price,
            sortField: "price",
            sortable: false,
        },
        {
            name: getFormattedMessage("payable-amount.title"),
            selector: (row) => row.payable_amount,
            sortField: "payable_amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.plan.start.date.title"),
            selector: (row) => row.start_date,
            sortField: "start_date",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.plan.end.date.title"),
            selector: (row) => row.end_date,
            sortField: "end_date",
            sortable: false,
        },
        {
            name: getFormattedMessage("payment-settings.manual-attachment.label"),
            sortable: false,
            cell: (row) => (
                <div>
                    {row.attachment ? (
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <FontAwesomeIcon
                                icon={faEye}
                                onClick={() => handleViewAttachment(row.attachment)}
                                className={"text-success fs-6 cursor-pointer"}
                            />
                            <a href={row.attachment} download>
                                <FontAwesomeIcon icon={faDownload} className={"text-primary fs-6 cursor-pointer"} />
                            </a>
                        </div>
                    ) : (
                        <span>-</span>
                    )}
                </div>

            ),
        },
        {
            name: getFormattedMessage("globally.input.note.label"),
            sortable: false,
            cell: (row) => (
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-${row.id}`}>
                            {row.notes || "-"}
                        </Tooltip>
                    }
                >
                    <div className="text-truncate" style={{ maxWidth: "100px", cursor: "pointer" }}>
                        {row.notes ? row.notes : "-"}
                    </div>
                </OverlayTrigger>
            ),
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <ActionButton
                    item={row}
                    isDeleteMode={false}
                    isEditMode={false}
                    isActionDropDown
                    onStatusChange={onStatusChange}
                    isCustomWidth
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("cash-payments.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                isShowFilterField
                isCashPaymentStatus
            />
            <Modal show={showModal} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{getFormattedMessage("payment-settings.manual-attachment.label")}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedAttachment &&
                        (selectedAttachment.endsWith(".jpg") ||
                            selectedAttachment.endsWith(".jpeg") ||
                            selectedAttachment.endsWith(".png") ||
                            selectedAttachment.endsWith(".gif")) ? (
                        <img
                            src={selectedAttachment}
                            alt="attachment preview"
                            className="img-fluid rounded"
                        />
                    ) : (
                        <iframe
                            src={selectedAttachment}
                            title="Attachment Preview"
                            className="w-100"
                            style={{ height: "500px", border: "none" }}
                        ></iframe>
                    )}
                </Modal.Body>
            </Modal>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { cashPayments, totalRecord, isLoading, allConfigData } = state;
    return { cashPayments, totalRecord, isLoading, allConfigData };
};

export default connect(mapStateToProps, {
    fetchCashPayments,
    changeCashPaymentStatus,
})(CashPayments);
