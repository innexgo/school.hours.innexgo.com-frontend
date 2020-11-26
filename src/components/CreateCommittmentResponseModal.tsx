import React from 'react'

import { Card, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import ToggleButton from "react-bootstrap/ToggleButton";
import { newCommittmentResponse, isApiErrorCode } from '../utils/utils';
import { Formik, FormikHelpers } from 'formik';
import {ViewCommittment} from '../components/ViewData';

type CommittmentCreateCommittmentResponseModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  committment: Committment;
  apiKey: ApiKey;
}

function CreateCommittmentResponseModal(props: CommittmentCreateCommittmentResponseModalProps) {

  type CreateCommittmentResponseValues = {
    committmentResponseKind: CommittmentResponseKind
  }

  async function onSubmit(values: CreateCommittmentResponseValues, { setStatus }: FormikHelpers<CreateCommittmentResponseValues>) {
    const maybeCommittmentResponse = await newCommittmentResponse({
      committmentId: props.committment.committmentId,
      committmentResponseKind: values.committmentResponseKind,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeCommittmentResponse )) {
      switch (maybeCommittmentResponse ) {
        case "COMMITTMENT_RESPONSE_EXISTENT": {
          setStatus("Attendance has already been taken");
          break;
        }
        case "COMMITTMENT_RESPONSE_UNCANCELLABLE": {
          setStatus("This committment cannot be cancelled.");
          break;
        }
        case "API_KEY_NONEXISTENT": {
          setStatus("You have been automatically logged out. Please relogin.");
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          setStatus("You are not currently authorized to perform this action.");
          break;
        }
        default: {
          setStatus("An unknown or network error has occurred.");
          break;
        }
      }
    } else {
      props.setShow(false);
    }
  }

  return <Modal
    className="CreateCommittmentResponseModal"
    show={props.show}
    onHide={() => props.setShow(false)}
    keyboard={false}
    size="lg"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title id="modal-title">Take Attendance</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Formik<CreateCommittmentResponseValues>
        onSubmit={onSubmit}
        initialValues={{
          committmentResponseKind: "PRESENT"
        }}
        initialStatus=""
      >
        {(fprops) => <div>
          <Card>
            <Card.Body>
              <Card.Title>Appointment</Card.Title>
              <ViewCommittment committment={props.committment} expanded />
            </Card.Body>
          </Card>
          <br />
          <Form
            noValidate
            onSubmit={fprops.handleSubmit} >
            <Form.Group as={Row} controlId="attendance">
              <Form.Label column sm={2}>Take Attendance</Form.Label>
              <Col>
                <div>
                  <ToggleButton
                    key={0}
                    type="radio"
                    name="radio"
                    value="PRESENT"
                    checked={fprops.values.committmentResponseKind === "PRESENT"}
                    onChange={_ => fprops.setFieldValue("committmentResponseKind", "PRESENT")}
                    className="btn-success"
                  >
                    Present
                  </ToggleButton>
                  <ToggleButton
                    key={1}
                    type="radio"
                    name="radio"
                    value="TARDY"
                    checked={fprops.values.committmentResponseKind === "TARDY"}
                    onChange={_ => fprops.setFieldValue("committmentResponseKind", "TARDY")}
                    className="btn-warning"
                  >
                    Tardy
                  </ToggleButton>
                  <ToggleButton
                    key={2}
                    type="radio"
                    name="radio"
                    value="ABSENT"
                    checked={fprops.values.committmentResponseKind === "ABSENT"}
                    onChange={_ => fprops.setFieldValue("committmentResponseKind", "ABSENT")}
                    className="btn-danger"
                  >
                    Absent
                  </ToggleButton>
                  <ToggleButton
                    key={2}
                    type="radio"
                    name="radio"
                    value="CANCELLED"
                    checked={fprops.values.committmentResponseKind === "CANCELLED"}
                    onChange={_ => fprops.setFieldValue("committmentResponseKind", "CANCELLED")}
                    className="btn-danger"
                  >
                    Cancelled
                  </ToggleButton>
                </div>
              </Col>
            </Form.Group>
            <br />
            <Button type="submit"> Submit </Button>
            <br />
            <Form.Text className="text-danger">{fprops.status}</Form.Text>
          </Form>
        </div>}
      </Formik>
    </Modal.Body>
  </Modal>
}

export default CreateCommittmentResponseModal;
