/*
    TOMUSS: The Online Multi User Simple Spreadsheet
    Copyright (C) 2008-2019 Thierry EXCOFFIER, Universite Claude Bernard

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

    Contact: Thierry.EXCOFFIER@bat710.univ-lyon1.fr
*/

/*REDEFINE
Some table lines must not be modified.
This function return 'true' to allow the line editing.
*/
function modification_allowed_on_this_line(line_id, _data_col, value) {
    if (value === '')
        return true; // allowed to erase cell value on any line
    if (myindex(semesters, semester) == -1)
        return true;
    if (tr_classname === undefined)
        return true;
    if (!popup_on_red_line)
        return true;
    if (lines[line_id][tr_classname].value == 'non')
        return true; // Returns false here to forbid red line editing
    return true;
}

function update_student_picture() {
    if (update_student_picture.src
        && t_student_picture.src != update_student_picture.src)
        t_student_picture.src = update_student_picture.src;
}

function update_student_information_default(line) {
    if (the_current_cell.column.type == 'Upload'
        && the_current_cell.cell.comment.indexOf('video/') == 0) {
        frame_url = add_ticket(
            year + "/" + semester + "/" + ue
            + '/videoframe/' + the_current_cell.column.the_id + '/' + the_current_cell.line_id);
        set_message('videoframe', 1, '<img style="height:9em" src="' + frame_url + '">');
    }
    else
        set_message('videoframe', 1, '');
    if (columns[0].type != 'Login' && columns[0].title != 'ID')
        return;
    var src = student_picture_url(line[0].value);
    if (src != t_student_picture.src) {
        if (line[0].value !== '')
            update_student_picture.src = student_picture_url(line[0].value);
        else
            update_student_picture.src = undefined;
        t_student_picture.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kCERMYEgRCcOUAAAANSURBVAjXY3j+7991AAluA7tWByTdAAAAAElFTkSuQmCC';
    }
    t_student_picture.parentNode.href = add_ticket(
        suivi, line[0].value + '/' + ue + ':' + encode_uri(the_current_cell.column.title));
}

/*REDEFINE
  Template can redefine this function.
*/
function update_student_information(line) {
    update_student_information_default(line);
}

function bookmarked_indicator() {
    return bookmarked ? '<span style="color:#00F">★</span>' : '☆';
}

function toggle_bookmarked(t) {
    bookmarked = !bookmarked;
    t.innerHTML = bookmarked_indicator() +
        '<img src="' + add_ticket(year + '/' + semester + '/'
            + ue + '/bookmark/' + millisec()) + '" class="server">';
}

function options_indicator() {
    var s;
    if (get_recorded_options())
        s = 'color:#F00';
    else
        s = 'opacity:0.3';
    return '<span style="' + s + '">🖈</span>';
}

function toggle_options(t) {
    if (get_recorded_options())
        set_recorded_options('');
    else
        record_options();
    t.innerHTML = options_indicator();
}

function show_help_popup() {
    if (popup_is_open()) {
        popup_close();
        return;
    }
    create_popup('top_right help_popup', _("TITLE_help_popup"),
        '<div class="scrollable">'
        + hidden_txt(_("LABEL_help_autosave"), _("TIP_help_autosave"))
        + '<p>'
        + hidden_txt(_("LABEL_help_visibility"), _("TIP_help_visibility"))
        + '<p>'
        + _("LABEL_table_help")
        + '<p><b>' + _("TIP_documentation") + '</b>'
        + '<div class="shortcuts"><table>'
        + '<tr><td><a href="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/doc_table.html" target="_blank">'
        + _("LABEL_documentation") + '</a></tr>'
        + '<tr><td>'
        + '<a target="_blank" href="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/doc_table.html#average">'
        + _("LABEL_help_average") + '</a>'
        + '</tr><tr><td>'
        + '<a target="_blank" href="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/doc_table.html#filtrer">' +
        _("LABEL_filters") + '</a>'
        + '</tr><tr><td>'
        + '<a href="javascript:howto()">' + _('LABEL_howto') + '</a>'
        + '</tr></table></div>'

        + '<p><b>' + _("LABEL_styles") + '</b>'
        + '<div class="shortcuts"><table>'
        + _("TIP_styles").replace(/<span/g, "<tr><td><span")
            .replace(/<br>/g, '</tr>')
        + '</tr></table></div>'

        + '<p><b>' + _("LABEL_shortcuts") + '</b>'
        + display_short_cuts()
        + '</div>'
        , '', false);
}

function preference_change(t, value) {
    if (linefilter) {
        table_init();
        table_fill(true, true, true);
    }
    var img = document.createElement('IMG');
    img.src = add_ticket('save_preferences/' + value + '/' + millisec());
    img.className = 'server';
    t.appendChild(img);

    var key_value = value.split("=");
    try {
        if (display_data)
            (display_data['Preferences']
                || display_data['HomePreferences'])[key_value[0]] = key_value[1];
        if (preferences)
            preferences[key_value[0]] = key_value[1];
        detect_small_screen(true);
    }
    catch (e) { };
}

function zebra_change(t) {
    preference_change(t, "zebra_step=" + zebra_step);
}

function invert_name_change(t) {
    if (columns.length > 2 && columns[2].title == COL_TITLE_0_2) {
        if (preferences.invert_name == yes)
            columns[2].position = columns[1].position - 0.1;
        else
            columns[2].position = columns[1].position + 0.1;
    }

    preference_change(t, "invert_name=" + (preferences.invert_name == yes ? 1 : 0));
}

function invert_grpseq_change(t) {
    if (columns.length > 4 && columns[4].title == COL_TITLE_0_4) {
        if (preferences.invert_grpseq == yes)
            columns[4].position = columns[3].position - 0.1;
        else
            columns[4].position = columns[3].position + 0.1;
    }

    preference_change(t, "invert_grpseq=" + (preferences.invert_grpseq == yes ? 1 : 0));
}

function debug_table_change(t) {
    preference_change(t, "debug_table=" + (preferences.debug_table == yes ? 1 : 0));
}

function language_change(t) {
    preference_change(t, "language=" + preferences.language);
    if (!linefilter
        || table_attr.autosave
        && !requester.there_is_unsaved_data)
        setTimeout(function () { window.location = window.location }, 100);
}

function v_scrollbar_nr_change(t) {
    preference_change(t, "v_scrollbar_nr=" + preferences.v_scrollbar_nr);
}

function page_step_change(t) {
    preference_change(t, "page_step=" + preferences.page_step);
}

function one_line_more_change(t) {
    preferences.one_line_more = preferences.one_line_more == yes ? 1 : 0;
    preference_change(t, "one_line_more=" + preferences.one_line_more);
}

function filter_freezed_change(t) {
    preferences.filter_freezed = preferences.filter_freezed == yes ? 1 : 0;
    preference_change(t, "filter_freezed=" + preferences.filter_freezed);
}

function filter_disable_dbl_click(t) {
    preferences.disable_dbl_click = preferences.disable_dbl_click == yes ? 1 : 0;
    preference_change(t, "disable_dbl_click=" + preferences.disable_dbl_click);
}

function compact_change(t) {
    preferences.compact = preferences.compact == yes ? 1 : 0;
    set_body_theme(semester);
    preference_change(t, "compact=" + preferences.compact);
}

function sort_simple_click_change(t) {
    preferences.sort_simple_click = preferences.sort_simple_click == yes ? 1 : 0;
    preference_change(t, "sort_simple_click=" + preferences.sort_simple_click);
}

function show_preferences_language() {
    return radio_buttons('preferences.language', ["en", "fr"],
        preferences.language.split(',')[0],
        "language_change(this)") + _("Preferences_language")
}

