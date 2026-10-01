import React from 'react';
import { connect } from 'react-redux';
import { deleteUser } from '../../../store/action/admin/adminUsersAction';
import DeleteModel from '../../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../../shared/sharedMethod';

const DeleteUser = (props) => {
    const { deleteUser, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem } = props;

    const deleteClick = () => {
        deleteUser({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                deleteClick={deleteClick} name={getFormattedMessage('users.table.user.column.title')} />}
        </div>
    )
};

export default connect(null, { deleteUser })(DeleteUser);
