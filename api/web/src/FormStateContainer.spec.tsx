import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormStateContainer from "./FormStateContainer";
import { createMockFetch } from "./test-utils/mockResponse";
import { ApiData } from "./types/api";

const fetch = (status = 200) => {
  return createMockFetch(status, () => ({}));
};

const initialData: ApiData = {
  state: "STOPPED",
  namespace: "",
  workloads: [],
};

describe(`FormStateContainer`, () => {
  it(`submit should save data with success`, async () => {
    render(
      <FormStateContainer
        fetch={fetch(200)}
        workloads={initialData.workloads}
      />,
    );
    const textLoader = screen.queryByText("State");

    expect(textLoader).toBeTruthy();
    expect(screen.getByRole("button")).toHaveAttribute("disabled");

    const item = screen.getByText("off");
    fireEvent.click(item);
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");

    const fireSumbit = () => {
      const item = screen.getByText("Submit");
      fireEvent.click(item);
    };

    fireSumbit();
    await waitFor(() => screen.getByRole("alert"));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "SuccessSave done succesfully.",
    );
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });

  it(`submit should fail`, async () => {
    render(
      <FormStateContainer
        fetch={fetch(500)}
        workloads={initialData.workloads}
      />,
    );
    const textLoader = screen.queryByText("State");
    expect(textLoader).toBeTruthy();
    expect(screen.getByRole("button")).toHaveAttribute("disabled");

    const item = screen.getByText("off");
    fireEvent.click(item);
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");

    const fireSumbit = () => {
      const item = screen.getByText("Submit");
      fireEvent.click(item);
    };

    fireSumbit();
    await waitFor(() => screen.getByRole("alert"));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "ErrorError occured, please contact your administrator.",
    );
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
  });
});
