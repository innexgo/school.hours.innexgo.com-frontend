import React from 'react';
import { Button, Tabs, Tab, Form, Table } from 'react-bootstrap';
import { Loader, Action } from '@innexgo/common-react-components';
import DisplayModal from '../components/DisplayModal';
//import { ViewUser, } from '../components/ViewData';

import { X as DeleteIcon, } from 'react-bootstrap-icons'
import { Formik, FormikHelpers, FormikErrors } from 'formik'

//import SearchMultiUser from "../components/SearchMultiUser";

import format from "date-fns/format";
import addDays from "date-fns/addDays";

import { Async, AsyncProps } from 'react-async';
import { INT_MAX, CourseKeyData, courseKeyDataNew, courseKeyNew, courseKeyDataView, } from '../utils/utils';
import { isErr, unwrap, isEmpty } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

const normalizeNumberField = (e: string) => e.replace(/[^0-9]+/g, "");

type CreateCourseKeyValue = {
  infiniteUses: boolean,
  maxUses: string,
  expires: boolean,
  expiryDays: string,
  instructorPermissions: boolean,
}


type InstructorCreateCourseKeyProps = {
  courseId: number,
  apiKey: ApiKey,
  postSubmit: (courseKeyData: CourseKeyData) => void,
}

export default function InstructorCreateCourseKey(props: InstructorCreateCourseKeyProps) {
  return <>
    <Formik<CreateCourseKeyValue>
      onSubmit={async (values: CreateCourseKeyValue,
        fprops: FormikHelpers<CreateCourseKeyValue>) => {

        let errors: FormikErrors<CreateCourseKeyValue> = {};
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
        const maybeCourseKeyData = await courseKeyNew({
          courseId: props.courseId,
          startTime: Date.now(),
          endTime: values.expires
            ? addDays(Date.now(), parseInt(values.expiryDays)).valueOf()
            : INT_MAX,
          maxUses: values.infiniteUses ? INT_MAX : parseInt(values.maxUses),
          courseMembershipKind: values.instructorPermissions ? "INSTRUCTOR" : "STUDENT",
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
          return;
        }

        fprops.setStatus({
          failureResult: "",
          successResult: "CourseKey Created"
        });

        // execute callback
        props.postSubmit(maybeCourseKeyData.Ok);
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
                name="instructorPermissions"
                checked={fprops.values.instructorPermissions}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.instructorPermissions}
              />
              <Form.Check.Label>Key promotes to instructor.</Form.Check.Label>
              <Form.Control.Feedback type="invalid">{fprops.errors.instructorPermissions}</Form.Control.Feedback>
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
  </>
}
