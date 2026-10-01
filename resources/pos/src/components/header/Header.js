import React, { useEffect, useState } from "react";
import { Image, Nav, Navbar } from "react-bootstrap-v5";
import { connect, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ROLES, Tokens } from "../../constants/index";
import { logoutAction } from "../../store/action/authAction";
import ChangePassword from "../auth/change-password/ChangePassword";
import { getAvatarName } from "../../shared/sharedMethod";
import {
    getFormattedMessage,
    getFormattedDate,
} from "../../shared/sharedMethod";
import { updateLanguage } from "../../store/action/updateLanguageAction";
import User from "../../assets/images/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMaximize,
    faMinimize,
    faUser,
    faLock,
    faRightFromBracket,
    faAngleDown,
    faLanguage,
    faMoneyBill,
    faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { Dropdown } from "react-bootstrap";
import { productQuantityReportAction } from "../../store/action/paymentQuantityReport";
import LanguageModel from "../user-profile/LanguageModel";
import PosRegisterModel from '../posRegister/PosRegisterModel.js';
import StoreWarningModal from './StoreWarningModal.jsx';
import SubscriptionWarningModal from './SubscriptionWarningModal.jsx';
import TwoFactorAuth from '../TwoFactorAuth/TwoFactorAuth.jsx';

