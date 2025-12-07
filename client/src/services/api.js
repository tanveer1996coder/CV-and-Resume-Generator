import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload/analyze`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const optimizeContent = async (section, content, jobDescription) => {
    const response = await axios.post(`${API_URL}/ai/optimize`, {
        section,
        content,
        jobDescription,
    });
    return response.data.optimizedContent;
};

export const analyzePhoto = async (imageBase64) => {
    const response = await axios.post(`${API_URL}/ai/analyze-photo`, { imageBase64 });
    return response.data;
};

export const getATSScore = async (resumeText, jobDescription) => {
    const response = await axios.post(`${API_URL}/ai/ats-score`, { resumeText, jobDescription });
    return response.data;
};
