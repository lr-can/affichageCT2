/*
    TOMUSS: The Online Multi User Simple Spreadsheet
    Copyright (C) 2008-2014 Thierry EXCOFFIER, Universite Claude Bernard

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

// HTML elements
var student;
var dates;
var ampm;
var startdate;
var enddate;
var start;
var end;
var sendabj;
var sendmessage;
var datasend;
var da_list;
var comment;

//
var current_abjs;
var moving_date;
var old_login;

// Constants

var _today = new Date();

var get_image_queue = [];

var START_PM = 14;

function UE(_code, _logins, intitule) {
    return intitule;
}

function abj_init() {
    lib_init();
    student = document.getElementById('student');
    dates = document.getElementById('dates');
    ampm = document.getElementById('ampm');
    startdate = document.getElementById('startdate');
    enddate = document.getElementById('enddate');
    start = document.getElementById('start');
    end = document.getElementById('end');
    sendabj = document.getElementById('sendabj');
    sendmessage = document.getElementById('sendmessage');
    datasend = document.getElementById('datasend');
    da_list = document.getElementById('da');
    comment = document.getElementById('abjcomment');

    old_login = '';

    _today.setHours(0, 0, 0, 0);

    // Initialize date bar
    end.value = _today.formate('%d/%m/%Y %p');

    ampm.childNodes[ampm.childNodes.length - 1].full_time = end.value;
    ampm.childNodes[ampm.childNodes.length - 1].start_time = _today.getTime();

    var i = dates.childNodes.length - 2;

    while (i) {
        var td = dates.childNodes[i];
        var week_day = _today.getDay();

        td.innerHTML = _today.formate('%a<br>%d<br>%b');
        if (week_day === 0 || week_day == 6)
            td.className = 'weekend';

        td = ampm.childNodes[i * 2 - 1];
        td.innerHTML = ampms[0];
        if (week_day === 0 || week_day == 6)
            td.className = 'weekend';
        td.start_time = _today.getTime();
        td.full_time = _today.formate('%d/%m/%Y %p');
        _today.setHours(START_PM);

        td = ampm.childNodes[i * 2 + 1 - 1];
        td.innerHTML = ampms[1];
        if (week_day === 0 || week_day == 6)
            td.className = 'weekend';
        td.start_time = _today.getTime();
        td.full_time = _today.formate('%d/%m/%Y %p');

        _today.setHours(0);
        _today.setTime(_today.getTime() - 3600 * 1000);
        _today.setHours(0);

        i--;
    }

    start.value = _today.formate('%d/%m/%Y');

    enddate.style.position = "absolute";
    startdate.style.position = "absolute";


    _today = new Date();

    end.onchange = update_cursor_from_text;
    end.onkeypress = update_if_return; // IE bug
    start.onchange = update_cursor_from_text;
    start.onkeypress = update_if_return; // IE bug

    startdate.childNodes[1].onmousedown = start_move;
    enddate.childNodes[0].onmousedown = start_move;
    startdate.childNodes[1].onmouseup = stop_move;
    enddate.childNodes[0].onmouseup = stop_move;

    document.getElementById('body').onmousemove = moving;
    document.getElementById('body').onmouseup = stop_move;

    update_cursor();
    window.student_picture_url = student_picture_url;
    window.display_abjs = display_abjs;
    window.display_da = display_da;
    window.ues_without_da = ues_without_da;
    window.del_abj = del_abj;
    window.rem_da = rem_da;
    window.abi2abj = abi2abj;
    window.toggle_dis_button = toggle_dis_button;
    window.toggle_all_checkbox = toggle_all_checkbox;
}


function parse_date(t, allow_far_future) {
    var h;
    _today = new Date();

    if (t === undefined)
        return _today;
    // text = t.split(/[ \/AMPamp]/) ; /* \/ because of old netscape versions */
    text = t.toUpperCase().split(new RegExp('[ /' + ampms[0] + ampms[1] + ']'));
    if (text[0] === '')
        text[0] = _today.getDate();
    if (text.length == 1)
        text[1] = _today.getMonth() + 1;
    if (text.length == 2)
        text[2] = _today.getFullYear();
    var y = text[2];
    if (y < 100)
        y = Number(y) + (_today.getFullYear() / 100).toFixed(0) * 100;
    if (t.search(contains_pm) != -1)
        h = START_PM;
    else
        h = 0;

    if (!allow_far_future) {
        var _today = new Date();
        if (y > _today.getFullYear() + 1) {
            Alert("ALERT_abj_bad_year", y);
            y = _today.getFullYear();
        }
    }

    var d = new Date(y, text[1] - 1, text[0], h);

    return d;
}

