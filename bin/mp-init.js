#!/usr/bin/env node

const program = require("commander")
const inquirer = require("inquirer")
const ora = require('ora')
const logger = require("../lib/logger")
const download = require('download-git-repo')
const path = require('path')

program.parse(process.argv)

const rawName = program.args[0] || ''
const templateName = 'lp0124/docker-vue'

main()

async function main() {
  try {
    if (await confirmCreateProject()) {
      downloadAndGenerate()
    }
  } catch (err) {
    logger.fatal(err)
  }
}

async function confirmCreateProject() {

  const inPlace = !rawName || rawName === "."
  if (inPlace) {
    const {
      ok
    } = await inquirer.prompt([{
      type: "confirm",
      message: "是否在当前目录中生成项目 ?",
      name: "ok",
    }, ])
    return !!ok
  }
  return true
}

function downloadAndGenerate() {
  const spinner = ora('downloading template')
  spinner.start()

  download(templateName, path.join(process.cwd(), rawName), {
    clone: false
  }, err => {
    spinner.stop()

    if (err) {
      logger.fatal('Failed to download repo ' + templateName + ': ' + err.message.trim())
    }
  })
}