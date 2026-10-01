import React, { useEffect, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import ActionButton from '../../../shared/action-buttons/ActionButton'
import DeleteModel from '../../../shared/action-buttons/DeleteModel'
import TopProgressBar from '../../../shared/components/loaders/TopProgressBar'
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod'
import TabTitle from '../../../shared/tab-title/TabTitle'
import ReactDataTable from '../../../shared/table/ReactDataTable'
import { deleteInquiry, fetchInquries } from '../../../store/action/admin/inquiriesAction'
import MasterLayout from '../../MasterLayout'
import InquiryDetails from './InquiryDetails'
import NotDeletedItemModal from '../../../shared/action-buttons/NotDeletedItemModal'

const Inquiries = ({ totalRecord, isLoading, isCallFetchDataApi }) => {
    const dispatch = useDispatch();
    const inquries = useSelector((state) => state.inquries);

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [inquiryData, setInquiryData] = useState();
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const mappedInquries = inquries?.length > 0 && inquries.map((inquiry) => ({
        name: inquiry?.attributes?.name,
        email: inquiry?.attributes?.email,
        subject: inquiry?.attributes?.subject,
        message: inquiry?.attributes?.message,
        id: inquiry?.id,
    }));


    const onChange = (filter) => {
        dispatch(fetchInquries(filter));
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const deleteClick = () => {
        dispatch(deleteInquiry({ id: isDelete }, setNotDeletedItemModal, clearSelectedDeleteItem));
        onClickDeleteModel(false);
    };

    const showInquiry = (data) => {
        setInquiryData(data);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectedRowsChange = ({ selectedRows }) => {
        const ids = selectedRows.map(row => row.id);
        setSelectedIds(ids);
    };

    const handleDeleteMultiples = () => {
        setDeleteModel(!deleteModel);
        setIsDelete(selectedIds);
    };

    useEffect(() => {
        if (clearSelectedRows) {
            setClearSelectedRows(false);
        }
    }, [clearSelectedRows]);

    const clearSelectedDeleteItem = () => {
        setClearSelectedRows(true);
        setSelectedIds([]);
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
            name: getFormattedMessage("globally.input.email.label"),
            selector: (row) => row?.email,
            className: "",
            sortField: "email",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.input.subject.label"),
            selector: (row) => row?.subject,
            className: "",
            sortField: "subject",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.input.message.label"),
            selector: (row) => <div className='ellipsis'>
                {row?.message}
            </div>,
            sortField: "message",
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
                    isViewIcon={true}
                    goToDetailScreen={() => showInquiry(row)}
                    item={row}
                    isEditMode={false}
                    onClickDeleteModel={onClickDeleteModel}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("inquiries.title")} />
            <ReactDataTable
                columns={columns}
                items={mappedInquries}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 1}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
                isCallFetchDataApi={isCallFetchDataApi}
            />
            {deleteModel && (
                <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                    deleteClick={deleteClick} name={getFormattedMessage('inquiries.title')} />
            )}
            {showModal && (
                <InquiryDetails data={inquiryData} show={showModal} handleClose={handleCloseModal} />
            )}
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} setNotDeletedItemModal={setNotDeletedItemModal} data={notDeletedItemModal} />
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { totalRecord, isLoading, isCallFetchDataApi } = state;
    return { totalRecord, isLoading, isCallFetchDataApi };
};

export default connect(mapStateToProps)(Inquiries);