function show_preferences_popup() {
    if (popup_is_open()) {
        popup_close();
        return;
    }
    create_popup('top_right', _("LABEL_preferences"),
        _('TIP_preferences')
        + '<p>'
        + radio_buttons('zebra_step/*.*/', ["3", "4", "5", "10"],
            zebra_step, "zebra_change(this)")
        + _("Preferences_zebra_step")
        + '<p>'
        + radio_buttons('preferences.invert_name', [yes, no],
            test_bool(preferences.invert_name),
            "invert_name_change(this)")
        + _("Preferences_invert_name")
        + '<p>'
        + radio_buttons('preferences.invert_grpseq', [yes, no],
            test_bool(preferences.invert_grpseq),
            "invert_grpseq_change(this)")
        + _("Preferences_invert_grpseq")
        + '<p>'
        + show_preferences_language()
        + '<p>'
        + radio_buttons('preferences.v_scrollbar_nr', ["0", "1", "2"],
            preferences.v_scrollbar_nr,
            "v_scrollbar_nr_change(this)")
        + _("Preferences_v_scrollbar_nr")
        + '<p>'
        + radio_buttons('preferences.page_step', ["0.25", "0.5", "1"],
            preferences.page_step,
            "page_step_change(this)")
        + _("Preferences_page_step")
        + '<p>'
        + radio_buttons('preferences.one_line_more', [yes, no],
            test_bool(preferences.one_line_more),
            "one_line_more_change(this)")
        + _("Preferences_one_line_more")
        + '<p>'
        + radio_buttons('preferences.filter_freezed', [yes, no],
            test_bool(preferences.filter_freezed),
            "filter_freezed_change(this)")
        + _("Preferences_filter_freezed")
        + '<p>'
        + radio_buttons('preferences.disable_dbl_click', [yes, no],
            test_bool(preferences.disable_dbl_click),
            "disable_dbl_click_change(this)")
        + _("Preferences_disable_dbl_click")
        + '<p>'
        + radio_buttons('preferences.compact', [yes, no],
            test_bool(preferences.compact),
            "compact_change(this)")
        + _("Preferences_compact")
        + '<p>'
        + radio_buttons('preferences.sort_simple_click', [yes, no],
            test_bool(preferences.sort_simple_click),
            "sort_simple_click_change(this)")
        + _("Preferences_sort_simple_click")
        + (i_am_root
            ? '<p>'
            + radio_buttons('preferences.debug_table', [yes, no],
                test_bool(preferences.debug_table),
                "debug_table_change(this)")
            + _("Preference_debug_suivi")
            : ''
        )
        , '', false);
}

var selected_semester;

function head_html() {
    if (window.location.pathname.search('=read-only=') != -1)
        table_attr.modifiable = false;

    if (window.location.pathname.search('/=linear=') != -1)
        preferences.interface = 'L';
    if (preferences.interface == 'L') {
        return '</head><body id="body" onunload="send_key_history()" class="tomuss"  onkeydown="dispatch2(the_event(event))" onkeypress="dispatch(the_event(event))">' +
            '<style>' +
            'ul { margin-top: 0px ; margin-bottom: 0px; }\n' +
            '@media speech { u { /* pause-after: 1s; */ } }\n' +
            '@media aural { u { /* pause-after: 1s; */ } }\n' +
            'u { /* pause-after: 1s; */ }\n' +
            '</style>' +
            '<div id="top"></div><input onkeydown="dispatch2(the_event(event))" onkeypress="dispatch(the_event(event))" style="width:1em"><div id="log"></div>';
    }
    var rss2 = suivi + '/rss2/' + ue;

    var w = '<link href="' + rss2 + '" rel="alternate" title="TOMUSS" type="application/rss+xml">'
        + '<title>' + ue + ' ' + year + ' ' + semester + ' ' + my_identity + '</title></head>'
        + '<body id="body" class="tomuss" onunload="the_current_cell.change();popup_close();requester.store_unsaved()" '
        + 'onkeydown="the_current_cell.keydown(event, false)">'
        // This message is visible in FireFox (bug ?)
        //   '<noscript>Activez JavaScript et réactualisez la page</noscript>'+
        + '<table class="identity">'
        + '<tr><td><a href="' + add_ticket('logout') + '">'
        + _('LABEL_logout') + '</a> <b>' + my_identity + '</b>'
        + '<br>'
        + ' <span id="requester_feedback"></span> '
        + hidden_txt(_('MSG_connected'), _('TIP_connection_state'), '',
            'connection_state')
        + hidden_txt(_('MSG_updating'), _('TIP_updating'), '', 'updating')
        + '<td class="icons">'
        + '<a class="clickable" target="_blank" href="' + rss2
        + '"><img style="border:0px" src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/feed.png"></a>'
        + hidden_txt('<a class="clickable" onclick="toggle_bookmarked(this)">'
            + bookmarked_indicator() + '</a>',
            _('TIP_bookmark'))
        + hidden_txt('<a class="clickable" onclick="toggle_options(this)">'
            + options_indicator() + '</a>',
            _('TIP_options'))
        + '<a href="javascript:show_help_popup()">' + _("TAB_?") + '</a>'
        + '<a href="javascript:show_preferences_popup()">≡</a>'
        + '</tr></table>'
        + '<div id="charsize" style="position:absolute;top:-999px">8</div>'
        + '<h1>'
        ;

    var ys = get_url_year_semester();
    options = all_the_semesters.split(/<option/);
    for (var i in options) {
        if (options[i].indexOf(year + '/' + semester) !== -1
            || options[i].indexOf(ys) !== -1) {
            options[i] = ' selected' + options[i];
            selected_semester = i - 1;
            break;
        }
    }
    if (selected_semester === undefined)
        options.splice(2, 0, ' selected>' + year + '/' + semester + '</option>');
    options = '<select onchange="semester_change(this)" '
        + 'onclick="semester_change(this)">' + options.join('<option')
        + '</select>' + ' ' + ue + ' ' + table_attr.table_title + '</h1>';

    return w + options;
}

function semester_change(t) {
    var item = t.value;
    if (year + '/' + semester == item)
        return;
    if (get_url_year_semester() == item)
        return;
    if (t.selectedIndex == selected_semester)
        return;
    t.blur();
    window.open(add_ticket(item + '/' + ue));
    // Reset to the good semester
    t.selectedIndex = selected_semester;
}


function one_line(text, tip, htmlclass) {
    return '<div class="one_line'
        + (htmlclass ? ' ' + htmlclass : '')
        + '">' + (tip ? hidden_txt(text, tip) : text) + '</div>';
}

function column_attr_set(column, attr, value, td, force_save) {
    var old_value = column[attr];
    var i_can_modify_column = column_change_allowed(column);

    if (old_value == value) {
        if (!i_can_modify_column)
            return;
        // Save the value even if the value is unmodified
        if (attr != 'width' && attr != 'position')
            return;
    }

    if (column_attributes[attr].need_authorization && !i_can_modify_column) {
        if (column.author == '*')
            alert_append(_("ERROR_value_not_modifiable")
                + ' [' + html(column.title) + '.' + attr + '=' + html(value) + ']\n'
                + _("ERROR_value_system_defined"));
        else
            alert_append(_("ERROR_value_not_modifiable") + '\n'
                + _("ERROR_value_defined_by_another_user")
                + table_attr.masters);
        return;
    }

    if (column.is_empty && column.data_col > 0
        && (columns_filter.filter || full_filter)) {
        alert_append(_('ERROR_column_creation'));
        return;
    }
    if (column.is_empty && column.data_col > 0
        && columns[column.data_col - 1].is_empty)
        alert_append(_("ERROR_column_left_to_right"));

    var new_value = column_parse_attr(attr, value, column, td === undefined);

    if (old_value === new_value && attr != 'width' && attr != 'position')
        return;

    if (column_attributes[attr].empty(column, old_value) && new_value == '')
        return; // The value stays empty...

    if (new_value === null)
        return null; // Do not store, but leave unchanged in user interface

    if (create_column(column) && attr == 'title')
        return new_value; // The title is yet sended to the server

    var change = column[attr] != new_value;
    column[attr] = new_value;

    if (!i_can_modify_column && (attr == 'width' || attr == 'position') && change)
        column_update_option(attr);

    if (i_can_modify_column
        && (!column_attributes[attr].action || force_save)) {
        if (typeof new_value == 'object')
            new_value = JSON.stringify(new_value);
        append_image(td, 'column_attr_' + attr + '/' + column.the_id + '/' +
            encode_uri(new_value));
        if (column.author != my_identity) {
            column.author = my_identity;
            the_current_cell.do_update_column_headers = true;
        }
    }

    return new_value;
}

