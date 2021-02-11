import React from 'react'
import { Async, AsyncProps } from 'react-async';
import { Table } from 'react-bootstrap';
import Loader from '../components/Loader';
import format from 'date-fns/format';
import { isApiErrorCode, viewSchoolData, viewCourseData, viewSessionData } from "../utils/utils";

const ToggleExpandButton = (props: { expanded: boolean, setExpanded: (b: boolean) => void }) =>
  <button className="btn btn-link px-0 py-0 float-right"
    style={{
      fontWeight: "normal" as const,
      fontSize: "0.875rem"
    }}
    onClick={_ => props.setExpanded(!props.expanded)}>
    {props.expanded ? "Less" : "More"}
  </button>


const loadCourseData = async (props: AsyncProps<CourseData>) => {
  const maybeCourseData = await viewCourseData({
    courseId: props.courseId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeCourseData)) {
    throw Error;
  }
  // there's an invariant that there must always be one course data per valid course id
  return maybeCourseData[0];
}

const loadSchoolData = async (props: AsyncProps<SchoolData>) => {
  const maybeSchoolData = await viewSchoolData({
    schoolId: props.schoolId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeSchoolData)) {
    throw Error;
  }
  // there's an invariant that there must always be one school data per valid school id
  return maybeSchoolData[0];
}

const loadSessionData = async (props: AsyncProps<SessionData>) => {
  const maybeSessionData = await viewSessionData({
    sessionId: props.sessionId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeSessionData)) {
    throw Error;
  }
  // there's an invariant that there must always be one session data per valid session id
  return maybeSessionData[0];
}

