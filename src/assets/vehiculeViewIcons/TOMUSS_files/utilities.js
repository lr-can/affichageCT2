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

  Contact: Thierry.EXCOFFIER@bat710.univ-lyon1.fr
*/
/*
SETTIMEOUT = setTimeout;
setTimeout = function(fct, b) {
    try { console.log("settimeout:" + display_data['Login']); } catch(e) { }
    function traced_fct() {
        var err = new Error();
        console.log(err);
        try { console.log("before:" + display_data['Login']); } catch(e) { }
        if(fct.toUpperCase)
            eval(fct);
        else
            fct();
        try { console.log("after:" + display_data['Login']);
            if ( ! display_data['Login'])
                console.log(fct.toString());
         } catch(e) { }
    }
    SETTIMEOUT(traced_fct,b);
}
*/

var languages;
var minors = [];

function __(txt) {
    var t;
    for (var i in languages) {
        t = translations[languages[i]];
        if (t && t[txt])
            return t[txt];
    }
    if (translations['fr'] && translations['fr'][txt])
        return translations['fr'][txt];
    return txt;
}

function _(txt) {
    try {
        languages = preferences.language.split(",");
        _ = __;
    }
    catch (e) {
        _ = function (x) { return x; }
    }
    return _(txt);
}

// Concatenate translations
function ___(txt) {
    txt = txt.split(/ +/);
    for (var i in txt)
        txt[i] = _(txt[i]);
    return ' '.join(txt);
}


function a_float(txt) {
    if (txt.replace)
        return Number(txt.replace(',', '.'));
    else
        return Number(txt);
}

function left_justify(text, size) {
    return (text + '                                       ').substr(0, size).replace(/ /g, '&nbsp;');
}

function two_digits(x) {
    if (x < 10)
        return '0' + x;
    return x.toString();
}

function title_case(txt) {
    var t = '';
    var up = true;
    txt = txt.toLowerCase();
    for (var i = 0; i < txt.length; i++) {
        var c = txt.substr(i, 1);
        if (c == ' ' || c == '-' || c == "'")
            up = true;
        else
            if (up) {
                c = c.toUpperCase();
                up = false;
            }
        t += c;
    }
    return t;
}

/*****************************************************************************/
/*****************************************************************************/
/* Date Time management */
/*****************************************************************************/
/*****************************************************************************/

function millisec() // Server time
{
    var d = new Date();
    return d.getTime() + millisec.delta;
}
millisec.delta = 0;

/* Return a Date from text like : JJ/MM/AAAA */
/* Or a number of day or hours or minutes from now as 5j 4h 3m */
function get_date(value) {
    var d, time;
    if (!value) // Current server time
        return new Date(millisec());

    value = value.toString();
    var v = value.split('/');

    if (v.length == 1 && isNaN(value.substr(value.length - 1))) {
        if (value.length <= 1)
            return false;

        v = Number(value.substr(0, value.length - 1));
        if (isNaN(v))
            return false;

        d = new Date();
        d.reverse = true;
        switch (value.substr(value.length - 1).toLowerCase()) {
            case 'a':
            case 'y': d.setTime(millisec() - v * 365 * 24 * 60 * 60 * 1000); break;
            case 'm': d.setTime(millisec() - v * 30 * 24 * 60 * 60 * 1000); break;
            case 'w':
            case 's': d.setTime(millisec() - v * 7 * 24 * 60 * 60 * 1000); break;
            case 'j':
            case 'd': d.setTime(millisec() - v * 24 * 60 * 60 * 1000); break;
            case 'h': d.setTime(millisec() - v * 60 * 60 * 1000); break;
            default: return false;
        }
        d.sup = d;
        return d;
    }

    if (v[2] !== undefined) {
        var x = v[2].split(/[ _]/);
        if (x.length == 2) {
            v[2] = x[0];
            x = x[1].split(/[:h]/);
            if (x.length == 2 && !isNaN(x[0]) && !isNaN(x[1]))
                time = [Number(x[0]), Number(x[1])];
        }
    }

    for (var i = 0; i < v.length; i++)
        if (isNaN(Number(v[i])))
            return false;

    if (v.length == 1) {
        d = new Date();
        v.push(d.getMonth() + 1);
    }
    if (v.length == 2) {
        d = new Date();
        v.push(d.getFullYear());
    }
    if (v.length == 3) {
        if (v[2] < 100)
            v[2] = Number(v[2]) + 2000;
        d = new Date(v[2], v[1] - 1, v[0]);
        d.sup = new Date();
        d.sup.setTime(d.getTime());
    }
    else
        return false;

    if (time === undefined)
        d.sup.setHours(23, 59, 59);
    else {
        d.setHours(time[0], time[1], 0);
        d.sup.setHours(time[0], time[1], 59);
    }
    return d;
}

function get_date_inf(value) {
    var d;
    var v = value.toString().split('/');
    if (v.length == 3) {
        d = new Date(v[2], v[1] - 1, v[0]);
        if (d)
            return d.getTime();
    }
    if (v.length == 4) {
        d = new Date(v[2], v[1] - 1, v[0], v[3]);
        if (d)
            return d.getTime();
    }
    return 1e100;
}

function get_date_sup(value) {
    var d;
    var v = value.toString().split('/');
    if (v.length == 3) {
        d = new Date(v[2], v[1] - 1, v[0]);
        if (d)
            return d.getTime() + 3600 * 24 * 1000;
    }
    if (v.length == 4) {
        d = new Date(v[2], v[1] - 1, v[0], v[3]);
        if (d)
            return d.getTime() + 3600 * 1000;
    }
    return -1e100;
}

function formatte_date(d) {
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}

function get_date_tomuss(yyyymmddhhmmss) {
    var year = yyyymmddhhmmss.slice(0, 4);
    var month = yyyymmddhhmmss.slice(4, 6);
    var day = yyyymmddhhmmss.slice(6, 8);
    var hours = yyyymmddhhmmss.slice(8, 10);
    var minutes = yyyymmddhhmmss.slice(10, 12);
    var seconds = yyyymmddhhmmss.slice(12, 14);
    return new Date(year, month - 1, day, hours, minutes, seconds);
}

function get_date_tomuss_short(yyyymmddMA) {
    var year = yyyymmddMA.slice(0, 4);
    var month = yyyymmddMA.slice(4, 6);
    var day = yyyymmddMA.slice(6, 8);
    var d = new Date(year, month - 1, day);
    d = d.formate('%d/%m/%Y');
    if (yyyymmddMA.substr(8) == ampms[0])
        d += ' ' + ampms_full[0];
    else if (yyyymmddMA.substr(8) == ampms[1])
        d += ' ' + ampms_full[1];
    return d;
}

// See strftime for documentation
Date.prototype.formate = function (format) {
    var ap = Number(this.getHours() >= 12);
    var ampm = ampms[ap];
    var ampm_full = ampms_full[ap];
    return format
        .replace('%Y', this.getFullYear())
        .replace('%m', two_digits(this.getMonth() + 1))
        .replace('%d', two_digits(this.getDate()))
        .replace('%H', two_digits(this.getHours()))
        .replace('%M', two_digits(this.getMinutes()))
        .replace('%S', two_digits(this.getSeconds()))
        .replace('%a', days[this.getDay()])
        .replace('%A', days_full[this.getDay()])
        .replace('%B', months_full[this.getMonth()])
        .replace('%b', months[this.getMonth()])
        .replace('%p', ampm)
        .replace('%P', ampm_full)
        ;
}


function date(x) {
    if (x === '')
        return '';
    return get_date_tomuss(x).formate('%a %d/%m/%Y %H:%M.%S');
}

function date_full(x) {
    if (x === '')
        return '';
    return get_date_tomuss(x).formate(_("MSG_full_date"));
}

function findPos(x) {
    var rect = x.getBoundingClientRect();
    return [rect.left + window.pageXOffset, rect.top + window.pageYOffset];
}
function findPosX(obj) {
    return findPos(obj)[0];
}

function findPosY(obj) {
    return findPos(obj)[1];
}

function dict_size(d) {
    var i = 0;
    for (var _ in d)
        i++;
    return i;
}

