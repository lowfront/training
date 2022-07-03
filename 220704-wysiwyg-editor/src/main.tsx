import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WysiwygEditor } from "./WysiwygEditor";

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )

const wysiwygEditor = new WysiwygEditor(document.getElementById("root")!);
