import React from 'react';
import { Button, Tabs, Tab, Form, Table } from 'react-bootstrap';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
//import { ViewUser, } from '../components/ViewData';

import { Delete, } from '@material-ui/icons'
import { Formik, FormikHelpers, FormikErrors } from 'formik'

//import SearchMultiUser from "../components/SearchMultiUser";

import format from "date-fns/format";
import addDays from "date-fns/addDays";

import { Async, AsyncProps } from 'react-async';
import { INT_MAX, CourseKey, courseKeyDataNew, courseKeyNew, courseKeyDataView, } from '../utils/utils';
import {isErr} from '@innexgo/frontend-common';
import {ApiKey} from '@innexgo/frontend-auth-api';

type RevokeCourseKeyProps = {
  courseKey: CourseKey,
  apiKey: ApiKey,
  postSubmit: () => void
};

function RevokeCourseKey(props: RevokeCourseKeyProps) {

  type RevokeCourseKeyValue = {
  }

  const onSubmit = async (values: RevokeCourseKeyValue,
    fprops: FormikHelpers<RevokeCourseKeyValue>) => {

    const maybeCourseKey = await courseKeyDataNew({
      courseKey: props.courseKey.key,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeCourseKey)) {
      switch (maybeCourseKey.Err) {
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
    props.postSubmit();
  }

  return <>
    <Formik<RevokeCourseKeyValue>
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


const loadCourseKeys = async (props: AsyncProps<CourseKey[]>) => {
  const maybeCourseKeys = await courseKeyDataView({
    courseId: props.courseId,
    courseKeyKind: "VALID",
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isErr(maybeCourseKeys)) {
    throw Error;
  } else {
    return maybeCourseKeys;
  }
}

type InstructorManageCourseKeysProps = {
  courseId: number,
  apiKey: ApiKey,
}

function InstructorManageCourseKeys(props: InstructorManageCourseKeysProps) {

  type CreateCourseKeyValue = {
    infiniteUses: boolean,
    maxUses: string,
    expires: boolean,
    expiryDays: string,
    instructorPermissions: boolean,
  }

  const [confirmRevokeCourseKey, setConfirmRevokeCourseKey] = React.useState<CourseKey | null>(null);

  const normalizeNumberField = (e: string) => e.replace(/[^0-9]+/g, "");

  return <>
    <Async promiseFn={loadCourseKeys} apiKey={props.apiKey} courseId={props.courseId}>
      {({ reload }) => <>
        <Async.Pending><Loader /></Async.Pending>
        <Async.Rejected>
          <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<CourseKey[]>>{data => <>
          <Tabs className="py-4">
            <Tab eventKey="view" title="Course Keys">
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
                  {data.length === 0
                    ? <tr><td colSpan={5} className="text-center">No currently active keys.</td></tr>
                    : data.map((a: CourseKey) =>
                      <tr>
                        <td><code>{a.key}</code></td>
                        <td>{a.duration === INT_MAX ? "Never" : format(a.creationTime + a.duration!, "MMM dd yyyy")}</td>
                        <td>{a.maxUses != null && a.maxUses === INT_MAX ? "Infinite" : a.maxUses}</td>
                        <td>{a.courseMembershipKind}</td>
                        <td>{a.creationTime + a.duration! > Date.now()
                          ? <Button variant="link" className="text-dark"
                            onClick={() => setConfirmRevokeCourseKey(a)}>
                            <Delete />
                          </Button>
                          : <> </>
                        }</td>
                      </tr>
                    )}
                </tbody>
              </Table>
              {confirmRevokeCourseKey === null ? <> </> :
                <DisplayModal
                  title="Confirm Remove"
                  show={confirmRevokeCourseKey != null}
                  onClose={() => setConfirmRevokeCourseKey(null)}
                >
                  <RevokeCourseKey {...props}
                    courseKey={confirmRevokeCourseKey}
                    postSubmit={() => {
                      setConfirmRevokeCourseKey(null);
                      reload();
                    }}
                  />
                </DisplayModal>
              }
            </Tab>
            <Tab eventKey="add" title="Add Course Keys">
              <Formik<CreateCourseKeyValue>
                onSubmit={async (values: CreateCourseKeyValue,
                  fprops: FormikHelpers<CreateCourseKeyValue>) => {

                  let errors: FormikErrors<CreateCourseKeyValue> = {};
                  let hasErrors = false;
                  if (values.expires && values.expiryDays === "") {
                    errors.expiryDays = "Please enter the number of days after which the key will expire";
                    hasErrors = true;
                  }
                  if (!values.infiniteUses && values.maxUses === "") {
                    errors.maxUses = "Please enter the maximum number of times this key may be used.";
                    hasErrors = true;
                  }


                  fprops.setErrors(errors);
                  if (hasErrors) {
                    return;
                  }

                  // TODO let user choose how many uses and how many
                  const maybeCourseKey = await courseKeyNew({
                    courseId: props.courseId,
                    duration: values.expires
                      ? addDays(Date.now(), parseInt(values.expiryDays)).valueOf()
                      : INT_MAX,
                    maxUses: values.infiniteUses ? INT_MAX : parseInt(values.maxUses),
                    courseMembershipKind: values.instructorPermissions ? "INSTRUCTOR" : "STUDENT",
                    apiKey: props.apiKey.key,
                  });

                  if (isErr(maybeCourseKey)) {
                    switch (maybeCourseKey) {
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
                    successResult: "CourseKey Created"
                  });

                  // execute callback
                  reload();
                }}
                initialValues={{
                  infiniteUses: true,
                  maxUses: "1",
                  expires: false,
                  expiryDays: "7",
                  instructorPermissions: false,
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

                      <Form.Check>
                        <Form.Check.Input
                          name="infiniteUses"
                          checked={fprops.values.infiniteUses}
                          onChange={fprops.handleChange}
                          isInvalid={!!fprops.errors.infiniteUses}
                        />
                        <Form.Check.Label>Infinite Uses</Form.Check.Label>
                        <Form.Control.Feedback type="invalid">{fprops.errors.infiniteUses}</Form.Control.Feedback>
                      </Form.Check>

                      <Form.Group >
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

                      <Form.Check>
                        <Form.Check.Input
                          name="expires"
                          checked={fprops.values.expires}
                          onChange={fprops.handleChange}
                          isInvalid={!!fprops.errors.expires}
                        />
                        <Form.Check.Label>Key Expires</Form.Check.Label>
                        <Form.Control.Feedback type="invalid">{fprops.errors.expires}</Form.Control.Feedback>
                      </Form.Check>

                      <Form.Group >
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


                      <Form.Check>
                        <Form.Check.Input
                          name="instructorPermissions"
                          checked={fprops.values.instructorPermissions}
                          onChange={fprops.handleChange}
                          isInvalid={!!fprops.errors.instructorPermissions}
                        />
                        <Form.Check.Label>Key promotes to instructor.</Form.Check.Label>
                        <Form.Control.Feedback type="invalid">{fprops.errors.instructorPermissions}</Form.Control.Feedback>
                      </Form.Check>
                      <Button type="submit">Submit Form</Button>
                      <br />
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

export default InstructorManageCourseKeys;
