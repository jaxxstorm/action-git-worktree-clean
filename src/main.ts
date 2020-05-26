import * as core from '@actions/core'
import * as git from 'isomorphic-git'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const workdir = process.env['GITHUB_WORKSPACE']
    if (!workdir) {
      throw new Error(
        `No workspace found, please use the checkout action and run in github actions`
      )
    }

    // see https://isomorphic-git.org/docs/en/statusMatrix for definitions
    const FILE = 0,
      HEAD = 1,
      WORKDIR = 2

    // get all the changed files asynchronously
    const changed = (
      await git.statusMatrix({
        fs,
        dir: workdir
      })
    )
      .filter(row => row[HEAD] !== row[WORKDIR])
      .map(row => row[FILE])

    /* If the changed array is greater than 0
    then we must have changed files
    */
    if (changed.length > 0) {
      for (const status of changed) {
        core.warning(status)
      }
      core.setOutput('clean', 'false')
    } else {
      core.setOutput('clean', 'true')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
