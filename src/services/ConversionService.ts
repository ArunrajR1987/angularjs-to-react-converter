import * as fs from 'fs-extra';
import * as path from 'path';
import { parse, print } from 'recast';
import * as babel from '@babel/parser';
import { ProjectStructure, AngularComponent, ReactComponent } from '../../shared/types';
import { DependencyAnalyzer } from '../analyzers/DependencyAnalyzer';
import { TemplateConverter } from '../converters/TemplateConverter';

export class ConversionService {
  private projectStructure: ProjectStructure = {
    components: [],
    services: [],
    directives: [],
    templates: [],
    configs: [],
    styles: [],
    other: []
  };

  async processUpload(uploadDir: string): Promise<ProjectStructure> {
    await this.scanProject(uploadDir);
    await this.analyzeDependencies();
    return this.projectStructure;
  }

  private async scanProject(dirPath: string): Promise<void> {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await this.scanProject(fullPath);
      } else {
        await this.categorizeFile(fullPath);
      }
    }
  }

  private async categorizeFile(filePath: string): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();
    const filename = path.basename(filePath).toLowerCase();

    if (ext === '.js' || ext === '.ts') {
      if (filename.includes('controller') || filename.includes('component')) {
        this.projectStructure.components.push(filePath);
      } else if (filename.includes('service') || filename.includes('factory')) {
        this.projectStructure.services.push(filePath);
      } else if (filename.includes('directive')) {
        this.projectStructure.directives.push(filePath);
      } else {
        this.projectStructure.other.push(filePath);
      }
    } else if (ext === '.html') {
      this.projectStructure.templates.push(filePath);
    } else if (ext === '.css' || ext === '.scss') {
      this.projectStructure.styles.push(filePath);
    } else if (filename === 'package.json' || filename === 'bower.json') {
      this.projectStructure.configs.push(filePath);
    }
  }

  private async analyzeDependencies(): Promise<void> {
    const analyzer = new DependencyAnalyzer();
    await analyzer.analyze(this.projectStructure);
  }

  async convertToReact(componentPath: string): Promise<ReactComponent> {
    const content = await fs.readFile(componentPath, 'utf-8');
    const ast = parse(content, {
      parser: {
        parse: (source) => babel.parse(source, {
          sourceType: 'module',
          plugins: [
            'jsx',
            'typescript',
            'classProperties',
            'decorators-legacy'
          ]
        })
      }
    });

    // Conversion logic here...
    const reactCode = print(ast).code;

    return {
      name: this.getComponentName(componentPath),
      code: reactCode,
      path: this.getReactPath(componentPath),
      dependencies: [],
      warnings: []
    };
  }

  private getComponentName(filePath: string): string {
    return path.basename(filePath)
      .replace(/\.[^/.]+$/, '')
      .replace(/(controller|component)/i, '')
      .replace(/^./, (c) => c.toUpperCase());
  }

  private getReactPath(angularPath: string): string {
    const relativePath = path.relative(process.cwd(), angularPath);
    return relativePath
      .replace('app/', 'src/')
      .replace('.js', '.tsx')
      .replace('.controller', '');
  }
}