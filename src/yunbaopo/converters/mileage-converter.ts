//输入数字，生成3km+004
export const formatMileage = (n = 0, prefix = '') => {
  const response = {
    str: '',
    prefix: '',
    km: '',
    m: '',
  };

  const km = Math.floor(n / 1000).toString();
  let m = (n % 1000).toFixed(2); // Get remainder and format to 2 decimal places

  // Ensure m has 3 digits before the decimal point
  const [integerPart, decimalPart] = m.split('.');
  m = integerPart.padStart(3, '0') + '.' + decimalPart;

  response.km = km;
  response.m = m;
  response.str = `${km}+${m}`;
  response.prefix = prefix ? `${prefix}${response.str}` : response.str;

  return response;
};

//输入km和m 解析为数字
export const parseMileageToNumber = (km: string, m: string) => {
  console.log(km, m);

  const number = Number(km) * 1000 + Number(m);
  console.log(number);
  const n = Math.round(number * 100) / 100;
  console.log(n);
  return n;
};

//输入number :1200和字符串ZK1+1200.00,进行解析

export const extractMileagePrefix = (number: number, str: string) => {
  const res = formatMileage(number);
  //获取字符串str和res.str不相同的部分
  console.log(str, res.str);

  const diff = str.replace(res.str, '');
  res.prefix = diff;
  console.log(res);
  return res;
};

// JSON.stringify
// JSON.parse
export const validateMileage = async (rule: any, value: any) => {
  try {
    let ok = false;
    if (value) {
      const start = value.kmCount;
      const end = value.mCount;

      if (start >= 0 && end >= 0) {
        if (end < 1000) {
          ok = true;
        }
      }

      // if (start.toString().split('.').length !== 1) {
      //   ok = false;
      // }
    }

    // if (value) {
    //   if (value.kmCount && value.mCount) {
    //     const start = +value.kmCount;
    //     const end = +value.mCount;

    //     if (start >= 0 && end >= 0) {
    //       if (end < 1000) {
    //         ok = true;
    //       }
    //     }

    //     if (start.toString().split('.').length !== 1) {
    //       ok = false;
    //     }
    //   }
    // }
    if (ok) {
      return Promise.resolve();
    } else {
      return Promise.reject('请输入符合条件的里程桩号,小数点后保留一位(示例：RK 1KM+234.5M)');
    }
  } catch (error) {
    return Promise.reject('请输入符合条件的里程桩号,小数点后保留一位(示例：RK 1KM+234.5M)');
  }
};
