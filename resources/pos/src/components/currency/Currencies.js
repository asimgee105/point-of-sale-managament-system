import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import MasterLayout from '../MasterLayout';
import {fetchCurrencies} from '../../store/action/currencyAction';
import ReactDataTable from '../../shared/table/ReactDataTable';
import DeletCurrency from './DeletCurrency';
import CreateCurrency from './CreateCurrency';
import EditCurrency from './EditCurrency';
import TabTitle from '../../shared/tab-title/TabTitle';
import {getFormattedMessage, placeholderText} from '../../shared/sharedMethod';
import ActionButton from '../../shared/action-buttons/ActionButton';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal';

const Currencies = (props) => {
    const {fetchCurrencies, currencies, totalRecord, isLoading, isCallFetchDataApi} = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [toggle, setToggle] = useState(false);
    const [currency, setCurrency] = useState();
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const handleClose = (item = null) => {
        setToggle(!toggle);
        setCurrency(item);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchCurrencies(filter, true);
    };

    const itemsValue = currencies.length >= 0 && currencies.map(item => ({
        name: item.attributes.name,
        code: item.attributes.code,
        symbol: item.attributes.symbol,
        id: item.id
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
            name: getFormattedMessage('globally.input.name.label'),
            selector: row => row.name,
            sortable: true,
            sortField: 'name',
        },
        {
            name: getFormattedMessage('globally.code.label'),
            selector: row => row.code,
            sortField: 'code',
            sortable: true,
            cell: row => {
                return <span className='badge bg-light-info'>
                            <span>{row.code}</span>
                        </span>
            }
        },
        {
            name: getFormattedMessage('currency.modal.input.symbol.label'),
            sortField: 'symbol',
            sortable: true,
            cell: row => {
                return <span className='badge bg-light-primary'>
                            <span>{row.symbol}</span>
                        </span>
            }
        },
        {
            name: getFormattedMessage('react-data-table.action.column.label'),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: row => {
                return <ActionButton item={row} goToEditProduct={handleClose} isEditMode={true}
                                     onClickDeleteModel={onClickDeleteModel}/>
            }
        }
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('currencies.title')}/>
            <ReactDataTable 
                columns={columns} 
                items={itemsValue} 
                onChange={onChange} 
                isLoading={isLoading}
                totalRows={totalRecord} 
                AddButton={<CreateCurrency clearSelectedDeleteItem={clearSelectedDeleteItem}/>}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 1}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
                isCallFetchDataApi={isCallFetchDataApi}
            />
            <EditCurrency handleClose={handleClose} show={toggle} currency={currency}/>
            <DeletCurrency 
                onClickDeleteModel={onClickDeleteModel} 
                deleteModel={deleteModel} 
                onDelete={isDelete} 
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} setNotDeletedItemModal={setNotDeletedItemModal} data={notDeletedItemModal} />
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const {currencies, totalRecord, isLoading, isCallFetchDataApi} = state;
    return {currencies, totalRecord, isLoading, isCallFetchDataApi}
};

export default connect(mapStateToProps, {fetchCurrencies})(Currencies);

