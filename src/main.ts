import * as core from '@actions/core'
import * as git from 'nodegit'
import * as path from 'path'

async function run(): Promise<void> {
  try {
    const workdir = process.env['GITHUB_WORKSPACE']
    if (!workdir) {
      throw new Error(
        `No workspace found, please use the checkout action and run in github actions`
      )
    }

    const repodir = path.resolve(workdir)
    core.debug(`Using directory: ${repodir}`)

    git.Repository.open(repodir).then(function(repo) {
      repo.getStatus().then(function(statuses) {
        function statusToText(status: git.StatusFile): string {
          const words = []
          if (status.isNew()) {
            words.push('NEW')
          }
          if (status.isModified()) {
            words.push('MODIFIED')
          }
          if (status.isTypechange()) {
            words.push('TYPECHANGE')
          }
          if (status.isRenamed()) {
            words.push('RENAMED')
          }
          if (status.isIgnored()) {
            words.push('IGNORED')
          }

          return words.join(' ')
        }
        for (const s of statuses) {
          core.warning(`${s.path()} ${statusToText(s)}`)
        }
      })
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
