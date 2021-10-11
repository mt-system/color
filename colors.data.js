#!/usr/bin/env node

// const { table, createStream } = require('table');
const fixedWidthString = require('fixed-width-string');
const stringWidth = require('string-width');

const colors = {
    16: {
        style: {
            defaultColour: 0,
            bold: 1,
            underlined: 4,
            flashingText: 5,
            reverseField: 7,
            concealed: 8
        },

        background: {
            black: 40,
            red: 41,
            green: 42,
            orange: 43,
            blue: 44,
            purple: 45,
            cyan: 46,
            grey: 47,
            darkGrey: 100,
            lightRed: 101,
            lightGreen: 102,
            yellow: 103,
            lightBlue: 104,
            lightPurple: 105,
            turquoise: 106,
            white: 107,
        },

        foreground: {
            black: 30,
            red: 31,
            green: 32,
            orange: 33,
            blue: 34,
            purple: 35,
            cyan: 36,
            grey: 37,
            darkGrey: 90,
            lightRed: 91,
            lightGreen: 92,
            yellow: 93,
            lightBlue: 94,
            lightPurple: 95,
            turquoise: 96,
            white: 97
        }
    },

    256: {
        black: 0,
        blue: {
            default: 12,
            1: 19,
            2: 20,
            3: 21,
            cornflower: 69,
            dark: 18,
            dodger: {
                default: 26,
                1: 27,
                2: 33
            },
            deep: {
                sky: {
                    default: 23,
                    1: 24,
                    2: 25,
                    3: 31,
                    4: 32,
                    5: 38,
                    6: 39
                }
            },
            light: {
                sky: {
                    default: 109,
                    1: 110,
                    2: 153
                },
                slate: 105,
                steel: {
                    default: 147,
                    1: 146,
                    2: 189,
                },

            },
            navy: {
                default: 4,
                1: 17,
            },
            royal: 63,
            sky: {
                default: 74,
                1: 111,
                2: 117
            },
            slate: {
                default: 61,
                1: 62,
                2: 99,
            },
            steel: {
                default: 67,
                1: 68,
                2: 75,
                3: 81
            },
            violet: 57,
        },

        brown: {
            maroon: 1,
            red: 52,
            orange: 94
        },

        green: {
            default: 2,
            1: 28,
            2: 34,
            3: 40,
            4: 46,
            aqua: 14,
            aquamarine: {
                default: 79,
                1: 86,
                2: 122
            },
            cadetBlue: {
                default: 72,
                1: 73,
            },
            chartreuse: {
                default: 64,
                1: 70,
                2: 76,
                3: 82,
                4: 112,
                5: 118,
            },
            cyan: {
                default: 43,
                1: 51,
                2: 50,
                dark: 36
            },
            dark: {
                default: 22,
                sea: {
                    default: 65,
                    1: 71,
                    2: 108,
                    3: 115,
                    4: 150,
                    5: 151,
                    6: 157,
                    7: 158,
                    8: 193
                },
                slateGray: {
                    default: 87,
                    1: 116,
                    2: 123
                },
                turquoise: 44
            },
            gray: 102,
            honeydew: 194,
            khaki: 143,
            light: {
                default: 119,
                1: 120,
                cyan: {
                    default: 195,
                    1: 152
                },
                seaGreen: 37,
                slateGrey: 103
            },
            lime: 10,
            olive: {
                default: 3,
                1: 107,
                2: 113,
                3: 149,
                4: 155,
                5: 191,
                6: 192
            },
            pale: {
                default: 77,
                1: 114,
                2: 121,
                3: 156
            },
            sea: {
                default: 78,
                1: 83,
                2: 84,
                3: 85
            },
            spring: {
                default: 29,
                1: 35,
                2: 41,
                3: 42,
                4: 47,
                5: 48,
                medium: 49
            },
            teal: 6,
            turquoise: {
                default: 30,
                1: 45,
                pale: {
                    default: 66,
                    1: 159
                },
                medium: 80,

            },
            yellow: 154,
        },


        grey: {
            default: 8,
            0: 8,
            1: 16,
            3: 59,
            4: 145,
            5: 188,
            6: 232,
            7: 233,
            8: 234,
            9: 235,
            10: 236,
            11: 237,
            12: 238,
            13: 239,
            14: 240,
            15: 241,
            16: 242,
            17: 243,
            18: 244,
            19: 245,
            20: 246,
            21: 247,
            22: 248,
            23: 249,
            24: 250,
            25: 251,
            26: 252,
            27: 253,
            28: 254,
            29: 255
        },

        orange: {
            default: 58,
            1: 172,
            2: 214,
            dark: {
                default: 130,
                1: 166,
                2: 208,
                goldenrod: 136,
            },
            red: 202,
            light: {
                goldenrod: {
                    default: 179,
                    1: 186,
                    2: 221,
                    3: 222,
                },
                salmon: {
                    default: 137,
                    1: 173,
                    2: 216
                },
            },
            sandyBrown: 215,
            salmon: 209,
            tan: 180
        },



        pink: {
            default: 175,
            1: 218,
            deep: {
                default: 53,
                1: 89,
                2: 125,
                3: 161,
                4: 162,
                5: 197,
                6: 198,
                7: 199
            },
            fuchsia: 13,
            hot: {
                default: 132,
                1: 168,
                2: 169,
                3: 205,
                4: 206
            },

            light: {
                default: 95,
                1: 174,
                2: 217,
                coral: 210,
            },
            pale: {
                violetRed: 211,
            },
            misty: {
                default: 181,
                1: 224
            },
            rosyBrown: 138,
        },

        purple: {
            default: 5,
            1: 54,
            2: 55,
            3: 56,
            4: 93,
            5: 129,
            dark: {
                violet: {
                    default: 92,
                    1: 128,
                }
            },
            grey: 139,
            magenta: {
                default: 127,
                1: 163,
                2: 164,
                3: 165,
                4: 200,
                5: 201,
                dark: {
                    default: 90,
                    1: 91,
                },
            },
            medium: {
                default: 60,
                1: 97,
                2: 98,
                3: 104,
                4: 135,
                5: 140,
                6: 141,
                violetRed: 126,
            },
            orchid: {
                default: 170,
                1: 213,
                2: 212,
                medium: {
                    default: 133,
                    1: 134,
                    2: 171,
                    3: 207
                },
            },
            plum: {
                default: 96,
                1: 176,
                2: 183,
                3: 219
            },
            thistle: {
                default: 182,
                1: 225
            },
            violet: 177
        },

        red: {
            default: 9,
            1: 124,
            2: 160,
            3: 196,
            dark: 88,
            indian: {
                default: 131,
                1: 167,
                2: 203,
                3: 204
            },
        },

        silver: 7,
        white: 15,

        yellow: {
            default: 11,
            1: 100,
            2: 106,
            3: 148,
            4: 184,
            5: 190,
            6: 226,
            cornsilk: 230,
            grey: 231,
            gold: {
                default: 142,
                1: 178,
                2: 220
            },
            khaki: {
                default: 228,
                1: 185
            },
            navajoWhite: {
                default: 144,
                1: 223
            },
            light:
            {
                default: 187,
                goldenrod: 227,
            },
            wheat: {
                default: 101,
                1: 229
            },
        }
    }
};


