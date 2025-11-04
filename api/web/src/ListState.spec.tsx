import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { apiConfigurationDefault } from "./ApiConfigurationProvider";
import { ListState } from "./ListState";

import { describe, expect, it } from "vitest";
import mockStarted, {
  mockStateInProgress,
  mockStateOff,
} from "./ListState.mock";

describe(`ListState should`, () => {
  it(`be environment Started`, () => {
    render(
      <ListState
        apiState={mockStarted}
        apiConfigurationState={apiConfigurationDefault}
        priceByMonth={0}
        locale="FR-fr"
      />,
    );
    const textLoader = screen.queryByText("ri-classify");
    expect(textLoader).toBeTruthy();
    const testStarted = screen.queryByText("Started");
    expect(testStarted).toBeTruthy();
  });

  it(`be environment Stopped`, () => {
    render(
      <ListState
        apiState={mockStateOff}
        apiConfigurationState={apiConfigurationDefault}
        priceByMonth={0}
        locale="FR-fr"
      />,
    );
    const textLoader = screen.queryByText("alertmanager");
    expect(textLoader).toBeTruthy();
    const testStarted = screen.queryByText("Stopped");
    expect(testStarted).toBeTruthy();
  });

  it(`be environment In Progress`, () => {
    render(
      <ListState
        apiState={mockStateInProgress}
        apiConfigurationState={apiConfigurationDefault}
        priceByMonth={0}
        locale="FR-fr"
      />,
    );
    const textLoader = screen.queryByText("alertmanager");
    expect(textLoader).toBeTruthy();
    const testStarted = screen.queryByText("In progress");
    expect(testStarted).toBeTruthy();
  });
});
