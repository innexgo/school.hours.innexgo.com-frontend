declare global {
  type SchoolInfo = {
    name: string,
    studentEmailSuffix: string,
    userEmailSuffix: string,
  }

  type UserKind = "STUDENT" | "USER" | "ADMIN"

  type EmailVerificationChallenge = {
    id: number,
    name: string,
    email: string,
    creationTime: number,
    kind: UserKind,
  }

  type PasswordResetKey = {
    id: number,
    email: string,
    creationTime: number,
    used: boolean,
  }

  type User = {
    id: number,
    creationTime: number,
    kind: UserKind,
    name: string,
    email: string,
  }

  type ApiKey = {
    id: number,
    creator: User,
    creationTime: number,
    duration: number,
    valid: boolean,
    key: string,
  }

  type Session = {
    sessionId: number,
    creationTime: number,
    name: string,
    startTime: number,
    duration: number,
    hidden: boolean,
    creator: User,
    host: User
  }

  type SessionRequest = {
    sessionRequestId: number,
    creationTime: number,
    message: string,
    startTime: number,
    duration: number,
    creator: User,
    attendee: User,
    host: User,
  }

  type SessionRequestResponse = {
    creationTime: number,
    message: string,
    accepted: boolean,
    creator: User,
    sessionRequest: SessionRequest,
    committment: Committment | null,
  }

  type Committment = {
    committmentId: number
    creationTime: number
    cancellable: boolean
    creator: User
    attendee: User
    session: Session
  }

  type CommittmentResponseKind = "PRESENT" | "TARDY" | "ABSENT" | "CANCELLED";
  type CommittmentResponse = {
    creationTime: number
    kind: CommittmentResponseKind
    creator: User
    committment: Committment
  }

  interface AuthenticatedComponentProps {
    apiKey: ApiKey
    setApiKey: (data: ApiKey | null) => void
  }

  interface StudentComponentProps {
    apiKey: ApiKey
    setApiKey: (data: ApiKey | null) => void
  }
}
export { }
