import { faCircleDollarToSlot, faEnvelope, faGears, faMoneyBill1Wave, faShieldAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getFormattedMessage } from '../../../shared/sharedMethod'

const SettingSidebar = () => {
    const location = useLocation();
    return (
        <div className="me-5">
            <ul className="d-flex nav  mb-5 pb-1 overflow-auto flex-nowrap text-nowrap flex-column setting-tab">
                <li className=" nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/settings") ? 'active' : ''}`} to="/app/admin/settings"><FontAwesomeIcon icon={faGears} className="text-gray-600" /> {getFormattedMessage("general.label")}</Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/payment-settings") ? 'active' : ''}`} to="/app/admin/payment-settings"><FontAwesomeIcon icon={faMoneyBill1Wave} className="text-gray-600" /> {getFormattedMessage("payment-settings.title")}</Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/mail-settings") ? 'active' : ''}`} to="/app/admin/mail-settings"><FontAwesomeIcon icon={faEnvelope} className="text-gray-600" /> {getFormattedMessage("mail-settings.title")}</Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/captcha-settings") ? 'active' : ''}`} to="/app/admin/captcha-settings"><FontAwesomeIcon icon={faShieldAlt} className="text-gray-600" /> {getFormattedMessage("captcha.setting.title")}</Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                    <Link className={`nav-link w-100 d-block ${location.pathname.includes("/currency-settings") ? 'active' : ''}`} to="/app/admin/currency-settings"><FontAwesomeIcon icon={faCircleDollarToSlot} className="text-gray-600" /> {getFormattedMessage("currency-settings.title")}</Link>
                </li>
            </ul>
        </div>
    )
}

export default SettingSidebar