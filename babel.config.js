module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.android.js',
            '.android.tsx',
            '.ios.js',
            '.ios.tsx'
          ],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@config': './src/config',
            '@assets': './src/assets',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};