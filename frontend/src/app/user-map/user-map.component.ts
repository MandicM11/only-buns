import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PostService } from '../services/post.service';  // Import PostService
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './user-map.component.html',
  styleUrls: ['./user-map.component.css']
})
export class UserMapComponent implements OnInit, AfterViewInit {
  map: L.Map | undefined;
  posts: any[] = [];
  latitude = 44.8176;  // Starting latitude (e.g., Belgrade)
  longitude = 20.4633; // Starting longitude (e.g., Belgrade)
  zoom = 13;  // Initial zoom level

  constructor(private postService: PostService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    // Initialize the map
    this.map = L.map('map').setView([this.latitude, this.longitude], this.zoom);

    // Add OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add marker for the user's initial location
    L.marker([this.latitude, this.longitude]).addTo(this.map)
      .bindPopup('Your location')
      .openPopup();

    // Load posts within a 1000 km radius
    this.loadPostsInRadius();

    // Add event handler for map move (if needed in the future)
    this.map.on('moveend', () => {
      const bounds = this.map!.getBounds();
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      
      // You could call a method to update posts in the new bounds if needed
      // Example: this.loadPostsInBounds(southWest.lat, southWest.lng, northEast.lat, northEast.lng);
    });
  }

  // Function to load posts within a 1000 km radius
  loadPostsInRadius(): void {
    this.postService.getPostsInRadius(this.latitude, this.longitude).subscribe(
      (posts) => {
        this.posts = posts;
        this.updateMapMarkers();
      },
      (error) => {
        console.error('Error loading posts:', error);
      }
    );
  }

  // Function to update map markers
  updateMapMarkers(): void {
    if (this.map) {
      // Remove existing markers
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          this.map?.removeLayer(layer);
        }
      });

      // Add new markers for each post
      this.posts.forEach((post) => {
        L.marker([post.location.lat, post.location.lng]).addTo(this.map!)
          .bindPopup(`<strong>Post:</strong> ${post.description}`);
      });

      // Add marker for the user's location
      L.marker([this.latitude, this.longitude]).addTo(this.map!)
        .bindPopup('Your location');
    }
  }
}
