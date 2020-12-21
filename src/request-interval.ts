import axios from 'axios';
export function sendRequest() {
    setInterval(() => {
        console.log('push bot');
        axios.get('https://api-plc.herokuapp.com/api/v1/courses');
    }, 29 * 60 * 1000);


}