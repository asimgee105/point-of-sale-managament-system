import React from 'react'
import { Modal } from 'react-bootstrap-v5'
import { getFormattedMessage } from '../../../shared/sharedMethod'

const InquiryDetails = ({ show, data, handleClose }) => {

    return (
        <Modal
            show={show}
            onHide={handleClose}
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{getFormattedMessage("inquiries.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("globally.input.name.label")}: </label>
                        <div>
                            <p>{data?.name}</p>
                        </div>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("globally.input.email.label")}: </label>
                        <div>
                            <p>{data?.email}</p>
                        </div>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("globally.input.subject.label")}: </label>
                        <div>
                            <p>{data?.subject}</p>
                        </div>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("globally.input.message.label")}: </label>
                        <div>
                            <p>{data?.message}</p>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default InquiryDetails