function update_cursor_end(do_not_update_arrow) {
    var e = parse_date(end.value).getTime();

    for (var i = 1; ; i++) {
        var td = ampm.childNodes[i];
        if (td === undefined) {
            enddate.td_index = i;
            enddate.style.left = "auto";
            enddate.style.right = 0;
            break;
        }
        if (e <= td.start_time) {
            enddate.td_index = i;
            if (!do_not_update_arrow)
                enddate.style.left = td.offsetLeft + td.offsetWidth
                    - enddate.childNodes[0].offsetWidth / 2 + 'px';
            break;
        }
    }
}

function update_cursor_start(do_not_update_arrow) {
    var e = parse_date(start.value).getTime();
    for (var i = 1; ; i++) {
        var td = ampm.childNodes[i];
        if (td === undefined)
            break;
        if (e < td.start_time) {
            startdate.td_index = i - 1;
            if (!do_not_update_arrow) {
                if (i == 1)
                    startdate.style.left = 0;
                else
                    startdate.style.left = td.offsetLeft - start.offsetWidth
                        - td.offsetWidth - startdate.childNodes[1].offsetWidth / 2 + 'px';
            }
            break;
        }
    }
}

function nice_date_short(d) {
    return parse_date(d).formate('%d/%m/%Y%p');
}

function nice_date(d) {
    return parse_date(d).formate('%d/%m/%Y %P');
}

function date_to_store(d) {
    return parse_date(d).formate('%d/%m/%Y/%p');
}

function update_button_real() {
    sendabj.innerHTML = _("MSG_abj_save") + '\n'
        + nice_date(date_to_store(start.value))
        + '\n' + _("TH_until") + '\n' + nice_date(date_to_store(end.value));
    sendmessage.value = _("MSG_message_save") + ' ' + comment.value;
}

function update_button() {
    var invalid = parse_date(start.value).getTime() > parse_date(end.value).getTime();
    if (invalid) {
        if (moving_date == enddate)
            start.value = end.value;
        else
            end.value = start.value;
    }
    update_button_real();
    return invalid;
}

function update_cursor(do_not_update_arrows) {
    do_not_update_arrows &= !update_button(); // Must update if invalid
    update_cursor_start(do_not_update_arrows);
    update_cursor_end(do_not_update_arrows);

    for (var i = 0; ; i++) {
        var td = ampm.childNodes[i];
        if (td === undefined)
            break;
        if (i >= startdate.td_index && i <= enddate.td_index)
            td.style.background = "white";
        else
            td.style.background = "#DDD";
    }

}

function update_cursor_from_text(event) {
    event = the_event(event);
    input = event.target;
    input.value = date_to_store(input.value);
    update_cursor();
}

function time_stamp() {
    var t = new Date();
    return t.getTime();
}

/*REDEFINE
  Return true if it is a student login
*/
function is_a_student_login() {
    var v = student.value.replace(/[^a-zA-Z0-9-_.]/g, "");
    return v.length >= 8;
}

function get_image(src) {
    datasend.contentWindow.location.replace(baset + student.value + src + '/' + time_stamp());
}

function send_abj() {
    popup_close();
    if (!is_a_student_login())
        return;

    for (var abj in current_abjs) {
        if (date_to_store(current_abjs[abj][0]) == date_to_store(start.value)
            && date_to_store(current_abjs[abj][1]) == date_to_store(end.value)) {
            Alert("ALERT_abj_duplicate");
            return;
        }
    }
    // The    + ' '    is here to avoid // replacement by / with IE
    get_image('/addabj/' +
        date_to_store(start.value) + '/' + date_to_store(end.value)
        + '/' + encode_uri(comment.value + ' '));
    comment.value = '';
}

