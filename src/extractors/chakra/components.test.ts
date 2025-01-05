import { describe, expect, it } from "vitest";
import { ChakraExtractor } from "./components";

describe("ChakraExtractor", () => {
  const extractor = new ChakraExtractor("./tsconfig.json");

  describe("extractFromTsx", () => {
    it("extracts props from Chakra components", async () => {
      const tsxContent = `
        import { Flex, VStack } from '@chakra-ui/react';
        import { CustomComponent } from './components';
        
        const Component = () => (
          <Flex mb="24px" direction="column">
            <VStack spacing="4">
              <Text>Hello</Text>
            </VStack>
          </Flex>
        );
      `;

      const props = await extractor.extractFromTsx(tsxContent);

      expect(props).toContainEqual(
        expect.objectContaining({
          name: "mb",
          defaultValue: '"24px"',
        }),
      );

      expect(props).toContainEqual(
        expect.objectContaining({
          name: "direction",
          defaultValue: '"column"',
        }),
      );

      expect(props).toContainEqual(
        expect.objectContaining({
          name: "spacing",
          defaultValue: '"4"',
        }),
      );
    });

    it("only extracts props from Chakra UI components", async () => {
      const tsxContent = `
        import { Flex } from '@chakra-ui/react';
        import { CustomComponent } from './components';
        
        const Component = () => (
          <>
            <Flex mb="24px" />
            <CustomComponent mb="24px" />
          </>
        );
      `;

      const props = await extractor.extractFromTsx(tsxContent);

      expect(props.length).toBe(1);
      expect(props[0]).toEqual(
        expect.objectContaining({
          name: "mb",
          defaultValue: '"24px"',
        }),
      );
    });
  });

  describe("extractComponentProps", () => {
    it("extracts Flex component props from Chakra UI types", () => {
      const props = extractor.extractComponentProps("Flex");

      expect(props).toContainEqual(
        expect.objectContaining({
          name: "direction",
        }),
      );

      expect(props).toContainEqual(
        expect.objectContaining({
          name: "align",
        }),
      );
    });
  });
});