function table_change_allowed() {
    return i_am_the_teacher || !table_attr.masters[0];
}


function table_attr_set(attr, value, td) {
    var old_value = table_attr[attr];

    if (old_value == value)
        return;

    if (!table_attributes[attr].action && !table_change_allowed()
        && !i_am_root
        && (myindex(table_attr.managers, my_identity) == -1 || attr != 'masters')
    ) {
        alert_append(_("ERROR_value_not_modifiable") + '\n'
            + _("ERROR_value_defined_by_another_user")
            + table_attr.masters);
        return;
    }

    value = table_attributes[attr].formatter(value);

    if (old_value == value)
        return;

    if (value === undefined)
        return old_value;

    table_attr[attr] = value;

    if (!table_attributes[attr].action)
        append_image(td, 'table_attr_' + attr + '/' + encode_uri(value),
            attr == 'modifiable');

    return value;
}

function attr_update_user_interface(attr, column, force_update_header) {
    if (column.need_update) {
        update_columns();
        update_histogram(true);
    }
    if (attr.display_table || column.need_update)
        table_fill(true, false, true);
    if (attr.update_horizontal_scrollbar)
        update_horizontal_scrollbar();

    //  the_current_cell.update_headers() ;

    if ((force_update_header || attr.update_headers)
        && column == the_current_cell.column) {
        the_current_cell.do_update_column_headers = true;
        the_current_cell.update_headers();
    }
    if (attr.what == 'table')
        the_current_cell.update_table_headers();

    if (attr.update_table_headers)
        table_header_fill();
    else if (attr.what == 'column') {
        e = document.getElementById('t_column_' + attr.name);
        if (e)
            update_attribute_value(e, attr, column, true);
    }
}

function an_user_update(event, input, column, attr) {
    var td = the_td(event);
    var new_value;

    if (input.selectedIndex !== undefined) {
        new_value = input.options[input.selectedIndex].value;
        input.selectedText = input.options[input.selectedIndex].text;
    }
    else
        new_value = decode_lf_tab(input.value);
    if (attr.what == 'column')
        new_value = column_attr_set(column, attr.name, new_value, td);
    else
        new_value = table_attr_set(attr.name, new_value, td);

    if (new_value === undefined) {
        // The value can't be modified, it must be resetted to old value
        if (input.selectedIndex === undefined) {
            if (input.value != input.theoldvalue)
                input.value = input.theoldvalue;
        }
        else
            input.selectedIndex = input.theoldvalue;
        return;
    }

    if (new_value === null)
        return; // Not stored, but leave user input unchanged

    var formated;
    if (attr.what == 'column')
        formated = attr.formatter(column, new_value);
    else
        formated = attr.formatter(new_value);

    if (input.selectedIndex === undefined)
        input.value = formated;

    input.theoldvalue = new_value;

    attr_update_user_interface(attr, column);
}

function filter_change_column(value, column) {
    column.filter = set_filter_generic(value, column);
    update_filters();
    update_histogram(true);
    table_fill(true, false, true);
}

function header_change_on_update(event, input, what) {
    last_user_interaction = millisec();
    var column = the_current_cell.column;
    if (what.match(/^column_attr_/)) {
        an_user_update(event, input, column,
            column_attributes[what.replace('column_attr_', '')]);
        if (what == 'column_attr_position') {
            var cols = column_list_all();
            for (var col in cols)
                if (cols[col] == column.data_col)
                    break;
            page_horizontal(0, col, true);
        }
        if (event.type === undefined)
            table_fill(true, true, false, true);
    }
    else if (what.match(/^table_attr_/))
        an_user_update(event, input, column,
            table_attributes[what.replace('table_attr_', '')]);
    else if (input.parentNode.parentNode.classList.contains('filter')) {
        filter_change_column(input.value, column);
        if (column.filter_error)
            event.target.classList.add('attribute_error');
        else
            event.target.classList.remove('attribute_error');
    }
}

function header_paste_real(event) {
    empty_header(event);
    header_change_on_update(event, event.target, '');
}

function header_paste(event) {
    event = the_event(event);
    periodic_work_add(function () { header_paste_real(event); });
}

// If column is undefined: unhighlight
function table_highlight_column(column) {
    if (column === undefined
        && !table_highlight_column.highlighted)
        return; // It was not highlighted

    table_highlight_column.highlighted = column !== undefined;

    for (var line = 0; line < table_attr.nr_lines + nr_headers; line++)
        for (var col = 0; col < table_attr.nr_columns; col++)
            if (column !== undefined && col != column)
                table.childNodes[line].childNodes[col].classList.add('transparent');
            else if (!is_previous_col_empty(col))
                table.childNodes[line].childNodes[col].classList.remove('transparent');
}

function table_highlight_current_column() {
    table_highlight_column(the_current_cell.col);
}
/*
  The definition of an input that dispatch update correctly
  and return focus in the table on key up/down/return
*/

function header_input_focus(e) {
    if (element_focused !== e)
        e.initial_value = e.value;
    element_focused = e;

    if (e.id.substr(0, 8) == 't_column')
        table_highlight_current_column();
}

function header_input(the_id, the_header_name, options) {
    var placeholder = '', classe = '', onkey = '', before = '', after = '', before_class = '', completion = '';
    // Don't call onblur twice (IE bug) : so no blur if not focused
    var onblur = "if(element_focused!==this && body_on_mouse_up_doing != 'login_list')return;element_focused = undefined;GUI.add(event.target.id, event);";
    if (the_header_name !== '') {
        onblur += "header_change_on_update(event,this,'" + the_header_name + "');";
    }
    if (options) {
        if (!options.search || options.search('"') != -1)
            alert('BUG : header_input parameter: ' + the_id + ' ' + options);

        if (options.search('placeholder=') != -1) {
            placeholder = 'placeholder="' + _(options.split('placeholder=')[1].split(' ')[0]) + '" ';
            classe = 'class="empty" '
        }
        if (options.search('onblur=') != -1)
            onblur += options.split('onblur=')[1].split(' ')[0] + ';';
        if (options.search('onkey=') != -1)
            onkey = options.split('onkey=')[1].split(' ')[0];
        if (options.search('beforeclass=') != -1)
            before_class = options.split('beforeclass=')[1].split(' ')[0].replace("%20", " ")
        if (options.search('before=') != -1)
            before = '<span class="' + before_class + '">'
                + options.split('before=')[1].split(' ')[0] + '</span>';
        if (options.search('after=') != -1)
            after = options.split('after=')[1].split(' ')[0];
        if (options.search('completion=') != -1)
            completion = ' get_completion_list="' + options.split('completion=')[1].split(' ')[0] + '"';
        if (options.search('one_line') != -1) {
            before = '<div class="one_line">' + before;
            after += '</div>';
        }
    }
    return before + '<input style="margin-top:0px" type="text" id="' + the_id
        + '" ' + placeholder + classe
        + ' autocorrect="off" autocapitalize="off" autocomplete="off'
        + '" onfocus="header_input_focus(this)" onblur="' + onblur
        + '" onkeyup="' + onkey + '" onpaste="' + onkey
        + '" oninput="' + onkey // Erase icon on IE
        + '"' + completion + '>' + after;
}

