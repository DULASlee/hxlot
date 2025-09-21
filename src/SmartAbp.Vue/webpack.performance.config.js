/**
 * Webpack Bundle Analyzer Configuration
 * Advanced UI Component Library Performance Analysis
 * Phase 3 - Week 4: Bundle analysis, code splitting, optimization
 */

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CompressionPlugin = require('compression-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { DefinePlugin } = require('webpack')

module.exports = {
  // Performance analysis configuration
  performance: {
    analysis: {
      enabled: process.env.ANALYZE_BUNDLE === 'true',
      generateReport: true,
      reportFormats: ['html', 'json', 'static'],
      outputPath: 'dist/analysis'
    },
    
    // Bundle size limits
    budgets: [
      {
        type: 'bundle',
        name: 'advanced-components',
        maximumWarning: '500kb',
        maximumError: '1mb'
      },
      {
        type: 'initial',
        maximumWarning: '2mb',
        maximumError: '3mb'
      },
      {
        type: 'anyComponentStyle',
        maximumWarning: '150kb',
        maximumError: '200kb'
      }
    ],
    
    // Tree shaking optimization
    treeShaking: {
      enabled: true,
      sideEffects: false,
      optimization: {
        usedExports: true,
        providedExports: true,
        concatenateModules: true
      }
    }
  },

  // Webpack configuration extensions
  configureWebpack: (config) => {
    const plugins = []
    
    // Bundle analyzer plugin
    if (process.env.ANALYZE_BUNDLE === 'true') {
      plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: '../analysis/bundle-report.html',
          openAnalyzer: true,
          generateStatsFile: true,
          statsFilename: '../analysis/bundle-stats.json',
          logLevel: 'info'
        })
      )
    }

    // Compression plugins for production
    if (process.env.NODE_ENV === 'production') {
      plugins.push(
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        }),
        new CompressionPlugin({
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          compressionOptions: {
            params: {
              [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11
            }
          },
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }

    // Define plugin for feature flags
    plugins.push(
      new DefinePlugin({
        __DEVELOPMENT__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production'),
        __PERFORMANCE_MONITORING__: JSON.stringify(process.env.ENABLE_PERF_MONITORING === 'true'),
        __BUNDLE_ANALYZER__: JSON.stringify(process.env.ANALYZE_BUNDLE === 'true')
      })
    )

    config.plugins.push(...plugins)

    // Optimization configuration
    config.optimization = {
      ...config.optimization,
      
      // Code splitting configuration
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true
          },
          
          // Vue and core libraries
          vue: {
            test: /[\\/]node_modules[\\/](vue|@vue|vuex|vue-router)[\\/]/,
            name: 'vue-vendor',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true
          },
          
          // Element Plus UI library
          elementPlus: {
            test: /[\\/]node_modules[\\/]element-plus[\\/]/,
            name: 'element-plus',
            chunks: 'all',
            priority: 15,
            reuseExistingChunk: true
          },
          
          // Advanced components library
          advancedComponents: {
            test: /[\\/]packages[\\/]lowcode-designer[\\/]src[\\/]components[\\/]/,
            name: 'advanced-components',
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
            minSize: 0
          },
          
          // Common utilities
          utils: {
            test: /[\\/](utils|helpers|constants)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 5,
            minChunks: 2,
            reuseExistingChunk: true
          },
          
          // CSS styles
          styles: {
            test: /\.(css|scss|sass|less)$/,
            name: 'styles',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      },
      
      // Runtime chunk optimization
      runtimeChunk: {
        name: 'runtime'
      },
      
      // Minimizer configuration
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: process.env.NODE_ENV === 'production',
              drop_debugger: process.env.NODE_ENV === 'production',
              pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : []
            },
            mangle: {
              safari10: true
            },
            format: {
              comments: false
            }
          },
          extractComments: false,
          parallel: true
        })
      ]
    }

    // Module resolution optimization
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@advanced-components': path.resolve(__dirname, 'packages/lowcode-designer/src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@constants': path.resolve(__dirname, 'src/constants')
      },
      
      // Reduce bundle size by preferring ES modules
      mainFields: ['module', 'main'],
      
      // Extension resolution order
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
    }

    return config
  },

  // CSS optimization
  css: {
    extract: process.env.NODE_ENV === 'production' ? {
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css'
    } : false,
    
    sourceMap: process.env.NODE_ENV === 'development',
    
    loaderOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      },
      
      // PostCSS optimization
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('cssnano')({
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              minifySelectors: true,
              minifyParams: true
            }]
          })
        ]
      }
    }
  },

  // Performance monitoring configuration
  monitoring: {
    // Core Web Vitals tracking
    coreWebVitals: {
      enabled: true,
      thresholds: {
        LCP: 2.5, // Largest Contentful Paint (seconds)
        FID: 100, // First Input Delay (milliseconds)
        CLS: 0.1  // Cumulative Layout Shift
      }
    },
    
    // Resource hints
    resourceHints: {
      prefetch: [
        'advanced-table',
        'advanced-form',
        'advanced-chart'
      ],
      preload: [
        'vue-vendor',
        'element-plus',
        'runtime'
      ]
    },
    
    // Performance budgets
    budgets: {
      javascript: '2MB',
      css: '500KB',
      images: '1MB',
      fonts: '200KB',
      total: '4MB'
    }
  },

  // Development server optimization
  devServer: {
    hot: true,
    compress: true,
    
    // Performance monitoring in development
    setupMiddlewares: (middlewares, devServer) => {
      // Bundle analysis middleware
      if (process.env.ANALYZE_BUNDLE === 'true') {
        devServer.app.get('/bundle-analysis', (req, res) => {
          const analysisPath = path.join(__dirname, 'dist/analysis/bundle-report.html')
          res.sendFile(analysisPath)
        })
      }
      
      return middlewares
    }
  }
}

// Performance analysis utilities
const PerformanceAnalyzer = {
  // Generate performance report
  generateReport: async () => {
    const { execSync } = require('child_process')
    
    try {
      // Build with analysis
      execSync('ANALYZE_BUNDLE=true npm run build', { stdio: 'inherit' })
      
      // Generate Lighthouse report
      execSync('lighthouse http://localhost:8080 --output=html --output-path=dist/analysis/lighthouse-report.html', { stdio: 'inherit' })
      
      // Bundle size analysis
      const bundleStats = require('./dist/analysis/bundle-stats.json')
      const report = {
        timestamp: new Date().toISOString(),
        bundleSize: bundleStats.assets.reduce((total, asset) => total + asset.size, 0),
        chunks: bundleStats.chunks.length,
        modules: bundleStats.modules.length,
        assets: bundleStats.assets.length,
        warnings: bundleStats.warnings,
        errors: bundleStats.errors
      }
      
      console.log('Performance Analysis Report:', report)
      return report
    } catch (error) {
      console.error('Performance analysis failed:', error)
      throw error
    }
  },
  
  // Monitor runtime performance
  monitorRuntime: () => {
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            console.log(`Performance: ${entry.name} took ${entry.duration}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
      
      // Core Web Vitals monitoring
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log)
        getFID(console.log)
        getFCP(console.log)
        getLCP(console.log)
        getTTFB(console.log)
      })
    }
  }
}

module.exports = {
  ...module.exports,
  PerformanceAnalyzer
}