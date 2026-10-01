import React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Filters } from '../../../constants';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import MasterLayout from '../../MasterLayout';
import HeaderTitle from '../../header/HeaderTitle';
import UserForm from './UserForm';
import { createUser } from '../../../store/action/admin/adminUsersAction';
import TabTitle from '../../../shared/tab-title/TabTitle';

const CreateAdminUser = (props) => {
    const { createUser } = props;
    const navigate = useNavigate();
    const createUserData = (formValue) => {
        createUser(formValue, navigate, Filters.OBJ);
    };

    return (
        <MasterLayout>
            <TabTitle title={placeholderText('user.create.title')} />
            <HeaderTitle title={getFormattedMessage('user.create.title')} to='/app/admin/users' />
            <UserForm createUser={createUserData} />
        </MasterLayout>
    );
}

export default connect(null, { createUser })(CreateAdminUser);
