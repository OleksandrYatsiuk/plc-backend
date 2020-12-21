import { ApiHelperService } from './request-helper';
const rest = new ApiHelperService();
export function sendRequest() {
    setInterval(() => {
        console.log('push bot');
        rest.courseList();
    }, 29 * 60 * 1000);


}