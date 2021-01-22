import React from "react";
import { EventContentArg } from "@fullcalendar/react"

function SessionRequestCard(props: { sessionRequest: SessionRequest }) {
  const sessionRequest = props.sessionRequest;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-danger text-light overflow-hidden" >
      Course: {sessionRequest.course.name}
      <br />
      From: {sessionRequest.attendee.name}
      <br />
      Msg: {sessionRequest.message}
    </div>
  )
}

// Rejected Session Request
function SessionRequestResponseCard(props: { sessionRequestResponse: SessionRequestResponse }) {
  const sessionRequestResponse = props.sessionRequestResponse;

  if (sessionRequestResponse.accepted) {
    return (
      <div className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden" >
        Appt: {sessionRequestResponse.committment!.session.name}
      <br />
        Course: {sessionRequestResponse.committment!.session.course.name}
      <br/>
        Message: {sessionRequestResponse.message}
      </div>
    )
  }
  return (
    <div className="px-1 py-1 h-100 w-100 bg-light text-dark overflow-hidden" >
      Course: {sessionRequestResponse.sessionRequest.course.name}
      <br />
      From: {sessionRequestResponse.sessionRequest.course.name}
      <br />
      Response: {sessionRequestResponse.message}
    </div>
  )
}

function SessionCard(props: { session: Session }) {
  const session = props.session;
  return <div className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden">
    {session.name}
  </div>
}

// Committment
function CommittmentCard(props: { committment: Committment }) {
  const committment = props.committment;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden" >
      Appt: {committment.session.name}
      <br />
      Course: {committment.session.course.name}
    </div>
  )
}

function CommittmentResponseCard(props: { committmentResponse: CommittmentResponse }) {
  const committmentResponse = props.committmentResponse;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-success text-light overflow-hidden" >
      Appt: {committmentResponse.committment.session.name}
      <br />
      Attendee: {committmentResponse.committment.attendee.name}
      <br />
      Status: {committmentResponse.kind}
    </div>
  )
}

function CalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (eventInfo.event.id.split(':')[0]) {
    case "SessionRequest":
      return <SessionRequestCard sessionRequest={props.sessionRequest} />
    case "SessionRequestResponse":
      return <SessionRequestResponseCard sessionRequestResponse={props.sessionRequestResponse} />
    case "Session":
      return <SessionCard session={props.session} />
    case "CommittmentResponse":
      return <CommittmentResponseCard committmentResponse={props.committmentResponse} />
    case "Committment":
      return <CommittmentCard committment={props.committment} />
  }
}

export default CalendarCard;
