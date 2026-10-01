import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import UserForm from './UserForm';
import { useParams } from 'react-router-dom';
import MasterLayout from '../../MasterLayout';
import HeaderTitle from '../../header/HeaderTitle';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { fetchUser } from '../../../store/action/admin/adminUsersAction';
import TabTitle from '../../../shared/tab-title/TabTitle';

const EditAdminUser = (props) => {
    const { fetchUser, adminUsers } = props;
    const { id } = useParams();

    useEffect(() => {
        fetchUser(id);
    }, []);

    const itemsValue = adminUsers && adminUsers.length === 1 && adminUsers.map(user => ({
        image: user.attributes.image,
        first_name: user.attributes.first_name,
        last_name: user.attributes.last_name,
        email: user.attributes.email,
        plan_name: user.attributes.plan,
        plan_id: user.attributes.plan_id,
        phone: user.attributes.phone,
        id: user.id
    }));

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('user.edit.title')} />
            <HeaderTitle title={getFormattedMessage('user.edit.title')} to='/app/admin/users' />
            {adminUsers.length === 1 && <UserForm singleUser={itemsValue} id={id} isEdit />}
        </MasterLayout>
    );
}

const mapStateToProps = (state) => {
    const { adminUsers } = state;
    return { adminUsers }
};

export default connect(mapStateToProps, { fetchUser })(EditAdminUser);
