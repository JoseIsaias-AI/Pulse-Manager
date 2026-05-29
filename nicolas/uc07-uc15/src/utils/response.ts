export function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

export function created<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

export function fail(message: string): { success: false; message: string } {
  return { success: false, message };
}
