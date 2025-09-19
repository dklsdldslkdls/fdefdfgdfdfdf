import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import SideBar from "./components/SideBar";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppWrapper } from "./hooks/AppProvider";
import { useAppManager } from "./hooks/useAppManager";
import ChatPage from "./components/ChatPage";
import { MessagesProvider } from "./hooks/MessagesProvider";

function App() {
  invoke("show_main_window");

  return (
    <AppWrapper>
      <MessagesProvider>
        <SidebarProvider>
          <SideBar />
          <ChatPage />
        </SidebarProvider>
      </MessagesProvider>
    </AppWrapper>
  );
}

export default App;
