import React from 'react';
import {Modal} from 'react-bootstrap';

type DisplayModalProps = {
  title: string;
  show: boolean;
  onClose: () => void;
  small?:boolean;
  children: React.ReactNode
}

export default function DisplayModal(props:DisplayModalProps) {
  return <Modal
    show={props.show}
    onHide={props.onClose}
    keyboard={false}
    backdrop="static"
    size={props.small ? "sm": "xl"}
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
