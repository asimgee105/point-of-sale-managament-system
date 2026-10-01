import React from 'react'
import DeleteModel from '../../../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../../../shared/sharedMethod';
import { useDispatch } from 'react-redux';
import { deleteFAQs } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const DeleteFAQs = (props) => {
  const { deleteModel, onClickDeleteModel, onDelete, setNotDeletedItemModal, clearSelectedDeleteItem } = props;
  const dispatch = useDispatch();

  const deleteClick = () => {
    dispatch(deleteFAQs({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem));
    onClickDeleteModel(false);
  };

  return (
    <div>
      {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
        deleteClick={deleteClick} name={getFormattedMessage('front-cms.faqs.title')} />}
    </div>
  )
}

export default DeleteFAQs