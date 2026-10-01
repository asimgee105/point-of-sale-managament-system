import React, { useEffect } from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import { getAdjustmentDetails } from "../../store/action/adjustMentDetailsAction";
import Table from "react-bootstrap/Table";
import moment from "moment";
import {
    getFormattedDate,
    getFormattedMessage,
} from "../../shared/sharedMethod";

const AdjustMentDetail = (props) => {
    const {
        onDetails,
        lgShow,
        setLgShow,
        adjustmentsDetails,
        getAdjustmentDetails,
        allConfigData,
    } = props;

    useEffect(() => {
        if (onDetails !== null) {
            getAdjustmentDetails(onDetails);
        }
    }, [onDetails]);

    const onsetLgShow = () => {
        setLgShow(false);
    };

    return (
        <div>
            <Modal
                size="lg"
                aria-labelledby="example-custom-modal-styling-title"
                show={lgShow}
                onHide={() => onsetLgShow()}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        {getFormattedMessage("adjustments.detail.title")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mw-100 overflow-auto">
                        <div className="mx-2">
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>
                                            {getFormattedMessage(
                                                "react-data-table.date.column.label"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "globally.detail.reference"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "warehouse.title"
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {adjustmentsDetails &&
                                                adjustmentsDetails.attributes &&
                                                getFormattedDate(
                                                    adjustmentsDetails
                                                        .attributes.date,
                                                    allConfigData
                                                )}
                                        </td>
                                        <td>
                                            {adjustmentsDetails &&
                                                adjustmentsDetails.attributes &&
                                                adjustmentsDetails.attributes
                                                    .reference_code}
                                        </td>
                                        <td>
                                            {adjustmentsDetails &&
                                                adjustmentsDetails.attributes &&
                                                adjustmentsDetails.attributes
                                                    .warehouse_name}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                        <div className="mx-2">
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>
                                            {getFormattedMessage(
                                                "product.title"
                                            )}
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
                                            {getFormattedMessage(
                                                "globally.type.label"
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adjustmentsDetails &&
                                        adjustmentsDetails.attributes &&
                                        adjustmentsDetails.attributes.adjustment_items.map(
                                            (item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="word-break-all">
                                                            {item.product.name}
                                                        </td>
                                                        <td>
                                                            {item.product.code}
                                                        </td>
                                                        <td>
                                                            {item.quantity || 0}
                                                        </td>
                                                        <td>
                                                            {item.method_type ==
                                                            1
                                                                ? getFormattedMessage(
                                                                      "addition.title"
                                                                  )
                                                                : getFormattedMessage(
                                                                      "subtraction.title"
                                                                  )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

const mapStateToProps = (state) => {
    const {
        adjustments,
        adjustmentsDetails,
        isLoading,
        frontSetting,
        allConfigData,
    } = state;
    return {
        adjustments,
        adjustmentsDetails,
        isLoading,
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, { getAdjustmentDetails })(
    AdjustMentDetail
);
