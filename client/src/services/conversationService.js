import axiosClient from "../api/axiosClient";

export const askQuestionRequest = (documentId, question) =>
  axiosClient.post("/ask", { documentId, question }).then((res) => res.data);

export const getHistoryRequest = (params) =>
  axiosClient.get("/history", { params }).then((res) => res.data);
