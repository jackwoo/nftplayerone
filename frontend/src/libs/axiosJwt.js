import axios from 'axios';
import UserModel from '../model/UserModel';

const axiosJwt = () => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  };

  // Create instance
  let instance = axios.create(defaultOptions);

  // Set the AUTH token for any request
  instance.interceptors.request.use(function (config) {
    const token = UserModel.retrieveToken();
    config.headers.Authorization =  token ? `Bearer ${token}` : '';
    return config;
  });

  instance.interceptors.response.use(function (response) {
    return response;

  }, function (error) {
    return Promise.reject(error);
  });

  return instance;
};

export default axiosJwt();
