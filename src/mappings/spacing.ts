/**
 * Chakra UIのスペーシングプロパティをTailwind CSSのクラスに変換するモジュール
 *
 * このモジュールは以下の機能を提供します：
 * 1. Chakra UIのスペーシングプロパティの型定義
 * 2. プロパティからTailwindクラス名へのマッピング
 * 3. レスポンシブ値の処理
 * 4. 値の正規化と変換
 *
 * @example
 * ```typescript
 * // 基本的な使用方法
 * convertSpacing('margin', 4)          // => 'm-4'
 * convertSpacing('padding', '16px')    // => 'p-4'
 * convertSpacing('gap', '1rem')        // => 'gap-4'
 *
 * // レスポンシブ値
 * convertSpacing('margin', [2, 4, 6])  // => 'm-2 sm:m-4 md:m-6'
 * convertSpacing('padding', {
 *   base: 2,
 *   md: 4,
 *   lg: 6
 * })                                   // => 'p-2 md:p-4 lg:p-6'
 * ```
 */

import { normalizeSpacing } from "./theme-scales";

/**
 * ブレークポイントの設定
 * baseはプレフィックスなし、その他はプレフィックス付き
 */
export type Breakpoint = {
  prefix: string; // 'sm:', 'md:', など
  minWidth: string; // '640px', '768px' など
};

export type BreakpointConfig = {
  breakpoints: Breakpoint[];
};

/**
 * スペーシングの基本プロパティ
 * これらのプロパティは方向や略語と組み合わせて使用されます
 */
export type SpacingBaseProperty =
  | "margin" // マージン
  | "padding" // パディング
  | "space" // Stackコンポーネントのスペーシング
  | "gap" // GridとFlexのギャップ
  | "inset"; // position指定時の配置

/**
 * 方向を表す型
 * CSSの論理的プロパティに対応する方向も含みます
 */
export type SpacingDirection =
  | "top" // 上
  | "right" // 右
  | "bottom" // 下
  | "left" // 左
  | "x" // 水平方向
  | "y" // 垂直方向
  | "inline" // インライン方向
  | "inline-start" // インライン開始位置
  | "inline-end" // インライン終了位置
  | "block" // ブロック方向
  | "block-start" // ブロック開始位置
  | "block-end"; // ブロック終了位置

/**
 * マージン関連の完全なプロパティ名
 * 論理的プロパティを含む全てのマージンプロパティ
 */
export type MarginProperty =
  | "margin"
  | "marginTop"
  | "marginRight"
  | "marginBottom"
  | "marginLeft"
  | "marginX"
  | "marginY"
  | "marginInline"
  | "marginInlineStart"
  | "marginInlineEnd"
  | "marginBlock"
  | "marginBlockStart"
  | "marginBlockEnd";

/**
 * マージンの省略プロパティ名
 * Chakra UIで使用される一般的な省略形
 */
export type MarginShorthand =
  | "m" // margin
  | "mt" // margin-top
  | "mr" // margin-right
  | "mb" // margin-bottom
  | "ml" // margin-left
  | "mx" // margin-horizontal
  | "my" // margin-vertical
  | "ms" // margin-inline-start
  | "me"; // margin-inline-end

/**
 * パディング関連の完全なプロパティ名
 * 論理的プロパティを含む全てのパディングプロパティ
 */
export type PaddingProperty =
  | "padding"
  | "paddingTop"
  | "paddingRight"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingX"
  | "paddingY"
  | "paddingInline"
  | "paddingInlineStart"
  | "paddingInlineEnd"
  | "paddingBlock"
  | "paddingBlockStart"
  | "paddingBlockEnd";

/**
 * パディングの省略プロパティ名
 * Chakra UIで使用される一般的な省略形
 */
export type PaddingShorthand =
  | "p" // padding
  | "pt" // padding-top
  | "pr" // padding-right
  | "pb" // padding-bottom
  | "pl" // padding-left
  | "px" // padding-horizontal
  | "py" // padding-vertical
  | "ps" // padding-inline-start
  | "pe"; // padding-inline-end