const Header = (props) => {
    const { logoutAction, newRoutes } = props;
    const navigate = useNavigate();
    const users = localStorage.getItem(Tokens.USER);
    const firstName = localStorage.getItem(Tokens.FIRST_NAME);
    const lastName = localStorage.getItem(Tokens.LAST_NAME);
    const token = localStorage.getItem(Tokens.ADMIN);
    const imageUrl = localStorage.getItem(Tokens.USER_IMAGE_URL);
    const image = localStorage.getItem(Tokens.IMAGE);
    const updatedEmail = localStorage.getItem(Tokens.UPDATED_EMAIL);
    const updatedFirstName = localStorage.getItem(Tokens.UPDATED_FIRST_NAME);
    const updatedLastName = localStorage.getItem(Tokens.UPDATED_LAST_NAME);
    const [deleteModel, setDeleteModel] = useState(false);
    const [languageModel, setLanguageModel] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPosRegisterModel, setShowPosRegisterModel] = useState(false);
    const [storeWarningModal, setStoreWarningModal] = useState(false);
    const [subscriptionWarningModal, setSubscriptionWarningModal] =
        useState(false);
    const [twoFactorModal, setTwoFactorModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { allConfigData, loginUser } = useSelector((state) => state);
    const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);

    const onClickDeleteModel = () => {
        setDeleteModel(!deleteModel);
    };

    useEffect(() => {
        setStoreWarningModal(
            loginUser.roles !== ROLES.SUPER_ADMIN && allConfigData?.store_modal
        );
        setSubscriptionWarningModal(
            allConfigData?.is_sub_user && allConfigData?.is_expired
        );
    }, [allConfigData]);

    const onClickLanguageModel = () => {
        setLanguageModel(!languageModel);
    };

    const onClickTwoFactorModal = () => {
        setTwoFactorModal(!twoFactorModal);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString(
            updatedLanguage == "gr"
                ? "de"
                : updatedLanguage === "sp"
                ? "ES"
                : updatedLanguage === "cn"
                ? "zh"
                : updatedLanguage,
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    const formatDate = (date) => {
        if (
            allConfigData?.enable_nepali_datepicker === "1" ||
            allConfigData?.enable_nepali_datepicker === true
        ) {
            return getFormattedDate(date, allConfigData);
        }
        return date.toLocaleDateString(
            updatedLanguage == "gr"
                ? "de"
                : updatedLanguage === "sp"
                ? "ES"
                : updatedLanguage === "cn"
                ? "zh"
                : updatedLanguage,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    const onLogOut = () => {
        logoutAction(token, navigate);
    };

    const onClickManageSubscription = () => {
        navigate("/app/user/manage-subscription");
    };

    const onProfileClick = () => {
        navigate(
            loginUser?.roles == ROLES.SUPER_ADMIN
                ? "/app/admin/profile/edit"
                : "/app/user/profile/edit"
        );
    };

    const fullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleClickPOSBtn = () => {
        setShowPosRegisterModel(true);
    };

    const onClickshowPosRegisterModel = () => {
        setShowPosRegisterModel(false);
    };

    const handleLogoutButton = () => {
        logoutAction(token, navigate);
    };

    return (
        <Navbar
            collapseOnSelect
            expand="lg"
            className="align-items-stretch ms-auto py-1"
        >
            <div className="d-flex align-items-stretch justify-content-center">
                <Nav className="align-items-stretch justify-content-between flex-row">
                    <ul className="nav align-items-center flex-nowrap">
                        {!window.location.pathname.includes("report") &&
                            !window.location.pathname.includes("settings") && (
                                <li className="px-sm-3 px-2 d-flex align-items-center">
                                    <div className="text-end">
                                        <div className="text-primary fw-bolder fs-5">
                                            {formatTime(currentTime)}
                                        </div>
                                        <div className="fs-6">
                                            {formatDate(currentTime)}
                                        </div>
                                    </div>
                                </li>
                            )}
                        <li>
                            {loginUser?.roles != ROLES.SUPER_ADMIN &&
                            newRoutes
                                .map((route) => route.permission)
                                .filter(
                                    (routeName) =>
                                        routeName === "manage_pos_screen"
                                )[0] === "manage_pos_screen" ? (
                                allConfigData?.open_register === true ? (
                                    <button
                                        onClick={handleClickPOSBtn}
                                        className="px-sm-3 px-2 d-flex text-decoration-none pos-button pos-button-highlight"
                                    >
                                        {getFormattedMessage(
                                            "header.pos.title"
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        to="/app/user/pos"
                                        className="px-sm-3 px-2 d-flex text-decoration-none pos-button pos-button-highlight"
                                    >
                                        {getFormattedMessage(
                                            "header.pos.title"
                                        )}
                                    </Link>
                                )
                            ) : (
                                ""
                            )}
                        </li>
                        {isFullscreen === true ? (
                            <li
                                className="px-sm-3 px-2 cursor-pointer"
                                onClick={() => fullScreen()}
                            >
                                <FontAwesomeIcon
                                    icon={faMinimize}
                                    className="text-primary fs-2"
                                />
                            </li>
                        ) : (
                            <li
                                className="px-sm-3 px-2 cursor-pointer"
                                onClick={() => fullScreen()}
                            >
                                <FontAwesomeIcon
                                    icon={faMaximize}
                                    className="text-primary fs-2"
                                />
                            </li>
                        )}
                    </ul>
                    <Dropdown className="d-flex align-items-stretch">
                        <Dropdown.Toggle
                            className="hide-arrow bg-transparent border-0 p-0 d-flex align-items-center"
                            id="dropdown-basic"
                        >
                            <div className="d-flex align-items-center justify-content-center">
                                {imageUrl || image ? (
                                    <Image
                                        src={
                                            imageUrl ? imageUrl : image || User
                                        }
                                        className="image image-circle image-tiny"
                                        alt="user-avatar"
                                        height="50"
                                        width="50"
                                    />
                                ) : (
                                    <span className="custom-user-avatar">
                                        {getAvatarName(
                                            updatedFirstName && updatedLastName
                                                ? updatedFirstName +
                                                      " " +
                                                      updatedLastName
                                                : firstName + " " + lastName
                                        )}
                                    </span>
                                )}
                                <span className="ms-2 text-gray-600 d-none d-sm-block">
                                    {updatedFirstName && updatedLastName ? (
                                        <>
                                            {updatedFirstName +
                                                " " +
                                                updatedLastName}
                                        </>
                                    ) : (
                                        <> {firstName + " " + lastName}</>
                                    )}
                                </span>
                            </div>
                            <FontAwesomeIcon
                                icon={faAngleDown}
                                className="text-gray-600 ms-2 d-none d-sm-block"
                            />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <div className="text-center pb-1 border-bottom mb-4">
                                <div className="text-center text-decoration-none pb-5 w-100 align-items-center">
                                    <div className="image image-circle w-100 image-tiny pb-5">
                                        {imageUrl || image ? (
                                            <img
                                                src={
                                                    imageUrl ? imageUrl : image
                                                }
                                                className="img-fluid"
                                                height="50"
                                                width="50"
                                                alt="user-avatar"
                                            />
                                        ) : (
                                            <span className="user_avatar mx-auto">
                                                {getAvatarName(
                                                    updatedFirstName &&
                                                        updatedLastName
                                                        ? updatedFirstName +
                                                              " " +
                                                              updatedLastName
                                                        : firstName +
                                                              " " +
                                                              lastName
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="d-flex flex-column">
                                        <h3 className="text-gray-900">
                                            {updatedFirstName &&
                                            updatedLastName ? (
                                                <>
                                                    {updatedFirstName +
                                                        " " +
                                                        updatedLastName}
                                                </>
                                            ) : (
                                                <>
                                                    {" "}
                                                    {firstName + " " + lastName}
                                                </>
                                            )}
                                        </h3>
                                        <h4 className="mb-0 fw-400 fs-6">
                                            {updatedEmail
                                                ? updatedEmail
                                                : users}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <Dropdown.Item
                                onClick={(e) => onProfileClick(e)}
                                className="px-5 fs-6"
                            >
                                <span className="dropdown-icon me-4 text-gray-600">
                                    <FontAwesomeIcon icon={faUser} />
                                </span>
                                {getFormattedMessage(
                                    "header.profile-menu.profile.label"
                                )}
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={onClickDeleteModel}
                                className="px-5 fs-6"
                            >
                                <span className="dropdown-icon me-4 text-gray-600">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                {getFormattedMessage(
                                    "header.profile-menu.change-password.label"
                                )}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={onClickTwoFactorModal}
                                className='px-5 fs-6'>
                                <span className='dropdown-icon me-4 text-gray-600'>
                                    <FontAwesomeIcon icon={faShieldAlt} />
                                </span>
                                {getFormattedMessage('two-factor-authentication.title')}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={onClickLanguageModel}
                                className='px-5 fs-6'>
                                <span className='dropdown-icon me-4 text-gray-600'>
                                    <FontAwesomeIcon icon={faLanguage} />
                                </span>
                                {getFormattedMessage(
                                    "header.profile-menu.change-language.label"
                                )}
                            </Dropdown.Item>
                            {loginUser?.roles !== ROLES.SUPER_ADMIN &&
                            !allConfigData?.is_sub_user ? (
                                <Dropdown.Item
                                    onClick={onClickManageSubscription}
                                    className="px-5 fs-6"
                                >
                                    <span className="dropdown-icon me-4 text-gray-600">
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    </span>
                                    {getFormattedMessage(
                                        "header.profile-menu.manage-subscriptions.label"
                                    )}
                                </Dropdown.Item>
                            ) : (
                                ""
                            )}
                            <Dropdown.Item
                                onClick={(e) => onLogOut(e)}
                                className="px-5 fs-6"
                            >
                                <span className="dropdown-icon me-4 text-gray-600">
                                    <FontAwesomeIcon
                                        icon={faRightFromBracket}
                                    />
                                </span>
                                {getFormattedMessage(
                                    "header.profile-menu.logout.label"
                                )}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </div>
            {deleteModel === true && (
                <ChangePassword
                    deleteModel={deleteModel}
                    onClickDeleteModel={onClickDeleteModel}
                />
            )}

            {languageModel === true && (
                <LanguageModel
                    languageModel={languageModel}
                    onClickLanguageModel={onClickLanguageModel}
                />
            )}

            {storeWarningModal && (
                <StoreWarningModal
                    storeWarningModal={storeWarningModal}
                    handleLogoutButton={handleLogoutButton}
                />
            )}

            {subscriptionWarningModal && (
                <SubscriptionWarningModal
                    subscriptionWarningModal={subscriptionWarningModal}
                    handleLogoutButton={handleLogoutButton}
                />
            )}

            <PosRegisterModel
                showPosRegisterModel={showPosRegisterModel}
                onClickshowPosRegisterModel={onClickshowPosRegisterModel}
            />

            {twoFactorModal && <TwoFactorAuth isOpen={twoFactorModal} closeModal={onClickTwoFactorModal} />}
        </Navbar>
    );
};

const mapStateToProps = (state) => {
    const { selectedLanguage, productQuantityReport } = state;
    return { selectedLanguage, productQuantityReport };
};

export default connect(mapStateToProps, {
    logoutAction,
    updateLanguage,
    productQuantityReportAction,
})(Header);
