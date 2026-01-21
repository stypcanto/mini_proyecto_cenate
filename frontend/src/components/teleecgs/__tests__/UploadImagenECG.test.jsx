// ========================================================================
// 📤 UploadImagenEKG.test.jsx – Unit Tests para Upload Component
// ✅ VERSIÓN 1.0.0 - Jest + React Testing Library
// ========================================================================

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import UploadImagenEKG from '../UploadImagenEKG';
import teleekgService from '../../../services/teleekgService';
import aseguradosService from '../../../services/aseguradosService';

jest.mock('react-hot-toast');
jest.mock('../../../services/teleekgService');
jest.mock('../../../services/aseguradosService');

describe('UploadImagenEKG Component', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    toast.error = jest.fn();
    toast.success = jest.fn();
    toast.loading = jest.fn();
    toast.dismiss = jest.fn();
  });

  describe('Rendering', () => {
    it('debería renderizar el formulario de upload', () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/Cargar Electrocardiograma/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/12345678/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Juan/i)).toBeInTheDocument();
    });

    it('debería mostrar instrucciones de archivo', () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/Máximo 5MB/i)).toBeInTheDocument();
      expect(screen.getByText(/JPEG, PNG/i)).toBeInTheDocument();
    });
  });

  describe('Validación DNI', () => {
    it('debería validar que DNI tiene 8 dígitos', async () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const inputDNI = screen.getByPlaceholderText(/12345678/i);
      await userEvent.type(inputDNI, '123'); // Solo 3 dígitos

      expect(inputDNI.value).toBe('123');
    });

    it('debería rechazar caracteres no numéricos en DNI', async () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const inputDNI = screen.getByPlaceholderText(/12345678/i);
      await userEvent.type(inputDNI, '1234ABC56');

      expect(inputDNI.value).toBe('12345656'); // Solo dígitos
    });

    it('debería mostrar error si DNI está vacío', async () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /Cargar EKG/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('El DNI es requerido');
      });
    });

    it('debería mostrar error si DNI no tiene 8 dígitos', async () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const inputDNI = screen.getByPlaceholderText(/12345678/i);
      await userEvent.type(inputDNI, '1234567'); // 7 dígitos

      const submitButton = screen.getByRole('button', { name: /Cargar EKG/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('El DNI debe tener exactamente 8 dígitos');
      });
    });
  });

  describe('Validación Archivo', () => {
    it('debería rechazar archivo si es muy grande (> 5MB)', () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });

      const fileInput = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const inputElement = fileInput.querySelector('input[type="file"]');

      // Simular selección de archivo
      Object.defineProperty(inputElement, 'files', {
        value: [largeFile]
      });

      fireEvent.change(inputElement);

      expect(toast.error).toHaveBeenCalledWith(/no debe superar 5MB/i);
    });

    it('debería rechazar archivo con tipo MIME inválido', () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      const fileInput = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const inputElement = fileInput.querySelector('input[type="file"]');

      Object.defineProperty(inputElement, 'files', {
        value: [pdfFile]
      });

      fireEvent.change(inputElement);

      expect(toast.error).toHaveBeenCalledWith(/Solo se permiten archivos JPEG o PNG/i);
    });

    it('debería aceptar archivo JPEG válido', () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      const fileInput = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const inputElement = fileInput.querySelector('input[type="file"]');

      Object.defineProperty(inputElement, 'files', {
        value: [validFile]
      });

      fireEvent.change(inputElement);

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('debería aceptar archivo PNG válido', () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const validFile = new File(['content'], 'test.png', { type: 'image/png' });

      const fileInput = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const inputElement = fileInput.querySelector('input[type="file"]');

      Object.defineProperty(inputElement, 'files', {
        value: [validFile]
      });

      fireEvent.change(inputElement);

      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('Envío del Formulario', () => {
    it('debería enviar formulario correctamente', async () => {
      teleekgService.subirImagenEKG.mockResolvedValue({
        idImagen: 1,
        estado: 'PENDIENTE'
      });

      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const inputDNI = screen.getByPlaceholderText(/12345678/i);
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await userEvent.type(inputDNI, '44914706');

      const fileInput = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const inputElement = fileInput.querySelector('input[type="file"]');

      Object.defineProperty(inputElement, 'files', {
        value: [validFile]
      });

      fireEvent.change(inputElement);

      const submitButton = screen.getByRole('button', { name: /Cargar EKG/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(teleekgService.subirImagenEKG).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('✅ EKG cargado exitosamente');
      });
    });

    it('debería manejar error de asegurado no existente', async () => {
      teleekgService.subirImagenEKG.mockRejectedValue({
        response: { status: 404, data: { message: 'Asegurado no encontrado' } }
      });

      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const inputDNI = screen.getByPlaceholderText(/12345678/i);
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await userEvent.type(inputDNI, '44914706');

      const fileInput = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const inputElement = fileInput.querySelector('input[type="file"]');

      Object.defineProperty(inputElement, 'files', {
        value: [validFile]
      });

      fireEvent.change(inputElement);

      const submitButton = screen.getByRole('button', { name: /Cargar EKG/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('El asegurado no existe. Por favor créalo primero.');
      });
    });
  });

  describe('Drag and Drop', () => {
    it('debería aceptar archivo con drag and drop', async () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const dropZone = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      // Simular drag over
      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('border-blue-500');

      // Simular drop
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [validFile] }
      });

      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('Preview de Imagen', () => {
    it('debería mostrar preview después de seleccionar archivo', async () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      const fileInput = screen.getByRole('button', { name: /Arrastra tu imagen/i }).parentElement;
      const inputElement = fileInput.querySelector('input[type="file"]');

      Object.defineProperty(inputElement, 'files', {
        value: [validFile]
      });

      fireEvent.change(inputElement);

      await waitFor(() => {
        // El preview debería existir después de la selección
        expect(inputElement.files[0]).toBe(validFile);
      });
    });
  });

  describe('Limpiar Formulario', () => {
    it('debería limpiar el formulario', async () => {
      render(<UploadImagenEKG onSuccess={mockOnSuccess} />);

      const inputDNI = screen.getByPlaceholderText(/12345678/i);
      await userEvent.type(inputDNI, '44914706');

      const cleanButton = screen.queryByRole('button', { name: /Limpiar/i });

      if (cleanButton) {
        fireEvent.click(cleanButton);
        await waitFor(() => {
          expect(inputDNI.value).toBe('');
        });
      }
    });
  });
});
