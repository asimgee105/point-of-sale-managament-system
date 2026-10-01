import React from 'react';
import {connect} from 'react-redux';
import {deleteCurrency} from '../../store/action/currencyAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeleteCurrency = (props) => {
    const {deleteCurrency, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteClick = () => {
        deleteCurrency({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteClick={deleteClick} name={getFormattedMessage('currency.title')}/>}
        </div>
    )
};

export default connect(null, {deleteCurrency})(DeleteCurrency);
