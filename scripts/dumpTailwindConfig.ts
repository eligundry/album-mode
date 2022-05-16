import fs from 'fs'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config'

const fullConfig = JSON.stringify(resolveConfig(tailwindConfig), undefined, 2)
fs.writeFileSync('app/tailwind.config.json', fullConfig, 'utf8')
console.info('Wrote tailwind config to app/tailwind.config.json')
