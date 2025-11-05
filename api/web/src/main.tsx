import "@axa-fr/design-system-slash-css/dist/common/common.scss";
import { createRoot } from "react-dom/client";
import ApiStateProvider from "./ApiStateProvider";
import createAppWrapperComponent from "./components/AppWrapper";
import "./index.scss";
import { enableMocks } from "./mocks/enableMocks";
import "./scss/grid.css";
import "./scss/reboot.css";

const container = document.getElementById("root");
const fetch = window.fetch.bind(window);

if (import.meta.env.VITE_ENABLE_MOCK === "true") {
  await enableMocks();
}

if (container) {
  const root = createRoot(container);
  const AppWrapper = createAppWrapperComponent(fetch);

  root.render(
    <ApiStateProvider fetch={fetch}>
      <AppWrapper />
    </ApiStateProvider>,
  );
}
