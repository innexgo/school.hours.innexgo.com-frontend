/**
 * Returns a promise that will be resolved in some milliseconds
 * use await sleep(some milliseconds)
 * @param {int} ms milliseconds to sleep for
 * @return {Promise} a promise that will resolve in ms milliseconds
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function staticUrl() {
  return window.location.protocol + "//" + window.location.host;
}

export function apiUrl() {
  return staticUrl() + '/api';
}

function getFormData(data: object) {
  const formData = new FormData();
  Object.keys(data).forEach(key => formData.append(key, (data as any)[key]));
  return formData;
}

// This function is guaranteed to only return ApiErrorCode | object
async function fetchApi(url: string, data: FormData) {
  // Catch all errors and always return a response
  const resp = await (async () => {
    try {
      return await fetch(`${apiUrl()}/${url}`, {
        method: 'POST',
        body: data
      });
    } catch (e) {
      return new Response('"NETWORK"', { status: 400 })
    }
  })();

  try {
    let objResp = await resp.json();
    return objResp;
  } catch (e) {
    return "UNKNOWN";
  }
}

const ApiErrorCodes = [
  "OK",
  "NOT_FOUND",
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
  "SCHOOL_NONEXISTENT",
  "SESSION_REQUEST_NONEXISTENT",
  "SESSION_REQUEST_RESPONSE_EXISTENT",
  "SESSION_REQUEST_RESPONSE_CANNOT_CANCEL_STUDENT",
  "SESSION_CANNOT_CREATE_FOR_OTHERS_STUDENT",
  "SESSION_NONEXISTENT",
  "COMMITTMENT_EXISTENT",
  "COMMITTMENT_NONEXISTENT",
  "COMMITTMENT_CANNOT_CREATE_FOR_OTHERS_STUDENT",
  "COMMITTMENT_CANNOT_CREATE_HIDDEN_STUDENT",
  "COMMITTMENT_CANNOT_CREATE_UNCANCELLABLE_STUDENT",
  "COMMITTMENT_RESPONSE_KIND_INVALID",
  "COMMITTMENT_RESPONSE_EXISTENT",
  "COMMITTMENT_RESPONSE_UNCANCELLABLE",
  "COMMITTMENT_RESPONSE_CANNOT_CREATE_FOR_OTHERS_STUDENT",
  "COURSE_NONEXISTENT",
  "COURSEMEMBERSHIP_NONEXISTENT",
  "COURSEMEMBERSHIP_CANNOT_REMOVE_SELF",
  "LOCATION_NONEXISTENT",
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
  "NETWORK"
] as const;

// Creates a union type
export type  ApiErrorCode = typeof ApiErrorCodes[number];

export type NewValidApiKeyProps = {
  userEmail: string,
  userPassword: string,
  duration: number,
}

export async function newValidApiKey(props: NewValidApiKeyProps): Promise<ApiKey | ApiErrorCode> {
  return await fetchApi("apiKey/newValid/", getFormData(props));
}

export type NewCancelApiKeyProps = {
  apiKeyToCancel: string,
  apiKey: string,
}

export async function newApiKeyCancel(props: NewCancelApiKeyProps): Promise<ApiKey | ApiErrorCode> {
  return await fetchApi("apiKey/newCancel/", getFormData(props));
}

export type NewVerificationChallengeProps = {
  userName: string,
  userEmail: string,
  userPassword: string,
};

export async function newVerificationChallenge(props: NewVerificationChallengeProps): Promise<VerificationChallenge | ApiErrorCode> {
  return await fetchApi("verificationChallenge/new/", getFormData(props));
}

export type NewUserProps = {
  verificationKey: string,
};

export async function newUser(props: NewUserProps): Promise<User | ApiErrorCode> {
  return await fetchApi("user/new/", getFormData(props));
}

export type NewPasswordResetProps = {
  userEmail: string,
};

export async function newPasswordReset(props: NewPasswordResetProps): Promise<PasswordReset | ApiErrorCode> {
  return await fetchApi("passwordReset/new/", getFormData(props));
}

export type NewChangePasswordProps = {
  userId: number,
  newPassword: string,
  apiKey: string
}

export async function newChangePassword(props: NewChangePasswordProps): Promise<Password | ApiErrorCode> {
  return await fetchApi("password/newChange/", getFormData(props));
}

export type NewCancelPasswordProps = {
  userId: number,
  apiKey: string
}

export async function newCancelPassword(props: NewCancelPasswordProps): Promise<Password | ApiErrorCode> {
  return await fetchApi("password/newCancel/", getFormData(props));
}


export type NewResetPasswordProps = {
  passwordResetKey: string,
  newPassword: string
}

export async function newResetPassword(props: NewResetPasswordProps): Promise<Password | ApiErrorCode> {
  return await fetchApi("password/newReset/", getFormData(props));
}

export type NewCourseProps = {
  schoolId: number,
  name: string,
  description: string,
  apiKey: string
}

export async function newCourse(props: NewCourseProps): Promise<Course | ApiErrorCode> {
  return await fetchApi("course/new/", getFormData(props));
}

export type NewChangeCoursePasswordProps = {
  courseId: number,
  newPassword: string,
  apiKey: string
}

export async function newChangeCoursePassword(props: NewChangeCoursePasswordProps): Promise<CoursePassword | ApiErrorCode> {
  return await fetchApi("coursePassword/newChange/", getFormData(props));
}

export type NewCancelCoursePasswordProps = {
  courseId: number,
  apiKey: string
}

export async function newCancelCoursePassword(props: NewCancelCoursePasswordProps): Promise<CoursePassword | ApiErrorCode> {
  return await fetchApi("coursePassword/newCancel/", getFormData(props));
}

export type NewCourseMembershipProps = {
  userId: number,
  courseId: number,
  courseMembershipKind: CourseMembershipKind,
  apiKey: string
}

export async function newCourseMembership(props: NewCourseMembershipProps): Promise<CourseMembership | ApiErrorCode> {
  return await fetchApi("courseMembership/new/", getFormData(props));
}

export type NewAdminshipProps = {
  userId: number,
  schoolId: number,
  adminshipKind: AdminshipKind,
  apiKey: string
}

export async function newAdminship(props: NewAdminshipProps): Promise<Adminship | ApiErrorCode> {
  return await fetchApi("adminship/new/", getFormData(props));
}


export type NewSessionProps = {
  name: string,
  courseId: number,
  locationId: number,
  startTime: number,
  duration: number,
  hidden: boolean,
  apiKey: string,
}

export async function newSession(props: NewSessionProps): Promise<Session | ApiErrorCode> {
  return await fetchApi("session/new/", getFormData(props));
}

export type NewSessionRequestProps = {
  courseId: number,
  message: string,
  startTime: number,
  duration: number,
  apiKey: string,
}

export async function newSessionRequest(props: NewSessionRequestProps): Promise<SessionRequest | ApiErrorCode> {
  return await fetchApi("sessionRequest/new/", getFormData(props));
}

export type NewRejectSessionRequestResponseProps = {
  sessionRequestId: number,
  message: string,
  apiKey: string,
}

export async function newRejectSessionRequestResponse(props: NewRejectSessionRequestResponseProps): Promise<SessionRequestResponse | ApiErrorCode> {
  return await fetchApi("sessionRequestResponse/newReject/", getFormData(props));
}

export type NewAcceptSessionRequestResponseProps = {
  sessionRequestId: number,
  message: string,
  committmentId: number,
  apiKey: string,
}

export async function newAcceptSessionRequestResponse(props: NewAcceptSessionRequestResponseProps): Promise<SessionRequestResponse | ApiErrorCode> {
  return await fetchApi("sessionRequestResponse/newAccept/", getFormData(props));
}


export type NewCommittmentProps = {
  attendeeId: number,
  sessionId: number,
  cancellable: boolean,
  apiKey: string,
}

export async function newCommittment(props: NewCommittmentProps): Promise<Committment | ApiErrorCode> {
  return await fetchApi("committment/new/", getFormData(props));
}

export type NewCommittmentResponseProps = {
  committmentId: number,
  committmentResponseKind: CommittmentResponseKind,
  apiKey: string,
}

export async function newCommittmentResponse(props: NewCommittmentResponseProps): Promise<CommittmentResponse | ApiErrorCode> {
  return await fetchApi("committmentResponse/new/", getFormData(props));
}

export type ViewSchoolProps = {
  schoolId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  name?: string, //
  partialName?: string, //
  abbreviation?: string, //
  offset?: number,
  count?: number
}

export async function viewSchool(props: ViewSchoolProps): Promise<School[] | ApiErrorCode> {
  return await fetchApi("school/", getFormData(props));
}

export type ViewUserProps = {
  userId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  userName?: string, //
  partialUserName?: string, //
  userEmail?: string, //
  offset?: number,
  count?: number,
  apiKey: string,
}


export async function viewUser(props: ViewUserProps): Promise<User[] | ApiErrorCode> {
  return await fetchApi("user/", getFormData(props));
}

export type ViewPasswordProps = {
  passwordId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  userId?: number, //
  passwordKind?: PasswordKind, //
  onlyRecent?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewPassword(props: ViewPasswordProps): Promise<Password[] | ApiErrorCode> {
  return await fetchApi("password/", getFormData(props));
}


export type ViewApiKeyProps = {
  apiKeyId?: number, //
  creatorUserId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  duration?: number, //
  minDuration?: number, //
  maxDuration?: number, //
  apiKeyKind?: ApiKeyKind, //
  onlyRecent?: boolean, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewApiKey(props: ViewApiKeyProps): Promise<ApiKey[] | ApiErrorCode> {
  return await fetchApi("apiKey/", getFormData(props));
}

export type ViewCourseProps = {
  courseId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  schoolId?: number, //
  name?: string, //
  partialName?: string, //
  description?: string, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewCourse(props: ViewCourseProps): Promise<Course[] | ApiErrorCode> {
  return await fetchApi("course/", getFormData(props));
}

export type ViewCoursePasswordProps = {
  coursePasswordId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  courseId?: number, //
  coursePasswordKind?: CoursePasswordKind, //
  onlyRecent?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewCoursePassword(props: ViewCoursePasswordProps): Promise<CoursePassword[] | ApiErrorCode> {
  return await fetchApi("coursePassword/", getFormData(props));
}


export type ViewCourseMembershipProps = {
  courseMembershipId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  userId?: number, //
  courseId?: number, //
  courseMembershipKind?: CourseMembershipKind, //
  courseName?: string,
  partialCourseName?: string,
  userName?: string,
  partialUserName?: string,
  onlyRecent?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewCourseMembership(props: ViewCourseMembershipProps): Promise<CourseMembership[] | ApiErrorCode> {
  return await fetchApi("courseMembership/", getFormData(props));
}

export type ViewAdminshipProps = {
  adminshipId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  userId?: number, //
  schoolId?: number, //
  adminshipKind?: AdminshipKind, //
  onlyRecent?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewAdminship(props: ViewAdminshipProps): Promise<Adminship[] | ApiErrorCode> {
  return await fetchApi("adminship/", getFormData(props));
}


export type ViewSessionProps = {
  sessionId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  courseId?: number, //
  locationId?: number, //
  name?: string, //
  partialName?: string, //
  startTime?: number, //
  minStartTime?: number, //
  maxStartTime?: number, //
  duration?: number, //
  minDuration?: number, //
  maxDuration?: number, //
  hidden?: boolean, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewSession(props: ViewSessionProps): Promise<Session[] | ApiErrorCode> {
  return await fetchApi("session/", getFormData(props));
}

export type ViewSessionRequestProps = {
  sessionRequestId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  attendeeUserId?: number, //
  courseId?: number, //
  message?: string, //
  startTime?: number, //
  minStartTime?: number, //
  maxStartTime?: number, //
  duration?: number, //
  minDuration?: number, //
  maxDuration?: number, //
  responded?: boolean, //
  offset?: number,
  count?: number,
  apiKey: string
}

export async function viewSessionRequest(props: ViewSessionRequestProps): Promise<SessionRequest[] | ApiErrorCode> {
  return await fetchApi("sessionRequest/", getFormData(props));
}

export type ViewSessionRequestResponseProps = {
  sessionRequestId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  message?: string, //
  accepted?: boolean, //
  committmentId?: number, //
  attendeeUserId?: number, //
  courseId?: number, //
  startTime?: number, //
  minStartTime?: number, //
  maxStartTime?: number, //
  duration?: number, //
  minDuration?: number, //
  maxDuration?: number, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewSessionRequestResponse(props: ViewSessionRequestResponseProps): Promise<SessionRequestResponse[] | ApiErrorCode> {
  return await fetchApi("sessionRequestResponse/", getFormData(props));
}

export type ViewCommittmentProps = {
  committmentId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  attendeeUserId?: number, //
  sessionId?: number, //
  cancellable?: boolean, //
  courseId?: number, //
  startTime?: number, //
  minStartTime?: number, //
  maxStartTime?: number, //
  duration?: number, //
  minDuration?: number, //
  maxDuration?: number, //
  responded?: boolean, //
  offset?: number,
  count?: number,
  apiKey: string
}

export async function viewCommittment(props: ViewCommittmentProps): Promise<Committment[] | ApiErrorCode> {
  return await fetchApi("committment/", getFormData(props));
}

export type ViewCommittmentResponseProps = {
  committmentId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  committmentResponseKind?: CommittmentResponseKind, //
  attendeeUserId?: number, //
  courseId?: number, //
  startTime?: number, //
  minStartTime?: number, //
  maxStartTime?: number, //
  duration?: number, //
  minDuration?: number, //
  maxDuration?: number, //
  sessionId?: number, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewCommittmentResponse(props: ViewCommittmentResponseProps): Promise<CommittmentResponse[] | ApiErrorCode> {
  return await fetchApi("committmentResponse/", getFormData(props));
}

export function isApiErrorCode(maybeApiErrorCode: any): maybeApiErrorCode is ApiErrorCode {
  return typeof maybeApiErrorCode === 'string' && ApiErrorCodes.includes(maybeApiErrorCode as any);
}

export const isPasswordValid = (pass: string) => pass.length >= 8 && /\d/.test(pass);
