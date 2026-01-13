/*
    TOMUSS: The Online Multi User Simple Spreadsheet
    Copyright (C) 2008-2015 Thierry EXCOFFIER, Universite Claude Bernard

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

    Contact: Thierry.EXCOFFIER@univ-lyon1.fr
*/

// Constants
var vertical_scrollbar_width = 16;
var horizontal_scrollbar_height = 16;
var nr_headers = 2;
var bs = '<td>';
var maximum_url_length = 3000;
var is_a_teacher = false;
var periodic_work_period = 100; // In millisecs
// Work value
var element_focused;           // If undefined: it is the current_cell
var line_offset;		// The page being displayed
var column_offset;
var filters;			// The filters to apply to the lines
var nr_new_lines;		// Number of created lines
var nr_new_columns;		// Number of created columns
var nr_not_empty_lines;        // Number of non empty lines
var nr_not_fully_empty_lines;  // Number of non empty lines
var nr_filtered_not_empty_lines;        // Number of non empty lines
var nr_filtered_not_fully_empty_lines;  // Number of non empty lines
var sort_columns;		// Define the sort columns
var table;			// The table displayed on the screen
var tr_title;			// The header TR element for 'title'
var tr_filter;
var i_am_the_teacher;
var i_am_root;
var columns_filter;
var full_filter;
var line_filter;
var tr_classname;		// Column containing the className of the line
var popup_on_red_line;
var do_not_read_option;	// Option disabled for virtual tables
var the_current_cell;
var today;
var debug_window;
var filtered_lines;
var table_fill_do_not_focus;
var table_fill_force_current_cell_update;
var table_fill_hook;
var next_page_col;
var next_page_line;
var highlight_list;
var connection_state;
var auto_save_running;
var scrollbar_right;
var ask_login_list;
var first_day;
var last_day;
var current_window_width;
var current_window_height;
var table_info = []; // see middle.js
var last_user_interaction = 0; // setted with millisec()
var zebra_step;
var is_a_virtual_ue;
var TIP;

// HTML elements
var divtable;
var author;
var modification_date;
var server_log;
var the_body;
var nr_filtered_lines;
var the_comment;
var linefilter;
var horizontal_scrollbar;
var vertical_scrollbar;
var t_student_picture;
var t_student_firstname;
var t_student_surname;
var t_value;
var t_history;
var t_editor;
var t_date;
var t_author;
var t_menutop;
var thetable;

// Redefined if needed
var root;
var my_identity;
var days, days_full, months, months_full, ampms, ampms_full;
var contains_pm;
var css_themes = ["", "G", "A", "P", "D", "R", "BW"]; // In style.css
var rgpd_link;

// Give 1 if it is an ABJ/PPN value
var is_abjppn = {};
// Give 1 if it is an ABJ value
var is_abj = {};
// Give 1 if it is an ABI value
var is_abi = {};
// Give 1 if it is a PRST value
var is_pre = {};
// Give 1 if it is a TNR value
var is_tnr = {};

/*REDEFINE
  Returns 'true' if it is allowed to send the message.
  If it returns 'false', an explanation must be displayed.
*/
function allow_to_send_this_mail(subject, message) {
    var forbiden = /\.xyz[ /\n]/i;
    message += ' ';
    subject += ' ';
    if (message.match(forbiden) || subject.match(forbiden)) {
        alert("La messagerie de l'université interdit d'envoyer des mails "
            + "contenant des liens vers les sites web http://www.???.xyz/ "
            + "car ce sont généralement des arnaques.\n\n"
            + "Utilisez un autre site ou https://go.univ-lyon1.fr/ pour "
            + "créer votre URL personnelle vers XYZ."
        );
        return false;
    }
    return true;
}

function lib_init() {
    is_abjppn[abj] = 1;
    is_abjppn[abj_short] = 1;
    is_abjppn[abj_char] = 1;
    is_abjppn[ppn] = 1;
    is_abjppn[ppn_short] = 1;
    is_abjppn[ppn_char] = 1;
    for (var i in allowed_grades)
        if (is_abjppn[allowed_grades[i][0]])
            is_abjppn[i] = 1;
    is_abj[abj] = 1;
    is_abj[abj_short] = 1;
    is_abj[abj_char] = 1;
    for (var i in allowed_grades)
        if (is_abj[allowed_grades[i][0]])
            is_abj[i] = 1;
    is_abi[abi] = 1;
    is_abi[abi_short] = 1;
    is_abi[abi_char] = 1;
    for (var i in allowed_grades)
        if (is_abi[allowed_grades[i][0]])
            is_abi[i] = 1;
    is_pre[pre] = 1;
    is_pre[pre_short] = 1;
    is_pre[pre_char] = 1;
    for (var i in allowed_grades)
        if (is_pre[allowed_grades[i][0]])
            is_pre[i] = 1;
    is_tnr[tnr] = 1;
    is_tnr[tnr_short] = 1;
    is_tnr[tnr_char] = 1;
    for (var i in allowed_grades)
        if (is_tnr[allowed_grades[i][0]])
            is_tnr[i] = 1;

    divtable = document.getElementById('divtable');
    author = document.getElementById('author');
    modification_date = document.getElementById('date');
    server_log = document.getElementById('log');
    the_body = document.getElementById('body');
    if (the_body)
        the_body.style.overflowX = 'hidden';
    nr_filtered_lines = document.getElementById('nr_filtered_lines');
    the_comment = document.getElementById('comment');
    linefilter = document.getElementById('linefilter');
    horizontal_scrollbar = document.getElementById('horizontal_scrollbar');
    vertical_scrollbar = document.getElementById('vertical_scrollbar');
    t_student_picture = document.getElementById('t_student_picture');
    t_student_firstname = document.getElementById('t_student_firstname');
    t_student_surname = document.getElementById('t_student_surname');
    t_value = document.getElementById('t_value');
    t_history = document.getElementById('t_history');
    t_editor = document.getElementById('t_editor');
    t_date = document.getElementById('t_date');
    t_author = document.getElementById('t_author');
    t_menutop = document.getElementById('menutop');

    if (root === undefined)
        root = [];
    if (my_identity === undefined)
        my_identity = 'identity undefined';
    try {
        is_a_virtual_ue = ue === 'VIRTUALUE' || ue === '' || page_id <= 0;
    }
    catch (e) {
        is_a_virtual_ue = true;
    }
    line_offset = 0;// The page being displayed
    column_offset = 0;
    filters = [];// The filters to apply to the lines
    nr_new_lines = 0;// Number of created lines
    nr_new_columns = 0;// Number of created columns
    sort_columns = [];// Define the sort columns
    i_am_the_teacher = false;
    highlight_list = [];
    columns_filter = compile_filter_generic('');
    prst_is_input = true;
    popup_on_red_line = true;
    do_not_read_option = false; // Option disabled for virtual tables
    the_current_cell = new Current();
    connection_state = new Connection();
    auto_save_running = false;
    i_am_root |= myindex(root, my_identity) != -1;

    if (divtable) // In a table
    {
        compute_nr_cols();
        compute_nr_lines();
        // Update i_am_the_teacher
        table_attributes['masters'].formatter(table_attr['masters']);
    }
    current_window_height = window_height();
    current_window_width = window_width();

    today = new Date();
    today = today.getFullYear() + two_digits(today.getMonth() + 1) +
        two_digits(today.getDate()) + '000000';

    _today = new Date();
    _today.setHours(0, 0, 0, 0);

    if (isNaN(first_day))
        first_day = 0;
    if (isNaN(last_day))
        last_day = 86400000 * 365 * 1000; // parse_date('31/12/2100').getTime() ;

    days = eval(_("MSG_days"));
    days_full = eval(_("MSG_days_full"));
    months = eval(_("MSG_months"));
    months_full = eval(_("MSG_months_full"));
    ampms = eval(_("MSG_ampms"));
    ampms_full = eval(_("MSG_ampms_full"));
    contains_pm = new RegExp('.*(' + ampms[1] + '|' + ampms[1].toLowerCase() + ').*');

    var body = document.getElementsByTagName('BODY')[0];
    if (!body)
        return; // nodejs
    body.addEventListener('mousedown', (e) => hide_popup_or_tip_on_click_out(e),
        { capture: true, passive: true });

    TIP = new Tip();
    try {
        for (var f of pending_display_update)
            f();
    }
    catch (e) { }
}

function add_ticket(path, more) {
    if (ticket == 'none') // Shared suivi page
        return path;

    return (more === undefined ? url + '/' + path : path + '/' + more)
        + '?%E2%9C%80_________________________________________________________________'
        + ticket;
}

function add_ticket_checker(node) {
    if (ticket == 'none') // Shared suivi page
        return;
    if (window.check_ticket_time !== undefined
        && window.check_ticket_time > millisec() - 10000)
        return; // Wait 10 seconds before checking again
    window.check_ticket = undefined;
    window.check_ticket_time = millisec();
    var script = document.createElement('SCRIPT');
    script.src = add_ticket(url, 'check_ticket/' + millisec());
    node.appendChild(script);
    setTimeout(
        function () {
            if (window.check_ticket != 'True')
                Alert('MSG_bad_ticket');
        },
        10000); // Wait 10 seconds the server answer
}

function get_url_year_semester() {
    var t = window.location.pathname.split('/');
    for (var i in t)
        if (t[i] > 2000)
            return t[i] + '/' + t[Number(i) + 1];
}

function _d(_txt) {
}

function charsize() {
    return document.getElementById("charsize").offsetWidth;
}

function char_per_line() {
    return window_width() / charsize();
}

function compute_nr_cols() {
    table_attr.nr_columns = Math.floor(char_per_line() / 8.5);
    if (table_attr.nr_columns <= 0)
        // Needed for 'statistics_per_group' virtual table
        table_attr.nr_columns = 1;
}

var header_height;

function compute_header_height() {
    if (table) {
        document.body.style.overflow = 'hidden';
        header_height = findPosY(table.childNodes[0].childNodes[0]);
        var old = table_attr.nr_lines;
        compute_nr_lines();
        if (old !== table_attr.nr_lines) {
            table_init();
            table_fill(true, true, true);
        }
    }
}

function add_link_on_url(text) {
    return text.replace(/((https?|mailto):[-._a-zA-Z0-9/@~]*([?][-._a-zA-Z0-9/@=&;,]*)?)/g, '<a target="_blank" href="$1">$1</a>');
}

function compute_nr_lines() {
    if (!header_height) {
        table_attr.nr_lines = zebra_step + 1;
        compute_nr_lines.do_compute_nr_lines = true;
        periodic_work_add(compute_header_height);
        return;
    }
    if (!compute_nr_lines.do_compute_nr_lines)
        return; // Value set by the preference.
    if (the_current_cell.input) {
        // Number of displayed lines on the screen
        var line_height;
        try {
            line_height = (table.childNodes[nr_headers + zebra_step].offsetTop
                - table.childNodes[nr_headers].offsetTop) / zebra_step;
        } catch (e) {
            // The table is too small
            line_height = (table.childNodes[nr_headers + 1].offsetTop
                - table.childNodes[nr_headers].offsetTop);
        };
        table_attr.nr_lines = (window_height() - header_height
            - horizontal_scrollbar.offsetHeight
            /* XXX Magic number for Chrome/Opera */
            - 15 // horizontal_scrollbar.offsetHeight ???
        ) / line_height;
        table_attr.nr_lines = Math.floor(table_attr.nr_lines) - nr_headers;
        compute_nr_lines.do_compute_nr_lines = false;
    }

    if (table_attr.nr_lines < 3)
        table_attr.nr_lines = 3;
}

/*
 * Standard Variable name used in all the code :
 * line_id  : index of the line in 'lines'
 * lin      : index of the line in 'table'
 * data_col : index of the column in 'lines[line_id]'
 * col      : index of the column in 'table[lin]'
 * column   : is columns[data_col]
 * line     : is lines[line_id]
 * tr       : is 'table[lin]'
 * td       : is 'table[lin][col]' attributes : line_id, data_col, lin, col
 * type     : a type of column
 * type_i   : type index
 * type_txt : textual type
 */

function data_col_from_col_id(col) {
    for (var i in columns)
        if (columns[i].the_id == col)
            return Number(i);
}

function data_col_from_col_title(title) {
    for (var i in columns)
        if (columns[i].title == title)
            return Number(i);
}

// Index in 'filtered_lines'
function lin_from_line_id(line_id) {
    var lin;

    lin = myindex(filtered_lines, lines[line_id]) - line_offset;
    if (lin < 0 || lin >= table_attr.nr_lines)
        return;
    return lin;
}

function td_from_line_id_data_col(line_id, data_col) {
    var col, lin;

    col = columns[data_col].col;
    if (col === undefined)
        return;

    lin = lin_from_line_id(line_id);
    if (lin === undefined)
        return;

    return table.childNodes[lin + nr_headers].childNodes[col];
}

function col_from_td(td) {
    return myindex(td.parentNode.childNodes, td);
}

function data_col_from_col(col) {
    let col_elt = column_list(column_offset, col + 1)[col];
    if (col_elt != undefined)
        return col_elt.data_col;
}

function data_col_from_td(td) {
    return data_col_from_col(col_from_td(td));
}

function column_from_td(td) {
    return columns[data_col_from_td(td)];
}

function lin_from_td(td) {
    return myindex(td.parentNode.parentNode.childNodes, td.parentNode);
}

function line_id_from_lin(lin) {
    var line = line_offset + lin - nr_headers;
    if (line >= filtered_lines.length)
        return;
    if (line < 0)
        return;
    return filtered_lines[line].line_id;
}

function line_id_from_td(td) {
    return line_id_from_lin(lin_from_td(td));
}

// The parameter can be an event or an HTML element
function the_td(event) {
    var td;
    if (event && event.tagName)
        td = event;
    else {
        event = the_event(event);
        if (event === undefined)
            return;
        td = event.target;
    }
    if (td.tagName == 'INPUT' || td.tagName == 'SELECT'
        || (td.tagName == 'IMG' && td.className != 'server')
        || td.tagName == 'A' || td.tagName == 'BUTTON')
        return td.parentNode;
    else {
        while (td.tagName != 'TD' && td.tagName != 'TH')
            td = td.parentNode;

        return td;
    }
}

function the_input(event) {
    return the_event(event).target;
}

function get_recorded_options() {
    try {
        return localStorage['/' + year + '/' + semester + '/' + ue + '/options'];
    } catch (e) {
        localStorage.clear();
    }
}

function set_recorded_options(x) {
    delete localStorage['/' + year + '/' + semester + '/' + ue + '/options'];
    if (x && x !== '')
        localStorage['/' + year + '/' + semester + '/' + ue + '/options'] = x;
}

function get_option(name, default_value, do_not_unescape) {
    var o;

    o = window.location.pathname.split('=' + name + '=');
    if (o.length == 1) {
        var h = get_recorded_options();
        if (h)
            o = h.split('=' + name + '=');
    }
    if (o.length == 1)
        return default_value;
    o = o[1].split('/')[0];
    if (!do_not_unescape)
        o = decodeURI(o);
    return o;
}

function record_options() {
    var h = window.location.toString().split('/' + ue + '/');
    if (h.length == 2)
        set_recorded_options(h[1]);
}

function previous_year_semester(year, semester) {
    var i = myindex(semesters, semester);
    if (i == -1)
        return [year - 1, semester];
    i = (i + semesters.length - 1) % semesters.length;
    if (i != semesters.length - 1)
        return [year, semesters[i]];
    else
        return [year - 1, semesters[i]];
}

function next_year_semester(year, semester) {
    year = Number(year);
    var i = myindex(semesters, semester);
    if (i == -1)
        return [year + 1, semester];
    i = (i + 1) % semesters.length;
    if (i != 0)
        return [year, semesters[i]];
    else
        return [year + 1, semesters[i]];
}

function next_year_semester_number(year, semester) {
    year = Number(year);
    semester += 1;
    if (semester == semesters.length) {
        semester = 0;
        year += 1;
    }
    return [year, semester];
}

/******************************************************************************
Function are launched on header events
******************************************************************************/

function filter_keyup(event, force) {
    var e = the_event(event);
    if (force || e.keyCode > 40 || e.keyCode == 8 || e.keyCode == 32)
        header_change_on_update(e, e.target, '');
    GUI.add("column_filter", event);
}

function empty_header(event) {
    event = the_event(event);
    var input = event.target;

    input.classList.remove('empty');
    input.onkeyup = filter_keyup;
    input.onblur = filter_unfocus;
}

function header_focus(t, event) {
    t = t.parentNode;
    the_current_cell.change();
    the_current_cell.jump(the_current_cell.lin, col_from_td(t), true);
    element_focused = t;
    empty_header(event);
}

function filter_unfocus(event) {
    element_focused = undefined;
    event = the_event(event);
    var input = event.target;
    if (input.value === '') {
        input.classList.add('empty');
        input.onchange = function () { };
    }
}

function sort_columns_list() {
    var s = [];
    for (var c in sort_columns)
        if (sort_columns[c].dir > 0)
            s.push(sort_columns[c].data_col);
        else
            s.push(-sort_columns[c].data_col - 1);
    return s;
}

function sort_column_update_option() {
    change_option('sort', sort_columns_list().join('=') + '=');
}


/* The title is clicked */
function sort_column(data_col, force) {
    if (!force && periodic_work_in_queue(table_fill_do))
        return;

    if (data_col === undefined)
        data_col = the_current_cell.data_col;

    if (column_empty(data_col))
        return;

    line_offset = 0;

    if (sort_columns[0] !== undefined) {
        if (data_col == sort_columns[0].data_col) {
            table_fill(true, true, true);
            sort_column_update_option();
            return;
        }
    }

    var t = [columns[data_col]];

    for (var i in sort_columns) {
        if (sort_columns[i] != t[0]) {
            t.push(sort_columns[i]);
        }
        if (t.length == 3) // Limit the number of sort columns
            break;
    }

    sort_columns = t;
    table_fill(true, true, true);
    sort_column_update_option();
}

function sort_column_by(data_col, what) {
    header_title_click(TIP.current_target.parentNode);
    columns[data_col].sort_by = what;
    if (!the_current_cell.column.dir)
        the_current_cell.column.dir = 1;
    TIP.reset_tip();
    sort_column(data_col, true);
}

function is_element_visible(elt) {
    if (!elt)
        return false;
    // Exception case for the columns title sort menu.
    if (TIP.is_tip_sort_menu())
        return true;
    // Use of getComputedStyle to obtain the element's actual style with its inherited properties.
    let computed_style = getComputedStyle(elt);
    return elt.offsetHeight > 0
        && elt.offsetWidth > 0
        && computed_style.opacity !== 0
        && computed_style.display !== 'none'
        && computed_style.visibility !== 'hidden';
}

function hide_popup_or_tip_on_click_out(e) {
    if (popup_is_open()) {
        let popup = document.getElementById('popup');
        if (!popup || !popup.firstChild)
            return;
        if ((popup.firstChild.classList.contains('top_right')
            || popup.firstChild.classList.contains('preferences_popup')
            || popup.firstChild.classList.contains('explanations_popup'))
            && ((!e.target.contains(popup) && !popup.contains(e.target))
                || e.target.tagName === 'BODY'))
            popup_close_esc();
    } else if (TIP.is_tip_sort_menu())
        if ((!e.target.contains(TIP.current_target) && !TIP.tip.contains(e.target)) || e.target.tagName === 'BODY')
            TIP.reset_tip();
}

function Tip() {
    // The element concerned by the tip currently displayed. It is used to maintain the display of the tip
    // and to remember this element while we eventually save the next one for which a tip might be displayed.
    this.current_target = undefined;
    // The element concerned by the next tip to be displayed if the open_btn element is clicked.
    // It is used to maintain the display of the open_btn element or to refresh the current tip.
    this.open_btn_target = undefined;

    this.show_timestamp = 0;
    this.instant_tip_display = false;
    this.set_tip_content = undefined;   // If defined, then the tip content is this value.
    this.shift_key_pressed = 0; // Number of shift key pressed
    this.if_open_btn_just_clicked_do_not_show = false;
    this.is_mouse_down_on_button = false;

    this.active_debug_div = false;   // Set to true to display the debug div.

    var body = document.getElementsByTagName('BODY')[0];

    this.tip = document.createElement('DIV');
    this.tip.id = 'tip';

    this.highlighter = document.createElement('DIV');
    this.highlighter.id = 'highlighter';

    this.open_btn = document.createElement('DIV');
    this.open_btn.id = 'tip_open';
    this.open_btn.className = 'tip_open';
    this.open_btn.innerHTML = '<div class="tip_open">𝐢</div>';
    this.open_btn.addEventListener(
        'mousedown',
        function (event) {
            TIP.is_mouse_down_on_button = true;
            stop_event(event);
        });
    this.open_btn.addEventListener(
        'mouseup',
        function () {
            if (!TIP.is_mouse_down_on_button)
                return;
            TIP.is_mouse_down_on_button = false;
            let tmp_open_btn_target = TIP.open_btn_target;
            TIP.reset_tip();
            TIP.if_open_btn_just_clicked_do_not_show = true;
            show_the_tip(tmp_open_btn_target, true);
        }, { capture: true, passive: true });

    this.close_btn = document.createElement('DIV');
    this.close_btn.id = 'tip_close';
    this.close_btn.innerHTML = '×';
    this.close_btn.addEventListener('mouseup', () => TIP.reset_tip(),
        { capture: true, passive: true });

    if (this.active_debug_div) {
        this.debug_div = document.createElement('DIV');
        this.debug_div.id = 'debug_div';
        this.debug_div.style.background = 'white';
        this.debug_div.style.border = '2px solid black';
        this.debug_div.style.padding = '3px';
        this.debug_div.style.position = 'absolute';
        this.debug_div.style.top = '0';
        this.debug_div.style.right = '0';
        this.debug_div.style.zIndex = '10000';
        this.debug_div.style.display = 'visible';
        body.appendChild(this.debug_div);
    }

    body.appendChild(this.tip);
    body.appendChild(this.highlighter);
    body.appendChild(this.open_btn);

    body.addEventListener('mouseover', (event) => TIP.must_display_or_update_tip(event),
        { capture: true, passive: false });
    body.addEventListener('mouseout', () => TIP.hide_tip(),
        { capture: true, passive: false });
    body.addEventListener('keydown', (event) => TIP.key_pressed(event),
        { capture: true, passive: false });
    body.addEventListener('keyup', (event) => TIP.key_released(event),
        { capture: true, passive: true });
}

Tip.prototype.key_pressed = function (event) {
    let home_search = document.getElementById('search_home');
    if (home_search && !popup_is_open() && event.key == 'f' && event.ctrlKey) {
        event.preventDefault(true);
        home_search.focus();
        home_search.select();
    }
    if (this.current_target)
        return;
    this.shift_key_pressed += event.key == 'Shift';
    if (this.shift_key_pressed) {
        this.reset_tip();       // Closes the currently open tip before displaying
        periodic_work_add(() => // the target element tip when Shift is pressed.
            show_the_tip(element_focused
                || the_current_cell.td
                || event.target));
    }
}

Tip.prototype.key_released = function (event) {
    if (event.key == 'Escape') {    // Checked here so that the Escape key works on all pages.
        if (popup_is_open() && !this.current_target && !thetable)
            popup_close_esc();
        this.reset_tip();
        return;
    }
    if (this.current_target && this.current_target.tagName === 'INPUT' && !this.set_tip_content)
        this.update_current_tip();
    if (!this.shift_key_pressed)
        return;
    this.shift_key_pressed -= event.key == 'Shift';
    if (!event.shiftKey || this.shift_key_pressed < 0)
        this.shift_key_pressed = 0;
    if (!this.shift_key_pressed && !this.set_tip_content)
        this.reset_tip();
}

Tip.prototype.tip_top = function (tt) {
    while (tt) {
        if (tt.classList && tt.classList.contains('tipped'))
            return tt;
        if (tt.id == "table_forms_keypress" || tt.id === 't_student_picture')
            return tt;
        if (tt.id === 'current_input')
            return document.getElementById('current_input_div');
        tt = tt.parentNode;
    }
}

// Saves the content of the current input if it was in a tip before closing it.
Tip.prototype.blur_focus_in_tip = function () {
    for (let focus = element_focused; focus; focus = focus.parentNode) {
        if (focus === this.tip) {
            element_focused.blur();
            element_focused = undefined;
            return;
        }
    }
}

Tip.prototype.get_tip_select = function () {
    let tmp_select = this.tip.firstChild.id === 'tip_close' ? this.tip.childNodes[1] : this.tip.firstChild;
    return tmp_select.id === 'scroll_tip' ? tmp_select.firstChild : tmp_select;
}

Tip.prototype.show_tip = function (html, td, keep_visible) {
    if (!this.set_tip_content)
        this.tip.innerHTML = '<div id="scroll_tip">' + (html || this.tip.innerHTML) + '</div>';
    if (keep_visible && !this.set_tip_content)
        this.tip.prepend(this.close_btn);
    this.current_target = td;
    set_element_relative_position(
        this.tip_top(td)
        || (this.is_tip_sort_menu() ? td.parentNode.parentNode : td),
        this.tip);
    this.show_timestamp = millisec();
    this.tip.classList.replace("tip_fade_out", "tip_fade_in");
    this.tip.style.pointerEvents = (this.instant_tip_display && !this.is_tip_instant() ? 'none' : 'all');
    this.tip.style.visibility = 'visible';
    this.tip.style.opacity = 0.99;
    let content_div = document.getElementById('scroll_tip');
    if (content_div) {
        content_div.style.paddingBottom = (content_div.scrollWidth > content_div.offsetWidth ? '10px' : '2px');
        content_div.style.paddingRight = (is_element_visible(this.close_btn) ? '17px' : '3px');
    }
    if (this.active_debug_div)
        this.update_debug_div();
};

Tip.prototype.hide_tip = function (force) {
    let debug_tip = document.getElementById('display_display_tip');
    if (debug_tip)
        debug_tip.style.visibility = 'hidden';
    if (!this.open_btn_target)
        this.hide_open_btn();
    if (this.current_target && !this.shift_key_pressed && !this.is_tip_instant() && !this.instant_tip_display)
        return;
    if (!this.is_tip_visible())
        return;
    if (!force && !this.shift_key_pressed && this.tip.innerHTML.indexOf('overflow:') != -1)
        return; // To let the user scroll
    if (!force && !this.shift_key_pressed && this.is_tip_instant())
        return;
    if (!force && this.set_tip_content)
        return;
    if ((millisec() - this.show_timestamp) < 50 && this.shift_key_pressed)
        return;
    if (this.set_tip_content)
        login_list_hide();
    this.current_target = undefined;
    this.set_tip_content = undefined;
    this.highlighter.style.display = 'none';
    this.tip.className = "tip_fade_out";
    this.tip.style.opacity = 0;
    this.tip.style.visibility = 'hidden';
    if (this.active_debug_div)
        this.update_debug_div();
}

Tip.prototype.reset_tip = function () {
    this.current_target = undefined;
    this.open_btn_target = undefined;
    this.hide_tip(true);
};

Tip.prototype.update_current_tip = function () {
    if (this.current_target.do_not_update_tip)
        return;
    periodic_work_add(() => this.must_hide_tip_if_target_hidden());
    let tmp_current_target = this.current_target;
    let tmp_open_btn_target = this.open_btn_target;
    this.reset_tip();
    if (tmp_current_target)
        show_the_tip(tmp_current_target, true);
    if (tmp_open_btn_target && tmp_open_btn_target.id != 'current_input')
        show_the_tip(tmp_open_btn_target);
    if (this.active_debug_div)
        this.update_debug_div();
}

Tip.prototype.is_tip_visible = function () {
    return this.tip && this.tip.style.visibility === 'visible';
}

Tip.prototype.is_tip_sort_menu = function () {
    return this.current_target
        && (this.current_target.classList.contains('icon_hidden')
            || this.current_target.classList.contains('icon_visible'));
}

Tip.prototype.is_tip_hovered = function (event) {
    return event.target.id === 'tip'
        || event.target.id === 'tip_close'
        || this.tip.contains(event.target)
        || event.target === this.current_target
        || event.target.className == 'login_list'
        || event.target.parentNode.className == 'login_list';
}

Tip.prototype.is_tip_instant = function () {
    if (!this.current_target)
        return false;
    // The first child or one of the parents is an 'instanttip'
    for (var element = this.current_target.firstChild || this.current_target;
        element; element = element.parentNode)
        if (element.getAttribute && element.getAttribute('instanttip'))
            return true;
    return false;
};

// Checks whether the tip displayed is instantaneous and can be closed.
Tip.prototype.is_tip_instant_hovered_out = function (event) {
    if (!this.is_tip_visible() || !this.is_tip_instant())
        return false;
    let current_target_parent = this.current_target.parentNode;
    if ((millisec() - this.show_timestamp) < 100 && event.target !== this.current_target)
        return true; // To not be bothered by triangle menu column title
    if (this.is_tip_hovered(event))
        return false;
    return current_target_parent.parentNode
        && event.target !== current_target_parent.parentNode
        && !current_target_parent.parentNode.contains(event.target);
}

// Ensures that an open_btn is only displayed on the current table cell.
Tip.prototype.is_tip_in_table_and_not_valid = function (event) {
    return thetable != undefined
        && thetable.contains(event.target)
        && event.target.id != 'current_input_div'
        && event.target.id != 'current_input'
        && !tr_title.contains(event.target)
        && !tr_filter.contains(event.target)
        && !this.shift_key_pressed;
}

Tip.prototype.show_open_btn = function (td) {
    if (this.if_open_btn_just_clicked_do_not_show) {
        this.if_open_btn_just_clicked_do_not_show = false;
        return;
    }
    if (td.tagName === 'TD' && thetable && thetable.contains(td))
        td = document.getElementById('current_input');
    this.open_btn_target = td;
    if (this.current_target === this.open_btn_target)
        return;
    let tip_top = this.tip_top(this.open_btn_target) || this.open_btn_target;
    let pos = findPos(tip_top);
    let true_pos = this.find_open_btn_true_position(pos, tip_top);
    this.open_btn.style.left = true_pos[0] + 'px';
    this.open_btn.style.top = true_pos[1] + 'px';
    this.open_btn.style.visibility = 'visible';
    if (this.active_debug_div)
        this.update_debug_div();
}

Tip.prototype.hide_open_btn = function () {
    this.open_btn.style.visibility = 'hidden';
    if (this.active_debug_div)
        this.update_debug_div();
}

Tip.prototype.find_open_btn_true_position = function (pos, tip_top) {
    let x = pos[0] - this.open_btn.offsetWidth;
    let y = pos[1] + (tip_top.offsetHeight - this.open_btn.offsetHeight) / 2;
    if (x < -5) {
        x = -5;
        y -= 18;
    }
    if (y < -5)
        y += 36;

    this.hide_open_btn();
    let elt = document.elementFromPoint(x + this.open_btn.offsetWidth / 2, y + this.open_btn.offsetHeight / 2);
    if (!elt || elt.className === "tip_open" || tip_top.id === "current_input_div")
        return [x, y];
    if (elt.offsetWidth < this.open_btn.offsetWidth * 3) {
        if (y < 12)
            y += 17;
        else
            y -= 17;
        x += 6;
    }
    return [x, y];
}

Tip.prototype.must_display_or_update_tip = function (event) {
    if (event.target.className === 'tip_open')
        return;
    if (this.open_btn_target)
        this.open_btn_target = undefined;
    if (this.is_tip_instant() && this.is_tip_visible()) {
        if (this.is_tip_instant_hovered_out(event))
            this.hide_tip(true);    // Hides the instant tip when the cursor leaves it or its target.
        return;
    }
    if (this.is_tip_hovered(event) || this.is_tip_in_table_and_not_valid(event))
        return;
    show_the_tip(event.target);
}

Tip.prototype.must_hide_tip_if_target_hidden = function () {
    if (this.is_tip_visible() && !is_element_visible(this.current_target) && !this.is_tip_instant())
        this.reset_tip();
}

Tip.prototype.update_debug_div = function () {
    console.log(new Error().stack);
    function pos(e) {
        if (!e)
            return '';
        var box = findPos(e);
        var txt = e.tagName + ' (x=' + Math.floor(box[0]) + ' y=' + Math.floor(box[1])
            + ' w=' + Math.floor(e.offsetWidth) + ' h=' + Math.floor(e.offsetHeight) + ')';
        if (TIP.tip_top(e) !== e)
            txt += pos(TIP.tip_top(e));
        return txt;
    }

    this.debug_div.innerHTML = '<p> instant_tip_display: ' + this.instant_tip_display + '</p>'
        + '<p> current_target: ' + pos(this.current_target) + '</p>'
        + '<p> open_btn_target: ' + pos(this.open_btn_target) + '</p>'
        + '<p> is_current_target_visible: ' + is_element_visible(this.current_target) + '</p>'
        + '<p> is_tip_visible: ' + this.is_tip_visible() + '</p>'
        + '<p> is_tip_instant: ' + this.is_tip_instant() + '</p>';
}

function header_title_click(element) {
    last_user_interaction = millisec();
    if (element_focused && element_focused.onblur)
        element_focused.onblur({ target: element_focused });
    t = element.parentNode;
    the_current_cell.change();
    if (data_col_from_td(t) !== the_current_cell.data_col) {
        the_current_cell.jump(the_current_cell.lin, col_from_td(t), true);
    }
    if (column_change_allowed(the_current_cell.column)) {
        element_focused = element.tagName == 'INPUT' ? element : element.firstChild;
        element = element_focused; // Will not change
        element.initial_value = element.value;
        element.parentNode.parentNode.style.overflow = 'visible';
        var t_column_title = document.getElementById('t_column_title');
        function update_real_title() {
            t_column_title.value = element.value;
        }
        element.onkeydown = function (event) {
            if (event.key == 'Escape') {
                element.value = element.initial_value;
                stop_event(event);
            }
            setTimeout(update_real_title, 40);
        };
        element.onblur = function (event) {
            delete element.parentNode.parentNode.removeAttribute('style');
            element_focused = undefined;
            if (element.initial_value != element.value) {
                t_column_title.value = element.value;
                header_change_on_update(event, t_column_title, 'column_attr_title');
            }
            element.onkeydown = element.onblur = undefined;
        };
    }

}

function compute_table_rank(line_id, column) {
    var data_col = column.data_col;
    var the_value = a_float(lines[line_id][data_col].value);

    if (isNaN(the_value))
        return '&nbsp;';

    var v, rank = 1, nr = 0;
    for (var lin in lines) {
        v = lines[lin][data_col].value;
        if (v !== '') {
            nr++;
            if (v > the_value)
                rank++;
        }
    }
    return rank + '/' + nr;
}

function line_resume(line_id) {
    var s = [], tree_computed = {};

    // Search deeper formulas
    var depth_column = [];
    for (var column of columns)
        if (!column.is_empty)
            depth_column.push([9999 - display_tree_depth(column) + column.title, column]);
    depth_column.sort();

    for (var depth_and_column of depth_column) {
        var column = depth_and_column[1];
        if (tree_computed[column.data_col] === undefined)
            s.push(display_tree(column, line_id, tree_computed, true));
    }
    return s.join('');
}

function display_tree_depth(column) {
    // Should be a Column method. Returns the formul depth.
    if (!column
        || column.average_from.length == 0
        || !column_modifiable_attr("columns", column)
    )
        return 0;
    var depth = 0;
    for (var title of column.average_from)
        depth = Math.max(display_tree_depth(columns[data_col_from_col_title(title)]), depth);
    return depth + 1;
}

function display_tree(column, line_id, tree_computed, hide_weight) {
    var new_col = tree_computed[column.data_col] === undefined;
    var col_title_class = find_col_class(column, true);
    tree_computed[column.data_col] = true;
    var cell = lines[line_id][column.data_col];
    var rank = column_modifiable_attr("minmax", column) ? compute_table_rank(line_id, column) : '&nbsp;';
    var s = '<li' + ' style="white-space: nowrap; cursor: pointer;' + (new_col ? '"' : ' opacity: 0.6;"')
        + ' class="' + (col_title_class === '' ? 'just_ro' : col_title_class)
        + '" onclick="tree_goto_cell(\'' + column.title + '\');">'
        + (hide_weight ? '' : column.weight + ' * ')
        + column.title + ' <i>(' + column.type + ')</i> '
        + '<strong>' + cell.value_fixed().replace(/\n/g, '<br>') + '</strong>'
        + (rank != '&nbsp;' ? ' (' + rank + ') ' : '')
        + (cell.comment ? cell.comment_html() : '')
        + '</li>';
    if (column.average_from.length == 0 || !column_modifiable_attr("columns", column) || !new_col)
        return s;
    hide_weight = column.type != 'Moy';
    s += '<ul style="margin: 0;">';
    for (var title of column.average_from) {
        var data_col = data_col_from_col_title(title);
        if(data_col !== undefined)
            s += display_tree(columns[data_col], line_id, tree_computed, hide_weight);
        else
            s += '<li style="background:#F00">«' + title + '» ' + _("ALERT_columndelete_void") + '</li>';
    }
    if (column.incomplete)
        s += '<li>' + _("MSG_suivi_and_hiddens") + '</li>';
    s += '</ul>';
    return s;
}

function find_col_class(column, split) {
    var className = [];
    if (column.author != my_identity || !table_attr.modifiable)
        className.push('ro');
    if (column.is_visible()) {
        if (column.modifiable == 2)
            className.push('modifiable_by_student');
        else if (column.visibility == 3 || column.visibility == 4)
            className.push('public_display');
    } else
        className.push('hidden_to_student');
    if (column.private.length != 0)
        className.push('private_column');
    if (column.highlight)
        className.push('big_border_left');
    if (!split)
        return className.join(' ');
    return className.find((colClass) => colClass === 'hidden_to_student'
        || colClass === 'modifiable_by_student'
        || colClass === 'public_display') || '';
}

function tree_goto_cell(col_title) {
    var cls_all = column_list(0, columns.length);
    for (var col in cls_all)
        if (cls_all[col].title === col_title)
            page_horizontal(0, col);
}

var the_current_line;

function td_from_table(td) {
    try {
        if (td === the_current_cell.input || td === the_current_cell.input_div)
            td = the_current_cell.td;
    }
    catch (err) {
        return; // Not in a table
    }
    for (var table = td; table; table = table.parentNode) {
        if (table.id === 'thetable')
            return td;
        if (table.tagName == 'TD' || table.tagName == 'TH')
            td = table;
    }
    if (table_forms_element)
        for (var table = td; table.parentNode; table = table.parentNode) {
            if (table.tagName == 'TR')
                return table;
        }
}

function show_the_tip_table_cell_real(data_col, line_id) {
    var line = lines[line_id];
    var column = columns[data_col];
    var type = column.real_type;
    if (line === undefined)
        return;
    var cell = line[data_col];
    var s;
    if (cell.modifiable(line, column) && type.tip_cell !== '')
        s = '<span class="title">' + ___(type.tip_cell) + '</span><br>';
    else
        s = '';
    if (cell.value) {
        if (column.type == "Competences")
            s += competences_recap(cell.value.split(/ +/), competenceTable.catalog, false, true);
        else if (column.type == "COMPETENCES_RESULT")
            s += comp_result_format_table(cell.value, competenceTable.catalog, line, column, false, true);
        else if (column.type == "COMPETENCES_GRADE")
            s += comp_grade_format_table(cell.value, competenceTable.catalog, line, column, false, true);
        else
            s += '<b>' + html(cell.value).replace(/\n/g, "<br>") + '</b><br>';
    }
    if (cell.get_author() !== '')
        s += _("MSG_suivi_student_RSS_value_modified") + ' «' + cell.get_author() + '» ';
    if (cell.date)
        s += _("DisplayCellMTimeBefore") + ' «' + date(cell.date) + '»';
    s += '<br>' + _('Line') + ' ' + (1 + myindex(filtered_lines, line));

    var s_abjs = student_abjs(line[0].value);
    if (s_abjs !== "")
        s += s_abjs;
    return s;
}

function show_the_tip_table_cell(td) {
    td = td_from_table(td);
    if (!td)
        return;
    var data_col = data_col_from_td(td);
    var line_id = line_id_from_td(td);
    if (line_id === undefined)
        // Tips for the big table columns header: 'title' and 'filter'
        return _(columns[data_col].real_type[
            'tip_' + td.parentNode.className.split(' ')[0]]);
    // Tips for table cells
    return show_the_tip_table_cell_real(data_col, line_id);
}

function show_the_tip_table_form(td) {
    if (!table_forms_element)
        return;
    while (td && td.data_col === undefined)
        td = td.parentNode;
    if (td)
        return show_the_tip_table_cell_real(td.data_col, the_current_cell.line_id);
}

function show_the_tip_scrollbar(td) {
    if (!td.parentNode)
        return;
    if (td.parentNode.id === 'horizontal_scrollbar')
        return _('TIP_horizontal_scrollbar');
    if ((td.parentNode.id || td.parentNode.parentNode.id) === 'vertical_scrollbar')
        return _('TIP_vertical_scrollbar');
}

filter_ids = [
    'linefilter', 'columns_filter', 'fullfilter',
    't_column_cell_writable', 't_column_test_filter', 't_column_test_if',
    't_column_visibility_date',
    't_column_redtext', 't_column_greentext',
    't_column_red', 't_column_green'];

function show_the_tip_filter(td) {
    if (!td.parentNode || !td.parentNode.parentNode)
        return;
    let tdClass = td.parentNode.parentNode.className;
    if (tdClass != undefined && tdClass.match(/\bfilter\b/)) {
        // In the INPUT
    }
    else if (td.parentNode.className.match(/\bfilter\b/))
        td = td.firstChild;
    else if (td.tagName != 'INPUT')
        return '';
    else if (td.id.substr(0, 13) == 'alert_filter_') {
        // Alert filter
    }
    else if (myindex(filter_ids, td.id) == -1)
        return '';
    else if (td.id == 'visibility_date' && user_date_to_date(value) != '9999')
        return ''; // Not a filter but a date
    else if (td.id.match(/_red|_green/) && !isNaN(td.value) && td.value == '')
        return ''; // Not a filter but a value

    var filter;
    if (td.id.substr(0, 2) == 't_')
        filter = compile_filter_generic(td.value, the_current_cell.column, true);
    else
        filter = compile_filter_generic(td.value);
    var value = filter.the_filter.editor();
    var errors = filter.get_filter_errors();
    if (errors)
        value += '<p class="attribute_error">' + errors + '</p>';
    return value;
}

function show_the_tip_average(td) {
    if (td.id != 't_column_stats' || !current_histogram)
        return;
    return current_histogram.nr + _("MSG_columnstats_values") + '<br>'
        + current_histogram.html_resume();
}

function show_the_tip_histogram(td) {
    td = td.parentNode;
    if (!td || td.id != 't_column_histogram')
        return;
    var t = '';
    if (current_histogram.nr_nan())
        t += _("MSG_columnstats_empty") + ':' + current_histogram.nr_nan() + ' ';
    if (current_histogram.nr_ppn())
        t += _("MSG_columnstats_ppn") + ':' + current_histogram.nr_ppn() + ' ';
    if (current_histogram.nr_abi())
        t += _("MSG_columnstats_abi") + ':' + current_histogram.nr_abi() + ' ';
    if (current_histogram.nr_abj())
        t += _("MSG_columnstats_abj") + ':' + current_histogram.nr_abj() + ' ';
    if (current_histogram.nr_pre())
        t += _("MSG_columnstats_pre") + ':' + current_histogram.nr_pre() + ' ';
    if (current_histogram.nr_yes())
        t += _("MSG_columnstats_yes") + ':' + current_histogram.nr_yes() + ' ';
    if (current_histogram.nr_no())
        t += _("MSG_columnstats_no") + ':' + current_histogram.nr_no() + ' ';
    if (current_histogram.nr)
        t += _("MSG_columnstats_grade") + ':' + current_histogram.nr + ' ';
    return t;
}

function show_the_tip_generic(td) {
    var t = TIP.tip_top(td);
    if (t && t.childNodes.length && t.childNodes[0].innerHTML && t.tagName != 'TR')
        return '<div>' + t.childNodes[0].innerHTML + '</div>';
    return '';
}

function show_the_tip_input(td) {
    // td.selectedText
    // (td.firstChild ? td.firstChild.value : 'BUG')
    if (table_forms_element)
        return '';
    if (window.url_suivi)
        return ''; // No tip on INPUT on suivi
    var value;
    if (td.options) {
        if (td.options[td.selectedIndex])
            value = td.options[td.selectedIndex].textContent;
        else
            return '';
    }
    else
        value = td.value;
    if (value)
        return '<hr><div style="font-weight:bold">' + html(value) + '</div>';
    return '';
}

function show_the_tip_debug(td) {
    if (!preferences.debug_table)
        return '';
    if (!filtered_lines)
        return '';
    if (td.id === 'current_input')
        td = the_current_cell.td;
    var lin_id;
    var data_col;
    if (td.parentNode) {
        lin_id = line_id_from_td(td);
        data_col = data_col_from_td(td);
    }
    var s = td.tagName + '#' + td.id + ' focused='
        + (element_focused ? element_focused.tagName + '#' + element_focused.id : '')
        + (lin_id !== undefined && data_col !== undefined
            ? '<br>'
            + 'line_id=' + lin_id
            + ' col_id[' + data_col + ']='
            + columns[data_col].the_id
            : '') + '<br>';

    for (var i in filters)
        s += filters[i][0] + '<br>';

    return s;
}

function show_the_tip_headers(td) {
    if (td.id === '' || td.id === undefined)
        return;
    var what;
    if (td.id.indexOf('t_column') == 0)
        what = 'column';
    else if (td.id.indexOf('t_table') == 0)
        what = 'table';
    else
        return;
    var attr = td.id.replace(/t_column_|t_table_attr_/, '');

    var tip_base = 'TIP_' + what + '_attr_' + attr;
    tip_content = _(tip_base);
    tip_exists = tip_base != tip_content;
    if (!tip_exists && what == 'column' && the_current_cell.column.type) {
        tip_id = tip_base + '__' + the_current_cell.column.type;
        tip_content = _(tip_id);
        tip_exists = tip_id != tip_content;
        if (!tip_exists) {
            tip_id = tip_base + '__';
            tip_content = _(tip_id);
            tip_exists = tip_id != tip_content;
        }
    }

    if (td.id == 't_column_type')
        tip_content += '<hr>' + _('H_' + the_current_cell.column.type);

    if (tip_exists || td.tagName != 'A')
        return tip_content;

    if (!td.classList.contains('linkstroked'))
        tip_id = tip_base + '__1';
    else
        tip_id = tip_base + '__0';
    tip_content = _(tip_id);
    if (tip_id != tip_content)
        return tip_content;
}

function column_menu_focus(THIS, data_col) {
    element_focused = THIS;
    element_focused.data_col = data_col;
    element_focused.initial_value = element_focused.value;
    TIP.set_tip_content = function () { return ''; };
}

function column_menu_blur(show_feedback) {
    TIP.set_tip_content = undefined;
    if (element_focused.value == element_focused.initial_value)
        return;
    var column = columns[element_focused.data_col]
    var attr = element_focused.getAttribute('attr');
    switch (attr) {
        case 'course_dates':
            column_attr_set(column, attr,
                element_focused.value, show_feedback ? element_focused.parentNode : undefined);
            var formated = course_dates_formatter(column, undefined);
            var header_input = document.getElementById('t_column_course_dates');
            header_input.value = element_focused.initial_value = element_focused.value = formated;
            header_input.className = formated === '' ? 'empty' : '';
            break;
        case 'visibility':
        case 'modifiable':
            column_attr_set(column, attr, element_focused.value);
            element_focused.initial_value = element_focused.value;
            the_current_cell.update_table_headers();
            the_current_cell.do_update_column_headers = true;
            table_header_fill();
    }
}

function column_menu_keydown(event) {
    event = the_event(event);
    if (event.keyCode == 13) {
        column_menu_blur(true);
        stop_event(event);
    }
}

function show_the_tip_column_menu(td) {
    if (td.getAttribute('instanttip') != "1" && td.className != "icon_hidden" && td.className != "icon_visible")
        return;
    td = td_from_table(td);
    if (!td)
        return;
    if (myindex(td.parentNode.className, 'column_title') == -1)
        return;
    var what = ['LABEL_sort_value', 'LABEL_sort_date', 'LABEL_sort_author',
        'LABEL_sort_comment', 'LABEL_sort_shuffle'];
    var data_col = data_col_from_td(td);
    var column = columns[data_col];
    if (column.is_computed()) {
        what.push('LABEL_sort_%ABJ');
        what.push('LABEL_sort_stddev');
    }
    var s = [];
    for (var i in what) {
        i = what[i];
        var v = '<li><a style="color:#00F;cursor:pointer;" onmousedown="sort_column_by('
            + data_col + ",'" + i + '\')">' + _(i) + '</a>';
        if (column.sort_by == i)
            v = '<b>' + v + '</b>';
        s.push(v);
    }
    var more = '';
    var formated = course_dates_formatter(column, undefined);
    if (column_change_allowed(column)) {
        more += '<div style="margin-bottom:1em">' + _('TIP_column_attr_course_dates')
            + '<input style="width:27em;"onfocus="column_menu_focus(this,' + data_col
            + ')" value="' + encode_value(formated) + '"'
            + ' onblur="column_menu_blur()" attr="course_dates"'
            + ' onkeydown="column_menu_keydown(event)"></div>'
            + _('TIP_column_attr_visibility')
            + '<SELECT style="width:27em; margin-bottom:1em;" attr="visibility"'
            + ' onfocus="column_menu_focus(this,' + data_col
            + ')" onblur="column_menu_blur()">'
            + document.getElementById('t_column_visibility').innerHTML
                .replace(/disabled=""/g, '')
                .replace(RegExp('value="' + column.visibility + '"'), '$0 selected')
            + '</SELECT><br>'
            // copy/paste
            + _('TIP_column_attr_modifiable')
            + '<SELECT style="width:27em;" attr="modifiable"'
            + ' onfocus="column_menu_focus(this,' + data_col
            + ')" onblur="column_menu_blur()">'
            + document.getElementById('t_column_modifiable').innerHTML
                .replace(/disabled=""/g, '')
                .replace(RegExp('value="' + column.modifiable + '"'), '$0 selected')
            + '</SELECT>'
            ;
    }
    else
        more += html(formated + ' ') + '<br>';

    var sort_icons = ' <span style="color:#00F;cursor:pointer;font-size:1rem;margin-left:1rem;"'
        + 'onclick="sort_icon_clicked(undefined, 1)">▲ ' + _('LABEL_sort_ascend') + '</span>'
        + '<span style="color:#00F;cursor:pointer;font-size:1rem;margin-left:1rem;"'
        + 'onclick="sort_icon_clicked(undefined, -1)">▼ ' + _('LABEL_sort_descend') + '</span>';

    return '<div style="margin-bottom:1em;"> ' + _('LABEL_sort_order')
        + sort_icons + '</div>'
        + _('LABEL_sort_by')
        + '<ul style="padding-left:1.5em;margin-top:0">'
        + s.join('') + '</ul>'
        + more + '</div>';
}

function debug_label(label, txt) {
    if (preferences.debug_table && txt && txt !== '')
        txt = '<div class="debug_label" style="background:#000;color:#FFF;font-size:60%">' + label + '</div>' + txt;
    return txt;
}

function show_the_tip(td, keep_visible) {
    if (!td)
        return;
    if (td.do_not_update_tip)
        return;
    if (td.id === 'current_input_div')
        td = document.getElementById('current_input');
    else if (tr_title && tr_title.contains(td) && td.tagName === 'INPUT')
        td = td.parentNode.parentNode;  // Avoids display bug when animating column title.)

    var td_in_table = td_from_table(td);
    if (popup_is_open()) {
        var popup = document.getElementById('popup_id');
        for (var element = td; element !== popup; element = element.parentNode)
            if (!element)
                return; // No tip on element outside of popup
    }
    if (td_in_table && td_in_table.parentNode !== the_current_line) {
        remove_highlight();
        the_current_line = td_in_table.parentNode;
        td_in_table.parentNode.classList.add('highlight_current');
    }
    if (td.tagName == 'B')
        td = td.parentNode;
    if (td === TIP.current_target)
        return;
    if (TIP.set_tip_content && !body_on_mouse_up_doing)
        s = TIP.set_tip_content();
    else
        s = debug_label('generic', show_the_tip_generic(td))
            + (
                debug_label('average', show_the_tip_average(td))
                || debug_label('histogram', show_the_tip_histogram(td))
                || debug_label('headers', show_the_tip_headers(td))
                || debug_label('column_menu', show_the_tip_column_menu(td))
                || debug_label('table_cell', show_the_tip_table_cell(td))
                || debug_label('table_form', show_the_tip_table_form(td))
                || debug_label('scrollbar', show_the_tip_scrollbar(td))
                || '')
            + debug_label('filter', show_the_tip_filter(td))
            + debug_label('input', show_the_tip_input(td))
            + (TIP.current_target && TIP.is_tip_instant()
                ? ''
                : debug_label('debug', show_the_tip_debug(td)));
    if (s === '')
        return;
    else if (td.tagName != 'IMG') {
        let regexForStripHTML = /(<([^>]+)>)/ig;
        let txt = s.replaceAll(regexForStripHTML, '');
        if (txt === '' || txt.length === 1 || txt === td.value
            || (td.tagName === 'SELECT' && td.selectedIndex !== -1
                && txt === td.options[td.selectedIndex].text))
            return;
    }
    if (td.offsetWidth > window_width() / 2 && td.offsetHeight > 100) // too big !!
        return;
    if (!keep_visible && (td.className == "icon_hidden" || td.className == "icon_visible"))
        return;
    if (!(td.getAttribute('instanttip')
        || keep_visible
        || TIP.shift_key_pressed
        || TIP.instant_tip_display)
    ) {
        TIP.show_open_btn(td);
        return;
    }
    if (body_on_mouse_up_doing
        && body_on_mouse_up_doing != 'vertical_scrollbar_drag'
        && body_on_mouse_up_doing != 'login_list')
        return;
    TIP.blur_focus_in_tip();
    if (TIP.is_tip_visible())
        return;
    if (!TIP.set_tip_content)
        // Replacement to load big images only on display 'suivi_student.js'
        var html = s.replace(' newsrc="', ' src="');
    TIP.show_tip(html, td, keep_visible);
}

function update_icon_filter(event, input, filter) {
    if (input.checked)
        update_icon_filter.filter.value += ' ~' + filter;
    else
        update_icon_filter.filter.value = update_icon_filter.filter.value
            .replace(RegExp('~' + filter + '\\b'), '')
            .trim()
            .replace(/ +/, ' ');
    header_change_on_update(event, update_icon_filter.filter, '');
}

function show_the_tip_inscrit(event) {
    data_col = data_col_from_td(event.target.parentNode);
    if (data_col != tr_classname)
        return;
    update_icon_filter.filter = event.target;
    var filters = [], checked;
    for (var [regex, icon, filter] of INSCRITS)
        if (icon !== '') {
            if (event.target.value.match(regex))
                checked = ' checked';
            else
                checked = '';
            filters.push(icon + '<label><input type="checkbox"' + checked
                + ' onchange="update_icon_filter(event,this,\'' + filter + '\')">'
                + _(icon) + '</label>');
        }
    TIP.show_tip(filters.join('<br>'), event.target, true);
    event.target.do_not_update_tip = true;
}

function on_mouse_down(event) {
    last_user_interaction = millisec();
    var td = the_td(event);
    column_from_td(td).real_type.onmousedown(event);
    if (TIP.current_target) {
        TIP.current_target.do_not_update_tip = false;
        TIP.reset_tip();
    }
    return false;
}

function wheel(event) {
    var e = the_event(event);
    wheel.dx += event.shiftKey ? e.wheelDeltaY : e.wheelDeltaX;
    wheel.dy += event.shiftKey ? 0 : e.wheelDeltaY;
    if (millisec() - wheel.time < 100)
        return;
    if (Math.abs(wheel.dx) <= Math.abs(wheel.dy)) {
        var deltaX = 0;
        var deltaY = Math.round(wheel.dy / 5);
    } else {
        var deltaX = Math.round(wheel.dx / 100);
        var deltaY = 0;
    }
    wheel.dx = wheel.dy = 0;
    wheel.time = millisec();

    if (deltaX) {
        var old_column_offset = column_offset;
        var old_col = the_current_cell.col;
        page_horizontal(-deltaX);
        return;
    }
    if (the_body.offsetHeight > window_height())
        return;
    if (popup_is_open())
        return;
    if (table_forms_element)
        return;
    if (element_focused && element_focused.tagName == 'TEXTAREA')
        return;
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey)
        return;
    var where = e.target;
    while (where.tagName != 'BODY') {
        if (where.scrollHeight > where.offsetHeight)
            return; // Use normal scroll
        where = where.parentNode;
    }
    var old_line_offset = line_offset;
    var old_lin = the_current_cell.lin;
    if (deltaY < 0) {
        next_page(undefined, zebra_step);
        if (old_line_offset != line_offset)
            the_current_cell.lin = Math.max(nr_headers + preferences.one_line_more,
                old_lin - zebra_step);
    }
    else {
        previous_page(undefined, zebra_step);
        if (old_line_offset != line_offset)
            the_current_cell.lin = Math.min(nr_headers + table_attr.nr_lines
                - 1 - preferences.one_line_more,
                old_lin + zebra_step);
    }
    stop_event(event);
}
wheel.dx = wheel.dy = wheel.time = 0;

// Helper functions

function column_parse_attr(attr, value, column, xcolumn_attr) {
    // xcolumn_attr :
    //    undefined : initialisation in a new column with default values
    //    false     : user interaction
    //    0         : initialisation of the attributes in an existing column 
    //    true      : value received from another user
    return column_attributes[attr].check_and_set(value, column, xcolumn_attr);
}

function column_modifiable_attr(attr, column) {
    if (!column_attributes[attr])
        return false;

    if (column_attributes[attr].visible_for.length)
        return myindex(column_attributes[attr].visible_for, column.type) >= 0;
    else
        return true;
}

/******************************************************************************
Table initialization. Only done once
******************************************************************************/

// 'set' each of the column attributes
function init_column(column) {
    column.real_type = type_title_to_type(column.type);

    for (var attr in column_attributes)
        column_parse_attr(attr,
            column_attributes[attr].formatter(column, column[attr]),
            column,
            // XXX: 0, 1, false and true are all their meanings
            column_modifiable_attr(attr, column) ? 0 : true
        );
}

var use_touch = true;

function table_move(event) {
    if (!thetable)
        return;
    event = the_event(event);
    if (body_on_mouse_up_doing == "column_drag") {
        if (event.target.tagName != 'TH' && event.target.tagName != 'TD')
            return;
        var datacol = data_col_from_td(event.target);
        if (thetable.column_drag == datacol)
            return;
        var cols = column_list(0, columns.length);
        for (var i in cols)
            if (cols[i].data_col == datacol)
                break;
        var drag_position = columns[thetable.column_drag].position;
        var position = columns[datacol].position;
        var previous_position = cols[Number(i) - 1]
            ? cols[Number(i) - 1].position
            : position - 1;
        var next_position = cols[Number(i) + 1].position;
        var new_pos = drag_position > position
            ? (previous_position + position) / 2
            : (position + next_position) / 2;
        //console.log(thetable.column_drag + '(' + drag_position + ') → '
        //    + datacol + '(' + previous_position + ' ' + position + ' ' + next_position + ') ' + new_pos);
        if (new_pos != drag_position) {
            columns[thetable.column_drag].position = new_pos;
            table_fill_real();
            table_header_fill();
            var cols = column_list();
            for (var col in cols)
                if (cols[col].data_col == thetable.column_drag)
                    break;
            the_current_cell.jump(the_current_cell.lin, col, true);
        }
        return;
    }

    var d = (thetable.start_drag_y - event.y)
        / the_current_cell.input.offsetHeight;
    line_offset = thetable.start_line_offset + Math.floor(d);
    if (line_offset < 0)
        line_offset = 0;

    d = (thetable.start_drag_x - event.x) / the_current_cell.input.offsetWidth;
    column_offset = thetable.start_column_offset + Math.floor(d);
    if (column_offset + table_attr.nr_columns
        > columns.length - nr_new_columns)
        column_offset = columns.length - table_attr.nr_columns - nr_new_columns;
    if (column_offset < 0)
        column_offset = 0;
    change_option('column_offset', column_offset ? column_offset : '');


    if (thetable.last_column_offset != column_offset
        || thetable.last_line_offset != line_offset)
        table_fill(undefined, thetable.last_column_offset != column_offset,
            false, true);

    thetable.last_column_offset = column_offset;
    thetable.last_line_offset = line_offset;
}

function start_table_drag(event) {
    the_current_cell.change();
    event = the_event(event);
    if (event.target.tagName == "TH") {
        thetable.column_drag = data_col_from_td(event.target);
        body_on_mouse_up_doing = "column_drag";
        thetable.column_initial_pos = columns[thetable.column_drag].position;
    }
    else if (event.target.tagName == "TD") {
        thetable.start_line_offset = line_offset;
        thetable.start_column_offset = column_offset;
        thetable.start_drag_y = event.y;
        thetable.start_drag_x = event.x;
        body_on_mouse_up_doing = "table_drag";
    }
    else
        return;

    set_body_onmouseup(); // ??? Why not working in HTML TAG
    window.onmousemove = table_move;
    stop_event(event);
}

function do_touchstart() {
    if (!do_touchstart.touch_device)
        window.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, true);

    do_touchstart.touch_device = true;
    if (!thetable)
        return;

    the_current_cell.change();
    var e = the_event(event);
    document.activeElement.setAttribute('inputmode', 'text');
    if (e.one_finger) {
        thetable.start_line_offset = line_offset;
        thetable.start_column_offset = column_offset;
        thetable.start_drag_y = e.y;
        thetable.start_drag_x = e.x;
        do_touchstart.cell_long_touch = setTimeout(() => {
            if (e.target.id !== 'current_input_div' && e.target.id !== 'current_input')
                cell_goto(the_td(e));
            the_current_cell.toggle();
            do_touchstart.cell_long_touch = undefined;
            stop_event(e);
        }, 300);
    } else
        thetable.start_line_offset = undefined;
}

function do_touchmove() {
    if (do_touchstart.cell_long_touch !== undefined)
        clearTimeout(do_touchstart.cell_long_touch);
    e = the_event(event);
    if (e.one_finger) {
        if (thetable.start_line_offset !== undefined) {
            do_touchmove.cell_dragged = true;
            table_move(e);
            event.preventDefault();
        }
    } else
        thetable.start_line_offset = undefined; // No more panning
}

function do_touchend() {
    e = the_event(event);
    if (do_touchstart.cell_long_touch !== undefined)
        clearTimeout(do_touchstart.cell_long_touch);
    if (do_touchmove.cell_dragged === false && e.target.id !== 'current_input_div' && e.target.id !== 'current_input')
        cell_goto(the_td(e));
    else if (do_touchmove.cell_dragged) // To prevent virtual keyboard to constantly open on table drag.
        document.activeElement.setAttribute('inputmode', 'none');
    do_touchmove.cell_dragged = false;
}



// table innerHTML is not supported by anyone

var colgroup;

function table_init() {
    if (table_init.running) // FireFox multithreaded JS
        return;
    table_init.running = true;

    // Create the table
    // The first child is HOVER
    while (divtable.childNodes[1])
        divtable.removeChild(divtable.childNodes[1]);
    thetable = document.createElement('table');
    thetable.className = "colored";
    if (preferences.unmodifiable == 1)
        thetable.classList.add("leaves");
    thetable.id = 'thetable';
    thetable.style.tableLayout = "fixed";

    if (vertical_scrollbar) {
        var m, sb_width = vertical_scrollbar_width + 3;
        var table_width = (divtable.offsetWidth - sb_width).toFixed(0);
        var pos = findPos(divtable);
        vertical_scrollbar.style.top = pos[1] + vertical_scrollbar_width + 'px';
        if (scrollbar_right)
            m = "0px " + sb_width + "px 0em 1px";
        else
            m = "0px 0px 0px " + sb_width + 'px';
        thetable.style.margin = m;
        thetable.style.width = table_width + 'px';
        // Use timeout because of a firefox3 bug...
        setTimeout(function () { thetable.style.width = table_width + 'px'; }, 100);
    }

    divtable.appendChild(thetable);

    _d('table created\n');

    colgroup = document.createElement('COLGROUP');
    thetable.appendChild(colgroup);
    for (var i = 0; i < table_attr.nr_columns; i++)
        colgroup.appendChild(document.createElement('COL'));


    // Create the table
    table = document.createElement('tbody');
    table.id = 'table';
    thetable.appendChild(table);
    thetable.onmousedown = start_table_drag;
    if (use_touch)
        try {
            table.addEventListener("touchstart", do_touchstart, false);
            table.addEventListener("touchmove", do_touchmove, false);
            table.addEventListener("touchend", do_touchend, false);
        } catch (e) { };

    // Header lines

    tr_title = document.createElement('tr');
    tr_title.className = 'column_title';
    var th = document.createElement('th');
    th.innerHTML = '<div><input><div></div></div>';
    var clickTimer;
    for (var i = 0; i < table_attr.nr_columns; i++) {
        var th2 = th.cloneNode(true);
        tr_title.appendChild(th2);
        th2.type = tr_title.className;
        th2.tip_align = "right_if_small";
        th2.addEventListener('click', (e) => {
            if (preferences.sort_simple_click === 0)
                col_title_clicked(e);
            else if (!clickTimer)
                clickTimer = setTimeout(() => {
                    sort_icon_clicked(e);
                    clickTimer = undefined;
                }, 300);
        });
        th2.addEventListener('dblclick', (e) => {
            if (preferences.sort_simple_click === 0)
                sort_icon_clicked();
            else {
                clearTimeout(clickTimer);
                clickTimer = undefined;
                col_title_clicked(e);
            }
        });
    }
    table.appendChild(tr_title);

    th.innerHTML = '<INPUT TYPE="TEXT" placeholder="' + _("filtre.png")
        + '" onfocus="header_focus(this,event)" onblur="element_focused=undefined" oninput="filter_keyup(event, true)">';
    tr_filter = document.createElement('tr');
    tr_filter.className = 'filter';
    for (var i = 0; i < table_attr.nr_columns; i++) {
        var th2 = th.cloneNode(true);
        th2.onclick = empty_header;
        th2.onpaste = header_paste;
        tr_filter.appendChild(th2);
        th2.type = tr_filter.className;
        th2.onmouseup = show_the_tip_inscrit;
    }
    table.appendChild(tr_filter);

    // Content lines
    var td = document.createElement('td');
    td.innerHTML = '&nbsp;';
    var tr = document.createElement('tr');
    for (var i = 0; i < table_attr.nr_columns; i++)
        tr.appendChild(td.cloneNode(true));

    for (var i = 0; i < table_attr.nr_lines; i++) {
        var t = tr.cloneNode(true);
        if (i % zebra_step === 0)
            t.zebra = 'separator ';
        else
            t.zebra = '';
        table.appendChild(t);
    }

    _d('headers inited\n');

    for (var lin = 0; lin < table_attr.nr_lines + nr_headers; lin++) {
        tr = table.childNodes[lin];

        for (var col = 0; col < table_attr.nr_columns; col++) {
            td = tr.childNodes[col];
            if (lin >= nr_headers)
                td.onmousedown = on_mouse_down;
        }
    }
    table_init.running = false;
}

function col_title_clicked(e) {
    let title_input = e.target.getElementsByTagName('INPUT')[0];
    if (!title_input)
        return;
    document.activeElement.blur();
    title_input.focus();
    header_title_click(title_input.parentNode)
    let sort_icon = e.target.getElementsByClassName('icon_hidden')[0] || e.target.getElementsByClassName('icon_visible')[0];
    if (sort_icon) {
        TIP.reset_tip();
        show_the_tip(sort_icon, true);
    }
}

// Two optional parameters:
// * e is a click event needed for the one-click sort to change column before sorting,
// * order: -1, 1 or undefined to apply choosen sort when clicked through sort menu
function sort_icon_clicked(e, order) {
    if (e && preferences.sort_simple_click === 1) {
        let title_input = e.target.getElementsByTagName('INPUT')[0];
        if (!title_input)
            return;
        header_title_click(title_input.parentNode)
    }
    document.activeElement.blur();
    if (order)
        the_current_cell.column.dir = order;
    else
        the_current_cell.column.dir = sort_columns.includes(the_current_cell.column) ? -the_current_cell.column.dir : 1;
    sort_column();
    TIP.reset_tip();
    GUI.add('column_sort', '', the_current_cell.column.title);
}

/******************************************************************************
Update one line of the table
******************************************************************************/

function update_line(line_id, data_col) {
    var line = lines[line_id];
    if (line_empty(line))
        return;

    var column = columns[data_col];
    column.need_update = true;
    update_columns(line);

    if (table === undefined)
        return;

    var lin = lin_from_line_id(line_id);
    if (lin === undefined)
        return;

    var tr = table.childNodes[lin + nr_headers];

    for (var data_col2 in columns) {
        column = columns[data_col2];
        if (column.col === undefined)
            continue;
        if (column.real_type.cell_compute === undefined
            && column.red.indexOf('[') == -1
            && column.green.indexOf('[') == -1
            && column.redtext.indexOf('[') == -1
            && column.greentext.indexOf('[') == -1
            && column.visibility_date.indexOf('[') == -1
            && column.cell_writable.indexOf('[') == -1
        )
            continue;
        update_cell(tr.childNodes[column.col], line[data_col2], column,
            the_student_abjs[line[0].value], line);
    }
}

function update_cell_at(line_id, data_col) {
    if (table === undefined)
        return;
    var lin = lin_from_line_id(line_id);
    if (lin === undefined)
        return;
    var col = columns[data_col].col;
    if (col === undefined)
        return;
    var tr = table.childNodes[lin + nr_headers];
    update_cell(tr.childNodes[col], lines[line_id][data_col],
        columns[data_col], the_student_abjs[lines[line_id][0].value], lines[line_id]);
}

/******************************************************************************
Update the header of the table
******************************************************************************/

function set_columns_filter(h) {
    var cf = document.getElementById('columns_filter');
    if (h === '')
        cf.className = 'empty';
    else
        cf.className = '';
    if (cf.value != h)
        cf.value = h;
    columns_filter = compile_filter_generic(h);
    try {
        columns_filter(undefined, C());
    }
    catch (e) {
        columns_filter = compile_filter_generic('=');
        columns_filter.errors = "BUG";
    }
    if (columns_filter.errors)
        cf.className = 'attribute_error';
}


function columns_filter_change(v) {
    if (columns_filter.filter == v.value)
        return;

    set_columns_filter(v.value);

    column_offset = 0;
    table_fill(true, true, true);

    change_option('columns_filter', encode_uri_option(columns_filter.filter));
    change_option('column_offset');
}

function column_list_full_filter_hide(column, data_col) {
    if (column.column_list_full_filter !== undefined)
        return column.column_list_full_filter;

    column.column_list_full_filter = false;
    if (full_filter && !column.is_empty) {
        for (var lin in filtered_lines) {
            if (full_filter(filtered_lines[lin], filtered_lines[lin][data_col], my_identity))
                return false;
        }
        column.column_list_full_filter = true;
        return true;
    }
}

function column_list(col_offset, number_of_cols) {
    if (col_offset === undefined)
        col_offset = column_offset;
    if (number_of_cols === undefined)
        number_of_cols = table_attr.nr_columns;

    var freezed = [];
    var cl = [];
    for (var data_col in columns) {
        var column = columns[data_col];

        if ((column.freezed == 'F' || column.filter_freeze)
            && column.hidden != 1) {
            freezed.push(column);
            continue;
        }
        if (column.hidden == 1)
            continue;
        if (column.private.length && column.author != my_identity
            && myindex(column.private, my_identity) == -1
            && zebra_step // Not the suivi page
        )
            continue;
        var v = C(column.title, column.author, '20080101', column.comment);
        if (!columns_filter(undefined, v, my_identity) && !column.is_empty)
            continue;
        if (column_list_full_filter_hide(column, data_col))
            continue;
        cl.push(column);
    }

    freezed.sort(function (a, b) { return a.position - b.position; });
    cl.sort(function (a, b) { return a.position - b.position; });

    if (number_of_cols > freezed.length)
        return freezed.concat(cl.slice(col_offset,
            col_offset + number_of_cols - freezed.length));
    return freezed;
}

/* This function is used by CSV and print
   because there is no scroll and no empty columns
*/

function column_list_all() {
    var cl = column_list(0, columns.length);
    var cl2 = [];
    for (var c in cl) {
        var data_col = cl[c].data_col;
        if (column_empty(data_col))
            continue;
        cl2.push(data_col);
    }
    return cl2;
}

function next_column_from_data_col(data_col) {
    var cl = column_list_all();
    for (var c in cl) {
        if (cl[c] == data_col) {
            return cl[Number(c) + 1];
        }
    }
}


function nr_freezed() {
    var i;
    i = 0;
    for (var data_col in columns)
        if (columns[data_col].freezed == 'F')
            i++;
    return i;
}

function update_horizontal_scrollbar_cursor() {
    var sorted = sort_columns[0].data_col;
    //  var sorted = sort_columns[0].data_col ;
    for (var cc in horizontal_scrollbar.childNodes) {
        var c = horizontal_scrollbar.childNodes[cc];
        if (c && c.className) {
            var classe = c.className.replace(/ (cursor|sorted|filtered|fixed)/g, '');
            if (c.data_col == the_current_cell.data_col)
                classe += ' cursor';
            if (sorted == c.data_col)
                classe += ' sorted';
            if (columns[c.data_col].filter !== '')
                classe += ' filtered';
            if (columns[c.data_col].freezed === 'F')
                classe += ' fixed';
            classe += ' ' + find_col_class(columns[c.data_col], true);
            c.className = classe;
        }
    }
}

// IE bug for BODY, must use document for this event
function set_body_onmouseup() {
    GUI.add(body_on_mouse_up_doing, '', 'start');

    if (window.onmouseupold === undefined)
        window.onmouseupold = window.onmouseup;
    window.onmouseup = body_on_mouse_up;

    /* // Does not work for Chrome to detect the cursor moving outside window
    window.onmouseout = function(event) {
      if ( event.target.tagName == 'TABLE' )
        {
      window.onmouseout = function() {} ;
              body_on_mouse_up(event) ;
        }
    } ;
    */
}

function move_horizontal_scrollbar_begin(event) {
    if (element_focused && element_focused.onblur)
        element_focused.onblur(event);
    the_current_cell.focus(); // Take focus to do the necessary 'blurs'
    var col = the_event(event).target.col;
    page_horizontal(0, col);
    body_on_mouse_up_doing = "horizontal_scrollbar_drag";
    set_body_onmouseup(); // ??? Why not working in HTML TAG
    window.onmousemove = function (event) {
        var x = the_event(event).x;
        var b;
        for (var a in horizontal_scrollbar.childNodes) {
            a = horizontal_scrollbar.childNodes[a];
            if (a.style && x < a.xcoord) {
                if (b)
                    page_horizontal(0, b.col);
                else
                    page_horizontal(0, a.col);
                break;
            }
            b = a;
        }
    };
    stop_event(the_event(event));
}

function move_horizontal_scrollbar_move(event) {
    if (body_on_mouse_up_doing == "horizontal_scrollbar_drag")
        page_horizontal(0, the_event(event).target.col);
}


function update_horizontal_scrollbar(cls) {
    if (horizontal_scrollbar === undefined)
        return;

    if (cls === undefined)
        cls = column_list();

    var width = 0;
    var cls_all = column_list(0, columns.length);
    for (var col in cls_all) {
        if (cls_all[col].is_empty)
            continue;
        width += cls_all[col].width;
    }
    var pos = 0;
    var dx;
    var hwidth;
    if (vertical_scrollbar) {
        if (scrollbar_right)
            dx = horizontal_scrollbar_height;
        else
            dx = vertical_scrollbar_width + 2;
        hwidth = window_width() - dx - horizontal_scrollbar_height - 2;
    }
    else {
        dx = horizontal_scrollbar_height;
        hwidth = window_width() - 2 * horizontal_scrollbar_height;
    }
    var left = horizontal_scrollbar.parentNode.childNodes[0];
    var right = horizontal_scrollbar.parentNode.childNodes[2];

    left.style.height = horizontal_scrollbar_height + 'px';
    right.style.height = horizontal_scrollbar_height + 'px';

    left.style.width = horizontal_scrollbar_height + 'px';
    right.style.width = horizontal_scrollbar_height + 'px';

    left.style.left = dx - horizontal_scrollbar_height + 'px';
    right.style.left = dx + hwidth + 'px';

    while (horizontal_scrollbar.firstChild)
        horizontal_scrollbar.removeChild(horizontal_scrollbar.firstChild);

    for (var col in cls_all) {
        if (cls_all[col].is_empty)
            continue;
        var a = document.createElement('a');
        a.className = 'column_invisible';
        for (var c in cls)
            if (cls[c] == cls_all[col]) {
                a.className = 'column_visible';
                break;
            }
        a.xcoord = (dx + ((hwidth * pos) / width)).toFixed(0);
        a.style.left = a.xcoord + 'px';
        a.style.width = (hwidth * cls_all[col].width / width).toFixed(0) + 'px';
        a.style.height = horizontal_scrollbar_height + 'px';
        a.innerHTML = cls_all[col].title;
        a.data_col = cls_all[col].data_col;
        a.col = col;
        a.href = "javascript:page_horizontal(0," + col + ");";

        a.onmousedown = move_horizontal_scrollbar_begin;
        a.onmouseover = () => horizontal_scrollbar_hovered(false);
        a.onmouseout = () => horizontal_scrollbar_hovered(true)

        horizontal_scrollbar.appendChild(a);
        pos += cls_all[col].width;
    }
    update_horizontal_scrollbar_cursor();
}

function horizontal_scrollbar_hovered(out) {
    if (!event.target.classList.contains('column_visible'))
        return;
    let horizontal_scrollbar_elt = document.getElementById('horizontal_scrollbar').getElementsByTagName('A');
    for (let a of horizontal_scrollbar_elt) {
        if (a.classList.contains('fixed'))
            continue;
        if (!out && a.classList && a.classList.contains('column_visible'))
            a.classList.add('hovered');
        else if (out && a.classList && a.classList.contains('hovered'))
            a.classList.remove('hovered');
    }
}



function sb_height() {
    return divtable.offsetHeight - 2 * vertical_scrollbar_width;
}

function sb_line_to_pixel(line) {
    var height = filtered_lines.length;
    if (height === 0)
        return vertical_scrollbar_width;
    else
        return (sb_height() * line) / height + vertical_scrollbar_width;
}

function sb_pixel_to_line(pixel, dont_cut) {
    var line;

    line = (filtered_lines.length * (pixel - vertical_scrollbar_width)) / sb_height();
    line = Number(line.toFixed(0));
    if (dont_cut === undefined)
        if (line >= filtered_lines.length - table_attr.nr_lines)
            line = filtered_lines.length - table_attr.nr_lines + 1;
    if (line < 0)
        line = 0;
    return line;
}

function update_vertical_scrollbar_cursor_real() {
    var line = myindex(filtered_lines, the_current_cell.line);
    if (line == -1) {
        vertical_scrollbar.childNodes[3].style.height = 0;
    }
    else {
        var p1 = sb_line_to_pixel(line);
        var p2 = sb_line_to_pixel(line + 1);

        vertical_scrollbar.childNodes[3].style.top = p1.toFixed(0) + 'px';
        height = p2 - p1;
        if (height <= 2)
            height = 2;
        vertical_scrollbar.childNodes[3].style.height = height.toFixed(0) + 'px';
        //debug(vertical_scrollbar.childNodes[3].style,undefined,undefined,true);
    }
}

function update_vertical_scrollbar_cursor() {
    periodic_work_add(update_vertical_scrollbar_cursor_real);
}


function update_vertical_scrollbar_position_real() {
    if (!vertical_scrollbar)
        return;
    var p = vertical_scrollbar.childNodes[0];
    var height = filtered_lines.length;
    if (height === 0) {
        p.style.top = sb_line_to_pixel(0) + 'px';
        p.style.height = sb_height() + 'px';
    }
    else {
        p.style.top = sb_line_to_pixel(line_offset) + 'px';
        p.style.height = sb_line_to_pixel(line_offset + table_attr.nr_lines)
            - sb_line_to_pixel(line_offset) + 'px';
    }
    update_vertical_scrollbar_cursor_real();
}

function update_vertical_scrollbar_position() {
    periodic_work_add(update_vertical_scrollbar_position_real);
    periodic_work_add(update_vertical_scrollbar_cursor_real);
}

var body_on_mouse_up_doing;

// Return true if the event should not be taken into account
function body_on_mouse_up(event) {
    if (body_on_mouse_up_doing) {
        GUI.add(body_on_mouse_up_doing, '', 'stop');
        var was_doing = body_on_mouse_up_doing;
        window.onmouseup = window.onmouseupold;
        window.onmousemove = function () { };

        body_on_mouse_up_doing = undefined;
        if (was_doing == 'table_drag') {
            if (thetable.start_line_offset == line_offset)
                return false; // jump of the cursor
        }
        else if (was_doing == 'column_drag') {
            var column = columns[thetable.column_drag];
            if (thetable.column_initial_pos != column.position)
                column_attr_set(column, 'position', column.position);
        }
        stop_event(the_event(event));
        return true;
    }
}


function move_vertical_scrollbar_begin(event) {
    the_current_cell.change();
    body_on_mouse_up_doing = "vertical_scrollbar_drag";
    set_body_onmouseup(); // ??? Why not working in HTML TAG
    window.onmousemove = move_scrollbar;
    move_scrollbar(event);
    stop_event(the_event(event));
}

function move_scrollbar(event) {
    event = the_event(event);
    var y;
    y = event.y - vertical_scrollbar.offsetTop;
    if (y < vertical_scrollbar_width)
        return;
    if (y > divtable.offsetHeight - vertical_scrollbar_width)
        return;
    var old_line_offset = line_offset;
    line_offset = sb_pixel_to_line(y, true) - Math.floor(table_attr.nr_lines / 2);
    if (line_offset < 0)
        line_offset = 0;
    the_current_cell.lin += old_line_offset - line_offset;
    the_current_cell.lin = Math.max(nr_headers,
        Math.min(nr_headers + table_attr.nr_lines,
            the_current_cell.lin));
    table_fill();
    stop_event(event);
}

function update_vertical_scrollbar_real() {
    if (!vertical_scrollbar)
        return;

    vertical_scrollbar.onmousedown = move_vertical_scrollbar_begin;
    vertical_scrollbar.style.height = divtable.offsetHeight + 'px';
    vertical_scrollbar.style.width = vertical_scrollbar_width + 'px';
    if (scrollbar_right)
        vertical_scrollbar.style.right = 0;
    else
        vertical_scrollbar.style.left = 0;

    vertical_scrollbar.style.top = divtable.offsetTop + 'px';

    if (sort_columns.length === 0)
        return;

    var last = '';
    var data_col = sort_columns[0].data_col;
    var v, vv, v_upper;
    var y, last_y = -100;
    s = '<span class="position">&nbsp;</span><p onclick="javascript:previous_page();">▲</p><p onclick="javascript:next_page();">▼</p><span class="cursor"></span>';


    if (preferences.v_scrollbar_nr
        && columns[data_col].sort_by == 'LABEL_sort_value')
        for (var i in filtered_lines) {
            v = filtered_lines[i][data_col].value.toString().substr(0, preferences.v_scrollbar_nr);
            v_upper = v.toUpperCase();
            if (v_upper != last) {
                y = sb_line_to_pixel(i);
                if (y - last_y < 10)
                    continue;
                if (last.substr(0, 1) != v_upper.substr(0, 1))
                    vv = '<b class="letter">' + v.substr(0, 1) + '</b>' + v.substr(1);
                else
                    vv = '<b class="hide">' + v.substr(0, 1) + '</b>' + v.substr(1);
                last = v_upper;
                // Was (y-6) ???
                s += '<span style="top:' + (y).toFixed(0) + 'px">' + vv + '</span>';
                last_y = y;
            }
        }

    vertical_scrollbar.innerHTML = s + '';
    vertical_scrollbar.childNodes[1].style.width = vertical_scrollbar_width + "px";
    vertical_scrollbar.childNodes[2].style.width = vertical_scrollbar_width + "px";
    vertical_scrollbar.childNodes[1].style.height = vertical_scrollbar_width + "px";
    vertical_scrollbar.childNodes[2].style.height = vertical_scrollbar_width + "px";
    vertical_scrollbar.childNodes[2].style.top = divtable.offsetHeight - vertical_scrollbar_width + 'px';

    vertical_scrollbar.childNodes[3].style.width = vertical_scrollbar_width + 'px';
    update_vertical_scrollbar_position_real();
}

function update_vertical_scrollbar() {
    periodic_work_add(update_vertical_scrollbar_real);
    periodic_work_remove(update_vertical_scrollbar_cursor_real);
    periodic_work_remove(update_vertical_scrollbar_position_real);
}

function table_header_fill() {
    periodic_work_add(table_header_fill_real);
}

function update_nr_columns() {
    if (table_attr.autowidth === 0) {
        return;
    }
    var cls = column_list(undefined, 9999);
    var cs = charsize();
    var width = 0;
    for (var col = 0; col < cls.length; col++) {
        width += 1 + cs * Math.max(2, cls[col].compute_char_width());
        if (width > window_width() || (col > 1 && cls[col - 2].is_empty)) {
            if (table_attr.nr_columns != col) {
                table_attr.nr_columns = col;
                table_init();
                table_fill(false, true, false, true);
                update_horizontal_scrollbar();
                setTimeout("the_current_cell.update()", 100);
            }
            return true;
        }
    }
}

function table_header_fill_real() {
    add_empty_columns();
    var cls = column_list();
    var w;
    the_current_cell.update_column_headers();
    update_horizontal_scrollbar(cls);

    for (var data_col in columns)
        columns[data_col].col = undefined;

    var cs = charsize();
    if (table_attr.autowidth !== 0) {
        table.className = 'autowidth';
        for (var col = 0; col < table_attr.nr_columns; col++) {
            colgroup.childNodes[col].width = 1 + cs * Math.max(2, cls[col].compute_char_width());
        }
    }
    else {
        // This loop is not with the other in order to speed up display.
        // So the table is not displayed with all the possible columns width.
        var width = 0;
        for (var col = 0; col < table_attr.nr_columns; col++) {
            width += cls[col].width + 1;
        }

        for (var col = 0; col < table_attr.nr_columns; col++) {
            w = ((window_width() * cls[col].width) / width - 8).toFixed(0);
            if (w <= cs)
                w = cs;
            colgroup.childNodes[col].width = w;
        }
    }

    for (var col = 0; col < table_attr.nr_columns; col++)
        colgroup.childNodes[col].className = 'col_id_' + cls[col].the_id;

    for (var col = 0; col < table_attr.nr_columns; col++) {
        var column = cls[col];
        var className = find_col_class(column);

        var td_title = tr_title.childNodes[col];
        var td_filter = tr_filter.childNodes[col];

        column.col = col;
        var title = td_title.childNodes[0];

        // td_title.data_col = td_filter.data_col = column.data_col ;

        title.firstChild.value = column.title;
        title.firstChild.disabled = column_change_allowed(column) ? '' : '1';

        td_filter.childNodes[0].value = column.filter;
        if (column.filter === '')
            td_filter.childNodes[0].className = 'empty';
        else
            td_filter.childNodes[0].className = '';
        if (column.filter_error)
            td_filter.childNodes[0].classList.add('attribute_error');
        if (column.freezed === 'F')
            td_filter.childNodes[0].classList.add('freezed');

        td_title.className = className;
        td_filter.className = '';
        if (column.highlight)
            td_filter.classList.add('big_border_left');
        else
            td_filter.classList.remove('big_border_left');

        if (is_previous_col_empty(col)) {
            td_title.classList.add('transparent');
            td_filter.classList.add('transparent');
        }

        var icon = title.lastChild;
        icon.style.pointerEvents = "none";
        icon.innerHTML = "▲";
        icon.className = "icon_hidden";
        for (var i = 0; i < 2; i++) {
            if (column != sort_columns[i])
                continue;
            var triangle;
            if (i == 0) {
                td_title.classList.add('sorted');
                triangle = ["▼", "", "▲"];
            }
            else
                triangle = ["▽", "", "△"];
            icon.innerHTML = '&nbsp;' + triangle[column.dir + 1];
            icon.className = "icon_visible";
            break;
        }
    }

    // XXX If updated, the value being edited may be erased
    if (the_current_cell.focused)
        the_current_cell.update_input_position();
    else
        the_current_cell.update(true);
}

/******************************************************************************
Filter and sort the lines of data
******************************************************************************/
function get_filtered_lines() {
    var f = [], empty, ok;

    if (filters.length === 0) {
        for (var line in lines) {
            empty = line_empty(lines[line]);
            if (table_attr.hide_empty && empty)
                continue;
            if (empty !== true)
                f.push(lines[line]);  // Not empty on screen AND history
        }
        return f;
    }

    for (var line in lines) {
        line = lines[line];
        var ok = true;
        for (var filter in filters) {
            filter = filters[filter];
            if (!filter[0](line, line[filter[1]], my_identity)) {
                ok = false;
                break;
            }
        }
        if (!ok)
            continue;
        f.push(line);
    }
    return f;
}

/*
 * Search in all the table
 */


function full_filter_change(value) {
    if ((full_filter ? full_filter.filter : "") == value.value)
        return;

    for (var data_col in columns)
        columns[data_col].column_list_full_filter = undefined;

    if (value.value === '') {
        // value.className = 'empty' ;
        full_filter = undefined;
    }
    else {
        value.className = '';
        full_filter = compile_filter_generic(value.value);
        if (full_filter.errors)
            value.className = "attribute_error";
    }
    column_offset = 0;
    line_offset = 0;
    table_fill_hook = function () {
        the_current_cell.jump(nr_headers,
            the_current_cell.col,
            true);
    };
    table_fill(true, true, true);

    change_option('full_filter', encode_uri_option(value.value))
    change_option('column_offset');
}


function change_option(option, value) {
    if (column_get_option_running)
        return;
    if (!window.history.replaceState)
        return;
    // Remove ticket
    var loc = window.location.toString().split("?")[0];
    // Remove old option value
    loc = loc.replace(RegExp('/=' + option + '=[^/]*'), '');
    // Remove trailing /
    loc = loc.replace(RegExp('/+$'), '');
    if (value)
        loc += '/=' + option + '=' + value;
    // Replace state because Undo this way has yet to be done
    if (table_attr.bookmark)
        // Changing history 100 times in 30 seconds raise an exception
        try { window.history.replaceState('_a_', '_t_', loc); } catch (e) { };
}

var line_filter_change_value;

function line_filter_change_real() {
    var value = line_filter_change_value;
    if (!value)
        return;
    line_filter_change_value = undefined;
    var old_value = line_filter ? line_filter.filter : "";

    if (old_value == value.value)
        return;

    if (value.value === '') {
        // value.className = 'empty' ;
        line_filter = undefined;
    }
    else {
        value.className = '';
        line_filter = compile_filter_generic(value.value);
        if (line_filter.errors)
            value.className = "attribute_error";
    }

    line_offset = 0;
    the_current_cell.jump(nr_headers, the_current_cell.col, true);
    table_fill(true, true, true);
    update_histogram(true);

    change_option('line_filter', encode_uri_option(value.value));
}

function line_filter_change(value) {
    line_filter_change_value = value;
    periodic_work_add(line_filter_change_real);
}

function sort_lines23(a, b) {
    var c, cc, va, vb;
    if (a.empty && !b.empty)
        return 1;
    if (b.empty && !a.empty)
        return -1;
    for (var c in sort_columns) {
        c = sort_columns[c];
        cc = c.data_col;
        va = a[cc]._key;
        vb = b[cc]._key;
        if (va > vb)
            return c.dir;
        if (va < vb)
            return -c.dir;
    }
    return 0;
}

function sort_lines3() {
    var v, cell;
    for (var i in filtered_lines) {
        filtered_lines[i].empty = line_empty(filtered_lines[i]);
        for (var c in sort_columns) {
            c = sort_columns[c];
            cell = filtered_lines[i][c.data_col];

            switch (c.sort_by) {
                case undefined:
                case 'LABEL_sort_value':
                    cell._key = undefined;
                    v = cell.key(c.empty_is);
                    break;
                case 'LABEL_sort_author':
                    v = cell.author.replace(".", "<br>");
                    break;
                case 'LABEL_sort_date':
                    v = cell.date.substr(0, 4) + ' '
                        + cell.date.substr(4, 2) + ' '
                        + cell.date.substr(6, 2) + '<br>'
                        + cell.date.substr(8, 2) + ':'
                        + cell.date.substr(10, 2) + ':'
                        + cell.date.substr(12);
                    break;
                case 'LABEL_sort_comment':
                    v = html(cell.comment).replace('\n', '<br>');
                    break;
                case 'LABEL_sort_%ABJ':
                    var o = { test_filter_filter: function (_line, x) { return is_abjppn[x.value]; } };
                    v = compute_weighted_percent_(c.data_col, filtered_lines[i], o);
                    v = '  ' + (100 * v).toFixed(1);
                    v = v.substr(v.length - 6);
                    break;
                case 'LABEL_sort_stddev':
                    var s = new Stats();
                    function add_grade(line, x) {
                        if (isNaN(x.value) || x.value === '')
                            return;
                        var col = columns[myindex(line, x)];
                        s.add((x.value - col.min) / (col.max - col.min));
                    };
                    var o = { test_filter_filter: add_grade };
                    compute_weighted_percent_(c.data_col, filtered_lines[i], o);
                    v = s.standard_deviation();
                    if (isNaN(v))
                        v = 0;
                    v = '            ' + (c.min + (c.max - c.min) * v).toFixed(2);
                    v = v.substr(v.length - 7);
                    break;
                case 'LABEL_sort_shuffle':
                    if (cell.value == '')
                        v = c.dir > 0 ? 1 : 0;
                    else
                        v = Math.random();
                    break;
            }
            cell._key = v;
        }
    }

    filtered_lines.sort(sort_lines23);
}

/******************************************************************************
Update the content of the table
******************************************************************************/

// Key value: return value of 'line_empty()'
var count_empty = { false: 1, 1: 0, true: 0 };
var count_fully_empty = { false: 1, 1: 1, true: 0 };

function update_nr_empty(empty_before, empty_after, filtered) {
    var ne = count_empty[empty_after] - count_empty[empty_before];
    var nfe = count_fully_empty[empty_after] - count_fully_empty[empty_before];
    nr_not_empty_lines += ne;
    nr_not_fully_empty_lines += nfe;

    if (filtered) {
        nr_filtered_not_empty_lines += ne;
        nr_filtered_not_fully_empty_lines += nfe;
    }
    if (ne || nfe)
        periodic_work_add(update_line_counts);
}

function update_line_counts() {
    if (nr_filtered_lines
        && Number(nr_filtered_lines.innerHTML) != nr_filtered_not_empty_lines) {
        var empty = nr_filtered_not_fully_empty_lines
            - nr_filtered_not_empty_lines;
        nr_filtered_lines.innerHTML = nr_filtered_not_empty_lines
            + (empty ? " (+" + empty + '∅)' : "");
        highlight_add(nr_filtered_lines);
    }
    if (document.getElementById('nr_not_empty_lines'))
        document.getElementById('nr_not_empty_lines').innerHTML
            = nr_not_empty_lines;
}

function update_filtered_lines() {
    var d1 = millisec();
    filtered_lines = get_filtered_lines();

    if (full_filter !== undefined) {
        var cls = column_list_all();
        var f = [];
        for (var line in filtered_lines) {
            line = filtered_lines[line];
            for (var column in cls)
                if (full_filter(line, line[cls[column]], my_identity)) {
                    f.push(line);
                    break;
                }
        }
        filtered_lines = f;
    }

    if (line_filter !== undefined) {
        var cls = column_list_all();
        var f = [];
        for (var line in filtered_lines) {
            line = filtered_lines[line];
            for (var column in cls)
                if (line_filter(line, line[cls[column]], my_identity)) {
                    f.push(line);
                    break;
                }
        }
        filtered_lines = f;
    }

    for (var line in lines)
        lines[line].is_filtered = false;

    nr_filtered_not_empty_lines = 0;
    nr_filtered_not_fully_empty_lines = 0;
    for (var line in filtered_lines) {
        filtered_lines[line].is_filtered = true;
        switch (line_empty(filtered_lines[line])) {
            case false: nr_filtered_not_empty_lines++;       // Fall thru
            case 1: nr_filtered_not_fully_empty_lines++;
        }
    }

    update_line_menu();

    var d2 = millisec();
    if (sort_columns.length !== 0) {
        sort_lines3();
    }
    var d3 = millisec();
    _d('Filter time: ' + (d2 - d1) + 'ms, Sort time: ' + (d3 - d2) + 'ms');

    update_line_counts();
    update_vertical_scrollbar();
}

function line_fill(line, write, cls, empty_column) {
    if (cls === undefined)
        cls = column_list();
    if (empty_column === undefined)
        empty_column = add_empty_columns();

    var the_line = filtered_lines[line];

    var tr = table.childNodes[write];
    var abj = the_student_abjs[the_line[0].value];
    if (tr_classname !== undefined) {
        tr.className = tr.zebra + the_line[tr_classname].value;
    }
    else
        tr.className = tr.zebra;
    var data_col, td;
    tr = tr.childNodes;
    for (var col = 0; col < table_attr.nr_columns; col++) {
        data_col = cls[col].data_col;
        td = tr[col];

        if (data_col >= empty_column) {
            td.className = 'empty';
            td.innerHTML = ' ';
            if (is_previous_col_empty(col))
                td.classList.add('transparent');
        }
        else
            update_cell(td, the_line[data_col], cls[col], abj, the_line);
    }
}

function is_previous_col_empty(col) {
    if (col !== 0 && table.childNodes[2].childNodes[col - 1].classList.contains('empty'))
        return true;
    return false;
}

var table_fill_force_update_filtered_lines;

function table_fill_do() {
    if (table_fill_force_update_filtered_lines)
        update_filtered_lines();

    table_fill_real();

    if (table_fill_hook) {
        table_fill_hook();
        table_fill_hook = undefined;
    }
    // Do not update while the cell is being edited
    if (!the_current_cell.focused || table_fill_force_current_cell_update) {
        the_current_cell.update(table_fill_do_not_focus);
        // Timeout because the cell must be repositionned after
        // The table column resize in case of horizontal scroll with
        // variable size columns.
        setTimeout("the_current_cell.update(" + table_fill_do_not_focus + ");",
            periodic_work_period + 1); // XXX *2 in place of +1 ???
    }
}

function manage_window_resize_event() {
    if (do_touchstart.touch_device)
        return true;
    var width = window_width(), height = window_height();

    if (current_window_width != width) {
        if (table_attr.default_nr_columns == 0
            && get_option('nr_cols', '0') == '0') {
            compute_nr_cols();
        }
        update_column_menu();
        update_histogram(true);
    }
    if (current_window_height != height) {
        compute_nr_lines.do_compute_nr_lines = true;
        compute_nr_lines();
        update_line_menu();
    }
    if (current_window_width != width || current_window_height != height) {
        the_current_cell.input.blur();
        table_init();
        table_fill(false, true, true, true);
        current_window_width = width;
        current_window_height = height;
    }
    if (!preferences.compact && width < 800) {
        preferences.compact = 1;
        set_body_theme(semester);
        preferences.compact = 0;
    }
    else
        set_body_theme(semester);
    return true;
}

var display_tips_saved;

var last_login_sent = 0;
function send_login_to_server() {
    if (millisec() - last_login_sent < 500)
        return true; // Wait a moment after last key stroke
    login_list(replaceDiacritics(ask_login_list),
        [['', '', _('loading_logins_before') + ask_login_list
            + _('loading_logins_after')]]);
    var s = document.createElement('script');
    s.src = add_ticket('login_list/'
        + encode_uri(replaceDiacritics(ask_login_list)));
    the_body.appendChild(s);
    return; // Stop sending
}

function login_list_ask(input) {
    last_login_sent = millisec();
    if (input.initial_value != input.value
        && input.value.length > 1
        && input.value != ask_login_list
        && input.value.toString().search('[.]$') == -1
    ) {
        ask_login_list = input.value;
        periodic_work_add(send_login_to_server);
    }
    return true;
}

function login_list_hide() {
    if (is_element_visible(TIP.close_btn) || TIP.is_tip_instant())
        return;
    TIP.set_tip_content = undefined;
    body_on_mouse_up_doing = undefined;
    TIP.reset_tip();
}

function login_list_select(event) {
    event = the_event(event);
    var t = event.target;
    if (t.tagName == 'OPTION')
        t = t.parentNode;
    var s = t.options[t.selectedIndex].value;
    if (s !== '') {
        t.my_target.value = s;
        t.my_target.scrollLeft = 9999;
        setTimeout(function () {
            t.my_target.focus_from_select = true;
            t.my_target.focus();
            set_selection(t.my_target, s.length, s.length);
            t.my_target.focus_from_select = false;
        }, 100);
    }
    ask_login_list = s;
    login_list_hide();
}

function login_list(name, x, current_value) {
    // x contains:
    //   [ ["id (value)", "firstname", "surname", "grp", "real_value"], ...]
    if (name != replaceDiacritics(ask_login_list))
        return;

    if (x.length == 0)
        x = [['', '', _("ALERT_unknown_user")]];

    var nr = Math.floor(table_attr.nr_lines / 2);
    if (x.length < nr)
        nr = x.length;
    if (nr < 2)
        nr = 2;
    var s = '<select tabindex="-1" class="login_list" size="' + nr + '" style="width:100%">';

    var w = 0;
    for (var i in x)
        if (x[i][0].length > w)
            w = x[i][0].length;

    if (current_value === undefined)
        current_value = x[0][0];

    var autoselect;
    for (var ii in x)
        if (x[ii][0].substr(0, current_value.length) == current_value) {
            autoselect = ii;
            break;
        }
    if (autoselect === undefined)
        for (var ii in x)
            if (x[ii][0].toLowerCase() == current_value.toLowerCase()) {
                autoselect = ii;
                break;
            }
    if (autoselect === undefined)
        autoselect = 0;

    x.sort(function (a, b) {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        if (a[2] < b[2]) return -1;
        if (a[2] > b[2]) return 1;
        return 0
    });

    for (var ii in x) {
        var i = x[ii];
        var cn = '';
        if (i[3]) {
            cn = i[3].replace(/OU=/g, '');
            cn = cn.split(',');
            cn = cn.slice(1, cn.length - 2);
            cn = '<i><small>' + cn.toString() + '</small></i>';
        }
        s += '<option value="' + encode_value(i[4] ? i[4] : i[0]) + '"'
            + (ii == autoselect ? ' selected' : '') + '>'
            + left_justify(i[0], w).replace('&nbsp;', ' ')
            + '&nbsp;' + i[1] + ' ' + i[2] + ' ' + cn + '</option>';
    }
    s += '</select>';
    TIP.reset_tip();
    body_on_mouse_up_doing = undefined;
    TIP.set_tip_content = function () {
        TIP.tip.innerHTML = s;
        let select = TIP.get_tip_select();
        select.onchange = login_list_select;
        select.onclick = login_list_select;
        select.my_target = element_focused || the_current_cell.input;
        select.my_target_value = select.my_target.value;
        body_on_mouse_up_doing = 'login_list'; // do not hide tip
        if (element_focused && !element_focused.blur_patched) {
            element_focused.blur_patched = true;
            element_focused.setAttribute('onblur',
                'if(element_focused!==this){return;}if(body_on_mouse_up_doing == "login_list") {if ( event.relatedTarget === TIP.get_tip_select() ) {return ;};login_list_hide();};' + element_focused.getAttribute('onblur'));
        }
        return s;
    };
    show_the_tip(element_focused || document.getElementById('current_input'), true);
}

function table_fill(do_not_focus, display_headers, compute_filtered_lines,
    force_current_cell_update) {
    if (table === undefined)
        return;
    if (table_forms_element)
        display_headers = false;
    table_fill_do_not_focus = do_not_focus;
    table_fill_force_current_cell_update = force_current_cell_update;
    table_fill_force_update_filtered_lines = compute_filtered_lines;
    periodic_work_add(table_fill_do);
    if (display_headers)
        table_header_fill();
}

function table_fill_real() {
    var write = nr_headers;
    var td;
    var empty_column = add_empty_columns();
    var cls = column_list();
    if (cls.length < table_attr.nr_columns)
        report_fake_error('table_fill_real cls=' + cls.length + ' < nr=' + table_attr.nr_columns
            + ', offset=' + column_offset + ' columns=' + columns.length
            + ', notEmpty=' + first_column_not_empty());
    var d1 = millisec();
    for (var line = line_offset; line < filtered_lines.length; line++) {
        line_fill(line, write, cls, empty_column);
        write++;
        if (write == table_attr.nr_lines + nr_headers)
            break;
    }
    // lines of tables after the end of the data, the empty lines
    while (write < table_attr.nr_lines + nr_headers) {
        var tr = table.childNodes[write];
        tr.className = tr.zebra;
        for (var col = 0; col < table_attr.nr_columns; col++) {
            td = tr.childNodes[col];
            td.innerHTML = " "; // Unsecable space
            td.className = 'rw empty';
        }
        write++;
    }
    update_vertical_scrollbar_position();
    _d(', table_fill_real: ' + (millisec() - d1) + 'ms');
    if (the_current_cell.focused)
        the_current_cell.update(); // 2010-10-06
}

/******************************************************************************
Table utilities
******************************************************************************/

// true : empty and no history, 1 : empty and an history
function line_empty(line) {
    for (var i in columns)
        if (line[i].is_not_empty())
            return false;
    for (var i in columns)
        if (line[i].history.length)
            return 1;
    return true;
}

function column_empty(column) {
    return !!columns[column].is_empty;
}

function column_empty_of_cells(column) {
    for (var i in lines) {
        if (lines[i][column].is_not_empty())
            return false;
    }
    return true;
}

function column_empty_of_user_cells(column) {
    var c;
    for (var i in lines) {
        c = lines[i][column];
        if (c.is_not_empty() && c.author !== "*" && c.author !== '?' && c.author !== "")
            return false;
    }
    return true;
}

function first_column_not_empty() { // Right to left
    for (var i = columns.length - 1; i >= 0; i--)
        if (!column_empty(i))
            break;
    return i;
}

function add_empty_column(keep_data) {
    var data_col = columns.length;

    if (!keep_data)
        for (var line in lines)
            lines[line][data_col] = C();

    var position = 0;
    for (var i in columns)
        if (columns[i].position > position)
            position = columns[i].position;

    var d = -1
    if (tr_classname !== undefined)
        while (columns[d + 1] && columns[d + 1].author == '*')
            d++;

    while (data_col_from_col_id(page_id + '_' + nr_new_columns) !== undefined)
        nr_new_columns++; // Problem raised by history removal

    var column = Col({
        the_id: page_id + '_' + nr_new_columns,
        the_local_id: nr_new_columns.toString(),
        data_col: columns.length,
        is_empty: keep_data === undefined,
        filter: ""
    });

    column.real_type = type_title_to_type(column_attributes['type'].default_value);
    var value;
    for (var attr in column_attributes) {
        switch (attr) {
            case 'title': value = default_title + (columns.length - d); break;
            case 'position': value = position + 1; break;
            case 'author': value = my_identity; break;
            default: value = column_attributes[attr].default_value; break;
        }
        column[attr] = column_parse_attr(attr, value, column);
    }
    columns[columns.length] = column;
    nr_new_columns++;
}

/*****************************************************************************/

function Column(attrs) {
    for (var attr in attrs)
        this[attr] = attrs[attr];
    if (this.minmax === undefined && this.type == 'Nmbr') {
        // Old table
        if (this.columns === undefined)
            this.minmax = '[0;1]';
        else
            this.minmax = '[0;' + Math.max(1, this.columns.split(/ +/).length) + ']';
        this.rounding = 1;
    }
    for (var attr in column_attributes)
        if (this[attr] === undefined)
            this[attr] = column_attributes[attr].default_value;
    this.sort_by = 'LABEL_sort_value';
    this.table = table_attr;
}

function Col(attrs) {
    return new Column(attrs);
}

Column.prototype.is_computed = function () {
    return this.real_type.cell_compute !== undefined && !this.incomplete;
};

Column.prototype.cell_is_modifiable = function () {
    return this.real_type.cell_is_modifiable;
};

Column.prototype.is_visible = function (line, cell) {
    if (this.title.substr(0, 1) == '.')
        return false;
    if (this.visibility == 0 || this.visibility == 6) {
        if (this.visibility_date != '') {
            if (this.visibility_date_filter) {
                if (line)
                    return this.visibility_date_filter(line, cell, line[0].value)
                return true; // not computable
            }
            if (this.visibility_date > get_date().formate('%Y%m%d'))
                return false;
        }
        return true;
    }
    return this.visibility == 3 || this.visibility == 4;
};

Column.prototype.all_cells_are_empty = function () {
    for (var lin in lines)
        if (lines[lin][this.data_col].value !== '')
            return false;
    return true;
};

// Returns false if there is more than 10% of not mail addresses
// else returns a list of bad mails (empty list if all are goods)
Column.prototype.contain_mails = function (allow_multiple) {
    if (this.all_cells_are_empty())
        return false;
    var mail = "[-'_.a-zA-Z0-9]*@[-'_.a-zA-Z0-9]*";
    var test = mail;
    if (allow_multiple)
        test += "( +" + mail + ")*";
    test = RegExp("^( *$|(mailto:)?" + test + ")$");
    var bad_mails = [];
    for (var lin in lines) {
        var value = lines[lin][this.data_col].value;
        if (value === '')
            continue;
        if (!value.match)
            bad_mails.push(value); // An int
        if (!test.exec(value))
            bad_mails.push(value);
    }
    if (bad_mails.length > Object.keys(lines).length / 10)
        return false;
    return bad_mails;
};

Column.prototype.compute_char_width = function () {
    if (this.is_empty)
        return 4;
    var t = [];
    for (var lin_id in lines)
        t.push(lines[lin_id][this.data_col].value.toString().replace(/[a-z][a-z][a-z]/g, '00').length);
    if (t.length == 0)
        return 1;
    t.sort(function (a, b) { return a - b; });
    return t[Math.floor(0.95 * t.length).toString()];
};


Column.prototype.repetition_allow_this_value = function (value, for_line) {
    var n;
    var verify_lines;

    if (value === '' || !this.real_repetition)
        return 0;

    if (this.real_repetition > 0)
        verify_lines = lines;
    else {
        verify_lines = [];
        var grp = for_line[3].value; // XXX should seach column name
        var seq = for_line[4].value;
        for (var line in lines) {
            line = lines[line];
            if (line[3].value == grp && line[4].value == seq)
                verify_lines.push(line);
        }
    }
    var col = data_col_from_col_title(this.groupcolumn);
    if (col === undefined) {
        n = 0;
        for (var line in verify_lines)
            if (verify_lines[line][this.data_col].value == value)
                n++;
    }
    else {
        var groups = {};
        for (var line in verify_lines)
            if (verify_lines[line][this.data_col].value == value)
                groups[verify_lines[line][col].value] = true;
        n = dict_size(groups);
    }
    if (n >= Math.abs(this.real_repetition))
        return n;
    return 0;
};

/*****************************************************************************/

function add_empty_columns() {
    var not_empty = first_column_not_empty();
    var nr_empty_columns = columns.length - not_empty - 1;

    /* There is a +5 because a user may hide empty columns.
       It will make 'column_list' function have problems
       because there is missing empty columns.
       So, we add some more.
    */
    for (var i = 0; i < table_attr.nr_columns - nr_empty_columns + 5; i++)
        add_empty_column();

    return not_empty + 1;
}

function search_column_in_columns(column, title) {
    if (column.title == title)
        return column;
    if (!column_modifiable_attr('columns', column))
        return;
    for (var i in column.average_columns) {
        var c = search_column_in_columns(columns[column.average_columns[i]],
            title);
        if (c)
            return c;
    }
}


/******************************************************************************
Cursor movement
******************************************************************************/

function need_to_save_change() {
    return !element_focused || element_focused.id != 'linefilter';
}


function next_page(next_cell, dy) {
    if (need_to_save_change())
        the_current_cell.change();

    if (filtered_lines !== undefined
        && line_offset + table_attr.nr_lines > nr_filtered_not_fully_empty_lines + 1)
        return true;

    if (dy === undefined)
        dy = Number((table_attr.nr_lines * preferences.page_step).toFixed(0));

    if (next_cell === true) {
        table_fill_hook = function () {
            cell_goto(table.childNodes[nr_headers + table_attr.nr_lines - dy - preferences.one_line_more].childNodes[the_current_cell.col]);
        };
    }

    line_offset += dy;
    the_current_cell.lin = Math.max(nr_headers, the_current_cell.lin - dy);
    if (preferences.one_line_more)
        the_current_cell.lin++;
    table_fill(true);
    return true;
}

function previous_page(previous_cell, dy) {
    if (need_to_save_change())
        the_current_cell.change();
    if (dy === undefined)
        dy = Number((table_attr.nr_lines * preferences.page_step).toFixed(0));
    if (previous_cell === true) {
        table_fill_hook = function () {
            cell_goto(table.childNodes[nr_headers + dy - 1 + preferences.one_line_more].childNodes[the_current_cell.col]);
        };
    }
    dy = Math.min(line_offset, dy);
    line_offset -= dy;
    the_current_cell.lin = Math.min(nr_headers + table_attr.nr_lines - 1,
        the_current_cell.lin + dy);
    if (dy && preferences.one_line_more)
        the_current_cell.lin--;
    table_fill(true);
    return true;
}

function first_page() {
    if (need_to_save_change())
        the_current_cell.change();
    line_offset = 0;
    the_current_cell.lin = nr_headers;
    table_fill(false);
    return true;
}

function last_page() {
    if (need_to_save_change())
        the_current_cell.change();
    var nr_lines = Math.min(nr_filtered_not_fully_empty_lines, filtered_lines.length);
    line_offset = nr_lines - table_attr.nr_lines + 1;
    if (line_offset < 0) {
        line_offset = 0;
        the_current_cell.lin = nr_lines + nr_headers - 1;
    }
    else {
        the_current_cell.lin = table_attr.nr_lines - 1;
    }
    table_fill(false);
    return true;
}

function table_fill_hook_horizontal() {
    var tr = table.childNodes[next_page_line];
    if (next_page_col < 0)
        cell_goto(tr.childNodes[0], true);
    else if (next_page_col < table_attr.nr_columns)
        cell_goto(tr.childNodes[next_page_col], true);
    else
        cell_goto(tr.childNodes[table_attr.nr_columns - 1], true);
}

/*
 * Autofreeze columns with a filter
 */
function autofreeze() {
    if (preferences.filter_freezed) {
        for (var data_col in columns) {
            var column = columns[data_col];
            if (column.filter !== '' && column.filter !== undefined)
                column.filter_freeze = true;
            else
                column.filter_freeze = false;
        }
    }
}
/*
 * If 'col' is defined : then it is the required column (centered)
 * Else 'direction' is a delta
 */
function page_horizontal(direction, col, do_not_focus, change_column) {
    var cls = column_list_all();
    // console.log('direction before', direction, 'offset', 'col', col, column_offset, 'change_column', change_column, 'cls', cls.length, 'columns', columns.length)
    if (!do_not_focus)
        the_current_cell.change();

    autofreeze();
    keep_change_column = col !== undefined;
    if (col) {
        col = Number(col);
        direction = col - Math.floor((table_attr.nr_columns + nr_freezed()) / 2) - column_offset;
    }
    if (direction > 0)
        direction = Math.min(column_offset + direction, cls.length - nr_freezed() - 2) - column_offset;
    else
        direction = Math.max(column_offset + direction, 0) - column_offset;
    if (!keep_change_column) {
        if (direction == 0)
            return;
        if (the_current_cell.col < nr_freezed())
            col = the_current_cell.col; // Cursor in frozen columns: do not move it
        else if (direction > 0 && the_current_cell.col - direction < nr_freezed())
            col = nr_freezed(); // Do not move on frozen columns
        else
            col = the_current_cell.col - direction;
    }

    column_offset += direction;
    if (change_column)
        col = direction > 0 ? col + 1 : col - 1;
    if (keep_change_column)
        col -= column_offset;

    next_page_col = col;
    next_page_line = the_current_cell.lin;

    table_fill_hook = table_fill_hook_horizontal;

    // console.log('direction after', direction, 'col', col, 'offset', column_offset);

    if (!update_nr_columns())
        table_fill(do_not_focus, true, false, true);

    periodic_work_do();

    change_option('column_offset', column_offset ? column_offset : '');

}

function next_page_horizontal(full_page) {
    var n = table_attr.nr_columns - nr_freezed();
    page_horizontal(full_page ? n : Math.floor(n / 2), undefined, undefined, true);
}

function previous_page_horizontal(full_page) {
    var n = table_attr.nr_columns - nr_freezed();
    page_horizontal(full_page ? -n : -Math.floor(n / 2), undefined, undefined, true);
}


/******************************************************************************
Cursor movement
******************************************************************************/

function cell_get_value_real(line_id, data_col) {
    return columns[data_col].real_type.formatte(lines[line_id][data_col].value,
        columns[data_col]);
}

function cell_class(column, line, cell) {
    var className = '';

    if (column.green_filter(line, cell, my_identity))
        className += ' color_green';
    if (column.red_filter(line, cell, my_identity))
        className += ' color_red';
    if (column.greentext_filter(line, cell, my_identity))
        className += ' greentext';
    if (column.redtext_filter(line, cell, my_identity))
        className += ' redtext';
    if (column.highlight)
        className += ' big_border_left';
    return className;
}

function there_is_an_abj(cell, column, abj, grp) {
    if (!abj || abj[0].length == 0)
        return;
    if (column.course_dates.text_dates.length) {
        var first, last;
        for (var a in abj[0]) {
            a = abj[0][a];
            if (!abj_is_fine(a))
                continue;
            first = parse_date(a[0]).getTime();
            last = parse_date(a[1]).getTime() + 10 * 3600 * 1000; // to be safe (Summer hours)
            if (column.course_dates.course_overlap_millisec(first, last, grp))
                return 'is_not_an_abi';
        }
    } else {
        var d = new Date(cell.date.substr(0, 4),
            cell.date.substr(4, 2) - 1,
            cell.date.substr(6, 2));
        d = d.getTime();
        for (var a in abj[0]) {
            a = abj[0][a];
            if (!abj_is_fine(a))
                continue;
            if (parse_date(a[0]).getTime() <= d
                && d < parse_date(a[1]).getTime() + 86400000 * 1)
                return 'is_an_abj';
        }
    }
}

INSCRITS = [
    [/\btierstemps\b/, '♿', 'tierstemps'],
    [/\bok\b/, '', 'ok'],
    [/\bSHN( SHN[0-9]*)?\b/, '🏆', 'SHN'],
    [/\bsportif\b/, '⚽', 'sportif'],
    [/\bnon\b/, '⛔', 'non'],
    [/\bDA dispense_assiduite\b/, '✅', 'DA'],
    [/\bdispense_assiduite\b/, '🟩', 'dispense_assiduite'],
    [/ /g, '']
];

function inscrit_to_icons(txt) {
    for (var [regex, icon, _filter] of INSCRITS)
        txt = txt.replace(regex, icon)
    return txt;
}

function update_cell(td, cell, column, abj_list, line) {
    var v = cell.value;
    var className = cell_class(column, line, cell);
    if (className.indexOf('text') == -1)
        if (cell.is_mine() && column.real_type.cell_is_modifiable)
            className += ' rw';
        else
            className += ' ro';
    if (cell.comment !== '')
        className += ' comment';
    if (cell.date >= today)
        className += ' today';
    if (v === '' && column.empty_is && line.empty == false) {
        className += ' default';
        v = column.empty_is;
    }
    if (v.toFixed) {
        className += ' number';
        v = column.real_type.formatte(v, column);
    }
    if (full_filter && full_filter(line, cell, my_identity))
        className += ' filtered';
    else if (line_filter && line_filter(line, cell, my_identity))
        className += ' filtered';
    is_a_teacher = 0;
    if (column.visibility_date_filter)
        if (!column.visibility_date_filter(line, cell, the_login(line[0].value)))
            className += ' suivi_hidden';
    if (column.modifiable == 2 && column.is_visible(line, cell) && column.cell_writable_filter
        && table_attr.modifiable && table_attr.official_ue)
        if (column.cell_writable_filter(line, cell, the_login(line[0].value)))
            className += ' suivi_modifiable';
    is_a_teacher = 1;

    // XXX : This does not work if there are no courses dates
    // because the ABJ modify the ABI date
    if (is_abj[v]) {
        var c = there_is_an_abj(cell, column, abj_list, line[3].value);
        if (!c)
            className = className.replace(' default', '') + ' is_not_an_abj';
    }
    else if (is_abi[v]) {
        var c = there_is_an_abj(cell, column, abj_list, line[3].value);
        var stud_abj = the_student_abjs[line[0].value];
        if (tr_classname && line[tr_classname].value.includes('dispense_assiduite') && stud_abj
            && column.course_dates.course_after_date(stud_abj[1][0][1], line[3].value))
            className = className.replace(' default', '') + ' is_not_an_abj';
        else
            className = className.replace(' default', '') + ' ' + c;
    }
    if (the_student_abjs[line[0].value])
        className += ' some_abj';
    if (cell.author.length != 1 && column.is_computed() && cell.date !== '')
        className += ' override';
    if (line[0].value === '') // Remove coloring but not comment indicator
        if (className.indexOf(' comment') == -1)
            className = '';
        else
            className = 'comment';
    td.className = className;
    switch (column.type) {
        case 'Calendar':
            td.innerHTML = "";
            td.appendChild(column.Calendar.html(
                v.toString(), true, td.offsetWidth, td.offsetHeight - 2, className.indexOf(' ro') == -1));
            break;
        case 'Competences':
            td.innerHTML = v.length > 0 ? competences_recap(v.split(' ')) : ' ';
            break;
        case 'COMPETENCES_RESULT':
            td.innerHTML = v.length > 0 ? comp_result_recap(v) : ' ';
            break;
        case 'COMPETENCES_YEAR_RESULT':
            td.innerHTML = v.length > 0 ? comp_result_recap(v) : ' ';
            break;
        case 'URL':
            if (column.urlimg & 2) {
                td.innerHTML = '<img class="urlimg" onerror="this.style.display=\'none\'" src="' + encode_value(column.url_base + v) + '">';
                break;
            }
        // Fall through
        default:
            if (td.firstChild.tagName)
                td.innerHTML = " ";
            if (v === '')
                td.lastChild.nodeValue = ' '; // If empty : zebra are not displayed
            else {
                if (tr_classname == column.data_col)
                    td.lastChild.nodeValue = inscrit_to_icons(v);
                else
                    td.lastChild.nodeValue = v.toString();
            }
            break;
    }
    if (column.sort_by != 'LABEL_sort_value' && column.sort_by != 'LABEL_sort_shuffle'
        && cell._key !== undefined) {
        var vv = td.firstChild;
        if (vv.tagName != 'SPAN') {
            vv = document.createElement('SPAN');
            vv.className = "sorted_value";
            if (cell.value.toFixed) {
                vv.style.left = '0px';
                vv.style.textAlign = 'left';
            }
            else {
                vv.style.right = '0px';
                vv.style.textAlign = 'right';
            }
            td.insertBefore(vv, td.firstChild);
        }
        vv.innerHTML = cell._key;
    }
    else
        if (td.firstChild.className == 'sorted_value')
            td.removeChild(td.firstChild);
    return v;
}

function column_change_allowed_text(column) {
    if (!table_attr.modifiable)
        return _("ERROR_table_read_only");
    if (column.title === '')
        return true;
    if (column.author == '*')
        return _("ERROR_column_system_defined");
    if (column.author == my_identity)
        return true;
    if (column.author == '')
        return true;
    if (i_am_the_teacher)
        return true;
    if (myindex(minors, column.author) != -1)
        return true;
    return _("ERROR_value_defined_by_another_user");
}

function column_change_allowed(column) {
    return column_change_allowed_text(column) === true;
}

// Indicate that 'line_id' will be filled
function add_a_new_line(line_id, hide_if_created) {
    var reuse_old_empty_line;

    if (line_id === undefined) {
        for (var line_id in lines) {
            var line = lines[line_id];
            if (!line.is_filtered && line_empty(line) === true) {
                reuse_old_empty_line = true;
                break;
            }
        }
        if (!reuse_old_empty_line) {
            while (lines[page_id + '_' + nr_new_lines] !== undefined)
                nr_new_lines++; // Problem raised by history removal

            line_id = page_id + '_' + nr_new_lines;
            nr_new_lines++;
        }
    }
    else {
        if (lines[line_id])
            return;
    }

    if (!reuse_old_empty_line) {
        // Create a new line

        var line = [];
        for (var c in columns)
            line[c] = C();
        line.line_id = line_id;
        lines[line_id] = line;
    }

    if (hide_if_created && (filters.length !== 0 || full_filter || line_filter))
        return;

    filtered_lines.push(line);
    line.is_filtered = true;

    /* Update screen table with the new id */
    var lin = filtered_lines.length - 1 - line_offset;
    if (lin >= 0 && lin < table_attr.nr_lines) {
        line_fill(filtered_lines.length - 1, lin + nr_headers);
    }
    update_vertical_scrollbar();
    return line_id;
}

function create_column(column, title) {
    if (column.is_empty && column.the_local_id !== undefined) {
        if (title === undefined)
            title = column.title;
        else
            column.title = title;
        column.is_empty = false;
        append_image(undefined, 'column_attr_title/' + page_id + '_'
            + column.the_local_id + '/' + encode_uri(title));
        column.the_local_id = undefined;
        update_horizontal_scrollbar();
        return true;
    }
}

// self is not included in the returned lines
function lines_of_the_group(column, line_id) {
    var g = [];
    if (column.groupcolumn === '')
        return g;
    var col = data_col_from_col_title(column.groupcolumn);
    if (!col)
        return g;
    var group = lines[line_id][col].value.toString();
    if (group !== '')
        for (var line_key in lines) {
            if (line_key == line_id)
                continue; // Itself
            if (lines[line_key][col].value.toString() === group)
                g.push(lines[line_key]);
        }
    return g;
}

function cell_set_value_real(line_id, data_col, value, td) {
    var cell = lines[line_id][data_col];
    var column = columns[data_col];

    if (!modification_allowed_on_this_line(line_id, data_col, value)) {
        GUI.add("cell_change_error", undefined, "not_allowed");
        return;
    }

    // toString is used because '' != '0' and '00' != '000'
    // === is not used because 5.1 == "5.1"
    if (value.toString() == lines[line_id][data_col].value.toString())
        return;

    if (!cell.modifiable(lines[line_id], column))
        return;

    if (column.is_empty && columns_filter.filter !== '') {
        Alert("ERROR_column_creation");
        return;
    }
    if (column.is_empty && column.data_col > 0
        && columns[column.data_col - 1].is_empty)
        alert_append(_("ERROR_column_left_to_right"));

    var orig_value = value;
    if (value.replace)
        value = encode_lf_tab(value);
    value = column.real_type.cell_test(value, column);
    if (value === undefined) {
        if (!column.is_empty)
            return;
        if (!confirm(_("ALERT_to_text")))
            return;
        column_attr_set(column, "type", "Text", undefined, true);
        the_current_cell.do_update_column_headers = true;
        return cell_set_value_real(line_id, data_col, orig_value, td);
    }
    else if (value.replace)
        value = decode_lf_tab(value);

    // Used as a group column
    for (var i in columns)
        if (columns[i].groupcolumn == column.title && column.title !== '') {
            var e = [], quoi;
            var group = lines[line_id][column.data_col].value.toString();
            var value_group = lines[line_id][columns[i].data_col].value;
            for (var line_key in lines) {
                if (line_key == line_id)
                    continue;
                quoi = '';
                if (lines[line_key][columns[i].data_col].value !== ''
                    && group !== ''
                    && lines[line_key][column.data_col].value.toString()
                    == group)
                    quoi = '-';
                if (lines[line_key][columns[i].data_col].value !== ''
                    && lines[line_key][columns[i].data_col].value !== value_group
                    && value !== ''
                    && lines[line_key][column.data_col].value.toString()
                    == value.toString())
                    quoi = '+';
                if (quoi)
                    e.push(_('MSG_columngroup' + quoi)
                        + ' ' + lines[line_key][0].value + ' '
                        + lines[line_key][1].value + ' '
                        + lines[line_key][2].value + ' '
                        + columns[i].title
                        + (quoi == '+' ?
                            ' : ' + lines[line_key][columns[i].data_col].value
                            + '≠' + value_group : '')
                        + '\n');
            }
            if (e.length) {
                e.sort();
                alert_append(_("ALERT_columngroup_change") + '\n\n'
                    + lines[line_id][column.data_col].value
                    + '→'
                    + value + '\n\n'
                    + e.join(""));
            }
        }

    create_column(columns[data_col]);
    add_a_new_line(line_id);
    var empty_before = line_empty(lines[line_id]);
    cell.set_value(value);
    update_nr_empty(empty_before, line_empty(lines[line_id]),
        lines[line_id].is_filtered);

    var v;
    if (td !== undefined)
        v = update_cell(td, cell, column, the_student_abjs[lines[line_id][0].value], lines[line_id]);

    /* Create cell */
    append_image(td, 'cell_change/' + column.the_id + '/' +
        line_id + "/" + encode_uri(cell.value)
    );

    if (value !== '') {
        column.is_empty = false;
        lines[line_id].empty = false;
    }

    update_histogram(true); // XXX

    if (empty_before && td) // Fill empty cells with empty is
        line_fill(myindex(filtered_lines, lines[line_id]), td.parentNode.rowIndex);

    var g = lines_of_the_group(column, line_id);
    if (g.length) {
        for (var line in g) {
            line = g[line];
            var cell = line[column.data_col];
            cell.set_value(value);
            td = td_from_line_id_data_col(line.line_id, column.data_col);
            if (td !== undefined)
                update_cell(td, cell, column, the_student_abjs[line[0].value], line);
        }
    }
    return v;
}

function cell_set_value(td, value, line_id, data_col) {
    if (value === undefined)
        // Next/Prev page if there is not a cell selected (Prst)
        return cell_get_value_real(line_id, data_col);

    var v = cell_set_value_real(line_id, data_col, value, td);
    if (v !== undefined)
        return v;
    return cell_get_value_real(line_id, data_col);
}

/*REDEFINE
  If LDAP students login and real students ID are not equals
  then a translation must be done.
  This function translate the login to a student number.
*/
function login_to_id(login) {
    return login;
}

/*REDEFINE
  If LDAP students login and real students ID are not equals
  then a translation must be done.
  This function translate the student number to a login
*/
function the_login(login) {
    return login;
}

function abj_is_fine(abj) {
    if (parse_date(abj[0]).getTime() > last_day)
        return 0;
    if (parse_date(abj[1]).getTime() < first_day)
        return false;
    return true;
}

function student_abjs(login) {
    var abjs_da = the_student_abjs[login];

    if (abjs_da === undefined)
        return '';

    var abjs = [];
    var s = '';

    for (var i in abjs_da[0]) {
        i = abjs_da[0][i];
        if (abj_is_fine(i))
            abjs.push(i);
    }

    if (abjs.length) {
        s += '<TABLE class="display_abjs colored">';
        s += '<TR><TH COLSPAN="4">' + _("TH_ABJ_list") + '</TH></TR>';
        s += '<TR><TH>' + _('TH_begin')
            + '</TH><TH>' + _('TH_end')
            + '</TH><TH>' + _('TH_length') + '</TH><TH></TH></TR>';
        var lines = [];
        for (var abj in abjs) {
            var start = abjs[abj][0].split('/');
            var line = '<TR><!--';
            line += start[2].substr(0, 4) + two_digits(start[1]) + two_digits(start[0]);
            line += '-->'
            if (abjs[abj][2].substr(0, 13) == '{{{MESSAGE}}}') {
                line += '<TD COLSPAN="4">' + nice_date(abjs[abj][0])
                    + ' <span style="background: #F00; color: #FFF">'
                    + html(abjs[abj][2].replace('{{{MESSAGE}}}', ''))
                    + '</span>'
                    ;
            }
            else {
                var d = (0.5 + (parse_date(abjs[abj][1]).getTime()
                    - parse_date(abjs[abj][0]).getTime()) / (1000 * 86400));
                var x = new RegExp('[' + ampms[0] + ampms[1] + ']');
                if (d == 0.5)
                    line += '<TD COLSPAN="2">' + nice_date(abjs[abj][0]);
                else if (abjs[abj][0].replace(x, '')
                    == abjs[abj][1].replace(x, ''))
                    line += '<TD COLSPAN="2">' + nice_date(abjs[abj][0]).replace(/ [^ ]*$/, '');
                else
                    line += '<TR><TD>' + nice_date(abjs[abj][0]) +
                        '</TD><TD>' + nice_date(abjs[abj][1]);

                line += '</TD><TD>' + d.toFixed(1) +
                    '</TD><TD>' + html(abjs[abj][2]) +
                    '</TD>';
            }
            line += '</TR>';
            lines.push(line);
        }
        lines.sort();
        s += lines.join('') + '</TABLE>';
    }

    var das = abjs_da[1];
    if (das.length) {
        var others = [];
        for (var da in das) {
            if (das[da][0] == ue)
                s += '<p class="da">' + _("MSG_DA") + ' ' + das[da][1] + ' <em>'
                    + html(das[da][2]).replace(/\n/g, '<br>') + '</em></p>';
            else
                others.push(das[da][0]);
        }
        if (others.length)
            s += '<hr><p class="da">' + _("TITLE_abjtt_da")
                + ' : ' + others.join(' ') + '</p>';
    }
    if (abjs_da[2])
        s += '<p class="tierstemps"><b>' + _('MSG_TT')
            + '</b> :<br>' + html(abjs_da[2]).replace(/\n/g, '<br>');

    return s;
}

function set_element_relative_position(anchor, element) {
    if (anchor.offsetWidth == 0)
        // Contains an element with absolute position (History)
        try { anchor = anchor.children[1].children[0] || anchor; }
        catch (err) { }

    var pos = findPos(anchor);

    if (pos[1] + anchor.offsetHeight + element.offsetHeight - scrollTop() > window_height())
        element.style.top = pos[1] - element.offsetHeight - 1 + 'px';
    else
        element.style.top = pos[1] + anchor.offsetHeight - 1 + 'px';

    var left;
    var align = anchor.tip_align;
    if (align == 'right_if_small')
        if (element.offsetWidth > anchor.offsetWidth)
            align = 'center';
        else
            align = 'right';

    switch (align) {
        case 'center':
            left = Math.max(pos[0] + anchor.offsetWidth - element.offsetWidth / 2, 0);
            break;
        case 'right':
            left = Math.max(pos[0] + anchor.offsetWidth - element.offsetWidth, 0);
            break;
        default:
            left = pos[0];
    }
    element.style.left = Math.min(window_width() - element.offsetWidth, left) + 'px';

    TIP.highlighter.style.display = 'block';
    TIP.highlighter.style.left = pos[0] + 'px';
    TIP.highlighter.style.top = pos[1] + 'px';
    TIP.highlighter.style.width = anchor.offsetWidth + 'px';
    TIP.highlighter.style.height = anchor.offsetHeight + 'px';

    let is_fixed = false;
    while (anchor && anchor.style) {
        if (getComputedStyle(anchor).position === 'fixed') {
            is_fixed = true;
            break;
        }
        anchor = anchor.parentNode;
    }
    TIP.tip.style.position = is_fixed ? 'fixed' : '';
    TIP.highlighter.style.position = is_fixed ? 'fixed' : '';
}

function highlight_add(element) {
    if (element.classList.contains('highlight'))
        element.classList.remove('highlight');
    element.classList.add('highlight');
    document.getAnimations().forEach((anim) => {
        anim.cancel();
        anim.play();
    }); // Force the previous animation to stop and the new one to launch
    if (!highlight_list.includes(element)) {
        highlight_list.push(element)
        element.addEventListener('animationend', (event) => {
            event.target.classList.remove('highlight');
        });
    }
}

function update_value_and_tip(o, value) {
    if (!o) {
        alert(value);
        return;
    }
    if (o.tagName == 'SELECT')
        return;

    var v = html(value.toString()) + '&nbsp;';
    if (o.innerHTML != v) {
        highlight_add(o);
        if (o.tagName != 'INPUT')
            o.innerHTML = v;
    }
}

function update_input(element, value, empty) {
    if (!element)
        return;
    if (element_focused == element)
        return; // Do not update value if the input has the focus

    if (empty) {
        element.className = ' empty';
        element.value = '';
    }
    else {
        value = encode_lf_tab(value.toString());
        if (element.value != value) {
            element.value = value;
            highlight_add(element);
        }
    }
    element.theoldvalue = element.value;
}

function cell_goto(td, do_not_focus) {
    var lin = lin_from_td(td);
    var col = col_from_td(td);
    var data_col = data_col_from_col(col);
    var line_id = line_id_from_lin(lin);

    if (do_not_focus !== true && element_focused) {
        //element_focused.blur();// To save values being edited before cell change.
        //if (element_focused && element_focused.onblur)
        //    element_focused.onblur({target: element_focused}); // Buggy Browser
    }

    if (the_current_cell.td != td && do_not_focus !== true)
        the_current_cell.input.selectionEnd = 0; // For Opera
    the_current_cell.jump(lin, col, do_not_focus, line_id, data_col);
}

/* Communication to the server */

function Connection() {
    this.state = 'closed';
    this.t_authenticate = document.getElementById('authenticate');
    this.connection_state = document.getElementById('connection_state');
    // Page are unloaded every 10 minutes server side.
    // So ping every 5 minutes to keep it loaded even if not focused
    if (this.connection_state) // In the table editor
        setInterval(this.ping.bind(this), 5 * 60 * 1000);
}

Connection.prototype.ping = function () {
    if (this.state !== "closed")
        return;
    this.connect();
    setTimeout(this.close.bind(this), 100);
};

Connection.prototype.close = function () {
    if (this.state == "closed")
        return;
    if (this.xmlhttp) {
        this.xmlhttp.abort();
        this.xmlhttp = undefined;
    }
    // '+=' does not work in my Firefox
    this.connection_state.innerHTML = this.connection_state.innerHTML + '...';
    this.state = "closed";
};

Connection.prototype.click_to_revalidate_ticket = function () {
    this.close();
    this.state = 'revalidate';
    var validate = url + '/allow/' + ticket + '/' + millisec();
    this.t_authenticate.innerHTML =
        "<h2>" + _("MSG_session_expired") + "</h2>"
        + _("MSG_session_reconnect")
        + ' <a href="' + validate + '" target="_blank">'
        + _("MSG_session_link") + '</a>';
    this.t_authenticate.style.width = "80%";
    this.t_authenticate.style.height = "80%";
    this.t_authenticate.style.top = "10%";
    this.t_authenticate.style.left = "10%";
    var c = this;
    this.t_authenticate.onmouseup = function () {
        c.t_authenticate.style.width =
            c.t_authenticate.style.height =
            c.t_authenticate.style.left = "auto";
        c.t_authenticate.style.top = c.t_authenticate.style.right = "0px";
    };
    this.t_authenticate.style.display = 'block';
    this.connection_state.innerHTML = _('MSG_unconnected');
};

function click_to_revalidate_ticket() {
    connection_state.click_to_revalidate_ticket();
}
Connection.prototype.need_connection = function () {
    if (is_a_virtual_ue)
        return;
    if (page_id === '')
        return;
    if (this.state == 'revalidate')
        return;
    if (this.state == 'opened')
        return;
    return true;
};

Connection.prototype.connect = function () {
    if (!this.need_connection())
        return;

    if (!this.connection_state)
        report_fake_error('connect ' + document.getElementById('connection_state'));

    var connection = add_ticket(year
        + '/' + semester + '/' + ue + '/' + page_id + '/0'
        + '.' + page_index + '.' + table_creation_date + '.' + table_load_time
        + '.' + (this.last_sync / 1000).toFixed(0));

    if (this.xmlhttp)
        this.xmlhttp.abort();
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.nb_read = 0;
    this.xmlhttp.js_buffer = '';
    this.xmlhttp.connection = this;
    this.xmlhttp.open("GET", connection, true);
    this.xmlhttp.setRequestHeader("If-Modified-Since",
        "Thu, 1 Jan 1970 00:00:00 GMT");
    this.xmlhttp.setRequestHeader("Cache-Control", "no-cache");

    // Must be defined last: resetted by .open()
    this.xmlhttp.onreadystatechange = function () {
        if (this.readyState >= 3 && this.status == 200) {
            if (this.responseText == '<html>ticket</html>') {
                this.connection.click_to_revalidate_ticket();
                return;
            }
            if (this.connection.state != 'opened') {
                this.connection.state = 'opened';
                this.connection.connection_state.innerHTML = _('MSG_connected');
                this.connection.t_authenticate.style.display = 'none';
                requester.try_send();
            }
            var t;
            t = this.responseText.substr(this.nb_read);
            this.js_buffer += t;
            this.nb_read += t.length;
            // Evaluate only complete <script>....</script> sequence
            t = this.js_buffer.split("</script>");
            var to_eval = '';
            for (var i in t) {
                if (i != t.length - 1)
                    to_eval += t[i].split('<script>')[1] + ';';
                else
                    this.js_buffer = t[i];
            }
            eval(to_eval.replace(this.clean_js, '//'));
            // Will not work if the network is cut while transfering
            // and the page is unloaded on the server and
            // nothing was modified server side after this time.
            this.connection.last_sync = millisec();
            // If the buffer is really too big: create a new one
            if (this.nb_read > 10000000) {
                this.connection.close();
                this.connection.connect();
            }
        }
    };
    this.xmlhttp.addEventListener('error', function () {
        if (this.connection.state != 'closed') {
            this.connection.connection_state.innerHTML += 'Connection Lost';
            this.connection.close();
            this.connection.connect();
        }
    });

    this.xmlhttp.send();
}

var do_reload_when_all_saved = false;

function restore_unsaved_forgot() {
    localStorage['/' + year + '/' + semester + '/' + ue] = '';
    index = localStorage['index'];
    localStorage['index'] = index.replace(RegExp('\n/' + year + '/' + semester + '/' + ue,
        'g'), '');
    popup_close();
}

function restore_unsaved_do_save() {
    for (var i in restore_unsaved.t_splited)
        requester.push(restore_unsaved.t_splited[i]);
    do_reload_when_all_saved = true;
    if (GUI) {
        GUI.add('restore_unsaved', '', 'save');
        GUI.save();
    }
    create_popup('import_div', _('MSG_currently_saving'), '', '', false);
}

function display_requests(t_splited, history) {
    var message = '';
    for (var i in t_splited) {
        var line = t_splited[i].split('/');
        if (line[0] == 'cell_change' || line[0] == 'comment_change') {
            var data_col = data_col_from_col_id(line[1]);
            var line_id = line[2];
            line[3] = decode_uri(line[3]);
            if (data_col !== undefined && lines[line_id] !== undefined) {
                if (!history && lines[line_id][data_col].value == line[3])
                    continue; // Unchanged value
                message += '<tr><td>' + html(lines[line_id][0].value)
                    + '<td>' + html(lines[line_id][1].value
                        + ' ' + lines[line_id][2].value)
                    + '<td>' + html(columns[data_col].title)
                    + '<td>'
                    + (line[0] == 'comment_change'
                        ? '<b>' + _("F_cell_comment") + '</b>: '
                        : '')
                    + html(line[3]) + '</tr>';
                continue;
            }
        }
        if (line[0] == 'column_attr_mcq') {
            var data_col = data_col_from_col_id(line[1]);
            message += '<tr><td colspan="2">' + _('B_MCQ')
                + '<td>' + html(columns[data_col].title)
                + '<td>' + html(line[2]) + '</tr>';
            continue;
        }
        var attr = line[0];
        var search = [
            'TIP_' + attr + '__', 'BEFORE_' + attr, 'TIP_' + attr, 'TITLE_' + attr,
            'TIP_table_attr_' + attr, 'MSG_' + attr];
        var action = '';
        for (var j in search)
            if (_(search[j]) != search[j]) {
                action = _(search[j]);
                break;
            }
        if (action) {
            line.splice(0, 1);
            if (attr.indexOf("column_") == 0) {
                var data_col = data_col_from_col_id(line[0]);
                var title = data_col > 0 ? columns[data_col].title : line[0];
                line.splice(0, 1);
                message += '<tr><td colspan="2">' + action.split('<br>')[0]
                    + '<td>' + html(title)
                    + '<td colspan="3">' + html(decode_uri(line.join(' - ')))
                    + '</tr>';
            }
            else
                message += '<tr><td colspan="2">' + action.split('<br>')[0]
                    + '<td colspan="2">' + html(decode_uri(line.join(' - ')))
                    + '</tr>';
        }
        else
            message += '<tr><td>BUG:' + attr + '</tr>';
    }
    return message;
}

function display_requests_add_tag(message, history) {
    return '<div style="overflow:auto;'
        + (history ? 'min-width:60em;max-height:25vh' : 'height:10.5em')
        + '">'
        + '<table class="colored"><tr><th>'
        + _('COL_TITLE_ID')
        + '<th>' + _('COL_TITLE_firstname')
        + ' ' + _('COL_TITLE_surname')
        + '<th>' + _('TH_column')
        + '<th>'
        + (history ? _('TH_value') : _('TH_unsaved_value'))
        + '</tr>'
        + message
        + '</table></div>';
}

function restore_unsaved() {
    if (GUI)
        GUI.add('restore_unsaved', '', 'localStorage=' + !!localStorage);
    if (!localStorage)
        return;
    var t = localStorage['/' + year + '/' + semester + '/' + ue];
    if (!t)
        return;
    var t_splited = t.split('\n');
    var message = display_requests(t_splited);
    if (message == '') {
        restore_unsaved_forgot();
        return;
    }
    restore_unsaved.t_splited = t_splited;
    create_popup('restoring_data', _('ASK_restore'),
        '',
        display_requests_add_tag(message)
        + '<button onclick="restore_unsaved_forgot()">'
        + _('B_unsaved_forgot') + '</button> '
        + '<button onclick="restore_unsaved_do_save()">'
        + _('B_unsaved_save') + '</button> '
        + '<button onclick="popup_close()">'
        + _('B_unsaved_cancel') + '</button>',
        false);
}

/*
 ****************************************************************************
 * Management of periodic work.
 * Once added, the function is called every 0.1 seconds until it returns false
 * 'add' can be called from a periodic function, in this case the function
 * may be called more than one in a period.
 * When a function is added to the list, it goes to the end,
 * so it is processed after the others.
 * The same function can not be added twice
 ****************************************************************************
 */

var periodic_work_functions = [];
var periodic_work_id;

function periodic_work_add_once(table, item) // Do not use this
{
    var i = myindex(table, item);
    if (i == -1)
        table.push(item);
    else {
        table.splice(i, 1);
        table.push(item);
    }
}

function periodic_work_in_queue(f) // The function is in the queue
{
    return myindex(periodic_work_functions, f) != -1;
}

function periodic_work_add(f) {
    periodic_work_add_once(periodic_work_functions, f);
    if (periodic_work_id === undefined)
        periodic_work_id = setInterval(periodic_work_do,
            periodic_work_period);
}

function periodic_work_remove(f) {
    var i = myindex(periodic_work_functions, f);
    if (i != -1)
        periodic_work_functions.splice(i, 1);
}

function periodic_work_do() {
    var f, to_do;
    var to_continue = [];
    while (periodic_work_functions.length) {
        to_do = periodic_work_functions;
        periodic_work_functions = [];
        for (f in to_do) {
            f = to_do[f];
            if (f())
                periodic_work_add_once(to_continue, f);
        }
    }
    periodic_work_functions = to_continue;
    if (to_continue.length == 0) {
        clearInterval(periodic_work_id);
        periodic_work_id = undefined;
    }
}

function RequesterSet() {
    this.requests = [];
}
RequesterSet.prototype.push = function (request) {
    this.requests.push(request);
};
RequesterSet.prototype.merge = function (requester_set) {
    this.requests = this.requests.concat(requester_set.requests);
};

function Requester() {
    this.sent = undefined;
    this.to_send = new RequesterSet();
    this.sender = this.try_send.bind(this);
    this.retry_time = 1000;
    this.history = [];
    this.log('init');
}

Requester.prototype.there_is_unsaved_data = function () {
    return this.sent || this.to_send.requests.length;
}

Requester.prototype.log = function (txt) {
    return;
    var text = txt + " sent=";
    if (this.sent)
        text += this.sent.timestamp + '/' + JSON.stringify(this.sent.requests);
    else
        text += 'NONE';
    text += ' to_send=' + JSON.stringify(this.to_send.requests);
    text += ' history=' + JSON.stringify(this.history);
    console.log(text);
}

Requester.prototype.status = function () {
    var history_size = 10;
    if (!this.feedback)
        this.feedback = document.getElementById('requester_feedback');

    var text = [], more;
    for (var i in this.history) {
        if (this.history[i][0].indexOf('bad.png') != -1)
            more = _("TIP_red_square");
        else if (this.history[i][0].indexOf('bug.png') != -1)
            more = _("ERROR_server_bug");
        else
            more = _("TIP_green_square");
        text.push(hidden_txt('<var instanttip="1" style="opacity:'
            + (0.1 + 0.9 * (history_size - this.history.length + Number(i)) / (history_size - 1))
            + '">' + this.history[i][0] + this.history[i][1].length + '</var>',
            more
            + display_requests_add_tag(display_requests(this.history[i][1], true), true)));
    }
    if (this.sent)
        text.push(hidden_txt(
            '<b style="background: #FFA500;" instanttip="1">⏱'
            + this.sent.requests.length + '</b>',
            display_requests_add_tag(display_requests(this.sent.requests, true), true)));
    if (this.to_send.requests.length)
        text.push(hidden_txt(
            '<var instanttip="1">🅿️' + this.to_send.requests.length + '</var>',
            display_requests_add_tag(display_requests(this.to_send.requests, true), true)));

    this.feedback.innerHTML = text.join(' ');
    this.history.splice(0, Math.max(0, this.history.length - history_size));
    this.status_update_needed = false;
};

Requester.prototype.push = function (request) {
    this.log('push start');
    this.last_push = millisec();
    this.to_send.push(request);
    this.status_update_needed = true;
    this.log('push end');
    periodic_work_add(this.sender);
};

Requester.prototype.try_send = function () {
    this.log('trysend start');
    if (this.status_update_needed)
        this.status();
    if (!table_attr.autosave)
        return true;
    if (millisec() - this.last_push < 100)
        return true; // May be a second change will quickly come
    if (this.sent && millisec() - this.sent.timestamp < 5000)
        return true; // Wait server answer before requesting again
    if (!this.there_is_unsaved_data())
        return;
    if (this.sent === undefined) {
        this.to_send.timestamp = millisec();
        this.sent = this.to_send;
    } else {
        this.sent.timestamp = millisec();
        this.sent.merge(this.to_send);
    }
    this.to_send = new RequesterSet();
    this.send_to_server();
}

Requester.prototype.send_event = function (event) {
    this.log('send_event ' + event.target.response);
    if (!event.target.response)
        return;
    if (event.target.response.length != 2) {
        if (event.target.response == 'bad.png') {
            // Alert("TIP_red_square");
            this.history.push(['<img class="server" instanttip="1" src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/bad.png">', this.sent.requests]);
        }
        else if (event.target.response == 'bug.png') {
            Alert("ERROR_server_bug");
            this.history.push(['<img class="server" instanttip="1" src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/bug.png">', this.sent.requests]);
        }
        else if (event.target.response == 'ticket') {
            click_to_revalidate_ticket();
            return;
        }
        this.sent = undefined;
        this.status();
        return;
    }
    if (!this.sent || event.target.response[0] != this.sent.timestamp)
        return;
    this.history.push(['<img class="server" instanttip="1" src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/ok.png">',
        this.sent.requests]);
    this.sent = undefined;
    this.status();
    page_index = event.target.response[1];
    this.retry_time = 1000;
    if (do_reload_when_all_saved) {
        restore_unsaved_forgot();
        window.location = window.location;
        do_reload_when_all_saved = false;
    }
};

Requester.prototype.send_event_error = function (_event) {
    this.log('sendtoserver error');
    this.status();
    setTimeout(this.send_to_server.bind(this), this.retry_time);
    this.retry_time *= 1.1;
};

Requester.prototype.send_to_server = function () {
    if (!this.sent)
        return; // Answer yet received
    this.log('sendtoserver');
    this.status();
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', this.send_event.bind(this), false);
    xhr.addEventListener('error', this.send_event_error.bind(this), false);
    xhr.responseType = 'json';
    xhr.open("POST", add_ticket('pageaction'), true);
    var formData = new FormData();
    formData.append('content', JSON.stringify(
        [this.sent.timestamp, year, semester, ue, page_id, this.sent.requests]));
    xhr.send(formData);
};

// XXX Does not work if there is 2 browser page open in the table.
Requester.prototype.store_unsaved = function () {
    if (!table_attr.autosave)
        return;
    if (!localStorage) {
        Alert("ERROR_save_to_localstorage_failed");
        return;
    }
    var s = this.sent ? this.sent.requests.concat(this.to_send.requests) : this.to_send.requests;
    if (s.length == 0)
        return;
    var key = '/' + year + '/' + semester + '/' + ue;
    if (localStorage[key])
        localStorage[key] += '\n' + s.join('\n');
    else {
        localStorage[key] = s.join('\n');
        index = localStorage['index'];
        if (!index)
            index = '';
        index += '\n' + key;
        localStorage['index'] = index;
    }
};


requester = new Requester();

function append_image(td, text, force) {
    if (!table_attr.modifiable && !force)
        return;
    if (is_a_virtual_ue)
        return;
    requester.push(text);
}

function login_to_line_id(login) {
    if (login_to_line_id.dict === undefined) {
        login_to_line_id.dict = {};
        for (var line_id in lines)
            login_to_line_id.dict[login_to_id(lines[line_id][0].value)] = line_id;
    }
    return login_to_line_id.dict[login_to_id(login)];
}


/* Communication from the server */
function Xcell_change(col, line_id, value, date, identity, history) {
    var data_col = data_col_from_col_id(col);
    if (data_col === undefined) {
        console.log("Unexpected Xcell_change");
        return;
    }
    add_a_new_line(line_id, true);

    var cell = lines[line_id][data_col];
    var empty_before = line_empty(lines[line_id]);

    cell.set_value_real(value);
    cell.author = identity;
    cell.date = date;
    cell.history = history;
    update_nr_empty(empty_before, line_empty(lines[line_id]),
        lines[line_id].is_filtered);

    var td = td_from_line_id_data_col(line_id, data_col);

    if (td !== undefined) {
        update_cell(td, cell, columns[data_col], the_student_abjs[lines[line_id][0].value], lines[line_id]);
        if (td == the_current_cell.td) {
            the_current_cell.update_cell_headers();
            the_current_cell.jump(the_current_cell.lin,
                the_current_cell.col);
        }
    }
    update_line(line_id, data_col);
}

function Xcomment_change(identity, col, line_id, value, history) {
    var data_col = data_col_from_col_id(col);
    add_a_new_line(line_id);
    var cell = lines[line_id][data_col];

    cell.set_comment(value, history);
    cell.author = identity;

    var td = td_from_line_id_data_col(line_id, data_col);
    if (td !== undefined) {
        update_cell(td, cell, columns[data_col], the_student_abjs[lines[line_id][0].value], lines[line_id]);
        if (cell === the_current_cell.cell)
            the_current_cell.update_cell_headers();
    }
}

function Xcolumn_delete(page, col) {
    var data_col = data_col_from_col_id(col);
    if (data_col === undefined) {
        console.log("Xcolumn_delete unexpected");
        return; // Should never be  here
    }
    for (line_id in lines)
        lines[line_id].splice(data_col, 1);
    columns.splice(data_col, 1);
    for (data_col in columns)
        columns[data_col].data_col = Number(data_col);
    if (the_current_cell.col == col)
        the_current_cell.col = columns[0].the_id;
    the_current_cell.update();

    if (page != ' ')
        Alert("MSG_refresh");
    the_current_cell.do_update_column_headers = true;
    the_current_cell.update_headers();
    table_fill(true, true, true, true);
}

function Xcolumn_attr(attr, col, value) {
    var data_col = data_col_from_col_id(col);
    var column;
    if (data_col === undefined) {
        data_col = add_empty_columns();
        column = columns[data_col];
        column.the_id = col;
        column.local_id = undefined;
        column.is_empty = false;
        table_fill();
    }
    else
        column = columns[data_col];
    column[attr] = column_parse_attr(attr, value, column, true);
    attr_update_user_interface(column_attributes[attr], column, true);
}

function Xtable_attr(attr, value) {
    table_attr[attr] = table_attributes[attr].formatter(value, true);
    the_current_cell.update_table_headers();
}

function update_table_size() {
    // In order to force Gecko to update table size
    var tr = table.childNodes[table_attr.nr_lines + nr_headers - 1];

    table.removeChild(tr);
    table.appendChild(tr);
}

function stop_event(event) {
    if (!event)
        return;
    if (event.real_event)
        event = event.real_event;
    if (event.stopPropagation)
        event.stopPropagation(true);
    if (event.preventDefault)
        event.preventDefault(true);
    else {
        event.returnValue = false;
        try { event.keyCode = 0; } catch (e) { };
    }

    event.cancelBubble = true;
}

// Set comment

function comment_change(line_id, data_col, comment, td) {
    create_column(columns[data_col]);
    add_a_new_line(line_id);

    var ok = lines[line_id][data_col].changeable(lines[line_id],
        columns[data_col]);
    if (ok !== true) {
        alert_append(ok);
        return;
    }

    lines[line_id][data_col].set_comment(comment);
    var col_id = columns[data_col].the_id;
    append_image(td, 'comment_change/' + col_id + '/' +
        line_id + '/' + encode_uri(comment));
    if (td)
        update_cell(td, lines[line_id][data_col], columns[data_col],
            the_student_abjs[lines[line_id][0].value],
            lines[line_id]);
}

function comment_on_change() {
    var input = the_comment;

    if (the_comment === undefined)
        return;

    var value = decode_lf_tab(input.value);

    if (lines[the_current_cell.line_id][the_current_cell.data_col].comment == value)
        return;

    if (!the_current_cell.cell.modifiable(lines[the_current_cell.line_id],
        the_current_cell.column)) {
        Alert("ERROR_value_not_modifiable");
        return;
    }

    the_current_cell.td.classList.add('comment');
    comment_change(the_current_cell.line_id, the_current_cell.data_col,
        value, the_current_cell.td);
}

function the_filters() {
    var s = "";
    var column;

    for (var data_col in columns) {
        column = columns[data_col];
        if (column.filter !== '')
            s += _("MSG_filter_on") + ' « ' + column.title + ' » : « '
                + column.filter + ' »\n';
    }
    return s;
}

function printable_introduction() {
    var problems = [];

    if (tr_classname !== undefined)
        if (sort_columns[0].data_col != 2)
            problems.push(_("WARN_not_name_sorted"));

    if (tr_classname !== undefined && popup_on_red_line) {
        var nb = 0;
        for (var i in filtered_lines) {
            line = filtered_lines[i];
            if (line[0].value == '' && line[1].value == '')
                continue;
            if (line[tr_classname].value === 'non')
                nb++;
        }
        if (nb)
            problems.push(nb + ' ' + _("WARN_students_not_registered"));
    }

    return '<p class="hidden_on_paper printable_introduction">'
        + _("MSG_not_printed") + "<br>"
        + _("MSG_sorted_by") + " «<b>" + sort_columns[0].title + '</b>» '
        + (sort_columns[1]
            ? _("MSG_sorted_by_more") + ' «<b>' + sort_columns[1].title + '</b>»<br>'
            : ''
        )
        + html(the_filters()).replace(/\n/g, '<br>')
        + '<span style="background:#F00;color:white">'
        + problems.join('<br>') + '</span>';
}

function display_on_signature_table(line) {
    if (line[0].value == '' && line[1].value == '')
        return false; // Empty line

    if (tr_classname === undefined)
        return true; // Not concept of registered student

    if (line[tr_classname].value != 'non')
        return true; // The student is registered in the UE

    if (popup_on_red_line)
        return false; // Do not display unregistered student.

    return true;
}

function lines_in_javascript() {
    var s = [], t, x, i;
    for (i in filtered_lines) {
        line = filtered_lines[i];
        if (display_on_signature_table(line)) {
            t = [];
            for (var data_col in columns)
                if (!columns[data_col].is_empty)
                    t.push(line[data_col].get_data());

            x = the_student_abjs[line[0].value];
            if (x && x[2])
                t.push(js('<li>' + x[2].substr(0, x[2].length - 1).replace(/\n/g, '<li>')));

            s.push('[' + t.join(',') + ']');
        }
    }
    return '[\n' + s.join(',\n') + ']';
}

function columns_in_javascript() {
    var s = [], p, column, all_cls;
    all_cls = column_list_all();
    for (var i in all_cls)
        columns[all_cls[i]].ordered_index = i;

    for (var data_col in columns) {
        column = columns[data_col];
        if (column.is_empty)
            continue;
        p = [];

        for (var attr in column_attributes) {
            var value = column[attr];
            p.push('"' + attr + '":'
                + (typeof value == 'number' || typeof value == 'boolean' ? value : js(column[attr])));
        }

        p.push("green_filter:" + column.green_filter);
        p.push("red_filter:" + column.red_filter);
        p.push("greentext_filter:" + column.greentext_filter);
        p.push("redtext_filter:" + column.redtext_filter);
        if (isNaN(column.red) || column.red === '')
            p.push("color_red:" + js(column.red));
        else
            p.push("color_red:" + column.red);
        if (isNaN(column.green) || column.green === '')
            p.push("color_green:" + js(column.green));
        else
            p.push("color_green:" + column.green);

        if (isNaN(column.redtext) || column.redtext === '')
            p.push("color_redtext:" + js(column.redtext));
        else
            p.push("color_redtext:" + column.redtext);
        if (isNaN(column.greentext) || column.greentext === '')
            p.push("color_greentext:" + js(column.greentext));
        else
            p.push("color_greentext:" + column.greentext);
        p.push("min:" + column.min);
        p.push("max:" + column.max);
        p.push("ordered_index:" + column.ordered_index);
        p.push("rounding:" + js(column.rounding));
        p.push("data_col:" + data_col);
        s.push('Col({' + p.join(',\n') + '})');
    }
    return '[\n' + s.join(',\n') + ']';
}

function button_toggle(dictionnary, data_col, tag, event) {
    if (dictionnary[data_col]) {
        delete dictionnary[data_col];
        tag.classList.remove('toggled');
    }
    else {
        tag.classList.add('toggled');
        dictionnary[data_col] = true;
    }
    do_printable_display = true;
    if (event)
        stop_event(the_event(event));
}

function toggle_button(text, dictionnary, name, help) {
    if (help)
        text = hidden_txt(text, help);
    var toggled = eval(dictionnary)[name] ? " toggled" : "";
    var a = '<span class="button_toggle' + toggled
        + '" id="' + dictionnary + '.' + name
        + '" onclick="button_toggle('
        + dictionnary + ",'" + name + "',this,event)\">"
        + text + '</span>';
    return a;
}

function set_radio(variable, selected) {
    var children = document.getElementById('id_' + variable).childNodes;

    for (var i = 0; i < children.length; i++)
        if (children[i].textContent == _(selected)) {
            children[i].onclick();
            return;
        }
    button_not_found;
}

function radio_buttons(variable, values, selected, action) {
    var value, the_class, tip, v;
    var s = [];

    if (variable.indexOf('.') == -1)
        s.push('<script>' + variable + ' = ' + js(selected) + ';</script>');

    if (action === undefined)
        action = "do_printable_display=true";
    s.push('<var id="id_' + variable + '">');
    for (var i in values) {
        value = values[i];

        if (value.sort) {
            tip = value[1];
            value = value[0];
        }
        else
            tip = '';


        if (value == selected)
            the_class = 'toggled';
        else
            the_class = '';
        v = '<span class="button_toggle ' + the_class
            + '" onclick="' + variable + "=" + js2(value)
            + "; radio_clean(this);this.classList.add('toggled');"
            + action + ';stop_event(the_event(event))">' +
            (tip ? hidden_txt(value, tip) : value) + '</span>';
        s.push(v);
    }
    s.push('</var>');
    return s.join('\n');
}

function radio_clean(t) {
    for (t = t.parentNode.firstChild; t; t = t.nextSibling)
        if (t.tagName == 'SPAN')
            t.classList.remove('toggled');
}

function compute_grouped_by_sorted(grouped_by) {
    var cols = column_list_all();
    var s = [];
    for (var i in cols) {
        var data_col = cols[i];
        if (grouped_by[data_col])
            s.push(data_col);
    }
    return s;
}

function compute_groups_key_function(grouped_by) {
    var cols = compute_grouped_by_sorted(grouped_by);
    var s = [];
    for (var i in cols)
        s.push('line[' + cols[i] + '].value');
    if (s.length == 0) {
        function _grp_key_() { return ''; };
        return _grp_key_;
    }
    return eval('function _grp_key_(line) { return ' + s.join('+"\001"+') + ';}; _grp_key_');
}

/* XXX Deprecated because slow and the columns are not in the good order */
function compute_groups_key(grouped_by, line) {
    var s = [];
    for (var data_col in grouped_by)
        if (grouped_by[data_col])
            s.push(line[data_col].value);
    return s.join('\001');
}

function compute_groups_values(grouped_by) {
    var g = {};
    var get_key = compute_groups_key_function(grouped_by);
    for (var line_id in lines)
        g[get_key(lines[line_id])] = true;
    tabl = [];
    for (var gg in g)
        tabl.push(gg);
    tabl.sort();
    return tabl;
}

function goto_resume() {
    window_open(add_ticket(year + '/' + semester + '/' + ue + '/resume'));
}

function html_begin_head() {
    var a = '{';
    for (var i in table_attr) {
        var value = table_attr[i];
        if (table_attributes[i])
            value = table_attributes[i].formatter(value);
        a += i + ':' + JSON.stringify(value) + ',';
    }
    a = a.substr(0, a.length - 1) + '}';

    var languages = '';
    var all = preferences['language'].split(',');
    for (var i in all)
        languages += '<script onload="this.onloadDone=true;" src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/'
            + all[i] + '.js" charset="UTF-8"></script>';

    return [
        '<html><head>',
        '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />',
        '<meta charset="utf-8">',
        '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
        '<link rel="stylesheet" href="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/style.css" type="text/css">',
        '<script src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/utilities.js" onload="this.onloadDone=true;" charset="UTF-8">',
        '</script>',
        '<script src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/middle.js" onload="this.onloadDone=true;" charset="UTF-8">',
        '</script>',
        '<script src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/lib.js" onload="this.onloadDone=true;" charset="UTF-8"></script>',
        '<script src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/types.js" onload="this.onloadDone=true;" charset="UTF-8"></script>',
        '<script src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/abj.js" onload="this.onloadDone=true;" charset="UTF-8"></script>',
        '<style id="computed_style"></style>',
        '<script>var translations = {} ; </script>',
        languages,
        table_headers,
        '<script>',
        'page_id = "" ;',
        'url = "' + url.split('/=')[0] + '" ;',
        'my_identity = "' + my_identity + '" ;',
        'year = "' + year + '" ;',
        'semester = "' + semester + '" ;',
        'ticket = "' + ticket + '" ;',
        'upload_max = "' + upload_max + '" ;',
        'ampms = ' + JSON.stringify(ampms) + ' ;',
        'ampms_full = ' + JSON.stringify(ampms_full) + ' ;',
        'days = ' + JSON.stringify(days) + ' ;',
        'days_full = ' + JSON.stringify(days_full) + ' ;',
        'months = ' + JSON.stringify(months) + ' ;',
        'months_full = ' + JSON.stringify(months_full) + ' ;',
        'ue = "VIRTUALUE" ;',
        'real_ue = "' + ue + '" ;',
        'root = [];',
        'suivi = "' + suivi + '";',
        'version = "' + version + '" ;',
        'preferences = ' + JSON.stringify(preferences) + ';',
        'rounding_default = ' + rounding_default + ';',
        'rounding_min = ' + rounding_min + ';',
        'columns = [] ;',
        'lines = {} ;',
        'adeweb = {} ;', // XXX should not be here (LOCAL/spiral.py)
        // "table_headers = " + JSON.stringify(table_headers) + ";",
        'table_attr = ' + a + ';',
        'function columns_filter() { return true ; }',
        'all_the_semesters = ' + js(all_the_semesters) + ' ;',
        wait_scripts, // The function definition
        '</script>',
        '<title>' + ue + ' ' + year + ' ' + semester + '</title>',
        '</head>',
        '<body class="' + the_body.className + '">'
    ].join('\n');
}

function notes_columns() {
    var cols = [];

    var cls = column_list_all();

    for (var data_col in cls) {
        data_col = cls[data_col];
        if (columns[data_col].real_type.should_be_a_float
            && !columns[data_col].is_empty) {
            var a = {
                min: 1000000, max: -1000000, sum: 0, nr: 0,
                nr_nan: 0, nr_pre: 0, nr_abi: 0, nr_abj: 0, nr_ppn: 0,
                sum2: 0
            };
            a.data_col = Number(data_col);
            cols.push(a);
        }
    }
    return cols;
}

// XXX yet done somewhere else
function student_search(id) {
    for (var line_id in lines)
        if (lines[line_id][0].value == id)
            return line_id;

    id = login_to_id(id);
    for (var line_id in lines)
        if (lines[line_id][0].value == id)
            return line_id;
}

function remove_highlight() {
    if (the_current_line) {
        the_current_line.classList.remove('highlight_current');
        // var name = the_current_line.className.replace('highlight_current', ' ');
        // The spaces broke the filter input : WHY XXX !!!
        // name = name.replace(/^ */, '').replace(/ *$/, '');
        // the_current_line.className = name;
        the_current_line = undefined;
    }
}

function update_popup_on_red_line() {
    var e = document.getElementById('popup_on_red_line');

    if (e)
        if (popup_on_red_line)
            e.lastChild.className = '';
        else
            e.lastChild.className = 'stroked';
}

function change_popup_on_red_line(event) {
    popup_on_red_line = !popup_on_red_line;
    update_popup_on_red_line();
    table_attr_set('popup_on_red_line', popup_on_red_line, the_event.target);
}


function update_mail(login, mail) {
    table_attr.mails[login] = mail;
}

function update_portail(login, portail) {
    table_attr.portails[login] = portail;
}

function change_size(dx, dy) {
    table_attr.nr_columns += dx;
    table_attr.nr_lines += dy;
    table_init();
    table_fill(false, true, false, true);
}

function change_table_size(select) {
    var i = select.childNodes[select.selectedIndex].innerHTML;
    i = Math.floor(i.split(' ')[0]); // Remove text after number
    if (select.id == 't_table_attr_nr_columns') {
        table_attr.nr_columns = i;
        column_offset = 0;
        change_option('column_offset');
        if (the_current_cell.col >= table_attr.nr_columns)
            the_current_cell.col = table_attr.nr_columns - 1;
    }
    else {
        table_attr.nr_lines = i;
        line_offset = 0;
    }
    table_init();
    table_fill(false, true, false, true);
    update_vertical_scrollbar();
    setTimeout("the_current_cell.update()", 100);
}


function nice_scale_from(min, v, max, bigger) {
    var t = [];
    var i, j;

    for (i = min; i <= bigger; i = Math.ceil(1.3 * i))
        t.push(i);
    if (myindex(t, v) == -1)
        t.push(v);
    if (myindex(t, max) == -1)
        t.push(max);
    for (i = 1; i <= 10; i *= Math.ceil(1.3)) {
        j = v + i;
        if (myindex(t, j) == -1)
            t.push(j);
        j = v - i;
        if (j > min && myindex(t, j) == -1)
            t.push(j);
    }
    t.sort(function (x, y) { return x - y; });
    t[myindex(t, max)] = max + ' (' + _('MSG_all') + ')';
    return t;
}

function update_a_menu(min, current, all, max, select) {
    if (!select)
        return;

    var i, i_striped;
    var sel;
    var t = nice_scale_from(min, current, all, max);

    for (var ii in t) {
        var created = false;
        var option = select.childNodes[ii];
        if (option === undefined) {
            option = document.createElement('option');
            created = true;
        }
        i = t[ii];
        i_striped = i.toString().replace(' (' + _('MSG_all') + ')', '');
        if (i_striped == current)
            sel = ii;
        option.innerHTML = i;
        option.value = i_striped;
        if (created)
            select.appendChild(option);
    }
    select.selectedIndex = sel;
}

function get_theme(theme) {
    return css_themes[Math.max(myindex(css_themes, theme), 1)];
}

// Used only for table and abj pages
function set_body_theme(the_semester) {
    var theme = preferences.theme === ''
        ? the_semester.substr(0, 1) // A or P or T
        : preferences.theme;
    theme = get_theme(theme);
    the_body.className = the_body.className.replace(/ theme[^ ]*/, '')
        .replace(/ compact_[01]/, '')
        + " theme" + theme + ' compact_' + preferences.compact;
}

function initialise_columns() {
    for (var data_col in columns) {
        columns[data_col].filter = '';
        columns[data_col].data_col = Number(data_col);
        if (columns[data_col].freezed == 'C') {
            tr_classname = data_col;
        }
    }
    if (tr_classname === undefined) {
        default_title = _("DEFAULT_title");
    }
    for (var data_col in columns) {
        init_column(columns[data_col]);
        columns[data_col].need_update = true;
    }
    update_columns();
}

function runlog(the_columns, the_lines) {
    column_get_option_running = true;
    columns = the_columns;
    lines = the_lines;

    if (Number(preferences.zebra_step) > 0)
        zebra_step = Number(preferences.zebra_step);
    else
        zebra_step = 3;

    // Competences :
    table_attr['competence'] = table_attributes['competence'].formatter(table_attr['competence']);
    if (!table_attr.p_competence.formulas)
        update_table_competence({ 'observations': [], 'subcomps': [] }, 'formulas');
    var comps_in_table = false;
    for (var col of columns)
        if (col.type == 'Competences') {
            comps_in_table = true;
            break;
        }
    if (comps_in_table)
        competenceTable.init_catalog_for(update_cols_comp_results);
    else
        update_comp_table_header();
    lib_init();

    scrollbar_right = test_bool(preferences.scrollbar_right) == yes;
    if (test_bool(preferences.invert_name) == yes
        && columns.length > 2 && columns[2].title == COL_TITLE_0_2) {
        columns[2].position = columns[1].position - 0.1;
    }
    if (test_bool(preferences.invert_grpseq) == yes
        && columns.length > 4 && columns[4].title == COL_TITLE_0_4) {
        columns[4].position = columns[3].position - 0.1;
    }

    if (table_attr.default_nr_columns)
        table_attr.nr_columns = table_attr.default_nr_columns;
    if (test_bool(preferences.v_scrollbar) == no)
        vertical_scrollbar = undefined;
    popup_on_red_line = table_attr.popup_on_red_line;

    nr_not_empty_lines = 0;
    nr_not_fully_empty_lines = 0;
    for (var line_id in lines) {
        lines[line_id].line_id = line_id;
        switch (line_empty(lines[line_id])) {
            case false: nr_not_empty_lines++;       // Fall thru
            case 1: nr_not_fully_empty_lines++;
        }
    }

    initialise_columns();
    // Default : Name sort

    add_empty_columns();
    if (table_attr.default_sort_column[0] != undefined) {
        // default_sort column is a list
        sort_columns = [];
        for (var i in table_attr.default_sort_column) {
            sort_columns.push(columns[table_attr.default_sort_column[i]]);
            sort_columns[i].dir = 1;
        }
    }
    else if (columns.length > table_attr.default_sort_column) {
        // DEPRECATED, only here for old tables
        if (columns.length > 1) {
            sort_columns = [columns[table_attr.default_sort_column], columns[1]];
            columns[1].dir = 1;
        }
        else
            sort_columns = [columns[table_attr.default_sort_column]];
        columns[table_attr.default_sort_column].dir = 1;
    }
    else {
        table_attr.default_sort_column = 0;
        sort_columns = [columns[0]];
    }

    if (!do_not_read_option) {
        try {
            get_all_options(); // Defined in by tablebookmark ATTRIBUTE
        }
        catch (err) {
        }
    }
    update_line_menu();
    update_column_menu();
    update_popup_on_red_line();
    update_filtered_lines();
    try { table_fill_hook = template_init; } catch (e) { }

    set_body_theme(semester);

    if (!is_a_virtual_ue)
        document.write('<img width="1" height="1" src="'
            + add_ticket(year + '/' + semester + '/' + ue + '/' +
                page_id + "/end_of_load")
            + '" style="position:absolute;left:0;top:0">');

    // This function is used when we want to replace the current window
    // content by the popup content.
    // It is NEEDED because some browser open popup UNDER the current window
    function replace_window_content(new_one) {
        for (var i in the_body.childNodes)
            if (the_body.childNodes[i].style)
                the_body.childNodes[i].style.display = 'none';
        the_body.onunload = '';
        the_body.onkeydown = '';
        new_one();
    }
    if (get_option('print-table', 'a') !== 'a') {
        replace_window_content(function () { print_selection(undefined, undefined, '_self') });
        return;
    }
    if (get_option('signatures-page', 'a') !== 'a') {
        replace_window_content(function () { print_selection(undefined, 1, '_self') });
        return;
    }
    if (get_option('facebook', 'a') !== 'a') {
        replace_window_content(function () {
            tablefacebook('_self',
                get_option('facebook',
                    undefined))
        });
        return;
    }
    if (get_option('graph', 'a') !== 'a') {
        var cols = get_option('graph').split(/=/);
        setTimeout(
            function () {
                the_current_cell.data_col_previous_previous = cols[0] || 0;
                the_current_cell.data_col_previous = cols[1] || 0;
                the_current_cell.data_col_current = cols[2] || 0;
                column_graph_zoom();
            }, 500);
    }
    if (table_forms_element || get_option('tableforms', 'a') !== 'a') {
        setTimeout(table_forms, 1500);
    }


    if (preferences.interface == 'L') {
        dispatch('init');
        return;
    }

    if (get_option('bigfont', 'a') !== 'a') {
        the_body.style.fontSize = '100%';
        document.getElementById('template_style').textContent +=
            'TABLE#thetable TD { height: 3em ; vertical-align: middle }';
    }

    /*
     * The normal interface (not linear)
     */

    table_init();
    autofreeze();
    table_fill(true, true, true);

    window.onwheel = wheel;

    window.onblur = function (event) {
        connection_state.close();
        shift_key_pressed = 0;
    };
    window.onfocus = connection_state.connect.bind(connection_state);

    if (window.attachEvent) {
        // IE does not launch resize event if the window is loading
        periodic_work_add(manage_window_resize_event);
    }
    else
        window.onresize = manage_window_resize_event;
    manage_window_resize_event();

    // Firefox bug : the page refresh reload the old iframe, not the new one
    // setTimeout(reconnect, 10) ;

    the_current_cell.jump(nr_headers, 0, true);
    the_current_cell.update_table_headers();

    // The restore popup must not be erased by the table filling
    var old_table_fill_hook = table_fill_hook;
    function ask_for_restore() {
        if (old_table_fill_hook)
            old_table_fill_hook();
        restore_unsaved();
    }
    table_fill_hook = ask_for_restore;

    document.getElementById("linefilter").focus();
    column_get_option_running = false;

    if (table_attr.code === '' && table_attr.modifiable !== 0
        && i_am_the_teacher && nr_not_empty_lines === 0
        && millisec() - get_date_tomuss(table_creation_date).getTime() < 86400000
        && table_attr.contains_users
    )
        send_invitation();

    analyse_table();
    setTimeout(connection_state.connect.bind(connection_state), 500);
}

function analyse_table() {
    slash_in_title();
    grade_type_in_average();
}

function slash_in_title() {
    var messages = [];
    var bad = RegExp("[^0-9]/ *([0-9]+)");
    for (var data_col in columns) {
        var found = bad.exec(columns[data_col].title);
        if (found)
            messages.push(
                _("MSG_slash_in_title")
                    .replace(/{title}/g, html(columns[data_col].title))
                    .replace(/{max}/g, found[1])
                    .replace(/{type}/g, columns[data_col].type)
            );
    }
    set_message('slash_in_title', 2, '<br>'.join(messages));
}

function grade_type_in_average() {
    var ue_grade = 0;
    for (var data_col in columns)
        if (columns[data_col].type == 'Ue_Grade')
            ue_grade++;
    if (!ue_grade)
        return;
    var messages = [];
    for (var data_col in columns)
        if (columns[data_col].type == "Moy")
            for (var i in columns[data_col].average_columns) {
                var col = columns[columns[data_col].average_columns[i]];
                if (col.grade_type > 0) {
                    messages.push(_("MSG_grade_type_in_average")
                        .replace(/{title}/g, html(col.title))
                        .replace(/{doc}/g, url + '/doc_table.html#T_Ue_Grade'));
                }
            }
    set_message('grade_type_in_average', 1, '<br>'.join(messages));
}

function user_is_doing_nothing() {
    if (millisec() - last_user_interaction > 60000) // 60 seconds
        return true;
    return false;
}

/*REDEFINE
*/
function do_change_abjs(m) {
    the_student_abjs = m;
}

var the_student_abjs = {};
function change_abjs(m) {
    do_change_abjs(m);
    if (user_is_doing_nothing())
        table_fill(true);
}

function the_full_login_list(login, results, add) {
    if (!document.getElementById('search_home')) {
        // We are in a table, not the home page
        login_list(login, results);
    }
    else
        full_login_list(login, results, add); // Defined in home2.js
}

function set_updating(bool) {
    var u = document.getElementById('updating');
    if (u)
        if (bool)
            u.style.display = 'inline';
        else
            u.style.display = 'none';
}

window.onerror = function (message, url_error, lineNumber, _colNumber, error) {
    if (lineNumber == 0)
        return false; // Error not in a TOMUSS script
    window.onerror = function () { return false; }; // Only first error
    var i = document.createElement('IMG');
    var now = new Date();
    var user;
    try { user = window.username || window.my_identity; }
    catch (e) { user = window.my_identity; }
    function clean(url) {
        return url.replaceAll(RegExp('https?://[^/]*[^:]*/([^/:?]+)([?][^:]*)*', 'g'), '$1');
    }

    i.width = i.height = 1;
    i.src = url + '/log/javascript_errors/'
        + encode_uri(JSON.stringify([
            now, message, clean(url_error), lineNumber, window.location.pathname, user,
            navigator.platform + '/' + navigator.appName
            + '/' + navigator.appVersion + '/' + navigator.product,
            navigator.userAgent, clean(error.stack.toString())]))
    if (!window.server_log)
        server_log = document.getElementsByTagName('BODY')[0];
    server_log.appendChild(i);
    return false;
};

function report_fake_error(message) {
    window.onerror(message, window.location.toString(), 99999, 99999, new Error('fake'));
}

function desync() {
    if (!popup_is_open() && !requester.there_is_unsaved_data()) {
        Alert('ALERT_desync');
        window.location.reload();
    }
    else
        setTimeout(desync, 1000);
}

// XXX COPY/PASTE in the end of new_page.py
window.Xcell_change = Xcell_change;
window.Xcomment_change = Xcomment_change;
window.Xcolumn_delete = Xcolumn_delete;
window.Xcolumn_attr = Xcolumn_attr;
window.Xtable_attr = Xtable_attr;
window.change_abjs = change_abjs;
window.update_mail = update_mail;
window.update_portail = update_portail;
window.login_list = login_list;
window.click_to_revalidate_ticket = click_to_revalidate_ticket;
window.set_updating = set_updating;
window.desync = desync;

    function wait_scripts(recall)
    {
    if ( navigator.userAgent.indexOf('Konqueror') == -1 )
        {
            var d = document.getElementsByTagName('SCRIPT'), e ;            
            for(var i=0; i<d.length; i++)
               {
               e = d[i] ;
               if ( e.src === undefined )
                   continue ;
               if ( e.src.substr(0, 4) != 'http' )
                   continue ;
               if ( e.onloadDone )
                   continue ;
               if ( e.readyState === "complete" )
                   continue ;
               setTimeout(recall, 1000) ;
               return ;
               }
         }
    var d = new Date(2026, 0, 8, 20, 15, 36) ;
    millisec.delta = d.getTime() - millisec() + 1000 ; // 1s to load page
    return true ;
    }
         
var semesters = ['Printemps', 'Automne'];

var semesters_year = [-1, 0];

var semesters_months = [[2, 7], [8, 13]];

var semesters_color = ['#EEFFEE', '#FFE8D0'];

var colonnes_mcc = [
    ["P1", "Examen terminal"],
    ["P2", "Examen partiel"],
    ["P3", "Contrôle continu"],
    ["P4", "Examen terminal de TP"]
] ;

function mcc_ajoute_colonne(epreuve, session, liste_colonnes)
{
  var id = epreuve[0] + session ;
  var select = document.getElementById('mcc_' + id) ;
  if ( select && select.value != 'Pas de session2')
    liste_colonnes[id] = {titre: select.value,
			  type: "Note",
			  poids: les_mcc[epreuve[0]][1],
			  visibility: 1,
			  commentaire:
			  (session !== '' ? "Session 2 de " : "")
			  + epreuve[1]
			  + ' (' + les_mcc[epreuve[0]][0] + ')',
			 } ;
}

function mcc_colonnes_a_creer()
{
  var c = [], epreuve ;
  for(var i in colonnes_mcc)
    mcc_ajoute_colonne(colonnes_mcc[i], '', c) ;
  var moy = [] ;
  if ( les_mcc["P1"] && les_mcc["P2"] )
  {
    c['P7'] = {titre: "Moyenne_P1_P2",
	       type: "Moy",
	       poids: les_mcc['P1'][1] + les_mcc['P2'][1],
	       columns: c['P1'].titre + ' ' + c['P2'].titre,
	       visibility: 2,
	       abi_is: 1
	      } ;
    c['P8'] = {titre: "Max_Moyenne",
	       type: "Max",
	       poids: les_mcc['P1'][1] + les_mcc['P2'][1],
	       columns: c['P1'].titre + ' ' + c['P7'].titre,
	       visibility: 2,
	       abi_is: 1
	      } ;
    moy.push('Max_Moyenne') ;
  }
  else
  {
    if ( les_mcc["P1"] )
      moy.push(c['P1'].titre) ;
    if ( les_mcc["P2"] )
      moy.push(c['P2'].titre) ;
  }
  if ( les_mcc["P3"] )
    moy.push(c['P3'].titre) ;
  if ( les_mcc["P4"] )
    moy.push(c['P4'].titre) ;

  if ( moy.length != 1 )
    c['P9'] = {titre: "Moyenne_UE_avant_jury",
	       type: "Moy",
	       columns: moy.join(' '),
	       visibility: 1,
	       abi_is: 1
	      } ;
  else
  {
    if ( c['P8'] )
    {
      c['P8'].titre = "Moyenne_UE_avant_jury" ;
      c['P8'].visibility = 1 ;
    }
  }

  // Calcule moyenne UE session 2

  for(var i in colonnes_mcc)
    mcc_ajoute_colonne(colonnes_mcc[i], '_2', c) ;
  moy = [] ;
  if ( c["P1_2"] && c["P2"] )
  {
    c['P7_2'] = {titre: "Moyenne_P1_P2_session2",
		 type: "Moy",
		 poids: les_mcc['P1'][1] + les_mcc['P2'][1],
		 columns: c['P1_2'].titre + ' ' + c['P2'].titre,
		 visibility: 2
		} ;
    c['P8_2'] = {titre: "Max_Moyenne_session2",
		 type: "Max",
		 poids: les_mcc['P1'][1] + les_mcc['P2'][1],
		 columns: c['P1_2'].titre + ' ' + c['P7_2'].titre,
		 visibility: 2,
		 abi_is: 1
		} ;
    moy.push('Max_Moyenne_session2') ;
  }
  else
  {
    if ( c["P1_2"] )
      moy.push(c['P1_2'].titre) ;
    if ( les_mcc["P2"] )
      moy.push(c['P2'].titre) ;
  }
  if ( c["P3_2"] )
    moy.push(c['P3_2'].titre) ;
  else if ( les_mcc['P3'] )
    moy.push(c['P3'].titre) ;
  if ( c["P4_2"] )
    moy.push(c['P4_2'].titre) ;
  else if ( les_mcc['P4'] )
    moy.push(c['P4'].titre) ;

  if ( moy.length != 1 )
    c['P9_2'] = {titre: "Moyenne_UE_avant_jury_session2",
		 type: "Moy",
		 columns: moy.join(' '),
		 visibility: 1,
		 abi_is: 1
		} ;
  else
  {
    if ( c['P8_2'] )
    {
      c['P8_2'].titre = "Moyenne_UE_avant_jury_session2" ;
      c['P8_2'].visibility = 1 ;
    }
  }

  for(var i in c)
    c[i].column = columns[data_col_from_col_title(c[i].titre)] ;

  return mcc_ordre_colonnes(c) ;
}

function mcc_ordre_colonnes(c)
{
  var s = [] ;
  for(var i = 1; i <= 9; i++)
    if ( c['P' + i] )
      s.push(c['P' + i]) ;
  for(var i = 1; i <= 9; i++)
    if ( c['P' + i + '_2'] )
      s.push(c['P' + i + '_2']) ;
  return s ;
}

function mcc_create()
{
  var c = mcc_colonnes_a_creer() ;
  var existe_deja ;
  for(var i in c)
  {
    i = c[i] ;
    if ( i.column )
    {
      existe_deja = true ;
    }
    else
    {
      existe_deja = false ;
      i.column = columns[add_empty_columns()] ;
    }
    if ( ! existe_deja )
    {
      column_attr_set(i.column, 'title', i.titre) ;
      column_attr_set(i.column, 'type', i.type, undefined, true) ;
    }
    if ( i.columns )
      column_attr_set(i.column, 'columns', i.columns) ;
    if ( i.poids )
      column_attr_set(i.column, 'weight', i.poids.toString()) ;
    if ( i.commentaire && i.column.comment === '' )
      column_attr_set(i.column, 'comment', i.commentaire) ;
    if ( i.abi_is )
      column_attr_set(i.column, 'abi_is', i.abi_is) ;
    column_attr_set(i.column, 'visibility', i.visibility) ;
    if ( i.type == "Moy" || i.type == "Max" )
      column_attr_set(i.column, 'cell_writable', '') ;
  }
  update_columns() ;
  table_fill(true, true, true) ;
  popup_close() ;
}

function mcc_update_button()
{
  var s = [] ;
  var c = mcc_colonnes_a_creer() ;
  for(var i in c)
    if ( ! c[i].column )
      s.push(c[i].titre) ;

  var m ;
  if ( s.length == 0 )
    m = "Réinitialise les paramètres des colonnes" ;
  else
    m =  "Créer les colonnes : " + s.join(", ") ;
  document.getElementById('mcc_button').innerHTML = m ;
}

function popup_mcc()
{
  var texte = '<style>'
      + '.popup_mcc TABLE.colored TD { padding: 0.2em; vertical-align: top }'
      + '.popup_mcc TABLE.colored INPUT { width:100% }'
      + '.popup_mcc TABLE.colored SELECT { font-size:90%; }'
      + '</style>'
      + caution_message()
      + 'Indiquer les noms des colonnes contenant les notes '
      + 'permettant de calculer les moyennes en session 1 et 2.'
      + '<table class="colored">'
      + '<tr><th>Epreuve'
      + '<th>Nom de la colonne'
      + '<th>Nom de la colonne session 2'
      + '</tr>' ;
  var existante = "", infos, commentaire, poids, session2 ;
  for(var i in columns)
    if ( columns[i].type.match(/Note|Moy|Max|Nmbr/) && !columns[i].is_empty )
      existante += '<option>' + html(columns[i].title) + '</option>' ;
  var nb = 0 ;
  for(var i in colonnes_mcc)
  {
    i = colonnes_mcc[i] ;
    if ( les_mcc[i[0]] )
      nb++ ;
  }
  for(var i in colonnes_mcc)
  {
    i = colonnes_mcc[i] ;
    commentaire = i[0] + " : " + i[1] ;
    if ( les_mcc[i[0]] )
    {
      infos = les_mcc[i[0]] ;
      commentaire += ' (' + infos[0] + ')' ;
      if ( nb != 1 )
	poids = '<br>Poids : ' + infos[1] ;
      else
	poids = '' ;
      session2 = i[0] + '_session2' ;
      if ( infos[3] == 0 )
	session2 = "Pas de session2</option><option>" + session2 ;
    }
    else
      continue ;
    texte += '<tr><td><b>'
      + html(commentaire) + '</b>'
      + poids
      + '<td><select onchange="mcc_update_button()" id="mcc_'
      + i[0] + '"><option>' + i[0] + '</option>' + existante
      + '</select><br>Durée : ' + infos[2] + ' min'
      + '<td>'
      + ( i[0] != 'P2'
	  ? '<select onchange="mcc_update_button()" id="mcc_'
	  + i[0] + '_2"><option>' + session2 + '</option>' + existante
	  + '</select><br>Durée : ' + infos[3] + ' min'
	  : "Cela n'existe pas")
      + '</tr>'
    ;
  }
  texte += '</table><button id="mcc_button" onclick="mcc_create()"></button>'
    + '<br>Les colonnes sont toutes <b>cachées aux étudiants</b>. '
    + "Pour les rendre visible, allez dans l'onglet «Affiche» "
    + "et basculez le premier choix de «Cachée aux étudiants» à «Visible sur le suivi»." ;
  create_popup("popup_mcc", "Création des moyennes respectant les MCC",
	       texte, '', false) ;
  mcc_update_button() ;
}

var les_mcc ;

function add_mcc(code)
{
  les_mcc = mcc_en_js[ue.split("-")[1]] ;
  if ( les_mcc )
    return '<a href="javascript:popup_mcc()">Création des colonnes MCC</a>' ;
  else
    return "Pas de MCC connues" ;
}
table_info.push([-1, add_mcc]) ;

function column_sum_do()
{
  var cols = column_list(0, 9999) ;
  var t = [] ;
  for(var j in cols) {
    if ( cols[j].is_empty )
      continue ;
    var data_col = cols[j].data_col;
    var comment = columns[data_col].comment ;
    var date = comment.replace(/ Matin/, '_08:00').replace(/ Après.*/, '_13:30') ;
    if ( date == comment )
      continue;
    var s = 0 ;
    for(var i in filtered_lines)
      s += Number(filtered_lines[i][data_col].value);
    t.push(date + ' ' + s)
  }
  create_popup('export_div', 'Exportation des présents', '', '') ;
  popup_set_value(t.join('\n'));
}

function column_sum_do2(all)
{
  var col_etu = data_col_from_col_id('20ETU') ;
  var col_date = data_col_from_col_id('40DATE') ;
  var col_hour = data_col_from_col_id('50HEURE') ;
  var col_qui = data_col_from_col_id('80SENT') ;
  var dates = {} ;
  for(var i in filtered_lines) {
    var line = filtered_lines[i];
    if ( line[col_date].value === '' )
      continue;
    if ( ! line[col_qui].value.match(/^[-a-z]*\.[-a-z]*$/) )
      if ( ! all || line[col_qui].value !== '' )
        continue;
    var d = line[col_date].value + '_'
      + (Number(line[col_hour].value.split('h')[0]) < 13 ? '08:00' : '13:30');
    if (dates[d] === undefined)
      dates[d] = {};
    var etu = line[col_etu].value.split(/\n+/);
    for(var i in etu)
      dates[d][etu[i].split(' ')[0]] = true;
  }
  var t = [] ;
  for(var date in dates) {
    t.push(date + ' ' + Object.keys(dates[date]).length);
  }
  function key(txt) { return Number(txt.substr(6, 4) + txt.substr(3, 2) + txt.substr(0, 2)) ; }
  t.sort(function(a, b) { return key(a) - key(b) ; });

  create_popup('export_div', 'Exportation nombre de convocations envoyées', '', '') ;
  popup_set_value(t.join('\n'));
}

function column_sum(_code)
{
  if ( ue == 'presents' )
      return '<a href="javascript:column_sum_do()">Exportation des présents</a>' ;
  if ( semester == 'Convocations' )
      return '<a href="javascript:column_sum_do2(false)">Exportation nombre de convocations envoyées</a>'
        + ' (<a href="javascript:column_sum_do2(true)">prévisionnel</a>)';
  return '';
}
table_info.push([98, column_sum]) ;

mcc_en_js = {"A1BUE111": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "A1BUE112": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "A1BUE113": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "A1BUE121": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "A1BUE122": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "A1BUE123": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "A1BUE131": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE132": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE133": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE141": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE142": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE143": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE211": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE212": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE213": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE21E": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE221": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE222": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE223": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE22E": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE231": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A1BUE232": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A1BUE233": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A1BUE241": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE242": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A1BUE243": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A1BUE311": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE312": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE313": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE321": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE322": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE323": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE331": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A1BUE332": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A1BUE333": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE341": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A1BUE342": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A1BUE343": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE351": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE352": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE353": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE411": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE412": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE413": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE421": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE422": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE423": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE431": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A1BUE432": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A1BUE433": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE441": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A1BUE442": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A1BUE443": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE451": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE452": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE453": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE521": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE522": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE523": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE531": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE532": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE533": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE541": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE542": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE543": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE551": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A1BUE552": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE553": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE621": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE622": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE623": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A1BUE631": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE632": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE633": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE641": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE642": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE643": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A1BUE651": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE652": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A1BUE653": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A2BMUE11": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE12": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE13": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE14": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE15": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BMUE16": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BMUE21": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE22": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE23": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE24": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BMUE25": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BMUE26": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BMUE31": {"P3": ["CCI", 30.0, 0, 0, "?/"]}, "A2BMUE35": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "A2BMUE36": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "A2BSUE31": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE32": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE33": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE34": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE35": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BSUE36": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BSUE41": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE42": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE43": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE44": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A2BSUE45": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BSUE46": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE11": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE12": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE13": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE14": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE15": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE16": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE21": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE22": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE23": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE24": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE25": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE26": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE31": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE32": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE33": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE34": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE35": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE36": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE41": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE411": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE42": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE422": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE43": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE434": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE44": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE443": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A2BUE45": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE46": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "A2BUE511": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "A2BUE522": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "A2BUE534": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "A2BUE543": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "A2BUE551": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE552": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE553": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE554": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE561": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE562": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE563": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE564": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A2BUE611": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE622": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE634": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE643": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE651": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE652": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE653": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE654": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE661": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE662": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE663": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A2BUE664": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A3BMUE11": {"P3": ["CCI", 20.0, 0, 0, "?/"]}, "A3BMUE12": {"P3": ["CCI", 20.0, 0, 0, "?/"]}, "A3BMUE13": {"P3": ["CCI", 20.0, 0, 0, "?/"]}, "A3BMUE21": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE22": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE23": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE24": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE25": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE31": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE32": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE33": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE34": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BMUE35": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3BUE11": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A3BUE12": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A3BUE13": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A3BUE21": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A3BUE22": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A3BUE23": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A3BUE31": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE32": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE33": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE341": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE342": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE343": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE351": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE352": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE353": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE41": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE42": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE43": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE441": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE442": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE443": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE451": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE452": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE453": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE511": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE512": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE513": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE514": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE521": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE522": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE523": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE524": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE531": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE532": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE533": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE534": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE541": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE542": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE543": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE544": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE551": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE552": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE553": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE554": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE611": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE612": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE613": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE614": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE621": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE622": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE623": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE624": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE631": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE632": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE633": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE634": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE641": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE642": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE643": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE644": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE651": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE652": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE653": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3BUE654": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3SUE313": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3SUE323": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3SUE333": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3SUE413": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3SUE423": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3SUE433": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A3SUE443": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A3SUE453": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A4BUE11": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A4BUE12": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A4BUE13": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A4BUE21": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A4BUE22": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A4BUE23": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A4BUE311": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE312": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE321": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE322": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE331": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE332": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE341": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A4BUE342": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A4BUE351": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A4BUE352": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A4BUE411": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE412": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE421": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE422": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE431": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE432": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE441": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A4BUE442": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A4BUE451": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A4BUE452": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "A4BUE510": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A4BUE512": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A4BUE520": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A4BUE522": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A4BUE541": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A4BUE542": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A4BUE543": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A4BUE551": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A4BUE552": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A4BUE553": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A4BUE610": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE612": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE620": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE622": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "A4BUE641": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A4BUE642": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A4BUE643": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A4BUE651": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A4BUE652": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A4BUE653": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A6BSUE31": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE32": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE33": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE34": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE35": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE36": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE41": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE42": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE43": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE44": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE45": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BSUE46": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE11": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE12": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE13": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE14": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE15": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE16": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE21": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE22": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE23": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE24": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE25": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE26": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE311": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE312": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE313": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE321": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE322": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE323": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE331": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE332": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE333": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE341": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE342": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE343": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE351": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE352": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE353": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE361": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE362": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE363": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE411": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE412": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE413": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE421": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE422": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE423": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE431": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE432": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE433": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE441": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE442": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE443": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE451": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE452": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE453": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE461": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE462": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE463": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "A6BUE511": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE512": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A6BUE521": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE532": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "A6BUE543": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE553": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE561": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE562": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE563": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE611": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE612": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "A6BUE621": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE632": {"P3": ["CCI", 13.0, 0, 0, "?/"]}, "A6BUE643": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE653": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE661": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A6BUE662": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "A6BUE663": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE11": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE12": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE13": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE14": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE15": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE21": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE22": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE23": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE24": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE25": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE31": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE32": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE33": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE34": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE35": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE41": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE42": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE43": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE44": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE45": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "A7BUE511": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE513": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE514": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE522": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE524": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE533": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE534": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE541": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE542": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE551": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE552": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE553": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE611": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE613": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE614": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE622": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE624": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE633": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE634": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE641": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE642": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE651": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE652": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "A7BUE653": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "AC301LX2": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "AC302LX2": {"P3": ["CCI", 6.0, 0, 30, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1005L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1006L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1007L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1142M": {"P1": ["CT", 1.5, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.52, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.98, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1143M": {"P1": ["CT", 4.02, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "ACT1148M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 0, 20, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "ACT1149M": {"P1": ["CT", 3.0, 240, 150, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1150M": {"P1": ["CT", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "ACT1199M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "ACT1200M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1201M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1202M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "ACT1203M": {"P1": ["CT", 1.5, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"], "P4": ["CT", 0.6, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1208M": {"P1": ["CT", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "ACT1209M": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1210M": {"P1": ["CT", 2.7, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.6, 0, 0, "?/"], "P4": ["CT", 2.7, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1211M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "ACT1212M": {"P1": ["CT", 3.0, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"]}, "ACT1213M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "ACT1214M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1215M": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.98, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1216M": {"P1": ["CT", 3.96, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.04, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1217M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1218M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1219M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "ACT1220M": {"P1": ["CT", 3.48, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.02, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "ACT1221M": {"P1": ["CT", 12.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "ACT1222M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1223M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1224M": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT1225M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1226M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1227M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1228M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1229M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1230M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT1231M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2000L": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2001L": {"P1": ["CT", 3.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "ACT2002L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2003L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2004L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2005L": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2207M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "ACT2208M": {"P1": ["CT", 3.24, 240, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.78, 0, 0, "?/"], "P4": ["CT", 1.98, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "ACT2209M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ACT2210M": {"P1": ["CT", 1.05, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"], "P4": ["CT", 0.48, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2215M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2221M": {"P1": ["CT", 0.99, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.01, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2222M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ACT2223M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2224M": {"P1": ["CT", 6.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2225M": {"P1": ["CT", 3.0, 240, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 240, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2290M": {"P1": ["CT", 21.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "ACT2291M": {"P1": ["CT", 2.04, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.64, 0, 0, "?/"], "P4": ["CT", 1.32, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2292M": {"P1": ["CT", 3.0, 240, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.02, 0, 0, "?/"], "P4": ["CT", 1.98, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2293M": {"P1": ["CT", 2.76, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.22, 0, 0, "?/"], "P4": ["CT", 1.02, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2294M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2295M": {"P1": ["CT", 1.5, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 120, 105, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2296M": {"P1": ["CT", 1.98, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"], "P4": ["CT", 1.02, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2297M": {"P1": ["CT", 3.0, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "ACT2298M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2299M": {"P1": ["CT", 1.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.98, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "ACT2300M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "ACT2301M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "ACT2302M": {"P1": ["CT", 1.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "ACT2303M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2304M": {"P1": ["CT", 6.0, 150, 110, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2305M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2306M": {"P1": ["CT", 2.64, 180, 105, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 0.96, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2307M": {"P1": ["CT", 1.5, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.51, 0, 0, "?/"], "P4": ["CT", 0.99, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2308M": {"P1": ["CT", 5.1, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "ACT2309M": {"P1": ["CT", 1.98, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.04, 0, 0, "?/"], "P4": ["CT", 1.98, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2310M": {"P1": ["CT", 1.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 1.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT2311M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2312M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ACT2313M": {"P1": ["CT", 21.0, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "ACT2314M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2315M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2316M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2317M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2318M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2319M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2320M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2321M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2322M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2323M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT2324M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ACT3177L": {"P1": ["CT", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "ACT3178L": {"P1": ["CT", 1.5, 0, 0, "Mise en situation (stage, simulation de situations...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.5, 0, 0, "Mise en situation (stage, simulation de situations...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "ACT3179L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "ACT3180L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3181L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "ACT3182L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3183L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3184L": {"P1": ["CT", 3.0, 60, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3185L": {"P1": ["CT", 4.02, 120, 105, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.98, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3186L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3187L": {"P1": ["CT", 0.99, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 2.01, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "ACT3188L": {"P1": ["CT", 4.02, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.98, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3189L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3190L": {"P3": ["CCI", 3.0, 0, 10, "?/Ensemble d'\u00e9preuves diverses"]}, "ACT3191L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3192L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3193L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3194L": {"P3": ["CCI", 9.0, 0, 20, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3195L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3196L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3197L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3198L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3199L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3200L": {"P1": ["CT", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "ACT3201L": {"P1": ["CT", 4.02, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3202L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3203L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3204L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3205L": {"P1": ["CT", 3.0, 10, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "ACT3206L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3207L": {"P1": ["CT", 4.02, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "ACT3208L": {"P1": ["CT", 6.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "ACTLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ACTLG02M": {"P3": ["CCI", 3.0, 0, 30, "?/Ensemble d'\u00e9preuves diverses"]}, "AEUVIP": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "AEUVR": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "B1BUE11": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B1BUE12": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B1BUE21": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B1BUE22": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B1BUE311": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE312": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE313": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE321": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE322": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE323": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE331": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE332": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE333": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE341": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE342": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE343": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE411": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE412": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE413": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE421": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE422": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE423": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE431": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE432": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE433": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE441": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE442": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE443": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE511": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE512": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE513": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE521": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE522": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE523": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE531": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE532": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE533": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE541": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE542": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE543": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE611": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE612": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE613": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B1BUE621": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE622": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE623": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B1BUE631": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE632": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE633": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B1BUE641": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE642": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B1BUE643": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B2BUE11": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE12": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE13": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE14": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE15": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE21": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE22": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE23": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE24": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE25": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE31": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE32": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE33": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE34": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE35": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE41": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE42": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE43": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE44": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE45": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B2BUE52": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B2BUE53": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B2BUE54": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B2BUE62": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B2BUE63": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B2BUE64": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B3BUE11": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE12": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE13": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE14": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE21": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE22": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE23": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE24": {"P3": ["CCI", 7.5, 0, 0, "?/"]}, "B3BUE31": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE32": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE33": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE34": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE351": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE352": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE353": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE354": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE355": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE41": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE42": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE43": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE44": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE451": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE452": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE453": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE454": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE455": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE51": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE52": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE53": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE54": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE551": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE552": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE553": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE554": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE555": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE61": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE62": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE63": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE64": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE651": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE652": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE653": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE654": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B3BUE655": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BSUE31": {"P3": ["CCI", 20.0, 0, 0, "?/"]}, "B4BSUE32": {"P3": ["CCI", 20.0, 0, 0, "?/"]}, "B4BSUE33": {"P3": ["CCI", 20.0, 0, 0, "?/"]}, "B4BSUE41": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B4BSUE42": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B4BSUE43": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B4BSUE44": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "B4BUE11": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "B4BUE12": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "B4BUE13": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE21": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "B4BUE22": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "B4BUE23": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE311": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE312": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE313": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE314": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE321": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE322": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE323": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE324": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE331": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE332": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE333": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE334": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE341": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE342": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE343": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE344": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE351": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE352": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE353": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE354": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B4BUE411": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE412": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE413": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE414": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE421": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE422": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE423": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE424": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE431": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE432": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE433": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE434": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE441": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE442": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE443": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE444": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE451": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE452": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE453": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE454": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B4BUE511": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE512": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE513": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE514": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE521": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE522": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE523": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE524": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B4BUE541": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE542": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE543": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE544": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE551": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE552": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE553": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE554": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B4BUE611": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE612": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE613": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE614": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE621": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE622": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE623": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE624": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B4BUE641": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B4BUE642": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B4BUE643": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B4BUE644": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B4BUE651": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B4BUE652": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B4BUE653": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B4BUE654": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE11": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE12": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE13": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE21": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE22": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE23": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE31": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B5BUE32": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B5BUE33": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B5BUE34": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B5BUE35": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "B5BUE41": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B5BUE42": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B5BUE43": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B5BUE44": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B5BUE45": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "B5BUE51": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B5BUE52": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "B5BUE54": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B5BUE55": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "B5BUE61": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B5BUE62": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "B5BUE64": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "B5BUE65": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "BCH1003M": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BCH1003P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BCH1004P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BCH1005M": {"P1": ["CT", 4.2, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH1006L": {"P1": ["CT", 4.5, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BCH1007L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BCH1008L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.75, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "BCH1009L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.75, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "BCH1010L": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "BCH1011L": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "BCH1017M": {"P1": ["CT", 2.25, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "BCH1023M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH1025M": {"P1": ["CT", 2.04, 120, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.98, 0, 0, "?/"], "P4": ["CT", 1.98, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BCH1026M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH1027M": {"P1": ["CT", 3.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BCH1028M": {"P1": ["CT", 4.2, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BCH1029M": {"P1": ["CT", 2.1, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH1030M": {"P1": ["CT", 2.1, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BCH1033M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BCH1034M": {"P1": ["CT", 4.2, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BCH1036M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BCH1037M": {"P1": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 4.5, 0, 0, "?/"]}, "BCH1039M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BCH1040M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BCH1042M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.5, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BCH2001L": {"P1": ["CT", 1.65, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "BCH2002L": {"P1": ["CT", 2.7, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.3, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2002M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BCH2003L": {"P1": ["CT", 3.0, 75, 75, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2004L": {"P1": ["CT", 2.7, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 1.5, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2008L": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BCH2009L": {"P1": ["CT", 2.1, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BCH2010L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 2.1, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2012L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2013L": {"P1": ["CT", 1.5, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BCH2014L": {"P1": ["CT", 0.75, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"], "P4": ["CT", 0.75, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2025M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2030M": {"P1": ["CT", 4.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BCH2032M": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BCH2033M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BCH2034M": {"P1": ["CT", 1.5, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BCH2035M": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BCH2037M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH2038M": {"P1": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BCH2039M": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "BCH2040M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BCH2041M": {"P1": ["CT", 2.1, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BCH2042M": {"P1": ["CT", 7.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 16.8, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BCH2043M": {"P1": ["CT", 2.25, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "BCH2044M": {"P1": ["CT", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "BCH2046M": {"P1": ["CT", 12.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 12.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BCH2048M": {"P1": ["CT", 1.2, 30, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.8, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BCH3001L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "BCH3002L": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BCH3003L": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BCH3004L": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "BCH3005L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BCH3008L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BCH3009L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BCH3010L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH3012L": {"P1": ["CT", 3.0, 15, 15, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "BCH3015L": {"P1": ["CT", 4.5, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 30, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH3022L": {"P1": ["CT", 3.0, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BCH3023L": {"P1": ["CT", 2.1, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BCH3024L": {"P1": ["CT", 2.4, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.1, 0, 0, "?/"], "P4": ["CT", 1.5, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BCH3025L": {"P1": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 4.5, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BI101MX2": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI102MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI103MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI104MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI105MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI110MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI111MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI112MX9": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI113MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI115MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI116MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI117MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI118MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI120MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI121MX9": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI122MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI123MX9": {"P1": ["CT", 3.0, 120, 119, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI124MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI125MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI126MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI127MX9": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BI201MX9": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BI202MX9": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BI203MX9": {"P1": ["CT", 3.0, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BI204MX9": {"P1": ["CT", 0.9, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.1, 0, 0, "?/"]}, "BI205MX9": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BI206MX9": {"P1": ["CT", 3.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BI207MX9": {"P1": ["CT", 3.6, 60, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BI208MX9": {"P1": ["CT", 12.0, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 18.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BI213MX2": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BI300LXN": {"P1": ["CT", 45.0, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 55.0, 0, 0, "?/"]}, "BI301LXN": {"P1": ["CT", 100.0, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BI302LXN": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BI303LXN": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO1000E": {"P1": ["CT", 10.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1002L": {"P1": ["CT", 2.4, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.6, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 75, 75, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1002M": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1002P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1003L": {"P1": ["CT", 6.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1003P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "BIO1004L": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1004P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1005P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1006L": {"P1": ["CT", 3.06, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO1006M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.5, 0, 0, "?/"], "P4": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1006P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1007M": {"P1": ["CT", 3.6, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1007P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BIO1008P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BIO1011L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO1012L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1013L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1014L": {"P1": ["CT", 1.95, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.05, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1015L": {"P3": ["CCI", 3.0, 0, 30, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1015P": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1016L": {"P1": ["CT", 3.0, 75, 75, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1016M": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1016P": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1017L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1017P": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO1018L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1018P": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1019P": {"P1": ["CT", 3.06, 60, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO1025P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1026P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1027P": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1028P": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1029P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1030P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1031P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1032P": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1033P": {"P1": ["CT", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.6, 0, 0, "?/"], "P4": ["CT", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO1034P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BIO1036P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1037P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.5, 0, 0, "?/"], "P4": ["CT", 4.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1038P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1039P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.5, 0, 0, "?/"], "P4": ["CT", 4.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1053M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BIO1073M": {"P1": ["CT", 3.96, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.04, 0, 0, "?/"]}, "BIO1076M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1078M": {"P1": ["CT", 6.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1085M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1121M": {"P1": ["CT", 4.2, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1126M": {"P1": ["CT", 4.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO1137M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1165M": {"P1": ["CT", 0.9, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO1167M": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1171M": {"P1": ["CT", 1.8, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1172M": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1178M": {"P1": ["CT", 4.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1179M": {"P1": ["CT", 2.4, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "BIO1216M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1217M": {"P1": ["CT", 1.53, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.47, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1227M": {"P1": ["CT", 4.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1228M": {"P1": ["CT", 3.6, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 1.2, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1229M": {"P1": ["CT", 4.2, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1230M": {"P1": ["CT", 2.1, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.9, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1232M": {"P1": ["CT", 2.7, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.3, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1233M": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1234M": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO1239M": {"P1": ["CT", 2.4, 15, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 0.6, 0, 0, "?/"], "P4": ["CT", 3.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1242M": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1246M": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1247M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1250M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1251M": {"P1": ["CT", 4.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BIO1253M": {"P1": ["CT", 4.5, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BIO1254M": {"P1": ["CT", 4.5, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BIO1258M": {"P1": ["CT", 4.5, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BIO1259M": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "BIO1266M": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1267M": {"P1": ["CT", 3.9, 90, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.1, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1269M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO1270M": {"P1": ["CT", 6.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1271M": {"P1": ["CT", 4.2, 150, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1274M": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1276M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1277M": {"P1": ["CT", 4.2, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1280M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1281M": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1282M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1286M": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1287M": {"P1": ["CT", 9.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1290M": {"P1": ["CT", 4.2, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1292M": {"P1": ["CT", 0.9, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.1, 0, 0, "?/"]}, "BIO1294M": {"P1": ["CT", 1.02, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "BIO1342M": {"P1": ["CT", 2.7, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.3, 0, 0, "?/"]}, "BIO1355M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "BIO1358M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1359M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1360M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1361M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1362M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1363M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1364M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1365M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1366M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1367M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1368M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1369M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1370M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1371M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1372M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1373M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1374M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1375M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1376M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1377M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1378M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1379M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1381M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1382M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1383M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1384M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1385M": {"P1": ["CT", 4.02, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "BIO1386M": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1387M": {"P1": ["CT", 4.02, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "BIO1388M": {"P1": ["CT", 4.2, 180, 150, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1389M": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO1390M": {"P1": ["CT", 4.02, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "BIO1391M": {"P1": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.6, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1392M": {"P1": ["CT", 1.53, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO1393M": {"P1": ["CT", 4.02, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "BIO1395M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "BIO1396M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 50, 50, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1397M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "BIO1399M": {"P1": ["CT", 1.53, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO1400M": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1401M": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1402M": {"P3": ["CCI", 6.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO1404M": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1405M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1406M": {"P1": ["CT", 3.6, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1409M": {"P1": ["CT", 2.28, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.72, 0, 0, "?/"], "P4": ["CT", 3.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1410M": {"P1": ["CT", 3.06, 180, 150, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO1411M": {"P1": ["CT", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 0.6, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO1412M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO1414M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1416M": {"P1": ["CT", 2.4, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.6, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1417M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1418M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO1419M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1420M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1421M": {"P1": ["CT", 3.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1422M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1423M": {"P1": ["CT", 1.8, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Mise en situation (stage, simulation de situations...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1424M": {"P1": ["CT", 2.4, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.2, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1425M": {"P1": ["CT", 3.6, 120, 10, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.8, 20, 20, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1426M": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO1427M": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO1428M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO1429M": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "BIO1430M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1431M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO1432M": {"P1": ["CT", 1.95, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.05, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1435M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1436M": {"P1": ["CT", 3.0, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1437M": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BIO1438M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1439M": {"P1": ["CT", 1.53, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO1440M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1441M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1442M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO1443M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO1444M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1445M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1446M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1447M": {"P1": ["CT", 10.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 5.4, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 2.7, 0, 0, "?/"], "P4": ["CT", 8.1, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1448M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1449M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1450M": {"P1": ["CT", 9.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 4.8, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 7.2, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO1452M": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1457M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1458M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1459M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1460M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1461M": {"P1": ["CT", 9.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "BIO1464M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1465M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1466M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1467M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1468M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1469M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1470M": {"P1": ["CT", 9.0, 0, 30, "Mise en situation (stage, simulation de situations...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1472M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO1474M": {"P1": ["CT", 15.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1476M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO1477M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO1478M": {"P1": ["CT", 4.2, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO1479M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1480M": {"P1": ["CT", 6.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1481M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1483M": {"P1": ["CT", 3.6, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO1484M": {"P1": ["CT", 6.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO1485M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO1488M": {"P1": ["CT", 10.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 10.5, 0, 0, "?/"]}, "BIO1489M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO1493M": {"P1": ["CT", 6.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 6.0, 0, 0, "?/"]}, "BIO1497M": {"P1": ["CT", 4.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO1498M": {"P1": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO1501M": {"P1": ["CT", 6.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO1502M": {"P1": ["CT", 4.2, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2001L": {"P1": ["CT", 2.1, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.1, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2001P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BIO2002P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2003L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 1.8, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2003P": {"P1": ["CT", 10.5, 35, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 4.5, 0, 0, "?/"]}, "BIO2004P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BIO2005P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2006P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 3.75, 0, 0, "?/"], "P4": ["CT", 5.25, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2007L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 90, 90, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "BIO2008L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2009L": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2013L": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2014P": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO2015L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2015P": {"P1": ["CT", 4.59, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 4.41, 0, 0, "?/"]}, "BIO2016P": {"P1": ["CT", 9.0, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 6.0, 0, 0, "?/"]}, "BIO2020L": {"P1": ["CT", 4.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2020P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BIO2021P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2023L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO2032L": {"P1": ["CT", 4.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO2039L": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO2040L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2041L": {"P1": ["CT", 3.6, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2042L": {"P1": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2045L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2047L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2049L": {"P1": ["CT", 1.2, 45, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.84, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.96, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2050L": {"P1": ["CT", 4.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2051L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2052L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2053L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2054L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2055L": {"P1": ["CT", 3.0, 20, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2056L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2057L": {"P1": ["CT", 3.0, 30, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2058L": {"P1": ["CT", 6.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2097M": {"P1": ["CT", 3.0, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2098M": {"P1": ["CT", 3.0, 60, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2204M": {"P1": ["CT", 12.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 12.0, 0, 0, "?/"]}, "BIO2224M": {"P1": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2261M": {"P1": ["CT", 1.8, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO2267M": {"P1": ["CT", 1.8, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO2271M": {"P1": ["CT", 3.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2357M": {"P1": ["CT", 6.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2358M": {"P1": ["CT", 6.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2359M": {"P1": ["CT", 6.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2360M": {"P1": ["CT", 1.8, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO2367M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2371M": {"P1": ["CT", 1.95, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P2": ["CP", 1.05, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO2372M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2377M": {"P1": ["CT", 6.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2378M": {"P1": ["CT", 6.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2379M": {"P1": ["CT", 6.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2380M": {"P1": ["CT", 4.8, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2381M": {"P1": ["CT", 12.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 18.0, 60, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2390M": {"P1": ["CT", 6.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2392M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2393M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2394M": {"P1": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2396M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2398M": {"P1": ["CT", 3.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2399M": {"P1": ["CT", 18.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 12.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2400M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2402M": {"P1": ["CT", 6.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "BIO2405M": {"P1": ["CT", 2.25, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "BIO2408M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2410M": {"P1": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "BIO2412M": {"P1": ["CT", 1.8, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO2416M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 15.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2419M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2420M": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2422M": {"P1": ["CT", 2.1, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BIO2424M": {"P1": ["CT", 15.3, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 14.7, 0, 0, "?/"]}, "BIO2433M": {"P1": ["CT", 6.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2436M": {"P1": ["CT", 6.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2437M": {"P1": ["CT", 1.98, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "BIO2441M": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2443M": {"P1": ["CT", 3.06, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO2448M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.0, 0, 0, "?/"], "P4": ["CT", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO2449M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO2450M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.5, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO2451M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO2461M": {"P1": ["CT", 27.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2465M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2469M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2471M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2475M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2477M": {"P1": ["CT", 3.6, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2482M": {"P1": ["CT", 1.53, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.47, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2484M": {"P1": ["CT", 3.0, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2486M": {"P1": ["CT", 1.53, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO2487M": {"P1": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "BIO2492M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2493M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2494M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2495M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2497M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2498M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2499M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2500M": {"P1": ["CT", 13.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 13.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2529M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2530M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO2538M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "BIO2541M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2542M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2543M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2544M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2545M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2546M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2547M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2548M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2549M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2550M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2551M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2552M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2553M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2554M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2555M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2556M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2557M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2558M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2559M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "BIO2560M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2561M": {"P1": ["CT", 1.8, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2563M": {"P1": ["CT", 6.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2564M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2565M": {"P1": ["CT", 20.1, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 9.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2566M": {"P1": ["CT", 4.2, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO2567M": {"P1": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BIO2568M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2569M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO2570M": {"P1": ["CT", 12.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 6.0, 0, 0, "?/"], "P4": ["CT", 12.0, 40, 40, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2571M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO2572M": {"P1": ["CT", 3.3, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "BIO2573M": {"P1": ["CT", 3.06, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO2574M": {"P1": ["CT", 4.59, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 4.41, 0, 0, "?/"]}, "BIO2575M": {"P1": ["CT", 11.4, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 7.2, 0, 0, "?/"], "P4": ["CT", 11.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2576M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2577M": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2578M": {"P1": ["CT", 6.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2580M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2581M": {"P1": ["CT", 6.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2582M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2583M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2584M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2588M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2589M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2590M": {"P1": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "BIO2591M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2592M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2593M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2594M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2595M": {"P1": ["CT", 12.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 12.0, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2596M": {"P1": ["CT", 15.0, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO2597M": {"P1": ["CT", 5.4, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P2": ["CP", 0.6, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2598M": {"P1": ["CT", 1.8, 20, 15, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2599M": {"P1": ["CT", 1.53, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO2600M": {"P1": ["CT", 1.53, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO2601M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2602M": {"P1": ["CT", 18.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 12.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2603M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2605M": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO2606M": {"P1": ["CT", 3.06, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO2608M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2609M": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2610M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO2611M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2612M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2613M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2614M": {"P1": ["CT", 4.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO2616M": {"P1": ["CT", 3.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2617M": {"P1": ["CT", 16.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 10.8, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2618M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2619M": {"P1": ["CT", 2.1, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BIO2620M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2621M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2622M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2623M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2624M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2625M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2627M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2628M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2629M": {"P1": ["CT", 9.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 4.8, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 7.2, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2630M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2631M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2632M": {"P1": ["CT", 10.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 5.4, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 2.7, 0, 0, "?/"], "P4": ["CT", 8.1, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2633M": {"P1": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "BIO2634M": {"P1": ["CT", 1.53, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO2636M": {"P1": ["CT", 2.7, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.3, 0, 0, "?/"]}, "BIO2637M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO2638M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2639M": {"P1": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "BIO2640M": {"P1": ["CT", 1.8, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 15, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2641M": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2642M": {"P1": ["CT", 1.98, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "BIO2644M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 0.3, 0, 0, "Mise en situation (stage, simulation de situations...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 0.9, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2646M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2648M": {"P1": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "BIO2649M": {"P1": ["CT", 3.0, 120, 120, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "BIO2650M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2651M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2653M": {"P1": ["CT", 2.4, 30, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.6, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2655M": {"P1": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO2656M": {"P1": ["CT", 9.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 9.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.0, 0, 0, "?/"], "P4": ["CT", 9.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2657M": {"P1": ["CT", 2.1, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.9, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2658M": {"P1": ["CT", 2.1, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 0.9, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2660M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 15.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2661M": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2662M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2663M": {"P1": ["CT", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "BIO2664M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2665M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2666M": {"P1": ["CT", 1.5, 0, 0, "Production audiovisuelle (vid\u00e9o...)/"], "P4": ["CT", 1.5, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "BIO2667M": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 5.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2669M": {"P1": ["CT", 1.53, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "BIO2670M": {"P1": ["CT", 13.5, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 16.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2674M": {"P1": ["CT", 3.0, 120, 120, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "BIO2677M": {"P1": ["CT", 27.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2678M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO2679M": {"P3": ["CCI", 30.0, 0, 0, "?/"]}, "BIO2681M": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2682M": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2683M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2684M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2686M": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO2688M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO2690M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2692M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2694M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2696M": {"P3": ["CCI", 30.0, 0, 0, "?/"]}, "BIO2698M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "BIO2699M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2700M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2701M": {"P1": ["CT", 3.06, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO2702M": {"P1": ["CT", 4.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 3.6, 0, 0, "?/"], "P4": ["CT", 4.2, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2703M": {"P1": ["CT", 1.65, 90, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "BIO2704M": {"P1": ["CT", 2.4, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2705M": {"P1": ["CT", 4.8, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.6, 0, 0, "?/"], "P4": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2706M": {"P1": ["CT", 3.06, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO2707M": {"P1": ["CT", 3.3, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"], "P4": ["CT", 2.7, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2708M": {"P1": ["CT", 5.1, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2709M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "BIO2710M": {"P1": ["CT", 12.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 9.0, 0, 0, "?/"], "P4": ["CT", 9.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2711M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIO2712M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "BIO2713M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2714M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2715M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO2719M": {"P1": ["CT", 1.5, 0, 25, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 90, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2720M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2721M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2722M": {"P1": ["CT", 20.1, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 9.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO2723M": {"P1": ["CT", 3.0, 90, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO2728M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "BIO2730M": {"P1": ["CT", 2.4, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "BIO3003L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3008L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3009L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 1.8, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3011L": {"P3": ["CCI", 6.0, 0, 45, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3012L": {"P1": ["CT", 3.06, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO3013L": {"P1": ["CT", 3.6, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3019L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3021L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3025L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3028L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3029L": {"P1": ["CT", 4.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3033L": {"P1": ["CT", 4.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 40, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3036L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"], "P4": ["CT", 1.5, 30, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3037L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 1.2, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3038L": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3039L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.1, 0, 0, "?/"], "P4": ["CT", 0.9, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3040L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3043L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3060L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3079L": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3083L": {"P1": ["CT", 3.6, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3085L": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3087L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO3092L": {"P1": ["CT", 0.99, 60, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.02, 0, 0, "?/"], "P4": ["CT", 0.99, 60, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3093L": {"P1": ["CT", 1.05, 60, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.9, 0, 0, "?/"], "P4": ["CT", 1.05, 60, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3100L": {"P1": ["CT", 3.0, 0, 50, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3110L": {"P3": ["CCI", 6.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3112L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3113L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3114L": {"P3": ["CCI", 6.0, 0, 30, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3118L": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3119L": {"P1": ["CT", 3.6, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3120L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3122L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3123L": {"P1": ["CT", 3.3, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3125L": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3126L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3127L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3128L": {"P1": ["CT", 3.06, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO3129L": {"P1": ["CT", 3.06, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO3132L": {"P1": ["CT", 1.8, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "BIO3135L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3136L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3140L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO3141L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO3143L": {"P1": ["CT", 3.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3144L": {"P1": ["CT", 6.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3145L": {"P1": ["CT", 4.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO3146L": {"P1": ["CT", 5.4, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "BIO3147L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3148L": {"P1": ["CT", 3.06, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO3149L": {"P1": ["CT", 4.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3150L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3151L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3152L": {"P1": ["CT", 4.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3153L": {"P1": ["CT", 6.75, 150, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.25, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3154L": {"P1": ["CT", 5.4, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.6, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3155L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 0, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3156L": {"P1": ["CT", 3.06, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO3157L": {"P1": ["CT", 3.06, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "BIO3158L": {"P1": ["CT", 5.4, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "BIO3159L": {"P1": ["CT", 3.0, 90, 90, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "BIO3160L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3161L": {"P1": ["CT", 3.6, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3162L": {"P1": ["CT", 4.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO3163L": {"P1": ["CT", 2.1, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3164L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "BIO3165L": {"P1": ["CT", 1.2, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "BIO3166L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "BIO3167L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3168L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3169L": {"P1": ["CT", 1.05, 45, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.95, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "BIO3170L": {"P1": ["CT", 3.0, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3171L": {"P1": ["CT", 2.01, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3172L": {"P1": ["CT", 1.5, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3174L": {"P1": ["CT", 45.0, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 55.0, 0, 0, "?/"]}, "BIO3175L": {"P1": ["CT", 2.01, 90, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 0.99, 60, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3176L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3177L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3178L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3179L": {"P1": ["CT", 2.25, 90, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "BIO3180L": {"P1": ["CT", 2.25, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "BIO3181L": {"P1": ["CT", 3.0, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3182L": {"P1": ["CT", 2.1, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "BIO3184L": {"P1": ["CT", 100.0, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "BIO3185L": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIO3186L": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "BIOLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "BIOLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "C1BUE11": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "C1BUE12": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "C1BUE13": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE14": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE21": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C1BUE22": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C1BUE23": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE24": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C1BUE31": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE32": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE33": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C1BUE34": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C1BUE35": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C1BUE41": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE42": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE43": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C1BUE44": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C1BUE45": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C1BUE52": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE53": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "C1BUE54": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C1BUE55": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C1BUE62": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "C1BUE63": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "C1BUE64": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "C1BUE65": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE11": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE12": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE13": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE14": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE21": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE22": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE23": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE24": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE31": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE32": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE33": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE34": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE411": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE412": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE421": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE422": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "C2BUE431": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE432": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE44": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "C2BUE511": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "C2BUE512": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "C2BUE521": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "C2BUE532": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "C2BUE611": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "C2BUE612": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "C2BUE621": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "C2BUE632": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "C3BUE11": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C3BUE12": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C3BUE13": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C3BUE21": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C3BUE22": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C3BUE23": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C3BUE31": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE32": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE33": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE341": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE342": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE351": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE352": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE41": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE42": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE43": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE441": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE442": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE451": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE452": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE511": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE512": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE521": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE522": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE531": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE532": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE541": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE542": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE551": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE552": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE611": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE612": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE621": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE622": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE631": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE632": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE641": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE642": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE651": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C3BUE652": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "C4BUE11": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE12": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE13": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE14": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE15": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE16": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE21": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE22": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE23": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE24": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE25": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE26": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE311": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE321": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE331": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE341": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE351": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE361": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE411": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE421": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE431": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE441": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE451": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE461": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "C4BUE511": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE512": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE521": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE522": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE561": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE562": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE611": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE621": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "C4BUE661": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "CH201MXN": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CH202MXN": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CH203MXN": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CH204MXN": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1000E": {"P3": ["CCI", 10.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM1006P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1007P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM1008L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1008P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1009L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1009P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM1010L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM1011L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1012L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1013L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1014L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1015L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1016L": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM1017L": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM1018L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.75, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "CHM1019L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.75, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "CHM1021P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1022P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1023P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1024P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "CHM1025P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1026P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1027M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1027P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "CHM1028P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM1029M": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "CHM1029P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM1030P": {"P1": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 6.0, 0, 0, "?/"], "P4": ["CT", 4.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM1031P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1033P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1034P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "CHM1035P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "CHM1036P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "CHM1037P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "CHM1038P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "CHM1039M": {"P1": ["CT", 2.25, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "CHM1039P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1043M": {"P1": ["CT", 2.25, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "CHM1045M": {"P1": ["CT", 2.25, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1052M": {"P1": ["CT", 4.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "CHM1062M": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "CHM1063M": {"P1": ["CT", 1.11, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.78, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.11, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "CHM1100M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM1127M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1138M": {"P1": ["CT", 30.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1140M": {"P1": ["CT", 30.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1141M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1142M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1181M": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "CHM1182M": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "CHM1183M": {"P1": ["CT", 2.01, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "CHM1185M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1189M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1193M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1196M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1197M": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 78, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1198M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1207M": {"P1": ["CT", 1.05, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"], "P4": ["CT", 1.05, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1208M": {"P1": ["CT", 3.0, 5, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1211M": {"P1": ["CT", 0.9, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 0.9, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1212M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM1214M": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM1226M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1233M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1234M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1237M": {"P1": ["CT", 12.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1238M": {"P1": ["CT", 21.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1239M": {"P1": ["CT", 30.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1241M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1242M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1243M": {"P1": ["CT", 2.01, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "CHM1246M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1253M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1256M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1257M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1258M": {"P1": ["CT", 2.25, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "CHM1265M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "CHM1266M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "CHM1267M": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "CHM1268M": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "CHM1270M": {"P3": ["CCI", 3.0, 0, 60, "?/"]}, "CHM1271M": {"P3": ["CCI", 3.0, 0, 60, "?/"]}, "CHM1273M": {"P3": ["CCI", 3.0, 0, 60, "?/"]}, "CHM1274M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "CHM1276M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1277M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1278M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1279M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1280M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1281M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1282M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1283M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1284M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1285M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM1286M": {"P1": ["CT", 2.01, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1287M": {"P1": ["CT", 2.01, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 15, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1288M": {"P1": ["CT", 3.96, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.04, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1289M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM1290M": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM1291M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1292M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1293M": {"P1": ["CT", 6.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM1295M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1296M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1297M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1298M": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1299M": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM1300M": {"P1": ["CT", 2.1, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.1, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1301M": {"P1": ["CT", 1.11, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.78, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.11, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "CHM1302M": {"P1": ["CT", 1.5, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM1303M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "CHM1304M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1305M": {"P1": ["CT", 1.05, 45, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.05, 45, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1306M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "CHM1307M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1308M": {"P1": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "CHM1309M": {"P1": ["CT", 3.0, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 1, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM1310M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1311M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1313M": {"P1": ["CT", 75.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 25.0, 180, 180, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "CHM1314M": {"P1": ["CT", 75.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 25.0, 0, 0, "?/"]}, "CHM1315M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1317M": {"P1": ["CT", 2.1, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "CHM1319M": {"P1": ["CT", 4.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM1320M": {"P1": ["CT", 4.5, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM1321M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM1322M": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.99, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM1323M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM1324M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1325M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1326M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1327M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM1328M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1329M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1330M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1331M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1332M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1333M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1334M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1335M": {"P1": ["CT", 2.55, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.45, 0, 0, "?/"]}, "CHM1336M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1337M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1338M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1339M": {"P1": ["CT", 2.25, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "CHM1340M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1341M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1342M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM1343M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM2001M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2002L": {"P1": ["CT", 2.4, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "CHM2002M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2002P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2003P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM2004P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2005P": {"P1": ["CT", 9.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 6.0, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2006M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2007M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2008L": {"P3": ["CCI", 6.0, 0, 120, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM2009M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2009P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "CHM2010P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2011P": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2012L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2013L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2015P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM2016L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM2016P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2017P": {"P1": ["CT", 5.1, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 4.95, 0, 0, "?/"], "P4": ["CT", 4.95, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2018L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "CHM2018P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2019L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "CHM2019P": {"P1": ["CT", 5.25, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 4.5, 0, 0, "?/"], "P4": ["CT", 5.25, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2020M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2021M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2022L": {"P1": ["CT", 4.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "CHM2022M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2023L": {"P1": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.1, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "CHM2023M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2024L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 120, 120, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "CHM2025L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM2025M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2026L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2026M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2027L": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2027M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "CHM2028M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2029M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2030M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2031M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2032M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2036M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2037M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2043M": {"P1": ["CT", 2.1, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2050M": {"P1": ["CT", 1.5, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.75, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.75, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2053M": {"P1": ["CT", 1.11, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.39, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2059M": {"P1": ["CT", 2.25, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "CHM2060M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2061M": {"P1": ["CT", 6.0, 135, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM2067M": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "CHM2124M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2131M": {"P1": ["CT", 30.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM2160M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2161M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2162M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2165M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2166M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2167M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2168M": {"P1": ["CT", 3.0, 120, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "CHM2169M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2175M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2189M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2190M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2202M": {"P1": ["CT", 30.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM2217M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2233M": {"P1": ["CT", 27.0, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2235M": {"P1": ["CT", 27.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2236M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2238M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2239M": {"P1": ["CT", 27.0, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2240M": {"P1": ["CT", 2.25, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2242M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2243M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2244M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2245M": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM2246M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2247M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2248M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2249M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2250M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2251M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2252M": {"P1": ["CT", 27.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2253M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2276M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM2281M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2283M": {"P1": ["CT", 1.8, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM2284M": {"P1": ["CT", 4.95, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 5.1, 0, 0, "?/"], "P4": ["CT", 4.95, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM2290M": {"P1": ["CT", 3.0, 90, 0, "Mise en situation (stage, simulation de situations...)/"]}, "CHM2296M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2297M": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2298M": {"P1": ["CT", 4.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2299M": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2300M": {"P1": ["CT", 2.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2301M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2302M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2304M": {"P1": ["CT", 3.0, 240, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM2308M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM2309M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2311M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.8, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2312M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2313M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM2314M": {"P1": ["CT", 4.95, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 5.1, 0, 0, "?/"], "P4": ["CT", 4.95, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM2315M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM2316M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "CHM2318M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "CHM2324M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2325M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2327M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "CHM2328M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2330M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2331M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2332M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2333M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2334M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2335M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2336M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2337M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2338M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2339M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2340M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2341M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2342M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2343M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2344M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2345M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "CHM2347M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2349M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2352M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2354M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2356M": {"P1": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2357M": {"P1": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2358M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2359M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2360M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM2361M": {"P1": ["CT", 1.5, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2362M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2363M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2364M": {"P1": ["CT", 27.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "CHM2365M": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM2366M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2367M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHM2368M": {"P1": ["CT", 10.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 10.5, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM2369M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "CHM2370M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "CHM2371M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2373M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2375M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM2376M": {"P1": ["CT", 3.0, 100, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "CHM2377M": {"P1": ["CT", 6.3, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 2.7, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "CHM2379M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "CHM2380M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2381M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2382M": {"P1": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2383M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2384M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2385M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM2386M": {"P1": ["CT", 1.8, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2389M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM2390M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2391M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2392M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2393M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2394M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2395M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2396M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2397M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2398M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2399M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2400M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2401M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2402M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2403M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2404M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2405M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2406M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2407M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2408M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM2409M": {"P1": ["CT", 13.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 13.5, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "CHM3001L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3004L": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.99, 60, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3006L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3015L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3017L": {"P1": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3021L": {"P1": ["CT", 3.0, 90, 90, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "CHM3023L": {"P1": ["CT", 3.3, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "CHM3032L": {"P1": ["CT", 9.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3036L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3060L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM3064L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3065L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3066L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3068L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM3070L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3071L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM3072L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3073L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3074L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3075L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3078L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3080L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM3082L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3087L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM3089L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3090L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3091L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3092L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3093L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3094L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM3095L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM3096L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3097L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3098L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3099L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3100L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3101L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "CHM3102L": {"P1": ["CT", 2.1, 45, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.1, 45, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3103L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3104L": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3105L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "CHM3106L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3107L": {"P3": ["CCI", 6.0, 0, 120, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3108L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3109L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3111L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM3112L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3113L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3114L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3115L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM3116L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "CHM3117L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3118L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3119L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3120L": {"P1": ["CT", 5.4, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "CHM3121L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3122L": {"P1": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "CHM3123L": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "CHM3124L": {"P1": ["CT", 3.6, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "CHM3125L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "CHM3126L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "CHMLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHMLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHMLG04M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHMLG05M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "CHMLG06M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ES03201E": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ES03202E": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ES03203E": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ES03204E": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "ES8100E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8101E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8103E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8104E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8105E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8106E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8107E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8108E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8109E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8110E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8111E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8112E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8200E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8201E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8203E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8204E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8205E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8206E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8207E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8208E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8209E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8210E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8211E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8212E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8300E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8301E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8303E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8304E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8305E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8306E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8307E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8308E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8309E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8310E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8311E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8312E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8400E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8401E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8403E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8404E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8405E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8406E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8407E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8408E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8409E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8410E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8411E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8412E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8500E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8501E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8503E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8504E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8505E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8506E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8507E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8508E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8509E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8510E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8511E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8512E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8600E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8601E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8603E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8604E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8605E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8606E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8607E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8608E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8609E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8610E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8611E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES8612E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9100E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9101E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9102E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9103E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9104E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9105E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9106E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9200E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9201E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9202E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9203E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9204E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9205E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9206E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9300E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9301E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9302E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9303E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9304E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9305E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9306E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9400E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9401E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9402E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9403E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9404E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9405E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9406E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9600E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9601E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9602E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9603E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9604E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9605E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ES9606E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2201E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2202E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2203E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2204E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2205E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2800E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2801E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2802E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "ESP2803E": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "GE229MXC": {"P1": ["CT", 2.1, 120, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "GE230MXC": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "GE231MXC": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "GE232MXC": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "GE233MXC": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "GEP1000E": {"P3": ["CCI", 10.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "GEP1002L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "GEP1003L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "GEP1004L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "GEP1051M": {"P1": ["CT", 1.65, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "GEP1074M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP1075M": {"P1": ["CT", 3.3, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "GEP1076M": {"P1": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "GEP1078M": {"P1": ["CT", 1.65, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "GEP1127M": {"P1": ["CT", 2.4, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "GEP1128M": {"P1": ["CT", 3.3, 150, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "GEP1133M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP1134M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.02, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 0.6, 0, 0, "?/"], "P4": ["CT", 1.38, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "GEP1135M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP1163M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP1169M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "GEP1171M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP1175M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "GEP1177M": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.35, 90, 60, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "GEP1178M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP1179M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP1180M": {"P1": ["CT", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.9, 0, 0, "?/"], "P4": ["CT", 0.9, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "GEP1181M": {"P1": ["CT", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "GEP1182M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP1183M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP1184M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP1185M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP1186M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP1187M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP1188M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP1189M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP1190M": {"P1": ["CT", 3.96, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.04, 0, 0, "?/"]}, "GEP1191M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP1192M": {"P1": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP2001L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.02, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.98, 90, 90, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "GEP2003L": {"P1": ["CT", 3.96, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.04, 0, 0, "?/"]}, "GEP2004L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "GEP2013L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.98, 80, 80, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "GEP2014L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "GEP2016M": {"P1": ["CT", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "GEP2026M": {"P1": ["CT", 2.25, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "GEP2053M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP2063M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "GEP2184M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP2186M": {"P1": ["CT", 4.02, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "GEP2193M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP2195M": {"P1": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP2198M": {"P1": ["CT", 1.65, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "GEP2208M": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP2264M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP2277M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "GEP2278M": {"P1": ["CT", 1.5, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "GEP2280M": {"P1": ["CT", 1.02, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 0.99, 0, 0, "?/"], "P4": ["CT", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "GEP2281M": {"P1": ["CT", 24.0, 60, 0, "Mise en situation (stage, simulation de situations...)/"]}, "GEP2282M": {"P1": ["CT", 1.65, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "GEP2291M": {"P1": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP2293M": {"P1": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP2311M": {"P1": ["CT", 3.0, 120, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "GEP2353M": {"P1": ["CT", 24.0, 60, 0, "Mise en situation (stage, simulation de situations...)/"]}, "GEP2355M": {"P1": ["CT", 3.6, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "GEP2358M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "GEP2359M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP2361M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEP2365M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "GEP2366M": {"P1": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "GEP2367M": {"P1": ["CT", 2.1, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "GEP2369M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP2370M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP2371M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP2372M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP2374M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP2376M": {"P1": ["CT", 2.01, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP3002L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP3005L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "GEP3006L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "GEP3018L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "GEP3019L": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "GEP3029L": {"P3": ["CCI", 6.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "GEP3032L": {"P1": ["CT", 3.3, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.62, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.08, 0, 0, "?/"]}, "GEP3033L": {"P3": ["CCI", 3.0, 0, 30, "?/Ensemble d'\u00e9preuves diverses"]}, "GEP3036L": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "GEP3038L": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP3039L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP3040L": {"P1": ["CT", 4.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "GEP3041L": {"P1": ["CT", 2.4, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "GEP3042L": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "GEP3043L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "GEP3044L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.05, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.45, 0, 0, "?/"]}, "GEP3045L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "GEP3046L": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "GEP3047L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "GEPLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "GEPLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1086M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1087M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1088M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1089M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1090M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1091M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1092M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1093M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1094M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1095M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1096M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1097M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1098M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1099M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1100M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1101M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1102M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1103M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1104M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1105M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1106M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1107M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1108M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1109M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1110M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1111M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1112M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1113M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1114M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1115M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1116M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1117M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1118M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1119M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1120M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1121M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1122M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1123M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1124M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1125M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1126M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1127M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1128M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1129M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1130M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1131M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1132M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1133M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1134M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1135M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1136M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1137M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1138M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1139M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1140M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1141M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1142M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1143M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1144M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1145M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1146M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1147M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1148M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1149M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1150M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1151M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1152M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1153M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1154M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1155M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1156M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1157M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1158M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1159M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1160M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1161M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1162M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1163M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1164M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1165M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1166M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1167M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1168M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1169M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1170M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1171M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1172M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1173M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1174M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1175M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1176M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1177M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1178M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1179M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1180M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1181M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1182M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1183M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1184M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1185M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1186M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1187M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1188M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1189M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1190M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1191M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1192M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1193M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1194M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1195M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1196M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1197M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1198M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1199M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1200M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1201M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1202M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1203M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1204M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1205M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1206M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1207M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1208M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1209M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1210M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1211M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1212M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1213M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1214M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1215M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1216M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1217M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1218M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1219M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1220M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1221M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1222M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1223M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1224M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1225M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1226M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1227M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1228M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1229M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1230M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1231M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1232M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1233M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1234M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1235M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1236M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1237M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1238M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1239M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1240M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1241M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1242M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1243M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1244M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1245M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1246M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1247M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1248M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1249M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1250M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1251M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1252M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1253M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1254M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1255M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1256M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1257M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1258M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1259M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1260M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1261M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1262M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1263M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1264M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1265M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1266M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1267M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1268M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1269M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1270M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1271M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1272M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1273M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1274M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1275M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1276M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1277M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1278M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1279M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1280M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1281M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1282M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1283M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1284M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1285M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1286M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1287M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1288M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1289M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1290M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1291M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1292M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1293M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1294M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1295M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1296M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1297M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1298M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1299M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1300M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1301M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1302M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1303M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1304M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1305M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1306M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1307M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1308M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1309M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1310M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1311M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1312M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1313M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1314M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1315M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1316M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1317M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1318M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1319M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1320M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1321M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1322M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1323M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1324M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1325M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1326M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1327M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1328M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1329M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1330M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1331M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1332M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1333M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1334M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1335M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1336M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1337M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1338M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1339M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1340M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1341M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1342M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1343M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1344M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1345M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1346M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1347M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1348M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1349M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1350M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1351M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1352M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1353M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1354M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1355M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1356M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1357M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1358M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1359M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1360M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1361M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1362M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1363M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1364M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1365M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1366M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1367M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1368M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1369M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1370M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1371M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1372M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1373M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1374M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1375M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1376M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1377M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1378M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1379M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1380M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1381M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL1382M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1383M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL1384M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1385M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "ICL1386M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1387M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1388M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1389M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1390M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1391M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1392M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1393M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL1394M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1395M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1396M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1397M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL1398M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1399M": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "ICL1400M": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "ICL1401M": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "ICL1402M": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "ICL1403M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL1404M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2224M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2225M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2226M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2227M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2228M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2229M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2230M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2231M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2232M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2233M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2234M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2235M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2236M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2237M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2238M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2239M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2240M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2241M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2242M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2243M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2244M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2245M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2246M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2247M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2248M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2249M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2250M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2251M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2252M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2253M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2254M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2255M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2256M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2257M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2258M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2259M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2260M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2261M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2262M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2263M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2264M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2265M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2266M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2267M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2268M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2269M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2270M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2271M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2272M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2273M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2274M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2275M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2276M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2277M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2278M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2279M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2280M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2281M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2282M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2283M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2284M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2285M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2286M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2287M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2288M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2289M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2290M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2291M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2292M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2293M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2294M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2295M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2296M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2297M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2298M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2299M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2300M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2301M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2302M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2303M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2304M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2305M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2306M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2307M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2308M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2309M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2310M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2311M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2312M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2313M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2314M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2315M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2316M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2317M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2318M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2319M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2320M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2321M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2322M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2323M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2324M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2325M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2326M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2327M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2328M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2329M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2330M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2331M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2332M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2333M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2334M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2335M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2336M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2337M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2338M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2339M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2340M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2341M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2342M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2343M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2344M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2345M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2346M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2347M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2348M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2349M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2350M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2351M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2352M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2353M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2354M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2355M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2356M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2357M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2358M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2359M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2360M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2361M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2362M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2363M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2364M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2365M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2366M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2367M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2368M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2369M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2370M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2371M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2372M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2373M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2374M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2375M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2376M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2377M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2378M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2379M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2380M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2381M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2382M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2383M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2384M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2385M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2386M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2387M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2388M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2389M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2390M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2391M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2392M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2393M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2394M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2395M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2396M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2397M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2398M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2399M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2400M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2401M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2402M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2403M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2404M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2405M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2406M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2407M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2408M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2409M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2410M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2411M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2412M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2413M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2414M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2415M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2416M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2417M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2418M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2419M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2420M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2421M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2422M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2423M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2424M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2425M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2426M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2427M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2428M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2429M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2430M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2431M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2432M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2433M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2434M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2435M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2436M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2437M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2438M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2439M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2440M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2441M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2442M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2443M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2444M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2445M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2446M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2447M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2448M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2449M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2450M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2451M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2452M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2453M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2454M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2455M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2456M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2457M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2458M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2459M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2460M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2461M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2462M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2463M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2464M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2465M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2466M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2467M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2468M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2469M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2470M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2471M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2472M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2473M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2474M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2475M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2476M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2477M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2478M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2479M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2480M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2481M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2482M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2483M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2484M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2485M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2486M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2487M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2488M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2489M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2490M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2491M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2492M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2493M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2494M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2495M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2496M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2497M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2498M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2499M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2500M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2501M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2502M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2503M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2504M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2505M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2506M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2507M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2508M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2509M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2510M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2511M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2512M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2513M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2514M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2515M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2516M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2517M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2518M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2519M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2520M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2521M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2522M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2523M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2524M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2525M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2526M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2527M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2528M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2529M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2530M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2531M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2532M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2533M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2534M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2535M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2536M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2537M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2538M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2539M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2540M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2541M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2542M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2543M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2544M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2545M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2546M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2547M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2548M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2549M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2550M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2551M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2552M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2553M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2554M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2555M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2556M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2557M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2558M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2559M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2560M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2561M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2562M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2563M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2564M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2565M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "ICL2566M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2567M": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "ICL2568M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2569M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2570M": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "ICL2571M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ICL2572M": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "ICL2573M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2574M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2575M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2576M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "ICL2577M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL2578M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL2579M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2580M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "ICL2581M": {"P3": ["CCI", 20.0, 0, 0, "?/"]}, "ICL2582M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ICL2583M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IF100LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF101LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF102LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF103LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF104LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF105LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF106LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF200LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF201LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF201MXC": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "IF202LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF203LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF204LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF205LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF206LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF207LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF208LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF209LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF210LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF300LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF301LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF302LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF303LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF304LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF305LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF306LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF307LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF308LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF309LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF310LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF311LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF312LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF313LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF314LX9": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF315LX9": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IF316LXN": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IF317LXN": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IF318LXN": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IF319LXN": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IF320LXN": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "IF321LXN": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IF322LXN": {"P1": ["CT", 3.06, 120, 120, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IF323LXN": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IF324LXN": {"P3": ["CCI", 6.0, 0, 120, "?/Ensemble d'\u00e9preuves diverses"]}, "IF326LXN": {"P3": ["CCI", 6.0, 0, 120, "?/Ensemble d'\u00e9preuves diverses"]}, "IF327LXN": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "IF328LXN": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "IF329LXN": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INF1010L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1011L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1012L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1013L": {"P1": ["CT", 2.01, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.99, 0, 0, "Mise en situation (stage, simulation de situations...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1014L": {"P1": ["CT", 2.1, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "INF1015L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1087M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1088M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1089M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1091M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1092M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1094M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1096M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF1099M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1100M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1101M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1103M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1104M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1106M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1107M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF1109M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1112M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1113M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1114M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1115M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1116M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1117M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1151M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1158M": {"P1": ["CT", 3.6, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF1159M": {"P1": ["CT", 1.8, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF1160M": {"P1": ["CT", 3.6, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF1161M": {"P1": ["CT", 3.6, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF1162M": {"P1": ["CT", 3.6, 120, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF1163M": {"P3": ["CCI", 3.0, 0, 60, "?/"]}, "INF1164M": {"P1": ["CT", 3.6, 120, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF1165M": {"P1": ["CT", 1.8, 120, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF1166M": {"P1": ["CT", 1.8, 90, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF1167M": {"P1": ["CT", 1.8, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF1168M": {"P1": ["CT", 15.0, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INF1203M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1204M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "INF1205M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1207M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1208M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF1209M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF1211M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "INF1212M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF1215M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INF1217M": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "INF1218M": {"P1": ["CT", 4.02, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.98, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"]}, "INF2001M": {"P1": ["CT", 21.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "INF2012L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2013L": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2014M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2015L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2016L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "INF2020M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2023L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2028L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2030L": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2031L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2032L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2108M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2129M": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2163M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2166M": {"P3": ["CCI", 3.0, 0, 45, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2178M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2308M": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2310M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2315M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2316M": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "INF2317M": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "INF2319M": {"P1": ["CT", 2.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "INF2320M": {"P1": ["CT", 1.34, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.66, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2321M": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "INF2322M": {"P1": ["CT", 1.8, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2325M": {"P1": ["CT", 1.65, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "INF2326M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2333M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2346M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2347M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2351M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2352M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2353M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2354M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2355M": {"P1": ["CT", 1.5, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "INF2356M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2357M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2394M": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2396M": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2397M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2399M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2401M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2407M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2409M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "INF2417M": {"P1": ["CT", 2.1, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.9, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"]}, "INF2419M": {"P1": ["CT", 3.0, 240, 240, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "INF2424M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2428M": {"P1": ["CT", 3.6, 120, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2429M": {"P1": ["CT", 1.8, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2430M": {"P1": ["CT", 3.6, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2431M": {"P1": ["CT", 3.6, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2432M": {"P1": ["CT", 1.8, 60, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2433M": {"P3": ["CCI", 3.0, 0, 60, "?/"]}, "INF2434M": {"P1": ["CT", 1.8, 90, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2435M": {"P1": ["CT", 1.8, 120, 0, "Production audiovisuelle (vid\u00e9o...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2436M": {"P1": ["CT", 1.8, 90, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2437M": {"P1": ["CT", 24.0, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INF2467M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2468M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2469M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2470M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2471M": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2472M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2473M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2474M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2475M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2476M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2477M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2478M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2479M": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2480M": {"P1": ["CT", 1.53, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "INF2481M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2482M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2483M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2485M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF2487M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2488M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2492M": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2493M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "INF2494M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "INF2495M": {"P1": ["CT", 3.3, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "INF2497M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2498M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2499M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2501M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "INF2502M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INF2503M": {"P3": ["CCI", 21.0, 0, 0, "?/"]}, "INF2504M": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "INF2505M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "INF2506M": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF2508M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "INF2509M": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "INF2511M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "INF2512M": {"P1": ["CT", 1.65, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "INF3001L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3002L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3007L": {"P1": ["CT", 4.2, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3034L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3035L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3038L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3040L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3041L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3046L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3048L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "INF3050L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "INF3051L": {"P1": ["CT", 1.8, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 4.2, 0, 120, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "INF3054L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3055L": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "INF3056L": {"P3": ["CCI", 3.0, 0, 30, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3057L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "INF3058L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "INFLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INFLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INS1007M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INS1009M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "INS1012M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1013M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1014M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1015M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1016M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1017M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1018M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1019M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1020M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1021M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1022M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1023M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1024M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1025M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1026M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1027M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1028M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1029M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1030M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1031M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1032M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1033M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1034M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1052M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "INS1055M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1056M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1057M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1058M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1059M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1060M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1061M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1062M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1063M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1064M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1065M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1066M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1067M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1068M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1069M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1070M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1071M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1073M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1093M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1094M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1095M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1096M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1097M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1098M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1099M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1100M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1101M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1102M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1103M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1104M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1105M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1106M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1108M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1128M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1129M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1130M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1131M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1132M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1133M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1134M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1135M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1136M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1137M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1138M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1139M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1141M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1161M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1162M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1163M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1164M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1165M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1166M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1167M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1168M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1169M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1170M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1171M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1172M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1173M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1175M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1196M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1197M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1198M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1199M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1200M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1201M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1202M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1204M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1205M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1206M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1207M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1209M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1229M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1230M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1231M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1232M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1233M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1234M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1235M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1236M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1237M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1238M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1239M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1240M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1241M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1242M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1243M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1244M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1246M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1284M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1285M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1289M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1290M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1291M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1296M": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "INS1298M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1302M": {"P1": ["CT", 0.6, 60, 0, "Mise en situation (stage, simulation de situations...)/"], "P4": ["CT", 1.4, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "INS1306M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1307M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1308M": {"P1": ["CT", 100.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "INS1309M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1310M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1311M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1315M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1330M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1332M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1334M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1335M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1336M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1337M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1338M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1339M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1340M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1341M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1344M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1345M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1346M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1348M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1352M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1354M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1355M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1357M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1359M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1361M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1362M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS1363M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1364M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1371M": {"P1": ["CT", 0.6, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P4": ["CT", 1.4, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "INS1374M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1375M": {"P1": ["CT", 100.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "INS1377M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS1382M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "INS1385M": {"P1": ["CT", 30.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P4": ["CT", 70.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS2009M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "INS2010M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INS2012M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2013M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2014M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2015M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2016M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2017M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2018M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2019M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2020M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2021M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2022M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2023M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2024M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2025M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2026M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2027M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2028M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2029M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2030M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2031M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2049M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INS2052M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2053M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2054M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2055M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2056M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2057M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2058M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2059M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2060M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2061M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2062M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2063M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2064M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2065M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2066M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2067M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2068M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2070M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2088M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2089M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2090M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2091M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2092M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2093M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2094M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2095M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2096M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2097M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2099M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2103M": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "INS2104M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "INS2117M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2118M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2119M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2120M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2121M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2122M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2123M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2124M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2126M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2131M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INS2144M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2145M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2146M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2147M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2148M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2149M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2150M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2151M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2152M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2153M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2154M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2156M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2175M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2176M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2177M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2178M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2179M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2180M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2181M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2182M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2184M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2185M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2187M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2192M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INS2205M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2206M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2207M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2208M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2209M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2210M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2211M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2212M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2213M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2214M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2215M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2216M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2218M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2231M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "INS2245M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2246M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2247M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2251M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2263M": {"P1": ["CT", 1.4, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 0.6, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "INS2267M": {"P1": ["CT", 100.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "INS2269M": {"P1": ["CT", 100.0, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"]}, "INS2270M": {"P1": ["CT", 50.0, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS2271M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS2289M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2290M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2291M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2294M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2296M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2297M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2299M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2304M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2305M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2306M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2307M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2310M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2311M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "INS2314M": {"P1": ["CT", 100.0, 30, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS2315M": {"P1": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 50.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/"]}, "INS2325M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS2332M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS2333M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "INS2338M": {"P1": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 50.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH1001D": {"P1": ["CT", 4.2, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "IPH1001M": {"P1": ["CT", 5.04, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.96, 0, 0, "?/"]}, "IPH1002D": {"P1": ["CT", 4.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 4.5, 0, 0, "?/"]}, "IPH1003D": {"P1": ["CT", 4.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.0, 0, 0, "?/"]}, "IPH1004D": {"P1": ["CT", 10.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH1005D": {"P1": ["CT", 4.2, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "IPH1006D": {"P1": ["CT", 4.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "IPH1007D": {"P1": ["CT", 5.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH1008D": {"P1": ["CT", 2.4, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "IPH1009D": {"P1": ["CT", 10.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "IPH1046M": {"P1": ["CT", 4.02, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "IPH1047M": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "IPH1050M": {"P1": ["CT", 4.2, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "IPH1052M": {"P1": ["CT", 1.98, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 1.02, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IPH1053M": {"P1": ["CT", 2.1, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "IPH1058M": {"P1": ["CT", 2.1, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH1102M": {"P1": ["CT", 2.01, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "IPH1104M": {"P1": ["CT", 3.6, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "IPH1106M": {"P1": ["CT", 8.01, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "IPH1107M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH1108M": {"P1": ["CT", 1.74, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.26, 0, 0, "?/"]}, "IPH1115M": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "IPH1117M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH1118M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IPH1119M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IPH1120M": {"P1": ["CT", 1.8, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "IPH1121M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IPH1128M": {"P1": ["CT", 4.02, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "IPH1132M": {"P1": ["CT", 10.5, 30, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 4.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IPH1146M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1147M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1148M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1149M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1150M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1151M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1152M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1153M": {"P1": ["CT", 5.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH1154M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1155M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1156M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1157M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1158M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1159M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1165M": {"P1": ["CT", 2.4, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "IPH1167M": {"P1": ["CT", 2.01, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "IPH1168M": {"P1": ["CT", 2.25, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "IPH1169M": {"P1": ["CT", 4.5, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH1170M": {"P1": ["CT", 1.98, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "IPH1171M": {"P1": ["CT", 2.1, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "IPH1172M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IPH1173M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH1174M": {"P1": ["CT", 2.01, 20, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "IPH1175M": {"P1": ["CT", 2.1, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "IPH1176M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH1177M": {"P1": ["CT", 4.5, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "IPH1178M": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "IPH1179M": {"P1": ["CT", 4.5, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH1180M": {"P1": ["CT", 4.02, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "IPH1182M": {"P3": ["CCI", 9.0, 0, 135, "?/Ensemble d'\u00e9preuves diverses"]}, "IPH1183M": {"P1": ["CT", 10.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IPH1185M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH1187M": {"P1": ["CT", 3.0, 120, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2001D": {"P1": ["CT", 5.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "IPH2002D": {"P1": ["CT", 7.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2003D": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "IPH2004D": {"P1": ["CT", 10.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH2005D": {"P1": ["CT", 5.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "IPH2006D": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2007D": {"P1": ["CT", 8.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.0, 0, 0, "?/"]}, "IPH2008D": {"P1": ["CT", 8.0, 10, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 2.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "IPH2038M": {"P1": ["CT", 3.6, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "IPH2049M": {"P1": ["CT", 3.0, 40, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2133M": {"P1": ["CT", 3.0, 40, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2141M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2142M": {"P1": ["CT", 1.98, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "IPH2143M": {"P1": ["CT", 1.5, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "IPH2156M": {"P1": ["CT", 3.0, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2157M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "IPH2158M": {"P1": ["CT", 3.6, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "IPH2159M": {"P1": ["CT", 4.5, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "IPH2164M": {"P1": ["CT", 3.0, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2167M": {"P1": ["CT", 15.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH2180M": {"P1": ["CT", 3.06, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "IPH2181M": {"P1": ["CT", 4.59, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 4.41, 0, 0, "?/"]}, "IPH2182M": {"P1": ["CT", 5.94, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.06, 0, 0, "?/"]}, "IPH2183M": {"P1": ["CT", 3.96, 30, 30, "Mise en situation (stage, simulation de situations...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.04, 0, 0, "?/"]}, "IPH2188M": {"P1": ["CT", 3.0, 40, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2189M": {"P1": ["CT", 3.0, 40, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2192M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2193M": {"P1": ["CT", 5.94, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 3.06, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2194M": {"P1": ["CT", 3.06, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 5.94, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2195M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IPH2196M": {"P1": ["CT", 6.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2209M": {"P1": ["CT", 1.53, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "IPH2210M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2211M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2217M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2218M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2220M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2221M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2224M": {"P1": ["CT", 2.01, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "IPH2235M": {"P1": ["CT", 5.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2236M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2237M": {"P1": ["CT", 2.04, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.96, 0, 0, "?/"]}, "IPH2238M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2239M": {"P1": ["CT", 4.0, 30, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IPH2240M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2241M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2242M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2244M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2245M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2246M": {"P1": ["CT", 4.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2247M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2248M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "IPH2249M": {"P1": ["CT", 2.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "IPH2259M": {"P1": ["CT", 2.01, 120, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 0.99, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2261M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IPH2273M": {"P1": ["CT", 8.1, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "IPH2274M": {"P1": ["CT", 5.4, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.6, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2277M": {"P1": ["CT", 5.94, 0, 120, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.06, 0, 0, "?/"]}, "IPH2278M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2280M": {"P1": ["CT", 9.03, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 2.94, 0, 0, "?/"], "P4": ["CT", 9.03, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2281M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "IPH2283M": {"P1": ["CT", 4.5, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH2284M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IPH2286M": {"P1": ["CT", 10.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 10.5, 10, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2287M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IPH2297M": {"P1": ["CT", 1.65, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "IPH2298M": {"P1": ["CT", 2.01, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2299M": {"P1": ["CT", 3.0, 30, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"]}, "IPH2300M": {"P1": ["CT", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 0.9, 0, 0, "?/"], "P4": ["CT", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IPH2301M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2306M": {"P1": ["CT", 8.1, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "IPH2307M": {"P1": ["CT", 1.02, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.98, 30, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH2308M": {"P1": ["CT", 7.02, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "IPH2309M": {"P1": ["CT", 2.4, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "IPH2310M": {"P1": ["CT", 9.99, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P2": ["CP", 2.97, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P4": ["CT", 14.04, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IPH2311M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IPH2312M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IPH2313M": {"P1": ["CT", 3.96, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.04, 0, 0, "?/"]}, "IPH2314M": {"P1": ["CT", 3.0, 0, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2315M": {"P1": ["CT", 3.0, 0, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2316M": {"P1": ["CT", 5.94, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.06, 0, 0, "?/"]}, "IPH2317M": {"P1": ["CT", 6.0, 40, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2318M": {"P1": ["CT", 3.0, 40, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2319M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IPH2321M": {"P1": ["CT", 15.3, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 14.7, 0, 0, "?/"]}, "IPH2322M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2323M": {"P1": ["CT", 3.96, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.04, 0, 0, "?/"]}, "IPH2324M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2325M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "IPH2326M": {"P1": ["CT", 5.94, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.06, 0, 0, "?/"]}, "IPH2327M": {"P1": ["CT", 30.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2328M": {"P1": ["CT", 6.0, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2330M": {"P1": ["CT", 3.0, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2331M": {"P1": ["CT", 6.0, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "IPH2332M": {"P1": ["CT", 3.6, 60, 10, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "IPH2333M": {"P1": ["CT", 2.01, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "IPH2334M": {"P1": ["CT", 2.01, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "IPH2338M": {"P1": ["CT", 30.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IPH2340M": {"P1": ["CT", 30.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IPH2341M": {"P1": ["CT", 4.2, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPH2342M": {"P1": ["CT", 2.4, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "IPH2343M": {"P1": ["CT", 7.92, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 4.08, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 4.08, 0, 0, "?/"], "P4": ["CT", 7.92, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "IPHLG01M": {"P3": ["CCI", 3.0, 0, 30, "?/Ensemble d'\u00e9preuves diverses"]}, "IPHLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IUA1001P": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "IUA1002P": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "IUA1004P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "IUA1011P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUA1013P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUA1022P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUA1031P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUA1032P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUA1034P": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "IUA1041P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUA1042P": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "IUA1043P": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "IUA1052P": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "IUA1102P": {"P3": ["CCI", 17.0, 0, 0, "?/"]}, "IUA1103P": {"P3": ["CCI", 13.0, 0, 0, "?/"]}, "IUA1111P": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "IUA1112P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUA1151P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUA1152P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUA1153P": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "IUA1192P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "IUA1193P": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "IUA1194P": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "IUA1212P": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "IUA1213P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUA1214P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "IUA1230P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "IUA1231P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUA1232P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUA1233P": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "IUA1234P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "IUA1235P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "IUA1236P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 50, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUA1237P": {"P1": ["CT", 7.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 7.5, 50, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUA2003P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2005P": {"P1": ["CT", 2.4, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2006P": {"P1": ["CT", 6.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 3.0, 0, 0, "?/"], "P4": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2014P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2025P": {"P1": ["CT", 3.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2026P": {"P1": ["CT", 4.95, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 5.1, 0, 0, "?/"], "P4": ["CT", 4.95, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2033P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2035P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUA2036P": {"P1": ["CT", 7.5, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 7.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2044P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2045P": {"P1": ["CT", 1.56, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.94, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2046P": {"P1": ["CT", 3.9, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2055P": {"P1": ["CT", 1.56, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.94, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2056P": {"P1": ["CT", 3.9, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2101P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2104P": {"P1": ["CT", 1.56, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.94, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2105P": {"P1": ["CT", 3.9, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2113P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2114P": {"P1": ["CT", 1.56, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.94, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2115P": {"P1": ["CT", 3.9, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2154P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2155P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2156P": {"P1": ["CT", 5.1, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 4.95, 0, 0, "?/"], "P4": ["CT", 4.95, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2191P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2195P": {"P1": ["CT", 1.98, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.04, 0, 0, "?/"], "P4": ["CT", 1.98, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUA2196P": {"P1": ["CT", 3.9, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2211P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUA2212P": {"P1": ["CT", 2.4, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUA2213P": {"P1": ["CT", 3.0, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 6.0, 0, 0, "?/"], "P4": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB1001P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUB1002P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1003P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1004P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1011P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUB1012P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUB1021P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1023P": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "IUB1024P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1031P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1032P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1033P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1034P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "IUB1042P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUB1043P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUB1052P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUB1053P": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "IUB1111P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUB1112P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUB1113P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUB1114P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1121P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1122P": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "IUB1123P": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "IUB1131P": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "IUB1132P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1133P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUB1152P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUB1153P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUB1161P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1162P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1163P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1164P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1165P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1172P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUB1173P": {"P3": ["CCI", 18.0, 0, 0, "?/"]}, "IUB1181P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUB1182P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1183P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1184P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1185P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1186P": {"P1": ["CT", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB1187P": {"P1": ["CT", 3.9, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB1191P": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "IUB1192P": {"P3": ["CCI", 14.0, 0, 0, "?/"]}, "IUB1193P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUB1194P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1195P": {"P1": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB1196P": {"P1": ["CT", 3.9, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB1201P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "IUB1202P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB1203P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "IUB1204P": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "IUB1205P": {"P1": ["CT", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB1206P": {"P1": ["CT", 3.9, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2005P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2006P": {"P1": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "IUB2007P": {"P1": ["CT", 4.5, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 3.0, 0, 0, "?/"], "P4": ["CT", 7.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2013P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2014P": {"P1": ["CT", 2.04, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.98, 0, 0, "?/"], "P4": ["CT", 1.98, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2015P": {"P1": ["CT", 3.9, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2022P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2025P": {"P1": ["CT", 3.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2026P": {"P1": ["CT", 3.9, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2035P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2036P": {"P1": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2037P": {"P1": ["CT", 4.35, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 6.3, 0, 0, "?/"], "P4": ["CT", 4.35, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2041P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2044P": {"P1": ["CT", 6.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUB2045P": {"P1": ["CT", 15.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUB2051P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2054P": {"P1": ["CT", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2055P": {"P1": ["CT", 4.5, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 6.0, 0, 0, "?/"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2115P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2116P": {"P1": ["CT", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2117P": {"P1": ["CT", 3.9, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2124P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2125P": {"P1": ["CT", 1.56, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.94, 0, 0, "?/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2126P": {"P1": ["CT", 3.9, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2134P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2135P": {"P1": ["CT", 3.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2136P": {"P1": ["CT", 4.5, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 6.0, 0, 0, "?/"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2151P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2154P": {"P1": ["CT", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 4.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2155P": {"P1": ["CT", 4.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 3.0, 0, 0, "?/"], "P4": ["CT", 7.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2166P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2167P": {"P1": ["CT", 1.98, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.04, 0, 0, "?/"], "P4": ["CT", 1.98, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2168P": {"P1": ["CT", 4.95, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 5.1, 0, 0, "?/"], "P4": ["CT", 4.95, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2171P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUB2174P": {"P1": ["CT", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUB2175P": {"P1": ["CT", 4.5, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 6.0, 0, 0, "?/"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUC1021P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUC1022P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUC1023P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUC1051P": {"P3": ["CCI", 12.0, 0, 0, "?/"]}, "IUC1052P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUC1053P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUC1054P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "IUC1061P": {"P3": ["CCI", 13.0, 0, 0, "?/"]}, "IUC1062P": {"P3": ["CCI", 17.0, 0, 0, "?/"]}, "IUC2024P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUC2025P": {"P1": ["CT", 3.0, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUC2026P": {"P1": ["CT", 4.05, 35, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 6.9, 0, 0, "?/"], "P4": ["CT", 4.05, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUC2054P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUC2055P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 50, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUC2056P": {"P1": ["CT", 7.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 7.5, 50, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUC2063P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "IUC2064P": {"P1": ["CT", 6.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "IUC2065P": {"P1": ["CT", 3.9, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 7.35, 0, 0, "?/"], "P4": ["CT", 3.75, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "IUT1001M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUT1002M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUT1003M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUT1004M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUT1005M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "IUT1006M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "IUT2001M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "LE201MXC": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "LE202MXC": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "LE203MXC": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "LE204MXC": {"P1": ["CT", 2.01, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "LEPS01E": {"P1": ["CT", 5.6, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS02E": {"P1": ["CT", 4.9, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.1, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS03E": {"P1": ["CT", 2.1, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS04E": {"P1": ["CT", 2.1, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS05E": {"P1": ["CT", 4.9, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.1, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS06E": {"P1": ["CT", 4.0, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS07E": {"P1": ["CT", 4.0, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS08E": {"P1": ["CT", 4.0, 45, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS11E": {"P3": ["CCI", 1.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "LEPS12E": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "LEPS21E": {"P1": ["CT", 100.0, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS22E": {"P1": ["CT", 100.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS23E": {"P1": ["CT", 100.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS24K": {"P1": ["CT", 100.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "LEPS24M": {"P1": ["CT", 100.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1005L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1049L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1051L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1052L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1053L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1054L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1055L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1056L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1057L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1058L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1060L": {"P3": ["CCI", 6.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "MAT1061L": {"P3": ["CCI", 6.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "MAT1062L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1063L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1065L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1066L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1067L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1068L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1068M": {"P1": ["CT", 3.6, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MAT1069L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1070L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1070M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MAT1074L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1075L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1109M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1111M": {"P1": ["CT", 3.06, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT1113M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "MAT1114M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1115M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1219M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1256M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT1260M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1267M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1269M": {"P1": ["CT", 3.6, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MAT1270M": {"P1": ["CT", 6.0, 40, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT1275M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT1276M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT1277M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT1287M": {"P1": ["CT", 3.6, 180, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MAT1288M": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MAT1289M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT1290M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT1291M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT1293M": {"P1": ["CT", 6.0, 90, 90, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1295M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT1296M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1305M": {"P1": ["CT", 1.5, 120, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P4": ["CT", 1.5, 120, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "MAT1306M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT1313M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "MAT1316M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT1317M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT1318M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT1319M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1320M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1321M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1322M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1323M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1324M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1325M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1326M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1327M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1328M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1329M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1330M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1331M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1332M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1333M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1334M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1335M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT1336M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1337M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.2, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1338M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT1339M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1340M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.5, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1341M": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 2.4, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT1342M": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT1343M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT1344M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "MAT1345M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1347M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1348M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT1349M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT1350M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT1351M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT1352M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MAT1354M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT1356M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT1357M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.2, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT1359M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1360M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1361M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1362M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1364M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1365M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1366M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1367M": {"P1": ["CT", 1.5, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT1369M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1370M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1372M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1373M": {"P1": ["CT", 1.2, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.6, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT1374M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1375M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1376M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT1377M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.5, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT1378M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2007L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT2012L": {"P1": ["CT", 3.3, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.7, 80, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2013L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2027L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2071L": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "MAT2072L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2074L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2075L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2078L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2079L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2084L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2085L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2086L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2087L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2090L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2091L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2092L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2093L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2094L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2095L": {"P1": ["CT", 4.8, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2096L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2097L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "MAT2434M": {"P1": ["CT", 21.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT2435M": {"P1": ["CT", 1.5, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2446M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MAT2449M": {"P1": ["CT", 21.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT2459M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MAT2460M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MAT2466M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MAT2470M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2471M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2474M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2475M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2476M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "MAT2477M": {"P1": ["CT", 3.06, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.94, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2478M": {"P1": ["CT", 3.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "MAT2479M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2480M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2481M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2482M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2483M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2484M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "MAT2485M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2486M": {"P1": ["CT", 3.6, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2487M": {"P1": ["CT", 6.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2488M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT2489M": {"P1": ["CT", 3.6, 180, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MAT2491M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT2493M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2494M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2503M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "MAT2504M": {"P1": ["CT", 2.04, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "MAT2505M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2506M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2507M": {"P1": ["CT", 4.02, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2508M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT2509M": {"P1": ["CT", 4.02, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2510M": {"P1": ["CT", 3.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2511M": {"P1": ["CT", 6.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2520M": {"P1": ["CT", 3.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2521M": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2522M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT2527M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "MAT2530M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2531M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2532M": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2533M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2534M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2535M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2536M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2537M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2538M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2539M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2540M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2541M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2542M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2543M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2544M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2545M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MAT2546M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2548M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT2549M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2550M": {"P1": ["CT", 3.6, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MAT2551M": {"P1": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2553M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2554M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2555M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2556M": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2557M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2558M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2559M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2560M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2561M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2562M": {"P1": ["CT", 1.02, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "MAT2563M": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT2564M": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT2565M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.2, 120, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"]}, "MAT2566M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MAT2567M": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT2568M": {"P1": ["CT", 3.0, 150, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2569M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MAT2570M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MAT2571M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2572M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2573M": {"P1": ["CT", 3.0, 150, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2574M": {"P1": ["CT", 3.0, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MAT2575M": {"P1": ["CT", 1.5, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT2576M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 60, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MAT2577M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MAT2578M": {"P1": ["CT", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT2588M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MAT2589M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MAT2590M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MAT2591M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MAT2596M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT2597M": {"P1": ["CT", 12.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 8.4, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MAT2598M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT2599M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MAT3010L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3116L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3120L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT3126L": {"P1": ["CT", 3.6, 150, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "MAT3141L": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "MAT3143L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3144L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3145L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3146L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3147L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3148L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3149L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3150L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT3151L": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT3152L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MAT3153L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3154L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3155L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3156L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3157L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3159L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3161L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT3162L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3164L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MAT3166L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3168L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3169L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3170L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "MAT3171L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3174L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "MAT3175L": {"P3": ["CCI", 9.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "MAT3176L": {"P1": ["CT", 9.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MAT3177L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MAT3178L": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MATLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MATLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ME101MX2": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "ME201MXC": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "ME202MXC": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "ME203MXC": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "ME212MX2": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1000E": {"P3": ["CCI", 10.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC1001L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC1001P": {"P3": ["CCI", 7.0, 0, 0, "?/"]}, "MGC1006P": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1007P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1008P": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "MGC1009M": {"P1": ["CT", 2.22, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 1.98, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC1009P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MGC1010P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1011P": {"P1": ["CT", 3.6, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1012P": {"P1": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC1013P": {"P1": ["CT", 3.6, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1014P": {"P1": ["CT", 3.6, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1015P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MGC1016P": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1017M": {"P1": ["CT", 2.1, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1017P": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1018P": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1019P": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1020M": {"P1": ["CT", 2.4, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 2.1, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MGC1020P": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "MGC1021M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1023M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1024M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1036M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1037M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1048M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1052M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1055M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC1056M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1058M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1061M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1063M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1064M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC1065M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1067M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1068M": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC1069M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1071M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1075M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MGC1077M": {"P1": ["CT", 7.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 4.8, 0, 0, "?/"]}, "MGC1078M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1081M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1082M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1083M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1086M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1087M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1088M": {"P1": ["CT", 15.0, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC1090M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1092M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1094M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1096M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1098M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1100M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1101M": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC1103M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1104M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1106M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1107M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1108M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1109M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1110M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1111M": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC1112M": {"P1": ["CT", 4.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MGC1113M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1114M": {"P1": ["CT", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC1115M": {"P1": ["CT", 1.65, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "MGC1116M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1117M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC1118M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1119M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1120M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1122M": {"P1": ["CT", 4.8, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC1123M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1124M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1125M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1126M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1127M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC1129M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC1130M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2003P": {"P1": ["CT", 5.1, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P2": ["CP", 4.95, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P4": ["CT", 4.95, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC2004L": {"P3": ["CCI", 6.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC2004P": {"P3": ["CCI", 5.0, 0, 0, "?/"]}, "MGC2005L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC2005P": {"P3": ["CCI", 10.0, 0, 0, "?/"]}, "MGC2006P": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC2007P": {"P1": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC2008P": {"P1": ["CT", 5.4, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "MGC2009L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC2009P": {"P1": ["CT", 5.4, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "MGC2011L": {"P1": ["CT", 1.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.6, 0, 0, "?/"], "P4": ["CT", 1.2, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC2013L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC2014L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC2025L": {"P1": ["CT", 2.1, 90, 90, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P2": ["CP", 0.9, 90, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "MGC2028L": {"P3": ["CCI", 6.0, 0, 120, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC2029L": {"P1": ["CT", 1.8, 80, 80, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 80, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC2030L": {"P3": ["CCI", 9.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC2031L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MGC2307M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2309M": {"P1": ["CT", 1.98, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.02, 0, 0, "?/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2310M": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2313M": {"P1": ["CT", 21.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "MGC2324M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2325M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2326M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2327M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2328M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2335M": {"P1": ["CT", 2.1, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 3.9, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC2336M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2337M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2338M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC2339M": {"P1": ["CT", 6.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2341M": {"P1": ["CT", 6.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2343M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2351M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2363M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC2364M": {"P1": ["CT", 21.0, 40, 0, "Mise en situation (stage, simulation de situations...)/"]}, "MGC2365M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2366M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2367M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2368M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2374M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2375M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2377M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2378M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2379M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2380M": {"P3": ["CCI", 21.0, 0, 0, "?/"]}, "MGC2384M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2385M": {"P1": ["CT", 6.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2387M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2388M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2390M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2391M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2392M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2393M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2397M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2401M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC2402M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2404M": {"P1": ["CT", 3.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC2409M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2410M": {"P1": ["CT", 3.0, 120, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC2411M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2413M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2415M": {"P1": ["CT", 3.0, 120, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC2438M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2439M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2440M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2442M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2443M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2444M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2446M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2450M": {"P3": ["CCI", 21.0, 0, 0, "?/"]}, "MGC2452M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 30, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC2453M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2454M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2455M": {"P1": ["CT", 1.56, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.44, 0, 0, "?/"]}, "MGC2460M": {"P1": ["CT", 4.5, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "MGC2461M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2463M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2464M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2465M": {"P1": ["CT", 21.0, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC2467M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2469M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2471M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2473M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2474M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2475M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2476M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2477M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2478M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2479M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2480M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2482M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2483M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MGC2484M": {"P1": ["CT", 1.98, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "MGC2485M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2486M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2487M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2488M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC2489M": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC2490M": {"P1": ["CT", 24.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MGC2491M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2492M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2493M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2494M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC2495M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2496M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MGC2497M": {"P1": ["CT", 9.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 14.4, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC2498M": {"P1": ["CT", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 0.45, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 0.45, 0, 0, "?/"], "P4": ["CT", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MGC2499M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGC3001L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MGC3002L": {"P1": ["CT", 2.58, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.52, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "MGC3030L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3047L": {"P1": ["CT", 3.06, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "MGC3059L": {"P1": ["CT", 3.0, 10, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MGC3060L": {"P1": ["CT", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "MGC3062L": {"P1": ["CT", 2.04, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "MGC3063L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MGC3064L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3077L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3078L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MGC3079L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "MGC3080L": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC3081L": {"P1": ["CT", 4.2, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "MGC3082L": {"P1": ["CT", 1.8, 60, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MGC3083L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3084L": {"P3": ["CCI", 3.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC3086L": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.7, 0, 0, "?/"], "P4": ["CT", 1.5, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3090L": {"P1": ["CT", 2.28, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.32, 0, 0, "?/"], "P4": ["CT", 2.4, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3091L": {"P1": ["CT", 2.1, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"], "P4": ["CT", 2.1, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3092L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3095L": {"P1": ["CT", 0.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MGC3096L": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "MGC3097L": {"P1": ["CT", 2.4, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "MGC3098L": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 4.2, 0, 0, "?/"]}, "MGC3099L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "MGC3101L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MGC3102L": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MGC3103L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3104L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3105L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3106L": {"P1": ["CT", 2.1, 90, 60, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.1, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MGC3107L": {"P1": ["CT", 2.25, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.75, 0, 0, "?/"]}, "MGC3108L": {"P1": ["CT", 1.98, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "MGCLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MGCLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MLE1001L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1001M": {"P1": ["CT", 9.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1002L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1002M": {"P1": ["CT", 6.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1003L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "MLE1004L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1004M": {"P1": ["CT", 2.4, 60, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1005L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1005M": {"P1": ["CT", 6.0, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1006L": {"P1": ["CT", 2.7, 60, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.3, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1006M": {"P1": ["CT", 1.8, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1007L": {"P1": ["CT", 2.7, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.3, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1007M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1008M": {"P1": ["CT", 3.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1009M": {"P1": ["CT", 7.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 7.5, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE1010L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1011L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1011M": {"P1": ["CT", 3.0, 45, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1012L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1012M": {"P1": ["CT", 1.8, 0, 40, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1013L": {"P1": ["CT", 1.53, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.47, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MLE1013M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1014M": {"P1": ["CT", 3.0, 120, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1015L": {"P1": ["CT", 2.7, 60, 45, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P2": ["CP", 0.3, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "MLE1016L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1018M": {"P3": ["CCI", 3.0, 0, 15, "?/Ensemble d'\u00e9preuves diverses"]}, "MLE1019M": {"P1": ["CT", 4.8, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MLE1020M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MLE1021M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MLE1022M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MLE1023M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MLE1024M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MLE1026M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MLE1027M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MLE1028M": {"P3": ["CCI", 15.0, 0, 0, "?/"]}, "MLE1029M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1030M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1031M": {"P1": ["CT", 3.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "MLE1032M": {"P1": ["CT", 9.18, 240, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 8.82, 0, 0, "?/"]}, "MLE1037M": {"P1": ["CT", 9.0, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1038M": {"P1": ["CT", 3.6, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.6, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "MLE1039M": {"P1": ["CT", 9.0, 240, 240, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1040M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MLE1042M": {"P1": ["CT", 4.5, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 4.5, 0, 0, "?/"]}, "MLE1043M": {"P1": ["CT", 5.85, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.15, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1044M": {"P1": ["CT", 5.85, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.15, 0, 0, "?/"]}, "MLE1045M": {"P1": ["CT", 6.75, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.25, 0, 0, "?/"]}, "MLE1047M": {"P1": ["CT", 9.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1048M": {"P1": ["CT", 6.3, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "MLE1049M": {"P1": ["CT", 9.0, 180, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1050M": {"P1": ["CT", 9.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1054M": {"P1": ["CT", 9.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1055M": {"P1": ["CT", 4.59, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 4.41, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1056M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1057M": {"P1": ["CT", 9.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1058M": {"P1": ["CT", 9.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1059M": {"P1": ["CT", 7.65, 150, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "MLE1060M": {"P1": ["CT", 9.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1061M": {"P1": ["CT", 6.03, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 2.97, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE1063M": {"P1": ["CT", 6.75, 150, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.25, 0, 0, "?/"]}, "MLE1066M": {"P1": ["CT", 6.3, 90, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "MLE1068M": {"P1": ["CT", 2.97, 120, 120, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 6.03, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1069M": {"P1": ["CT", 6.75, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.25, 0, 0, "?/"]}, "MLE1073M": {"P1": ["CT", 5.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.6, 120, 120, "Mise en situation (stage, simulation de situations...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "MLE1074M": {"P1": ["CT", 9.0, 60, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1075M": {"P1": ["CT", 9.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "MLE1076M": {"P1": ["CT", 4.59, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 4.41, 0, 0, "?/"]}, "MLE1077M": {"P1": ["CT", 4.5, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 4.5, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE1078M": {"P1": ["CT", 6.3, 60, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "MLE1079M": {"P1": ["CT", 4.59, 240, 240, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 4.41, 0, 0, "?/"]}, "MLE1080M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "MLE1081M": {"P1": ["CT", 4.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 2.7, 30, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "MLE1082M": {"P1": ["CT", 1.8, 180, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "MLE2001L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2001M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2002M": {"P1": ["CT", 3.0, 120, 40, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2003L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "MLE2004L": {"P1": ["CT", 1.53, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.47, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2005M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MLE2006M": {"P1": ["CT", 1.53, 120, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.47, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2007L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2008L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2009L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2010M": {"P1": ["CT", 3.0, 120, 40, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2011M": {"P1": ["CT", 3.0, 120, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2012M": {"P1": ["CT", 1.53, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P2": ["CP", 1.47, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MLE2013L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2013M": {"P1": ["CT", 3.0, 120, 40, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2015L": {"P1": ["CT", 2.1, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 45, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2015M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE2016L": {"P1": ["CT", 2.7, 90, 45, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.3, 0, 0, "?/"]}, "MLE2018M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE2019L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2020L": {"P1": ["CT", 6.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2021L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2021M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MLE2022L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "MLE2022M": {"P1": ["CT", 13.77, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 13.23, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE2023L": {"P1": ["CT", 2.1, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 45, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2024L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2024M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2025L": {"P1": ["CT", 1.8, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2026L": {"P1": ["CT", 6.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2027L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2029M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2030M": {"P1": ["CT", 1.8, 120, 50, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 50, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2033M": {"P1": ["CT", 3.0, 120, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2034M": {"P1": ["CT", 3.0, 120, 40, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2035M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2036M": {"P1": ["CT", 2.4, 90, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.6, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2037M": {"P1": ["CT", 3.0, 90, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2040M": {"P1": ["CT", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 2.4, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE2041M": {"P1": ["CT", 3.6, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2043M": {"P1": ["CT", 1.8, 120, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.28, 0, 0, "?/"], "P4": ["CT", 0.72, 120, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2045M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE2060M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE2063M": {"P1": ["CT", 3.6, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2072M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2079M": {"P1": ["CT", 3.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2080M": {"P1": ["CT", 3.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2081M": {"P1": ["CT", 3.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2082M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MLE2083M": {"P1": ["CT", 15.3, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 14.7, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MLE2084M": {"P1": ["CT", 3.0, 45, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2086M": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2089M": {"P1": ["CT", 1.53, 20, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.47, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2090M": {"P1": ["CT", 2.4, 40, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2095M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2096M": {"P1": ["CT", 18.0, 0, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 12.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2097M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2098M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2099M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2100M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2101M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2102M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2103M": {"P1": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 4.5, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "MLE2105M": {"P1": ["CT", 3.0, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2106M": {"P1": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 4.5, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "MLE2107M": {"P1": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 4.5, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "MLE2108M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2109M": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MLE2110M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "MLE2111M": {"P1": ["CT", 3.6, 0, 40, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 2.4, 180, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2113M": {"P1": ["CT", 3.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MLE2114M": {"P1": ["CT", 18.9, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 8.1, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2115M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MLE2116M": {"P1": ["CT", 3.0, 120, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2118M": {"P1": ["CT", 3.0, 90, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2122M": {"P1": ["CT", 6.0, 0, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2123M": {"P1": ["CT", 4.5, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2124M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2125M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2126M": {"P1": ["CT", 1.53, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.47, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2127M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2128M": {"P1": ["CT", 3.6, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2129M": {"P1": ["CT", 3.6, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE2130M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MLE2132M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE2134M": {"P1": ["CT", 18.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 12.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "MLE2135M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE3002L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3003L": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE3007L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3008L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3009L": {"P1": ["CT", 3.0, 90, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3010L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "MLE3011L": {"P1": ["CT", 3.0, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3013L": {"P1": ["CT", 3.0, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE3014L": {"P1": ["CT", 3.0, 15, 15, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 0.6, 15, 0, "Mise en situation (stage, simulation de situations...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 2.4, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE3015L": {"P1": ["CT", 6.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3017L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "MLE3018L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3019L": {"P1": ["CT", 3.0, 0, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3020L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3021L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3022L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3023L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3024L": {"P1": ["CT", 3.0, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE3025L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3026L": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE3028L": {"P1": ["CT", 3.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "MLE3029L": {"P1": ["CT", 3.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLE3030L": {"P1": ["CT", 1.8, 15, 90, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "MLELG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MLELG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MT101MXN": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MT102MXN": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MT103MXN": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "MT104MXN": {"P1": ["CT", 9.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MT201MXJ": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MT202MXE": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MT203MXE": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MT204MXE": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MT205MXE": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MT206MXE": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "MT207MXN": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "MT208MXN": {"P1": ["CT", 18.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PH201MXV": {"P1": ["CT", 3.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "PH202MXV": {"P1": ["CT", 1.53, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "PHM140E": {"P1": ["CT", 1.34, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.66, 0, 0, "?/"]}, "PHM219E": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHOP055E": {"P1": ["CT", 100.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1000E": {"P3": ["CCI", 10.0, 0, 120, "?/Ensemble d'\u00e9preuves diverses"]}, "PHY1001L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PHY1001P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "PHY1002P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY1003P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "PHY1004P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY1005M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1008L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1009L": {"P3": ["CCI", 6.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1010L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1011L": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1011M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1012L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1013L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1014L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1015L": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1016L": {"P3": ["CCI", 3.0, 0, 45, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1016M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1017L": {"P3": ["CCI", 3.0, 0, 45, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1018L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1019L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1020L": {"P1": ["CT", 1.98, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.02, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1021L": {"P3": ["CCI", 3.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1022L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1023L": {"P3": ["CCI", 3.0, 0, 60, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1092M": {"P1": ["CT", 2.4, 120, 90, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "PHY1104M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1107M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1108M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1109M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1152M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1153M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY1154M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1155M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1156M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1160M": {"P1": ["CT", 3.0, 90, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1161M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1162M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1163M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1164M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1166M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1167M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1168M": {"P1": ["CT", 6.0, 120, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1169M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1170M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1171M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1172M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1173M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1175M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1183M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1184M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1186M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1187M": {"P1": ["CT", 6.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1188M": {"P1": ["CT", 3.0, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"]}, "PHY1189M": {"P1": ["CT", 6.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY1190M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1191M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1192M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1194M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1195M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1196M": {"P1": ["CT", 1.65, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "PHY1219M": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "PHY1220M": {"P1": ["CT", 4.02, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.98, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1221M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY1222M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1223M": {"P1": ["CT", 1.53, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "PHY1224M": {"P1": ["CT", 2.1, 120, 50, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.9, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1225M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "PHY1226M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1227M": {"P1": ["CT", 2.4, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "PHY1228M": {"P1": ["CT", 1.98, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "PHY1229M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1230M": {"P1": ["CT", 1.5, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PHY1235M": {"P1": ["CT", 3.0, 120, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.98, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "PHY1237M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1242M": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "PHY1243M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1244M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PHY1245M": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PHY1246M": {"P1": ["CT", 1.53, 120, 90, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "PHY1247M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1248M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1249M": {"P1": ["CT", 2.4, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "PHY1250M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1253M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY1255M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1256M": {"P1": ["CT", 4.02, 120, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.98, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1257M": {"P1": ["CT", 1.5, 60, 45, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PHY1258M": {"P1": ["CT", 2.01, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY1259M": {"P1": ["CT", 3.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "PHY1260M": {"P1": ["CT", 6.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "PHY1261M": {"P1": ["CT", 0.75, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/"], "P2": ["CP", 0.75, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P3": ["CC", 0.75, 0, 0, "?/"], "P4": ["CT", 0.75, 90, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PHY1262M": {"P1": ["CT", 2.01, 120, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY1263M": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "PHY1264M": {"P1": ["CT", 1.98, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.02, 0, 0, "?/"]}, "PHY1266M": {"P1": ["CT", 9.0, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "PHY1267M": {"P1": ["CT", 2.01, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY1269M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1271M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY1272M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1273M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1274M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1275M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1276M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY1277M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "PHY2001P": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "PHY2002L": {"P1": ["CT", 3.6, 120, 90, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "PHY2002P": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2003L": {"P1": ["CT", 3.3, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.7, 0, 0, "?/"]}, "PHY2003P": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PHY2004L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2005L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PHY2006L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2016L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2018L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2020L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"], "P4": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2021L": {"P1": ["CT", 2.4, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.1, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PHY2067M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2068M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2069M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2149M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2159M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2192M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2193M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2210M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2211M": {"P1": ["CT", 30.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY2217M": {"P1": ["CT", 30.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY2303M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PHY2307M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2308M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2309M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2310M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2312M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY2317M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2318M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2319M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2320M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2329M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY2330M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY2331M": {"P1": ["CT", 21.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY2350M": {"P1": ["CT", 6.0, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2351M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2355M": {"P1": ["CT", 3.0, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "PHY2356M": {"P1": ["CT", 21.0, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2360M": {"P1": ["CT", 6.0, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2367M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2375M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2376M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PHY2377M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PHY2379M": {"P1": ["CT", 2.01, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY2381M": {"P1": ["CT", 21.0, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2382M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY2385M": {"P1": ["CT", 2.97, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.06, 0, 0, "?/"], "P4": ["CT", 2.97, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2386M": {"P1": ["CT", 4.05, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 4.95, 0, 0, "?/"]}, "PHY2389M": {"P1": ["CT", 6.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2390M": {"P1": ["CT", 24.0, 50, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2391M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2392M": {"P1": ["CT", 24.0, 50, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2398M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2399M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2402M": {"P3": ["CCI", 21.0, 0, 0, "?/"]}, "PHY2403M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2405M": {"P1": ["CT", 3.06, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "PHY2406M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2408M": {"P1": ["CT", 6.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2412M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "PHY2414M": {"P1": ["CT", 1.5, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2415M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2416M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY2421M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2426M": {"P1": ["CT", 6.0, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2427M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2428M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2429M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2430M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2431M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY2432M": {"P1": ["CT", 2.01, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY2434M": {"P1": ["CT", 1.65, 120, 90, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "PHY2435M": {"P1": ["CT", 3.0, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2436M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2437M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2438M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2439M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2440M": {"P1": ["CT", 1.53, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "PHY2441M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2442M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2444M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2446M": {"P1": ["CT", 1.8, 90, 60, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P2": ["CP", 1.2, 60, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "PHY2447M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2448M": {"P1": ["CT", 1.8, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PHY2449M": {"P1": ["CT", 2.1, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.9, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2450M": {"P1": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2451M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2452M": {"P1": ["CT", 1.53, 20, 20, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "PHY2453M": {"P1": ["CT", 3.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2454M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2455M": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2456M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY2457M": {"P1": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PHY2458M": {"P1": ["CT", 2.4, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "PHY2459M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY2460M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY2461M": {"P1": ["CT", 2.4, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2462M": {"P1": ["CT", 2.01, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2463M": {"P1": ["CT", 1.8, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PHY2464M": {"P1": ["CT", 2.01, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY2466M": {"P1": ["CT", 15.3, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P2": ["CP", 14.7, 0, 0, "Mise en situation (stage, simulation de situations...)/"]}, "PHY2467M": {"P1": ["CT", 2.01, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2468M": {"P1": ["CT", 1.5, 120, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PHY2469M": {"P1": ["CT", 2.01, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2471M": {"P1": ["CT", 2.01, 120, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PHY2474M": {"P1": ["CT", 0.75, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.25, 0, 0, "?/"]}, "PHY2475M": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "PHY2477M": {"P1": ["CT", 1.2, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.8, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2478M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "PHY2479M": {"P1": ["CT", 30.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2480M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2481M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY2482M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHY2483M": {"P1": ["CT", 6.0, 180, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2484M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2485M": {"P1": ["CT", 2.1, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "PHY2486M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2487M": {"P1": ["CT", 1.8, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PHY2488M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2489M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2490M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2491M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2492M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2493M": {"P1": ["CT", 3.0, 120, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2494M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2495M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2496M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2497M": {"P1": ["CT", 6.0, 180, 90, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2498M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2499M": {"P1": ["CT", 3.96, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.04, 0, 0, "?/"]}, "PHY2500M": {"P1": ["CT", 3.0, 120, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY2501M": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2502M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2503M": {"P1": ["CT", 6.0, 180, 90, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2504M": {"P1": ["CT", 6.0, 180, 90, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2505M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2506M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2507M": {"P1": ["CT", 6.0, 180, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2508M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2509M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2510M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2511M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2512M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2513M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2514M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2515M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2516M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2517M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2518M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2519M": {"P1": ["CT", 3.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2520M": {"P1": ["CT", 3.0, 120, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2523M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PHY2524M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY2525M": {"P1": ["CT", 1.65, 120, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P3": ["CC", 1.35, 0, 0, "?/"]}, "PHY2526M": {"P1": ["CT", 3.0, 120, 25, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY2527M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "PHY2529M": {"P3": ["CCI", 21.0, 0, 0, "?/"]}, "PHY3003L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "PHY3005L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "PHY3006L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.02, 45, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "PHY3009L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "PHY3012L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3013L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3014L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3016L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PHY3017L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3019L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3020L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3028L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3029L": {"P1": ["CT", 9.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY3031L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY3034L": {"P1": ["CT", 1.5, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3065L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3066L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3068L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3069L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3070L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "PHY3071L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3072L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3073L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3074L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3075L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3076L": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3077L": {"P1": ["CT", 2.01, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.99, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3078L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3080L": {"P3": ["CCI", 6.0, 0, 120, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3081L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3082L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "PHY3084L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PHY3085L": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3086L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3087L": {"P1": ["CT", 4.02, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3088L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "PHY3089L": {"P1": ["CT", 2.7, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.5, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "PHY3091L": {"P1": ["CT", 3.0, 120, 120, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P2": ["CP", 0.6, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "PHY3093L": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3094L": {"P1": ["CT", 6.0, 40, 40, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3095L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "PHY3096L": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.99, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3097L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PHY3098L": {"P1": ["CT", 1.95, 90, 15, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.05, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PHY3099L": {"P3": ["CCI", 6.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "PHY3100L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PHY3101L": {"P1": ["CT", 1.53, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "PHYLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHYLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PHYLG03M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1000TC": {"P3": ["CCI", 30.0, 0, 0, "?/"]}, "PL1002AP": {"P3": ["CCI", 30.0, 0, 0, "?/"]}, "PL1007PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1008PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1009PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1010PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1011PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1022PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1023PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1024PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1034PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL1035PP": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL2005PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2006PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2007PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2008PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2009PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2010PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2011PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2012PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2013PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL2014PP": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL3006PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3007PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3008PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3012PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3013PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3014PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3015PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3016PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3017PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL3018PP": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL4006PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4007PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4008PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4012PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4013PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4014PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4015PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4016PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4017PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL4018PP": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5004TR": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5006TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5007TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5008PP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5009PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5010GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5010PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5013GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5013TC": {"P1": ["CT", 0.5, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PL5014GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5014MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5015MM": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5015TC": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5016GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5016MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5017MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5018MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5020ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5020MM": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5021MA": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5021ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5021MM": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5022GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5022IF": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5022MA": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5022ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5023GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5023GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5023MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5023ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5024GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5024GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5024MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5024ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5025GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5025GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5025IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5025MA": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5026GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5026MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5026ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5027ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5028GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5028MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5029GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5029MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5029ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL502GIA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5030GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5030GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5030IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5030ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5031GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5031IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5031MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5032GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5032MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5033GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5035GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5035GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5036GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5036GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5037GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5038GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5038IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5039GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5039IF": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5040GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5040IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL5041IF": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5043IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5044AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5044IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5045AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5047AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5050AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5051AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL5057AP": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL5058AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5059AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5061AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5062AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL5064AP": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL6004TR": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6005TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6006GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6006PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6007PP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6008GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6009GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6009TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6010TC": {"P1": ["CT", 0.45, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 2.55, 0, 0, "?/"]}, "PL6011GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6014MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL6014TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6015GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6015MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6015TC": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "PL6016ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6016MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL6017ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6017MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6018GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6018ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6018MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6020IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6020ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6021GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6021IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6021ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6021MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6022ME": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL6023GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6024GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6024GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6024IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6024MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6024MM": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6025IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6025MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6026GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6026IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6026MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6027GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6027IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6027MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6028GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6028IF": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6028ME": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL6029GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6029MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6030GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6030IF": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6030MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6031MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6032MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6033MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6034GB": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL6034GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6034IF": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6034MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6035GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6035MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6036GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6036IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6036MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6037GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6038GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6038IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6038MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6039GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6043GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6049AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6051AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6052AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL6053AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6055AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6059AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL6062AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6065AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6066AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6067AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6069AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL6074AP": {"P3": ["CCI", 9.0, 0, 0, "?/"]}, "PL6076AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7004TR": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7006TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7007TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7016ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL7016TC": {"P1": ["CT", 0.5, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PL7017ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL7019ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL7019TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7020ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL7020TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7021ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL7022ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7024ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL7027ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7048AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7049AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7051AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL7053AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7056AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7057AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7059AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7063AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7064AP": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL7065AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7066AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL7068AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL7071AP": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "PL8001PP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8004TR": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8005TC": {"P3": ["CCI", 30.0, 0, 0, "?/"]}, "PL8006TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8007GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8007TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8008GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8010GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8011GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8012GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8012TC": {"P1": ["CT", 0.5, 0, 0, "Mise en situation (stage, simulation de situations...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "PL8013GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8014GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8014MM": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8015MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8015TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8016GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8016TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8017TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8018GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8018TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8019IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8020MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8020MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8020TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8021GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8021MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8021MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8022GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8022IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8022MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8022MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8023GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8023IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8023MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8024GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8024GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8024MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8024MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8025GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8025MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8026MA": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8027GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8027IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8027MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8027MM": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8028GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8028MM": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8029MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8030IF": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8030MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8030MM": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8031IF": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8031MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8032IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8033AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8033GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8034AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8034GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8034IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8035AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8035GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8035IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8036AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8036GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8036IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8038AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8038GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8038IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8040AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8041GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8042AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL8043AP": {"P3": ["CCI", 11.0, 0, 0, "?/"]}, "PL8043GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8045AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL8046AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL8048AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9001PP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9001TR": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9003GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9003TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9004ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9004MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL9004TR": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9005GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9005MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9005MM": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9006MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9006ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9006MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL9007GB": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL9007MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9007ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9008GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9008MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9008ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9008MM": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9009IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9009MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9009MM": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL9010GB": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9010IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9010MA": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9011IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9011MA": {"P3": ["CCI", 4.0, 0, 0, "?/"]}, "PL9012MM": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9013IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9014GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9014GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9014IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9015GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9015GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9015ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9015MM": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9016GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9016GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9016IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9017GB": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9017ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9017MM": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9018GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9018GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9018MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9019GB": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9019GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9019MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9020GI": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9020MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9020ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9021GI": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9021IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9021MA": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9021ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9022IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9022MA": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9023GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9023IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9023ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9023TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9024IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9024TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9025ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9025TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9026IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9026TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9027GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9027IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9027ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9027TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9028GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9028TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9029TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9030GI": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9030IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9030TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9031GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9031IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9032TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9033GI": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9033ME": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9034GI": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9034ME": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9034TC": {"P1": ["CT", 0.5, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P3": ["CC", 0.5, 0, 0, "?/"]}, "PL9035IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9035ME": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9035TC": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9036IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9037IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9039IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9040IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9042IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9043IF": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9045AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9045IF": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9046AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9047AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9048AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9049AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9050AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9051AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9052AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9055AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9056AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9061AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9062AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9065AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9066AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9067AP": {"P3": ["CCI", 1.0, 0, 0, "?/"]}, "PL9069AP": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PL9070AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "PL9071AP": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "POL1002M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1003M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1005M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1007M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1011M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1013M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1014M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL1015M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL1017M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL1018M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "POL1019M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1020M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL1021M": {"P1": ["CT", 4.02, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"]}, "POL1022M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL1023M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "POL1024M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL1025M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL1027M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL1028M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2002M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL2004M": {"P1": ["CT", 2.01, 90, 90, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL2008M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2011M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "POL2012M": {"P3": ["CCI", 21.0, 0, 0, "?/"]}, "POL2013M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2014M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2015M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2016M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2017M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2018M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2035M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2036M": {"P1": ["CT", 4.2, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.8, 50, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2037M": {"P1": ["CT", 3.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2038M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2039M": {"P1": ["CT", 3.0, 60, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "POL2040M": {"P1": ["CT", 3.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2041M": {"P1": ["CT", 1.02, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 0.99, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2042M": {"P1": ["CT", 27.0, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2043M": {"P1": ["CT", 3.0, 60, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2044M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2045M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2046M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2047M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "POL2048M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2050M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2051M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2052M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POL2053M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL2054M": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL2057M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2058M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2059M": {"P1": ["CT", 2.1, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "POL2060M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2061M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "POL2062M": {"P1": ["CT", 2.01, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "POL2063M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2064M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2065M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2066M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2067M": {"P1": ["CT", 1.53, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.47, 0, 0, "?/"]}, "POL2068M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "POL2069M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "POLLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "POLLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PY101MXC": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PY102MXC": {"P1": ["CT", 2.01, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.99, 0, 0, "?/"]}, "PY201MXM": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PY202MXM": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PY203MXM": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "PY204MXM": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "PY205MXM": {"P1": ["CT", 4.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PY207MXC": {"P1": ["CT", 2.01, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PY208MX3": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "PY209MXC": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PY210MXC": {"P1": ["CT", 2.01, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PY211MXC": {"P1": ["CT", 2.01, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PY212MXC": {"P1": ["CT", 1.53, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 1.47, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PY213MXC": {"P1": ["CT", 2.01, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PY214MXC": {"P1": ["CT", 2.01, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P2": ["CP", 0.99, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "PY215MXC": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "PY217MXC": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "PY218MXC": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "SP101MX2": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SP102MX2": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP103MX2": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SP104MX2": {"P1": ["CT", 3.0, 60, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SP105MX2": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SP106MX2": {"P1": ["CT", 3.0, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP107MX2": {"P1": ["CT", 1.5, 10, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SP108MX2": {"P1": ["CT", 3.0, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP109MX2": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP202MXJ": {"P1": ["CT", 3.3, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.7, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP203MXJ": {"P1": ["CT", 1.65, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.35, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP204MX2": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP205MXJ": {"P1": ["CT", 6.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP206MX2": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SP207MX2": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SP208MX2": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SP209MXJ": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP210MXJ": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP211MXJ": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SP3501E": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SP3503E": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SP3504E": {"P1": ["CT", 100.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SP3505E": {"P1": ["CT", 100.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1017P": {"P1": ["CT", 60.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1018P": {"P1": ["CT", 60.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1019P": {"P1": ["CT", 60.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1020P": {"P1": ["CT", 100.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT1021P": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "SPT1023P": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1036P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1037P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1038P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1039P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1040P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1041P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1042P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1043P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1044P": {"P1": ["CT", 3.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1045P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1046P": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1050P": {"P1": ["CT", 3.0, 30, 30, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "SPT1051P": {"P1": ["CT", 100.0, 180, 180, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1052P": {"P1": ["CT", 50.0, 90, 90, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 50.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1053P": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1054P": {"P1": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1055P": {"P1": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 50.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1056P": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1057P": {"P1": ["CT", 100.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1062P": {"P1": ["CT", 60.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1063P": {"P1": ["CT", 60.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1067M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1070M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1072M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1094L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1097D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1098M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1101M": {"P1": ["CT", 3.0, 70, 70, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1102D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1103M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1104M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1105M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1110M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "SPT1111M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "SPT1117D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1119M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1128D": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1130D": {"P1": ["CT", 60.0, 30, 90, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1131D": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1140M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1143M": {"P3": ["CCI", 13.0, 0, 0, "?/"]}, "SPT1146M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1148D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1149D": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1149M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1150D": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1152D": {"P1": ["CT", 4.2, 120, 120, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1159M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1160M": {"P1": ["CT", 3.0, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1161M": {"P1": ["CT", 3.0, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1162M": {"P1": ["CT", 6.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1163M": {"P1": ["CT", 6.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1164M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1165M": {"P1": ["CT", 1.65, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.35, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1166M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1167M": {"P1": ["CT", 3.15, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 4.05, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1168M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1171M": {"P1": ["CT", 5.4, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.6, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1172M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1176M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1180D": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1180M": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1181D": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1181M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1184M": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1185D": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1185M": {"P1": ["CT", 100.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1186D": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1186M": {"P1": ["CT", 7.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 4.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1187D": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1187M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1188D": {"P1": ["CT", 4.2, 45, 45, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P2": ["CP", 1.8, 45, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "SPT1188M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1189D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1189M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1190D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1190M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1191D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1191M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1192D": {"P1": ["CT", 3.0, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P4": ["CT", 3.0, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "SPT1192M": {"P1": ["CT", 3.0, 25, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1193D": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1193M": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1194M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1195M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1196M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1197D": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1197M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1199D": {"P1": ["CT", 3.0, 7, 7, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "SPT1199M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "SPT1200D": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1201D": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1201M": {"P1": ["CT", 100.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT1202M": {"P1": ["CT", 100.0, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1203D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1203M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1204D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1204M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1205D": {"P1": ["CT", 3.6, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1205M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1206D": {"P1": ["CT", 3.6, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1206M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.2, 35, 35, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1207M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT1208M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1209M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1210D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1210L": {"P1": ["CT", 6.0, 0, 120, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1210M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1211D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1211M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "SPT1212D": {"P1": ["CT", 5.4, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1212M": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1213D": {"P1": ["CT", 3.6, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1213M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT1214D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1215D": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1215M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "SPT1216D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT1217D": {"P1": ["CT", 1.8, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P2": ["CP", 1.2, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "SPT1218D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1219D": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1220D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1222D": {"P1": ["CT", 50.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 50.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT1223D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1225D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1226D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1228D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1229D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1230D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1231D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1233D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1234D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1235D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1236D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT1238D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1239D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1240D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1241D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT1243D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1244D": {"P3": ["CCI", 6.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1246D": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1247D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1248D": {"P1": ["CT", 1.8, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P2": ["CP", 1.2, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "SPT1249D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1253D": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1254D": {"P3": ["CCI", 9.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1256D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1257D": {"P1": ["CT", 1.8, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1258D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1259D": {"P1": ["CT", 3.6, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1260D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1261D": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1262D": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1263D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1264D": {"P1": ["CT", 6.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1265D": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1266D": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 10, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1335L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1336L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1337L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1338L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT1340L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1342L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1343L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1345L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1346L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1347L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1348L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1349L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1350L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1352L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1353L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1354L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1355L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1356L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1357L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1358L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1359L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1360L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1361L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1362L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1363L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1364L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1365L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1366L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1367L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1368L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1369L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1370L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1371L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1372L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1373L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1375L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1376L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1377L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1378L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1379L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1380L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1381L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1382L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1383L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1384L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1385L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1386L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1387L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1388L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1389L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1390L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1391L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1392L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1393L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1394L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1395L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1396L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1398L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1401L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1404L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1407L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1410L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1413L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1416L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1419L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1422L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1425L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1428L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1431L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1434L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1437L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1440L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1443L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1447L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1450L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1453L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1456L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1459L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1462L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1465L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1468L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1471L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1474L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1477L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1480L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1483L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1486L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1489L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1492L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1496L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1499L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1502L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1505L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1508L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1511L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1514L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1517L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1520L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1523L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1526L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1529L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1532L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1535L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1538L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1541L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT1545L": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT1546L": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2011P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SPT2012P": {"P1": ["CT", 15.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT2013P": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "SPT2014P": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "SPT2015P": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "SPT2021P": {"P1": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2022P": {"P1": ["CT", 100.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2023P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2024P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2025P": {"P1": ["CT", 15.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2026P": {"P1": ["CT", 3.0, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2027P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2029P": {"P1": ["CT", 6.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2030P": {"P1": ["CT", 15.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "SPT2031P": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2032P": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "SPT2034P": {"P1": ["CT", 9.0, 25, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT2077D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2077M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2078D": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2078M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2079D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2079M": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2080D": {"P1": ["CT", 3.6, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2089M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SPT2091M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2096M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2097D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2097M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2098D": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2098M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2101D": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "SPT2102D": {"P1": ["CT", 60.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/"], "P2": ["CP", 40.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/"]}, "SPT2102M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2103M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2104M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2106M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2107M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2108M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2123D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2124D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2126D": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2127D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2128D": {"P1": ["CT", 6.3, 45, 45, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P2": ["CP", 2.7, 45, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "SPT2128M": {"P1": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2129D": {"P1": ["CT", 4.2, 120, 120, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P2": ["CP", 1.8, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "SPT2130D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2131D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2137M": {"P1": ["CT", 6.0, 60, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2139M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2140M": {"P1": ["CT", 3.6, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "SPT2141D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2144D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2148M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2158D": {"P1": ["CT", 1.8, 20, 90, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2159D": {"P1": ["CT", 3.6, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2161M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2162L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2163D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2164D": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2164M": {"P3": ["CCI", 8.0, 0, 0, "?/"]}, "SPT2165D": {"P1": ["CT", 1.8, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2166D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2167M": {"P3": ["CCI", 2.0, 0, 0, "?/"]}, "SPT2168D": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2170D": {"P1": ["CT", 6.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2171D": {"P1": ["CT", 6.0, 30, 30, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2171M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT2172D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2173D": {"P1": ["CT", 3.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 2.4, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2174D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2175D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2175L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2176D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2176L": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2177D": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2177L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2178D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2179D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2179L": {"P1": ["CT", 1.8, 0, 60, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2179M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2180M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.0, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2182D": {"P1": ["CT", 3.6, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2183D": {"P1": ["CT", 3.6, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 2.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2184D": {"P1": ["CT", 1.8, 90, 90, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "SPT2184M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT2185D": {"P1": ["CT", 7.2, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 4.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2185M": {"P1": ["CT", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.8, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.3, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2186D": {"P1": ["CT", 1.8, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2186M": {"P1": ["CT", 3.0, 120, 120, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "SPT2187M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2189D": {"P1": ["CT", 50.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 50.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT2189M": {"P1": ["CT", 100.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2190D": {"P1": ["CT", 3.0, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2191D": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2192D": {"P1": ["CT", 3.0, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "SPT2192M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SPT2194D": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2194M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SPT2195D": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2197D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT2198D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT2198M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SPT2199D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT2199M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SPT2200D": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT2200M": {"P1": ["CT", 12.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 8.4, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2202D": {"P1": ["CT", 3.6, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P2": ["CP", 2.4, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2202M": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2203D": {"P1": ["CT", 3.6, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P2": ["CP", 2.4, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2203M": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2204D": {"P1": ["CT", 3.6, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P2": ["CP", 2.4, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2204M": {"P1": ["CT", 3.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "SPT2205D": {"P1": ["CT", 3.6, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"], "P2": ["CP", 2.4, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2205M": {"P1": ["CT", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.8, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.3, 45, 45, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2206M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2207D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2207M": {"P3": ["CCI", 6.0, 0, 0, "?/"]}, "SPT2208D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2208M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2209D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2209M": {"P1": ["CT", 4.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.8, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2210D": {"P1": ["CT", 3.0, 90, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/"]}, "SPT2210M": {"P1": ["CT", 6.3, 40, 40, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 8.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 6.3, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2211D": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2211M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2212D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2213D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2213M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2214D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2214M": {"P1": ["CT", 3.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "SPT2215D": {"P1": ["CT", 1.8, 0, 90, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2215M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2216D": {"P1": ["CT", 1.8, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"], "P2": ["CP", 1.2, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Production informatique (programme informatique, logiciel, base de donn\u00e9es...)"]}, "SPT2216M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2217M": {"P1": ["CT", 6.0, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "SPT2218D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2218M": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2219D": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2219M": {"P1": ["CT", 5.4, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 3.6, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2220M": {"P1": ["CT", 4.5, 50, 50, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2221M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2222L": {"P1": ["CT", 1.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2222M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2224D": {"P1": ["CT", 1.8, 60, 60, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2224M": {"P1": ["CT", 12.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2225D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2226D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2227D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2227M": {"P1": ["CT", 6.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2228D": {"P1": ["CT", 3.6, 60, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2228M": {"P1": ["CT", 100.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2229D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2229M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2230D": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2230M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2231D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2232D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2233D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2233M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2234D": {"P1": ["CT", 1.8, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2234M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2235M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2236M": {"P1": ["CT", 12.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 8.4, 40, 40, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2237M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2238L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2238M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2239L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2239M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2240M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2241M": {"P1": ["CT", 3.0, 120, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2242L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2242M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPT2243L": {"P1": ["CT", 60.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2243M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2244M": {"P1": ["CT", 6.0, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2245L": {"P1": ["CT", 60.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2245M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT2246L": {"P1": ["CT", 60.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2246M": {"P1": ["CT", 3.06, 120, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 2.94, 0, 0, "?/"]}, "SPT2247M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 15.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2248L": {"P1": ["CT", 3.6, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2250L": {"P1": ["CT", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 0.9, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2251M": {"P1": ["CT", 60.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2252L": {"P1": ["CT", 0.9, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 0.9, 60, 60, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "SPT2252M": {"P1": ["CT", 100.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2253L": {"P1": ["CT", 1.8, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2254L": {"P1": ["CT", 1.8, 30, 30, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production audiovisuelle (vid\u00e9o...)"]}, "SPT2255L": {"P1": ["CT", 0.9, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 0.9, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2256M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "SPT2257L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2257M": {"P1": ["CT", 6.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT2258M": {"P1": ["CT", 12.6, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 8.4, 25, 25, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT2259L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2260L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2261L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2262L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2263L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2264L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2265L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2266L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2268L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2269L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2270L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2271L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2272L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2273L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2274L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2275L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2276L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2277L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2278L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2279L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2280L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2281L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2282L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2283L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2284L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2285L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2286L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2287L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2289L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2290L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2291L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2292L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2293L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2294L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2296L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2297L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2298L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2299L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2300L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2301L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2302L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2303L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2304L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2305L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2307L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2308L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2309L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2310L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2311L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2312L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2313L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2314L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2315L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2316L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2317L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2318L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2319L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2320L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2321L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2322L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2323L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2324L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2325L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT2326L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3296L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3297L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3298L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3299L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3300L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3301L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3302L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 80, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3303L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3304L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 20, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3305L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3306L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3307L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3308L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3309L": {"P1": ["CT", 0.9, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 0.9, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3310L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3311L": {"P1": ["CT", 2.7, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 3.6, 5, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 2.7, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT3312L": {"P1": ["CT", 3.0, 45, 45, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3313L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3513L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3514L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3515L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3516L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3517L": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3518L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3519L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3522L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3523L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3524L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3525L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3528L": {"P1": ["CT", 1.8, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 24, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3529L": {"P1": ["CT", 1.8, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3547L": {"P1": ["CT", 60.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3548L": {"P1": ["CT", 60.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3549L": {"P1": ["CT", 60.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 30, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3550L": {"P1": ["CT", 60.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 30, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3552L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3553L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3555L": {"P1": ["CT", 2.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT3556L": {"P1": ["CT", 1.2, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"], "P2": ["CP", 0.8, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production audiovisuelle (vid\u00e9o...)"]}, "SPT3565L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT3566L": {"P1": ["CT", 3.6, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3567L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3568L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3570L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3571L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3573L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 80, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3574L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3576L": {"P1": ["CT", 24.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 40.0, 0, 0, "?/"], "P4": ["CT", 36.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3578L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3579L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3580L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3581L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3582L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3583L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3584L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3585L": {"P1": ["CT", 60.0, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3587L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3588L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3590L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3591L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3592L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3593L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 0, 0, "Production informatique (programme informatique, logiciel, base de donn\u00e9es...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3594L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3598L": {"P1": ["CT", 60.0, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3599L": {"P1": ["CT", 60.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT3600L": {"P1": ["CT", 60.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3601L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3603L": {"P1": ["CT", 100.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "SPT3604L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3606L": {"P1": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 50.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3607L": {"P1": ["CT", 50.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 50.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3610L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3611L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3612L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3614L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3615L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3617L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3618L": {"P1": ["CT", 60.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 40.0, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3619L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 1.2, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "SPT3620L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3621L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3622L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3623L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3624L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3625L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3626L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3627L": {"P3": ["CCI", 100.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3629L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPT3630L": {"P1": ["CT", 3.0, 18, 18, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "SPT3631L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPTLG01D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPTLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPTLG02D": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "SPTLG03D": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "SPTLG03M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPTLG04D": {"P3": ["CCI", 3.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "SPTLG04M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPTLG05M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "SPTLG06M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "ST201MXN": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "STR1001P": {"P1": ["CT", 1.8, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "STR1002P": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1003P": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1004P": {"P1": ["CT", 3.6, 10, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.8, 0, 0, "?/"], "P4": ["CT", 3.6, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR1007P": {"P1": ["CT", 2.04, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.98, 0, 0, "?/"], "P4": ["CT", 1.98, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1008P": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STR1015M": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1017M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1029M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1030M": {"P1": ["CT", 2.1, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.9, 0, 0, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "STR1032M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1033M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR1034M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "STR1035M": {"P1": ["CT", 10.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 10.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STR1036M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "STR1037M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "STR1038M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "STR2004P": {"P1": ["CT", 9.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STR2005P": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 1.2, 0, 0, "?/"], "P4": ["CT", 1.8, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2006P": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR2007P": {"P1": ["CT", 0.99, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.02, 0, 0, "?/"], "P4": ["CT", 0.99, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR2008P": {"P1": ["CT", 3.06, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P2": ["CP", 1.98, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.98, 0, 0, "?/"], "P4": ["CT", 1.98, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2011M": {"P1": ["CT", 2.25, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.75, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2033M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR2036M": {"P1": ["CT", 2.25, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.75, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2039M": {"P1": ["CT", 2.25, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.75, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2041M": {"P1": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"], "P4": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STR2047M": {"P1": ["CT", 3.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2048M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR2049M": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR2052M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P4": ["CT", 1.5, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2053M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "STR2055M": {"P1": ["CT", 3.0, 30, 60, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STR2056M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "STR2057M": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STR2058M": {"P1": ["CT", 2.25, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.75, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2059M": {"P1": ["CT", 2.25, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.75, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2060M": {"P1": ["CT", 2.25, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 0.75, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STR2061M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "STRLG01M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "STRLG02M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "STU1003L": {"P1": ["CT", 2.4, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "STU1005L": {"P1": ["CT", 1.2, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "STU1005M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1006L": {"P1": ["CT", 1.2, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "STU1007L": {"P1": ["CT", 2.4, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.6, 0, 0, "?/"]}, "STU1016M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1019M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1020M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1035M": {"P1": ["CT", 1.8, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "STU1060M": {"P1": ["CT", 1.5, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1064M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1069M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU1070M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU1071M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU1072M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU1073M": {"P1": ["CT", 1.8, 60, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.2, 30, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "STU1074M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STU1075M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "STU1077M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.5, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STU1078M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 3.0, 40, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STU1079M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "STU1080M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1082M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1083M": {"P1": ["CT", 1.05, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.95, 0, 0, "?/"]}, "STU1084M": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1085M": {"P1": ["CT", 1.5, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1086M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU1087M": {"P1": ["CT", 3.0, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STU1088M": {"P1": ["CT", 3.0, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STU1089M": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1090M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1091M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1092M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1093M": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1094M": {"P1": ["CT", 1.5, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU1095M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STU1096M": {"P1": ["CT", 3.0, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"]}, "STU1097M": {"P1": ["CT", 2.1, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "STU1098M": {"P1": ["CT", 2.1, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "STU2002L": {"P1": ["CT", 3.6, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 2.4, 0, 0, "?/"]}, "STU2008L": {"P1": ["CT", 6.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "STU2010M": {"P1": ["CT", 2.4, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 0.6, 0, 0, "?/"]}, "STU2018L": {"P3": ["CCI", 6.0, 0, 90, "?/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STU2020L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "STU2021L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU2022L": {"P1": ["CT", 3.0, 120, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "STU2024L": {"P1": ["CT", 3.0, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "STU2025L": {"P1": ["CT", 3.0, 120, 120, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "STU2026L": {"P1": ["CT", 100.0, 90, 90, "Epreuve pratique (TP, clinique, pratique physique et sportive...)/Epreuve pratique (TP, clinique, pratique physique et sportive...)"]}, "STU2027L": {"P1": ["CT", 100.0, 0, 0, "Mise en situation (stage, simulation de situations...)/Mise en situation (stage, simulation de situations...)"]}, "STU2028L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2029L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2030L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "STU2031L": {"P1": ["CT", 1.8, 90, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "STU2040M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2043M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2058M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU2059M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU2060M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU2061M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU2062M": {"P3": ["CCI", 100.0, 0, 0, "?/"]}, "STU2063M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2064M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STU2065M": {"P1": ["CT", 1.8, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.2, 12, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STU2066M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2067M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 15, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STU2068M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STU2069M": {"P3": ["CCI", 3.0, 0, 0, "?/"]}, "STU2070M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STU2071M": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "STU2072M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2073M": {"P1": ["CT", 1.8, 120, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "STU2074M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2075M": {"P1": ["CT", 1.5, 90, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P4": ["CT", 1.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STU2076M": {"P1": ["CT", 1.5, 150, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2077M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU2078M": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 1.5, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STU2079M": {"P1": ["CT", 18.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 12.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "STU3001L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P4": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STU3009L": {"P1": ["CT", 3.0, 120, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 3.0, 0, 0, "?/"]}, "STU3010L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3020L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3027L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3046L": {"P1": ["CT", 1.2, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "STU3048L": {"P1": ["CT", 3.0, 0, 30, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STU3059L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3060L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3064L": {"P1": ["CT", 3.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "STU3066L": {"P1": ["CT", 1.5, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3070L": {"P1": ["CT", 1.5, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3074L": {"P1": ["CT", 1.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 0.3, 0, 0, "?/"], "P4": ["CT", 1.2, 15, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STU3077L": {"P1": ["CT", 4.5, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3078L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3079L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3080L": {"P1": ["CT", 1.5, 10, 10, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "STU3081L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3082L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3083L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3084L": {"P1": ["CT", 3.0, 0, 90, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STU3085L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3086L": {"P1": ["CT", 1.5, 90, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3087L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3088L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3089L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3090L": {"P1": ["CT", 1.8, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.2, 0, 0, "?/"]}, "STU3091L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3092L": {"P1": ["CT", 1.5, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3093L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3094L": {"P1": ["CT", 1.5, 60, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3095L": {"P1": ["CT", 2.1, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 0.9, 0, 0, "?/"]}, "STU3096L": {"P1": ["CT", 1.5, 90, 20, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3097L": {"P1": ["CT", 1.5, 90, 90, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P3": ["CC", 1.5, 0, 0, "?/"]}, "STU3098L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3099L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3100L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3101L": {"P1": ["CT", 3.0, 0, 20, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Epreuve orale (soutenance de stage, examen oral...)"], "P4": ["CT", 3.0, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "STU3102L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "STU3104L": {"P1": ["CT", 1.2, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 1.8, 0, 0, "?/"]}, "STU3105L": {"P1": ["CT", 4.8, 20, 20, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"], "P3": ["CC", 7.2, 0, 0, "?/"]}, "TR101MX2": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR102MX2": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR103MX3": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR201MX2": {"P1": ["CT", 3.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "TR202MX2": {"P1": ["CT", 3.0, 30, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"]}, "TR203MXJ": {"P1": ["CT", 6.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR204MXJ": {"P1": ["CT", 3.0, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR205MXJ": {"P1": ["CT", 3.0, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR206MXJ": {"P1": ["CT", 3.0, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR207MXJ": {"P1": ["CT", 3.0, 30, 30, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR208MXJ": {"P1": ["CT", 15.0, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/"], "P4": ["CT", 15.0, 30, 0, "Epreuve orale (soutenance de stage, examen oral...)/"]}, "TR7105E": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TR80103E": {"P1": ["CT", 3.0, 60, 60, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TRIP01L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TRIP01M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TRIP02L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TRIP02M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TRIP03L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TRIP03M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TRIP04L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TRIP04M": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1208L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1210L": {"P3": ["CCI", 1.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1211L": {"P1": ["CT", 1.34, 40, 40, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"], "P2": ["CP", 0.66, 20, 0, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TVL1212L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1213L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1214L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1215L": {"P1": ["CT", 0.51, 0, 0, "Production \u00e9crite (m\u00e9moire, rapport, dossier...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"], "P2": ["CP", 0.49, 5, 0, "Epreuve orale (soutenance de stage, examen oral...)/Production \u00e9crite (m\u00e9moire, rapport, dossier...)"]}, "TVL1216L": {"P3": ["CCI", 1.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1217L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1218L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1219L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1224L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1225L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1226L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL1227L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2125L": {"P1": ["CT", 2.0, 50, 50, "Epreuve \u00e9crite (sur table, QCM, tablette, ...)/Epreuve \u00e9crite (sur table, QCM, tablette, ...)"]}, "TVL2127L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2128L": {"P3": ["CCI", 1.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2129L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2130L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2131L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2132L": {"P1": ["CT", 1.0, 5, 5, "Production audiovisuelle (vid\u00e9o...)/Production audiovisuelle (vid\u00e9o...)"]}, "TVL2133L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2134L": {"P3": ["CCI", 1.0, 0, 90, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2135L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2136L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2137L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2140L": {"P1": ["CT", 2.0, 20, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "TVL2141L": {"P1": ["CT", 2.0, 20, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "TVL2142L": {"P1": ["CT", 3.0, 20, 15, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "TVL2145L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2146L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2147L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2148L": {"P3": ["CCI", 3.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2153L": {"P1": ["CT", 1.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "TVL2158L": {"P3": ["CCI", 5.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2159L": {"P3": ["CCI", 5.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2162L": {"P3": ["CCI", 5.0, 0, 60, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL2163L": {"P3": ["CCI", 5.0, 0, 30, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL3050L": {"P3": ["CCI", 1.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL3051L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL3052L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL3053L": {"P3": ["CCI", 2.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL3055L": {"P1": ["CT", 1.0, 30, 30, "Epreuve orale (soutenance de stage, examen oral...)/Epreuve orale (soutenance de stage, examen oral...)"]}, "TVL3056L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}, "TVL3057L": {"P3": ["CCI", 6.0, 0, 0, "?/Ensemble d'\u00e9preuves diverses"]}};

function ade_url_js(resources, weeks, fusion_ressource)
{
  if ( weeks === undefined )
    weeks = '21,22,23' ;

  var url = 'http://adeweb.univ-lyon1.fr/ade/custom/modules/plannings/direct_planning.jsp?displayConfId=35&login=lecteur&password=lambda&days=0,1,2,3,4&projectId=25&resources='+resources+'&weeks='+weeks; ;
  if ( fusion_ressource )
     url = url.replace('displayConfId=35', 'displayConfId=71') ;
  if ( ! is_a_teacher )
     url = url.replace('showTree=true', 'showTree=false') ;
  return url ;
}

function ade_goto_url(resources, weeks, fusion_ressource)
{
   window.location = ade_url_js(resources, weeks, fusion_ressource) ;
}



/* Javacript from spiral.py file */

function the_spiral_link(code)
{
  if ( code === undefined )
      code = table_attr.code ;
  if ( code <= 0 )
    return ;
  return hidden_txt(
  '<a target="_blank" href="http://offre-de-formations.univ-lyon1.fr/front_fiche_ue.php?UE_ID='
  + code + '">La fiche Offre de Formations</a>',
 'Suivez ce lien pour voir la fiche de cette<br>UE dans l\'offre de formation');
}
table_info.push([0, the_spiral_link]) ;

function the_spiral_formation()
{
  table_attr.formation.sort(function(a,b) { return a[3] - b[3] ; }) ;
  var s = 'Semestres : ' ;
  for(var i in table_attr.formation)
    {
     i = table_attr.formation[i] ;
     s += hidden_txt('<a target="_blank" href="http://offre-de-formations.univ-lyon1.fr/parcours-' + i[0] + '/.html">' + i[3] + '</a> ',
               i[2] + '<hr>'
            + 'Parcours :<br><b><small>'
            + html(i[1]).replace("/","</small></b><hr>Mention :<br><b><small>")
            + '</small></b><!--INSTANTDISPLAY-->') ;
    }
  return s ;
}
table_info.push([0.5, the_spiral_formation]) ;

function the_etapes()
{
  var s = hidden_txt('Module', 'Au sens de GASEL') + ' : ' ;
  for(var i in table_attr.etapes)
    {
     s += ' ' + hidden_txt(i, '<!--INSTANTDISPLAY-->'
                              + table_attr.etapes[i].join('<br>')) ;
    }
  return s ;
}

table_info.push([0.51, the_etapes]) ;

function bilan_link(login)
{
   return add_ticket('https://tomuss.univ-lyon1.fr/S/affichage_bilan', the_login(login)) ;
}

function the_ade_links(code, a_year, a_semester)
{
  var i ;

  if ( code === undefined )
    {
      if ( table_attr.adeweb != undefined )
         for(i in table_attr.adeweb)
            break ;

      if ( i === undefined )
         return ;
      code = table_attr.adeweb ;
    }
  if ( ! a_year )
     a_year = year ;
  if ( ! a_semester )
     a_semester = semester ;

  var resources = [] ;
  for(var r in code)
     resources.push(r) ;
  if ( resources.length == 0 )
     return '' ;

  resources = resources.join(",") ;

  var weeks, univ_year = a_year ;
  if ( a_semester === 'Automne' )
     weeks = '4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22' ;
  else
    {
    weeks = '24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45' ;
    univ_year-- ;
    }
  var ade_start_week = new Date(univ_year,7,9) ; // Sunday
  var today = new Date();
  var wn = Math.floor((today.getTime() - ade_start_week.getTime())
           / (1000*60*60*24*7));
  return 'Planning : <small><small>'
    + hidden_txt('<a  target="_blank" href="'
                 + ade_url_js(resources, weeks) + '">Total</a>',
                'Voir le planning ADE du semestre pour cette UE')
    + ' '
    + hidden_txt('<a  target="_blank" href="' + ade_url_js(resources,wn-1)
                 + '">Dernière</a>',
                 'Seulement la semaine dernière')
    + ' '
    + hidden_txt('<a  target="_blank" href="' + ade_url_js(resources,wn)
                 + '">Courante</a>',
                 'Seulement cette semaine')
    + ' '
    + hidden_txt('<a  target="_blank" href="' + ade_url_js(resources,wn+1)
                 + '">Suivante</a>',
                 'Seulement la semaine prochaine')
    + '</small></small>' ;
}
// table_info.push([1, the_ade_links]) ;


var login_to_id_u = {'o':'0','p':'1','q':'2','r':'3','s':'4',
	             't':'5','u':'6','v':'7','w':'8','x':'9'} ;

function login_to_id(login)
{
  if ( login.match && login.match(/[opqrstuvwx][0-9]{7}/i) ) {
        login = login.toString().toLowerCase();
        return login_to_id_u[login.substr(0,1)] + login.substr(1) ;
	}
  return login ;
}

var id_u_to_login = {} ;
for(var i in login_to_id_u)
   id_u_to_login[login_to_id_u[i]] = i ;

function the_login(login)
{
  if ( login.toString().match(/[0-9]{8}/) )
        return id_u_to_login[login.substr(0,1)] + login.substr(1) ;
  return login ;
}


function signature_new(sl)
{
  signature_new.student_login = sl ;
  create_popup('import_div', _("LABEL_signature_new"),
               _("MSG_signature_new"),
	       '<input id="signature_send_mail" type="checkbox" checked>' +
	       _("MSG_signature_send_mail") + '</input><br>' +
               '<button onclick="signature_add()">' +
	       _("MSG_signature_create") + '</button>',
	       _("MSG_signature_example")
	      ) ;
}

function signature_add()
{
  var send_mail = document.getElementById("signature_send_mail").checked ;
  send_mail = Number(send_mail) ;
  var message = popup_value().join('\n') ;
  if ( message.match(/{{{[^}]+}}}/) )
  {
    window.location = add_ticket('signature_new/'
      + signature_new.student_login
      + '/' + send_mail + '/' + encode_uri(message)) ;
  }
  else
    Alert("ALERT_signature_miss_button") ;
}

function create_table() {
    create_popup('create_table',
        year_semester() + " : " + _("TITLE_create_table"),
        _("MSG_create_table_code") + '<br>'
        + '<input id="create_table_code" maxlength="20">' + '<br>'
        + _("MSG_create_table_title") + '<br>'
        + '<input id="create_table_title" style="width:100%">' + '<br>'
        + _("MSG_create_table_private") + '<br>'
        + '<textarea id="create_table_private"></textarea>'
        + _("BEFORE_table_official_ue")
        + '<select id="create_table_visible">'
        + '<option>' + _("SELECT_table_official_ue_false") + '</option>'
        + '<option selected>' + _("SELECT_table_official_ue_true")
        + '</option>'
        + '</select><br>'
        , '<button onclick="create_table_do()">'
        + _("MSG_create_table_do") + '</button>',
        false);
}

function create_table_do() {
    var code = document.getElementById("create_table_code").value;
    var title = document.getElementById("create_table_title").value;

    if (code === '' || encode_uri(code) != code) {
        Alert("MSG_create_table_code_nice");
        return;
    }

    var u = add_ticket("create_table/" + year_semester() + "/"
        + code + "/" + encode_uri(title) + "/"
        + encode_uri(document.getElementById("create_table_private").value) + "/"
        + document.getElementById("create_table_visible").selectedIndex);
    create_popup('create_table',
        year_semester() + " : " + _("TITLE_create_table"),
        '<iframe src="' + u + '" style="width: 100%"></iframe>',
        '', false);
}
function snwenablesubmit()
{
  document.getElementById('snwsubmit').disabled = 0 ;
}

var liste_des_epreuves ;

function select_epreuve(i)
{
  /*cod_epr, cod_ses, lib_epr, tem_snw, lib_elp, deb, fin, typ, col, gpe, lib_gpe*/
  lib = liste_des_epreuves[i][2];
  if (liste_des_epreuves[i][3] == 'N')
    lib = liste_des_epreuves[i][4];
  document.getElementById('code_epreuve').value =
    liste_des_epreuves[i][0] + '\001'
    + liste_des_epreuves[i][1] + '\001'
    + lib + '\001'
    + liste_des_epreuves[i][3] + '\001'
    + liste_des_epreuves[i][7] + '\001'
    + liste_des_epreuves[i][8] + '\001'
    + liste_des_epreuves[i][9];
  document.getElementById("liste_epreuves").innerHTML =
    '<iframe style="width: 100%; height:400px" name="snw_result"></iframe>';
  var form=document.getElementById('popup_id').getElementsByTagName("FORM")[0];
  form.target = "snw_result" ;
  form.submit() ;
}

function liste_epreuves(epreuves)
{
  liste_des_epreuves = epreuves ;
  var e = document.getElementById("liste_epreuves") ;
  if ( epreuves.length == 0 )
  {
    e.innerHTML = '' ;
    return ;
  }
  document.getElementById('snw_old').style.display = 'none' ;
  /*cod_epr, cod_ses, lib_epr, tem_snw, lib_elp, deb, fin, typ, col, gpe, lib_gpe*/

  var s = '<div id="snw_new">Choisissez votre épreuve en cliquant sur les dates de saisie des notes :</br>';
  s += '<table class="colored">';
  s += '<tr><th width=12%>Code</th>';
  s += '<th>Intitulé</th>';
  s += '<th width=25%>Session 1</th>';
  s += '<th width=25%>Session 2</th></tr>';
  var epreuve_courante = "";
  var nb_session = 0;
  for(var i in epreuves)
  {
    var ferme = "";
    var color = "";
    var my_session = "" + epreuves[i][1];
    if(my_session == '0')
        my_session = 'Unique';

    var ouverture = "";
    if(epreuves[i][5] && epreuves[i][6]){
        ouverture = epreuves[i][5] + "-" + epreuves[i][6];
        var dmin = epreuves[i][5].split('/');
        dmin = dmin[2] + dmin[1] + dmin[0];
        var dmax = epreuves[i][6].split('/');
        dmax = dmax[2] + dmax[1] + dmax[0];
        if( dmin > today || today > dmax)
          color = ' style="color:grey;"';

    }

    if(epreuves[i][3] == 'N'){
        ferme = "fermé dans snw";
        ouverture = "";
    }
    if(epreuves[i][3] == 'N')
      color = ' style="color:grey;"';

    if(epreuve_courante != epreuves[i][0] + epreuves[i][10]){
      if(epreuve_courante != ""){
        if(nb_session == 1)
          s += '<td>';
        s += '</tr>';
        nb_session = 0;
      }
      s += '<tr><td>' + epreuves[i][0];
      s += '<td>' + epreuves[i][2];
      if(epreuves[i][10] != 'X'){
        s +=  '-' + epreuves[i][10];
      }
      if(my_session == 2){
        nb_session += 1;
        s += '<td>';
      }
    }
    s += '<td>';
    nb_session += 1;
    s += '<a href="javascript:select_epreuve(' + i + ')"' + color + '>';
    s += ferme + ouverture + '</a>';
    if(epreuve_courante != epreuves[i][0] + epreuves[i][10]){
      epreuve_courante = epreuves[i][0] + epreuves[i][10];
    }
    
  }
  s += '</tr></table>';
  s += "Si cette procédure ne fonctionne pas (groupes par exemple) : <a href=\"javascript:";
  s += "document.getElementById('snw_old').style.display = 'block';" ;
  s += "document.getElementById('snw_new').style.display = 'none';" ;
  s += 'undefined' ;
  s += "\">utilisez l'ancienne</a>.";
  s += '</div>';
  e.innerHTML = s ;
}
window.liste_epreuves = liste_epreuves ;

function snw()
{
  if ( the_current_cell.column.min != 0 )
  {
    alert("La valeur minimale pour les notes doit être 0") ;
    return ;
  }
  
  var grades = [] ;
  var data_col = the_current_cell.data_col ;
  for(var line in filtered_lines)
  {
    line = filtered_lines[line] ;
    if ( line[0].value === '' )
      continue ;
    grades.push("('" + line[0].value + "',"
		+ js(the_current_cell.column.do_rounding(line[data_col].value))
		+ "),") ;
  }
  grades = encode_value('(' + grades.join('') + ')') ;
  var ue_code = ue.split('@')[0] ;
  create_popup(
    'import_div',
    "Remplir le fichier de note de SNW avec le contenu de la colonne «"
      + the_current_cell.column.title + '»',
      '<style>.import_div { max-height: 70% }</style>'
      + '<form target="_blank" action="'
      + add_ticket('snw/') + '"'
      +' enctype="multipart/form-data" method="post">'
      + '<div id="snw_old">'
      + '<h2>Procédure :</h2>'
      + "Un problème : lisez la <a target=\"_blank\" href=\"http://perso.univ-lyon1.fr/thierry.excoffier/TOMUSS/snw.html\">page d'explication détaillées</a>."
      + "<ul>"
      + '<li><p> Allez sur <a target="_blank" href="http://snw.univ-lyon1.fr/snw-web">SNW</a> '
      + 'pour sauvegarder le fichier CSV en cliquant sur «Extraire fichier».'
      + '<li><p> Sélectionnez le fichier CSV que vous venez d\'enregistrer :<br>'
      + '<input type="file" name="data" size="40" onchange="snwenablesubmit()">'
      +'<li><p>  <input id="snwsubmit" disabled="1" type="submit" name="snw" value="Envoyer le fichier à TOMUSS pour récupérer le fichier à importer">'
      + "<li><p> Importer le fichier dans SNW en cliquant sur «Importer fichier»."
      + '<li><p> <span style="background:#F88">'
      + "Vérifiez que SNW a bien été rempli.</span>"
      + "</ul></div>"
      +'<input type="hidden" name="grades" value="'
      + grades + '">'
      +'<input type="hidden" name="max" value="'
      + the_current_cell.column.max + '">'
      +'<input type="hidden" name="ue" value="'
      + encode_value(ue_code) + '">'
      +'<input type="hidden" name="year" value="'
      + encode_value(year) + '">'
      +'<input type="hidden" name="semester" value="'
      + encode_value(semester) + '">'
      +'<input type="hidden" name="column_title" value="'
      + encode_value(the_current_cell.column.title) + '">'
      +'<input id="code_epreuve" type="hidden" name="code_epreuve" value="">'
      + '<div id="liste_epreuves"><iframe style="width:100%" src="'
      + add_ticket('liste_epreuves/' + ue_code) + '"></iframe></div>'
      + '</form>'
    ,
    "",
    false) ;
}


var base = window.location.toString().split("mcc")[0] ;

function lance()
{
  var input = document.getElementById('UES') ;
  console.log(input.value);
  var location = base + "mcc" ;
  location += "/" + input.value ;
  window.location = location ;
}

function display_mcc(ues, table)
{
    var t = ["<br>Entrez une liste de code UE séparés par un espace<br>"];
    t.push('<input id="UES" value="');
    t.push(ues);
    t.push('" style="width:100%"></input>');
    t.push('<br><button onclick="lance()">Rechercher</button><br>');
    t.push("<table border>");
    t.push('<tr style="background-color:#999999;"><th>code UE<th>libellé UE');
    t.push("<th><span title='crédits'>crd</span>");
    t.push("<th><span title='Epreuve'>Epr</span>");
    t.push("<th>Nature épreuve");
    t.push("<th><span title='type épreuve'>Typ épr</span>");
    t.push("<th><span title='coéficient'>Coef</span>");
    t.push("<th><span title='Barême'>Bar</span>");
    t.push("<th><span title='session'>ses</span><th>Durée exam</tr>");
    var color_ligne = 0;
    var ancienne_ue = "";
    var color = "#FFFFFF";
    for(var ligne in table){
        if (table[ligne][0] != ancienne_ue){
            color_ligne = color_ligne + 1;
            ancienne_ue = table[ligne][0];
        }
        if (color_ligne % 2 == 1)
            color = "#FFFFFF";
        else
            color = "#999999";
/*# select
    # elp.cod_elp, elp.lib_elp, elp.nbr_crd_elp,
    # EP_ELP.cod_epr, EP_ELP.cod_ses, coe_obj_mnp,
    # ep.cod_nep, lib_nep, ep.cod_tep, lib_tep,
    # bar_sai_epr, DUR_EXA_S1_EPR, DUR_EXA_S2_EPR*/
        t.push('<tr style="background-color:' + color + ';">');
        t.push("<td>" + table[ligne][0]);
        t.push("<td>" + table[ligne][1]);
        t.push("<td>" + table[ligne][2]);
        t.push("<td>" + table[ligne][3].substr(-3)); // epr
        t.push("<td>" + table[ligne][7]); //lib nat epr
        t.push("<td>" + table[ligne][8]); //typ epr
//        t.push("<td>" + table[ligne][9]); //lib typ epr
        t.push("<td>" + table[ligne][5]); //coef
        t.push("<td>" + table[ligne][10]); // barême
        t.push("<td>" + table[ligne][4]); //session
        if (table[ligne][4] == '1')
            t.push("<td>" + table[ligne][11]); // durée examen S1
        else
            t.push("<td>" + table[ligne][12]); // durée examen S1


//        t.push("<td>" + table[ligne][6]); //nat epr

        t.push("</tr>");
    }
    t.push("</table>");

    return t.join("");
}

function display_page(ues, infos)
{
  document.write(display_mcc(ues, infos)) ;
}

