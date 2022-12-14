import { fetchApi, apiUrl, Result } from '@innexgo/frontend-common';

export const InnexgoHoursErrorCodes = [
  "OK",
  "NOT_FOUND",

  "DECODE_ERROR",
  "METHOD_NOT_ALLOWED",

  "NO_CAPABILITY",
  "API_KEY_UNAUTHORIZED",
  "PASSWORD_INCORRECT",
  "PASSWORD_INSECURE",
  "PASSWORD_CANNOT_CREATE_FOR_OTHERS",
  "USER_NONEXISTENT",
  "API_KEY_NONEXISTENT",
  "USER_EXISTENT",
  "USER_NAME_EMPTY",
  "USER_EMAIL_EMPTY",
  "USER_EMAIL_INVALIDATED",
  "USER_KIND_INVALID",

  "SUBSCRIPTION_NONEXISTENT",
  "SUBSCRIPTION_EXPIRED",
  "SUBSCRIPTION_UNAUTHORIZED",
  "SUBSCRIPTION_LIMITED",

  "SCHOOL_NONEXISTENT",
  "SCHOOL_ARCHIVED",

  "SCHOOL_KEY_NONEXISTENT",
  "SCHOOL_KEY_EXPIRED",
  "SCHOOL_KEY_USED",

  "SCHOOL_DURATION_NONEXISTENT",
  "SCHOOL_DURATION_DAY_INVALID",
  "SCHOOL_DURATION_MINUTE_INVALID",
  "SCHOOL_DURATION_DATA_NONEXISTENT",

  "ADMINSHIP_CANNOT_LEAVE_EMPTY",

  "SESSION_REQUEST_NONEXISTENT",
  "SESSION_REQUEST_RESPONSE_EXISTENT",
  "SESSION_REQUEST_RESPONSE_CANNOT_CANCEL_STUDENT",

  "SESSION_NOT_RELEVANT",
  "SESSION_NONEXISTENT",

  "COMMITMENT_EXISTENT",
  "COMMITMENT_NONEXISTENT",
  "COMMITMENT_CANNOT_CREATE_FOR_OTHERS_STUDENT",
  "COMMITMENT_CANNOT_CREATE_HIDDEN_STUDENT",
  "COMMITMENT_CANNOT_CREATE_UNCANCELLABLE_STUDENT",

  "ENCOUNTER_NONEXISTENT",

  "STAY_NONEXISTENT",
  "STAY_PROVIDED_NO_TIME",
  "STAY_PROVIDED_DOUBLE_TIME",
  "STAY_ENCOUNTER_WRONG_USER",
  "STAY_ENCOUNTER_WRONG_LOCATION",

  "COURSE_NONEXISTENT",
  "COURSE_ARCHIVED",

  "COURSE_KEY_NONEXISTENT",
  "COURSE_KEY_EXPIRED",
  "COURSE_KEY_USED",

  "COURSE_MEMBERSHIP_NONEXISTENT",
  "COURSE_MEMBERSHIP_CANNOT_LEAVE_EMPTY",

  "LOCATION_NONEXISTENT",
  "LOCATION_ARCHIVED",

  "NEGATIVE_DURATION",
  "CANNOT_ALTER_PAST",

  "VERIFICATION_CHALLENGE_NONEXISTENT",
  "VERIFICATION_CHALLENGE_TIMED_OUT",
  "PASSWORD_RESET_NONEXISTENT",
  "PASSWORD_EXISTENT",
  "PASSWORD_RESET_TIMED_OUT",
  "EMAIL_RATELIMIT",
  "EMAIL_BLACKLISTED",
  "UNKNOWN",
  "INTERNAL_SERVER_ERROR",
  "AUTH_INTERNAL_SERVER_ERROR",
  "AUTH_BAD_REQUEST",
  "AUTH_NETWORK_ERROR",
  "AUTH_OTHER",
  "NETWORK",
] as const;


// Creates a union type
export type InnexgoHoursErrorCode = typeof InnexgoHoursErrorCodes[number];

