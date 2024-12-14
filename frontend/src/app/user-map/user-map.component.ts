import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PostService } from '../services/post.service';  // Uvoz servisa za postove
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  map: L.Map | undefined;
  posts: any[] = [];
  latitude = 44.8176;  // Početna širina (npr. Beograd)
  longitude = 20.4633; // Početna dužina (npr. Beograd)
  zoom = 13;  // Početni nivo zoom-a

  constructor(private postService: PostService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map('map').setView([this.latitude, this.longitude], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Dodavanje markera za početnu lokaciju korisnika
    L.marker([this.latitude, this.longitude]).addTo(this.map)
      .bindPopup('Korisnička lokacija')
      .openPopup();

    // Pozivanje funkcije za učitavanje postova u početnom radijusu
    this.loadNearbyPosts();

    // Dodavanje event handler-a za pomeranje mape
    this.map.on('moveend', () => {
      const bounds = this.map.getBounds();
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      const center = this.map.getCenter();

      // Pozivanje API-ja za učitavanje postova na osnovu nove vidljive oblasti
      this.loadNearbyPosts(center.lat, center.lng, this.map.getZoom(), southWest.lat, southWest.lng, northEast.lat, northEast.lng);
    });
  }

  // Funkcija za učitavanje postova u određenom radijusu
  loadNearbyPosts(lat: number = this.latitude, lng: number = this.longitude, zoom: number = this.zoom, southLat?: number, southLng?: number, northLat?: number, northLng?: number): void {
    this.postService.getPostsInBounds(lat, lng, zoom, southLat, southLng, northLat, northLng).subscribe(posts => {
      this.posts = posts;
      this.updateMapMarkers();
    });
  }

  // Funkcija za ažuriranje markera na mapi
  updateMapMarkers(): void {
    if (this.map) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          this.map?.removeLayer(layer);
        }
      });

      this.posts.forEach(post => {
        L.marker([post.location.lat, post.location.lng]).addTo(this.map!)
          .bindPopup(`Post: ${post.description}`);
      });
    }
  }
}
