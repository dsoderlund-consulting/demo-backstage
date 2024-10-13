import {
  createBaseThemeOptions,
  createUnifiedTheme,
  genPageTheme,
  palettes,
  shapes,
} from '@backstage/theme';
export const dsLogoColor = '#000000';
export const dsTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      ...palettes.dark,
      primary: {
        main: '#34fb58',
      },
      secondary: {
        main: '#565a6e',
      },
      error: {
        main: '#323F32',
      },
      warning: {
        main: '#8f5e15',
      },
      info: {
        main: '#34548a',
      },
      success: {
        main: '#485e30',
      },
      background: {
        default: '#1a1a1a',
        paper: '#323F32',
      },
      banner: {
        info: '#34548a',
        error: '#323F32',
        text: '#343b58',
        link: '#565a6e',
      },
      errorBackground: '#323F32',
      warningBackground: '#8f5e15',
      infoBackground: '#343b58',
      navigation: {
        background: '#101010',
        indicator: '#8f5e15',
        color: '#d5d6db',
        selectedColor: '#00c000',
      },
      link: '#00c000',
    },
  }),
  defaultPageTheme: 'home',
  fontFamily: '"Helvetica Neue", Helvetica, Roboto, Arial, sans-serif',
  /* below drives the header colors */
  pageTheme: {
    home: genPageTheme({ colors: ['#528F52', '#1a1a1a'], shape: shapes.wave2 }),
    documentation: genPageTheme({
      colors: ['#323F32', '#343b58'],
      shape: shapes.wave2,
    }),
    tool: genPageTheme({ colors: ['#323F32', '#1a1a1a'], shape: shapes.round }),
    service: genPageTheme({
      colors: ['#323F32', '#1a1a1a'],
      shape: shapes.wave,
    }),
    website: genPageTheme({
      colors: ['#323F32', '#1a1a1a'],
      shape: shapes.tool,
    }),
    library: genPageTheme({
      colors: ['#323F32', '#1a1a1a'],
      shape: shapes.wave,
    }),
    other: genPageTheme({ colors: ['#323F32', '#1a1a1a'], shape: shapes.wave }),
    app: genPageTheme({ colors: ['#323F32', '#1a1a1a'], shape: shapes.wave }),
    apis: genPageTheme({ colors: ['#323F32', '#1a1a1a'], shape: shapes.wave }),
  },
});
