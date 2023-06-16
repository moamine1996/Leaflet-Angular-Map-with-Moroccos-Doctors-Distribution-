import { AfterViewInit, Component } from '@angular/core';
import { GeoJsonObject } from 'geojson';
import * as L from 'leaflet';


declare var citiesData: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  
  constructor() { }
  
  ngAfterViewInit(): void {
    var map = L.map('map').setView([29.3774, -7.6667], 5);

    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);



    // Create a new class InfoControl that extends L.Control so we can override the OnAdd method
    class InfoControl extends L.Control {
      private _div: HTMLElement;
    
      constructor() {
        super({ position: 'topright' });
        this._div = L.DomUtil.create('div', 'info');
      }
    
      override onAdd(map: L.Map): HTMLElement {
        this.update();
        return this._div;
      }
      

      update(props?: { region: string; num_doctors: number; }) {
        if (props) {
          const { region, num_doctors } = props;
          const backgroundColor = getColor(num_doctors); // Assuming you have a function getColor to determine the color based on the number of doctors
      
          this._div.innerHTML = `<h4>Doctors distribution</h4>
            <div style="background-color: ${backgroundColor};border: 3px #00000099 solid;
            border-radius: 10px;
            box-shadow: 3px 3px 9px rgba(0, 0, 0, 0.3);
            padding: 20px;">
              <b>${region}</b><br /><br>
              ${num_doctors} doctors
            </div>`;
        } else {
          this._div.innerHTML = '<h4>Doctors distribution</h4> <br> Hover over a region';
        }
      }
      
    }
    
    const info = new InfoControl();
    info.addTo(map);
    

    class CustomLegendControl extends L.Control {
      override onAdd(map: L.Map): HTMLElement {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = [0, 50, 100, 200, 300, 400, 500, 600];
        var labels = [];
    
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
      }
    }
    
    var legend = new CustomLegendControl({ position: 'bottomright' });
    legend.addTo(map);
    

    

    function getColor(d: number) {
      return d > 600
        ? '#1984c5'
        : d > 500
        ? '#22a7f0'
        : d > 400
        ? '#63bff0'
        : d > 300
        ? '#a7d5ed'
        : d > 200
        ? '#e1a692'
        : d > 100
        ? '#de6e56'
        : d > 50
        ? '#e14b31'
        : '#c23728';
    }

    function style(feature: { properties: { num_doctors: number; } } | undefined) {
      if (feature && feature.properties) {
        return {
          fillColor: getColor(feature.properties.num_doctors),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        };
      }
      return {};
    }

    function highlightFeature(e: { target: any; }) {
      var layer = e.target;

      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });

      layer.bringToFront();
      info.update(layer.feature.properties);
    }

    function resetHighlight(e: { target: any; }) {
      geojson.resetStyle(e.target);
      info.update();
    }

    function zoomToFeature(e: { target: { getBounds: () => L.LatLngBoundsExpression } }) {
      map.fitBounds(e.target.getBounds());
    }

    var geojson = L.geoJson(citiesData, {
      style: style,
      onEachFeature: function(feature: any, layer: any) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature,
        });
      }
    }).addTo(map);

  }
}
