import { Component, Input, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { PostService } from '../services/post.service';
import { AuthService } from '../services/auth.service';

// Fix za prikaz marker ikonica u Leaflet-u (Angular/TypeScript)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-user-location-map',
  templateUrl: './user-location-map.component.html',
  styleUrls: ['./user-location-map.component.css'],
  standalone: true
})
export class UserLocationMapComponent implements AfterViewInit {
  @Input() latitude!: number;
  @Input() longitude!: number;
  posts: any[] = [];
  radius: number = 5; // default radius in km
  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  constructor(private postService: PostService, private authService: AuthService) {}

  async ngAfterViewInit() {
    // Ako nisu prosleđene koordinate, pokušaj da ih dohvatiš iz profila korisnika
    if (this.latitude === undefined || this.longitude === undefined) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.authService.getUserById(userId).subscribe(user => {
          this.latitude = user.latitude;
          this.longitude = user.longitude;
          this.initMap();
        });
      } else {
        console.error('User not logged in or no location available');
      }
    } else {
      this.initMap();
    }
  }

  private initMap(): void {
    if (!this.map) {
      this.map = L.map('map').setView([this.latitude, this.longitude], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.map);
      this.loadNearbyPosts();
      this.map.on('moveend', () => {
        const center = this.map!.getCenter();
        this.latitude = center.lat;
        this.longitude = center.lng;
        this.loadNearbyPosts();
      });
    }
  }

  loadNearbyPosts(): void {
    // Očisti stare markere
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.postService.getPostsInRadius(this.latitude, this.longitude, this.radius).subscribe(posts => {
      this.posts = posts;
      posts.forEach(post => {
        if (post.location && post.location.lat && post.location.lng) {
          const marker = L.marker([post.location.lat, post.location.lng])
            .addTo(this.map!)
            .bindPopup(`<b>${post.description}</b><br>by ${post.user?.username || 'Unknown'}`);
          this.markers.push(marker);
        }
      });
    });
  }

  onRadiusChange(event: any): void {
    this.radius = event.target.value;
    this.loadNearbyPosts();
  }
}
