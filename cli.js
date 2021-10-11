#!/usr/bin/env node

const { Command, Argument, InvalidArgumentError } = require('commander');
const { displayColors, displayColorKeys } = require('./color');

const program = new Command();

program.version(require('./package.json').version, '-v, --version', 'output the current version');

const parseInt = (value, _previous) => {
    const parsedValue = globalThis.parseInt(value, 10);

    if (Number.isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }

    return parsedValue;
};

const choices = (...values) => {
    return (value, _previous) => {
        if (!values.includes(value))
            throw new InvalidArgumentError(`Allowed choices are ${values.join(', ')}.`);

        return value;
    };
};

const parsers = (...handlers) => (value, previous) => handlers.reduce((last, handler) => {
    return handler(last, previous);
}, value);


program.command('display-styles')
    .addArgument(new Argument('[type]', 'terminal color type').argParser(parsers(parseInt, choices(16, 256))))
    .option('-r, --raw', 'output raw data without styling')
    .description('display terminal styles')
    .action((type, { raw }) => {
        if (!type || type === 16) {

            if (!raw)
                console.log('\nColors 16\n');

            displayColors(16, 'Text 16', {
                allStyles: false,
                styles: [ 'bold',/*  'underlined' */ ],
                mergeStyles: true,
                foreground: [ 'darkGrey' ],
                raw
            });
        }

        if (!type || type === 256) {

            if (!raw)
                console.log('\nColors 256\n');

            displayColors(256, 'Text 256', {
                allStyles: false,
                styles: [ 'bold' ],
                mergeStyles: true,
                foreground: [ 'grey.medium.default' ],
                raw
            });
        }
    });


program.command('display-keys')
    .addArgument(new Argument('[type]', 'terminal color type').argParser(parsers(parseInt, choices(16, 256))))
    .option('-r, --raw', 'output raw data without styling')
    .description('display terminal style keys')
    .action((type, { raw }) => {

        if (!type || type === 16) {
            if (!raw)
                console.log('\nColors 16\n');

            displayColorKeys(16, { raw });
        }

        if (!type || type === 256) {
            if (!raw)
                console.log('\nColors 256\n');

            displayColorKeys(256, { raw });
        }
    });


program.parse(process.argv);
