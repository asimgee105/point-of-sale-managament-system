import React from "react";
import { isNepaliDatePickerEnabled } from "../../utils/nepaliDatePickerUtils";
import NepaliDatePickerComponent from "./NepaliDatePicker";
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { registerLocale } from "react-datepicker";
import { enGB, es, de, tr, fr, ar, vi, zhCN } from "date-fns/locale";
import { useSelector } from "react-redux";
import { Tokens } from "../../constants";

const ReactDatePicker = (props) => {
    const { onChangeDate, newStartDate, readOnlyref, placeholder, disablePast, disableFuture = true } = props;
    const [startDate, setStartDate] = React.useState(new Date());
    const [language, setLanguage] = React.useState(enGB);
    const [languageCode, setLanguageCode] = React.useState("enGB");
    const { allConfigData } = useSelector((state) => state);

    const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);
    const { selectedLanguage } = useSelector((state) => state);
    const messages = updatedLanguage ? updatedLanguage : selectedLanguage;

    React.useEffect(() => {
        if (messages === "en") {
            setLanguage(enGB);
            setLanguageCode("enGB");
        } else if (messages === "sp") {
            setLanguage(es);
            setLanguageCode("es");
        } else if (messages === "gr") {
            setLanguage(de);
            setLanguageCode("de");
        } else if (messages === "fr") {
            setLanguage(fr);
            setLanguageCode("fr");
        } else if (messages === "ar") {
            setLanguage(ar);
            setLanguageCode("ar");
        } else if (messages === "tr") {
            setLanguage(tr);
            setLanguageCode("tr");
        } else if (messages === "vi") {
            setLanguage(vi);
            setLanguageCode("vi");
        } else if (messages === "cn") {
            setLanguage(zhCN);
            setLanguageCode("cn");
        } else if (messages === "ne") {
            // For Nepali, we'll use the default enGB locale since date-fns doesn't have native Nepali support
            setLanguage(enGB);
            setLanguageCode("enGB");
        }
    }, [messages]);

    registerLocale(language, languageCode);

    const handleCallback = (date) => {
        setStartDate(date);
        onChangeDate(date);
    };

    React.useEffect(() => {
        setStartDate(startDate);
    }, [startDate]);

    const onDatepickerRef = (el, readOnlyref) => {
        if (el && el.input) {
            el.input.readOnly = readOnlyref !== undefined ? readOnlyref : true;
        }
    };

    const format = (allConfigData) => {
        const format = allConfigData && allConfigData.date_format;
        if (format === "d-m-y") {
            return "dd-MM-yyyy";
        } else if (format === "m-d-y") {
            return "MM-dd-yyyy";
        } else if (format === "y-m-d") {
            return "yyyy-MM-dd";
        } else if (format === "m/d/y") {
            return "MM/dd/yyyy";
        } else if (format === "d/m/y") {
            return "dd/MM/yyyy";
        } else if (format === "y/m/d") {
            return "yyyy/MM/dd";
        } else if (format === "m.d.y") {
            return "MM.dd.yyyy";
        } else if (format === "d.m.y") {
            return "dd.MM.yyyy";
        } else if (format === "y.m.d") {
            return "yyyy.MM.dd";
        } else "yyyy-mm-dd";
    };

    // Check if Nepali datepicker is enabled
    const isNepaliEnabled = isNepaliDatePickerEnabled();

    // If Nepali datepicker is enabled, use the NepaliDatePickerComponent
    if (isNepaliEnabled) {
        return (
            <NepaliDatePickerComponent
                onChangeDate={onChangeDate}
                newStartDate={newStartDate}
                placeholder={placeholder}
            />
        );
    }

    // Otherwise, use the regular React datepicker
    return (
        <div className="position-relative datepicker p-0">
            <DatePicker
                wrapperClassName="w-100"
                locale={language}
                className="datepicker__custom-datepicker px-4"
                name="date"
                selected={
                    newStartDate === null
                        ? null
                        : newStartDate
                        ? newStartDate
                        : startDate
                }
                dateFormat={format(allConfigData)}
                onChange={(date) => handleCallback(date)}
                {...(disableFuture && { maxDate: new Date() })}
                {...(disablePast && { minDate: new Date() })}
                ref={(el) => onDatepickerRef(el, readOnlyref)}
                autoComplete="off"
                placeholderText = {placeholder}
            />
            <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
        </div>
    );
};

export default ReactDatePicker;
