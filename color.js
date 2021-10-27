#!/usr/bin/env node

const fixedWidthString = require('fixed-width-string');
const stringWidth = require('string-width');
const { colors } = require('./colors.data');



/*
Name	decimal	octal	hex	    C-escape	Ctrl-Key	Description
ESC	    27  	033 	0x1B	\e	        ^[	        Escape character

Note: Some control escape sequences, like \e for ESC, are not guaranteed to work in all languages and compilers.
It is recommended to use the decimal, octal or hex representation as escape code.

Ctrl-Key: ^[
Octal: \033
Unicode: \u001b
Hexadecimal: \x1b
Decimal: 27

Followed by the command
Somtimes delimited by opening square bracket ([), known as a Control Sequence Introducer (CSI),
optionally followed by arguments and the command itself.

*/

const markers = {
    escape: '\x1b', // in shell it is \e
    16: {
        fg: '',
        bg: ''
    },
    256: {
        fg: '38;5',
        bg: '48;5'
    }
};


/**
 *
 * @param {string[]} styleFields
 * @param {string} sep
 * @returns {string}
 */
const $ = (styleFields, sep = ';') => styleFields.filter(v => !!v).join(sep);

const terminalWidth = process.stdout.columns || 80;


/**
 *
 * @param {{[K:string|number]: any}} o
 * @returns {Array<{key:string; value:number}>}
 */
// const objectToKeyValueArray = o => Object.entries(o).map(([ key, value ]) => ({ key, value }));

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
 *  @param {string[]} rows
 *  @param {number} rowMaxLength
 */
const displayColumns = (rows, rowMaxLength) => {
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



const lightGrey = colors[ 256 ].grey.light[ 4 ];
const { darkGrey } = colors[ 16 ].background;

/**
 *  @param {string} colorKey
 *  @param {16 | 25} mode
 */
const contrastBg = (colorKey, mode) => {
    const greyBackground = $([ markers[ mode ].bg, mode === 16 ? darkGrey : lightGrey ]);

    if (colorKey === 'black')
        return greyBackground;

    const fragments = colorKey.split('.');

    if (colorKey.startsWith('grey') && fragments[ 1 ] === 'dark')
        return greyBackground;

    if (colorKey.startsWith('blue') && (fragments[ 1 ] < 3 || fragments[ 1 ] === 'dark'))
        return greyBackground;

    return '';
};




/**
 *  @param {16 | 25} mode
 */
const getColorsAndStyles = mode => {
    if (mode === 16) {
        return {
            foreground: objectToKeyValueArrayRecursive(colors[ 16 ].foreground),
            background: objectToKeyValueArrayRecursive(colors[ 16 ].background),
            styles: objectToKeyValueArrayRecursive(colors[ 16 ].style)
        };
    }

    console.assert(mode === 256, 'mode is 16 | 256');
    // throw new Error(`mode must be 16 | 256. Here mode: "${mode}"`);

    return {
        colors: objectToKeyValueArrayRecursive(colors[ 256 ])
    };
};



/**
 *  @param {16 | 25} mode
 *  @param {string} text
 *  @param {{
 *      allStyles?: boolean;
 *      styles?: string[];
 *      mergeStyles?: boolean;
 *      foreground?: string[];
 *      background?: string[];
 *      onlyForeground?: boolean;
 *      onlyBackground?: boolean;
 *      raw?: boolean | 'json' | 'sh';
 *  }} options
 */
const displayColors = (mode, text, options) => {

    const opts = { allStyles: true, styles: [], mergeStyles: false, raw: false, ...options };


    if (opts.raw) {
        for (const [ key, styles ] of Object.entries(getColorsAndStyles(mode))) {
            displayRaw(key, styles, { mode, type: opts.raw === true ? 'sh' : opts.raw });
        }

        return;
    }


    const getStyles = () => {
        const styles = objectToKeyValueArrayRecursive(colors[ 16 ].style);

        const stylesSelected = styles.filter(s => {
            return opts.allStyles ||
                opts.styles.includes(s.key) ||
                (opts.styles.length === 0 ? s.value === colors[ 16 ].style.defaultColour : false);
        });


        if (opts.mergeStyles) {
            const mergeStyles = stylesSelected.reduce((m, style) => ({
                key: $([ m.key, style.key ], '.'),
                value: $([ m.value, style.value ])
            }), { key: '', value: '' });

            return [ mergeStyles ];
        }

        return stylesSelected;
    };

    const styles = getStyles();


    const getColors = () => {
        const hasColor = (colorKeys, color) => !!colorKeys?.find(k => color.key.startsWith(k));

        const filterAll = _c => true;
        const filterFg = opts.onlyBackground ? filterAll : opts.foreground ? c => hasColor(opts.foreground, c) : filterAll;
        const filterBg = opts.onlyForeground ? filterAll : opts.background ? c => hasColor(opts.background, c) : filterAll;

        if (mode === 16)
            return {
                foregroundColors: objectToKeyValueArrayRecursive(colors[ 16 ].foreground).filter(filterFg),
                backgroundColors: objectToKeyValueArrayRecursive(colors[ 16 ].background).filter(filterBg),
            };

        console.assert(mode === 256, 'mode is 16 | 256');
        // throw new Error(`mode must be 16 | 256. Here mode: "${mode}"`);

        const colors256 = objectToKeyValueArrayRecursive(colors[ 256 ]);

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
                    color: stylize({ style: $([ s.value, markers[ mode ].fg, fg.value, markers[ mode ].bg, bg.value ]), text: `  ${text}  ` }),
                    fg: stylize({ style: $([ markers[ mode ].fg, fg.value, contrastBg(fg.key, mode) ]), text: `${fg.key}` }),
                    bg: stylize({ style: $([ markers[ mode ].fg, mode === 16 ? bg.value - 10 : bg.value, contrastBg(bg.key, mode) ]), text: `${bg.key}` }),
                    style: styles.length === 1 && s.key === 'defaultColour' ? '' : s.key
                };

                const style = data.style ? ` ፨ style 🠒 ${data.style}` : '';
                const row = `${data.color} ፨ fg 🠒 ${data.fg} ፨ bg 🠒 ${data.bg}${style}`;

                rowMaxLength = Math.max(rowMaxLength, stringWidth(row));

                rows.push(row);
            }
        }
    }

    displayColumns(rows, rowMaxLength);
};


