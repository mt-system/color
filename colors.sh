#!/usr/bin/env bash

# shellcheck source=./colors.data.sh
SCRIPT=$(realpath $0)
DIRPATH=$(dirname $SCRIPT)

source "$DIRPATH/colors.data.sh"

export is_256=$([[ $(tput colors) = 256 ]] && echo 1 || echo "")

color() {
    if [[ $is_256 ]]; then
        c=$(tput setaf "$1")
        echo "${c%m}"
    else
        echo "${1}"
    fi
}

function bg_color() {
    [[ $is_256 ]] && tput setab "$1" || echo ""
}

[[ $is_256 ]] && end_color="$(tput sgr0)" || end_color="\e[0m"

function merge_styles() {
    local array_styles=("$@")
    local styles=""

    for style in "${array_styles[@]}"; do
        styles="${style};"
    done

    # remove last ";"
    echo "${styles%;}"
}

is_array_empty() {
    local array=("$@")
    ((${#array[@]} == 0)) && echo "1" || echo ""
}

print_color() {
    local text=$1
    shift

    local style=""
    local styles_fg_256=()
    local styles_bg_256=()
    local styles_16=()

    if [ "$2" == "info" ]; then
        [[ $is_256 ]] && styles_fg_256+=("$sea_green1_256") || styles_16+=("$turquoise_16")
        shift
    elif [ "$2" == "success" ]; then
        [[ $is_256 ]] && styles_fg_256+=("$spring_green2_256") || styles_16+=("$light_green_16")
        shift
    elif [ "$2" == "warning" ]; then
        [[ $is_256 ]] && styles_fg_256+=("$yellow3_256") || styles_16+=("$yellow_16")
        shift
    elif [ "$2" == "danger" ]; then
        [[ $is_256 ]] && styles_fg_256+=("$red1_256") || styles_16+=("$light_red_16")
        shift
    fi

    if (($# > 0)); then
        local suffix
        suffix=$([[ $is_256 ]] && echo "_256" || echo "_16")

        for var in "$@"; do
            eval s='$'"${var}${suffix}"
            if [[ $s ]]; then
                if [[ $is_256 ]]; then
                    [[ $var == *_bg ]] && styles_bg_256+=("$s") || styles_fg_256+=("$s")
                else
                    styles_16+=("$s")
                fi
            fi

            # let's try _16 if we are in 256 mode
            if [[ ! $s && "$is_256" ]]; then
                eval s='$'"${var}_16"
                [[ $s ]] && styles_16+=("$s")
            fi

            # style=$([[ $style && $s ]] && echo "${style};${s}" || echo "$s") # if "s" is set => ;$s else null
        done
    fi

    # style=${style:-$default_colour} # if $style is empty, use default value
    local style="\e["

    if [[ ! $(is_array_empty "${styles_16[@]}") ]]; then
        merge=$(merge_styles "${styles_16[@]}")
        style="${style}${merge}"
    fi

    if [[ ! $(is_array_empty "${styles_fg_256[@]}") ]]; then
        merge=$(merge_styles "${styles_fg_256[@]}")
        style="${style}38;5;${merge}"
    fi

    if [[ ! $(is_array_empty "${styles_bg_256[@]}") ]]; then
        merge=$(merge_styles "${styles_bg_256[@]}")
        style="${style}48;5;${merge}"
    fi

    if [[ $style ]]; then
        # echo "$(color "$style")m%b${end_color}" | \cat -v
        printf "${style}m%b${end_color}" "${text}"
    else
        echo "$text"
    fi
}

get_color() {
    eval style='$'"${1}" 2>/dev/null

    if [ "$style" ]; then
        # return start color code / end color code separated with a column ":" to be parsable easily
        echo "$(color "$style" | \cat -v)m:$($end_color | \cat -v)"
    fi
}

get_color_names() {
    read -r -d '' styles <<EOS

#####################################################################################
#####################################################################################
##############                        16                            ################
#####################################################################################
#####################################################################################

black=30
red=31
green=32
orange=33
blue=34
purple=35
cyan=36
grey=37
dark_grey=90
light_red=91
light_green=92
yellow=93
light_blue=94
light_purple=95
turquoise=96
white=97

# background

black_bg=40
red_bg=41
green_bg=42
orange_bg=43
blue_bg=44
purple_bg=45
cyan_bg=46
grey_bg=47
dark_grey_bg=100
light_red_bg=101
light_green_bg=102
yellow_bg=103
light_blue_bg=104
light_purple_bg=105
turquoise_bg=106
white_bg=107

# style

default_colour=0
bold=1
underlined=4
flashing_text=5 # disabled_on some_terminals
reverse_field=7 # exchange_foreground and_background color
concealed=8     # invisible

#####################################################################################
#####################################################################################
##############                        256                            ################
#####################################################################################
#####################################################################################


black=0
blue=12
blue_1=19
blue_2=20
blue_3=21
blue_cornflower=69
blue_dark=18
blue_dodger=26
blue_dodger_1=27
blue_dodger_2=33
blue_deep_sky=23
blue_deep_sky_1=24
blue_deep_sky_2=25
blue_deep_sky_3=31
blue_deep_sky_4=32
blue_deep_sky_5=38
blue_deep_sky_6=39
blue_light_sky=109
blue_light_sky_1=110
blue_light_sky_2=153
blue_light_slate=105
blue_light_steel=147
blue_light_steel_1=146
blue_light_steel_2=189
blue_navy=4
blue_navy_1=17
blue_royal=63
blue_sky=74
blue_sky_1=111
blue_sky_2=117
blue_slate=61
blue_slate_1=62
blue_slate_2=99
blue_steel=67
blue_steel_1=68
blue_steel_2=75
blue_steel_3=81
blue_violet=57
brown_maroon=1
brown_red=52
brown_orange=94
green=2
green_1=28
green_2=34
green_3=40
green_4=46
green_aqua=14
green_aquamarine=79
green_aquamarine_1=86
green_aquamarine_2=122
green_cadet_blue=72
green_cadet_blue_1=73
green_chartreuse=64
green_chartreuse_1=70
green_chartreuse_2=76
green_chartreuse_3=82
green_chartreuse_4=112
green_chartreuse_5=118
green_cyan=43
green_cyan_1=51
green_cyan_2=50
green_cyan_dark=36
green_dark=22
green_dark_sea=65
green_dark_sea_1=71
green_dark_sea_2=108
green_dark_sea_3=115
green_dark_sea_4=150
green_dark_sea_5=151
green_dark_sea_6=157
green_dark_sea_7=158
green_dark_sea_8=193
green_dark_slate_gray=87
green_dark_slate_gray_1=116
green_dark_slate_gray_2=123
green_dark_turquoise=44
green_gray=102
green_honeydew=194
green_khaki=143
green_light=119
green_light_1=120
green_light_cyan=195
green_light_cyan_1=152
green_light_sea_green=37
green_light_slate_grey=103
green_lime=10
green_olive=3
green_olive_1=107
green_olive_2=113
green_olive_3=149
green_olive_4=155
green_olive_5=191
green_olive_6=192
green_pale=77
green_pale_1=114
green_pale_2=121
green_pale_3=156
green_sea=78
green_sea_1=83
green_sea_2=84
green_sea_3=85
green_spring=29
green_spring_1=35
green_spring_2=41
green_spring_3=42
green_spring_4=47
green_spring_5=48
green_spring_medium=49
green_teal=6
green_turquoise=30
green_turquoise_1=45
green_turquoise_pale=66
green_turquoise_pale_1=159
green_turquoise_medium=80
green_yellow=154
grey=8
grey_silver=7
grey_dark=16
grey_dark_1=232
grey_dark_2=233
grey_dark_3=234
grey_dark_4=59
grey_dark_5=235
grey_dark_6=236
grey_dark_7=237
grey_dark_8=238
grey_dark_9=239
grey_dark_10=240
grey_dark_11=241
grey_light=245
grey_light_1=246
grey_light_2=247
grey_light_3=248
grey_light_4=145
grey_light_5=249
grey_light_6=250
grey_light_7=251
grey_light_8=252
grey_light_9=188
grey_light_10=253
grey_light_11=254
grey_light_12=255
grey_medium=242
grey_medium_1=243
grey_medium_2=244
orange=58
orange_1=172
orange_2=214
orange_dark=130
orange_dark_1=166
orange_dark_2=208
orange_dark_goldenrod=136
orange_red=202
orange_light_goldenrod=179
orange_light_goldenrod_1=186
orange_light_goldenrod_2=221
orange_light_goldenrod_3=222
orange_light_salmon=137
orange_light_salmon_1=173
orange_light_salmon_2=216
orange_sandy_brown=215
orange_salmon=209
orange_tan=180
pink=175
pink_1=218
pink_deep=53
pink_deep_1=89
pink_deep_2=125
pink_deep_3=161
pink_deep_4=162
pink_deep_5=197
pink_deep_6=198
pink_deep_7=199
pink_fuchsia=13
pink_hot=132
pink_hot_1=168
pink_hot_2=169
pink_hot_3=205
pink_hot_4=206
pink_light=95
pink_light_1=174
pink_light_2=217
pink_light_coral=210
pink_pale_violet_red=211
pink_misty=181
pink_misty_1=224
pink_rosy_brown=138
purple=5
purple_1=54
purple_2=55
purple_3=56
purple_4=93
purple_5=129
purple_dark_violet=92
purple_dark_violet_1=128
purple_grey=139
purple_magenta=127
purple_magenta_1=163
purple_magenta_2=164
purple_magenta_3=165
purple_magenta_4=200
purple_magenta_5=201
purple_magenta_dark=90
purple_magenta_dark_1=91
purple_medium=60
purple_medium_1=97
purple_medium_2=98
purple_medium_3=104
purple_medium_4=135
purple_medium_5=140
purple_medium_6=141
purple_medium_violet_red=126
purple_orchid=170
purple_orchid_1=213
purple_orchid_2=212
purple_orchid_medium=133
purple_orchid_medium_1=134
purple_orchid_medium_2=171
purple_orchid_medium_3=207
purple_plum=96
purple_plum_1=176
purple_plum_2=183
purple_plum_3=219
purple_thistle=182
purple_thistle_1=225
purple_violet=177
red=9
red_1=124
red_2=160
red_3=196
red_dark=88
red_indian=131
red_indian_1=167
red_indian_2=203
red_indian_3=204
white=15
yellow=11
yellow_1=100
yellow_2=106
yellow_3=148
yellow_4=184
yellow_5=190
yellow_6=226
yellow_cornsilk=230
yellow_grey=231
yellow_gold=142
yellow_gold_1=178
yellow_gold_2=220
yellow_khaki=228
yellow_khaki_1=185
yellow_navajo_white=144
yellow_navajo_white_1=223
yellow_light=187
yellow_light_goldenrod=227
yellow_wheat=101
yellow_wheat_1=229

EOS

    if [ "$1" == "only-names" ]; then
        for s in $styles; do echo "$s" | cut -d= -f 1; done
    else
        echo "$styles"
    fi
}

function help() {
    \cat <<-EOS
  HELP:
    
  ፨  printf with colors     🠒   $0 print <text> <...colors>
  ፨  show all color names   🠒   $0 colors-names
  ፨  get a color code       🠒   $0 color <color>
  
EOS
}

if (($# > 0)); then
    case $1 in

    "print")
        command="print_color"
        ;;

    "colors-names")
        command="get_color_names"
        ;;

    "color")
        command="get_color"
        ;;

    "help")
        help
        exit 1
        ;;

    *)
        printf "Please, enter a supported command\n\n"
        help
        exit 1
        ;;
    esac

    shift

    $command "$@"
fi
