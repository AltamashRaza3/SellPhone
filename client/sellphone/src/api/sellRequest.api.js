import api from "../config/axios";
export const getMySellRequests = () =>
  api.get("/sell-requests/my");

export const submitUserDecision = (id, decision) =>
  api.put(`/sell-requests/${id}/user-decision`, { decision });