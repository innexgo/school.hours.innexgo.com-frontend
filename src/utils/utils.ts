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
  "DATABASE_INITIALIZED",
  "PASSWORD_INCORRECT",
  "PASSWORD_INSECURE",
  "USER_NONEXISTENT",
  "API_KEY_NONEXISTENT",
  "USER_EXISTENT",
  "USER_NAME_EMPTY",
  "USER_EMAIL_EMPTY",
  "USER_EMAIL_INVALIDATED",
  "USER_KIND_INVALID",
  "SESSION_NONEXISTENT",
  "SESSION_CANNOT_CREATE_FOR_OTHERS_STUDENT",
  "SESSION_REQUEST_RESPONSE_EXISTENT",
  "SESSION_REQUEST_RESPONSE_CANNOT_CANCEL_STUDENT",
  "COMMITTMENT_EXISTENT",
  "COMMITTMENT_NONEXISTENT",
  "COMMITTMENT_CANNOT_CREATE_FOR_OTHERS_STUDENT",
  "COMMITTMENT_CANNOT_CREATE_HIDDEN_STUDENT",
  "COMMITTMENT_CANNOT_CREATE_UNCANCELLABLE_STUDENT",
  "COMMITTMENT_RESPONSE_KIND_INVALID",
  "COMMITTMENT_RESPONSE_EXISTENT",
  "COMMITTMENT_RESPONSE_UNCANCELLABLE",
  "COMMITTMENT_RESPONSE_CANNOT_CREATE_FOR_OTHERS_STUDENT",
  "NEGATIVE_DURATION",
  "EMAIL_VERIFICATION_CHALLENGE_KEY_NONEXISTENT",
  "EMAIL_VERIFICATION_CHALLENGE_KEY_TIMED_OUT",
  "PASSWORD_RESET_KEY_NONEXISTENT",
  "PASSWORD_RESET_KEY_INVALID",
  "PASSWORD_RESET_KEY_TIMED_OUT",
  "EMAIL_RATELIMIT",
  "EMAIL_BLACKLISTED",
  "UNKNOWN",
  "NETWORK"
] as const;

// Creates a union type
export type ApiErrorCode = typeof ApiErrorCodes[number];

type NewApiKeyProps = {
  userEmail: string,
  userPassword: string,
  duration: number,
}


export async function newApiKey(props: NewApiKeyProps): Promise<ApiKey | ApiErrorCode> {
  return await fetchApi("apiKey/new/", getFormData(props));
}

type NewEmailVerificationChallengeProps = {
  userName: string,
  userEmail: string,
  userKind: UserKind,
  userPassword: string,
};

export async function newEmailVerificationChallenge(props: NewEmailVerificationChallengeProps): Promise<EmailVerificationChallenge | ApiErrorCode> {
  return await fetchApi("emailVerificationChallenge/new/", getFormData(props));
}

type NewUserProps = {
  verificationKey: string,
};

export async function newUser(props: NewUserProps): Promise<User | ApiErrorCode> {
  return await fetchApi("user/new/", getFormData(props));
}

type NewResetPasswordKeyProps = {
  userEmail: string,
};

export async function newPasswordResetKey(props: NewResetPasswordKeyProps): Promise<PasswordResetKey | ApiErrorCode> {
  return await fetchApi("passwordResetKey/new/", getFormData(props));
}

type NewSessionProps = {
  name: string
  hostId: number
  startTime: number
  duration: number
  hidden: boolean
  apiKey: string
}

export async function newSession(props: NewSessionProps): Promise<Session | ApiErrorCode> {
  return await fetchApi("session/new/", getFormData(props));
}

type NewSessionRequestProps = {
  attendeeId: number,
  hostId: number,
  message: string,
  startTime: number,
  duration: number,
  apiKey: string,
}

export async function newSessionRequest(props: NewSessionRequestProps): Promise<SessionRequest | ApiErrorCode> {
  return await fetchApi("sessionRequest/new/", getFormData(props));
}

type NewSessionRequestResponseProps = {
  sessionRequestId: number,
  message: string,
  accepted: boolean,
  committmentId?: number,
  apiKey: string,
}

