import React from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { Action, DisplayModal } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import { locationDataView, locationDataNew, LocationData, normalizeSchoolName } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Pencil as EditIcon, X as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';


type ArchiveLocationProps = {
  locationData: LocationData,
  apiKey: ApiKey,
  setLocationData: (locationData: LocationData) => void
};

export default function InstructorArchiveLocationDataForm(props: ArchiveLocationProps) {

  type ArchiveLocationValue = {}

  const onSubmit = async (_: ArchiveLocationValue,
    fprops: FormikHelpers<ArchiveLocationValue>) => {

    const maybeLocationData = await locationDataNew({
      locationId: props.locationData.location.locationId,
      apiKey: props.apiKey.key,
      name: props.locationData.name,
      address: props.locationData.address,
      phone: props.locationData.phone,
      active: !props.locationData.active,
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
            failureResult: "You are not authorized to manage this location.",
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
            failureResult: "An unknown or network error has occured while managing location.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Location Edited"
    });

    // execute callback
    props.setLocationData(maybeLocationData.Ok);
  }

  return <>
    <Formik<ArchiveLocationValue>
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
            <p>
              Are you sure you want to {props.locationData.active ? "archive" : "unarchive"} {props.locationData.name}?
            </p>
            <Button type="submit">Confirm</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

