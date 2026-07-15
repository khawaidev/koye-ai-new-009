import { WebContainer } from "@webcontainer/api";

export class DependencyManager {
  private webcontainer: WebContainer;

  constructor(webcontainer: WebContainer) {
    this.webcontainer = webcontainer;
  }

  async getPackageJson(): Promise<any> {
    try {
      const contents = await this.webcontainer.fs.readFile('package.json', 'utf-8');
      return JSON.parse(contents);
    } catch (e) {
      console.error("Failed to read package.json from WebContainer", e);
      return null;
    }
  }

  async addDependency(name: string, version: string = "latest"): Promise<boolean> {
    const pkg = await this.getPackageJson();
    if (!pkg) return false;

    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies[name] = version;

    await this.webcontainer.fs.writeFile('package.json', JSON.stringify(pkg, null, 2));
    return true;
  }

  async removeDependency(name: string): Promise<boolean> {
    const pkg = await this.getPackageJson();
    if (!pkg) return false;

    let modified = false;
    if (pkg.dependencies && pkg.dependencies[name]) {
      delete pkg.dependencies[name];
      modified = true;
    }
    if (pkg.devDependencies && pkg.devDependencies[name]) {
      delete pkg.devDependencies[name];
      modified = true;
    }

    if (modified) {
      await this.webcontainer.fs.writeFile('package.json', JSON.stringify(pkg, null, 2));
    }
    return modified;
  }
}