function html(t) {
    if (t.replace === undefined)
        return t.toString(); // Number
    else
        return t.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

function the_event(e) {
    if (e === undefined)
        e = window.event;
    if (e === undefined)
        return;
    var event = clone_event(e);
    event.real_event = e;

    if (event.pageX) {
        event.x = event.pageX;
        event.y = event.pageY;
    }
    if (e.touches) {
        if (e.touches.length == 1) {
            var finger0 = e.touches[0];
            event.x = finger0.pageX;
            event.y = finger0.pageY;
            event.one_finger = true;
        }
    }

    if (event.target === undefined)
        event.target = event.srcElement;

    return event;
}

function myindex(table, x) {
    if (table.indexOf)
        return table.indexOf(x);
    // For NodeList (not an Array) or Navigator with this method
    for (var i in table)
        if (table[i] === x)
            return Number(i);
    return -1;
}

function hidden_txt(html, help, classname, id, myonshow) {
    if (id)
        id = ' id="' + id + '"';
    else
        id = '';
    if (classname !== undefined)
        classname = ' ' + classname;
    else
        classname = '';
    if (myonshow === undefined)
        myonshow = '';

    if (html === undefined)
        html = '????????';
    html = html.toString();

    return '<div ' + id + 'class="tipped' + classname
        + '" onmouseover="TIP.must_display_or_update_tip(event);' + myonshow
        + '" onmouseout="TIP.hide_tip();' + myonshow + '"><div class="help"><p>'
        + help + '<div></div></div><div class="text">' + html + '</div></div>';
}


function hidden(html, help, classname, id) {
    document.write(hidden_txt(html, help, classname, id));
}

// To synchronize with Python canonize and JavaScript decode_uri_option
function encode_uri(t) {
    // We use $ in place of % because we don't want the proxies
    // or Apache or Single Sign On services to mess with the data content.
    // $$ => $ by replace method (to cancel positionnal argument)
    return encodeURI(t)
        .replace(/\$/g, "$$24").replace(/\?/g, "$$3F").replace(/#/g, "$$23")
        .replace(/[.]/g, "$$2E").replace(/&/g, "$$26").replace(/\//g, "$$2F")
        .replace(/[+]/g, "$$2B").replace(/%0A/g, "$$0A").replace(/%0D/g, "$$0D")
        .replace(/@/g, "$$40").replace(/'/g, "$$27").replace(/"/g, "$$22");
}

function decode_uri(t) {
    return decodeURIComponent(t.toString().replace(/[$]/g, "%"));
}

function encode_uri_option(t) {
    return encode_uri(t).replace(/_/g, '_U')
        .replace(/[=]/g, '_E').replace(/:/g, '_C');
}

function decode_uri_option(t) {
    return decode_uri(t).replace(/_E/g, '=').replace(/_C/g, ':').replace(/_U/g, '_');
}

function encode_value(txt) {
    if (txt)
        return txt.replace(/&/g, "&#38;").replace(/"/g, '&#34;')
            .replace(/\?/g, "&#63;");
    return '';
}


function encode_lf_tab(txt) {
    return txt.replace(/\n/g, '⏎').replace(/\t/g, '⇥');
}

function decode_lf_tab(txt) {
    return txt.replace(/⏎/g, '\n').replace(/⇥/g, '\t');
}

// Adapted from Andrea Azzola's Blog
function do_post_data(dictionary, url, target) {
    // Create the form object
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute("enctype", "multipart/form-data");
    form.setAttribute("encoding", "multipart/form-data"); // For IE
    if (target === undefined)
        target = "_blank";
    form.setAttribute("target", target);

    // For each key-value pair
    for (key in dictionary) {
        var hiddenField = document.createElement("input");
        // 'hidden' is the less annoying html data control
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", dictionary[key]);
        form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
}

function Alert(m, more) {
    if (more === undefined)
        more = '';
    alert(_(m) + "\n" + more);
}

function Write(m, more) {
    if (more === undefined)
        more = '';
    document.write(_(m) + more);
}



function clone_event(event) {
    var e = new Object();
    e.type = event.type;
    e.button = event.button;
    e.buttons = event.buttons;
    e.keyCode = event.keyCode;
    e.shiftKey = event.shiftKey;
    e.metaKey = event.metaKey;
    e.ctrlKey = event.ctrlKey;
    e.altKey = event.altKey;
    e.target = event.target;
    e.srcElement = event.srcElement;
    e.pageX = event.pageX;
    e.pageY = event.pageY;
    e.x = event.x;
    e.y = event.y;
    e.which = event.which;
    if (e.altKey && e.ctrlKey) {
        e.ctrlKey = false; // XXX Because AltGr key set both!
        e.altKey = false;
    }
    if (e.type == 'keypress')
        e.charCode = event.charCode;
    e.wheelDeltaX = event.wheelDeltaX;
    e.wheelDeltaY = event.wheelDeltaY;
    return e;
}

function scrollTop(value) {
    if (value === undefined) {
        return window.scrollY;
    }
    window.scrollTo(window.scrollX, value);
}

function scrollLeft() {
    return window.scrollX;
}

function window_width() {
    if (window.innerWidth !== undefined)
        return window.innerWidth;
    if (document.documentElement
        && document.documentElement.clientWidth)
        return document.documentElement.clientWidth;
    if (document.body.clientWidth)
        return document.body.clientWidth;
    return 1024;
}

function window_height() {
    if (window.innerHeight !== undefined)
        return window.innerHeight;
    if (document.documentElement
        && document.documentElement.clientHeight)
        return document.documentElement.clientHeight;
    if (document.body.clientHeight)
        return document.body.clientHeight;
    return 768;
}

var base64_replace = "%\r\n!#$&'()*+/[\\]^`\"<>";

function base64(s) {
    var i, len;
    /* Bad for SVG with diacritics
       for(i = 128 ; i < 256 ; i++)
       replace += String.fromCharCode(i) ;
    */
    len = base64_replace.length;
    for (i = 0; i < len; i++) {
        var code = base64_replace.charCodeAt(i);
        s = s.replace(RegExp('\\' + base64_replace.substr(i, 1), 'g'),
            '%' +
            '0123456789ABCDEF'.charAt(code / 16) +
            '0123456789ABCDEF'.charAt(code % 16)
        );
    }
    return s;
}

function base64_decode(s) {
    var i, len;
    len = base64_replace.length;
    for (i = len - 1; i >= 0; i--) {
        var code = base64_replace.charCodeAt(i);
        s = s.replace(RegExp('%' +
            '0123456789ABCDEF'.charAt(code / 16) +
            '0123456789ABCDEF'.charAt(code % 16),
            'g'),
            base64_replace.substr(i, 1)
        );
    }
    return s;
}

var max_url_length = 1000;

function on_windows() {
    return navigator.platform.indexOf('Win') != -1;
}

function on_mac() {
    return navigator.platform.indexOf('Macintosh') != -1;
}

var window_counter = 0;
function window_open(url, replace) {
    if (replace == "_self")
        return window;
    var w;
    window_counter++;
    if (replace) {
        url = '';
        title = replace;
    }
    try {
        w = window.open(url, semester + '-' + ue + '-' + window_counter);
    }
    catch (e) {
        // XXX IE
        w = window.open();
    }
    if (!w) {
        Alert("ALERT_popup");
    }
    return w;
}

function new_window(data, mimetype) {
    if (mimetype === undefined)
        mimetype = 'text/plain';

    var w = window_open('untitled');
    w.document.open(mimetype);
    w.document.write(data);
    w.document.close();
    return w;
}

function mail_sort(x, y) {
    if (x.search('@') != -1 && y.search('@') == -1)
        return -1;
    if (y.search('@') != -1 && x.search('@') == -1)
        return 1;
    if (x.split('.')[1] > y.split('.')[1])
        return 1;
    if (x.split('.')[1] < y.split('.')[1])
        return -1;
    if (x > y)
        return 1;
    if (x < y)
        return -1;
    return 0;
}

function mailto_url_usable(mails) {
    if (mails.length < max_url_length)
        return true;
    if (on_windows() || on_mac())
        return false;
    return true;
}

function my_mailto(mails, display) {
    if (mails.search('@') == -1) {
        Alert("ALERT_no_mail");
        return;
    }

    mails = mails.split(',');
    mails.sort(mail_sort);
    mails = mails.join(',');

    if (display === undefined && mailto_url_usable(mails)) {
        window.location = 'mailto:?bcc=' + mails;
        return;
    }
    var message = _("ALERT_copy_mail") + "\n\n";

    if (display === undefined)
        message = _("ALERT_copy_mail_microsoft") + "\n\n" + message;

    return new_window(message + mails + '\n\n');
}

/* From Olavi Ivask's Weblog */
function replaceDiacritics(s) {
    if (s.search(/[\300-\377]/) == -1)
        return s;

    var diacritics = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g,  // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g // C, c
    ];

    var chars = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

    for (var i = 0; i < diacritics.length; i++) {
        s = s.replace(diacritics[i], chars[i]);
    }
    return s;
}

/*REDEFINE
  This function returns the URL of the student picture.
*/
function student_picture_url(login) {
    if (login)
        return add_ticket('picture/' + login_to_id(login) + '.JPG');
    return '';
}

/*REDEFINE
  This function returns the URL of the student picture icon.
  30 pixel wide
*/
function student_picture_icon_url(login) {
    if (login)
        return add_ticket('picture-icon/' + login_to_id(login) + '.JPG');
    return '';
}

function replace_dot_by_coma() {
    var td = document.getElementsByTagName('TD');
    for (var i = 0; i < td.length; i++) {
        i = td[i];
        if (i.innerHTML)
            i.innerHTML = i.innerHTML.replace(RegExp('([0-9])[.]([0-9])'),
                '$1,$2');
    }
}

function replace_coma_by_dot() {
    var td = document.getElementsByTagName('TD');
    for (var i = 0; i < td.length; i++) {
        i = td[i];
        if (i.innerHTML)
            i.innerHTML = i.innerHTML.replace(RegExp('([0-9])[,]([0-9])'),
                '$1.$2');
    }
}

// From: http://codingforums.com/showthread.php?t=11156

function HueToRgb(m1, m2, hue) {
    var v;
    if (hue < 0)
        hue += 1;
    else if (hue > 1)
        hue -= 1;

    if (6 * hue < 1)
        v = m1 + (m2 - m1) * hue * 6;
    else if (2 * hue < 1)
        v = m2;
    else if (3 * hue < 2)
        v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
    else
        v = m1;

    return '0123456789ABCDEF'.substr(v * 15, 1);
}

// h : 0...1
// l : 0...1
// s : 0...1
function hls2rgb(hue, l, s) {
    var m1, m2;
    if (s == 0)
        return '#FFF';
    else {
        if (l <= 0.5)
            m2 = l * (s + 1);
        else
            m2 = l + s - l * s;
        m1 = l * 2 - m2;
        return '#'
            + HueToRgb(m1, m2, hue + 1 / 3)
            + HueToRgb(m1, m2, hue)
            + HueToRgb(m1, m2, hue - 1 / 3);
    }
}



function parseLineCSV(lineCSV) {
    lineCSV = lineCSV.replace(/[\n\r]*$/, '');
    // Work around IE bug
    lineCSV = lineCSV.replace(/\t/g, "\001\t").split('\t');
    for (var i in lineCSV)
        lineCSV[i] = lineCSV[i].replace(/\001$/g, "");

    var inside = false;
    var CSV = [];
    var cell, first_char, last_char;
    for (var i in lineCSV) {
        cell = lineCSV[i];
        first_char = cell.substr(0, 1);
        last_char = cell.substr(cell.length - 1, 1);
        if (first_char == '"' && last_char == '"') {
            cell = cell.substr(1, cell.length - 2).replace(/""/g, '\001');
        }
        else {
            cell = cell.replace(/""/g, '\001');
            if (inside !== false) {
                if (last_char === '"') {
                    cell = inside + ',' + cell.substr(0, cell.length - 1);
                    inside = false;
                }
                else {
                    inside += ',' + cell;
                    cell = undefined;
                }
            }
            else {
                if (first_char === '"') {
                    inside = cell.substr(1, cell.length - 1);
                    cell = undefined;
                }
            }
        }
        if (cell !== undefined) {
            CSV.push(cell.replace(/\001/g, '"'));
        }
    }
    return CSV;
}

/* Helper function to load data */

function P(k, t) {
    lines[k] = t;
}


function catch_this_student(login) {
    if (confirm(_('MSG_bilan_take_student'))) {
        create_popup('import_div',
            _('MSG_bilan_take_student').split("\n")[1],
            '<iframe src="' + add_ticket('referent_get/' + login)
            + '" style="width:100%;height:5em">iframe</iframe>',
            '', false);
    }
}


function progress_submit(form, do_eval, callback) {
    var progress = document.createElement("DIV");
    form.parentNode.insertBefore(progress, form.nextSibling);
    var xhr = new XMLHttpRequest();
    var position = 0;
    xhr.start_time = millisec();
    xhr.upload.addEventListener('progress', function (event) {
        var percent = 100 * event.loaded / event.total;
        var remaining = Math.floor((millisec() - xhr.start_time) / 1000 * (100 / percent - 1));
        if (event.loaded != event.total)
            progress.innerHTML = _("MSG_abj_wait")
                + '<br><b style="font-size:200%">'
                + percent.toFixed(2) + '%<br>'
                + (remaining / 60).toFixed(0) + 'm' + two_digits(remaining % 60)
                + 's</b>'
                ;
        else
            progress.innerHTML = '';
    }, false);
    xhr.addEventListener('readystatechange', function (event) {
        if (event.target.responseText
            && event.target.responseText.length > 0) {
            var r = event.target.responseText.substr(position);
            position = event.target.responseText.length;
            if (callback)
                callback(event.target.responseText);
            if (do_eval)
                eval(r);
            else
                progress.innerHTML += r;
        }
    }, false);
    xhr.open(form.getAttribute('method'), form.getAttribute('action'), true);
    xhr.send(new FormData(form));
    form.style.display = "none";
}

/******************************************************************************
 *
 *
 *
 *
 *
 *
 *****************************************************************************/

function Stats(v_min, v_max, empty_is) {
    this.min = 1e40;
    this.max = -1e40;
    this.sum = 0;
    this.sum2 = 0;
    this.nr = 0;
    this.histogram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.v_min = v_min;
    this.v_max = v_max;
    this.size = v_max - v_min;
    this.values = []; // numeric ones
    this.all_values = {};
    this.all_values[abi] = 0;
    this.all_values[abj] = 0;
    this.all_values['DIS'] = 0;
    this.all_values[pre] = 0;
    this.all_values[ppn] = 0;
    this.all_values[yes] = 0;
    this.all_values[no] = 0;
    this.all_values[''] = 0;
    if (empty_is)
        this.empty_is = empty_is;
    else
        this.empty_is = '';
}

// This function does not works when merging things with not the same size
Stats.prototype.merge = function (v) {
    var value;
    this.min = Math.min(this.min, v.min);
    this.max = Math.max(this.max, v.max);
    this.nr += v.nr;
    for (var i in this.histogram)
        this.histogram[i] += v.histogram[i];
    for (var i in v.values) {
        value = this.v_min + this.size * (v.values[i] - v.v_min) / v.size;
        this.values.push(value);
        this.sum += value;
        this.sum2 += value * value;
    }
    for (var i in v.all_values)
        if (this.all_values[i])
            this.all_values[i] += v.all_values[i];
        else
            this.all_values[i] = v.all_values[i];
};

Stats.prototype.add = function (v) {
    if (v === '')
        v = this.empty_is;
    if (this.all_values[v])
        this.all_values[v]++;
    else
        this.all_values[v] = 1;
    if (v === '')
        return;
    v = a_float(v);
    if (isNaN(v))
        return;
    delete this.all_values[v];
    if (v < this.min)
        this.min = v;
    if (v > this.max)
        this.max = v;
    this.sum += v;
    this.sum2 += v * v;
    var i = Math.floor(20 * ((v - this.v_min) / this.size));
    if (i < 0)
        i = 0;
    else if (i >= 20)
        i = 19;
    this.histogram[i]++;
    this.values.push(v);
    this.nr++;
};

Stats.prototype.remove = function (v) {
    if (isNaN(v)) {
        if (this.all_values[v])
            this.all_values[v]--;
    }
    else {
        this.nr--;
        this.sum -= v;
        this.sum2 -= v * v;
    }
};

Stats.prototype.variance = function () {
    return this.sum2 / this.nr - (this.sum / this.nr) * (this.sum / this.nr);
};

Stats.prototype.standard_deviation = function () {
    return Math.pow(this.variance(), 0.5);
};

Stats.prototype.standard_deviation_sample = function () {
    return this.standard_deviation() * Math.pow(this.nr / (this.nr - 1), 0.5);
};

Stats.prototype.average = function () {
    return this.sum / this.nr;
};

Stats.prototype.mediane = function () {
    if (this.values.length) {
        this.values.sort(function (a, b) { return a - b });
        return this.values[Math.floor(this.values.length / 2)];
    }
    else
        return Number(0);
};

Stats.prototype.uniques = function () {
    var d = {};
    for (var i in this.values)
        if (d[this.values[i]])
            d[this.values[i]]++;
        else
            d[this.values[i]] = 1;
    for (var i in this.all_values)
        if (d[this.all_values[i]])
            d[i] += this.all_values[i];
        else
            d[i] = this.all_values[i];
    return d;
};

Stats.prototype.nr_uniques = function () {
    var d = this.uniques();
    var j = 0;
    for (var i in d)
        if (d[i])
            j++;

    return j;
};

Stats.prototype.histo_max = function () {
    var maxmax = 1;
    for (var i = 0; i < 20; i++)
        if (this.histogram[i] > maxmax) maxmax = this.histogram[i];
    return maxmax;
};

Stats.prototype.maxmax = function () {
    var maxmax = this.histo_max();
    for (var i in this.all_values)
        if (this.all_values[i] > maxmax) maxmax = this.all_values[i];
    return maxmax;
};

Stats.prototype.stats_resume = function () {
    return [_('B_s_minimum') + ':&nbsp;' + this.min.toFixed(3),
        _('B_s_maximum') + ':&nbsp;' + this.max.toFixed(3),
        _('B_s_average') + ':&nbsp;<b>' + this.average().toFixed(3) + '</b>',
        _('B_s_mediane') + ':&nbsp;' + this.mediane().toFixed(3),
        _('B_s_stddev') + ':&nbsp;' + this.standard_deviation().toFixed(3),
        _('B_s_stddev_sample') + ':&nbsp;' + this.standard_deviation_sample().toFixed(3),
        _('B_s_variance') + ':&nbsp;' + this.variance().toFixed(3),
        _('B_s_sum') + ':&nbsp;' + this.sum.toFixed(3)];
};
Stats.prototype.html_resume = function () {
    return this.stats_resume().join('<br>');
};

Stats.prototype.normalized_average = function () {
    return (this.average() - this.v_min) / this.size;
};

Stats.prototype.nr_abi = function () { return this.all_values[abi]; };
Stats.prototype.nr_abj = function () { return this.all_values[abj] + this.all_values['DIS']; };
Stats.prototype.nr_ppn = function () { return this.all_values[ppn]; };
Stats.prototype.nr_nan = function () { return this.all_values['']; };
Stats.prototype.nr_pre = function () { return this.all_values[pre]; };
Stats.prototype.nr_yes = function () { return this.all_values[yes]; };
Stats.prototype.nr_no = function () { return this.all_values[no]; };

function compute_histogram(data_col) {
    var stats = new Stats(columns[data_col].min, columns[data_col].max,
        columns[data_col].empty_is);
    for (var line in filtered_lines)
        if (filtered_lines[line][0].value || filtered_lines[line][1].value)
            stats.add(filtered_lines[line][data_col].value);
    return stats;
}


/*
 * The selection functions came from :
 * http://stackoverflow.com/questions/401593/javascript-textarea-selection/403526#403526
 */

function get_selection(e) {
    //Mozilla and DOM 3.0
    if ('selectionStart' in e) {
        var l = e.selectionEnd - e.selectionStart;
        return {
            start: e.selectionStart,
            end: e.selectionEnd,
            length: l,
            text: e.value.substr(e.selectionStart, l)
        };
    }
    //IE
    else if (document.selection) {
        e.focus();
        var r = document.selection.createRange();
        var tr = e.createTextRange();
        var tr2 = tr.duplicate();
        tr2.moveToBookmark(r.getBookmark());
        tr.setEndPoint('EndToStart', tr2);
        if (r == null || tr == null)
            return {
                start: e.value.length,
                end: e.value.length,
                length: 0,
                text: ''
            };
        //for some reason IE doesn't always count the \n and \r in the length
        var text_part = r.text.replace(/[\r\n]/g, '.');
        var text_whole = e.value.replace(/[\r\n]/g, '.');
        var the_start = text_whole.indexOf(text_part, tr.text.length);
        return {
            start: the_start,
            end: the_start + text_part.length,
            length: text_part.length,
            text: r.text
        };
    }
    //Browser not supported
    else return {
        start: e.value.length,
        end: e.value.length,
        length: 0, text: ''
    };
}

function replace_selection(e, replace_str) {
    selection = get_selection(e);
    var start_pos = selection.start;
    var end_pos = start_pos + replace_str.length;
    e.value = e.value.substr(0, start_pos) + replace_str
        + e.value.substr(selection.end, e.value.length);
    set_selection(e, start_pos, end_pos);
    return {
        start: start_pos,
        end: end_pos,
        length: replace_str.length,
        text: replace_str
    };
}

function set_selection(e, start_pos, end_pos) {
    //Mozilla and DOM 3.0
    if ('selectionStart' in e) {
        e.focus();
        e.selectionStart = start_pos;
        e.selectionEnd = end_pos;
    }
    //IE
    else if (document.selection) {
        e.focus();
        var tr = e.createTextRange();
        tr.moveEnd('textedit', -1);
        tr.moveStart('character', start_pos);
        tr.moveEnd('character', end_pos - start_pos);
        tr.select();
    }
    return get_selection(e);
}

function wrap_selection(e, left_str, right_str, sel_offset, sel_length) {
    var the_sel_text = get_selection(e).text;
    var selection = replace_selection(e, left_str + the_sel_text + right_str);
    if (sel_offset !== undefined && sel_length !== undefined)
        selection = set_selection(e, selection.start + sel_offset,
            selection.start + sel_offset + sel_length);
    else
        if (the_sel_text == '')
            selection = set_selection(e, selection.start + left_str.length,
                selection.start + left_str.length);
    return selection;
}

/******************************************************************************
 *
 *
 *
 *
 *
 *
 *****************************************************************************/


function Cell(value, author, date, comment, history) {
    this.value = (value === undefined ? '' : value);
    this.author = (author === undefined ? '' : author);
    this.date = (date === undefined ? '' : date);
    this.comment = (comment === undefined ? '' : comment);
    this.history = (history === undefined ? [] : history);
}

Cell.prototype.toString = function () {
    return 'C(v=' + this.value + ',a=' + this.author + ',d=' + this.date + ',c='
        + this.comment + ',h=' + this.history + ',k=' + this._key + ')';
};

function C(value, author, date, comment, history) {
    return new Cell(value, author, date, comment, history);
}

Cell.prototype.save = function () {
    this._save = this.value;
};

Cell.prototype.restore = function () {
    this.set_value_real(this._save);
};

Cell.prototype.value_html = function () {
    return html(this.value);
};

function tofixed(n) // Do not use
{
    return (Math.floor(n * 100 + 0.0000001) / 100).toFixed(2);
}
/*REDEFINE
  This function translates a english formatted number into the local format.
  Currently only used by column export.
*/
function local_number(n) {
    if (server_language == 'fr')
        return n.replace('.', ',');
    else
        return n;
}


Cell.prototype.value_fixed = function () // XXX Do not use
{
    var v = Number(this.value);
    if (isNaN(v))
        return html(this.value);
    else
        if (this.value === '')
            return '';
        else
            return tofixed(v);
};

Cell.prototype.comment_html = function () {
    return html(this.comment).replace(/\n/g, '<br>');
};

Cell.prototype.changeable = function (line, column) {
    if (!table_attr.modifiable)
        return _("ERROR_table_read_only");
    if (column.locked)
        return _("ALERT_locked_column");
    if (this.author === '*' && (this.value !== '' || column.url_import !== ''))
        return _("ERROR_value_not_modifiable") + ' [' + html(column.title) + ']\n'
            + _("ERROR_value_system_defined");
    if (i_am_the_teacher)
        return true;

    var r;
    if (column.cell_writable === '')
        r = this.is_mine();
    else
        r = column.cell_writable_filter(line, this, my_identity);

    if (r)
        return true;
    else
        return _("ERROR_value_defined_by_another_user") + table_attr.masters;
};

Cell.prototype.modifiable = function (line, column) {
    return this.changeable(line, column) === true;
};

Cell.prototype.is_mine = function () {
    return (this.author == my_identity || this.author === '' || this.value === ''
        || myindex(minors, this.author) != -1
    );
};

Cell.prototype.set_value_real = function (v) {
    this.value = v;
    this._key = undefined;
    login_to_line_id.dict = undefined; // Clear cache
    return this; // To be compatible with Python set_value method
};

Cell.prototype.set_value = function (value) {
    this.history.push([this.value, this.date, this.author, 'V']);
    this.set_value_real(value);
    this.author = my_identity;
    var d = new Date(); // Browser side date
    this.date = d.formate('%Y%m%d%H%M%S');
    return this;
};

Cell.prototype.set_comment = function (v, history) {
    if (this.comment == v)
        return this;
    if (history === undefined) {
        var d = new Date();
        history = [v, d.formate('%Y%m%d%H%M%S'), my_identity, 'C'];
    }
    this.history.push(history);
    this.comment = v;
    return this; // To be compatible with Python set_comment method
};

Cell.prototype.history_length = function (what) {
    var nr = 0;
    for (var i in this.history)
        if (this.history[i][3] == what)
            nr++;
    return nr;
};

Cell.prototype.is_not_empty = function () {
    return this.value.toString() !== '' || this.comment !== '';
};

Cell.prototype.is_empty = function () {
    return this.value.toString() === '' && this.comment === '';
};

function get_author(author) {
    if (author === '')
        return '';
    if (author === '*')
        return 'tomuss';
    if (author === '?')
        return '?';

    return author;
}

function get_author2(column) {
    return get_author(column.author);
}


Cell.prototype.get_author = function () {
    return get_author(this.author);
};

Cell.prototype.get_value = function (column) {
    if (this.value === '')
        return column.empty_is;
    return this.value;
}

// Allow to sort correctly and intuitivly mixed data types
Cell.prototype.key = function (empty_is) {
    if (this._key !== undefined)
        return this._key;

    var x, date, s, i;
    var v = this.value;
    if (v === '')
        v = empty_is;

    var n = a_float(v);
    if (isNaN(n)) {
        if (v.toLowerCase)
            this._key = '\003' + replaceDiacritics(v.toLowerCase()); // Strings
        else {
            this._key = '\004' + v; // NaN
            return this._key;
        }

        // Check date...
        date = v.split('/');
        if (date.length == 3) {
            /* It seems like a date, french reverse order */
            date = v.split(/[-_:\/ ]+/); // 31/1/2008-16:22:00
            for (i = 0; i < date.length; i++) {
                if (date[i] === '')
                    break;
                date[i] = Number(date[i]);
                if (isNaN(date[i])) {
                    break;
                }
            }
            if (i == date.length) {
                // Only numbers
                s = [];
                for (i = 2; i >= 0; i--)
                    s.push((1000 + date[i]).toString());
                for (i = 3; i < date.length; i++)
                    s.push((100 + date[i]).toString());
                this._key = '\002' + s.join('');
            }
        }
    }
    else {
        if (v === '')
            this._key = '\005';
        else {
            // Number
            n += 2000000000;
            x = '           ' + n.toFixed(10);
            this._key = '\001' + x.substr(x.length - 23); // Numbers
        }
    }
    return this._key;
};

function js(t) {
    return '"' + t.toString().replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"').replace(/\n/g, '\\n')
        .replace(/</g, '\\x3c') // To disable </script> in strings
        + '"';
}

function js2(t) {
    return "'" + t.toString().replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'").replace(/[\n\r]/g, '\\n').replace(/"/g, '\\042')
        .replace(/</g, '\\x3c') // To disable </script> in strings
        + "'";
}

Cell.prototype.get_data = function () {
    var v;
    if (this.value.toFixed)
        v = this.value;
    else
        v = js(this.value);
    return 'C(' + v + ',' + js(this.author) + ',' + js(this.date) + ',' + js(this.comment) + ')';
};

Cell.prototype.date_DDMMYYYY = function () {
    var x = this.date;
    return x.slice(6, 8) + '/' + x.slice(4, 6) + '/' + x.slice(0, 4);
};

/*
 * GUI recording
 * Debug mode if =gui-record= in the URL
 */

function GUI_record() {
    if (/=gui-record=/.test(window.location.pathname)) {
        this.debug = document.createElement('PRE');
        this.debug.style.position = 'fixed';
        this.debug.style.right = this.debug.style.bottom = '40px';
        this.debug.style.width = '40em';
        this.debug.style.height = '50%';
        this.debug.style.background = 'white';
        this.debug.style.overflow = 'auto';
    }
    this.save_interval = 60000;
    this.start_o = new Date();
    this.last_interaction = this.start = millisec();
}

GUI_record.prototype.save = function () {
    if (!window.gui_record)
        return;
    if (!this.events || this.events.length == 0)
        return;
    var s = [];
    for (var i in this.events)
        if (this.events[i][0] !== undefined) // XXX it may happen: but how?
            s.push('[' + this.events[i][0]
                + ',"' + this.events[i][1] + '"'
                + (this.events[i][2] ? ',' + js(this.events[i][2]) : '')
                + ']');
    var fd;
    try {
        fd = new FormData();
    }
    catch (e) {
        return;
    }

    fd.append("table", year + '/' + semester + '/' + ue);
    fd.append("start", this.start_o.formate("%Y%m%d%H%M%S"));
    fd.append("data", '[' + s.join(',') + ']');

    if (window.XMLHttpRequest) {
        this.mxmlhttp = new XMLHttpRequest();
        this.mxmlhttp.open("POST", add_ticket('gui_record'), true);
        this.mxmlhttp.send(fd);
    }
    this.events = [];
}

GUI_record.prototype.initialize = function () {
    this.events = [];

    this.body = document.getElementsByTagName('H1')[0];
    if (this.debug)
        this.body.appendChild(this.debug);
    this.initialized = true;
    // Save once per minute
    setInterval(GUI_save, this.save_interval);
}

GUI_record.prototype.add = function (attr_name, event, value) {
    if (!this.initialized)
        this.initialize();
    if (event) {
        event = the_event(event);
        if (event.target.tagName == 'INPUT')
            value = event.target.value;
        else if (/^t_column_/.test(attr_name))
            value = the_current_cell.column[attr_name.replace("t_column_", "")];
        else if (/^t_table_attr_/.test(attr_name))
            value = table_attr[attr_name.replace("t_table_attr_", "")];
        else if (value === undefined)
            value = '?';
    }
    if (attr_name == 'tip' && !value) {
        var last = this.events[this.events.length - 1];
        // If the tip is visible less than 0.1s do not record it
        if (last && millisec() - this.start - last[0] < 100 && last[1] == 'tip') {
            this.events.splice(this.events.length - 1, 1);
            if (this.debug !== undefined)
                this.debug.innerHTML += 'Remove previous event\n';
            return;
        }
    }
    this.last_interaction = millisec();
    this.events.push([this.last_interaction - this.start, attr_name, value]);
    if (this.debug !== undefined) {
        this.debug.innerHTML += this.events[this.events.length - 1] + '\n';
        this.debug.scrollTop = 100000000;
    }
};

GUI_record.prototype.add_key = function (event, value) {
    var id = (
        (event.metaKey ? 'M' : '') +
        (event.shiftKey ? 'S' : '') +
        (event.ctrlKey ? '^' : '') +
        event.keyCode
    );
    if (value === undefined) {
        if (element_focused)
            value = "input";
        else
            value = "cell";
    }
    this.add(id, "", value);
};

var GUI = new GUI_record();
function GUI_save() {
    if (!connection_state)
        return;
    GUI.save();
}


/******************************************************************************
 *
 *
 *
 *
 *
 *
 *****************************************************************************/

function set_select_by_value(element, value) {
    var options = element.getElementsByTagName('OPTION');
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == value || options[i].text == value) {
            element.selectedIndex = i;
            element.selectedText = options[i].text;
            return;
        }
    }
}

function Current() {
    this.input = document.getElementById('current_input');
    this.input_div = document.getElementById('current_input_div');
    this.lin = nr_headers;
    this.col = 0;
    this.line_id = '';
    this.data_col = this.data_col_current = this.data_col_previous = this.data_col_previous_previous = 0;
}


function set_editable(item, editable) {
    if (item.tagName == 'SELECT')
        for (var i in item.options) {
            if (item.options[i]) // Browser bug
                item.options[i].disabled = editable ? '' : '1';
        }
    else
        item.disabled = !editable;
};

function update_attribute_value(e, attr, table, editable) {
    var value = table[attr.name];
    var formatted;
    if (value === undefined)
        return;

    if (attr.what == 'table')
        formatted = attr.formatter(value);
    else
        formatted = attr.formatter(table, value);

    switch (attr.gui_display) {
        case 'GUI_select':
            set_select_by_value(e, value);
            break;
        case 'GUI_input':
            if (attr.what == 'table')
                update_input(e, formatted, attr.empty(value));
            else
                update_input(e, formatted, attr.empty(table, value));
            var filter = table[attr.name + '_filter'];
            if (filter && filter.get_filter_errors && filter.get_filter_errors()) {
                e.classList.add("attribute_error");
                set_message('filter_' + attr.name, 2, _('TIP_column_attr_' + attr.name).split('<br>')[0]
                    + '… «' + html(value) + '»<br>' + filter.get_filter_errors() + '<hr>');
            }
            else {
                set_message('filter_' + attr.name, 2);
                e.classList.remove("attribute_error");
            }
            break;
        case 'GUI_a':
            var x = e.className.replace('linkstroked', '');
            var old_class = e.className;
            if (!value && attr.strokable)
                x += ' linkstroked';
            if (attr.strokable
                && !!value != (old_class.search('linkstroked') == -1)) {
                highlight_add(e);
                // Classname change must be done before 'highlight_add'
                // And 'highlight_add' should not erase classname
                // But if classname is not erased, it brokes thing
                // when there is 'empty' class
                x += ' highlight';
            }
            e.className = x.replace(/^ */, '');
            return;
        case 'GUI_button':
            break;
        case 'GUI_type':
            e.innerHTML = _('B_' + value);
            break;
        case 'GUI_none':
            if (e.tagName == 'SPAN') {
                if (e.innerHTML != formatted)
                    highlight_add(e);
                e.innerHTML = formatted;
            }
            return;
        default:
            alert('BUG GUI:' + attr.gui_display);
    }
    set_editable(e, editable);
}

// Update ALL the columns headers saw by the user.
Current.prototype.update_column_headers = function () {
    if (this.do_update_column_headers == false)
        return;
    this.do_update_column_headers = false;

    var column = this.column;
    var disabled = !table_attr.modifiable || !column_change_allowed(column);
    var e;
    for (var attr in column_attributes) {
        e = document.getElementById('t_column_' + attr);
        
        if (!e)
            continue;
        if (column_attributes[attr].computed) {
            update_attribute_value(e, column_attributes[attr], column, false);
            continue;
        }
        if (!column_modifiable_attr(attr, column)) {
            if (column_attributes[attr].always_visible) {
                e.style.opacity = 0.3;
                e.value = '';
                set_editable(e, false);
            }
            else
                e.style.display = 'none';
            continue;
        }
        if (column_attributes[attr].gui_display == 'GUI_none')
            eval(column_attributes[attr].action + '()');
        if (column_attributes[attr].always_visible) {
            e.style.opacity = '';
            set_editable(e, true);
        }
        else
            e.style.display = '';
        while (e.previousSibling
            && e.previousSibling.tagName == 'SPAN'
            && e.previousSibling.firstChild
            && e.previousSibling.firstChild.className == 'server')
            e.parentNode.removeChild(e.previousSibling);

        update_attribute_value(e, column_attributes[attr], column,
            !column_attributes[attr].need_authorization
            || !disabled);
    }
};

var decal_diff = 100;

function triple_diff(t0, t1, t2) {
    if (t0 === undefined)
        t0 = '';
    else
        t0 = t0[0].toString();
    t1 = t1[0].toString();
    if (t2 === undefined)
        t2 = '';
    else
        t2 = t2[0].toString();

    if (t0.length < 7 && t1.length < 7 && t2.length < 7)
        return html(t1);

    var i0 = 0, i1 = 0, i2 = 0;
    var output = '';
    var decal0, decal2, color;
    while (t1[i1]) {
        // Do not increase '2': it does not work. Split by words will be better
        for (var decal0 = 0; decal0 < decal_diff; decal0++)
            if (t1.substr(i1, 2 * decal0 + 1) == t0.substr(i0 + decal0, 2 * decal0 + 1))
                break;
        for (var decal2 = 0; decal2 < decal_diff; decal2++)
            if (t1.substr(i1, 2 * decal2 + 1) == t2.substr(i2 + decal2, 2 * decal2 + 1))
                break;

        if (decal0 != decal_diff && decal2 != decal_diff)
            color = '';
        else if (decal0 != decal_diff) {
            color = '#FCC';
            decal2 = -1;
        }
        else if (decal2 != decal_diff) {
            color = '#CFC';
            decal0 = -1;
        }
        else {
            color = '#FFA';
            decal0 = decal2 = -1;
        }
        output += (color ? '<span style="background:' + color + '">' : '')
            + html(t1[i1])
            + (color ? '</span>' : '');
        i0 += decal0 + 1;
        i1++;
        i2 += decal2 + 1;
    }

    return output.replace(/\n/g, "<br>");
}

Current.prototype.update_cell_headers = function () {
    var cell = this.cell;

    if (the_comment) {
        update_input(the_comment, cell.comment, cell.comment === '');
        set_editable(the_comment, cell.modifiable(this.line, this.column));
    }

    update_value_and_tip(t_value, cell.value);

    // Split value et comment history
    var vh = [], ch = [];
    for (var i in cell.history) {
        var h = cell.history[i][3] == 'V' ? vh : ch;
        var v = cell.history[i].slice();
        h.push(v);
    }
    ch.push([cell.comment, '', '', 'C']);
    vh.push([cell.value, cell.date, cell.author, 'V']);
    vh.push([cell.value, '', '', 'V']);

    for (var i in vh)
        vh[i].push(triple_diff(vh[i - 1], vh[i], vh[Number(i) + 1]));
    for (var i in ch) {
        ch[i].push(triple_diff(ch[i - 1], ch[i], ch[Number(i) + 1]));
        vh.push(ch[i]);
    }

    vh.sort(function (a, b) { return a[1] < b[1] ? 1 : (a[1] > b[1] ? -1 : 0); });

    var s = [];
    if (ch.length > 1)
        s.push(_("MSG_history_comment"));
    s.push('<table class="colored">');
    s.push('<tr><th>' + _("B_Date") + '<th>' + _('TH_who')
        + '<th>' + _("TH_value") + '</tr>'
    );
    for (var i in vh)
        if (vh[i][1] !== '')
            s.push('<tr' + (vh[i][3] == 'V' ? '' : ' style="font-weight:bold"')
                + '><td>' + date(vh[i][1]) + '<td>' + get_author(vh[i][2])
                + '<td>' + vh[i][4] + '</tr>');
    s.push('</table>');
    t_history.innerHTML = s.join('\n');

    if (this.column.type == 'Calendar') {
        var tab = document.getElementById('content_✎').parentNode;
        var parent = t_editor.parentNode;
        t_editor.style.visibility = 'hidden';
        while (parent.childNodes.length != 1)
            parent.removeChild(parent.lastChild);
        parent.appendChild(
            the_current_cell.column.Calendar.html(
                the_current_cell.input.value, false, tab.offsetWidth - 8, tab.offsetHeight - 4,
                cell.modifiable(this.line, this.column)));
        t_editor.nextSibling.style.marginTop = '-5px';
        //the_current_cell.input.disabled = true;
    }
    else {
        t_editor.style.visibility = 'visible';
        t_editor.value = cell.value;
        t_editor.readOnly = !cell.modifiable(this.line, this.column);
    }
};

Current.prototype.update_table_headers = function () {
    var disabled;
    var editable;
    for (var attr in table_attributes) {
        var attributes = table_attributes[attr];
        e = document.getElementById('t_table_attr_' + attr);
        if (!e)
            continue;
        if (attributes.only_masters && !(i_am_the_teacher || i_am_root))
            e.style.display = 'none';
        else
            e.style.display = '';

        // In the loop because its value may change on attr masters
        disabled = !table_change_allowed() || !table_attr.modifiable;
        if (attr == 'modifiable')
            editable = table_change_allowed();
        else if (attr == 'masters')
            // XXX i_am_the_teacher is not yet updated on first display
            // It is clearly not a nice code.
            editable = !disabled
                || i_am_root || myindex(table_attr.masters, my_identity) != -1
                || (table_attr.modifiable && !table_attr.masters[0])
                || myindex(table_attr.managers, my_identity) != -1;
        else
            editable = !attributes.need_authorization || !disabled;
        update_attribute_value(e, attributes, table_attr, editable);
    }
};

Current.prototype.update_headers_real = function () {
    if (author)
        author.innerHTML = this.cell.author;
    if (modification_date)
        modification_date.innerHTML = date(this.cell.date);
    /*
    if (element_focused)
        return;
    */
    update_student_information(this.line);
    this.update_cell_headers();
    this.update_column_headers();

    // Update hidden columns menu
    update_hiddens_menu();
    // Update left of menu
    update_column_position_menu();
};

Current.prototype.update_headers = function () {
    // if ( this.line === undefined )
    //     throw new Error('line==undefined');
    periodic_work_add(this.update_headers_real.bind(this));
};

Current.prototype.update_input_position = function () {
    var pos = findPos(this.td);
    var border;
    if (this.tr.classList.contains('separator'))
        border = 1;
    else
        border = 0;

    // Nicer display with this, but focus loss on horizontal scrolling
    //this.input_div.style.display = 'none' ;
    // 4 is the border size (see input_div_focus())
    this.input_div.style.left = pos[0] - 4 + 'px';
    this.input_div.style.top = pos[1] - 4 + border + 'px';
    this.input_div.style.width = this.td.offsetWidth + 'px';
    this.input_div.style.height = this.td.offsetHeight - border + 'px';
};

Current.prototype.jump = function (lin, col, do_not_focus, line_id, data_col) {
    if (data_col === undefined)
        data_col = data_col_from_col(col);
    if (line_id === undefined) {
        do {
            line_id = line_id_from_lin(lin);
            if (line_id === undefined)
                add_a_new_line();
        }
        while (line_id === undefined);
    }

    var line = lines[line_id];
    if (!line) {
        alert('BUG current jump:' + line_id);
    }

    var cell = line[data_col];

    if (!do_not_focus && element_focused && element_focused.tagName == 'INPUT') {
        // Save value before changing of current cell
        var save = element_focused;
        save.blur();
        if (save.onblur) {
            // save.onblur({target: save});
            // save.onblur_keep = save.onblur;
            // save.onblur = function() { save.onblur = save.onblur_keep ; };
        }
        if (!cell.modifiable(line, columns[data_col])) {
            //console.log("! cell.modifiable: refocus");
            //save.focus();
            //if (element_focused === undefined) {
            //    save.onfocus();
            //}
        }
    }

    /* Removed the 19/1/2010 In order to select RO values
       if (  ! cell.modifiable(line, column) )
       do_not_focus = true ;
    */
    this.lin = lin;
    this.previous_col = this.col;
    this.col = col;
    this.tr = table.childNodes[lin];
    remove_highlight();
    the_current_line = this.tr;
    this.tr.classList.add('highlight_current');
    this.td = this.tr.childNodes[col];
    if (data_col != this.data_col) {
        this.do_update_column_headers = true;
        this.data_col_previous_previous = this.data_col_previous;
        this.data_col_previous = this.data_col;
        this.data_col_current = data_col; // For column graph (modifiable)
    }
    this.data_col = data_col;
    this.column = columns[this.data_col];
    this.previous_line_id = this.line_id;
    this.line = line;
    this.cell = cell;
    if (this.line_id !== line_id)
        update_cell_details(line_id);
    this.line_id = line_id;

    this.update_input_position();
    this.input.className = this.td.className + ' ' + this.tr.className;
    this.input.setAttribute('spellcheck', this.column.type == 'Text');
    this.input.value = encode_lf_tab(columns[this.data_col].real_type.formatte(this.cell.value,
        this.column));
    this.initial_value = this.input.value;

    // Update position in scrollbar
    if (vertical_scrollbar && this.previous_line_id != this.line_id)
        update_vertical_scrollbar_cursor();
    if (horizontal_scrollbar && this.previous_col != this.col)
        update_horizontal_scrollbar_cursor();

    //this.input_div.style.display = '' ;

    if (!do_not_focus) {
        setTimeout(this.focus.bind(this), 100); // For Opera
        this.focus();
    }
    this.update_headers(); //this.previous_col == this.col) ;

    // Remove a copy bug of Firefox that insert tag when copying
    while (this.input_div.firstChild.tagName != 'INPUT')
        this.input_div.removeChild(this.input_div.firstChild);

    table_highlight_column();

    if (table_forms_element === undefined && this.focused) {
        if ((this.cell.value.toString().length > 30
            || this.cell.value.toString().indexOf('\n') != -1
        ) && this.column.type == 'Text'
            || this.column.type == 'Calendar'
        ) {
            if (selected_tab(_('cellule')) == _('TAB_cell')) {
                select_tab("cellule", "✎");
                this.auto_select_tab = true;
            }
        }
        else
            if (this.auto_select_tab)
                select_tab("cellule", _('TAB_cell'));
    }
    setTimeout(() => { if (TIP.is_tip_visible()) TIP.update_current_tip() }, 200);
};

Current.prototype.jump_if_possible = function (line_id, data_col, do_not_focus) {
    var td = td_from_line_id_data_col(line_id, data_col);
    if (td)
        this.jump(lin_from_td(td), col_from_td(td), do_not_focus);
};

Current.prototype.focus = function () {
    //this.input.contentEditable = this.cell.modifiable(this.line, this.column) ;
    this.input.focus();
    if (this.input.select)
        this.input.select();
    this.input_div_focus();
};

Current.prototype.cell_modifiable = function () {
    return this.cell.modifiable(this.line, this.column);
};

// Update input from real table content (external change)
Current.prototype.update = function (do_not_focus) {
    var lin, col;

    lin = this.lin;
    col = this.col;

    if (lin >= table_attr.nr_lines + nr_headers)
        lin = table_attr.nr_lines + nr_headers - 1;
    if (col >= table_attr.nr_columns - 1)
        col = table_attr.nr_columns - 1;

    this.jump(lin, col, do_not_focus);
};

Current.prototype.cursor_down = function () {
    this.change();
    if (this.lin >= table_attr.nr_lines + nr_headers -
        (1 + preferences.one_line_more)) {
        next_page(true, 1);
        // table_fill_try() ; // Want change NOW (bad input if fast typing)
    }
    else
        this.jump(this.lin + 1, this.col);
};

Current.prototype.cursor_up = function () {
    this.change();
    if (this.lin <= nr_headers + preferences.one_line_more
        && line_offset !== 0) {
        previous_page(true, 1);
        // table_fill_try() ; // Want change NOW (bad input if fast typing)
    }
    else if (this.lin > nr_headers)
        this.jump(this.lin - 1, this.col);
};

Current.prototype.cursor_right = function () {
    this.change();

    if (this.col == table_attr.nr_columns - 1)
        next_page_horizontal();
    else
        this.jump(this.lin, this.col + 1);
};

Current.prototype.cursor_left = function () {
    this.change();
    if (this.col === 0 || (column_offset !== 0 && this.col == nr_freezed()))
        previous_page_horizontal();
    else
        this.jump(this.lin, this.col - 1);
};

function control_f() {
    select_tab("cellule", _("TAB_cell"));
    linefilter.focus();
    if (linefilter.select)
        linefilter.select();
}

function focus_on_cell_comment() {
    select_tab("cellule", _("TAB_cell"));
    the_comment.focus();
}

Current.prototype.focus_on_editor = function () {
    t_editor.value = decode_lf_tab(this.input.value);
    select_tab("cellule", "✎");
    t_editor.focus();
};

function triggerKeyboardEvent(el, keyCode) {
    var eventObj = document.createEventObject
        ? document.createEventObject()
        : document.createEvent("Events");

    if (eventObj.initEvent) {
        eventObj.initEvent("keydown", true, true);
    }

    eventObj.keyCode = 0;
    eventObj.which = 0;
    eventObj.charCode = keyCode;
    eventObj.target = el;

    if (el.dispatchEvent)
        el.dispatchEvent(eventObj);
    else
        el.fireEvent("onkeydown", eventObj);
}

function select_move(nb) {
    var select = TIP.get_tip_select();
    var i = select.selectedIndex + nb;
    if (nb > 0)
        i = Math.min(select.childNodes.length - 1, i);
    else
        i = Math.max(0, i);
    select.selectedIndex = i;
}

function select_go_up() {
    select_move(-1);
}

function select_go_down() {
    select_move(1);
}

function select_go_page(event) {
    var nb = Math.floor(event.target.size / 2);
    select_move(event.keyCode == 33 ? -nb : nb);
}

function select_terminate(event) {
    event.target = TIP.get_tip_select();
    TIP.get_tip_select().onchange(event);
}

function focus_on_column_filter() {
    select_tab("column", _("TAB_column"));
    document.getElementById('columns_filter').focus();
}

function select_all_cells_with_a_comment() {
    select_tab("table", _("TAB_table"));
    var f = document.getElementById('fullfilter');
    f.value = "#";
    f.focus();
}

function clear_line_filter() {
    linefilter.value = '';
    control_f();
}

function focus_on_rounding() {
    select_tab("column", _("TAB_formula"));
    document.getElementById('t_column_rounding').focus();
}

function cancel_input_editing() {
    if (TIP.is_tip_visible())
        return;
    element_focused.value = element_focused.initial_value === undefined
        ? ''
        : element_focused.initial_value;
    var a = element_focused;
    the_current_cell.focus(); // XXX The input value is unchanged without this
    a.focus();
    // Launch filter updating
    triggerKeyboardEvent(a, -1);
}

Current.prototype.cancel_cell_editing = function () {
    if (TIP.is_tip_visible())
        return;
    this.input.value = this.initial_value;
    this.input.blur();
    this.focus();
}

function cancel_select_editing() {
    if (TIP.is_tip_visible())
        return;
    login_list_hide();
    if (element_focused)
        cancel_input_editing();
    else {
        // Do not cancel the current value in order
        // to allow to enter value not in the selection list
        // cancel_cell_editing() ;
    }
}

function fill_column_with_value() {
    fill_column();
    var room = Filler.filler.rooms[Filler.filler.index[0]];
    room.get_toggle().checked = true;
    room.get_name().value = decode_lf_tab(the_current_cell.input.value);
    room.get_name().focus();
    room.get_name().select();
    Filler.filler.update_html();
}

var last_input_key_time;

/*
  First selector indicate:
    S Shift pressed
    C Control pressed
    A Alt pressed
    P Popup opened
    F last_user_interaction - last_input_key_time < 10
    T The focus is on the table
    i The focus is on a table cell (in_input===true)
    t The focus is on a TEXTAREA
    s The focus is on a SELECT
    f The focus is on #table_forms_keypress
    L The cursor is at the left of the input
    R The cursor is at the right of the input
    M The current cell is modifiable
  If prefixed by a '!' then the condition must be false

  Second selector is a list of key or keycode.
  If undefined all the keycode are accepted

  The last item is the function to call (first argument is the event)
  When it is called, no more tests are done and the event is cancelled.
  If there is no function: nothing is done and the event is not stopped.
*/
var shortcuts;

function init_shortcuts() {
    if (shortcuts)
        return;
    shortcuts = [
        ["F", [229]],            // http://stackoverflow.com/questions/25043934
        ["P", [27], "popup_close_esc"],
        ["P"],
        ["s", [27], "cancel_select_editing"],
        ["!T", [27], "cancel_input_editing"],
        ["T", [27], "cancel_cell_editing"],
        ["t"],
        ["f", true, false],   // Any normal character: do completion
        ["f"],
        ["s", [38], "select_go_up"],
        ["Ss", [9], "select_go_up"],
        ["s", [40, 9], "select_go_down"],
        ["s", [33, 34], "select_go_page"],
        ["s", [13], "select_terminate"],
        // ["s", undefined        ],  // key < 40 && key != 8 : return
        ["C", [33, 34]],         //  Do not touch control next/previous page
        ["A", [33], "previous_page_horizontal"],
        ["A", [34], "next_page_horizontal"],
        ["A", ['8', '_', 'm', '½'], "control_f", "deprecated"],
        ["A", [0, 16], "test_nothing"],
        ["A", [":", ";", "¿"], "focus_on_cell_comment"],
        ["S", [113], "focus_on_cell_comment"],
        ["A", [13], "focus_on_editor"],
        ["", [113], "focus_on_editor"],
        ["C", [13, "D"], "fill_column_with_value"],
        ["!T", [37, 39]],        // Do not touch left/right cursor
        ["S", [37, 39]],         // Do not touch left/right cursor
        ["A", [37, 39]],         // Do not touch left/right cursor
        ["C", ["F"], "control_f"],
        ['C', ['S'], "table_autosave_save"],
        ["C", ["P"], "print_selection"],
        ["SC", ["0"], "select_all_cells_with_a_comment"],
        ["C", ["0"], "focus_on_column_filter"],
        ["SC", ["(", '5', '9'], "clear_line_filter"],
        ["SC", ["!", "$", "%", 161, 164, 165], "focus_on_rounding"],
        ["C", [38], "first_page"],
        ["", [38], "cursor_up"],
        ["C", [40], "last_page"],
        ["", [40], "cursor_down"],
        ["S", [13], "cursor_up"],
        ["", [13], "cursor_down"],
        ["", [33], "previous_page"],
        ["", [34], "next_page"],
        ["Si", [9], "cursor_left"],
        ["i", [9], "cursor_right"],
        ["C", [37], "cursor_left"],
        ["C", [39], "cursor_right"],
        ["L", [37], "cursor_left"],
        ["R", [39], "cursor_right"],
        ["C"],
        ["!M", undefined, "test_nothing"], // Stop event
    ];
}

function display_short_cuts() {
    var t = [];
    init_shortcuts();
    for (var i in shortcuts) {
        var shortcut = shortcuts[i];
        if (shortcut[2] === undefined
            || shortcut[2] === "test_nothing"
            || shortcut[1] === undefined
            || shortcut[0].match(/[a-zFTLR]/)
            || shortcut[3]
        )
            continue;
        var key = shortcut[1][0];
        switch (key) {
            case 9: key = '⭾'; break;
            case 27: key = 'Esc'; break;
            case 13: key = '⏎'; break;
            case 33: key = '⇞'; break;
            case 34: key = '⇟'; break;
            case 37: key = '←'; break;
            case 38: key = '↑'; break;
            case 39: key = '→'; break;
            case 40: key = '↓'; break;
            case 113: key = 'F2'; break;
        }
        t.push([_('SHORTCUT_' + shortcut[2]),
        shortcut[0].replace('C', 'Ctrl ').replace('S', 'Shft ')
            .replace('A', 'Alt ').replace(/[P]/, ''),
            key]);
    }
    t.sort();
    var s = '';
    for (var i = 0; i < t.length; i++) {
        for (var j = i + 1; j < t.length; j++)
            if (t[i][0] != t[j][0])
                break;
            else
                t[j][0] = undefined;
        s += '<tr><td class="modifier">' + t[i][1]
            + '<td class="key">' + t[i][2]
            + (t[i][0] ? '<td rowspan="' + (j - i) + '">' + t[i][0] : '')
            + '</tr>';
    }
    return '<div class="shortcuts"><table>' + s + '</table></div>';
}
Current.prototype.keydown = function (event, in_input) {
    function debug(txt) {
        // if (event.real_event.key == 'ArrowRight')
        //     console.log(txt);
        if (event.real_event.key == 'XXX The key to debug')
            console.log(txt);
    }

    if (window.intro_message)
        hide_intro();
    init_shortcuts();
    last_user_interaction = millisec();
    event = the_event(event);
    var key = event.keyCode;
    var selection;
    if (event.target.tagName === 'INPUT')
        selection = get_selection(event.target);
    var fast = (last_user_interaction - last_input_key_time < 10);
    last_input_key_time = last_user_interaction;
    debug(["element_focused=", element_focused]);
    for (var shortcut in shortcuts) {
        shortcut = shortcuts[shortcut];
        var state = true;
        for (var selector = 0; selector < shortcut[0].length; selector++) {
            switch (shortcut[0].substr(selector, 1)) {
                case 'C': state = event.ctrlKey; break;
                case 'S': state = event.shiftKey; break;
                case 'A': state = event.altKey; break;
                case 'P': state = popup_is_open()
                    && (
                        !element_focused
                        || (element_focused.id != 'table_forms_keypress'
                            && element_focused.className != 'login_list')
                    );
                    if (event.target.getAttribute('get_completion_list'))
                        if (body_on_mouse_up_doing == 'login_list')
                            state = false;
                        else
                            if (key >= 65)
                                state = false;
                    break;
                case 'T': state = !element_focused; break;
                case 'i': state = in_input; break;
                case 'M': state = (this.cell_modifiable() && this.column.type != 'Calendar') || element_focused;
                    break;
                case 'F': state = fast; break;
                case 't': state = element_focused
                    && element_focused.tagName == 'TEXTAREA';
                    break;
                case 's': state = body_on_mouse_up_doing == 'login_list';
                    // element_focused && element_focused.tagName == 'SELECT';
                    break;
                case 'f': state = element_focused
                    && body_on_mouse_up_doing != 'login_list'
                    && element_focused.id == 'table_forms_keypress';
                    break;
                case 'L':
                    state = this.input.value.length === 0
                        || !this.cell_modifiable()
                        || (selection && selection.start === 0
                            && (selection.end === this.input.textLength ||
                                selection.end === this.input.value.length ||
                                selection.end === 0)
                        );
                    break;
                case 'R':
                    state = selection && (this.input.value.length === 0
                        || !this.cell_modifiable()
                        || this.input.textLength == selection.end
                        || this.input.value.length == selection.end
                    );
                    break;
                case '!': break;
                default:
                    alert('Bug shortcut');
            }
            if (selector > 0 && shortcut[0].substr(selector - 1, 1) == '!')
                state = !state;
            if (!state) {
                // console.log("Bad selector:" + shortcut[0]) ;
                break;
            }
        }
        if (!state)
            continue; //  Bad selector: next shortcut
        debug("Short cut possible: " + shortcut);
        if (shortcut[1] === true) {   // Allow only normal characters and backspace (completion)
            state = true;
            if (key <= 40 && key != 8)
                state = false;
        }
        else if (shortcut[1] !== undefined) {
            state = false;
            for (var test_key in shortcut[1]) {
                test_key = shortcut[1][test_key];
                if (test_key === key ||
                    (test_key.toLowerCase && test_key.charCodeAt(0) === key)) {
                    state = true;
                    break;
                }
            }
        }

        if (!state) {
            debug("The pressed key does not match");
            continue;
        }
        debug("Where=" + shortcut[0] + " what=" + shortcut[1] + ' function=' + (shortcut[2] ? shortcut[2] : 'undefined'));
        if (shortcut[2] === false)
            break; // Manage completion
        debug("Run the function");
        if (shortcut[2] !== undefined) {
            GUI.add_key(event, shortcut[2]);

            // Use method if it exists, if not use a function
            if (this[shortcut[2]])
                this[shortcut[2]](event);
            else
                window[shortcut[2]](event);
            stop_event(event);
            return false;
        }
        return true;
    }
    debug("Selected shortcut= " + shortcut + " state=" + state + " selection=" + selection);

    // completion

    if (selection
        && (key >= 48 || key == 8)
        && event.target.value.length == selection.end
        && !event.ctrlKey // No control code
        && !event.metaKey // No meta
        && !event.altKey // No alt
        && key != 229 // Firefox now send this keycode
        && key != 91) // No Meta key (Command on MacOS for copy paste)
    {
        if (do_completion_for_this_input == undefined) {
            do_completion_for_this_input = event.target;
            setTimeout('the_current_cell.do_completion(' + (key == 8) + ')', 1);
        }
    }
    return true;
};

var do_completion_for_this_input;

Current.prototype.do_completion = function (backspace) {
    var completion, completions = [];
    var input = do_completion_for_this_input;
    var last = input.value;

    do_completion_for_this_input = undefined;

    if (input == this.input || input.id == "table_forms_keypress") {
        if (this.column.type == 'Login') {
            login_list_ask(input);
            return;
        }
        var c = this.column.real_type.cell_completions(input.value, this.column);
        if (c != input.value && c.length != 0) {
            // It is an enumeration
            if (input.value.length == 0 && myindex(c, '') == -1)
                completions.push(["", "", "", "", ""]);
            for (var i in c)
                if (this.column.repetition_allow_this_value(c[i], this.line) == 0)
                    completions.push([c[i], "", "", "", c[i]]);
            completions.sort();
            last = input.value;
        }
        else if (this.column.completion != 0) {
            // Auto completion from content
            var uniques = compute_histogram(this.column.data_col).uniques();
            var value_low = input.value.toLowerCase();
            var value_len = input.value.length;

            for (var i in uniques)
                if (uniques[i] && i != "")
                    if (value_low == i.toLowerCase().substr(0, value_len))
                        completions.push([i, "", "", "", i]);
            completions.sort();
            if (completions.length != 1)
                completions.splice(0, 0, [input.value, "", "", "", input.value]);
        }
        else {
            // Replace value by it normal completion
            alert_merged = '';
            completion = this.column.real_type.cell_test(input.value, this.column);
            alert_merged = false;
            completions.push([completion, "", "", "", completion]);
        }
    }
    else if (input.getAttribute('get_completion_list')) {
        completions = eval(input.getAttribute('get_completion_list'))(input);
        element_focused = input;
        last = completions.last;
        delete completions.last;
    }

    if (completions.length > 1) {
        ask_login_list = "";
        login_list("", completions, last);
        return;
    }

    if (completions.length == 0 || backspace) {
        login_list_hide();
        return;
    }

    completion = completions[0][4];

    if (completion && completion.substr
        && completion.substr(0, input.value.length).toLowerCase()
        == input.value.toLowerCase())
        do_autocompletion(input, completion);
};

function do_autocompletion(input, completion) {
    var length = input.value.length;
    login_list_hide();
    if (window.KeyEvent) {
        input.value = "";
        for (var i = 0; i < completion.length; i++) {
            // Done this way to right scroll when there is a long value
            triggerKeyboardEvent(input, completion.charCodeAt(i));
            if (input.value.length == 0) {
                // Hit a bug, fallback on a classic method
                input.value = completion;
                break;
            }
        }
    }
    else
        input.value = completion;

    set_selection(input, length, input.value.length);
}


var current_change_running = false;

/*REDEFINE
  This function returns true if the student ID is missing on the line.
  It is called for each interactive cell change.
  If 'true' is returned, an alert is displayed to the user.
*/
Current.prototype.missing_id = function (value) {
    return (this.data_col !== 0
        && lines[this.line_id][0].is_empty()
        && value !== '');
};


Current.prototype.input_div_focus = function () {
    if (this.focused)
        this.input_div.style.border = "3px solid blue";
    else
        this.input_div.style.border = "3px solid gray";
};

function getline_import(student_id) {
    var line_id = login_to_line_id(student_id);
    var lines = document.getElementById('getline').rows;
    alert_append_start();
    for (var line of lines) {
        var data_col = column_title_to_data_col(line.cells[0].textContent);
        cell_set_value_real(line_id, data_col, line.cells[1].firstChild.value);
        update_cell_at(line_id, data_col);
    }
    alert_append_stop();
}

function getline_receiver(event) {
    if (event.target.readyState != 4)
        return;
    var response = event.target.response;
    if (!response || response.length == 0)
        return;
    var content = ['<button onclick="getline_import(', js2(response[0][1]), ')">',
        _("TITLE_column_attr_notation_import"), '</button> ',
        response[0][1], ' ', response[1][1], ' ', response[2][1],
        '<table id="getline" style="width:100%">'];
    response.splice(0, 3);
    for (var i of response)
        if (column_title_to_data_col(i[0]) !== undefined)
            content.push('<tr><th style="width:10%">' + html(i[0])
                + '<td><input value="' + encode_value(i[1]) + '"></tr>');
    content.push('</table>');
    set_message('getline', 1, content.join(''));
}
Current.prototype.change = function (value, event) {
    if (body_on_mouse_up_doing == "login_list") {
        if (event === undefined
            || (event.relatedTarget !== TIP.get_tip_select()
                && event.relatedTarget
                && event.relatedTarget.parentNode !== TIP.get_tip_select()
            )
        )
            login_list_hide();
        else {
            // Focus lost by clicking on SELECT
            setTimeout(function () {
                login_list_hide();
                the_current_cell.change();
            }, 200);
            return;
        }
    }
    else
        if (element_focused && element_focused.onblur)
            element_focused.onblur({ target: element_focused });
    this.input_div_focus();

    // Save modification in header before moving.
    if (element_focused !== undefined) {
        // if (element_focused.blur)
        //     element_focused.blur();
    }
    if (value === undefined)
        value = this.input.value;

    if (value == this.initial_value)
        return;

    // Because the function can popup an alert that remove focus from cell
    // This function must be ran only once
    if (current_change_running)
        return;

    value = value.replace(/^[ \t]*/, '').replace(/[ \t]*$/, '');
    if (value == this.initial_value)
        return;
    value = decode_lf_tab(value);

    current_change_running = true;

    // XXX This test should in the template.
    if (myindex(semesters, semester) != -1) {
        if (this.data_col === 0 && this.column.repetition == 1) {
            /* Verify ID */
            if (value !== '')
                if (login_to_line_id(value) !== undefined) {
                    Alert("ALERT_duplicate_id");
                    this.input.value = this.initial_value;
                    current_change_running = false;
                    GUI.add("cell_change_error", undefined, "duplicate_id");
                    return;
                }
        }
    }
    if (this.missing_id(value)) {
        Alert("ALERT_missing_id");
    }

    if (this.column) {
        var n = this.column.repetition_allow_this_value(value, this.line);
        if (n) {
            alert(_("ALERT_duplicate_before") + n + _("ALERT_duplicate_after")
                + Math.abs(this.column.real_repetition));
            this.input.value = this.initial_value;
            current_change_running = false;
            GUI.add("cell_change_error", undefined, "repetition_not_allowed");
            return;
        }
    }

    this.input.blur(); // If have focus : problem with page change
    this.input.value = encode_lf_tab(cell_set_value(this.td, value,
        this.line_id, this.data_col));
    this.initial_value = this.input.value;

    update_line(this.line_id, this.data_col);
    current_change_running = false;

    set_message('getline', 0);
    if (this.data_col == 0 && value !== '') {
        var previous = previous_year_semester(year, semester);
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', getline_receiver, false);
        xhr.responseType = 'json';
        xhr.open("GET", add_ticket(previous.join('/') + '/' + ue + '/getline/' + encode_uri(value)), true);
        xhr.send();
    }

    GUI.add("cell_change", undefined, this.input.value);
};

Current.prototype.toggle = function () {
    var toggle = this.column.real_type.ondoubleclick;
    if (toggle === undefined)
        return;
    var value = toggle(decode_lf_tab(this.input.value), this.column);
    if (this.td.classList.contains('ro'))
        return;
    var value_change = value !== decode_lf_tab(this.input.value);
    if (value_change) {
        this.input.value = encode_lf_tab(value);
        this.change();
    }
    this.update(!value_change);
};
var ՐՏ_5, ՐՏ_6, ՐՏ_7, ՐՏ_8, ՐՏ_9, ՐՏ_10, ՐՏ_12, ՐՏ_13, ՐՏ_14, ՐՏ_15, ՐՏ_16, ՐՏ_17, ՐՏ_18, ՐՏ_19, ՐՏ_20, ՐՏ_21, ՐՏ_22, ՐՏ_23, ՐՏ_24, ՐՏ_33, ՐՏ_34, ՐՏ_35, ՐՏ_36, ՐՏ_37, ՐՏ_38, ՐՏ_39, ՐՏ_40, ՐՏ_41, ՐՏ_42, ՐՏ_43, ՐՏ_45, ՐՏ_51, ՐՏ_55, ՐՏ_60, ՐՏ_69, ՐՏ_70, ՐՏ_71, ՐՏ_72, ՐՏ_73, ՐՏ_74, ՐՏ_75, ՐՏ_76, ՐՏ_77, ՐՏ_79, ՐՏ_80, ՐՏ_81, ՐՏ_82, ՐՏ_83, ՐՏ_84, ՐՏ_85, ՐՏ_87, ՐՏ_88, ՐՏ_90, ՐՏ_91, ՐՏ_92, ՐՏ_95, ՐՏ_102, ՐՏ_103, ՐՏ_106, ՐՏ_116, ՐՏ_117, ՐՏ_118, ՐՏ_119, ՐՏ_120, ՐՏ_121, ՐՏ_122, ՐՏ_124, ՐՏ_125;
function abs(n) {
    return Math.abs(n);
}
function ՐՏ_with__name__(fn, name) {
    fn.__name__ = name;
    return fn;
}
function dir(item) {
    var arr;
    arr = [];
    for (var i in item) {
        arr.push(i);
    }
    return arr;
}
function enumerate(item) {
    var arr, iter, i;
    arr = [];
    iter = ՐՏ_Iterable(item);
    for (i = 0; i < iter.length; i++) {
        arr[arr.length] = [ i, item[i] ];
    }
    return arr;
}
function ՐՏ_extends(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.__base__ = parent;
    child.prototype.constructor = child;
}
function ՐՏ_in(val, arr) {
    if (typeof arr.indexOf === "function") {
        return arr.indexOf(val) !== -1;
    } else if (typeof arr.has === "function") {
        return arr.has(val);
    }
    return arr.hasOwnProperty(val);
}
function ՐՏ_Iterable(iterable) {
    var tmp;
    if (iterable.constructor === [].constructor || iterable.constructor === "".constructor || (tmp = Array.prototype.slice.call(iterable)).length) {
        return tmp || iterable;
    }
    if (Set && iterable.constructor === Set) {
        return Array.from(iterable);
    }
    return Object.keys(iterable);
}
function len(obj) {
    var tmp;
    if (obj.constructor === [].constructor || obj.constructor === "".constructor || (tmp = Array.prototype.slice.call(obj)).length) {
        return (tmp || obj).length;
    }
    if (Set && obj.constructor === Set) {
        return obj.size;
    }
    return Object.keys(obj).length;
}
function max(a) {
    return Math.max.apply(null, Array.isArray(a) ? a : arguments);
}
function min(a) {
    return Math.min.apply(null, Array.isArray(a) ? a : arguments);
}
function ՐՏ_merge(target, source, overwrite) {
    var ՐՏitr161, ՐՏidx161;
    var prop;
    for (var i in source) {
        if (source.hasOwnProperty(i) && (overwrite || typeof target[i] === "undefined")) {
            target[i] = source[i];
        }
    }
    ՐՏitr161 = ՐՏ_Iterable(Object.getOwnPropertyNames(source.prototype));
    for (ՐՏidx161 = 0; ՐՏidx161 < ՐՏitr161.length; ՐՏidx161++) {
        prop = ՐՏitr161[ՐՏidx161];
        if (overwrite || typeof target.prototype[prop] === "undefined") {
            Object.defineProperty(target.prototype, prop, Object.getOwnPropertyDescriptor(source.prototype, prop));
        }
    }
}
function ՐՏ_print() {
    if (typeof console === "object") {
        console.log.apply(console, arguments);
    }
}
function range(start, stop, step) {
    var length, idx, range;
    if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }
    step = arguments[2] || 1;
    length = Math.max(Math.ceil((stop - start) / step), 0);
    idx = 0;
    range = new Array(length);
    while (idx < length) {
        range[idx++] = start;
        start += step;
    }
    return range;
}
function sum(arr, start) {
    start = start === void 0 ? 0 : start;
    return arr.reduce(function(prev, cur) {
        return prev + cur;
    }, start);
}
function zip(a, b) {
    var i;
    return (function() {
        var ՐՏidx162, ՐՏitr162 = ՐՏ_Iterable(range(Math.min(a.length, b.length))), ՐՏres = [], i;
        for (ՐՏidx162 = 0; ՐՏidx162 < ՐՏitr162.length; ՐՏidx162++) {
            i = ՐՏitr162[ՐՏidx162];
            ՐՏres.push([ a[i], b[i] ]);
        }
        return ՐՏres;
    })();
}
function getattr(obj, name) {
    return obj[name];
}
function hasattr(obj, name) {
    return name in obj;
}
function ՐՏ_eq(a, b) {
    var ՐՏitr163, ՐՏidx163;
    var i;
    if (a === b) {
        return true;
    }
    if (a === void 0 || b === void 0 || a === null || b === null) {
        return false;
    }
    if (a.constructor !== b.constructor) {
        return false;
    }
    if (Array.isArray(a)) {
        if (a.length !== b.length) {
            return false;
        }
        for (i = 0; i < a.length; i++) {
            if (!ՐՏ_eq(a[i], b[i])) {
                return false;
            }
        }
        return true;
    } else if (a.constructor === Object) {
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false;
        }
        ՐՏitr163 = ՐՏ_Iterable(a);
        for (ՐՏidx163 = 0; ՐՏidx163 < ՐՏitr163.length; ՐՏidx163++) {
            i = ՐՏitr163[ՐՏidx163];
            if (!ՐՏ_eq(a[i], b[i])) {
                return false;
            }
        }
        return true;
    } else if (Set && a.constructor === Set || Map && a.constructor === Map) {
        if (a.size !== b.size) {
            return false;
        }
        for (i of a) {
            if (!b.has(i)) {
                return false;
            }
        }
        return true;
    } else if (a.constructor === Date) {
        return a.getTime() === b.getTime();
    } else if (typeof a.__eq__ === "function") {
        return a.__eq__(b);
    }
    return false;
}
function kwargs(f) {
    var argNames;
    argNames = f.toString().match(/\(([^\)]+)/)[1];
    if (!kwargs.memo[argNames]) {
        kwargs.memo[argNames] = argNames ? argNames.split(",").map(function(s) {
            return s.trim();
        }) : [];
    }
    argNames = kwargs.memo[argNames];
    return function() {
        var args, kw, i;
        args = [].slice.call(arguments);
        if (args.length) {
            kw = args[args.length-1];
            if (typeof kw === "object") {
                for (i = 0; i < argNames.length; i++) {
                    if (ՐՏ_in(argNames[i], kw)) {
                        args[i] = kw[argNames[i]];
                    }
                }
            } else {
                args.push(kw);
            }
        }
        try {
            return f.apply(this, args);
        } catch (ՐՏ_Exception) {
            var e = ՐՏ_Exception;
            if (/Class constructor \w+ cannot be invoked without 'new'/.test(e)) {
                return new f(args);
            }
            throw ՐՏ_Exception;
        }
    };
}
kwargs.memo = {};
var ValueError = (ՐՏ_126 = function ValueError() {
    ValueError.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_126, Error), (function(){
    Object.defineProperties(ՐՏ_126.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(message){
                var self = this;
                self.name = "ValueError";
                self.message = message;
            }

        }
    });
    return ՐՏ_126;
})(), ՐՏ_126);

