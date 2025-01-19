/**
 * Chakra UIとTailwind CSSのスペーシングスケール
 *
 * Chakra UI: 1単位 = 0.25rem = 4px
 * 例: m={4} => margin: 1rem
 *
 * Tailwind CSS: スケール値を直接使用
 * 例: m-4 => margin: 1rem
 */

/** スペーシング値の型 */
export type SpacingValue =
  | number
  | string
  | Array<number | string | null>
  | { [key: string]: number | string };

/** 共通のスペーシングスケール */
export const spacingScale = {
  px: "1px",
  "0": "0",
  "0.5": "0.125rem", // 2px
  "1": "0.25rem", // 4px
  "1.5": "0.375rem", // 6px
  "2": "0.5rem", // 8px
  "2.5": "0.625rem", // 10px
  "3": "0.75rem", // 12px
  "3.5": "0.875rem", // 14px
  "4": "1rem", // 16px
  "5": "1.25rem", // 20px
  "6": "1.5rem", // 24px
  "7": "1.75rem", // 28px
  "8": "2rem", // 32px
  "9": "2.25rem", // 36px
  "10": "2.5rem", // 40px
  "12": "3rem", // 48px
  "14": "3.5rem", // 56px
  "16": "4rem", // 64px
  "20": "5rem", // 80px
  "24": "6rem", // 96px
  "28": "7rem", // 112px
  "32": "8rem", // 128px
  "36": "9rem", // 144px
  "40": "10rem", // 160px
  "44": "11rem", // 176px
  "48": "12rem", // 192px
  "52": "13rem", // 208px
  "56": "14rem", // 224px
  "60": "15rem", // 240px
  "64": "16rem", // 256px
  "72": "18rem", // 288px
  "80": "20rem", // 320px
  "96": "24rem", // 384px
} as const;

/** rem値からスケール値へのマッピング */
const remToScaleMap = new Map<string, string>();
for (const [key, value] of Object.entries(spacingScale)) {
  if (value.endsWith("rem")) {
    remToScaleMap.set(value, key);
  }
}

/** px値からスケール値へのマッピング */
const pxToScaleMap = new Map<number, string>();
for (const [key, value] of Object.entries(spacingScale)) {
  let px: number;
  if (value.endsWith("px")) {
    px = Number.parseInt(value);
  } else if (value.endsWith("rem")) {
    px = Number.parseFloat(value) * 16;
  } else if (value === "0") {
    px = 0;
  } else {
    continue;
  }
  pxToScaleMap.set(px, key);
}

/**
 * 特殊な値から空白を除去する
 */
const removeSpaces = (value: string): string => {
  if (value.includes("calc") || value.includes("clamp")) {
    return value.replace(/\s+/g, "");
  }
  return value;
};

/**
 * 値をrem形式に正規化する
 */
const normalizeToRem = (value: string): string | null => {
  // pxの場合
  if (value.endsWith("px")) {
    const px = Number.parseFloat(value);
    return `${px / 16}rem`;
  }
  // すでにremの場合
  if (value.endsWith("rem")) {
    return value;
  }
  return null;
};

/**
 * スペーシング値の正規化
 */
export const normalizeSpacing = (value: number | string | null): string => {
  if (value == null) return "";
  if (value === "auto") return "auto";

  // 文字列の負の数値を数値に変換
  if (typeof value === "string" && value.startsWith("-")) {
    const numValue = Number.parseFloat(value);
    if (!Number.isNaN(numValue)) {
      const convertedValue = numValue;
      return normalizeSpacing(convertedValue);
    }
  }

  // 数値の場合（Chakraスタイル）
  if (typeof value === "number") {
    if (value === 0) return "0";
    // 負の値の場合は4pxルールを適用
    if (value < 0) {
      return `[-${Math.abs(value * 4)}px]`;
    }
    return value.toString();
  }

  // 文字列の場合
  const cleanValue = removeSpaces(String(value));

  if (cleanValue === "0" || cleanValue === "0px" || cleanValue === "0rem") {
    return "0";
  }

  // rem値への正規化を試みる
  const remValue = normalizeToRem(cleanValue);
  if (remValue) {
    const scaleValue = remToScaleMap.get(remValue);
    if (scaleValue) {
      return scaleValue;
    }
  }

  // px値の場合
  if (cleanValue.endsWith("px")) {
    const px = Number.parseInt(cleanValue);
    const scaleValue = pxToScaleMap.get(Math.abs(px));
    if (scaleValue) {
      return px < 0 ? `[-${Math.abs(px)}px]` : scaleValue;
    }
    return px < 0 ? `[-${Math.abs(px)}px]` : `[${px}px]`;
  }

  return `[${cleanValue}]`;
};
