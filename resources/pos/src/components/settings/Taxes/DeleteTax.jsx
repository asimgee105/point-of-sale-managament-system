import React from 'react'
import { useDispatch } from 'react-redux';
import DeleteModel from '../../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../../shared/sharedMethod';
import { deleteTax } from '../../../store/action/taxAction';

const DeleteTax = (props) => {
    const { deleteModel, onClickDeleteModel, onDelete, setNotDeletedItemModal } = props;
    const dispatch = useDispatch();

    const deleteClick = () => {
        dispatch(deleteTax({ id: onDelete }, setNotDeletedItemModal));
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel &&
                <DeleteModel
                    onClickDeleteModel={onClickDeleteModel}
                    deleteModel={deleteModel}
                    deleteClick={deleteClick} title='Delete Tax'
                    name={getFormattedMessage('tax.title')}
                />}
        </div>
    )
}

export default DeleteTax