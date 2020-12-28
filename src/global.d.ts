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
  }

  type CoursePasswordKind = "CHANGE" | "CANCEL";

  type CoursePassword = {
    coursePasswordId: number;
    creationTime: number;
    creator: User;
    course: Course;
    coursePasswordKind: CoursePasswordKind;
  };

  type CourseMembershipKind = "STUDENT" | "INSTRUCTOR" | "CANCEL";

  type CourseMembership = {
    courseMembershipId: number;
    creationTime: number;
    creator: User;
    user: User;
    course: Course;
    courseMembershipKind: CourseMembershipKind;
  }

  type ApiKeyKind = "VALID" | "CANCEL";

  type ApiKey = {
    creationTime: number,
    creator: User,
    duration: number, // only valid if ApiKeyKind isn't CANCEL
    key: string, // only valid if ApiKeyKind isn't CANCEL
    apiKeyKind: ApiKeyKind,
  }

  type Session = {
    sessionId: number,
    creationTime: number,
    creator: User,
    course: Course,
    location: Location,
    name: string,
    startTime: number,
    duration: number,
    hidden: boolean,
  }

  type SessionRequest = {
    sessionRequestId: number,
    creationTime: number,
    creator: User,
    attendee: User,
    course: Course,
    message: string,
    startTime: number,
    duration: number,
  }

  type SessionRequestResponse = {
    sessionRequest: SessionRequest,
    creationTime: number,
    creator: User,
    message: string,
    accepted: boolean,
    committment: Committment | null,
  }

  type Committment = {
    committmentId: number
    creationTime: number
    creator: User
    cancellable: boolean
    attendee: User
    session: Session
  }

  type CommittmentResponseKind = "PRESENT" | "TARDY" | "ABSENT" | "CANCELLED";
  type CommittmentResponse = {
    committment: Committment
    creationTime: number
    creator: User
    kind: CommittmentResponseKind
  }

  interface AuthenticatedComponentProps {
    apiKey: ApiKey
    setApiKey: (data: ApiKey | null) => void
  }
}
export { }
