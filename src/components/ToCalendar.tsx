import { EventInput } from '@fullcalendar/react';

export const sessionToEvent = (props: {
  sessionData: SessionData,
  relation: CourseMembershipKind,
  apiKey: ApiKey,
  muted: boolean,
  permitted: boolean,
}): EventInput => ({
  id: `Session:${props.sessionData.session.sessionId}`,
  start: new Date(props.sessionData.startTime),
  end: new Date(props.sessionData.startTime + props.sessionData.duration),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
});

export const sessionRequestToEvent = (props: {
  sessionRequest: SessionRequest,
  courseData: CourseData,
  relation: CourseMembershipKind
}): EventInput => ({
  id: `SessionRequest:${props.sessionRequest.sessionRequestId}`,
  start: new Date(props.sessionRequest.startTime),
  end: new Date(props.sessionRequest.startTime + props.sessionRequest.duration),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
})

export const sessionRequestResponseToEvent = (props: {
  sessionRequestResponse: SessionRequestResponse,
  courseData: CourseData,
  sessionData?: SessionData,
  relation: CourseMembershipKind
}): EventInput =>
  props.sessionRequestResponse.accepted
    ? {
      id: `SessionRequestResponse:${props.sessionRequestResponse.sessionRequest.sessionRequestId}`,
      start: new Date(props.sessionData!.startTime),
      end: new Date(props.sessionData!.startTime + props.sessionData!.duration),
      color: "#00000000",
      borderColor: "#00000000",
      extendedProps: props
    }
    : {
      id: `SessionRequestResponse:${props.sessionRequestResponse.sessionRequest.sessionRequestId}`,
      start: new Date(props.sessionRequestResponse.sessionRequest.startTime),
      end: new Date(props.sessionRequestResponse.sessionRequest.startTime + props.sessionRequestResponse.sessionRequest.duration),
      color: "#00000000",
      borderColor: "#00000000",
      extendedProps: props
    }

export const committmentToEvent = (props: {
  committment: Committment,
  courseData: CourseData,
  sessionData: SessionData,
  relation: CourseMembershipKind
}): EventInput => ({
  id: `Committment:${props.committment.committmentId}`,
  start: new Date(props.sessionData.startTime),
  end: new Date(props.sessionData.startTime + props.sessionData.duration),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
})

export const committmentResponseToEvent = (props: {
  committmentResponse: CommittmentResponse,
  sessionData: SessionData,
  relation: CourseMembershipKind
}): EventInput => ({
  id: `CommittmentResponse:${props.committmentResponse.committment.committmentId}`,
  start: new Date(props.sessionData.startTime),
  end: new Date(props.sessionData.startTime + props.sessionData.duration),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
})

