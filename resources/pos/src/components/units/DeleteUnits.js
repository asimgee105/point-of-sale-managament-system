import React from 'react';
import {connect} from 'react-redux';
import {deleteUnit} from '../../store/action/unitsAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeleteUnits = (props) => {
    const {deleteUnit, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteClick = () => {
        deleteUnit({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteClick={deleteClick} name={getFormattedMessage('unit.title')}/>}
        </div>
    )
};

export default connect(null, {deleteUnit})(DeleteUnits);
