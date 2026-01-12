// Token Management Key
const TOKEN_KEY = "token"; // client.ts ilə eyni açarı istifadə edirik

export const tokenManager = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
  has: () => !!localStorage.getItem(TOKEN_KEY),
};

// Request Interceptor
// Sorğu serverə getməzdən əvvəl işə düşür:
// 1. Tokeni yoxlayır və header-ə əlavə edir
// 2. Content-Type tənzimləyir
export const requestInterceptor = (options: RequestInit = {}): RequestInit => {
  const headers = new Headers(options.headers);
  const token = tokenManager.get();

  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Body FormData deyilsə, JSON olaraq işarələyir
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");

  return { ...options, headers };
};

// Response Interceptor
// Serverdən cavab gəldikdən sonra işə düşür:
// 1. 401 (Unauthorized) xətasını tutur və sessiyanı bitirir
// 2. Digər HTTP xətalarını emal edir
// 3. JSON cavabı parse edir
export const responseInterceptor = async (response: Response) => {
  if (response.status === 401) {
    tokenManager.remove();
    // Gələcəkdə bura yönləndirmə (redirect) məntiqi əlavə edilə bilər
    // window.location.href = "/login";
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Xətanı standart formatda fırladırıq
    throw {
      message: errorData.message || `Xəta baş verdi: ${response.status}`,
      statusCode: response.status,
      data: errorData,
    };
  }

  // 204 No Content (Boş uğurlu cavab) üçün
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
};
