import { Button, Card, Divider, Form, Input, InputNumber, Select, message } from "antd";
import { useEffect, useState } from "react";
import { HTTPData } from "../data/data_type";

const baseUrl = "http://localhost:3000";

interface FormComponentProps {
  //
  userData: HTTPData | undefined;
  // setUserData: React.Dispatch<React.SetStateAction<HTTPData | undefined>>;
}

export const FormComponent = (props: FormComponentProps) => {
  const [formBody] = Form.useForm();
  const [formHeader] = Form.useForm();
  const [formParam] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const submitForm = () => {
    if (!props.userData) {
      return;
    }

    let path = props.userData.path;

    // replace url path from :value into {value}
    if (props.userData.param) {
      Object.keys(props.userData.param).forEach((param) => {
        const value = formParam.getFieldValue(param);
        path = path.replace(`:${param}`, `${value}`); // TODO fix {${param}} later
      });
    }

    formBody.validateFields().then(async (values) => {
      try {
        const response = await fetch(`${baseUrl}${path}`, {
          method: props.userData?.method,
          headers: {
            "Content-Type": "application/json",
            // TODO add another header later
          },
          body: JSON.stringify(values),
        });

        const result = await response.json();

        if (response.status !== 200) {
          throw new Error(result.message);
        }
        messageApi.info(JSON.stringify(result), 3);
        //
      } catch (error: any) {
        messageApi.error(error.message, 3);
      }

      // .then((response) => response.json())
      // .then((data) => {
      //   messageApi.info(JSON.stringify(data), 3);
      //   console.log("API Response:", data);
      // })
      // .catch((error) => {
      //   console.error("Error:", error);
      // });
    });
  };

  const [valueMode, setValueMode] = useState(1);

  const initialValue = () => {
    if (valueMode === 1) {
      if (!props.userData?.body) {
        return;
      }

      let obj = {};

      Object.keys(props.userData?.body).forEach((key) => {
        obj = { ...obj, [key]: props.userData?.body![key].default };
      });

      return obj;
    }

    if (valueMode === 2) {
      return {};
    }
  };

  useEffect(() => formBody.resetFields(), [valueMode]);

  return (
    <>
      {contextHolder}
      <Card
        title="Input"
        extra={
          <>
            <Button
              type="link"
              onClick={() => setValueMode(2)}
            >
              Clear All Value
            </Button>
            <Button
              type="link"
              onClick={() => setValueMode(1)}
            >
              Fill With Default Value
            </Button>
          </>
        }
        style={{ width: 600, marginTop: "20px" }}
      >
        {props.userData?.header ? (
          <div>
            <h4 style={{ marginBottom: "10px", marginTop: "0px" }}>Header</h4>
            <Form
              form={formHeader}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 20 }}
            >
              {
                //
                props.userData?.header !== undefined ? ( //
                  Object.keys(props.userData?.header).map((x) => {
                    return (
                      <Form.Item
                        key={x}
                        label={x}
                        name={x}
                      >
                        <Input />
                      </Form.Item>
                    );
                  })
                ) : (
                  <></>
                )
              }
            </Form>

            <Divider />
          </div>
        ) : (
          <></>
        )}

        {props.userData?.param ? (
          <div>
            <h4 style={{ marginBottom: "10px", marginTop: "0px" }}>Params</h4>
            <Form
              form={formParam}
              // initialValues={initialValue()}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 20 }}
            >
              {
                //
                props.userData?.param !== undefined ? ( //
                  Object.keys(props.userData?.param).map((x) => {
                    return (
                      <Form.Item
                        key={x}
                        label={x}
                        name={x}
                      >
                        <Input />
                      </Form.Item>
                    );
                  })
                ) : (
                  <></>
                )
              }
            </Form>

            <Divider />
          </div>
        ) : (
          <></>
        )}

        {props.userData?.body ? (
          <div>
            <h4 style={{ marginBottom: "10px", marginTop: "0px" }}>Body</h4>
            <Form
              form={formBody}
              initialValues={initialValue()}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 20 }}
            >
              {props.userData?.body !== undefined ? ( //
                Object.keys(props.userData?.body).map((x) => {
                  return (
                    <Form.Item
                      key={x}
                      label={x}
                      name={x}
                    >
                      {props.userData!.body![x].enum ? (
                        <Select
                          // defaultValue={props.userData!.body![x].default}
                          options={props.userData!.body![x].enum?.map((z) => ({ value: z, label: z }))}
                        />
                      ) : (
                        <>{props.userData!.body![x].type === "number" ? <InputNumber style={{ width: "100%" }} /> : <Input />}</>
                      )}
                    </Form.Item>
                  );
                })
              ) : (
                <></>
              )}
            </Form>
          </div>
        ) : (
          <></>
        )}

        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            onClick={submitForm}
          >
            Submit
          </Button>
        </div>
      </Card>
    </>
  );
};
