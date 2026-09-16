export type Status = 'Delivered' | 'Pending' | 'Cancelled';

export interface Order {
  id: string; area: string; date: string; item: string;
  qty: number; kd: number; unit: number; pay: string;
  status: Status; dated: boolean;
}
export interface Bucket { orders: number; revenue: number; qty: number }
export interface WeekStat {
  label: string; orders: number; revenue_kd: number; aov_kd: number;
  premium_orders: number; premium_revenue_kd: number;
  cheap_orders: number; cheap_revenue_kd: number;
}
export interface Metrics {
  raw_rows: number; clean_rows: number; excluded_rows: number;
  unique_order_ids: number; orders_total: number;
  delivered_orders: number; cancelled_orders: number; pending_orders: number;
  delivered_revenue_kd: number; cancelled_value_kd: number; pending_value_kd: number;
  all_orders_value_kd: number; avg_order_value_kd: number;
  areas_covered: number; items_covered: number;
  date_min: string; date_max: string; trading_days: number;
  delivered_dated: number; delivered_with_known_area: number;
  delivered_revenue_known_area_kd: number; delivered_revenue_unknown_area_kd: number;
  by_area_delivered: Record<string, Bucket>;
  by_item_delivered: Record<string, Bucket>;
  by_status_all: Record<string, Bucket>;
  by_payment_delivered: Record<string, Bucket>;
  by_day: Record<string, { orders: number; delivered: number; cancelled: number; pending: number; revenue: number }>;
  price_list_kd: Record<string, number>;
  cancellation_rate_pct: number;
  weeks: { week1: WeekStat; week2: WeekStat; orders_change_pct: number;
           revenue_change_pct: number; revenue_change_kd: number; aov_change_pct: number };
  mix: { premium_items: string[]; cheap_items: string[];
         premium_orders: number; premium_revenue_kd: number;
         premium_order_share_pct: number; premium_revenue_share_pct: number;
         cheap_orders: number; cheap_revenue_kd: number;
         cheap_order_share_pct: number; cheap_revenue_share_pct: number };
  cancellation_by_item: Record<string, { orders: number; cancelled: number; rate_pct: number; lost_kd: number }>;
  cancellation_by_area: Record<string, { orders: number; cancelled: number; rate_pct: number; lost_kd: number }>;
  checks: Record<string, Record<string, unknown>>;
}
export interface CleaningEntry { problem: string; fix: string; why: string; rows_affected: number }
export interface ExcludedRow {
  line_in_raw_file: number; order_id: string; reason: string; raw: Record<string, string>;
}
export interface Audit {
  total_rows: number; total_columns: number; columns: string[];
  columns_detail: Record<string, {
    blank_or_missing: number; leading_trailing_whitespace: number;
    distinct_raw_values: number; value_kinds: Record<string, number>; inferred_type: string }>;
  duplicate_rows_identical: { extra_copies: number; groups: number };
  order_id: { distinct: number; ids_appearing_more_than_once: number; rows_involved: number;
              extra_rows_beyond_first: number; examples: Record<string, number>; blank_ids: number };
  date_formats: Record<string, number>;
  amount_formats: Record<string, number>;
  amount_decimal_places: Record<string, number>;
  impossible_values: Record<string, number>;
  impossible_rows: Record<string, Array<Array<string | number>>>;
  phone_formats: Record<string, number>;
  email_missing: number;
  variants: Record<string, { distinct_raw_strings: number; all_raw_counts: Record<string, number> }>;
}
export interface Filters {
  area: string; status: string; item: string; from: string; to: string;
}
