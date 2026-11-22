// Compila l'APK di debug con il Gradle wrapper del progetto Android (Windows, macOS, Linux).
// Risultato: android/app/build/outputs/apk/debug/app-debug.apk
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const androidDir = join(process.cwd(), 'android')
const isWindows = process.platform === 'win32'
const gradlew = isWindows ? 'gradlew.bat' : './gradlew'

if (!existsSync(join(androidDir, isWindows ? 'gradlew.bat' : 'gradlew'))) {
  console.error('Progetto Android non trovato: esegui prima "npx cap add android".')
  process.exit(1)
}

const result = spawnSync(gradlew, ['assembleDebug'], { cwd: androidDir, stdio: 'inherit', shell: isWindows })
if (result.status === 0) console.log('\nAPK pronto: android/app/build/outputs/apk/debug/app-debug.apk')
process.exit(result.status ?? 1)
