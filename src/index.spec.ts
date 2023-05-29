import { main } from '.'

describe('main', () => {

    it('should log unknown command message if no command is passed', () => {
        process.argv = ['foo', 'bar']
        console.log = jest.fn()
        main()
        expect(console.log).toHaveBeenCalledWith('Unknown command: undefined')
    })

    it('should log unknown command message if unknown command is passed', () => {
        process.argv = ['foo', 'bar', 'baz']
        console.log = jest.fn()
        main()
        expect(console.log).toHaveBeenCalledWith('Unknown command: baz')
    })

    describe('run', () => {
        it('should print hello world if no arguments are passed', () => {
            process.argv = ['foo', 'bar', 'run']
            console.log = jest.fn()
            main()
            expect(console.log).toHaveBeenCalledWith('Hello world!')
        })
    })
})
