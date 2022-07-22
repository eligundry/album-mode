import path from 'path'
import fs from 'fs'
import resolveConfig from 'tailwindcss/resolveConfig'
import pick from 'lodash/pick'
import tailwindConfig from '../tailwind.config'

const p = path.join('./', 'app', 'tailwind.config.json')
const fullConfig = resolveConfig(tailwindConfig)
fs.writeFileSync(
  p,
  JSON.stringify(
    {
      ...pick(fullConfig.theme, [
        'colors',
        'screens',
        'fontFamily',
        'animation',
        'borderRadius',
      ]),
      ...pick(fullConfig, ['daisyui']),
    },
    undefined,
    2
  ),
  'utf8'
)
console.info(`Wrote tailwind config to ${p}`)