// important types
export type SubscriptionKind = "VALID" | "CANCEL";
export type AdminshipKind = "ADMIN" | "CANCEL";
export type CourseMembershipKind = "STUDENT" | "INSTRUCTOR" | "CANCEL";
export type EncounterKind = "MANUAL" | "HARDWARE";

export interface Subscription {
  subscriptionId: number,
  creationTime: number,
  creatorUserId: number,
  subscriptionKind: SubscriptionKind,
  maxUses: number,
}

export interface School {
  schoolId: number,
  creatorUserId: number,
  creationTime: number,
  whole: boolean,
}

export interface SchoolData {
  schoolDataId: number,
  creationTime: number,
  creatorUserId: number,
  school: School,
  name: string,
  description: string,
  active: boolean,
}

export interface SchoolDuration {
  schoolDurationId: number,
  creationTime: number,
  creatorUserId: number,
  school: School,
}

export interface SchoolDurationData {
  schoolDurationDataId: number,
  creationTime: number,
  creatorUserId: number,
  schoolDuration: SchoolDuration,
  day: number,
  minuteStart: number,
  minuteEnd: number,
  active: boolean,
}

export interface SchoolKey {
  schoolKeyKey: string,
  creationTime: number,
  creatorUserId: number,
  school: School,
  maxUses: number,
  startTime: number,
  endTime: number,
}

export interface SchoolKeyData {
  schoolKeyDataId: number,
  creationTime: number,
  creatorUserId: number,
  schoolKey: SchoolKey,
  active: boolean,
}

export interface Adminship {
  adminshipId: number,
  creationTime: number,
  creatorUserId: number,
  userId: number,
  school: School,
  adminshipKind: AdminshipKind,
  schoolKey?: Commitment,
}

export interface Location {
  locationId: number,
  creationTime: number,
  creatorUserId: number,
  school: School,
}

export interface LocationData {
  locationDataId: number,
  creationTime: number,
  creatorUserId: number,
  location: Location,
  name: string,
  address: string,
  phone: string,
  active: boolean,
}

export interface Course {
  courseId: number,
  creatorUserId: number,
  creationTime: number,
  school: School,
}

export interface CourseData {
  courseDataId: number,
  creationTime: number,
  creatorUserId: number,
  course: Course,
  location: Location,
  name: string,
  description: string,
  homeroom: boolean,
  active: boolean,
}

export interface CourseKey {
  courseKeyKey: string,
  creationTime: number,
  creatorUserId: number,
  course: Course,
  maxUses: number,
  courseMembershipKind: CourseMembershipKind,
  startTime: number,
  endTime: number,
}

export interface CourseKeyData {
  courseKeyDataId: number,
  creationTime: number,
  creatorUserId: number,
  courseKey: CourseKey,
  active: boolean,
}

export interface CourseMembership {
  courseMembershipId: number,
  creationTime: number,
  creatorUserId: number,
  userId: number,
  course: Course,
  courseMembershipKind: CourseMembershipKind,
  courseKey?: Commitment,
}

export interface Session {
  sessionId: number,
  creationTime: number,
  creatorUserId: number,
  course: Course,
}

export interface SessionData {
  sessionDataId: number,
  creationTime: number,
  creatorUserId: number,
  session: Session,
  name: string,
  startTime: number,
  endTime: number,
  active: boolean,
}

export interface SessionRequest {
  sessionRequestId: number,
  creationTime: number,
  creatorUserId: number,
  course: Course,
  message: string,
  startTime: number,
  endTime: number,
}

export interface SessionRequestResponse {
  sessionRequest: SessionRequest,
  creationTime: number,
  creatorUserId: number,
  message: string,
  commitment?: Commitment,
}

export interface Commitment {
  commitmentId: number,
  creationTime: number,
  creatorUserId: number,
  attendeeUserId: number,
  session: Session,
  active: boolean,
}

export interface Encounter {
  encounterId: number,
  creationTime: number,
  creatorUserId: number,
  locationId: number,
  attendeeUserId: number,
  encounterKind: EncounterKind,
}

export interface Stay {
  stayId: number,
  creationTime: number,
  creatorUserId: number,
  attendeeUserId: number,
  location: Location,
}

