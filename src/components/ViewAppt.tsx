import React from 'react'
import { Table } from 'react-bootstrap';
import format from 'date-fns/format';

export default (props: { appt: Appt }) => <Table hover bordered>
  <tbody>
    <tr>
      <th>Date</th>
      <td>{format(props.appt.apptRequest.startTime, "MMM do")} </td>
    </tr>
    <tr>
      <th rowSpan={2}>Attendee</th>
      <td>{props.appt.apptRequest.attendee.name} </td>
    </tr>
    <tr>
      <td>{props.appt.apptRequest.attendee.email} </td>
    </tr>
    <tr>
      <th rowSpan={2}>Host</th>
      <td>{props.appt.apptRequest.host.name} </td>
    </tr>
    <tr>
      <td>{props.appt.apptRequest.host.email} </td>
    </tr>
    <tr>
      <th>Requested Time</th>
      <td>
        {format(props.appt.apptRequest.startTime, "h:mm a - ")}
        {format(props.appt.apptRequest.startTime + props.appt.apptRequest.duration, "h:mm a")}
      </td>
    </tr>
    <tr>
      <th>Request Message</th>
      <td>{props.appt.apptRequest.message} </td>
    </tr>
    <tr>
      <th>Appt Time</th>
      <td>
        {format(props.appt.startTime, "h:mm a - ")}
        {format(props.appt.startTime + props.appt.duration, "h:mm a")}
      </td>
    </tr>
    <tr>
      <th>Response Message</th>
      <td>{props.appt.message} </td>
    </tr>
  </tbody>
</Table>
