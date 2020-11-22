import React from 'react'
import { Modal } from 'react-bootstrap';
import ViewAppt from '../components/ViewAppt';

type ViewApptModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  appt: Appt;
}

function ViewApptModal(props: ViewApptModalProps) {
  return <Modal
    className="ViewApptModal"
    show={props.show}
    onHide={() => props.setShow(false)}
    keyboard={false}
    size="lg"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">View Appt Request</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ViewAppt appt={props.appt} />
    </Modal.Body>
  </Modal>
}

export default ViewApptModal;
