import React from 'react';
import {Helmet} from 'react-helmet';
import {useSelector} from "react-redux";

const TabTitle = (props) => {
    const { title } = props;
    const {frontSetting, frontCms} = useSelector(state => state);
    const brand = frontSetting?.value || frontCms?.value || {};

    return (
        <Helmet>
            <title>{title + ' '} {frontSetting ? ` | ${brand.app_name || "CloudPOS"}` : ""}</title>
            {brand.app_favicon && <link rel="icon" href={brand.app_favicon} /> }
        </Helmet>
    )
}

export default TabTitle;