export const ViewSchool = (props: {
  schoolData: SchoolData,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return !expanded
    ? <span>
      {props.schoolData.name}
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </span>
    : <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Name</th>
            <td>{props.schoolData.name}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{props.schoolData.description}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
}


export const ViewCourse = (props: {
  courseData: CourseData,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return !expanded
    ? <span>
      {props.courseData.name}
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </span>
    : <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Name</th>
            <td>{props.courseData.name}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{props.courseData.description}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
}


export const ViewUser = (props: {
  user: User,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return !expanded
    ? <span>
      {props.user.name}
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </span>
    : <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Name</th>
            <td>{props.user.name}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{props.user.email}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
}

export const ViewSession = (props: {
  sessionData: SessionData,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return !expanded
    ? <span>
      {props.sessionData.name} - {format(props.sessionData.startTime, "MMM do")}
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </span>
    : <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Name</th>
            <td>{props.sessionData.name} </td>
          </tr>
          <tr>
            <th>Date</th>
            <td>{format(props.sessionData.startTime, "MMM do")} </td>
          </tr>
          <tr>
            <th>Time</th>
            <td>
              {format(props.sessionData.startTime, "h:mm a - ")}
              {format(props.sessionData.startTime + props.sessionData.duration, "h:mm a")}
            </td>
          </tr>
          <tr>
            <th>Private</th>
            <td>{`${props.sessionData.hidden}`}</td>
          </tr>
          <tr>
            <th>Course</th>
            <td>
              <Async promiseFn={loadCourseData}
                apiKey={props.apiKey}
                courseId={props.sessionData.session.course.courseId}>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  <span className="text-danger">Unable to load course.</span>
                </Async.Rejected>
                <Async.Fulfilled<CourseData>>{courseData =>
                  <ViewCourse courseData={courseData} apiKey={props.apiKey} expanded={false} />
                }</Async.Fulfilled>
              </Async>
            </td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
}

export const ViewSessionRequest = (props: {
  sessionRequest: SessionRequest,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span> {props.sessionRequest.attendee.name} - {format(props.sessionRequest.startTime, "MMM do")}
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Date</th>
            <td>{format(props.sessionRequest.startTime, "MMM do")} </td>
          </tr>
          <tr>
            <th>Requested Time</th>
            <td>
              {format(props.sessionRequest.startTime, "h:mm a - ")}
              {format(props.sessionRequest.startTime + props.sessionRequest.duration, "h:mm a")}
            </td>
          </tr>
          <tr>
            <th>Request Message</th>
            <td>{props.sessionRequest.message} </td>
          </tr>
          <tr>
            <th>Request Sent</th>
            <td>{format(props.sessionRequest.creationTime, "MMM do h:mm a")}</td>
          </tr>
          <tr>
            <th>Attendee</th>
            <td><ViewUser user={props.sessionRequest.attendee} apiKey={props.apiKey} expanded={false} /></td>
          </tr>
          <tr>
            <th>Course</th>
            <td>
              <Async promiseFn={loadCourseData}
                apiKey={props.apiKey}
                courseId={props.sessionRequest.course.courseId}>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  <span className="text-danger">Unable to load course.</span>
                </Async.Rejected>
                <Async.Fulfilled<CourseData>>{courseData =>
                  <ViewCourse courseData={courseData} apiKey={props.apiKey} expanded={false} />
                }</Async.Fulfilled>
              </Async>
            </td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
  }
}

export const ViewSessionRequestResponse = (props: {
  sessionRequestResponse: SessionRequestResponse,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {props.sessionRequestResponse.sessionRequest.attendee.name} - {props.sessionRequestResponse.accepted ? "ACCEPTED" : "REJECTED"}
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Request</th>
            <td><ViewSessionRequest sessionRequest={props.sessionRequestResponse.sessionRequest} apiKey={props.apiKey} expanded /></td>
          </tr>
          <tr>
            <th>Response Time</th>
            <td>{format(props.sessionRequestResponse.creationTime, "MMM do h:mm a")}</td>
          </tr>
          <tr>
            <th>Response Message</th>
            <td>{props.sessionRequestResponse.message}</td>
          </tr>
          <tr>
            <th>Accepted</th>
            <td>{props.sessionRequestResponse.accepted ? "Yes" : "No"}</td>
          </tr>
          {props.sessionRequestResponse.committment == null
            ? <> </>
            : <tr>
              <th>Committment </th>
              <td><ViewCommittment committment={props.sessionRequestResponse.committment} apiKey={props.apiKey} expanded={false} /></td>
            </tr>
          }
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
  }
}


export const ViewCommittment = (props: {
  committment: Committment,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return <Async promiseFn={loadSessionData}
    apiKey={props.apiKey}
    sessionId={props.committment.session.sessionId}>
    {_ => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<SessionData>>{sessionData =>
        expanded
          ? <span>
            {format(sessionData.startTime, "h:mm a - ")}
            {format(sessionData.startTime + sessionData.duration, "h:mm a")}
            <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
          </span>
          : <div>
            <Table hover bordered>
              <tbody>
                <tr>
                  <th>Session</th>
                  <td>
                    <Async promiseFn={loadSessionData}
                      apiKey={props.apiKey}
                      sessionId={props.committment.session.sessionId}>
                      <Async.Pending><Loader /></Async.Pending>
                      <Async.Rejected>
                        <span className="text-danger">Unable to load session.</span>
                      </Async.Rejected>
                      <Async.Fulfilled<SessionData>>{sessionData =>
                        <ViewSession sessionData={sessionData} apiKey={props.apiKey} expanded={false} />
                      }</Async.Fulfilled>
                    </Async>
                  </td>
                </tr>
                <tr>
                  <th>Attendee</th>
                  <td><ViewUser user={props.committment.attendee} apiKey={props.apiKey} expanded={false} /></td>
                </tr>
                <tr>
                  <th>Mandatory</th>
                  <td>{props.committment.cancellable ? "Yes" : "No"}</td>
                </tr>
              </tbody>
            </Table>
            <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
          </div>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export const ViewCommittmentResponse = (props: {
  committmentResponse: CommittmentResponse,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {props.committmentResponse.kind}
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Committment</th>
            <td><ViewCommittment committment={props.committmentResponse.committment} apiKey={props.apiKey} expanded /></td>
          </tr>
          <tr>
            <th>Date Taken</th>
            <td>{format(props.committmentResponse.creationTime, "MMM do h:mm a")}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>{props.committmentResponse.kind}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
  }
}
