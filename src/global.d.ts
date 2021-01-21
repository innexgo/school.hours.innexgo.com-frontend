declare global {


  type VerificationChallenge = {
    creationTime: number,
    name: string,
    email: string,
  }

  type User = {
    userId: number,
    creationTime: number,
    kind: UserKind,
    name: string,
    email: string,
  }

  type PasswordReset = {
    creationTime: long;
  }

  type PasswordKind = "CHANGE" | "RESET" | "CANCEL";

  type Password = {
    passwordId: number,
    creationTime: number,
    creator: User,
    user: User,
    kind: "CANCEL" | "CHANGE",
    passwordReset: null,
  } | {
    passwordId: number,
    creationTime: number,
    creator: User,
    user: User,
    kind: "RESET",
    passwordReset: PasswordReset,
  }

  type School = {
    schoolId: number,
    creator: User,
    creationTime: number,
    name: string,
    whole: boolean,
  }

  type Subscription = {
    subscriptionId:number,
    creationTime:number,
    creator:User,
    duration:number,
    maxUses:number
  }

  type AdminshipRequest = {
    adminshipRequestId:number,
    creationTime:number,
    creator:User,
    school:School,
    message:string
  }

  type AdminshipRequestResponse = {
    adminshipRequest:AdminshipRequest,
    creationTime:number,
    creator:User,
    message:string,
    accepted:boolean
  }

  type AdminshipKind = "ADMIN" | "CANCEL";
  type AdminshipSourceKind = "REQUEST" | "SET";

  type Adminship = {
    adminshipId: number;
    creationTime: number;
    creator: User;
    user: User;
    school: School;
    adminshipKind: AdminshipKind;
    subscription: Subscription | null;
    adminshipSourceKind: AdminshipSourceKind;
    subscription: AdminshipRequestResponse | null;
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

  type CourseMembershipKind = "STUDENT" | "INSTRUCTOR" | "CANCEL";
  type CourseMembershipSourceKind = "KEY" | "SET";

  type CourseKeyKind = "VALID" | "CANCEL";

  type CourseKey = {
    courseKeyId: number;
    creationTime: number;
    creator: User;
    course: Course;
    key:string;
    courseKeyKind: "CANCEL";
    courseMembershipKind: null;
    duration: null;
    maxUses: null;
  } | {
    courseKeyId: number;
    creationTime: number;
    creator: User;
    course: Course;
    key:string;
    courseKeyKind: "VALID";
    courseMembershipKind: CourseMembershipKind ;
    duration: number;
    maxUses: number;
  };

  type CourseMembership = {
    courseMembershipId: number;
    creationTime: number;
    creator: User;
    user: User;
    course: Course;
    courseMembershipKind: CourseMembershipKind;
    courseMembershipSourceKind: "KEY";
    courseKey: CourseKey;
  } | {
    courseMembershipId: number;
    creationTime: number;
    creator: User;
    user: User;
    course: Course;
    courseMembershipKind: CourseMembershipKind;
    courseMembershipSourceKind: "SET";
    courseKey: null;
  }

  type ApiKeyKind = "VALID" | "CANCEL";

  type ApiKey = {
    apiKeyId: number,
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
