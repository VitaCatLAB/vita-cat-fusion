// scripts/afterPack.cjs
const path = require("path");
const { rebuild } = require("@electron/rebuild");

function resolveElectronVersion(context) {
  // 1) 优先从 electron-builder 上下文里拿（不同版本字段可能不同）
  const v =
    context?.packager?.electronVersion ||
    context?.electronVersion ||
    context?.packager?.config?.electronVersion;

  if (typeof v === "string" && v.trim()) return v.trim();

  // 2) 最稳兜底：直接读已安装的 electron 包版本
  try {
    // electron 在你根 package.json 里是 devDependencies，打包机上一定存在
    const pkg = require("electron/package.json");
    if (pkg?.version) return String(pkg.version);
  } catch (_) {}

  // 3) 再兜底：给出清晰错误
  throw new Error(
    "无法解析 Electron 版本号：请确认已安装 electron，或在 afterPack context 中可获取 electronVersion。"
  );
}

module.exports = async function afterPack(context) {
  const platform = context.electronPlatformName;

  // resources 目录：mac 与 win/linux 不同
  let resourcesDir = path.join(context.appOutDir, "resources");
  if (platform === "darwin") {
    const appName = context.packager.appInfo.productFilename + ".app";
    resourcesDir = path.join(
      context.appOutDir,
      appName,
      "Contents",
      "Resources"
    );
  }

  const nestServerDir = path.join(resourcesDir, "nest-server");
  const electronVersion = resolveElectronVersion(context);

  await rebuild({
    buildPath: nestServerDir,
    electronVersion,          // ✅ 现在一定是 string
    arch: context.arch,
    onlyModules: ["better-sqlite3"],
    force: true,
  });
};
