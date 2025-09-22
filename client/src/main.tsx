import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />,
  </React.StrictMode>,
);
