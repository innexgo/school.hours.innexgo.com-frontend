
import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';

import { Delete, } from '@material-ui/icons'
import { Formik, FormikHelpers, } from 'formik'

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { newSetCourseMembership, viewCourseMembership, isApiErrorCode } from '../utils/utils';


type CancelCourseMembershipProps = {
  user: User,
  course: Course,
  apiKey: ApiKey,
  postSubmit: () => void
};

function CancelCourseMembership(props: CancelCourseMembershipProps) {

  type CancelCourseMembershipValue = {
  }

  const onSubmit = async (values: CancelCourseMembershipValue,
    fprops: FormikHelpers<CancelCourseMembershipValue>) => {

    const maybeCourseMembership = await newSetCourseMembership({
      courseId: props.course.courseId,
      userId: props.user.userId,
      courseMembershipKind: "CANCEL",
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeCourseMembership)) {
      switch (maybeCourseMembership) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to remove this user from this course.",
            successResult: ""
          });
          break;
        }
        case "COURSE_MEMBERSHIP_CANNOT_LEAVE_EMPTY": {
          fprops.setStatus({
            failureResult: "You can't remove the last instructor of a course.",
            successResult: ""
          });
          break;
        }
        case "USER_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This user does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to remove course membership.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Course Membership Canceled"
    });

    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<CancelCourseMembershipValue>
      onSubmit={onSubmit}
      initialValues={{
        userIds: [],
      }}
      initialStatus={{
        failureResult: "",
        successResult: ""
      }}
    >
      {(fprops) => <>
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <div hidden={fprops.status.successResult !== ""}>
            <p>Are you sure you want to remove {props.user.name}?</p>
            {props.apiKey.creator.userId === props.user.userId
              ? <p className="text-danger">You are removing yourself. You won't be able to add yourself back.</p>
              : <> </>
            }
            <Button type="submit">Confirm Remove</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

type InternalInstructorManageCourseMembershipsProps = {
  // its critical that we pass the function as a prop, because if we define it inside this function, react-async will break
  loadMemberships: (props: AsyncProps<CourseMembership[]>) => Promise<CourseMembership[]>,
  course: Course,
  apiKey: ApiKey,
}

function InternalInstructorManageCourseMemberships(props: InternalInstructorManageCourseMembershipsProps) {
  const [confirmRemoveUser, setConfirmRemoveUser] = React.useState<User | null>(null);

  return <>
    <Async promiseFn={props.loadMemberships}>
      {({ reload }) => <>
        <Async.Pending><Loader /></Async.Pending>
        <Async.Rejected>
          <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
        </Async.Rejected>
        <Async.Fulfilled<CourseMembership[]>>{data => <>
          <Table hover bordered>
            <thead>
              <tr>
                <th>User</th>
                <th>Date Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a: CourseMembership) =>
                <tr>
                  <td><ViewUser user={a.user} expanded={false} /></td>
                  <td>{format(a.creationTime, "MMM do")}</td>
                  <th>
                    <Button variant="link" className="text-dark"
                      onClick={() => setConfirmRemoveUser(a.user)}>
                      <Delete />
                    </Button>
                  </th>
                </tr>
              )}
            </tbody>
          </Table>
          {confirmRemoveUser === null ? <> </> :
            <DisplayModal
              title="Confirm Remove"
              show={confirmRemoveUser != null}
              onClose={() => setConfirmRemoveUser(null)}
            >
              <CancelCourseMembership {...props}
                user={confirmRemoveUser}
                postSubmit={() => {
                  setConfirmRemoveUser(null);
                  reload();
                }}
              />
            </DisplayModal>
          }
        </>}
        </Async.Fulfilled>
      </>}
    </Async>
  </>
}


// This is a wrapper to stop the infinte loop

type InstructorManageCourseMembershipsProps = {
  courseMembershipKind: CourseMembershipKind,
  course: Course,
  apiKey: ApiKey,
}

function InstructorManageCourseMemberships(props: InstructorManageCourseMembershipsProps) {
  return <InternalInstructorManageCourseMemberships
    course={props.course}
    apiKey={props.apiKey}
    loadMemberships={async (_:AsyncProps<CourseMembership[]>) => {
      const maybeCourseMemberships = await viewCourseMembership({
        courseId: props.course.courseId,
        courseMembershipKind: props.courseMembershipKind,
        onlyRecent: true,
        apiKey: props.apiKey.key
      });

      if (isApiErrorCode(maybeCourseMemberships)) {
        throw Error;
      } else {
        return maybeCourseMemberships;
      }
    }}
  />
}

export default InstructorManageCourseMemberships;