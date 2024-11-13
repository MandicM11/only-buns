import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; 

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
}
  getHeadersWithAuth(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  
  
    activateAccount(token: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/activate/${token}`, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      });
    }

  
  getUserData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getHeadersWithAuth() });
  }
  
}
