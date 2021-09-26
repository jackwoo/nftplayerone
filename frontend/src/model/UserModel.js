import axios from 'axios';
import axiosJwt from '../libs/axiosJwt';
import config from '../config/config';
import Cookies from 'universal-cookie';

const API_HOST = process.env.REACT_APP_API_URL;
const cookies = new Cookies();
const maxage = 2592000;
class UserModel {
    async connect(data){
      return axios.post(config["connect_api"], data);
    }

    async retrieve(address){
      return axios.get(API_HOST + "/" + address + "/user");
    }

    async activiy(address){
      return axios.get(API_HOST + "/" + address + "/creation");
    }

    async profile(){
      return axiosJwt.get(config["user_profile_api"]);
    }

    async updateProfile(data){
      return axiosJwt.post(config["user_profile_api"], data);
    }

    isLogin(){
      if(!this.retrieveToken()){
        window.localtion.replace("/");
      }
    }

    storeToken(token) {
      cookies.set("_nftplayeroneot", token, { maxAge: maxage });
    }

    destoryAll() {
      cookies.remove('_nftplayeroneot', { path: '/' });
    }
  
    retrieveToken() {
      return cookies.get("_nftplayeroneot");
    }
}

export default new UserModel();
