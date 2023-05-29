#!/usr/bin/env node

export const main = () => {
    const args = process.argv.slice(2)
    const command = args[0]

    switch (command) {
        case "run":
            console.log(`Hello world!`)
            break
        case "help":
            showHelp()
        default:
            console.log(`Unknown command: ${command}`)
    }
}

main(); 

const showHelp = () => {
    console.log(`
    Available commands:
    
    run      generates type declarations from db schema
    help     prints this message

    `)
}
