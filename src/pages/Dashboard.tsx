import React from 'react'
import FullCalendar, { DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarCard from '../components/CalendarCard';

import { Tab, Tabs, Form, Popover, Container, CardDeck } from 'react-bootstrap';
import { viewSession, viewSessionRequest, isApiErrorCode, viewCourseMembership } from '../utils/utils';
import { viewSessionRequestResponse, viewCommittment, viewCommittmentResponse } from '../utils/utils';

import { ViewSession, ViewSessionRequest, ViewSessionRequestResponse, ViewCommittment, ViewCommittmentResponse } from '../components/ViewData';

import UtilityWrapper from '../components/UtilityWrapper';

import UserCreateSession from '../components/UserCreateSession';
import StudentCreateSessionRequest from '../components/StudentCreateSessionRequest';
import UserReviewSessionRequest from '../components/UserReviewSessionRequest';
import UserManageSession from '../components/UserManageSession';
import DisplayModal from '../components/DisplayModal';
import { sessionToEvent, sessionRequestToEvent, sessionRequestResponseToEvent, committmentToEvent, committmentResponseToEvent } from '../components/ToCalendar';




function EventCalendar(props: AuthenticatedComponentProps & { showAllHours: boolean }) {

  const [start, setStart] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  // Closing it should also unselect anything using it
  const [showCreatorPickerModal, setShowCreatorPickerModalRaw] = React.useState(false);
  const setShowCreatorPickerModal = (a: boolean) => {
    setShowCreatorPickerModalRaw(a)
    if (!a && calendarRef.current != null) {
      calendarRef.current.getApi().unselect();
    }
  }

  // which modals are visible
  const [showManageSessionModal, setShowManageSessionModal] = React.useState(false);
  const [showViewSessionModal, setShowViewSessionModal] = React.useState(false);
  const [showViewSessionRequestModal, setShowViewSessionRequestModal] = React.useState(false);
  const [showReviewSessionRequestModal, setShowReviewSessionRequestModal] = React.useState(false);
  const [showViewSessionRequestResponseModal, setShowViewSessionRequestResponseModal] = React.useState(false);
  const [showViewCommittmentModal, setShowViewCommittmentModal] = React.useState(false);
  const [showViewCommittmentResponseModal, setShowViewCommittmentResponseModal] = React.useState(false);

  // the currently selected data
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [selectedSessionRequest, setSelectedSessionRequest] = React.useState<SessionRequest | null>(null);
  const [selectedSessionRequestResponse, setSelectedSessionRequestResponse] = React.useState<SessionRequestResponse | null>(null);
  const [selectedCommittment, setSelectedCommittment] = React.useState<Committment | null>(null);
  const [selectedCommittmentResponse, setSelectedCommittmentResponse] = React.useState<CommittmentResponse | null>(null);

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
      accepted: false,
      apiKey: props.apiKey.key
    });

    const maybeCommittments = await viewCommittment({
      attendeeUserId: props.apiKey.creator.userId,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
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
      ...isApiErrorCode(maybeSessionRequests) ? [] : maybeSessionRequests.map(x => sessionRequestToEvent(x, "STUDENT")),
      ...isApiErrorCode(maybeSessionRequestResponses) ? [] : maybeSessionRequestResponses.map(x => sessionRequestResponseToEvent(x, "STUDENT")),
      ...isApiErrorCode(maybeCommittments) ? [] : maybeCommittments.map(x => committmentToEvent(x, "STUDENT")),
      ...isApiErrorCode(maybeCommittmentResponses) ? [] : maybeCommittmentResponses.map(x => committmentResponseToEvent(x, "STUDENT")),
    ];


    // get all the course memberships I have where i am an instructor
    const maybeInstructorCourseMemberships = await viewCourseMembership({
      courseMembershipKind: "INSTRUCTOR",
      onlyRecent: true,
      apiKey: props.apiKey.key
    });

    const instructorEvents = isApiErrorCode(maybeInstructorCourseMemberships) ? [] :
      // promise all waits on an array of promises
      await Promise.all(maybeInstructorCourseMemberships
        .flatMap(async (x: CourseMembership) => {
          // for each membership i have:

          const maybeSessions = await viewSession({
            courseId: x.course.courseId,
            minStartTime: args.start.valueOf(),
            maxStartTime: args.end.valueOf(),
            apiKey: props.apiKey.key
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
            ...isApiErrorCode(maybeSessionRequests) ? [] : maybeSessionRequests.map(x => sessionRequestToEvent(x, "INSTRUCTOR")),
            ...isApiErrorCode(maybeSessions) ? [] : maybeSessions.map(x => sessionToEvent(x, "INSTRUCTOR")),
          ];
        }));

    return [...studentEvents, ...instructorEvents];

  }

  //this handler runs any time we recieve a click on an event
  const clickHandler = (eca: EventClickArg) => {
    const props = eca.event.extendedProps;
    // we switch on what type it is
    switch (eca.event.id.split(':')[0]) {
      case "Session": {
        setSelectedSession(props.session);

        if (props.relation == "INSTRUCTOR") {
          // if we are an instructor we get the editable view of the course
          setShowCreatorPickerModal(false);
          setShowViewSessionModal(false);
          setShowManageSessionModal(true);
          setShowViewSessionRequestModal(false);
          setShowReviewSessionRequestModal(false);
          setShowViewSessionRequestResponseModal(false);
          setShowViewCommittmentModal(false);
          setShowViewCommittmentResponseModal(false);
        } else {
          // otherwise get the view only version
          setShowCreatorPickerModal(false);
          setShowViewSessionModal(true);
          setShowManageSessionModal(false);
          setShowViewSessionRequestModal(false);
          setShowReviewSessionRequestModal(false);
          setShowViewSessionRequestResponseModal(false);
          setShowViewCommittmentModal(false);
          setShowViewCommittmentResponseModal(false);
        }
        break;
      }
      case "SessionRequest": {
        setSelectedSessionRequest(props.sessionRequest);

        if (props.relation == "INSTRUCTOR") {
          // if we are an instructor we get to reivew the request
          setShowCreatorPickerModal(false);
          setShowViewSessionModal(false);
          setShowManageSessionModal(false);
          setShowViewSessionRequestModal(false);
          setShowReviewSessionRequestModal(true);
          setShowViewSessionRequestResponseModal(false);
          setShowViewCommittmentModal(false);
          setShowViewCommittmentResponseModal(false);
        } else {
          // otherwise we can just view it
          setShowCreatorPickerModal(false);
          setShowViewSessionModal(false);
          setShowManageSessionModal(false);
          setShowViewSessionRequestModal(true);
          setShowReviewSessionRequestModal(false);
          setShowViewSessionRequestResponseModal(false);
          setShowViewCommittmentModal(false);
          setShowViewCommittmentResponseModal(false);
        }

        break;
      }
      case "SessionRequestResponse": {
        setSelectedSessionRequestResponse(props.sessionRequestResponse);

        setShowCreatorPickerModal(false);
        setShowViewSessionModal(false);
        setShowManageSessionModal(false);
        setShowViewSessionRequestModal(false);
        setShowReviewSessionRequestModal(false);
        setShowViewSessionRequestResponseModal(true);
        setShowViewCommittmentModal(false);
        setShowViewCommittmentResponseModal(false);

        break;
      }
      case "Committment": {
        setSelectedCommittment(props.committment);

        setShowCreatorPickerModal(false);
        setShowViewSessionModal(false);
        setShowManageSessionModal(false);
        setShowViewSessionRequestModal(false);
        setShowReviewSessionRequestModal(false);
        setShowViewSessionRequestResponseModal(false);
        setShowViewCommittmentModal(true);
        setShowViewCommittmentResponseModal(false);

        break;
      }
      case "CommittmentResponse": {
        setSelectedCommittmentResponse(props.committmentResponse);

        setShowCreatorPickerModal(false);
        setShowViewSessionModal(false);
        setShowManageSessionModal(false);
        setShowViewSessionRequestModal(false);
        setShowReviewSessionRequestModal(false);
        setShowViewSessionRequestResponseModal(false);
        setShowViewCommittmentModal(false);
        setShowViewCommittmentResponseModal(true);
        break;
      }
    }
  }

  const showAllHoursProps = props.showAllHours ? {} : {
    slotMinTime: "08:00",
    slotMaxTime: "18:00",
    weekends: false
  }

  return (
    <div>
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
        height={"80vh"}
        allDaySlot={false}
        nowIndicator={true}
        editable={false}
        selectable={true}
        selectMirror={true}
        events={eventSource}
        eventContent={CalendarCard}
        unselectCancel=".modal-content"
        eventClick={clickHandler}
        expandRows={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // MTWHF
          startTime: "08:00", // 8am
          endTime: "18:00", // 6pm
          startRecur: new Date()
        }}
        selectConstraint="businessHours"
        select={(dsa: DateSelectArg) => {
          // only open modal if this date is in the future
          if (dsa.start.valueOf() > Date.now()) {
            setStart(dsa.start.valueOf());
            setDuration(dsa.end.valueOf() - dsa.start.valueOf());
            setShowCreatorPickerModal(true);
          } else {
            if (calendarRef.current != null) {
              calendarRef.current.getApi().unselect();
            }
          }
        }}
        unselect={() => {
          setShowCreatorPickerModal(false);
        }}
      />
      <DisplayModal
        title="New Event"
        show={showCreatorPickerModal}
        setShow={setShowCreatorPickerModal}
      >
        {/* TODO */}

        <Tabs defaultActiveKey="session">
          <Tab eventKey="session" title="Create Session">
            <UserCreateSession
              apiKey={props.apiKey}
              start={start}
              duration={duration}
              postSubmit={() => setShowCreatorPickerModal(false)}
            />
          </Tab>
          <Tab eventKey="profile" title="Create Request">
            <StudentCreateSessionRequest
              apiKey={props.apiKey}
              start={start}
              duration={duration}
              postSubmit={() => setShowCreatorPickerModal(false)}
            />
          </Tab>
        </Tabs>


      </DisplayModal>
      {selectedSession == null ? <> </> :
        <>
          <DisplayModal
            title="Manage Session"
            show={showManageSessionModal}
            setShow={setShowManageSessionModal}
          >
            <UserManageSession session={selectedSession} apiKey={props.apiKey} />
          </DisplayModal>
          <DisplayModal
            title="View Session"
            show={showViewSessionModal}
            setShow={setShowViewSessionModal}
          >
            <ViewSession session={selectedSession} expanded />
          </DisplayModal>
        </>
      }
      {selectedSessionRequest == null ? <> </> :
        <>
          <DisplayModal
            title="Review Student Request"
            show={showReviewSessionRequestModal}
            setShow={setShowReviewSessionRequestModal}
          >
            <UserReviewSessionRequest
              sessionRequest={selectedSessionRequest}
              apiKey={props.apiKey}
              postSubmit={() => setShowReviewSessionRequestModal(false)}
            />
          </DisplayModal>
          <DisplayModal
            title="View Session Request"
            show={showViewSessionRequestModal}
            setShow={setShowViewSessionRequestModal}
          >
            <ViewSessionRequest sessionRequest={selectedSessionRequest} expanded />
          </DisplayModal>
        </>
      }
      {selectedSessionRequestResponse == null ? <div /> :
        <DisplayModal
          title="View Session Request Response"
          show={showViewSessionRequestResponseModal}
          setShow={setShowViewSessionRequestResponseModal}
        >
          <ViewSessionRequestResponse sessionRequestResponse={selectedSessionRequestResponse} expanded />
        </DisplayModal>
      }
      {selectedCommittment == null ? <div /> :
        <DisplayModal
          title="View Committment"
          show={showViewCommittmentModal}
          setShow={setShowViewCommittmentModal}
        >
          <ViewCommittment committment={selectedCommittment} expanded />
        </DisplayModal>
      }
      {selectedCommittmentResponse == null ? <div /> :
        <DisplayModal
          title="View Attendance"
          show={showViewCommittmentResponseModal}
          setShow={setShowViewCommittmentResponseModal}
        >
          <ViewCommittmentResponse committmentResponse={selectedCommittmentResponse} expanded />
        </DisplayModal>
      }

    </div>
  )
}

function Dashboard(props: AuthenticatedComponentProps) {
  const [showAllHours, setShowAllHours] = React.useState(false);
  return (
    <DashboardLayout {...props} >
      <Container fluid className="py-3 px-3">
        <CardDeck>
          <UtilityWrapper title="Upcoming Appointments">
            <Popover id="information-tooltip">
              This screen shows all future appointments.
              You can click any date to add an appointment on that date,
              or click an existing appointment to delete it.
           </Popover>
            <div>
              <Form.Check
                checked={showAllHours}
                onChange={_ => setShowAllHours(!showAllHours)}
                label="Show All Hours"
              />
              <EventCalendar {...props} showAllHours={showAllHours} />
            </div>
          </UtilityWrapper>
        </CardDeck>
      </Container>
    </DashboardLayout>
  )
};

export default Dashboard;