function send_message() {
    comment.value = '{{{MESSAGE}}}' + comment.value;
    start.value = end.value = _today.formate('%d/%m/%Y %p');
    send_abj();
}

function del_abj(fro, to) {
    get_image('/delabj/' + date_to_store(fro) + '/' + date_to_store(to));
}

function moving(event) {
    if (moving_date === undefined)
        return true;

    event = the_event(event);

    var input, arrow;

    if (moving_date == startdate) {
        input = moving_date.childNodes[0];
        arrow = moving_date.childNodes[1];
        moving_date.style.left = event.x - input.offsetWidth -
            arrow.offsetWidth / 2 + 'px';
    }
    else {
        input = moving_date.childNodes[1];
        arrow = moving_date.childNodes[0];
        moving_date.style.left = event.x - arrow.offsetWidth / 2 + 'px';
    }

    for (var i = 1; ; i++) {
        var td = ampm.childNodes[i];
        if (td === undefined)
            break;
        if (event.x < td.offsetLeft + td.offsetWidth) {
            // comment.value = event.x + ' ' + td.offsetLeft + ' '+  td.offsetWidth ;
            if (input.value != td.full_time) {
                input.value = td.full_time;
                update_cursor(true);
            }
            break;
        }
    }
    stop_event(event);
    return false;
}

function start_move(event) {
    event = the_event(event);
    moving_date = event.target.parentNode;
    stop_event(event);
    return false;
}

function update_if_return(event) {
    event = the_event(event);
    if (event.keyCode == 13) {
        update_cursor_from_text(event);
        stop_event(event);
        return false;
    }
    return true;
}

function stop_move(_event) {
    moving_date = undefined;
    return false;
}

function abi2abj_is_allowed() {
    for (var student_etape of STUDENT_ETAPES)
        for (var allowed_etape of ABI2ABJETAPES)
            if ( student_etape.match(allowed_etape) )
                return true;
    return confirm(_('ALERT_abi2abj'));
}

function abi2abj(element, column, year, semester, table, student, dis) {
    if (semester != 'P') {
        if ( ! abi2abj_is_allowed() )
            return;
    }
    element.disabled = true;
    if (dis === 1) {
        action = 'abi2dis';
        column = '';
        for (let check of element.parentNode.getElementsByClassName('stages'))
            if (check.checked)
                column += check.id + ',';
        if (column.length === 0)
            element.disabled = false
        else
            for (let elt of element.parentNode.getElementsByTagName('INPUT'))
                elt.disabled = true;
    } else
        action = 'abi2abj';
    for (let col of column.split(',')) {
        if (col.length === 0)
            continue;
        var feedback = document.createElement('IFRAME');
        feedback.style = "height: 1.4em; width: 5em; border: 0px; vertical-align: bottom;"
        feedback.src = url + '/' + action + '/' + student + '/' + year + '/' + semester + '/' + table + '/' + col
            + '?ticket=' + ticket;
        element.parentNode.insertBefore(feedback, element.nextSibling);
    }
}

