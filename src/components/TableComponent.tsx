import JsonView from "@uiw/react-json-view";
import { Button, Modal, Space, message } from "antd";
import Table, { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { ColumnType, FilterValue } from "antd/es/table/interface";
import React, { useEffect, useState } from "react";
import { HTTPData } from "../data/data_type";

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
        render: (item, allData) => <a onClick={() => setModalData(allData)}>{item}</a>,
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
      const url = `${baseUrl}${props.userData.path}?size=${tableParams.pagination?.pageSize}&page=${tableParams.pagination?.current}`;
      const response = await fetch(url, {
        method: props.userData.method,
        headers: { "Content-Type": "application/json" },
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

        <h2>{props.userData.description}</h2>
        <Space style={{ marginBottom: "10px" }}>
          <Button
            size="small"
            onClick={() => reload()}
          >
            Reload
          </Button>
        </Space>
        <Table
          size="small"
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          rowKey={(x) => x.id}
          columns={columns(props.userData.response![200].items.properties)}
          dataSource={items}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          scroll={{ y: tableHeight - 150, x: 50 }}
        />
      </div>
    )
  );
};