/**
 * その他のスペーシング関連プロパティ
 * GridやFlexレイアウト、Stackコンポーネントで使用
 */
export type OtherSpacingProperty =
  | "gap" // グリッドやフレックスのギャップ
  | "rowGap" // 行間のギャップ
  | "columnGap" // 列間のギャップ
  | "space"; // Stackコンポーネントのスペース

/**
 * 全てのスペーシングプロパティの統合型
 */
export type SpacingProperty =
  | MarginProperty
  | MarginShorthand
  | PaddingProperty
  | PaddingShorthand
  | OtherSpacingProperty;

/**
 * プロパティのマッピング
 * ChakraのプロパティからTailwindのクラス名プレフィックスへの変換マップ
 */
export const propertyPrefixMap: Record<SpacingProperty, string> = {
  // Margin - 完全形
  margin: "m",
  marginTop: "mt",
  marginRight: "mr",
  marginBottom: "mb",
  marginLeft: "ml",
  marginX: "mx",
  marginY: "my",
  marginInline: "mx",
  marginInlineStart: "ms",
  marginInlineEnd: "me",
  marginBlock: "my",
  marginBlockStart: "mt",
  marginBlockEnd: "mb",

  // Margin - 省略形
  m: "m",
  mt: "mt",
  mr: "mr",
  mb: "mb",
  ml: "ml",
  mx: "mx",
  my: "my",
  ms: "ms",
  me: "me",

  // Padding - 完全形
  padding: "p",
  paddingTop: "pt",
  paddingRight: "pr",
  paddingBottom: "pb",
  paddingLeft: "pl",
  paddingX: "px",
  paddingY: "py",
  paddingInline: "px",
  paddingInlineStart: "ps",
  paddingInlineEnd: "pe",
  paddingBlock: "py",
  paddingBlockStart: "pt",
  paddingBlockEnd: "pb",

  // Padding - 省略形
  p: "p",
  pt: "pt",
  pr: "pr",
  pb: "pb",
  pl: "pl",
  px: "px",
  py: "py",
  ps: "ps",
  pe: "pe",

  // その他のスペーシング
  gap: "gap",
  rowGap: "gap-y",
  columnGap: "gap-x",
  space: "space",
} as const;

/**
 * スペーシング値の型定義
 * Chakra UIがサポートする全ての値の形式を表します
 */
export type SpacingValue =
  | number // 数値（theme.space[number]を参照）
  | string // 文字列（'px', 'auto', カスタム値）
  | Array<number | string | null> // レスポンシブ配列
  | { [key: string]: number | string }; // レスポンシブオブジェクト

/**
 * 与えられたスペーシングプロパティと値をTailwindのクラスに変換します
 * @param property - Chakra UIのスペーシングプロパティ
 * @param value - スペーシング値
 * @returns Tailwindのクラス名
 */
export const convertSpacing = (
  property: SpacingProperty,
  value: SpacingValue,
): string => {
  const prefix = propertyPrefixMap[property];
  const breakpoints = ["", "sm", "md", "lg", "xl", "2xl"];

  // 配列の場合（レスポンシブ値）
  if (Array.isArray(value)) {
    let validIndex = 0;
    return value
      .map((v) => {
        if (v === null) return null;
        const breakpoint =
          validIndex === 0 ? "" : `${breakpoints[validIndex]}:`;
        validIndex++;
        const normalizedValue = normalizeSpacing(v);
        return normalizedValue
          ? `${breakpoint}${prefix}-${normalizedValue}`
          : null;
      })
      .filter((item): item is string => item !== null)
      .join(" ");
  }

  // オブジェクトの場合（レスポンシブ値）
  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([breakpoint, v]) => {
        const bp = breakpoint === "base" ? "" : `${breakpoint}:`;
        const normalizedValue = normalizeSpacing(v);
        return normalizedValue ? `${bp}${prefix}-${normalizedValue}` : null;
      })
      .filter((item): item is string => item !== null)
      .join(" ");
  }

  // 単一の値の場合
  const normalizedValue = normalizeSpacing(value);
  return normalizedValue ? `${prefix}-${normalizedValue}` : "";
};
