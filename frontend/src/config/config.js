const API_HOSTS = process.env.REACT_APP_API_URL + "/api";

//Authentication 
const connect_api = API_HOSTS + '/user/connect';
const user_profile_api = API_HOSTS + "/user/profile";

export default {
    API_HOSTS,
    connect_api,
    user_profile_api
}
