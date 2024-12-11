import { Injectable } from '@angular/core';
import { MapaMostrarFichasComponent } from '../components/mapa-mostrar-fichas/mapa-mostrar-fichas.component';

@Injectable({
  providedIn: 'root'
})
export class MapService {
    private mapComponent: any; // Guarda la referencia del componente que controla el mapa

    constructor() {}

    // Registrar la instancia del componente que maneja el mapa
    registerMapComponent(mapComponent: MapaMostrarFichasComponent): void {
      this.mapComponent = mapComponent;
    }

    // Llamar al método showInfoWindowByItemOrId del componente registrado
    showInfoWindowByItemOrId(itemOrId: any): void {
      if (this.mapComponent) {
        this.mapComponent.showInfoWindowByItemOrId(itemOrId);
      } else {
        console.error('El componente del mapa no está registrado.');
      }
    }
}
