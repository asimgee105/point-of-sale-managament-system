import React, { useEffect } from "react";
import { Route, Navigate, Routes } from "react-router-dom";
import { ROLES, Tokens } from "./constants";
import { ProtectedRoute } from "./shared/sharedMethod";
import { route } from "./routes";
import TopProgressBar from "./shared/components/loaders/TopProgressBar";
import { useSelector } from "react-redux";

function AdminApp(props) {
    const { config } = props;
    const token = localStorage.getItem(Tokens.ADMIN);
    const { allConfigData, loginUser } = useSelector((state) => state);

    useEffect(() => {
        if (loginUser?.roles === ROLES.SUPER_ADMIN) {
            window.location.href = "/app";
        }
    }, [loginUser]);

    const prepareRoutes = (config) => {
        const permissions = config;
        let filterRoutes = [];
        route.forEach((route) => {
            if (loginUser.roles !== ROLES.ADMIN && route.path === "store") return;
            if (loginUser.roles !== ROLES.ADMIN && route.path === "payment-methods") return;
            if ((!allConfigData?.use_dynamic_smtp || allConfigData?.use_dynamic_smtp === false) && route.path === "email-configuration") return;
            if (allConfigData && allConfigData?.is_sub_user && route.path.includes("manage-subscription")) return; 
            if (
                (permissions && permissions.indexOf(route.permission) !== -1) ||
                route.permission === ""
            ) {
                filterRoutes.push(route);
            }
        });
        return filterRoutes;
    };

    if (config.length === 0 && token !== null) {
        return <TopProgressBar />;
    }

    const routes = config && prepareRoutes(config);

    return (
        <Routes>
            {routes.map((route, index) => {
                return route.ele ? (
                    <Route
                        key={index}
                        exact={true}
                        path={route.path}
                        element={
                            token !== null ? (
                                <ProtectedRoute
                                    allConfigData={allConfigData}
                                    route={route.path}
                                >
                                    {route.ele}
                                </ProtectedRoute>
                            ) : (
                                <Navigate replace to={"/app"} />
                            )
                        }
                    />
                ) : null;
            })}
            <Route path="*" element={<Navigate replace to={"/app"} />} />
        </Routes>
    );
}

export default AdminApp;
