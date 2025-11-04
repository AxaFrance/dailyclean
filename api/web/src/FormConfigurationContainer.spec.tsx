import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FormConfigurationContainer from "./FormConfigurationContainer";
import { createMockFetch } from "./test-utils/mockResponse";

describe(`FormConfigurationContainer`, () => {
  it(`submit should save data with success`, async () => {
    const postCallback = vi.fn().mockImplementation((x: string) => x);
    const getCallback = vi.fn().mockImplementation(() => {
      return { cron_start: "0 7 * * 1-5", cron_stop: "0 17 * * *" };
    });
    const setConfigurationState = () => {
      // Mock function for test
    };

    const utils = render(
      <FormConfigurationContainer
        fetch={createMockFetch(200, getCallback, postCallback)}
        setConfigurationState={setConfigurationState}
      />,
    );

    await waitFor(() => expect(getCallback).toHaveBeenCalledTimes(1));

    const title = screen.queryByText("Configuration");
    expect(title).toBeTruthy();
    expect(screen.getByRole("button")).toHaveAttribute("disabled");

    const inputStart = utils.getByLabelText("Start hour");
    fireEvent.change(inputStart, { target: { value: "2" } });
    await waitFor(() =>
      expect(screen.getByRole("button")).not.toHaveAttribute("disabled"),
    );

    const inputEnd = utils.getByLabelText("End hour");
    fireEvent.change(inputEnd, { target: { value: "3" } });

    const fireSumbit = () => {
      const item = screen.getByText("Submit");
      fireEvent.click(item);
    };

    fireSumbit();
    await waitFor(() => screen.getByRole("alert"));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "SuccessSave done succesfully.",
    );
  });

  it(`submit should save data with error`, async () => {
    const postCallback = vi.fn().mockImplementation((x: string) => x);
    const getCallback = vi.fn().mockImplementation(() => {
      return { cron_start: "0 7 * * 1-5", cron_stop: "0 17 * * *" };
    });
    const setConfigurationState = () => {
      // Mock function for test
    };

    const utils = render(
      <FormConfigurationContainer
        fetch={createMockFetch(500, getCallback, postCallback)}
        setConfigurationState={setConfigurationState}
      />,
    );

    await waitFor(() => expect(getCallback).toHaveBeenCalledTimes(1));

    const title = screen.queryByText("Configuration");
    expect(title).toBeTruthy();
    expect(screen.getByRole("button")).toHaveAttribute("disabled");

    const inputStart = utils.getByLabelText("Start hour");
    fireEvent.change(inputStart, { target: { value: "2" } });

    const inputEnd = utils.getByLabelText("End hour");
    fireEvent.change(inputEnd, { target: { value: "3" } });

    await waitFor(() =>
      expect(screen.getByRole("button")).not.toHaveAttribute("disabled"),
    );

    const fireSumbit = () => {
      const item = screen.getByText("Submit");
      fireEvent.click(item);
    };

    fireSumbit();
    await waitFor(() => screen.getByRole("alert"));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "ErrorError occured, please contact your administrator.",
    );
  });
});
