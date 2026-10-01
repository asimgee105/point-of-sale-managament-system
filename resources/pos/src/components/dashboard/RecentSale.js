import React, { useEffect } from "react";
import { Card, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap";
import { connect } from "react-redux";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../shared/sharedMethod";
import { recentSales } from "../../store/action/recentSaleDashboardAction";

const RecentSale = (props) => {
    const { recentSales, recentSalesDashboard, frontSetting, allConfigData } =
        props;

    useEffect(() => {
        recentSales();
    }, []);

    return (
        <div className="pt-6">
            <Row className="g-4">
                <div className="col-xxl-12 col-12">
                    <Card>
                        <Card.Header className="pb-0 px-10">
                            <h5 className="mb-0">
                                {getFormattedMessage(
                                    "dashboard.recentSales.title"
                                )}
                            </h5>
                        </Card.Header>
                        <Card.Body className="pt-7 pb-2">
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>
                                            {getFormattedMessage(
                                                "globally.detail.reference"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "customer.title"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "globally.detail.status"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "globally.detail.grand.total"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "globally.detail.paid"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "globally.detail.due"
                                            )}
                                        </th>
                                        <th>
                                            {getFormattedMessage(
                                                "globally.detail.payment.status"
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-nowrap">
                                    {recentSalesDashboard &&
                                        recentSalesDashboard.map(
                                            (recentSale, index) => {
                                                const renderTooltip = (
                                                    props
                                                ) => (
                                                    <Tooltip
                                                        id="button-tooltip"
                                                        {...props}
                                                    >
                                                        {currencySymbolHandling(
                                                            allConfigData,
                                                            frontSetting.value &&
                                                                frontSetting
                                                                    .value
                                                                    .currency_symbol,
                                                            recentSale
                                                                .attributes
                                                                .grand_total
                                                        )}
                                                    </Tooltip>
                                                );

                                                return (
                                                    <tr key={index}>
                                                        <td className="py-4">
                                                            {
                                                                recentSale
                                                                    .attributes
                                                                    .reference_code
                                                            }
                                                        </td>
                                                        <td className="py-4">
                                                            {
                                                                recentSale
                                                                    .attributes
                                                                    .customer_name
                                                            }
                                                        </td>
                                                        <td className="py-4">
                                                            {(recentSale
                                                                .attributes
                                                                .status ==
                                                                1 && (
                                                                <span className="badge bg-light-success">
                                                                    {getFormattedMessage(
                                                                        "status.filter.complated.label"
                                                                    )}
                                                                </span>
                                                            )) ||
                                                                (recentSale
                                                                    .attributes
                                                                    .status ==
                                                                    2 && (
                                                                    <span className="badge bg-light-primary">
                                                                        <span>
                                                                            {getFormattedMessage(
                                                                                "status.filter.pending.label"
                                                                            )}
                                                                        </span>
                                                                    </span>
                                                                )) ||
                                                                (recentSale
                                                                    .attributes
                                                                    .status ==
                                                                    3 && (
                                                                    <span className="badge bg-light-warning">
                                                                        <span>
                                                                            {getFormattedMessage(
                                                                                "status.filter.ordered.label"
                                                                            )}
                                                                        </span>
                                                                    </span>
                                                                ))}
                                                        </td>
                                                        <td className="py-4">
                                                            <OverlayTrigger
                                                                placement="bottom"
                                                                delay={{
                                                                    show: 250,
                                                                    hide: 400,
                                                                }}
                                                                overlay={
                                                                    renderTooltip
                                                                }
                                                            >
                                                                <span>
                                                                    {currencySymbolHandling(
                                                                        allConfigData,
                                                                        frontSetting.value &&
                                                                            frontSetting
                                                                                .value
                                                                                .currency_symbol,
                                                                        recentSale
                                                                            .attributes
                                                                            .grand_total
                                                                    )}
                                                                </span>
                                                            </OverlayTrigger>
                                                        </td>
                                                        <td className="py-4">
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                recentSale
                                                                    .attributes
                                                                    .paid_amount ===
                                                                    null
                                                                    ? "0.00"
                                                                    : recentSale
                                                                          .attributes
                                                                          .paid_amount
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                    recentSale
                                                                        .attributes
                                                                        .due_amount ?? "0.00"
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            {(recentSale
                                                                .attributes
                                                                .payment_status ==
                                                                1 && (
                                                                    <span className="badge bg-light-success">
                                                                        {getFormattedMessage(
                                                                            "globally.detail.paid"
                                                                        )}
                                                                    </span>
                                                                ))
                                                                || (recentSale
                                                                    .attributes
                                                                    .payment_status ==
                                                                    2 && (
                                                                        <span className="badge bg-light-warning">
                                                                            {getFormattedMessage(
                                                                                "payment-status.filter.unpaid.label"
                                                                            )}
                                                                        </span>
                                                                    ))
                                                                || (recentSale
                                                                    .attributes
                                                                    .payment_status ==
                                                                    3 && (
                                                                        <span className="badge bg-light-warning">
                                                                            {getFormattedMessage(
                                                                                "payment-status.filter.partial.label"
                                                                            )}
                                                                        </span>
                                                                    ))}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </Row>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { recentSalesDashboard, allConfigData } = state;
    return { recentSalesDashboard, allConfigData };
};

export default connect(mapStateToProps, { recentSales })(RecentSale);