export async function newSessionRequestResponse(props: NewSessionRequestResponseProps): Promise<SessionRequestResponse | ApiErrorCode> {
  return await fetchApi("sessionRequestResponse/new/", getFormData(props));
}

type NewCommittmentProps = {
  attendeeId: number,
  sessionId: number,
  cancellable: boolean,
  apiKey: string,
}

export async function newCommittment(props: NewCommittmentProps): Promise<Committment | ApiErrorCode> {
  return await fetchApi("committment/new/", getFormData(props));
}

type NewCommittmentResponseProps = {
  committmentId: number,
  committmentResponseKind: CommittmentResponseKind,
  apiKey: string,
}
export async function newCommittmentResponse(props: NewCommittmentResponseProps): Promise<CommittmentResponse | ApiErrorCode> {
  return await fetchApi("committmentResponse/new/", getFormData(props));
}

type ViewUserProps = {
  userId?: number,
  userKind?: UserKind,
  userName?: string,
  partialUserName?: string,
  userEmail?: string,
  offset?: number,
  count?: number,
  apiKey: string
}

export async function viewUser(props: ViewUserProps): Promise<User[] | ApiErrorCode> {
  return await fetchApi("user/", getFormData(props));
}

type ViewSessionProps = {
  sessionId?: number,
  creatorId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  name?: string,
  hostId?: number,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  hidden?: Boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewSession(props: ViewSessionProps): Promise<Session[] | ApiErrorCode> {
  return await fetchApi("session/", getFormData(props));
}

type ViewSessionRequestProps = {
  sessionRequestId?: number,
  creatorId?: number,
  attendeeId?: number,
  hostId?: number,
  message?: string,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  responded?: Boolean,
  offset?: number,
  count?: number,
  apiKey: string
}

export async function viewSessionRequest(props: ViewSessionRequestProps): Promise<SessionRequest[] | ApiErrorCode> {
  return await fetchApi("sessionRequest/", getFormData(props));
}

type ViewSessionRequestResponseProps = {
  sessionRequestId?: number,
  creatorId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  message?: string,
  accepted?: Boolean,
  committmentId?: number,
  attendeeId?: number,
  hostId?: number,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewSessionRequestResponse(props: ViewSessionRequestResponseProps): Promise<SessionRequestResponse[] | ApiErrorCode> {
  return await fetchApi("sessionRequestResponse/", getFormData(props));
}

type ViewCommittmentProps = {
  committmentId?: number,
  creatorId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  attendeeId?: number,
  sessionId?: number,
  cancellable?: Boolean,
  hostId?: number,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  responded?: Boolean,
  offset?: number,
  count?: number,
  apiKey: string
}

export async function viewCommittment(props: ViewCommittmentProps): Promise<Committment[] | ApiErrorCode> {
  return await fetchApi("committment/", getFormData(props));
}

type ViewCommittmentResponseProps = {
  committmentId?: number,
  creatorId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  committmentResponseKind?: CommittmentResponseKind,
  attendeeId?: number,
  hostId?: number,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  sessionId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewCommittmentResponse(props: ViewCommittmentResponseProps): Promise<CommittmentResponse[] | ApiErrorCode> {
  return await fetchApi("committmentResponse/", getFormData(props));
}

type UpdatePasswordProps = {
  userId: number,
  oldPassword: string,
  newPassword: string,
  apiKey: string,
}

export async function updatePassword(props: UpdatePasswordProps): Promise<ApiErrorCode> {
  return await fetchApi("misc/updatePassword/", getFormData(props));
}

export async function schoolInfo(): Promise<SchoolInfo | ApiErrorCode> {
  return await fetchApi("misc/info/school/", getFormData({}));
}

type DoResetPasswordProps = {
  resetKey: string,
  newPassword: string,
}

export async function doPasswordReset(props: DoResetPasswordProps): Promise<ApiErrorCode> {
  return await fetchApi("misc/usePasswordResetKey/", getFormData(props));
}

export function isApiErrorCode(maybeApiErrorCode: any): maybeApiErrorCode is ApiErrorCode {
  return typeof maybeApiErrorCode === 'string' && ApiErrorCodes.includes(maybeApiErrorCode as any);
}

export const isPasswordValid = (pass: string) => pass.length >= 8 && /\d/.test(pass);
