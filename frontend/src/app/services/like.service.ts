import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = 'http://localhost:3000/likes';
  private postUrl = 'http://localhost:3000/posts'

  constructor(private http: HttpClient) {}

  addLike(likeData: any): Observable<any> {
    return this.http.post(this.apiUrl, likeData);
  }

  getLikesForPost(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${postId}`);
  }

  removeLike(likeData: { postId: number; userId: number }): Observable<any> {
    const params = { postId: likeData.postId.toString(), userId: likeData.userId.toString() };
    return this.http.delete(this.apiUrl, { params });
  }
  
}
