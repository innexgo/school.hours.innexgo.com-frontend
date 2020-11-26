import React from "react";
import { Card, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import { Formik, FormikHelpers } from 'formik';

import { ViewSession } from '../components/ViewData';
import { newCommittment, viewCommittment, viewCommittmentResponse, isApiErrorCode } from '../utils/utils';



type ManageSessionModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  session: Session;
  apiKey: ApiKey;
}

function ManageSessionModal(props: ManageSessionModalProps) {
  return <Modal
    show={props.show}
    onHide={() => props.setShow(false)}
    keyboard={false}
    size="lg"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title>Manage Session</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ViewSession session={props.session} expanded />

    </Modal.Body>
  </Modal>
}

export default ManageSessionModal;
