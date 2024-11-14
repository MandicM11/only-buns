import { Component, OnInit, Input } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-user-location-map',
  templateUrl: './user-location-map.component.html',
  styleUrls: ['./user-location-map.component.css']
})
export class UserLocationMapComponent implements OnInit {
  @Input() latitude!: number;
  @Input() longitude!: number;
  map!: L.Map;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (!this.latitude || !this.longitude) {
      console.error("Latitude and Longitude are required for map display");
      return;
    }

    // Initialize map centered at user's location
    this.map = L.map('map', {
      center: [this.latitude, this.longitude],
      zoom: 13
    });

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add a marker at the user's location
    L.marker([this.latitude, this.longitude]).addTo(this.map)
      .bindPopup('User Location')
      .openPopup();
  }
}
