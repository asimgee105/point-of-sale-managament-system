import React, { useEffect } from "react";
import { Route, Navigate, Routes } from "react-router-dom";
import { ROLES, Tokens } from "./constants";
import { ProtectedRoute } from "./shared/sharedMethod";
import { adminRoute } from "./routes";
import { useSelector } from "react-redux";

function SuperAdminApp() {
    const token = localStorage.getItem(Tokens.ADMIN);
    const { loginUser } = useSelector((state) => state);

    useEffect(() => {
        if (loginUser?.roles !== ROLES.SUPER_ADMIN) {
            window.location.href = "/";
        }
    }, [loginUser]);

    return (
        <Routes>
            {adminRoute.map((route, index) => {
                return route.ele ? (
                    <Route
                        key={index}
                        exact={true}
                        path={route.path}
                        element={
                            token !== null ? (
                                <ProtectedRoute route={route.path}>
                                    {route.ele}
                                </ProtectedRoute>
                            ) : (
                                <Navigate replace to={"/"} />
                            )
                        }
                    />
                ) : null;
            })}
            <Route path="*" element={<Navigate replace to={"/"} />} />
        </Routes>
    );
}

export default SuperAdminApp;
