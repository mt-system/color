#!/usr/bin/env node

const fixedWidthString = require('fixed-width-string');
const stringWidth = require('string-width');
const { colors } = require('./colors.data');

const markers = {
    escape: '\x1b', // in shell it is \e[
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

/**
 *  @param {string} colorKey
 *  @param {16 | 25} type
 */
const contrastBg = (colorKey, type) => {
    const greyBackground = `;${markers[ type ].bg};${lightGrey}`;

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
 *  @param {16 | 25} type
 */
const getColorsAndStyles = type => {
    if (type === 16) {
        return {
            foreground: objectToKeyValueArray(colors[ 16 ].foreground),
            background: objectToKeyValueArray(colors[ 16 ].background),
            styles: objectToKeyValueArray(colors[ 16 ].style)
        };
    }

    console.assert(type === 256, 'type is 16 | 256');
    // throw new Error(`type must be 16 | 256. Here type: "${type}"`);

    return {
        colors: objectToKeyValueArrayRecursive(colors[ 256 ])
    };
};



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
 *      onlyBackground?: boolean;
 *      raw?: boolean;
 *  }} options
 */
const displayColors = (type, text, options) => {

    const opts = { allStyles: true, styles: [], mergeStyles: false, raw: false, ...options };


    if (opts.raw) {
        for (const [ key, styles ] of Object.entries(getColorsAndStyles(type))) {
            console.log(`# ${key}`);

            for (const s of styles) {
                console.log(`${s.key}: ${s.value}`);
            }
        }

        return;
    }


    const getStyles = () => {
        const styles = objectToKeyValueArray(colors[ 16 ].style);

        const stylesSelected = styles.filter(s => {
            return opts.allStyles ||
                opts.styles.includes(s.key) ||
                (opts.styles.length === 0 ? s.value === colors[ 16 ].style.defaultColour : false);
        });


        if (opts.mergeStyles) {
            const mergeStyles = stylesSelected.reduce((m, style, i) => ({
                key: `${m.key}${i === 0 ? '' : '.'}${style.key}`,
                value: `${m.value}${i === 0 ? '' : ';'}${style.value}`
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

        if (type === 16)
            return {
                foregroundColors: objectToKeyValueArray(colors[ 16 ].foreground).filter(filterFg),
                backgroundColors: objectToKeyValueArray(colors[ 16 ].background).filter(filterBg),
            };

        console.assert(type === 256, 'type is 16 | 256');
        // throw new Error(`type must be 16 | 256. Here type: "${type}"`);

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
                    color: stylize({ style: `${s.value};${markers[ type ].fg};${fg.value};${markers[ type ].bg};${bg.value}`, text: `  ${text}  ` }),
                    fg: stylize({ style: `${markers[ type ].fg};${fg.value}${contrastBg(fg.key, type)}`, text: `${fg.key}` }),
                    bg: stylize({ style: `${markers[ type ].fg};${bg.value}${contrastBg(bg.key, type)}`, text: `${bg.key}` }),
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
 *  @param {16 | 25} type
 */
const displayColorKeys = (type, { raw = false }) => {

    Object.entries(getColorsAndStyles(type)).forEach(([ key, styles ], i) => {
        if (raw) {
            console.log(`# ${key}`);

            for (const style of styles) {
                console.log(style.key);
            }

        } else {
            let maxKeyLength = 0;

            const rows = styles.map(s => {
                maxKeyLength = Math.max(maxKeyLength, s.key.length);
                return raw ? s.key : stylize({ style: `${markers[ type ].fg};${s.value}${contrastBg(s.key, type)}`, text: `${s.key}` });
            });

            const boldUnderline = `${colors[ 16 ].style.bold};${colors[ 16 ].style.underlined}`;
            console.log(`${i > 0 ? '\n' : ''}${stylize({ style: boldUnderline, text: key })}:\n`);

            displayColumns(rows, maxKeyLength);
        }
    });
};



module.exports = {
    displayColors,
    displayColorKeys
};
