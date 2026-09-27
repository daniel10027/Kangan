const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo : autorise Metro à résoudre les packages partagés (@kangan/*).
// On ne surveille QUE node_modules et packages/ à la racine — jamais tout
// workspaceRoot, qui inclurait apps/web (node_modules, .next, etc.) et fait
// exploser le nombre de descripteurs de fichiers ouverts (EMFILE) sans watchman.
config.watchFolders = [path.resolve(workspaceRoot, "node_modules"), path.resolve(workspaceRoot, "packages")];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules"), path.resolve(workspaceRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = false;

module.exports = withNativeWind(config, { input: "./global.css" });
