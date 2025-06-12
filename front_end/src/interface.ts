export interface User {
  id: number;
  username: string;
  role: string;
}

export interface UserState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface UserData{
  username: string;
  password: string;
  role: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  message?: string;
  timestamp?: string;
}

// API错误接口定义
export interface ApiError {
  message: string;        // 错误消息
  status?: number;        // HTTP状态码
  data?: any;             // eslint-disable-line @typescript-eslint/no-explicit-any
  // 服务器返回的原始错误数据
}

export interface Elevator {
  id: number;
  name: string;
  location: string;
  status: string;
  lastmaintenance: string;
}

export interface SensorData {
  id:number;
  type: string;
  value: number;
  is_abnormal: boolean;
  timestamp: string;
}
