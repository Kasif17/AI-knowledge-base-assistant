import axiosClient from "../api/axiosClient";

export const getDashboardRequest = () =>
  axiosClient.get("/dashboard").then((res) => res.data);
