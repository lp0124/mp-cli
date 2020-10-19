#! /usr/bin/env node

const program = require('commander')
console.log(11)
program
    .version(require('../package').version)
    .usage('<command> [options]')
    .command('init', 'generate a new project from a template')
    .parse(process.argv)
