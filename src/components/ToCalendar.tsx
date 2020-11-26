import {EventInput} from '@fullcalendar/react';

export const sessionToEvent = (x: Session): EventInput => ({
  id: `Session:${x.sessionId}`,
  start: new Date(x.startTime),
  end: new Date(x.startTime + x.duration),
  color: "#00000000",
  session: x
});

export const sessionRequestToEvent = (x: SessionRequest): EventInput => ({
  id: `SessionRequest:${x.sessionRequestId}`,
  start: new Date(x.startTime),
  end: new Date(x.startTime + x.duration),
  color: "#00000000",
  sessionRequest: x
})

export const sessionRequestResponseToEvent = (x: SessionRequestResponse): EventInput => ({
  id: `SessionRequestResponse:${x.sessionRequest.sessionRequestId}`,
  start: new Date(x.sessionRequest.startTime),
  end: new Date(x.sessionRequest.startTime + x.sessionRequest.duration),
  color: "#00000000",
  sessionRequestResponse: x
})

export const committmentToEvent = (x: Committment): EventInput => ({
  id: `Committment:${x.committmentId}`,
  start: new Date(x.session.startTime),
  end: new Date(x.session.startTime + x.session.duration),
  color: "#00000000",
  committment: x
})

export const committmentResponseToEvent = (x: CommittmentResponse): EventInput => ({
  id: `CommittmentResponse:${x.committment.committmentId}`,
  start: new Date(x.committment.session.startTime),
  end: new Date(x.committment.session.startTime + x.committment.session.duration),
  color: "#00000000",
  committmentResponse: x
})

