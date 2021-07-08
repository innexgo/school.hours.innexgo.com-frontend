import React from 'react';
import { Form, Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { schoolDataView, schoolDataNew, normalizeSchoolName, SchoolData, } from '../utils/utils';
import { ViewUser } from '../components/ViewData';
import { Edit, Archive, Unarchive } from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';

import { isErr, unwrap } from '@innexgo/frontend-common';
import { User, ApiKey } from '@innexgo/frontend-auth-api';


type EditSchoolDataProps = {
  schoolData: SchoolData,
  apiKey: ApiKey,
  postSubmit: () => void
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
    props.postSubmit();
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
            <Form.Group >
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
            <Form.Group >
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
            <Button type="submit">Submit</Button>
            <br />
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
  apiKey: ApiKey,
  postSubmit: () => void
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
    props.postSubmit();
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



const loadSchoolData = async (props: AsyncProps<SchoolData>) => {
  const schoolData = await schoolDataView({
    schoolId: props.schoolId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  return schoolData[0];
}


const AdminManageSchoolData = (props: {
  schoolId: number,
  apiKey: ApiKey,
}) => {

  const [showEditSchoolData, setShowEditSchoolData] = React.useState(false);
  const [showArchiveSchool, setShowArchiveSchool] = React.useState(false);


  return <Async
    promiseFn={loadSchoolData}
    apiKey={props.apiKey}
    schoolId={props.schoolId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<SchoolData>>{schoolData => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{schoolData.active ? "Active" : "Archived"}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{schoolData.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{schoolData.description}</td>
            </tr>
            <tr>
              <th>Creator</th>
              <td><ViewUser userId={schoolData.school.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(schoolData.school.creationTime, "MMM do")} </td>
            </tr>
          </tbody>
        </Table>
        <Button variant="secondary" onClick={_ => setShowEditSchoolData(true)}>Edit <Edit /></Button>

        {schoolData.active
          ? <Button variant="danger" onClick={_ => setShowArchiveSchool(true)}>Archive <Archive /></Button>
          : <Button variant="success" onClick={_ => setShowArchiveSchool(true)}>Unarchive <Unarchive /></Button>
        }

        <DisplayModal
          title="Edit School"
          show={showEditSchoolData}
          onClose={() => setShowEditSchoolData(false)}
        >
          <EditSchoolData
            schoolData={schoolData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowEditSchoolData(false);
              reload();
            }}
          />
        </DisplayModal>

        <DisplayModal
          title="Archive School"
          show={showArchiveSchool}
          onClose={() => setShowArchiveSchool(false)}
        >
          <ArchiveSchool
            schoolData={schoolData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowArchiveSchool(false);
              reload();
            }}
          />
        </DisplayModal>
      </>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export default AdminManageSchoolData;
