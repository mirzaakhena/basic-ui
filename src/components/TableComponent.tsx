import JsonView from "@uiw/react-json-view";
import { Button, Collapse, Form, Input, Modal, Space, message } from "antd";
import Table, { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { ColumnType, FilterValue } from "antd/es/table/interface";
import React, { useEffect, useState } from "react";
import { HTTPData } from "../data/data_type";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";

const baseUrl = "http://localhost:3000";

type Item = {
  id: string;
};

const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: Item[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
  },
};

interface TableParams {
  pagination?: TablePaginationConfig;
  filters?: Record<string, FilterValue>;
}

interface TableComponentProps {
  //
  userData: HTTPData | undefined;
  // setUserData: React.Dispatch<React.SetStateAction<HTTPData | undefined>>;
}

export const TableComponent = (props: TableComponentProps) => {
  //

  const [formHeader] = useForm();
  const [formParam] = useForm();
  const [formQuery] = useForm();
  const [formCookie] = useForm();
  // const [formBody] = useForm();

  const [modalData, setModalData] = useState<Item | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const [tableHeight, setTableHeight] = useState(540);

  const [items, setItems] = useState<Item[]>([]);

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: { current: 1, pageSize: 15 },
  });

  const handleCloseModal = () => {
    setModalData(null);
  };

  const columns = (field: any): ColumnsType<Item> => {
    const c: ColumnType<Item>[] = [
      {
        title: "ID",
        key: "id",
        dataIndex: "id",
        render: (item, allData) => {
          return (
            <>
              <CopyToClipboard
                text={item}
                onCopy={() => message.success(`copy id ${item}`)}
              >
                <CopyOutlined />
              </CopyToClipboard>
              <a onClick={() => setModalData(allData)}> {item}</a>
            </>
          );
        },
      },
    ];

    for (const key in field) {
      if (key === "id") {
        continue;
      }

      if (field[key].type === "object" || (field[key].type as string).startsWith("array")) {
        continue;
      }

      //
      c.push({
        title: key,
        dataIndex: key,
        key: key,
      });
    }

    return c;
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    //
    setTableParams({ pagination });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setItems([]);
    }
  };

  useEffect(() => {
    // Update table height when the window is resized
    const handleResize = () => {
      setTableHeight(window.innerHeight);
    };

    // Set initial height
    setTableHeight(window.innerHeight);

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const reload = async () => {
    if (!props.userData) {
      return;
    }

    try {
      let theHeaders = { "Content-Type": "application/json" };
      if (props.userData.header) {
        Object.keys(props.userData.header).forEach((param) => {
          const value = formHeader.getFieldValue(param);
          theHeaders = { ...theHeaders, [param]: value };
        });
      }

      let path = props.userData.path;
      if (props.userData.param) {
        Object.keys(props.userData.param).forEach((param) => {
          const value = formParam.getFieldValue(param);
          path = path.replace(`:${param}`, `${value}`); // TODO fix {${param}} later
        });
      }

      let theQueries = "";
      if (props.userData.query) {
        Object.keys(props.userData.query).forEach((param) => {
          // handle page and size manually
          if (param === "page" || param === "size") {
            return;
          }
          const value = formQuery.getFieldValue(param);
          theQueries = `${theQueries === "" ? "" : `${theQueries}&`}${param}=${value}`;
        });
      }

      const url = `${baseUrl}${path}?size=${tableParams.pagination?.pageSize}&page=${tableParams.pagination?.current}&${theQueries}`;
      const response = await fetch(url, {
        method: props.userData.method,
        headers: theHeaders,
      });
      const result = await response.json();

      // TODO concerning about the status code returned from the server which defined from the response
      response.status;

      setItems(result.items);

      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: result.count,
        },
      });

      // messageApi.info("data reloaded", 1); // TODO find out why reload called three times
    } catch (error: any) {
      messageApi.info(error.message, 1);
    }
  };

  useEffect(() => {
    reload();
  }, [JSON.stringify(tableParams), props.userData]);

  return (
    props.userData && (
      <div>
        <Modal
          title="Basic Modal"
          open={modalData !== null}
          onOk={handleCloseModal}
          onCancel={handleCloseModal}
        >
          <JsonView
            collapsed={3}
            displayDataTypes={false}
            value={modalData as Item}
          />
        </Modal>

        {contextHolder}

        {props.userData?.cookie ? (
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
                      props.userData?.cookie !== undefined ? ( //
                        Object.keys(props.userData?.cookie).map((x) => {
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

        {props.userData?.header ? (
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
                ),
              },
            ]}
          />
        ) : (
          <></>
        )}

        {props.userData?.param ? (
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
                ),
              },
            ]}
          />
        ) : (
          <></>
        )}

        {props.userData?.query ? (
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
                      props.userData?.query !== undefined ? ( //
                        Object.keys(props.userData?.query).map((x) => {
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

        <h2>{props.userData.description}</h2>
        <Space style={{ marginBottom: "10px" }}>
          <Button onClick={() => reload()}>Reload</Button>
          <Button>Header</Button>
          <Button>Param</Button>
          <Button>Query</Button>
        </Space>
        <Table
          size="small"
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          rowKey={(x) => x.id}
          columns={columns(props.userData.response![200].content.items.properties)}
          dataSource={items}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          scroll={{ y: tableHeight - 150, x: 50 }}
        />
      </div>
    )
  );
};
