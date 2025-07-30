// Type definitions untuk PIXI.js v8 compatibility

export interface PixiDestroyOptions {
  children?: boolean;
  texture?: boolean;
  baseTexture?: boolean;
}

export interface PixiApplicationOptions {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  backgroundColor?: number;
  antialias?: boolean;
  resolution?: number;
  autoDensity?: boolean;
}

// Helper functions untuk PIXI.js v8
export class PixiUtils {
  static safeDestroy(object: any, options?: PixiDestroyOptions) {
    try {
      if (object && typeof object.destroy === "function") {
        object.destroy(options);
      }
    } catch (error) {
      console.warn("Error destroying PIXI object:", error);
    }
  }

  static safeRemoveChild(container: any, child: any) {
    try {
      if (container && child && container.children.includes(child)) {
        container.removeChild(child);
      }
    } catch (error) {
      console.warn("Error removing child:", error);
    }
  }

  static safeGenerateTexture(renderer: any, graphics: any) {
    try {
      if (
        renderer &&
        graphics &&
        typeof renderer.generateTexture === "function"
      ) {
        return renderer.generateTexture(graphics);
      }
      // Fallback untuk PIXI.js v8
      return PIXI.Texture.from(graphics);
    } catch (error) {
      console.warn("Error generating texture:", error);
      return PIXI.Texture.EMPTY;
    }
  }
}

// Global PIXI import
import * as PIXI from "pixi.js";
export { PIXI };
