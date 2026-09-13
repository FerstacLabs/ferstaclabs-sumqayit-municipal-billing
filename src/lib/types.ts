export type EntityStatus = "active" | "inactive";
export type Role =
  | "super_admin"
  | "finance_admin"
  | "area_manager"
  | "operator"
  | "document_officer"
  | "auditor";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type CertificateStatus = "pending" | "issued" | "rejected" | "expired";
export type VerificationMethod = "sms" | "sima" | "asan";

export interface Area {
  id: string;
  name: string;
  manager: string;
}
export interface Building {
  id: string;
  areaId: string;
  street: string;
  number: string;
  entrances: number;
  apartments: number;
  status: EntityStatus;
}
export interface Property {
  id: string;
  paymentCode: string;
  internalCode: string;
  buildingId: string;
  areaId: string;
  address: string;
  apartment: string;
  areaSqm: number;
  residents: number;
  ownerMasked: string;
  balanceCents: number;
  status: EntityStatus;
  ownerHistory: { ownerMasked: string; from: string; to: string | null }[];
}
export interface CommercialObject {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string;
  areaId: string;
  areaSqm: number;
  tariffCents: number;
  manager: string;
  approvalStatus: ApprovalStatus;
}
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  areaId: string | null;
  active: boolean;
  mfaRequired: boolean;
}
export interface Tariff {
  id: string;
  name: string;
  type: "residential" | "commercial";
  unit: string;
  amountCents: number;
  effectiveDate: string;
  createdBy: string;
  approvedBy: string | null;
  status: ApprovalStatus;
  commercialObjectId?: string;
}
export interface InvoiceLine {
  name: string;
  quantity: number;
  unitCents: number;
  amountCents: number;
}
export interface Invoice {
  id: string;
  propertyId: string;
  propertyCode: string;
  period: string;
  createdAt: string;
  dueDate: string;
  lines: InvoiceLine[];
  totalCents: number;
  paidCents: number;
  status: "unpaid" | "partial" | "paid";
  snapshot: {
    residents: number;
    areaSqm: number;
    wasteUnitCents: number;
    housingUnitCents: number;
  };
}
export interface Payment {
  id: string;
  transactionId: string;
  propertyId: string;
  propertyCode: string;
  provider: string;
  amountCents: number;
  status: "success" | "failed" | "pending";
  createdAt: string;
  reconciliationStatus: "matched" | "unmatched" | "mismatch";
  receiptNumber: string;
}
export interface AuditEvent {
  id: string;
  actor: string;
  module: string;
  action: string;
  oldValue: string;
  newValue: string;
  ip: string;
  createdAt: string;
  reason: string;
}
export interface Certificate {
  id: string;
  documentNumber: string;
  propertyCode: string;
  propertyId: string;
  issuedAt: string;
  expiresAt: string;
  status: CertificateStatus;
  method: VerificationMethod;
  debtCents: number;
  address: string;
}
export interface PublicCertificate {
  id: string;
  documentNumber: string;
  propertyCodeMasked: string;
  issuedAt: string;
  expiresAt: string;
  status: CertificateStatus;
  valid: boolean;
  debtStatus: string;
}
export interface BillingPeriod {
  id: string;
  period: string;
  status: "open" | "generated" | "closed";
  invoiceCount: number;
  totalCents: number;
  generatedAt: string | null;
}
export interface ReconciliationRow {
  id: string;
  transactionId: string;
  providerAmountCents: number;
  ledgerAmountCents: number | null;
  status: "matched" | "mismatch" | "missing" | "duplicate";
  note: string;
  reviewed?: boolean;
  resolution?: string;
}
export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
export interface DemoState {
  version: number;
  updatedAt: string;
  areas: Area[];
  buildings: Building[];
  properties: Property[];
  commercialObjects: CommercialObject[];
  users: DemoUser[];
  tariffs: Tariff[];
  invoices: Invoice[];
  payments: Payment[];
  auditEvents: AuditEvent[];
  certificates: Certificate[];
  billingPeriods: BillingPeriod[];
  reconciliationRows: ReconciliationRow[];
  supportMessages: SupportMessage[];
}

export type DemoAction =
  | {
      type: "pay";
      propertyCode: string;
      amountCents: number;
      transactionId: string;
      provider?: string;
    }
  | {
      type: "issue_certificate";
      propertyCode: string;
      method: VerificationMethod;
      otp?: string;
    }
  | {
      type: "support";
      name: string;
      email: string;
      subject: string;
      message: string;
    }
  | { type: "save_building"; building: Omit<Building, "id"> & { id?: string } }
  | {
      type: "save_property";
      propertyId: string;
      residents: number;
      areaSqm: number;
      reason: string;
    }
  | {
      type: "save_commercial_tariff";
      commercialObjectId: string;
      amountCents: number;
      effectiveDate: string;
      reason: string;
    }
  | {
      type: "approve_tariff";
      tariffId: string;
      status: "approved" | "rejected";
      reason?: string;
    }
  | { type: "generate_billing"; period: string }
  | {
      type: "provider_callback";
      transactionId: string;
      propertyCode: string;
      amountCents: number;
    }
  | { type: "import_reconciliation" }
  | { type: "review_reconciliation"; rowId: string; resolution: string }
  | {
      type: "review_certificate";
      certificateId: string;
      status: "issued" | "rejected";
      reason?: string;
    };

export interface ActionResult {
  data: DemoState;
  message: string;
  payment?: Payment;
  certificate?: Certificate;
  duplicate?: boolean;
}
