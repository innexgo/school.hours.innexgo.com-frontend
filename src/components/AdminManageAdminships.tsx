import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Loader } from '@innexgo/common-react-components';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';

import { X as Delete, } from 'react-bootstrap-icons'
import { Formik, FormikHelpers } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { adminshipView, adminshipNewCancel, School, Adminship } from '../utils/utils';

import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr, unwrap } from '@innexgo/frontend-common';


type CancelAdminshipProps = {
  userId: number,
  school: School,
  apiKey: ApiKey,
  postSubmit: () => void
};

function CancelAdminship(props: CancelAdminshipProps) {

  type CancelAdminshipValue = {
  }

  const onSubmit = async (_: CancelAdminshipValue,
    fprops: FormikHelpers<CancelAdminshipValue>) => {

    const maybeAdminship = await adminshipNewCancel({
      schoolId: props.school.schoolId,
      userId: props.userId,
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
            failureResult: "You are not authorized to remove this administrator from this school.",
            successResult: ""
          });
          break;
        }
        case "ADMINSHIP_CANNOT_LEAVE_EMPTY": {
          fprops.setStatus({
            failureResult: "You can't remove the last administrator of a school.",
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
            failureResult: "An unknown or network error has occured while remove adminship.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Adminship Canceled"
    });

    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<CancelAdminshipValue>
      onSubmit={onSubmit}
      initialValues={{
        userIds: [],
      }}
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
            <p>Are you sure you want to remove the following user:</p>
            <ViewUser userId={props.userId} apiKey={props.apiKey} expanded={false} />
            {props.apiKey.creatorUserId === props.userId
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


const loadAdminships = async (props: AsyncProps<Adminship[]>) =>
  await adminshipView({
    schoolId: [props.school.schoolId],
    adminshipKind: ["ADMIN"],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);



type AdminManageAdminshipsProps = {
  school: School,
  apiKey: ApiKey,
}

function AdminManageAdminships(props: AdminManageAdminshipsProps) {

  const [confirmRemoveUser, setConfirmRemoveUser] = React.useState<number | null>(null);

  return <>
    <Async promiseFn={loadAdminships} apiKey={props.apiKey} school={props.school}>
      {({ reload }) => <>
        <Async.Pending><Loader /></Async.Pending>
        <Async.Rejected>
          <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<Adminship[]>>{data => <>
          <Table hover bordered>
            <thead>
              <tr>
                <th>User</th>
                <th>Date Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a: Adminship) =>
                <tr>
                  <td><ViewUser userId={a.userId} apiKey={props.apiKey} expanded={false} /></td>
                  <td>{format(a.creationTime, "MMM do")}</td>
                  <th>
                    <Button variant="link" className="text-dark"
                      onClick={() => setConfirmRemoveUser(a.userId)}>
                      <Delete />
                    </Button>
                  </th>
                </tr>
              )}
            </tbody>
          </Table>
          {confirmRemoveUser === null ? <> </> :
            <DisplayModal
              title="Confirm Remove"
              show={confirmRemoveUser != null}
              onClose={() => setConfirmRemoveUser(null)}
            >
              <CancelAdminship {...props}
                userId={confirmRemoveUser}
                postSubmit={() => {
                  setConfirmRemoveUser(null);
                  reload();
                }}
              />
            </DisplayModal>
          }
        </>}
        </Async.Fulfilled>
      </>}
    </Async>
  </>
}

export default AdminManageAdminships;
