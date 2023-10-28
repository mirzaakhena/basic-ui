import DynamicForm, { InputType } from "./components/DynamicForm";

export const App: React.FC = () => {
  //

  const dataJSON: InputType = {
    name: { type: "string", default: "mirza", summary: "name of the user", required: true },
    age: { type: "number", default: 27, summary: "age of the user" },
    gender: { type: "string", enum: ["pria", "wanita"], required: true, default: "pria", summary: "jenis kelamin" },
    birthDate: { type: "date", default: "2000-01-02 00:00:00" },
    department: {
      type: "object",
      properties: {
        section: { type: "string", default: "the section" },
        joni: {
          type: "object",
          properties: {
            section: { type: "string", default: "the section" },
            position: { type: "string", default: "posisis" },
          },
        },
        position: { type: "string", default: "posisis" },
        department: {
          type: "object",
          properties: {
            section: { type: "string", default: "the section" },
            position: { type: "string", default: "posisis" },
          },
        },
      },
    },
    hobbies: {
      type: "array",
      items: {
        type: "string",
        default: ["berkuda", "tidur"],
        enum: ["memanah", "berkuda", "berenang"],
      },
    },
    favoriteNumber: {
      type: "array",
      items: {
        type: "number",
        default: ["2"],
        enum: ["12", "55", "8"],
      },
    },
    addresses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kota: {
            type: "string",
          },
          kecamatan: {
            type: "string",
          },
          kelurahan: {
            type: "string",
          },
        },
      },
    },
  };

  return <DynamicForm json={dataJSON} />;
};

export default App;
