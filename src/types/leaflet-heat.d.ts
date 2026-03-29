/**
 * Type declaration for the leaflet.heat plugin.
 * This plugin extends Leaflet's L namespace with a heatLayer function.
 */

declare module "leaflet.heat" {
  import * as L from "leaflet";

  interface HeatLayerOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: Record<number, string>;
  }

  function heatLayer(
    latlngs: Array<[number, number] | [number, number, number]>,
    options?: HeatLayerOptions
  ): L.Layer;

  export = heatLayer;
}
