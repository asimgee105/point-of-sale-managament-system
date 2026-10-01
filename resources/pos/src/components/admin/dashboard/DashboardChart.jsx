import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js"
import React, { useEffect, useState } from 'react'
import { Card, NavDropdown } from 'react-bootstrap'
import { Bar, Line } from 'react-chartjs-2'
import { getFormattedDate, getFormattedMessage, getFormattedMonths, placeholderText } from '../../../shared/sharedMethod'
import { connect, useSelector } from 'react-redux'
import Spinner from '../../../shared/components/loaders/Spinner'

const DashboardChart = ({ frontSetting, allConfigData, isLoading }) => {
    const adminDashboardData = useSelector((state) => state.adminDashboardData);
    const [isLineChart, isSetLineChart] = useState(false);
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    const barChartData = {
        labels: adminDashboardData.earning_chart?.labels.map((date) => getFormattedMonths(date, allConfigData)),
        datasets: [
            {
                label: `${placeholderText("chart.earnings.title")} ( ${frontSetting?.value?.admin_default_currency_symbol ?? ""
                    } )`,
                data: adminDashboardData.earning_chart?.dataset,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;

                    // Fallback color until chartArea is ready
                    if (!chartArea) {
                        return "rgba(54, 162, 235, 0.6)";
                    }

                    // Normal gradient
                    const gradientNormal = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom,
                    );
                    gradientNormal.addColorStop(0, "rgba(72, 126, 247, 0.2)");
                    gradientNormal.addColorStop(1, "rgba(142, 68, 173, 0.9)");

                    // Hover gradient
                    const gradientHover = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom,
                    );
                    gradientHover.addColorStop(0, "rgba(255, 159, 64, 0.2)");
                    gradientHover.addColorStop(1, "rgba(255, 94, 98, 0.9)");

                    return context.active ? gradientHover : gradientNormal;
                },
                borderColor: (context) => {
                    return context.active
                        ? "rgba(247, 104, 75, 0.79)"
                        : "rgba(200, 126, 232, 0.73)";
                },
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        isLoading || !adminDashboardData ? (
            <Spinner />
        ) : (
            <div className="row">
                <div className="col-12 mb-4">
                    <Card>
                        <Card.Header className="pb-0 px-10">
                            <h5 className="mb-0">
                                {getFormattedMessage(
                                    "dashboard.EarningChart.title"
                                )}
                            </h5>
                            <div className="mb-2 chart-dropdown">
                                <NavDropdown
                                    title={<FontAwesomeIcon icon={faBars} />}
                                >
                                    <NavDropdown.Item
                                        href="#/"
                                        onClick={() => isSetLineChart(false)}
                                        className={`${isLineChart === true
                                            ? ""
                                            : "text-primary"
                                            } fs-6`}
                                    >
                                        {getFormattedMessage("bar.title")}
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        href="#"
                                        className={`${isLineChart === true
                                            ? "text-primary"
                                            : ""
                                            } fs-6`}
                                        onClick={() => isSetLineChart(true)}
                                    >
                                        {getFormattedMessage("line.title")}
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div>
                                {isLineChart ? (
                                    <Line options={barChartOptions} data={barChartData} height={70} />
                                ) : (
                                    <Bar options={barChartOptions} data={barChartData} height={70} />
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        )
    )
}

const mapStateToProps = (state) => {
    const { frontSetting , allConfigData } = state;
    return { frontSetting , allConfigData };
};

export default connect(mapStateToProps)(DashboardChart);