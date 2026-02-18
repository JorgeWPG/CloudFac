export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} con id '${id}' no encontrado.`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "No autorizado para realizar esta acción.") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class NubefactError extends DomainError {
  constructor(
    message: string,
    public readonly nubefactCode?: string
  ) {
    super(message, "NUBEFACT_ERROR");
    this.name = "NubefactError";
  }
}

export class StockInsuficienteError extends DomainError {
  constructor(productoId: string, disponible: number, requerido: number) {
    super(
      `Stock insuficiente para el producto '${productoId}'. Disponible: ${disponible}, requerido: ${requerido}.`,
      "STOCK_INSUFICIENTE"
    );
    this.name = "StockInsuficienteError";
  }
}
