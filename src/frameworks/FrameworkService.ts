export interface FrameworkService {
  initializeProject(name: string): Promise<void>;
  addTestingFrameworks(projectPath: string): Promise<void>
}
