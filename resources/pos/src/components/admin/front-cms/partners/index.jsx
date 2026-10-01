import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap-v5';
import { connect, useDispatch, useSelector } from 'react-redux';
import ActionButton from '../../../../shared/action-buttons/ActionButton';
import TopProgressBar from '../../../../shared/components/loaders/TopProgressBar';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import TabTitle from '../../../../shared/tab-title/TabTitle';
import ReactDataTable from '../../../../shared/table/ReactDataTable';
import MasterLayout from '../../../MasterLayout';
import PartnerForm from './PartnerForm';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import { fetchFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction';
import AddPartner from './AddPartner';
import DeletePartner from './DeletePartner';

const Partners = ({ isLoading }) => {
    const dispatch = useDispatch();
    const partners = useSelector((state) => state.frontCMS);

    const [localItemsValue, setLocalItemsValue] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [editData, setEditData] = useState();

    useEffect(() => {
        if (partners.length >= 0) {
            const mappedService = partners.map((partner) => ({
                name: partner.name,
                image: partner?.image,
                id: partner.id,
            }));
            setLocalItemsValue(mappedService);
        }
    }, [partners]);

    const goToEditProduct = (data) => {
        setEditData(data);
        setShowEditModal(true)
    };

    const onChange = (filter) => {
        dispatch(fetchFrontCMS(adminApiBaseURL.PARTNERS, adminActionType.FETCH_PARTNERS));
    };

    const columns = [
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row?.name,
            className: "",
            sortField: "name",
            sortable: true,
        },
        {
            name: getFormattedMessage("front-cms.image.title"),
            sortable: false,
            cell: (row) => (
                <div className="d-flex align-items-center">
                    <Button type="button" className="btn-transparent me-2">
                        <img src={row.image} height="50" width="50" alt="Service" className="image-circle" />
                    </Button>
                </div>
            )
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
                    isDeleteIconShow={localItemsValue.length == 1 ? false : true}
                    isDeleteMode={localItemsValue.length == 1 ? false : true}
                    onClickDeleteModel={onClickDeleteModel}
                />
            ),
        },
    ];

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("front-cms.partners.title")} />
            <ReactDataTable
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                pagination={false}
                isShowSearch
                AddButton={partners?.length < 5 && <AddPartner />}
            />
            <PartnerForm show={showEditModal} isEdit={true} data={editData} handleClose={() => setShowEditModal(false)} title={placeholderText("front-cms.edit.partner.title")} />
            <DeletePartner
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { isLoading } = state;
    return { isLoading };
};

export default connect(mapStateToProps)(Partners);