function theme_change(theme, t) {
    var themes = document.getElementById("GUI_themes")
        .firstChild.firstChild.childNodes;
    for (var i = 0; i < themes.length; i++) {
        var button = themes[i].firstChild;
        if (button.tagName == "TABLE")
            button.classList.remove("toggled");
    }
    preferences.theme = theme;
    t.parentNode.parentNode.parentNode.classList.add("toggled");
    set_body_theme(semester);

    alert_append_start();
    table_attr_set('theme', theme);
    if (alert_merged !== '')
        localStorage['/' + year + '/' + semester + '/' + ue + '/theme'] = theme;
    alert_merged = false;
}

function DisplayHomePreferencesThemes(node) // Used by home3.js
{
    var themes = [node === undefined
        ? '<td style="font-size:200%">'
        : '<td>',
    _("MSG_theme")];
    for (var i in css_themes) {
        var selected = css_themes[i] == (preferences.theme || "");
        var theme = 'theme' + css_themes[i] + ' ';
        themes.push('<td><table class="button_toggle '
            + (selected ? 'toggled' : '')
            + '"><tbody>'
            + '<tr><th class="' + theme + 'border" onclick="theme_change('
            + js2(css_themes[i]) + ', this)" style="border-width: 2px">'
            + '<span class="BodyRight">'
            + (i == 0 ? _("semester") : ' ') + '</span>'
            + '<span class="tab_selected"> </span>'
            + '<span class="toggled"> </span>'
            + '</th></tr></tbody></table>');
    }
    return hidden_txt('<table'
        + (node === undefined
            ? ' style="display:inline-block;font-size:50%;vertical-align:top"'
            : '') + ' id="GUI_themes"><tr>' + themes.join('') + '</tr></table>',
        _("TIP_default_theme"));
}

function an_input_attribute(attr, options, prefix_id, prefix_) {
    var the_id = prefix_id + attr.name;
    var title = _('TITLE_' + prefix_ + attr.name);
    var text;

    switch (attr.gui_display) {
        case 'GUI_input':
            text = header_input(the_id, prefix_ + attr.name, options);
            break;
        case 'GUI_a':
            text = '<a href="javascript:'
                + attr.action + '(\'' + the_id + '\');'
                + 'GUI.add(\'' + the_id + '\');"'
                + (prefix_ === 'column_attr_'
                    ? ' onclick="table_highlight_current_column()"'
                    : '')
                + ' id="' + the_id + '">'
                + title + '</a>';
            break;
        case 'GUI_none':
            text = title;
            break;
        case 'GUI_type':
        case 'GUI_button':
            text = '<button class="gui_button" id="'
                + the_id + '" '
                + 'onclick="' + attr.action + '(this);'
                + 'GUI.add(\'' + the_id + '\',event);'
                + (prefix_ === 'column_attr_'
                    ? 'table_highlight_current_column();'
                    : '')
                + '">'
                + title + '</button>';
            break;
        case 'GUI_select':
            var opts = '';
            for (var i in options)
                opts += '<OPTION VALUE="' + options[i][0] + '">'
                    + _(options[i][1]) + '</OPTION>';

            text = '<select onfocus="'
                + (prefix_ === 'column_attr_'
                    ? 'table_highlight_current_column();'
                    : '')
                + '" id="'
                + the_id + '" onChange="this.blur();'
                + "header_change_on_update(event,this,'" +
                prefix_ + attr.name + "');"
                + (attr.action ? attr.action + '(this);' : '')
                + 'GUI.add(\'' + the_id + '\',event);"'
                + ' onblur="if(element_focused===undefined)return;element_focused=undefined;">'
                + opts + '</select>';
            break;
        case 'GUI_theme':
            if (table_attr.theme !== '')
                preferences.theme = table_attr.theme;
            var t = localStorage['/' + year + '/' + semester + '/' + ue + '/theme'];
            if (t !== undefined)
                preferences.theme = t;
            text = DisplayHomePreferencesThemes();
            break;
        default:
            alert('BUG gui_display');
    }
    return text;
}

function column_input_attr(attr, options) {
    return an_input_attribute(column_attributes[attr], options,
        "t_column_", "column_attr_");
}

function table_input_attr(attr, options) {
    return an_input_attribute(table_attributes[attr], options,
        "t_table_attr_", "table_attr_");
}

/* tabbed view
  tabs = [ ['title1', 'content1', 'optional JS triggered by selection'],
           ...
     ]
 */

function create_tabs(name, tabs, more) {
    if (more === undefined)
        more = '';

    var s = ['<div class="tabs" id="' + name + '"><div class="titles">'];
    for (var i in tabs)
        s.push('<span id="title_' + tabs[i][0]
            + '" onclick="last_user_interaction=millisec();select_tab(\''
            + name + "','" + tabs[i][0] + '\',1);"'
            + (tabs[i][2] ? ' onkeypress="' + tabs[i][2] + '"' : '')
            + '>' + tabs[i][0]
            + '</span>');
    s.push(more + '</div><div class="contents">');
    for (var i in tabs)
        s.push('<div class="content" id="content_' + tabs[i][0] + '">'
            + tabs[i][1] + '</div>');
    s.push('</div></div>');

    return s.join('');
}

function update_column_position_menu() {
    var t = document.getElementById('t_column_position');
    if (!t)
        return;
    var option;
    while (t.firstChild)
        t.removeChild(t.firstChild);
    if (t.realonchange === undefined)
        t.realonchange = t.onchange;
    if (the_current_cell.column.freezed)
        t.onchange = function (event) {
            Alert("ALERT_position_freezed");
            t.realonchange(event);
        };
    else
        t.onchange = t.realonchange;
    var cols = column_list(0, columns.length);
    for (var i in cols) {
        var column = cols[i];
        if (i > 0 && column != the_current_cell.column) {
            option = document.createElement('option');
            option.innerHTML = html(column.title);
            if (cols[i - 1].position < column.position)
                option.value = (column.position + cols[i - 1].position) / 2;
            else
                option.value = column.position - 0.1;
            t.appendChild(option);
            if (cols[i - 1] == the_current_cell.column)
                option.selected = true;
        }
        if (column.is_empty && column != the_current_cell.column)
            break;
    }
}

function select_tab(name, tab, gui) {
    var tabs = document.getElementById(name);
    if (!tabs)
        return;
    try { the_current_cell.auto_select_tab = false; } catch (e) { }
    for (var child = tabs.childNodes[1].firstChild; child; child = child.nextSibling)
        if (child.id != 'content_' + tab)
            child.style.display = 'none';
        else
            child.style.display = '';

    for (var child = tabs.childNodes[0].firstChild; child; child = child.nextSibling)
        if (child.id != 'title_' + tab)
            child.className = '';
        else {
            child.className = 'tab_selected';
            if (child.onkeypress)
                child.onkeypress();
        }

    if (name != "cellule" && selected_tab(_('cellule')) == '✎')
        select_tab("cellule", _("TAB_cell")); // Unhide the other blocs

    if (gui && GUI)
        GUI.add('tab_' + name, '', tab);

    if (TIP)
        TIP.must_hide_tip_if_target_hidden();
    if (tab == 'Stats' && the_current_cell)
        update_histogram_real();
}

function selected_tab(name) {
    var tabs = document.getElementById(name);
    if (!tabs)
        return;
    for (var child = tabs.childNodes[0].firstChild; child; child = child.nextSibling)
        if (child.className == 'tab_selected')
            return child.id.substr(6);
}

function multiline_get_focus(element, event) {
    element_focused = the_event(event).target;
    element.value = decode_lf_tab(the_current_cell.input.value);
    element_focused.initial_value = element.value;
}

function multiline_lost_focus(element) {
    if (element_focused) {
        element_focused = undefined;
        the_current_cell.change(element.value);
    }
}

var filter_explanation = ' completion=filter_column_completion onkey=header_change_on_update(the_event(event),this,\'filter\')';

