import request from "@/utils/request";

export default class BaseApi {
  constructor(public baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getOne<T>(id: number) {
    return request<any, T>({
      url: `${this.baseUrl}/${id}`,
      method: "get",
    });
  }

  getOneBy<T>(params: any) {
    return request<any, T>({
      url: `${this.baseUrl}`,
      method: "get",
      params,
    });
  }

  getOptions() {
    return request<any, OptionType[]>({
      url: `${this.baseUrl}/options`,
      method: "get",
    });
  }

  getList<T>(data: any) {
    return request<any, T[]>({
      url: `${this.baseUrl}`,
      method: "get",
      data: data,
    });
  }

  getPageList<T>(queryParams: string) {
    return request<any, PageResult<T[]>>({
      url: `${this.baseUrl}?${queryParams}`,
      method: "get",
    });
  }

  createOne(data: any) {
    return request({
      url: `${this.baseUrl}`,
      method: "post",
      data: data,
    });
  }

  updateOne(id: number, data: any) {
    return request({
      url: `${this.baseUrl}/${id}`,
      method: "put",
      data: data,
    });
  }

  deleteOne(id: number) {
    return request({
      url: `${this.baseUrl}/${id}`,
      method: "delete",
    });
  }
}
