import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form, } from 'react-bootstrap'
import { subscriptionNew } from '../utils/utils';

import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';

interface CreateSubscriptionProps {
  apiKey: ApiKey,
  onSuccess: () => void
}

function CreateSubscription(props: CreateSubscriptionProps) {
  type CreateSubscriptionValue = {
    code: string,
  }

  const onSubmit = async (values: CreateSubscriptionValue, { setStatus, setErrors }: FormikHelpers<CreateSubscriptionValue>) => {
    // Validate input
    let errors: FormikErrors<CreateSubscriptionValue> = {};
    let hasError = false;
    if (values.code !== "innexgo666") {
      errors.code = "Subscription code invalid.";
      hasError = true;
    }
    setErrors(errors);
    if (hasError) {
      return;
    }

    const passwordChangeResult = await subscriptionNew({
      subscriptionKind: "VALID",
      apiKey: props.apiKey.key,
    });

    if (isErr(passwordChangeResult)) {
      switch (passwordChangeResult.Err) {
        case "OK": {
          setStatus({
            failureMessage: "",
            successMessage: "Subscription successfully changed."
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
        default: {
          setStatus({
            failureMessage: "An unknown or network error has occured while trying to create subscription.",
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
    <Formik<CreateSubscriptionValue>
      onSubmit={onSubmit}
      initialStatus={{
        successMessage: "",
        failureMessage: "",
      }}
      initialValues={{
        code: "",
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group className="mb-3">
            <Form.Label >Subscription Secret Code</Form.Label>
            <Form.Control
              name="code"
              type="password"
              value={props.values.code}
              onChange={props.handleChange}
              isInvalid={!!props.errors.code}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.code} </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Button type="submit">Change Subscription</Button>
          </Form.Group>
          <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
          <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default CreateSubscription;
