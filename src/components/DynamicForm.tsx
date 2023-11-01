import { CloseOutlined } from "@ant-design/icons";
import JsonView from "@uiw/react-json-view";
import { Button, Checkbox, Col, Collapse, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, message } from "antd";
import { useForm } from "antd/es/form/Form";
import dayjs from "dayjs";
import dayjsPluginUTC from "dayjs/plugin/utc";
import React, { useEffect, useState } from "react";
import { HTTPData, InputType } from "../data/data_type";

dayjs.extend(dayjsPluginUTC);

const baseUrl = "http://localhost:3000";

const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";

// type GeneralInfoType = {
//   default?: any;
//   summary?: string;
//   description?: string;
//   required?: boolean;
// };

// type EnumerableField = {
//   type: "string" | "number" | "boolean" | "date";
//   enum?: (string | boolean | number)[];
//   textAreaLine?: number;
//   maxLength?: number;
//   isPassword?: boolean;
// };

// type ObjectField = {
//   type: "object";
//   properties: Record<string, GeneralInfoType & (EnumerableField | ObjectField | ArrayField)>;
// };

// type ArrayField = {
//   type: "array";
//   items: GeneralInfoType & (EnumerableField | ObjectField | ArrayField);
// };

// export type InputType = Record<string, GeneralInfoType & (EnumerableField | ObjectField | ArrayField)>;

const generateFormItem = (fieldNames: (string | number)[], field: InputType[keyof InputType]) => {
  //

  const lastFieldName = fieldNames[fieldNames.length - 1];

  switch (field.type) {
    case "string":
      //

      return field.enum ? (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <Select
            placeholder={field.summary}
            allowClear
            options={field.enum.map((val) => ({ value: val, label: val.toString() }))}
          />
        </Form.Item>
      ) : field.textAreaLine && field.textAreaLine > 1 ? (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <Input.TextArea
            placeholder={field.summary}
            rows={field.textAreaLine}
            maxLength={field.maxLength}
          />
        </Form.Item>
      ) : field.isPassword ? (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <Input.Password
            placeholder={field.summary}
            maxLength={field.maxLength}
          />
        </Form.Item>
      ) : (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <Input
            placeholder={field.summary}
            maxLength={field.maxLength}
          />
        </Form.Item>
      );

    case "number":
      return (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder={field.summary}
          />
        </Form.Item>
      );

    case "boolean":
      return (
        <Form.Item
          key={lastFieldName}
          name={fieldNames}
          valuePropName="checked"
        >
          <Checkbox>{field.summary}</Checkbox>
        </Form.Item>
      );

    case "date":
      return (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <DatePicker
            style={{ width: "100%" }}
            format={dateTimeFormat}
            showTime={{ defaultValue: dayjs("00:00:00", "HH:mm:ss") }}
          />
        </Form.Item>
      );

    case "array":
      if (field.items.type === "string" || field.items.type === "number" || field.items.type === "boolean") {
        return (
          <Form.Item
            key={lastFieldName}
            label={lastFieldName}
            name={fieldNames}
            required={field.required}
          >
            <Select
              placeholder={field.summary}
              allowClear
              mode="tags"
              options={field.items!.enum?.map((val) => ({ value: val, label: val.toString() }))}
            />
          </Form.Item>
        );
      } else if (field.items.type === "object") {
        //
        const properties = field.items.properties;

        return (
          <Form.Item
            key={lastFieldName}
            label={lastFieldName}
          >
            <Form.List name={fieldNames}>
              {(fields, opt) => {
                return (
                  <>
                    {fields.map((xfield) => {
                      return (
                        <Form.Item
                          key={xfield.name}
                          name={[xfield.name]}
                        >
                          <CardForm
                            json={properties}
                            previousField={[xfield.name]}
                            extra={
                              <CloseOutlined
                                onClick={() => {
                                  opt.remove(xfield.name);
                                }}
                              />
                            }
                          />
                        </Form.Item>
                      );
                    })}

                    <Button
                      type="dashed"
                      onClick={() => opt.add()}
                      block
                    >
                      + Add Sub Item
                    </Button>
                  </>
                );
              }}
            </Form.List>
          </Form.Item>
        );
      }
      return <></>;

    case "object":
      return (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <CardForm
            json={field.properties}
            previousField={fieldNames}
          />
        </Form.Item>
      );

    default:
      return null;
  }
};

const generateForm = (json: InputType, previousField: (string | number)[]) => {
  //
  const formItems: React.ReactNode[] = [];

  for (const fieldName in json) {
    const field = json[fieldName];

    const formItem = generateFormItem([...previousField, fieldName], field);
    if (formItem) {
      formItems.push(formItem);
    }
  }

  return formItems;
};

