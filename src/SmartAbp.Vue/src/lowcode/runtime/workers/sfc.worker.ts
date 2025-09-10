/**
 * 专用SFC编译Worker
 * 接收 { action: 'compile', payload: { sfc: string, options } }
 */
import { parse, compileScript, compileTemplate, compileStyle, type SFCDescriptor } from '@vue/compiler-sfc';

interface CompilePayload {
  sfc: string;
  filename?: string;
  sourceMap?: boolean;
  compilerOptions?: Record<string, any>;
  preprocessOptions?: Record<string, any>;
}

interface WorkerRequest<T = unknown> {
  id: number;
  action: string;
  payload: T;
}

interface WorkerResponse<T = unknown> {
  id: number;
  ok: boolean;
  result?: T;
  error?: { message: string; stack?: string };
}

interface CompileResult {
  render: string;
  script: string;
  styles: string[];
  exports: string[];
  dependencies: string[];
}

const generateComponentId = (filename: string): string => filename.replace(/[^a-zA-Z0-9]/g, '_');

const extractComponentName = (descriptor: SFCDescriptor): string => {
  if (descriptor.script?.content) {
    const m = descriptor.script.content.match(/name\s*:\s*['"]([^'"]+)['"]/);
    if (m) return m[1];
  }
  if (descriptor.scriptSetup?.content) {
    const m = descriptor.scriptSetup.content.match(/defineOptions\s*\(\s*{\s*name\s*:\s*['"]([^'"]+)['"]/);
    if (m) return m[1];
  }
  return 'AnonymousComponent';
};

const extractExports = (descriptor: SFCDescriptor, compiledScript: string): string[] => {
  const names: string[] = ['default'];
  const name = extractComponentName(descriptor);
  if (name && name !== 'AnonymousComponent') names.push(name);
  const m = compiledScript.match(/export\s+(?:const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
  if (m) {
    m.forEach(s => {
      const n = s.match(/export\s+(?:const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (n) names.push(n[1]);
    });
  }
  return [...new Set(names)];
};

const extractDependencies = (descriptor: SFCDescriptor): string[] => {
  const deps = new Set<string>(['vue']);
  const script = descriptor.script?.content || descriptor.scriptSetup?.content || '';
  const imports = script.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
  if (imports) {
    imports.forEach(i => {
      const m = i.match(/from\s+['"]([^'"]+)['"]/);
      if (m && !m[1].startsWith('.') && !m[1].startsWith('/')) deps.add(m[1]);
    });
  }
  return Array.from(deps);
};

self.onmessage = async (e: MessageEvent<WorkerRequest<CompilePayload>>) => {
  const { id, action, payload } = e.data;
  const respond = (resp: WorkerResponse<CompileResult>) => (self as unknown as Worker).postMessage(resp);

  try {
    if (action !== 'compile') {
      return respond({ id, ok: false, error: { message: `未知动作: ${action}` } });
    }

    const { sfc, filename = 'Anonymous.vue', sourceMap, compilerOptions, preprocessOptions } = payload;
    const { descriptor, errors } = parse(sfc, { filename });
    if (errors.length > 0) {
      throw new Error(`SFC解析错误: ${errors.join(', ')}`);
    }

    // script
    const lang = descriptor.script?.lang || descriptor.scriptSetup?.lang;
    const isTS = lang === 'ts' || lang === 'tsx';
    const compiledScript = compileScript(descriptor, {
      id: generateComponentId(filename),
      sourceMap,
      genDefaultAs: extractComponentName(descriptor),
      ...(isTS
        ? { babelParserPlugins: ['typescript', 'decorators-legacy'] as any[], propsDestructure: true }
        : { babelParserPlugins: ['decorators-legacy'] as any[] }),
      isProd: false,
      hoistStatic: true,
      templateOptions: {
        source: descriptor.template?.content || '',
        filename,
        id: generateComponentId(filename),
        scoped: descriptor.styles.some(s => s.scoped),
        ssr: false,
        transformAssetUrls: false
      }
    });

    // template
    const renderResult = descriptor.template
      ? compileTemplate({
          id: generateComponentId(filename),
          source: descriptor.template.content,
          filename,
          transformAssetUrls: false,
          ssr: false,
          ssrCssVars: [],
          isProd: false,
          compilerOptions: { ...(compilerOptions || {}) }
        })
      : { code: '' as string, errors: [] as any[] };
    if ((renderResult as any).errors?.length) {
      throw new Error(`模板编译错误: ${(renderResult as any).errors.join(', ')}`);
    }

    // styles
    const styles: string[] = [];
    for (let i = 0; i < descriptor.styles.length; i++) {
      const style = descriptor.styles[i];
      const styleRes = compileStyle({
        filename,
        id: generateComponentId(filename),
        source: style.content,
        scoped: style.scoped,
        preprocessLang: style.lang as any,
        trim: true,
        isProd: (compilerOptions as any)?.isProd || false,
        ...(preprocessOptions && { preprocessOptions })
      });
      if (styleRes.errors.length) {
        throw new Error(`样式编译错误: ${styleRes.errors.join(', ')}`);
      }
      styles.push(styleRes.code);
    }

    const result: CompileResult = {
      render: (renderResult as any).code || '',
      script: compiledScript.content,
      styles,
      exports: extractExports(descriptor, compiledScript.content),
      dependencies: extractDependencies(descriptor)
    };

    respond({ id, ok: true, result });
  } catch (err) {
    const error = err as Error;
    (self as unknown as Worker).postMessage({ id, ok: false, error: { message: error.message, stack: error.stack } });
  }
};


