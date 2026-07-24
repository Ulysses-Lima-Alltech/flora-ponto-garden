import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.pontogarden.flora',
  appName: 'Flora',
  webDir: 'dist',
  backgroundColor: '#FAF7EE',
  server: {
    androidScheme: 'https',
  },
}

export default config