/**
 *  @param {string} str
 *  @returns string
 */
const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

/**
 *  @param {string} str
 *  @returns string
 */
const dotToSnakeCase = str => str.replace(/\./g, '_');

/**
 *  @param {string} str
 *  @returns string
 */
const toShellVariable = str => dotToSnakeCase(camelToSnakeCase(str));

/**
 *  @param {string} key
 *  @param {{key:string; value:number}[]} styles
 *  @param {{
 *      mode: 16 | 256;
 *      type: 'json' | 'sh';
 *      onlyKey?: boolean
 *  }} options
 */
const displayRaw = (key, styles, options) => {
    const { type, mode, onlyKey = false } = options;

    for (const s of styles) {
        if (type === 'sh')
            console.log(`${toShellVariable(s.key)}${key === 'background' ? '_bg' : ''}_${mode}${onlyKey ? '' : `=${s.value}`}`);
        else {
            console.assert(type === 'json');
            console.log(`${key}.${s.key}.${mode}${onlyKey ? '' : ` = ${s.value}`}`);
        }
    }
};


/**
 *  @param {16 | 25} mode
 *  @param {{
 *      raw?: boolean | 'json' | 'sh'
 *  }} options
 */
const displayColorKeys = (mode, options) => {

    const { raw = false } = options;

    Object.entries(getColorsAndStyles(mode)).forEach(([ key, styles ], i) => {
        if (raw) {

            displayRaw(key, styles, { mode, type: raw === true ? 'sh' : raw, onlyKey: true });

        } else {
            let maxKeyLength = 0;

            const rows = styles.map(s => {
                maxKeyLength = Math.max(maxKeyLength, s.key.length);
                return raw ? s.key : stylize({ style: $([ markers[ mode ].fg, s.value, contrastBg(s.key, mode) ]), text: s.key });
            });

            const boldUnderline = $([ colors[ 16 ].style.bold, colors[ 16 ].style.underlined ]);
            console.log(`${i > 0 ? '\n' : ''}${stylize({ style: boldUnderline, text: key })}:\n`);

            displayColumns(rows, maxKeyLength);
        }
    });
};



module.exports = {
    displayColors,
    displayColorKeys
};
