import { createRoot } from "react-dom/client";
import "@axa-fr/react-toolkit-core/dist/assets/fonts/icons/af-icons.css";
import "@axa-fr/react-toolkit-core/src/common/scss/core.scss";
import "./scss/grid.css";
import "./scss/reboot.css";
import ApiStateProvider from "./ApiStateProvider";
import AppWrapper from "./components/AppWrapper";
import "./index.scss";
import { enableMocks } from "./mocks/enableMocks";

const container = document.getElementById("root");
const fetch = window.fetch.bind(window);

if (import.meta.env.VITE_ENABLE_MOCK === "true") {
  await enableMocks();
}

if (container) {
  const root = createRoot(container);
  root.render(
    <ApiStateProvider fetch={fetch}>
      <AppWrapper fetch={fetch} />
    </ApiStateProvider>,
  );
}