function new_new_interface() {
    var o, t;

    // CELLULE / Cellule

    t = ['<table class="cell"><tr><td>'];
    t.push(hidden_txt('<a href="" target="_blank">' +
        '<img id="t_student_picture" onload="update_student_picture()" class="phot"></a>',
        _("TIP_cell_attr_student_picture")));
    t.push('</td><td class="cell_values">');
    t.push(one_line('<a id="t_student_surname"></a>',
        _("TIP_cell_attr_student_surname")));
    t.push(one_line('<span id="t_student_firstname"></span>',
        _("TIP_cell_attr_student_firstname")));
    t.push(one_line('<span id="t_value"></span>', _("TIP_cell_value")));
    t.push(one_line(header_input
        ('comment', '',
            'placeholder=comment.png onblur=comment_on_change(event)'),
        "<span class=\"shortcut\">(Alt-/)</span>"
        + ___("TIP_cell_comment MSG_no_private_data")
    ));
    t.push(one_line(header_input('linefilter', '',
        'placeholder=filtre2.png onkey=line_filter_change(this)'),
        "<span class=\"shortcut\">(Ctrl-f)</span>" +
        _("TIP_cell_filter")));
    t.push('</td></tr></table>');
    o = [[_('TAB_cell'), t.join('\n')]];

    // CELLULE / Historique

    t = [];
    t.push(hidden_txt('<div id="t_history"></div>', _("TIP_cell_history")));
    o.push([_('TAB_history'), t.join('\n')]);

    // CELLULE / Editor

    t = [];
    t.push(hidden_txt('<textarea id="t_editor" '
        + 'onfocus="multiline_get_focus(this, event)" '
        + 'onblur="multiline_lost_focus(this)" '
        + '></textarea>',
        _("TIP_cell_editor")));
    o.push(['✎' /* ✍ */, t.join('\n')]);

    // CELLULE / ABJ...

    t = [];
    t.push(hidden_txt('<div id="t_details"></div>', _("TIP_cell_details")));
    o.push([_('TAB_details'), t.join('\n')]);

    // CELLULE / Tree

    t = [];
    t.push(hidden_txt('<div id="t_tree"></div>', _("TIP_cell_tree")));
    o.push([_('TAB_tree'), t.join('\n')]);

    // CELLULE

    var w = [];

    w.push('<table id="menutop" class="tabbed_headers"><tr><td class="tabbed_headers">');
    w.push(create_tabs('cellule', o,
        '<a id="autosavelog" href="#" onclick="table_autosave_toggle()">'
        + _("LABEL_save") + '</a>'
        + '<a id="tablemodifiableFB" onclick="select_tab(\'table\', \''
        + _("TAB_access")
        + '\'); highlight_add(document.getElementById(\'t_table_attr_modifiable\'))">'
        + _("LABEL_table_ro") + '</a>'
        + '<var style="border:0px;white-space:nowrap" id="log"></var>'));

    // COLUMN / Column

    t = [];
    t.push(one_line(
        column_input_attr('title', 'placeholder=title.png')
        + column_input_attr('grade_type',
            [[0, _("SELECT_column_grade_type_0")],
            [1, _("SELECT_column_grade_type_1")],
            [2, _("SELECT_column_grade_type_2")],
            [3, _("SELECT_column_grade_type_3")]
            ])
        + column_input_attr('grade_session',
            [[0, _("SELECT_column_grade_session_0")],
            [1, _("SELECT_column_grade_session_1")],
            [11, _("SELECT_column_grade_session_+1")],
            [2, _("SELECT_column_grade_session_2")],
            [12, _("SELECT_column_grade_session_+2")]
            ])
    ));

    var options = [];
    for (var type_i in types)
        options.push([types[type_i].title, 'B_' + types[type_i].title]);
    t.push(one_line(
        column_input_attr('type', options)
        + column_input_attr('completion')
        + column_input_attr('multiline')
        + column_input_attr('enumeration')
        + column_input_attr('test_filter', filter_explanation)
        + column_input_attr('test_if', filter_explanation)
        + column_input_attr('replace')
        + column_input_attr('normalize')
        + column_input_attr('upload_max')
        + column_input_attr('minmax')
        + column_input_attr('upload_zip')
        + column_input_attr('import_zip')
        + column_input_attr('analyser_config')
        + column_input_attr('dispatcher_config')
        + column_input_attr('notation_export')
        + column_input_attr('notation_import')
        + column_input_attr('MCQ_export')
        + column_input_attr('annotate')
        + column_input_attr('annotate_pdf')
        + column_input_attr('qrcode_prst')
        + column_input_attr('calendar')
        + column_input_attr('calendarexport')
        + column_input_attr('abi_is',
            [[0, _("SELECT_column_abi_is_0")],
            [1, _("SELECT_column_abi_is_DEF")]
            ])
        + column_input_attr('clamp',
            [[0, _("SELECT_column_clamp_0")],
            [1, _("SELECT_column_clamp_1")],
            [2, _("SELECT_column_clamp_2")],
            [3, _("SELECT_column_clamp_3")]
            ])
        + column_input_attr('urlimg',
            [[0, _("SELECT_column_urlimg_no")],
            [1, _("SELECT_column_urlimg_suivi")],
            [2, _("SELECT_column_urlimg_table")],
            [3, _("SELECT_column_urlimg_both")]
            ])
        + column_input_attr('replace_in_avg',
            [[0, _("SELECT_replace_in_avg")],
            [1, abj + '→0'],
            [2, ppn + '→0'],
            [3, ppn + '→0 &amp; ' + abj + '→0 ']
            ])
        + column_input_attr('competences_grade'),
        undefined, 'insert_spaces'));
    t.push(one_line(
        hidden_txt('<div id="t_column_histogram"></div>', _("TITLE_column_attr_stats_histo"))
        + hidden_txt('<div id="t_column_stats"></div>', _("TITLE_column_attr_stats_average"))));
    t.push(one_line(column_input_attr('comment', 'placeholder=comment.png')));
    t.push(one_line(header_input
        ("columns_filter", '',
            'placeholder=filtre2.png onkey=columns_filter_change(this)'),
        _("TIP_column_filter")));
    o = [[_("TAB_column"), t.join('\n')]];

    // COLUMN / Formula

    t = [];
    t.push(one_line(column_input_attr('empty_is',
        'placeholder=empty.png before=' + _("BEFORE_column_attr_empty_is") + ' beforeclass=widthleft')));
    t.push(one_line(column_input_attr('columns',
        'placeholder=columns.png before=' + _("BEFORE_column_attr_columns") + ' beforeclass=widthleft completion=column_name_completion')));
    t.push(one_line(
        '<div style="display:inline-block;width:calc(50% + var(--widthleft))">'
        + column_input_attr('best', 'before=' + _("BEFORE_column_attr_remove")
            + ' after=' + _("BEFORE_column_attr_best"))
        + column_input_attr('worst', 'after=' + _("BEFORE_column_attr_worst"))
        + '</div>'
        + column_input_attr('abj_is',
            [[0, _("SELECT_column_abj_is_nothing")],
            [1, _("SELECT_column_abj_is_average")],
            [2, _("SELECT_column_ppn_is_average")],
            [3, _("SELECT_column_abj_ppn_is_average")],
            ])));
    t.push(one_line(
        column_input_attr('rounding',
            'placeholder=rounding.png before=' + _("BEFORE_column_attr_rounding")
            + ' beforeclass=widthleft')
        + column_input_attr('groupcolumn',
            'placeholder=groupcolumn.png beforeclass=widthleft completion=column_name_completion before=' + _("BEFORE_column_attr_groupcolumn")
        )));
    t.push(one_line(
        column_input_attr('weight', 'before=' + _("BEFORE_column_attr_weight")
            + ' beforeclass=widthleft')
        + column_input_attr('repetition',
            'beforeclass=widthleft before=' + _("BEFORE_column_attr_repetition")
        )));

    o.push([_("TAB_formula"), t.join('\n')]);

    // COLUMN / Display

    t = [];
    t.push(one_line(
        column_input_attr('visibility',
            [[0, _("SELECT_column_visibility_date")],
            [5, _("SELECT_column_visibility_empty")],
            [1, _("SELECT_column_visibility_no")],
            [6, _("SELECT_column_visibility_student")],
            [2, _("SELECT_column_visibility_never")],
            [3, _("SELECT_column_visibility_public")],
            [4, _("SELECT_column_visibility_public_login")],
            ])
        + column_input_attr('visibility_date', 'placeholder=visible.png' + filter_explanation)
        + '&nbsp;<a target="_blank" id="visibility_link"></a>'));
    t.push(one_line(
        column_input_attr('red', 'before=' + _("BEFORE_column_attr_red")
            + ' placeholder=filtre2.png beforeclass=widthleft%20color_red' + filter_explanation)
        + column_input_attr('green', 'before=' + _("BEFORE_column_attr_green")
            + ' placeholder=filtre2.png beforeclass=widthright%20color_green' + filter_explanation)));
    t.push(one_line(
        column_input_attr('redtext', 'before=' + _("BEFORE_column_attr_red")
            + ' placeholder=filtre2.png beforeclass=widthleft%20redtext' + filter_explanation)
        + column_input_attr('greentext', 'before=' + _("BEFORE_column_attr_green")
            + ' placeholder=filtre2.png beforeclass=widthright%20greentext' + filter_explanation)));

    var widths = [];
    for (var i = 1; i < 30; i++)
        widths.push([i, i]);
    t.push(one_line(
        '<span class="widthleft">' + _("BEFORE_column_attr_position") + '</span>'
        + column_input_attr('position', [])
        + '<span class="widthleft">' + _("TITLE_column_attr_width") + '</span>'
        + column_input_attr('width', widths)));

    t.push(one_line(
        '<div style="width:50%;display:inline-block">'
        + column_input_attr('freezed') + '. ' + column_input_attr('hidden')
        + '. ' + column_input_attr('highlight')
        + '</div>'
        + column_input_attr('private', 'placeholder=private.png')));

    o.push([_("TAB_display"), t.join('\n')]);

    // COLUMN / Parameters

    t = [];
    t.push(one_line(column_input_attr('course_dates',
        'placeholder=course_dates.png before=' + _("BEFORE_column_attr_course_dates") + ' beforeclass=widthleft')));
    t.push(one_line(
        column_input_attr('url_base',
            'before=' + _("BEFORE_column_attr_url_base") + ' beforeclass=widthleft')
        + column_input_attr('url_title',
            'before=' + _("BEFORE_column_attr_url_title") + ' beforeclass=widthleft')
    ));

    t.push(one_line(column_input_attr('url_import',
        'placeholder=import.png before=' + _("BEFORE_column_attr_url_import") + ' beforeclass=widthleft')));

    t.push(one_line(column_input_attr('alert') + ' ' + column_input_attr('trigger')));

    t.push(one_line(
        column_input_attr('locked',
            [
                [0, _("SELECT_column_locked_no")],
                [1, _("SELECT_column_locked_yes")]
            ])
        + column_input_attr('cell_writable', filter_explanation)
        + column_input_attr('modifiable',
            [[0, _("SELECT_column_modifiable_by_nobody")],
            [1, _("SELECT_column_modifiable_by_teachers")],
            [2, _("SELECT_column_modifiable_by_students")]
            ])));

    o.push([_("TAB_column_param"), t.join('\n')]);

    // COLUMN / Action

    t = [];
    t.push(one_line(column_input_attr('export')));
    t.push(one_line(column_input_attr('import')));
    t.push(one_line(
        column_input_attr('fill')
        + hidden_txt(' (<a href="javascript:fill_column(\'redo\')">'
            + _('MSG_column_fill_redo') + '</a>)',
            _('TIP_column_fill_redo'))));
    t.push(one_line(column_input_attr('delete')));
    t.push(one_line(
        column_input_attr('speak',
            [[0, _("SELECT_column_speak_stop")],
            [1, _("SELECT_column_speak_slow")],
            [2, _("SELECT_column_speak")],
            [3, _("SELECT_column_speak_fast")]
            ])
        + ' '
        + _("LABEL_column_attr_author")
        + ' <span id="t_column_author"></span>'
    ));

    o.push([_("TAB_column_action"), t.join('\n')]);

    // COLUMN

    o.push(['Stats', '']);

    w.push('</td><td class="tabbed_headers">');
    w.push(create_tabs('column', o));


    // Table / Table

    t = [];

    t.push(one_line(
        hidden_txt('<span id="nr_filtered_lines"></span> ' +
            _("LABEL_nr_filtered_lines") + ' ',
            _("TIP_nr_filtered_lines"))
        + hidden_txt('<span id="nr_not_empty_lines"></span>',
            _("TIP_nr_not_empty_lines"))));
    t.push(one_line(
        table_input_attr('nr_lines').replace('</select>', '</select> ' +
            _("LABEL_select_nr_lines")) + ', '
        + table_input_attr('nr_columns').replace('</select>', '</select> ' +
            _("LABEL_select_nr_cols"))
        + ', ' + table_input_attr('autowidth')));
    t.push(one_line(
        table_input_attr('facebook')
        + table_input_attr('print')
        + table_input_attr('abj')
        + table_input_attr('mail')
        + table_input_attr('statistics')));

    t.push(one_line(table_input_attr("comment", 'placeholder=comment.png')));

    t.push(one_line(header_input('fullfilter', '',
        'placeholder=filtre2.png onkey=full_filter_change(this)'),
        _("TIP_table_filter")));

    o = [[_("TAB_table"), t.join('\n')]];

    // Table / Paramétrage

    t = [];

    t.push(one_line(
        table_input_attr('default_nr_columns',
            'before=' + _("BEFORE_table_attr_default_nr_columns"))
        + table_input_attr('theme')));
    t.push(one_line(table_input_attr('bookmark',
        [[0, _("SELECT_table_bookmark_false")],
        [1, _("SELECT_table_bookmark_true")]])
        + table_input_attr('hide_empty',
            [[0, _("SELECT_table_hide_empty_false")],
            [1, _("SELECT_table_hide_empty_true")]])));
    t.push(one_line(
        table_input_attr('table_title',
            'beforeclass=widthleft before=' + _("BEFORE_table_title").replace(" ", " "))
    ));
    t.push(one_line(
        table_input_attr('rounding',
            [[0, _("SELECT_table_rounding_down")],
            [1, _("SELECT_table_rounding_down_down")],
            [2, _("SELECT_table_rounding_no")]
            ])
        + (table_attr.group && myindex(table_attr.masters, my_identity) != -1
            ? table_input_attr('group') : '')));
    t.push(one_line(table_input_attr('dates',
        'beforeclass=widthleft before=' + _("BEFORE_table_dates"))));

    o.push([_("TAB_parameters"), t.join('\n')]);

    // Table / Access

    t = [];

    t.push(one_line('<span class="widthleft2">' + _("BEFORE_table_attr_private") + '</span>'
        + table_input_attr('private', [[0, _("SELECT_table_private_public")],
        [1, _("SELECT_table_private_private")]])));
    t.push(one_line('<span class="widthleft2">' + _("BEFORE_table_attr_modifiable") + '</span>'
        + table_input_attr('modifiable',
            [[0, _("SELECT_table_modifiable_false")],
            [1, _("SELECT_table_modifiable_true")]])));
    t.push(one_line(
        (myindex(semesters, semester) != -1
            ? '<span class="widthleft2">' + _("BEFORE_table_official_ue") + '</span>' +
            table_input_attr('official_ue',
                [[0, _("SELECT_table_official_ue_false")],
                [1, _("SELECT_table_official_ue_true")]])
            : '&nbsp;')));

    t.push(one_line(table_input_attr('teachers', 'placeholder=teacher.png beforeclass=widthleft2 before='
        + _("BEFORE_table_teachers"))));

    t.push(one_line(table_input_attr('masters', 'placeholder=teacher.png beforeclass=widthleft2 before='
        + _("BEFORE_table_masters"))));

    o.push([_("TAB_access"), t.join('\n')]);

    // Table / Action

    t = [];

    t.push(one_line(
        table_input_attr('t_create')
        + '/' + table_input_attr('t_export')
        + '/' + table_input_attr('t_import')
        + ' ' + _("LABEL_columns_definitions")));
    t.push(one_line(table_input_attr('t_copy') + ', ' + table_input_attr('invitation')));
    t.push(one_line(table_input_attr('autosave') + ', ' + hidden_txt('<a href="javascript:remove_history()">'
        + _("TITLE_table_attr_remove_history") + '</a>', _("TIP_table_attr_remove_history"))));
    t.push(one_line(table_input_attr('table_delete') + table_input_attr('hiddens')));
    t.push(one_line(table_input_attr('linear') + '.'
        + '<b>' + table_input_attr('forms') + '</b>.'
        + table_input_attr('update_content')
        + '.' + table_input_attr('table_clean')
        + hidden_txt('<div id="popup_on_red_line" style="display:inline">'
            + '<a href="javascript:change_popup_on_red_line(event)">...</a></div>',
            _("TIP_popup_on_red_line")), undefined, 'insert_spaces'));

    o.push([_("TAB_table_action"), t.join('\n')]);

    // Table / Info

    t = [];
    table_info.sort(); // A table of [Priority, Function generating the HTML]
    for (var i in table_info) {
        var v = table_info[i][1]();
        if (v)
            t.push(one_line(v));
    }

    o.push([_("TAB_table_info"), t.join('\n')]);

    // Table / Competences
    var comp_head = ['<div class="comp_head_content">',
        '<div class="comp_head_area" style="width: 65%"><p class="comp_head_title">', _("MSG_observations"), '</p>',
        '<button id="comp_agregate_button" onclick="comp_agregate_open()">', _("MSG_merge"), '</button>',
        '<div class="comp_head_weights"><p class="comp_head_title">', _("MSG_grades"), '</p>'];

    for (var i = 1; i < OBSERVATION_COLORS.length; i++)
        comp_head.push('<div class="comp_head_grade_area" index="', i, '">',
            '<div class="comp_head_observation" style="background-color:', OBSERVATION_COLORS[i], '"></div>',
            '<input style="margin-top:0px" type="text" autocorrect="off" autocapitalize="off" autocomplete="off"',
            ' onfocus="header_input_focus(this)" onblur="update_grade_weight(event.target)"></div>');

    comp_head.push('</div></div>',
        '<div class="comp_head_area" style="border-left: 1px #888 solid; width: 35%"><p class="comp_head_title">',
        _("MSG_expected"), '</p>',
        '<button id="comp_subcomps_button" onclick="comp_subcomps_open()">', _("MSG_expected_define"), '</button>',
        '<button id="subcomps_agregate_button" onclick="subcomps_agregate_open()">', _("MSG_expected_aggregate"), '</button>',
        '<div class="comp_import_area"><a class="aggr_import_export" onclick="competenceTable.aggr_export(event)">Exporter</a>',
        '/<a class="aggr_import_export" onclick="competenceTable.aggr_import()">Importer</a></div>',
        '</div>',
        '</div>');

    if (!is_catalog_table())
        o.push(["🎖️", comp_head.join('')]);

    // Table / Message

    o.push([_("TAB_table_message"), '']);

    w.push('</td><td class="tabbed_headers">');
    w.push(create_tabs('table', o));

    w.push('</td></tr></table>');
    w.push('<script>select_tab("cellule", "' + _("TAB_cell") + '");</script>');
    w.push('<script>select_tab("column", "' + _("TAB_column") + '");</script>');
    w.push('<script>select_tab("table", "' + _("TAB_table") + '");</script>');


    return w.join('\n');
}
// Only one message per key.
// level : 0:TIP 1:INFO 2:WARNING 3:ERROR
var table_messages = {};
function set_message(key, level, message) {
    var content = document.getElementById('content_' + _("TAB_table_message"));
    if (!content)
        return;
    var same_message = table_messages[key] ? table_messages[key][2] === message : message === undefined;
    var now = millisec();
    table_messages[key] = [level, now, message];
    if (same_message)
        return;
    var text = [];
    var max_level = 0;
    for (key in table_messages) {
        var infos = table_messages[key];
        if (infos[2] === '' || infos[2] === undefined)
            continue;
        max_level = Math.max(max_level, infos[0]);
        var when = Math.log10(10 + now - infos[1]) - 3; // 1:1s 2:10s 3:100s 4:1000s
        if (when >= 4) {
            table_messages[key] = [0, 0, undefined];
            continue;
        }
        var html_class = 'table_messages_' + infos[0]
            + ' table_messages_t' + Math.floor(when);
        text.push('<div class="' + html_class + '">' + infos[2] + '</div>');
    }
    content.innerHTML = ''.join(text);
    content.style.overflow = 'auto';

    document.getElementById('title_' + _("TAB_table_message")).style.background =
        ['initial', '#AFA', '#FDB', '#F88'][max_level];
    if (max_level >= 1) {
        select_tab("table", _("TAB_table_message"));
    }
    else if (selected_tab('table') == _('TAB_table_message'))
        select_tab("table", _("TAB_table"));
}

