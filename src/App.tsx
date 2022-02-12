import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// our auth system
import { ApiKey } from '@innexgo/frontend-auth-api';
import { AuthenticatedComponentRenderer } from '@innexgo/auth-react-components';

// public pages
import Instructions from './pages/Instructions';
import TermsOfService from './pages/TermsOfService';
import Error404 from './pages/Error404';
import SchoolSearch from './pages/SchoolSearch';

// register
import { Register } from '@innexgo/auth-react-components';
import { EmailConfirm } from '@innexgo/auth-react-components';
import { ParentPermissionConfirm } from '@innexgo/auth-react-components';

// When you forget password
import { ForgotPassword } from '@innexgo/auth-react-components';
import { ResetPassword } from '@innexgo/auth-react-components';


// dashboard
import Dashboard from './pages/Dashboard';
// calendar
import Calendar from './pages/Calendar';
// report

// account
import Account from './pages/Account';

// settings
import Settings from './pages/Settings';

// permits you to edit and make changes to a school
import AdminManageSchool from './pages/AdminManageSchool';

// Student can view their own course performance, and (if permitted) withdraw
import StudentManageCourse from './pages/StudentManageCourse';
// Instructor can add and remove students, change the course password, name, and description
import InstructorManageCourse from './pages/InstructorManageCourse';


// view object data
import SchoolStatsReport from './pages/SchoolStatsReport';
import CourseStatsReport from './pages/CourseStatsReport';
import UserStatsReport from './pages/UserStatsReport';
import CourseMembershipStatsReport from './pages/CourseMembershipStatsReport';
import AdminshipStatsReport from './pages/AdminshipStatsReport';
import SessionStatsReport from './pages/SessionStatsReport';

import DarkAdaptedIcon from "./img/innexgo_transparent_icon.png";
import LightAdaptedIcon from "./img/innexgo_onyx_transparent.png";

// Bootstrap CSS & JS
import './style/style.scss';
import 'bootstrap/dist/js/bootstrap';


function getPreexistingApiKey() {
  const preexistingApiKeyString = localStorage.getItem("apiKey");
  if (preexistingApiKeyString == null) {
    return null;
  } else {
    try {
      // TODO validate here
      return JSON.parse(preexistingApiKeyString) as ApiKey;
    } catch (e) {
      // try to clean up a bad config
      localStorage.setItem("apiKey", JSON.stringify(null));
      return null;
    }
  }
}

function App() {
  const [apiKey, setApiKeyState] = React.useState(getPreexistingApiKey());
  const apiKeyGetSetter = {
    apiKey: apiKey,
    setApiKey: (data: ApiKey | null) => {
      localStorage.setItem("apiKey", JSON.stringify(data));
      setApiKeyState(data);
    }
  };

  const branding = {
    name: "Innexgo Hours",
    tagline: "Attendance Simplified",
    homeUrl: "/",
    dashboardUrl: "/dashboard",
    forgotPasswordUrl: "/forgot_password",
    tosUrl: "/terms_of_service",
    darkAdaptedIcon: DarkAdaptedIcon,
    lightAdaptedIcon: LightAdaptedIcon,
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Instructions branding={branding} />} />
        <Route path="/instructions" element={<Instructions branding={branding} />} />
        <Route path="/terms_of_service" element={<TermsOfService branding={branding} />} />
        <Route path="/school_search" element={<SchoolSearch branding={branding} />} />
        <Route path="/forgot_password" element={<ForgotPassword branding={branding} />} />
        <Route path="/reset_password" element={<ResetPassword branding={branding} />} />
        <Route path="/register" element={<Register branding={branding} />} />
        <Route path="/email_confirm" element={<EmailConfirm branding={branding} />} />
        <Route path="/parent_confirm" element={<ParentPermissionConfirm branding={branding} />} />
        <Route path="/dashboard" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Dashboard} />} />
        <Route path="/settings" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Settings} />} />
        <Route path="/account" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Account} />} />
        <Route path="/admin_manage_school" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={AdminManageSchool} />} />
        <Route path="/instructor_manage_course" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={InstructorManageCourse} />} />
        <Route path="/student_manage_course" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={StudentManageCourse} />} />
        <Route path="/calendar" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Calendar} />} />
        <Route path="/school" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={SchoolStatsReport} />} />
        <Route path="/course" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={CourseStatsReport} />} />
        <Route path="/user" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={UserStatsReport} />} />
        <Route path="/course_membership" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={CourseMembershipStatsReport} />} />
        <Route path="/adminship" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={AdminshipStatsReport} />} />
        <Route path="/session" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={SessionStatsReport} />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