function display_abjs(abjs) {
    datasend.style.opacity = 1;
    current_abjs = abjs;
    if (abjs.length == 0)
        return '';
    s = '<TABLE class="display_abjs colored">';
    s += '<TR><TH COLSPAN="7">' + _("TH_abj_list") + '</TH></TR>';
    s += '<TR><TH>' + _("TH_begin") + '</TH><TH>' + _("TH_end") + '</TH><TH>'
        + _("TH_length") + '</TH><TH>' + _("TAB_column_action") + '</TH><TH>'
        + _("TH_abj_author") + '</TH><TH>' + _("TH_comment") + '</TH><TH>'
        + _("TH_abi2abj") + '</TH></TR>';
    var abj_days = 0;
    for (var i in abjs) {
        var abj_infos = abjs[i];
        var d = (0.5 + (parse_date(abj_infos[1]).getTime()
            - parse_date(abj_infos[0]).getTime()) / (1000 * 86400));
        var before, message = html(abj_infos[3]);
        if (message.substr(0, 13) == '{{{MESSAGE}}}') {
            before = '<TD colspan="3">' + nice_date_short(abj_infos[0]);
            message = '<span style="background:#F00;color:#FFF">'
                + message.replace('{{{MESSAGE}}}', '') + '</span>';
        }
        else {
            before = '<TD>' + nice_date_short(abj_infos[0])
                + '<TD>' + nice_date_short(abj_infos[1])
                + '<TD style="text-align:right">' + d.toFixed(1);
            abj_days += d;
        }
        var abi2abj = [];
        var abi_col_list = [];
        for (var i in abj_infos[4]) {
            var infos = abj_infos[4][i];
            var column_title = infos[0];
            var column_date = infos[infos.length - 1];
            var new_value = abj;
            if (infos.length == 3) { // From /P/ table
                var year = infos[1][3];
                var table = infos[1][4];
                var comment = infos[1][1].split(/ /);
                var course = comment[0];
                var teacher = comment[1];
                var value = infos[1][0];
                var semester = 'P';
                if (value.match(/@/))
                    new_value += '@';
                var label = get_date_tomuss(column_date).formate('%d/%m/%Y %H:%M') + ' ' + course + ' ' + teacher;
            }
            else {
                var year = infos[1];
                var semester = infos[2];
                var table = infos[3];
                var value = infos[4];
                var label = get_date_tomuss(column_date).formate('%d/%m/%Y') + ' ' + table;
            }
            if (abi_col_list.includes(column_title))
                continue;
            abi_col_list.push(column_title);
            abi2abj.push('<button onclick="window.parent.abi2abj(this,\''
                + column_title + "','" + year + "','" + semester + "','" + table + "','" + student.value
                + '\',0)">' + value + ' → ' + new_value + '</button> ' + label
            );
        }
        abi2abj = abi2abj.join('<br>')

        s += '<TR>' + before
            + '<TD><A href="#" onclick="window.parent.del_abj(\''
            + date_to_store(abj_infos[0]) + '\',\''
            + date_to_store(abj_infos[1]) + '\');return false;">'
            + _("B_home_delete_table") + '</a>'
            + '<TD>' + abj_infos[2]
            + '<TD>' + message
            + '<TD>' + abi2abj
            + '</TR>';
    }
    s += '</TABLE>';
    s += _("TH_abj_duration") + abj_days.toFixed(1);
    return s;
}

function display_da(das) {
    current_da = das;
    if (das.length == 0)
        return '';
    s = '<TABLE class="display_da colored">'
        + '<TR><TH COLSPAN="6">' + _("TH_da_list") + '</TH></TR>'
        + '<TR><TH>UE</TH><TH>' + _("TH_length") + '</TH><TH>'
        + _("TAB_column_action") + '</TH><TH>' + _("TH_abj_author") + '</TH><TH>'
        + _("TH_comment") + '</TH><TH>'
        + _("TH_abi2abj") + '</TH></TR>';
    for (var da in das) {
        let stages_checkbox = [];
        if (das[da][5].length > 0)
            stages_checkbox.push(' <label><input type="checkbox" onclick="window.parent.toggle_all_checkbox(this)"> '
                + _("MSG_abj_check_all") + ' : </label>');
        let abi_col_list = [];
        for (let col of das[da][5]) {
            let col_date = get_date_tomuss(col[0]).formate('%d/%m/%Y')
            if (abi_col_list.includes(col[1]))
                continue;
            abi_col_list.push(col[1]);
            stages_checkbox.push('<label><input id="' + col[1] + '" class="stages" type="checkbox" onclick="window.parent.toggle_dis_button(this)"> '
                + col_date + ' ; </label>');
        }
        s += '<TR><TD>' + das[da][0] +
            '</TD><TD>' + das[da][2] + ' ' + das[da][1] +
            '</TD><TD><A href="#" onclick="window.parent.rem_da(\'' + das[da][0] +
            '\');return false;">' + _("B_home_delete_table") + '</a>' +
            '</TD><TD>' + das[da][3] +
            '</TD><TD>' + html(das[da][4]) +
            '</TD><TD><fieldset style="border:none"><button onclick="window.parent.abi2abj(this,'
            + '\'\',\'' + das[da][1] + "','" + das[da][2] + "','" + das[da][0] + "','" + student.value
            + '\',1)" disabled="true">' + _("abi") + ' → ' + 'DISPENSE</button>' + stages_checkbox.join('')
            + '</fieldset></TD></TR>';
    }
    s += '</TABLE>';
    if (get_image_queue.length)
        get_image(get_image_queue.pop());
    return s;
}

