import React from "react"
import SearchSingleSchool from "../components/SearchSingleSchool";
import { Formik, FormikHelpers,} from "formik";
import { Row, Col, Button, Form } from "react-bootstrap";
import { newAdminshipRequest, viewSchoolData, isApiErrorCode } from "../utils/utils";

type UserCreateAdminshipRequestProps = {
  hiddenSchoolIds: number[];
  apiKey: ApiKey;
  postSubmit: () => void;
}

function UserCreateAdminshipRequest(props: UserCreateAdminshipRequestProps) {

  type CreateAdminshipRequestValue = {
    message: string,
    schoolId: number | null,
  }

  const onSubmit = async (values: CreateAdminshipRequestValue,
    { setErrors, setStatus }: FormikHelpers<CreateAdminshipRequestValue>) => {


    if (values.schoolId == null) {
      setErrors({
        schoolId: "Please select a school."
      });
      return;
    }

    const maybeAdminshipRequest = await newAdminshipRequest({
      schoolId: values.schoolId,
      message: values.message,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeAdminshipRequest)) {
      switch (maybeAdminshipRequest) {
        case "API_KEY_NONEXISTENT": {
          setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "COURSE_NONEXISTENT": {
          setErrors({
            schoolId: "This school does not exist.",
          });
          break;
        }
        case "COURSE_ARCHIVED": {
          setErrors({
            schoolId: "This school has been archived.",
          });
          break;
        }
        case "NEGATIVE_DURATION": {
          setStatus({
            failureResult: "The duration you have selected is not valid.",
            successResult: ""
          });
          break;
        }
        default: {
          setStatus({
            failureResult: "An unknown or network error has occurred.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    setStatus({
      failureResult: "",
      successResult: "Request Created",
    });

    props.postSubmit();
  }

  return <>
    <Formik<CreateAdminshipRequestValue>
      onSubmit={onSubmit}
      initialValues={{
        message: "",
        schoolId: null
      }}
      initialStatus={{
        failureResult: "",
        successResult: ""
      }}
    >
      {(fprops) => (
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <Form.Group>
            <Form.Label >School Name</Form.Label>
            <Col>
              <SearchSingleSchool
                name="schoolId"
                search={async input => {
                  const maybeSchoolData = await viewSchoolData({
                    partialName: input,
                    onlyRecent: true,
                    active: true,
                    apiKey: props.apiKey.key,
                  });

                  if(isApiErrorCode(maybeSchoolData)) {
                      return [];
                  }

                  return  maybeSchoolData.filter(sd => !props.hiddenSchoolIds.includes(sd.school.schoolId))
                }}
                isInvalid={!!fprops.errors.schoolId}
                setFn={(e: SchoolData | null) => fprops.setFieldValue("schoolId", e?.school.schoolId)} />
              <Form.Text className="text-danger">{fprops.errors.schoolId}</Form.Text>
            </Col>
          </Form.Group>
          <Form.Group >
            <Form.Label>Message</Form.Label>
            <Col>
              <Form.Control
                name="message"
                type="text"
                placeholder="Message (Optional)"
                as="textarea"
                rows={3}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.message}
              />
              <Form.Text className="text-danger">{fprops.errors.message}</Form.Text>
            </Col>
          </Form.Group>
          <Button type="submit"> Submit </Button>
          <br />
          <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          <br />
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default UserCreateAdminshipRequest;
