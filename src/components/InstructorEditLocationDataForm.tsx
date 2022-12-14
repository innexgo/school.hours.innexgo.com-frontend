import React from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { Action, DisplayModal } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import { locationDataView, locationDataNew, LocationData, normalizeCourseName } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Pencil as EditIcon, X as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';



type EditLocationDataProps = {
  locationData: LocationData,
  setLocationData: (locationData: LocationData) => void,
  apiKey: ApiKey,
};

export default function InstructorEditLocationDataForm(props: EditLocationDataProps) {

  type EditLocationDataValue = {
    name: string,
    address: string,
    phone: string,
  }

  const onSubmit = async (values: EditLocationDataValue,
    fprops: FormikHelpers<EditLocationDataValue>) => {

    const maybeLocationData = await locationDataNew({
      locationId: props.locationData.location.locationId,
      apiKey: props.apiKey.key,
      name: values.name,
      address: values.address,
      phone: values.phone,
      active: props.locationData.active,
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
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to modify this location.",
            successResult: ""
          });
          break;
        }
        case "LOCATION_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This location does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while modifying location data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Location Successfully Modified"
    });

    // execute callback
    props.setLocationData(maybeLocationData.Ok);
  }

  return <>
    <Formik<EditLocationDataValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.locationData.name,
        address: props.locationData.address,
        phone: props.locationData.phone,
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
              <Form.Label>Location Address</Form.Label>
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
              <Form.Label>Location Phone Number</Form.Label>
              <Form.Control
                name="phone"
                type="text"
                placeholder="Location Phone"
                value={fprops.values.phone}
                onChange={e => fprops.setFieldValue("phone", e.target.value)}
                isInvalid={!!fprops.errors.phone}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.phone}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Button type="submit">Submit</Button>
            </Form.Group>
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

