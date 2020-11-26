import React from 'react'
import { Table } from 'react-bootstrap';
import format from 'date-fns/format';

const ToggleExpandButton = (props: { expand: boolean, setExpand: (b: boolean) => void }) =>
  <button className="btn btn-link px-0 py-0 float-right"
    style={{
      fontWeight: "normal" as const,
      fontSize: "0.875rem"
    }}
    onClick={_ => props.setExpand(!props.expand)}>
    {props.expand ? "Less" : "More"}
  </button>

export const ViewUser = (props: {
  user: User,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {props.user.name}
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </span>
  } else {
    return <div>
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
          <tr>
            <th>Kind</th>
            <td>{props.user.kind}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </div>
  }
}

export const ViewSession = (props: {
  session: Session,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {props.session.name} - {format(props.session.startTime, "MMM do")}
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Name</th>
            <td>{props.session.name} </td>
          </tr>
          <tr>
            <th>Date</th>
            <td>{format(props.session.startTime, "MMM do")} </td>
          </tr>
          <tr>
            <th>Time</th>
            <td>
              {format(props.session.startTime, "h:mm a - ")}
              {format(props.session.startTime + props.session.duration, "h:mm a")}
            </td>
          </tr>
          <tr>
            <th>Private</th>
            <td>{`${props.session.hidden}`}</td>
          </tr>
          <tr>
            <th>Host</th>
            <td><ViewUser user={props.session.host} expanded={false} /></td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </div>
  }
}

export const ViewSessionRequest = (props: {
  sessionRequest: SessionRequest,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span> {props.sessionRequest.attendee.name} - {props.sessionRequest.host.name} - {format(props.sessionRequest.startTime, "MMM do")}
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
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
            <td>{format(props.sessionRequest.creationTime, "MMM do h:mm a")} </td>
          </tr>
          <tr>
            <th>Attendee</th>
            <td><ViewUser user={props.sessionRequest.attendee} expanded={false} /></td>
          </tr>
          <tr>
            <th>Host</th>
            <td><ViewUser user={props.sessionRequest.host} expanded={false} /></td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </div>
  }
}

export const ViewSessionRequestResponse = (props: {
  sessionRequestResponse: SessionRequestResponse,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {props.sessionRequestResponse.sessionRequest.attendee.name} - {props.sessionRequestResponse.sessionRequest.host.name} - {format(props.sessionRequestResponse.sessionRequest.startTime, "MMM do")}
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Request</th>
            <td><ViewSessionRequest sessionRequest={props.sessionRequestResponse.sessionRequest} expanded /></td>
          </tr>
          <tr>
            <th>Response Time</th>
            <td>
              <td>{format(props.sessionRequestResponse.creationTime, "MMM do h:mm a")} </td>
            </td>
          </tr>
          <tr>
            <th>Response Message</th>
            <td>{props.sessionRequestResponse.message} </td>
          </tr>
          <tr>
            <th>Accepted</th>
            <td>{`${props.sessionRequestResponse.accepted}`}</td>
          </tr>
          {props.sessionRequestResponse.committment == null ? <> </> :
            <ViewCommittment committment={props.sessionRequestResponse.committment} expanded />
          }
        </tbody>
      </Table>
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </div>
  }
}


export const ViewCommittment = (props: {
  committment: Committment,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {format(props.committment.session.startTime, "h:mm a - ")}
      {format(props.committment.session.startTime + props.committment.session.duration, "h:mm a")}
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Session</th>
            <td><ViewSession session={props.committment.session} expanded /></td>
          </tr>
          <tr>
            <th>Attendee</th>
            <td><ViewUser user={props.committment.attendee} expanded={false} /></td>
          </tr>
          <tr>
            <th>Mandatory</th>
            <td>{`${!props.committment.cancellable}`}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </div>
  }
}

export const ViewCommittmentResponse = (props: {
  committmentResponse: CommittmentResponse,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {props.committmentResponse.kind}
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />

    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Committment</th>
            <td><ViewCommittment committment={props.committmentResponse.committment} expanded /></td>
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
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </div>
  }
}
