import ts from "typescript";

import type { ExportEntry, ImportEdge, PublicSymbolEntry } from "./types.js";

export type TypeScriptSourceAnalysis = {
  imports: ImportEdge[];
  exports: ExportEntry[];
  publicSymbols: PublicSymbolEntry[];
};

const sortStrings = (values: string[]): string[] => [...new Set(values)].sort();

const hasExportModifier = (node: ts.Node): boolean => {
  return Boolean(
    ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
  );
};

const declarationName = (node: { name?: ts.PropertyName | ts.BindingName }): string | null => {
  if (!node.name || !ts.isIdentifier(node.name)) {
    return null;
  }

  return node.name.text;
};

const addExport = (
  exports: ExportEntry[],
  publicSymbols: PublicSymbolEntry[],
  path: string,
  name: string | null,
  kind: ExportEntry["kind"],
): void => {
  if (!name) {
    return;
  }

  const entry = { path, name, kind };
  exports.push(entry);
  publicSymbols.push(entry);
};

export const analyzeTypeScriptSource = (
  path: string,
  source: string,
): TypeScriptSourceAnalysis => {
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  const imports: ImportEdge[] = [];
  const exports: ExportEntry[] = [];
  const publicSymbols: PublicSymbolEntry[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const imported: string[] = [];
      const clause = statement.importClause;

      if (clause?.name) {
        imported.push("default");
      }
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        imported.push("*");
      }
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          imported.push(element.propertyName?.text ?? element.name.text);
        }
      }

      imports.push({
        from: path,
        specifier: statement.moduleSpecifier.text,
        imported: sortStrings(imported),
      });
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          addExport(exports, publicSymbols, path, element.name.text, "re-export");
        }
      }
      continue;
    }

    if (ts.isFunctionDeclaration(statement) && hasExportModifier(statement)) {
      addExport(exports, publicSymbols, path, declarationName(statement), "function");
      continue;
    }

    if (ts.isClassDeclaration(statement) && hasExportModifier(statement)) {
      addExport(exports, publicSymbols, path, declarationName(statement), "class");
      continue;
    }

    if (ts.isInterfaceDeclaration(statement) && hasExportModifier(statement)) {
      addExport(exports, publicSymbols, path, declarationName(statement), "interface");
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement) && hasExportModifier(statement)) {
      addExport(exports, publicSymbols, path, declarationName(statement), "type");
      continue;
    }

    if (ts.isEnumDeclaration(statement) && hasExportModifier(statement)) {
      addExport(exports, publicSymbols, path, declarationName(statement), "enum");
      continue;
    }

    if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        addExport(exports, publicSymbols, path, declarationName(declaration), "const");
      }
    }
  }

  return {
    imports: imports.sort((left, right) => left.specifier.localeCompare(right.specifier)),
    exports: exports.sort((left, right) => left.name.localeCompare(right.name)),
    publicSymbols: publicSymbols.sort((left, right) => left.name.localeCompare(right.name)),
  };
};
