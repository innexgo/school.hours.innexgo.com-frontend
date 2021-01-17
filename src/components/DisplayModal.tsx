import React from 'react';
import {Modal} from 'react-bootstrap';

type DisplayModalProps = {
  title: string;
  show: boolean;
  setShow: (show: boolean) => void;
  children: React.ReactNode
}

export default function DisplayModal(props:DisplayModalProps) {
  return <Modal
    show={props.show}
    onHide={() => props.setShow(false)}
    keyboard={false}
    backdrop="static"
    size="xl"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {props.children}
    </Modal.Body>
  </Modal>

}
