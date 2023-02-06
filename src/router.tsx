import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Settings from "./pages/Settings";
import Migrate from "./pages/Migrate";
import Finish from "./pages/Finish";
import Intro from "@/pages/Intro";
import Error from "@/pages/Error";

const Router = () => (
  <HashRouter>
    <Routes>
      <Route path={"/"} element={<Intro />} />
      <Route path={"settings"} element={<Settings />} />
      <Route path={"migrate"} element={<Migrate />} />
      <Route path={"finish"} element={<Finish />} />
      <Route path={"error"} element={<Error />} />
    </Routes>
  </HashRouter>
);

export default Router;
