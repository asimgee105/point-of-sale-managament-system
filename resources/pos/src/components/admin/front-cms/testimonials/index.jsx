import React, { useEffect, useState } from 'react'
import MasterLayout from '../../../MasterLayout'
import TopProgressBar from '../../../../shared/components/loaders/TopProgressBar'
import TabTitle from '../../../../shared/tab-title/TabTitle'
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod'
import ReactDataTable from '../../../../shared/table/ReactDataTable'
import { connect, useDispatch, useSelector } from 'react-redux'
import ActionButton from '../../../../shared/action-buttons/ActionButton'
import CreateTestimonials from './CreateTestimonials'
import DeleteTestimonials from './DeleteTestimonials'
import TestimonialsDetails from './TestimonialsDetails'
import { fetchFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction'
import { adminActionType, adminApiBaseURL } from '../../../../constants'
import TestimonialsForm from './TestimonialsForm'

const Testimonials = ({ totalRecord, isLoading }) => {
    const [localItemsValue, setLocalItemsValue] = useState([]);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [singleTestimonial, setSingleTestimonial] = useState(null);
    const testimonials = useSelector((state) => state.frontCMS);
    const dispatch = useDispatch();

    useEffect(() => {
        if (testimonials.length >= 0) {
            const mappedService = testimonials.map((testimonial) => ({
                name: testimonial?.attributes?.name,
                description: testimonial?.attributes?.description,
                image: testimonial?.attributes?.image,
                id: testimonial.id,
            }));
            setLocalItemsValue(mappedService);
        }
    }, [testimonials]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const goToTestimonial = (item) => {
        setShowEditModal(true);
        setSingleTestimonial(item);
    };

    const showTestimonial = (item) => {
        setShowModal(true);
        setSingleTestimonial(item);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowEditModal(false);
    };

    const onChange = (filter) => {
        dispatch(fetchFrontCMS(adminApiBaseURL.TESTIMONIALS, adminActionType.FETCH_TESTIMONIALS, filter, true));
    };

    const columns = [
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            className: "",
            sortField: "name",
            sortable: false,
            cell: row => {
                const imageUrl = row.image ? row.image : '';
                return (
                    <div className='d-flex align-items-center'>
                        <div className='me-2 outline-box'>
                            <img src={imageUrl} height='50' width='50' alt='Testimonials Image'
                                className='image image-circle image-mini' />
                        </div>
                        <div className='d-flex flex-column'>
                            <span>{row.name}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "120px",
            cell: (row) => (
                <ActionButton
                    isViewIcon={true}
                    goToDetailScreen={() => showTestimonial(row)}
                    item={row}
                    goToEditProduct={() => goToTestimonial(row)}
                    isEditMode={true}
                    onClickDeleteModel={onClickDeleteModel}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("front-cms.testimonials.title")} />
            <ReactDataTable
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                isShowSearch
                AddButton={<CreateTestimonials />}
            />
            {showEditModal && (
                <TestimonialsForm title={getFormattedMessage("front-cms.edit.testimonial.title")} isEdit={true} singleTestimonial={singleTestimonial} show={showEditModal} handleClose={handleCloseModal} />
            )}
            {showModal && (
                <TestimonialsDetails show={showModal} singleTestimonial={singleTestimonial} handleClose={handleCloseModal} />
            )}
            <DeleteTestimonials onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                onDelete={isDelete} />
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { totalRecord, isLoading } = state;
    return { totalRecord, isLoading };
};

export default connect(mapStateToProps)(Testimonials);