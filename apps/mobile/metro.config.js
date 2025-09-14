const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Добавляем поддержку TypeScript
config.resolver.sourceExts.push('ts', 'tsx')

// Настройки для решения проблем с Node.js 24
config.resolver.platforms = ['ios', 'android', 'native', 'web']

module.exports = config
