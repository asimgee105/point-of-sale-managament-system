import { Col, Row } from 'react-bootstrap-v5';
import Modal from 'react-bootstrap/Modal';
import { getFormattedMessage } from '../../shared/sharedMethod';

const CustomerDetails = ({ handleClose, show, customerDetails }) => {
    if (!customerDetails) return null;

    const {
        name,
        email,
        phone,
        city,
        country,
        dob,
        address,
    } = customerDetails;

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{getFormattedMessage("customer.details.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Row className="mb-2">
                    <Col sm={4}><strong>{getFormattedMessage("globally.input.name.label")}:</strong></Col>
                    <Col sm={8}>{name}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={4}><strong>{getFormattedMessage("globally.input.email.label")}:</strong></Col>
                    <Col sm={8}>{email ?? "-"}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={4}><strong>{getFormattedMessage("date.of.birth.title")}:</strong></Col>
                    <Col sm={8}>{dob ?? "-"}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={4}><strong>{getFormattedMessage("pos-sale.detail.Phone.info")}:</strong></Col>
                    <Col sm={8}>{phone ?? "-"}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={4}><strong>{getFormattedMessage("globally.input.address.label")}:</strong></Col>
                    <Col sm={8}>{address ?? "-"}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={4}><strong>{getFormattedMessage("globally.input.city.label")}:</strong></Col>
                    <Col sm={8}>{city ?? "-"}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={4}><strong>{getFormattedMessage("globally.input.country.label")}:</strong></Col>
                    <Col sm={8}>{country ?? "-"}</Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
}

export default CustomerDetails;