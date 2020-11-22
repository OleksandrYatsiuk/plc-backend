import axios from 'axios';
import { Course, CustomMessage, Lesson, User } from 'interfaces';
import {urls} from './storage/url';

export class ApiHelperService {
    private _apiUrl = urls.local.backend;
    constructor(link?: string) {
        this._apiUrl = link;
    }

    public updateUser(data: Partial<User>): Promise<any> {
        return axios.patch(`${this._apiUrl}/users/current`, data)
    }

    public courseList(): Promise<Course[]> {
        return axios.get(`${this._apiUrl}/courses`).then(response => response.data.result)
    }
    public lessonList(params: Partial<Lesson>): Promise<Lesson[]> {
        return axios.get(`${this._apiUrl}/lessons`, { params }).then(response => response.data.result);
    }
    public lessonDetail(id: Lesson['id']): Promise<Lesson> {
        return axios.get(`${this._apiUrl}/lessons/${id}`).then(response => response.data.result);
    }
    public sendMessage(body: CustomMessage): Promise<CustomMessage> {
        return axios.post(`${this._apiUrl}/messages`, body).then(response => response.data.result)
    }


}