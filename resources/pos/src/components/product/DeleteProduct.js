import React from 'react';
import { connect } from 'react-redux';
import { deleteProduct } from '../../store/action/productAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../shared/sharedMethod';

const DeleteProduct = (props) => {
    const { deleteProduct, onDelete, deleteModel, onClickDeleteModel } = props;


    const deleteClick = () => {
        deleteProduct(onDelete.id, onDelete.main_product_id);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                deleteClick={deleteClick} name={getFormattedMessage('product.title')} />}
        </div>
    )
};

export default connect(null, { deleteProduct })(DeleteProduct);
