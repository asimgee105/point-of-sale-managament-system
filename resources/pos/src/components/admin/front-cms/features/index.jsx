import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import ActionButton from '../../../../shared/action-buttons/ActionButton';
import TopProgressBar from '../../../../shared/components/loaders/TopProgressBar';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import TabTitle from '../../../../shared/tab-title/TabTitle';
import ReactDataTable from '../../../../shared/table/ReactDataTable';
import MasterLayout from '../../../MasterLayout';
import FeatureForm from './FeatureForm';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import { fetchFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const Features = ({ isLoading }) => {
    const dispatch = useDispatch();
    const features = useSelector((state) => state.frontCMS);

    const [localItemsValue, setLocalItemsValue] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState();

    useEffect(() => {
        if (features.length >= 0) {
            const mappedService = features.map((feature) => ({
                title: feature?.attributes?.title,
                image: feature?.attributes?.image,
                description: feature?.attributes?.description,
                points: feature?.attributes?.points && JSON.parse(feature?.attributes?.points),
                id: feature.id,
            }));
            setLocalItemsValue(mappedService);
        }
    }, [features]);

    const goToEditProduct = (data) => {
        setEditData(data);
        setShowEditModal(true)
    };

    const onChange = (filter) => {
        dispatch(fetchFrontCMS(adminApiBaseURL.FEATURES, adminActionType.FETCH_FEATURES));
    };

    const columns = [
        {
            name: getFormattedMessage("front-cms.table.column.title"),
            selector: (row) => row?.title,
            className: "",
            sortable: false,
        },
        {
            name: getFormattedMessage("front-cms.description.title"),
            selector: (row) => row?.description,
            className: "",
            sortable: false,
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "120px",
            cell: (row) => (
                <ActionButton
                    item={row}
                    goToEditProduct={() => goToEditProduct(row)}
                    isEditMode={true}
                    isDeleteIconShow={false}
                    isDeleteMode={false}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("features.title")} />
            <ReactDataTable
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                pagination={false}
                isShowSearch
                subHeader={false}
            />
            <FeatureForm show={showEditModal} isEdit={true} data={editData} handleClose={() => setShowEditModal(false)} />
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { isLoading } = state;
    return { isLoading };
};

export default connect(mapStateToProps)(Features);