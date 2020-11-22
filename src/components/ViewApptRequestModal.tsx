import React from 'react'
import { Modal, } from 'react-bootstrap';

import ViewApptRequest from '../components/ViewApptRequest';

type ViewApptRequestModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  apptRequest: ApptRequest;
}

function ViewApptRequestModal(props: ViewApptRequestModalProps) {
  return <Modal
    className="ViewApptRequestModal"
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
      <ViewApptRequest apptRequest={props.apptRequest} />
    </Modal.Body>
  </Modal>
}

export default ViewApptRequestModal;