const markers = {
    escape: '\x1b',
    256: {
        fg: '38;5',
        bg: '48;5'
    }
};

const terminalWidth = process.stdout.columns || 80;


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
 *  @param {{ allStyles?: boolean; styles?: string[]; mergeStyles?: boolean}} options
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


    const { foregroundColors, backgroundColors } = (() => {
        if (type === 16)
            return {
                foregroundColors: objectToKeyValueArray(colors[ 16 ].foreground),
                backgroundColors: objectToKeyValueArray(colors[ 16 ].background),
            };

        const colors256 = objectToKeyValueArrayRecursive(colors[ 256 ]);

        console.assert(type === 256, 'type is 16 | 256');
        // throw new Error(`type must be 16 | 256. Here type: "${type}"`);

        return {
            foregroundColors: colors256,
            backgroundColors: colors256,
        };
    })();


    /*  if (type === 16) {
         const { foreground, background } = colors[ 16 ];

         for (const fg of objectToKeyValueArray(foreground)) {
             for (const bg of objectToKeyValueArray(background)) {
                 if (bg.key === fg.key)
                     continue;

                 for (const s of styles) {
                     console.log(
                         stylize({ style: `${s.value};${fg.value};${bg.value}`, text: `  ${text}  ` }),
                         ' ',
                         'fg: ', stylize({ style: `${fg.value}`, text: `${fg.key}` }), ' ፨ ',
                         'bg: ', stylize({ style: `${bg.value}`, text: `${bg.key}` }),
                         styles.length === 1 && s.key === 'defaultColour' ? '' : ` ፨ style: "${s.key}"`
                     );
                 }
             }
         }

         return;
     } */

    /* if (type === 256) { */
    /*    const allColors = objectToKeyValueArrayRecursive(colors[ 256 ]); */

    const rows = [];
    let rowMaxLength = 0;

    for (const fg of foregroundColors) {
        for (const bg of backgroundColors) {
            if (bg.key === fg.key)
                continue;

            for (const s of styles) {
                const data = {
                    color: stylize({ style: `${s.value};${markers[ 256 ].fg};${fg.value};${markers[ 256 ].bg};${bg.value}`, text: `  ${text}  ` }),
                    fg: stylize({ style: `${markers[ 256 ].fg};${fg.value} `, text: `${fg.key}` }),
                    bg: stylize({ style: `${markers[ 256 ].fg};${bg.value}`, text: `${bg.key}` }),
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
        for (let j = 0; j < nbColumns && i < rows.length; ++j) {
            process.stdout.write(fixedWidthString(rows[ i++ ], rowMaxLength, { padding: ' ', align: 'left' }));
            if (nbColumns > 1)
                process.stdout.write(' '.repeat(4));
        }

        process.stdout.write('\n');
    }
};


displayColors(16, 'Text 16', { allStyles: false });
displayColors(256, 'Text 256', { allStyles: false, styles: [ 'bold', 'underlined' ], mergeStyles: true });


module.exports = {
    colors,
    displayColors
};
