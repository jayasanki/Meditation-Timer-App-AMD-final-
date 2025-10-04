const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable bridgeless mode
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Add support for more file types
config.resolver.assetExts.push(
  'db',    // For database files
  'mp3',   // For audio files  
  'wav',   // For audio files
  'json',  // For JSON files
  'png',   // For image files
  'jpg',   // For image files
  'jpeg'   // For image files
);

// Source extensions
config.resolver.sourceExts = [
  'js',
  'jsx', 
  'ts',
  'tsx',
  'json',
  'mjs'
];

module.exports = config;