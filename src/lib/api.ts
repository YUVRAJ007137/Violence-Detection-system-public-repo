import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000'; // Replace with your actual Flask API URL

export const api = {
  async registerCamera(userId: string, cameraId: string, cameraUrl: string) {
    try {
      const response = await axios.post(`${API_URL}/registerCamera`, {
        user_id: userId,
        camera_id: cameraId,
        camera_url: cameraUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error registering camera:', error);
      throw error;
    }
  },

  async deleteCamera(cameraUrl: String) {
    try {
      const response = await axios.post(`${API_URL}/deleteCamera`, {
        cameraUrl: cameraUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting camera:', error);
      throw error;
    }
  },

  async registerVideo(videoUrl: string) {
    try {
      const response = await axios.post(`${API_URL}/registerVideo`, {
        video_url: videoUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error registering video:', error);
      throw error;
    }
  },

  async update_detection_status(detectionStatus: string, camera_id: string|undefined){
    try {
      const newStatus = detectionStatus === 'stopped' ? 'started' : 'stopped';
  
      // Send API request to update detection status
      const response = await axios.post(`${API_URL}/update_detection_status`, {
        cameraId: camera_id, 
        detectionStatus: newStatus
        });
  
      return response.data;
     
    } catch (error) {
      console.error('Error updating detection status',error);
    }
  }
};

