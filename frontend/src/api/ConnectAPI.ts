import { API_BASE_URL, API_DEVICE_CONNECT_URL } from "@/constants/apiConstants";
import { DeviceInfo, DeviceConnectResult } from "@/types/device";
import axios from "axios";

export const connectTest = async (type: string, config: any): Promise<DeviceConnectResult> => {
    const response = await axios.post(`${API_BASE_URL}${API_DEVICE_CONNECT_URL}`, { type, config });
    return response.data;
}

