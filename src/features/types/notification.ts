export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: "info" | "success" | "warning" | "critical";
  is_read: boolean;
  created_at: string;
  entity_id?: string;
  entity_type?: string;
  metadata?: Record<string, unknown> | null;
}
