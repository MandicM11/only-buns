import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/comments';

  constructor(private http: HttpClient) {}

  addComment(commentData: any): Observable<any> {
    console.log('commnet data: ', commentData);
    return this.http.post(this.apiUrl, commentData);
  }
}
