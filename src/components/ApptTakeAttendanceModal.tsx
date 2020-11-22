import React from 'react'

import { Card, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import ToggleButton from "react-bootstrap/ToggleButton";
import { newAttendance, isApiErrorCode } from '../utils/utils';
import { Formik, FormikHelpers } from 'formik';
import ViewAppt from '../components/ViewAppt';

type ApptTakeAttendanceModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  appt: Appt;
  apiKey: ApiKey;
}

function ApptTakeAttendanceModal(props: ApptTakeAttendanceModalProps) {

  type TakeAttendanceValues = {
    attendanceKind: AttendanceKind
  }

  async function onSubmit(values: TakeAttendanceValues, { setStatus }: FormikHelpers<TakeAttendanceValues>) {
    const maybeAttendance = await newAttendance({
      apptId: props.appt.apptRequest.apptRequestId,
      attendanceKind: values.attendanceKind,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeAttendance)) {
      switch (maybeAttendance) {
        case "ATTENDANCE_EXISTENT": {
          setStatus("Attendance has already been taken");
          break;
        }
        case "APIKEY_NONEXISTENT": {
          setStatus("You have been automatically logged out. Please relogin.");
          break;
        }
        case "APIKEY_UNAUTHORIZED": {
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
    className="ApptTakeAttendanceModal"
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
      <Formik<TakeAttendanceValues>
        onSubmit={onSubmit}
        initialValues={{
          attendanceKind: "PRESENT"
        }}
        initialStatus=""
      >
        {(fprops) => <div>
          <Card>
            <Card.Body>
              <Card.Title>Appointment</Card.Title>
              <ViewAppt appt={props.appt} />
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
                    checked={fprops.values.attendanceKind === "PRESENT"}
                    onChange={_ => fprops.setFieldValue("attendanceKind", "PRESENT")}
                    className="btn-success"
                  >
                    Present
                  </ToggleButton>
                  <ToggleButton
                    key={1}
                    type="radio"
                    name="radio"
                    value="TARDY"
                    checked={fprops.values.attendanceKind === "TARDY"}
                    onChange={_ => fprops.setFieldValue("attendanceKind", "TARDY")}
                    className="btn-warning"
                  >
                    Tardy
                  </ToggleButton>
                  <ToggleButton
                    key={2}
                    type="radio"
                    name="radio"
                    value="ABSENT"
                    checked={fprops.values.attendanceKind === "ABSENT"}
                    onChange={_ => fprops.setFieldValue("attendanceKind", "ABSENT")}
                    className="btn-danger"
                  >
                    Absent
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

export default ApptTakeAttendanceModal;
