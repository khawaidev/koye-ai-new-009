import { WebContainer } from "@webcontainer/api";
import { getProjectTemplate } from "./ProjectTemplate";

/**
 * Converts a flat VFS structure (Record<string, string>) to a nested Tree structure
 * required by WebContainer.
 */
function buildTree(files: Record<string, string>) {
  const tree: any = {};

  for (const [path, content] of Object.entries(files)) {
    const parts = path.split("/");
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // It's a file
        current[part] = {
          file: {
            contents: content,
          },
        };
      } else {
        // It's a directory
        if (!current[part]) {
          current[part] = {
            directory: {},
          };
        }
        current = current[part].directory;
      }
    }
  }

  return tree;
}

export class ProjectLoader {
  private webcontainer: WebContainer;

  constructor(webcontainer: WebContainer) {
    this.webcontainer = webcontainer;
  }

  async loadProject(projectName: string, existingFiles: Record<string, string>) {
    // If project is empty, seed it with the template
    let projectFiles = { ...existingFiles };
    if (Object.keys(projectFiles).length === 0) {
      projectFiles = getProjectTemplate(projectName);
    }

    const tree = buildTree(projectFiles);
    
    // Mount the files
    await this.webcontainer.mount(tree);
    
    return projectFiles;
  }

  async updateFile(path: string, content: string) {
    await this.webcontainer.fs.writeFile(path, content);
  }

  async deleteFile(path: string) {
    await this.webcontainer.fs.rm(path, { force: true });
  }

  async installDependencies(onOutput?: (log: string) => void): Promise<number> {
    const installProcess = await this.webcontainer.spawn('npm', ['install']);
    
    if (onOutput) {
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            onOutput(data);
          },
        })
      );
    }
    
    return installProcess.exit;
  }

  async startDevServer(onOutput?: (log: string) => void): Promise<any> {
    const devProcess = await this.webcontainer.spawn('npm', ['run', 'dev']);
    
    if (onOutput) {
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            onOutput(data);
          },
        })
      );
    }
    
    return devProcess;
  }
}
