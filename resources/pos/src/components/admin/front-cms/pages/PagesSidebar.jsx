import { faClipboard, faClipboardCheck, faClipboardList, faGears, faMoneyBill1Wave, faNotesMedical, faPrescription } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getFormattedMessage } from '../../../../shared/sharedMethod'

const PagesSidebar = () => {
    const location = useLocation();
    return (
        <div className="me-5">
            <ul className="d-flex nav  mb-5 pb-1 overflow-auto flex-nowrap text-nowrap flex-column setting-tab">
                <li className=" nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/pages/terms-conditions") ? 'active' : ''}`} to="/app/admin/front-cms/pages/terms-conditions"><FontAwesomeIcon icon={faClipboard} className="text-gray-600" /> {getFormattedMessage("front-cms.terms-condition.title")}</Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/pages/privacy-policy") ? 'active' : ''}`} to="/app/admin/front-cms/pages/privacy-policy"><FontAwesomeIcon icon={faClipboardList} className="text-gray-600" /> {getFormattedMessage("front-cms.privacy-policy.title")}</Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/pages/refund-policy") ? 'active' : ''}`} to="/app/admin/front-cms/pages/refund-policy"><FontAwesomeIcon icon={faClipboardCheck} className="text-gray-600" /> {getFormattedMessage("front-cms.refund-policy.title")}</Link>
                </li>
            </ul>
        </div>
    )
}

export default PagesSidebar