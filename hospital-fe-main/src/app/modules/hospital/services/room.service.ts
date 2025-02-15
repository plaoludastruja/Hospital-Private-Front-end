import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment } from '../model/appointment.model';
import { Doctor } from '../model/doctor.model';
import { Room } from '../model/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  apiHost: string = 'http://localhost:16177/';
  headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiHost + 'api/Room', {headers: this.headers});
  }

  getRoom(id: any): Observable<Room> {
    return this.http.get<Room>(this.apiHost + 'api/rooms/' + id, {headers: this.headers});
  }

  deleteRoom(id: any): Observable<any> {
    return this.http.delete<any>(this.apiHost + 'api/rooms/' + id, {headers: this.headers});
  }

  createRoom(room: any): Observable<any> {
    return this.http.post<any>(this.apiHost + 'api/rooms', room, {headers: this.headers});
  }

  updateRoom(room: any): Observable<any> {
    return this.http.put<any>(this.apiHost + 'api/rooms/' + room.id, room, {headers: this.headers});
  }

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiHost + 'api/Doctor', {headers: this.headers});
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiHost + 'api/Appointment', {headers: this.headers});
  }
}
