export interface FrameworkService {
  initializeProject: (name: string) => Promise<void>;

  addTestingFrameworks: (projectPath: string) => Promise<void>;

  replacePlaceholders: (projectPath: string) => void;

  installAdditionalDependencies?: () => Promise<void>
}
