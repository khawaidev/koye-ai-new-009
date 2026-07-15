import { WebContainer } from "@webcontainer/api";

let webcontainerInstance: WebContainer | null = null;
let isBooting = false;
let bootPromise: Promise<WebContainer> | null = null;

export const bootWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) return webcontainerInstance;

  if (isBooting && bootPromise) {
    return bootPromise;
  }

  isBooting = true;
  bootPromise = new Promise(async (resolve, reject) => {
    try {
      webcontainerInstance = await WebContainer.boot();
      isBooting = false;
      resolve(webcontainerInstance);
    } catch (e) {
      isBooting = false;
      reject(e);
    }
  });

  return bootPromise;
};

export const getWebContainer = (): WebContainer | null => {
  return webcontainerInstance;
};
