# CloudFac — Facturación Electrónica para Perú

SaaS de facturación electrónica para Perú, estilo FreshBooks. Emite **facturas, boletas y notas de crédito/débito** electrónicas integradas con **SUNAT vía NubeFact**. Soporte multi-empresa, multi-establecimiento y control de inventario.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 |
| UI | Tailwind CSS + Radix UI |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL |
| Auth | NextAuth v5 |
| API Externa | NubeFact (SUNAT) |
| Almacenamiento | AWS S3 |
| Arquitectura | Clean Architecture |

---

## Arquitectura

El proyecto sigue **Clean Architecture** con cuatro capas bien definidas:

```
src/
├── domain/              # Capa de dominio (núcleo)
│   ├── entities/        # Entidades del negocio
│   ├── repositories/    # Interfaces de repositorios
│   ├── value-objects/   # Enums y VOs del dominio
│   └── errors/          # Errores de dominio tipados
│
├── application/         # Capa de aplicación
│   ├── use-cases/       # Casos de uso (lógica de negocio)
│   ├── dtos/            # DTOs y schemas de validación (Zod)
│   └── services/        # Interfaces de servicios externos
│
├── infrastructure/      # Capa de infraestructura
│   ├── database/        # Cliente Prisma
│   ├── repositories/    # Implementaciones con Prisma
│   └── external/
│       ├── nubefact/    # Integración NubeFact API
│       └── s3/          # Integración AWS S3
│
└── app/                 # Capa de presentación (Next.js App Router)
    ├── (auth)/          # Rutas de autenticación
    ├── (dashboard)/     # Dashboard protegido
    └── api/             # API Routes
```

---

## Modelos de datos (Prisma)

### Multi-tenancy

Todas las tablas incluyen `tenantId` para aislamiento completo de datos entre clientes del SaaS.

### Modelos principales

| Modelo | Descripción |
|---|---|
| `Tenant` | Cuenta SaaS (suscriptor) |
| `User` | Usuarios con roles (OWNER, ADMIN, ACCOUNTANT, STAFF) |
| `Company` | Empresa con RUC y credenciales NubeFact |
| `Establishment` | Establecimiento SUNAT (código 4 dígitos) |
| `Serie` | Series de comprobantes (F001, B001, etc.) |
| `Customer` | Clientes / receptores del comprobante |
| `Product` | Productos y servicios (con flag `isService` y `stockControl`) |
| `Invoice` | Comprobante electrónico (Factura, Boleta, NC, ND) |
| `InvoiceItem` | Líneas de detalle del comprobante |
| `Payment` | Pagos con soporte de voucher en AWS S3 |

---

## Inicio rápido

### 1. Prerrequisitos

- Node.js 20+
- PostgreSQL 15+
- Cuenta en [NubeFact](https://nubefact.com)
- Bucket AWS S3

### 2. Instalación

```bash
npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 4. Base de datos

```bash
# Crear la base de datos y aplicar migraciones
npm run db:migrate

# Generar el cliente Prisma
npm run db:generate

# Poblar con datos de prueba
npm run db:seed
```

### 5. Desarrollo

```bash
npm run dev
# Abre http://localhost:3000
```

---

## Scripts disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run db:migrate       # Aplicar migraciones (dev)
npm run db:migrate:prod  # Aplicar migraciones (producción)
npm run db:seed          # Seed de datos iniciales
npm run db:studio        # Prisma Studio (GUI)
npm run db:reset         # Resetear la base de datos
```

---

## Integración NubeFact

La integración con **NubeFact** permite:

- Envío de comprobantes a SUNAT en tiempo real
- Descarga de PDF, XML y CDR almacenados en S3
- Solicitud de baja (anulación) de comprobantes
- Estado de respuesta SUNAT (ACEPTADO, RECHAZADO, OBSERVADO)

Cada empresa puede tener sus propias credenciales NubeFact (`nubefactToken`, `nubefactUrl`).

---

## Tipos de comprobante soportados

| Tipo | Código SUNAT | Serie ejemplo |
|---|---|---|
| Factura Electrónica | 01 | F001 |
| Boleta de Venta | 03 | B001 |
| Nota de Crédito | 07 | FC01 |
| Nota de Débito | 08 | FD01 |
| Recibo Honorarios | 99 | RH01 |