var __name__ = "__main__";
var debug, python_mode, o, flat_map, unicode, ceil, floor, parseJSON, dumpJSON, contextual_case_sensitive, nan, letter_to_duration, FIRST_DATE, LAST_DATE, ALL_DATES, NO_DATES, filterOperators, filterAttributes, LAST_COMPUTED_UE_GRADE, ERR_DUPLICATE, ERR_OBSERVATION, ERR_INVALID, AGGREGATE_EVALUATORS;
debug = false;
python_mode = false;
if (!(ՐՏ_in("console", window))) {
    window.console = console;
}
try {
    str(5);
} catch (ՐՏ_Exception) {
    function str(x) {
        return "" + x;
    }
}
try {
    "".join([]);
} catch (ՐՏ_Exception) {
    function __join__(t) {
        return t.join(this);
    }
    String.prototype.join = __join__;
}
try {
    "".strip();
} catch (ՐՏ_Exception) {
    String.prototype.strip = String.prototype.trim;
}
try {
    "".lstrip();
} catch (ՐՏ_Exception) {
    if (String.prototype.trimLeft) {
        String.prototype.lstrip = String.prototype.trimLeft;
    } else {
        function __trimLeft__() {
            var i;
            i = 0;
            while (this[i] === " ") {
                ++i;
            }
            return this.slice(i);
        }
        String.prototype.lstrip = __trimLeft__;
    }
}
try {
    "".startswith("");
} catch (ՐՏ_Exception) {
    function __startswith__(t) {
        var ՐՏ_1;
        return ((ՐՏ_1 = this.substr(0, len(t))) === t || typeof ՐՏ_1 === "object" && ՐՏ_eq(ՐՏ_1, t));
    }
    String.prototype.startswith = __startswith__;
}
try {
    "".endswith("");
} catch (ՐՏ_Exception) {
    function __endswith__(t) {
        var ՐՏ_2;
        return ((ՐՏ_2 = this.substr(this.length - len(t))) === t || typeof ՐՏ_2 === "object" && ՐՏ_eq(ՐՏ_2, t));
    }
    String.prototype.endswith = __endswith__;
}
try {
    "".find("");
} catch (ՐՏ_Exception) {
    String.prototype.find = String.prototype.indexOf;
}
try {
    "".lower();
} catch (ՐՏ_Exception) {
    String.prototype.lower = String.prototype.toLowerCase;
}
try {
    "".upper();
} catch (ՐՏ_Exception) {
    String.prototype.upper = String.prototype.toUpperCase;
}
o = Object;
try {
    [].append(0);
} catch (ՐՏ_Exception) {
    o.defineProperty(Array.prototype, "append", {
        "enumerable": false,
        "value": Array.prototype.push
    });
}
try {
    [].insert(0, 0, 0);
} catch (ՐՏ_Exception) {
    function _array_insert_(index, data) {
        this.splice(index, 0, data);
    }
    o.defineProperty(Array.prototype, "insert", {
        "enumerable": false,
        "value": _array_insert_
    });
}
function python_pop(array, i) {
    array.splice(i, 1);
}
function replace_all(txt, regexp, value) {
    regexp = regexp.replace(new RegExp("\\\\", "g"), "\\\\");
    return txt.replace(new RegExp(regexp, "g"), value);
}
function js_str(txt) {
    return JSON.stringify(txt);
}
function date_add(date, seconds) {
    date.setTime(date.getTime() + 1e3 * seconds);
}
flat_map = "\0\b\t\n\f\r !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿AAAAAAACEEEEIIIIDNOOOOOOOUUUUYÞßaaaaaaaceeeeiiiiðnooooooouuuuyþy";
function char_flat(c) {
    return flat_map.substr(c.charCodeAt(0), 1);
}
function flat(txt) {
    return txt.replace(new RegExp("[\\x80-\\xFF]", "g"), char_flat);
}
unicode = str;
function localtime() {
    var year_month_day;
    year_month_day = new Date();
    year_month_day = [ year_month_day.getFullYear(), year_month_day.getMonth() + 1, year_month_day.getDate() ];
    return year_month_day;
}
function seconds_to_date(seconds) {
    seconds = seconds === void 0 ? null : seconds;
    var d;
    d = new Date();
    if (seconds) {
        d.setTime(seconds * 1e3);
    } else {
        d.setTime(millisec());
    }
    return d.getFullYear() + two_digits(d.getMonth() + 1) + two_digits(d.getDate()) + two_digits(d.getHours()) + two_digits(d.getMinutes()) + two_digits(d.getSeconds());
}
function date_to_seconds(date) {
    return get_date_tomuss(date).getTime() / 1e3;
}
function REsplit(expreg, txt) {
    return txt.split(new RegExp(expreg));
}
function to_float_or_nan(txt) {
    try {
        return Number.prototype.constructor(txt.replace(",", "."));
    } catch (ՐՏ_Exception) {
        return Number.prototype.constructor(txt);
    }
}
function to_float_or_small(txt) {
    var n;
    try {
        n = Number.prototype.constructor(txt.replace(",", "."));
    } catch (ՐՏ_Exception) {
        n = txt;
    }
    if (isNaN(n)) {
        return -1e50;
    }
    return n;
}
function to_float(txt) {
    var n;
    n = to_float_or_nan(txt);
    if (isNaN(n)) {
        throw new ValueError("not float");
    }
    return n;
}
function as_fixed(t) {
    var v;
    if (t === "") {
        return t;
    }
    v = new Number(t);
    if (isNaN(v)) {
        return t;
    } else {
        if (v >= 1 && t[0] === "0") {
            return t;
        }
        return v.toFixed(3);
    }
}
function rint(x) {
    return Math.floor(x + .4999999999999);
}
function capitalize(s) {
    return s.charAt(0).upper() + s.slice(1);
}
ceil = Math.ceil;
floor = Math.floor;
function _array_extend_(tab2) {
    var ՐՏitr1, ՐՏidx1;
    var elem;
    ՐՏitr1 = ՐՏ_Iterable(tab2);
    for (ՐՏidx1 = 0; ՐՏidx1 < ՐՏitr1.length; ՐՏidx1++) {
        elem = ՐՏitr1[ՐՏidx1];
        this.push(elem);
    }
}
o.defineProperty(Array.prototype, "extend", {
    "enumerable": false,
    "value": _array_extend_
});
function regexp_match(regexp, text) {
    return new RegExp(regexp).test(text);
}
function copy_to_tomuss_python() {
}
function major_of(login) {
    return [];
}
parseJSON = JSON.parse;
dumpJSON = JSON.stringify;
function isdigit() {
    return this.match(new RegExp("^[0-9]+$"));
}
String.prototype.isdigit = isdigit;
function isNumber(n) {
    if (new Number(n) || new Number(n) === 0) {
        return true;
    }
    return false;
}
function isStr(s) {
    var ՐՏ_3;
    return ((ՐՏ_3 = s.constructor) === String || typeof ՐՏ_3 === "object" && ՐՏ_eq(ՐՏ_3, String));
}
"\n";
function compute_normalize_key(selectors, line) {
    var ՐՏitr2, ՐՏidx2;
    var key, selector;
    key = "";
    ՐՏitr2 = ՐՏ_Iterable(selectors);
    for (ՐՏidx2 = 0; ՐՏidx2 < ՐՏitr2.length; ՐՏidx2++) {
        selector = ՐՏitr2[ՐՏidx2];
        key += "," + str(line[selector].value);
    }
    return key;
}
function compute_normalize(data_col, line, _username) {
    var ՐՏitr3, ՐՏidx3, ՐՏitr4, ՐՏidx4;
    var column_out, selectors, column_in, the_lines, grades, line_id, a_line, value, key, values, i, stddev, goals, average_goal, stddev_goal;
    column_out = columns[data_col];
    if (len(column_out.average_columns) === 0) {
        return "";
    }
    selectors = column_out.average_columns.slice(1);
    column_in = column_out.average_columns[0];
    if (columns[column_in].visibility === 5 && python_mode) {
        return "";
    }
    if (!getattr(column_out, "normalize_cache_time", null) || column_out.normalize_cache_time < millisec() - 100) {
        try {
            the_lines = lines;
            if (!the_lines || the_lines instanceof Array) {
                return line[data_col].value;
            }
        } catch (ՐՏ_Exception) {
            the_lines = column_out.table.lines;
        }
        grades = {};
        ՐՏitr3 = ՐՏ_Iterable(the_lines);
        for (ՐՏidx3 = 0; ՐՏidx3 < ՐՏitr3.length; ՐՏidx3++) {
            line_id = ՐՏitr3[ՐՏidx3];
            a_line = the_lines[line_id];
            value = a_line[column_in].value;
            if (str(value) === "") {
                continue;
            }
            value = to_float_or_nan(value);
            if (isNaN(value)) {
                continue;
            }
            key = compute_normalize_key(selectors, a_line);
            if (!(ՐՏ_in(key, grades))) {
                grades[key] = [];
            }
            grades[key].append(value);
        }
        column_out.normalize_average = {};
        column_out.normalize_stddev = {};
        ՐՏitr4 = ՐՏ_Iterable(grades);
        for (ՐՏidx4 = 0; ՐՏidx4 < ՐՏitr4.length; ՐՏidx4++) {
            key = ՐՏitr4[ՐՏidx4];
            values = grades[key];
            column_out.normalize_average[key] = sum(values) / len(values);
            column_out.normalize_stddev[key] = Math.pow((sum((function() {
                var ՐՏidx5, ՐՏitr5 = ՐՏ_Iterable(values), ՐՏres = [], i;
                for (ՐՏidx5 = 0; ՐՏidx5 < ՐՏitr5.length; ՐՏidx5++) {
                    i = ՐՏitr5[ՐՏidx5];
                    ՐՏres.push(i * i);
                }
                return ՐՏres;
            })()) / len(values) - column_out.normalize_average[key] * column_out.normalize_average[key]), .5);
        }
        column_out.normalize_cache_time = millisec();
    }
    value = line[column_in].value;
    if (str(value) === "") {
        return "";
    }
    value = to_float_or_nan(value);
    if (isNaN(value)) {
        return line[column_in].value;
    }
    key = compute_normalize_key(selectors, line);
    stddev = column_out.normalize_stddev[key];
    if (!stddev) {
        return nan;
    }
    goals = REsplit(" +", column_out.normalize);
    average_goal = parseFloat(goals[0]);
    stddev_goal = parseFloat(goals[1]);
    value = clamp((value - column_out.normalize_average[key]) * stddev_goal / stddev + average_goal, column_out);
    return do_round(value, column_out.round_by, column_out.table.rounding, column_out.old_function);
}
contextual_case_sensitive = false;
nan = parseFloat("NaN");
function two_digits(value) {
    if (value >= 10) {
        return str(value);
    }
    return "0" + str(value);
}
letter_to_duration = {
    "y": 365 * 24,
    "m": 30 * 24,
    "w": 7 * 24,
    "d": 24,
    "h": 1,
    "'": 1 / 60
};
letter_to_duration["a"] = letter_to_duration["y"];
letter_to_duration["s"] = letter_to_duration["w"];
letter_to_duration["j"] = letter_to_duration["d"];
function is_a_relative_date(txt) {
    return txt !== "" && ՐՏ_in(txt[txt.length-1], letter_to_duration);
}
function get_relative_span(txt) {
    var nb;
    try {
        nb = parseFloat(txt.slice(0, -1));
    } catch (ՐՏ_Exception) {
        return -1;
    }
    return nb * letter_to_duration[txt[txt.length-1]] * 60 * 60;
}
function get_relative_date(txt) {
    var span;
    span = get_relative_span(txt);
    if (span < 0) {
        return LAST_DATE;
    }
    return seconds_to_date(millisec() / 1e3 - span);
}
function user_date_to_date(txt) {
    var ՐՏitr6, ՐՏidx6, ՐՏ_4;
    var year_month_day, t, hour, hms, invalid, the_day, the_month, the_year;
    if (txt === "") {
        year_month_day = localtime();
        return str(year_month_day[0]) + two_digits(year_month_day[1]) + two_digits(year_month_day[2]);
    }
    txt = str(txt);
    if (is_a_relative_date(txt)) {
        return get_relative_date(txt);
    }
    txt = REsplit("[- _]", txt);
    t = "";
    if (len(txt) === 2) {
        hour = txt[1].split(":");
        ՐՏitr6 = ՐՏ_Iterable(hour);
        for (ՐՏidx6 = 0; ՐՏidx6 < ՐՏitr6.length; ՐՏidx6++) {
            hms = ՐՏitr6[ՐՏidx6];
            if (hms === "") {
                break;
            }
            try {
                t += two_digits(parseInt(hms));
            } catch (ՐՏ_Exception) {
                break;
            }
        }
    }
    invalid = REsplit("[0-9/]+", txt[0]);
    if ((invalid !== (ՐՏ_4 = [ "", "" ]) && (typeof invalid !== "object" || !ՐՏ_eq(invalid, ՐՏ_4)))) {
        return "9999";
    }
    year_month_day = localtime();
    txt = txt[0].split("/");
    try {
        the_day = parseInt(txt[0]);
    } catch (ՐՏ_Exception) {
        return "9999";
    }
    if (isNaN(the_day)) {
        return "9999";
    }
    the_month = year_month_day[1];
    if (len(txt) >= 2) {
        try {
            the_month = parseInt(txt[1]);
        } catch (ՐՏ_Exception) {
        }
    }
    the_year = year_month_day[0];
    if (len(txt) >= 3) {
        try {
            the_year = parseInt(txt[2]);
        } catch (ՐՏ_Exception) {
        }
    }
    return str(the_year) + two_digits(the_month) + two_digits(the_day) + t;
}
var FilterContext = (ՐՏ_5 = function FilterContext() {
    FilterContext.prototype.__init__.apply(this, arguments);
}, (function(){
    Object.defineProperties(ՐՏ_5.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(line, cell, username, is_a_teacher){
                var self = this;
                self.line = line;
                self.cell = cell;
                self.username = username;
                self.is_a_teacher = is_a_teacher;
            }

        }
    });
    return ՐՏ_5;
})(), ՐՏ_5);
var CellAttr = (ՐՏ_6 = function CellAttr() {
    CellAttr.prototype.__init__.apply(this, arguments);
}, (function(){
    Object.defineProperties(ՐՏ_6.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(){
                var self = this;
            }

        },
        is_empty: {
            enumerable: true, 
            writable: true, 
            value: function is_empty(){
                var self = this;
                return false;
            }

        }
    });
    return ՐՏ_6;
})(), ՐՏ_6);
var CellAttrCell = (ՐՏ_7 = function CellAttrCell() {
    CellAttrCell.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_7, CellAttr), (function(){
    Object.defineProperties(ՐՏ_7.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(what){
                var self = this;
                self.what = what;
            }

        },
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return getattr(fc.cell, self.what);
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "cell." + self.what;
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return _("F_cell_" + self.what);
            }

        }
    });
    return ՐՏ_7;
})(), ՐՏ_7);
var CellAttrOther = (ՐՏ_8 = function CellAttrOther() {
    CellAttrOther.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_8, CellAttr), (function(){
    Object.defineProperties(ՐՏ_8.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(data_col, what){
                var self = this;
                self.what = what;
                self.data_col = data_col;
            }

        },
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return getattr(fc.line[self.data_col], self.what);
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "line[" + str(self.data_col) + "]." + self.what;
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return _("F_col_" + self.what) + " «" + html(columns[self.data_col].title) + "»";
            }

        }
    });
    return ՐՏ_8;
})(), ՐՏ_8);
var CellAttrConst = (ՐՏ_9 = function CellAttrConst() {
    CellAttrConst.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_9, CellAttr), (function(){
    Object.defineProperties(ՐՏ_9.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(value){
                var self = this;
                self.value = value;
            }

        },
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(_fc){
                var self = this;
                return self.value;
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return js_str(self.value);
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                if (str(self.value) === "") {
                    return _("F_empty");
                }
                return "«" + html(self.value) + "»";
            }

        },
        is_empty: {
            enumerable: true, 
            writable: true, 
            value: function is_empty(){
                var self = this;
                return self.value === "";
            }

        }
    });
    return ՐՏ_9;
})(), ՐՏ_9);
var CellAttrConstDate = (ՐՏ_10 = function CellAttrConstDate() {
    CellAttrConst.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_10, CellAttrConst), (function(){
    Object.defineProperties(ՐՏ_10.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(_fc){
                var self = this;
                return get_relative_date(self.value);
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "get_relative_date(" + js_str(self.value) + ")";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var ՐՏ_11;
                var self = this;
                return html(self.value.slice(0, -1)) + " " + _("F_" + (ՐՏ_11 = self.value)[ՐՏ_11.length-1]);
            }

        }
    });
    return ՐՏ_10;
})(), ՐՏ_10);
var CellAttrConstFixedDate = (ՐՏ_12 = function CellAttrConstFixedDate() {
    CellAttrConst.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_12, CellAttrConst), (function(){
    Object.defineProperties(ՐՏ_12.prototype, {
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                var f;
                f = "%a %d/%m/%Y";
                if (len(self.value) >= 10) {
                    f += " %H";
                }
                if (len(self.value) >= 12) {
                    f += ":%M";
                }
                if (len(self.value) >= 14) {
                    f += ":%S";
                }
                return get_date_tomuss(self.value).formate(f);
            }

        }
    });
    return ՐՏ_12;
})(), ՐՏ_12);
var CellAttrConstSeconds = (ՐՏ_13 = function CellAttrConstSeconds() {
    CellAttr.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_13, CellAttr), (function(){
    Object.defineProperties(ՐՏ_13.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(_fc){
                var self = this;
                return seconds_to_date();
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "seconds_to_date()";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return _("F_date");
            }

        }
    });
    return ՐՏ_13;
})(), ՐՏ_13);
var CellAttrConstUserName = (ՐՏ_14 = function CellAttrConstUserName() {
    CellAttr.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_14, CellAttr), (function(){
    Object.defineProperties(ՐՏ_14.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return fc.username;
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "(window.display_data && is_a_teacher === 0 ? display_data['Login'] : username)";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return _("F_login");
            }

        }
    });
    return ՐՏ_14;
})(), ՐՏ_14);
var CellAttrAsDate = (ՐՏ_15 = function CellAttrAsDate() {
    CellAttrAsDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_15, CellAttr), (function(){
    Object.defineProperties(ՐՏ_15.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(cellattr){
                var self = this;
                self.cellattr = cellattr;
            }

        },
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return user_date_to_date(self.cellattr.fct(fc));
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "user_date_to_date(" + self.cellattr.js() + ")";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return self.cellattr.editor();
            }

        }
    });
    return ՐՏ_15;
})(), ՐՏ_15);
var CellAttrAsFloat = (ՐՏ_16 = function CellAttrAsFloat() {
    CellAttrAsDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_16, CellAttrAsDate), (function(){
    Object.defineProperties(ՐՏ_16.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return to_float_or_nan(self.cellattr.fct(fc));
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "to_float_or_nan(" + self.cellattr.js() + ")";
            }

        }
    });
    return ՐՏ_16;
})(), ՐՏ_16);
var CellAttrAsString = (ՐՏ_17 = function CellAttrAsString() {
    CellAttrAsDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_17, CellAttrAsDate), (function(){
    Object.defineProperties(ՐՏ_17.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return str(self.cellattr.fct(fc));
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return self.cellattr.js() + ".toString()";
            }

        }
    });
    return ՐՏ_17;
})(), ՐՏ_17);
var CellAttrAsLower = (ՐՏ_18 = function CellAttrAsLower() {
    CellAttrAsDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_18, CellAttrAsDate), (function(){
    Object.defineProperties(ՐՏ_18.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return str(self.cellattr.fct(fc)).lower();
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return self.cellattr.js() + ".toString().toLowerCase()";
            }

        }
    });
    return ՐՏ_18;
})(), ՐՏ_18);
var CellAttrAsFlat = (ՐՏ_19 = function CellAttrAsFlat() {
    CellAttrAsDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_19, CellAttrAsDate), (function(){
    Object.defineProperties(ՐՏ_19.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return flat(self.cellattr.fct(fc));
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "flat(" + self.cellattr.js() + ")";
            }

        }
    });
    return ՐՏ_19;
})(), ՐՏ_19);
var CellAttrAsFixed = (ՐՏ_20 = function CellAttrAsFixed() {
    CellAttrAsDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_20, CellAttrAsDate), (function(){
    Object.defineProperties(ՐՏ_20.prototype, {
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return as_fixed(self.cellattr.fct(fc));
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "as_fixed(" + self.cellattr.js() + ")";
            }

        }
    });
    return ՐՏ_20;
})(), ՐՏ_20);
var CellAttrTruncate = (ՐՏ_21 = function CellAttrTruncate() {
    CellAttrTruncate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_21, CellAttr), (function(){
    Object.defineProperties(ՐՏ_21.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(cellattr, length){
                var self = this;
                self.cellattr = cellattr;
                self.length = length;
            }

        },
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return self.cellattr.fct(fc).slice(0, self.length);
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return self.cellattr.js() + ".substr(0," + str(self.length) + ")";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return self.cellattr.editor();
            }

        }
    });
    return ՐՏ_21;
})(), ՐՏ_21);
var CellAttrAppend = (ՐՏ_22 = function CellAttrAppend() {
    CellAttrAppend.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_22, CellAttr), (function(){
    Object.defineProperties(ՐՏ_22.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(cellattr, value){
                var self = this;
                self.cellattr = cellattr;
                self.value = value;
            }

        },
        fct: {
            enumerable: true, 
            writable: true, 
            value: function fct(fc){
                var self = this;
                return self.cellattr.fct(fc) + self.value;
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "(" + self.cellattr.js() + "+" + js_str(self.value) + ")";
            }

        }
    });
    return ՐՏ_22;
})(), ՐՏ_22);
var FilterCommon = (ՐՏ_23 = function FilterCommon() {
    FilterCommon.prototype.__init__.apply(this, arguments);
}, (function(){
    var data_col_left = null;
    var data_col_right = null;
    Object.defineProperties(ՐՏ_23.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(){
                var self = this;
            }

        },
        data_col_left: {
            enumerable: true, 
            writable: true, 
            value: data_col_left
        },
        data_col_right: {
            enumerable: true, 
            writable: true, 
            value: data_col_right
        }
    });
    return ՐՏ_23;
})(), ՐՏ_23);
FIRST_DATE = "0000";
LAST_DATE = "9999";
function nice_span_date(date, end) {
    var start;
    start = get_date_tomuss((date + "000000").slice(0, 14));
    if (end) {
        if (len(date) === 8) {
            date_add(start, 24 * 60 * 60);
        } else if (len(date) === 10) {
            date_add(start, 60 * 60);
        } else if (len(date) === 12) {
            date_add(start, 60);
        }
    }
    return start.formate("%a %d/%m/%Y %H:%M:%S");
}
var Dates = (ՐՏ_24 = function Dates() {
    Dates.prototype.__init__.apply(this, arguments);
}, (function(){
    Object.defineProperties(ՐՏ_24.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(dates){
                var self = this;
                self.dates = dates;
                self.cleanup();
            }

        },
        cleanup: {
            enumerable: true, 
            writable: true, 
            value: function cleanup(){
                var ՐՏitr7, ՐՏidx7, ՐՏ_25, ՐՏ_26, ՐՏitr8, ՐՏidx8, ՐՏupk1, ՐՏ_27;
                var self = this;
                var date, dates, start, include_start, end, include_end, last_end;
                ՐՏitr7 = ՐՏ_Iterable(self.dates.slice(0));
                for (ՐՏidx7 = 0; ՐՏidx7 < ՐՏitr7.length; ՐՏidx7++) {
                    date = ՐՏitr7[ՐՏidx7];
                    if (!date[1] && ((ՐՏ_25 = date[0]) === (ՐՏ_26 = date[2]) || typeof ՐՏ_25 === "object" && ՐՏ_eq(ՐՏ_25, ՐՏ_26)) && !date[3]) {
                        self.dates.remove(date);
                    }
                }
                if (len(self.dates) <= 1) {
                    return;
                }
                dates = [ self.dates[0] ];
                ՐՏitr8 = ՐՏ_Iterable(self.dates.slice(1));
                for (ՐՏidx8 = 0; ՐՏidx8 < ՐՏitr8.length; ՐՏidx8++) {
                    date = ՐՏitr8[ՐՏidx8];
                    ՐՏupk1 = date;
                    start = ՐՏupk1[0];
                    include_start = ՐՏupk1[1];
                    end = ՐՏupk1[2];
                    include_end = ՐՏupk1[3];
                    last_end = dates[dates.length-1][2];
                    if (start > last_end) {
                        dates.append(date);
                    } else if ((start === last_end || typeof start === "object" && ՐՏ_eq(start, last_end))) {
                        if (include_start || dates[dates.length-1][3]) {
                            dates[dates.length-1][2] = end;
                            dates[dates.length-1][3] = include_end;
                        } else {
                            dates.append(date);
                        }
                    } else {
                        if ((start === (ՐՏ_27 = dates[dates.length-1][0]) || typeof start === "object" && ՐՏ_eq(start, ՐՏ_27)) && !dates[dates.length-1][1]) {
                            dates[dates.length-1][1] = include_start;
                        }
                        if ((end === last_end || typeof end === "object" && ՐՏ_eq(end, last_end)) && !dates[dates.length-1][3]) {
                            dates[dates.length-1][3] = include_end;
                        }
                        if (end > last_end) {
                            dates[dates.length-1][2] = end;
                            dates[dates.length-1][3] = include_end;
                        }
                    }
                }
                self.dates = dates;
            }

        },
        negate: {
            enumerable: true, 
            writable: true, 
            value: function negate(){
                var ՐՏitr9, ՐՏidx9, ՐՏupk2;
                var self = this;
                var dates, last_end, last_include_end, start, include_start, end, include_end;
                if (!self.dates) {
                    return ALL_DATES.clone();
                }
                dates = [];
                last_end = FIRST_DATE;
                last_include_end = true;
                ՐՏitr9 = ՐՏ_Iterable(self.dates);
                for (ՐՏidx9 = 0; ՐՏidx9 < ՐՏitr9.length; ՐՏidx9++) {
                    ՐՏupk2 = ՐՏitr9[ՐՏidx9];
                    start = ՐՏupk2[0];
                    include_start = ՐՏupk2[1];
                    end = ՐՏupk2[2];
                    include_end = ՐՏupk2[3];
                    if (start !== FIRST_DATE) {
                        dates.append([ last_end, !last_include_end, start, !include_start ]);
                    }
                    last_end = end;
                    last_include_end = include_end;
                }
                if (last_end !== LAST_DATE) {
                    dates.append([ last_end, !last_include_end, LAST_DATE, false ]);
                }
                return new Dates(dates);
            }

        },
        add: {
            enumerable: true, 
            writable: true, 
            value: function add(dates){
                var ՐՏitr10, ՐՏidx10;
                var self = this;
                var date;
                ՐՏitr10 = ՐՏ_Iterable(dates.dates);
                for (ՐՏidx10 = 0; ՐՏidx10 < ՐՏitr10.length; ՐՏidx10++) {
                    date = ՐՏitr10[ՐՏidx10];
                    self.dates.append(date);
                }
                self.dates.sort();
                self.cleanup();
            }

        },
        sub_date: {
            enumerable: true, 
            writable: true, 
            value: function sub_date(start, include_start, end, include_end){
                var ՐՏitr11, ՐՏidx11, ՐՏ_28, ՐՏ_29, ՐՏ_30, ՐՏ_31, ՐՏ_32;
                var self = this;
                var dates, date;
                dates = [];
                ՐՏitr11 = ՐՏ_Iterable(self.dates);
                for (ՐՏidx11 = 0; ՐՏidx11 < ՐՏitr11.length; ՐՏidx11++) {
                    date = ՐՏitr11[ՐՏidx11];
                    if (date[2] < start) {
                        dates.append(date);
                    } else if (date[0] > end) {
                        dates.append(date);
                    } else if (((ՐՏ_28 = date[0]) === end || typeof ՐՏ_28 === "object" && ՐՏ_eq(ՐՏ_28, end))) {
                        dates.append([ date[0], false, date[2], date[3] ]);
                    } else if (((ՐՏ_29 = date[2]) === start || typeof ՐՏ_29 === "object" && ՐՏ_eq(ՐՏ_29, start))) {
                        if (date[3] && include_start) {
                            date[3] = false;
                        }
                        dates.append(date);
                    } else if (date[0] >= start) {
                        if (((ՐՏ_30 = date[0]) === start || typeof ՐՏ_30 === "object" && ՐՏ_eq(ՐՏ_30, start)) && date[1] && !include_start) {
                            dates.append([ start, true, start, true ]);
                        }
                        if (end < date[2]) {
                            dates.append([ end, !include_end, date[2], date[3] ]);
                        } else if ((end === (ՐՏ_31 = date[2]) || typeof end === "object" && ՐՏ_eq(end, ՐՏ_31))) {
                            if (!include_end && date[3]) {
                                dates.append([ end, true, end, true ]);
                            }
                        } else {
                        }
                    } else {
                        dates.append([ date[0], date[1], start, !include_start ]);
                        if (end < date[2]) {
                            dates.append([ end, !include_end, date[2], date[3] ]);
                        } else if ((end === (ՐՏ_32 = date[2]) || typeof end === "object" && ՐՏ_eq(end, ՐՏ_32))) {
                            if (!include_end && date[3]) {
                                dates.append([ end, true, end, true ]);
                            }
                        } else {
                        }
                    }
                }
                self.dates = dates;
            }

        },
        sub: {
            enumerable: true, 
            writable: true, 
            value: function sub(dates){
                var ՐՏitr12, ՐՏidx12, ՐՏupk3;
                var self = this;
                var start, include_start, end, include_end;
                ՐՏitr12 = ՐՏ_Iterable(dates.dates);
                for (ՐՏidx12 = 0; ՐՏidx12 < ՐՏitr12.length; ՐՏidx12++) {
                    ՐՏupk3 = ՐՏitr12[ՐՏidx12];
                    start = ՐՏupk3[0];
                    include_start = ՐՏupk3[1];
                    end = ՐՏupk3[2];
                    include_end = ՐՏupk3[3];
                    self.sub_date(start, include_start, end, include_end);
                }
            }

        },
        intersection: {
            enumerable: true, 
            writable: true, 
            value: function intersection(dates){
                var self = this;
                self.sub(dates.negate());
            }

        },
        clone: {
            enumerable: true, 
            writable: true, 
            value: function clone(){
                var self = this;
                var date;
                return new Dates((function() {
                    var ՐՏidx13, ՐՏitr13 = ՐՏ_Iterable(self.dates), ՐՏres = [], date;
                    for (ՐՏidx13 = 0; ՐՏidx13 < ՐՏitr13.length; ՐՏidx13++) {
                        date = ՐՏitr13[ՐՏidx13];
                        ՐՏres.push(date.slice(0));
                    }
                    return ՐՏres;
                })());
            }

        },
        forever: {
            enumerable: true, 
            writable: true, 
            value: function forever(){
                var self = this;
                if (len(self.dates) !== 1) {
                    return false;
                }
                return self.dates[0][0] === FIRST_DATE && self.dates[0][2] === LAST_DATE;
            }

        },
        __str__: {
            enumerable: true, 
            writable: true, 
            value: function __str__(){
                var ՐՏitr14, ՐՏidx14, ՐՏupk4;
                var self = this;
                var texts, start, include_start, end, include_end, s;
                texts = [];
                ՐՏitr14 = ՐՏ_Iterable(self.dates);
                for (ՐՏidx14 = 0; ՐՏidx14 < ՐՏitr14.length; ՐՏidx14++) {
                    ՐՏupk4 = ՐՏitr14[ՐՏidx14];
                    start = ՐՏupk4[0];
                    include_start = ՐՏupk4[1];
                    end = ՐՏupk4[2];
                    include_end = ՐՏupk4[3];
                    if (start === FIRST_DATE) {
                        s = "";
                    } else {
                        if (include_start) {
                            s = nice_span_date(start, 0);
                        } else {
                            s = nice_span_date(start, 1);
                        }
                    }
                    s += " → ";
                    if (end !== LAST_DATE) {
                        if (include_end) {
                            s += nice_span_date(end, 1);
                        } else {
                            s += nice_span_date(end, 0);
                        }
                    }
                    texts.append(s);
                }
                return "\n".join(texts);
            }

        }
    });
    return ՐՏ_24;
})(), ՐՏ_24);
ALL_DATES = new Dates([ [ FIRST_DATE, false, LAST_DATE, false ] ]);
NO_DATES = new Dates([]);
var FilterNegate = (ՐՏ_33 = function FilterNegate() {
    FilterNegate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_33, FilterCommon), (function(){
    Object.defineProperties(ՐՏ_33.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(node){
                var self = this;
                self.node = node;
                self.data_col_left = node.data_col_left;
                self.data_col_right = node.data_col_right;
            }

        },
        evaluate: {
            enumerable: true, 
            writable: true, 
            value: function evaluate(fc){
                var self = this;
                return !self.node.evaluate(fc);
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "!" + self.node.js();
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                var negation;
                negation = self.node.editor_negate();
                if (negation) {
                    return negation;
                }
                return _("F_!") + " " + self.node.editor();
            }

        },
        dates: {
            enumerable: true, 
            writable: true, 
            value: function dates(fc){
                var self = this;
                return self.node.dates(fc).negate();
            }

        }
    });
    return ՐՏ_33;
})(), ՐՏ_33);
var FilterTrue = (ՐՏ_34 = function FilterTrue() {
    FilterCommon.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_34, FilterCommon), (function(){
    Object.defineProperties(ՐՏ_34.prototype, {
        evaluate: {
            enumerable: true, 
            writable: true, 
            value: function evaluate(fc){
                var self = this;
                return true;
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "true";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return _("F_true");
            }

        },
        dates: {
            enumerable: true, 
            writable: true, 
            value: function dates(_fc){
                var self = this;
                return ALL_DATES.clone();
            }

        }
    });
    return ՐՏ_34;
})(), ՐՏ_34);
var FilterFalse = (ՐՏ_35 = function FilterFalse() {
    FilterCommon.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_35, FilterCommon), (function(){
    Object.defineProperties(ՐՏ_35.prototype, {
        evaluate: {
            enumerable: true, 
            writable: true, 
            value: function evaluate(fc){
                var self = this;
                return false;
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "false";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return _("F_false");
            }

        },
        dates: {
            enumerable: true, 
            writable: true, 
            value: function dates(_fc){
                var self = this;
                return NO_DATES.clone();
            }

        }
    });
    return ՐՏ_35;
})(), ՐՏ_35);
function search_operator(string) {
    var ՐՏitr15, ՐՏidx15;
    var operator;
    ՐՏitr15 = ՐՏ_Iterable(filterOperators);
    for (ՐՏidx15 = 0; ՐՏidx15 < ՐՏitr15.length; ՐՏidx15++) {
        operator = ՐՏitr15[ՐՏidx15];
        if (string.startswith(operator[0])) {
            return [string.slice(len(operator[0])), operator];
        }
    }
    throw new ValueError("bug");
}
var FilterAny = (ՐՏ_36 = function FilterAny() {
    FilterCommon.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_36, FilterCommon), (function(){
    var operator = null;
    Object.defineProperties(ՐՏ_36.prototype, {
        operator: {
            enumerable: true, 
            writable: true, 
            value: operator
        },
        evaluate: {
            enumerable: true, 
            writable: true, 
            value: function evaluate(fc){
                var self = this;
                return self.python(self.left.fct(fc), self.right.fct(fc));
            }

        },
        dates: {
            enumerable: true, 
            writable: true, 
            value: function dates(fc){
                var self = this;
                if (self.evaluate(fc)) {
                    return ALL_DATES.clone();
                }
                return NO_DATES.clone();
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return self.js_string(self.left.js(), self.right.js());
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                var operator, operator_help, text;
                operator = self.operator[0] || "start";
                operator_help = _("F_" + operator);
                if (getattr(self, "relative_date", false)) {
                    if (ՐՏ_in(operator, ["<", "<=", ">", ">="])) {
                        operator_help = _("F_?" + operator);
                    }
                }
                text = self.left.editor() + " " + operator_help + " " + self.right.editor();
                if (self.right.is_empty()) {
                    if (operator === "start" || operator === "~") {
                        return text + ': <b class="attribute_error">' + _("F_true") + "</b>";
                    } else if (operator === "=") {
                        return self.left.editor() + " " + _("F_is_empty");
                    }
                }
                return text;
            }

        },
        editor_negate: {
            enumerable: true, 
            writable: true, 
            value: function editor_negate(){
                var self = this;
                var text;
                if (!self.operator) {
                    return false;
                }
                if (self.operator[0] === "=") {
                    if (self.right.is_empty()) {
                        return self.left.editor() + " " + _("!F_is_empty");
                    }
                    return self.left.editor() + " " + _("!F_=") + " " + self.right.editor();
                }
                if (self.operator[0] === "") {
                    text = self.left.editor() + " " + _("!F_start") + " " + self.right.editor();
                    if (self.right.is_empty()) {
                        return text + ': <b class="attribute_error">' + _("F_false") + "</b>";
                    }
                    return text;
                }
                if (self.operator[0] === "~") {
                    text = self.left.editor() + " " + _("!F_~") + " " + self.right.editor();
                    if (self.right.is_empty()) {
                        return text + ': <b class="attribute_error">' + _("F_false") + "</b>";
                    }
                    return text;
                }
                return false;
            }

        }
    });
    return ՐՏ_36;
})(), ՐՏ_36);
var FilterDate = (ՐՏ_37 = function FilterDate() {
    FilterDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_37, FilterAny), (function(){
    Object.defineProperties(ՐՏ_37.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(operator, what, value, column_type, left){
                var ՐՏupk5, ՐՏupk6;
                var self = this;
                var dummy;
                if (operator[0] === "") {
                    ՐՏupk5 = search_operator("=");
                    dummy = ՐՏupk5[0];
                    operator = ՐՏupk5[1];
                }
                self.left = left;
                if (what !== "date") {
                    self.left = new CellAttrAsDate(self.left);
                }
                if (is_a_relative_date(value)) {
                    ՐՏupk6 = search_operator(operator[3]);
                    dummy = ՐՏupk6[0];
                    operator = ՐՏupk6[1];
                    self.right = new CellAttrConstDate(value);
                    self.relative_date = true;
                } else {
                    value = user_date_to_date(value);
                    self.left = new CellAttrTruncate(self.left, len(value));
                    self.right = new CellAttrConstFixedDate(value);
                }
                self.operator = operator;
            }

        },
        dates: {
            enumerable: true, 
            writable: true, 
            value: function dates(fc){
                var self = this;
                var operator, date, left, span;
                operator = null;
                if (self.left instanceof CellAttrTruncate) {
                    if (self.left.cellattr instanceof CellAttrConstSeconds) {
                        date = self.right.fct(fc);
                        operator = self.operator[0];
                    }
                } else if (self.left instanceof CellAttrConstSeconds) {
                    date = self.right.fct(fc);
                    operator = self.operator[0];
                } else if (self.right instanceof CellAttrConstDate) {
                    left = get_date_tomuss(self.left.fct(fc)).getTime() / 1e3;
                    span = get_relative_span(self.right.value);
                    date = seconds_to_date(left + span);
                    operator = self.operator[3];
                } else if (self.right instanceof CellAttrConstSeconds) {
                    date = self.left.fct(fc);
                    operator = self.operator[3];
                }
                if (operator === null) {
                    if (self.evaluate(fc)) {
                        return ALL_DATES.clone();
                    }
                    return NO_DATES.clone();
                }
                if (operator === "<") {
                    return new Dates([ [ FIRST_DATE, false, date, false ] ]);
                }
                if (operator === "<=") {
                    return new Dates([ [ FIRST_DATE, false, date, true ] ]);
                }
                if (operator === ">") {
                    return new Dates([ [ date, false, LAST_DATE, false ] ]);
                }
                if (operator === ">=") {
                    return new Dates([ [ date, true, LAST_DATE, false ] ]);
                }
                if (operator === "=") {
                    return new Dates([ [ date, true, date, true ] ]);
                }
                bug;
            }

        }
    });
    return ՐՏ_37;
})(), ՐՏ_37);
var FilterFloat = (ՐՏ_38 = function FilterFloat() {
    FilterFloat.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_38, FilterAny), (function(){
    Object.defineProperties(ՐՏ_38.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(operator, value, column_type, left){
                var self = this;
                self.left = new CellAttrAsFloat(left);
                self.right = new CellAttrConst(value);
            }

        }
    });
    return ՐՏ_38;
})(), ՐՏ_38);
var FilterStr = (ՐՏ_39 = function FilterStr() {
    FilterStr.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_39, FilterAny), (function(){
    Object.defineProperties(ՐՏ_39.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(operator, value, column_type, left){
                var self = this;
                var value_lower, hide_upper, value_flat, hide_diacritics;
                self.left = new CellAttrAsString(left);
                value_lower = value.lower();
                hide_upper = (value_lower === value || typeof value_lower === "object" && ՐՏ_eq(value_lower, value)) || !contextual_case_sensitive;
                if (hide_upper) {
                    value = value_lower;
                    self.left = new CellAttrAsLower(self.left);
                }
                value_flat = flat(value);
                hide_diacritics = (value_flat === value || typeof value_flat === "object" && ՐՏ_eq(value_flat, value)) || operator[0] === "<" || operator[0] === ">";
                if (hide_diacritics) {
                    value = value_flat;
                    self.left = new CellAttrAsFlat(self.left);
                }
                self.right = new CellAttrConst(value);
            }

        }
    });
    return ՐՏ_39;
})(), ՐՏ_39);
var FilterAnyStr = (ՐՏ_40 = function FilterAnyStr() {
    FilterAnyStr.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_40, FilterAny), (function(){
    Object.defineProperties(ՐՏ_40.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(operator, what_right, data_col, value, column_type, left){
                var self = this;
                if (data_col >= 0) {
                    self.right = new CellAttrAsString(new CellAttrOther(data_col, what_right));
                } else {
                    if (what_right === "author") {
                        self.right = new CellAttrConstUserName();
                    } else {
                        self.right = new CellAttrConst("");
                    }
                }
                if (value) {
                    self.right = new CellAttrAppend(self.right, value);
                }
                self.right = new CellAttrAsFlat(new CellAttrAsLower(self.right));
                self.left = new CellAttrAsFlat(new CellAttrAsLower(left));
            }

        }
    });
    return ՐՏ_40;
})(), ՐՏ_40);
var FilterAnyDate = (ՐՏ_41 = function FilterAnyDate() {
    FilterAnyDate.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_41, FilterDate), (function(){
    Object.defineProperties(ՐՏ_41.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(operator, what, what_right, data_col, column_type, left){
                var self = this;
                if (what_right === "date" && data_col >= 0) {
                    self.right = new CellAttrOther(data_col, what_right);
                } else if (what_right === "date") {
                    self.right = new CellAttrConstSeconds();
                } else {
                    self.right = new CellAttrAsDate(new CellAttrOther(data_col, what_right));
                }
                self.left = left;
                if (what !== "date") {
                    self.left = new CellAttrAsDate(self.left);
                }
            }

        }
    });
    return ՐՏ_41;
})(), ՐՏ_41);
var FilterIsTeacher = (ՐՏ_42 = function FilterIsTeacher() {
    FilterIsTeacher.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_42, FilterAny), (function(){
    Object.defineProperties(ՐՏ_42.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(){
                var self = this;
            }

        },
        evaluate: {
            enumerable: true, 
            writable: true, 
            value: function evaluate(fc){
                var self = this;
                return fc.is_a_teacher;
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                return "is_a_teacher";
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var self = this;
                return _("F_teacher");
            }

        }
    });
    return ՐՏ_42;
})(), ՐՏ_42);
var FilterAnyType = (ՐՏ_43 = function FilterAnyType() {
    FilterAnyType.prototype.__init__.apply(this, arguments);
}, ՐՏ_extends(ՐՏ_43, FilterAny), (function(){
    Object.defineProperties(ՐՏ_43.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(operator, what_right, data_col, column_type, left){
                var self = this;
                self.right = new CellAttrOther(data_col, what_right);
                self.left = left;
                if (operator[0] === "=") {
                    self.js_oper = "==";
                } else {
                    self.js_oper = operator[0];
                }
            }

        },
        evaluate: {
            enumerable: true, 
            writable: true, 
            value: function evaluate(fc){
                var self = this;
                var left, right;
                left = to_float_or_nan(self.left.fct(fc));
                if (!isNaN(left)) {
                    right = to_float_or_nan(self.right.fct(fc));
                    if (isNaN(right)) {
                        right = -1e50;
                    }
                    return self.python(left, right);
                }
                right = to_float_or_nan(self.right.fct(fc));
                if (isNaN(right)) {
                    return self.python(flat(str(self.left.fct(fc)).lower()), flat(str(self.right.fct(fc)).lower()));
                }
                left = -1e50;
                return self.python(left, right);
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                var left, right;
                left = self.left.js();
                right = self.right.js();
                return "((isNaN(to_float_or_nan(" + left + ")) && isNaN(to_float_or_nan(" + right + "))) ? " + "flat(" + left + ".toString().toLowerCase())" + self.js_oper + "flat(" + right + ".toString().toLowerCase())" + ":to_float_or_small(" + left + ")" + self.js_oper + "to_float_or_small(" + right + "))";
            }

        }
    });
    return ՐՏ_43;
})(), ՐՏ_43);
function FilterOperator(operator, what, value, column_type, left, errors, columns) {
    var ՐՏupk7, ՐՏ_44;
    var what_right, elsewhere, f, data_col, string;
    if (value && ՐՏ_in(value[0], filterAttributes)) {
        what_right = filterAttributes[value[0]];
        elsewhere = from_another_column(value.slice(1), errors, columns);
    } else {
        what_right = "value";
        elsewhere = from_another_column(value, errors, columns);
    }
    value = replace_all(value, "\\\\", "￾");
    value = replace_all(value, "\\", "");
    value = replace_all(value, "￾", "\\");
    if (elsewhere === null) {
        if (operator[0] === "~" || operator[0] === "" && what !== "date" || what === "history" || value.lower() === "nan" || value === "" && (what === "value" || what === "comment")) {
            f = new FilterStr(operator, str(value), column_type, left);
        } else if (what === "date" || column_type === "Date" && what === "value") {
            f = new FilterDate(operator, what, str(value), column_type, left);
        } else if (what === "author") {
            f = new FilterStr(operator, str(value), column_type, left);
        } else {
            try {
                f = new FilterFloat(operator, to_float(value), column_type, left);
            } catch (ՐՏ_Exception) {
                f = new FilterStr(operator, str(value), column_type, left);
            }
        }
    } else {
        ՐՏupk7 = elsewhere;
        data_col = ՐՏupk7[0];
        string = ՐՏupk7[1];
        if ((data_col === (ՐՏ_44 = -1) || typeof data_col === "object" && ՐՏ_eq(data_col, ՐՏ_44))) {
            if (what_right === "author") {
                f = new FilterAnyStr(operator, what_right, -1, string, column_type, left);
            } else if (what_right === "date") {
                f = new FilterAnyDate(operator, what, what_right, -1, column_type, left);
            } else {
                return new FilterFalse();
            }
        } else if (operator[0] === "~" || operator[0] === "" || string !== "") {
            f = new FilterAnyStr(operator, what_right, data_col, string, column_type, left);
        } else if (what === "date" || column_type === "Date" && what === "value") {
            f = new FilterAnyDate(operator, what, what_right, data_col, column_type, left);
        } else {
            f = new FilterAnyType(operator, what_right, data_col, column_type, left);
        }
        if (data_col >= 0) {
            f.data_col_right = data_col;
        }
    }
    if (f.operator === null) {
        f.operator = operator;
    }
    f.python = f.operator[1];
    f.js_string = f.operator[2];
    return f;
}
function LE(a, b) {
    return a <= b;
}
function LE_str(a, b) {
    return "(" + a + "<=" + b + ")";
}
function LT(a, b) {
    return a < b;
}
function LT_str(a, b) {
    return "(" + a + "<" + b + ")";
}
function GE(a, b) {
    return a >= b;
}
function GE_str(a, b) {
    return "(" + a + ">=" + b + ")";
}
function GT(a, b) {
    return a > b;
}
function GT_str(a, b) {
    return "(" + a + ">" + b + ")";
}
function EQ(a, b) {
    return (a === b || typeof a === "object" && ՐՏ_eq(a, b));
}
function EQ_str(a, b) {
    return "(" + a + "==" + b + ")";
}
function TILDE(a, b) {
    return ՐՏ_in(b, a);
}
function TILDE_str(a, b) {
    return "(" + a + ".indexOf(" + b + ") != -1)";
}
function START(a, b) {
    return a.startswith(b);
}
function START_str(a, b) {
    return "(" + a + ".substr(0," + b + ".length)==" + b + ")";
}
function AUTHOR(a, b) {
    return (a === b || typeof a === "object" && ՐՏ_eq(a, b)) || ՐՏ_in(a, major_of(b));
}
function AUTHOR_str(a, b) {
    return "(" + a + "==" + b + "||myindex(minors," + a + ")!=-1)";
}
filterOperators = [ [ "<=", LE, LE_str, ">=" ], [ "<", LT, LT_str, ">" ], [ ">=", GE, GE_str, "<=" ], [ ">", GT, GT_str, "<" ], [ "=", EQ, EQ_str, "=" ], [ "~", TILDE, TILDE_str, null ], [ "", START, START_str, null ] ];
filterAttributes = {
    "@": "author",
    "#": "comment",
    ":": "history",
    "?": "date"
};
function from_another_column(string, errors, columns) {
    var s, data_col;
    if (!string.startswith("[")) {
        return null;
    }
    s = string.split("]");
    if (len(s) === 1) {
        return null;
    }
    if (s[0].slice(1) === "") {
        return [-1, string.slice(len(s[0]) + 1)];
    }
    data_col = data_col_from_col_title(s[0].slice(1), columns);
    if (data_col || data_col === 0) {
        return [data_col, string.slice(len(s[0]) + 1)];
    }
    errors["«" + s[0].slice(1) + "» " + _("ALERT_url_import_column")] = true;
    return null;
}
var Filter = (ՐՏ_45 = function Filter() {
    Filter.prototype.__init__.apply(this, arguments);
}, (function(){
    Object.defineProperties(ՐՏ_45.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(string, column_type, the_columns){
                var ՐՏupk8, ՐՏ_46;
                var self = this;
                the_columns = the_columns === void 0 ? null : the_columns;
                var mode, node;
                if (the_columns === null) {
                    try {
                        the_columns = columns;
                    } catch (ՐՏ_Exception) {
                        the_columns = null;
                    }
                }
                self.errors = {};
                self.string = string;
                while (string.startswith(" ")) {
                    string = string.slice(1);
                }
                if (string === "") {
                    self.filters = [ [ new FilterTrue() ] ];
                    return;
                }
                self.filters = [];
                string = replace_all(string, " " + or_keyword() + " ", " | ");
                mode = "|";
                while (string) {
                    ՐՏupk8 = self.parse(string, column_type, the_columns);
                    node = ՐՏupk8[0];
                    string = ՐՏupk8[1];
                    if (mode === "|") {
                        self.filters.append([ node ]);
                    } else {
                        (ՐՏ_46 = self.filters)[ՐՏ_46.length-1].append(node);
                    }
                    if (len(string) && (string[0] === "|" || string[0] === "&")) {
                        mode = string[0];
                        string = string.slice(1).lstrip();
                    } else {
                        mode = "&";
                    }
                }
            }

        },
        parse: {
            enumerable: true, 
            writable: true, 
            value: function parse(string, column_type, columns){
                var ՐՏupk9, ՐՏupk10, ՐՏ_47, ՐՏupk11, ՐՏupk12, ՐՏitr16, ՐՏidx16, ՐՏitr17, ՐՏidx17, ՐՏupk13;
                var self = this;
                var negate, attr, elsewhere, operator, left, data_col, value, bs_protected, i, char, next_char, dummy, node;
                negate = false;
                if (string[0] === "!") {
                    if (string === "!") {
                        return [new FilterFalse(), ""];
                    }
                    negate = true;
                    string = string.slice(1);
                }
                if (ՐՏ_in(string[0], filterAttributes)) {
                    attr = filterAttributes[string[0]];
                    if (attr !== "value") {
                        string = string.slice(1);
                    }
                } else {
                    attr = "value";
                }
                elsewhere = from_another_column(string, self.errors, columns);
                if (elsewhere === null) {
                    ՐՏupk9 = search_operator(string);
                    string = ՐՏupk9[0];
                    operator = ՐՏupk9[1];
                    left = new CellAttrCell(attr);
                    if (attr === "value" && operator[0] === "") {
                        left = new CellAttrAsFixed(left);
                    }
                } else {
                    ՐՏupk10 = elsewhere;
                    data_col = ՐՏupk10[0];
                    string = ՐՏupk10[1];
                    if ((data_col === (ՐՏ_47 = -1) || typeof data_col === "object" && ՐՏ_eq(data_col, ՐՏ_47))) {
                        ՐՏupk11 = search_operator(string);
                        string = ՐՏupk11[0];
                        operator = ՐՏupk11[1];
                        if (attr === "author") {
                            left = new CellAttrConstUserName();
                        } else if (attr === "date") {
                            left = new CellAttrConstSeconds();
                        } else if (attr === "comment") {
                            left = new FilterIsTeacher();
                            if (negate) {
                                left = new FilterNegate(left);
                            }
                            if (operator[0] !== "") {
                                self.errors["«" + operator[0] + "#[] » → « #[] »"] = true;
                            }
                            return [left, string.lstrip()];
                        } else {
                            return [new FilterFalse(), ""];
                        }
                    } else {
                        ՐՏupk12 = search_operator(string);
                        string = ՐՏupk12[0];
                        operator = ՐՏupk12[1];
                        left = new CellAttrOther(data_col, attr);
                        column_type = columns[data_col].type.name || columns[data_col].type;
                        if (attr === "value" && operator[0] === "") {
                            left = new CellAttrAsFixed(left);
                        }
                    }
                }
                value = "";
                bs_protected = false;
                i = 0;
                ՐՏitr16 = ՐՏ_Iterable(string);
                for (ՐՏidx16 = 0; ՐՏidx16 < ՐՏitr16.length; ՐՏidx16++) {
                    char = ՐՏitr16[ՐՏidx16];
                    ++i;
                    if (!bs_protected) {
                        if (char === " ") {
                            next_char = "";
                            ՐՏitr17 = ՐՏ_Iterable(string.slice(i));
                            for (ՐՏidx17 = 0; ՐՏidx17 < ՐՏitr17.length; ՐՏidx17++) {
                                next_char = ՐՏitr17[ՐՏidx17];
                                if (next_char !== " ") {
                                    break;
                                }
                            }
                            if (next_char === " ") {
                                break;
                            }
                        }
                        if (char === " " && operator[0] === "" && attr === "value" && !(ՐՏ_in(next_char, filterAttributes)) && search_operator(next_char)[1][0] === "" && !(ՐՏ_in(next_char, "&|@#:?<>=~![")) && negate === false && elsewhere === null) {
                        } else if (" |&".find(char) >= 0) {
                            --i;
                            break;
                        }
                        if (char === "\\") {
                            bs_protected = true;
                        }
                    } else {
                        bs_protected = false;
                    }
                    value += char;
                }
                if (len(value) === 0 && operator[0] === "") {
                    if (attr === "author") {
                        value = "@[]";
                        if (elsewhere === null) {
                            operator = [ _("is"), AUTHOR, AUTHOR_str, null ];
                        } else {
                            left = new CellAttrCell("value");
                        }
                    } else if (attr === "comment" || attr === "history") {
                        ՐՏupk13 = search_operator("=");
                        dummy = ՐՏupk13[0];
                        operator = ՐՏupk13[1];
                        negate = !negate;
                    }
                }
                node = FilterOperator(operator, attr, value, column_type, left, self.errors, columns);
                if (elsewhere !== null && elsewhere[0] >= 0) {
                    node.data_col_left = elsewhere[0];
                }
                if (negate) {
                    node = new FilterNegate(node);
                }
                return [node, string.slice(i).lstrip()];
            }

        },
        evaluate: {
            enumerable: true, 
            writable: true, 
            value: function evaluate(line, cell, username, is_a_teacher){
                var ՐՏitr18, ՐՏidx18, ՐՏitr19, ՐՏidx19;
                var self = this;
                is_a_teacher = is_a_teacher === void 0 ? false : is_a_teacher;
                var fc, result, f, bad, ff, error, js, value;
                fc = new FilterContext(line, cell, username, is_a_teacher);
                result = false;
                ՐՏitr18 = ՐՏ_Iterable(self.filters);
                for (ՐՏidx18 = 0; ՐՏidx18 < ՐՏitr18.length; ՐՏidx18++) {
                    f = ՐՏitr18[ՐՏidx18];
                    bad = false;
                    ՐՏitr19 = ՐՏ_Iterable(f);
                    for (ՐՏidx19 = 0; ՐՏidx19 < ՐՏitr19.length; ՐՏidx19++) {
                        ff = ՐՏitr19[ՐՏidx19];
                        if (!ff.evaluate(fc)) {
                            bad = true;
                            break;
                        }
                    }
                    if (!bad) {
                        result = true;
                        break;
                    }
                }
                if (debug) {
                    error = false;
                    if (!python_mode) {
                        error = "Can not compile js: " + self.js();
                        js = self.compiled_js();
                        error = "Can not evaluate compiled filter: " + js;
                        value = js(line, cell, username);
                        if (value === result) {
                            error = false;
                        } else {
                            error = "Unexpected value: '" + value + "' in place of '" + result + "' for:\n\tcell: " + cell.js() + "\n\tjs: " + js + "'" + "\n\teditor: " + self.editor();
                        }
                    }
                    if (error) {
                        ՐՏ_print(error);
                        throw new ValueError(error);
                    }
                }
                return result;
            }

        },
        dates: {
            enumerable: true, 
            writable: true, 
            value: function dates(line, cell, username, is_a_teacher){
                var ՐՏitr20, ՐՏidx20, ՐՏitr21, ՐՏidx21;
                var self = this;
                is_a_teacher = is_a_teacher === void 0 ? false : is_a_teacher;
                var fc, all_dates, f, dates, ff;
                fc = new FilterContext(line, cell, username, is_a_teacher);
                all_dates = NO_DATES.clone();
                ՐՏitr20 = ՐՏ_Iterable(self.filters);
                for (ՐՏidx20 = 0; ՐՏidx20 < ՐՏitr20.length; ՐՏidx20++) {
                    f = ՐՏitr20[ՐՏidx20];
                    dates = f[0].dates(fc);
                    ՐՏitr21 = ՐՏ_Iterable(f.slice(1));
                    for (ՐՏidx21 = 0; ՐՏidx21 < ՐՏitr21.length; ՐՏidx21++) {
                        ff = ՐՏitr21[ՐՏidx21];
                        dates.intersection(ff.dates(fc));
                    }
                    all_dates.add(dates);
                }
                return all_dates;
            }

        },
        js: {
            enumerable: true, 
            writable: true, 
            value: function js(){
                var self = this;
                var ff, f;
                return "(" + "||".join((function() {
                    var ՐՏidx22, ՐՏitr22 = ՐՏ_Iterable(self.filters), ՐՏres = [], f;
                    for (ՐՏidx22 = 0; ՐՏidx22 < ՐՏitr22.length; ՐՏidx22++) {
                        f = ՐՏitr22[ՐՏidx22];
                        ՐՏres.push("&&".join((function() {
                            var ՐՏidx23, ՐՏitr23 = ՐՏ_Iterable(f), ՐՏres = [], ff;
                            for (ՐՏidx23 = 0; ՐՏidx23 < ՐՏitr23.length; ՐՏidx23++) {
                                ff = ՐՏitr23[ՐՏidx23];
                                ՐՏres.push(ff.js());
                            }
                            return ՐՏres;
                        })()));
                    }
                    return ՐՏres;
                })()) + ")";
            }

        },
        compiled_js: {
            enumerable: true, 
            writable: true, 
            value: function compiled_js(){
                var self = this;
                return eval("(function x(line, cell, username) { return " + self.js() + ";})");
            }

        },
        get_errors: {
            enumerable: true, 
            writable: true, 
            value: function get_errors(){
                var ՐՏitr24, ՐՏidx24;
                var self = this;
                var s, i;
                s = "";
                ՐՏitr24 = ՐՏ_Iterable(self.errors);
                for (ՐՏidx24 = 0; ՐՏidx24 < ՐՏitr24.length; ՐՏidx24++) {
                    i = ՐՏitr24[ՐՏidx24];
                    s += i + "<br>\n";
                }
                if (s !== "") {
                    return s;
                }
            }

        },
        other_data_col: {
            enumerable: true, 
            writable: true, 
            value: function other_data_col(){
                var ՐՏitr25, ՐՏidx25, ՐՏitr26, ՐՏidx26;
                var self = this;
                var cols, ored, f, i;
                cols = [];
                ՐՏitr25 = ՐՏ_Iterable(self.filters);
                for (ՐՏidx25 = 0; ՐՏidx25 < ՐՏitr25.length; ՐՏidx25++) {
                    ored = ՐՏitr25[ՐՏidx25];
                    ՐՏitr26 = ՐՏ_Iterable(ored);
                    for (ՐՏidx26 = 0; ՐՏidx26 < ՐՏitr26.length; ՐՏidx26++) {
                        f = ՐՏitr26[ՐՏidx26];
                        if (!(ՐՏ_in(f.data_col_left, cols))) {
                            cols.append(f.data_col_left);
                        }
                        if (!(ՐՏ_in(f.data_col_right, cols))) {
                            cols.append(f.data_col_right);
                        }
                    }
                }
                cols = (function() {
                    var ՐՏidx27, ՐՏitr27 = ՐՏ_Iterable(cols), ՐՏres = [], i;
                    for (ՐՏidx27 = 0; ՐՏidx27 < ՐՏitr27.length; ՐՏidx27++) {
                        i = ՐՏitr27[ՐՏidx27];
                        if (i || i === 0) {
                            ՐՏres.push(i);
                        }
                    }
                    return ՐՏres;
                })();
                cols.sort();
                return cols;
            }

        },
        editor: {
            enumerable: true, 
            writable: true, 
            value: function editor(){
                var ՐՏitr28, ՐՏidx28;
                var self = this;
                var html, ored, f;
                html = [];
                ՐՏitr28 = ՐՏ_Iterable(self.filters);
                for (ՐՏidx28 = 0; ՐՏidx28 < ՐՏitr28.length; ՐՏidx28++) {
                    ored = ՐՏitr28[ՐՏidx28];
                    html.append("<div>" + _("TIP_tablecopy_and").upper().join((function() {
                        var ՐՏidx29, ՐՏitr29 = ՐՏ_Iterable(ored), ՐՏres = [], f;
                        for (ՐՏidx29 = 0; ՐՏidx29 < ՐՏitr29.length; ՐՏidx29++) {
                            f = ՐՏitr29[ՐՏidx29];
                            ՐՏres.push("<div>" + f.editor() + "</div>");
                        }
                        return ՐՏres;
                    })()) + "</div>");
                }
                return '<div class="filter_editor">' + _("or").upper().join(html) + "</div>";
            }

        }
    });
    return ՐՏ_45;
})(), ՐՏ_45);
"\nAbout rounding:\n\n   0: Display down rounding (old behaviour)\n      Average are rounded to the nearest if a rounding value is defined\n      If no rounding is defined, average value is not rounded.\n      On display, values are down rounded.\n\n   1: Compute down rounding (new default recommended behaviour)\n      All intermediate values are down rounded\n\n   2: Perfect compute, rounding to the nearest\n";
function clamp(value, column) {
    if (column.clamp & 1 && value < column.min) {
        value = column.min;
    }
    if (column.clamp & 2 && value > column.max) {
        value = column.max;
    }
    return value;
}
function compute_average(data_col, line, _username) {
    var ՐՏitr30, ՐՏidx30, ՐՏ_48, ՐՏitr31, ՐՏidx31, ՐՏitr32, ՐՏidx32, ՐՏitr33, ՐՏidx33, ՐՏitr34, ՐՏidx34, ՐՏ_49, ՐՏ_50;
    var column, weight, data_column, origin, nr_abj, nr_ppn, nr_add, nr_abi, values, value, sumw, c, w, note, sum2, nr_sum, only_add, only_abj;
    column = columns[data_col];
    if (len(column.average_columns) === 0) {
        return "";
    }
    if (column.best_of || column.mean_of) {
        weight = null;
        ՐՏitr30 = ՐՏ_Iterable(column.average_columns);
        for (ՐՏidx30 = 0; ՐՏidx30 < ՐՏitr30.length; ՐՏidx30++) {
            data_column = ՐՏitr30[ՐՏidx30];
            origin = columns[data_column];
            if (!origin.real_weight_add) {
                return _("ERROR_addition_not_allowed");
            }
            if (weight === null) {
                weight = origin.real_weight;
                continue;
            }
            if ((weight !== (ՐՏ_48 = origin.real_weight) && (typeof weight !== "object" || !ՐՏ_eq(weight, ՐՏ_48)))) {
                return _("ERROR_different_not_allowed");
            }
        }
    }
    nr_abj = 0;
    nr_ppn = 0;
    nr_add = 0;
    nr_abi = 0;
    values = [];
    ՐՏitr31 = ՐՏ_Iterable(column.average_columns);
    for (ՐՏidx31 = 0; ՐՏidx31 < ՐՏitr31.length; ՐՏidx31++) {
        data_column = ՐՏitr31[ՐՏidx31];
        origin = columns[data_column];
        if (origin.real_weight === 0) {
            continue;
        }
        if (origin.visibility === 5 && python_mode) {
            value = origin.empty_is;
        } else {
            value = line[data_column].get_value(origin);
        }
        if (str(value) === "") {
            return nan;
        }
        if ((origin.type.name || origin.type) === "Note" && origin.replace_in_avg) {
            if ((value === abj || typeof value === "object" && ՐՏ_eq(value, abj)) && origin.replace_in_avg & 1 || (value === ppn || typeof value === "object" && ՐՏ_eq(value, ppn)) && origin.replace_in_avg & 2) {
                value = origin.min;
            }
        }
        if (ՐՏ_in(value, allowed_grades)) {
            value = allowed_grades[value][0];
        }
        if (!origin.real_weight_add) {
            ++nr_add;
        }
        if (ՐՏ_in(value, [abj, abj_short])) {
            ++nr_abj;
        } else if (ՐՏ_in(value, [ppn, ppn_short])) {
            ++nr_ppn;
        } else if (ՐՏ_in(value, [pre, pre_short])) {
            values.append([ 1, data_column, "" ]);
        } else if (ՐՏ_in(value, [tnr, tnr_short])) {
            ++nr_abi;
            values.append([ 0, data_column, abi ]);
        } else if (ՐՏ_in(value, [abi, abi_short])) {
            ++nr_abi;
            values.append([ 0, data_column, abi ]);
        } else if (value === "DEF") {
            return "DEF";
        } else {
            try {
                value = to_float(value);
            } catch (ՐՏ_Exception) {
                return nan;
            }
            if (isNaN(value)) {
                return nan;
            }
            if (parseInt(column.table.rounding) === 1) {
                value = do_round(value, origin.round_by, column.table.rounding, column.old_function);
            }
            if (origin.real_weight_add) {
                values.append([ (value - origin.min) / (origin.max - origin.min), data_column, "" ]);
            } else {
                values.append([ value, data_column, "" ]);
            }
        }
    }
    if (nr_abi && column.abi_is === 1) {
        return "DEF";
    }
    if (column.abj_is && (nr_abj !== 0 || nr_ppn !== 0)) {
        weight = 0;
        sumw = 0;
        ՐՏitr32 = ՐՏ_Iterable(values);
        for (ՐՏidx32 = 0; ՐՏidx32 < ՐՏitr32.length; ՐՏidx32++) {
            c = ՐՏitr32[ՐՏidx32];
            origin = columns[c[1]];
            value = c[0];
            if (origin.real_weight_add) {
                w = origin.real_weight;
                sumw += w * value;
                weight += w;
            }
        }
        if (weight) {
            note = sumw / weight;
            ՐՏitr33 = ՐՏ_Iterable(column.average_columns);
            for (ՐՏidx33 = 0; ՐՏidx33 < ՐՏitr33.length; ՐՏidx33++) {
                data_column = ՐՏitr33[ՐՏidx33];
                value = line[data_column].get_value(columns[data_column]);
                if (ՐՏ_in(value, allowed_grades)) {
                    value = allowed_grades[value][0];
                }
                if (ՐՏ_in(value, [abj, abj_short])) {
                    if (column.abj_is & 1) {
                        values.append([ note, data_column, "" ]);
                        nr_abj = 0;
                    }
                } else if (ՐՏ_in(value, [ppn, ppn_short])) {
                    if (column.abj_is & 2) {
                        values.append([ note, data_column, "" ]);
                        nr_ppn = 0;
                    }
                }
            }
        } else {
            if (nr_abj === len(column.average_columns)) {
                return abj;
            }
            if (nr_ppn === len(column.average_columns)) {
                return ppn;
            }
        }
    }
    values.sort();
    if (column.best_of) {
        if (len(values) < abs(column.best_of)) {
            return nan;
        }
        if (column.best_of > 0) {
            values = values.slice(-column.best_of);
        } else {
            values = values.slice(0, column.best_of);
        }
    }
    if (column.mean_of) {
        if (len(values) < -column.mean_of) {
            return nan;
        }
        values = values.slice(-column.mean_of);
    }
    weight = 0;
    sumw = 0;
    sum2 = 0;
    nr_sum = 0;
    ՐՏitr34 = ՐՏ_Iterable(values);
    for (ՐՏidx34 = 0; ՐՏidx34 < ՐՏitr34.length; ՐՏidx34++) {
        c = ՐՏitr34[ՐՏidx34];
        origin = columns[c[1]];
        value = c[0];
        if (origin.real_weight_add) {
            w = origin.real_weight;
            sumw += w * value;
            weight += w;
        } else {
            sum2 += origin.real_weight * value;
            ++nr_sum;
        }
    }
    only_add = nr_add === len(column.average_columns);
    if (nr_abj) {
        if (only_add) {
            only_abj = nr_abj === nr_add;
        } else {
            only_abj = nr_abj === len(column.average_columns) - nr_add;
        }
    } else {
        only_abj = false;
    }
    if (weight !== 0) {
        if (nr_abi >= len(column.average_columns) - nr_sum) {
            return abi;
        } else {
            if (column.old_function) {
                sumw += 1e-16;
            }
            value = column.min + sumw * (column.max - column.min) / weight + sum2;
            if (isNaN(value)) {
                return value;
            }
            value = clamp(value, column);
            return do_round(value, column.round_by, column.table.rounding, column.old_function);
        }
    } else if (nr_sum === len(column.average_columns)) {
        if (nr_abi === nr_sum) {
            return abi;
        } else {
            return clamp(sum2, column);
        }
    } else if (only_abj) {
        return abj;
    } else if (((ՐՏ_49 = nr_ppn + nr_abj) === (ՐՏ_50 = len(column.average_columns) - nr_add) || typeof ՐՏ_49 === "object" && ՐՏ_eq(ՐՏ_49, ՐՏ_50))) {
        return ppn;
    } else {
        return nan;
    }
}
function get_most_recent_date(data_col, line, root, depth) {
    var ՐՏitr35, ՐՏidx35;
    var date, data_column, d;
    if (!root) {
        if (!columns[data_col].is_computed()) {
            return line[data_col].date;
        }
    }
    date = "";
    ++depth;
    if (depth > 10) {
        return date;
    }
    ՐՏitr35 = ՐՏ_Iterable(columns[data_col].average_columns);
    for (ՐՏidx35 = 0; ՐՏidx35 < ՐՏitr35.length; ՐՏidx35++) {
        data_column = ՐՏitr35[ՐՏidx35];
        d = get_most_recent_date(data_column, line, false, depth);
        if (str(d) > str(date)) {
            date = d;
        }
    }
    return date;
}
function do_round(value, round_by, rounding, old_function) {
    if (rounding <= 1 && round_by > 0) {
        if (old_function) {
            return rint(value / round_by) * round_by;
        } else {
            round_by = 1 / round_by;
            return floor(value * round_by + 1e-7) / round_by;
        }
    } else {
        if (old_function) {
            return rint(value * 1e6) / 1e6;
        } else {
            return value;
        }
    }
}
var compute_cell_safe = (ՐՏ_51 = function compute_cell_safe(data_col, line, compute_function, username) {
    var ՐՏ_52;
    var cell, date, computed, comment, author;
    cell = line[data_col];
    if (cell.comment === "Fixed!") {
        return;
    }
    date = line[data_col].date;
    computed = compute_function(data_col, line, username);
    if (hasattr(compute_function, "compute_comment")) {
        comment = compute_function.compute_comment(data_col, line, username);
        if ((comment === computed || typeof comment === "object" && ՐՏ_eq(comment, computed))) {
            comment = "";
        }
        if (comment !== cell.comment) {
            cell = cell.set_comment(comment);
        }
    }
    if (columns[data_col].cell_is_modifiable()) {
        if ((computed !== (ՐՏ_52 = cell.value) && (typeof computed !== "object" || !ՐՏ_eq(computed, ՐՏ_52)))) {
            line[data_col] = cell = cell.set_value(computed);
            cell.date = "";
            try {
                author = line[columns[data_col].average_columns[0]].author;
                if (author === "*") {
                    author = "?";
                }
            } catch (ՐՏ_Exception) {
                author = "?";
            }
            cell.author = author;
        }
        return;
    }
    if (computed === "" || isNaN(to_float_or_nan(computed))) {
        if (len(cell.author) === 1 || get_most_recent_date(data_col, line, true, 0) >= cell.date) {
            line[data_col] = cell = cell.set_value(computed);
            cell.date = date;
            cell.author = "?";
        }
    } else {
        line[data_col] = cell = cell.set_value(computed);
        cell.date = date;
        cell.author = "*";
    }
}, Object.defineProperty(ՐՏ_51, "__doc__", {
    value: "If the computed value is not a number and the cell was containing\na newer value, then the old cell value is restored."
}), ՐՏ_51);
"\n";
function compute_max_real(data_col, line, _username) {
    var ՐՏitr36, ՐՏidx36;
    var column, the_max, nr_abi, data_column, col, val, value;
    column = columns[data_col];
    the_max = -1e10;
    nr_abi = 0;
    ՐՏitr36 = ՐՏ_Iterable(column.average_columns);
    for (ՐՏidx36 = 0; ՐՏidx36 < ՐՏitr36.length; ՐՏidx36++) {
        data_column = ՐՏitr36[ՐՏidx36];
        col = columns[data_column];
        if (col.visibility === 5 && python_mode) {
            val = col.empty_is;
        } else {
            val = line[data_column].get_value(col);
        }
        if (str(val) === "") {
            return nan;
        }
        value = to_float_or_nan(val);
        if (isNaN(value)) {
            if (ՐՏ_in(val, allowed_grades)) {
                val = allowed_grades[val][0];
            }
            if (ՐՏ_in(val, [abi, abi_short, tnr])) {
                ++nr_abi;
                value = col.min;
            } else if (ՐՏ_in(val, [abj, abj_short, ppn, ppn_short])) {
                continue;
            } else if (val === "DEF") {
                return "DEF";
            } else {
                return nan;
            }
        } else {
            value = (value - col.min) / col.max;
        }
        if (value > the_max) {
            the_max = value;
        }
    }
    if (nr_abi && column.abi_is === 1) {
        return "DEF";
    }
    if (the_max > -1e10) {
        if (nr_abi === len(column.average_columns)) {
            return abi;
        } else {
            return the_max * (column.max - column.min) + column.min;
        }
    }
    return nan;
}
"\n";
function compute_nmbr(data_col, line, username) {
    var ՐՏitr37, ՐՏidx37, ՐՏ_53, ՐՏ_54;
    var column, nr, dc, cell, col;
    column = columns[data_col];
    nr = 0;
    ՐՏitr37 = ՐՏ_Iterable(column.average_columns);
    for (ՐՏidx37 = 0; ՐՏidx37 < ՐՏitr37.length; ՐՏidx37++) {
        dc = ՐՏitr37[ՐՏidx37];
        cell = line[dc];
        col = columns[dc];
        if (str(cell.value) === "" || col.visibility === 5 && python_mode) {
            cell = C(col.empty_is, cell.author, cell.date, cell.comment, cell.history);
        }
        if (column.test_filter_filter(line, cell, username)) {
            ++nr;
        }
    }
    if (column.min === 0 && ((ՐՏ_53 = column.max) === (ՐՏ_54 = len(column.average_columns)) || typeof ՐՏ_53 === "object" && ՐՏ_eq(ՐՏ_53, ՐՏ_54))) {
        return nr;
    }
    if (len(column.average_columns) === 0) {
        return 0;
    }
    return do_round(nr * (column.max - column.min) / len(column.average_columns) + column.min, column.round_by, column.table.rounding, column.old_function);
}
"\n";
function compute_cow(data_col, line, _username) {
    var column, table_year, c, origin;
    column = columns[data_col];
    if (len(column.average_columns) !== 1) {
        return line[data_col].value;
    }
    if (line[data_col].date !== "") {
        if (line[data_col].value !== "") {
            return line[data_col].value;
        }
        if (python_mode) {
            table_year = column.table.year;
        } else {
            table_year = year;
        }
        if (table_year <= 2021) {
            return line[data_col].value;
        }
    }
    c = column.average_columns[0];
    origin = columns[c];
    if (origin.visibility === 5 && python_mode) {
        return origin.empty_is;
    }
    return line[c].get_value(origin);
}
"\n";
function compute_diff_date(data_col, line, _username) {
    var ՐՏitr38, ՐՏidx38;
    var column, div, values, dc, col, value;
    column = columns[data_col];
    if (len(column.average_columns) !== 2) {
        return line[data_col].value;
    }
    div = column.comment.split("/");
    if (len(div) === 2) {
        div = parseInt(div[1]);
    } else {
        div = 1;
    }
    values = [];
    ՐՏitr38 = ՐՏ_Iterable(column.average_columns);
    for (ՐՏidx38 = 0; ՐՏidx38 < ՐՏitr38.length; ՐՏidx38++) {
        dc = ՐՏitr38[ՐՏidx38];
        col = columns[dc];
        value = line[dc].get_value(col);
        values.append(date_to_seconds(user_date_to_date(value)));
        if (col.visibility === 5 && python_mode) {
            return "";
        }
    }
    try {
        return (values[1] - values[0]) / (div * 86400);
    } catch (ՐՏ_Exception) {
        return "";
    }
}
"\n";
function compute_weighted_percent_(data_col, line, root_col, username) {
    var ՐՏitr39, ՐՏidx39;
    var column, sum_value, sum_weight, dc, col, weight;
    column = columns[data_col];
    if (!column.is_computed()) {
        if (root_col.test_filter_filter(line, line[data_col], username)) {
            return 1;
        } else {
            return 0;
        }
    }
    sum_value = 0;
    sum_weight = 0;
    ՐՏitr39 = ՐՏ_Iterable(column.average_columns);
    for (ՐՏidx39 = 0; ՐՏidx39 < ՐՏitr39.length; ՐՏidx39++) {
        dc = ՐՏitr39[ՐՏidx39];
        col = columns[dc];
        if (!col.real_weight_add) {
            continue;
        }
        weight = col.real_weight;
        sum_value += weight * compute_weighted_percent_(dc, line, root_col, username);
        sum_weight += weight;
    }
    if (sum_weight === 0) {
        return 0;
    }
    return sum_value / sum_weight;
}
function compute_weighted_percent(data_col, line, username) {
    var column, v;
    column = columns[data_col];
    if (len(column.average_columns) !== 1) {
        return "";
    }
    v = column.min + (column.max - column.min) * compute_weighted_percent_(column.average_columns[0], line, column, username);
    if (column.round_by) {
        v = rint(v / column.round_by) * column.round_by;
    }
    return v;
}
"\n";
function compute_product(data_col, line, _username) {
    var ՐՏitr40, ՐՏidx40;
    var column, nr_abj, nr_ppn, nr_abi, product, data_column, origin, value;
    column = columns[data_col];
    if (len(column.average_columns) === 0) {
        return "";
    }
    nr_abj = 0;
    nr_ppn = 0;
    nr_abi = 0;
    product = 1;
    ՐՏitr40 = ՐՏ_Iterable(column.average_columns);
    for (ՐՏidx40 = 0; ՐՏidx40 < ՐՏitr40.length; ՐՏidx40++) {
        data_column = ՐՏitr40[ՐՏidx40];
        origin = columns[data_column];
        if (to_float(origin.real_weight) !== 1) {
            return _("ERROR_all_weight_equals_to_1");
        }
        if (origin.visibility === 5 && python_mode) {
            value = origin.empty_is;
        } else {
            value = line[data_column].get_value(origin);
        }
        if (str(value) === "") {
            return nan;
        }
        if (ՐՏ_in(value, allowed_grades)) {
            value = allowed_grades[value][0];
        }
        if (ՐՏ_in(value, [abj, abj_short])) {
            ++nr_abj;
        } else if (ՐՏ_in(value, [ppn, ppn_short])) {
            ++nr_ppn;
        } else if (ՐՏ_in(value, [pre, pre_short])) {
            continue;
        } else if (ՐՏ_in(value, [tnr, tnr_short, abi, abi_short])) {
            ++nr_abi;
            product = 0;
        } else {
            product *= to_float_or_nan(value);
        }
    }
    if (nr_abj === 0 && nr_abi !== len(column.average_columns) && nr_ppn === 0) {
        return product;
    }
    if (nr_abi === len(column.average_columns)) {
        return abi;
    }
    if (nr_abj === len(column.average_columns)) {
        return abj;
    }
    if (nr_ppn === len(column.average_columns)) {
        return ppn;
    }
    return nan;
}
var Places = (ՐՏ_55 = function Places() {
    Places.prototype.__init__.apply(this, arguments);
}, (function(){
    Object.defineProperties(ՐՏ_55.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(text){
                var ՐՏ_56, ՐՏitr41, ՐՏidx41, ՐՏupk14;
                var self = this;
                var start, end;
                self.text = text;
                self.intervals = [];
                self.parse(text);
                if (len(self.intervals)) {
                    self.length = len(str((ՐՏ_56 = self.intervals)[ՐՏ_56.length-1][1]));
                }
                self.nr_places = 0;
                ՐՏitr41 = ՐՏ_Iterable(self.intervals);
                for (ՐՏidx41 = 0; ՐՏidx41 < ՐՏitr41.length; ՐՏidx41++) {
                    ՐՏupk14 = ՐՏitr41[ՐՏidx41];
                    start = ՐՏupk14[0];
                    end = ՐՏupk14[1];
                    self.nr_places += end - start + 1;
                }
            }

        },
        iter_start: {
            enumerable: true, 
            writable: true, 
            value: function iter_start(){
                var self = this;
                var i;
                self.iter_current = (function() {
                    var ՐՏidx42, ՐՏitr42 = ՐՏ_Iterable(self.intervals.slice(0)), ՐՏres = [], i;
                    for (ՐՏidx42 = 0; ՐՏidx42 < ՐՏitr42.length; ՐՏidx42++) {
                        i = ՐՏitr42[ՐՏidx42];
                        ՐՏres.push(i.slice(0));
                    }
                    return ՐՏres;
                })();
            }

        },
        iter_next: {
            enumerable: true, 
            writable: true, 
            value: function iter_next(padding){
                var ՐՏupk15;
                var self = this;
                padding = padding === void 0 ? "" : padding;
                var start, end;
                if (len(self.iter_current) === 0) {
                    return null;
                }
                ՐՏupk15 = self.iter_current[0];
                start = ՐՏupk15[0];
                end = ՐՏupk15[1];
                if ((start === end || typeof start === "object" && ՐՏ_eq(start, end))) {
                    python_pop(self.iter_current, 0);
                } else {
                    self.iter_current[0][0] = start + 1;
                }
                start = str(start);
                if (padding !== "") {
                    while (len(start) < self.length) {
                        start = padding + start;
                    }
                }
                return start;
            }

        },
        iter: {
            enumerable: true, 
            writable: true, 
            value: function iter(padding){
                var ՐՏitr43, ՐՏidx43, ՐՏupk16;
                var self = this;
                padding = padding === void 0 ? "" : padding;
                var start, end, i;
                ՐՏitr43 = ՐՏ_Iterable(self.intervals);
                for (ՐՏidx43 = 0; ՐՏidx43 < ՐՏitr43.length; ՐՏidx43++) {
                    ՐՏupk16 = ՐՏitr43[ՐՏidx43];
                    start = ՐՏupk16[0];
                    end = ՐՏupk16[1];
                    for (i = start; i < end + 1; i++) {
                        i = str(i);
                        if (padding !== "") {
                            YIELD;
                            i.rjust(self.length, padding);
                        } else {
                            YIELD;
                            i;
                        }
                    }
                }
            }

        },
        parse: {
            enumerable: true, 
            writable: true, 
            value: function parse(text){
                var ՐՏitr44, ՐՏidx44, ՐՏitr45, ՐՏidx45, ՐՏupk17, ՐՏ_57, ՐՏ_58, ՐՏ_59, ՐՏitr46, ՐՏidx46;
                var self = this;
                var word, start_end, start, end, i, interval, do_insertion;
                self.errors = [];
                ՐՏitr44 = ՐՏ_Iterable(text.split(" "));
                for (ՐՏidx44 = 0; ՐՏidx44 < ՐՏitr44.length; ՐՏidx44++) {
                    word = ՐՏitr44[ՐՏidx44];
                    if (word === "") {
                        continue;
                    }
                    start_end = word.split("-");
                    if (len(start_end) === 2 && len(start_end[0]) !== 0) {
                        start = parseInt(start_end[0]);
                        end = parseInt(start_end[1]);
                    } else {
                        start = parseInt(word);
                        if (start < 0) {
                            start = -start;
                            ՐՏitr45 = ՐՏ_Iterable(enumerate(self.intervals));
                            for (ՐՏidx45 = 0; ՐՏidx45 < ՐՏitr45.length; ՐՏidx45++) {
                                ՐՏupk17 = ՐՏitr45[ՐՏidx45];
                                i = ՐՏupk17[0];
                                interval = ՐՏupk17[1];
                                if (interval[0] > start) {
                                    continue;
                                }
                                if (interval[1] < start) {
                                    continue;
                                }
                                if (((ՐՏ_57 = interval[0]) === start || typeof ՐՏ_57 === "object" && ՐՏ_eq(ՐՏ_57, start))) {
                                    if (((ՐՏ_58 = interval[1]) === start || typeof ՐՏ_58 === "object" && ՐՏ_eq(ՐՏ_58, start))) {
                                        python_pop(self.intervals, i);
                                        break;
                                    }
                                    ++interval[0];
                                } else if (((ՐՏ_59 = interval[1]) === start || typeof ՐՏ_59 === "object" && ՐՏ_eq(ՐՏ_59, start))) {
                                    --interval[1];
                                } else {
                                    self.intervals.insert(i + 1, [ start + 1, interval[1] ]);
                                    self.intervals[i][1] = start - 1;
                                }
                                break;
                            }
                            continue;
                        }
                        end = start;
                    }
                    if (start > end) {
                        self.errors.append("Minimum must be before maximum: " + str(start) + "-" + str(end));
                        continue;
                    }
                    do_insertion = true;
                    i = 0;
                    ՐՏitr46 = ՐՏ_Iterable(self.intervals);
                    for (ՐՏidx46 = 0; ՐՏidx46 < ՐՏitr46.length; ՐՏidx46++) {
                        interval = ՐՏitr46[ՐՏidx46];
                        if (min(end, interval[1]) >= max(start, interval[0])) {
                            self.errors.append("Overlapping ranges " + str(start) + "-" + str(end) + " and " + str(interval[0]) + "-" + str(interval[1]));
                            do_insertion = false;
                        }
                        if (interval[0] > start) {
                            break;
                        }
                        ++i;
                    }
                    if (do_insertion) {
                        self.intervals.insert(i, [ start, end ]);
                    }
                }
                return "";
            }

        }
    });
    return ՐՏ_55;
})(), ՐՏ_55);
"\n";
function compute_if_else(data_col, line, username) {
    var cell, column, origin;
    cell = line[data_col];
    column = columns[data_col];
    if (column.test_if_filter(line, cell, username)) {
        if (len(column.average_columns) > 0) {
            origin = columns[column.average_columns[0]];
            if (origin.visibility === 5 && python_mode) {
                return origin.empty_is;
            }
            return line[column.average_columns[0]].get_value(origin);
        }
    } else {
        if (len(column.average_columns) > 1) {
            origin = columns[column.average_columns[1]];
            if (origin.visibility === 5 && python_mode) {
                return origin.empty_is;
            }
            return line[column.average_columns[1]].get_value(origin);
        }
    }
    return cell.get_value(column);
}
var find_ue_grade = (ՐՏ_60 = function find_ue_grade() {
    var ՐՏ_61, ՐՏitr48, ՐՏidx48, ՐՏupk18, ՐՏ_62, ՐՏ_63, ՐՏ_64, ՐՏ_65, ՐՏ_66, ՐՏ_67, ՐՏ_68;
    var column, cols, errors, by_grade_type, previous, _position, data_col, real_type, liste, error;
    var info = (ՐՏ_61 = function info(col) {
        return "<TR><TD>" + html(col.title) + "<TD>" + _("SELECT_column_grade_type_" + str(col.grade_type)) + "<TD>" + _("SELECT_column_grade_session_" + str(col.grade_session)) + "<TD>" + _("B_print_attr_weight") + str(col.real_weight) + "</TR>";
    }, Object.defineProperty(ՐՏ_61, "__doc__", {
        value: "Information about a bad column"
    }), ՐՏ_61);
    cols = (function() {
        var ՐՏidx47, ՐՏitr47 = ՐՏ_Iterable(columns), ՐՏres = [], column;
        for (ՐՏidx47 = 0; ՐՏidx47 < ՐՏitr47.length; ՐՏidx47++) {
            column = ՐՏitr47[ՐՏidx47];
            ՐՏres.push([ 1e3 + column.position, column.data_col ]);
        }
        return ՐՏres;
    })();
    cols.sort();
    errors = [];
    by_grade_type = [ [], [], [], [] ];
    previous = null;
    ՐՏitr48 = ՐՏ_Iterable(cols);
    for (ՐՏidx48 = 0; ՐՏidx48 < ՐՏitr48.length; ՐՏidx48++) {
        ՐՏupk18 = ՐՏitr48[ՐՏidx48];
        _position = ՐՏupk18[0];
        data_col = ՐՏupk18[1];
        column = columns[data_col];
        if (hasattr(column, "real_type")) {
            real_type = column.real_type;
        } else {
            real_type = column.type;
        }
        if (!hasattr(real_type, "attributes_visible")) {
            continue;
        }
        if (!(ՐՏ_in("grade_type", real_type.attributes_visible))) {
            continue;
        }
        if (!column.grade_type) {
            previous = column;
            continue;
        }
        if (!column.real_weight_add) {
            errors.append(column.title + " " + _("ERROR_addition_not_allowed"));
        }
        if ((column.type.name || column.type) === "Ue_Grade") {
            continue;
        }
        liste = by_grade_type[column.grade_type];
        if (column.grade_session === 0) {
            liste.append([ data_col ]);
        } else {
            if (((ՐՏ_62 = column.grade_type) !== (ՐՏ_63 = previous.grade_type) && (typeof ՐՏ_62 !== "object" || !ՐՏ_eq(ՐՏ_62, ՐՏ_63)))) {
                error = (ՐՏ_64 = _("SELECT_column_grade_type_0").split(" "))[ՐՏ_64.length-1];
            } else if (((ՐՏ_65 = column.real_weight) !== (ՐՏ_66 = previous.real_weight) && (typeof ՐՏ_65 !== "object" || !ՐՏ_eq(ՐՏ_65, ՐՏ_66)))) {
                error = _("BEFORE_column_attr_weight");
            } else if (((ՐՏ_67 = column.grade_session % 10) !== (ՐՏ_68 = previous.grade_session % 10 + 1) && (typeof ՐՏ_67 !== "object" || !ՐՏ_eq(ՐՏ_67, ՐՏ_68)))) {
                error = _("SELECT_column_grade_session_x");
            } else {
                error = "";
            }
            if (error !== "") {
                errors.append("<P>" + _("ALERT_invalid_value") + error + '<TABLE class="colored" style="margin:0.5em; border:1px solid #F00">' + info(previous) + info(column) + "</TABLE>");
            } else {
                liste[liste.length-1].append(column.data_col);
            }
        }
        previous = column;
    }
    return [by_grade_type, "<br>".join(errors)];
}, Object.defineProperty(ՐՏ_60, "__doc__", {
    value: "Find all the columns needed to compute the UE grade and report errors"
}), ՐՏ_60);
LAST_COMPUTED_UE_GRADE = [ "", 0, "" ];
var ue_grade = (ՐՏ_69 = function ue_grade(by_grade_type, line, abi_is_def, session) {
    var ՐՏitr51, ՐՏidx51, ՐՏitr52, ՐՏidx52, ՐՏitr53, ՐՏidx53;
    session = session === void 0 ? 3 : session;
    var sum_grades, weight_grades, miss_grade, data_cols, grade_weight, ct_grade;
    function get_grade_and_weight(data_cols) {
        var ՐՏitr49, ՐՏidx49, ՐՏitr50, ՐՏidx50;
        var grades, data_col, cell, cell_str, column, value, current, grade;
        grades = [];
        ՐՏitr49 = ՐՏ_Iterable(data_cols.slice(0, session));
        for (ՐՏidx49 = 0; ՐՏidx49 < ՐՏitr49.length; ՐՏidx49++) {
            data_col = ՐՏitr49[ՐՏidx49];
            cell = line[data_col];
            cell_str = str(cell.value);
            if (cell_str) {
                column = columns[data_col];
                if (column.visibility === 5 && python_mode) {
                    continue;
                }
                value = to_float_or_nan(cell.value);
                if (isNaN(value)) {
                    if (cell_str.lower() === "nan") {
                    } else if (abi_is_def && column.grade_type !== 1) {
                        grades.append([column, null]);
                    } else {
                        grades.append([column, 0]);
                    }
                } else {
                    value = do_round(value, column.round_by, column.table.rounding, null);
                    grades.append([column, (value - column.min) / (column.max - column.min)]);
                }
            }
        }
        if (len(grades) === 0) {
            return "";
        }
        current = grades[0];
        ՐՏitr50 = ՐՏ_Iterable(grades.slice(1));
        for (ՐՏidx50 = 0; ՐՏidx50 < ՐՏitr50.length; ՐՏidx50++) {
            grade = ՐՏitr50[ՐՏidx50];
            if (grade[0].grade_session > 10) {
                if (grade[1] && (!current[1] || grade[1] > current[1])) {
                    current = grade;
                }
            } else {
                current = grade;
            }
        }
        if (!current[1] && current[1] !== 0) {
            return null;
        }
        return [ current[1], current[0].real_weight ];
    }
    sum_grades = 0;
    weight_grades = 0;
    miss_grade = false;
    ՐՏitr51 = ՐՏ_Iterable(by_grade_type[3]);
    for (ՐՏidx51 = 0; ՐՏidx51 < ՐՏitr51.length; ՐՏidx51++) {
        data_cols = ՐՏitr51[ՐՏidx51];
        grade_weight = get_grade_and_weight(data_cols);
        if (grade_weight === null) {
            return [null, true];
        }
        if (grade_weight === "") {
            miss_grade = true;
            continue;
        }
        sum_grades += grade_weight[1] * grade_weight[0];
        weight_grades += grade_weight[1];
    }
    if (weight_grades) {
        ct_grade = sum_grades / weight_grades;
    } else {
        ct_grade = 0;
    }
    ՐՏitr52 = ՐՏ_Iterable(by_grade_type[2]);
    for (ՐՏidx52 = 0; ՐՏidx52 < ՐՏitr52.length; ՐՏidx52++) {
        data_cols = ՐՏitr52[ՐՏidx52];
        grade_weight = get_grade_and_weight(data_cols);
        if (grade_weight === null) {
            return [null, true];
        }
        if (grade_weight === "") {
            miss_grade = true;
            continue;
        }
        sum_grades += grade_weight[1] * grade_weight[0];
        weight_grades += grade_weight[1];
    }
    ՐՏitr53 = ՐՏ_Iterable(by_grade_type[1]);
    for (ՐՏidx53 = 0; ՐՏidx53 < ՐՏitr53.length; ՐՏidx53++) {
        data_cols = ՐՏitr53[ՐՏidx53];
        grade_weight = get_grade_and_weight(data_cols);
        if (grade_weight === "") {
            miss_grade = true;
            continue;
        }
        sum_grades += grade_weight[1] * max(grade_weight[0], ct_grade);
        weight_grades += grade_weight[1];
    }
    if (weight_grades) {
        return [sum_grades / weight_grades, miss_grade];
    }
    return ["", true];
}, Object.defineProperty(ՐՏ_69, "__doc__", {
    value: "Compute the UE grade"
}), ՐՏ_69);
function ue_grade_update_columns(column) {
    var ՐՏitr54, ՐՏidx54, ՐՏitr55, ՐՏidx55, ՐՏitr56, ՐՏidx56;
    var cols_data_col, cols_title, used, column_type, session;
    if (column !== LAST_COMPUTED_UE_GRADE[0] || millisec() - LAST_COMPUTED_UE_GRADE[1] > 100) {
        LAST_COMPUTED_UE_GRADE[0] = column;
        LAST_COMPUTED_UE_GRADE[1] = millisec();
        LAST_COMPUTED_UE_GRADE[2] = find_ue_grade();
        cols_data_col = [];
        cols_title = [];
        ՐՏitr54 = ՐՏ_Iterable(LAST_COMPUTED_UE_GRADE[2][0].slice(1));
        for (ՐՏidx54 = 0; ՐՏidx54 < ՐՏitr54.length; ՐՏidx54++) {
            used = ՐՏitr54[ՐՏidx54];
            ՐՏitr55 = ՐՏ_Iterable(used);
            for (ՐՏidx55 = 0; ՐՏidx55 < ՐՏitr55.length; ՐՏidx55++) {
                column_type = ՐՏitr55[ՐՏidx55];
                ՐՏitr56 = ՐՏ_Iterable(column_type);
                for (ՐՏidx56 = 0; ՐՏidx56 < ՐՏitr56.length; ՐՏidx56++) {
                    session = ՐՏitr56[ՐՏidx56];
                    cols_title.append(columns[session].title);
                    cols_data_col.append(session);
                }
            }
        }
        column.columns = " ".join(cols_title);
        column.average_columns = cols_data_col;
        try {
            if (len(LAST_COMPUTED_UE_GRADE[2][1])) {
                set_message("ue_grade", 3, LAST_COMPUTED_UE_GRADE[2][1]);
            } else {
                set_message("ue_grade", 3);
            }
        } catch (ՐՏ_Exception) {
        }
    }
}
var compute_ue_grade = (ՐՏ_70 = function compute_ue_grade(data_col, line, _username, session_max) {
    var ՐՏupk19, ՐՏupk20;
    session_max = session_max === void 0 ? 3 : session_max;
    var column, by_grade_type, errors, grade, miss_grade;
    column = columns[data_col];
    ue_grade_update_columns(column);
    ՐՏupk19 = LAST_COMPUTED_UE_GRADE[2];
    by_grade_type = ՐՏupk19[0];
    errors = ՐՏupk19[1];
    if (len(errors)) {
        return "";
    }
    ՐՏupk20 = ue_grade(by_grade_type, line, column.abi_is === 1, session_max);
    grade = ՐՏupk20[0];
    miss_grade = ՐՏupk20[1];
    if (grade === null) {
        return "DEF";
    }
    if (grade === "") {
        return "";
    }
    grade = grade * (column.max - column.min) + column.min;
    if (miss_grade) {
        return "0" + as_fixed(grade);
    }
    return to_float_or_nan(as_fixed(grade));
}, Object.defineProperty(ՐՏ_70, "__doc__", {
    value: "Compute the grade.\nUse a cache to get the list of columns to average"
}), ՐՏ_70);
function compute_ue_grade_comment(data_col, line, username) {
    return compute_ue_grade(data_col, line, username, 1);
}
compute_ue_grade.compute_comment = compute_ue_grade_comment;
"\n";
function parse_replacements(txt) {
    var ՐՏitr57, ՐՏidx57, ՐՏupk21;
    var replacements, replace, left_right, left, right;
    replacements = [];
    ՐՏitr57 = ՐՏ_Iterable(txt.split("●"));
    for (ՐՏidx57 = 0; ՐՏidx57 < ՐՏitr57.length; ՐՏidx57++) {
        replace = ՐՏitr57[ՐՏidx57];
        left_right = replace.split("🡆");
        if (len(left_right) === 2) {
            ՐՏupk21 = left_right;
            left = ՐՏupk21[0];
            right = ՐՏupk21[1];
            replacements.append([ new Filter(left, "Text", columns), right.strip() ]);
        }
    }
    return replacements;
}
function compute_replace(data_col, line, username) {
    var ՐՏitr58, ՐՏidx58, ՐՏupk22;
    var column, from_data_col, cell, test, value;
    column = columns[data_col];
    if (len(column.average_columns) === 0) {
        return line[data_col].value;
    }
    if (!column.replacements) {
        column.replacements = parse_replacements(column.replace);
    }
    from_data_col = column.average_columns[0];
    cell = line[from_data_col];
    ՐՏitr58 = ՐՏ_Iterable(column.replacements);
    for (ՐՏidx58 = 0; ՐՏidx58 < ՐՏitr58.length; ՐՏidx58++) {
        ՐՏupk22 = ՐՏitr58[ՐՏidx58];
        test = ՐՏupk22[0];
        value = ՐՏupk22[1];
        if (test.evaluate(line, cell, username, false)) {
            return value;
        }
    }
    return cell.get_value(column);
}
"\nCompetences Catalog functions and classes\n";
ERR_DUPLICATE = -1;
ERR_OBSERVATION = -2;
ERR_INVALID = -3;
var is_vocabulary = (ՐՏ_71 = function is_vocabulary(char) {
    return char === "+" || is_letter(char);
}, Object.defineProperty(ՐՏ_71, "__doc__", {
    value: "Return True if the element is a key letter (a-z, +)"
}), ՐՏ_71);
var is_letter = (ՐՏ_72 = function is_letter(char) {
    var is_lowcase, is_uppercase;
    is_lowcase = char >= str("a") && char <= str("z");
    is_uppercase = char >= str("A") && char <= str("Z");
    return is_lowcase || is_uppercase || char === "+";
}, Object.defineProperty(ՐՏ_72, "__doc__", {
    value: "Return True if the element is a letter (a-z / A-Z)"
}), ՐՏ_72);
var text_simplify = (ՐՏ_73 = function text_simplify(text) {
    var ՐՏitr59, ՐՏidx59;
    var simple_text, char;
    simple_text = "";
    ՐՏitr59 = ՐՏ_Iterable(flat(text.replace("-", " ")));
    for (ՐՏidx59 = 0; ՐՏidx59 < ՐՏitr59.length; ՐՏidx59++) {
        char = ՐՏitr59[ՐՏidx59];
        if (is_letter(char) || char.isdigit() || char === " ") {
            simple_text += char.lower();
        }
    }
    return simple_text;
}, Object.defineProperty(ՐՏ_73, "__doc__", {
    value: "Returns the text without the non letters characters"
}), ՐՏ_73);
var key_split = (ՐՏ_74 = function key_split(key) {
    var ՐՏitr60, ՐՏidx60;
    var result, char;
    result = [];
    ՐՏitr60 = ՐՏ_Iterable(key);
    for (ՐՏidx60 = 0; ՐՏidx60 < ՐՏitr60.length; ՐՏidx60++) {
        char = ՐՏitr60[ՐՏidx60];
        if (char.isdigit() && len(result) > 0) {
            if (result[result.length-1][1] === null) {
                result[result.length-1][1] = parseInt(char);
            } else {
                result[result.length-1][1] = 10 * result[result.length-1][1] + parseInt(char);
            }
        } else if (is_vocabulary(char)) {
            result.append([ char, null ]);
        }
    }
    return result;
}, Object.defineProperty(ՐՏ_74, "__doc__", {
    value: "Desc:\n    Transform a str key to a words list: \"m0b10a2\" -> [['m', 0], ['b', 10], ['a', 2]]\n\nArgs:\n    str: key\nReturn:\n    list[list[chr, int]]: splitted key"
}), ՐՏ_74);
function ue_code(the_ue) {
    var result;
    result = the_ue;
    if (ՐՏ_in("-", result)) {
        result = result.split("-")[1];
    }
    if (ՐՏ_in("@", result)) {
        result = result.split("@")[0];
    }
    return result;
}
var key_words = (ՐՏ_75 = function key_words(key) {
    var ՐՏitr61, ՐՏidx61;
    var result, char;
    result = [];
    ՐՏitr61 = ՐՏ_Iterable(key);
    for (ՐՏidx61 = 0; ՐՏidx61 < ՐՏitr61.length; ՐՏidx61++) {
        char = ՐՏitr61[ՐՏidx61];
        if (char.isdigit()) {
            if (len(result)) {
                result[result.length-1] += char;
            } else {
                result.append(char);
            }
        } else {
            result.append(char);
        }
    }
    return result;
}, Object.defineProperty(ՐՏ_75, "__doc__", {
    value: "Transform a str key to a words list: \"m0b10a2\" -> ['m0', 'b10', 'a2']"
}), ՐՏ_75);
var observations_to_dict = (ՐՏ_76 = function observations_to_dict(str_observations) {
    var ՐՏitr62, ՐՏidx62, ՐՏupk23;
    var list_observations, dict_observations, observation, split, key, grade;
    if (len(str_observations) === 0) {
        return {};
    }
    list_observations = str_observations;
    if (isStr(list_observations)) {
        list_observations = list_observations.split(" ");
    }
    dict_observations = {};
    ՐՏitr62 = ՐՏ_Iterable(list_observations);
    for (ՐՏidx62 = 0; ՐՏidx62 < ՐՏitr62.length; ՐՏidx62++) {
        observation = ՐՏitr62[ՐՏidx62];
        split = observation.split("o");
        if (len(split) < 2 || len(split[1]) === 0) {
            continue;
        }
        ՐՏupk23 = [split[0], split[1]];
        key = ՐՏupk23[0];
        grade = ՐՏupk23[1];
        if (grade.isdigit()) {
            grade = parseInt(grade);
            if (grade >= 0 && grade <= 5) {
                dict_observations[key] = grade;
            }
        }
    }
    return dict_observations;
}, Object.defineProperty(ՐՏ_76, "__doc__", {
    value: 'Transform a str list of observations to dictionnary.\nExample : "f0o2 s3o4 e2o0" -> {f0: 2, s3: 4, e2: 0}\nor      : [f0o2, s3o4, e2o0] -> {f0: 2, s3: 4, e2: 0}'
}), ՐՏ_76);
function ue_tree_get_all_parents(parent_ue_tree, ue) {
    var parents, have_parent, the_ue, parent;
    parents = [];
    have_parent = true;
    the_ue = ue_code(ue);
    parent = the_ue;
    while (have_parent) {
        if (ՐՏ_in(parent, parent_ue_tree)) {
            parent = parent_ue_tree[parent];
            if (ՐՏ_in(parent, parents)) {
                return parents;
            }
            parents.append(parent);
        } else {
            have_parent = false;
        }
    }
    return parents;
}
var key_match_word = (ՐՏ_77 = function key_match_word(key, word) {
    var ՐՏupk24, ՐՏitr63, ՐՏidx63, ՐՏ_78, ՐՏitr64, ՐՏidx64, ՐՏupk25, ՐՏitr65, ՐՏidx65;
    var filtre_voc, filtre_indexes, key_word, filtre_voc_f, filtre_index_f, filtre_index;
    ՐՏupk24 = word;
    filtre_voc = ՐՏupk24[0];
    filtre_indexes = ՐՏupk24[1];
    if (len(filtre_indexes) === 0) {
        ՐՏitr63 = ՐՏ_Iterable(key);
        for (ՐՏidx63 = 0; ՐՏidx63 < ՐՏitr63.length; ՐՏidx63++) {
            key_word = ՐՏitr63[ՐՏidx63];
            if (((ՐՏ_78 = key_word[0]) === filtre_voc || typeof ՐՏ_78 === "object" && ՐՏ_eq(ՐՏ_78, filtre_voc))) {
                return true;
            }
        }
    } else {
        ՐՏitr64 = ՐՏ_Iterable(key);
        for (ՐՏidx64 = 0; ՐՏidx64 < ՐՏitr64.length; ՐՏidx64++) {
            ՐՏupk25 = ՐՏitr64[ՐՏidx64];
            filtre_voc_f = ՐՏupk25[0];
            filtre_index_f = ՐՏupk25[1];
            if ((filtre_voc === filtre_voc_f || typeof filtre_voc === "object" && ՐՏ_eq(filtre_voc, filtre_voc_f))) {
                ՐՏitr65 = ՐՏ_Iterable(filtre_indexes);
                for (ՐՏidx65 = 0; ՐՏidx65 < ՐՏitr65.length; ՐՏidx65++) {
                    filtre_index = ՐՏitr65[ՐՏidx65];
                    if ((filtre_index === filtre_index_f || typeof filtre_index === "object" && ՐՏ_eq(filtre_index, filtre_index_f))) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}, Object.defineProperty(ՐՏ_77, "__doc__", {
    value: "Returns True if the  key is included in the filter"
}), ՐՏ_77);
var key_match_filter = (ՐՏ_79 = function key_match_filter(key, filter_words) {
    var ՐՏitr66, ՐՏidx66;
    var cutted_filter, word;
    if (len(filter_words) === 0) {
        return true;
    }
    if (filter_words[filter_words.length-1][0] === "o") {
        cutted_filter = filter_words.slice(0, -1);
    } else {
        cutted_filter = filter_words;
    }
    ՐՏitr66 = ՐՏ_Iterable(cutted_filter);
    for (ՐՏidx66 = 0; ՐՏidx66 < ՐՏitr66.length; ՐՏidx66++) {
        word = ՐՏitr66[ՐՏidx66];
        if (!key_match_word(key, word)) {
            return false;
        }
    }
    return true;
}, Object.defineProperty(ՐՏ_79, "__doc__", {
    value: "Return True if the key contains all filter words\n\nArgs:\n    list[(chr, int)]: key splitted\n    list[(chr, list[int])]: a splitted filter\nReturns:\n    bool: True if key in filter"
}), ՐՏ_79);
var key_last_word = (ՐՏ_80 = function key_last_word(key) {
    var list_voc;
    list_voc = key_split(key);
    if (len(list_voc) > 0) {
        return list_voc[list_voc.length-1];
    }
    return [];
}, Object.defineProperty(ՐՏ_80, "__doc__", {
    value: "Get the last word of a str key: \"m0b10a2\" -> ['a', 2]\n\nArgs:\n    str: key\nReturns:\n    tuple(str, index): (voc key, index)"
}), ՐՏ_80);
var key_subtract_word = (ՐՏ_81 = function key_subtract_word(key, words) {
    var ՐՏitr67, ՐՏidx67;
    var cutted_key, targets, word;
    cutted_key = "";
    targets = key_words(words);
    ՐՏitr67 = ՐՏ_Iterable(key_words(key));
    for (ՐՏidx67 = 0; ՐՏidx67 < ՐՏitr67.length; ՐՏidx67++) {
        word = ՐՏitr67[ՐՏidx67];
        if (!(ՐՏ_in(word, targets))) {
            cutted_key += word;
        }
    }
    return cutted_key;
}, Object.defineProperty(ՐՏ_81, "__doc__", {
    value: "Desc:\n    Returns the key without the words\n\nArgs:\n    str: key\n    str: word (b0m10)\nReturn:\n    str: key without the targeted words"
}), ՐՏ_81);
var string_distance = (ՐՏ_82 = function string_distance(inputed, expected) {
    var ՐՏitr69, ՐՏidx69, ՐՏitr70, ՐՏidx70, ՐՏupk26;
    var i, current_line, previous_line, expec_letter, input_letter, cost, add_action, delete_action, replace_action;
    current_line = (function() {
        var ՐՏidx68, ՐՏitr68 = ՐՏ_Iterable(range(len(inputed) + 1)), ՐՏres = [], i;
        for (ՐՏidx68 = 0; ՐՏidx68 < ՐՏitr68.length; ՐՏidx68++) {
            i = ՐՏitr68[ՐՏidx68];
            ՐՏres.push(i);
        }
        return ՐՏres;
    })();
    previous_line = current_line.slice(0);
    ՐՏitr69 = ՐՏ_Iterable(expected);
    for (ՐՏidx69 = 0; ՐՏidx69 < ՐՏitr69.length; ՐՏidx69++) {
        expec_letter = ՐՏitr69[ՐՏidx69];
        ++current_line[0];
        ՐՏitr70 = ՐՏ_Iterable(enumerate(inputed));
        for (ՐՏidx70 = 0; ՐՏidx70 < ՐՏitr70.length; ՐՏidx70++) {
            ՐՏupk26 = ՐՏitr70[ՐՏidx70];
            i = ՐՏupk26[0];
            input_letter = ՐՏupk26[1];
            if ((expec_letter === input_letter || typeof expec_letter === "object" && ՐՏ_eq(expec_letter, input_letter))) {
                cost = 0;
            } else {
                cost = 1;
            }
            add_action = current_line[i] + 1;
            delete_action = current_line[i + 1] + 1;
            replace_action = previous_line[i] + cost;
            current_line[i + 1] = min(add_action, delete_action, replace_action);
        }
        previous_line = current_line.slice(0);
    }
    return current_line[current_line.length-1];
}, Object.defineProperty(ՐՏ_82, "__doc__", {
    value: "Desc:\n    find the textual distance of 2 strings\n\nArgs:\n    str: any simplified text\n    str: any simplified text\nReturn:\n    int: textual distance"
}), ՐՏ_82);
var text_in_list = (ՐՏ_83 = function text_in_list(text, strings, distance) {
    var ՐՏitr71, ՐՏidx71;
    distance = distance === void 0 ? 4 : distance;
    var string;
    ՐՏitr71 = ՐՏ_Iterable(strings);
    for (ՐՏidx71 = 0; ՐՏidx71 < ՐՏitr71.length; ՐՏidx71++) {
        string = ՐՏitr71[ՐՏidx71];
        if (string_distance(text, string) < distance) {
            return true;
        }
    }
    return false;
}, Object.defineProperty(ՐՏ_83, "__doc__", {
    value: "Returns True if 'text' is close (<distance) to one of the strings"
}), ՐՏ_83);
var all_texts_in_list = (ՐՏ_84 = function all_texts_in_list(texts, strings, distance) {
    var ՐՏitr72, ՐՏidx72;
    distance = distance === void 0 ? 4 : distance;
    var text;
    ՐՏitr72 = ՐՏ_Iterable(texts);
    for (ՐՏidx72 = 0; ՐՏidx72 < ՐՏitr72.length; ՐՏidx72++) {
        text = ՐՏitr72[ՐՏidx72];
        if (!text_in_list(text, strings, distance)) {
            return false;
        }
    }
    return true;
}, Object.defineProperty(ՐՏ_84, "__doc__", {
    value: "Returns True if all 'texts' elements are close (<distance) to one of the strings"
}), ՐՏ_84);
var extract_rating = (ՐՏ_85 = function extract_rating(description) {
    var ՐՏ_86;
    var rating;
    rating = (ՐՏ_86 = description.split("("))[ՐՏ_86.length-1].split(")")[0].split("/");
    if (len(rating) === 2 && rating[0].isdigit() && rating[1].isdigit()) {
        return parseInt(rating[0]) / parseInt(rating[1]);
    }
    if (len(rating) === 1 && rating[0] === "NE") {
        return -1;
    }
    return -2;
}, Object.defineProperty(ՐՏ_85, "__doc__", {
    value: "Desc:\n    Get the rating of the description (0 to 1, -1 if unrated, -2 if no rating)\n\nArgs:\n    str: any description\nReturn:\n    float: rating"
}), ՐՏ_85);
var get_tree_leaves = (ՐՏ_87 = function get_tree_leaves(tree) {
    var ՐՏitr73, ՐՏidx73;
    var leaves, branch;
    if (!(ՐՏ_in("children", tree)) || len(tree["children"]) === 0) {
        return [ tree ];
    }
    leaves = [];
    ՐՏitr73 = ՐՏ_Iterable(tree["children"]);
    for (ՐՏidx73 = 0; ՐՏidx73 < ՐՏitr73.length; ՐՏidx73++) {
        branch = ՐՏitr73[ՐՏidx73];
        leaves.extend(get_tree_leaves(branch));
    }
    return leaves;
}, Object.defineProperty(ՐՏ_87, "__doc__", {
    value: "Desc:\n    Return the list of all leaves of the tree\n\nArgs:\n    dict: the tree, children are referenced in a 'children' section\nReturn\n    list : a list of objects [{'children': [...], ...}, {...}, ...]"
}), ՐՏ_87);
var comp_analyse_list = (ՐՏ_88 = function comp_analyse_list(txt) {
    var ՐՏitr74, ՐՏidx74;
    var values, elements, weights, value;
    txt = txt.strip();
    if (txt === "") {
        return [ [], {} ];
    }
    values = REsplit("[ \n\t]+", txt);
    values.sort();
    elements = [];
    weights = {};
    ՐՏitr74 = ՐՏ_Iterable(values);
    for (ՐՏidx74 = 0; ՐՏidx74 < ՐՏitr74.length; ՐՏidx74++) {
        value = ՐՏitr74[ՐՏidx74];
        value = value.split(":");
        elements.append(value[0]);
        if (len(value) === 2) {
            weights[value[0]] = parseFloat(value[1]);
        }
    }
    return [ elements, weights ];
}, Object.defineProperty(ՐՏ_88, "__doc__", {
    value: "The string 'a  c:2 b' will return:\n   [ ['a', 'b', 'c'], {\"b\": 2}]\nThe string '' will return\n   [ [], {} ]"
}), ՐՏ_88);
function get_comp_cols_from_col(data_col) {
    var ՐՏitr75, ՐՏidx75, ՐՏitr76, ՐՏidx76;
    var comp_cols, col;
    comp_cols = [];
    if (len(columns[data_col].average_columns) > 0) {
        ՐՏitr75 = ՐՏ_Iterable(columns[data_col].average_columns);
        for (ՐՏidx75 = 0; ՐՏidx75 < ՐՏitr75.length; ՐՏidx75++) {
            data_col = ՐՏitr75[ՐՏidx75];
            comp_cols.append(data_col);
        }
    } else {
        ՐՏitr76 = ՐՏ_Iterable(columns);
        for (ՐՏidx76 = 0; ՐՏidx76 < ՐՏitr76.length; ՐՏidx76++) {
            col = ՐՏitr76[ՐՏidx76];
            if ((col.type.name || col.type) === "Competences") {
                comp_cols.append(col.data_col);
            }
        }
    }
    return comp_cols;
}
function comp_cell_compute_cache_datas(data_col, competences) {
    var comp_cols, formulas, grades_weights;
    comp_cols = get_comp_cols_from_col(data_col);
    formulas = aggregate_formulas_compile(competences["formulas"]["observations"]);
    if (ՐՏ_in("grades_weights", competences)) {
        grades_weights = competences["grades_weights"];
    } else {
        grades_weights = [null, 0, 5, 10, 15, 20];
    }
    return [ comp_cols, formulas, grades_weights ];
}
function comp_result_cell_compute(data_col, line, _username) {
    var ՐՏupk27, ՐՏupk28, ՐՏitr77, ՐՏidx77;
    var column, competences, catalog, timestamp, table, formulas, comp_cols, grades_weights, result_list, grades, key;
    column = columns[data_col];
    if (python_mode) {
        competences = parseJSON(column.table.competence);
        catalog = configuration.get_catalog().shallow_copy();
        catalog.complete_with_refine(competences["refine"], ".*");
    } else {
        competences = table_attr.p_competence;
        catalog = window.competenceTable.catalog || window.DisplayGrades && window.DisplayGrades.table_attr.catalog || window.student_catalog;
    }
    if (!catalog) {
        return "!catalog";
    }
    if (!competences) {
        return "!competences";
    }
    ՐՏupk27 = comp_result_cell_compute.cache;
    timestamp = ՐՏupk27[0];
    table = ՐՏupk27[1];
    formulas = ՐՏupk27[2];
    comp_cols = ՐՏupk27[3];
    grades_weights = ՐՏupk27[4];
    if (table !== column.table || millisec() > timestamp - 100) {
        ՐՏupk28 = comp_cell_compute_cache_datas(data_col, competences);
        comp_cols = ՐՏupk28[0];
        formulas = ՐՏupk28[1];
        grades_weights = ՐՏupk28[2];
        comp_result_cell_compute.cache = [ millisec(), column.table, formulas, comp_cols, grades_weights ];
    }
    result_list = [];
    grades = aggregate_line(catalog.items, formulas, line, comp_cols, grades_weights)[0];
    if (isStr(grades)) {
        return "";
    }
    ՐՏitr77 = ՐՏ_Iterable(grades);
    for (ՐՏidx77 = 0; ՐՏidx77 < ՐՏitr77.length; ՐՏidx77++) {
        key = ՐՏitr77[ՐՏidx77];
        result_list.append(key + "o" + str(rint(grades[key])));
    }
    return " ".join(result_list);
}
comp_result_cell_compute.cache = [0, null, null, null, null];
function comps_grade_cell_compute(data_col, line, _username) {
    var ՐՏupk29, ՐՏupk30, ՐՏitr78, ՐՏidx78;
    var column, competences, grades_weights, comps_grade, catalog, timestamp, table, formulas, comp_cols, grades, keys, word, weight, final_obs, round_by;
    column = columns[data_col];
    if (python_mode) {
        competences = parseJSON(column.table.competence);
        grades_weights = competences.get("grades_weights", [null, 0, 5, 10, 15, 20]);
        comps_grade = parseJSON(column.competences_grade);
        catalog = configuration.get_catalog().shallow_copy();
        catalog.complete_with_refine(competences["refine"], ".*");
    } else {
        competences = table_attr["p_competence"];
        grades_weights = competences["grades_weights"];
        comps_grade = column.p_competences_grade;
        catalog = window.competenceTable.catalog || window.DisplayGrades && window.DisplayGrades.table_attr.catalog || window.student_catalog;
    }
    if (!catalog) {
        return nan;
    }
    if (!competences) {
        return nan;
    }
    ՐՏupk29 = comps_grade_cell_compute.cache;
    timestamp = ՐՏupk29[0];
    table = ՐՏupk29[1];
    formulas = ՐՏupk29[2];
    comp_cols = ՐՏupk29[3];
    grades_weights = ՐՏupk29[4];
    if (table !== column.table || millisec() > timestamp - 100) {
        ՐՏupk30 = comp_cell_compute_cache_datas(data_col, competences);
        comp_cols = ՐՏupk30[0];
        formulas = ՐՏupk30[1];
        grades_weights = ՐՏupk30[2];
        comps_grade_cell_compute.cache = [ millisec(), column.table, formulas, comp_cols, grades_weights ];
    }
    grades = aggregate_line(catalog.items, formulas, line, comp_cols, grades_weights)[0];
    if (isStr(grades) || len(grades) === 0) {
        return nan;
    }
    keys = [];
    ՐՏitr78 = ՐՏ_Iterable(grades);
    for (ՐՏidx78 = 0; ՐՏidx78 < ՐՏitr78.length; ՐՏidx78++) {
        word = ՐՏitr78[ՐՏidx78];
        weight = 1;
        if (ՐՏ_in(word, comps_grade["weights"])) {
            weight = comps_grade["weights"][word];
        }
        keys.append([ word, weight, switch_grade_weight(grades[word], grades_weights) ]);
    }
    final_obs = aggregate_compute(keys, aggregate_formulas_compile(comps_grade["formulas"]));
    if (final_obs === 99) {
        return nan;
    }
    if (final_obs === 0) {
        return ppn;
    }
    round_by = column.round_by;
    return do_round((final_obs - 1) * 5, column.round_by, column.table.rounding, column.old_function);
}
comps_grade_cell_compute.cache = [0, null, null, null, null];
function get_linear_grades(grades_weights) {
    var result, grade_gap, i;
    result = [ null ];
    grade_gap = grades_weights[grades_weights.length-1] / (len(grades_weights) - 2);
    for (i = 0; i < len(grades_weights) - 1; i++) {
        result.append(i * grade_gap);
    }
    return result;
}
function switch_grade_weight(obs, starting_grades_weights, final_grades_weights) {
    var ՐՏ_89, ՐՏitr79, ՐՏidx79, ՐՏupk31;
    starting_grades_weights = starting_grades_weights === void 0 ? null : starting_grades_weights;
    final_grades_weights = final_grades_weights === void 0 ? null : final_grades_weights;
    var d, grade, result_grades_weights, l, g, i, val;
    if (obs < 1 || obs === 99) {
        return 0;
    }
    if ((starting_grades_weights === (ՐՏ_89 = null) || typeof starting_grades_weights === "object" && ՐՏ_eq(starting_grades_weights, ՐՏ_89))) {
        return obs;
    }
    d = floor(obs);
    grade = starting_grades_weights[d] + (starting_grades_weights[ceil(obs)] - starting_grades_weights[d]) * (obs - d);
    result_grades_weights = final_grades_weights;
    if (!result_grades_weights) {
        result_grades_weights = get_linear_grades(starting_grades_weights);
    }
    l = 1;
    g = 5;
    ՐՏitr79 = ՐՏ_Iterable(enumerate(result_grades_weights.slice(1)));
    for (ՐՏidx79 = 0; ՐՏidx79 < ՐՏitr79.length; ՐՏidx79++) {
        ՐՏupk31 = ՐՏitr79[ՐՏidx79];
        i = ՐՏupk31[0];
        val = ՐՏupk31[1];
        if (grade > val) {
            l = max(l, i + 1);
        } else if (grade < val) {
            g = min(g, i + 1);
        } else if ((grade === val || typeof grade === "object" && ՐՏ_eq(grade, val))) {
            return i + 1;
        }
    }
    if ((l === g || typeof l === "object" && ՐՏ_eq(l, g))) {
        return l;
    }
    return l + (grade - result_grades_weights[l]) / (result_grades_weights[g] - result_grades_weights[l]);
}
function aggregate_line(items, formulas, line, cols, grades_weights) {
    var ՐՏitr80, ՐՏidx80, ՐՏupk32;
    var keys, results, why, key, grade, why_key;
    keys = {};
    try {
        keys = get_line_observations(items, line, cols, grades_weights);
    } catch (ՐՏ_Exception) {
        return "!error Unexpected:\nitems=" + str(items) + "\nline=" + str(line) + "\ncols=" + str(cols) + "\nweights=" + grades_weights;
    }
    results = {};
    why = {};
    ՐՏitr80 = ՐՏ_Iterable(keys);
    for (ՐՏidx80 = 0; ՐՏidx80 < ՐՏitr80.length; ՐՏidx80++) {
        key = ՐՏitr80[ՐՏidx80];
        ՐՏupk32 = aggregate_compute_why(keys[key], formulas);
        grade = ՐՏupk32[0];
        why_key = ՐՏupk32[1];
        why[key] = [ why_key ];
        if (grade === 99) {
            grade = 0;
        }
        results[key] = switch_grade_weight(grade, get_linear_grades(grades_weights), grades_weights);
    }
    return [results, why];
}
function get_line_observations(items, line, cols, grades_weights) {
    var ՐՏitr81, ՐՏidx81, ՐՏitr82, ՐՏidx82;
    var keys, col, grades, word, weights, weight, str_col;
    keys = {};
    ՐՏitr81 = ՐՏ_Iterable(cols);
    for (ՐՏidx81 = 0; ՐՏidx81 < ՐՏitr81.length; ՐՏidx81++) {
        col = ՐՏitr81[ՐՏidx81];
        grades = line[col].value;
        if (len(grades) === 0) {
            continue;
        }
        if (ՐՏ_in(";", grades)) {
            grades = grades.split(";")[0];
        }
        grades = observations_to_dict(grades);
        ՐՏitr82 = ՐՏ_Iterable(grades);
        for (ՐՏidx82 = 0; ՐՏidx82 < ՐՏitr82.length; ՐՏidx82++) {
            word = ՐՏitr82[ՐՏidx82];
            if (!(ՐՏ_in(word, items))) {
                continue;
            }
            weights = items[word].ue_weights();
            weight = 1;
            str_col = str(col);
            if (ՐՏ_in(str_col, weights)) {
                weight = weights[str_col];
            }
            if (!(ՐՏ_in(word, keys))) {
                keys[word] = [];
            }
            keys[word].append([ word, weight, switch_grade_weight(grades[word], grades_weights) ]);
        }
    }
    return keys;
}
function merge_comps(weighter_obs, weights, formulas, grades_weights, preserve_grades_weights, why) {
    var ՐՏitr83, ՐՏidx83, ՐՏitr84, ՐՏidx84, ՐՏupk33, ՐՏitr85, ՐՏidx85, ՐՏupk34, ՐՏitr86, ՐՏidx86;
    grades_weights = grades_weights === void 0 ? null : grades_weights;
    preserve_grades_weights = preserve_grades_weights === void 0 ? false : preserve_grades_weights;
    why = why === void 0 ? false : why;
    var items_by_key, weighter, obs, key, grade, weight, result, why_result;
    items_by_key = {};
    ՐՏitr83 = ՐՏ_Iterable(weighter_obs);
    for (ՐՏidx83 = 0; ՐՏidx83 < ՐՏitr83.length; ՐՏidx83++) {
        weighter = ՐՏitr83[ՐՏidx83];
        ՐՏitr84 = ՐՏ_Iterable(weighter_obs[weighter]);
        for (ՐՏidx84 = 0; ՐՏidx84 < ՐՏitr84.length; ՐՏidx84++) {
            obs = ՐՏitr84[ՐՏidx84];
            ՐՏupk33 = obs.split("o");
            key = ՐՏupk33[0];
            grade = ՐՏupk33[1];
            weight = 1;
            if (ՐՏ_in(key, weights) && ՐՏ_in(weighter, weights[key])) {
                weight = weights[key][weighter];
            }
            if (!(ՐՏ_in(key, items_by_key))) {
                items_by_key[key] = [];
            }
            items_by_key[key].append([ key, weight, switch_grade_weight(parseInt(grade), grades_weights) ]);
        }
    }
    result = {};
    why_result = {};
    ՐՏitr85 = ՐՏ_Iterable(items_by_key);
    for (ՐՏidx85 = 0; ՐՏidx85 < ՐՏitr85.length; ՐՏidx85++) {
        key = ՐՏitr85[ՐՏidx85];
        ՐՏupk34 = aggregate_compute_why(items_by_key[key], formulas);
        result[key] = ՐՏupk34[0];
        why_result[key] = ՐՏupk34[1];
    }
    if (preserve_grades_weights && grades_weights) {
        ՐՏitr86 = ՐՏ_Iterable(result);
        for (ՐՏidx86 = 0; ՐՏidx86 < ՐՏitr86.length; ՐՏidx86++) {
            key = ՐՏitr86[ՐՏidx86];
            result[key] = switch_grade_weight(result[key], get_linear_grades(grades_weights), grades_weights);
        }
    }
    if (why) {
        return [ result, why_result ];
    }
    return result;
}
var aggregate_subcomps = (ՐՏ_90 = function aggregate_subcomps(observ, formulas, children_weights, grades_weights, preserve_grades_weights, why, threshold) {
    var ՐՏitr87, ՐՏidx87, ՐՏitr88, ՐՏidx88, ՐՏitr89, ՐՏidx89, ՐՏupk35, ՐՏupk36;
    grades_weights = grades_weights === void 0 ? null : grades_weights;
    preserve_grades_weights = preserve_grades_weights === void 0 ? false : preserve_grades_weights;
    why = why === void 0 ? false : why;
    threshold = threshold === void 0 ? .75 : threshold;
    var compiled_formulas, result, why_this, ne_are_na, formula, key, grades, nbr_graded, tot_grades, child, grade, weight, final_grade, why1;
    compiled_formulas = aggregate_formulas_compile(formulas);
    result = {};
    why_this = {};
    ne_are_na = false;
    ՐՏitr87 = ՐՏ_Iterable(formulas);
    for (ՐՏidx87 = 0; ՐՏidx87 < ՐՏitr87.length; ՐՏidx87++) {
        formula = ՐՏitr87[ՐՏidx87];
        if (ՐՏ_in("NeNa", formula.split(" ")[1])) {
            ne_are_na = true;
        }
    }
    ՐՏitr88 = ՐՏ_Iterable(children_weights);
    for (ՐՏidx88 = 0; ՐՏidx88 < ՐՏitr88.length; ՐՏidx88++) {
        key = ՐՏitr88[ՐՏidx88];
        grades = [];
        nbr_graded = 0;
        tot_grades = 0;
        ՐՏitr89 = ՐՏ_Iterable(children_weights[key]);
        for (ՐՏidx89 = 0; ՐՏidx89 < ՐՏitr89.length; ՐՏidx89++) {
            child = ՐՏitr89[ՐՏidx89];
            grade = 0;
            if (ՐՏ_in(child, observ) && observ[child] !== 99) {
                grade = observ[child];
            }
            weight = children_weights[key][child];
            tot_grades += weight;
            if (grade > 0) {
                nbr_graded += weight;
            }
            grades.append([ child, weight, switch_grade_weight(grade, grades_weights) ]);
        }
        if (tot_grades === 0 || !ne_are_na && nbr_graded / tot_grades < threshold) {
            ՐՏupk35 = [ 0, null ];
            final_grade = ՐՏupk35[0];
            why1 = ՐՏupk35[1];
        } else {
            ՐՏupk36 = aggregate_compute_why(grades, compiled_formulas);
            final_grade = ՐՏupk36[0];
            why1 = ՐՏupk36[1];
        }
        why_this[key] = why1;
        if (preserve_grades_weights) {
            result[key] = switch_grade_weight(final_grade, get_linear_grades(grades_weights), grades_weights);
        } else {
            result[key] = final_grade;
        }
    }
    if (why) {
        return [result, why_this];
    }
    return result;
}, Object.defineProperty(ՐՏ_90, "__doc__", {
    value: "aggregate all subcompetences from unique value for all of theme\nif the percentage of grades is more than the threshold\nobserv = {key: grade, key: grade, key: grade}\nreturn {key: grade, key: grade, key: grade}"
}), ՐՏ_90);
var merge_comps_by_lines = (ՐՏ_91 = function merge_comps_by_lines(cells, formulas, weights, grades_weights, preserve_grades_weights, why) {
    var ՐՏitr90, ՐՏidx90, ՐՏitr91, ՐՏidx91;
    grades_weights = grades_weights === void 0 ? [ 0, 0, 5, 10, 15, 20 ] : grades_weights;
    preserve_grades_weights = preserve_grades_weights === void 0 ? false : preserve_grades_weights;
    why = why === void 0 ? false : why;
    var grades, cell, line_id, data_col, compiled_formulas, result, why_this, line;
    grades = {};
    ՐՏitr90 = ՐՏ_Iterable(cells);
    for (ՐՏidx90 = 0; ՐՏidx90 < ՐՏitr90.length; ՐՏidx90++) {
        cell = ՐՏitr90[ՐՏidx90];
        line_id = cell[1];
        data_col = cell[2];
        if (!(ՐՏ_in(line_id, grades))) {
            grades[line_id] = {};
        }
        if (!(ՐՏ_in(data_col, grades[line_id]))) {
            grades[line_id][data_col] = [];
        }
        grades[line_id][data_col].extend(cell[0].split(" "));
    }
    compiled_formulas = aggregate_formulas_compile(formulas);
    result = {};
    why_this = {};
    ՐՏitr91 = ՐՏ_Iterable(grades);
    for (ՐՏidx91 = 0; ՐՏidx91 < ՐՏitr91.length; ՐՏidx91++) {
        line = ՐՏitr91[ՐՏidx91];
        result[line] = merge_comps(grades[line], weights, compiled_formulas, grades_weights, preserve_grades_weights);
    }
    if (why) {
        return [result, why_this];
    }
    return result;
}, Object.defineProperty(ՐՏ_91, "__doc__", {
    value: "aggregate all observations of same competences in a list of cells"
}), ՐՏ_91);
var CatalogItem = (ՐՏ_92 = function CatalogItem() {
    CatalogItem.prototype.__init__.apply(this, arguments);
}, (function(){
    var ue_refined = false;
    Object.defineProperties(ՐՏ_92.prototype, {
        __doc__: {
            enumerable: true, 
            writable: true, 
            value: 'The item is transfered to the browser as a simple list and not an object\nin order to useless space.\n\nThe list elements are :\n    0) str: Title\n    1) str: Children list as "b0:2 b1 b2 b3"\n            :2 indicates an optional weight for the aggregation\n    2) str: Used by formation a list of regexp : "INF MAT"\n    3) str: Must be used by UEs : "INF1010L:3 INF1011L INF1012L..."\n            :3 indicates an optional weight for the aggregation\n    4) dict: how to aggregate {vocabulary: {aggregation definition}}\n    5) list: The possible observation of the competence\n             ["Non évaluée (NE)","Non acquis (0/20)",...]'
        },
        ue_refined: {
            enumerable: true, 
            writable: true, 
            value: ue_refined
        },
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(word, data){
                var self = this;
                self.word = word;
                self.data = data;
            }

        },
        update: {
            enumerable: true, 
            writable: true, 
            value: function update(){
                var ՐՏupk37, ՐՏupk38, ՐՏupk39;
                var self = this;
                var _, ue;
                self.title = self.data[0];
                ՐՏupk37 = comp_analyse_list(self.data[1]);
                self._children = ՐՏupk37[0];
                self._children_weights = ՐՏupk37[1];
                ՐՏupk38 = comp_analyse_list(self.data[2]);
                self._formation = ՐՏupk38[0];
                _ = ՐՏupk38[1];
                ՐՏupk39 = comp_analyse_list(self.data[3]);
                ue = ՐՏupk39[0];
                self._ue_weights = ՐՏupk39[1];
                self.set_ue(ue);
                self._formation_re = len(self._formation) && "^(" + "|".join(self._formation) + ")" || "";
                if (self.data[4] === "") {
                    self._aggregate = [];
                } else {
                    self._aggregate = parseJSON(self.data[4]);
                }
                self._observations = self.data[5];
                if (self._observations === "") {
                    self._observations = null;
                }
            }

        },
        children: {
            enumerable: true, 
            writable: true, 
            value: function children(){
                var self = this;
                return self._children;
            }

        },
        ue_list: {
            enumerable: true, 
            writable: true, 
            value: function ue_list(){
                var self = this;
                return self._ue;
            }

        },
        aggregate: {
            enumerable: true, 
            writable: true, 
            value: function aggregate(){
                var self = this;
                return self._aggregate;
            }

        },
        children_weights: {
            enumerable: true, 
            writable: true, 
            value: function children_weights(){
                var ՐՏitr92, ՐՏidx92, ՐՏitr93, ՐՏidx93;
                var self = this;
                var weights, child;
                weights = {};
                ՐՏitr92 = ՐՏ_Iterable(self._children_weights);
                for (ՐՏidx92 = 0; ՐՏidx92 < ՐՏitr92.length; ՐՏidx92++) {
                    child = ՐՏitr92[ՐՏidx92];
                    weights[child] = self._children_weights[child];
                }
                ՐՏitr93 = ՐՏ_Iterable(self.children());
                for (ՐՏidx93 = 0; ՐՏidx93 < ՐՏitr93.length; ՐՏidx93++) {
                    child = ՐՏitr93[ՐՏidx93];
                    if (!(ՐՏ_in(child, weights))) {
                        weights[child] = 1;
                    }
                }
                return weights;
            }

        },
        set_children_weights: {
            enumerable: true, 
            writable: true, 
            value: function set_children_weights(weights){
                var self = this;
                self._children_weights = weights;
            }

        },
        set_child_weight: {
            enumerable: true, 
            writable: true, 
            value: function set_child_weight(word, weight){
                var self = this;
                if (ՐՏ_in(word, self.children())) {
                    self._children_weights[word] = weight;
                }
            }

        },
        ue_weights: {
            enumerable: true, 
            writable: true, 
            value: function ue_weights(){
                var self = this;
                return self._ue_weights;
            }

        },
        formation_match: {
            enumerable: true, 
            writable: true, 
            value: function formation_match(formation){
                var self = this;
                if (self._formation_re) {
                    return regexp_match(self._formation_re, formation);
                }
            }

        },
        ue_match: {
            enumerable: true, 
            writable: true, 
            value: function ue_match(ue){
                var self = this;
                if (self._ue_re) {
                    return regexp_match(self._ue_re, ue);
                }
            }

        },
        set_ue: {
            enumerable: true, 
            writable: true, 
            value: function set_ue(the_ue){
                var self = this;
                self._ue = the_ue;
                self._ue_re = len(self._ue) && "^(" + "|".join(self._ue) + ")" || "";
            }

        },
        observations: {
            enumerable: true, 
            writable: true, 
            value: function observations(){
                var self = this;
                return self._observations;
            }

        },
        observations_redefined: {
            enumerable: true, 
            writable: true, 
            value: function observations_redefined(){
                var ՐՏ_93, ՐՏ_94;
                var self = this;
                return self._observations && ((ՐՏ_93 = self._observations) !== (ՐՏ_94 = self.data[5]) && (typeof ՐՏ_93 !== "object" || !ՐՏ_eq(ՐՏ_93, ՐՏ_94)));
            }

        },
        set_observations: {
            enumerable: true, 
            writable: true, 
            value: function set_observations(observations){
                var self = this;
                self._observations = observations;
            }

        },
        set_aggregate: {
            enumerable: true, 
            writable: true, 
            value: function set_aggregate(aggregate){
                var self = this;
                self._aggregate = aggregate;
            }

        },
        add_child: {
            enumerable: true, 
            writable: true, 
            value: function add_child(word){
                var ՐՏupk40;
                var self = this;
                var weight;
                if (ՐՏ_in(":", word)) {
                    ՐՏupk40 = word.split(":");
                    word = ՐՏupk40[0];
                    weight = ՐՏupk40[1];
                    self._children_weights[word] = parseFloat(weight);
                }
                if (!(ՐՏ_in(word, self._children))) {
                    self._children.append(word);
                }
            }

        },
        remove_child: {
            enumerable: true, 
            writable: true, 
            value: function remove_child(word){
                var ՐՏitr94, ՐՏidx94;
                var self = this;
                var children, child;
                if (ՐՏ_in(word, self.children())) {
                    children = [];
                    ՐՏitr94 = ՐՏ_Iterable(self.children());
                    for (ՐՏidx94 = 0; ՐՏidx94 < ՐՏitr94.length; ՐՏidx94++) {
                        child = ՐՏitr94[ՐՏidx94];
                        if ((child !== word && (typeof child !== "object" || !ՐՏ_eq(child, word)))) {
                            children.append(child);
                        }
                    }
                    self._children = children;
                }
                if (ՐՏ_in(word, self.children_weights())) {
                    delete self._children_weights[word];
                }
            }

        },
        add_ue: {
            enumerable: true, 
            writable: true, 
            value: function add_ue(ue){
                var self = this;
                var comp_ue, ue_list;
                if (ՐՏ_in("-", ue)) {
                    comp_ue = ue.split("-")[1];
                } else {
                    comp_ue = ue;
                }
                ue_list = self._ue;
                if (!(ՐՏ_in(comp_ue, self._ue))) {
                    ue_list.append(comp_ue);
                }
                self.set_ue(ue_list);
            }

        },
        remove_ue: {
            enumerable: true, 
            writable: true, 
            value: function remove_ue(ue){
                var ՐՏitr95, ՐՏidx95;
                var self = this;
                var comp_ue, ue_list, elem;
                if (ՐՏ_in("-", ue)) {
                    comp_ue = ue.split("-")[1];
                } else {
                    comp_ue = ue;
                }
                if (ՐՏ_in(comp_ue, self.ue_list())) {
                    ue_list = [];
                    ՐՏitr95 = ՐՏ_Iterable(self.ue_list());
                    for (ՐՏidx95 = 0; ՐՏidx95 < ՐՏitr95.length; ՐՏidx95++) {
                        elem = ՐՏitr95[ՐՏidx95];
                        if ((elem !== comp_ue && (typeof elem !== "object" || !ՐՏ_eq(elem, comp_ue)))) {
                            ue_list.append(elem);
                        }
                    }
                    self.set_ue(ue_list);
                }
            }

        },
        set_ue_weights: {
            enumerable: true, 
            writable: true, 
            value: function set_ue_weights(weights){
                var self = this;
                self._ue_weights = weights;
            }

        },
        update_ue_weight: {
            enumerable: true, 
            writable: true, 
            value: function update_ue_weight(data_col, weight){
                var self = this;
                self._ue_weights[data_col] = weight;
            }

        }
    });
    return ՐՏ_92;
})(), ՐՏ_92);
var Catalog = (ՐՏ_95 = function Catalog() {
    Catalog.prototype.__init__.apply(this, arguments);
}, (function(){
    Object.defineProperties(ՐՏ_95.prototype, {
        __doc__: {
            enumerable: true, 
            writable: true, 
            value: "vocabulary_name : dictionnary{chr: str}\nerrors          : list[str]\nitems           : dictionnary{str: CatalogItem}\n                  The key is a Word"
        },
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(){
                var self = this;
                self.vocabulary_name = {};
                self.errors = [];
                self.items = {};
            }

        },
        parse_lines: {
            enumerable: true, 
            writable: true, 
            value: function parse_lines(lines){
                var ՐՏitr96, ՐՏidx96, ՐՏitr97, ՐՏidx97, ՐՏ_96, ՐՏ_97, ՐՏ_98, ՐՏ_99, ՐՏitr99, ՐՏidx99;
                var self = this;
                var line, key, description, word, i, words, parent, parent_item, data, observations;
                if (len(self.items) === 0) {
                    self.items = {
                        "": new CatalogItem("", [ "", "", "", "", "", "", "" ])
                    };
                }
                lines.sort();
                ՐՏitr96 = ՐՏ_Iterable(lines);
                for (ՐՏidx96 = 0; ՐՏidx96 < ՐՏitr96.length; ՐՏidx96++) {
                    line = ՐՏitr96[ՐՏidx96];
                    key = str(line[0]).strip();
                    description = str(line[1]).strip();
                    if (len(key) === 0 && len(description) === 0) {
                    } else if (len(key) <= 1 || len(description) === 0) {
                        self.errors.append(_("ALERT_comp_unvalid_line") + key + " \t " + description);
                    } else if (key.startswith("^")) {
                        self.errors.append(key + " is deprecated");
                    } else if (key.startswith(":")) {
                        self.errors.append(key + " is deprecated");
                    } else if (key.startswith("#")) {
                        self.update_vocabulary(key[1], description);
                    } else {
                        ՐՏitr97 = ՐՏ_Iterable(key_split(key));
                        for (ՐՏidx97 = 0; ՐՏidx97 < ՐՏitr97.length; ՐՏidx97++) {
                            word = ՐՏitr97[ՐՏidx97];
                            if (word[1] === null) {
                                self.errors.append(_("ALERT_comp_unvalid_line") + key + " \t " + description);
                            }
                        }
                        if (len(line) < 7) {
                            line = (function() {
                                var ՐՏidx98, ՐՏitr98 = ՐՏ_Iterable(line), ՐՏres = [], i;
                                for (ՐՏidx98 = 0; ՐՏidx98 < ՐՏitr98.length; ՐՏidx98++) {
                                    i = ՐՏitr98[ՐՏidx98];
                                    ՐՏres.push(i);
                                }
                                return ՐՏres;
                            })();
                            line.extend([ "", "", "", "", "", "" ]);
                        }
                        words = key_words(key);
                        word = words[words.length-1];
                        if (len(words) === 1) {
                            parent = "";
                        } else {
                            parent = words[words.length-2];
                        }
                        if (ՐՏ_in(word, self.items)) {
                            parent_item = self.items[parent];
                            if (ՐՏ_in(word, parent_item.data[1].split(" "))) {
                                self.errors.append(_("ALERT_item_define_two_time") + parent_item.word + word);
                                ՐՏ_print("Warning - " + _("ALERT_item_define_two_time") + parent_item.word + word);
                                continue;
                            }
                            data = self.items[word].data;
                            if (data[0] === "" && line[1] !== "") {
                                self.items[word].data[0] = line[1];
                            }
                            for (i = 2; i < 5; i++) {
                                if (data[i] === "" && line[i - 1] !== "") {
                                    self.items[word].data[i] = line[i];
                                }
                            }
                            if (((ՐՏ_96 = data[0]) !== (ՐՏ_97 = line[1]) && (typeof ՐՏ_96 !== "object" || !ՐՏ_eq(ՐՏ_96, ՐՏ_97))) || ((ՐՏ_98 = data.slice(2)) !== (ՐՏ_99 = line.slice(2, 6)) && (typeof ՐՏ_98 !== "object" || !ՐՏ_eq(ՐՏ_98, ՐՏ_99)))) {
                                self.errors.append(_("ALERT_comp_unvalid_line") + ":" + str(data) + " != " + str(line));
                            }
                        } else {
                            observations = line[5];
                            if (observations !== "") {
                                try {
                                    observations = parseJSON(observations);
                                } catch (ՐՏ_Exception) {
                                    self.errors.append(_("ALERT_comp_unvalid_line") + key + " \t " + line[5]);
                                }
                            }
                            self.items[word] = new CatalogItem(word, [ line[1], "", line[2], line[3], line[4], observations ]);
                        }
                        if (ՐՏ_in(parent, self.items)) {
                            if (line[6] && line[6] !== 1) {
                                word += ":" + str(line[6]);
                            }
                            if (self.items[parent].data[1]) {
                                self.items[parent].data[1] += " " + word;
                            } else {
                                self.items[parent].data[1] += word;
                            }
                        } else {
                            self.errors.append("Bug: no parent for " + line[0]);
                            ՐՏ_print("****************", "Bug: no parent for " + line[0]);
                        }
                    }
                }
                ՐՏitr99 = ՐՏ_Iterable(self.items);
                for (ՐՏidx99 = 0; ՐՏidx99 < ՐՏitr99.length; ՐՏidx99++) {
                    word = ՐՏitr99[ՐՏidx99];
                    self.items[word].update();
                }
                self.errors.sort();
                self.create_vocabulary();
                return true;
            }

        },
        create_vocabulary: {
            enumerable: true, 
            writable: true, 
            value: function create_vocabulary(){
                var ՐՏitr100, ՐՏidx100;
                var self = this;
                var vocabulary, word, voc, titles, index;
                self.vocabulary = vocabulary = {};
                ՐՏitr100 = ՐՏ_Iterable(self.items);
                for (ՐՏidx100 = 0; ՐՏidx100 < ՐՏitr100.length; ՐՏidx100++) {
                    word = ՐՏitr100[ՐՏidx100];
                    if (word === "") {
                        continue;
                    }
                    voc = word[0];
                    if (!(ՐՏ_in(voc, vocabulary))) {
                        vocabulary[voc] = titles = [];
                    } else {
                        titles = vocabulary[voc];
                    }
                    index = parseInt(word.slice(1));
                    while (len(titles) <= index) {
                        titles.append("");
                    }
                    vocabulary[voc][index] = self.items[word].title;
                }
            }

        },
        parse_dict: {
            enumerable: true, 
            writable: true, 
            value: function parse_dict(dict){
                var ՐՏitr101, ՐՏidx101;
                var self = this;
                var items, word;
                self.vocabulary_name = dict["vocabulary_name"];
                self.errors = dict["errors"];
                self.items = {};
                items = dict["items"];
                ՐՏitr101 = ՐՏ_Iterable(items);
                for (ՐՏidx101 = 0; ՐՏidx101 < ՐՏitr101.length; ՐՏidx101++) {
                    word = ՐՏitr101[ՐՏidx101];
                    self.items[word] = new CatalogItem(word, items[word]);
                    self.items[word].update();
                }
                self.create_vocabulary();
            }

        },
        parse_json: {
            enumerable: true, 
            writable: true, 
            value: function parse_json(json){
                var self = this;
                self.parse_dict(parseJSON(json));
                return true;
            }

        },
        complete_with_refine: {
            enumerable: true, 
            writable: true, 
            value: function complete_with_refine(refine, ue){
                var ՐՏitr102, ՐՏidx102, ՐՏitr103, ՐՏidx103;
                var self = this;
                var word, infos, title, item, child;
                ՐՏitr102 = ՐՏ_Iterable(refine);
                for (ՐՏidx102 = 0; ՐՏidx102 < ՐՏitr102.length; ՐՏidx102++) {
                    word = ՐՏitr102[ՐՏidx102];
                    infos = refine[word];
                    if (!infos) {
                        continue;
                    }
                    if (ՐՏ_in("title", infos)) {
                        title = infos["title"];
                    } else {
                        title = "?";
                    }
                    if (word.isdigit()) {
                        word = "+" + word;
                        self.items[word] = item = new CatalogItem(word, [ title, "", "", "", "", "" ]);
                        self.items[word].update();
                    } else {
                        if (ՐՏ_in(word, self.items)) {
                            item = self.items[word];
                            item.add_ue(ue);
                            item._ue_re = ".*";
                            item.ue_refined = true;
                        } else {
                            self.items[word] = item = new CatalogItem(word, [ title, "", "", "", "", "" ]);
                            self.items[word].update();
                        }
                    }
                    if (ՐՏ_in("column_weights", infos)) {
                        item.set_ue_weights(infos["column_weights"]);
                    }
                    if (infos["aggregate_content"]) {
                        item.set_children_weights(infos["aggregate_content"]);
                    }
                    item.set_aggregate(infos["aggregate_self"]);
                    if (infos["observations"]) {
                        item.set_observations(infos["observations"]);
                    }
                    if (infos["content"]) {
                        ՐՏitr103 = ՐՏ_Iterable(infos["content"]);
                        for (ՐՏidx103 = 0; ՐՏidx103 < ՐՏitr103.length; ՐՏidx103++) {
                            child = ՐՏitr103[ՐՏidx103];
                            item.add_child("+" + str(child));
                        }
                    }
                }
            }

        },
        update_vocabulary: {
            enumerable: true, 
            writable: true, 
            value: function update_vocabulary(voc_key, description){
                var self = this;
                if (len(voc_key) !== 1 || !is_letter(voc_key) || len(description) === 0) {
                    return ERR_INVALID;
                }
                if (ՐՏ_in(voc_key, self.vocabulary_name)) {
                    self.vocabulary_name[voc_key] = description;
                    return 0;
                }
                self.vocabulary_name[voc_key] = description;
                return 1;
            }

        },
        walk: {
            enumerable: true, 
            writable: true, 
            value: function walk(item, hook, path){
                var ՐՏitr104, ՐՏidx104;
                var self = this;
                path = path === void 0 ? "" : path;
                var child;
                path += item.word;
                if (hook(item, path)) {
                    return;
                }
                ՐՏitr104 = ՐՏ_Iterable(item.children());
                for (ՐՏidx104 = 0; ՐՏidx104 < ՐՏitr104.length; ՐՏidx104++) {
                    child = ՐՏitr104[ՐՏidx104];
                    self.walk(self.items[child], hook, path);
                }
            }

        },
        walk_path: {
            enumerable: true, 
            writable: true, 
            value: function walk_path(path, hook){
                var ՐՏitr105, ՐՏidx105;
                var self = this;
                var item, word;
                item = self.items[""];
                hook(item);
                ՐՏitr105 = ՐՏ_Iterable(key_words(path));
                for (ՐՏidx105 = 0; ՐՏidx105 < ՐՏitr105.length; ՐՏidx105++) {
                    word = ՐՏitr105[ՐՏidx105];
                    if (!(ՐՏ_in(word, item.children()))) {
                        return false;
                    }
                    item = self.items[word];
                    hook(item);
                }
                return item;
            }

        },
        get_aggregate: {
            enumerable: true, 
            writable: true, 
            value: function get_aggregate(path){
                var self = this;
                var aggregation, weights_ue, leaf, vocabulary;
                aggregation = {};
                weights_ue = {};
                function hook(item) {
                    var ՐՏitr106, ՐՏidx106, ՐՏitr107, ՐՏidx107;
                    var tmp, vocabulary, ue;
                    tmp = item.aggregate();
                    ՐՏitr106 = ՐՏ_Iterable(tmp);
                    for (ՐՏidx106 = 0; ՐՏidx106 < ՐՏitr106.length; ՐՏidx106++) {
                        vocabulary = ՐՏitr106[ՐՏidx106];
                        aggregation[vocabulary] = tmp[vocabulary];
                    }
                    tmp = item.ue_weights();
                    ՐՏitr107 = ՐՏ_Iterable(tmp);
                    for (ՐՏidx107 = 0; ՐՏidx107 < ՐՏitr107.length; ՐՏidx107++) {
                        ue = ՐՏitr107[ՐՏidx107];
                        weights_ue[ue] = tmp[ue];
                    }
                }
                leaf = self.walk_path(path, hook);
                if (leaf) {
                    vocabulary = leaf.word[0];
                    if (ՐՏ_in(vocabulary, aggregation)) {
                        return {
                            "aggregation": aggregation[vocabulary],
                            "weights_ue": weights_ue,
                            "weights_children": leaf.children_weights(),
                            "item": leaf
                        };
                    }
                    return null;
                }
                return false;
            }

        },
        get_formation_vocabs: {
            enumerable: true, 
            writable: true, 
            value: function get_formation_vocabs(form_key){
                var self = this;
                var key, keys;
                key = form_key[0] + str(form_key[1]);
                if (!(ՐՏ_in(key, self.items))) {
                    return 0;
                }
                keys = [];
                function hook(_item, path) {
                    keys.append(path);
                }
                self.walk(self.items[key], hook);
                return keys;
            }

        },
        get_key: {
            enumerable: true, 
            writable: true, 
            value: function get_key(key){
                var ՐՏupk41;
                var self = this;
                var voc_key, desc_index;
                return (function() {
                    var ՐՏidx108, ՐՏitr108 = ՐՏ_Iterable(key_split(key)), ՐՏres = [], voc_key, desc_index;
                    for (ՐՏidx108 = 0; ՐՏidx108 < ՐՏitr108.length; ՐՏidx108++) {
                        ՐՏupk41 = ՐՏitr108[ՐՏidx108];
                        voc_key = ՐՏupk41[0];
                        desc_index = ՐՏupk41[1];
                        ՐՏres.push([ voc_key, desc_index, self.vocabulary[voc_key][desc_index] ]);
                    }
                    return ՐՏres;
                })();
            }

        },
        get_parents: {
            enumerable: true, 
            writable: true, 
            value: function get_parents(key){
                var ՐՏ_100;
                var self = this;
                var last_word, word;
                if (len(key) === 0) {
                    return [];
                }
                last_word = (ՐՏ_100 = key_words(key))[ՐՏ_100.length-1];
                return (function() {
                    var ՐՏidx109, ՐՏitr109 = ՐՏ_Iterable(self.items), ՐՏres = [], word;
                    for (ՐՏidx109 = 0; ՐՏidx109 < ՐՏitr109.length; ՐՏidx109++) {
                        word = ՐՏitr109[ՐՏidx109];
                        if (ՐՏ_in(last_word, self.items[word].children())) {
                            ՐՏres.push(word);
                        }
                    }
                    return ՐՏres;
                })();
            }

        },
        get_allowed_keys: {
            enumerable: true, 
            writable: true, 
            value: function get_allowed_keys(comp_ue){
                var self = this;
                var result, observations;
                result = {};
                observations = [ "o0", "o1", "o2", "o3", "o4", "o5" ];
                function hook_all(_item, path) {
                    result[path] = observations;
                }
                function hook(item, path) {
                    if (item.formation_match(comp_ue)) {
                        self.walk(item, hook_all, path.slice(0, -len(item.word)));
                        return true;
                    }
                }
                self.walk(self.items[""], hook);
                return result;
            }

        },
        get_allowed_keys_ue: {
            enumerable: true, 
            writable: true, 
            value: function get_allowed_keys_ue(comp_ue){
                var self = this;
                var result, observations;
                result = {};
                observations = [ "o0", "o1", "o2", "o3", "o4", "o5" ];
                function hook_all(_item, path) {
                    result[path] = observations;
                }
                function hook(item, path) {
                    if (ՐՏ_in(comp_ue, item.data[3])) {
                        self.walk(item, hook_all, path.slice(0, -len(item.word)));
                        return true;
                    }
                }
                self.walk(self.items[""], hook);
                return result;
            }

        },
        get_allowed_words_ue: {
            enumerable: true, 
            writable: true, 
            value: function get_allowed_words_ue(comp_ue){
                var self = this;
                var result, observations;
                result = {};
                observations = [ "o0", "o1", "o2", "o3", "o4", "o5" ];
                function hook_all(item, _path) {
                    result[item.word] = observations;
                }
                function hook(item, path) {
                    if (item.ue_match(comp_ue)) {
                        self.walk(item, hook_all, path.slice(0, -len(item.word)));
                        return true;
                    }
                }
                self.walk(self.items[""], hook);
                return result;
            }

        },
        get_allowed_keys_observations: {
            enumerable: true, 
            writable: true, 
            value: function get_allowed_keys_observations(key){
                var self = this;
                var first_path, observations;
                first_path = [ null ];
                function hook_search_key(item, path) {
                    var ՐՏ_101;
                    if (first_path[0]) {
                        return true;
                    }
                    if (((ՐՏ_101 = item.word) === key || typeof ՐՏ_101 === "object" && ՐՏ_eq(ՐՏ_101, key))) {
                        first_path[0] = path;
                        return true;
                    }
                }
                self.walk(self.items[""], hook_search_key);
                observations = [ ["NE (NE)", "No (0/20)", "Bad (5/20)", "Ok (10/20)", "Good (15/20)", 
                "Perfect (20/20)"] ];
                function hook(item) {
                    if (item.observations()) {
                        observations[0] = item.observations();
                    }
                }
                if (first_path[0]) {
                    self.walk_path(first_path[0], hook);
                }
                return observations[0];
            }

        },
        index_rate: {
            enumerable: true, 
            writable: true, 
            value: function index_rate(choices, rating){
                var ՐՏitr110, ՐՏidx110;
                var self = this;
                var best, index, choice, voc_index, ch_rating, distance;
                best = 1;
                index = 0;
                ՐՏitr110 = ՐՏ_Iterable(choices);
                for (ՐՏidx110 = 0; ՐՏidx110 < ՐՏitr110.length; ՐՏidx110++) {
                    choice = ՐՏitr110[ՐՏidx110];
                    voc_index = key_last_word(choice)[1];
                    ch_rating = extract_rating(self.vocabulary["o"][voc_index]);
                    distance = abs(ch_rating - rating);
                    if (distance <= best) {
                        index = voc_index;
                        best = distance;
                    }
                }
                return index;
            }

        },
        get_completion: {
            enumerable: true, 
            writable: true, 
            value: function get_completion(voc_key, description){
                var ՐՏupk42;
                var self = this;
                var i, vocabulary, response_list;
                if (!(ՐՏ_in(voc_key, self.vocabulary))) {
                    return [];
                }
                response_list = (function() {
                    var ՐՏidx111, ՐՏitr111 = ՐՏ_Iterable(enumerate(self.vocabulary[voc_key])), ՐՏres = [], i, vocabulary;
                    for (ՐՏidx111 = 0; ՐՏidx111 < ՐՏitr111.length; ՐՏidx111++) {
                        ՐՏupk42 = ՐՏitr111[ՐՏidx111];
                        i = ՐՏupk42[0];
                        vocabulary = ՐՏupk42[1];
                        ՐՏres.push([ 1e4 + string_distance(description, vocabulary), i, vocabulary ]);
                    }
                    return ՐՏres;
                })();
                response_list.sort();
                return response_list;
            }

        },
        aggregate_ue: {
            enumerable: true, 
            writable: true, 
            value: function aggregate_ue(ue_grades, path, why){
                var ՐՏitr112, ՐՏidx112, ՐՏupk43;
                var self = this;
                why = why === void 0 ? false : why;
                var key, grades_why, aggr_datas, grades, ue, grade_list, grade, save_in_why, weight, formulas, result;
                key = key_last_word(path);
                key = key[0] + str(key[1]);
                grades_why = [ null ];
                aggr_datas = self.get_aggregate(path);
                grades = [];
                ՐՏitr112 = ՐՏ_Iterable(ue_grades);
                for (ՐՏidx112 = 0; ՐՏidx112 < ՐՏitr112.length; ՐՏidx112++) {
                    ue = ՐՏitr112[ՐՏidx112];
                    grade_list = ue_grades[ue];
                    grade = 0;
                    save_in_why = false;
                    if (ՐՏ_in(key, grade_list) && grade_list[key] !== 99) {
                        grade = grade_list[key];
                        save_in_why = true;
                    }
                    weight = 1;
                    if (aggr_datas && ՐՏ_in(ue, aggr_datas["weights_ue"])) {
                        weight = aggr_datas["weights_ue"][ue];
                    }
                    grades.append([ key, weight, grade ]);
                    if (save_in_why) {
                        grades_why.append([ grade, ue, weight ]);
                    }
                }
                formulas = [ "* Average = * Min ." ];
                if (aggr_datas) {
                    formulas = aggr_datas["aggregation"];
                }
                if (why) {
                    ՐՏupk43 = aggregate_compute_why(grades, aggregate_formulas_compile(formulas));
                    result = ՐՏupk43[0];
                    grades_why[0] = ՐՏupk43[1];
                    return [result, grades_why];
                }
                return aggregate_compute(grades, aggregate_formulas_compile(formulas));
            }

        },
        aggregate_comp: {
            enumerable: true, 
            writable: true, 
            value: function aggregate_comp(children_grades, path, why){
                var ՐՏitr113, ՐՏidx113;
                var self = this;
                why = why === void 0 ? false : why;
                var key, aggr_datas, weights, grades, child, weight, formulas;
                key = key_last_word(path);
                key = key[0] + str(key[1]);
                aggr_datas = self.get_aggregate(path);
                weights = self.items[key].children_weights();
                grades = [];
                ՐՏitr113 = ՐՏ_Iterable(children_grades);
                for (ՐՏidx113 = 0; ՐՏidx113 < ՐՏitr113.length; ՐՏidx113++) {
                    child = ՐՏitr113[ՐՏidx113];
                    weight = weights[child];
                    grades.append([ child, weight, children_grades[child] ]);
                }
                formulas = [ "* Average = * Min ." ];
                if (aggr_datas) {
                    formulas = aggr_datas["aggregation"];
                }
                if (why) {
                    return aggregate_compute_why(grades, aggregate_formulas_compile(formulas));
                }
                return aggregate_compute(grades, aggregate_formulas_compile(formulas));
            }

        },
        aggregate_parent_of: {
            enumerable: true, 
            writable: true, 
            value: function aggregate_parent_of(comp_grades, threshold, why){
                var ՐՏitr114, ՐՏidx114, ՐՏitr115, ՐՏidx115, ՐՏitr116, ՐՏidx116, ՐՏitr117, ՐՏidx117, ՐՏupk44;
                var self = this;
                why = why === void 0 ? false : why;
                var parents, comp, parent, result, result_why, children, children_grades, child, grade, aggr_why;
                parents = [];
                ՐՏitr114 = ՐՏ_Iterable(comp_grades);
                for (ՐՏidx114 = 0; ՐՏidx114 < ՐՏitr114.length; ՐՏidx114++) {
                    comp = ՐՏitr114[ՐՏidx114];
                    ՐՏitr115 = ՐՏ_Iterable(self.get_parents(comp));
                    for (ՐՏidx115 = 0; ՐՏidx115 < ՐՏitr115.length; ՐՏidx115++) {
                        parent = ՐՏitr115[ՐՏidx115];
                        if (!(ՐՏ_in(parent, parents))) {
                            parents.append(parent);
                        }
                    }
                }
                result = {};
                result_why = {};
                ՐՏitr116 = ՐՏ_Iterable(parents);
                for (ՐՏidx116 = 0; ՐՏidx116 < ՐՏitr116.length; ՐՏidx116++) {
                    parent = ՐՏitr116[ՐՏidx116];
                    children = self.items[parent].children();
                    children_grades = {};
                    ՐՏitr117 = ՐՏ_Iterable(children);
                    for (ՐՏidx117 = 0; ՐՏidx117 < ՐՏitr117.length; ՐՏidx117++) {
                        child = ՐՏitr117[ՐՏidx117];
                        if (ՐՏ_in(child, comp_grades) && comp_grades[child] !== 0 && comp_grades[child] !== 99) {
                            children_grades[child] = comp_grades[child];
                        }
                    }
                    if (len(children_grades) / len(children) >= threshold) {
                        ՐՏupk44 = self.aggregate_comp(children_grades, parent, true);
                        grade = ՐՏupk44[0];
                        aggr_why = ՐՏupk44[1];
                        result[parent] = grade;
                        result_why[parent] = aggr_why;
                    }
                }
                if (why) {
                    return [result, result_why];
                }
                return result;
            }

        },
        get_tree: {
            enumerable: true, 
            writable: true, 
            value: function get_tree(comp){
                var self = this;
                comp = comp === void 0 ? "" : comp;
                var children, i, child, tree;
                children = self.items[comp].children();
                i = len(children) - 1;
                while (i >= 0) {
                    if (!(ՐՏ_in(children[i], self.items))) {
                        delete children[i];
                    }
                    --i;
                }
                if (len(children) === 0) {
                    return [ comp ];
                }
                tree = (function() {
                    var ՐՏidx118, ՐՏitr118 = ՐՏ_Iterable(children), ՐՏres = [], child;
                    for (ՐՏidx118 = 0; ՐՏidx118 < ՐՏitr118.length; ՐՏidx118++) {
                        child = ՐՏitr118[ՐՏidx118];
                        ՐՏres.push(self.get_tree(child));
                    }
                    return ՐՏres;
                })();
                if (comp !== "") {
                    tree.insert(0, comp);
                }
                return tree;
            }

        },
        rate_tree: {
            enumerable: true, 
            writable: true, 
            value: function rate_tree(root, ue_grades, path){
                var ՐՏupk45, ՐՏitr119, ՐՏidx119, ՐՏitr120, ՐՏidx120, ՐՏupk46, ՐՏupk47, ՐՏitr121, ՐՏidx121, ՐՏitr122, ՐՏidx122, ՐՏitr123, ՐՏidx123;
                var self = this;
                path = path === void 0 ? "" : path;
                var key, tree, grade, grade_why, children_grades, branches, branch, graded_branch, final_tree, rate, formula_why, children_weights, child, weight, children_nbr, precision;
                key = "";
                tree = root;
                if (isStr(tree[0])) {
                    key = tree[0];
                    tree = tree.slice(1);
                }
                if (len(tree) === 0) {
                    ՐՏupk45 = kwargs(self.aggregate_ue).call(self, ue_grades, path + key, {why: true});
                    grade = ՐՏupk45[0];
                    grade_why = ՐՏupk45[1];
                    if (grade === 99) {
                        grade = 0;
                    }
                    return {
                        "key": key,
                        "rate": grade,
                        "precision": 1,
                        "why": grade_why,
                        "children": []
                    };
                }
                children_grades = {};
                branches = [];
                ՐՏitr119 = ՐՏ_Iterable(tree);
                for (ՐՏidx119 = 0; ՐՏidx119 < ՐՏitr119.length; ՐՏidx119++) {
                    branch = ՐՏitr119[ՐՏidx119];
                    graded_branch = self.rate_tree(branch, ue_grades, path + key);
                    branches.append(graded_branch);
                    children_grades[graded_branch["key"]] = graded_branch["rate"];
                }
                final_tree = {
                    "key": key,
                    "rate": 0,
                    "precision": 1,
                    "why": [ null ],
                    "children": []
                };
                if (key === "") {
                    ՐՏitr120 = ՐՏ_Iterable(branches);
                    for (ՐՏidx120 = 0; ՐՏidx120 < ՐՏitr120.length; ՐՏidx120++) {
                        branch = ՐՏitr120[ՐՏidx120];
                        if (branch["rate"] !== 0) {
                            final_tree["children"].append(branch);
                        }
                    }
                } else {
                    ՐՏupk46 = kwargs(self.aggregate_comp).call(self, children_grades, path + key, {why: true});
                    rate = ՐՏupk46[0];
                    formula_why = ՐՏupk46[1];
                    ՐՏupk47 = [ rate, [ formula_why ] ];
                    final_tree["rate"] = ՐՏupk47[0];
                    final_tree["why"] = ՐՏupk47[1];
                    if (final_tree["rate"] === 99) {
                        final_tree["rate"] = 0;
                    }
                    ՐՏitr121 = ՐՏ_Iterable(branches);
                    for (ՐՏidx121 = 0; ՐՏidx121 < ՐՏitr121.length; ՐՏidx121++) {
                        branch = ՐՏitr121[ՐՏidx121];
                        final_tree["children"].append(branch);
                    }
                    children_weights = self.items[key].children_weights();
                    ՐՏitr122 = ՐՏ_Iterable(final_tree["children"]);
                    for (ՐՏidx122 = 0; ՐՏidx122 < ՐՏitr122.length; ՐՏidx122++) {
                        child = ՐՏitr122[ՐՏidx122];
                        weight = children_weights[child["key"]];
                        child["weight"] = weight;
                    }
                }
                children_nbr = len(final_tree["children"]);
                if (children_nbr > 0 && final_tree["rate"] > 0) {
                    precision = 0;
                    ՐՏitr123 = ՐՏ_Iterable(final_tree["children"]);
                    for (ՐՏidx123 = 0; ՐՏidx123 < ՐՏitr123.length; ՐՏidx123++) {
                        child = ՐՏitr123[ՐՏidx123];
                        if (child["rate"] !== 0) {
                            precision += child["precision"];
                        }
                    }
                    final_tree["precision"] = precision / children_nbr;
                }
                return final_tree;
            }

        },
        build_root_with_grades: {
            enumerable: true, 
            writable: true, 
            value: function build_root_with_grades(ue_grades){
                var ՐՏitr124, ՐՏidx124;
                var self = this;
                var tree, i, child, curr_formation, ue;
                tree = self.rate_tree(self.get_tree(), ue_grades);
                i = len(tree["children"]) - 1;
                while (i >= 0) {
                    child = tree["children"][i];
                    curr_formation = false;
                    ՐՏitr124 = ՐՏ_Iterable(ue_grades);
                    for (ՐՏidx124 = 0; ՐՏidx124 < ՐՏitr124.length; ՐՏidx124++) {
                        ue = ՐՏitr124[ՐՏidx124];
                        if (self.items[child["key"]].formation_match(ue_code(ue))) {
                            curr_formation = true;
                        }
                    }
                    if (!curr_formation) {
                        delete tree["children"][i];
                    }
                    --i;
                }
                return tree;
            }

        },
        get_json: {
            enumerable: true, 
            writable: true, 
            value: function get_json(){
                var ՐՏitr125, ՐՏidx125;
                var self = this;
                var items, word;
                items = {};
                ՐՏitr125 = ՐՏ_Iterable(self.items);
                for (ՐՏidx125 = 0; ՐՏidx125 < ՐՏitr125.length; ՐՏidx125++) {
                    word = ՐՏitr125[ՐՏidx125];
                    items[word] = self.items[word].data;
                }
                return dumpJSON({
                    "vocabulary_name": self.vocabulary_name,
                    "errors": self.errors,
                    "items": items
                });
            }

        },
        __str__: {
            enumerable: true, 
            writable: true, 
            value: function __str__(){
                var self = this;
                return self.get_json();
            }

        },
        shallow_copy: {
            enumerable: true, 
            writable: true, 
            value: function shallow_copy(){
                var self = this;
                var catalog;
                catalog = new Catalog();
                catalog.items = dict(self.items);
                catalog.errors = self.errors;
                catalog.vocabulary_name = self.vocabulary_name;
                return catalog;
            }

        },
        copy: {
            enumerable: true, 
            writable: true, 
            value: function copy(){
                var ՐՏitr126, ՐՏidx126;
                var self = this;
                var catalog, items, key, item;
                catalog = new Catalog();
                items = {};
                ՐՏitr126 = ՐՏ_Iterable(self.items);
                for (ՐՏidx126 = 0; ՐՏidx126 < ՐՏitr126.length; ՐՏidx126++) {
                    key = ՐՏitr126[ՐՏidx126];
                    item = self.items[key];
                    items[key] = new CatalogItem(item.word, item.data);
                    items[key].update();
                }
                catalog.items = items;
                catalog.errors = self.errors;
                catalog.vocabulary_name = self.vocabulary_name;
                return catalog;
            }

        }
    });
    return ՐՏ_95;
})(), ՐՏ_95);
"\n2000000000 is here because JavaScript sort strings\n";
var compute_all_ranks = (ՐՏ_102 = function compute_all_ranks(column, lines) {
    var ՐՏitr127, ՐՏidx127, ՐՏitr128, ՐՏidx128;
    var data_col, cells, lin_id, line, value, float_value, i, ranks;
    data_col = column.data_col;
    cells = [];
    ՐՏitr127 = ՐՏ_Iterable(lines);
    for (ՐՏidx127 = 0; ՐՏidx127 < ՐՏitr127.length; ՐՏidx127++) {
        lin_id = ՐՏitr127[ՐՏidx127];
        if (lines[lin_id]) {
            line = lines[lin_id];
        } else {
            line = lin_id;
        }
        value = line[data_col].get_value(column);
        if (value === "") {
            continue;
        }
        float_value = to_float_or_nan(value);
        if (isNaN(float_value)) {
            continue;
        }
        cells.append(2e9 + float_value);
    }
    cells.sort();
    i = len(cells);
    ranks = {};
    ՐՏitr128 = ՐՏ_Iterable(cells);
    for (ՐՏidx128 = 0; ՐՏidx128 < ՐՏitr128.length; ՐՏidx128++) {
        value = ՐՏitr128[ՐՏidx128];
        ranks[value] = i;
        --i;
    }
    return ranks;
}, Object.defineProperty(ՐՏ_102, "__doc__", {
    value: "Compute the reverse sorted list of cells FLOAT values"
}), ՐՏ_102);
var compute_rank = (ՐՏ_103 = function compute_rank(data_col, line, _username) {
    var column, the_lines, floats, value;
    column = columns[data_col];
    if (len(column.average_columns) !== 1) {
        return "";
    }
    column = columns[column.average_columns[0]];
    try {
        the_lines = lines;
    } catch (ՐՏ_Exception) {
        the_lines = column.table.lines;
    }
    floats = getattr(column, "floats", null);
    if (!floats) {
        floats = column.floats = {};
    }
    if (!(ՐՏ_in("ranks", floats))) {
        floats["ranks"] = compute_all_ranks(column, the_lines);
    }
    value = line[column.data_col].get_value(column);
    if (value === "") {
        return "";
    }
    value = to_float_or_nan(value);
    if (isNaN(value)) {
        return "";
    }
    return floats["ranks"][2e9 + value];
}, Object.defineProperty(ՐՏ_103, "__doc__", {
    value: "Use 'floats' the same way than Note.stat()"
}), ՐՏ_103);
function aggregate_formulas_compile(formulas) {
    var ՐՏitr129, ՐՏidx129, ՐՏupk48;
    var compiled, formula, selector, evaluator, comparator, value, direction, result;
    compiled = [];
    ՐՏitr129 = ՐՏ_Iterable(formulas);
    for (ՐՏidx129 = 0; ՐՏidx129 < ՐՏitr129.length; ՐՏidx129++) {
        formula = ՐՏitr129[ՐՏidx129];
        ՐՏupk48 = formula.split(" ");
        selector = ՐՏupk48[0];
        evaluator = ՐՏupk48[1];
        comparator = ՐՏupk48[2];
        value = ՐՏupk48[3];
        direction = ՐՏupk48[4];
        result = ՐՏupk48[5];
        if (value.isdigit()) {
            value = parseInt(value);
        }
        if (result.isdigit()) {
            result = parseInt(result);
        }
        evaluator = AGGREGATE_EVALUATORS[evaluator];
        compiled.append([selector, evaluator, comparator, value, direction, result]);
    }
    return compiled;
}
function aggregate_formula_decompile(compiled) {
    var ՐՏupk49, ՐՏitr130, ՐՏidx130, ՐՏ_104;
    var selector, evaluator, comparator, value, direction, result, fct_name;
    ՐՏupk49 = compiled;
    selector = ՐՏupk49[0];
    evaluator = ՐՏupk49[1];
    comparator = ՐՏupk49[2];
    value = ՐՏupk49[3];
    direction = ՐՏupk49[4];
    result = ՐՏupk49[5];
    ՐՏitr130 = ՐՏ_Iterable(AGGREGATE_EVALUATORS);
    for (ՐՏidx130 = 0; ՐՏidx130 < ՐՏitr130.length; ՐՏidx130++) {
        fct_name = ՐՏitr130[ՐՏidx130];
        if (((ՐՏ_104 = AGGREGATE_EVALUATORS[fct_name]) === evaluator || typeof ՐՏ_104 === "object" && ՐՏ_eq(ՐՏ_104, evaluator))) {
            evaluator = fct_name;
            break;
        }
    }
    return [ selector, evaluator, comparator, str(value), direction, str(result) ];
}
function formula_use_weights(formula) {
    return formula !== ". Observed = * Max ." && formula !== ". Observed = * Min .";
}
function aggregate_bins(items) {
    var ՐՏitr131, ՐՏidx131;
    var bins, item;
    bins = [ [], [], [], [], [], [] ];
    ՐՏitr131 = ՐՏ_Iterable(items);
    for (ՐՏidx131 = 0; ՐՏidx131 < ՐՏitr131.length; ՐՏidx131++) {
        item = ՐՏitr131[ՐՏidx131];
        bins[rint(item[2])].append(item);
    }
    return bins;
}
function aggregate_average(items) {
    var ՐՏitr132, ՐՏidx132, ՐՏupk50;
    var sum_obs, sum_weight, _competence, weight, observation;
    sum_obs = 0;
    sum_weight = 0;
    ՐՏitr132 = ՐՏ_Iterable(items);
    for (ՐՏidx132 = 0; ՐՏidx132 < ՐՏitr132.length; ՐՏidx132++) {
        ՐՏupk50 = ՐՏitr132[ՐՏidx132];
        _competence = ՐՏupk50[0];
        weight = ՐՏupk50[1];
        observation = ՐՏupk50[2];
        if (observation === 0) {
            continue;
        }
        sum_obs += weight * observation;
        sum_weight += weight;
    }
    if (sum_weight) {
        return [ sum_obs / sum_weight ];
    }
    return [];
}
function aggregate_most_frequent(items) {
    var ՐՏitr133, ՐՏidx133, ՐՏupk51, ՐՏitr134, ՐՏidx134, ՐՏupk52, ՐՏ_105;
    var bins, maximum, i, result;
    bins = aggregate_bins(items);
    maximum = -1;
    ՐՏitr133 = ՐՏ_Iterable(enumerate(bins));
    for (ՐՏidx133 = 0; ՐՏidx133 < ՐՏitr133.length; ՐՏidx133++) {
        ՐՏupk51 = ՐՏitr133[ՐՏidx133];
        i = ՐՏupk51[0];
        items = ՐՏupk51[1];
        if (len(items) > maximum) {
            maximum = len(items);
        }
    }
    result = [];
    ՐՏitr134 = ՐՏ_Iterable(enumerate(bins));
    for (ՐՏidx134 = 0; ՐՏidx134 < ՐՏitr134.length; ՐՏidx134++) {
        ՐՏupk52 = ՐՏitr134[ՐՏidx134];
        i = ՐՏupk52[0];
        items = ՐՏupk52[1];
        if (((ՐՏ_105 = len(items)) === maximum || typeof ՐՏ_105 === "object" && ՐՏ_eq(ՐՏ_105, maximum))) {
            result.append(i);
        }
    }
    return result;
}
function aggregate_uniq_most_frequent(items) {
    var result;
    result = aggregate_most_frequent(items);
    if (len(result) === 1) {
        return result;
    }
    return [];
}
function aggregate_observed(items) {
    var ՐՏitr135, ՐՏidx135, ՐՏupk53;
    var result, _competence, _weight, observation;
    result = [];
    ՐՏitr135 = ՐՏ_Iterable(items);
    for (ՐՏidx135 = 0; ՐՏidx135 < ՐՏitr135.length; ՐՏidx135++) {
        ՐՏupk53 = ՐՏitr135[ՐՏidx135];
        _competence = ՐՏupk53[0];
        _weight = ՐՏupk53[1];
        observation = ՐՏupk53[2];
        if (!(ՐՏ_in(observation, result))) {
            result.append(observation);
        }
    }
    return result;
}
function aggregate_observed_n(items, n) {
    var ՐՏitr136, ՐՏidx136, ՐՏupk54;
    var bins, result, i;
    bins = aggregate_bins(items);
    result = [];
    ՐՏitr136 = ՐՏ_Iterable(enumerate(bins));
    for (ՐՏidx136 = 0; ՐՏidx136 < ՐՏitr136.length; ՐՏidx136++) {
        ՐՏupk54 = ՐՏitr136[ՐՏidx136];
        i = ՐՏupk54[0];
        items = ՐՏupk54[1];
        if (len(items) >= n) {
            result.append(i);
        }
    }
    return result;
}
function aggregate_observed2(items) {
    return aggregate_observed_n(items, 2);
}
function aggregate_observed3(items) {
    return aggregate_observed_n(items, 3);
}
function aggregate_observed4(items) {
    return aggregate_observed_n(items, 4);
}
function aggregate_observed5(items) {
    return aggregate_observed_n(items, 5);
}
function aggregate_observed6(items) {
    return aggregate_observed_n(items, 6);
}
function aggregate_observed7(items) {
    return aggregate_observed_n(items, 7);
}
function aggregate_observed8(items) {
    return aggregate_observed_n(items, 8);
}
function aggregate_observed9(items) {
    return aggregate_observed_n(items, 9);
}
function aggregate_median(items) {
    var item, middle;
    items = (function() {
        var ՐՏidx137, ՐՏitr137 = ՐՏ_Iterable(items), ՐՏres = [], item;
        for (ՐՏidx137 = 0; ՐՏidx137 < ՐՏitr137.length; ՐՏidx137++) {
            item = ՐՏitr137[ՐՏidx137];
            if (item[2]) {
                ՐՏres.push(item[2]);
            }
        }
        return ՐՏres;
    })();
    items.sort();
    middle = Math.floor(len(items) / 2);
    if (len(items) % 2) {
        return [ items[middle] ];
    }
    return [ (items[middle] + items[middle - 1]) / 2 ];
}
function aggregate_more_frequent_than_betters(items) {
    var bins, result, nr_occurrences_betters, i;
    bins = aggregate_bins(items);
    result = [];
    nr_occurrences_betters = 0;
    i = 5;
    while (i >= 0) {
        if (len(bins[i]) > nr_occurrences_betters) {
            result.append(i);
        }
        nr_occurrences_betters += len(bins[i]);
        --i;
    }
    return result;
}
function evaluator_with_ne_is_na(function_ϟ, items) {
    var ՐՏitr138, ՐՏidx138, ՐՏupk55;
    var graded, _competence, weight, observation;
    graded = [];
    ՐՏitr138 = ՐՏ_Iterable(items);
    for (ՐՏidx138 = 0; ՐՏidx138 < ՐՏitr138.length; ՐՏidx138++) {
        ՐՏupk55 = ՐՏitr138[ՐՏidx138];
        _competence = ՐՏupk55[0];
        weight = ՐՏupk55[1];
        observation = ՐՏupk55[2];
        graded.append([ _competence, weight, max(observation, 1) ]);
    }
    return function_ϟ(graded);
}
function aggregate_average_ne_na(items) {
    return evaluator_with_ne_is_na(aggregate_average, items);
}
function aggregate_median_ne_na(items) {
    return evaluator_with_ne_is_na(aggregate_median, items);
}
AGGREGATE_EVALUATORS = {
    "Average": aggregate_average,
    "AverageNeNa": aggregate_average_ne_na,
    "MostFrequent": aggregate_most_frequent,
    "UniqMostFrequent": aggregate_uniq_most_frequent,
    "Observed": aggregate_observed,
    "Observed2": aggregate_observed2,
    "Observed3": aggregate_observed3,
    "Observed4": aggregate_observed4,
    "Observed5": aggregate_observed5,
    "Observed6": aggregate_observed6,
    "Observed7": aggregate_observed7,
    "Observed8": aggregate_observed8,
    "Observed9": aggregate_observed9,
    "Median": aggregate_median,
    "MedianNeNa": aggregate_median_ne_na,
    "MoreFrequentThanBetters": aggregate_more_frequent_than_betters
};
var Aggregator = (ՐՏ_106 = function Aggregator() {
    Aggregator.prototype.__init__.apply(this, arguments);
}, (function(){
    var minimum = -1;
    var minimum_from = null;
    var maximum = 99;
    var maximum_from = null;
    var comparator = value = direction = result = null;
    Object.defineProperties(ՐՏ_106.prototype, {
        minimum: {
            enumerable: true, 
            writable: true, 
            value: minimum
        },
        minimum_from: {
            enumerable: true, 
            writable: true, 
            value: minimum_from
        },
        maximum: {
            enumerable: true, 
            writable: true, 
            value: maximum
        },
        maximum_from: {
            enumerable: true, 
            writable: true, 
            value: maximum_from
        },
        comparator: {
            enumerable: true, 
            writable: true, 
            value: comparator
        },
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(items, formulas){
                var ՐՏitr139, ՐՏidx139, ՐՏupk56, ՐՏitr140, ՐՏidx140, ՐՏitr141, ՐՏidx141, ՐՏitr142, ՐՏidx142;
                var self = this;
                var selector, evaluator, bins, i, item, is_undefined;
                ՐՏitr139 = ՐՏ_Iterable(formulas);
                for (ՐՏidx139 = 0; ՐՏidx139 < ՐՏitr139.length; ՐՏidx139++) {
                    self.formula = ՐՏitr139[ՐՏidx139];
                    ՐՏupk56 = self.formula;
                    selector = ՐՏupk56[0];
                    evaluator = ՐՏupk56[1];
                    self.comparator = ՐՏupk56[2];
                    self.value = ՐՏupk56[3];
                    self.direction = ՐՏupk56[4];
                    self.result = ՐՏupk56[5];
                    if (selector === "*") {
                        self.add(evaluator(items));
                    } else if (selector === ".") {
                        bins = aggregate_bins(items);
                        ՐՏitr140 = ՐՏ_Iterable(bins);
                        for (ՐՏidx140 = 0; ՐՏidx140 < ՐՏitr140.length; ՐՏidx140++) {
                            i = ՐՏitr140[ՐՏidx140];
                            if (len(i)) {
                                self.add(evaluator(i));
                            }
                        }
                    } else {
                        ՐՏitr141 = ՐՏ_Iterable(items);
                        for (ՐՏidx141 = 0; ՐՏidx141 < ՐՏitr141.length; ՐՏidx141++) {
                            item = ՐՏitr141[ՐՏidx141];
                            self.add(evaluator([ item ]));
                        }
                    }
                }
                is_undefined = true;
                ՐՏitr142 = ՐՏ_Iterable(items);
                for (ՐՏidx142 = 0; ՐՏidx142 < ՐՏitr142.length; ՐՏidx142++) {
                    item = ՐՏitr142[ՐՏidx142];
                    if (item[2] !== 0) {
                        is_undefined = false;
                        break;
                    }
                }
                if (is_undefined) {
                    self.maximum = 0;
                }
            }

        },
        add: {
            enumerable: true, 
            writable: true, 
            value: function add(observations){
                var ՐՏitr143, ՐՏidx143;
                var self = this;
                var observation;
                ՐՏitr143 = ՐՏ_Iterable(observations);
                for (ՐՏidx143 = 0; ՐՏidx143 < ՐՏitr143.length; ՐՏidx143++) {
                    observation = ՐՏitr143[ՐՏidx143];
                    self.add_one(observation);
                }
            }

        },
        add_one: {
            enumerable: true, 
            writable: true, 
            value: function add_one(observation){
                var ՐՏ_107, ՐՏ_108;
                var self = this;
                var result;
                if (self.value !== "*") {
                    if (self.comparator === "=") {
                        if (((ՐՏ_107 = rint(observation)) !== (ՐՏ_108 = self.value) && (typeof ՐՏ_107 !== "object" || !ՐՏ_eq(ՐՏ_107, ՐՏ_108)))) {
                            return;
                        }
                    } else if (self.comparator === "≤") {
                        if (observation > self.value) {
                            return;
                        }
                    } else if (self.comparator === "≥") {
                        if (observation < self.value) {
                            return;
                        }
                    }
                }
                result = self.result;
                if (result === "..") {
                    result = observation;
                } else if (result === ".") {
                    if (observation === 0) {
                        return;
                    }
                    result = observation;
                }
                if (self.direction === "Min") {
                    if (result > self.minimum) {
                        self.minimum = result;
                        self.minimum_from = self.formula;
                    }
                } else {
                    if (result < self.maximum) {
                        self.maximum = result;
                        self.maximum_from = self.formula;
                    }
                }
            }

        },
        get_result: {
            enumerable: true, 
            writable: true, 
            value: function get_result(){
                var ՐՏ_109, ՐՏ_110;
                var self = this;
                if (((ՐՏ_109 = self.minimum) !== (ՐՏ_110 = -1) && (typeof ՐՏ_109 !== "object" || !ՐՏ_eq(ՐՏ_109, ՐՏ_110)))) {
                    if (self.minimum <= self.maximum) {
                        return self.minimum;
                    }
                    return self.maximum;
                }
                return self.maximum;
            }

        },
        get_why: {
            enumerable: true, 
            writable: true, 
            value: function get_why(){
                var ՐՏ_111, ՐՏ_112;
                var self = this;
                if (((ՐՏ_111 = self.minimum) !== (ՐՏ_112 = -1) && (typeof ՐՏ_111 !== "object" || !ՐՏ_eq(ՐՏ_111, ՐՏ_112)))) {
                    if (self.minimum <= self.maximum) {
                        return self.minimum_from;
                    }
                    return self.maximum_from;
                }
                return self.maximum_from;
            }

        }
    });
    return ՐՏ_106;
})(), ՐՏ_106);
function aggregate_compute(items, formulas) {
    if (len(items) === 0) {
        return 99;
    }
    return new Aggregator(items, formulas).get_result();
}
function aggregate_compute_why(items, formulas) {
    var ՐՏupk57;
    var result, computed, why;
    result = new Aggregator(items, formulas);
    ՐՏupk57 = [ result.get_result(), result.get_why() ];
    computed = ՐՏupk57[0];
    why = ՐՏupk57[1];
    if (why) {
        why = aggregate_formula_decompile(why);
    }
    return [computed, why];
}
function formula_explain(formula, grade_names, obs, evals_name) {
    var ՐՏupk58, ՐՏ_113, ՐՏ_114, ՐՏ_115;
    obs = obs === void 0 ? null : obs;
    evals_name = evals_name === void 0 ? "TITLE_competences" : evals_name;
    var sel, ev, compar, val, direc, res, is_equal, text, in_all_comps, among_evals, grade, better_grades;
    ՐՏupk58 = formula;
    sel = ՐՏupk58[0];
    ev = ՐՏupk58[1];
    compar = ՐՏupk58[2];
    val = ՐՏupk58[3];
    direc = ՐՏupk58[4];
    res = ՐՏupk58[5];
    is_equal = null;
    if (val !== "*" && (obs !== (ՐՏ_113 = null) && (typeof obs !== "object" || !ՐՏ_eq(obs, ՐՏ_113)))) {
        is_equal = ((ՐՏ_114 = parseInt(val)) === (ՐՏ_115 = parseInt(obs)) || typeof ՐՏ_114 === "object" && ՐՏ_eq(ՐՏ_114, ՐՏ_115));
    }
    text = "";
    in_all_comps = ՐՏ_in(sel, [ "*", "." ]);
    if (!in_all_comps) {
        text += _("comp_expl_for") + "«" + sel + "» ";
    }
    if (direc === "Min") {
        text += _("comp_expl_you_have");
    } else {
        text += _("comp_expl_is_capped");
    }
    if (ՐՏ_in(res, [ ".", ".." ])) {
        if (obs) {
            text += "«" + grade_names[parseInt(obs)] + "» ";
        } else {
            text += _("comp_expl_this_grade") + " ";
        }
    } else {
        text += "«" + grade_names[parseInt(res)] + "» ";
    }
    among_evals = "";
    if (in_all_comps) {
        if (ՐՏ_in(ev, [ "Average", "AverageNeNa", "Median", "MedianNeNa" ])) {
            among_evals += _("comp_expl_from_multiple");
        } else {
            among_evals += _("comp_expl_among");
        }
        among_evals += _(evals_name).lower() + _("comp_expl_following");
    }
    text += _("comp_expl_because");
    if ("".join(formula) === ".Observed=*Max.") {
        text += _("comp_expl_smallest_value") + among_evals;
    } else if ("".join(formula) === ".Observed=*Min.") {
        text += _("comp_expl_greatest_value") + among_evals;
    } else if (ev === "MoreFrequentThanBetters" && compar === "=" && val !== "*") {
        grade = parseInt(val);
        text += _("comp_expl_there_is_more") + "«" + grade_names[grade] + "»" + _("comp_expl_than");
        better_grades = [];
        if (grade === 1) {
            text += _("comp_expl_all_other_results");
        } else {
            text += _("comp_expl_from");
            while (grade < 5) {
                ++grade;
                better_grades.append("«" + grade_names[grade] + "»");
            }
            if (len(better_grades) > 1) {
                better_grades[better_grades.length-2] = better_grades[better_grades.length-2] + _("comp_expl_and") + better_grades[better_grades.length-1];
                better_grades = better_grades.slice(0, -1);
            }
            text += ", ".join(better_grades);
        }
        text += _("comp_expl_reunited") + among_evals;
    } else {
        text += _("comp_expl_" + ev) + among_evals;
        if (ՐՏ_in(ev, [ "Observed2", "Observed3" ])) {
            text += _("comp_expl_are");
        } else {
            text += _("comp_expl_is");
        }
        if (!is_equal && (compar === "<" || compar === "≤")) {
            text += _("comp_expl_lower");
        } else if (!is_equal && (compar === ">" || compar === "≥")) {
            text += _("comp_expl_greater");
        }
        if (val === "*") {
            if (obs) {
                text += "«" + grade_names[parseInt(obs)] + "» ";
            } else {
                text += _("comp_expl_this_grade");
            }
        } else {
            text += "«" + grade_names[parseInt(val)] + "»";
        }
    }
    return capitalize(text) + " :";
}
"\nDo not take minmax into account.\nEmpty string → NaN\nAny string not a number is 0.\n";
function compute_addition(data_col, line, _username) {
    var ՐՏitr144, ՐՏidx144;
    var column, addition, data_column, origin, value;
    column = columns[data_col];
    addition = 0;
    ՐՏitr144 = ՐՏ_Iterable(column.average_columns);
    for (ՐՏidx144 = 0; ՐՏidx144 < ՐՏitr144.length; ՐՏidx144++) {
        data_column = ՐՏitr144[ՐՏidx144];
        origin = columns[data_column];
        if (origin.visibility === 5 && python_mode) {
            value = origin.empty_is;
        } else {
            value = line[data_column].get_value(origin);
        }
        if (str(value) === "") {
            return nan;
        }
        value = to_float_or_nan(value);
        if (isNaN(value)) {
            continue;
        }
        addition += value;
    }
    return addition;
}
function get_parsed_date(date) {
    var ՐՏupk59;
    var group, start_hour, end_hour, when, delta, start_timestamp, end_timestamp;
    if (ՐՏ_in(":", date)) {
        ՐՏupk59 = date.split(":");
        group = ՐՏupk59[0];
        date = ՐՏupk59[1];
    } else {
        group = "";
    }
    if (date.endswith("M") || date.endswith("m")) {
        date = date.slice(0, -1);
        start_hour = "00";
        end_hour = "13";
        when = "M";
        delta = 13 * 3600 * 1e3;
    } else if (date.endswith("A") || date.endswith("a")) {
        date = date.slice(0, -1);
        start_hour = "14";
        end_hour = "24";
        when = "A";
        delta = 12 * 3600 * 1e3;
    } else {
        start_hour = "00";
        end_hour = "24";
        when = "";
        delta = 24 * 3600 * 1e3;
    }
    if (ՐՏ_in("/", date)) {
        date = date.split("/");
        if (len(date) === 2) {
            date = seconds_to_date().slice(0, 4) + two_digits(parseInt(date[0])) + two_digits(parseInt(date[1]));
        } else {
            if (len(date[2]) === 2) {
                date[2] = "20" + date[2];
            } else if (len(date[2]) !== 4) {
                date[2] = seconds_to_date().slice(0, 4);
            }
            date = date[2] + two_digits(parseInt(date[1])) + two_digits(parseInt(date[0]));
        }
    } else if (len(date) < 3 && date.isdigit()) {
        date = seconds_to_date().slice(0, 6) + two_digits(parseInt(date[0]));
    } else if (len(date) !== 8 || !date.isdigit()) {
        date = seconds_to_date().slice(0, 8);
    }
    start_timestamp = get_date_tomuss(date + start_hour).getTime();
    end_timestamp = start_timestamp + delta;
    return [group, date + start_hour, date + end_hour, start_timestamp, end_timestamp, 
    when];
}
var CourseDates = (ՐՏ_116 = function CourseDates() {
    CourseDates.prototype.__init__.apply(this, arguments);
}, (function(){
    Object.defineProperties(ՐՏ_116.prototype, {
        __init__: {
            enumerable: true, 
            writable: true, 
            value: function __init__(dates){
                var ՐՏitr145, ՐՏidx145;
                var self = this;
                var date;
                self.text_dates = dates;
                self.grp_dates = {};
                self.nogrp_dates = [];
                if (dates) {
                    ՐՏitr145 = ՐՏ_Iterable(dates.split(" "));
                    for (ՐՏidx145 = 0; ՐՏidx145 < ՐՏitr145.length; ՐՏidx145++) {
                        date = ՐՏitr145[ՐՏidx145];
                        if (!date) {
                            continue;
                        }
                        date = get_parsed_date(date);
                        if (date[0]) {
                            self.grp_dates[date[0]] = date;
                        } else {
                            self.nogrp_dates.append(date);
                        }
                    }
                }
            }

        },
        get_group_date: {
            enumerable: true, 
            writable: true, 
            value: function get_group_date(group){
                var self = this;
                if (!(ՐՏ_in(group, self.grp_dates))) {
                    if (len(self.nogrp_dates)) {
                        return self.nogrp_dates[0];
                    }
                    return null;
                }
                return self.grp_dates[group];
            }

        },
        course_after_date: {
            enumerable: true, 
            writable: true, 
            value: function course_after_date(start_date, student_group){
                var self = this;
                var date;
                date = self.get_group_date(student_group);
                if (!date) {
                    return false;
                }
                start_date = get_parsed_date(start_date)[1];
                return start_date <= date[1] || start_date <= date[2];
            }

        },
        course_overlap_millisec: {
            enumerable: true, 
            writable: true, 
            value: function course_overlap_millisec(start_timestamp, end_timestamp, student_group){
                var self = this;
                var date;
                date = self.get_group_date(student_group);
                if (!date) {
                    return false;
                }
                return start_timestamp < date[4] && end_timestamp > date[3];
            }

        },
        all_dates: {
            enumerable: true, 
            writable: true, 
            value: function all_dates(){
                var ՐՏitr146, ՐՏidx146, ՐՏitr147, ՐՏidx147;
                var self = this;
                var dates, group, date;
                dates = [];
                ՐՏitr146 = ՐՏ_Iterable(self.grp_dates);
                for (ՐՏidx146 = 0; ՐՏidx146 < ՐՏitr146.length; ՐՏidx146++) {
                    group = ՐՏitr146[ՐՏidx146];
                    dates.append(self.grp_dates[group]);
                }
                ՐՏitr147 = ՐՏ_Iterable(self.nogrp_dates);
                for (ՐՏidx147 = 0; ՐՏidx147 < ՐՏitr147.length; ՐՏidx147++) {
                    date = ՐՏitr147[ՐՏidx147];
                    dates.append(date);
                }
                return dates;
            }

        },
        format_dates: {
            enumerable: true, 
            writable: true, 
            value: function format_dates(){
                var ՐՏitr148, ՐՏidx148, ՐՏupk60;
                var self = this;
                var dates, group, date, _, when;
                dates = [];
                ՐՏitr148 = ՐՏ_Iterable(self.all_dates());
                for (ՐՏidx148 = 0; ՐՏidx148 < ՐՏitr148.length; ՐՏidx148++) {
                    ՐՏupk60 = ՐՏitr148[ՐՏidx148];
                    group = ՐՏupk60[0];
                    date = ՐՏupk60[1];
                    _ = ՐՏupk60[2];
                    _ = ՐՏupk60[3];
                    _ = ՐՏupk60[4];
                    when = ՐՏupk60[5];
                    date = date.slice(6, 8) + "/" + date.slice(4, 6) + "/" + date.slice(0, 4) + when;
                    if (group) {
                        date = group + ":" + date;
                    }
                    dates.append(date);
                }
                return " ".join(dates);
            }

        },
        storage_format: {
            enumerable: true, 
            writable: true, 
            value: function storage_format(){
                var ՐՏitr149, ՐՏidx149, ՐՏupk61;
                var self = this;
                var dates, group, date, _, when;
                dates = [];
                ՐՏitr149 = ՐՏ_Iterable(self.all_dates());
                for (ՐՏidx149 = 0; ՐՏidx149 < ՐՏitr149.length; ՐՏidx149++) {
                    ՐՏupk61 = ՐՏitr149[ՐՏidx149];
                    group = ՐՏupk61[0];
                    date = ՐՏupk61[1];
                    _ = ՐՏupk61[2];
                    _ = ՐՏupk61[3];
                    _ = ՐՏupk61[4];
                    when = ՐՏupk61[5];
                    if (group) {
                        dates.append(group + ":" + date.slice(0, 8) + when);
                    } else {
                        dates.append(date.slice(0, 8) + when);
                    }
                }
                return " ".join(dates);
            }

        },
        clean_dates: {
            enumerable: true, 
            writable: true, 
            value: function clean_dates(){
                var self = this;
                var i;
                return (function() {
                    var ՐՏidx150, ՐՏitr150 = ՐՏ_Iterable(self.all_dates()), ՐՏres = [], i;
                    for (ՐՏidx150 = 0; ՐՏidx150 < ՐՏitr150.length; ՐՏidx150++) {
                        i = ՐՏitr150[ՐՏidx150];
                        ՐՏres.push(i[1]);
                    }
                    return ՐՏres;
                })();
            }

        }
    });
    return ՐՏ_116;
})(), ՐՏ_116);
var quantiles = (ՐՏ_117 = function quantiles(notes, nb_quantiles) {
    var i, note, resultat;
    if (len(notes) === 0) {
        return (function() {
            var ՐՏidx151, ՐՏitr151 = ՐՏ_Iterable(range(nb_quantiles)), ՐՏres = [], i;
            for (ՐՏidx151 = 0; ՐՏidx151 < ՐՏitr151.length; ՐՏidx151++) {
                i = ՐՏitr151[ՐՏidx151];
                ՐՏres.push(20 * i / (nb_quantiles - 1));
            }
            return ՐՏres;
        })();
    }
    notes = (function() {
        var ՐՏidx152, ՐՏitr152 = ՐՏ_Iterable(notes), ՐՏres = [], note;
        for (ՐՏidx152 = 0; ՐՏidx152 < ՐՏitr152.length; ՐՏidx152++) {
            note = ՐՏitr152[ՐՏidx152];
            ՐՏres.push(note / 100);
        }
        return ՐՏres;
    })();
    notes.sort();
    resultat = (function() {
        var ՐՏidx153, ՐՏitr153 = ՐՏ_Iterable(range(nb_quantiles)), ՐՏres = [], i;
        for (ՐՏidx153 = 0; ՐՏidx153 < ՐՏitr153.length; ՐՏidx153++) {
            i = ՐՏitr153[ՐՏidx153];
            ՐՏres.push(notes[Math.floor(i * len(notes) / nb_quantiles)] * 100);
        }
        return ՐՏres;
    })();
    resultat.append(notes[notes.length-1] * 100);
    return resultat;
}, Object.defineProperty(ՐՏ_117, "__doc__", {
    value: "Extrait les quantiles.\n/100 et *100 pour que le sort javascript fonctionne."
}), ՐՏ_117);
var loi_normale_unitaire = (ՐՏ_118 = function loi_normale_unitaire(i) {
    return Math.pow(2.718281828459045, (-i * i / 2)) / Math.pow((2 * 3.141592653589793), .5);
}, Object.defineProperty(ՐՏ_118, "__doc__", {
    value: "Densité probabilité de moyenne 0 et écart-type 1"
}), ՐՏ_118);
var loi_normale = (ՐՏ_119 = function loi_normale(i, moyenne, ecarttype) {
    return loi_normale_unitaire((i - moyenne) / ecarttype) / ecarttype;
}, Object.defineProperty(ՐՏ_119, "__doc__", {
    value: "Densité probabilité de moyenne m et écart-type e"
}), ՐՏ_119);
var notes_normales = (ՐՏ_120 = function notes_normales(moyenne, ecarttype, note_min, note_max, precision_note, nr_echantillons) {
    note_min = note_min === void 0 ? 0 : note_min;
    note_max = note_max === void 0 ? 20 : note_max;
    precision_note = precision_note === void 0 ? .01 : precision_note;
    nr_echantillons = nr_echantillons === void 0 ? 500 : nr_echantillons;
    var notes, note, _;
    notes = [];
    note = note_min;
    while (note <= note_max) {
        for (_ = 0; _ < parseInt(nr_echantillons * loi_normale(note, moyenne, ecarttype)); _++) {
            notes.append(note);
        }
        note += precision_note;
    }
    return notes;
}, Object.defineProperty(ՐՏ_120, "__doc__", {
    value: "Simule une liste de notes suivant la loi normale"
}), ՐՏ_120);
var qtruncnorm = (ՐՏ_121 = function qtruncnorm(moyenne, ecarttype, note_min, note_max, nb_quantiles) {
    return quantiles(notes_normales(moyenne, ecarttype, note_min, note_max), nb_quantiles);
}, Object.defineProperty(ՐՏ_121, "__doc__", {
    value: "Calcule les quantiles d'une loi normal tronquée"
}), ՐՏ_121);
var calcule_harmonise = (ՐՏ_122 = function calcule_harmonise(notes1_abi, notes2_abi, seuil, moyenne, ecarttype, nbquantiles, nbquantilesnormaux, remonte_a_20) {
    var ՐՏitr154, ՐՏidx154, ՐՏupk62, ՐՏupk63, ՐՏupk64, ՐՏ_123;
    seuil = seuil === void 0 ? 7 : seuil;
    moyenne = moyenne === void 0 ? 11 : moyenne;
    ecarttype = ecarttype === void 0 ? 2 : ecarttype;
    nbquantiles = nbquantiles === void 0 ? 6 : nbquantiles;
    nbquantilesnormaux = nbquantilesnormaux === void 0 ? 4 : nbquantilesnormaux;
    remonte_a_20 = remonte_a_20 === void 0 ? 1 : remonte_a_20;
    var notes1, notes2, note1, note2, note_mineure, notes_mineure, origine, but, note_pass, first, last, normale, orig, dest, traduction;
    notes1 = [];
    notes2 = [];
    ՐՏitr154 = ՐՏ_Iterable(zip(notes1_abi, notes2_abi));
    for (ՐՏidx154 = 0; ՐՏidx154 < ՐՏitr154.length; ՐՏidx154++) {
        ՐՏupk62 = ՐՏitr154[ՐՏidx154];
        note1 = ՐՏupk62[0];
        note2 = ՐՏupk62[1];
        if (note1 === "" || note2 === "") {
            continue;
        }
        note1 = to_float_or_nan(note1);
        note2 = to_float_or_nan(note2);
        if (isNaN(note1) || isNaN(note2)) {
            continue;
        }
        notes1.append(note1);
        notes2.append(note2);
    }
    if (nbquantilesnormaux > nbquantiles) {
        nbquantilesnormaux = nbquantiles;
    }
    notes_mineure = (function() {
        var ՐՏidx155, ՐՏitr155 = ՐՏ_Iterable(notes1), ՐՏres = [], note_mineure;
        for (ՐՏidx155 = 0; ՐՏidx155 < ՐՏitr155.length; ՐՏidx155++) {
            note_mineure = ՐՏitr155[ՐՏidx155];
            if (note_mineure > seuil) {
                ՐՏres.push(note_mineure);
            }
        }
        return ՐՏres;
    })();
    origine = quantiles(notes_mineure, nbquantiles);
    origine[0] = seuil;
    origine[origine.length-1] = origine[origine.length-1] * remonte_a_20 + 20 * (1 - remonte_a_20);
    if ((nbquantiles === nbquantilesnormaux || typeof nbquantiles === "object" && ՐՏ_eq(nbquantiles, nbquantilesnormaux))) {
        but = qtruncnorm(moyenne, ecarttype, seuil, 20, nbquantiles);
    } else {
        but = quantiles((function() {
            var ՐՏidx156, ՐՏitr156 = ՐՏ_Iterable(zip(notes2, notes1)), ՐՏres = [], note_pass, note_mineure;
            for (ՐՏidx156 = 0; ՐՏidx156 < ՐՏitr156.length; ՐՏidx156++) {
                ՐՏupk63 = ՐՏitr156[ՐՏidx156];
                note_pass = ՐՏupk63[0];
                note_mineure = ՐՏupk63[1];
                if (note_mineure > seuil) {
                    ՐՏres.push(note_pass);
                }
            }
            return ՐՏres;
        })(), nbquantiles);
        first = Math.floor((nbquantiles - nbquantilesnormaux) / 2);
        last = first + nbquantilesnormaux;
        normale = qtruncnorm(moyenne, ecarttype, but[first], but[last], nbquantilesnormaux);
        normale = normale.slice(1, -1);
        ++first;
        [].splice.apply(but, [first, last-first].concat(normale));
    }
    but[0] = seuil;
    but[but.length-1] = 20;
    traduction = (function() {
        var ՐՏidx157, ՐՏitr157 = ՐՏ_Iterable(zip(origine, but)), ՐՏres = [], orig, dest;
        for (ՐՏidx157 = 0; ՐՏidx157 < ՐՏitr157.length; ՐՏidx157++) {
            ՐՏupk64 = ՐՏitr157[ՐՏidx157];
            orig = ՐՏupk64[0];
            dest = ՐՏupk64[1];
            if (dest >= seuil) {
                ՐՏres.push([ orig, dest ]);
            }
        }
        return ՐՏres;
    })();
    var lineaire_par_morceau = (ՐՏ_123 = function lineaire_par_morceau(note) {
        var ՐՏitr158, ՐՏidx158, ՐՏupk65;
        var previous_orig, previous_dest, orig, dest, resize;
        if (note === "" || note === 0 || isNaN(to_float_or_nan(note))) {
            return note;
        }
        note = to_float(note);
        previous_orig = 0;
        previous_dest = 0;
        ՐՏitr158 = ՐՏ_Iterable(traduction);
        for (ՐՏidx158 = 0; ՐՏidx158 < ՐՏitr158.length; ՐՏidx158++) {
            ՐՏupk65 = ՐՏitr158[ՐՏidx158];
            orig = ՐՏupk65[0];
            dest = ՐՏupk65[1];
            if (note <= orig) {
                resize = (dest - previous_dest) / (orig - previous_orig);
                return (note - previous_orig) * resize + previous_dest;
            }
            previous_orig = orig;
            previous_dest = dest;
        }
        ՐՏ_print(note, traduction);
        return "Bug";
    }, Object.defineProperty(ՐՏ_123, "__doc__", {
        value: "Normalisation linéaire par morceau"
    }), ՐՏ_123);
    return lineaire_par_morceau;
}, Object.defineProperty(ՐՏ_122, "__doc__", {
    value: "Harmonise notes1 en fonction de notes2\n\n\nSoit nbquantiles = 10 et nbquantilesnormaux = 6 dans les exemples.\n\nAvec 'notes1', restreint aux 'notes1 > seuil' :\n   * q0 ... q9 quantiles\n   * q0 = min, q10 = max\n   * seuil < q0 ≤ q1 par construction\n   * MAX = interpolation linéaire entre 'max(notes1)' et '20' fonction de 'remonte_a_20'\n\nAvec 'notes2', restreint aux 'notes1 > seuil'\n   * p0 ... p10 quantiles\n   * p0 = min, p10 = max\n   * p1 peut éventuellement être plus petit que 'seuil'\n\nAvec 'moyenne' et 'ecarttype' :\n   *  N0 ... N6 quantiles calculés avec la loi normale entre p2 et p8\n   *  N0 = p2 est écarté\n   *  N6 = p8 est écarté\n\n  indice       0     1     2     3     4     5     6     7     8     9     10\n            +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+\n  quantiles | q0  |  q1 |  q2 |  q3 |  q4 |  q5 |  q6 |  q7 |  q8 |  q9 | q10 |\n            +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+\n  origine   |seuil|  q1 |  q2 |  q3 |  q4 |  q5 |  q6 |  q7 |  q8 |  q9 | MAX |\n            +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+\n destination|seuil|  p1 |  p2 |  N1 |  N2 |  N3 |  N4 |  N5 |  p8 |  p9 |  20 |\n            +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+\n                         first                               last\n\nEtape finale : éliminer les colonnes pour lesquelles la destination est < au seuil.\n\nundefined"
}), ՐՏ_122);
var compute_harmonise = (ՐՏ_124 = function compute_harmonise(data_col, line, _username) {
    var column_out, column_in_1, seuil_moyenne_ecarttype, seuil, moyenne, ecarttype, nbquantiles, nbquantilesnormaux, remonte_a_20, the_lines, column_in_2, line_id;
    column_out = columns[data_col];
    if (len(column_out.average_columns) !== 2) {
        return "";
    }
    column_in_1 = column_out.average_columns[0];
    if (!getattr(column_out, "harmonise_cache_time", null) || column_out.harmonise_cache_time < millisec() - 100) {
        seuil_moyenne_ecarttype = replace_all(column_out.comment, "[  \t]+", " ").split(" ");
        if (len(seuil_moyenne_ecarttype) < 3) {
            return "";
        }
        if (len(seuil_moyenne_ecarttype) === 3) {
            seuil_moyenne_ecarttype.append("6");
            seuil_moyenne_ecarttype.append("4");
            seuil_moyenne_ecarttype.append("1");
        }
        try {
            seuil = parseInt(seuil_moyenne_ecarttype[0]);
            moyenne = parseInt(seuil_moyenne_ecarttype[1]);
            ecarttype = parseInt(seuil_moyenne_ecarttype[2]);
            nbquantiles = parseInt(seuil_moyenne_ecarttype[3]);
            nbquantilesnormaux = parseInt(seuil_moyenne_ecarttype[4]);
            remonte_a_20 = parseFloat(seuil_moyenne_ecarttype[5]);
            if (isNaN(seuil) || isNaN(moyenne) || isNaN(ecarttype) || isNaN(nbquantiles) || isNaN(nbquantilesnormaux) || isNaN(remonte_a_20) || remonte_a_20 < 0 || remonte_a_20 > 1 || nbquantilesnormaux > nbquantiles) {
                return "";
            }
        } catch (ՐՏ_Exception) {
            return "";
        }
        try {
            the_lines = lines;
            if (!the_lines || the_lines instanceof Array) {
                return line[data_col].value;
            }
        } catch (ՐՏ_Exception) {
            the_lines = column_out.table.lines;
        }
        column_in_2 = column_out.average_columns[1];
        column_out.harmonise_cache = calcule_harmonise((function() {
            var ՐՏidx159, ՐՏitr159 = ՐՏ_Iterable(the_lines), ՐՏres = [], line_id;
            for (ՐՏidx159 = 0; ՐՏidx159 < ՐՏitr159.length; ՐՏidx159++) {
                line_id = ՐՏitr159[ՐՏidx159];
                ՐՏres.push(the_lines[line_id][column_in_1].value);
            }
            return ՐՏres;
        })(), (function() {
            var ՐՏidx160, ՐՏitr160 = ՐՏ_Iterable(the_lines), ՐՏres = [], line_id;
            for (ՐՏidx160 = 0; ՐՏidx160 < ՐՏitr160.length; ՐՏidx160++) {
                line_id = ՐՏitr160[ՐՏidx160];
                ՐՏres.push(the_lines[line_id][column_in_2].value);
            }
            return ՐՏres;
        })(), seuil, moyenne, ecarttype, nbquantiles, nbquantilesnormaux, remonte_a_20);
        column_out.harmonise_cache_time = millisec();
    }
    return column_out.harmonise_cache(line[column_in_1].value);
}, Object.defineProperty(ՐՏ_124, "__doc__", {
    value: "Harmonise la première colonne en fonction de la deuxième.\nLe commentaire doit indiquer : seuil, moyenne, ecarttype, nbquantiles, nbquantilesnormaux, remonte_a_20"
}), ՐՏ_124);
var compute_repartition = (ՐՏ_125 = function compute_repartition(data_col, line, username) {
    var column, nb_etudiants, taille_groupe, nb_grp, data_col_nb_grp, cell, nb, old;
    column = columns[data_col];
    if (len(column.average_columns) < 2) {
        return line[data_col].value;
    }
    nb_etudiants = to_float_or_nan(line[column.average_columns[0]].value);
    taille_groupe = line[column.average_columns[1]].value;
    if (str(taille_groupe) === "") {
        taille_groupe = columns[column.average_columns[1]].empty_is;
    }
    try {
        taille_groupe = parseInt(taille_groupe);
    } catch (ՐՏ_Exception) {
        return line[data_col].value;
    }
    nb_grp = nb_etudiants / taille_groupe;
    if (len(column.average_columns) === 3 && !isNaN(nb_grp)) {
        data_col_nb_grp = column.average_columns[2];
        cell = line[data_col_nb_grp];
        if (cell.author === "" || str(cell.value) === "") {
            nb = parseInt(ceil(nb_grp));
            old = line[data_col_nb_grp].value;
            line[data_col_nb_grp] = line[data_col_nb_grp].set_value(str(nb) + " ");
            cell.author = "";
            if (!python_mode && (nb !== old && (typeof nb !== "object" || !ՐՏ_eq(nb, old)))) {
                update_cell_at(line.line_id, data_col_nb_grp);
            }
        }
    }
    nb_grp = rint(nb_grp * 100) / 100;
    return nb_grp;
}, Object.defineProperty(ՐՏ_125, "__doc__", {
    value: "Attention, cela modifie la cellule courante et la cellule\nde la colonne indiquee en troisieme position."
}), ՐՏ_125);var ՐՏ_126;

