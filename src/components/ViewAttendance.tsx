import React from 'react'
import { Table } from 'react-bootstrap';
import format from 'date-fns/format';

export default (props: { attendance: Attendance }) => <Table hover bordered>
  <tbody>
    <tr>
      <th>Date</th>
      <td>{format(props.attendance.appt.apptRequest.startTime, "MMM do")} </td>
    </tr>
    <tr>
      <th rowSpan={2}>Attendee</th>
      <td>{props.attendance.appt.apptRequest.attendee.name} </td>
    </tr>
    <tr>
      <td>{props.attendance.appt.apptRequest.attendee.email} </td>
    </tr>
    <tr>
      <th rowSpan={2}>Host</th>
      <td>{props.attendance.appt.apptRequest.host.name} </td>
    </tr>
    <tr>
      <td>{props.attendance.appt.apptRequest.host.email} </td>
    </tr>
    <tr>
      <th>Requested Time</th>
      <td>
        {format(props.attendance.appt.apptRequest.startTime, "h:mm a - ")}
        {format(props.attendance.appt.apptRequest.startTime + props.attendance.appt.apptRequest.duration, "h:mm a")}
      </td>
    </tr>
    <tr>
      <th>Request Message</th>
      <td>{props.attendance.appt.apptRequest.message} </td>
    </tr>
    <tr>
      <th>Appt Time</th>
      <td>
        {format(props.attendance.appt.startTime, "h:mm a - ")}
        {format(props.attendance.appt.startTime + props.attendance.appt.duration, "h:mm a")}
      </td>
    </tr>
    <tr>
      <th>Response Message</th>
      <td>{props.attendance.appt.message} </td>
    </tr>
    <tr>
      <th>Attendance</th>
      <td>{props.attendance.kind} </td>
    </tr>
  </tbody>
</Table>
