import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Action, AddButton, DisplayModal } from '@innexgo/common-react-components';
import update from 'immutability-helper';

import { X as DeleteIcon, } from 'react-bootstrap-icons'
import { Formik, FormikHelpers} from 'formik'

import InstructorCreateCourseKey from "../components/InstructorCreateCourseKey";

import format from "date-fns/format";

import { INT_MAX, CourseKeyData, courseKeyDataNew } from '../utils/utils';
import { isErr, } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

type RevokeCourseKeyProps = {
  courseKeyData: CourseKeyData,
  setCourseKeyData: (courseKeyData: CourseKeyData) => void,
  apiKey: ApiKey,
};

function RevokeCourseKey(props: RevokeCourseKeyProps) {
  type RevokeCourseKeyValue = {}

  const onSubmit = async (_: RevokeCourseKeyValue,
    fprops: FormikHelpers<RevokeCourseKeyValue>) => {

    const maybeCourseKeyData = await courseKeyDataNew({
      courseKeyKey: props.courseKeyData.courseKey.courseKeyKey,
      active: false,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeCourseKeyData)) {
      switch (maybeCourseKeyData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to revoke this course key.",
            successResult: ""
          });
          break;
        }
        case "USER_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This user does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while revoking key.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Revoked Key"
    });

    // execute callback
    props.setCourseKeyData(maybeCourseKeyData.Ok);
  }

  return <>
    <Formik<RevokeCourseKeyValue>
      onSubmit={onSubmit}
      initialValues={{}}
      initialStatus={{
        failureResult: "",
        successResult: ""
      }}
    >
      {(fprops) => <>
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <div hidden={fprops.status.successResult !== ""}>
            <p>Are you sure you want to revoke this key?</p>
            <Button type="submit">Confirm Revoke</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

type InstructorManageCourseKeyTableProps = {
  courseId: number,
  courseKeyData: CourseKeyData[],
  setCourseKeyData: (courseKeyData: CourseKeyData[]) => void,
  addable:boolean,
  apiKey: ApiKey,
}

const isActive = (k: CourseKeyData) => k.active && k.courseKey.endTime > Date.now();

function InstructorManageCourseKeyTable(props: InstructorManageCourseKeyTableProps) {

  const showInactive = false;

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeKeys = props.courseKeyData
    // enumerate data + index
    .map((k, i) => ({ k, i }))
    // filter inactive
    .filter(({ k }) => showInactive || isActive(k));


  const [confirmRevokeCourseKeyDataIndex, setConfirmRevokeCourseKeyDataIndex] = React.useState<number | null>(null);

  const [showCreateKey, setShowCreateKey] = React.useState(false);

  return <>
    <Table hover bordered>
      <thead>
        <tr>
          <th>Key</th>
          <th>Expires</th>
          <th>Uses</th>
          <th>Adds</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {props.addable
          ? <tr><td colSpan={5} className="p-0"><AddButton onClick={() => setShowCreateKey(true)} /></td></tr>
          : <> </>
        }
        {activeKeys.length === 0
          ? <tr><td colSpan={5} className="text-center">No currently active keys.</td></tr>
          : <> </>
        }
        {activeKeys
          // reverse in order to see newest first
          .reverse()
          .map(({ k, i }) =>
            <tr key={i}>
              <td><code>{k.courseKey.courseKeyKey}</code></td>
              <td>{k.courseKey.endTime === INT_MAX ? "Never" : format(k.courseKey.endTime, "MMM dd yyyy")}</td>
              <td>{k.courseKey.maxUses === INT_MAX ? "Infinite" : k.courseKey.maxUses}</td>
              <td>{k.courseKey.courseMembershipKind}</td>
              <td>
                <Action
                  title="Delete"
                  icon={DeleteIcon}
                  variant="danger"
                  onClick={() => setConfirmRevokeCourseKeyDataIndex(i)}
                  hidden={!isActive(k)}
                />
              </td>
            </tr>
          )}
      </tbody>
    </Table>
    {confirmRevokeCourseKeyDataIndex === null ? <> </> :
      <DisplayModal
        title="Confirm Remove"
        show={confirmRevokeCourseKeyDataIndex != null}
        onClose={() => setConfirmRevokeCourseKeyDataIndex(null)}
      >
        <RevokeCourseKey
          apiKey={props.apiKey}
          courseKeyData={props.courseKeyData[confirmRevokeCourseKeyDataIndex]}
          setCourseKeyData={(k) => {
            setConfirmRevokeCourseKeyDataIndex(null);
            props.setCourseKeyData(update(props.courseKeyData, { [confirmRevokeCourseKeyDataIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
    <DisplayModal
      title="New Key"
      show={showCreateKey}
      onClose={() => setShowCreateKey(false)}
    >
      <InstructorCreateCourseKey
        apiKey={props.apiKey}
        courseId={props.courseId}
        postSubmit={key => {
          props.setCourseKeyData(update(props.courseKeyData, { $push: [key] }));
          setShowCreateKey(false);
        }}
      />
    </DisplayModal>
  </>
}

export default InstructorManageCourseKeyTable;
