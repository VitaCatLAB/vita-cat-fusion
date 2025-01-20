import { nanoid } from 'nanoid';
import { dataURLtoBlob } from '../file/base64Conver';

import { createOssClient } from './sts';

// function convertBase64UrlToBlob(urlData: string) {
//   const arr: any = urlData.split(',');
//   const mime = arr[0].match(/:(.*?);/)[1];
//   const bstr = window.atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n);
//   }
//   return new Blob([u8arr], { type: mime });
// }

/**
 * 将 Base64 编码的文件上传到 OSS
 * @param base64Url Base64 编码的文件内容
 * @param fileName 文件名
 * @param path 存储路径（可选，默认空字符串）
 * @returns 上传后的文件 URL
 */
export const uploadBase64File = async (base64Url: string, fileName: string, path = '') => {
  // 将 Base64 字符串转换为 Blob 对象
  const img = dataURLtoBlob(base64Url);

  // 调用 OSS 上传接口，上传文件并获取返回的 URL
  const uploadUrlRes = await uploadFileByOSS(img, fileName, path);

  return uploadUrlRes; // 返回上传后的文件 URL
};
/**
 * 生成上传文件的 OSS 文件名
 * @param _name 文件名
 * @param _path 文件存储路径（可选，默认空字符串）
 * @param _useUUID 是否使用 UUID（可选，默认使用）
 * @returns 生成的 OSS 文件路径和文件名
 */
export const prefixFileNameByOss = (
  _name: string,
  _path: string = '',
  _useUUID: boolean = true,
) => {
  const uuid = nanoid(8); // 生成一个 8 位的随机 UUID
  const path = _path ? `${_path}/` : ''; // 如果有指定路径，加入路径分隔符
  const name = `/src/${path}${_useUUID ? uuid : ''}-${_name}`; // 构建文件名：路径 + UUID（可选） + 文件名

  return name; // 返回完整的文件名（包括路径和 UUID）
};
export const uploadFileByOSS = async (
  _file: any,
  _name: string,
  _path: string = '',
  _useUUID: boolean = true,
) => {
  const ossClient = await createOssClient();
  const name = prefixFileNameByOss(_name, _path, _useUUID);
  console.log('name', name);

  let url = '';
  try {
    const result = await ossClient.put(name, _file);
    url = result.url;
  } catch (error) {
    console.log(error);
  }
  return url;
};
