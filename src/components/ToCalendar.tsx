import { EventInput } from '@fullcalendar/react';

export const sessionToEvent = (x: Session, relation: CourseMembershipKind): EventInput => ({
  id: `Session:${x.sessionId}`,
  start: new Date(x.startTime),
  end: new Date(x.startTime + x.duration),
  color: "#00000000",
  session: x,
  relation
});

export const sessionRequestToEvent = (x: SessionRequest, relation: CourseMembershipKind): EventInput => ({
  id: `SessionRequest:${x.sessionRequestId}`,
  start: new Date(x.startTime),
  end: new Date(x.startTime + x.duration),
  color: "#00000000",
  sessionRequest: x,
  relation
})

export const sessionRequestResponseToEvent = (x: SessionRequestResponse, relation: CourseMembershipKind): EventInput =>
  x.accepted
    ? {
      id: `SessionRequestResponse:${x.sessionRequest.sessionRequestId}`,
      start: new Date(x.committment!.session.startTime),
      end: new Date(x.committment!.session.startTime + x.committment!.session.duration),
      color: "#00000000",
      sessionRequestResponse: x,
      relation
    }
    : {
      id: `SessionRequestResponse:${x.sessionRequest.sessionRequestId}`,
      start: new Date(x.sessionRequest.startTime),
      end: new Date(x.sessionRequest.startTime + x.sessionRequest.duration),
      color: "#00000000",
      sessionRequestResponse: x,
      relation
    }

export const committmentToEvent = (x: Committment, relation: CourseMembershipKind): EventInput => ({
  id: `Committment:${x.committmentId}`,
  start: new Date(x.session.startTime),
  end: new Date(x.session.startTime + x.session.duration),
  color: "#00000000",
  committment: x,
  relation
})

export const committmentResponseToEvent = (x: CommittmentResponse, relation: CourseMembershipKind): EventInput => ({
  id: `CommittmentResponse:${x.committment.committmentId}`,
  start: new Date(x.committment.session.startTime),
  end: new Date(x.committment.session.startTime + x.committment.session.duration),
  color: "#00000000",
  committmentResponse: x,
  relation
})

