import * as ts from "typescript";

export type ExtractedProp = {
  readonly name: string;
  readonly type: string;
  readonly defaultValue?: unknown;
};

export class ChakraExtractor {
  readonly #program: ts.Program;
  readonly #typeChecker: ts.TypeChecker;

  constructor(tsConfigPath: string) {
    this.#program = ts.createProgram([tsConfigPath], {});
    this.#typeChecker = this.#program.getTypeChecker();
  }

  extractComponentProps(componentName: string): ExtractedProp[] {
    const sourceFiles = this.#program
      .getSourceFiles()
      .filter((file) => file.fileName.includes("@chakra-ui"));

    for (const sourceFile of sourceFiles) {
      const props = this.#extractPropsFromFile(sourceFile, componentName);
      if (props.length > 0) return props;
    }

    return [];
  }

  async extractFromTsx(tsxContent: string): Promise<ExtractedProp[]> {
    const sourceFile = ts.createSourceFile(
      "temp.tsx",
      tsxContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    const chakraImports = new Set<string>();
    const props: ExtractedProp[] = [];

    const collectImports = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier.getText().slice(1, -1);
        if (moduleSpecifier === "@chakra-ui/react") {
          node.importClause?.namedBindings?.forEachChild((binding) => {
            if (ts.isImportSpecifier(binding)) {
              chakraImports.add(binding.name.getText());
            }
          });
        }
      }
      ts.forEachChild(node, collectImports);
    };

    collectImports(sourceFile);

    const visit = (node: ts.Node) => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = ts.isJsxElement(node)
          ? node.openingElement.tagName.getText()
          : node.tagName.getText();

        if (chakraImports.has(tagName)) {
          const attributes = ts.isJsxElement(node)
            ? node.openingElement.attributes.properties
            : node.attributes.properties;

          for (const attr of attributes) {
            if (ts.isJsxAttribute(attr) && attr.initializer) {
              const name = attr.name.getText();
              props.push({
                name,
                type: attr.initializer.kind.toString(),
                defaultValue: attr.initializer.getText(),
              });
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return props;
  }

  #extractPropsFromFile(
    sourceFile: ts.SourceFile,
    componentName: string,
  ): ExtractedProp[] {
    const props: ExtractedProp[] = [];

    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isInterfaceDeclaration(node)) return;
      if (node.name.text !== `${componentName}Props`) return;

      const type = this.#typeChecker.getTypeAtLocation(node);
      const properties = this.#typeChecker.getPropertiesOfType(type);

      for (const property of properties) {
        const propertyType = this.#typeChecker.getTypeOfSymbolAtLocation(
          property,
          node,
        );
        props.push({
          name: property.getName(),
          type: this.#typeChecker.typeToString(propertyType),
        });
      }
    });

    return props;
  }
}
