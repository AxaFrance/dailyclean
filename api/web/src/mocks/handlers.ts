import { http, HttpResponse } from "msw";
import { urls } from "../api";
import {
  getMockState,
  setInProgress,
  startPods,
  stopPods,
  updateTimeranges,
} from "./mockState";

export const handlers = [
  http.get(urls.status, () => {
    const state = getMockState();
    return HttpResponse.json(state.apiData);
  }),

  http.get(urls.timeranges, () => {
    const state = getMockState();
    return HttpResponse.json(state.timeranges);
  }),

  http.post(urls.timeranges, async ({ request }) => {
    try {
      const body = (await request.json()) as {
        cron_start?: string;
        cron_stop?: string;
      };

      updateTimeranges(body);

      return HttpResponse.json({
        success: true,
        message: "Timeranges updated successfully",
        data: body,
      });
    } catch {
      return HttpResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }
  }),

  http.post(urls.podStart, () => {
    setInProgress("start");

    setTimeout(() => {
      startPods();
    }, 5000);

    return HttpResponse.json({
      success: true,
      message: "Pods start initiated",
    });
  }),

  http.post(urls.podStop, () => {
    setInProgress("stop");

    setTimeout(() => {
      stopPods();
    }, 5000);

    return HttpResponse.json({
      success: true,
      message: "Pods stop initiated",
    });
  }),
];
