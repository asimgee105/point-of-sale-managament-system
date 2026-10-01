import React from 'react';
import { useDispatch} from 'react-redux';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';
import { deleteVariation } from '../../store/action/variationAction';

const DeleteVariation = (props) => {
    const {onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;
    const dispatch = useDispatch();
    const onClickDelete = () => {
        dispatch(deleteVariation({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem));
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteClick={onClickDelete} name={getFormattedMessage('variation.title')}/>
            }
        </div>
    )
};

export default DeleteVariation;
