import { Component, Input, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-user-location-map',
  templateUrl: './user-location-map.component.html',
  styleUrls: ['./user-location-map.component.css'],
  standalone: true
})
export class UserLocationMapComponent implements AfterViewInit {
  @Input() latitude!: number;
  @Input() longitude!: number;
  private map: L.Map | undefined;

  ngAfterViewInit(): void {
    // Only initialize map if latitude and longitude are defined
    if (this.latitude !== undefined && this.longitude !== undefined) {
      this.initMap();
    } else {
      console.error('Latitude or Longitude is undefined');
    }
  }

  private initMap(): void {
    if (!this.map) {
      this.map = L.map('map').setView([this.latitude, this.longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      L.marker([this.latitude, this.longitude]).addTo(this.map)
        .bindPopup('User Location')
        .openPopup();
    }
  }
}
