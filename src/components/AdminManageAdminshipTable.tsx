import React from 'react';
import { Button, Form, Table, } from 'react-bootstrap';
import { Loader, Action, DisplayModal } from '@innexgo/common-react-components';
import { ViewUser, } from '../components/ViewData';
import update from 'immutability-helper';

import { X as DeleteIcon, } from 'react-bootstrap-icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { AdminshipKind, Adminship, adminshipNewCancel, adminshipView } from '../utils/utils';
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey, User } from '@innexgo/frontend-auth-api';


type CancelAdminshipProps = {
  adminship: Adminship,
  setAdminship: (adminship:Adminship) => void
  apiKey: ApiKey,
};

function CancelAdminship(props: CancelAdminshipProps) {

  type CancelAdminshipValue = {
  }

  const onSubmit = async (values: CancelAdminshipValue,
    fprops: FormikHelpers<CancelAdminshipValue>) => {

    const maybeAdminship = await adminshipNewCancel({
      schoolId: props.adminship.school.schoolId,
      userId: props.adminship.userId,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeAdminship)) {
      switch (maybeAdminship.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to remove this user from this school.",
            successResult: ""
          });
          break;
        }
        case "ADMINSHIP_CANNOT_LEAVE_EMPTY": {
          fprops.setStatus({
            failureResult: "You can't remove the last instructor of a school.",
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
            failureResult: "An unknown or network error has occured while trying to remove school membership.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "School Membership Canceled"
    });

    // execute callback
    props.setAdminship (maybeAdminship.Ok);
  }

  return <>
    <Formik<CancelAdminshipValue>
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
            <ViewUser apiKey={props.apiKey} userId={props.adminship.userId} expanded={false} />
            {props.apiKey.creatorUserId === props.adminship.userId
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

const isActive = (cm: Adminship) => cm.adminshipKind !== "CANCEL";

type InstructorManageAdminshipTableProps = {
  adminships: Adminship[],
  setAdminships: (adminships: Adminship[]) => void,
  apiKey: ApiKey,
}

function InstructorManageAdminshipTable(props: InstructorManageAdminshipTableProps) {
  const showInactive = false;

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeMemberships = props.adminships
    // enumerate data + index
    .map((cm, i) => ({ cm, i }))
    // filter inactive
    .filter(({ cm }) => showInactive || isActive(cm));


  const [confirmCancelAdminshipIndex, setConfirmCancelAdminshipIndex] = React.useState<number | null>(null);

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
                    onClick={() => setConfirmCancelAdminshipIndex(i)}
                  />
                </td>
              </th>
            </tr>
          )}
      </tbody>
    </Table>
    {confirmCancelAdminshipIndex === null ? <> </> :
      <DisplayModal
        title="Confirm Remove"
        show={confirmCancelAdminshipIndex != null}
        onClose={() => setConfirmCancelAdminshipIndex(null)}
      >
        <CancelAdminship
          apiKey={props.apiKey}
          adminship={props.adminships[confirmCancelAdminshipIndex]}
          setAdminship={(k) => {
            setConfirmCancelAdminshipIndex(null);
            props.setAdminships(update(props.adminships, { [confirmCancelAdminshipIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
  </>
}


export default InstructorManageAdminshipTable;
