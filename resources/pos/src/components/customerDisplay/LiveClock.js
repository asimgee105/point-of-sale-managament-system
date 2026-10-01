import React, { useEffect, useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { getFormattedDate } from "../../shared/sharedMethod";

const LiveClock = () => {
    const [now, setNow] = useState(moment());
    const { allConfigData } = useSelector((state) => state);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(moment());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getDateString = () => {
        if (
            allConfigData?.enable_nepali_datepicker === "1" ||
            allConfigData?.enable_nepali_datepicker === true
        ) {
            return getFormattedDate(now.toDate(), allConfigData);
        }
        return now.format("dddd, MMMM D, YYYY");
    };

    return (
        <span>
            {getDateString()}, {now.format("h:mm:ss A")}
        </span>
    );
};

export default LiveClock;
