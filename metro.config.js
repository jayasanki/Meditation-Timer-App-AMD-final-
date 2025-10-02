const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add asset extensions
config.resolver.assetExts.push(
  'db', // For database files
  'mp3', // For audio files
  'wav', // For audio files
  'json' // For JSON files
);

// Add source extensions
config.resolver.sourceExts.push(
  'js',
  'jsx',
  'ts',
  'tsx',
  'json'
);

// Enable package exports
config.resolver.unstable_enablePackageExports = true;

module.exports = config;