import { DeviceInfo, SaveDeviceInfo } from "@/types/device";
import axios from "axios";
import { API_BASE_URL, API_DEVICE_ADD_URL, API_DEVICE_ALL_URL, API_DEVICE_DELETE_URL, API_DEVICE_INFO_URL, API_DEVICE_UPDATE_URL } from "@/constants/apiConstants";

export const getDevices = async (): Promise<SaveDeviceInfo[]> => {
    const response = await axios.get(`${API_BASE_URL}${API_DEVICE_ALL_URL}`);
    return response.data;
}

export const addDevice = async (device: DeviceInfo): Promise<SaveDeviceInfo> => {
    const response = await axios.post(`${API_BASE_URL}${API_DEVICE_ADD_URL}`, device);
    return response.data;
}

export const updateDevice = async (device: DeviceInfo): Promise<DeviceInfo> => {
    const response = await axios.put(`${API_BASE_URL}${API_DEVICE_UPDATE_URL}`, device);
    return response.data;
}

export const deleteDevice = async (id: string): Promise<void> => {
    const response = await axios.delete(`${API_BASE_URL}${API_DEVICE_DELETE_URL}/${id}`);
    return response.data;
}

export const getDeviceInfo = async (id: string): Promise<DeviceInfo> => {
    const response = await axios.get(`${API_BASE_URL}${API_DEVICE_INFO_URL}/${id}`);
    return response.data;
}

export const deleteAllDevices = async (): Promise<void> => {
    const response = await axios.delete(`${API_BASE_URL}${API_DEVICE_ALL_URL}`);
    return response.data;
}

