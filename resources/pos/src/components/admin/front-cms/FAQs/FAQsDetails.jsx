import React from 'react'
import { getFormattedMessage } from '../../../../shared/sharedMethod'
import { Modal } from 'react-bootstrap-v5'

const DetailsFAQs = ({ show, data, handleClose }) => {

    return (
        <Modal
            show={show}
            onHide={handleClose}
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{getFormattedMessage("front-cms.faqs.details.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("front-cms.table.column.title")}: </label>
                        <div>
                            <p>{data?.title}</p>
                        </div>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label fw-bolder'>{getFormattedMessage("front-cms.description.title")}: </label>
                        <div>
                            <p>{data?.description}</p>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default DetailsFAQs