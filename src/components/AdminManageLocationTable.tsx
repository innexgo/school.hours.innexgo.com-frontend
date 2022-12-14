import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Action, Link, AddButton, DisplayModal } from '@innexgo/common-react-components';
import { ViewUser, } from '../components/ViewData';
import update from 'immutability-helper';

import { X as DeleteIcon, Eye, Pencil } from 'react-bootstrap-icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Location, LocationData, locationDataNew, locationDataView } from '../utils/utils';
import { ApiKey, User } from '@innexgo/frontend-auth-api';

import InstructorArchiveLocationDataForm from '../components/InstructorArchiveLocationDataForm';
import InstructorEditLocationDataForm from '../components/InstructorEditLocationDataForm';
import AdminCreateLocation from '../components/AdminCreateLocation';

const isActive = (cd: LocationData) => cd.active;

type AdminManageLocationDataTableProps = {
  addable: boolean,
  schoolId: number,
  locationData: LocationData[],
  setLocationData: (locationData: LocationData[]) => void,
  apiKey: ApiKey,
}

function AdminManageLocationDataTable(props: AdminManageLocationDataTableProps) {
  const showInactive = false;

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeLocationDatas = props.locationData
    // enumerate data + index
    .map((cd, i) => ({ cd, i }))
    // filter inactive
    .filter(({ cd }) => showInactive || isActive(cd));


  const [confirmArchiveLocationDataIndex, setConfirmArchiveLocationDataIndex] = React.useState<number | null>(null);
  const [confirmEditLocationDataIndex, setConfirmEditLocationDataIndex] = React.useState<number | null>(null);
  const [showCreateLocation, setShowCreateLocation] = React.useState<boolean>(false);

  return <>
    <Table hover bordered>
      <thead>
        <tr>
          <th>Name</th>
          <th>Creator</th>
          <th>Date Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {
          props.addable
            ? <tr><td colSpan={4} className="p-0"><AddButton onClick={() => setShowCreateLocation(true)} /></td></tr>
            : <> </>
        }
        {
          activeLocationDatas.length === 0
            ? <tr><td colSpan={4} className="text-center">No current locations.</td></tr>
            : <> </>
        }
        {activeLocationDatas
          .map(({ cd, i }) =>
            <tr key={i}>
              <td>{cd.name}</td>
              <td><ViewUser userId={cd.location.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
              <td>{format(cd.location.creationTime, "MMM do")}</td>
              <td>
                <Action
                  title="Archive"
                  icon={DeleteIcon}
                  variant="danger"
                  onClick={() => setConfirmArchiveLocationDataIndex(i)}
                />
                <Action
                  title="Edit"
                  icon={Pencil}
                  variant="dark"
                  onClick={() => setConfirmEditLocationDataIndex(i)}
                />
              </td>
            </tr>
          )}
      </tbody>
    </Table>
    <DisplayModal
      title="New Location"
      show={showCreateLocation}
      onClose={() => setShowCreateLocation(false)}
    >
      <AdminCreateLocation
        apiKey={props.apiKey}
        schoolId={props.schoolId}
        postSubmit={location => {
          props.setLocationData(update(props.locationData, { $push: [location] }));
          setShowCreateLocation(false);
        }}
      />
    </DisplayModal>
    {confirmArchiveLocationDataIndex === null ? <> </> :
      <DisplayModal
        title="Confirm Archive"
        show={confirmArchiveLocationDataIndex != null}
        onClose={() => setConfirmArchiveLocationDataIndex(null)}
      >
        <InstructorArchiveLocationDataForm
          apiKey={props.apiKey}
          locationData={props.locationData[confirmArchiveLocationDataIndex]}
          setLocationData={(k) => {
            setConfirmArchiveLocationDataIndex(null);
            props.setLocationData(update(props.locationData, { [confirmArchiveLocationDataIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
    {confirmEditLocationDataIndex === null ? <> </> :
      <DisplayModal
        title="Edit Location"
        show={confirmEditLocationDataIndex != null}
        onClose={() => setConfirmEditLocationDataIndex(null)}
      >
        <InstructorEditLocationDataForm
          apiKey={props.apiKey}
          locationData={props.locationData[confirmEditLocationDataIndex]}
          setLocationData={(k) => {
            setConfirmEditLocationDataIndex(null);
            props.setLocationData(update(props.locationData, { [confirmEditLocationDataIndex]: { $set: k } }))
          }}
        />
      </DisplayModal>
    }
  </>
}


export default AdminManageLocationDataTable;
