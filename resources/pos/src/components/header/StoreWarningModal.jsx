import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { getFormattedMessage } from '../../shared/sharedMethod';

const StoreWarningModal = ({ storeWarningModal, handleLogoutButton }) => {

    return (
        <>
            <Modal
                show={storeWarningModal}
                backdrop="static"
                keyboard={false}
                centered
                size="lg"
            >
                <Modal.Header className="bg-warning-subtle border-0">
                    <Modal.Title className="d-flex align-items-center justify-content-center w-100 text-warning fs-3">
                        ⚠️ {getFormattedMessage('store.access.restricted.title')}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center pb-0">
                    <p className="fs-2 fw-semibold text-danger mb-8">
                        {getFormattedMessage('store.inactive.message.title')}
                    </p>
                    <p className="text-muted fs-2 mt-5">
                        {getFormattedMessage('contact.admin.to.resolve.issue.message.title')}
                    </p>
                </Modal.Body>

                <Modal.Footer className="justify-content-center border-0">
                    <Button variant="danger" onClick={() => handleLogoutButton()}>
                        {getFormattedMessage('header.profile-menu.logout.label')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default StoreWarningModal;