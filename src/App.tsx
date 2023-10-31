import React, { useEffect, useState } from "react";
import { Button, Layout, Menu } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { SelectInfo, SubMenuType } from "rc-menu/lib/interface";
import { TableComponent } from "./components/TableComponent";
import { HTTPData } from "./data/data_type";
import DynamicForm from "./components/DynamicForm";

const baseUrl = "http://localhost:3000";

const { Header, Sider, Content } = Layout;

export const App: React.FC = () => {
  //

  const [usecaseComp, setUsecaseComp] = useState<TransformedJson>();

  const [items, setItems] = useState<SubMenuType[]>([]);

  const [collapsedState, setCollapsedState] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<React.ReactNode>();

  const toggle = () => {
    setCollapsedState(!collapsedState);
  };

  const onSelectSidebar = (selectInfo: SelectInfo) => {
    setSelectedMenu(usecaseComp![selectInfo.keyPath[0]]);
  };

  const reload = async () => {
    //
    const url = `${baseUrl}/controllers`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    setUsecaseComp(transformJson(result));

    setItems(
      result.map((x: any) => {
        return {
          key: x.tag,
          label: x.tag,
          children: x.httpDatas.map((y: any) => {
            return {
              key: y.usecase,
              label: y.usecase,
            };
          }),
        };
      })
    );
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <Layout className="site-layout">
      <Header
        className="site-layout-background"
        style={{
          padding: 0,
          position: "fixed", // Tambahkan properti position: fixed
          width: "100%", // Pastikan header memenuhi lebar layar
          zIndex: 1000, // Atur zIndex agar header tampil di atas konten
        }}
      >
        <Button
          style={{ marginLeft: "20px" }}
          icon={collapsedState ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggle}
        />
        {React.createElement(collapsedState ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: "trigger",
          onClick: toggle,
        })}
      </Header>
      <Layout
        style={{
          minHeight: "calc(100vh - 64px)",
          marginTop: 64,
        }}
      >
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsedState}
          style={{
            position: "fixed", // Tambahkan properti position: fixed
            height: "calc(100% - 64px)", // Pastikan sidebar memenuhi tinggi layar
            zIndex: 1000, // Atur zIndex agar sidebar tampil di atas konten
            overflowY: "auto",
          }}
        >
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            onSelect={onSelectSidebar}
            items={items}
            key={items.length}
          />
        </Sider>
        <Content
          className="site-layout-background"
          style={{
            paddingLeft: collapsedState ? 100 : 220,
            marginRight: "20px",
            // backgroundColor: "GrayText",
            // border: "2px solid",
            // borderColor: "blue",
            // position: "fixed",
            // overflowY: "auto", // enable vertical scrolling
          }}
        >
          {selectedMenu}
        </Content>
      </Layout>
    </Layout>
  );
};

type OriginalJson = {
  tag: string;
  httpDatas: HTTPData[];
};

type TransformedJson = Record<string, React.ReactNode>;

function transformJson(originalJson: OriginalJson[]): TransformedJson {
  const transformedJson: TransformedJson = {};

  originalJson.forEach((item) => {
    item.httpDatas.forEach((httpData) => {
      const isGetAllPrefix = httpData.usecase.toLocaleLowerCase().endsWith("getall");
      transformedJson[httpData.usecase] = isGetAllPrefix ? <TableComponent userData={httpData} /> : <DynamicForm httpData={httpData} />;
    });
  });

  return transformedJson;
}
