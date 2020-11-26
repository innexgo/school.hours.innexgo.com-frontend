import React from "react";
import { EventContentArg } from "@fullcalendar/react"

function SessionRequestCard(props: { sessionRequest: SessionRequest }) {
  const sessionRequest = props.sessionRequest;
  return (
    <div className="px-1 py-1 h-100 w-100 bg-danger text-light overflow-hidden" >
      From: {sessionRequest.attendee.name}
      <br />
      Msg: {sessionRequest.message}
    </div>
  )
}

function SessionCard(props: { session: Session }) {
  const session = props.session;
  return <div className="px-1 py-1 h-100 w-100 bg-primary text-dark overflow-hidden">
    {session.name}
  </div>
}


function UserCalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (eventInfo.event.id.split(':')[0]) {
    case "SessionRequest":
      return <SessionRequestCard sessionRequest={props.sessionRequest} />
    case "Session":
      return <SessionCard session={props.session} />
  }
}

export default UserCalendarCard;
