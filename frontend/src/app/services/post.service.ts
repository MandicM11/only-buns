import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:3000/posts';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getPostById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPost(postData: any): Observable<any> {
    return this.http.post(this.apiUrl, postData);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updatePost(postData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${postData.id}`, postData);
  }

  getPosts(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(posts => {
        // Sort posts by createdAt field (ascending or descending)
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      })
    );
  }
  getPostsInBounds(
    lat: number,
    lng: number,
    zoom: number,
    southLat?: number,
    southLng?: number,
    northLat?: number,
    northLng?: number
  ): Observable<any[]> {
    // Ako neki parametri nisu prisutni, neće biti dodati u URL
    let url = `${this.apiUrl}/posts/nearby?lat=${lat}&lng=${lng}&zoom=${zoom}`;
  
    // Dodavanje optional parametara samo ako su prisutni
    if (southLat && southLng && northLat && northLng) {
      url += `&southLat=${southLat}&southLng=${southLng}&northLat=${northLat}&northLng=${northLng}`;
    }
  
    return this.http.get<any[]>(url);
  }
  

}
