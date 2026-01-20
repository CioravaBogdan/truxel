const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withDisableNonModularHeaders = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');
        
        // Add the build setting to allow non-modular includes
        const postInstallHook = `
    # Fix for non-modular headers in Firebase/Facebook SDK
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
      end
    end`;

        // Find the post_install block and inject our code
        if (podfileContent.includes('post_install do |installer|')) {
          // Insert after the opening of post_install
          podfileContent = podfileContent.replace(
            /post_install do \|installer\|/,
            `post_install do |installer|${postInstallHook}`
          );
        }
        
        fs.writeFileSync(podfilePath, podfileContent);
      }
      
      return config;
    },
  ]);
};

module.exports = withDisableNonModularHeaders;
