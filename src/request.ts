import axios from 'axios';
export function sendRequest() {
    setInterval((() => {
        axios.get('https://lesson-backend.herokuapp.com/api/v1/courses')
        console.log('activate backend heroku ')
    }), 0.45 * 36000)

}