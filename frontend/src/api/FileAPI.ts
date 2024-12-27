import axios from 'axios';
import { API_BASE_URL, FILE_ENDPOINT } from '../constants/apiConstants';
export async function uploadFiles(files: File[], directory: string) {
    const formData = new FormData();
    formData.append('directory', directory);
    files.forEach(file => {
        const encodedFilename = encodeURIComponent(file.name);
        formData.append('files', file, encodedFilename);
    });
    const response = await axios.post(`${API_BASE_URL}${FILE_ENDPOINT}/upload/`, formData);
    return response.data;
}

export async function getFiles(filepath: string) {
    const response = await axios.get(`${API_BASE_URL}${FILE_ENDPOINT}/${filepath}`);
    return response.data;
}

export async function deleteFile(filepath: string) {
    const response = await axios.delete(`${API_BASE_URL}${FILE_ENDPOINT}/${filepath}`);
    return response.data;
}

export async function updateFile(filepath: string, file: File) {
    const response = await axios.put(`${API_BASE_URL}${FILE_ENDPOINT}/${filepath}`, file);
    return response.data;
}