export interface StayData {
  stayDataId: number,
  creationTime: number,
  creatorUserId: number,
  stay: Stay,
  fst: Encounter | number,
  snd: Encounter | number,
  active: boolean,
}

async function fetchApiOrNetworkError<T>(url: string, props: object): Promise<Result<T, InnexgoHoursErrorCode>> {
  try {
    const [code, resp] = await fetchApi(url, props);
    if (code >= 200 && code < 300) {
      return { Ok: resp }
    } else {
      return { Err: resp }
    }
  } catch (_) {
    return { Err: "NETWORK" };
  }
}

const undefToStr = (s: string | undefined) =>
  s === undefined ? apiUrl() : s

// request types

interface SubscriptionNewProps {
  subscriptionKind: SubscriptionKind,
  apiKey: string,
}

export function subscriptionNew(props: SubscriptionNewProps, server?: string): Promise<Result<Subscription, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/subscription/new", props);
}

interface SchoolNewProps {
  name: string,
  description: string,
  whole: boolean,
  apiKey: string,
}

export function schoolNew(props: SchoolNewProps, server?: string): Promise<Result<SchoolData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school/new", props);
}

interface SchoolDataNewProps {
  schoolId: number,
  name: string,
  description: string,
  active: boolean,
  apiKey: string,
}

export function schoolDataNew(props: SchoolDataNewProps, server?: string): Promise<Result<SchoolData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_data/new", props);
}

interface SchoolDurationNewProps {
  schoolId: number,
  day: number,
  minuteStart: number,
  minuteEnd: number,
  apiKey: string,
}

export function schoolDurationNew(props: SchoolDurationNewProps, server?: string): Promise<Result<SchoolDurationData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_duration/new", props);
}

interface SchoolDurationDataNewProps {
  schoolDurationId: number,
  day: number,
  minuteStart: number,
  minuteEnd: number,
  active: boolean,
  apiKey: string,
}

export function schoolDurationDataNew(props: SchoolDurationDataNewProps, server?: string): Promise<Result<SchoolDurationData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_duration_data/new", props);
}

interface SchoolKeyNewProps {
  schoolId: number,
  maxUses: number,
  startTime: number,
  endTime: number,
  apiKey: string,
}

export function schoolKeyNew(props: SchoolKeyNewProps, server?: string): Promise<Result<SchoolKeyData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_key/new", props);
}

interface SchoolKeyDataNewProps {
  schoolKeyKey: string,
  active: boolean,
  apiKey: string,
}

export function schoolKeyDataNew(props: SchoolKeyDataNewProps, server?: string): Promise<Result<SchoolKeyData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_key_data/new", props);
}

interface AdminshipNewCancelProps {
  userId: number,
  schoolId: number,
  apiKey: string,
}

export function adminshipNewCancel(props: AdminshipNewCancelProps, server?: string): Promise<Result<Adminship, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/adminship/new_cancel", props);
}

interface AdminshipNewKeyProps {
  schoolKeyKey: string,
  apiKey: string,
}

export function adminshipNewKey(props: AdminshipNewKeyProps, server?: string): Promise<Result<Adminship, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/adminship/new_key", props);
}


export interface LocationNewProps {
  schoolId: number,
  name: string,
  address: string,
  phone: string,
  apiKey: string,
}

export function locationNew(props: LocationNewProps, server?: string): Promise<Result<LocationData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/location/new", props);
}

export interface LocationDataNewProps {
  locationId: number,
  name: string,
  address: string,
  phone: string,
  active: boolean,
  apiKey: string,
}

export function locationDataNew(props: LocationDataNewProps, server?: string): Promise<Result<LocationData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/location_data/new", props);
}

interface CourseNewProps {
  schoolId: number,
  locationId: number,
  name: string,
  description: string,
  homeroom: boolean,
  apiKey: string,
}

export function courseNew(props: CourseNewProps, server?: string): Promise<Result<CourseData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course/new", props);
}

interface CourseDataNewProps {
  courseId: number,
  locationId: number,
  name: string,
  description: string,
  homeroom: boolean,
  active: boolean,
  apiKey: string,
}

