import React from 'react'
import { Async, AsyncProps } from 'react-async';
import Loader from '../components/Loader';
import FullCalendar, { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarCard from '../components/CalendarCard';

import { Tab, Tabs, Form, Popover, Container, Row, Col, Card } from 'react-bootstrap';
import { viewSessionData, viewSessionRequest, isApiErrorCode, viewCourseMembership } from '../utils/utils';
import { viewSessionRequestResponse, viewCommittment, viewCourseData, viewCommittmentResponse } from '../utils/utils';

import { ViewSession, ViewSessionRequestResponse, ViewCommittment, ViewCommittmentResponse } from '../components/ViewData';

import UtilityWrapper from '../components/UtilityWrapper';

import UserCreateSession from '../components/UserCreateSession';
import StudentCreateSessionRequest from '../components/StudentCreateSessionRequest';
import UserReviewSessionRequest from '../components/UserReviewSessionRequest';
import UserManageSession from '../components/UserManageSession';
import StudentManageSessionRequest from '../components/StudentManageSessionRequest';
import DisplayModal from '../components/DisplayModal';
import { sessionToEvent, sessionRequestToEvent, sessionRequestResponseToEvent, committmentToEvent, committmentResponseToEvent } from '../components/ToCalendar';

type EventCalendarProps = {
  apiKey: ApiKey,
  showAllHours: boolean,
  courseMemberships: CourseMembership[],
  activeCourseDatas: CourseData[]
}

// TODO make it so that selected data and selected modals are equivalent
// Look at AdminManageAdminships for examples

function EventCalendar(props: EventCalendarProps) {

  // Closing it should also unselect anything using it
  const [selectedSpan, setSelectedSpanRaw] = React.useState<{ start: number, duration: number } | null>(null);
  const setSelectedSpan = (a: { start: number, duration: number } | null) => {
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
  const [selectedViewCommittment, setSelectedViewCommittment] = React.useState<Committment | null>(null);
  const [selectedViewCommittmentResponse, setSelectedViewCommittmentResponse] = React.useState<CommittmentResponse | null>(null);

  const calendarRef = React.useRef<FullCalendar | null>(null);

  const eventSource = async (
    args: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    }) => {


    const maybeSessionRequests = await viewSessionRequest({
      attendeeUserId: props.apiKey.creator.userId,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      responded: false,
      apiKey: props.apiKey.key
    });

    const maybeSessionRequestResponses = await viewSessionRequestResponse({
      attendeeUserId: props.apiKey.creator.userId,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      responded: false,
      apiKey: props.apiKey.key
    });

    const maybeCommittments = await viewCommittment({
      attendeeUserId: props.apiKey.creator.userId,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      fromRequestResponse: false,
      responded: false,
      apiKey: props.apiKey.key
    });

    const maybeCommittmentResponses = await viewCommittmentResponse({
      attendeeUserId: props.apiKey.creator.userId,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      apiKey: props.apiKey.key
    });

    // note that we mark these with "STUDENT" to show that these are existing in our student capacity
    const studentEvents = [
      ...isApiErrorCode(maybeSessionRequests)
        ? []
        : maybeSessionRequests
          .map(x => {
            const courseData = props.activeCourseDatas
              .find(cd => cd.course.courseId === x.course.courseId);
            // means that course is hidden
            if (courseData === undefined) {
              return null;
            }
            return sessionRequestToEvent({
              sessionRequest: x,
              courseData: courseData,
              relation: "STUDENT"
            });
          })
          // remove nulls
          .filter((x): x is EventInput => x !== null)
      ,

      ...isApiErrorCode(maybeSessionRequestResponses)
        ? []
        : (await Promise.all(maybeSessionRequestResponses
          // hide things you cancelled yourself
          .filter(x => x.creator.userId !== props.apiKey.creator.userId)
          .map(async x => {
            const courseData = props.activeCourseDatas
              .find(cd => cd.course.courseId === x.sessionRequest.course.courseId);
            // means that course is hidden
            if (courseData === undefined) {
              return null;
            }

            if (!x.accepted) {
              return sessionRequestResponseToEvent({
                sessionRequestResponse: x,
                courseData: courseData,
                relation: "STUDENT"
              });
            }

            // if accepted, we need to get the location of the committment
            const maybeSessionData = await viewSessionData({
              sessionId: x.committment.session.sessionId,
              onlyRecent: true,
              apiKey: props.apiKey.key
            });
            if (isApiErrorCode(maybeSessionData)) {
              return null;
            }

            // we have an invariant that any session must have at least one session data, so its ok
            return sessionRequestResponseToEvent({
              sessionRequestResponse: x,
              sessionData: maybeSessionData[0],
              courseData: courseData,
              relation: "STUDENT"
            });
          })))
          // remove nulls
          .filter((x): x is EventInput => x !== null)
      ,

      ...isApiErrorCode(maybeCommittments)
        ? []
        : (await Promise.all(maybeCommittments
          .map(async x => {
            const courseData = props.activeCourseDatas
              .find(cd => cd.course.courseId === x.session.course.courseId);
            // means that course is hidden
            if (courseData === undefined) {
              return null;
            }

            const maybeSessionData = await viewSessionData({
              sessionId: x.session.sessionId,
              onlyRecent: true,
              apiKey: props.apiKey.key
            });
            if (isApiErrorCode(maybeSessionData)) {
              return null;
            }

            // we have an invariant that any session must have at least one session data, so its ok
            return committmentToEvent({
              committment: x,
              sessionData: maybeSessionData[0],
              courseData: courseData,
              relation: "STUDENT"
            });
          })))
          .filter((x): x is EventInput => x !== null)
      ,

      ...isApiErrorCode(maybeCommittmentResponses)
        ? []
        : (await Promise.all(maybeCommittmentResponses
          .map(async x => {
            const courseData = props.activeCourseDatas
              .find(cd => cd.course.courseId === x.committment.session.course.courseId);
            // means that course is hidden
            if (courseData === undefined) {
              return null;
            }

            const maybeSessionData = await viewSessionData({
              sessionId: x.committment.session.sessionId,
              onlyRecent: true,
              apiKey: props.apiKey.key
            });
            if (isApiErrorCode(maybeSessionData)) {
              return null;
            }

            // we have an invariant that any session must have at least one session data, so its ok
            return committmentResponseToEvent({
              committmentResponse: x,
              sessionData: maybeSessionData[0],
              relation: "STUDENT"
            });
          })))
          .filter((x): x is EventInput => x !== null)
      ,

    ];

    const instructorEvents = // promise all waits on an array of promises
      (await Promise.all(props.courseMemberships
        .filter(x => x.courseMembershipKind === "INSTRUCTOR")
        .map(async (x: CourseMembership) => {
          // for each membership i have:

          // if no matches
          const courseData = props.activeCourseDatas.find(cd => cd.course.courseId === x.course.courseId);
          if (courseData === undefined) {
            return [];
          }

          const maybeSessionData = await viewSessionData({
            courseId: x.course.courseId,
            minStartTime: args.start.valueOf(),
            maxStartTime: args.end.valueOf(),
            onlyRecent: true,
            active: true,
            apiKey: props.apiKey.key,
          });

          const maybeSessionRequests = await viewSessionRequest({
            courseId: x.course.courseId,
            minStartTime: args.start.valueOf(),
            maxStartTime: args.end.valueOf(),
            responded: false,
            apiKey: props.apiKey.key
          });

          // return an array made out of each session / session request converted to a calendar event
          // note that we mark these with "INSTRUCTOR" to show that these are existing in our instructor capacity
          return [
            ...isApiErrorCode(maybeSessionRequests)
              ? []
              : maybeSessionRequests.map(x => sessionRequestToEvent({
                sessionRequest: x,
                courseData: courseData,
                relation: "INSTRUCTOR"
              })),
            ...isApiErrorCode(maybeSessionData)
              ? []
              : maybeSessionData.map(x => sessionToEvent({
                sessionData: x,
                relation: "INSTRUCTOR"
              })),
          ];
        }))).flat();

    return [...studentEvents, ...instructorEvents];
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
      case "Committment": {
        setSelectedViewCommittment(props.committment);
        break;
      }
      case "CommittmentResponse": {
        setSelectedViewCommittmentResponse(props.committmentResponse);
        break;
      }
    }
  }

  const showAllHoursProps = props.showAllHours ? {} : {
    slotMinTime: "08:00",
    slotMaxTime: "18:00",
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
      slotDuration="00:15:00"
      nowIndicator={true}
      editable={false}
      selectable={true}
      selectMirror={true}
      events={eventSource}
      eventContent={CalendarCard}
      unselectCancel=".modal-content"
      eventClick={clickHandler}
      businessHours={{
        daysOfWeek: [1, 2, 3, 4, 5], // MTWHF
        startTime: "08:00", // 8am
        endTime: "18:00", // 6pm
        startRecur: new Date()
      }}
      selectConstraint="businessHours"
      unselect={() => {
        setSelectedSpan(null);
      }}
      select={(dsa: DateSelectArg) => {
        // only open modal if this date is in the future
        if (dsa.start.valueOf() > Date.now()) {
          setSelectedSpan({
            start: dsa.start.valueOf(),
            duration: dsa.end.valueOf() - dsa.start.valueOf()
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
              <UserCreateSession
                apiKey={props.apiKey}
                start={selectedSpan.start}
                duration={selectedSpan.duration}
                postSubmit={() => setSelectedSpan(null)}
              />
            </Tab>
          }
          {props.courseMemberships.filter(x => x.courseMembershipKind === "STUDENT").length === 0 ? <> </> :
            <Tab eventKey="profile" title="Create Request">
              <StudentCreateSessionRequest
                apiKey={props.apiKey}
                start={selectedSpan.start}
                duration={selectedSpan.duration}
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
        <UserManageSession session={selectedManageSession} apiKey={props.apiKey} />
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
        <UserReviewSessionRequest
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
    {selectedViewCommittment === null ? <> </> :
      <DisplayModal
        title="View Committment"
        show={selectedViewCommittment !== null}
        onClose={() => setSelectedViewCommittment(null)}
      >
        <ViewCommittment
          committment={selectedViewCommittment}
          apiKey={props.apiKey}
          expanded
        />
      </DisplayModal>
    }
    {selectedViewCommittmentResponse === null ? <> </> :
      <DisplayModal
        title="View Attendance"
        show={selectedViewCommittmentResponse !== null}
        onClose={() => setSelectedViewCommittmentResponse(null)}
      >
        <ViewCommittmentResponse
          committmentResponse={selectedViewCommittmentResponse}
          apiKey={props.apiKey}
          expanded
        />
      </DisplayModal>
    }
  </>
}

const loadCourseMemberships = async (props: AsyncProps<CourseMembership[]>) => {
  const maybeCourseMembership = await viewCourseMembership({
    userId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });
  if (isApiErrorCode(maybeCourseMembership)) {
    throw Error;
  }
  return maybeCourseMembership;
}


const loadCourseData = async (props: AsyncProps<CourseData[]>) => {
  const maybeCourseData = await viewCourseData({
    recentMemberUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeCourseData)) {
    throw Error;
  }
  // there's an invariant that there must always be one course data per valid course id
  return maybeCourseData;
}



function CalendarWidget(props: AuthenticatedComponentProps) {
  const [showAllHours, setShowAllHours] = React.useState(false);
  const [hiddenCourses, setHiddenCourses] = React.useState<number[]>([]);


  return <UtilityWrapper title="Upcoming Appointments">
    <Popover id="information-tooltip">
      This screen shows all future appointments.
      You can click any date to add an appointment on that date,
      or click an existing appointment to delete it.
    </Popover>
    <Async promiseFn={loadCourseData} apiKey={props.apiKey}>
      <Async.Pending>
        <Loader />
      </Async.Pending>
      <Async.Rejected>
        <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
      </Async.Rejected>
      <Async.Fulfilled<CourseData[]>>{cds =>
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
                {cds.length === 0
                  ? <> </>
                  : <Card.Subtitle className="my-2"> Hide Courses </Card.Subtitle>
                }
                {cds.map((cd: CourseData) =>
                  <Form.Check
                    checked={hiddenCourses.includes(cd.course.courseId)}
                    onChange={_ => setHiddenCourses(
                      hiddenCourses.includes(cd.course.courseId)
                        // if its included, remove it
                        ? hiddenCourses.filter(ci => ci !== cd.course.courseId)
                        // if its not included, disinclude it
                        : [...hiddenCourses, cd.course.courseId]
                    )}
                    label={`Hide ${cd.name}`}
                  />)}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={10}>
            <Async promiseFn={loadCourseMemberships} apiKey={props.apiKey}>
              <Async.Pending>
                <Loader />
              </Async.Pending>
              <Async.Rejected>
                <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
              </Async.Rejected>
              <Async.Fulfilled<CourseMembership[]>>{cms =>
                <EventCalendar
                  activeCourseDatas={cds.filter(cm => !hiddenCourses.includes(cm.course.courseId))}
                  apiKey={props.apiKey}
                  showAllHours={showAllHours}
                  courseMemberships={cms}
                />
              }
              </Async.Fulfilled>
            </Async>
          </Col>
        </Row>}
      </Async.Fulfilled>
    </Async>
  </UtilityWrapper>
};

function Calendar(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props} >
    <Container fluid className="py-3 px-3">
      <CalendarWidget {...props} />
    </Container>
  </DashboardLayout>
}

export default Calendar;
