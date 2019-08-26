import React, { FC } from "react";
import { Router } from "@reach/router";
import { Home } from "./Home";
import { Transfers } from "./Transfers";
import { Authenticated } from "./Authenticated";

export const App: FC = () => (
  <div>
    <Router>
      <Authenticated path="/">
        <Home path="/">
          <Transfers path="transfers"></Transfers>
        </Home>
      </Authenticated>
    </Router>
  </div>
);
