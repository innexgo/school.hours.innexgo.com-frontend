import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Action, AddButton} from '@innexgo/common-react-components';
import DisplayModal from '../components/DisplayModal';
import update from 'immutability-helper';

import { X as DeleteIcon, } from 'react-bootstrap-icons'
import { Formik, FormikHelpers} from 'formik'

import AdminCreateSchoolKey from "../components/AdminCreateSchoolKey";

import format from "date-fns/format";

import { INT_MAX, SchoolKeyData, schoolKeyDataNew } from '../utils/utils';
import { isErr, } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';

type RevokeSchoolKeyProps = {
  schoolKeyData: SchoolKeyData,
  setSchoolKeyData: (schoolKeyData: SchoolKeyData) => void,
  apiKey: ApiKey,
};

function RevokeSchoolKey(props: RevokeSchoolKeyProps) {
  type RevokeSchoolKeyValue = {}

  const onSubmit = async (_: RevokeSchoolKeyValue,
    fprops: FormikHelpers<RevokeSchoolKeyValue>) => {

    const maybeSchoolKeyData = await schoolKeyDataNew({
      schoolKeyKey: props.schoolKeyData.schoolKey.schoolKeyKey,
      active: false,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeSchoolKeyData)) {
      switch (maybeSchoolKeyData.Err) {
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
    props.setSchoolKeyData(maybeSchoolKeyData.Ok);
  }

  return <>
    <Formik<RevokeSchoolKeyValue>
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

type AdminManageSchoolKeyTableProps = {
  schoolId: number,
  schoolKeyData: SchoolKeyData[],
  setSchoolKeyData: (schoolKeyData: SchoolKeyData[]) => void,
  addable:boolean,
  apiKey: ApiKey,
}

const isActive = (k: SchoolKeyData) => k.active && k.schoolKey.endTime > Date.now();

function AdminManageSchoolKeyTable(props: AdminManageSchoolKeyTableProps) {

  const showInactive = false;

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeKeys = props.schoolKeyData
    // enumerate data + index
    .map((k, i) => ({ k, i }))
    // filter inactive
    .filter(({ k }) => showInactive || isActive(k));


  const [confirmRevokeSchoolKeyDataIndex, setConfirmRevokeSchoolKeyDataIndex] = React.useState<number | null>(null);

  const [showCreateKey, setShowCreateKey] = React.useState(false);

  return <>
    <Table hover bordered>
      <thead>
        <tr>
          <th>Key</th>
          <th>Expires</th>
          <th>Uses</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {props.addable
          ? <tr><td colSpan={4} className="p-0"><AddButton onClick={() => setShowCreateKey(true)} /></td></tr>
          : <> </>
        }
        {activeKeys.length === 0
          ? <tr><td colSpan={4} className="text-center">No currently active keys.</td></tr>
          : <> </>
        }
        {activeKeys
          // reverse in order to see newest first
          .reverse()
          .map(({ k, i }) =>
            <tr key={i}>
              <td><code>{k.schoolKey.schoolKeyKey}</code></td>
              <td>{k.schoolKey.endTime === INT_MAX ? "Never" : format(k.schoolKey.endTime, "MMM dd yyyy")}</td>
              <td>{k.schoolKey.maxUses === INT_MAX ? "Infinite" : k.schoolKey.maxUses}</td>
              <td>
                <Action
                  title="Delete"
                  icon={DeleteIcon}
                  variant="danger"
                  onClick={() => setConfirmRevokeSchoolKeyDataIndex(i)}
                  hidden={!isActive(k)}
                />
              </td>
            </tr>
          )}
      </tbody>
    </Table>
    {confirmRevokeSchoolKeyDataIndex === null ? <> </> :
      <DisplayModal
        title="Confirm Remove"
        show={confirmRevokeSchoolKeyDataIndex != null}
        onClose={() => setConfirmRevokeSchoolKeyDataIndex(null)}
      >
        <RevokeSchoolKey
          apiKey={props.apiKey}
          schoolKeyData={props.schoolKeyData[confirmRevokeSchoolKeyDataIndex]}
          setSchoolKeyData={(k) => {
            setConfirmRevokeSchoolKeyDataIndex(null);
            props.setSchoolKeyData(update(props.schoolKeyData, { [confirmRevokeSchoolKeyDataIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
    <DisplayModal
      title="New Key"
      show={showCreateKey}
      onClose={() => setShowCreateKey(false)}
    >
      <AdminCreateSchoolKey
        apiKey={props.apiKey}
        schoolId={props.schoolId}
        postSubmit={key => {
          props.setSchoolKeyData(update(props.schoolKeyData, { $push: [key] }));
          setShowCreateKey(false);
        }}
      />
    </DisplayModal>
  </>
}

export default AdminManageSchoolKeyTable;
