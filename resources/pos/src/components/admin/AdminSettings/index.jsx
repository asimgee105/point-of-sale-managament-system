import React from "react";
import { placeholderText } from "../../../shared/sharedMethod";
import TabTitle from '../../../shared/tab-title/TabTitle';
import MasterLayout from "../../MasterLayout";
import SettingSidebar from "./SettingSidebar";
import SystemSettings from "./SystemSettings";

const Settings = () => {
    return (
        <MasterLayout>
            <TabTitle title={placeholderText("settings.system-settings.title")} />
            <div className="card">
                <div className="card-body">
                    <div className="d-flex flex-column flex-md-row">
                        <div className="flex-shrink-0 pe-md-3 mb-3 mb-md-0">
                            <SettingSidebar/>
                        </div>
                        <div className="flex-grow-1">
                            <SystemSettings />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default Settings;
