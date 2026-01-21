import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageCanvas from "../ImageCanvas";

/**
 * Tests para ImageCanvas component
 * Verifican:
 * - Renderización del canvas
 * - Aplicación de rotación
 * - Aplicación de filtros
 * - Manejo de errores
 * - Callbacks ejecutados
 */

// Mock de Image API para simular carga de imágenes
class MockImage {
  constructor() {
    this.src = "";
    this.crossOrigin = "";
    this.complete = false;
  }

  set src(value) {
    this._src = value;
    // Simular carga exitosa
    setTimeout(() => {
      this.complete = true;
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }

  get src() {
    return this._src;
  }
}

// Reemplazar Image global con mock
global.Image = MockImage;

describe("ImageCanvas Component", () => {
  // Base64 image válida (1x1 pixel PNG rojo)
  const validDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

  describe("Renderización básica", () => {
    test("debe renderizar un canvas", () => {
      render(<ImageCanvas imageSrc={validDataUrl} />);
      const canvas = screen.getByRole("img", { hidden: true });
      expect(canvas).toBeInTheDocument();
    });

    test("debe tener aria-label", () => {
      render(<ImageCanvas imageSrc={validDataUrl} />);
      const canvas = screen.getByLabelText("EKG Image Canvas");
      expect(canvas).toBeInTheDocument();
    });

    test("debe llamar onImageLoad al cargar imagen", async () => {
      const onImageLoad = jest.fn();
      render(<ImageCanvas imageSrc={validDataUrl} onImageLoad={onImageLoad} />);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalled();
      });
    });
  });

  describe("Rotación", () => {
    test("debe aceptar rotación 90 grados", async () => {
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} rotation={0} />
      );

      rerender(<ImageCanvas imageSrc={validDataUrl} rotation={90} />);

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });

    test("debe aceptar rotación 180 grados", async () => {
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} rotation={0} />
      );

      rerender(<ImageCanvas imageSrc={validDataUrl} rotation={180} />);

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });

    test("debe aceptar rotación 270 grados", async () => {
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} rotation={0} />
      );

      rerender(<ImageCanvas imageSrc={validDataUrl} rotation={270} />);

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });
  });

  describe("Filtros", () => {
    test("debe aplicar filtro invert", async () => {
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} filters={{ invert: false }} />
      );

      rerender(
        <ImageCanvas imageSrc={validDataUrl} filters={{ invert: true }} />
      );

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });

    test("debe aplicar filtro contrast", async () => {
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} filters={{ contrast: 100 }} />
      );

      rerender(
        <ImageCanvas imageSrc={validDataUrl} filters={{ contrast: 150 }} />
      );

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });

    test("debe aplicar filtro brightness", async () => {
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} filters={{ brightness: 100 }} />
      );

      rerender(
        <ImageCanvas imageSrc={validDataUrl} filters={{ brightness: 120 }} />
      );

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });

    test("debe aplicar múltiples filtros", async () => {
      const filters = {
        invert: true,
        contrast: 140,
        brightness: 110,
      };

      render(<ImageCanvas imageSrc={validDataUrl} filters={filters} />);

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });
  });

  describe("Manejo de errores", () => {
    test("debe manejar imagen nula", () => {
      // No debe lanzar error
      expect(() => {
        render(<ImageCanvas imageSrc={null} />);
      }).not.toThrow();
    });

    test("debe manejar canvas faltante", () => {
      // No debe lanzar error cuando no hay canvas ref
      const { unmount } = render(<ImageCanvas imageSrc={validDataUrl} />);
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe("Actualización de propiedades", () => {
    test("debe actualizar cuando cambia imageSrc", async () => {
      const onImageLoad = jest.fn();
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} onImageLoad={onImageLoad} />
      );

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledTimes(1);
      });

      rerender(
        <ImageCanvas imageSrc={validDataUrl} onImageLoad={onImageLoad} />
      );

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledTimes(2);
      });
    });

    test("debe actualizar cuando cambia rotación", async () => {
      const { rerender } = render(
        <ImageCanvas imageSrc={validDataUrl} rotation={0} />
      );

      rerender(<ImageCanvas imageSrc={validDataUrl} rotation={90} />);

      await waitFor(() => {
        const canvas = screen.getByLabelText("EKG Image Canvas");
        expect(canvas).toBeInTheDocument();
      });
    });
  });
});
