import axios from 'axios';
export function sendRequest() {
    return axios.get('https://api-plc.herokuapp.com/api/v1/courses')

}