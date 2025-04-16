import axios from 'axios';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL;


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  const token = authStorage ? JSON.parse(authStorage).state.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  role: string;
  user: User;
  message: string;
}

export const api = {
  auth: {
    login: (credentials: LoginCredentials) =>
      apiClient.post<LoginResponse>('/auth/login', credentials).then((res) => res.data),
    getCurrentUser: () => 
      apiClient.get<User>('/auth/me').then((res) => res.data),
    logout: () => 
      apiClient.post('/logout').then((res) => res.data),
  },
  users: {
    getAll: () => 
      apiClient.get<User[]>('/users').then((res) => res.data),
    getById: (id: string) => 
      apiClient.get<User>(`/users/${id}`).then((res) => res.data),
    update: (id: string, data: Partial<User>) => 
      apiClient.put<User>(`/users/${id}`, data).then((res) => res.data),
    create: (data: Partial<User>) =>
      apiClient.post<{ message: string; userId: string }>('/users/create', data).then((res) => res.data),
  },
  message: {
    getNotices: (role: string) => 
      apiClient.get(`/message/notices?role=${role}`).then((res) => res.data),
  },
  student: {
    uploadDocuments: (formData: FormData) => {
      return apiClient
        .post('/student/upload-documents', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },
    getUploadedDocuments: (studentId: string) =>
      apiClient.get(`/student/${studentId}/documents`).then((res) => res.data),
    submitComplaint: (data: { studentId: string; complaint: string }) =>
      apiClient.post('/student/complaints', data).then((res) => res.data),
    submitRoomChangeRequest: (data: { studentId: string; reason: string; currentRoom: string; desiredRoom: string }) =>
      apiClient.post('/student/room-change-request', data).then((res) => res.data),
  },
  admin: {
    addFloor: (data: { name: string }) =>
      apiClient.post('/admin/floor', data).then((res) => res.data),
    addRoom: (data: { name: string; floorId?: string; floorName?: string; capacity: number }) =>
      apiClient.post('/admin/room', data).then((res) => res.data),
    checkRoomAssigned: (roomId: string) =>
      apiClient.get(`/admin/room/assigned/${roomId}`).then((res) => res.data),
    assignStudent: (data: { roomId: string; studentName: string; studentEmail: string }) =>
      apiClient.post('/admin/room/assign', data).then((res) => res.data),
    getFloors: () =>
      apiClient.get('/admin/floors').then((res) => res.data),
    getStudentDocuments: () =>
      apiClient.get("/admin/student-documents").then((res) => res.data),
    verifyDocument: (data: { documentId: string; status: string }) =>
      apiClient.post("/admin/verify-document", data).then((res) => res.data),
    getAllComplaints: () =>
      apiClient.get('/admin/complaints').then((res) => res.data),
    getAllRoomChangeRequests: () =>
      apiClient.get('/admin/room-change-requests').then((res) => res.data),
    updateRoomChangeRequestStatus: (data: { requestId: string; status: string; alternateRoom?: string }) =>
      apiClient.put('/admin/room-change-request/status', data).then((res) => res.data),
    sendNotice: (formData: FormData) => {
      return apiClient
        .post('/admin/notices', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },
  },
};

export const useLogin = () => {
  return useMutation({
    mutationFn: api.auth.login,
  });
};

export const useCurrentUser = (options?: UseQueryOptions<User>) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: api.auth.getCurrentUser,
    ...options,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: api.users.getAll,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.users.getById(id),
    enabled: !!id,
  });
};