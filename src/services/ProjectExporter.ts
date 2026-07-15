import JSZip from "jszip";

export class ProjectExporter {
  static async exportToZip(projectName: string, files: Record<string, string>) {
    const zip = new JSZip();

    for (const [path, content] of Object.entries(files)) {
      // Omit Koye specific editor files if any
      if (!path.startsWith(".editor/") && !path.startsWith(".koye/")) {
        zip.file(path, content);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    
    // Create a download link
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
