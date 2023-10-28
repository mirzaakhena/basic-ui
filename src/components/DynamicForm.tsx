import { CloseOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, DatePicker, Form, FormInstance, Input, InputNumber, Row, Select, Space, Typography } from "antd";
import { useForm } from "antd/lib/form/Form";
import dayjs from "dayjs";
import dayjsPluginUTC from "dayjs/plugin/utc";
import React, { useEffect, useState } from "react";

dayjs.extend(dayjsPluginUTC);

const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";

export type BasicType = {
  default?: any;
  summary?: string;
  description?: string;
  required?: boolean;
};

export type EnumerableField = {
  type: "string" | "number" | "boolean" | "date";
  enum?: (string | boolean | number)[];
};

export type ObjectField = {
  type: "object";
  properties: Record<string, BasicType & (EnumerableField | ObjectField | ArrayField)>;
};

export type ArrayField = {
  type: "array";
  items: BasicType & (EnumerableField | ObjectField | ArrayField);
};

export type InputType = Record<string, BasicType & (EnumerableField | ObjectField | ArrayField)>;

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
      ) : (
        <Form.Item
          key={lastFieldName}
          label={lastFieldName}
          name={fieldNames}
          required={field.required}
        >
          <Input placeholder={field.summary} />
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
          <Form.Item label={lastFieldName}>
            <Form.List name={fieldNames}>
              {(fields, opt) => {
                return (
                  <>
                    {fields.map((xfield) => {
                      console.log(xfield.name);

                      return (
                        <Form.Item name={[xfield.name]}>
                          <CardForm
                            key={xfield.name}
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
                      // style={{ marginTop: "10px" }}
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

    if (field.type === "array") {
      if (field.items.default !== undefined) {
        defaultValueObject[fieldName] = field.items.default;
      }
    }
    if (field.type === "object") {
      defaultValueObject[fieldName] = generateDefaultValueJSON(field.properties);
      //
    } else if (field.default !== undefined) {
      if (field.type === "date") {
        defaultValueObject[fieldName] = dayjs.utc(field.default, dateTimeFormat);
      } else {
        defaultValueObject[fieldName] = field.default;
      }
    }
  }
  return defaultValueObject;
};

// const dataJSON2: InputType = {
//   name: { type: "string", default: "mirza", summary: "name of the user", required: true },
//   age: { type: "number", default: 27, summary: "age of the user" },
//   gender: { type: "string", enum: ["pria", "wanita"], required: true, default: "pria", summary: "jenis kelamin" },
//   birthDate: { type: "date", default: "2000-01-02 00:00:00" },
// };

const CardForm: React.FC<{ json: InputType; previousField: (string | number)[]; extra?: React.ReactNode }> = ({ json, previousField, extra }) => {
  //

  return (
    <>
      <Card
        style={{
          margin: previousField.length === 0 ? "20px" : "0px",
          borderWidth: "4px",
          borderColor: "gray",
        }}
        extra={extra}
      >
        {generateForm(json, previousField)}
      </Card>
    </>
  );
};

const DynamicForm: React.FC<{ json: InputType }> = ({ json }) => {
  //

  const [form] = useForm();

  const [jsonObject, setJSONObject] = useState(generateDefaultValueJSON(json));

  const onClear = () => {
    setJSONObject({});
  };

  const onReset = () => {
    setJSONObject(generateDefaultValueJSON(json));
  };

  useEffect(() => {
    form.resetFields();
  }, [jsonObject]);

  return (
    <Form
      autoComplete="off"
      form={form}
      initialValues={jsonObject}
    >
      <Row>
        <Col>
          <CardForm
            json={json}
            previousField={[]}
            extra={
              <Space>
                <Button onClick={onClear}>Clear All</Button>
                <Button onClick={onReset}>Reset All</Button>
              </Space>
            }
          />
        </Col>
        <Col>
          <Form.Item
            noStyle
            shouldUpdate
          >
            {() => (
              <Typography>
                <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
              </Typography>
            )}
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default DynamicForm;

// regex
// password (ada masking)
// textarea
// max min
// map

{
  /* <Typography>
<pre style={{ margin: "0px" }}>{JSON.stringify(jsonObject, null, 2)}</pre>
</Typography> */
}
