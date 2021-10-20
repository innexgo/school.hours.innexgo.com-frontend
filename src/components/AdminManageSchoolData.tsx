import React from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { Loader, Action } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { schoolDataView, schoolDataNew, normalizeSchoolName, SchoolData, } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Pencil as EditIcon, X as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';

import { isErr, unwrap } from '@innexgo/frontend-common';
import { User, ApiKey } from '@innexgo/frontend-auth-api';


type EditSchoolDataProps = {
  schoolData: SchoolData,
  setSchoolData: (schoolData: SchoolData) => void,
  apiKey: ApiKey,
};

function EditSchoolData(props: EditSchoolDataProps) {

  type EditSchoolDataValue = {
    name: string,
    description: string,
  }

  const onSubmit = async (values: EditSchoolDataValue,
    fprops: FormikHelpers<EditSchoolDataValue>) => {

    const maybeSchoolData = await schoolDataNew({
      schoolId: props.schoolData.school.schoolId,
      apiKey: props.apiKey.key,
      name: values.name,
      description: values.description,
      active: props.schoolData.active,
    });

    if (isErr(maybeSchoolData)) {
      switch (maybeSchoolData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to modify this school.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This school does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while modifying school data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "School Successfully Modified"
    });

    // execute callback
    props.setSchoolData(maybeSchoolData.Ok);
  }

  return <>
    <Formik<EditSchoolDataValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.schoolData.name,
        description: props.schoolData.description
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
              <Form.Control
                name="name"
                type="text"
                placeholder="School Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", normalizeSchoolName(e.target.value))}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label >School Description</Form.Label>
              <Form.Control
                name="description"
                type="text"
                placeholder="School Description"
                value={fprops.values.description}
                onChange={e => fprops.setFieldValue("description", e.target.value)}
                isInvalid={!!fprops.errors.description}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.description}</Form.Control.Feedback>
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


type ArchiveSchoolProps = {
  schoolData: SchoolData,
  setSchoolData: (schoolData: SchoolData) => void,
  apiKey: ApiKey,
};

function ArchiveSchool(props: ArchiveSchoolProps) {

  type ArchiveSchoolValue = {}

  const onSubmit = async (_: ArchiveSchoolValue,
    fprops: FormikHelpers<ArchiveSchoolValue>) => {

    const maybeSchoolData = await schoolDataNew({
      schoolId: props.schoolData.school.schoolId,
      apiKey: props.apiKey.key,
      name: props.schoolData.name,
      description: props.schoolData.description,
      active: !props.schoolData.active,
    });

    if (isErr(maybeSchoolData)) {
      switch (maybeSchoolData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to manage this school.",
            successResult: ""
          });
          break;
        }
        case "SCHOOL_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This school does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while managing school.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "School Edited"
    });

    // execute callback
    props.setSchoolData(maybeSchoolData.Ok);
  }

  return <>
    <Formik<ArchiveSchoolValue>
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
              Are you sure you want to {props.schoolData.active ? "archive" : "unarchive"} {props.schoolData.name}?
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



const AdminManageSchoolData = (props: {
  schoolData: SchoolData,
  setSchoolData: (schoolData: SchoolData) => void,
  apiKey: ApiKey,
}) => {

  const [showEditSchoolData, setShowEditSchoolData] = React.useState(false);
  const [showArchiveSchoolData, setShowArchiveSchoolData] = React.useState(false);


  return <>
    <Table hover bordered>
      <tbody>
        <tr>
          <th>Status</th>
          <td>{props.schoolData.active ? "Active" : "Archived"}</td>
        </tr>
        <tr>
          <th>Name</th>
          <td>{props.schoolData.name}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td>{props.schoolData.description}</td>
        </tr>
        <tr>
          <th>Creator</th>
          <td><ViewUser userId={props.schoolData.school.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
        </tr>
        <tr>
          <th>Creation Time</th>
          <td>{format(props.schoolData.school.creationTime, "MMM do")} </td>
        </tr>
      </tbody>
    </Table>
    <Action
      title="Edit"
      icon={EditIcon}
      onClick={() => setShowEditSchoolData(true)}
    />
    {props.schoolData.active
      ? <Action
        title="Delete"
        icon={DeleteIcon}
        variant="danger"
        onClick={() => setShowArchiveSchoolData(true)}
      />
      : <Action
        title="Restore"
        icon={RestoreIcon}
        variant="danger"
        onClick={() => setShowArchiveSchoolData(true)}
      />
    }

    <DisplayModal
      title="Edit School"
      show={showEditSchoolData}
      onClose={() => setShowEditSchoolData(false)}
    >
      <EditSchoolData
        apiKey={props.apiKey}
        schoolData={props.schoolData}
        setSchoolData={(schoolData) => {
          setShowEditSchoolData(false);
          props.setSchoolData(schoolData);
        }}
      />
    </DisplayModal>

    <DisplayModal
      title="Archive School"
      show={showArchiveSchoolData}
      onClose={() => setShowArchiveSchoolData(false)}
    >
      <ArchiveSchool
        apiKey={props.apiKey}
        schoolData={props.schoolData}
        setSchoolData={(schoolData) => {
          setShowArchiveSchoolData(false);
          props.setSchoolData(schoolData);
        }}
      />
    </DisplayModal>
  </>
}

export default AdminManageSchoolData;
