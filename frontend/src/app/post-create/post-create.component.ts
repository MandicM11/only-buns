import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-create',
  standalone: true,
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PostCreateComponent {
  postDescription: string = '';
  postImage: string = '';  // Will hold base64 string of image
  latitude!: number;
  longitude!: number;
  imagePreview: string | null = null;  // For image preview
  createdPostImageUrl: string | null = null; // Variable to store image URL after post creation

  constructor(private postService: PostService, private router: Router, private authService: AuthService) {}

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
    if (!this.postDescription || !this.postImage || !this.latitude || !this.longitude) {
      alert('Please complete all fields.');
      return;
    }

    // Format the location as a JSON object
    const location = {
      lat: this.latitude,
      lng: this.longitude
    };

    // Define the new post object with the base64 image data
    const newPost = {
      description: this.postDescription,
      image: this.postImage,  // Send base64 string of the image
      location: location,
      userId: this.authService.getUserId()
    };

    this.postService.createPost(newPost).subscribe({
      next: (response) => {
        console.log('Post created:', response);

      const backendUrl = 'http://localhost:3000'; // Backend server URL
      this.createdPostImageUrl = `${backendUrl}${response.image}`;  // This will use the backend URL for images

      console.log('Image URL:', this.createdPostImageUrl); 

        // Redirect to posts page
        this.router.navigate(['/posts']);  
      },
      error: (error) => {
        console.error('Error creating post:', error);
      }
    });
  }
}
