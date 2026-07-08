import axiosClient from "../api/axiosClient";

export const uploadDocumentRequest = (file, title, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  return axiosClient
    .post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    })
    .then((res) => res.data);
};

export const listDocumentsRequest = (params) =>
  axiosClient.get("/documents", { params }).then((res) => res.data);

export const searchDocumentsRequest = (params) =>
  axiosClient.get("/documents/search", { params }).then((res) => res.data);

export const getDocumentRequest = (id) =>
  axiosClient.get(`/documents/${id}`).then((res) => res.data);

export const deleteDocumentRequest = (id) =>
  axiosClient.delete(`/documents/${id}`).then((res) => res.data);
