/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Modules should be used somewhere',
      from: {
        orphan: true,
        pathNot: [
          '\\.(test|spec)\\.[jt]sx?$',
          'src/types/',
          'src/mocks/',
          'src/test/'
        ]
      },
      to: {}
    },
    {
      name: 'no-deprecated-core',
      severity: 'warn',
      comment: 'Deprecated core modules should not be used',
      from: {},
      to: {
        dependencyTypes: [
          'core'
        ],
        path: [
          '^(punycode|domain)$'
        ]
      }
    },
    {
      name: 'no-duplicate-dep-types',
      severity: 'warn',
      comment: 'Likely this module depends on an external module that occurs more than once in package.json',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        dependencyTypesNot: ['type-only']
      }
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'Don\'t allow dependencies on modules that cannot be found',
      from: {},
      to: {
        couldNotResolve: true
      }
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment: 'Don\'t allow dependencies to packages not in package.json',
      from: {},
      to: {
        dependencyTypes: [
          'unknown',
          'undetermined',
          'npm-no-pkg',
          'npm-unknown'
        ]
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: [
        'npm',
        'npm-dev',
        'npm-optional',
        'npm-peer',
        'npm-bundled'
      ]
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: { rankdir: 'LR' },
          modules: [
            {
              criteria: { source: '\\.tsx?$' },
              attributes: { fillcolor: '#ffcccc' }
            },
            {
              criteria: { source: '\\.jsx?$' },
              attributes: { fillcolor: '#ccffcc' }
            }
          ]
        }
      },
      archi: {
        collapsePattern: '^(node_modules|packages)/[^/]+',
        theme: {
          graph: { rankdir: 'LR', splines: 'ortho' }
        }
      }
    }
  }
} 