#!/usr/bin/env bash

# shellcheck source=./colors.data.sh
function script_path() {
    realpath -s "$0"
}

function add_colors_variables() {
    local script=$(script_path)
    local script_dir=$(dirname "$script")

    source "$script_dir/colors.data.sh"
}

add_colors_variables

export is_256=$([[ $(tput colors) = 256 ]] && echo 1 || echo "")

# color() {
#     if [[ $is_256 ]]; then
#         c=$(tput setaf "$1")
#         echo "${c%m}"
#     else
#         echo "${1}"
#     fi
# }

# function bg_color() {
#     [[ $is_256 ]] && tput setab "$1" || echo ""
# }

# [[ $is_256 ]] && end_color="$(tput sgr0)" ||

function merge_styles() {
    local array_styles=("$@")
    local styles

    for style in "${array_styles[@]}"; do
        if [[ "$style" ]]; then
            styles="${styles}${styles+;}${style}"
        fi
    done

    # remove last ";"
    echo "${styles%;}"
}

function is_array_empty() {
    local array=("$@")
    ((${#array[@]} == 0)) && echo "1" || echo ""
}

function get_color_code_details() {
    var_name=${1//[-\.]/_}

    if [[ $is_256 ]]; then
        local v=${var_name//[-_]bg/}
        local is_bg=$([[ "$var_name" != "$v" ]] && echo "1" || echo "")

        eval s='$'"${v}${suffix}"

        if [[ $s ]]; then
            if [[ $is_bg ]]; then
                echo "256:bg:${s}"
                return
            else
                echo "256:fg:${s}"
                return
            fi
        else
            # let's try _16 if we are in 256 mode
            eval s='$'"${var_name}_16"
            if [[ $s ]]; then
                echo "16::${s}"
                return
            fi
        fi
    else
        eval s='$'"${var_name}${suffix}"
        if [[ $s ]]; then
            echo "16::${s}"
            return
        fi
    fi
}

function get_print_color() {
    if [[ $1 == "details" ]]; then
        local mode="$1"
        local push_mode="map"
        shift

        declare -A styles_fg_256=()
        declare -A styles_bg_256=()
        declare -A styles_16=()
        declare -A all_styles=()
    else
        declare -a styles_fg_256=()
        declare -a styles_bg_256=()
        declare -a styles_16=()
    fi

    function push() {
        declare -n arr=$1
        local k="$2" # key
        local value="$3"

        if [[ "$push_mode" == "map" ]]; then
            arr+=(["$k"]="$value")
            all_styles+=(["$k"]="$value")
        else
            arr+=("$value")
        fi
    }

    if [ "$1" == "info" ]; then
        [[ $is_256 ]] && push styles_fg_256 info "$green_light_sea_green_256" || push info styles_16 "$turquoise_16"
        shift
    elif [ "$1" == "success" ]; then
        [[ $is_256 ]] && push styles_fg_256 success "$green_spring_2_256" || push styles_16 success "$light_green_16"
        shift
    elif [ "$1" == "warning" ]; then
        [[ $is_256 ]] && push styles_fg_256 warning "$yellow_3_256" || push styles_16 warning "$yellow_16"
        shift
    elif [ "$1" == "danger" ]; then
        [[ $is_256 ]] && push styles_fg_256 danger "$red_1_256" || push styles_16 danger "$light_red_16"
        shift
    fi

    if (($# > 0)); then
        local suffix
        suffix=$([[ $is_256 ]] && echo "_256" || echo "_16")

        for var_name in "$@"; do
            local code=$(get_color_code_details $var_name)
            IFS=':' read -r -a color_code <<<"$code"

            local color="${color_code[2]}"

            if [[ ${color_code[0]} == "16" ]]; then
                push styles_16 "$var_name" "$color"
            else
                if [[ ${color_code[1]} == "fg" ]]; then
                    push styles_fg_256 "$var_name" "$color"
                else
                    push styles_bg_256 "$var_name" "$color"
                fi
            fi
        done
    fi

    local style=""

    if [[ ! $(is_array_empty "${styles_16[@]}") ]]; then
        style=$(merge_styles "${style}" "${styles_16[@]}")
    fi

    if [[ ! $(is_array_empty "${styles_fg_256[@]}") ]]; then
        style=$(merge_styles "${style}" "38;5" "${styles_fg_256[@]}")
    fi

    if [[ ! $(is_array_empty "${styles_bg_256[@]}") ]]; then
        style=$(merge_styles "${style}" "48;5" "${styles_bg_256[@]}")
    fi

    if [[ $style ]]; then
        local end_color="\e[0m"

        if [[ "$mode" == "details" ]]; then
            local detail="start=\e[${style}m\nend=${end_color}"

            if [[ ! $(is_array_empty "${styles_fg_256[@]}") ]]; then
                detail="${detail}\nforeground=38;5"
            fi

            if [[ ! $(is_array_empty "${styles_fg_256[@]}") ]]; then
                detail="${detail}\nbackground=48;5"
            fi

            for k in "${!all_styles[@]}"; do
                detail="${detail}\n$k=${all_styles[$k]}"
            done

            echo "example=\e[${style}mSome Text${end_color}\n${detail}"
        else
            echo "\e[${style}m:${end_color}"
        fi
    fi
}

print_color() {
    local text=$1
    shift

    local c=$(get_print_color "$@")
    IFS=':' read -r -a color_data <<<"$c"

    start=${color_data[0]}
    end=${color_data[1]}

    if [[ $start ]]; then
        # echo "$(color "$style")m%b${end_color}" | \cat -v
        printf "${start}%b${end}" "${text}"
    else
        echo "$text"
    fi
}

get_color_code() {
    # 2>/dev/null

    local code=$(get_print_color details "$@")
    printf -v new_line "\n"

    printf %s "${code//\\n/$new_line}"
    printf "\n"

    # IFS=':' read -r -a color_code <<<"$code"

    # local color=${color_code[2]}

    # if [ "$color" ]; then
    #     # return start color code / end color code separated with a column ":" to be parsable easily
    #     # echo "$(color "$style" | \cat -v)m:$($end_color | \cat -v)"
    #     echo "$color"
    # fi
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
    function underline() {
        print_color "$1" underlined
    }

    function option() {
        print_color "$1" italic
    }

    function yellow() {
        print_color "$1" yellow
    }

    local script=$(script_path)
    local script_name=$(basename "$script")

    program=$(yellow "$script_name")
    example=$(print_color "Example:" purple-magenta)

    \cat <<-EOS
  HELP:
    
  👉  printf with colors     🠒   $program $(underline print) <$(option text)> <...$(option colors)>  
      ✍   $example $program print "some text" red pink_bg bold underlined

  👉  show all color names   🠒   $program $(underline colors-names)

  👉  get a color code       🠒   $program $(underline color) <$(option color)>
      ✍   $example $program color pink_bg



  😇😇 $(print_color "        Little Tip        " grey white-bg bold) 😇😇

  Every color can use $(yellow -), $(yellow .) or $(yellow _) as a separator between words:

      ✍   $example $program print purple-magenta-bg
      ✍   $example $program print purple.magenta.bg
      ✍   $example $program print purple_magenta_bg

  Add the suffix $(yellow bg) to use a color as the background
  
EOS
}

if (($# > 0)); then
    case $1 in

    "print")
        command="print_color"
        ;;

    "color-names")
        command="get_color_names"
        ;;

    "color")
        command="get_color_code"
        ;;

    "help")
        help
        exit 1
        ;;

    *)
        printf "\n  "
        print_color "       Error        " white red-bg
        print_color "  🠒  $1" bold
        print_color " is not a supported command" red

        printf "\n\n"

        help
        exit 1
        ;;
    esac

    shift

    $command "$@"
fi
