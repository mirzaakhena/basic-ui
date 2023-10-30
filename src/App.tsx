import React, { useEffect, useState } from "react";
import { Button, Layout, Menu } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { SelectInfo, SubMenuType } from "rc-menu/lib/interface";
import { TableComponent } from "./components/TableComponent";
// import { FormComponent } from "./components/FormComponent";
import { HTTPData } from "./data/data_type";
import DynamicForm from "./components/DynamicForm";

const baseUrl = "http://localhost:3000";

const { Header, Sider, Content } = Layout;

type UsecaseController = { tag: string; httpDatas: HTTPData[] };

export const App: React.FC = () => {
  //

  const [controllers, setControllers] = useState<UsecaseController[]>([]);

  const [items, setItems] = useState<SubMenuType[]>([]);

  const [collapsedState, setCollapsedState] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<HTTPData>();

  const toggle = () => {
    setCollapsedState(!collapsedState);
  };

  const renderContent = () => {
    // TODO fix later checking conditional
    if (selectedMenu?.usecase.toLocaleLowerCase().endsWith("getall")) {
      return (
        <TableComponent
          userData={selectedMenu}
          // setUserData={setSelectedMenu}
        />
      );
    }

    return (
      <DynamicForm httpData={selectedMenu} />
      // <FormComponent
      //   userData={selectedMenu}
      //   // setUserData={setSelectedMenu}
      // />
    );
  };

  const onSelectSidebar = (selectInfo: SelectInfo) => {
    const tags = controllers.find((c) => c.tag === selectInfo.keyPath[1]);
    if (!tags) {
      return;
    }

    const httpData = tags.httpDatas.find((x) => x.usecase === selectInfo.keyPath[0]);
    if (!httpData) {
      return;
    }

    setSelectedMenu(httpData);
  };

  const reload = async () => {
    const url = `${baseUrl}/controllers`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    setControllers(result);

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
            // onSelect={(x) => setSelectedMenu(x.key)}
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
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};
