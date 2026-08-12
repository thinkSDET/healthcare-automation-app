/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Outlet } from "react-router-dom";

import AppHeader from "./AppHeader";

function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-shell-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
