import React from 'react';
import {connect} from 'react-redux';
import {deletePurchase} from '../../store/action/purchaseAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeletePurchase = (props) => {
    const {deletePurchase, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteClick = () => {
        deletePurchase({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteClick={deleteClick}
                                         name={getFormattedMessage('purchase.title')}/>}
        </div>
    )
};

export default connect(null, {deletePurchase})(DeletePurchase);
