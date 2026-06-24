import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { MotivoSalida, RolUsuario } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { SgeService } from './sge.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SgeController {
  constructor(private readonly sgeService: SgeService) {}

  @Get('users')
  @Roles('administrador')
  listUsers() {
    return this.sgeService.listUsers();
  }

  @Post('users')
  @Roles('administrador')
  async createUser(@Body() body: {
    nombres: string;
    apellidos: string;
    usuario: string;
    password: string;
    rol: RolUsuario;
  }) {
    const passwordHash = await hash(body.password, 10);
    return this.sgeService.createUser({ ...body, passwordHash });
  }

  @Patch('users/:id/rol')
  @Roles('administrador')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rol: RolUsuario },
  ) {
    return this.sgeService.updateUserRole(id, body.rol);
  }

  @Patch('users/:id/inactivar')
  @Roles('administrador')
  inactivateUser(@Param('id', ParseIntPipe) id: number) {
    return this.sgeService.inactivateUser(id);
  }

  @Get('products')
  @Roles('administrador', 'gerente', 'compras', 'almacen')
  listProducts() {
    return this.sgeService.listProducts();
  }

  @Post('products')
  @Roles('administrador', 'compras', 'almacen')
  createProduct(@Body() body: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    unidadMedida: string;
    categoria: string;
    tipoExistenciaPgc: number;
    metodoImputacion: 'directo' | 'indirecto';
    capacidadAlmacenamiento: 'almacenable' | 'no_almacenable';
    sistemaReposicion?: 'nivel' | 'cobertura' | 'mixto';
    idAlmacen?: number;
    pasillo?: string;
    nivel?: string;
  }) {
    return this.sgeService.createProduct(body);
  }

  @Patch('products/:id')
  @Roles('administrador', 'compras', 'almacen')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.sgeService.updateProduct(id, body);
  }

  @Patch('products/:id/inactivar')
  @Roles('administrador', 'compras', 'almacen')
  inactivateProduct(@Param('id', ParseIntPipe) id: number) {
    return this.sgeService.inactivateProduct(id);
  }

  @Get('suppliers')
  @Roles('administrador', 'gerente', 'compras')
  listSuppliers() {
    return this.sgeService.listSuppliers();
  }

  @Post('suppliers')
  @Roles('administrador', 'compras')
  createSupplier(@Body() body: any) {
    return this.sgeService.createSupplier(body);
  }

  @Patch('suppliers/:id')
  @Roles('administrador', 'compras')
  updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.sgeService.updateSupplier(id, body);
  }

  @Patch('suppliers/:id/inactivar')
  @Roles('administrador', 'compras')
  inactivateSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.sgeService.inactivateSupplier(id);
  }

  @Post('suppliers/product')
  @Roles('administrador', 'compras')
  assignSupplierProduct(
    @Body()
    body: { idProveedor: number; idProducto: number; precioUnitario: number },
  ) {
    return this.sgeService.assignSupplierProduct(body);
  }

  @Post('purchase-orders')
  @Roles('administrador', 'compras')
  createPurchaseOrder(
    @Request() req: { user: { sub: number } },
    @Body()
    body: {
      idProveedor: number;
      fechaEntregaEstimada: string;
      observaciones?: string;
      items: Array<{
        idProducto: number;
        cantidadSolicitada: number;
        precioUnitario: number;
      }>;
    },
  ) {
    return this.sgeService.createPurchaseOrder({
      ...body,
      idUsuario: req.user.sub,
    });
  }

  @Patch('purchase-orders/:id/status')
  @Roles('administrador', 'gerente')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: any; observaciones?: string },
  ) {
    return this.sgeService.updateOrderStatus(id, body.estado, body.observaciones);
  }

  @Post('purchase-orders/receive')
  @Roles('administrador', 'almacen')
  receiveOrder(
    @Request() req: { user: { sub: number } },
    @Body()
    body: {
      idOrdenCompra: number;
      idAlmacen: number;
      nroComprobante: string;
      observacion?: string;
      items: Array<{ idProducto: number; cantidadRecibida: number; costoUnitario: number }>;
    },
  ) {
    return this.sgeService.receiveOrder({
      ...body,
      idUsuario: req.user.sub,
    });
  }

  @Post('inventory/out')
  @Roles('administrador', 'almacen')
  stockOut(
    @Request() req: { user: { sub: number } },
    @Body()
    body: {
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
    },
  ) {
    return this.sgeService.registerStockOut({
      ...body,
      idUsuario: req.user.sub,
    });
  }

  @Patch('inventory/adjust')
  @Roles('administrador', 'almacen')
  adjustInventory(
    @Request() req: { user: { sub: number } },
    @Body()
    body: {
      idProducto: number;
      idAlmacen: number;
      stockActual: number;
      justificacion: string;
    },
  ) {
    return this.sgeService.adjustInventory({
      ...body,
      idUsuario: req.user.sub,
    });
  }

  @Get('parametros')
  @Roles('administrador', 'gerente')
  getParametros() {
    return this.sgeService.getOrCreateParametros();
  }

  @Patch('parametros')
  @Roles('administrador', 'gerente')
  updateParametros(
    @Body()
    body: {
      nivelServicio?: number;
      costoPedido?: number;
      costoAlmacenamiento?: number;
      umbralMinimoOc?: number;
      diasLaborales?: number;
    },
  ) {
    return this.sgeService.updateParametros(body);
  }

  @Post('logistica/vop')
  @Roles('administrador', 'gerente', 'compras')
  computeVop(@Body() body: { D: number; Cg: number; Cp: number }) {
    return this.sgeService.computeVop(body);
  }

  @Post('logistica/safety-stock')
  @Roles('administrador', 'gerente', 'compras')
  computeSafetyStock(@Body() body: { sigma: number; nivelServicio: number }) {
    return this.sgeService.computeSafetyStock(body);
  }

  @Post('logistica/reorder-point')
  @Roles('administrador', 'gerente', 'compras')
  computeReorderPoint(
    @Body()
    body: {
      demandaAnual: number;
      leadTimeDias: number;
      stockSeguridad: number;
      diasLaborales: number;
    },
  ) {
    return this.sgeService.computeReorderPoint(body);
  }

  @Post('abc/recompute')
  @Roles('administrador', 'gerente')
  recomputeAbc(@Body() body: { lote?: string }) {
    return this.sgeService.recomputeAbc(body.lote);
  }

  @Get('purchase-orders')
  @Roles('administrador', 'gerente', 'compras')
  listPurchaseOrders() {
    return this.sgeService.listPurchaseOrders();
  }

  @Get('reports/movements/pdf')
  @Roles('administrador', 'gerente', 'almacen')
  async downloadMovementsPdf(@Response() res: any) {
    const buffer = await this.sgeService.generateMovementsPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="RPT-movements.pdf"');
    res.send(buffer);
  }

  @Get('reports/suppliers/pdf')
  @Roles('administrador', 'gerente', 'compras')
  async downloadSuppliersPdf(@Response() res: any) {
    const buffer = await this.sgeService.generateSuppliersPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="RPT-suppliers.pdf"');
    res.send(buffer);
  }

  @Get('reports/audit/pdf')
  @Roles('administrador', 'gerente')
  async downloadAuditPdf(@Response() res: any) {
    const buffer = await this.sgeService.generateAuditLogPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="RPT-audit.pdf"');
    res.send(buffer);
  }

  @Post('reports/send')
  @Roles('administrador', 'gerente')
  async sendReport(@Body() body: { type: string; to: string }) {
    return this.sgeService.sendReportByEmail(body.type, body.to);
  }

  @Get('reports/stock/pdf')
  @Roles('administrador', 'gerente')
  async downloadStockPdf(@Request() req: any, @Response() res: any) {
    const buffer = await this.sgeService.generateStockReportPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="RPT-01-stock.pdf"');
    res.send(buffer);
  }

  @Get('reports/critical/pdf')
  @Roles('administrador', 'gerente', 'compras', 'almacen')
  async downloadCriticalPdf(@Request() req: any, @Response() res: any) {
    const buffer = await this.sgeService.generateCriticalReportPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="RPT-04-critical.pdf"');
    res.send(buffer);
  }

  @Get('dashboard')
  @Roles('administrador', 'gerente')
  dashboard() {
    return this.sgeService.getDashboard();
  }

  @Get('reports/stock')
  @Roles('administrador', 'gerente', 'compras', 'almacen')
  reportStock() {
    return this.sgeService.getStockReport();
  }

  @Get('reports/critical')
  @Roles('administrador', 'gerente', 'compras', 'almacen')
  reportCritical() {
    return this.sgeService.getCriticalProducts();
  }

  @Get('reports/movements')
  @Roles('administrador', 'gerente', 'almacen')
  reportMovements() {
    return this.sgeService.getMovementsReport();
  }

  @Get('audit-log')
  @Roles('administrador')
  auditLog() {
    return this.sgeService.listAuditLog();
  }
}