const generateDefaultValueJSON = (json: InputType): Record<string, any> => {
  //
  const defaultValueObject: Record<string, any> = {};

  for (const fieldName in json) {
    //
    const field = json[fieldName];

    if (field.type === "array" && field.items.default !== undefined) {
      defaultValueObject[fieldName] = field.items.default;
      //
    } else if (field.type === "object") {
      defaultValueObject[fieldName] = generateDefaultValueJSON(field.properties);
      //
    } else if (field.default !== undefined) {
      //
      if (field.type === "date") {
        defaultValueObject[fieldName] = dayjs.utc(field.default, dateTimeFormat);
        //
      } else {
        defaultValueObject[fieldName] = field.default;
      }
    }
  }
  return defaultValueObject;
};

const generateEmptyValueJSON = (json: InputType): Record<string, any> => {
  //
  const defaultValueObject: Record<string, any> = {};

  for (const fieldName in json) {
    //
    const field = json[fieldName];

    if (field.type === "string") {
      defaultValueObject[fieldName] = "";
      continue;
    }

    if (field.type === "number") {
      defaultValueObject[fieldName] = 0;
      continue;
    }

    if (field.type === "boolean") {
      defaultValueObject[fieldName] = false;
      continue;
    }

    if (field.type === "object") {
      defaultValueObject[fieldName] = generateEmptyValueJSON(field.properties);
      continue;
    }

    if (field.type === "array") {
      defaultValueObject[fieldName] = [];
      continue;
    }

    if (field.type === "date") {
      defaultValueObject[fieldName] = dayjs.utc("1000-01-01 00:00:00", dateTimeFormat);
      continue;
    }
  }
  return defaultValueObject;
};

const CardForm: React.FC<{ json: InputType; previousField: (string | number)[]; extra?: React.ReactNode }> = ({ json, previousField, extra }) => {
  //

  const innerCardStyle = previousField.length
    ? {
        // marginTop: "0px",
        // borderWidth: "2px",
        // borderColor: "black",
        // border: "1px solid",
      }
    : {
        marginTop: "20px",
      };

  return (
    <>
      {/* <Card
        title={previousField.length === 0 ? "Body" : ""}
        style={innerCardStyle}
        extra={extra}
      >
        {generateForm(json, previousField)}
      </Card> */}

      <Collapse
        style={innerCardStyle}
        collapsible="header"
        defaultActiveKey={["1"]}
        items={[
          {
            key: "1",
            label: previousField.length === 0 ? "Body" : "",
            children: generateForm(json, previousField),
            extra: extra,
          },
        ]}
      />
    </>
  );
};

