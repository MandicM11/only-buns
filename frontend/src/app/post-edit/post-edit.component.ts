import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PostService } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PostEditComponent implements OnInit {
  postId!: number;
  postDescription: string = '';
  postImage: string = '';  // Will hold base64 string of image
  latitude!: number;
  longitude!: number;
  imagePreview: string | null = null;  // For image preview
  createdPostImageUrl: string | null = null; // Variable to store image URL after post creation

  constructor(
    private postService: PostService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.postId = +params.get('id')!;
      this.fetchPostDetails();
    });
  }

  fetchPostDetails(): void {
    this.postService.getPostById(this.postId).subscribe((post) => {
      this.postDescription = post.description;
      this.latitude = post.location.lat;
      this.longitude = post.location.lng;
      this.createdPostImageUrl = `http://localhost:3000${post.image}`; // Assuming backend URL for images
    });
  }

  // Handle image selection and convert to base64
  onImageSelect(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.postImage = reader.result as string;  // Set postImage to base64 string
        this.imagePreview = reader.result as string;  // Set imagePreview for preview
      };
      reader.readAsDataURL(file);  // Convert the image file to a base64 string
    }
  }

  onSubmit(): void {
    if (!this.postDescription || !this.latitude || !this.longitude) {
      alert('Please complete all fields.');
      return;
    }

    // Format the location as a JSON object
    const location = {
      lat: this.latitude,
      lng: this.longitude
    };

    // Define the updated post object
    const updatedPost = {
      id: this.postId,
      description: this.postDescription,
      image: this.postImage || this.createdPostImageUrl,  // If no new image, keep the current one
      location: location,
      userId: this.authService.getUserId()
    };

    this.postService.updatePost(updatedPost).subscribe({
      next: (response) => {
        console.log('Post updated:', response);
        // Redirect to posts page
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        console.error('Error updating post:', error);
      }
    });
  }
}
