type ApiEnvelope<T> = {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
  success?: boolean;
};

export function extractApiData<T>(payload: ApiEnvelope<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}