const DynamicForm: React.FC<{ httpData: HTTPData | undefined }> = ({ httpData }) => {
  //

  const [formHeader] = useForm();
  const [formParam] = useForm();
  const [formQuery] = useForm();
  const [formCookie] = useForm();
  const [formBody] = useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const jsonBody = httpData?.body as InputType;

  const [jsonObject, setJSONObject] = useState(generateDefaultValueJSON(jsonBody));

  const [jsonResponse, setJSONResponse] = useState({});

  const [modalData, setModalData] = useState(null);

  const onClear = () => setJSONObject({});

  const onReset = () => setJSONObject(generateDefaultValueJSON(jsonBody));

  const onDisplayResult = () => setModalData(formBody.getFieldsValue());

  const submitForm = () => {
    //

    if (!httpData) {
      return <></>;
    }

    formBody.validateFields().then(async (values) => {
      try {
        let path = httpData.path;
        if (httpData.param) {
          Object.keys(httpData.param).forEach((param) => {
            const value = formParam.getFieldValue(param);
            path = path.replace(`:${param}`, `${value}`); // TODO fix {${param}} later
          });
        }

        let theHeaders = { "Content-Type": "application/json" };
        if (httpData.header) {
          Object.keys(httpData.header).forEach((param) => {
            const value = formHeader.getFieldValue(param);
            theHeaders = { ...theHeaders, [param]: value };
          });
        }

        let theQueries = "";
        if (httpData.query) {
          Object.keys(httpData.query).forEach((param) => {
            const value = formQuery.getFieldValue(param);
            theQueries = `${theQueries === "" ? "?" : `${theQueries}&`}${param}=${value}`;
          });
        }

        const response = await fetch(`${baseUrl}${path}${theQueries}`, {
          method: httpData?.method,
          headers: theHeaders,
          body: JSON.stringify(values),
        });

        const result = await response.json();

        // TODO has conditional to check whether it is 200 or others depend on the response
        if (response.status !== 200) {
          console.log(JSON.stringify(result));

          throw new Error(JSON.stringify({ message: result.message }));
        }
        messageApi.info(JSON.stringify(result), 3);

        setJSONResponse(result);

        //
      } catch (error: any) {
        console.log(JSON.stringify(error));
        messageApi.error(error.message, 3);
      }
    });
  };

  useEffect(() => {
    setTimeout(() => formBody.resetFields(), 200);
  }, [jsonObject]);

  return (
    <>
      {contextHolder}

      <Modal
        title="Basic Modal"
        open={modalData !== null}
        onOk={() => setModalData(null)}
        onCancel={() => setModalData(null)}
      >
        {modalData !== null ? (
          <JsonView
            collapsed={3}
            displayDataTypes={false}
            value={modalData}
          />
        ) : (
          <></>
        )}
      </Modal>

      <Row>
        <Col span={14}>
          {httpData?.cookie ? (
            <Collapse
              style={{
                marginTop: "20px",
              }}
              collapsible="header"
              defaultActiveKey={["1"]}
              items={[
                {
                  key: "1",
                  label: "Cookie",
                  children: (
                    <Form form={formCookie}>
                      {
                        //
                        httpData?.cookie !== undefined ? ( //
                          Object.keys(httpData?.cookie).map((x) => {
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
                  ),
                },
              ]}
            />
          ) : (
            <></>
          )}

          {httpData?.header ? (
            <Collapse
              style={{
                marginTop: "20px",
              }}
              collapsible="header"
              defaultActiveKey={["1"]}
              items={[
                {
                  key: "1",
                  label: "Header",
                  children: (
                    <Form form={formHeader}>
                      {
                        //
                        httpData?.header !== undefined ? ( //
                          Object.keys(httpData?.header).map((x) => {
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
                  ),
                },
              ]}
            />
          ) : (
            <></>
          )}

          {httpData?.param ? (
            <Collapse
              style={{
                marginTop: "20px",
              }}
              collapsible="header"
              defaultActiveKey={["1"]}
              items={[
                {
                  key: "1",
                  label: "Params",
                  children: (
                    <Form form={formParam}>
                      {
                        //
                        httpData?.param !== undefined ? ( //
                          Object.keys(httpData?.param).map((x) => {
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
                  ),
                },
              ]}
            />
          ) : (
            <></>
          )}

          {httpData?.query ? (
            <Collapse
              style={{
                marginTop: "20px",
              }}
              collapsible="header"
              defaultActiveKey={["1"]}
              items={[
                {
                  key: "1",
                  label: "Query",
                  children: (
                    <Form form={formQuery}>
                      {
                        //
                        httpData?.query !== undefined ? ( //
                          Object.keys(httpData?.query).map((x) => {
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
                  ),
                },
              ]}
            />
          ) : (
            <></>
          )}

          <Form
            autoComplete="off"
            form={formBody}
            initialValues={jsonObject}
            labelWrap
          >
            {httpData?.body ? (
              <CardForm
                json={jsonBody}
                previousField={[]}
                extra={
                  <Space>
                    <Button
                      size="small"
                      onClick={onDisplayResult}
                    >
                      Display JSON Request
                    </Button>
                    <Button
                      size="small"
                      onClick={onClear}
                    >
                      Clear All value
                    </Button>
                    <Button
                      size="small"
                      onClick={onReset}
                    >
                      Set Default value
                    </Button>
                  </Space>
                }
              />
            ) : (
              <></>
            )}
          </Form>

          <Space style={{ marginTop: "10px", marginBottom: "20px" }}>
            <Button
              type="primary"
              onClick={submitForm}
            >
              Submit Form
            </Button>
          </Space>
        </Col>
        <Col span={10}>
          <Collapse
            style={{
              margin: "20px",
            }}
            collapsible="header"
            defaultActiveKey={["1"]}
            items={[
              {
                key: "1",
                label: "Response",
                children: (
                  <JsonView
                    collapsed={3}
                    displayDataTypes={false}
                    value={jsonResponse}
                  />
                ),
              },
            ]}
          />

          {/* <Card
            title="Response"
            style={{
              margin: "20px",
              border: "1px solid",
            }}
          >
            <JsonView
              collapsed={3}
              displayDataTypes={false}
              value={jsonResponse}
            />
          </Card> */}
        </Col>
      </Row>
    </>
  );
};

export default DynamicForm;

// autocomplete
// regex
// password (ada masking)
// textarea
// max min
// map
