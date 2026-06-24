import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
const PDFDocument = require('pdfkit');
const sendgridMail = require('@sendgrid/mail');
import {
  CapacidadAlmacenamiento,
  CategoriaABC,
  EstadoOrdenCompra,
  MotivoSalida,
  Prisma,
  RolUsuario,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DecimalLike = number | string | Prisma.Decimal;

@Injectable()
export class SgeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly pdfPalette = {
    ink: '#1f2937',
    slate: '#475569',
    accent: '#0b6e4f',
    accentSoft: '#d9efe8',
    border: '#d1d5db',
  };

  private toNumber(value: DecimalLike): number {
    return Number(value);
  }

  private formatDate(value: Date | string) {
    return new Date(value).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  private buildPdfShell(doc: any, title: string, subtitle: string, code: string) {
    // Reset all colors and styles
    doc.lineWidth(1);
    doc.fillColor(this.pdfPalette.ink);
    doc.strokeColor(this.pdfPalette.border);

    // Draw header background
    doc.fillColor(this.pdfPalette.accent);
    doc.rect(0, 0, doc.page.width, 72).fill();

    // Header text
    doc.fillColor('white');
    doc.font('Helvetica-Bold').fontSize(18).text('Sistema de Gestión de Existencias', 40, 18, { align: 'left' });
    doc.font('Helvetica').fontSize(9).text('Reporte operativo y analítico', 40, 42);
    doc.text(code, { align: 'right', width: 100, continued: false });

    // Draw title box
    doc.fillColor(this.pdfPalette.accentSoft);
    doc.roundedRect(40, 92, doc.page.width - 80, 62, 8).fill();
    doc.strokeColor(this.pdfPalette.border);
    doc.roundedRect(40, 92, doc.page.width - 80, 62, 8).stroke();

    // Title text
    doc.fillColor(this.pdfPalette.ink);
    doc.font('Helvetica-Bold').fontSize(16).text(title, 56, 104);
    doc.font('Helvetica').fontSize(9).text(subtitle, 56, 126);

    // Footer
    doc.fillColor(this.pdfPalette.slate);
    doc.fontSize(8);
    doc.text(`Generado: ${this.formatDate(new Date())}`, 40, doc.page.height - 40, {
      width: doc.page.width - 80,
      align: 'right',
    });
    doc.text(`Página ${doc.page.number}`, 40, doc.page.height - 40, { width: 120, align: 'left' });

    // Reset color and set starting position
    doc.fillColor(this.pdfPalette.ink);
    doc.y = 170;
  }

  private drawSummaryCard(doc: any, label: string, value: string, x: number, y: number, width = 160) {
    doc.fillColor('#ffffff');
    doc.roundedRect(x, y, width, 44, 6).fill();
    doc.strokeColor(this.pdfPalette.border);
    doc.roundedRect(x, y, width, 44, 6).stroke();

    doc.fillColor(this.pdfPalette.slate);
    doc.font('Helvetica').fontSize(8).text(label.toUpperCase(), x + 10, y + 8, { width: width - 20 });

    doc.fillColor(this.pdfPalette.ink);
    doc.font('Helvetica-Bold').fontSize(14).text(value, x + 10, y + 22, { width: width - 20 });
  }

  private drawTable(
    doc: any,
    columns: { header: string; width: number; align?: 'left' | 'right' | 'center' }[],
    rows: string[][],
    meta: { title: string; subtitle: string; code: string },
  ) {
    const startX = 40;
    const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
    let y = doc.y;

    const drawHeader = () => {
      let x = startX;
      doc.fillColor(this.pdfPalette.ink);
      doc.roundedRect(startX, y, tableWidth, 22, 4).fill();
      doc.fillColor('white');
      doc.font('Helvetica-Bold').fontSize(9);
      columns.forEach((column) => {
        doc.text(column.header, x + 6, y + 7, {
          width: column.width - 12,
          align: column.align || 'left',
        });
        x += column.width;
      });
      y += 24;
    };

    const ensureSpace = (neededHeight: number) => {
      if (y + neededHeight > doc.page.height - 70) {
        doc.addPage();
        this.buildPdfShell(doc, meta.title, meta.subtitle, meta.code);
        y = 170;
        drawHeader();
      }
    };

    drawHeader();

    rows.forEach((row, rowIndex) => {
      const rowHeight = 20;
      ensureSpace(rowHeight + 4);

      const fillColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc.fillColor(fillColor);
      doc.roundedRect(startX, y, tableWidth, rowHeight, 3).fill();
      doc.strokeColor(this.pdfPalette.border);
      doc.roundedRect(startX, y, tableWidth, rowHeight, 3).stroke();

      let x = startX;
      doc.fillColor(this.pdfPalette.ink);
      doc.font('Helvetica').fontSize(8.5);
      columns.forEach((column, columnIndex) => {
        doc.text(row[columnIndex] || '-', x + 6, y + 6, {
          width: column.width - 12,
          align: column.align || 'left',
        });
        x += column.width;
      });
      y += rowHeight + 2;
    });

    doc.y = y + 8;
  }

  private async bufferFromPdf(render: (doc: any) => void) {
    return new Promise<Buffer>((resolve) => {
      // Create PDF without margins to have full control
      const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: false });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Start at the top
      doc.y = 0;
      
      // Call the render function
      render(doc);
      
      doc.end();
    });
  }

  private getZByServiceLevel(nivelServicio: number): number {
    const zMap: Record<number, number> = {
      90: 1.28,
      95: 1.645,
      98: 2.05,
      99: 2.33,
    };
    return zMap[nivelServicio] ?? 1.645;
  }

  async getOrCreateParametros() {
    const existing = await this.prisma.parametroInventario.findFirst({
      orderBy: { idParametro: 'asc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.parametroInventario.create({
      data: {
        nivelServicio: 95,
        valorZ: 1.645,
        costoPedido: 120,
        costoAlmacenamiento: 20,
        umbralMinimoOc: 500,
        diasLaborales: 365,
      },
    });
  }

  async updateParametros(data: {
    nivelServicio?: number;
    costoPedido?: number;
    costoAlmacenamiento?: number;
    umbralMinimoOc?: number;
    diasLaborales?: number;
  }) {
    const parametros = await this.getOrCreateParametros();
    const nivelServicio = data.nivelServicio ?? parametros.nivelServicio;

    return this.prisma.parametroInventario.update({
      where: { idParametro: parametros.idParametro },
      data: {
        nivelServicio,
        valorZ: this.getZByServiceLevel(nivelServicio),
        costoPedido: data.costoPedido,
        costoAlmacenamiento: data.costoAlmacenamiento,
        umbralMinimoOc: data.umbralMinimoOc,
        diasLaborales: data.diasLaborales,
      },
    });
  }

  async listUsers() {
    return this.prisma.usuario.findMany({
      orderBy: { idUsuario: 'desc' },
      select: {
        idUsuario: true,
        nombres: true,
        apellidos: true,
        usuario: true,
        rol: true,
        estado: true,
        fechaCreacion: true,
      },
    });
  }

  async createUser(data: {
    nombres: string;
    apellidos: string;
    usuario: string;
    passwordHash: string;
    rol: RolUsuario;
  }) {
    return this.prisma.usuario.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        usuario: data.usuario,
        password: data.passwordHash,
        rol: data.rol,
      },
    });
  }

  async updateUserRole(idUsuario: number, rol: RolUsuario) {
    return this.prisma.usuario.update({
      where: { idUsuario },
      data: { rol },
    });
  }

  async inactivateUser(idUsuario: number) {
    return this.prisma.usuario.update({
      where: { idUsuario },
      data: { estado: 'inactivo' },
    });
  }

  async listProducts() {
    return this.prisma.producto.findMany({
      include: {
        inventarios: true,
      },
      orderBy: { idProducto: 'desc' },
    });
  }

  async createProduct(data: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    unidadMedida: string;
    categoria: string;
    tipoExistenciaPgc: number;
    metodoImputacion: 'directo' | 'indirecto';
    capacidadAlmacenamiento: CapacidadAlmacenamiento;
    sistemaReposicion?: 'nivel' | 'cobertura' | 'mixto';
    idAlmacen?: number;
    pasillo?: string;
    nivel?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Only pass the product fields expected by the Producto model
      const product = await tx.producto.create({
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          unidadMedida: data.unidadMedida,
          categoria: data.categoria,
          tipoExistenciaPgc: data.tipoExistenciaPgc,
          metodoImputacion: data.metodoImputacion as any,
          capacidadAlmacenamiento: data.capacidadAlmacenamiento as any,
          sistemaReposicion: data.sistemaReposicion as any,
        },
      });

      if (data.capacidadAlmacenamiento === 'almacenable' && data.idAlmacen) {
        await tx.inventario.create({
          data: {
            idProducto: product.idProducto,
            idAlmacen: data.idAlmacen,
            stockActual: 0,
            stockMinimo: 0,
            stockMaximo: 0,
            stockSeguridad: 0,
            puntoPedido: 0,
            vop: 0,
            pasillo: data.pasillo,
            nivel: data.nivel,
          },
        });
      }

      return product;
    });
  }

  async updateProduct(idProducto: number, data: Prisma.ProductoUpdateInput) {
    return this.prisma.producto.update({
      where: { idProducto },
      data,
    });
  }

  async inactivateProduct(idProducto: number) {
    return this.prisma.producto.update({
      where: { idProducto },
      data: { estado: 'inactivo' },
    });
  }

  async listSuppliers() {
    return this.prisma.proveedor.findMany({
      include: {
        proveedorProductos: {
          include: { producto: true },
        },
      },
      orderBy: { idProveedor: 'desc' },
    });
  }

  async createSupplier(data: Prisma.ProveedorCreateInput) {
    return this.prisma.proveedor.create({ data });
  }

  async updateSupplier(idProveedor: number, data: Prisma.ProveedorUpdateInput) {
    return this.prisma.proveedor.update({
      where: { idProveedor },
      data,
    });
  }

  async inactivateSupplier(idProveedor: number) {
    return this.prisma.proveedor.update({
      where: { idProveedor },
      data: { estado: 'inactivo' },
    });
  }

  async assignSupplierProduct(data: {
    idProveedor: number;
    idProducto: number;
    precioUnitario: number;
  }) {
    return this.prisma.proveedorProducto.upsert({
      where: {
        idProveedor_idProducto: {
          idProveedor: data.idProveedor,
          idProducto: data.idProducto,
        },
      },
      update: { precioUnitario: data.precioUnitario },
      create: data,
    });
  }

  async createPurchaseOrder(data: {
    idProveedor: number;
    idUsuario: number;
    fechaEntregaEstimada: string;
    observaciones?: string;
    items: Array<{
      idProducto: number;
      cantidadSolicitada: number;
      precioUnitario: number;
    }>;
  }) {
    const year = new Date().getFullYear();
    const count = await this.prisma.ordenCompra.count({
      where: {
        nroOrden: {
          startsWith: `OC-${year}-`,
        },
      },
    });

    const nroOrden = `OC-${year}-${String(count + 1).padStart(4, '0')}`;
    const total = data.items.reduce(
      (acc, item) => acc + item.cantidadSolicitada * item.precioUnitario,
      0,
    );

    const params = await this.getOrCreateParametros();
    if (total < this.toNumber(params.umbralMinimoOc)) {
      throw new BadRequestException(
        `La OC no alcanza el umbral minimo de ${this.toNumber(params.umbralMinimoOc)}.`,
      );
    }

    return this.prisma.ordenCompra.create({
      data: {
        nroOrden,
        idProveedor: data.idProveedor,
        idUsuario: data.idUsuario,
        fechaEntregaEstimada: new Date(data.fechaEntregaEstimada),
        observaciones: data.observaciones,
        total,
        estado: 'pendiente',
        detalles: {
          create: data.items.map((item) => ({
            idProducto: item.idProducto,
            cantidadSolicitada: item.cantidadSolicitada,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidadSolicitada * item.precioUnitario,
          })),
        },
      },
      include: { detalles: true },
    });
  }

  async updateOrderStatus(idOrdenCompra: number, estado: EstadoOrdenCompra, observaciones?: string) {
    return this.prisma.ordenCompra.update({
      where: { idOrdenCompra },
      data: { estado, observaciones },
    });
  }

  async receiveOrder(data: {
    idOrdenCompra: number;
    idAlmacen: number;
    idUsuario: number;
    nroComprobante: string;
    observacion?: string;
    items: Array<{ idProducto: number; cantidadRecibida: number; costoUnitario: number }>;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const oc = await tx.ordenCompra.findUnique({
        where: { idOrdenCompra: data.idOrdenCompra },
        include: { detalles: true },
      });

      if (!oc) {
        throw new NotFoundException('Orden de compra no encontrada.');
      }

      const detalleMap = new Map(
        oc.detalles.map((d) => [d.idProducto, this.toNumber(d.cantidadSolicitada)]),
      );

      // Determine conformity first
      let conforme = true;
      for (const item of data.items) {
        const requested = detalleMap.get(item.idProducto) ?? 0;
        if (requested !== item.cantidadRecibida) {
          conforme = false;
          break;
        }
      }

      // Create the Entrada first so detalle entries can reference it directly
      const entrada = await tx.entrada.create({
        data: {
          idOrdenCompra: data.idOrdenCompra,
          idAlmacen: data.idAlmacen,
          idUsuario: data.idUsuario,
          nroComprobante: data.nroComprobante,
          observacion: data.observacion,
        },
      });

      // Create detalle entries referencing the created entrada
      for (const item of data.items) {
        await tx.detalleEntrada.create({
          data: {
            idEntrada: entrada.idEntrada,
            idProducto: item.idProducto,
            idAlmacen: data.idAlmacen,
            cantidadRecibida: item.cantidadRecibida,
            costoUnitario: item.costoUnitario,
          },
        });
      }

      for (const item of data.items) {
        const inv = await tx.inventario.findUnique({
          where: {
            idProducto_idAlmacen: {
              idProducto: item.idProducto,
              idAlmacen: data.idAlmacen,
            },
          },
        });

        if (inv) {
          await tx.inventario.update({
            where: { idInventario: inv.idInventario },
            data: {
              stockActual: this.toNumber(inv.stockActual) + item.cantidadRecibida,
            },
          });
        } else {
          await tx.inventario.create({
            data: {
              idProducto: item.idProducto,
              idAlmacen: data.idAlmacen,
              stockActual: item.cantidadRecibida,
              stockMinimo: 0,
              stockMaximo: 0,
              stockSeguridad: 0,
              puntoPedido: 0,
              vop: 0,
            },
          });
        }
      }

      await tx.ordenCompra.update({
        where: { idOrdenCompra: data.idOrdenCompra },
        data: { estado: conforme ? 'recibida' : 'observada' },
      });

      return { entradaId: entrada.idEntrada, conforme };
    });
  }

  async registerStockOut(data: {
    idUsuario: number;
    tipoComprobante: string;
    observacion?: string;
    items: Array<{
      idProducto: number;
      cantidad: number;
      costoUnitario: number;
      motivo: MotivoSalida;
      destino: string;
      idAlmacen: number;
    }>;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const salida = await tx.salida.create({
        data: {
          idUsuario: data.idUsuario,
          tipoComprobante: data.tipoComprobante,
          observacion: data.observacion,
        },
      });

      for (const item of data.items) {
        const inv = await tx.inventario.findUnique({
          where: {
            idProducto_idAlmacen: {
              idProducto: item.idProducto,
              idAlmacen: item.idAlmacen,
            },
          },
        });

        if (!inv || this.toNumber(inv.stockActual) < item.cantidad) {
          throw new BadRequestException('Stock insuficiente para la salida.');
        }

        await tx.inventario.update({
          where: { idInventario: inv.idInventario },
          data: {
            stockActual: this.toNumber(inv.stockActual) - item.cantidad,
          },
        });

        await tx.detalleSalida.create({
          data: {
            idSalida: salida.idSalida,
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
            motivo: item.motivo,
            destino: item.destino,
          },
        });
      }

      return salida;
    });
  }

  async adjustInventory(data: {
    idProducto: number;
    idAlmacen: number;
    stockActual: number;
    justificacion: string;
    idUsuario: number;
  }) {
    const inv = await this.prisma.inventario.findUnique({
      where: {
        idProducto_idAlmacen: {
          idProducto: data.idProducto,
          idAlmacen: data.idAlmacen,
        },
      },
    });

    if (!inv) {
      throw new NotFoundException('Inventario no encontrado.');
    }

    const updated = await this.prisma.inventario.update({
      where: { idInventario: inv.idInventario },
      data: { stockActual: data.stockActual },
    });

    await this.logAction({
      idUsuario: data.idUsuario,
      accion: `Ajuste de inventario: ${data.justificacion}`,
      tablaAfectada: 'INVENTARIO',
      idRegistroAfectado: String(inv.idInventario),
      valorAnterior: inv,
      valorNuevo: updated,
      ipOrigen: '0.0.0.0',
    });

    return updated;
  }

  computeVop(input: { D: number; Cg: number; Cp: number }) {
    const Q = Math.sqrt((2 * input.Cg * input.D) / input.Cp);
    const N = input.D / Q;
    const T = 365 / N;
    const CT = Math.sqrt(2 * input.Cg * input.D * input.Cp);

    return {
      Q,
      N,
      T,
      CT,
    };
  }

  computeSafetyStock(input: { sigma: number; nivelServicio: number }) {
    const z = this.getZByServiceLevel(input.nivelServicio);
    const Ss = z * input.sigma;
    return { z, Ss };
  }

  computeReorderPoint(input: {
    demandaAnual: number;
    leadTimeDias: number;
    stockSeguridad: number;
    diasLaborales: number;
  }) {
    const demandaDiaria = input.demandaAnual / input.diasLaborales;
    const cpe = demandaDiaria * input.leadTimeDias;
    const pp = cpe + input.stockSeguridad;

    return { demandaDiaria, cpe, pp };
  }

  async recomputeAbc(lote?: string) {
    const selectedLote = lote ?? new Date().toISOString().slice(0, 7);
    const products = await this.prisma.producto.findMany({
      where: {
        estado: 'activo',
        capacidadAlmacenamiento: 'almacenable',
      },
      include: {
        proveedorProductos: true,
      },
    });

    // Compute demand from historical consumption (DetalleSalida) over last 12 months
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);

    const sales = await this.prisma.detalleSalida.findMany({
      where: { salida: { fechaSalida: { gte: since } } },
      select: { idProducto: true, cantidad: true },
    });

    const demandMap = new Map<number, number>();
    for (const s of sales) {
      const prev = demandMap.get(s.idProducto) ?? 0;
      demandMap.set(s.idProducto, prev + this.toNumber(s.cantidad));
    }

    const valueRows = products.map((p) => {
      const unitPrice = p.proveedorProductos[0]
        ? this.toNumber(p.proveedorProductos[0].precioUnitario)
        : 0;
      const demand = demandMap.get(p.idProducto) ?? 0;
      // If no historical demand, fallback to a small default to avoid zero-value
      const annualValue = unitPrice * (demand || 100);
      return { product: p, annualValue };
    });

    valueRows.sort((a, b) => b.annualValue - a.annualValue);
    const total = valueRows.reduce((sum, row) => sum + row.annualValue, 0) || 1;

    let accumulated = 0;
    const result = [] as Array<{ idProducto: number; categoria: CategoriaABC; porcentajeAcumulado: number }>;

    for (const row of valueRows) {
      const individual = row.annualValue / total;
      accumulated += individual;
      const pct = accumulated * 100;

      let categoria: CategoriaABC = 'C';
      if (pct <= 80) categoria = 'A';
      else if (pct <= 95) categoria = 'B';

      await this.prisma.clasificacionABC.create({
        data: {
          idProducto: row.product.idProducto,
          categoria,
          valorAnual: row.annualValue,
          porcentajeIndividual: individual * 100,
          porcentajeAcumulado: pct,
          lote: selectedLote,
        },
      });

      result.push({
        idProducto: row.product.idProducto,
        categoria,
        porcentajeAcumulado: pct,
      });
    }

    return result;
  }

  async getDashboard() {
    const [inventarios, criticos, alertasVop, ordenes, proveedores] = await Promise.all([
      this.prisma.inventario.findMany(),
      this.prisma.inventario.findMany({
        where: {
          stockActual: {
            lte: this.prisma.inventario.fields.puntoPedido,
          },
        },
      }),
      this.prisma.inventario.count({
        where: {
          vop: { gt: 0 },
          stockActual: { lte: this.prisma.inventario.fields.puntoPedido },
        },
      }),
      this.prisma.ordenCompra.findMany({
        orderBy: { fechaOrden: 'desc' },
        take: 20,
        include: { proveedor: true },
      }),
      this.prisma.proveedor.findMany(),
    ]);

    const stockTotal = inventarios.reduce(
      (sum, row) => sum + this.toNumber(row.stockActual),
      0,
    );

    const avgLeadTime =
      proveedores.length === 0
        ? 0
        : proveedores.reduce((acc, p) => acc + p.leadTimePromedio, 0) /
          proveedores.length;

    const orderStates = ordenes.reduce(
      (acc, order) => {
        acc[order.estado] = (acc[order.estado] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalOrderValue = ordenes.reduce((sum, order) => sum + this.toNumber(order.total), 0);

    const topSupplier = proveedores
      .slice()
      .sort((a, b) => {
        const calificacionDiff = this.toNumber(b.calificacion) - this.toNumber(a.calificacion);
        if (calificacionDiff !== 0) return calificacionDiff;
        return a.leadTimePromedio - b.leadTimePromedio;
      })[0] || null;

    return {
      kpis: {
        stockTotal,
        productosCriticos: criticos.length,
        alertasVop,
        tiempoPromedioEntrega: Number(avgLeadTime.toFixed(2)),
        ordenesPendientes: orderStates.pendiente || 0,
        ordenesRecibidas: orderStates.recibida || 0,
        valorOrdenes: Number(totalOrderValue.toFixed(2)),
      },
      resumen: {
        topSupplier: topSupplier ? {
          idProveedor: topSupplier.idProveedor,
          nombre: topSupplier.nombre,
          calificacion: Number(topSupplier.calificacion),
          leadTimePromedio: topSupplier.leadTimePromedio,
        } : null,
        orderStates,
      },
      ordenes,
    };
  }

  async getStockReport() {
    return this.prisma.inventario.findMany({
      include: { producto: true, almacen: true },
    });
  }

  async getCriticalProducts() {
    return this.prisma.inventario.findMany({
      where: {
        stockActual: {
          lte: this.prisma.inventario.fields.puntoPedido,
        },
      },
      include: { producto: true, almacen: true },
    });
  }

  async getMovementsReport() {
    const [entradas, salidas] = await Promise.all([
      this.prisma.entrada.findMany({ include: { detalles: { include: { producto: true } }, almacen: true, usuario: true } }),
      this.prisma.salida.findMany({ include: { detalles: { include: { producto: true } }, usuario: true } }),
    ]);

    return { entradas, salidas };
  }

  async logAction(data: {
    idUsuario: number;
    accion: string;
    tablaAfectada: string;
    idRegistroAfectado: string;
    valorAnterior?: unknown;
    valorNuevo?: unknown;
    ipOrigen: string;
  }) {
    // Cast to any to satisfy Prisma JSON input typing for audit fields.
    return this.prisma.logAuditoria.create({
      data: data as any,
    });
  }

  async listAuditLog() {
    return this.prisma.logAuditoria.findMany({
      orderBy: { fechaHora: 'desc' },
      take: 500,
      include: { usuario: true },
    });
  }

  async listPurchaseOrders() {
    return this.prisma.ordenCompra.findMany({
      orderBy: { fechaOrden: 'desc' },
      include: { proveedor: true, usuario: true, detalles: true },
    });
  }

  private async pdfFromStock(rows: any[], meta: { code: string; title: string; subtitle: string }) {
    const totalStock = rows.reduce((sum, row) => sum + this.toNumber(row.stockActual), 0);
    const critical = rows.filter((row) => this.toNumber(row.stockActual) <= this.toNumber(row.puntoPedido)).length;

    return this.bufferFromPdf((doc) => {
      this.buildPdfShell(doc, meta.title, meta.subtitle, meta.code);
      // Start drawing cards right after the header (buildPdfShell sets doc.y to 170)
      let currentY = doc.y;
      
      this.drawSummaryCard(doc, 'Registros', String(rows.length), 40, currentY, 120);
      this.drawSummaryCard(doc, 'Stock total', totalStock.toFixed(2), 170, currentY, 140);
      this.drawSummaryCard(doc, 'Críticos', String(critical), 320, currentY, 120);
      this.drawSummaryCard(doc, 'Estado', 'Operativo', 450, currentY, 120);
      
      doc.y = currentY + 58;

      this.drawTable(
        doc,
        [
          { header: 'Producto', width: 190 },
          { header: 'Almacén', width: 150 },
          { header: 'Stock', width: 85, align: 'right' },
          { header: 'Punto Pedido', width: 95, align: 'right' },
        ],
        rows.map((r) => [
          r.producto?.nombre || '-',
          r.almacen?.nombre || '-',
          this.toNumber(r.stockActual).toFixed(2),
          this.toNumber(r.puntoPedido).toFixed(2),
        ]),
        meta,
      );
    });
  }

  async generateStockReportPdf() {
    const rows = await this.prisma.inventario.findMany({ include: { producto: true, almacen: true } });
    return this.pdfFromStock(rows, {
      code: 'RPT-01',
      title: 'Stock general por almacen',
      subtitle: 'Inventario consolidado con stock actual, punto de pedido y ubicacion.',
    });
  }

  async generateCriticalReportPdf() {
    const rows = await this.prisma.inventario.findMany({
      where: { stockActual: { lte: this.prisma.inventario.fields.puntoPedido } },
      include: { producto: true, almacen: true },
    });
    return this.pdfFromStock(rows, {
      code: 'RPT-04',
      title: 'Productos criticos',
      subtitle: 'Productos con stock igual o inferior al punto de pedido.',
    });
  }

  async generateMovementsPdf() {
    const entradas = await this.prisma.entrada.findMany({ include: { detalles: { include: { producto: true } }, usuario: true } });
    const salidas = await this.prisma.salida.findMany({ include: { detalles: { include: { producto: true } }, usuario: true } });
    const rows: any[] = [];
    entradas.forEach((e) => rows.push({ type: 'Entrada', fecha: e.fechaEntrada, usuario: e.usuario?.usuario ?? '', detalle: e.detalles.map((d) => `${this.toNumber(d.cantidadRecibida)} x ${d.producto?.nombre}`).join('; ') }));
    salidas.forEach((s) => rows.push({ type: 'Salida', fecha: s.fechaSalida, usuario: s.usuario?.usuario ?? '', detalle: s.detalles.map((d) => `${this.toNumber(d.cantidad)} x ${d.producto?.nombre}`).join('; ') }));

    return this.bufferFromPdf((doc) => {
      this.buildPdfShell(doc, 'Movimientos de inventario', 'Registro cronológico de entradas y salidas con detalle resumido.', 'RPT-MOV');
      let currentY = doc.y;

      this.drawSummaryCard(doc, 'Entradas', String(entradas.length), 40, currentY, 120);
      this.drawSummaryCard(doc, 'Salidas', String(salidas.length), 170, currentY, 120);
      this.drawSummaryCard(doc, 'Movimientos', String(rows.length), 300, currentY, 120);
      this.drawSummaryCard(doc, 'Usuarios', String(new Set(rows.map((row) => row.usuario)).size), 430, currentY, 120);
      doc.y = currentY + 58;

      this.drawTable(
        doc,
        [
          { header: 'Tipo', width: 75 },
          { header: 'Fecha', width: 120 },
          { header: 'Usuario', width: 100 },
          { header: 'Detalle', width: 275 },
        ],
        rows.map((row) => [row.type, this.formatDate(row.fecha), row.usuario || '-', row.detalle || '-']),
        {
          code: 'RPT-MOV',
          title: 'Movimientos de inventario',
          subtitle: 'Registro cronológico de entradas y salidas con detalle resumido.',
        },
      );
    });
  }

  async generateSuppliersPdf() {
    const suppliers = await this.prisma.proveedor.findMany({ include: { proveedorProductos: { include: { producto: true } } } });
    return this.bufferFromPdf((doc) => {
      this.buildPdfShell(doc, 'Catálogo de proveedores', 'Lista de proveedores con lead time promedio y productos asignados.', 'RPT-PROV');
      let currentY = doc.y;

      const productoTotal = suppliers.reduce((sum, supplier) => sum + supplier.proveedorProductos.length, 0);
      const leadPromedio = suppliers.length
        ? (suppliers.reduce((sum, supplier) => sum + Number(supplier.leadTimePromedio || 0), 0) / suppliers.length).toFixed(2)
        : '0.00';

      this.drawSummaryCard(doc, 'Proveedores', String(suppliers.length), 40, currentY, 120);
      this.drawSummaryCard(doc, 'Productos', String(productoTotal), 170, currentY, 120);
      this.drawSummaryCard(doc, 'Lead time prom.', `${leadPromedio} días`, 300, currentY, 140);
      this.drawSummaryCard(doc, 'Cobertura', 'Activa', 450, currentY, 120);
      doc.y = currentY + 58;

      this.drawTable(
        doc,
        [
          { header: 'Proveedor', width: 160 },
          { header: 'RUC', width: 95 },
          { header: 'Lead time', width: 85, align: 'right' },
          { header: 'Productos', width: 250 },
        ],
        suppliers.map((supplier) => [
          supplier.nombre,
          supplier.ruc || '-',
          `${supplier.leadTimePromedio} días`,
          supplier.proveedorProductos.map((pp) => `${pp.producto?.nombre || '-'} @ ${this.toNumber(pp.precioUnitario).toFixed(2)}`).join('; ') || '-',
        ]),
        {
          code: 'RPT-PROV',
          title: 'Catálogo de proveedores',
          subtitle: 'Lista de proveedores con lead time promedio y productos asignados.',
        },
      );
    });
  }

  async generateAuditLogPdf() {
    const audit = await this.listAuditLog();

    return this.bufferFromPdf((doc) => {
      this.buildPdfShell(doc, 'Auditoría del sistema', 'Eventos recientes registrados por el sistema y usuarios autenticados.', 'RPT-AUD');
      let currentY = doc.y;

      this.drawSummaryCard(doc, 'Eventos', String(audit.length), 40, currentY, 120);
      this.drawSummaryCard(doc, 'Usuarios', String(new Set(audit.map((row: any) => row.usuario?.usuario)).size), 170, currentY, 120);
      this.drawSummaryCard(doc, 'Último evento', audit.length ? this.formatDate(audit[0].fechaHora) : 'N/A', 300, currentY, 160);
      this.drawSummaryCard(doc, 'Trazabilidad', 'Completa', 470, currentY, 100);
      doc.y = currentY + 58;

      this.drawTable(
        doc,
        [
          { header: 'Fecha', width: 120 },
          { header: 'Usuario', width: 90 },
          { header: 'Acción', width: 120 },
          { header: 'Tabla', width: 100 },
          { header: 'Registro', width: 100 },
          { header: 'IP', width: 70 },
        ],
        audit.map((row: any) => [
          this.formatDate(row.fechaHora),
          row.usuario?.usuario || '-',
          row.accion || '-',
          row.tablaAfectada || '-',
          String(row.idRegistroAfectado || '-'),
          row.ipOrigen || '-',
        ]),
        {
          code: 'RPT-AUD',
          title: 'Auditoría del sistema',
          subtitle: 'Eventos recientes registrados por el sistema y usuarios autenticados.',
        },
      );
    });
  }

  async sendReportByEmail(type: string, to: string) {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      throw new Error('SendGrid not configured. Set SENDGRID_API_KEY and EMAIL_FROM in env');
    }

    sendgridMail.setApiKey(apiKey);

    let buffer: Buffer;
    switch (type) {
      case 'stock':
        buffer = await this.generateStockReportPdf();
        break;
      case 'critical':
        buffer = await this.generateCriticalReportPdf();
        break;
      case 'movements':
        buffer = await this.generateMovementsPdf();
        break;
      case 'suppliers':
        buffer = await this.generateSuppliersPdf();
        break;
      case 'audit':
        buffer = await this.generateAuditLogPdf();
        break;
      default:
        buffer = await this.generateStockReportPdf();
    }

    await sendgridMail.send({
      to,
      from,
      subject: `SGE Report - ${type}`,
      text: 'Adjunto reporte SGE',
      attachments: [{ filename: `report-${type}.pdf`, content: buffer.toString('base64'), type: 'application/pdf', disposition: 'attachment' }],
    });
    return true;
  }
}
