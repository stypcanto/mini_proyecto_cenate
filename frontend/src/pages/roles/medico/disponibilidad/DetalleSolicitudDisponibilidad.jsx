import React from 'react';
import { Card, Descriptions, Table, Tag, Divider, Button } from 'antd';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeftOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import EstadoBadge from './components/EstadoBadge';

const DetalleSolicitudDisponibilidad = () => {
  const history = useHistory();
  const { id } = useParams();
  
  // Datos de ejemplo - en una implementación real, estos vendrían de una API
  const solicitud = {
    id: id,
    codigo: `SD-${id.padStart(5, '0')}`,
    estado: 'ENVIADO',
    fechaCreacion: '2026-01-20T10:30:00',
    fechaActualizacion: '2026-01-21T15:45:00',
    periodo: 'ENERO 2026',
    observaciones: 'Ninguna',
    detalles: [
      { id: 1, fecha: '2026-01-15', turno: 'M', estado: 'APROBADO' },
      { id: 2, fecha: '2026-01-16', turno: 'T', estado: 'APROBADO' },
      { id: 3, fecha: '2026-01-17', turno: 'N', estado: 'RECHAZADO' },
      { id: 4, fecha: '2026-01-18', turno: 'M', estado: 'PROPUESTO' },
    ]
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => format(new Date(fecha), 'EEEE d \'de\' MMMM', { locale: es }),
      sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    },
    {
      title: 'Turno',
      dataIndex: 'turno',
      key: 'turno',
      render: (turno) => {
        const turnos = {
          'M': 'Mañana',
          'T': 'Tarde',
          'N': 'Noche'
        };
        return turnos[turno] || turno;
      },
      filters: [
        { text: 'Mañana', value: 'M' },
        { text: 'Tarde', value: 'T' },
        { text: 'Noche', value: 'N' },
      ],
      onFilter: (value, record) => record.turno === value,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        let color = '';
        if (estado === 'APROBADO') color = 'green';
        else if (estado === 'RECHAZADO') color = 'red';
        else if (estado === 'PROPUESTO') color = 'blue';
        
        return <Tag color={color}>{estado}</Tag>;
      },
      filters: [
        { text: 'Aprobado', value: 'APROBADO' },
        { text: 'Rechazado', value: 'RECHAZADO' },
        { text: 'Propuesto', value: 'PROPUESTO' },
      ],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: 'Observaciones',
      dataIndex: 'observaciones',
      key: 'observaciones',
      render: (text) => text || '—',
    },
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'BORRADOR': return 'orange';
      case 'ENVIADO': return 'blue';
      case 'OBSERVADO': return 'orange';
      case 'APROBADO': return 'green';
      case 'RECHAZADO': return 'red';
      case 'ANULADO': return 'gray';
      default: return 'default';
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => history.goBack()}
          className="mr-2"
        >
          Volver
        </Button>
        <h1 className="text-xl font-semibold">Detalle de Solicitud de Disponibilidad</h1>
      </div>

      <Card 
        title={`Solicitud ${solicitud.codigo}`}
        extra={[
          <Tag color={getEstadoColor(solicitud.estado)} key="estado">
            {solicitud.estado}
          </Tag>,
          <Button 
            key="editar" 
            type="primary" 
            icon={<EditOutlined />} 
            className="ml-2"
            disabled={solicitud.estado !== 'BORRADOR' && solicitud.estado !== 'OBSERVADO'}
          >
            Editar
          </Button>,
          <Button 
            key="imprimir" 
            icon={<PrinterOutlined />} 
            className="ml-2"
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        ]}
      >
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Código">{solicitud.codigo}</Descriptions.Item>
          <Descriptions.Item label="Estado">
            <EstadoBadge estado={solicitud.estado} />
          </Descriptions.Item>
          <Descriptions.Item label="Período">{solicitud.periodo}</Descriptions.Item>
          <Descriptions.Item label="Fecha de Creación">
            {format(new Date(solicitud.fechaCreacion), 'PPpp', { locale: es })}
          </Descriptions.Item>
          <Descriptions.Item label="Última Actualización">
            {format(new Date(solicitud.fechaActualizacion), 'PPpp', { locale: es })}
          </Descriptions.Item>
          <Descriptions.Item label="Observaciones" span={2}>
            {solicitud.observaciones || 'Ninguna'}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Días Solicitados</Divider>
        
        <Table 
          columns={columns} 
          dataSource={solicitud.detalles} 
          rowKey="id"
          pagination={false}
          className="mt-4"
        />

        <div className="mt-6 flex justify-end space-x-2">
          <Button onClick={() => history.goBack()}>
            Volver
          </Button>
          <Button type="primary" onClick={() => window.print()}>
            <PrinterOutlined /> Imprimir
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DetalleSolicitudDisponibilidad;
