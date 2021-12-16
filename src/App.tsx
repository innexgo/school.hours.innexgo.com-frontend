import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// our auth system
import { ApiKey } from '@innexgo/frontend-auth-api';
import { AuthenticatedRoute } from '@innexgo/auth-react-components';

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
    tosUrl: "/terms_of_service",
    darkAdaptedIcon: DarkAdaptedIcon,
    lightAdaptedIcon: LightAdaptedIcon,
  }
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/instructions">
          <Instructions branding={branding} />
        </Route>
        <Route path="/terms_of_service">
          <TermsOfService branding={branding} />
        </Route>
        <Route path="/school_search">
          <SchoolSearch branding={branding} />
        </Route>
        <Route path="/forgot_password">
          <ForgotPassword branding={branding} />
        </Route>
        <Route path="/reset_password">
          <ResetPassword branding={branding} />
        </Route>
        <Route path="/register">
          <Register branding={branding} />
        </Route>
        <Route path="/email_confirm">
          <EmailConfirm branding={branding} />
        </Route>
        <Route path="/parent_permission_confirm">
          <ParentPermissionConfirm branding={branding} />
        </Route>
        <Route path="/dashboard" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Dashboard} />
        </Route>
        <Route path="/settings" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Settings} />
        </Route>
        <Route path="/account" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Account} />
        </Route>
        <Route path="/admin_manage_school" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={AdminManageSchool} />
        </Route>
        <Route path="/instructor_manage_course" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={InstructorManageCourse} />
        </Route>
        <Route path="/student_manage_course" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={StudentManageCourse} />
        </Route>
        <Route exact path="/" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Dashboard} />
        </Route>
        <Route path="/calendar" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Calendar} />
        </Route>
        <Route path="/school" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={SchoolStatsReport} />
        </Route>
        <Route path="/course" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={CourseStatsReport} />
        </Route>
        <Route path="/user" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={UserStatsReport} />
        </Route>
        <Route path="/course_membership" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={CourseMembershipStatsReport} />
        </Route>
        <Route path="/adminship" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={AdminshipStatsReport} />
        </Route>
        <Route path="/session" >
          <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={SessionStatsReport} />
        </Route>
        <Route path="/" component={Error404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
