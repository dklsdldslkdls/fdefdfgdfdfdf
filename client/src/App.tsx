import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import SideBar from "./components/SideBar";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppWrapper } from "./hooks/AppProvider";
import { useAppManager } from "./hooks/useAppManager";
import ChatPage from "./components/ChatPage";

function App() {
  invoke("show_main_window");

  return (
    <AppWrapper>
      <SidebarProvider>
        <SideBar />
        {/*<div className="bg-background p-3 flex-1">ciao</div>*/}
        <ChatPage />
      </SidebarProvider>
    </AppWrapper>
  );
}

export default App;