var popup_old_values = {};
var popup_after_close;

function popup_close_esc() {
    if (TIP.is_tip_visible())
        return;
    popup_close();
}

function popup_close() {
    element_focused = undefined;
    var e = document.getElementById('popup_id');
    if (e) {
        TIP.reset_tip();
        var t = e.getElementsByTagName('TEXTAREA');
        for (var i = 0; i < t.length; i++)
            popup_old_values[e.className + '_' + i] = t[i].value;
        t = e.getElementsByTagName('INPUT');
        for (var i = 0; i < t.length; i++)
            popup_old_values[e.className + '#' + i] = t[i].value;
        e.parentNode.removeChild(e);
        GUI.add('popup', '', 'close');
        if (popup_after_close) {
            popup_after_close();
            popup_after_close = undefined;
        }
    }
}

function parse_lines(text, keep_spaces) {
    text = text.replace(/\r\n/g, '\n').replace(/\n\r/g, '\n').replace(/\r/g, '\n');
    // Replace special characters introduced by 'table_export'
    text = text.replace(/∕/g, "/").replace(/ᐩ/g, '+');
    if (!keep_spaces)
        text = text.trim().replace(/ *\n */g, "\n").replace(/ *$/g, "");

    text = text.split('\n');
    while (text.length > 1 && text.length && text[text.length - 1] === '')
        text.pop();

    return text;
}

