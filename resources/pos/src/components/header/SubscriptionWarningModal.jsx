import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { getFormattedMessage } from '../../shared/sharedMethod';

const SubscriptionWarningModal = ({ subscriptionWarningModal, handleLogoutButton }) => {

    return (
        <>
            <Modal
                show={subscriptionWarningModal}
                backdrop="static"
                keyboard={false}
                centered
                size="lg"
            >
                <Modal.Header className="bg-warning-subtle border-0">
                    <Modal.Title className="d-flex align-items-center justify-content-center w-100 text-warning fs-3">
                        ⚠️ {getFormattedMessage('subscription.expired.title')}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center pb-0">
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

export default SubscriptionWarningModal;