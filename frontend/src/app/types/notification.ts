export interface NotificationItem {
  id: number;
  user_id: number;
  analysis_id?: number | null;
  report_id?: number | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
