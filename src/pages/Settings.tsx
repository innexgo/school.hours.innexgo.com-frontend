import React from 'react';
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Card, Button, Form, Container } from 'react-bootstrap'
import { newChangePassword, isPasswordValid, isApiErrorCode } from '../utils/utils';

import DashboardLayout from '../components/DashboardLayout';

interface ChangePasswordProps {
  apiKey: ApiKey,
  onSuccess: () => void
}
interface ChangeAccountProps {
  onSuccess: () => void
}

function ChangePasswordForm(props: ChangePasswordProps) {
  type ChangePasswordValue = {
    oldpassword: string,
    password1: string,
    password2: string,
  }

  const onSubmit = async (values: ChangePasswordValue, { setStatus, setErrors }: FormikHelpers<ChangePasswordValue>) => {
    // Validate input
    let errors: FormikErrors<ChangePasswordValue> = {};
    let hasError = false;
    if (!isPasswordValid(values.password1)) {
      errors.password1 = "Password must have at least 8 chars and 1 number";
      hasError = true;
    }
    if (values.password2 !== values.password1) {
      errors.password2 = "Password does not match.";
      hasError = true;
    }
    setErrors(errors);
    if (hasError) {
      return;
    }

    const passwordChangeResult = await newChangePassword({
      userId: props.apiKey.creator.userId,
      oldPassword: values.oldpassword,
      newPassword: values.password1,
      apiKey: props.apiKey.key,
    });
    if (isApiErrorCode(passwordChangeResult)) {
      switch (passwordChangeResult) {
        case "OK": {
          setStatus({
            failureMessage: "",
            successMessage: "Password successfully changed."
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          setStatus({
            failureMessage: "Please log back in and try again",
            successMessage: ""
          });
          break;
        }
        case "PASSWORD_CANNOT_CREATE_FOR_OTHERS": {
          setStatus({
            failureMessage: "You may only change your own password",
            successMessage: ""
          });
          break;
        }
        case "PASSWORD_INSECURE": {
          setErrors({
            password1: "Password is of insufficient complexity"
          });
          break;
        }
        default: {
          setStatus({
            failureMessage: "An unknown or network error has occured while trying to reset password.",
            successMessage: ""
          });
          break;
        }
      }
    } else {
      props.onSuccess();
    }
  }
  return <>
    <Formik<ChangePasswordValue>
      onSubmit={onSubmit}
      initialStatus={{
        successMessage: "",
        failureMessage: "",
      }}
      initialValues={{
        oldpassword: "",
        password1: "",
        password2: "",
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group >
            <Form.Label >Old Password</Form.Label>
            <Form.Control
              name="oldpassword"
              type="password"
              placeholder="Old Password"
              value={props.values.oldpassword}
              onChange={props.handleChange}
              isInvalid={!!props.errors.password1}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.oldpassword} </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label >New Password</Form.Label>
            <Form.Control
              name="password1"
              type="password"
              placeholder="New Password"
              value={props.values.password1}
              onChange={props.handleChange}
              isInvalid={!!props.errors.password1}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.password1} </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              name="password2"
              type="password"
              placeholder="Confirm Password"
              value={props.values.password2}
              onChange={props.handleChange}
              isInvalid={!!props.errors.password2}
            />
            <Form.Control.Feedback type="invalid">{props.errors.password2}</Form.Control.Feedback>
          </Form.Group>
          <br />
          <Button type="submit">Change Password</Button>
          <br />
          <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
          <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}



function ChangeName(props: ChangeAccountProps) {
  type ChangeNameValue = {
    name: string,
  }


  const onSubmit = async (values: ChangeNameValue, { setStatus, setErrors }: FormikHelpers<ChangeNameValue>) => {
    // Validate input
    let errors: FormikErrors<ChangeNameValue> = {};
    let hasError = false;


    /** const passwordResetResult = await newResetPassword({
       passwordResetKey: props.resetKey,
       newPassword: values.password1,
     });
     if (isApiErrorCode(passwordResetResult)) {
       switch (passwordResetResult) {
         case "OK": {
           setStatus({
             failureMessage: "",
             successMessage: "Password successfully changed."
           });
           break;
         }
         case "PASSWORD_RESET_NONEXISTENT": {
           setStatus({
             failureMessage: "Invalid password reset link.",
             successMessage: ""
           });
           break;
         }
         case "PASSWORD_RESET_TIMED_OUT": {
           setStatus({
             failureMessage: "Password reset link timed out.",
             successMessage: ""
           });
           break;
         }
         case "PASSWORD_EXISTENT": {
           setStatus({
             failureMessage: "Password reset link may only be used once.",
             successMessage: ""
           });
           break;
         }
         case "PASSWORD_INSECURE": {
           setErrors({
             password1: "Password is of insufficient complexity"
           });
           break;
         }
         default: {
           setStatus({
             failureMessage: "An unknown or network error has occured while trying to reset password.",
             successMessage: ""
           });
           break;
         }
       }
     } else {
       props.onSuccess();
     }
     */
  }

  //TODO autopopulate name and email
  return <>
    <Formik<ChangeNameValue>
      onSubmit={onSubmit}
      initialStatus={{
        successMessage: "",
        failureMessage: "",
      }}
      initialValues={{
        name: "",
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group >
            <Form.Label >Name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={props.values.name}
              onChange={props.handleChange}
              isInvalid={!!props.errors.name}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.name} </Form.Control.Feedback>
          </Form.Group>
          <br />
          <Button type="submit">Change Name</Button>
          <br />
          <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
          <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

function ChangeEmail(props: ChangeAccountProps) {
  type ChangeEmailValue = {
    email: string,
  }


  const onSubmit = async (values: ChangeEmailValue, { setStatus, setErrors }: FormikHelpers<ChangeEmailValue>) => {
    // Validate input
    let errors: FormikErrors<ChangeEmailValue> = {};
    let hasError = false;


    /** const passwordResetResult = await newResetPassword({
       passwordResetKey: props.resetKey,
       newPassword: values.password1,
     });
     if (isApiErrorCode(passwordResetResult)) {
       switch (passwordResetResult) {
         case "OK": {
           setStatus({
             failureMessage: "",
             successMessage: "Password successfully changed."
           });
           break;
         }
         case "PASSWORD_RESET_NONEXISTENT": {
           setStatus({
             failureMessage: "Invalid password reset link.",
             successMessage: ""
           });
           break;
         }
         case "PASSWORD_RESET_TIMED_OUT": {
           setStatus({
             failureMessage: "Password reset link timed out.",
             successMessage: ""
           });
           break;
         }
         case "PASSWORD_EXISTENT": {
           setStatus({
             failureMessage: "Password reset link may only be used once.",
             successMessage: ""
           });
           break;
         }
         case "PASSWORD_INSECURE": {
           setErrors({
             password1: "Password is of insufficient complexity"
           });
           break;
         }
         default: {
           setStatus({
             failureMessage: "An unknown or network error has occured while trying to reset password.",
             successMessage: ""
           });
           break;
         }
       }
     } else {
       props.onSuccess();
     }
     */
  }

  //TODO autopopulate name and email
  return <>
    <Formik<ChangeEmailValue>
      onSubmit={onSubmit}
      initialStatus={{
        successMessage: "",
        failureMessage: "",
      }}
      initialValues={{
        email: "",
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group >
            <Form.Label >Email</Form.Label>
            <Form.Control
              name="email"
              type="text"
              value={props.values.email}
              onChange={props.handleChange}
              isInvalid={!!props.errors.email}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.email} </Form.Control.Feedback>
          </Form.Group>
          <br />
          <Button type="submit">Change Email</Button>
          <br />
          <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
          <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}


function Settings(props: AuthenticatedComponentProps) {

  // TODO actually add backend components to handle changing the name properly
  // Also, make the name and email and password changes into one box initially
  // Then, when you click on them to change, a modal should pop up
  // IMO this would look better than the tiny boxes we have now

  const [successful, setSuccess] = React.useState(false);
  return <DashboardLayout {...props}>
    <Container fluid className="py-3 px-3 d-flex">
      <Card className="mx-auto my-auto">
        <Card.Body>
          <Card.Title>Change Name</Card.Title>
          {successful
            ? <Form.Text className="text-success">Name changed successfully</Form.Text>
            : <ChangeName onSuccess={() => setSuccess(true)} />
          }
        </Card.Body>
      </Card>
      <Card className="mx-auto my-auto">
        <Card.Body>
          <Card.Title>Change Email</Card.Title>
          {successful
            ? <Form.Text className="text-success">Email changed successfully</Form.Text>
            : <ChangeEmail onSuccess={() => setSuccess(true)} />
          }
        </Card.Body>
      </Card>
      <Card className="mx-auto my-auto">
        <Card.Body>
          <Card.Title>Reset Password</Card.Title>
          {successful
            ? <Form.Text className="text-success">Password changed successfully</Form.Text>
            : <ChangePasswordForm apiKey={props.apiKey} onSuccess={() => setSuccess(true)} />
          }
        </Card.Body>
      </Card>
    </Container>
  </DashboardLayout>
}

export default Settings;
