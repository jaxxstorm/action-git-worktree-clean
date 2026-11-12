import {readFileSync} from 'fs'
import {resolve} from 'path'

const lock = JSON.parse(
  readFileSync(resolve(__dirname, '../package-lock.json'), 'utf8')
)

test.each([
  ['y18n', '4.0.1'],
  ['lodash', '4.17.21'],
  ['hosted-git-info', '2.8.9'],
  ['path-parse', '1.0.7'],
  ['isomorphic-git', '1.8.2'],
  ['tmpl', '1.0.5'],
  ['ajv', '6.12.6'],
  ['@actions/core', '1.9.1'],
  ['decode-uri-component', '0.2.2'],
  ['qs', '6.5.3'],
  ['json5', '2.2.3']
])('locks the reviewed Dependabot update for %s', (name, version) => {
  expect(lock.dependencies[name].version).toBe(version)
})
