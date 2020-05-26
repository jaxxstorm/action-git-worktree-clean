const git = require('isomorphic-git')
const fs = require('fs')

async function main() {
  const FILE = 0,
    HEAD = 1,
    WORKDIR = 2

  const filenames = (await git.statusMatrix({fs, dir: '.'}))
    .filter(row => row[HEAD] !== row[WORKDIR])
    .map(row => row[FILE])

  console.log(filenames.length)
}

main()
