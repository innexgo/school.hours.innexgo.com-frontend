import React from "react";
import { EventContentArg } from "@fullcalendar/react"

function ApptRequestCard(props: { apptRequest: ApptRequest }) {
  const apptRequest = props.apptRequest;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-danger text-light overflow-hidden" >
      From: {apptRequest.attendee.name}
      <br />
        Msg: {apptRequest.message}
    </div>
  )
}

function ApptCard(props: { appt: Appt }) {
  const appt = props.appt;
  return <div className="px-1 py-1 h-100 w-100 bg-warning text-dark overflow-hidden">
    Appt: {appt.apptRequest.attendee.name}
    <br />
    Msg: {appt.message}
  </div>
}

function AttendanceCard(props: { attendance: Attendance }) {
  const attendance = props.attendance;
  return <div className="px-1 py-1 h-100 w-100 bg-success text-light overflow-hidden">
    Student: {attendance.appt.apptRequest.attendee.name}
    <br />
    {attendance.kind}
  </div>
}


function UserCalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (props.kind) {
    case "ApptRequest":
      return <ApptRequestCard apptRequest={props.apptRequest} />
    case "Appt":
      return <ApptCard appt={props.appt} />
    case "Attendance":
      return <AttendanceCard attendance={props.attendance} />
  }
}

export default UserCalendarCard;
