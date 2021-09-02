import React from 'react';
import { Button, Tabs, Tab, Form, Table } from 'react-bootstrap';
import { Loader, Action } from '@innexgo/common-react-components';
import DisplayModal from '../components/DisplayModal';
//import { ViewUser, } from '../components/ViewData';

import { X as DeleteIcon, } from 'react-bootstrap-icons';
import { Formik, FormikHelpers, FormikErrors } from 'formik';

//import SearchMultiUser from "../components/SearchMultiUser";

import format from "date-fns/format";
import addDays from "date-fns/addDays";

import { Async, AsyncProps } from 'react-async';
import { INT_MAX, SchoolKey, schoolKeyDataNew, schoolKeyNew, schoolKeyDataView, } from '../utils/utils';
import { unwrap, isErr, isEmpty} from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

type RevokeSchoolKeyProps = {
  schoolKey: SchoolKey,
  apiKey: ApiKey,
  postSubmit: () => void
};

function RevokeSchoolKey(props: RevokeSchoolKeyProps) {

  type RevokeSchoolKeyValue = {
  }

  const onSubmit = async (_: RevokeSchoolKeyValue,
    fprops: FormikHelpers<RevokeSchoolKeyValue>) => {

    const maybeSchoolKey = await schoolKeyDataNew({
      schoolKeyKey: props.schoolKey.schoolKeyKey,
      active: false,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSchoolKey)) {
      switch (maybeSchoolKey.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to revoke this school key.",
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
    props.postSubmit();
  }

  return <>
    <Formik<RevokeSchoolKeyValue>
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


const loadSchoolKeys = async (props: AsyncProps<SchoolKey[]>) => {
  const skds = await schoolKeyDataView({
    schoolId: [props.schoolId],
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  return skds.map(x => x.schoolKey);
}

type AdminManageSchoolKeysProps = {
  schoolId: number,
  apiKey: ApiKey,
}

function AdminManageSchoolKeys(props: AdminManageSchoolKeysProps) {

  type CreateSchoolKeyValue = {
    infiniteUses: boolean,
    maxUses: string,
    expires: boolean,
    expiryDays: string,
    adminPermissions: boolean,
  }

  const [confirmRevokeSchoolKey, setConfirmRevokeSchoolKey] = React.useState<SchoolKey | null>(null);

  const normalizeNumberField = (e: string) => e.replace(/[^0-9]+/g, "");

  return <>
    <Async promiseFn={loadSchoolKeys} apiKey={props.apiKey} schoolId={props.schoolId}>
      {({ reload }) => <>
        <Async.Pending><Loader /></Async.Pending>
        <Async.Rejected>
          <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<SchoolKey[]>>{data => <>
          <Tabs className="py-4">
            <Tab eventKey="view" title="School Keys">
              <Table hover bordered>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0
                    ? <tr><td colSpan={5} className="text-center">No currently active keys.</td></tr>
                    : data.map((a: SchoolKey) =>
                      <tr>
                        <td><code>{a.schoolKeyKey}</code></td>
                        <td>{a.endTime === INT_MAX ? "Never" : format(a.endTime, "MMM dd yyyy")}</td>
                        <td>
                          <Action
                            title="Delete"
                            icon={DeleteIcon}
                            variant="danger"
                            onClick={() => setConfirmRevokeSchoolKey(a)}
                            hidden={a.endTime < Date.now()}
                          />
                        </td>
                      </tr>
                    )}
                </tbody>
              </Table>
              {confirmRevokeSchoolKey === null ? <> </> :
                <DisplayModal
                  title="Confirm Remove"
                  show={confirmRevokeSchoolKey != null}
                  onClose={() => setConfirmRevokeSchoolKey(null)}
                >
                  <RevokeSchoolKey {...props}
                    schoolKey={confirmRevokeSchoolKey}
                    postSubmit={() => {
                      setConfirmRevokeSchoolKey(null);
                      reload();
                    }}
                  />
                </DisplayModal>
              }
            </Tab>
            <Tab eventKey="add" title="Add School Keys">
              <Formik<CreateSchoolKeyValue>
                onSubmit={async (values: CreateSchoolKeyValue,
                  fprops: FormikHelpers<CreateSchoolKeyValue>) => {

                  let errors: FormikErrors<CreateSchoolKeyValue> = {};

                  if (values.expires && values.expiryDays === "") {
                    errors.expiryDays = "Please enter the number of days after which the key will expire";
                  }
                  if (!values.infiniteUses && values.maxUses === "") {
                    errors.maxUses = "Please enter the maximum number of times this key may be used.";
                  }

                  fprops.setErrors(errors);
                  if (!isEmpty(errors)) {
                    return;
                  }

                  // TODO let user choose how many uses and how many
                  const maybeSchoolKey = await schoolKeyNew({
                    schoolId: props.schoolId,
                    startTime: Date.now(),
                    endTime: values.expires
                      ? addDays(Date.now(), parseInt(values.expiryDays)).valueOf()
                      : INT_MAX,
                    maxUses: values.infiniteUses ? INT_MAX : parseInt(values.maxUses),
                    apiKey: props.apiKey.key,
                  });

                  if (isErr(maybeSchoolKey)) {
                    switch (maybeSchoolKey.Err) {
                      case "API_KEY_NONEXISTENT": {
                        fprops.setStatus({
                          failureResult: "You have been automatically logged out. Please relogin.",
                          successResult: ""
                        });
                        break;
                      }
                      case "API_KEY_UNAUTHORIZED": {
                        fprops.setStatus({
                          failureResult: "You are not authorized to add a new administrator to this school.",
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
                          failureResult: "An unknown or network error has occured while trying to register.",
                          successResult: ""
                        });
                        break;
                      }
                    }
                  }

                  fprops.setStatus({
                    failureResult: "",
                    successResult: "SchoolKey Created"
                  });

                  // execute callback
                  reload();
                }}
                initialValues={{
                  infiniteUses: true,
                  maxUses: "1",
                  expires: false,
                  expiryDays: "7",
                  adminPermissions: false,
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
                      <Form.Check className="form-check mb-3">
                        <Form.Check.Input
                          name="infiniteUses"
                          checked={fprops.values.infiniteUses}
                          onChange={fprops.handleChange}
                          isInvalid={!!fprops.errors.infiniteUses}
                        />
                        <Form.Check.Label>Infinite Uses</Form.Check.Label>
                        <Form.Control.Feedback type="invalid">{fprops.errors.infiniteUses}</Form.Control.Feedback>
                      </Form.Check>

                      <Form.Group className="mb-3">
                        <Form.Label >Max Uses</Form.Label>
                        <Form.Control
                          name="maxUses"
                          type="text"
                          disabled={fprops.values.infiniteUses}
                          value={fprops.values.maxUses}
                          onChange={e => fprops.setFieldValue("maxUses", normalizeNumberField(e.target.value))}
                          isInvalid={!!fprops.errors.maxUses}
                        />
                        <Form.Control.Feedback type="invalid">{fprops.errors.maxUses}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Check className="form-check mb-3">
                        <Form.Check.Input
                          name="expires"
                          checked={fprops.values.expires}
                          onChange={fprops.handleChange}
                          isInvalid={!!fprops.errors.expires}
                        />
                        <Form.Check.Label>Key Expires</Form.Check.Label>
                        <Form.Control.Feedback type="invalid">{fprops.errors.expires}</Form.Control.Feedback>
                      </Form.Check>

                      <Form.Group className="mb-3">
                        <Form.Label >Days till expiry</Form.Label>
                        <Form.Control
                          name="expiryDays"
                          type="text"
                          disabled={!fprops.values.expires}
                          value={fprops.values.expiryDays}
                          onChange={e => fprops.setFieldValue("expiryDays", normalizeNumberField(e.target.value))}
                          isInvalid={!!fprops.errors.expiryDays}
                        />
                        <Form.Control.Feedback type="invalid">{fprops.errors.expiryDays}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Check className="form-check mb-3">
                        <Form.Check.Input
                          name="adminPermissions"
                          checked={fprops.values.adminPermissions}
                          onChange={fprops.handleChange}
                          isInvalid={!!fprops.errors.adminPermissions}
                        />
                        <Form.Check.Label>Key promotes to admin.</Form.Check.Label>
                        <Form.Control.Feedback type="invalid">{fprops.errors.adminPermissions}</Form.Control.Feedback>
                      </Form.Check>
                      <Form.Group className="mb-3">
                        <Button type="submit">Submit Form</Button>
                      </Form.Group>
                      <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
                    </div>
                    <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
                  </Form>
                </>}
              </Formik>
            </Tab>
          </Tabs>
        </>}
        </Async.Fulfilled>
      </>}
    </Async>
  </>
}

export default AdminManageSchoolKeys;
