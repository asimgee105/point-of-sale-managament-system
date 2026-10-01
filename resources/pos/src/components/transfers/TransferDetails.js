import React, { useEffect } from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import { Table } from "reactstrap";
import { fetchTransferDetails } from "../../store/action/transferDetailsAction";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
} from "../../shared/sharedMethod";

const TransferDetails = (props) => {
    const {
        onDetails,
        lgShow,
        setLgShow,
        frontSetting,
        transferDetails,
        fetchTransferDetails,
        allConfigData,
    } = props;

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        if (onDetails !== null) {
            fetchTransferDetails(onDetails);
        }
    }, [onDetails]);

    const onsetLgShow = () => {
        setLgShow(false);
    };

    return (
        <div>
            <Modal
                className="tranfer_model"
                size="lg"
                aria-labelledby="example-custom-modal-styling-title"
                show={lgShow}
                onHide={() => onsetLgShow()}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        {getFormattedMessage("transfer.details.title")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table bordered hover className="overflow-auto w-100">
                        <tbody>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "react-data-table.date.column.label"
                                    )}
                                </td>
                                <td>
                                    {transferDetails &&
                                        transferDetails.attributes &&
                                        getFormattedDate(
                                            transferDetails.attributes.date,
                                            allConfigData
                                        )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "globally.detail.reference"
                                    )}
                                </td>
                                <td>
                                    {transferDetails &&
                                        transferDetails.attributes &&
                                        transferDetails.attributes
                                            .reference_code}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "transfer.from-warehouse.title"
                                    )}
                                </td>
                                <td>
                                    {
                                        transferDetails?.attributes
                                            ?.from_warehouse?.name
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "transfer.to-warehouse.title"
                                    )}
                                </td>
                                <td>
                                    {
                                        transferDetails?.attributes
                                            ?.to_warehouse?.name
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "globally.detail.grand.total"
                                    )}
                                </td>
                                <td>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        transferDetails?.attributes?.grand_total
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "globally.detail.status"
                                    )}
                                </td>
                                <td>
                                    {(transferDetails?.attributes?.status ==
                                        1 &&
                                        getFormattedMessage(
                                            "status.filter.complated.label"
                                        )) ||
                                        (transferDetails?.attributes?.status ==
                                            2 &&
                                            getFormattedMessage(
                                                "status.filter.sent.label"
                                            )) ||
                                        (transferDetails?.attributes?.status ==
                                            3 &&
                                            getFormattedMessage(
                                                "status.filter.pending.label"
                                            ))}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    
                    <div className="overflow-auto">
                        <Table bordered hover className="w-100">
                            <thead>
                                <tr>
                                    <th>
                                        {getFormattedMessage("product.title")}
                                    </th>
                                    <th>
                                        {getFormattedMessage(
                                            "product.product-details.code-product.label"
                                        )}
                                    </th>
                                    <th>
                                        {getFormattedMessage(
                                            "globally.detail.quantity"
                                        )}
                                    </th>
                                    <th>
                                        {getFormattedMessage("pos.subtotal.small.title")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transferDetails &&
                                    transferDetails.attributes &&
                                    transferDetails.attributes?.transfer_items.map(
                                        (item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{item.product.name}</td>
                                                    <td>{item.product.code}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>
                                                        {currencySymbolHandling(
                                                            allConfigData,
                                                            currencySymbol,
                                                            item.sub_total
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { transferDetails, isLoading, frontSetting, allConfigData } = state;
    return { transferDetails, isLoading, frontSetting, allConfigData };
};

export default connect(mapStateToProps, {
    fetchTransferDetails,
})(TransferDetails);
