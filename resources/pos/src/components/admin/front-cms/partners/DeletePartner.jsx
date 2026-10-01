import React from 'react'
import DeleteModel from '../../../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../../../shared/sharedMethod';
import { useDispatch } from 'react-redux';
import { deletePartner } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const DeletePartner = (props) => {
  const { deleteModel, onClickDeleteModel, onDelete } = props;
  const dispatch = useDispatch();

  const deleteClick = () => {
    dispatch(deletePartner(onDelete.id));
    onClickDeleteModel(false);
  };

  return (
    <div>
      {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
        deleteClick={deleteClick} name={getFormattedMessage('front-cms.partners.title')} />}
    </div>
  )
}

export default DeletePartner