export function courseDataNew(props: CourseDataNewProps, server?: string): Promise<Result<CourseData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_data/new", props);
}

interface CourseKeyNewProps {
  courseId: number,
  courseMembershipKind: CourseMembershipKind,
  maxUses: number,
  startTime: number,
  endTime: number,
  apiKey: string,
}

export function courseKeyNew(props: CourseKeyNewProps, server?: string): Promise<Result<CourseKeyData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_key/new", props);
}

interface CourseKeyDataNewProps {
  courseKeyKey: string,
  active: boolean,
  apiKey: string,
}

export function courseKeyDataNew(props: CourseKeyDataNewProps, server?: string): Promise<Result<CourseKeyData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_key_data/new", props);
}

interface CourseMembershipNewCancelProps {
  userId: number,
  courseId: number,
  apiKey: string,
}

export function courseMembershipNewCancel(props: CourseMembershipNewCancelProps, server?: string): Promise<Result<CourseMembership, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_membership/new_cancel", props);
}

interface CourseMembershipNewKeyProps {
  courseKeyKey: string,
  apiKey: string,
}

export function courseMembershipNewKey(props: CourseMembershipNewKeyProps, server?: string): Promise<Result<CourseMembership, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_membership/new_key", props);
}

interface SessionNewProps {
  name: string,
  courseId: number,
  startTime: number,
  endTime: number,
  attendeeUserIds: number[],
  apiKey: string,
}

export function sessionNew(props: SessionNewProps, server?: string): Promise<Result<SessionData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session/new", props);
}

interface SessionDataNewProps {
  sessionId: number,
  name: string,
  active: boolean,
  startTime: number,
  endTime: number,
  apiKey: string,
}

export function sessionDataNew(props: SessionDataNewProps, server?: string): Promise<Result<SessionData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session_data/new", props);
}

interface SessionRequestNewProps {
  courseId: number,
  message: string,
  startTime: number,
  endTime: number,
  apiKey: string,
}

export function sessionRequestNew(props: SessionRequestNewProps, server?: string): Promise<Result<SessionRequest, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session_request/new", props);
}

interface SessionRequestResponseNewProps {
  sessionRequestId: number,
  message: string,
  sessionId?: number,
  apiKey: string,
}

export function sessionRequestResponseNew(props: SessionRequestResponseNewProps, server?: string): Promise<Result<SessionRequestResponse, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session_request_response/new", props);
}

interface CommitmentNewProps {
  attendeeUserIds: number[],
  sessionId: number,
  active: boolean,
  apiKey: string,
}

export function commitmentNew(props: CommitmentNewProps, server?: string): Promise<Result<Commitment[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/commitment/new", props);
}

interface EncounterNewProps {
  attendeeUserId: number,
  locationId: number,
  apiKey: string,
}

// strictly creates an encounter
export function encounterNew(props: EncounterNewProps, server?: string): Promise<Result<Encounter, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/encounter/new", props);
}

// creates an encounter and tries to pair it
export function encounterNewAttends(props: EncounterNewProps, server?: string): Promise<Result<Encounter | Stay, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/encounter/new_attends", props);
}

export interface StayNewProps {
  attendeeUserId: number,
  locationId: number,
  fstTime?: number,
  fstEncounterId?: number,
  sndTime?: number,
  sndEncounterId?: number,
  apiKey: string,
}

export function stayNew(props: StayNewProps, server?: string): Promise<Result<StayData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/stay/new", props);
}

export interface StayDataNewProps {
  stayId: number,
  fstTime?: number,
  fstEncounterId?: number,
  sndTime?: number,
  sndEncounterId?: number,
  active: boolean,
  apiKey: string,
}

export function stayDataNew(props: StayDataNewProps, server?: string): Promise<Result<StayData, InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/stay_data/new", props);
}

interface SubscriptionViewProps {
  subscriptionId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  subscriptionKind?: SubscriptionKind[],
  onlyRecent: boolean,
  apiKey: string,
}

