import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private userUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(catchError(this.handleError));
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getUserId(): number | null {
    const token = this.getAuthToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token); // Decode the JWT token
        const isTokenExpired = decoded.exp * 1000 < Date.now(); // Check if token is expired
        if (isTokenExpired) {
          this.logout(); // Log the user out if the token has expired
          return null;
        }
        return decoded.userId; // Assuming the token contains a field 'userId'
      } catch (error) {
        console.error('Token decoding failed:', error);
        return null;
      }
    }
    return null;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login`, credentials, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(catchError(this.handleError));
  }

  getHeadersWithAuth(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  activateAccount(token: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/activate/${token}`, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(catchError(this.handleError));
  }

  getUserData(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/user`, { headers: this.getHeadersWithAuth() })
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error); // Return an observable with an error message
  }
  getUserById(userId: number): Observable<any> {
    return this.http
      .get(`${this.userUrl}/user/${userId}`, { headers: this.getHeadersWithAuth() })
      .pipe(catchError(this.handleError));
  }
}
