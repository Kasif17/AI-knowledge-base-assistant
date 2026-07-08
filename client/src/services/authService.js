import axiosClient from "../api/axiosClient";

export const registerRequest = (payload) =>
  axiosClient.post("/auth/register", payload).then((res) => res.data);

export const loginRequest = (payload) =>
  axiosClient.post("/auth/login", payload).then((res) => res.data);

export const logoutRequest = () =>
  axiosClient.post("/auth/logout").then((res) => res.data);

export const getCurrentUserRequest = () =>
  axiosClient.get("/auth/me").then((res) => res.data);
