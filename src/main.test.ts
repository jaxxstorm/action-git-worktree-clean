import {execFileSync, spawnSync} from 'child_process'
import {mkdtempSync, rmdirSync, unlinkSync, writeFileSync} from 'fs'
import {tmpdir} from 'os'
import {join, resolve} from 'path'

let workspace: string
const bundle = resolve(__dirname, '../dist/index.js')

beforeEach(() => {
  workspace = mkdtempSync(join(tmpdir(), 'worktree-clean-'))
  execFileSync('git', ['init', '--quiet', workspace])
  writeFileSync(join(workspace, 'tracked.txt'), 'original\n')
  writeFileSync(join(workspace, '.gitignore'), 'ignored.txt\n')
  execFileSync('git', ['add', '.'], {cwd: workspace})
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.com',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '--quiet',
      '-m',
      'fixture'
    ],
    {cwd: workspace}
  )
})

afterEach(() => {
  rmdirSync(workspace, {recursive: true})
})

test.each(['clean', 'modified', 'untracked', 'deleted', 'staged', 'ignored'])(
  'bundled action handles a %s worktree',
  state => {
    if (state === 'modified' || state === 'staged') {
      writeFileSync(join(workspace, 'tracked.txt'), 'changed\n')
    }
    if (state === 'staged') {
      execFileSync('git', ['add', '.'], {cwd: workspace})
    }
    if (state === 'untracked') {
      writeFileSync(join(workspace, 'new.txt'), 'new\n')
    }
    if (state === 'deleted') {
      unlinkSync(join(workspace, 'tracked.txt'))
    }
    if (state === 'ignored') {
      writeFileSync(join(workspace, 'ignored.txt'), 'ignored\n')
    }
    const clean = state === 'clean' || state === 'ignored'
    const result = spawnSync(process.execPath, [bundle], {
      env: {
        ...process.env,
        GITHUB_WORKSPACE: workspace,
        'INPUT_FAIL-ON-UNCLEAN': 'true'
      },
      encoding: 'utf8'
    })
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(clean ? 0 : 1)
    expect(result.stdout).toContain(`::set-output name=clean::${clean}`)
  }
)

test('reports changes without failing when failure is disabled', () => {
  writeFileSync(join(workspace, 'tracked.txt'), 'changed\n')
  const result = spawnSync(process.execPath, [bundle], {
    env: {
      ...process.env,
      GITHUB_WORKSPACE: workspace,
      'INPUT_FAIL-ON-UNCLEAN': 'false'
    },
    encoding: 'utf8'
  })
  expect(result.status).toBe(0)
  expect(result.stdout).toContain('::set-output name=clean::false')
})

test('fails when no workspace is provided', () => {
  const result = spawnSync(process.execPath, [bundle], {
    env: {...process.env, GITHUB_WORKSPACE: ''},
    encoding: 'utf8'
  })
  expect(result.status).toBe(1)
  expect(result.stdout).toContain('No workspace found')
})
