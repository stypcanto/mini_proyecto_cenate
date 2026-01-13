// ========================================================================
// 📡 teleekgService.test.js – Unit Tests para TeleEKG API Service
// ✅ VERSIÓN 1.0.0 - Jest + axios mock
// ========================================================================

import axios from 'axios';
import teleekgService from '../teleekgService';

jest.mock('axios');

describe('teleekgService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token-12345');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('subirImagenECG', () => {
    it('debería subir imagen ECG exitosamente', async () => {
      const mockResponse = {
        data: {
          data: {
            idImagen: 1,
            numDocPaciente: '44914706',
            estado: 'PENDIENTE'
          }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('numDocPaciente', '44914706');
      formData.append('archivo', new File(['content'], 'test.jpg'));

      const result = await teleekgService.subirImagenECG(formData);

      expect(result).toEqual(mockResponse.data.data);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/upload'),
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
    });

    it('debería manejar error al subir imagen', async () => {
      const mockError = new Error('Upload failed');
      axios.post.mockRejectedValue(mockError);

      const formData = new FormData();
      formData.append('numDocPaciente', '44914706');

      await expect(teleekgService.subirImagenECG(formData)).rejects.toThrow('Upload failed');
    });
  });

  describe('listarImagenes', () => {
    it('debería listar imágenes con parámetros', async () => {
      const mockResponse = {
        data: {
          data: {
            content: [
              { idImagen: 1, numDocPaciente: '44914706', estado: 'PENDIENTE' },
              { idImagen: 2, numDocPaciente: '12345678', estado: 'PROCESADA' }
            ],
            totalPages: 1,
            totalElements: 2
          }
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await teleekgService.listarImagenes({
        numDoc: '44914706',
        estado: 'PENDIENTE',
        page: 0,
        size: 20
      });

      expect(result).toEqual(mockResponse.data.data);
      expect(axios.get).toHaveBeenCalled();
    });

    it('debería listar imágenes sin filtros', async () => {
      const mockResponse = {
        data: {
          data: {
            content: [],
            totalPages: 0,
            totalElements: 0
          }
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await teleekgService.listarImagenes({});

      expect(result).toEqual(mockResponse.data.data);
    });

    it('debería manejar error en listado', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(teleekgService.listarImagenes({})).rejects.toThrow('Network error');
    });
  });

  describe('obtenerDetalles', () => {
    it('debería obtener detalles de imagen', async () => {
      const mockResponse = {
        data: {
          data: {
            idImagen: 1,
            numDocPaciente: '44914706',
            nombresPaciente: 'Juan',
            apellidosPaciente: 'Pérez',
            estado: 'PENDIENTE'
          }
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await teleekgService.obtenerDetalles(1);

      expect(result).toEqual(mockResponse.data.data);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/1/detalles'),
        expect.any(Object)
      );
    });
  });

  describe('descargarImagen', () => {
    it('debería descargar imagen', async () => {
      const mockBlob = new Blob(['image content'], { type: 'image/jpeg' });
      const mockResponse = { data: mockBlob };

      axios.get.mockResolvedValue(mockResponse);

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/test');

      await teleekgService.descargarImagen(1);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/1/descargar'),
        expect.objectContaining({ responseType: 'blob' })
      );
    });

    it('debería manejar error en descarga', async () => {
      axios.get.mockRejectedValue(new Error('Download failed'));

      await expect(teleekgService.descargarImagen(1)).rejects.toThrow('Download failed');
    });
  });

  describe('procesarImagen', () => {
    it('debería procesar imagen con acción PROCESAR', async () => {
      const mockResponse = {
        data: {
          data: {
            idImagen: 1,
            estado: 'PROCESADA'
          }
        }
      };

      axios.put.mockResolvedValue(mockResponse);

      const result = await teleekgService.procesarImagen(1, {
        accion: 'PROCESAR',
        observaciones: 'ECG válido'
      });

      expect(result).toEqual(mockResponse.data.data);
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/1/procesar'),
        expect.objectContaining({ accion: 'PROCESAR' }),
        expect.any(Object)
      );
    });

    it('debería procesar imagen con acción RECHAZAR', async () => {
      const mockResponse = {
        data: {
          data: {
            idImagen: 1,
            estado: 'RECHAZADA'
          }
        }
      };

      axios.put.mockResolvedValue(mockResponse);

      const result = await teleekgService.procesarImagen(1, {
        accion: 'RECHAZAR',
        motivoRechazo: 'Imagen borrosa'
      });

      expect(result).toEqual(mockResponse.data.data);
      expect(axios.put).toHaveBeenCalled();
    });

    it('debería manejar error en procesamiento', async () => {
      axios.put.mockRejectedValue(new Error('Process failed'));

      await expect(
        teleekgService.procesarImagen(1, { accion: 'PROCESAR' })
      ).rejects.toThrow('Process failed');
    });
  });

  describe('obtenerEstadisticas', () => {
    it('debería obtener estadísticas', async () => {
      const mockResponse = {
        data: {
          data: {
            totalImagenesCargadas: 100,
            totalImagenesProcesadas: 85,
            totalImagenesRechazadas: 15,
            totalImagenesVinculadas: 80
          }
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await teleekgService.obtenerEstadisticas();

      expect(result).toEqual(mockResponse.data.data);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/estadisticas'),
        expect.any(Object)
      );
    });
  });

  describe('obtenerProximasVencer', () => {
    it('debería obtener imágenes próximas a vencer', async () => {
      const mockResponse = {
        data: {
          data: [
            { idImagen: 1, diasRestantes: 2, numDocPaciente: '44914706' },
            { idImagen: 2, diasRestantes: 1, numDocPaciente: '12345678' }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await teleekgService.obtenerProximasVencer();

      expect(result).toEqual(mockResponse.data.data);
    });

    it('debería retornar array vacío en error', async () => {
      axios.get.mockRejectedValue(new Error('Error'));

      const result = await teleekgService.obtenerProximasVencer();

      expect(result).toEqual([]);
    });
  });

  describe('Validación de Headers', () => {
    it('debería incluir token JWT en headers', async () => {
      axios.get.mockResolvedValue({
        data: { data: [] }
      });

      await teleekgService.obtenerEstadisticas();

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-12345'
          })
        })
      );
    });

    it('debería manejar error cuando token no existe', async () => {
      localStorage.removeItem('token');

      axios.get.mockResolvedValue({
        data: { data: [] }
      });

      await teleekgService.obtenerEstadisticas();

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer null'
          })
        })
      );
    });
  });
});
