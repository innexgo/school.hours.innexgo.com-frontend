import React from 'react'
import { Modal, } from 'react-bootstrap';

import ViewAttendance from '../components/ViewAttendance';

type ViewAttendanceModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  attendance: Attendance;
}

function ViewAttendanceModal(props: ViewAttendanceModalProps) {
  return <Modal
    className="ViewAttendanceModal"
    show={props.show}
    onHide={() => props.setShow(false)}
    keyboard={false}
    size="lg"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">View Attendance</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ViewAttendance attendance={props.attendance} />
    </Modal.Body>
  </Modal>
}

export default ViewAttendanceModal;
