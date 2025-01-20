import OSS from 'ali-oss';

// const ossSTSUpload = async (file: any) => {
//   const client = new OSS({
//     // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
//     region: 'oss-cn-zhangjiakou',
//     // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
//     accessKeyId: res.accessKeyId,
//     accessKeySecret: res.accessKeySecret,
//     // 从STS服务获取的安全令牌（SecurityToken）。
//     stsToken: res.securityToken,

//     // 刷新临时访问凭证的时间间隔，单位为毫秒。
//     refreshSTSTokenInterval: 300000,
//     // 填写Bucket名称。
//     bucket: 'wetalk-server',
//   });

//   const res = await client.signatureUrl('test.jpg', {
//     expires: 3600,
//   });
//   return res;
// };

const fetchOssToken = async () => {
  // 模拟从服务端获取 OSS Token 的逻辑
  return {
    accessKeyId: 'yourAccessKeyId',
    accessKeySecret: 'yourAccessKeySecret',
    securityToken: 'yourSecurityToken',
    expiration: 'yourExpirationTime',
    bucketName: 'yourBucketName',
    regionId: 'yourRegionId',
  };
};
const getOssSign = async () => {
  const body = {
    accessKeyId: '',
    dir: '',
    host: '',
    policy: '',
    signature: '',
  };

  return body;
};
export const createOssClient = async () => {
  // 获取初始 Token 数据
  const tokenData = await fetchOssToken();

  // 创建 OSS 客户端
  const client = new OSS({
    // 设置地域，例如 oss-cn-hangzhou
    region: `oss-${tokenData.regionId}`,
    // 指定 Bucket 名称
    bucket: tokenData.bucketName,
    // 临时访问密钥
    accessKeyId: tokenData.accessKeyId,
    accessKeySecret: tokenData.accessKeySecret,
    stsToken: tokenData.securityToken,

    // 刷新临时凭证时间间隔（毫秒）
    refreshSTSTokenInterval: 300000,
    // 刷新 Token 的回调函数
    refreshSTSToken: async () => {
      const newTokenData = await fetchOssToken();
      return {
        accessKeyId: newTokenData.accessKeyId,
        accessKeySecret: newTokenData.accessKeySecret,
        stsToken: newTokenData.securityToken,
      };
    },
  });

  return client;
};
