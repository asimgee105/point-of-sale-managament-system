import React, { useEffect, useState } from 'react'
import MasterLayout from '../../../MasterLayout'
import TabTitle from '../../../../shared/tab-title/TabTitle'
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod'
import ReactDataTable from '../../../../shared/table/ReactDataTable'
import { connect, useDispatch, useSelector } from 'react-redux'
import ActionButton from '../../../../shared/action-buttons/ActionButton'
import { adminActionType, adminApiBaseURL } from '../../../../constants'
import { fetchFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction'
import StepsForm from './StepsForm'

const Steps = ({ isLoading }) => {
    const dispatch = useDispatch();
    const steps = useSelector((state) => state.frontCMS);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState();
    const [localItemsValue, setLocalItemsValue] = useState([]);

    const onChange = (filter) => {
        dispatch(fetchFrontCMS(adminApiBaseURL.STEPS, adminActionType.FETCH_STEPS));
    };

    const goToEditStep = (data) => {
        setEditData(data);
        setShowEditModal(true)
    };

    useEffect(() => {
        if (steps.length >= 0) {
            const mappedSteps = steps.map((steps) => ({
                sub_title: steps?.attributes?.sub_title,
                image: steps?.attributes?.image,
                title: steps?.attributes?.title,
                description: steps?.attributes?.description,
                id: steps.id,
            }));
            setLocalItemsValue(mappedSteps);
        }
    }, [steps]);

    const columns = [
        {
            name: getFormattedMessage("front.cms.step.title"),
            selector: (row) => row?.sub_title,
            sortable: false,
        },
        {
            name: getFormattedMessage("front-cms.table.column.title"),
            sortable: false,
            selector: (row) => row?.title,
        },
        {
            name: getFormattedMessage("front-cms.description.title"),
            sortable: false,
            selector: (row) => row?.description,
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
                    goToEditProduct={() => goToEditStep(row)}
                    isEditMode={true}
                    isDeleteMode={false}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("front.cms.step.title")} />
            <ReactDataTable
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                pagination={false}
                isShowSearch
                subHeader={false}
            />
            <StepsForm
                show={showEditModal}
                data={editData}
                handleClose={() => setShowEditModal(false)}
                title={placeholderText("front.cms.edit.step.title")}
            />
        </MasterLayout>
    )
}
const mapStateToProps = (state) => {
    const { isLoading } = state;
    return { isLoading };
};

export default connect(mapStateToProps)(Steps);