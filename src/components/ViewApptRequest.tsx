import React from 'react'
import { Table } from 'react-bootstrap';
import format from 'date-fns/format';

type ViewApptRequestProps = {
  apptRequest: ApptRequest;
}

function ViewApptRequest(props: ViewApptRequestProps) {
  return <Table hover bordered>
        <tbody>
          <tr>
            <th>Date</th>
            <td>{format(props.apptRequest.startTime, "MMM do")} </td>
          </tr>
          <tr>
            <th rowSpan={2}>Attendee</th>
            <td>{props.apptRequest.attendee.name} </td>
          </tr>
          <tr>
            <td>{props.apptRequest.attendee.email} </td>
          </tr>
          <tr>
            <th rowSpan={2}>Host</th>
            <td>{props.apptRequest.host.name} </td>
          </tr>
          <tr>
            <td>{props.apptRequest.host.email} </td>
          </tr>
          <tr>
            <th>Requested Time</th>
            <td>
              {format(props.apptRequest.startTime, "h:mm a - ")}
              {format(props.apptRequest.startTime + props.apptRequest.duration, "h:mm a")}
            </td>
          </tr>
          <tr>
            <th>Message</th>
            <td>{props.apptRequest.message} </td>
          </tr>
        </tbody>
      </Table>
}

export default ViewApptRequest;
