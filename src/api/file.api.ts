import request from "@/utils/request";
const FILE_BASE_URL = "/api/file";
class FileAPI {
  /**
   * 上传头像
   *
   * @param file
   */
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filePath", "images/avatar");
    return request<any, FileInfo>({
      url: `${FILE_BASE_URL}/uploadImage`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default new FileAPI();

// const FileAPI = {
//   /**
//    * 上传文件
//    *
//    * @param file
//    */
//   upload(formData: FormData) {
//     return request<any, FileInfo>({
//       url: "/api/v1/files",
//       method: "post",
//       data: formData,
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   },

//   /**
//    * 上传文件
//    */
//   uploadFile(file: File) {
//     const formData = new FormData();
//     formData.append("file", file);
//     return request<any, FileInfo>({
//       url: "/api/v1/files",
//       method: "post",
//       data: formData,
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   },

//   /**
//    * 删除文件
//    *
//    * @param filePath 文件完整路径
//    */
//   delete(filePath?: string) {
//     return request({
//       url: "/api/v1/files",
//       method: "delete",
//       params: { filePath: filePath },
//     });
//   },

//   /**
//    * 下载文件
//    * @param url
//    * @param fileName
//    */
//   download(url: string, fileName?: string) {
//     return request({
//       url: url,
//       method: "get",
//       responseType: "blob",
//     }).then((res) => {
//       const blob = new Blob([res.data]);
//       const a = document.createElement("a");
//       const url = window.URL.createObjectURL(blob);
//       a.href = url;
//       a.download = fileName || "下载文件";
//       a.click();
//       window.URL.revokeObjectURL(url);
//     });
//   },
// };

// export default FileAPI;

/**
 * 文件API类型声明
 */
export interface FileInfo {
  /** 原文件名 */
  originalname: string;
  /** 文件路径 */
  url: string;
}