export function subscriptionView(props: SubscriptionViewProps, server?: string): Promise<Result<Subscription[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/subscription/view", props);
}

interface SchoolViewProps {
  schoolId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  whole?: boolean,
  apiKey: string,
}

export function schoolView(props: SchoolViewProps, server?: string): Promise<Result<School[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school/view", props);
}

interface SchoolDataViewProps {
  schoolDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  schoolId?: number[],
  name?: string[],
  partialName?: string,
  description?: string[],
  partialDescription?: string,
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function schoolDataView(props: SchoolDataViewProps, server?: string): Promise<Result<SchoolData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_data/view", props);
}

interface SchoolDurationViewProps {
  schoolDurationId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  schoolId?: number[],
  apiKey: string,
}

export function schoolDurationView(props: SchoolDurationViewProps, server?: string): Promise<Result<SchoolDuration[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_duration/view", props);
}

interface SchoolDurationDataViewProps {
  schoolDurationDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  schoolDurationId?: number[],
  day?: number[],
  minMinuteStart?: number,
  maxMinuteStart?: number,
  minMinuteEnd?: number,
  maxMinuteEnd?: number,
  active?: boolean,
  onlyRecent: boolean,
  schoolId?: number[],
  apiKey: string,
}

export function schoolDurationDataView(props: SchoolDurationDataViewProps, server?: string): Promise<Result<SchoolDurationData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_duration_data/view", props);
}

interface SchoolKeyViewProps {
  schoolKeyKey?: string[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  schoolId?: number[],
  maxUses?: number[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  apiKey: string,
}

export function schoolKeyView(props: SchoolKeyViewProps, server?: string): Promise<Result<SchoolKey[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_key/view", props);
}

interface SchoolKeyDataViewProps {
  schoolKeyDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  schoolKeyKey?: string[],
  active?: boolean,
  schoolId?: number[],
  maxUses?: number[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  onlyRecent: boolean,
  apiKey: string,
}

export function schoolKeyDataView(props: SchoolKeyDataViewProps, server?: string): Promise<Result<SchoolKeyData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/school_key_data/view", props);
}

interface AdminshipViewProps {
  adminshipId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  userId?: number[],
  schoolId?: number[],
  adminshipKind?: AdminshipKind[],
  adminshipHasSource?: boolean,
  schoolKeyKey?: string[],
  onlyRecent: boolean,
  apiKey: string,
}

export function adminshipView(props: AdminshipViewProps, server?: string): Promise<Result<Adminship[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/adminship/view", props);
}

interface LocationViewProps {
  locationId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  schoolId?: number[],
  apiKey: string,
}

export function locationView(props: LocationViewProps, server?: string): Promise<Result<Location[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/location/view", props);
}

interface LocationDataViewProps {
  locationDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  locationId?: number[],
  name?: string[],
  partialName?: string,
  address?: string[],
  partialAddress?: string,
  phone?: string,
  active?: boolean,
  onlyRecent: boolean,
  schoolId?: number[],
  apiKey: string,
}

export function locationDataView(props: LocationDataViewProps, server?: string): Promise<Result<LocationData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/location_data/view", props);
}

interface CourseViewProps {
  courseId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  schoolId?: number[],
  apiKey: string,
}

export function courseView(props: CourseViewProps, server?: string): Promise<Result<Course[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course/view", props);
}

interface CourseDataViewProps {
  courseDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  courseId?: number[],
  locationId?: number[],
  name?: string[],
  partialName?: string,
  description?: string[],
  partialDescription?: string,
  homeroom?: boolean,
  active?: boolean,
  onlyRecent: boolean,
  schoolId?: number[],
  apiKey: string,
}

export function courseDataView(props: CourseDataViewProps, server?: string): Promise<Result<CourseData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_data/view", props);
}

