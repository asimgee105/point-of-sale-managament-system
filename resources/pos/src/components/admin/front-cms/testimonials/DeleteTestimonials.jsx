import React from 'react'
import DeleteModel from '../../../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../../../shared/sharedMethod';
import { useDispatch } from 'react-redux';
import { deleteTestimonials } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const DeleteTestimonials = (props) => {
  const { deleteModel, onClickDeleteModel, onDelete } = props;
  const dispatch = useDispatch();

  const deleteClick = () => {
    onClickDeleteModel(false);
    dispatch(deleteTestimonials(onDelete.id));
  };

  return (
    <div>
      {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
        deleteClick={deleteClick} name={getFormattedMessage('front-cms.testimonials.title')} />}
    </div>
  )
}

export default DeleteTestimonials