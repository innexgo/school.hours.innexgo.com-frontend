import React from 'react'
import FullCalendar, { DateSelectArg, EventInput, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import StudentCalendarCard from '../components/StudentCalendarCard';

import { Form, Popover, Container, CardDeck } from 'react-bootstrap';
import { isApiErrorCode, viewSessionRequest, viewSessionRequestResponse, viewCommittment, viewCommittmentResponse } from '../utils/utils';
import UtilityWrapper from '../components/UtilityWrapper';
import DisplayModal from '../components/DisplayModal';
import { ViewCommittment, ViewCommittmentResponse } from '../components/ViewData';

import StudentCreateSessionRequest from '../components/StudentCreateSessionRequest';

function StudentEventCalendar(props: StudentComponentProps & { showAllHours: boolean }) {

  const sessionRequestToEvent = (x: SessionRequest): EventInput => ({
    id: `SessionRequest:${x.sessionRequestId}`,
    start: new Date(x.startTime),
    end: new Date(x.startTime + x.duration),
    color: "#00000000",
    sessionRequest: x
  })

  const sessionRequestResponseToEvent = (x: SessionRequestResponse): EventInput => ({
    id: `SessionRequestResponse:${x.sessionRequest.sessionRequestId}`,
    start: new Date(x.sessionRequest.startTime),
    end: new Date(x.sessionRequest.startTime + x.sessionRequest.duration),
    color: "#00000000",
    sessionRequestResponse: x
  })

  const committmentToEvent = (x: Committment): EventInput => ({
    id: `Committment:${x.committmentId}`,
    start: new Date(x.session.startTime),
    end: new Date(x.session.startTime + x.session.duration),
    color: "#00000000",
    committment: x
  })

  const committmentResponseToEvent = (x: CommittmentResponse): EventInput => ({
    id: `CommittmentResponse:${x.committment.committmentId}`,
    start: new Date(x.committment.session.startTime),
    end: new Date(x.committment.session.startTime + x.committment.session.duration),
    color: "#00000000",
    committment: x
  })

  const [start, setStart] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  // Closing it should also unselect anything using it
  const [showCreateSessionRequestModal, setShowCreateSessionRequestModalRaw] = React.useState(false);
  const setShowCreateSessionRequestModal = (a: boolean) => {
    setShowCreateSessionRequestModalRaw(a)
    if (!a && calendarRef.current != null) {
      calendarRef.current.getApi().unselect();
    }
  }

  const [showViewSessionRequestModal, setShowViewSessionRequestModal] = React.useState(false);
  const [showViewSessionRequestResponseModal, setShowViewSessionRequestResponseModal] = React.useState(false);
  const [showViewCommittmentModal, setShowViewCommittmentModal] = React.useState(false);
  const [showViewCommittmentResponseModal, setShowViewCommittmentResponseModal] = React.useState(false);

  const [selectedCommittment, setSelectedCommittment] = React.useState<Committment | null>(null);
  const [selectedCommittmentResponse, setSelectedCommittmentResponse] = React.useState<CommittmentResponse | null>(null);
  const [selectedSessionRequest, setSelectedSessionRequest] = React.useState<SessionRequest | null>(null);
  const [selectedSessionRequestResponse, setSelectedSessionRequestResponse] = React.useState<SessionRequestResponse | null>(null);

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
      attendeeId: props.apiKey.creator.id,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      responded: false,
      apiKey: props.apiKey.key
    });

    const maybeSessionRequestResponses = await viewSessionRequestResponse({
      attendeeId: props.apiKey.creator.id,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      accepted: false,
      apiKey: props.apiKey.key
    });

    const maybeCommittments = await viewCommittment({
      attendeeId: props.apiKey.creator.id,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      responded: false,
      apiKey: props.apiKey.key
    });

    const maybeCommittmentResponses = await viewCommittmentResponse({
      attendeeId: props.apiKey.creator.id,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      apiKey: props.apiKey.key
    });

    return [
      ...isApiErrorCode(maybeSessionRequests) ? [] : maybeSessionRequests.map(sessionRequestToEvent),
      ...isApiErrorCode(maybeSessionRequestResponses) ? [] : maybeSessionRequestResponses.map(sessionRequestResponseToEvent),
      ...isApiErrorCode(maybeCommittments) ? [] : maybeCommittments.map(committmentToEvent),
      ...isApiErrorCode(maybeCommittmentResponses) ? [] : maybeCommittmentResponses.map(committmentResponseToEvent),
    ];
  }

  const clickHandler = (eca: EventClickArg) => {
    const props = eca.event.extendedProps;
    switch (eca.event.id.split(':')[0]) {
      case "SessionRequest": {
        setSelectedSessionRequest(props.sessionRequest);

        setShowCreateSessionRequestModal(false);
        setShowViewSessionRequestModal(true);
        setShowViewSessionRequestResponseModal(false);
        setShowViewCommittmentModal(false);
        setShowViewCommittmentResponseModal(false);
        break;
      }
      case "SessionRequestResponse": {
        setSelectedSessionRequestResponse(props.sessionRequestResponse);

        setShowCreateSessionRequestModal(false);
        setShowViewSessionRequestModal(false);
        setShowViewSessionRequestResponseModal(true);
        setShowViewCommittmentModal(false);
        setShowViewCommittmentResponseModal(false);
        break;
      }
      case "Committment": {
        setSelectedCommittment(props.committment);

        setShowCreateSessionRequestModal(false);
        setShowViewSessionRequestModal(false);
        setShowViewSessionRequestResponseModal(false);
        setShowViewCommittmentModal(true);
        setShowViewCommittmentResponseModal(false);
        break;
      }
      case "CommittmentResponse": {
        setSelectedCommittmentResponse(props.committmentResponse);

        setShowCreateSessionRequestModal(false);
        setShowViewSessionRequestModal(false);
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
        eventContent={StudentCalendarCard}
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
            setShowCreateSessionRequestModal(true);
          } else {
            if (calendarRef.current != null) {
              calendarRef.current.getApi().unselect();
            }
          }
        }}
        unselect={() => {
          setShowCreateSessionRequestModal(false);
        }}
      />
      <DisplayModal
        title="Create Appointment Request"
        show={showCreateSessionRequestModal}
        setShow={setShowCreateSessionRequestModal}
      >
        <StudentCreateSessionRequest
          apiKey={props.apiKey}
          start={start}
          duration={duration}
          postSubmit={() => setShowCreateSessionRequestModal(false)}
        />
      </DisplayModal>
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


      {/*
selectedCommittment
selectedCommittmentResponse
selectedSessionRequest
selectedSessionRequestResponse
      {selectedSessionRequest== null ? {} :
        <ViewSessionRequestModal
          show={showViewApptRequestModal}
          setShow={setShowViewApptRequestModal}
          apptRequest={apptRequest}
        />
      }
      {appt == null ? {}:
        <ViewApptModal
          show={showTakeAttendanceApptModal}
          setShow={setShowTakeAttendanceApptModal}
          appt={appt}
        />
      }
      {attendance == null ? {} :
        <ViewAttendanceModal
          show={showViewAttendanceModal}
          setShow={setShowViewAttendanceModal}
          attendance={attendance}
        />
      }
      */}
    </div>
  )
}

function StudentDashboard(props: StudentComponentProps) {
  const [showAllHours, setShowAllHours] = React.useState(false);

  return (
    <StudentDashboardLayout {...props} >
      <Container fluid className="py-3 px-3">
        <CardDeck>
          <UtilityWrapper title="Upcoming Appointments">
            <Popover id="information-tooltip">
              This screen shows your upcoming appointments appointments.
              You can click any appointment to learn more about it,
              or drag your mouse to select a new one.
           </Popover>
            <div>
              <Form.Check
                checked={showAllHours}
                onChange={_ => setShowAllHours(!showAllHours)}
                label="Show All Hours"
              />
              <StudentEventCalendar {...props} showAllHours={showAllHours} />
            </div>
          </UtilityWrapper>
        </CardDeck>
      </Container>
    </StudentDashboardLayout>
  )
};

export default StudentDashboard;
