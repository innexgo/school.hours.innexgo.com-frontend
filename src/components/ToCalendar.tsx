import { EventInput } from '@fullcalendar/react';
import { SessionData, CourseData, Commitment, SessionRequest, SessionRequestResponse, CourseMembership, CourseMembershipKind } from '../utils/utils';
import { ApiKey, UserData} from '@innexgo/frontend-auth-api';

export const sessionToEvent = (props: {
  sessionData: SessionData,
  relation: CourseMembershipKind,
  apiKey: ApiKey,
  muted: boolean,
  permitted: boolean,
}): EventInput => ({
  id: `Session:${props.sessionData.session.sessionId}`,
  start: new Date(props.sessionData.startTime),
  end: new Date(props.sessionData.endTime),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
});

export const sessionRequestToEvent = (props: {
  sessionRequest: SessionRequest,
  courseData: CourseData,
  creatorUserData: UserData,
  relation: CourseMembershipKind
}): EventInput => ({
  id: `SessionRequest:${props.sessionRequest.sessionRequestId}`,
  start: new Date(props.sessionRequest.startTime),
  end: new Date(props.sessionRequest.endTime),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
})

export const acceptedSessionRequestResponseToEvent = (props: {
  sessionRequestResponse: SessionRequestResponse,
  courseData: CourseData,
  sessionData: SessionData,
  relation: CourseMembershipKind
}): EventInput => ({
  id: `SessionRequestResponse:${props.sessionRequestResponse.sessionRequest.sessionRequestId}`,
  start: new Date(props.sessionData!.startTime),
  end: new Date(props.sessionData!.endTime),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
})

export const rejectedSessionRequestResponseToEvent = (props: {
  sessionRequestResponse: SessionRequestResponse,
  courseData: CourseData,
  relation: CourseMembershipKind
}): EventInput => ({
  id: `SessionRequestResponse:${props.sessionRequestResponse.sessionRequest.sessionRequestId}`,
  start: new Date(props.sessionRequestResponse.sessionRequest.startTime),
  end: new Date(props.sessionRequestResponse.sessionRequest.endTime),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
})

export const commitmentToEvent = (props: {
  commitment: Commitment,
  courseData: CourseData,
  sessionData: SessionData,
  relation: CourseMembershipKind
}): EventInput => ({
  id: `Commitment:${props.commitment.commitmentId}`,
  start: new Date(props.sessionData.startTime),
  end: new Date(props.sessionData.endTime),
  color: "#00000000",
  borderColor: "#00000000",
  extendedProps: props
})

