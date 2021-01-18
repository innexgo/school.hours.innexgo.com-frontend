
import React from 'react';
import { Button, Tabs, Tab, Row, Container, Popover, Form, Table } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import InstructorManageCourseMemberships from '../components/InstructorManageCourseMemberships';
import UtilityWrapper from '../components/UtilityWrapper';
import { ViewUser, ViewCourse } from '../components/ViewData';

import { Delete, Visibility, Settings, Add } from '@material-ui/icons'
import { Formik, FormikHelpers, FormikErrors } from 'formik'

import SearchMultiUser from "../components/SearchMultiUser";

import format from "date-fns/format";

import { Async, AsyncProps } from 'react-async';
import { viewUser, viewCourseMembership, viewCourse, isApiErrorCode } from '../utils/utils';

const loadCourse = async (props: AsyncProps<Course>) => {
  const maybeCourses = await viewCourse({
    courseId: parseInt(new URLSearchParams(window.location.search).get("courseId") ?? ""),
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeCourses)) {
    throw Error;
  } else {
    return maybeCourses[0];
  }
}


// TODO can someone clean this up later
function InstructorManageCourse(props: AuthenticatedComponentProps) {
  return (
    <DashboardLayout {...props}>
      <Container fluid className="py-4 px-4">
        <Async promiseFn={loadCourse} apiKey={props.apiKey}>
          <Async.Pending><Loader /></Async.Pending>
          <Async.Rejected>
            <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
          </Async.Rejected>
          <Async.Fulfilled<Course>>{course => <>
            <div className="mx-3 my-3">
              <UtilityWrapper title="Course Data">
                <Popover id="information-tooltip"> Shows basic information about this course. </Popover>
                <ViewCourse course={course} expanded />
              </UtilityWrapper>
            </div>

            <div className="mx-3 my-3">
              <UtilityWrapper title="Current Instructors">
                <Popover id="information-tooltip"> Shows the current instructors of this course.</Popover>
                <InstructorManageCourseMemberships course={course} apiKey={props.apiKey} courseMembershipKind="INSTRUCTOR" />
              </UtilityWrapper>
            </div>
            <div className="mx-3 my-3">
              <UtilityWrapper title="Current Students">
                <Popover id="information-tooltip"> Shows the current students in this course.</Popover>
                <InstructorManageCourseMemberships course={course} apiKey={props.apiKey} courseMembershipKind="STUDENT" />
              </UtilityWrapper>
            </div>

          </>}
          </Async.Fulfilled>
        </Async>
      </Container>
    </DashboardLayout>
  )
}

export default InstructorManageCourse
