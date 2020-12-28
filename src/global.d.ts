declare global {

  type PasswordReset = {
    creationTime: long;
    used: boolean;
  }

  type VerificationChallenge = {
    creationTime: number,
    name: string,
    email: string,
  }


  type User = {
    id: number,
    creationTime: number,
    kind: UserKind,
    name: string,
    email: string,
  }

  type School = {
    schoolId: number,
    creator: User,
    creationTime: number,
    name: string,
    abbreviation: string,
  }

  type AdminshipKind = "ADMIN" | "CANCEL";


  type Adminship = {
    adminshipId: number;
    creationTime: number;
    creator: User;
    user: User;
    school: School;
    adminshipKind: AdminshipKind;
  }

  type Location = {
    locationId: number;
    creationTime: number;
    creator: User;
    school: School;
    name: string;
    description: string;
    valid: boolean;
  }

  type Course = {
    courseId: number;
    creationTime: number;
    creator: User;
    school: School;
    name: string;
    description: string;
    joinable: boolean;
  }

  type CourseMembershipKind = "STUDENT" | "INSTRUCTOR" | "CANCEL";

  type CourseMembership = {
    courseMembershipId: number;
    creationTime: number;
    creator: User;
    user: User;
    course: Course;
    courseMembershipKind: CourseMembershipKind;
  }

  type ApiKey = {
    creationTime: number,
    creator: User,
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