function toggle_dis_button(element) {
    element = element.parentNode.parentNode;
    for (let checkbox of element.getElementsByTagName('INPUT'))
        if (checkbox.checked) {
            element.getElementsByTagName('BUTTON')[0].disabled = false;
            return;
        }
    element.getElementsByTagName('BUTTON')[0].disabled = true;
}

function toggle_all_checkbox(element) {
    for (let checkbox of element.parentNode.parentNode.getElementsByClassName('stages'))
        if (element.checked)
            checkbox.checked = true;
        else
            checkbox.checked = false;
    toggle_dis_button(element);
}

function toggle_all_da(element) {
    toggles = document.getElementsByTagName('INPUT');
    for (var i in toggles)
        if (toggles[i].getAttribute('code_ue'))
            toggles[i].checked = element.checked;
}

function ues_without_da(da) {
    var content = ['<div style="margin-left: 2em">'];
    if (STUDENT_ETAPES.length)
        for (var i in STUDENT_ETAPES)
            da.push('etape-' + STUDENT_ETAPES[i]);
    else
        da.push('etape-inconnue');
    if (da.length) {
        if (da.length > 3)
            content.push('<p><label><input type="checkbox" onclick="toggle_all_da(this)">'
                + _("MSG_all") + '</label>');
        for (var i in da)
            content.push('<p><label><input type="checkbox" code_ue="' + da[i] + '">'
                + da[i] + ' ' + html(all_ues[da[i]] || all_ues[da[i].split('-')[1]] || '?')
                + '</label>');
    }
    else
        content.push(_("F_empty"));
    content.push('</div>');
    da_list.innerHTML = content.join('');
}

function add_an_da() {
    popup_close();
    if (!is_a_student_login())
        return;
    var dateda = date_to_store(document.getElementById('dateda').value);
    dateda = dateda.substr(0, dateda.length - 2); // Remove /M /A
    document.getElementById('dateda').value = dateda;

    var inputs = da_list.getElementsByTagName('INPUT')
    for (var i = 0; i < inputs.length; i++)
        if (inputs[i].checked && inputs[i].getAttribute('code_ue'))
            get_image_queue.push('/add_da/' + inputs[i].getAttribute('code_ue')
                + '/' + dateda + '/' + encode_uri(comment.value + ' '));
    get_image(get_image_queue.pop());
    comment.value = '';
}

function rem_da(ue) {
    get_image('/rem_da/' + ue);
}

function login_change_force() {
    if (!is_a_student_login())
        return;

    get_image('/display');
}

function login_change() {
    if (student.value == old_login)
        return;
    datasend.style.opacity = 0.25;
    old_login = student.value;
    da_list.innerHTML = '';
    login_change_force();
}

function abj_choose_comment(event) {
    event = the_event(event);
    var a = event.target;
    comment.value = a.innerHTML;
    popup_close();
    comment.focus();
}

function abj_comment_list() {
    // c is in MSG_abj_predefined
    function c(t) {
        return ' <a onclick="abj_choose_comment(event)">' + _(t) + '</a> ';
    }

    create_popup('abj_comments', _("MSG_abj_why"), eval(_("MSG_abj_predefined")),
        "<br>" + _("MSG_abj_comment"), false);
}


function is_a_student_login() {
    return student.value.replace(/[^a-zA-Z0-9-_.]/g, "")
        .match('^([a-zA-Z0-9][0-9]{7}|[a-zA-Z]{2}[0-9]{8})$');
}