function popup_text_area() {
    return document.getElementById('popup_id').getElementsByTagName('TEXTAREA')[0];
}

function popup_value(keep_spaces) {
    return parse_lines(popup_text_area().value, keep_spaces);
}

function popup_set_value(value) {
    var text_area = popup_text_area();
    text_area.value = value;
    text_area.focus();
    text_area.select();
}

function popup_get_element() {
    var popup = document.getElementById('popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popup';
        document.getElementsByTagName('BODY')[0].appendChild(popup);
    }
    return popup;
}

function popup_is_open() {
    return !!document.getElementById('popup_id');
}

function popup_column() {
    return popup_get_element().column;
}

function popup_line() {
    return popup_get_element().line;
}

function popup_classname() {
    var popup = document.getElementById('popup');
    if (popup && popup.firstChild)
        return popup.firstChild.className.toString().replace('import_export ', '');
}

function create_popup(html_class, title, before, after, default_answer) {
    popup_close();
    TIP.reset_tip();
    var new_value = default_answer || '';

    var s = '<div id="popup_id" class="import_export ' + html_class
        + '"><h2>' + title + '</h2>' + before;
    if (default_answer !== false)
        s += '<TEXTAREA WRAP="off" ROWS="10" class="popup_input" onfocus="element_focused=this;">' + new_value + '</TEXTAREA>';

    s += '<BUTTON class="close" OnClick="popup_close()">&times;</BUTTON>' + after;

    var popup = popup_get_element();
    popup.innerHTML = s;

    if (default_answer) {
        var p = popup.firstChild;
        var t = p.getElementsByTagName('TEXTAREA');
        for (var i = 0; i < t.length; i++)
            if (popup_old_values[p.className + '_' + i] !== undefined)
                t[i].value = popup_old_values[p.className + '_' + i];
        t = p.getElementsByTagName('INPUT');
        for (var i = 0; i < t.length; i++)
            if (popup_old_values[p.className + '#' + i] !== undefined)
                t[i].value = popup_old_values[p.className + '#' + i];
    }
    if (the_current_cell) {
        popup.column = the_current_cell.column;
        popup.line = the_current_cell.line;
    }

    function try_with(tag) {
        for (var input of popup.getElementsByTagName(tag))
            if (input.tagName == 'TEXTAREA' || input.type === 'text') {
                input.focus();
                return true;
            }
    }
    try_with('INPUT') || try_with('TEXTAREA');

    try {
        GUI.add('popup', undefined, arguments.callee.caller.name);
    }
    catch (e) {
        GUI.add('popup', undefined, html_class);
    }
}



