import { describe, expect, test } from "vitest";
import {
  type SpacingProperty,
  type SpacingValue,
  convertSpacing,
  propertyPrefixMap,
} from "./spacing";

describe("Spacing Conversion", () => {
  // プロパティマッピングのテスト
  test("propertyPrefixMap should contain all margin properties", () => {
    const marginProps = [
      "margin",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
      "marginX",
      "marginY",
      "marginInline",
      "marginInlineStart",
      "marginInlineEnd",
      "m",
      "mt",
      "mr",
      "mb",
      "ml",
      "mx",
      "my",
      "ms",
      "me",
    ];
    for (const prop of marginProps) {
      expect(propertyPrefixMap[prop as SpacingProperty]).toBeDefined();
    }
  });

  test("propertyPrefixMap should contain all padding properties", () => {
    const paddingProps = [
      "padding",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "paddingX",
      "paddingY",
      "paddingInline",
      "paddingInlineStart",
      "paddingInlineEnd",
      "p",
      "pt",
      "pr",
      "pb",
      "pl",
      "px",
      "py",
      "ps",
      "pe",
    ];
    for (const prop of paddingProps) {
      expect(propertyPrefixMap[prop as SpacingProperty]).toBeDefined();
    }
  });

  // 基本的な変換のテスト（スケール値考慮）
  describe("Scale-Aware Basic Conversion", () => {
    test("should convert Chakra numeric values to appropriate scale values", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        // Chakraの数値はそのままスケール値として使用
        ["margin", 4, "m-4"], // 1rem = 16px
        ["padding", 2, "p-2"], // 0.5rem = 8px
        ["gap", 6, "gap-6"], // 1.5rem = 24px
        ["space", 8, "space-8"], // 2rem = 32px
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });

    test("should convert pixel values to scale values when possible", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        // px値がスケールに一致する場合
        ["margin", "16px", "m-4"], // 16px = 1rem = 4
        ["padding", "8px", "p-2"], // 8px = 0.5rem = 2
        ["gap", "24px", "gap-6"], // 24px = 1.5rem = 6
        ["space", "32px", "space-8"], // 32px = 2rem = 8
        // px値がスケールに一致しない場合は[value]形式で出力
        ["margin", "15px", "m-[15px]"],
        ["padding", "7px", "p-[7px]"],
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });

    test("should convert rem values to scale values when possible", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        ["margin", "1rem", "m-4"], // 1rem = 16px = 4
        ["padding", "0.5rem", "p-2"], // 0.5rem = 8px = 2
        ["gap", "1.5rem", "gap-6"], // 1.5rem = 24px = 6
        ["space", "2rem", "space-8"], // 2rem = 32px = 8
        // rem値がスケールに一致しない場合は[value]形式で出力
        ["margin", "0.45rem", "m-[0.45rem]"],
        ["padding", "1.1rem", "p-[1.1rem]"],
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });
  });

  // レスポンシブ値のテスト（スケール値考慮）
  describe("Scale-Aware Responsive Values", () => {
    test("should convert array-based responsive values with scale consideration", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        ["margin", [2, "16px", "1rem"], "m-2 sm:m-4 md:m-4"], // すべて同じスケール値に変換
        ["padding", ["8px", null, "0.5rem"], "p-2 md:p-2"], // すべて同じスケール値に変換
        ["mx", [2, "1rem", null, "16px"], "mx-2 sm:mx-4 md:mx-4"], // 配列インデックスに注意
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });

    test("should convert object-based responsive values with scale consideration", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        ["margin", { base: "8px", md: 2, lg: "0.5rem" }, "m-2 md:m-2 lg:m-2"],
        ["padding", { base: 4, lg: "1rem" }, "p-4 lg:p-4"],
        ["mx", { base: "16px", sm: 4, xl: "1rem" }, "mx-4 sm:mx-4 xl:mx-4"],
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });
  });

  // エッジケースのテスト
  describe("Scale-Aware Edge Cases", () => {
    test("should handle special values", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        ["margin", 0, "m-0"],
        ["margin", "0", "m-0"],
        ["margin", "0px", "m-0"],
        ["margin", "0rem", "m-0"],
        ["padding", "auto", "p-auto"],
        ["margin", "-1", "m-[-4px]"], // -1 unit = -4px
        ["margin", "-4px", "m-[-4px]"], // -4px as is
        ["margin", "-1rem", "m-[-1rem]"], // -1rem as is
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });

    test("should handle fractional scale values", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        ["margin", "2px", "m-0.5"], // 2px = 0.5
        ["padding", "6px", "p-1.5"], // 6px = 1.5
        ["gap", "10px", "gap-2.5"], // 10px = 2.5
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });

    test("should handle non-standard values", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        ["margin", "5vh", "m-[5vh]"],
        ["padding", "calc(100% - 20px)", "p-[calc(100%-20px)]"],
        ["gap", "clamp(1rem, 2vw, 3rem)", "gap-[clamp(1rem,2vw,3rem)]"],
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });
  });

  // その他のスペーシングプロパティのテスト
  describe("Other Spacing Properties", () => {
    test("should convert gap properties", () => {
      const testCases: [SpacingProperty, SpacingValue, string][] = [
        ["gap", 4, "gap-4"],
        ["rowGap", 2, "gap-y-2"],
        ["columnGap", "1rem", "gap-x-4"], // 1rem = 4
      ];

      for (const [prop, value, expected] of testCases) {
        expect(convertSpacing(prop, value)).toBe(expected);
      }
    });

    test("should convert space property for Stack component", () => {
      expect(convertSpacing("space", 4)).toBe("space-4");
      expect(convertSpacing("space", { base: "8px", md: "0.5rem" })).toBe(
        "space-2 md:space-2", // both 8px = 2
      );
    });
  });
});
