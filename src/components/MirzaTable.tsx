import { Button, Modal, Tabs, Tag, message, Space } from "antd";
import Table, { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { FilterValue } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import { formatDateWithSecond } from "../utility/date";
import JsonView from "@uiw/react-json-view";

type RequestType = "command" | "query";

type ItemType = {
  id: string;
  funcName: string;
  date: Date;
  requestType: RequestType;
  error: string;
  description: string;
  input: any;
  output: any;
  functions: [];
};

// const baseUrl = "https://eproc.kangservice.cloud/api";
const baseUrl = "http://localhost:3000";
// const baseUrl = "https://eproc-stg.hcml.co.id";

const collapsedJSONLevel = 2;

const MirzaTable = () => {
  //

  const [messageApi, contextHolder] = message.useMessage();

  const [modalData, setModalData] = useState<ItemType | null>(null);

  const showModal = async (data: ItemType) => {
    const url = `${baseUrl}/recording/record/${data.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();

    setModalData(result);
  };

  const handleOk = () => {
    setModalData(null);
  };

  const handleCancel = () => {
    setModalData(null);
  };

  const columns: ColumnsType<ItemType> = [
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          <Button onClick={() => showModal(item)}>Detail</Button>
        </>
      ),
      width: 100,
      // fixed: "left",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <pre>{text}</pre>,
      width: 160,
      // fixed: "left",
    },
    {
      title: "FuncName",
      dataIndex: "funcName",
      key: "funcName",
      width: 240,
      render: (text, item) => (
        <>
          <Tag color={item.requestType === "query" ? "blue" : "red"}>{item.requestType}</Tag> {text}
        </>
      ),
      // fixed: "left",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      // width: 40,
      // render: (text) => <a>{text}</a>,
    },
    {
      title: "Error Message",
      dataIndex: "error",
      key: "error",
      // width: 40,
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      // width: 30,
      render: (a: Date) => <>{formatDateWithSecond(a)}</>,
    },
  ];

  const reload = async () => {
    //

    try {
      const url = `${baseUrl}/recording/record?size=${tableParams.pagination?.pageSize}&page=${tableParams.pagination?.current}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      setItems(result.items);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: result.count,
        },
      });

      //
    } catch (err) {
      messageApi.error((err as Error).message, 1);
    }
  };

  interface TableParams {
    pagination?: TablePaginationConfig;
    filters?: Record<string, FilterValue>;
  }

  const [items, setItems] = useState<ItemType[]>([]);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  // TABLE PARAM CHANGES
  const handleTableChange = (pagination: TablePaginationConfig) => {
    //
    setTableParams({ pagination });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setItems([]);
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: ItemType[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
    },
    // getCheckboxProps: (record: ItemType) => ({
    //   disabled: record.name.toLowerCase().endsWith("a"), // Column configuration not to be checked
    //   name: record.name,
    // }),
  };

  useEffect(() => {
    reload();
  }, [JSON.stringify(tableParams)]);

  const [tableHeight, setTableHeight] = useState(540);

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

  const statusRecording = async () => {
    const url = `${baseUrl}/recording/status`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();

    messageApi.info(JSON.stringify(result.status));
  };

  const enableRecording = async () => {
    const url = `${baseUrl}/recording/status`;

    try {
      let recordingStatus = false;
      {
        const url = `${baseUrl}/recording/status`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        console.log(result);

        recordingStatus = result.status;
      }

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ status: recordingStatus ? "disabled" : "enabled" }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      messageApi.info(result.message);
      //
    } catch (error) {
      //
    }
  };

  return (
    <div>
      <Modal
        title={modalData ? `${modalData.funcName} [${modalData.id}] ` : ""}
        width={600}
        open={modalData !== null}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {modalData ? (
          <Tabs
            defaultActiveKey="input"
            items={[
              {
                key: "input",
                label: "Primary Input",
                children: (
                  <>
                    {modalData?.input ? (
                      <JsonView
                        collapsed={collapsedJSONLevel}
                        displayDataTypes={false}
                        value={modalData.input}
                      />
                    ) : (
                      ""
                    )}
                  </>
                ),
              },
              {
                key: "output",
                label: "Primary Output",
                children: (
                  <>
                    {modalData?.output ? (
                      <JsonView
                        collapsed={collapsedJSONLevel}
                        displayDataTypes={false}
                        value={modalData.output}
                      />
                    ) : (
                      ""
                    )}
                  </>
                ),
              },
              {
                key: "functions",
                label: "Functions",
                children: (
                  <>
                    {modalData ? (
                      <Tabs
                        tabPosition="left"
                        items={modalData.functions.map((x: any, i) => {
                          const id = String(i + 1);
                          return {
                            label: `[${x.requestType}] ${x.funcName}`,
                            key: id,
                            children: (
                              <Tabs
                                items={[
                                  {
                                    label: "Secondary Input",
                                    key: "input",
                                    children: x.input ? (
                                      <JsonView
                                        collapsed={collapsedJSONLevel}
                                        displayDataTypes={false}
                                        value={x.input}
                                      />
                                    ) : (
                                      <></>
                                    ),
                                  },
                                  {
                                    label: "Secondary Output",
                                    key: "output",
                                    children: x.output ? (
                                      <JsonView
                                        collapsed={collapsedJSONLevel}
                                        displayDataTypes={false}
                                        value={x.output}
                                      />
                                    ) : (
                                      <></>
                                    ),
                                  },
                                ]}
                              />
                            ),
                          };
                        })}
                      />
                    ) : (
                      ""
                    )}
                  </>
                ),
              },
            ]}
          />
        ) : (
          <></>
        )}
      </Modal>
      {contextHolder}
      <Space>
        <Button onClick={reload}>Reload</Button>
        <Button onClick={enableRecording}>Toggle Recording</Button>
        <Button onClick={statusRecording}>Status Recording</Button>
      </Space>
      <Table
        size="small"
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
        rowKey={(x) => x.id}
        columns={columns}
        dataSource={items}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        scroll={{ y: tableHeight - 150, x: 1500 }}
      />
    </div>
  );
};

export default MirzaTable;

// Table
// Colums
// Items
// Reload Button
// First Time Auto Reload
// Paging and Size
// Details Button in each Items
// Checkbox in each Items
