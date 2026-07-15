export type RuntimeErrorType = 'build' | 'runtime' | 'package';

export interface RuntimeError {
  id: string;
  type: RuntimeErrorType;
  message: string;
  stack?: string;
  timestamp: number;
}

class RuntimeErrorsManager {
  private errors: RuntimeError[] = [];
  private listeners: ((errors: RuntimeError[]) => void)[] = [];

  addError(type: RuntimeErrorType, message: string, stack?: string) {
    const error: RuntimeError = {
      id: Math.random().toString(36).substring(7),
      type,
      message,
      stack,
      timestamp: Date.now()
    };
    this.errors.push(error);
    this.notify();
  }

  clear() {
    this.errors = [];
    this.notify();
  }

  getAll() {
    return [...this.errors];
  }

  subscribe(listener: (errors: RuntimeError[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.errors));
  }
}

export const runtimeErrors = new RuntimeErrorsManager();
