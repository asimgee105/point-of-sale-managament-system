import React from 'react';
import {connect} from 'react-redux';
import {deleteRole} from '../../store/action/roleAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from "../../shared/sharedMethod";

const DeleteRole = (props) => {
    const {deleteRole, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteClick = () => {
        deleteRole({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteClick={deleteClick} name={getFormattedMessage("role.title")}/>}
        </div>
    )
};

export default connect(null, {deleteRole})(DeleteRole);
