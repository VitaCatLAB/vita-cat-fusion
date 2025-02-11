function convertSectionToChinese(section: number) {
  let strIns = '';
  const chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const chnUnitChar = ['', '十', '百', '千'];
  let unitPos = 0;
  let zero = true;
  while (section > 0) {
    const v = section % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        strIns = chnNumChar[v] + strIns;
      }
    } else {
      zero = false;
      strIns = chnNumChar[v] + chnUnitChar[unitPos] + strIns;
    }
    unitPos++;
    section = Math.floor(section / 10);
  }
  return strIns;
}
export function convertNumberToChinese(num: number) {
  const chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const chnUnitSection = ['', '万', '亿', '万亿', '亿亿'];
  const chnUnitChar = ['', '十', '百', '千'];
  let unitPos = 0;
  let strIns = '';
  let chnStr = '';
  let needZero = false;
  const chnNumCharLength = chnNumChar.length;
  if (num === 0) {
    return chnNumChar[0];
  }
  while (num > 0) {
    const section = num % 10000;
    if (needZero) {
      chnStr = chnNumChar[0] + chnStr;
    }
    strIns = convertSectionToChinese(section);
    strIns += section !== 0 ? chnUnitSection[unitPos] : chnUnitSection[0];
    chnStr = strIns + chnStr;
    needZero = section < 1000 && section > 0;
    num = Math.floor(num / 10000);
    unitPos++;
  }
  return chnStr;
}
