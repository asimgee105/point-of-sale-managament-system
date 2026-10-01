import { faCoins, faUserCheck, faUsers, faUserTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'
import React, { useState } from 'react'
import { Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { connect, useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Widget from '../../../shared/Widget/Widget'
import { currencySymbolHandling, getAvatarName, getFormattedDate, getFormattedMessage, placeholderText } from '../../../shared/sharedMethod'
import TabTitle from "../../../shared/tab-title/TabTitle"
import ReactDataTable from '../../../shared/table/ReactDataTable'
import { fetchAdminDashboardData } from '../../../store/action/admin/adminDashboardAction'
import MasterLayout from '../../MasterLayout'
import DashboardChart from './DashboardChart'
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const AdminDashboard = ({ frontSetting , allConfigData }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const adminDashboardData = useSelector((state) => state.adminDashboardData);

  let mappedUsers = [];
  if (adminDashboardData?.recent_users?.length >= 0) {
    mappedUsers = adminDashboardData?.recent_users?.map((user) => ({
      date: getFormattedDate(
        user?.created_at,
        allConfigData
      ),
      time: moment(user?.created_at).format("LT"),
      email: user?.email,
      id: user?.id,
      image: user?.image_url,
      first_name: user?.first_name,
      last_name: user?.last_name,
    }));
  }

  const onChange = (filter) => {
    dispatch(fetchAdminDashboardData());
    setIsLoading(false);
  };

  const columns = [
    {
      name: getFormattedMessage("user-name.title"),
      selector: (row) => row.first_name,
      className: "w-100",
      cell: (row) => {
        const imageUrl = row.image ? row.image : null;
        const lastName = row.last_name ? row.last_name : "";
        return (
          <div className="d-flex align-items-center">
            <div className="me-2">
              <Link to={`/app/admin/users/detail/${row.id}`}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    height="50"
                    width="50"
                    alt="User Image"
                    className="image image-circle image-mini"
                  />
                ) : (
                  <span className="custom-user-avatar fs-5">
                    {getAvatarName(
                      row.first_name + " " + row.last_name
                    )}
                  </span>
                )}
              </Link>
            </div>
            <div className="d-flex flex-column">
              <Link
                to={`/app/admin/users/detail/${row.id}`}
                className="text-decoration-none"
              >
                {row.first_name + " " + lastName}
              </Link>
              <span>{row.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      name: getFormattedMessage(
        "globally.react-table.column.created-date.label"
      ),
      selector: (row) => row.date,
      cell: (row) => {
        return (
          <span className="badge bg-light-info">
            <div className="mb-1">{row.time}</div>
            <div>{row.date}</div>
          </span>
        );
      },
    },
  ];

  const widgetData = [
    {
      title: getFormattedMessage(
        "total.earning.title"
      ),
      value: adminDashboardData?.earning ? adminDashboardData?.earning : 0 || 0,
      permission: "",
      className: "widget-gradient-blue",
      iconClass: "bg-pink-700",
      icon: faCoins,
      currency: true,
    },
    {
      title: getFormattedMessage(
        "total.active.users.title"
      ),
      value: adminDashboardData?.active_users ? adminDashboardData?.active_users : 0 || 0,
      permission: "",
      className: "widget-gradient-purple",
      iconClass: "bg-red-300",
      icon: faUsers,
      currency: false,
      link: "/app/admin/users"
    },
    {
      title: getFormattedMessage(
        "total.subscriptions.title"
      ),
      value: adminDashboardData?.total_subscriptions ? adminDashboardData?.total_subscriptions : 0 || 0,
      permission: "",
      className: "widget-gradient-orange",
      iconClass: "bg-purple-700",
      icon: faUserTag,
      currency: false,
      link: "/app/admin/subscriptions"
    },
    {
      title: getFormattedMessage(
        "active.subscriptions.label"
      ),
      value: adminDashboardData?.active_subscriptions ? adminDashboardData?.active_subscriptions : 0 || 0,
      className: "widget-gradient-lightblue",
      iconClass: "bg-blue-300",
      icon: faUserCheck,
      currency: false,
      link: "/app/admin/subscriptions"
    },
  ];

  const renderTooltip = (msg) => (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {msg}
    </Tooltip>
  );

  return (
    <MasterLayout>
      <TopProgressBar />
      <TabTitle title={placeholderText("dashboard.title")} />
      <Row className="g-4">
        {widgetData.map((w, idx) => {
          const CardContent = (
            <div
              className={`widget-card ${w.className}`}
              style={{ minHeight: "120px" }}
            >
              <div>
                <h2 className="fw-normal text-white mb-1">{w.title}</h2>
                <h2 className="fw-bold text-white mb-0">
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      w.currency
                        ? currencySymbolHandling(frontSetting?.value, frontSetting?.value?.admin_default_currency_symbol, w.value) ?? 0
                        : w.value ?? 0
                    )}
                  >
                    <span>
                      {w.currency
                        ? currencySymbolHandling(frontSetting?.value, frontSetting?.value?.admin_default_currency_symbol, w.value, true) ?? 0
                        : w.value ?? 0}
                    </span>
                  </OverlayTrigger>
                </h2>
              </div>
              <div className="text-white opacity-100">
                <FontAwesomeIcon icon={w.icon} className="dashboard-widget-icon" />
              </div>
            </div>
          );

          return (
            <Col key={idx} xxl={3} xl={4} sm={6} className="mb-4">
              {w.link ? (
                <Link to={w.link} className="text-decoration-none">
                  {CardContent}
                </Link>
              ) : (
                CardContent
              )}
            </Col>
          );
        })}

      </Row>

      <DashboardChart isLoading={isLoading} />

      <div className="col-12 mb-4">
        <Card>
          <Card.Header className="pb-0 px-10">
            <h5 className="mb-0">
              {getFormattedMessage(
                "recent.registered.users.title"
              )}
            </h5>
          </Card.Header>
          <Card.Body className='pt-2'>
            <ReactDataTable
              columns={columns}
              items={mappedUsers}
              onChange={onChange}
              isShowSearch
              subHeader={false}
              pagination={false}
            />
          </Card.Body>
        </Card>
      </div>

    </MasterLayout>
  )
}


const mapStateToProps = (state) => {
  const { frontSetting , allConfigData } = state;
  return { frontSetting , allConfigData };
};

export default connect(mapStateToProps)(AdminDashboard);