export class DependencyScanner {
  /**
   * Scans a file's content for import statements and extracts the package names.
   * This is a simple regex-based scanner.
   */
  static scanImports(content: string): string[] {
    const importRegex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"](@?[^'"\./]+(?:\/[^'"\./]+)?)['"]/g;
    const dynamicImportRegex = /import\(['"](@?[^'"\./]+(?:\/[^'"\./]+)?)['"]\)/g;
    
    const dependencies = new Set<string>();
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.add(this.getModuleName(match[1]));
    }
    
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      dependencies.add(this.getModuleName(match[1]));
    }
    
    return Array.from(dependencies);
  }

  /**
   * Extracts the base module name.
   * E.g. 'simplex-noise/2d' -> 'simplex-noise'
   * '@babylonjs/core/Maths' -> '@babylonjs/core'
   */
  private static getModuleName(path: string): string {
    if (path.startsWith('@')) {
      const parts = path.split('/');
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : path;
    }
    return path.split('/')[0];
  }

  /**
   * Compares found imports against package.json dependencies
   */
  static getMissingDependencies(
    foundImports: string[],
    packageJsonStr: string
  ): string[] {
    try {
      const pkg = JSON.parse(packageJsonStr);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
        ...(pkg.peerDependencies || {})
      };
      
      // Node built-ins
      const builtins = new Set([
        'path', 'fs', 'crypto', 'os', 'http', 'https', 'net', 'tls', 'events', 'util', 'stream', 'buffer'
      ]);

      return foundImports.filter(dep => !allDeps[dep] && !builtins.has(dep));
    } catch (e) {
      console.error("Failed to parse package.json", e);
      return [];
    }
  }
}