interface CourseKeyViewProps {
  courseKeyKey?: string[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  courseId?: number[],
  maxUses?: number[],
  courseMembershipKind?: CourseMembershipKind[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  apiKey: string,
}

export function courseKeyView(props: CourseKeyViewProps, server?: string): Promise<Result<CourseKey[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_key/view", props);
}

interface CourseKeyDataViewProps {
  courseKeyDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  courseKeyKey?: string,
  active?: boolean,
  courseId?: number[],
  maxUses?: number[],
  courseMembershipKind?: CourseMembershipKind[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  onlyRecent: boolean,
  apiKey: string,
}

export function courseKeyDataView(props: CourseKeyDataViewProps, server?: string): Promise<Result<CourseKeyData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_key_data/view", props);
}

interface CourseMembershipViewProps {
  courseMembershipId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  userId?: number[],
  courseId?: number[],
  courseMembershipKind?: CourseMembershipKind[],
  courseMembershipFromKey?: boolean,
  courseKeyKey?: string,
  onlyRecent: boolean,
  apiKey: string,
}

export function courseMembershipView(props: CourseMembershipViewProps, server?: string): Promise<Result<CourseMembership[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/course_membership/view", props);
}
interface SessionViewProps {
  sessionId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  courseId?: number[],
  apiKey: string,
}

export function sessionView(props: SessionViewProps, server?: string): Promise<Result<Session[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session/view", props);
}

interface SessionDataViewProps {
  sessionDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  sessionId?: number[],
  name?: string[],
  partialName?: string,
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  active?: boolean,
  onlyRecent: boolean,
  courseId?: number[],
  apiKey: string,
}

export function sessionDataView(props: SessionDataViewProps, server?: string): Promise<Result<SessionData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session_data/view", props);
}

interface SessionRequestViewProps {
  sessionRequestId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  courseId?: number[],
  message?: string[],
  partialMessage?: string,
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  responded?: boolean,
  apiKey: string,
}

export function sessionRequestView(props: SessionRequestViewProps, server?: string): Promise<Result<SessionRequest[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session_request/view", props);
}

interface SessionRequestResponseViewProps {
  sessionRequestId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  message?: string[],
  partialMessage?: string,
  accepted?: boolean,
  commitmentId?: number[],
  attendeeUserId?: number[],
  courseId?: number[],
  sessionId?: number[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  apiKey: string,
}

export function sessionRequestResponseView(props: SessionRequestResponseViewProps, server?: string): Promise<Result<SessionRequestResponse[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/session_request_response/view", props);
}

interface CommitmentViewProps {
  commitmentId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  attendeeUserId?: number[],
  sessionId?: number[],
  courseId?: number[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  active?: boolean,
  fromRequestResponse?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function commitmentView(props: CommitmentViewProps, server?: string): Promise<Result<Commitment[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/commitment/view", props);
}

interface EncounterViewProps {
  encounterId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  attendeeUserId?: number[],
  locationId?: number[],
  apiKey: string,
}

export function encounterView(props: EncounterViewProps, server?: string): Promise<Result<Encounter[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/encounter/view", props);
}

interface StayViewProps {
  encounterId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  attendeeUserId?: number[],
  locationId?: number[],
  apiKey: string,
}

export function stayView(props: StayViewProps, server?: string): Promise<Result<Stay[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/stay/view", props);
}


interface StayDataViewProps {
  stayDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  stayId?: number[],
  fst_encounter_id?: number[],
  snd_encounter_id?: number[],
  min_start_time?: number
  max_start_time?: number
  min_end_time?: number
  max_end_time?: number
  active?: boolean,
  onlyRecent: boolean,
  attendeeUserId?: number[],
  locationId?: number[],
  apiKey: string,
}

export function stayDataView(props: StayDataViewProps, server?: string): Promise<Result<StayData[], InnexgoHoursErrorCode>> {
  return fetchApiOrNetworkError(undefToStr(server) + "innexgo_hours/stay_data/view", props);
}

export const INT_MAX: number = 999999999999999;

export const isPasswordValid = (pass: string) => pass.length >= 8 && /\d/.test(pass);

export const normalizeCourseName = (e: string) => e.toUpperCase().replace(/[^(A-Z0-9: _\-)]+/g, "").replace(/ +(?= )/g, "");

export const normalizeSchoolName = (e: string) => e.toUpperCase().replace(/[^A-Z ]+/g, "").replace(/ +(?= )/g, "");
