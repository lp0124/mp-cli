#! /usr/bin/env node

const program = require("commander")
const inquirer = require("inquirer")
const logger = require("../lib/logger")
const path = require('path')
const memFs = require("mem-fs")
const editor = require("mem-fs-editor")
const fs = require('fs-extra')

program.parse(process.argv)

const rawName = program.args[0] || ''

const store = memFs.create()
const mfs = editor.create(store)

main()

async function main() {
  try {
    if (await confirmCreateProject()) {
      // 获取模板所有文件
      const files = await getAllFilesInFloder(path.join(path.resolve(), 'templates/default'), [])
      files.forEach(file => {
        const outPath = file.replace(path.join(path.resolve(), 'templates/default'), path.join(path.resolve(), rawName))
        mfs.copy(file, outPath)
      })
      mfs.commit(() => {
        console.log('文件创建完成')
      })
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

function readDirWithFileTypes (floder) {
  const list = fs.readdirSync(floder)
  const res = list.map(name => {
    const stat = fs.statSync(path.join(floder, name))
    return {
      name,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile()
    }
  })
  return res
}

const getAllFilesInFloder = async (
  floder,
  filter
) => {
  let files = []
  const list = readDirWithFileTypes(floder)

  await Promise.all(
    list.map(async item => {
      const itemPath = path.join(floder, item.name)
      if (item.isDirectory) {
        const _files = await getAllFilesInFloder(itemPath, filter)
        files = [...files, ..._files]
      } else if (item.isFile) {
        if (!filter.find(rule => rule === item.name)) files.push(itemPath)
      }
    })
  )

  return files
}
