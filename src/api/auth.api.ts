import request from "@/utils/request";

const AUTH_BASE_URL = "/api/auth";

const AuthAPI = {
  /** 登录接口*/
  login(data: LoginFormData) {
    return request<any, string>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data,
    });
  },

  /** 注销接口*/
  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },
};

export default AuthAPI;

/** 登录请求参数 */
export interface LoginFormData {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
}

/** 登录响应 */
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间(秒) */
  expiresIn: number;
}

/** 验证码响应 */
export interface CaptchaResult {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码图片Base64字符串 */
  captchaBase64: string;
}
