import React, { useEffect, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import MasterLayout from '../MasterLayout';
import TopProgressBar from '../../shared/components/loaders/TopProgressBar';
import TabTitle from '../../shared/tab-title/TabTitle';
import ReactDataTable from '../../shared/table/ReactDataTable';
import { getFormattedMessage, getPermission, placeholderText } from '../../shared/sharedMethod';
import CreateVariation from './CreateVariation';
import { fetchVariations } from '../../store/action/variationAction';
import ActionButton from '../../shared/action-buttons/ActionButton';
import EditVariation from './EditVariation';
import DeleteVariation from './DeleteVariation';
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal';
import { Permissions } from '../../constants';


const Variation = (props) => {
    const {
        isCallFetchDataApi,
        allConfigData
    } = props
    const dispatch = useDispatch();
    const { variations, isLoading, totalRecord } = useSelector(state => state);
    const [editModel, setEditModel] = useState(false);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const [variation, setVariation] = useState();

    const handleClose = (item) => {
        setEditModel(!editModel)
        setVariation(item);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        dispatch(fetchVariations(filter, true));
    };


    const itemsValue = variations.length >= 0 && variations.map(variation => ({
        name: variation.attributes.name,
        id: variation.id,
        variation_types: variation.attributes.variation_types,
    }));

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
            name: placeholderText('variation.name'),
            selector: row => row.name,
            sortField: 'name',
            sortable: true,
        },
        {
            name: placeholderText('variation.types.title'),
            selector: row => row.variation_types.map(type => type.name).join(' , '),
        },
        ...(getPermission(allConfigData?.permissions, Permissions.EDIT_VARIATIONS) ||
        getPermission(allConfigData?.permissions, Permissions.DELETE_VARIATIONS) ? [{
            name: getFormattedMessage('react-data-table.action.column.label'),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: row => 
                <ActionButton
                    item={row}
                    goToEditProduct={handleClose}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_VARIATIONS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_VARIATIONS)}
                />
        }] : [])
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('variations.title')} />
            <ReactDataTable 
                columns={columns} 
                items={itemsValue} 
                onChange={onChange} 
                isLoading={isLoading}
                AddButton={getPermission(allConfigData?.permissions, Permissions.CREATE_VARIATIONS) 
                    && <CreateVariation clearSelectedDeleteItem={clearSelectedDeleteItem} />}
                isCallFetchDataApi={isCallFetchDataApi}
                totalRows={totalRecord} 
                selectableRows={getPermission(allConfigData?.permissions, Permissions.DELETE_VARIATIONS)}
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 1}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <EditVariation handleClose={handleClose} show={editModel} variation={variation} />
            <DeleteVariation 
                onClickDeleteModel={onClickDeleteModel} 
                deleteModel={deleteModel}
                onDelete={isDelete} 
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} setNotDeletedItemModal={setNotDeletedItemModal} data={notDeletedItemModal} />
        </MasterLayout>
    )

}

const mapStateToProps = (state) => {
    const { isCallFetchDataApi, allConfigData } = state;
    return { isCallFetchDataApi, allConfigData }
};

export default connect(mapStateToProps)(Variation);
