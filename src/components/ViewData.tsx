import React from 'react'
import { Async, AsyncProps } from 'react-async';
import { Spinner, Table } from 'react-bootstrap';
import { Eye } from 'react-bootstrap-icons';
import { Link } from '@innexgo/common-react-components';
import format from 'date-fns/format';
import { Commitment, SessionRequest, SessionRequestResponse, CourseData, SchoolData, SessionData, schoolDataView, courseDataView, sessionDataView } from "../utils/utils";
import { ApiKey, UserData, userDataView } from '@innexgo/frontend-auth-api';
import { isErr, unwrap } from '@innexgo/frontend-common';

const ToggleExpandButton = (props: { expanded: boolean, setExpanded: (b: boolean) => void }) =>
  <button className="btn btn-link px-0 py-0 float-end"
    style={{
      fontWeight: "normal" as const,
      fontSize: "0.875rem"
    }}
    onClick={_ => props.setExpanded(!props.expanded)}>
    {props.expanded ? "Less" : "More"}
  </button>


const loadCourseData = async (props: AsyncProps<CourseData>) => {
  const courseData = await courseDataView({
    courseId: [props.courseId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  // there's an invariant that there must always be one course data per valid course id
  return courseData[0];
}

const loadSchoolData = async (props: AsyncProps<SchoolData>) => {
  const schoolData = await schoolDataView({
    schoolId: [props.schoolId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  // there's an invariant that there must always be one school data per valid school id
  return schoolData[0];
}

const loadSessionData = async (props: AsyncProps<SessionData>) => {
  const maybeSessionData = await sessionDataView({
    sessionId: [props.sessionId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isErr(maybeSessionData)) {
    throw Error(maybeSessionData.Err);
  }
  // there's an invariant that there must always be one session data per valid session id
  return maybeSessionData.Ok[0];
}


const loadUserData = async (props: AsyncProps<UserData>) => {
  const maybeUser = await userDataView({
    creatorUserId: [props.userId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);
  // there's an invariant that there must always be one course data per valid course id
  return maybeUser[0];
}

export const ViewSchool = (props: {
  schoolData: SchoolData,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return !expanded
    ? <span className="clearfix">
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
    ? <span className="clearfix">
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
          <tr>
            <th>Homeroom</th>
            <td>{props.courseData.homeroom ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
}


export const ViewUser = (props: {
  userId: number,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return <Async promiseFn={loadUserData} apiKey={props.apiKey} userId={props.userId}>
    <Async.Pending>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Async.Pending>
    <Async.Rejected>
      <span className="text-danger">Unable to load user data.</span>
    </Async.Rejected>
    <Async.Fulfilled<UserData>>{user =>
      !expanded
        ? <span className="clearfix">
          {user.realname}
          <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
        </span>
        : <div>
          <Table hover bordered>
            <tbody>
              <tr>
                <th>Name</th>
                <td>{user.realname}</td>
              </tr>
              <tr>
                <th>Username</th>
                <td>{user.username}</td>
              </tr>
              <tr>
                <th>Actions</th>
                <td>
                  <Link
                    title="View"
                    icon={Eye}
                    href={`/instructor_manage_course?courseId=${user.creatorUserId}`}
                    variant="dark"
                  />
                </td>
              </tr>
            </tbody>
          </Table>
          <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
        </div>
    }</Async.Fulfilled>
  </Async>


}

export const ViewSession = (props: {
  sessionData: SessionData,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return !expanded
    ? <span className="clearfix">
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
              {format(props.sessionData.endTime, "h:mm a")}
            </td>
          </tr>
          <tr>
            <th>Course</th>
            <td>
              <Async promiseFn={loadCourseData}
                apiKey={props.apiKey}
                courseId={props.sessionData.session.course.courseId}>
                <Async.Pending>
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </Async.Pending>
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
    return <Async promiseFn={loadUserData} apiKey={props.apiKey} userId={props.sessionRequest.creatorUserId}>
      <Async.Pending>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Async.Pending>
      <Async.Rejected>
        <span className="text-danger">Unable to load session.</span>
      </Async.Rejected>
      <Async.Fulfilled<UserData>>{user =>
        <span className="clearfix">{user.realname} - {format(props.sessionRequest.startTime, "MMM do")}
          <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
        </span>
      }
      </Async.Fulfilled>
    </Async>
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
              {format(props.sessionRequest.endTime, "h:mm a")}
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
            <td><ViewUser userId={props.sessionRequest.creatorUserId} apiKey={props.apiKey} expanded={false} /></td>
          </tr>
          <tr>
            <th>Course</th>
            <td>
              <Async promiseFn={loadCourseData}
                apiKey={props.apiKey}
                courseId={props.sessionRequest.course.courseId}>
                <Async.Pending>
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </Async.Pending>
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
    return <Async promiseFn={loadUserData} apiKey={props.apiKey} userId={props.sessionRequestResponse.sessionRequest.creatorUserId}>
      <Async.Pending>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Async.Pending>
      <Async.Rejected>
        <span className="text-danger">Unable to load session.</span>
      </Async.Rejected>
      <Async.Fulfilled<UserData>>{user =>
        <span className="clearfix">
          {user.realname} - {props.sessionRequestResponse.commitment ? "ACCEPTED" : "REJECTED"}
          <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
        </span>
      }
      </Async.Fulfilled>
    </Async>

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
            <td>{props.sessionRequestResponse.commitment ? "Yes" : "No"}</td>
          </tr>
          {props.sessionRequestResponse.commitment == null
            ? <> </>
            : <tr>
              <th>Commitment </th>
              <td><ViewCommitment commitment={props.sessionRequestResponse.commitment} apiKey={props.apiKey} expanded={false} /></td>
            </tr>
          }
        </tbody>
      </Table>
      <ToggleExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
  }
}


export const ViewCommitment = (props: {
  commitment: Commitment,
  apiKey: ApiKey,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  return <Async promiseFn={loadSessionData}
    apiKey={props.apiKey}
    sessionId={props.commitment.session.sessionId}>
    {_ => <>
      <Async.Pending>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<SessionData>>{sessionData =>
        !expanded
          ? <span className="clearfix">
            {format(sessionData.startTime, "h:mm a - ")}
            {format(sessionData.endTime, "h:mm a")}
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
                      sessionId={props.commitment.session.sessionId}>
                      <Async.Pending>
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </Async.Pending>
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
                  <td><ViewUser userId={props.commitment.attendeeUserId} apiKey={props.apiKey} expanded={false} /></td>
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
