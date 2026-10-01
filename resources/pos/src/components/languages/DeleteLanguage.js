import React from 'react';
import { connect } from 'react-redux';
import { deleteLanguage } from '../../store/action/languageAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../shared/sharedMethod';

const DeleteBaseUnits = ( props ) => {
    const { deleteLanguage, onDelete, deleteModel, onClickDeleteModel } = props;

    const deleteClick = () => {
        deleteLanguage( onDelete.id );
        onClickDeleteModel( false );
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                deleteClick={deleteClick} name={getFormattedMessage("language.title")} />}
        </div>
    )
};

export default connect( null, { deleteLanguage } )( DeleteBaseUnits );
