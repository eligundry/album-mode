import path from 'path'
import fs from 'fs'
// @ts-ignore
import resolveConfig from 'tailwindcss/resolveConfig'
import pick from 'lodash/pick'
import tailwindConfig from '../tailwind.config'

const p = path.join('./', 'app', 'tailwind.config.json')
const fullConfig = resolveConfig(tailwindConfig)
// console.log(fullConfig.theme?.colors)
fs.writeFileSync(
  p,
  JSON.stringify(
    {
      colors: fullConfig.theme?.colors
        ? Object.entries(fullConfig.theme.colors).reduce(
            (acc, [name, value]: [string, any]) => {
              if (typeof value === 'function') {
                acc[name] = value({ opacityValue: undefined })
              } else {
                acc[name] = value
              }

              return acc
            },
            {} as Record<string, string>
          )
        : fullConfig.theme?.colors,
      ...pick(fullConfig.theme, [
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
// console.info(`Wrote tailwind config to ${p}`)
