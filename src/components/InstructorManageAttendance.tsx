
/*
function InstructorManageAttendance(props: InstructorManageAttendanceProps) {

              <Formik<CreateCommitmentResponseValues[]>
                onSubmit={async (values, { setStatus }: FormikHelpers<CreateCommitmentResponseValues[]>) => {
                  let newStatus = values.map(_ => "");
                  values.forEach(async (individual, i) => {
                    if (individual.commitmentResponseKind === "default") {
                      return;
                    }

                    const maybeCommitmentResponse = await commitmentResponseNew({
                      commitmentId: individual.commitment.commitmentId,
                      commitmentResponseKind: individual.commitmentResponseKind,
                      apiKey: props.apiKey.key,
                    });

                    if (isErr(maybeCommitmentResponse)) {
                      switch (maybeCommitmentResponse.Err) {
                        case "COMMITTMENT_RESPONSE_EXISTENT": {
                          newStatus[i] = "Attendance has already been taken for this commitment.";
                          break;
                        }
                        case "COMMITTMENT_RESPONSE_UNCANCELLABLE": {
                          newStatus[i] = "This commitment cannot be cancelled.";
                          break;
                        }
                        case "API_KEY_NONEXISTENT": {
                          newStatus[i] = "You have been automatically logged out. Please relogin.";
                          break;
                        }
                        case "API_KEY_UNAUTHORIZED": {
                          newStatus[i] = "You are not currently authorized to perform this action.";
                          break;
                        }
                        default: {
                          newStatus[i] = "An unknown or network error has occurred.";
                          break;
                        }
                      }
                    }
                  });
                  setStatus(newStatus);
                  reload();
                }}
                initialValues={data.commitments.map(c => ({
                  commitment: c,
                  commitmentResponseKind: "default"
                }))}
                initialStatus={data.commitments.map(_ => "")}
              >
                {fprops =>
                  <Form noValidate onSubmit={fprops.handleSubmit}>
                    <Table hover bordered className="mx-2">
                      <thead>
                        <tr><th>Student</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {fprops.values.map((c: CreateCommitmentResponseValues, i: number) =>
                          <tr key={c.commitment.commitmentId}>
                            <td><ViewUser expanded={false} apiKey={props.apiKey} userId={c.commitment.attendeeUserId} /></td>
                            <td>
                              <Form.Select
                                size="sm"
                                onChange={(e) => {
                                  fprops.values[i].commitmentResponseKind = (e.target as HTMLSelectElement).value as (CommitmentResponseKind | "default");
                                  fprops.setValues(fprops.values)
                                }}
                                placeholder="Message"
                                isInvalid={fprops.status[i] !== ""}
                              >
                                <option value="default">Select</option>
                                <option value="PRESENT">Present</option>
                                <option value="TARDY">Tardy</option>
                                <option value="ABSENT">Absent</option>
                                <option value="CANCELLED">Cancel</option>
                              </Form.Select>
                              <br />
                              <Form.Text className="text-danger">{fprops.status[i]}</Form.Text>
                            </td>
                          </tr>
                        )}
                        {
                          data.commitmentResponses.map((cr: CommitmentResponse) => {
                            let content;
                            switch (cr.kind) {
                              case "ABSENT": {
                                content = <Action title="Absent" icon={X} variant="danger" onClick={() => 1} />;
                                break;
                              }
                              case "TARDY": {
                                content = <Action title="Tardy" icon={Clock} variant="warning" onClick={() => 1} />;
                                break;
                              }
                              case "PRESENT": {
                                content = <Action title="Present" icon={Check} variant="success" onClick={() => 1} />;
                                break;
                              }
                              case "CANCELLED": {
                                content = <Action title="CANCELLED" icon={X} variant="secondary" onClick={() => 1} />;
                                break;
                              }
                            }
                            return <tr>
                              <td><ViewUser expanded={false} apiKey={props.apiKey} userId={cr.commitment.attendeeUserId} /></td>
                              <td>{content}</td>
                            </tr>
                          })
                        }
                      </tbody>
                    </Table>

                    <Button type="submit">Submit</Button>
                  </Form>}
              </Formik>
              */

export {}
