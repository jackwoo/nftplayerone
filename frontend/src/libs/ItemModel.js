import axios from 'axios';
const API_HOST = process.env.REACT_APP_API_URL

class ItemModel {
    async list(){
      return axios.get(API_HOST + "/item");
    }

    async create(data){
      return axios.post(API_HOST + "/item", data);
    }

    async retrieve(id, address = ""){
      if(address){
        return axios.get(API_HOST + "/item/" + id + "?address=" + address);
      } else {
        return axios.get(API_HOST + "/item/" + id);
      }
    }

    async listOwned(address){
      return axios.get(API_HOST + "/" + address + "/item");
    }

    async listing(data){
      return axios.post(API_HOST + "/listing", data);
    }

    async purchase(data){
      return axios.post(API_HOST + "/purchase", data);
    }

    async getFeatured(){
      return axios.get(API_HOST + "/item/featured");
    }

    async retrieveByToken(id){
      return axios.get(API_HOST + "/item/token/" + id);
    }

    async unlist(data){
      return axios.post(API_HOST + "/unlist", data);
    }
}

export default new ItemModel();
