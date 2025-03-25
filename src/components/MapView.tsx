import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';

function MapView() {
  const position: [number, number] = [-0.09, 51.505];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const markerFeature = new Feature({
        geometry: new Point(fromLonLat(position))
      });
      
      markerFeature.setStyle(
        new Style({
          image: new Icon({
            src: '/marker-icon.png',
            scale: 1,
            anchor: [0.5, 1]
          })
        })
      );
      
      const vectorSource = new VectorSource({
        features: [markerFeature]
      });
      
      const vectorLayer = new VectorLayer({
        source: vectorSource
      });
      
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        view: new View({
          center: fromLonLat(position),
          zoom: 13
        })
      });
      
      mapInstanceRef.current = map;
      
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setTarget(undefined);
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);
  
  return (
    <div>
      <h2>Navigation Map</h2>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
      <div>
        <p>Interactive Map</p>
        <p><small>Marker indicates current position</small></p>
      </div>
    </div>
  );
}

export default MapView; 