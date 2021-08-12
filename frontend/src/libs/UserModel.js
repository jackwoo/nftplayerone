import axios from 'axios';
const API_HOST = process.env.REACT_APP_API_URL

class UserModel {
    async connect(data){
      return axios.post(API_HOST + '/connect', data);
    }

    async retrieve(address){
      return axios.get(API_HOST + "/" + address + "/user");
    }
}

export default new UserModel();
