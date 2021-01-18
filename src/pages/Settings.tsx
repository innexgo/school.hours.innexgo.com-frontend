import React from 'react';
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Popover, Card, Button, Form, Container } from 'react-bootstrap'
import { newChangePassword, isPasswordValid, isApiErrorCode } from '../utils/utils';

import UtilityWrapper from '../components/UtilityWrapper';

import DashboardLayout from '../components/DashboardLayout';

interface ChangePasswordProps {
  apiKey: ApiKey,
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


function Settings(props: AuthenticatedComponentProps) {

  // TODO actually add backend components to handle changing the name properly
  // Also, make the name and email and password changes into one box initially
  // Then, when you click on them to change, a modal should pop up
  // IMO this would look better than the tiny boxes we have now

  const [successful, setSuccess] = React.useState(false);
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <div className="mx-3 my-3">
        <UtilityWrapper title="Change Password">
          <Popover id="information-tooltip"> Shows basic information about this course. </Popover>
          {successful
            ? <Form.Text className="text-success">Password changed successfully</Form.Text>
            : <ChangePasswordForm apiKey={props.apiKey} onSuccess={() => setSuccess(true)} />
          }
        </UtilityWrapper>
      </div>
    </Container>
  </DashboardLayout>
}

export default Settings;
