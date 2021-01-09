import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import AuthenticatedRoute from './components/AuthenticatedRoute';

// public pages
import TermsOfService from './pages/TermsOfService';
import Instructions from './pages/Instructions';
import SchoolSearch from './pages/SchoolSearch';
import Error404 from './pages/Error404';

// register
import Register from './pages/Register';
import RegisterConfirm from './pages/RegisterConfirm';

// When you forget password
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// dashboard
import Dashboard from './pages/Dashboard';

// settings
import Settings from './pages/Settings';

//report
import Report from './pages/Report'

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
import CommittmentStatsReport from './pages/CommittmentStatsReport';


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


  // TODO can someone make a REAL find my school?
  // You have to query viewSchools and then show a list of schools

  return (
    <BrowserRouter>
      <Switch>
        <AuthenticatedRoute exact path="/" {...apiKeyGetSetter} component={Dashboard} />{/*TODO make this point to a real home page that looks good*/}
        <Route path="/instructions" component={Instructions} />
        <Route path="/terms_of_service" component={TermsOfService} />
        <Route path="/school_search" component={SchoolSearch} />
        <Route path="/forgot_password" component={ForgotPassword} />
        <Route path="/reset_password" component={ResetPassword} />
        <Route path="/register" component={Register} />
        <Route path="/register_confirm" component={RegisterConfirm} />
        <AuthenticatedRoute path="/dashboard" {...apiKeyGetSetter} component={Dashboard} />
        <AuthenticatedRoute path="/admin_manage_school" {...apiKeyGetSetter} component={AdminManageSchool} />
        <AuthenticatedRoute path="/settings" {...apiKeyGetSetter} component={Settings} />

        <AuthenticatedRoute path="/instructor_manage_course" {...apiKeyGetSetter} component={InstructorManageCourse} />
        <AuthenticatedRoute path="/student_manage_course" {...apiKeyGetSetter} component={StudentManageCourse} />

        <AuthenticatedRoute path="/school" {...apiKeyGetSetter} component={SchoolStatsReport} />
        <AuthenticatedRoute path="/course" {...apiKeyGetSetter} component={CourseStatsReport} />
        <AuthenticatedRoute path="/user" {...apiKeyGetSetter} component={UserStatsReport} />
        <AuthenticatedRoute path="/course_membership" {...apiKeyGetSetter} component={CourseMembershipStatsReport} />
        <AuthenticatedRoute path="/adminship" {...apiKeyGetSetter} component={AdminshipStatsReport} />
        <AuthenticatedRoute path="/session" {...apiKeyGetSetter} component={SessionStatsReport} />
        <AuthenticatedRoute path="/committment" {...apiKeyGetSetter} component={CommittmentStatsReport} />
        <AuthenticatedRoute path="/report" {...apiKeyGetSetter} component={Report}/>
        <Route path="/" component={Error404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
