import moment from 'moment';
import React, { useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { Image } from 'react-bootstrap-v5';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { getAvatarName, getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import { fetchUser } from '../../../store/action/admin/adminUsersAction';
import HeaderTitle from '../../header/HeaderTitle';
import MasterLayout from '../../MasterLayout';

const UserDetail = (props) => {
    const { adminUsers, isLoading, fetchUser } = props;
    const { id } = useParams();
    const result = adminUsers?.length > 0 && adminUsers?.reduce((obj, cur) => ({ ...obj, [cur.type]: cur }), {});
    const user = result.users;

    useEffect(() => {
        fetchUser(id);
    }, []);

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle title={getFormattedMessage('user-details.title')} to='/app/admin/users' editLink={`/app/admin/users/edit/${id}`} />
            <TabTitle title={placeholderText('user-details.title')} />
            {isLoading ? <Spinner /> : <>
                <div>
                    <Card>
                        <Card.Body>
                            <div className='row'>
                                <div className='col-xxl-5 col-12'>
                                    <div
                                        className='d-sm-flex align-items-center mb-5 mb-xxl-0 flex-row text-sm-start'>
                                        <div
                                            className='image image-circle image-lg-small w-100px'>
                                            {user && user.attributes.image ?
                                                <Image src={user.attributes.image} alt='User Profile'
                                                    className='object-fit-cover' /> :
                                                <span className='user_avatar'>
                                                    {getAvatarName(user && user.attributes.first_name + ' ' + user.attributes.last_name)}
                                                </span>
                                            }
                                        </div>
                                        <div className='ms-0 ms-md-10 mt-5 mt-sm-0'>
                                            <span className={`badge ${user && user.attributes.status ? 'bg-light-success' : 'bg-light-danger'} mb-2`}>{user && user.attributes.status ? getFormattedMessage("active.status.lable") : getFormattedMessage("in-active.status.lable")}</span>
                                            <h2> {user && user.attributes.first_name + ' ' + user.attributes.last_name}</h2>
                                            <a href={user && user.attributes.email}
                                                className='text-gray-600 text-decoration-none fs-4'>
                                                {user && user.attributes.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className='pt-5'>
                    <Card>
                        <Card.Header as='h5'>{getFormattedMessage('user-details.table.title')}</Card.Header>
                        <Card.Body className='pt-0'>
                            <Table responsive>
                                <tbody>
                                    <tr>
                                        <td className='py-4'>{getFormattedMessage('user.input.first-name.label')}</td>
                                        <td className='py-4'>{user && user.attributes.first_name}</td>
                                    </tr>
                                    <tr>
                                        <td className='py-4'>{getFormattedMessage('user.input.last-name.label')}</td>
                                        <td className='py-4'>{user && user.attributes.last_name}</td>
                                    </tr>
                                    <tr>
                                        <td className='py-4'>{getFormattedMessage('globally.input.email.label')}</td>
                                        <td className='py-4'>{user && user.attributes.email}</td>
                                    </tr>
                                    <tr>
                                        <td className='py-4'>{getFormattedMessage('globally.input.phone-number.label')}</td>
                                        <td className='py-4'>{user && user.attributes.phone}</td>
                                    </tr>
                                    <tr>
                                        <td className='py-4'>{getFormattedMessage('globally.react-table.column.created-date.label')}</td>
                                        <td className='py-4'>{moment(user && user.attributes.created_at).fromNow()}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </>
            }
        </MasterLayout>
    )
};

const mapStateToProps = state => {
    const { adminUsers, isLoading } = state;
    return { adminUsers, isLoading }
};

export default connect(mapStateToProps, { fetchUser })(UserDetail);
