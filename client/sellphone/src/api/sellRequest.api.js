import axios from "axios";

export const getMySellRequests = () =>
  axios.get("/api/sell-requests/my", { withCredentials: true });

export const submitUserDecision = (id, decision) =>
  axios.put(
    `/api/sell-requests/${id}/user-decision`,
    { decision },
    { withCredentials: true }
  );
