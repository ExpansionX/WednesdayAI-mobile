const { withXcodeProject } = require('expo/config-plugins');

function configuredIosEngine(config) {
  return config.ios?.jsEngine ?? config.jsEngine ?? 'hermes';
}

function setBuildSettingForAllConfigs(project, key, value) {
  const configurations = project.pbxXCBuildConfigurationSection();

  for (const configEntry of Object.values(configurations)) {
    if (!configEntry || typeof configEntry !== 'object' || !configEntry.buildSettings) {
      continue;
    }

    configEntry.buildSettings[key] = value;
  }
}

function withIosJscBuildSettings(config) {
  return withXcodeProject(config, (cfg) => {
    if (configuredIosEngine(cfg) === 'jsc') {
      setBuildSettingForAllConfigs(cfg.modResults, 'USE_HERMES', 'false');
    }

    return cfg;
  });
}

module.exports = withIosJscBuildSettings;
