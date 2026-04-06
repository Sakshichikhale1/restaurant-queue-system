import axios from "axios";
import { io } from "socket.io-client";

// Base URL (from .env or fallback to current origin)
const BASE = import.meta.env.VITE_API_URL;

// Axios instance
export const api = axios.create({
  baseURL: BASE + "/api",
  timeout: 10000,
});

// Socket.IO connection
export const socket = io(BASE, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
});

// -------- API HELPERS -------- //

export const getTables = () => api.get("/tables");

export const getBookings = (status) =>
  api.get("/bookings", {
    params: status ? { status } : {},
  });

export const createBooking = (data) =>
  api.post("/bookings", data);

export const assignTable = (bookingId, tableId) =>
  api.post(`/bookings/${bookingId}/assign`, {
    table_id: tableId,
  });

export const checkout = (bookingId) =>
  api.post(`/bookings/${bookingId}/checkout`);

export const freeTable = (tableId) =>
  api.post(`/tables/${tableId}/free`);

export const notify = (bookingId) =>
  api.post(`/bookings/${bookingId}/notify`);

export const getStats = () =>
  api.get("/stats");

export const getSmsLog = () =>
  api.get("/sms_log");