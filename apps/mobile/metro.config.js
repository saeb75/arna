// Expo SDK 57 monorepo'yu otomatik algılar (watchFolders/nodeModulesPaths);
// tek ek katman NativeWind. @glotmate/contracts çözümlemesi bu sayede bedava.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
