import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {jwtDecode} from 'jwt-decode';



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

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');  // Retrieve the authToken from localStorage
  }
  setUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }

  // Retrieve the user ID from localStorage
  getUserId(): number | null {
    const token = this.getAuthToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);  // Decode the JWT token
        return decoded.userId;  // Assuming the token contains a field 'userId'
      } catch (error) {
        console.error('Token decoding failed:', error);
        return null;  // Return null if the decoding fails
      }
    }
    return null;  // Return null if the token doesn't exist
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
