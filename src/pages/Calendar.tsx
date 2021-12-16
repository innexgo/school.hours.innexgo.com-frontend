import React from 'react'
import { Async, AsyncProps } from 'react-async';
import { Loader, WidgetWrapper } from '@innexgo/common-react-components';
import FullCalendar, { DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarCard from '../components/CalendarCard';

import { unwrap } from '@innexgo/frontend-common';
import assert from 'assert';
import { userView, ApiKey, userDataView, UserData } from '@innexgo/frontend-auth-api';
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

import { Tab, Tabs, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { Session, SessionData, SessionRequest, SessionRequestResponse, CourseMembership, CourseData, Commitment } from '../utils/utils';
import { sessionDataView, sessionRequestView, courseMembershipView } from '../utils/utils';
import { sessionRequestResponseView, commitmentView, courseDataView, } from '../utils/utils';

import { ViewSession, ViewSessionRequestResponse, ViewCommitment, ViewCommitmentResponse } from '../components/ViewData';


import InstructorCreateSession from '../components/InstructorCreateSession';
import StudentCreateSessionRequest from '../components/StudentCreateSessionRequest';
import InstructorReviewSessionRequest from '../components/InstructorReviewSessionRequest';
import InstructorManageSession from '../components/InstructorManageSession';
import StudentManageSessionRequest from '../components/StudentManageSessionRequest';
import DisplayModal from '../components/DisplayModal';
import { sessionToEvent, sessionRequestToEvent, rejectedSessionRequestResponseToEvent, acceptedSessionRequestResponseToEvent, commitmentToEvent, commitmentResponseToEvent } from '../components/ToCalendar';

type EventCalendarProps = {
  apiKey: ApiKey,
  showAllHours: boolean,
  showHiddenEvents: boolean,
  creatorUserData: UserData,
  instructorCourseDatas: CourseData[],
  studentCourseDatas: CourseData[],
  courseMemberships: CourseMembership[],
}

function EventCalendar(props: EventCalendarProps) {

  // Closing it should also unselect anything using it
  const [selectedSpan, setSelectedSpanRaw] = React.useState<{ start: number, end: number } | null>(null);
  const setSelectedSpan = (a: { start: number, end: number } | null) => {
    setSelectedSpanRaw(a)
    if (!a && calendarRef.current != null) {
      calendarRef.current.getApi().unselect();
    }
  }

  // the currently selected data
  const [selectedManageSession, setSelectedManageSession] = React.useState<Session | null>(null);
  const [selectedViewSessionData, setSelectedViewSessionData] = React.useState<SessionData | null>(null);
  const [selectedManageSessionRequest, setSelectedManageSessionRequest] = React.useState<SessionRequest | null>(null);
  const [selectedReviewSessionRequest, setSelectedReviewSessionRequest] = React.useState<SessionRequest | null>(null);
  const [selectedViewSessionRequestResponse, setSelectedViewSessionRequestResponse] = React.useState<SessionRequestResponse | null>(null);
  const [selectedViewCommitment, setSelectedViewCommitment] = React.useState<Commitment | null>(null);

  const calendarRef = React.useRef<FullCalendar | null>(null);

  const studentEventSource = async (
    args: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    }) => {

    const sessionRequests = await sessionRequestView({
      creatorUserId: [props.apiKey.creatorUserId],
      courseId: props.studentCourseDatas.map(cd => cd.course.courseId),
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      responded: false,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    const rejectedSessionRequestResponses = await sessionRequestResponseView({
      attendeeUserId: [props.apiKey.creatorUserId],
      courseId: props.studentCourseDatas.map(cd => cd.course.courseId),
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      accepted: false,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    const acceptedSessionRequestResponses = await sessionRequestResponseView({
      attendeeUserId: [props.apiKey.creatorUserId],
      courseId: props.studentCourseDatas.map(cd => cd.course.courseId),
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      accepted: true,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    const commitments = await commitmentView({
      attendeeUserId: [props.apiKey.creatorUserId],
      courseId: props.studentCourseDatas.map(cd => cd.course.courseId),
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      fromRequestResponse: false,
      onlyRecent: true,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    // many of these need session data, which we grab now
    const sessionData = await sessionDataView({
      sessionId: [
        ...acceptedSessionRequestResponses.map(x => x.commitment!.session.sessionId),
        ...commitments.map(x => x.session.sessionId),
      ],
      onlyRecent: true,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    // note that we mark these with "STUDENT" to show that these are existing in our student capacity
    return [
      ...sessionRequests
        // match with a course
        .map(sr => ({ sr, cd: props.studentCourseDatas.find(cd => cd.course.courseId === sr.course.courseId)! }))
        // map to event
        .map(({ sr, cd }) =>
          sessionRequestToEvent({
            sessionRequest: sr,
            courseData: cd,
            relation: "STUDENT",
            creatorUserData: props.creatorUserData,
          })),

      ...rejectedSessionRequestResponses
        // hide things you cancelled yourself
        .filter(x => x.creatorUserId !== props.apiKey.creatorUserId || props.showHiddenEvents)
        // match with a course
        .map(srr => ({ srr, cd: props.studentCourseDatas.find(cd => cd.course.courseId === srr.sessionRequest.course.courseId)! }))
        // map to event
        .map(({ srr, cd }) => rejectedSessionRequestResponseToEvent({
          sessionRequestResponse: srr,
          courseData: cd!,
          relation: "STUDENT"
        })),

      ...acceptedSessionRequestResponses
        // TODO use this data when displaying commitments or commitmentresponses
        // match with a course
        .map(srr => ({ srr, cd: props.studentCourseDatas.find(cd => cd.course.courseId === srr.sessionRequest.course.courseId)! }))
        // match with a session
        .map(({ srr, cd }) => ({ srr, cd, sd: sessionData.find(sd => sd.session.sessionId === srr.commitment!.session.sessionId)! }))
        // map to event
        .map(({ srr, cd, sd }) => acceptedSessionRequestResponseToEvent({
          sessionRequestResponse: srr,
          courseData: cd,
          sessionData: sd,
          relation: "STUDENT"
        })),


      ...commitments
        // match with a course
        .map(c => ({ c, cd: props.studentCourseDatas.find(cd => cd.course.courseId === c.session.course.courseId)! }))
        // match with a session
        .map(({ c, cd }) => ({ c, cd, sd: sessionData.find(sd => sd.session.sessionId === c.session.sessionId)! }))
        // map to event
        .map(({ c, cd, sd }) => commitmentToEvent({
          commitment: c,
          courseData: cd,
          sessionData: sd,
          relation: "STUDENT"
        })),
    ];
  }

  // get instructor data

  const instructorEventSource = async (
    args: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    }) => {

    const iSessionData = await sessionDataView({
      courseId: props.instructorCourseDatas.map(cd => cd.course.courseId),
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      onlyRecent: true,
      active: true,
      apiKey: props.apiKey.key,
    })
      .then(unwrap);

    const iSessionRequests = await sessionRequestView({
      courseId: props.instructorCourseDatas.map(cd => cd.course.courseId),
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      responded: false,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    const iRejectedSessionRequestResponses = await sessionRequestResponseView({
      courseId: props.instructorCourseDatas.map(cd => cd.course.courseId),
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      accepted: false,
      apiKey: props.apiKey.key,
    })
      .then(unwrap);

    // fetch the session requesters
    const sessionRequesters = await userDataView({
      creatorUserId: iSessionRequests.map(sr => sr.creatorUserId),
      onlyRecent: true,
      apiKey: props.apiKey.key,
    })
      .then(unwrap);


    return [
      ...iSessionData
        .map(sd => sessionToEvent({
          sessionData: sd,
          relation: "INSTRUCTOR",
          apiKey: props.apiKey,
          muted: false,
          permitted: true
        })),

      ...iSessionRequests
        // match with a course
        .map(sr => ({ sr, cd: props.instructorCourseDatas.find(cd => cd.course.courseId === sr.course.courseId)! }))
        // match with a user
        .map(({ sr, cd }) => ({ sr, cd, u: sessionRequesters.find(u => u.creatorUserId === sr.creatorUserId)! }))
        // now map to event
        .map(({ sr, cd, u }) => sessionRequestToEvent({
          sessionRequest: sr,
          courseData: cd,
          creatorUserData: u,
          relation: "INSTRUCTOR"
        })),

      ...iRejectedSessionRequestResponses
        // hide if show all not enabled
        .filter(_ => props.showHiddenEvents)
        // match with a course
        .map(srr => ({ srr, cd: props.instructorCourseDatas.find(cd => cd.course.courseId === srr.sessionRequest.course.courseId)! }))
        .map(({ srr, cd }) => rejectedSessionRequestResponseToEvent({
          sessionRequestResponse: srr,
          courseData: cd,
          relation: "INSTRUCTOR"
        })),
    ];
  }

  //this handler runs any time we recieve a click on an event
  const clickHandler = (eca: EventClickArg) => {
    const props = eca.event.extendedProps;
    // we switch on what type it is
    switch (eca.event.id.split(':')[0]) {
      case "Session": {
        if (props.relation === "INSTRUCTOR") {
          // if we are an instructor we get the editable view of the course
          setSelectedManageSession(props.sessionData.session);
        } else {
          // otherwise get the view only version
          setSelectedViewSessionData(props.sessionData);
        }
        break;
      }
      case "SessionRequest": {
        if (props.relation === "INSTRUCTOR") {
          // if we are an instructor we get to reivew the request
          setSelectedReviewSessionRequest(props.sessionRequest);
        } else {
          // otherwise we can manage it
          setSelectedManageSessionRequest(props.sessionRequest);
        }
        break;
      }
      case "SessionRequestResponse": {
        setSelectedViewSessionRequestResponse(props.sessionRequestResponse);
        break;
      }
      case "Commitment": {
        setSelectedViewCommitment(props.commitment);
        break;
      }
    }
  }

  const showAllHoursProps = props.showAllHours ? {} : {
    slotMinTime: "10:00",
    slotMaxTime: "13:00",
    weekends: false
  }

  return <>
    <FullCalendar
      {...showAllHoursProps}
      ref={calendarRef}
      plugins={[timeGridPlugin, interactionPlugin]}
      headerToolbar={{
        left: 'prev,next today',
        center: '',
        right: 'timeGridDay,timeGridWeek',
      }}
      initialView='timeGridWeek'
      height={"auto"}
      datesSet={({ view }) => /* Keeps window size in sync */view.calendar.updateSize()}
      allDaySlot={false}
      slotDuration="00:05:00"
      nowIndicator={true}
      editable={false}
      selectable={true}
      selectMirror={true}
      eventSources={[studentEventSource, instructorEventSource]}
      eventContent={CalendarCard}
      unselectCancel=".modal-content"
      eventClick={clickHandler}
      businessHours={
        [
          {
            daysOfWeek: [1], // M
            startTime: "10:25", // 8am
            endTime: "10:55", // 6pm
            startRecur: new Date()
          },
          {
            daysOfWeek: [3, 5], // WF
            startTime: "11:40", // 8am
            endTime: "12:30", // 6pm
            startRecur: new Date()
          },
        ]
      }
      selectConstraint="businessHours"
      unselect={() => {
        setSelectedSpan(null);
      }}
      select={(dsa: DateSelectArg) => {
        // only open modal if this date is in the future
        if (dsa.start.valueOf() > Date.now()) {
          setSelectedSpan({
            start: dsa.start.valueOf(),
            end: dsa.end.valueOf()
          });
        } else {
          if (calendarRef.current != null) {
            calendarRef.current.getApi().unselect();
          }
        }
      }}
    />


    {selectedSpan === null ? <> </> :
      <DisplayModal
        title="New Event"
        show={selectedSpan !== null}
        onClose={() => setSelectedSpan(null)}
      >
        <Tabs className="py-3">
          {props.courseMemberships.filter(x => x.courseMembershipKind === "INSTRUCTOR").length === 0 ? <> </> :
            <Tab eventKey="session" title="Create Session">
              <InstructorCreateSession
                apiKey={props.apiKey}
                start={selectedSpan.start}
                end={selectedSpan.end}
                postSubmit={() => setSelectedSpan(null)}
              />
            </Tab>
          }
          {props.courseMemberships.filter(x => x.courseMembershipKind === "STUDENT").length === 0 ? <> </> :
            <Tab eventKey="profile" title="Create Request">
              <StudentCreateSessionRequest
                apiKey={props.apiKey}
                start={selectedSpan.start}
                end={selectedSpan.end}
                postSubmit={() => setSelectedSpan(null)}
              />
            </Tab>
          }
          {props.courseMemberships.filter(x => x.courseMembershipKind !== "CANCEL").length > 0 ? <> </> :
            <Tab eventKey="joincourse" title="Join a Course">
              <p>You need to join a course in order to create an event.</p>
              <ul>
                <li>If you're a student, you can <a href="/add_course">join a course</a>.</li>
                <li>If you're an instructor, <a href="/add_course">create a course</a>.</li>
              </ul>
            </Tab>
          }
        </Tabs>
      </DisplayModal>
    }
    {selectedManageSession === null ? <> </> :
      <DisplayModal
        title="Manage Session"
        show={selectedManageSession !== null}
        onClose={() => setSelectedManageSession(null)}
      >
        <InstructorManageSession session={selectedManageSession} apiKey={props.apiKey} />
      </DisplayModal>
    }
    {selectedViewSessionData === null ? <> </> :
      <DisplayModal
        title="View Session"
        show={selectedManageSession !== null}
        onClose={() => setSelectedViewSessionData(null)}
      >
        <ViewSession sessionData={selectedViewSessionData} expanded apiKey={props.apiKey} />
      </DisplayModal>
    }
    {selectedReviewSessionRequest === null ? <> </> :
      <DisplayModal
        title="Review Student Request"
        show={selectedReviewSessionRequest !== null}
        onClose={() => setSelectedReviewSessionRequest(null)}
      >
        <InstructorReviewSessionRequest
          sessionRequest={selectedReviewSessionRequest}
          apiKey={props.apiKey}
          postSubmit={() => setSelectedReviewSessionRequest(null)}
        />
      </DisplayModal>
    }
    {selectedManageSessionRequest === null ? <> </> :
      <DisplayModal
        title="Manage your Session Request"
        show={selectedManageSessionRequest !== null}
        onClose={() => setSelectedManageSessionRequest(null)}
      >
        <StudentManageSessionRequest
          sessionRequest={selectedManageSessionRequest}
          apiKey={props.apiKey}
          postSubmit={() => setSelectedManageSessionRequest(null)}
        />
      </DisplayModal>
    }
    {selectedViewSessionRequestResponse === null ? <> </> :
      <DisplayModal
        title="View Session Request Response"
        show={selectedViewSessionRequestResponse !== null}
        onClose={() => setSelectedViewSessionRequestResponse(null)}
      >
        <ViewSessionRequestResponse
          sessionRequestResponse={selectedViewSessionRequestResponse}
          apiKey={props.apiKey}
          expanded
        />
      </DisplayModal>
    }
    {selectedViewCommitment === null ? <> </> :
      <DisplayModal
        title="View Commitment"
        show={selectedViewCommitment !== null}
        onClose={() => setSelectedViewCommitment(null)}
      >
        <ViewCommitment
          commitment={selectedViewCommitment}
          apiKey={props.apiKey}
          expanded
        />
      </DisplayModal>
    }
  </>
}

type CalendarCourseData = {
  userData: UserData,
  courseMemberships: CourseMembership[],
  studentCourseDatas: CourseData[],
  instructorCourseDatas: CourseData[]
}

const loadCalendarCourseData = async (props: AsyncProps<CalendarCourseData>) => {

  const userData = await userDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)
    .then(x => {
      assert(x.length > 0);
      return x[0];
    })

  const courseMemberships = await courseMembershipView({
    userId: [props.apiKey.creatorUserId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  const instructorCourseDatas = await courseDataView({
    courseId: courseMemberships.filter(cm => cm.courseMembershipKind === "INSTRUCTOR").map(cm => cm.course.courseId),
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  const studentCourseDatas = await courseDataView({
    courseId: courseMemberships.filter(cm => cm.courseMembershipKind === "STUDENT").map(cm => cm.course.courseId),
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  return {
    userData,
    courseMemberships,
    studentCourseDatas,
    instructorCourseDatas,
  };
}



function CalendarWidget(props: AuthenticatedComponentProps) {
  const [showAllHours, setShowAllHours] = React.useState(false);
  const [showHiddenEvents, setShowHiddenEvents] = React.useState(false);
  const [hiddenCourses, setHiddenCourses] = React.useState<number[]>([]);

  return <WidgetWrapper title="Upcoming Appointments">
    <span>
      This screen shows all future appointments.
      You can click any date to add an appointment on that date,
      or click an existing appointment to delete it.
    </span>
    <Async promiseFn={loadCalendarCourseData} apiKey={props.apiKey}>
      <Async.Pending>
        <Loader />
      </Async.Pending>
      <Async.Rejected>
        <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
      </Async.Rejected>
      <Async.Fulfilled<CalendarCourseData>>{ccd =>
        <Row>
          <Col sm>
            <Card className="my-3 mx-3">
              <Card.Body>
                <Card.Title> View Settings </Card.Title>
                <Form.Check
                  checked={showAllHours}
                  onChange={_ => setShowAllHours(!showAllHours)}
                  label="Show All Hours"
                />
                <Form.Check
                  checked={showHiddenEvents}
                  onChange={_ => setShowHiddenEvents(!showHiddenEvents)}
                  label="Show Hidden Events"
                />
                {ccd.courseMemberships.length === 0
                  ? <> </>
                  : <Card.Subtitle className="my-2"> Hide Courses </Card.Subtitle>
                }
                {[...ccd.studentCourseDatas, ...ccd.instructorCourseDatas]
                  .map((cd: CourseData) =>
                    <Form.Check
                      checked={hiddenCourses.includes(cd.course.courseId)}
                      onChange={_ => setHiddenCourses(
                        hiddenCourses.includes(cd.course.courseId)
                          // if its included, remove it
                          ? hiddenCourses.filter(ci => ci !== cd.course.courseId)
                          // if its not included, include it
                          : [...hiddenCourses, cd.course.courseId]
                      )}
                      label={`Hide ${cd.name}`}
                    />)}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={10}>
            <EventCalendar
              apiKey={props.apiKey}
              showAllHours={showAllHours}
              showHiddenEvents={showHiddenEvents}
              creatorUserData={ccd.userData}
              courseMemberships={ccd.courseMemberships}
              studentCourseDatas={ccd.studentCourseDatas.filter(cm => !hiddenCourses.includes(cm.course.courseId))}
              instructorCourseDatas={ccd.instructorCourseDatas.filter(cm => !hiddenCourses.includes(cm.course.courseId))}
            />
          </Col>
        </Row>}
      </Async.Fulfilled>
    </Async>
  </WidgetWrapper>
};

function Calendar(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props} >
    <Container fluid className="py-3 px-3">
      <CalendarWidget {...props} />
    </Container>
  </DashboardLayout>
}

export default Calendar;
