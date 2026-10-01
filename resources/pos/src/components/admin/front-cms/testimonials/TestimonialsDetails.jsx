import React from 'react'
import { getFormattedMessage } from '../../../../shared/sharedMethod'
import { Modal } from 'react-bootstrap-v5'

const TestimonialsDetails = ({ show, handleClose, singleTestimonial }) => {

    return (
        <Modal
            show={show}
            onHide={handleClose}
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{getFormattedMessage("front-cms.testimonial.details.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("globally.input.name.label")}: </label>
                        <div>
                            <p>{singleTestimonial?.name}</p>
                        </div>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("front-cms.description.title")}: </label>
                        <div>
                            <p>{singleTestimonial?.description}</p>
                        </div>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("front-cms.image.title")}: </label>
                        <div>
                            <img src={singleTestimonial?.image} height='100' width='100' alt='Testimonials Image'
                                className='image border rounded' />
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default TestimonialsDetails