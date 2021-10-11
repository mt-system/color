#!/usr/bin/env node

// const { table, createStream } = require('table');
const fixedWidthString = require('fixed-width-string');
const stringWidth = require('string-width');
const { colors } = require('./colors.data');

const markers = {
    escape: '\x1b',
    16: {
        fg: '',
        bg: ''
    },
    256: {
        fg: '38;5',
        bg: '48;5'
    }
};

const terminalWidth = process.stdout.columns || 80;


/**
 *
 * @param {{[K:string|number]: any}} o
 * @returns {Array<{key:string; value:number}>}
 */
const objectToKeyValueArray = o => Object.entries(o).map(([ key, value ]) => ({ key, value }));

/**
 *
 * @param {{[K:string|number]: any}} o
 * @returns {Array<{key:string; value:number}>}
 */
const objectToKeyValueArrayRecursive = o => {

    return Object.entries(o).flatMap(([ key, value ]) => {
        if (typeof value !== 'object')
            return { key, value };


        const next = objectToKeyValueArrayRecursive(value);

        return next.map(n => ({ key: `${key}.${n.key}`, value: n.value }));
    });
};

const stylize = ({ style, text }) => `${markers.escape}[${style}m${text}${markers.escape}[0m`;


/**
 *  @param {16 | 25} type
 *  @param {string} text
 *  @param {{
 *      allStyles?: boolean;
 *      styles?: string[];
 *      mergeStyles?: boolean;
 *      foreground?: string[];
 *      background?: string[];
 *      onlyForeground?: boolean;
 *      onlyBackground?: boolean
 *  }} options
 */
const displayColors = (type, text, options) => {

    const opts = { allStyles: true, styles: [], mergeStyles: false, ...options };

    const stylesSelected = objectToKeyValueArray(colors[ 16 ].style).filter(s => {
        return opts.allStyles ||
            opts.styles.includes(s.key) ||
            (opts.styles.length === 0 ? s.value === colors[ 16 ].style.defaultColour : false);
    });


    const styles = opts.mergeStyles ?
        [
            stylesSelected.reduce((m, style, i) => ({
                key: `${m.key}${i === 0 ? '' : '.'}${style.key}`,
                value: `${m.value}${i === 0 ? '' : ';'}${style.value}`
            }), { key: '', value: '' })
        ] :
        stylesSelected;


    const getColors = () => {
        const hasColor = (colorKeys, color) => !!colorKeys?.find(k => color.key.startsWith(k));

        const filterFg = opts.onlyBackground ? _c => true : opts.foreground ? c => hasColor(opts.foreground, c) : _c => true;
        const filterBg = opts.onlyForeground ? _c => true : opts.background ? c => hasColor(opts.background, c) : _c => true;

        if (type === 16)
            return {
                foregroundColors: objectToKeyValueArray(colors[ 16 ].foreground).filter(filterFg),
                backgroundColors: objectToKeyValueArray(colors[ 16 ].background).filter(filterBg),
            };

        const colors256 = objectToKeyValueArrayRecursive(colors[ 256 ]);

        console.assert(type === 256, 'type is 16 | 256');
        // throw new Error(`type must be 16 | 256. Here type: "${type}"`);

        return {
            foregroundColors: colors256.filter(filterFg),
            backgroundColors: colors256.filter(filterBg),
        };
    };

    const { foregroundColors, backgroundColors } = getColors();


    const rows = [];
    let rowMaxLength = 0;

    for (const fg of foregroundColors) {
        for (const bg of backgroundColors) {
            if (bg.key === fg.key)
                continue;

            for (const s of styles) {
                const data = {
                    color: stylize({ style: `${s.value};${markers[ type ].fg};${fg.value};${markers[ type ].bg};${bg.value}`, text: `  ${text}  ` }),
                    fg: stylize({ style: `${markers[ type ].fg};${fg.value}`, text: `${fg.key}` }),
                    bg: stylize({ style: `${markers[ type ].fg};${bg.value}`, text: `${bg.key}` }),
                    style: styles.length === 1 && s.key === 'defaultColour' ? '' : s.key
                };

                const style = data.style ? ` ፨ style 🠒 ${data.style}` : '';
                const row = `${data.color} ፨ fg 🠒 ${data.fg} ፨ bg 🠒 ${data.bg}${style}`;

                rowMaxLength = Math.max(rowMaxLength, stringWidth(row));

                rows.push(row);
            }
        }
    }

    const nbColumns = Math.floor(terminalWidth / (rowMaxLength + 4)) || 1;  // 4 => margin right

    let i = 0;

    while (i < rows.length) {
        // for each column
        for (let j = 0; j < nbColumns && i < rows.length; ++j) {
            process.stdout.write(fixedWidthString(rows[ i++ ], rowMaxLength, { padding: ' ', align: 'left' }));

            if (nbColumns > 1)
                process.stdout.write(' '.repeat(4));
        }

        process.stdout.write('\n');
    }
};


console.log('\nColors 16\n');
displayColors(16, 'Text 16', { allStyles: false, styles: [ 'bold',/*  'underlined' */ ], mergeStyles: true, foreground: [ 'darkGrey' ] });

console.log('\nColors 256\n');
displayColors(256, 'Text 256', { allStyles: false, styles: [ 'bold'/* , 'underlined' */ ], mergeStyles: true, foreground: [ 'grey.15' ] });


module.exports = {
    displayColors
};
