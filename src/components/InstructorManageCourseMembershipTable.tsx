import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Loader, Action } from '@innexgo/common-react-components';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';
import update from 'immutability-helper';

import { X as DeleteIcon, } from 'react-bootstrap-icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { CourseMembershipKind, CourseMembership, courseMembershipNewCancel, courseMembershipView } from '../utils/utils';
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey, User } from '@innexgo/frontend-auth-api';


type CancelCourseMembershipProps = {
  courseMembership: CourseMembership,
  setCourseMembership: (courseMembership:CourseMembership) => void
  apiKey: ApiKey,
};

function CancelCourseMembership(props: CancelCourseMembershipProps) {

  type CancelCourseMembershipValue = {
  }

  const onSubmit = async (values: CancelCourseMembershipValue,
    fprops: FormikHelpers<CancelCourseMembershipValue>) => {

    const maybeCourseMembership = await courseMembershipNewCancel({
      courseId: props.courseMembership.course.courseId,
      userId: props.courseMembership.userId,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeCourseMembership)) {
      switch (maybeCourseMembership.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to remove this user from this course.",
            successResult: ""
          });
          break;
        }
        case "COURSE_MEMBERSHIP_CANNOT_LEAVE_EMPTY": {
          fprops.setStatus({
            failureResult: "You can't remove the last instructor of a course.",
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
            failureResult: "An unknown or network error has occured while trying to remove course membership.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Course Membership Canceled"
    });

    // execute callback
    props.setCourseMembership (maybeCourseMembership.Ok);
  }

  return <>
    <Formik<CancelCourseMembershipValue>
      onSubmit={onSubmit}
      initialValues={{ }}
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
            <p>Are you sure you want to remove the following user?</p>
            <ViewUser apiKey={props.apiKey} userId={props.courseMembership.userId} expanded={false} />
            {props.apiKey.creatorUserId === props.courseMembership.userId
              ? <p className="text-danger">You are removing yourself. You won't be able to add yourself back.</p>
              : <> </>
            }
            <Button type="submit">Confirm Remove</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

const isActive = (cm: CourseMembership) => cm.courseMembershipKind !== "CANCEL";

type InstructorManageCourseMembershipTableProps = {
  courseMemberships: CourseMembership[],
  setCourseMemberships: (courseMemberships: CourseMembership[]) => void,
  apiKey: ApiKey,
}

function InstructorManageCourseMembershipTable(props: InstructorManageCourseMembershipTableProps) {
  const showInactive = false;

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeMemberships = props.courseMemberships
    // enumerate data + index
    .map((cm, i) => ({ cm, i }))
    // filter inactive
    .filter(({ cm }) => showInactive || isActive(cm));


  const [confirmCancelCourseMembershipIndex, setConfirmCancelCourseMembershipIndex] = React.useState<number | null>(null);

  return <>
    <Table hover bordered>
      <thead>
        <tr>
          <th>User</th>
          <th>Date Joined</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {
          activeMemberships.length === 0
            ? <tr><td colSpan={3} className="text-center">No current members.</td></tr>
            : <div />
        }
        {activeMemberships
          .map(({ cm, i }) =>
            <tr key={i}>
              <td><ViewUser userId={cm.userId} apiKey={props.apiKey} expanded={false} /></td>
              <td>{format(cm.creationTime, "MMM do")}</td>
              <th>
                <td>
                  <Action
                    title="Remove"
                    icon={DeleteIcon}
                    variant="danger"
                    onClick={() => setConfirmCancelCourseMembershipIndex(i)}
                  />
                </td>
              </th>
            </tr>
          )}
      </tbody>
    </Table>
    {confirmCancelCourseMembershipIndex === null ? <> </> :
      <DisplayModal
        title="Confirm Remove"
        show={confirmCancelCourseMembershipIndex != null}
        onClose={() => setConfirmCancelCourseMembershipIndex(null)}
      >
        <CancelCourseMembership
          apiKey={props.apiKey}
          courseMembership={props.courseMemberships[confirmCancelCourseMembershipIndex]}
          setCourseMembership={(k) => {
            setConfirmCancelCourseMembershipIndex(null);
            props.setCourseMemberships(update(props.courseMemberships, { [confirmCancelCourseMembershipIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
  </>
}


export default InstructorManageCourseMembershipTable;