function tail_html() {
    if (preferences.interface == 'L')
        return '<iframe id="authenticate"></iframe>';

    var a = '<p class="copyright"></p>';

    a += '<div id="authenticate"></div>' +
        '<div id="current_input_div"' +
        'ontouchstart="do_touchstart(event)" ' +
        'ontouchmove="do_touchmove(event)" ' +
        'ontouchend="do_touchend()">' +
        '<input id="current_input" ' +
        'ondblclick="the_current_cell.toggle();" ' +
        'OnKeyDown="the_current_cell.keydown(event, true)" ' +
        'OnFocus="the_current_cell.focused=true;the_current_cell.input_div_focus()" ' +
        'OnBlur="if(event.relatedTarget && event.relatedTarget.tagName == \'SELECT\') return; the_current_cell.focused=false;the_current_cell.change(this.value, event)" ' +
        'autocorrect="off" ' +
        'autocapitalize="off" ' +
        'autocomplete="off" ' +
        '>' +
        '</div>';
    if (!is_a_virtual_ue) {
        if (navigator.appName == 'Microsoft Internet Explorer')
            window.XMLHttpRequest = false;
        if (window.XMLHttpRequest)
            a += '<div id="server_answer" style="width:1px;height:1px;border:0px;position:absolute;top:0px;left:0px"></div>';
        else
            a += '<iframe id="server_answer" style="width:1px;height:1px;border:0px;position:absolute;top:0px;left:0px" src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/sort_up.png"></iframe>';
        a += '</body>';
    }
    return a;
}

function howto() {
    create_popup('howto', '',
        '<iframe src="' + url + '/howto.html"></iframe>',
        '', false);
}

function insert_middle() {
    if (preferences.interface == 'L') {
        return;
    }
    i_am_root = myindex(root, my_identity) != -1;

    document.write(new_new_interface());

    var hs = '<div class="horizontal_scrollbar"><p onclick="javascript:previous_page_horizontal();">◀</p>'
        + '<div id="horizontal_scrollbar"></div><p onclick="javascript:next_page_horizontal();">▶</p>'
        + '</div><div>';
    var w = '';
    if (!scrollbar_right)
        w += '<div id="vertical_scrollbar"></div>';
    w += '<div id="divtable" class="colored"><div id="hover"></div></div>';
    if (scrollbar_right)
        w += '<div id="vertical_scrollbar"></div>';
    w += hs;
    w += '</div></div><div id="loading_bar"><div></div></div>';
    document.write(w);
}

function update_cell_details(line_id) {
    var element = document.getElementById('t_details');
    var title = document.getElementById("title_" + _('TAB_details'));
    var student_id = login_to_id(lines[line_id][0].value);
    var mail = table_attr.mails[student_id];
    var t = [
        '<a target="_blank" href="' + add_ticket(suivi, student_id) + '">'
        + _("TH_home_suivi") + '</a> * '
        + '<a target="_blank" href="' + add_ticket('bilan/' + student_id) + '">'
        + _("MSG_suivi_student_TOMUSS_bilan") + '</a> * '
        + '<a target="_blank" href="' + add_ticket(suivi, 'affichage_bilan_etudiant/' + student_id) + '">'
        + _("MSG_suivi_student_official_bilan") + '</a>'
    ];
    if (mail)
        t.push('<a href="mailto:' + mail + '">' + mail + '</a>');
    if (table_attr.portails[student_id])
        t.push(_("MSG_suivi_student_registered") + ' '
            + (' ' + _("TIP_tablecopy_and") + ' ').join(table_attr.portails[student_id]));
    var abjs = student_abjs(student_id);
    if (abjs !== '') {
        t.push(abjs);
        title.style.background = '#FF0';
    }
    else
        title.style.background = '';
    cell_details_update(line_id, t);
    element.innerHTML = '<br>'.join(t);

    var tree = document.getElementById('t_tree');
    if (tree && lines[the_current_cell.line_id])
        tree.innerHTML = _("TIP_cell_attr_student_picture") + line_resume(the_current_cell.line_id);
}

/*REDEFINE
  Update details with local informations
*/
function cell_details_update(_line_id, _lines) {
}


table_fill_hook = function() {
    if ( ue.substr(0, 3) == 'SP-' )
        popup_on_red_line = false ;
} ;

function modification_allowed_on_this_line(data_lin, data_col, value)
{
  if ( value === '' )
    return true ;
  if ( tr_classname == undefined )
    return true ;
  if ( ! popup_on_red_line )
    return true ;

  if ( lines[data_lin][tr_classname].value == 'non' )
    {
      alert_append(
"Vous êtes en train de faire une saisie pour un étudiant\n"+
"qui n'est pas officiellement inscrit à l'UE.\n"+
"\n"+
"Vous pouvez l'accueillir à titre uniquement temporaire (s'il a fait sa\n"+
"demande d'IP à cette UE et qu'il est en attente de réponse).\n"+
"ATTENTION, vous ne pourrez pas saisir de note pour lui et son UE ne pourra\n"+
"pas être validée par le jury tant que son IP ne sera pas officiellement faite."
        ) ;

      if ( data_col <= 5 )
          return true ;

      var s = ue.split('-')[1] ; // code UE
      if ( s === undefined )
          return true ;

      var annee = s.substr(3,1) ; // L'année de l'UE
      var licence = s.substr(s.length-1) == 'L' ;
      if ( columns[data_col].type == 'Note' && licence &&
                 (annee == '1' || annee == '2' || annee == '3' ))
          {
           return true ;
           /*
           alert_append('Saisie de note interdite : étudiant non inscrit');
           return false ;
           */
          }
      else
         return true ;
    }
  return true ;
}

function cell_details_update(line_id, texts) {
    var student_id = lines[line_id][0].value;
    var etape = table_attr.portails[student_id];
    if(!etape)
        return;
    if(!RegExp(/[123]L(BG|MI|PC|MA|EC|IF|BI|ST|PY|CH|ME|GC|EA)/).exec(etape))
        return;
    texts[0] += ' * <a target="_blank" href="https://edt.univ-lyon1.fr/visu_licence_sts_groupe/?login='
             + student_id + '">Emploi du temps STS</a>';
}
