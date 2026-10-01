import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import ActionButton from '../../../../shared/action-buttons/ActionButton';
import TopProgressBar from '../../../../shared/components/loaders/TopProgressBar';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import TabTitle from '../../../../shared/tab-title/TabTitle';
import ReactDataTable from '../../../../shared/table/ReactDataTable';
import MasterLayout from '../../../MasterLayout';
import ServiceForm from './ServicesForm';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import { fetchFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const Services = ({ totalRecord, isLoading }) => {
    const dispatch = useDispatch();
    const servicesSection = useSelector((state) => state.frontCMS);

    const [localItemsValue, setLocalItemsValue] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState();

    useEffect(() => {
        dispatch(fetchFrontCMS(adminApiBaseURL.FRONT_CMS_SERVICES_SECTION, adminActionType.FETCH_SERVICES_SECTION));
    }, []);

    useEffect(() => {
        if (servicesSection.length >= 0) {
            const mappedService = servicesSection.map((service) => ({
                name: service.title,
                description: service.description,
                icon: service?.icon,
                id: service.id,
            }));
            setLocalItemsValue(mappedService);
        }
    }, [servicesSection]);

    const goToEditService = (data) => {
        setEditData(data);
        setShowEditModal(true)
    };
    const onChange = (filter) => {

    };

    const columns = [
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            className: "",
            sortField: "name",
            sortable: true,
        },
        {
            name: getFormattedMessage("front-cms.image.title"),
            sortable: false,
            cell: (row) => (
                <div className="d-flex align-items-center">
                    <img src={row.icon} height="50" width="50" alt="Service" className="image-circle" />
                </div>
            )
        },
        {
            name: getFormattedMessage("front-cms.description.title"),
            selector: (row) => (
                <div className='ellipsis'>
                    {row.description}
                </div>
            ),
            sortField: "description",
            sortable: true,
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
                    goToEditProduct={() => goToEditService(row)}
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
            <TabTitle title={placeholderText("front-cms.services.title")} />
            <ReactDataTable
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                pagination={false}
                isShowSearch
                subHeader={false}
            />
            <ServiceForm show={showEditModal} data={editData} handleClose={() => setShowEditModal(false)} title={placeholderText("front-cms.edit.services.title")} />
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { totalRecord, isLoading } = state;
    return { totalRecord, isLoading };
};

export default connect(mapStateToProps)(Services);