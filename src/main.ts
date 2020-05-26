import * as core from '@actions/core'
import * as git from 'nodegit'
import * as path from 'path'

async function run(): Promise<void> {
  try {
    git.Repository.open(path.resolve(__dirname)).then(function(repo) {
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
