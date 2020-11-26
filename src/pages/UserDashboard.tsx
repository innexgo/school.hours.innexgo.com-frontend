import React from 'react'
import FullCalendar, { DateSelectArg, EventInput, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import UserDashboardLayout from '../components/UserDashboardLayout';
import UserCalendarCard from '../components/UserCalendarCard';

import { Form, Popover, Container, CardDeck } from 'react-bootstrap';
import { viewSession, viewSessionRequest, isApiErrorCode } from '../utils/utils';
import UtilityWrapper from '../components/UtilityWrapper';

import UserCreateSession from '../components/UserCreateSession';
import UserReviewSessionRequest from '../components/UserReviewSessionRequest';
import UserManageSession from '../components/UserManageSession';
import DisplayModal from '../components/DisplayModal';

function EventCalendar(props: AuthenticatedComponentProps & { showAllHours: boolean }) {

  const sessionToEvent = (x: Session): EventInput => ({
    id: `Session:${x.sessionId}`,
    start: new Date(x.startTime),
    end: new Date(x.startTime + x.duration),
    color: "#00000000",
    session: x
  });

  const sessionRequestToEvent = (x: SessionRequest): EventInput => ({
    id: `SessionRequest:${x.sessionRequestId}`,
    start: new Date(x.startTime),
    end: new Date(x.startTime + x.duration),
    color: "#00000000",
    sessionRequest: x
  });

  const [start, setStart] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  // Closing it should also unselect anything using it
  const [showCreateSessionModal, setShowCreateSessionModalRaw] = React.useState(false);
  const setShowCreateSessionModal = (a: boolean) => {
    setShowCreateSessionModalRaw(a)
    if (!a && calendarRef.current != null) {
      calendarRef.current.getApi().unselect();
    }
  }
  const [showReviewSessionRequestModal, setShowReviewSessionRequestModal] = React.useState(false);
  const [showManageSessionModal, setShowManageSessionModal] = React.useState(false);

  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [selectedSessionRequest, setSelectedSessionRequest] = React.useState<SessionRequest | null>(null);

  const calendarRef = React.useRef<FullCalendar | null>(null);

  const eventSource = async (
    args: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    }) => {

    const maybeSessions = await viewSession({
      hostId: props.apiKey.creator.id,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      apiKey: props.apiKey.key
    });

    const maybeSessionRequests = await viewSessionRequest({
      hostId: props.apiKey.creator.id,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      responded: false,
      apiKey: props.apiKey.key
    });

    return [
      ...isApiErrorCode(maybeSessionRequests) ? [] : maybeSessionRequests.map(sessionRequestToEvent),
      ...isApiErrorCode(maybeSessions) ? [] : maybeSessions.map(sessionToEvent),
    ];
  }

  const clickHandler = (eca: EventClickArg) => {
    const props = eca.event.extendedProps;
    switch (eca.event.id.split(':')[0]) {
      case "Session": {
        setSelectedSession(props.session);

        setShowCreateSessionModal(false);
        setShowReviewSessionRequestModal(false);
        setShowManageSessionModal(true);
        break;
      }
      case "SessionRequest": {
        setSelectedSessionRequest(props.session);

        setShowCreateSessionModal(false);
        setShowReviewSessionRequestModal(true);
        setShowManageSessionModal(false);
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
        eventContent={UserCalendarCard}
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
            setShowCreateSessionModal(true);
          } else {
            if (calendarRef.current != null) {
              calendarRef.current.getApi().unselect();
            }
          }
        }}
        unselect={() => {
          setShowCreateSessionModal(false);
        }}
      />
      <DisplayModal
        title="Create New Session"
        show={showCreateSessionModal}
        setShow={setShowCreateSessionModal}
      >
        <UserCreateSession
          apiKey={props.apiKey}
          start={start}
          duration={duration}
          postSubmit={() => setShowCreateSessionModal(false)}
        />
      </DisplayModal>
      {selectedSessionRequest == null ? <> </> :
        <DisplayModal
          title="Review Student Request"
          show={showCreateSessionModal}
          setShow={setShowCreateSessionModal}
        >
          <UserReviewSessionRequest
            sessionRequest={selectedSessionRequest}
            apiKey={props.apiKey}
            postSubmit={() => setShowReviewSessionRequestModal(false)}
          />
        </DisplayModal>
      }
      {selectedSession == null ? <> </> :
        <DisplayModal
          title="Manage Session"
          show={showManageSessionModal}
          setShow={setShowManageSessionModal}
        >
          <UserManageSession session={selectedSession} apiKey={props.apiKey}/>
        </DisplayModal>
      }
    </div>
  )
}

function UserDashboard(props: AuthenticatedComponentProps) {
  const [showAllHours, setShowAllHours] = React.useState(false);
  return (
    <UserDashboardLayout {...props} >
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
    </UserDashboardLayout>
  )
};

export default UserDashboard;
