import React from 'react';
import {connect} from 'react-redux';
import {deletePurchaseReturn} from '../../store/action/purchaseReturnAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeletePurchaseReturn = (props) => {
    const {deletePurchaseReturn, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteClick = () => {
        deletePurchaseReturn({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteClick={deleteClick}
                                         name={getFormattedMessage('purchases.return.title')}/>}
        </div>
    )
};

export default connect(null, {deletePurchaseReturn})(DeletePurchaseReturn);
