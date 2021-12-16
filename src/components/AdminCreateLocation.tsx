import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { SchoolData, LocationData, schoolDataView, locationNew, normalizeCourseName, adminshipView } from "../utils/utils";
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

import SearchSingleSchool from "../components/SearchSingleSchool";

type AdminCreateLocationProps = {
  apiKey: ApiKey;
  schoolId?:number;
  postSubmit: (cd: LocationData) => void;
}

function AdminCreateLocation(props: AdminCreateLocationProps) {

  type CreateLocationValue = {
    schoolId: null | number,
    name: string,
    address: string,
    phone: string,
  }

  const onSubmit = async (values: CreateLocationValue,
    fprops: FormikHelpers<CreateLocationValue>) => {

    let errors: FormikErrors<CreateLocationValue> = {};

    // Validate input
    let hasError = false;
    if (values.schoolId === null) {
      errors.name = "Please select a school where you are an administrator.";
      hasError = true;
    }
    if (values.name === "") {
      errors.name = "Please enter a location name.";
      hasError = true;
    }
    if (values.address === "") {
      errors.address = "Please enter a brief address of your location.";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeLocationData = await locationNew({
      schoolId: values.schoolId!,
      address: values.address,
      name: values.name,
      phone: values.phone,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeLocationData)) {
      switch (maybeLocationData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_ARCHIVED": {
          fprops.setStatus({
            failureResult: "This school has been archived",
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
            failureResult: "An unknown or network error has occured while trying to create location.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Location Created"
    });
    // execute callback
    props.postSubmit(maybeLocationData.Ok);
  }

  return <>
    <Formik<CreateLocationValue>
      onSubmit={onSubmit}
      initialValues={{
        schoolId: null,
        name: "",
        address: "",
        phone: ""
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
            <Form.Group className="mb-3">
              <Form.Label>School Name</Form.Label>
              <SearchSingleSchool
                name="locationId"
                search={async (input: string) => {

                  const adminships = await adminshipView({
                    userId: [props.apiKey.creatorUserId],
                    adminshipKind: ["ADMIN"],
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  })
                    .then(unwrap);

                  const schoolData = await schoolDataView({
                    schoolId: adminships.map(a => a.school.schoolId),
                    partialName: input,
                    onlyRecent: true,
                    apiKey: props.apiKey.key,
                  })
                    .then(unwrap);

                  return schoolData;

                }}
                isInvalid={!!fprops.errors.schoolId}
                setFn={(e: SchoolData | null) => fprops.setFieldValue("schoolId", e?.school.schoolId)} />
              <Form.Control.Feedback type="invalid">{fprops.errors.schoolId}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Location Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", normalizeCourseName(e.target.value))}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label >Location Address</Form.Label>
              <Form.Control
                name="address"
                type="text"
                placeholder="Location Address"
                value={fprops.values.address}
                onChange={e => fprops.setFieldValue("address", e.target.value)}
                isInvalid={!!fprops.errors.address}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.address}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label >Phone Number</Form.Label>
              <Form.Control
                name="phone"
                type="text"
                placeholder="Location Phone Number"
                value={fprops.values.phone}
                onChange={e => fprops.setFieldValue("phone", e.target.value)}
                isInvalid={!!fprops.errors.phone}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.phone}</Form.Control.Feedback>
            </Form.Group>
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

export default AdminCreateLocation;
