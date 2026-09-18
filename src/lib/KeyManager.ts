// src/lib/KeyManager.ts

export class KeyManager {
  private keys: string[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.initKeys();
  }

  /**
   * Khởi tạo danh sách API Keys từ biến môi trường
   * Các key được phân cách bằng dấu phẩy, ví dụ: LLM_API_KEYS="key1,key2,key3"
   */
  private initKeys() {
    const keysString = process.env.LLM_API_KEYS || "";
    if (keysString) {
      this.keys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);
    }
    
    if (this.keys.length === 0) {
      console.warn("⚠️ KeyManager: Không tìm thấy LLM_API_KEYS trong môi trường (env). Vui lòng cấu hình!");
    }
  }

  /**
   * Lấy API Key hiện tại
   */
  public getCurrentKey(): string | null {
    if (this.keys.length === 0) return null;
    return this.keys[this.currentIndex];
  }

  /**
   * Báo cáo lỗi cho một Key. Nếu là lỗi 429 (Rate Limit), tự động chuyển sang Key tiếp theo.
   */
  public reportError(failedKey: string, statusCode?: number) {
    // Chỉ xoay vòng key khi gặp lỗi Rate Limit (429) hoặc quá tải (503)
    if (statusCode === 429 || statusCode === 503) {
      console.log(`🔄 KeyManager: Key hiện tại bị giới hạn (Status: ${statusCode}). Đang xoay vòng API Key...`);
      this.rotateKey();
    }
  }

  /**
   * Chuyển sang sử dụng Key tiếp theo trong mảng
   */
  private rotateKey() {
    if (this.keys.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      console.log(`✅ KeyManager: Đã chuyển sang API Key ở vị trí [${this.currentIndex}].`);
    } else {
      console.warn("⚠️ KeyManager: Không có API Key dự phòng để xoay vòng!");
    }
  }

  /**
   * Cập nhật lại mảng keys (dùng cho API admin muốn nạp thêm key trực tiếp)
   */
  public updateKeys(newKeys: string[]) {
    this.keys = newKeys.filter(k => k.trim().length > 0);
    this.currentIndex = 0; // Reset về key đầu tiên
  }
}

// Singleton instance
export const llmKeyManager = new KeyManager();
