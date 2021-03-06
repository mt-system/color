#!/usr/bin/env node

// see https://jonasjacek.github.io/colors/
// see https://robotmoon.com/256-colors/
// see https://misc.flogisoft.com/bash/tip_colors_and_formatting

const colors = {
    16: {
        style: {
            defaultColour: 0,
            bold: 1,
            dim: 2,
            italic: 3,
            underlined: 4,
            blink: 5,
            overline: 6,
            reverse: 7,
            invisible: 8,
            strikethrough: 9,
            reset: {
                all: 0,
                bold: 21,
                dim: 22,
                italic: 23,
                underlined: 24,
                blink: 25,
                reverse: 27,
                invisible: 28,
                strikethrough: 29
            }
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
            silver: 7,
            dark: {
                default: 16,
                1: 232,
                2: 233,
                3: 234,
                4: 235,
                5: 236,
                6: 237,
                7: 238,
                8: 239,
                9: 240,
                10: 59,
                11: 241,
            },
            light: {
                default: 245,
                1: 246,
                2: 247,
                3: 248,
                4: 145,
                5: 249,
                6: 250,
                7: 251,
                8: 252,
                9: 188,
                10: 253,
                11: 254,
                12: 255
            },
            medium: {
                default: 242,
                1: 243,
                2: 244
            }

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



module.exports = {
    colors
};
