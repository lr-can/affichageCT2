function DisplayUEGradesInit(ue) {
    table_attr = ue;
    line = [];
    for (var i in ue.line) {
        i = ue.line[i];
        line.push(C(i[0], i[1], i[2], i[3]));
    }
    line.line_id = ue.line_id;
    ue.line_real = line;
    columns = [];
    for (var i in ue.columns)
        columns.push(Col(ue.columns[i]));

    for (var data_col in columns) {
        init_column(columns[data_col]);
        columns[data_col].data_col = data_col;
    }
    DisplayGrades.table_attr = ue;
}

function init_suivi_state(ue, line_id, col_id) {
    var grades = display_data["Grades"][0];
    table_attr = undefined;
    for (var i in grades) {
        if (grades[i].ue == ue && grades[i].line_id == line_id) {
            DisplayUEGradesInit(grades[i]);
            if (col_id) {
                var data_col = data_col_from_col_id(col_id);
                DisplayGrades.cell = line[data_col];
                return columns[data_col];
            }
            return;
        }
    }
}

function get_next_div(value) {
    var t = document.getElementsByTagName('DIV');
    var n, min = 1e9;
    for (var i = 0; i < t.length; i++)
        if (t[i].tabIndex > value && t[i].tabIndex < min && !t[i].classList.contains('is_empty')) {
            n = t[i];
            min = t[i].tabIndex;
        }
    if (n)
        return n;
    return get_next_div(999); // wrap
}

/* To send the cell change and feedback */

function send_suivi_request(url_cell, feedback, onload) {
    var xmlhttp = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("content", url_cell);
    xmlhttp.open("POST", url + '/POST', true);
    xmlhttp.onreadystatechange = function () {
        var element = feedback.previousSibling.firstChild;
        if (element && element.getAttribute)
            var cellcode = element.getAttribute('cellcode');
        if (this.readyState === 4 && this.status == 200) {
            feedback.innerHTML = this.responseText;
            if (this.responseText.toString().indexOf('OK!') != -1) {
                feedback.style = 'background: #0F0; color: #000';
                if (element && element.tagName == 'SELECT')
                    good_select_option[cellcode] = element.value;
                if (feedback.focus_next)
                    feedback.focus_next();
                if (onload)
                    onload(this.responseText);
            }
            else {
                if (element && element.tagName == 'SELECT')
                    element.value = good_select_option[cellcode];
                alert(this.responseText);
            }
        }
    }
    xmlhttp.send(formData);
    if (!feedback.previousSibling)
        report_fake_error('send_suivi_request:' + feedback.outerHTML);

}

function _cell(s, url_cell, comment_value, onload) {
    var url_s = url_cell.split('/');
    var column = init_suivi_state(
        url_s[url_s.length - 4], url_s[url_s.length - 1], url_s[url_s.length - 2]);
    var value;
    if (comment_value === undefined) {
        var new_s = column.real_type.cell_test(s.value, column);
        if (new_s !== undefined)
            s.value = new_s;
        value = new_s;
    }
    else {
        value = comment_value;
    }
    value = value.toString().trim();
    var iframe = document.createElement('DIV');
    iframe.className = 'feedback';
    iframe.style = "background: #F00; color: #FFF; position:absolute;";
    iframe.textContent = _("MSG_home_wait");

    add_ticket_checker(s.parentNode);

    if (DisplayGrades.html_object && !comment_value) {
        // The DisplayGrades attributes are initialised by 'display_cellbox_tip'
        DisplayGrades.table_attr.line[DisplayGrades.column.data_col][0] = value;
        var line = DisplayGrades.cellbox;
        var title = DisplayGrades.column.title;
        while (!line.classList.contains('UEGrades'))
            line = line.parentNode;
        DisplayGrades.no_hover = false;
        var tabindex = DisplayGrades.tabindex;

        // Recompute the cells after the change
        var data_col = DisplayGrades.column.data_col;
        if (DisplayGrades.ue.line[data_col].length)
            DisplayGrades.ue.line_real[data_col].value = DisplayGrades.ue.line[data_col][0];
        lines = { 'line_id': DisplayGrades.ue.line_real };
        update_line('line_id', data_col);
        for (var data_col = 0; data_col < DisplayGrades.ue.line_real.length; data_col++) {
            DisplayGrades.ue.line[data_col][0] = DisplayGrades.ue.line_real[data_col].value;
        }

        line.innerHTML = display_display(DisplayGrades.ue_node);
        var titles = line.getElementsByTagName('DIV');
        for (var i = 0; i < titles.length; i++)
            if (titles[i].classList.contains('CellBox') && titles[i].title == title) {
                titles[i].appendChild(iframe);
                break;
            }
        var next = get_next_div(tabindex);
        var ds = Number(next.onfocus.toString().replace(/[^0-9]/g, '')); // XXX fragile
        iframe.focus_next = function () {
            next.focus();
            display_cellbox_tip({ target: next }, ds, true);
            display_cellbox_tip.do_not_replace = true;
        };
    }
    else
        s.parentNode.appendChild(iframe);

    send_suivi_request('/' + add_ticket(url_cell, encode_uri(value)), iframe, onload);
    if (!comment_value)
        hide_cellbox_tip();
}

function initialize_suivi_real() {
    i_am_root = myindex(root, username) != -1;
    lib_init();
    TIP.instant_tip_display = true;

    document.getElementById('top').innerHTML = '<div id="cellbox_tip"></div>'
        + (window.devicePixelRatio !== undefined
            ? '<meta name="viewport" content="width=device-width,height=device-height,initial-scale=1">'
            : '')
        ;
    my_identity = username;
}

function cell_modifiable_on_suivi() {
    table_attr = DisplayGrades.table_attr;
    if (!DisplayGrades.cell.modifiable(DisplayGrades.ue.line_real,
        DisplayGrades.column))
        return;
    if (!DisplayGrades.column.modifiable)
        return DisplayGrades.column.modifiable; // 0 or false
    if (is_a_teacher && DisplayGrades.column.visibility == 6)
        return false;
    if (DisplayGrades.column.modifiable == 2)
        return true;
    if (is_a_teacher
        && DisplayGrades.column.modifiable == 1) // So modifiable == 1
        return true;
}

function DisplayList(node) {
    return DisplayHorizontal(node, ', ');
}
DisplayList.need_node = [];

function is_inside_rightclip(element) {
    while (element) {
        if (element.id == 'rightclip')
            return true;
        element = element.parentNode;
    }
}

function set_rightclip(classe, event) {
    if (millisec() - set_rightclip.time < 100)
        return;
    set_rightclip.time = millisec();

    var e = document.getElementById("rightclip");
    if (!e)
        return;

    if (event
        && event.button !== undefined
        && e.classList.contains('hide_rightclip')
        && is_inside_rightclip(the_event(event).target))
        stop_event(event); // Not follow links when clicking on hidden bodyright

    e.className = e.className.toString()
        .replace(/ [^ ]*_rightclip/g, '') + ' ' + classe;

    // XXX Kludge : Hide Bodyright if bodyleft is clicked on touch screen
    e.parentNode.parentNode.onmousedown = function (event) {
        if (is_inside_rightclip(the_event(event).target))
            return;
        hide_rightclip(event);
    };
    return
}
set_rightclip.time = 0;

function show_rightclip(event) {
    set_rightclip('show_rightclip', event);
}

function hide_rightclip(event) {
    set_rightclip('hide_rightclip', event);
}

function rightclip_touch_start(event) {
    rightclip_touch_start.x = the_event(event).x;
    console.log("rightclip_touch_start " + rightclip_touch_start.x);
}

function rightclip_touch_end(event) {
    console.log("rightclip_touch_stop " + the_event(event).x);
    if (the_event(event).x > rightclip_touch_start.x + 8)
        hide_rightclip(event);
    if (the_event(event).x < rightclip_touch_start.x - 8)
        show_rightclip(event);
}

function DisplayRightClip(node) {
    return [DisplayHorizontal(node),
    ['hide_rightclip'],
    [],
    'id="rightclip" '
    + 'ontouchstart="rightclip_touch_start(event)" '
    + 'ontouchmove="rightclip_touch_end(event)" '
    + 'onclick="show_rightclip(event)" '
    + 'onmouseenter="show_rightclip(event)" '
    + 'onmouseleave="hide_rightclip(event)"'];
}
DisplayRightClip.need_node = [];

function DisplayPicture_(login, no_tip) {
    var s = '<img class="small" alt="' + _('ALT_photo_ID') + '" src="'
        + student_picture_icon_url(login)
        + '" style="vertical-align:top">';
    if (no_tip)
        return s;
    // newsrc to load the image only on tip display (lookat 'show_the_tip' function)
    s = hidden_txt(s,
        '<img class="big" alt="' + _('ALT_photo_ID') + '" newsrc="' +
        student_picture_url(login) + '">');
    if (rgpd_link && rgpd_link !== '')
        s = '<a target="_blank" href="' + rgpd_link + '">' + s + '</a>';
    return s;
}

function DisplayPicture(_node) {
    return DisplayPicture_(display_data['Login']);
}
DisplayPicture.need_node = ['Login'];

function DisplayOfficial(_node) {
    var url = bilan_des_notes;
    if (url.indexOf('?') == -1)
        url = add_ticket(bilan_des_notes, display_data['Login']);
    else
        url += display_data['Login']
    return hidden_txt('<a href="' + url + '" target="_blank">'
        + _("MSG_suivi_student_official_bilan") + '</a>',
        _("TIP_suivi_student_official_bilan")
    );
}
DisplayOfficial.need_node = ['Login'];

function DisplayBilan(_node) {
    if (!is_a_teacher)
        return '';
    return hidden_txt('<a href="' + add_ticket('bilan/'
        + display_data['Login']) + '" target="_blank">'
        + _("MSG_suivi_student_TOMUSS_bilan") + '</a>',
        _("TIP_suivi_student_TOMUSS_bilan"));
}
DisplayBilan.need_node = ['Login'];

function displaynames(data, no_tip, subject) {
    var mailto = data[2];
    if (subject)
        mailto = encodeURIComponent(subject) + ' <' + mailto + '>';
    var mail = '<a href="mailto:' + mailto + '">'
        + title_case(data[0] || '?') + ' ' + data[1] + '</a>';
    if (data[3] !== undefined)
        mail = DisplayPicture_(data[3], no_tip) + mail;
    return mail;
}

function DisplayNames(node, no_tip) {
    return displaynames(node.data, no_tip);
}

function DisplayReferent(node) {
    switch (node.data[4]) {
        case false:
            return hidden_txt(_('MSG_suivi_student_no_referent'),
                _('TIP_suivi_student_no_referent_needed'));
        case true:
            return hidden_txt(_('MSG_suivi_student_no_referent'),
                _('TIP_suivi_student_no_referent'));
        default:
            return (is_a_teacher ? ''
                : '<div style="width: 15em">' + _('MSG_suivi_student_your_referent') + '</div>')
                + hidden_txt(DisplayNames(node, true), (node.data[3] === undefined ? ''
                    : '<img class="big" alt="' + _('ALT_photo_ID')
                    + '" src="' + student_picture_url(node.data[3]) + '" style="display:block;">')
                    + _('MSG_suivi_student_send_to_referent'));
    }
}

function DisplayMails(node) {
    var ref;
    if (display_data['Referent'][4] !== undefined)
        ref = ',' + _("MSG_suivi_student_referent") + '<'
            + display_data['Referent'][2] + '>';
    else
        ref = '';

    return '<a href="mailto:?to='
        + encodeURIComponent(node.data.join(',') + ref)
        + '&subject=' + encodeURIComponent(display_data['Login'] + ' '
            + display_data['Names'][0]
            + ' ' + display_data['Names'][1])
        + '">'
        + hidden_txt(_("MSG_suivi_student_mail_all"),
            _("TIP_suivi_student_mail_all")) + '</a>';
}
DisplayMails.need_node = ['Mails', 'Login', 'Referent', 'Names'];

function DisplayStudentView(_node) {
    if (!is_a_teacher)
        return '';
    return hidden_txt(
        '<a href="'
        + add_ticket(display_data["Semesters"][get_url_year_semester()],
            ' ' + display_data['Login'])
        + '" target="_blank">' + _("MSG_suivi_student_view") + '</a>',
        _("TIP_suivi_student_view"));
}
DisplayStudentView.need_node = ['Login', 'Semesters'];

function DisplayCharte(node) {
    if (!is_a_teacher)
        return '';
    if (node.data)
        return _("MSG_suivi_student_contract_checked");
    else
        return '<span style="background:red">'
            + _("MSG_suivi_student_contract_unchecked") + '</span>';
}

function DisplaySignature(_node) {
    return '<a href="signatures/' + display_data['Login'] + '">'
        + _("MSG_signatures") + '</a>';
}
DisplaySignature.need_node = ['Login'];

function DisplayReload(_node) {
    if (!is_a_teacher || !display_data['Preferences']
        || !display_data['Preferences']['debug_suivi'])
        return '';
    return '<a href="reload_plugins">' + _("TITLE_reload_plugins") + '</a>';
}
DisplayReload.need_node = [];

function DisplayExplanationPopup() {
    if (popup_classname() == 'explanations_popup') {
        popup_close();
        return;
    }
    create_popup('explanations_popup',
        'TOMUSS <span class="copyright">'
        + display_data['Explanation']
        + '</span>'
        + '<a style="" href="mailto:'
        + maintainer + '?subject='
        + encodeURI(_('MSG_suivi_student_mail_subject')) + '&body='
        + encodeURI(_('MSG_suivi_student_mail_body')).replace(/\n/g,
            '%0A')
        + '">' + _('MSG_suivi_student_mail_link') + '</a>',
        _("MSG_suivi_help"),
        '', false);
}

function DisplayExplanation(_node) {
    return hidden_txt('<a href="javascript:DisplayExplanationPopup()">?</a>',
        _("COL_TITLE_explanations"));
}
// DisplayExplanation.need_node = [] ;

function preference_set(item, value) {
    if (!is_a_teacher && username != display_data['Login']) {
        Alert("ERROR_value_not_modifiable");
        return; // Can't change student preferences
    }
    display_data['Preferences'][item] = value;
    DisplayPreferencesPopup(true);
    DisplayGrades.no_hover = false;
    display_update_real();
    var img = document.createElement('IMG');
    img.src = add_ticket('save_preferences/'
        + item + '=' + display_data['Preferences'][item] + '/' + millisec());
    document.getElementById('preference_' + item).appendChild(img);
}

function preference_toggle(item) {
    preference_set(item, 1 - display_data['Preferences'][item]);
}

function add_share_with() {
    var login = prompt(_('Preference_add_share_with'));
    if (!login || login.length < 2)
        return;
    login = login.trim().toLowerCase();
    var safe = login.replace(/[^-.a-z0-9]/g, '');
    if (login != safe) {
        alert(login + ' ≠ ' + safe);
        return;
    }
    var key = 'share_with_' + safe;
    if (display_data['Preferences'][key] === undefined)
        display_data['Preferences'][key] = 0;
    preference_toggle(key);
}

function DisplayPreferencesPopup(do_no_hide) {
    if (!do_no_hide && popup_classname() == 'preferences_popup') {
        popup_close();
        return;
    }
    var data = display_data['Preferences'];
    var items = [];
    for (var item in data)
        items.push(item);
    function cleanup(x) {
        return x.substr(0, 11) == 'share_with_'
            ? '  ' + x.substr(11)
            : _('Preference_' + x);
    }
    items.sort(function (a, b) {
        a = cleanup(a);
        b = cleanup(b);
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }
    );
    var s = ['<ul>'], label, _label;

    for (var item in items) {
        item = items[item];
        label = 'Preference_' + item;
        if (item.startsWith('share_with_'))
            _label = _('Preference_share_with_') + ' ' + item.substr(11);
        else if (item.startsWith('working_hours_per_week')) {
            s.push('<li style="margin-left: -3em; color: #040"');
            s.push(' id="preference_' + item + '">')
            s.push(radio_buttons("display_data['Preferences']['working_hours_per_week']",
                [0, 5, 10, 15, 20, 30, '+40'],
                data[item], "preference_set('" + item + "', this.innerText)"));
            s.push(_("Preference_working_hours_per_week") + '</li>');
            continue;
        }
        else if (item.startsWith('commute_time')) {
            s.push('<li style="margin-left: -3em; color: #040"');
            s.push(' id="preference_' + item + '">')
            s.push(radio_buttons("display_data['Preferences']['commute_time']",
                [0, 30, 60, 90, 120, 150, '+180'],
                data[item], "preference_set('" + item + "', this.innerText)"));
            s.push(_("Preference_commute_time") + '</li>');
            continue;
        }
        else
            _label = _(label);

        if (_label != label)
            s.push('<li onclick="preference_toggle(\'' + item + '\')"'
                + ' id="preference_' + item + '"'
                + ' class="selection_' + data[item] + '">'
                + _label + '</li>');
    }
    s.push('<li onclick="add_share_with()">' + _('Preference_add_share') + '</li>');
    s.push('</ul>');
    var content = display_definition['Preferences'].children;
    for (var i in content)
        s.push(display_display(content[i]));

    // Competences Preference :
    if (DisplaySunburst.root && DisplaySunburst.root.children.length) {
        var state = display_data['Preferences'].sunburst_hide_layers;
        var sun_params_on_click = ' onClick="preference_set(\'sunburst_hide_layers\', Number(this.value))"';
        s.push('<fieldset id="preference_sunburst_hide_layers">',
            '<legend>', _("PARAM_sunburst_title"), '</legend>');
        for (var [name, value] of [["all", 0], ["normal", 1], ["tiny", 2], ["hidden", 3]])
            s.push('<div><label><input type="radio" name="sun-param" value=',
                value, sun_params_on_click, value === state ? 'checked' : '', '/>',
                _("PARAM_sunburst_" + name), '</label></div>');
        s.push('</fieldset>');
    }
    s.push('<div id="preference_display_compstats"><input type="checkbox" id="compstats_param" name="compstats_param" ',
        'onchange="preference_set(\'display_compstats\', this.checked)"',
        JSON.parse(display_data['Preferences'].display_compstats || false) ? ' checked' : '', '/>',
        '<label class="compstats_label" for="compstats_param">', _("PARAM_compstats_title"), '</label></div>');
    var preferences = s.join('');
    try { preferences = preferences_hook(preferences); } catch (e) { };
    create_popup('preferences_popup',
        '<small>' + _('LABEL_preferences')
        + '/<a href="' + add_ticket(url_suivi, 'logout') + '">'
        + _("LABEL_logout") + '</a></small><br>'
        + (is_a_teacher ? username : display_data['Login']),
        preferences, '', false);
}

function DisplayPreferences(node) {
    display_do_debug = node.data['debug_suivi'];
    for (var item in node.data) {
        if (node.data[item] === undefined)
            node.data[item] = 0;
        if (node.data[item] == -1) {
            var v;
            if (confirm(_('ask_share').split('\n')[0].replace('{0}', item.substr(11))))
                v = 0;
            else
                v = 1;
            node.data[item] = v;
            preference_toggle(item);
        }
    }
    detect_small_screen();
    return hidden_txt('<a href="javascript:DisplayPreferencesPopup()">≡</a>',
        _("LABEL_preferences"));
}
DisplayPreferences.need_node = ['Preferences', 'Login'];

function DisplayUEToggle_key(ue) {
    return year + '/' + semester + '/' + ue;
}

function DisplayUEToggle_text(ue) {
    try {
        return localStorage[DisplayUEToggle_key(ue)] == "closed" ? '▶' : '▼';
    } catch (e) { return '§'; }
}

function DisplayUEToggle_is_open(ue) {
    try {
        return localStorage[DisplayUEToggle_key(ue)] != 'closed';
    } catch (e) { return true; }
}

function DisplayUEToggle_do(event, ue) {
    var k = DisplayUEToggle_key(ue);
    try {
        localStorage[k] = localStorage[k] == "closed" ? "open" : "closed";
    }
    catch (e) {
        alert('LocalStorage NOT WORKING: ASK HELP\n\n'
            + navigator.userAgent + ':\n\n' + e);
    }
    var t = the_event(event).target;
    t.innerHTML = DisplayUEToggle_text(ue);
    var content = t.parentNode.parentNode.nextSibling;
    if (DisplayUEToggle_is_open(ue))
        content.style.display = "block";
    else
        content.style.display = "none";
    if (content.classList.contains("UEComment")) {
        content = content.nextSibling;
        if (DisplayUEToggle_is_open(ue))
            content.style.display = "block";
        else
            content.style.display = "none";
    }
}

function DisplayUEToggle(_node) {
    try {
        return '<a class="clickable" onclick="DisplayUEToggle_do(event,'
            + js2(DisplayGrades.ue.ue) + ')">'
            + DisplayUEToggle_text(DisplayGrades.ue.ue)
            + '</a>';
    }
    catch (e) {
        return '';
    }
}
DisplayUEToggle.need_node = [];


function DisplayUETitle(_node) {
    var ue = DisplayGrades.ue;
    var title = html(ue.ue + ' ' + (ue.table_title || ''));
    if (is_a_teacher && ue.semester) {
        title = '<a href="'
            + add_ticket(ue.year + '/' + ue.semester + '/' + ue.ue)
            + '" target="_blank">' + title + '</a>';
        title = hidden_txt(title, _("MSG_cell_full_table"));
        title += hidden_txt(' (<a href="'
            + add_ticket(ue.year + '/' + ue.semester + '/' + ue.ue
                + '/=filters=0_0:'
                + login_to_id(display_data['Login'])
                + '=')
            + '" target="_blank">*</a>)',
            _("MSG_cell_one_line"));
        return '<a name="' + ue.ue + '">' + title + '</a>';
    }
    else
        return '<a tabindex="0" name="' + ue.ue + '">' + title + '</a>';
}
DisplayUETitle.need_node = [];

function DisplayUEMasters(_node) {
    var ue = DisplayGrades.ue;
    var mails = [];
    for (var j in ue.masters)
        mails.push(displaynames(ue.masters[j], false, ue.ue));
    if (mails.length)
        return hidden_txt('<small>' + mails.join(', ') + '</small>',
            _("MSG_abj_master"));
    return '';
}
DisplayUEMasters.need_node = [];

function DisplayUEComment(_node) {
    var ue = DisplayGrades.ue;
    if (ue.comment && ue.comment != '')
        return _("MSG_cell_message")
            + '<em>' + add_link_on_url(html(ue.comment)).replace(/\n/g, '<br>') + '</em>';
    return '';
}
DisplayUEComment.need_node = [];

function hide_fake_ue(ue) {
    if (!ue.fake_ue)
        return false;
    for (var i in DisplayUETree.children[ue.ue])
        if (!hide_fake_ue(DisplayUETree.dict[DisplayUETree.children[ue.ue][i]]))
            return false;
    return true;
}

function DisplayUE(node) {
    if (DisplayGrades.ue.display_saved_nr === undefined)
        DisplayGrades.ue.display_saved_nr = 1000 * DisplayUE.index++;
    var s = DisplayVertical(node);
    var classes = [];
    for (var data_col in columns)
        if (columns[data_col].freezed == "C"
            && line[data_col].value.match(/\bnon\b/)) {
            classes = 'nonInscrit';
            s = s.substr(0, s.length - 6) + '<br>' + _("WARN_unregistered_student") + '</div>';
            break;
        }
    if (DisplayUETree.children && DisplayUETree.children[DisplayGrades.ue.ue]) {
        s = s.substr(0, s.length - 6); // Remove </div>
        var save = DisplayGrades.ue;
        var children = DisplayUETree.children[DisplayGrades.ue.ue];
        if (hide_fake_ue(DisplayGrades.ue))
            return;
        while (children.length == 1 && DisplayUETree.dict[children[0]].fake_ue)
            children = DisplayUETree.children[children[0]];
        s += '<div style="margin-left: 2em">';
        for (var i in children) {
            DisplayGrades.ue = DisplayUETree.dict[children[i]];
            s += display_display(display_definition['UE']);
        }
        s += '</div></div>';
        DisplayGrades.ue = save;
    }
    var id = DisplayGrades.ue.ue + '/' + DisplayGrades.ue.line_id;
    if (DisplayGrades.ue.ue == DisplayGrades.highlight_ue) {
        classes = 'highlight_ue_before';
        setTimeout(function () {
            var e = document.getElementById(id);
            e.scrollIntoView();
            e.classList.add('highlight_ue');
        }, 300);
    }
    return [s, classes, [], 'onmouseenter="enter_in_ue(event)" id="' + id + '"'];
}
DisplayUE.need_node = [];
DisplayUE.index = 1;

function remove_prefix(txt) {
    return (txt.split('-')[1] || txt).split('@')[0];
}

/*REDEFINE
Called before UE tree construction
*/
function DisplayUETreeHook(_node) {
}

function DisplayUETree(node) {
    DisplayUETreeHook(node);
    var ues = display_data["Grades"][0];
    DisplayUETree.dict = {};

    ues.sort(compare_ue);
    for (var i in ues) {
        var code = ues[i].ue;
        var trimed = remove_prefix(code);
        if (trimed != code && node.data[trimed])
            node.data[code] = node.data[trimed];
        DisplayUETree.dict[code] = ues[i];
    }
    for (var i in node.data) {
        var trimed = remove_prefix(i);
        if (trimed != i)
            for (var j in node.data)
                if (node.data[j] == trimed)
                    node.data[j] = i;
    }
    for (var k in ues) {
        var c = ues[k].ue.split('__');
        if (c.length > 1)
            for (var i in c) {
                var pere = node.data[c[i]];
                if (pere) {
                    node.data[ues[k].ue] = pere; // A parent for X__Y is found
                    break;
                }
                pere = node.data[remove_prefix(c[i])];
                if (pere) {
                    node.data[ues[k].ue] = pere; // A parent for X__Y is found
                    break;
                }
            }
    }
    for (var i in node.data) {
        var parent = node.data[i];
        if (!DisplayUETree.dict[parent]) { // Parent does not exist, so create a fake one
            ues.push({ ue: parent, table_title: "", fake_ue: true });
            DisplayUETree.dict[parent] = ues[ues.length - 1];
        }
    }
    ues.sort(compare_ue);
    var children = {};
    for (var k in ues)
        children[ues[k].ue] = [];
    for (var k in ues) {
        k = ues[k].ue;
        var parent = node.data[k];
        if (!parent)
            continue;
        children[parent].push(k);
    }

    DisplayUETree.children = children;
    DisplayUETree.parent = node.data;
}
DisplayUETree.need_node = ["UETree", "Grades"];

function DisplayCellAuthor(_node) {
    if (DisplayGrades.cell.author == '')
        return '';
    return '<span class="displaygrey">'
        + _("DisplayCellAuthorBefore") + '</span>&nbsp;'
        + html(DisplayGrades.cell.author);
}
DisplayCellAuthor.need_node = [];

function DisplayCellMTime(_node) {
    if (DisplayGrades.cell.date == '')
        return '';
    return '<span class="displaygrey">' + _("DisplayCellMTimeBefore")
        + '</span>&nbsp;' + date(DisplayGrades.cell.date);
}
DisplayCellMTime.need_node = [];

function DisplayCellComment(_node) {
    if (DisplayGrades.cell.comment == ''
        || DisplayGrades.column.real_type.hide_cell_comment)
        return '';
    return '<span class="displaygrey">' + _("SUIVI_comment") + '</span>&nbsp;'
        + '<span style="font-weight:bold">'
        + html(DisplayGrades.cell.comment).replace(/\n/g, '<br>')
        + '</span>';
}
DisplayCellComment.need_node = [];

function DisplayCellColumn(_node) {
    if (DisplayGrades.column.real_type.hide_column_comment)
        return '';
    // ⏎ for compatibility with old files
    return html(DisplayGrades.column.comment).replace(/[⏎\n]/g, "<br>");
}
DisplayCellColumn.need_node = [];

function DisplayCellGroupMembers(_node) {
    var members = DisplayGrades.cellstats.group_members;
    if (!members)
        return '';
    if (members.length == 0)
        return _('MSG_only_group_member');
    var s = [DisplayGrades.column.groupcolumn + ' : '];
    for (var i in members)
        s.push(members[i][0] + ' ' + members[i][1] + ' ' + members[i][2]);
    return s.join('<br>\n');
}
DisplayCellGroupMembers.need_node = [];

function DisplayCellRank(_node) {
    if (DisplayGrades.cellstats === undefined)
        return ' ';
    if (!DisplayGrades.column.real_weight_add)
        return ' ';

    var s = ' ';
    if (DisplayGrades.cellstats.rank !== undefined)
        s += (DisplayGrades.cellstats.rank + 1)
            + '/' + DisplayGrades.cellstats.nr + ' ';
    if (DisplayGrades.cellstats.rank_grp !== undefined)
        s += (DisplayGrades.cellstats.rank_grp + 1)
            + '/' + DisplayGrades.cellstats.nr_in_grp;
    if (s != ' ')
        s = '<span class="displaygrey">' + _("TH_rank") + '</span>' + s;
    return s;
}
DisplayCellRank.need_node = [];

function DisplayCellAvg(_node) {
    if (DisplayGrades.cellstats === undefined)
        return '';
    if (DisplayGrades.cellstats.average === undefined)
        return '';
    return ' <span class="displaygrey">' + _('Average') + '</span> '
        + DisplayGrades.column.do_rounding(DisplayGrades.cellstats.average)
        + ' <span class="displaygrey">' + _('Mediane') + '</span> '
        + DisplayGrades.cellstats.mediane;
}
DisplayCellAvg.need_node = [];

function DisplayCellDate(_node) {
    var dates = DisplayGrades.column.course_dates;
    if (!dates.text_dates.length)
        return '';
    var x = '';
    var grp_date = dates.get_group_date(DisplayGrades.ue.line[3][0]);
    if (grp_date)
        x += get_date_tomuss_short(grp_date[1].substr(0,8) + grp_date[5]) + ' ';
    return '<span class="displaygrey">' + _("SUIVI_course_dates")
        + '</span>' + x;
}
DisplayCellDate.need_node = [];

function DisplayCellType(_node) {
    return '<span class="displaygrey">' + _('B_' + DisplayGrades.column.type)
        + '</span>';
}
DisplayCellType.need_node = [];

function DisplayCellFormula(_node) {
    return DisplayGrades.formula;
}
DisplayCellFormula.need_node = [];

function DisplayCellTitle(_node) {
    var title = html(DisplayGrades.column.title.replace(/_/g, ' '));
    if (cell_modifiable_on_suivi()) {
        var dates = DisplayGrades.column.cell_writable_filter.the_filter.dates(
            DisplayGrades.ue.line_real, DisplayGrades.cell,
            is_a_teacher ? username : display_data['Login'], is_a_teacher);
        if (!dates.forever())
            title += hidden_txt('<span class="limited_time">⏱</span>', dates.__str__().replace(/\n/g, '<br>'));
    }
    if (DisplayGrades.column.is_visible(DisplayGrades.ue.line_real, DisplayGrades.cell)) {
        if (is_a_teacher && DisplayGrades.column.modifiable == 2)
            title = '<div class="modifiable_by_student">' + title + '</div>';
        else if (is_a_teacher && DisplayGrades.column.visibility == 3)
            title = '<div class="public_display">' + title + '</div>';
    }
    else
        title = '<div class="hidden_to_student">' + title
            + (DisplayGrades.column.visibility == 5 ? ' (' + _('unavailable') + ')' : '')
            + '</div>';
    return title;
}
DisplayCellTitle.need_node = [];

function DisplayCellValue(_node) {
    var t = DisplayGrades.column.real_type.formatte_suivi();
    if (!t)
        return '&nbsp;';
    var len;
    if (t.match('>'))
        len = t.split('>')[1].split('<')[0].length;
    else
        len = t.length;
    if (len < 40)
        return t;
    return [t, 'long_text', '', ''];
}
DisplayCellValue.need_node = [];

var display_saved = {};

function enter_in_ue(event) {
    if (popup_classname() === undefined) {
        popup_close();
    }
    var t = document.getElementById("cellbox_tip");
    if (!t || !t.grades)
        return;
    event = the_event(event);
    if (enter_in_ue.ue != event.target) {
        hide_cellbox_tip();
        enter_in_ue.ue = event.target;
    }
}

var select_open;

function hide_cellbox_tip(event) {
    var t = document.getElementById("cellbox_tip");
    if (!t)
        return;
    if (event && select_open) {
        select_open = false;
        return;
    }

    // Tricky: if the cellbox tip has the focus, do not hide it
    var s = document.activeElement;
    while (s) {
        if (s == t) {
            if (document.activeElement.tagName == 'INPUT'
                || document.activeElement.tagName == 'TEXTAREA')
                return true;
        }
        s = s.parentNode;
    }
    t.className = "hidden";
    if (t.grades)
        t.grades.classList.remove("tip_displayed");
}

function display_cellbox_tip(event, nr, focus) {
    if (display_cellbox_tip.do_not_replace) {
        display_cellbox_tip.do_not_replace = false;
        return;
    }
    TIP.hide_tip(true);
    if (hide_cellbox_tip())
        return;
    hide_rightclip();
    var c = the_event(event).target;
    while (!c.classList.contains('CellBox'))
        c = c.parentNode;

    var t = document.getElementById("cellbox_tip");
    if (t.do_not_display) {
        t.do_not_display = false;
        return;
    }
    t.onmouseleave = hide_cellbox_tip;
    t.className = "";
    DisplayGrades.cellbox = c;
    DisplayGrades.column = display_saved[nr][0];
    DisplayGrades.cell = display_saved[nr][1];
    DisplayGrades.html_object = c.getElementsByTagName('FORM')[0]
        || c.getElementsByTagName('INPUT')[0]
        || c.getElementsByTagName('TEXTAREA')[0]
        || c.getElementsByTagName('SELECT')[0]
        || c.getElementsByTagName('BUTTON')[0];
    if (DisplayGrades.html_object && DisplayGrades.html_object.value)
        DisplayGrades.value = DisplayGrades.html_object.value;
    else
        DisplayGrades.value = display_saved[nr][2];
    DisplayGrades.cellstats = display_saved[nr][3];
    DisplayGrades.ue = display_saved[nr][4];
    DisplayGrades.formula = display_saved[nr][5];
    DisplayGrades.table_attr = display_saved[nr][6];
    DisplayGrades.ue_node = display_saved[nr][7];
    DisplayGrades.tabindex = display_saved[nr][8];
    DisplayGrades.display_saved_nr = nr;
    DisplayGrades.no_hover = true;
    t.innerHTML = display_display(display_definition['Cell']);
    if (focus) {
        var elements = ['INPUT', 'TEXTAREA', 'SELECT'];
        for (var i in elements) {
            var input = t.getElementsByTagName(elements[i])[0];
            if (input) {
                input.focus(); // Do not work with SELECT element?
                break;
            }
        }
    }
    DisplayGrades.no_hover = false;
    var h = findPosY(c) - t.childNodes[0].childNodes[0].offsetHeight;
    if (h < 0)
        h = 0;
    t.style.top = h + 'px';
    t.style.left = findPosX(c) + 'px';
    t.display_date = millisec();

    if (t.grades)
        t.grades.classList.remove("tip_displayed");

    t.grades = c;
    while (!t.grades.classList.contains('DisplayUE'))
        t.grades = t.grades.parentNode;
    t.grades.classList.add("tip_displayed");
}

function UE_grade_formula() {
    var types = find_ue_grade()[0];
    this.infos = [undefined, [], [], []];
    for (var type = 1; type <= 3; type++) {
        for (var exam in types[type])
            this.infos[type].push(this.analyse(types[type][exam]));
    }
}

UE_grade_formula.prototype.analyse = function (datacols) {
    for (var i = datacols.length - 1; i >= 0; i--) {
        var datacol = datacols[i];
        var value = DisplayGrades.ue.line[datacol][0];
        if (value !== '' && value !== undefined || i == 0) {
            var col = DisplayGrades.ue.columns[datacol];
            var minmax = col.minmax || '[0;20]';
            var min_max = minmax.replace('[', '').replace(']', '').split(';');
            if (value === '' || value === undefined || value.toString() == 'NaN')
                value = '?';
            return [
                html(col.title),
                isNaN(value) ? value : do_round(value, col.rounding || 0.01, 0),
                min_max[0],
                min_max[1],
                col.weight || 1,
                col.course_dates ? (new CourseDates(col.course_dates)).format_dates() : ''
            ];
        }
    }
};

UE_grade_formula.prototype.html = function () {
    var formula = ['<table class="colored">',
        '<tr><th>', _("B_Moy"),
        '<th>', _("BEFORE_column_attr_columns"),
        '<th>', _("B_Note"),
        '<th>', _("BEFORE_column_attr_weight"),
        '<th>', _("B_Date"),
        '</tr>'];
    for (var type = 1; type <= 3; type++)
        if (this.infos[type].length) {
            formula.push('<tr><th rowspan="' + this.infos[type].length + '">'
                + _("SELECT_column_grade_type_" + type));
            for (var exam in this.infos[type]) {
                var infos = this.infos[type][exam];
                var value = infos[1];
                var min = infos[2];
                var max = infos[3];
                var weight = infos[4];
                if (!isNaN(value))
                    if (min == 0)
                        value += '/' + max;
                    else
                        value += '[' + min + ';' + max + ']';
                if (type === 1)
                    value = 'Max(' + value + ',' + _("SELECT_column_grade_type_3").substr(0, 2) + ')';
                if (exam != 0)
                    formula.push('<tr>');
                formula.push('<td>' + infos[0] + '<td>' + value
                    + '<td>' + weight + '<td>' + infos[5] + '</tr>');
            }
        }
    formula.push('</table>');
    return formula.join('');
};

UE_grade_formula.prototype.full = function () {
    for (var type = 3; type > 0; type--)
        for (var exam in this.infos[type])
            if (this.infos[type][exam][1] === '?')
                return false;
    return true;
};

UE_grade_formula.prototype.formula = function () {
    var formula = ['function _formula_(U) {'];
    for (var type = 3; type > 0; type--) {
        var sum = [];
        var weights = 0;
        for (var exam in this.infos[type]) {
            var infos = this.infos[type][exam];
            var value = infos[1];
            var min = infos[2];
            var max = infos[3];
            var weight = infos[4];
            if (value === '?')
                value = 'U';
            else if (isNaN(value))
                value = 0;
            else
                value = '(' + value + '-' + min + ')/(' + max + '-' + min + ')';
            if (type === 1)
                value = 'Math.max(' + value + ',CT)';
            sum.push(weight + '*' + value);
            weights += Number(weight);
        }
        if (weights > 0) {
            formula.push('var s' + type + '=' + sum.join('+') + ';')
            formula.push('var w' + type + '=' + weights + ';');
        }
        else {
            formula.push('var s' + type + '=0;')
            formula.push('var w' + type + '=1;')
        }
        if (type == 3)
            formula.push('var CT = s3 / w3;')
    }
    formula.push('return (s1+s2+s3)/(w1+w2+w3);');
    formula.push('};_formula_');
    // console.log(formula.join('\n'));
    return eval(formula.join('\n'));
};

function ue_grade_formula() {
    var grade = new UE_grade_formula();
    var fct = grade.formula();
    var message = '';
    if (fct(0) != fct(1)) {
        for (var i = 0; i < 1; i += 0.025)
            if (fct(i) >= 0.5) {
                message = '?=' + (20 * i).toFixed(1) + _("MSG_Ue_Grade");
                break;
            }
    }
    DisplayGrades.column.ue_grade_incomplete = !grade.full();
    return grade.html() + message;
}

function display_tree(column) {
    if (column.type == 'Ue_Grade')
        return ue_grade_formula();
    if (column.average_from.length == 0)
        return '';
    if (!column_modifiable_attr("columns", column))
        return '';
    var s = ['<ul>'];
    var col;
    for (var i in column.average_from) {
        col = columns[data_col_from_col_title(column.average_from[i])];
        if (!col)
            continue;
        s.push('<li>'
            // + '<span class="displaygrey">' + _("B_"+col.type) + '</span> '
            + column.average_from[i]
            + ' <span class="displaygrey">' + _("BEFORE_column_attr_weight")
            + '</span>&nbsp;' + col.weight
            + (display_data['Preferences'].recursive_formula
                ? display_tree(col)
                : '') + '</li>'
        );
    }
    if (column.incomplete)
        s.push('<li>' + _("MSG_suivi_and_hiddens"));
    s.push("</ul>");
    return s.join("");
}

function rank_to_color(rank, nr) {
    var x = Math.floor(511 * rank / nr);
    var b, c = '';
    if (rank > nr / 2) {
        b = '255,' + (511 - x) + ',' + (511 - x);
        if (rank > 3 * nr / 4)
            c = ';color:#FFF';
    }
    else
        b = x + ',255,' + x;

    return 'background: rgb(' + b + ')' + c
}

function grade_to_class(column, grade) {
    if (allowed_grades[grade])
        grade = allowed_grades[grade][0];
    if (is_abi[grade]) return 'abinj';
    if (is_abj[grade]) return 'abjus';
    if (is_tnr[grade]) return 'tnr';
    if (is_pre[grade]) return 'prst';
    if (isNaN(grade)) return '';

    var ci = (grade - column.min) / (column.max - column.min);

    if (ci > 0.8) return 'verygood';
    if (ci > 0.6) return 'good';
    if (ci > 0.4) return 'mean';
    if (ci > 0.2) return 'bad';
    return 'verybad';
}

function get_cell_class_and_style() {
    var classes = ['DisplayType' + DisplayGrades.column.type];
    var styles = [];
    if (display_data['Preferences'] // Turn around bug on multiple suivi student
        && !display_data['Preferences']['black_and_white']
        && !display_data['Preferences']['hide_grade']
    ) {
        if (DisplayGrades.column.red + DisplayGrades.column.green
            + DisplayGrades.column.redtext + DisplayGrades.column.greentext != ''
            && !display_data['Preferences']['no_teacher_color'])
            classes.push(cell_class(DisplayGrades.column,
                DisplayGrades.ue.line_real,
                DisplayGrades.cell));
        else if (DisplayGrades.column.real_weight_add) {
            if (DisplayGrades.cellstats
                && DisplayGrades.cellstats.rank !== undefined
                && DisplayGrades.cellstats.nr >= 10
                && !display_data['Preferences']['color_value']
            )
                styles.push(rank_to_color(DisplayGrades.cellstats.rank,
                    DisplayGrades.cellstats.nr));
            else if ((DisplayGrades.column.type == 'Moy'
                || DisplayGrades.column.type == 'Note'
                || DisplayGrades.column.type == 'Prst'
            )
                && DisplayGrades.cell.value !== ''
                && (
                    display_data['Preferences'].green_prst
                    || !is_pre[DisplayGrades.value]
                ))
                classes.push(grade_to_class(DisplayGrades.column,
                    DisplayGrades.value));
        }
    }
    if (DisplayGrades.cell.comment)
        styles.push('font-weight: bold');

    if (DisplayGrades.column.type == 'Ue_Grade' && DisplayGrades.column.ue_grade_incomplete)
        classes.push('Ue_Grade_incomplete');
    classes.push('GT' + DisplayGrades.column.grade_type + 'S' + DisplayGrades.column.grade_session);

    return [classes, styles];
}

function DisplayCellBox(node) {
    if (!is_a_teacher && DisplayGrades.column.title.substr(0, 1) == '.')
        return '';
    var s = DisplayVertical(node);
    var more = '';
    var display_saved_nr = DisplayGrades.display_saved_nr;
    if (display_saved[display_saved_nr] !== undefined)
        DisplayGrades.tabindex = display_saved[display_saved_nr][8]; // Keep old
    else
        DisplayGrades.tabindex = -display_saved_nr; // Temporary number

    if (!DisplayGrades.no_hover) // Stop recursion
    {
        display_saved[display_saved_nr] = [DisplayGrades.column,
        DisplayGrades.cell,
        DisplayGrades.value,
        DisplayGrades.cellstats,
        DisplayGrades.ue,
        display_tree(DisplayGrades.column),
        DisplayGrades.table_attr,
        DisplayGrades.ue_node,
        DisplayGrades.tabindex
        ];
        if (DisplayGrades.column.type == 'Moy') {
            if (DisplayGrades.column.best != 0)
                display_saved[display_saved_nr][5] += _("SUIVI_best_of_before")
                    + DisplayGrades.column.best + _("SUIVI_best_of_after")
                    + '<br>';
            if (DisplayGrades.column.worst != 0)
                display_saved[display_saved_nr][5] += _("SUIVI_mean_of_before")
                    + DisplayGrades.column.worst + _("SUIVI_mean_of_after")
                    + '<br>';
        }
        else if (DisplayGrades.column.type == 'Weighted_Percent'
            || DisplayGrades.column.type == 'Nmbr') {
            display_saved[display_saved_nr][5] = display_saved[display_saved_nr][5]
                .replace("<ul", html(DisplayGrades.column.test_filter) + '<ul');
        }
        more = 'tabindex="' + DisplayGrades.tabindex + '" onfocus="display_cellbox_tip(event,'
            + display_saved_nr + ');" onmousemove="display_cellbox_tip(event,'
            + display_saved_nr + ');" onmouseenter="display_cellbox_tip(event,'
            + display_saved_nr + ');" title="' + encode_value(DisplayGrades.column.title) + '"';
        DisplayGrades.display_saved_nr++;
    }
    else // In the popup box add tabindex in editable content
        s = s.replace(
            /<(input|button|textarea|select)/i,
            '<$1 tabindex="' + (DisplayGrades.tabindex + 1) + '"');
    var class_and_style = get_cell_class_and_style();

    if (DisplayGrades.column.title == DisplayGrades.highlight_column)
        class_and_style[1].push('padding: 1em; border: 6px solid #0F0; border-radius: 1em');

    return [s, class_and_style[0], class_and_style[1], more];
}
DisplayCellBox.need_node = [];

var columns, line;

function create_box_tree(boxes, ordered_columns) {
    for (var data_col in boxes)
        columns[data_col]._tree_done = false;
    do {
        var change = false;
        for (var data_col in boxes) {
            if (boxes[data_col] === '')
                continue;
            var column = columns[data_col];
            if (column._tree_done)
                continue;
            var content = [];
            var possible = true;
            var final = '_final';
            for (var i in column.average_from) {
                if (column.average_from[i].indexOf('/') != -1) {
                    possible = false;
                    break;
                }
                var dc = data_col_from_col_title(column.average_from[i]);
                col = columns[dc];
                if (!col._tree_done) {
                    possible = false;
                    break;
                }
                if (!col)
                    continue;
                if (boxes[dc] === undefined) {
                    // Yet done box must not be focusable by Tab
                    content.push(col._tree_done.replace(/class="Display/, 'class="tree_done Display')
                        .replace(/tabindex="[0-9]*"/, '')
                    );
                    continue;
                }
                content.push(boxes[dc]);
                if (boxes[dc].match(/<div class="tree_node/))
                    final = '';
            }
            if (possible) {
                column._tree_done = boxes[data_col];
                change = true;
            }
            if (possible && content.length) {
                if (content.length == 1)
                    final = '_final';
                boxes[data_col] = ('<div class="tree_node">'
                    + boxes[data_col]
                    + '<span>←</span><div class="tree_leaves' + final + '">'
                    + content.join('') + '</div></div>').replace(/class="is_empty/g, 'class="');
                for (var i in column.average_from)
                    boxes[data_col_from_col_title(column.average_from[i])] = undefined;
                for (var i in ordered_columns)
                    if (ordered_columns[i] == data_col) {
                        ordered_columns.splice(i, 1);
                        ordered_columns.push(data_col);
                    }
            }
        }
    }
    while (change);

    // Create boxes
    // 'base' contains the beginning of the '/' separated path
    // 'node' dictionnary
    //    keys : the paths children of the node
    //    value: the same content as 'node'
    //           The value of '' key is the datacol of the node
    // Returns a pair:
    //    the HTML content
    //    and 'contains_something' boolean to indicate a non empty child
    // It erases merged boxes and update top box.
    function do_merge(base, node) {
        if (Object.keys(node).length == 1 && node[''] !== undefined)
            return [node[''], boxes[node['']] ? !boxes[node['']].includes('class="is_empty') : false];
        var to_merge = [];
        var contains_something;
        for (var name in node)
            if (name === '')
                to_merge.push(node['']); // data_col
            else {
                var [child_content, not_empty] = do_merge(base + '/' + name, node[name])
                contains_something = contains_something || not_empty;
                to_merge.push(child_content);
            }

        var display_base = html(base.replace(/_/g, ' '));
        var content = ['<div class="boxed_boxes">',
            '<div class="boxed_boxes_title">',
            display_base,
            '</div>'
        ];
        for (var i in to_merge) {
            var child_content = boxes[to_merge[i]];
            if (child_content === undefined) {
                // Yet done box must not be focusable by Tab
                child_content = columns[to_merge[i]]._tree_done
                    .replace(/class="Display/, 'class="tree_done Display')
                    .replace(/tabindex="[0-9]*"/, '');
            }
            else {
                // The '_' can be converted to space or unsecable space
                child_content = child_content.replace(
                    RegExp('>' + protect_regexp(display_base).replace(/ /g, '.') + '/'),
                    '>')
                boxes[to_merge[i]] = undefined;
            }
            if (!child_content.includes('class="is_empty'))
                contains_something = true;
            content.push(child_content);
        }
        content.push('</div>');
        var first = to_merge[0];
        boxes[first] = content.join('');
        if (!contains_something)
            boxes[first] = boxes[first].replace('class="', 'class="is_empty ');
        ordered_columns.splice(myindex(ordered_columns, first), 1);
        ordered_columns.push(first);
        return [first, contains_something];
    }
    function add_to_tree(node, data_col, title) {
        var base = title.replace(/\/.*/, '');
        var after = title.replace(base + '/', '');
        if (!isNaN(base.substr(base.length - 1))
            && !isNaN(title.substr(base.length + 1, 1)))
            base = title; // Reject ...[0-9]/[0-9]...
        if (node[base] == undefined)
            node[base] = {};
        if (base === title)
            node[base][''] = data_col;
        else
            add_to_tree(node[base], data_col, after);
    }
    var tree = {};
    for (var i in ordered_columns) {
        var data_col = ordered_columns[i];
        add_to_tree(tree, data_col, columns[data_col].title);
    }
    for (var i in tree)
        do_merge(i, tree[i]);
}

function DisplayUEGrades(node) {
    var ue = DisplayGrades.ue;
    DisplayUEGradesInit(ue);
    DisplayGrades.ue_node = node;
    DisplayGrades.display_saved_nr = ue.display_saved_nr;

    var one_cell_to_display = false;
    var ordered_columns = column_list_all();
    var boxes = {};
    for (var data_col in ordered_columns) {
        data_col = ordered_columns[data_col];
        if (data_col < 3)
            continue;
        if (columns[data_col].freezed == "C")
            continue;
        DisplayGrades.cell = line[data_col];
        DisplayGrades.column = columns[data_col];
        DisplayGrades.value = line[data_col].value;
        if (DisplayGrades.value === '')
            DisplayGrades.value = DisplayGrades.column.empty_is;
        else
            if (DisplayGrades.value.toString() !== 'NaN')
                one_cell_to_display = true;
        one_cell_to_display = one_cell_to_display || cell_modifiable_on_suivi();
        DisplayGrades.cellstats = DisplayGrades.ue.stats[DisplayGrades.column.the_id] || {};
        var ss = display_display(display_definition['CellBox']);
        if ((DisplayGrades.value === '' || DisplayGrades.value.toString() == 'NaN')
            && !cell_modifiable_on_suivi()
            && DisplayGrades.column.type != 'MCQ'
            && (DisplayGrades.column.type != 'URL' || DisplayGrades.column.url_base === '')
            && !DisplayGrades.column.grade_type)
            ss = ss.replace('class="', 'class="is_empty ');
        boxes[data_col] = ss;
    }
    if (!one_cell_to_display && !ue.fake_ue
        && DisplayUETree.children
        && DisplayUETree.children[ue.ue]
        && DisplayUETree.children[ue.ue].length == 0)
        return [' ', '', "display:none"];

    if (!display_data['Preferences'].compact_suivi)
        create_box_tree(boxes, ordered_columns);
    var s = [' ']; // Not empty in order to generate a <div>
    for (var data_col in ordered_columns) {
        data_col = ordered_columns[data_col];
        if (boxes[data_col])
            s.push(boxes[data_col]);
    }
    s = s.join('');
    var tabindex = DisplayGrades.ue.display_saved_nr;
    function update_tabindex(x) {
        var i = Number(x.split('"')[1]);
        if (i >= 0)
            return x;
        display_saved[-i][8] = (tabindex += 2);
        return ' tabindex="' + display_saved[-i][8] + '" ';
    }
    // XXX Does not work if the displayed content contains «tabindex="..."»
    s = s.replace(/ tabindex="-[1-9][0-9]*" /g, update_tabindex);

    if (ue.ue != DisplayGrades.highlight_ue && !DisplayUEToggle_is_open(ue.ue))
        return [s, "", "display:none"];
    return s;
}
DisplayUEGrades.need_node = [];


function get_nr_real_values_in_the_line(ue) {
    var n = 0;
    for (var i in ue.line)
        if (ue.line[i][1] && ue.line[i][1].length > 1) // Not a fake cell author
            n++;
    return n;
}

/*REDEFINE
 This function allow to sort the table on the suivi page
 in the wanted order.
 By default the UE code and the line content if equality.
*/
function get_ue_priority(ue) {
    if (ue.cached_priority)
        return ue.cached_priority;
    var txt = [ue.ue.replace(/-[1-9]*$/, '')];
    if (txt[0] != ue.ue)
        txt.push(99999 - get_nr_real_values_in_the_line(ue));
    else
        txt.push(90000); // Priority to the table without extension
    for (var i in ue.line)
        txt.push(ue.line[i][0]);
    ue.cached_priority = txt.join('\001');
    return ue.cached_priority;
}

function compare_ue(a, b) {
    if (get_ue_priority(b) < get_ue_priority(a))
        return 1;
    if (get_ue_priority(b) > get_ue_priority(a))
        return -1;
    return 0;
}

function DisplayGrades(node) {
    if (node.data === undefined)
        return '<span style="background:#FF0">' + _("MSG_suivi_student_wait")
            + '</span>';

    node.data[0].sort(compare_ue);
    var s = '';
    var highlight = window.location.pathname.replace(/.*\//, '').split(':');
    DisplayGrades.highlight_ue = highlight[0];
    DisplayGrades.highlight_column = highlight[1] || '';
    for (var i in node.data[0]) {
        DisplayGrades.ue = node.data[0][i];
        if (DisplayUETree.parent
            && DisplayUETree.parent[DisplayGrades.ue.ue] !== undefined
            && DisplayUETree.dict[DisplayUETree.parent[DisplayGrades.ue.ue]]
            !== undefined
        )
            continue;
        try {
            s += display_display(display_definition['UE']);
        }
        catch (e) {
            console.log(e);
            s += '<h1>' + DisplayGrades.ue.ue + ': BUG</h1>' + html(e.toString());
        }
    }
    var before = _("MSG_suivi_student_not_in_TOMUSS_before");
    if (before == "MSG_suivi_student_not_in_TOMUSS_before")
        before = '';
    else
        before += ' ';
    for (var i in node.data[1]) {
        var t = node.data[1][i][0] + ' ' + node.data[1][i][1];
        if (is_a_teacher)
            s += '<p class="title">' + _("MSG_suivi_student_registered") + t + '</p>';
        else
            s += '<div class="UE UETitle">'
                + before
                + t + '</div><div class="UEComment">'
                + _("MSG_suivi_student_not_in_TOMUSS_after")
                + '</div>';
    }
    return '<hr>' + s;
}
DisplayGrades.need_node = ['Login', 'Grades', 'Preferences'];

function goto_cellbox(o) {
    goto_cellbox.old = document.getElementById(o.getAttribute('ue'));
    if (goto_cellbox.old.classList.contains("not_yellow"))
        goto_cellbox.old.classList.replace("not_yellow", "yellow");
    else
        goto_cellbox.old.classList.add("yellow");
    goto_cellbox.oldo = o;
    if (o.classList.contains("not_yellow"))
        o.classList.replace("not_yellow", "yellow");
    else
        o.classList.add("yellow");
}

function ungoto_cellbox() {
    if (goto_cellbox.old) {
        goto_cellbox.old.classList.replace("yellow", "not_yellow");
        goto_cellbox.oldo.classList.replace("yellow", "not_yellow");
    }
}

function scroll_to_cellbox(o) {
    var cellbox = document.getElementById(o.getAttribute('ue'));
    var open_div = cellbox.getElementsByClassName('clickable')[0];
    var parent_cell = cellbox;
    while (!is_element_visible(cellbox.getElementsByClassName('UEGrades')[0])) {
        if (open_div.innerHTML === '▶')
            open_div.click();
        parent_cell = (parent_cell.parentNode.parentNode.parentNode || undefined);
        if (parent_cell === undefined)
            break;
        open_div = parent_cell.getElementsByClassName('clickable')[0];
    }
    cellbox.scrollIntoView();
}

function cell_visibility_date(cell, column) {
    if (cell[2] === undefined)
        return new Date(0);
    var modif_time = get_date_tomuss(cell[2]);
    if (column.visibility_date === '' || column.visibility_date === undefined)
        return modif_time;
    var column_visible_date = get_date_tomuss(column.visibility_date);
    if (column_visible_date < modif_time || isNaN(column_visible_date.getTime()))
        return modif_time;
    else
        return column_visible_date;
}

function DisplayLastGradesList(time_limit) {
    var grades = display_data['Grades'][0];
    var s = [];

    for (var ue in grades) {
        ue = grades[ue];
        for (var data_col in ue.line) {
            var cell = ue.line[data_col];
            if (cell[0] === '' || cell[0] === undefined)
                continue;
            if (cell[1] === undefined || cell[1].length < 2)
                continue; // System value
            var time = cell_visibility_date(cell, ue.columns[data_col]);
            time.setHours(0);
            time.setMinutes(0);
            time.setSeconds(0);
            time = time.getTime();
            if (time < time_limit)
                continue;
            s.push([ue, data_col, time]);
        }
    }
    s.sort(function (a, b) { return b[2] - a[2]; });
    return s;
}

function DisplayLastGrades(_node) {
    if (is_a_teacher)
        return '';
    var one_week = millisec() - 7 * 24 * 3600000;
    var s = DisplayLastGradesList(one_week);
    if (s.length == 0)
        return '';
    var t = [];
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today = today.getTime();
    var daynames = [_("LABEL_Day0"), _("LABEL_Day1"), _("LABEL_Day2")];
    var lastday;
    for (var i in s) {
        var ue = s[i][0];
        var data_col = s[i][1];
        var quand = s[i][2];
        var column = ue.columns[data_col];
        var nb_days = Math.round((today - quand) / 86400000);
        var day = daynames[nb_days];
        if (day === undefined)
            day = _("LABEL_ThisWeek");
        if (day != lastday) {
            if (lastday !== undefined)
                t.push("<br>");
            t.push('<div class="Display day">' + day + '</div>');
            lastday = day;
        }
        DisplayUEGradesInit(ue);
        DisplayGrades.ue = ue;
        DisplayGrades.cell = line[data_col];
        DisplayGrades.value = DisplayGrades.cell.value;
        DisplayGrades.column = columns[data_col];
        DisplayGrades.cellstats = ue.stats[DisplayGrades.column.the_id] || {};
        DisplayGrades.column.modifiable_backup = DisplayGrades.column.modifiable;
        DisplayGrades.column.modifiable = false;
        t.push('<div tabindex="0" onmouseover="goto_cellbox(this)"'
            + ' ue="' + ue.ue + '/' + ue.line_id + '"'
            + ' onmouseout="ungoto_cellbox()" class="Display a_grade"'
            + ' onclick="scroll_to_cellbox(this);">'
            + ue.ue
            + '<br>' + html(column.title || '???')
            + '<br><div class="the_grade">'
            + DisplayGrades.column.real_type.formatte_suivi()
            + "</div></div>");
        DisplayGrades.column.modifiable = DisplayGrades.column.modifiable_backup;
    }
    return '<hr>' + t.join('');
}
DisplayLastGrades.need_node = ['Grades'];

function DisplayLogoPopup(_node) {
    if (popup_classname() == 'logo_popup') {
        popup_close();
        return;
    }
    create_popup('logo_popup', _('MSG_suivi_student_logo'),
        DisplayLogo.popup_content, '', false);
}

function DisplayLogo(node) {
    if (node.data === '' || node.data == 'http://xxx.yyy.zzz/logo.png')
        return '';
    var s = [];
    for (var i in node.children)
        s.append(display_display(node.children[i]));
    DisplayLogo.popup_content = s.join("<br>");

    var img = '<img'
        + (node.children.length
            ? ' onclick="DisplayLogoPopup()"'
            : '')
        + ' alt="' + _("MSG_suivi_student_logo") + '"'
        + ' src="' + node.data + '">';

    if (s.length != 0)
        img = hidden_txt(img, _("MSG_suivi_student_logo"));

    return img;
}

function DisplayYearSemester(_node) {
    return '<span class="Display">' + year + '<br>' + semester + '</span>';
}
DisplayYearSemester.need_node = [];

function DisplayGoHome(node) {
    if (!is_a_teacher && node.data)
        return ['<a href="' + add_ticket('') + '">'
            + _("MSG_signature_done") + '</a>',
        [],
        ['width:10em; text-align:center; white-space:normal; font-size:80%']
        ];
}

function DisplaySemesters(node, textual) {
    var y = '9999';
    for (var ys in node.data)
        if (ys < y)
            y = ys;
    y = y.split('/')[0]; // Older year
    var s = semesters[0]; // First semester of the real year

    var t = [], highlight;
    do {
        if (textual) {
            if (node.data[y + '/' + s])
                t.push('<p><a href="' + add_ticket(node.data[y + '/' + s],
                    display_data['Login'] + '/*')
                    + '">' + y + ' ' + s + '</a>'
                );
        }
        else {
            if (s == semesters[0])
                t.push('</tr><tr><td>' + y + '</td>');
            if (y == year && s == semester)
                highlight = ' style="background: #FF0"';
            else
                highlight = '';

            if (is_a_teacher)
                icone = '<img class="icone" src="'
                    + add_ticket(node.data[y + '/' + s], '_' + display_data['Login'])
                    + '">';
            else
                icone = '';
            if (node.data[y + '/' + s])
                t.push('<td' + highlight + '><a href="'
                    + add_ticket(node.data[y + '/' + s], display_data['Login'])
                    + '">' + icone + s + '</a></td>');
            else
                t.push('<td>&nbsp;</td>');
        }

        ys = next_year_semester(y, s);
        y = ys[0];
        s = ys[1];
    }
    while (node.data[y + '/' + s] || s != semesters[0]);
    if (textual)
        return t.join('');

    return '<table class="tomuss_links colored">'
        + '<tr><th colspan="3">'
        + hidden_txt(_("MSG_suivi_student_semesters"),
            _("TIP_suivi_student_semesters"))+ t.join('\n') + '</tr></table>';
}
DisplaySemesters.need_node = ['Semesters', 'Login'];

function DisplayCivilite(node) {
    if (!display_data['Preferences']['hide_civilite']) {
        if (node.data == 'M.')
            return '♂';
        if (node.data == 'MME')
            return '♀';
    }
    return '';
}
DisplayCivilite.need_node = ['Civilite', 'Preferences'];

function DisplayGetStudent(_node) {
    if (!is_a_teacher)
        return '';
    if (display_data['Referent'][3] == username)
        return ''; // I am yet its referent

    return hidden_txt('<img onclick="catch_this_student('
        + js2(display_data['Login']) + ')" '
        + 'alt="' + _("MSG_home_become_referent") + '" '
        + 'src="' + url_files
        + '/butterflynet.png">', _('MSG_bilan_take_student'));
}
DisplayGetStudent.need_node = ['Referent', 'Login'];

function DisplayUserInfo(_node) {
    if (i_am_root)
        return '<a class="emoji" target="_blank" href="'
            + add_ticket('users/' + display_data['Login']) + '">🔍</a>';
    return '';
}
DisplayUserInfo.need_node = ['Login'];

function DisplayIsPrivate(node) {
    var s = _("MSG_suivi_student_private");
    if (node.data[0])
        s += '<p>' + _("MSG_suivi_student_private_referent")
            + ' ' + DisplayNames(node);
    s += '<hr><a href="' + add_ticket('ask_share/' + display_data['Login']) + '">'
        + _('share_with_me') + '</a>';
    return s;
}

function DisplayPreamble(_node) {
    if (is_a_teacher)
        return '';
    return '<title>TOMUSS</title>' + _("MSG_suivi_student_important");
}
DisplayPreamble.need_node = [];

function DisplayMessages(_node) {
    var m = [];
    var abjs = display_data['Abjs'];
    for (var i in abjs)
        if (abjs[i][2].substr(0, 13) == '{{{MESSAGE}}}')
            m.push(parse_date(abjs[i][0]).formate('%d/%m/%Y')
                + ' : ' + abjs[i][2].replace('{{{MESSAGE}}}', ''));
    return m.join('<br>');
}
DisplayMessages.need_node = ['Abjs'];

function DisplayNewSignature(_node) {
    if (!is_a_teacher)
        return '';
    return hidden_txt('<a href="javascript:signature_new(\''
        + display_data['Login'] + '\')">'
        + _("LABEL_signature_new") + '</a>',
        _("TIP_signature_new"));
}
DisplayNewSignature.need_node = ['Login'];

function sign(t, message_id) {
    if (!confirm(unescape(t.textContent || t.innerHTML)))
        return;
    t.parentNode.style.opacity = 0.5;
    var img = document.createElement('IMG');
    img.src = add_ticket('signature/' + message_id
        + '/' + encode_uri(t.textContent));
    img.style.width = '20px';
    img.style.height = '20px';
    t.parentNode.insertBefore(img, t);
    var b = t.parentNode.getElementsByTagName('BUTTON');
    for (var i = 0; i < b.length; i++)
        b[i].disabled = true;

    var b = document.getElementsByTagName('BUTTON');
    for (var i = 0; i < b.length; i++)
        if (b[i].id != "signature_done" && !b[i].disabled)
            return;
    document.getElementById("signature_done").style.display = 'block';
}

function DisplayAskQuestion(node) {
    return '<h2>' + hidden_txt(_('TITLE_signature')) + '</h2>'
        + node.data.join('') + '<hr>'
        + '<button id="signature_done" style="display:none" onclick="location.reload()">'
        + _('MSG_signature_done') + '</button>';
}

function DisplayAbjs(node) {
    if (node.data.length == 0)
        return '';
    var t = [];
    for (var i in node.data)
        if (node.data[i][2].substr(0, 13) != '{{{MESSAGE}}}') {
            var start = node.data[i][0].split('/');
            var start_day = two_digits(start[0]);
            var start_month = two_digits(start[1]);
            var sort_key = start[2].substr(0, 4) + start_month + start_day;
            var stop = node.data[i][1].split('/');
            var stop_day = two_digits(stop[0]);
            var stop_month = two_digits(stop[1]);
            t.push('<TR><!--' + sort_key
                + '--><TD>' + start_day + '/' + start_month + '/' + start[2]
                + '</TD><TD>' + stop_day + '/' + stop_month + '/' + stop[2]
                + '</TD><TD>' + html(node.data[i][2])
                + '</TD></TR>');
        }
    if (t.length == 0)
        return ''; // Only message and no ABJ
    t.sort();
    return '<TABLE class="display_abjs colored"><tr>'
        + '<th>' + _("MSG_abjtt_from_before")
        + '<th>' + _("TH_until")
        + '<th>' + _("TH_comment")
        + t.join('')
        + '</table>';
}

function display_first_line(txt) {
    txt = html(txt);
    if (txt.indexOf('\n') == -1)
        return txt;
    var t = txt.split('\n');
    return t[0] + hidden_txt('<br><b>' + _("MSG_see_more") + '</b>',
        t.slice(1, t.length).join(''));
}

function DisplayDA(node) {
    if (node.data.length == 0)
        return '';

    var t = [];
    for (var i in node.data)
        t.push('<TR><TD>' + node.data[i][0] + '</TD><TD>' + node.data[i][1]
            + '</TD><TD>' + display_first_line(node.data[i][2])
            + '</TD></TR>');

    return '<TABLE class="display_abjs colored"><tr>'
        + '<th>' + _("TH_da_for_ue")
        + '<th>' + _("MSG_abj_tt_from")
        + '<th>' + _("TH_comment")
        + t.join('')
        + '</table>';
}

function DisplayRSS(node) {
    if (node.data === false)
        return '<iframe src="' + add_ticket('rsskey') + '"></iframe>';

    return hidden_txt('<a href="' + url_suivi + '/rss/' + node.data + '">'
        + _("MSG_suivi_student_RSS")
        + '<img src="' + url_files
        + '/feed.png" alt="' + _("TIP_suivi_student_RSS")
        + '" style="border:0px"></a>',
        _("TIP_suivi_student_RSS"))
        + '<link href="' + url_suivi + '/rss/' + node.data
        + '" rel="alternate" title="TOMUSS" type="application/rss+xml">';
}

function DisplayLinksTable(node) {
    if (node.children.length == 0)
        return '';
    var t = ['<table class="colored"><tr><th colspan="2">'
        + _('SUIVI_linkstable') + '</tr>'];
    var i = 0;
    for (var ii in node.children) {
        if (i % 2 == 0) {
            if (i != 0)
                t.push('</tr>');
            t.push('<tr>');
        }
        var c = display_display(node.children[ii]);
        if (display_data['Preferences']['debug_suivi']) {
            t.push('<td>' + (c || ('<span class="displaygrey">'
                + node.children[ii].name + '</span>')));
            i++;
        }
        else {
            if (c !== '') {
                t.push('<td>' + c);
                i++;
            }
        }
    }
    if (i % 2 == 1)
        t.push('<td>&nbsp;');
    t.push('</tr></table>');
    return t.join('');
}
DisplayLinksTable.need_node = ['Preferences'];

function DisplayTT(node) {
    return '<TABLE class="colored"><tr><th>' + _("MSG_suivi_student_tt") + '</tr>'
        + '<tr><td>' + html(node.data).replace(/\n/g, '<br>') + '</tr></table>';
}

function get_monday(date) {
    date = new Date(date.getTime() - (date.getDay() - 1) * 86400000);
    return date.formate('%d/%m/%Y');
}

function DisplayP_template(node) {
    if (node.data.length == 0)
        return '';
    var t = ['<style>',
        '.P TD { font-family: emoji ;font-size: 50%; vertical-align:top; cursor:pointer }',
        'DIV.ptip { font-size: 200%; padding: 1em; white-space: nowrap }',
        '</style><table class="colored P"><tr><th>',
        '<span style="color:#080">', pre.toLowerCase(), '</span>/',
        '<span style="color:#F00">', abi.toLowerCase(), '</span>/',
        '<span style="color:#00F">', abj.toLowerCase(), '</span>'
    ];
    var day_names = eval(_("MSG_days_full"));
    for (var i = 1; i < 6; i++)
        t.push("<th>" + day_names[i].substr(0, 3));
    var week = ''; // Monday date
    var wday; // Day of the week
    var morning, ok, infos;
    for (var i in node.data) {
        var d = node.data[i][0];
        var year = Number(d.substr(0, 4));
        var month = Number(d.substr(5, 2)) - 1;
        var date = Number(d.substr(8, 2));
        var hour = Number(d.substr(11, 2));
        var minute = Number(d.substr(14, 2));
        d = new Date(year, month, date, hour, minute);
        var monday = get_monday(d);
        if (monday != week) {
            t.push('</tr><tr><th>' + monday + '<td>');
            week = monday;
            wday = 1;
            morning = true;
        }
        for (var j = d.getDay() - wday; j > 0; j--) {
            t.push('<td>');
            morning = true;
        }
        wday = d.getDay();
        if (hour > 12 && morning) {
            morning = false;
            t.push("<BR>");
        }
        ok = node.data[i][1][0].replace('@', '');
        if (is_pre[ok])
            ok = '🟢';
        else if (is_abj[ok])
            ok = '🔵';
        else
            ok = '🔴';
        infos = node.data[i][1][1].split(' ')
        t.push(hidden_txt(ok, '<div class="ptip">'
            + two_digits(hour) + ':' + two_digits(minute) + '<br>'
            + infos[0] + '<br>' + infos[1] + '</div>'));
    }
    t.push('</tr></table>');
    return t.join('');
}


function memberof_tree(lines, line, column, max, need_tr) {
    var i;
    for (i = line + 1; i < max; i++) {
        if (lines[i][column] !== lines[i - 1][column])
            break;
    }
    var nb = i - line;
    var s = '';
    if (need_tr)
        s += '<tr>';
    s += '<td rowspan="' + nb + '">' + lines[line][column];
    if (lines[line][column + 1] === undefined)
        return { 'html': s + '</tr>', 'nb': 1 };
    i = line;
    need_tr = false;
    while (i < line + nb) {
        var r = memberof_tree(lines, i, column + 1, line + nb, need_tr);
        s += r['html'];
        i += r['nb'];
        need_tr = true;
    }
    return { 'html': s, 'nb': nb };
}

function DisplayMemberOf(node) {
    if (!is_a_teacher)
        return '';
    var grp, reversed = [];
    for (var i in node.data[0]) {
        grp = node.data[0][i].split(',');
        grp.reverse();
        reversed.push(grp);
    }
    reversed.sort();

    // The 'overflow' indicates to the tip framework to not hide the tip
    var mo = '<div style="overflow:scroll; height:20em;overflow-x: hidden">'
        + '<table class="memberof">';
    for (var i = 0; i < reversed.length;) {
        var r = memberof_tree(reversed, i, 0, reversed.length, true);
        mo += r['html'];
        i += r['nb'];
    }
    mo += '</table></div>';

    var etapes = '';
    for (var i in node.data[1])
        etapes += ' ' + hidden_txt(node.data[1][i][0], html(node.data[1][i][1]));

    return hidden_txt(_("MSG_suivi_student_memberof"), mo)
        .replace('<div class="text">', '<div class="text" instanttip="1">') + etapes;
}

function DisplayACLS(node) {
    if (node.data === undefined || !is_a_teacher)
        return '';
    var groups = [];
    for (var i in node.data)
        groups.push(i);
    groups.sort();
    var s = [];
    for (var i in groups) {
        i = groups[i];
        s.push(node.data[i] ? i : '<span style="color: #888">' + i + '</span>');
    }
    return '<div style="font-size: 80%">ACLS: ' + s.join(", ") + '</div>';
}

function DisplayStudents(node) {
    var s = _("MSG_suivi_student_contact_for") + '<table class="colored">';
    for (var i in node.data) {
        s += '<tr>';
        for (var j in node.data[i])
            s += '<td>' + html(node.data[i][j] || '');
        s += '</tr>';
    }
    return s + '</table>';
}

function DisplayTables(node) {
    var s = [];
    if (node.data.length == 0)
        return '';
    node.data.sort();
    s.push('<hr>' + _("MSG_suivi_student_ue_changes"));
    for (var year = node.data[0][0]; year <= node.data[node.data.length - 1][0]; year++) {
        for (var sem = 0; sem < semesters.length; sem++) {
            var semester = semesters[sem];
            var ss = [];
            for (var i in node.data)
                if (node.data[i][0] == year && node.data[i][1] == semester)
                    ss.push('<a target="_blank" href="'
                        + add_ticket(year
                            + '/' + semester + '/' + node.data[i][2]
                            + '/=full_filter=@' + display_data['Login']) + '">'
                        + node.data[i][2] + '</a><sup>'
                        + hidden_txt(node.data[i][3],
                            _("TH_suivi_student_nr_grades"))
                        + '</sup> ');
            if (ss.length)
                s.push('<tr><td>' + year + '&nbsp;' + semester + '<td>'
                    + ss.join('') + '</tr>');
        }
    }
    return '<table class="colored">' + s.join('') + '</table>';
}
DisplayTables.need_node = ['Tables', 'Login'];

function DisplayMoreOnSuivi(node) {
    return node.data;
}


function tomuss_plusone() {
    gapi.plusone.render('tomuss_plusone',
        {
            'href': "http://perso.univ-lyon1.fr/thierry.excoffier/TOMUSS/home.html",
            'size': 'medium'
        }
    );

    function facebook(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&appId=527673290646131&version=v2.0";
        fjs.parentNode.insertBefore(js, fjs);
    };
    facebook(document, 'script', 'facebook-jssdk');
}

function DisplayAdvertising(node) {
    if (node.data == false)
        return '';
    if (!tomuss_plusone.done) {
        setTimeout(tomuss_plusone, 1000);
        tomuss_plusone.done = true;

        var po = document.createElement('script');
        po.type = 'text/javascript';
        po.async = true;
        po.defer = true;
        po.src = 'https://apis.google.com/js/platform.js';
        the_body.appendChild(po);
    }

    return '<div id="fb-root"></div><div style="margin-top:1em;"><small>' + _("DisplayAdvertising")
        + '&nbsp;:</small><br><div id="tomuss_plusone"></div><br>'
        + '<div class="fb-like" data-href="http://perso.univ-lyon1.fr/thierry.excoffier/TOMUSS/home.html" data-layout="button_count" data-action="like" data-show-faces="false" data-share="false"></div>';
}
DisplayAdvertising.need_node = [];


function DisplaySetReferentDo(student, t) {
    var answer = prompt(_("MSG_suivi_student_set_referent_name"));
    if (answer !== null && answer !== '') {
        t.parentNode.innerHTML +=
            '<br><IFRAME style="width:100%;height:5em" src="'
            + add_ticket('referent_set_force/' + answer + '/' + student)
            + '"></IFRAME>';
    }
}


function DisplaySetReferent(_node) {
    if (!is_a_teacher)
        return '';
    return '<div id="DisplaySetReferent"><a onclick="DisplaySetReferentDo(\''
        + display_data['Login'] + '\',this)">'
        + _("MSG_suivi_student_set_referent") + '</a></div>';
}
DisplayAdvertising.need_node = ['SetReferent', 'Login'];


function DisplayGrpMessages(node) {
    var s = '';
    for (var i in node.data)
        s += '<div>' + node.data[i] + '</div>';
    return s;
}

function DisplayToTextual(_node) {
    var today = new Date();
    var img = special_days[today.getDate() + '/' + (today.getMonth() + 1)] || "●";

    return '<a href="' + add_ticket(display_data['Login'], '*') + '"'
        + (img == "●" ? '' : ' style="font-size:200%"') + '>'
        + img + '<span style="color: #FFF;font-size: 2px; opacity: 0.1">'
        + _("MSG_T_to_textual") + '</span></a>';
}
DisplayToTextual.need_node = ['Login'];

function DisplayT_Title(_node) {
    the_body.className = 'textual';
    return '<title>TOMUSS</title>' + year + ' ' + semester + ', '
        + display_data['T_Names'][0] + ' '
        + display_data['T_Names'][1] + ', '
        + display_data['Login'] + ', '
        + display_data['T_Names'][2] + '<br>'
        + _("MSG_suivi_student_important");
}
DisplayT_Title.need_node = ['T_Names', 'Login'];

function DisplayT_Message(node) {
    return '<section><h2>' + html(node.data) + '</h2></section>';
}

function DisplayT_Messages(node) {
    var m = DisplayMessages(node);
    var s = '';
    s += '<p>' + m + '</p>';
    for (var i in node.data)
        s += '<p>' + node.data[i] + '</p>';
    if (s === '')
        return "";
    return '<section><h2>' + _("MSG_T_Messages") + '</h2>' + s + '</section>';
}
DisplayT_Messages.need_node = ['Abjs'];


function DisplayT_Grades_Lasts(_node) {
    display_data['Grades'] = display_data['T_Grades']; // Compatibility
    var one_month = millisec() - 30 * 24 * 3600000;
    var s = DisplayLastGradesList(one_month);
    var t = [];
    for (var i in s) {
        DisplayUEGradesInit(s[i][0]);
        DisplayGrades.ue = s[i][0];
        DisplayGrades.column = columns[s[i][1]];
        DisplayGrades.column.modifiable_backup = DisplayGrades.column.modifiable;
        DisplayGrades.column.modifiable = false;
        t.push(DisplayT_Grades_Cell(true));
        DisplayGrades.column.modifiable = DisplayGrades.column.modifiable_backup;
    }
    return '<section><h2>' + _("MSG_T_last_grades") + '</h2>' + t.join("")
        + '</section>';
}
DisplayT_Grades_Lasts.need_node = ['T_Grades'];

var translated_acronyms = ["abi", "abj", "pre", "tnr", "ppn"];

function DisplayT_Grades_Cell(display_ue) {
    var column = DisplayGrades.column;
    DisplayGrades.cell = line[column.data_col];
    DisplayGrades.value = DisplayGrades.cell.value;
    if (DisplayGrades.value === '')
        DisplayGrades.value = column.empty_is;
    if (DisplayGrades.value === '' && !cell_modifiable_on_suivi())
        return '';
    DisplayGrades.cellstats = DisplayGrades.ue.stats[column.the_id] || {};
    var sep = '<p>';
    var formula = '';
    var cellstats = DisplayGrades.cellstats;
    var cell = DisplayGrades.cell;
    if (column.average_from && column.average_from.length) {
        formula = [];
        for (var i in column.average_columns) {
            var col = columns[column.average_columns[i]];
            var s = html(col.title).replace(/[-_]/g, " ");
            if (column.type == 'Moy')
                s += ' ' + _("MSG_T_weight") + ' ' + col.weight;
            formula.push(s);
        }
        formula = sep + _('B_' + column.type)
            + (column.type == 'Weighted_Percent' || column.type == 'Nmbr'
                ? " '" + html(column.test_filter) + "'"
                : '')
            + ' : ' + formula.join(', ');
    }
    var formatted = column.real_type.formatte_suivi()
        .replace(RegExp('>/([0-9])'), '>' + _('MSG_T_on') + '$1')
        .replace(/0*<small/g, '<small')
        .replace(/[.]<small/g, '<small');
    var column_comment = html(column.comment);
    if (DisplayGrades.column.real_type.hide_column_comment)
        column_comment = '';
    var comment = html(cell.comment);
    if (DisplayGrades.column.real_type.hide_cell_comment)
        comment = '';
    if (!cell_modifiable_on_suivi()) {
        //  PRST → Present
        for (var i in translated_acronyms)
            formatted = formatted.replace(RegExp(_(translated_acronyms[i])),
                _('MSG_T_' + translated_acronyms[i]).toLowerCase());
        if (column.type == 'Notation') {
            // The only case is the Notation column type
            var tip = formatted.replace(/.*(<table.*<.table>).*/, "$1");
            comment = tip.replace("<table", '<table style="width:auto"');
        }
    }
    return '<section><h4>'
        + (display_ue ? html(DisplayGrades.ue.ue)
            + ' ' + html(DisplayGrades.ue.table_title || '') + ', ' : '')
        + html(column.title.replace(/[-_]/g, ' '))
        + ' : ' + formatted
        + ((column.grade_type || 0) > 0
            ? '. ' + _('SELECT_column_grade_type_' + column.grade_type).substr(4)
            + '. '
            + _('SELECT_column_grade_session_' + column.grade_session).substr(4).split(' (')[0]
            : '')
        + '</h4>'
        + (column_comment
            ? sep + _('MSG_T_column_comment') + ' ' + column_comment
            : '')
        + (comment
            ? sep + _('MSG_T_cell_comment') + ' ' + comment
            : '')
        + (cell.author.length > 1
            ? sep + _('MSG_T_cell_author') + ' ' + html(cell.author.replace(/[.]/, ' '))
            : '')
        + (cell.author.length > 1
            ? sep + _('MSG_T_cell_date') + ' ' + date_full(cell.date)
            : '')
        + formula
        + (cellstats && column.real_weight_add && cellstats.rank !== undefined
            ? sep + _('MSG_T_rank_global') + ' ' + (cellstats.rank + 1)
            + _('MSG_T_on') + DisplayGrades.cellstats.nr
            : '')
        + (cellstats && column.real_weight_add && cellstats.rank_grp !== undefined
            && cellstats.nr_in_grp != cellstats.nr
            ? sep + _('MSG_T_rank_group')
            + ' ' + (cellstats.rank_grp + 1)
            + _('MSG_T_on') + cellstats.nr_in_grp
            : '')
        + (cellstats && cellstats.average !== undefined
            ? sep + _('MSG_T_average') + ' ' + cellstats.average.toFixed(2)
            + sep + _('MSG_T_mediane') + ' ' + cellstats.mediane.toFixed(2)
            : '')
        + (column.type == 'Ue_Grade'
            ? ue_grade_formula()
            : '')
        + '</section>'
        ;
}


function DisplayT_Grades(_node) {
    display_data['Grades'] = display_data['T_Grades']; // Compatibility
    var grades = display_data['T_Grades'][0];
    var u = [];
    for (var ue in grades) {
        ue = grades[ue];
        DisplayGrades.ue = ue;
        DisplayUEGradesInit(ue);
        var ordered_columns = column_list_all();
        var g = [];
        for (var data_col in ordered_columns) {
            data_col = ordered_columns[data_col];
            if (data_col < 3)
                continue;
            if (columns[data_col].freezed == "C")
                continue;
            DisplayGrades.column = columns[data_col];
            g.push(DisplayT_Grades_Cell());
        }
        u.push('<section><h3>' + ue.ue + ' ' + html(ue.table_title || '')
            + ((ue.masters && ue.masters.length != 0)
                ? ', ' + _("MSG_T_masters") + ' ' + DisplayUEMasters()
                : '')
            + '</h3>'
            + (ue.comment && ue.comment !== '' ? _('MSG_cell_message')
                + add_link_on_url(html(ue.comment)) : '')
            + '<a name="' + ue.ue + '">' + g.join('') + '</a></section>');
    }
    u.sort();

    return '<section><h2>' + _("MSG_T_UEs") + '</h2>' + u.join("") + '</section>';
}
DisplayT_Grades.need_node = ['T_Grades', 'Login'];

function DisplayT_Abjs(node) {
    display_data['Abjs'] = display_data['T_Abjs']; // Compatibility
    var m = DisplayAbjs(node);
    if (m)
        return '<section><h2>' + _("MSG_T_Abjs") + '</h2>' + m + '</section>';
    else
        return '';
}

function DisplayT_DA(node) {
    display_data['DA'] = display_data['T_DA']; // Compatibility
    var m = DisplayDA(node);
    if (m)
        return '<section><h2>' + _("TITLE_abjtt_da") + '</h2>' + m + '</section>';
    else
        return '';
}

function DisplayT_TT(node) {
    display_data['TT'] = display_data['T_TT']; // Compatibility
    var m = DisplayTT(node);
    if (m)
        return '<section><h2>' + _("MSG_suivi_student_tt") + '</h2>'
            + m + '</section>';
    else
        return '';
}

function DisplayT_Semesters(node) {
    display_data['Semesters'] = display_data['T_Semesters']; // Compatibility
    var m = DisplaySemesters(node, true);
    if (m)
        return '<section><h2>' + _("MSG_suivi_student_semesters")
            + '</h2>' + m + '</section>';
    else
        return '';
}
DisplayT_Semesters.need_node = ['T_Semesters', 'Login'];

function DisplayT_LinksTable(node) {
    var s = [];
    var content = node.children[0].children;
    s.push('<ul>')
    for (var i in content) {
        c = display_display(content[i]);
        if (c !== '') {
            c = c.replace(/<div class=.(tipped|help|text)[^>]*>/g, '<div >');
            c = c.replace(/<\/?p>/g, '');
            if (c.indexOf('<div >') != -1) {
                var t = c.split('<div >');
                c = t[0] + t[3].split(/<\/?div>/)[0] + ' : '
                    + t[2].split(/<\/?div>/)[0] + '</div>';
            }
            s.push('<li>' + c);
        }
    }
    s.push('</ul>');
    return '<section><h2>' + _("MSG_T_informations") + '</h2>'
        + s.join("\n") + '</section>';
}
DisplayT_LinksTable.need_node = [];


function DisplayRSSStream(node) {
    var html = [];
    for (var stream in node.data) {
        html.push('<table class="colored">'
            + '<tr><th><div style="text-align:center">'
            + node.data[stream][1] + '</div></tr>');
        for (var i in node.data[stream][2]) {
            var news = node.data[stream][2][i];
            var titre = news[0];
            var description = news[1];
            var link = news[2];
            html.push('<tr><td><a target="_blank" href="' + link + '">')
            if (description !== '')
                titre = hidden_txt(titre, description);
            html.push(titre);
            html.push('</a></tr></td>')
        }
        html.push('</table>')
    }
    return html.join('');
}


function try_sunburst_init() {
    if (!document.getElementById("DisplaySunburst"))
        setTimeout(try_sunburst_init, 100);
    else {
        var depth = tree_depth(DisplaySunburst.root);
        var display = document.getElementById("DisplaySunburst")
        display.innerHTML = ['<canvas width="400" height="', Math.min(depth * 80, 400),
            '" info="sunburst-infos" onclick="PopupCompetencesTableRecap()" style="width: 330px"></canvas>',
            '<div id="sunburst-infos" style="border:1px solid #999; margin:0; width:100%; text-align:center; font-size: 0.9em">',
            '<p style="min-height:1em; background-color:#E8E8E8"></p>',
            '<div style="border:1px solid #303030; height:0.5em; width:100%; background-color: #CCC"></div>',
            '<p style="padding: 0 0.5em 0 0.5em; min-height: 5em"></p>',
            '</div>'].join("");
        sunburst_canvas_set(display);
        sunburst_init(display, DisplaySunburst.root, display_data['Preferences'].sunburst_hide_layers);
    }
}
function DisplaySunburst(_node) {
    window.update_competence_table_recap = update_competence_table_recap;
    return '<div id="DisplaySunburst"/>';
}
DisplaySunburst.need_node = [];

function getUeNames() {
    var ue_names = {};
    for (var the_ue of display_data['Grades'][0])
        if (!the_ue.fake_ue)
            ue_names[remove_prefix(the_ue.ue)] = the_ue.table_title;
    return ue_names;
}

// ----- Table ----------------------------------
function table_toggle_open(obj) {
    var line = get_parent_by_class(obj, "comp_line")
    var area = line.nextSibling;
    var symbol =  line.getElementsByClassName('symbol')[0];
    if (![...area.classList].includes('closed')) {
        area.classList.add('closed');
        symbol.innerText = '▶';
    } else {
        area.classList.remove('closed');
        symbol.innerText = '▼';
    }
}
function table_toggle_details(event) {
    // Update competences table
    var line = get_parent_by_class(event.target, "comp_line");
    var key = line.getAttribute('key');
    var old_line = PopupCompetencesTableRecap.detailed;

    if (old_line) {
        old_line.classList.remove('detailed');
        if (![...old_line.nextSibling.classList].includes('closed'))
            old_line.nextSibling.classList.add('closed');
        old_line.getElementsByClassName('symbol')[0].innerText = '▶';
    }

    if (old_line && key === old_line.getAttribute('key'))
        PopupCompetencesTableRecap.detailed = null;
    else {
        line.classList.add('detailed');
        PopupCompetencesTableRecap.detailed = line;
    }

    // Update details area
    var root = root_get_key(key, DisplaySunburst.root);
    if (!root)
        return;
    var canvas = line.nextSibling.getElementsByClassName('detail_histogram')[0];
    comp_draw_histogram(canvas, competence_get_evals(root));
}

function competence_table_line(branch, ue_names, compstats) {
    // The line is a title if branch.children is not empty
    // Grade
    var grade = rint(branch.rate);
    var grades_text = ['-', 'NA', 'FA', 'A', 'SA', 'AA'];
    // The grade html
    var grade_cell = '<div class="grade_box" style="background-color:'
        + OBSERVATION_COLORS[grade] + '"><p>' + grades_text[grade] + '</p></div>';
    var grade_why = display_branch_grade_why(branch, PopupCompetencesTableRecap.grade_names, student_catalog, ue_names);
    var grades = [];
    var stats_html = '';
    if (compstats && compstats[branch.key] && JSON.parse(display_data['Preferences'].display_compstats || false)) {
        var average = compstats[branch.key].average;
        var rank = compstats[branch.key].ranks[grade];
        var rank_txt = rank ? rank + ' / ' + compstats[branch.key].ranks[0] : '?';
        stats_html = hidden_txt('<div class="compstats" style="left: ' + (rint(average * 20) - 11) + '%"></div>',
            '<p>Moyenne promo : ' + PopupCompetencesTableRecap.grade_names[rint(average)] + '</p><p>Rang : ' + rank_txt + '</p>');
    }
    var is_graded = true;
    if (grade > 0)
        for (var i = 1; i < OBSERVATION_COLORS.length; i++) {
            grades.push(grade == i ? grade_cell : '<div class="grade_box"></div>');
            if (i == PopupCompetencesTableRecap.separator)
                grades.push('<div class="grade_separator"></div>');
        }
    else {
        grades.push('<div class="grade_box" style="background-color: ', OBSERVATION_COLORS[0],
            '; box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.3); flex: 1"><p>-</p></div>');
        is_graded = false;
        }
    var line_body = ['<p>', student_catalog.items[branch.key].title, '</p>',
        branch.weight ? '<div class="recap_weight">' + branch.weight + '</div>' : '',
        '<div class="grades_area">', grades.join(''), grade_why, stats_html, '</div>'].join('');
    // Children
    if (branch.children.length) {
        var items = student_catalog.items;
        var children = [...branch.children].sort((a, b) =>
            flat_descs_order(items[a.key].title, items[b.key].title));
        var ungraded_children = children.filter((a) => a.rate < 1);
        children = children.filter((a) => a.rate >= 1);

        var children_lines = [];
        for (var child of children.concat(ungraded_children))
            children_lines.push(competence_table_line(child, ue_names, compstats));
        return ['<div class="comp_line tab_selected" key="', branch.key, '" onclick="table_toggle_open(event.target)">',
            '<p class="symbol">', grade == 0 ? '▶' : '▼', '</p>', line_body,
            '</div><div class="comp_area', grade == 0 ? ' closed' : '', '">', children_lines.join(''), '</div>'].join('');
    }
    // Leaf
    var grades_html = [];
    for (var i = PopupCompetencesTableRecap.grade_names.length - 1; i > 0; i--)
        grades_html.push('<p>', i == 3 ? '<strong>' : '', PopupCompetencesTableRecap.grade_names[i], i == 3 ? '</strong>' : '', '</p>');
    var evals = competence_get_evals(branch);
    var evals_html = []
    for (var eval of evals)
        evals_html.push('<p>', eval[1], '</p>');
    for (var i = evals.length; i < 4; i++)
        evals_html.push('<p></p>');
    var onclick = branch.rate ? 'onclick="table_toggle_open(event.target);table_toggle_details(event)"' : '';
    return ['<div class="comp_line" key="', branch.key, '" ', onclick, '>',
        is_graded ? '<p class="symbol">▶</p>' : '', line_body, '</div><div class="comp_area closed">',
        '<div style="display: flex"><div class="details_grades_area">', grades_html.join(''), stats_html, '</div>',
        '<canvas class="detail_histogram"></canvas></div>',
        '<div class="details_evals_area">', evals_html.join(''), '</div></div>'].join('');
}
function update_competence_table_recap(compstats) {
    if (!window.compstats)
        window.compstats = compstats;
    var table_content = [];
    for (var child of DisplaySunburst.root.children)
        table_content.push(competence_table_line(child, getUeNames(), compstats));
    document.getElementById("competences_recap_table").innerHTML = table_content.join('');
}
function PopupCompetencesTableRecap() {
    var root = DisplaySunburst.root.children[0]
    var grade_names = [];
    for (var name of root ? display_grades_desc(student_catalog, root.key) : ['', '', '', '', '', ''])
        grade_names.push(name);
    PopupCompetencesTableRecap.separator = 2;
    PopupCompetencesTableRecap.grade_names = grade_names;

    var head_grades = [];
    for (var i = 1; i < OBSERVATION_COLORS.length; i++) {
        head_grades.push('<div class=grade_box style="background-color: ', OBSERVATION_COLORS[i],
            '; writing-mode: sideways-lr"><p>', PopupCompetencesTableRecap.grade_names[i].split(' ').slice(0, 3).join(' '), '</p></div>');
        if (i == PopupCompetencesTableRecap.separator)
            head_grades.push('<div class="grade_separator"></div>');
    }
    var pref_button = ['<div class="competences_recap_preference">', _("PARAM_competence_recap_preference"), '<input type="checkbox" onchange="SwitchCompstatsDisplay()"',
        JSON.parse(display_data['Preferences'].display_compstats || false) ? ' checked' : '', '/></div>'].join('');

    create_popup('competences_recap_popup',
        '<p>TABLEAU DES COMPETENCES</p>' + hidden_txt(pref_button, _("PARAM_comp_recap_preference_detail"))
        + '<div class="recap_weight">Coef.</div>'
        + '<div class="grades_area">' + head_grades.join('') + '</div>'
        + '<iframe id="popup_file_loader"></iframe>',
        '<div id="competences_recap_table"></div>', '', false);

    update_competence_table_recap(window.compstats)
    if (!window.compstats)      // import compstats file
        document.getElementById('popup_file_loader').contentWindow.document.write([
            '<html><head><script src="', url, '/files/0/COMPETENCES/', year, '-', semester, '-compstats.js"></script>',
            '<script>window.parent.update_competence_table_recap(window.compstats);</script></head></html>'].join(''))
    window.scrollTo({ top: 0, behavior: 'smooth'});
    PopupCompetencesTableRecap.detailed = null;
}
function SwitchCompstatsDisplay() {
    var display = !JSON.parse(display_data['Preferences'].display_compstats || false)
    display_data['Preferences'].display_compstats = display;
    update_competence_table_recap(window.compstats);
}

function competence_get_evals(root) {
    // Compute evals
    var evals = [];
    var ues = []
    for (var why of root.why.slice(1))
        ues.push(why[1])
    for (var ue of display_data['Grades'][0]) { // Get UEs
        if (ue.fake_ue || ues.indexOf(remove_prefix(ue.ue)) == -1)
            continue;

        var children_weights = {}               // Get weights       
        for (var key in ue.catalog.items) {
            var children = ue.catalog.items[key].children();
            var weights = ue.catalog.items[key].children_weights();
            if (children.join('').includes('+')) {
                children_weights[key] = {};
                for (var child of children)
                    children_weights[key][child] = weights[child];
            }
        }

        for (var data_col in ue.columns) {      // Get evals
            var column = ue.columns[data_col];
            var cell = ue.line_real[data_col];
            if (column.type != 'Competences' || !cell.value)
                continue;

            // Get grade
            var observations = observations_to_dict(cell.value);
            var aggregated = aggregate_subcomps(observations,
                ue.p_competence.formulas.subcomps, children_weights, ue.p_competence.grades_weights);
            for (var word in aggregated)
                observations[word] = aggregated[word];
            var grade = 0;                      
            for (var word in observations)
                if (word == root.key) {
                    grade = rint(observations[word]);
                    break;
                }
            evals.push([grade, column.title, cell.date_DDMMYYYY()]);
        }
    }
    evals.sort((a, b) => a[2].split('/').reverse().join('') > b[2].split('/').reverse().join(''))
    return evals;
}
function comp_draw_histogram(canvas, evals) {
    canvas.width = canvas.parentNode.offsetWidth;
    canvas.height = 250;
    if (!canvas.getContext || !evals.length)
        return;
    var ctx = canvas.getContext("2d");
    var bar_gap = canvas.width / Math.max(evals.length, 4);
    var bar_width = bar_gap / 2;
    var grade_height = canvas.height / 6;
    var global_gap = 0;

    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    for (var [rate, name, date] of evals) {
        var grade = rint(rate);
        ctx.fillStyle = observation_color(grade);
        ctx.beginPath();
        ctx.rect(global_gap + bar_width / 2, 0, bar_width, grade * grade_height);
        ctx.fill();
        global_gap += bar_gap;
    }

    // Deco
    for (var i in OBSERVATION_COLORS) {
        ctx.lineWidth = i == PopupCompetencesTableRecap.separator + 1 ? 3 : 1;
        ctx.beginPath();
        ctx.setLineDash([10, 10]);
        ctx.moveTo(0, i * grade_height);
        ctx.lineTo(canvas.width - (bar_width / 4), i * grade_height);
        ctx.stroke();
    }
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();
}
// ----- Multi semester resume ------------------

function DisplayBilanCompetences(_node) {
    if (!is_a_teacher)
        return '';

    var years = [];
    for (var year of get_ues_roots(Object.keys(display_data['UETree'])))
        years.push(year);
    DisplayBilanCompetences.years = years;
    return hidden_txt('<a style="color: blue; font-size: 0.9em" onclick="competence_bilan_try_open(DisplayBilanCompetencesPopup)" target="_blank">'
        + _("open_global_competences_bilan") + '</a>', _("MSG_suivi_on_all_educational_background"));
}
DisplayBilanCompetences.need_node = ['Login', 'UETree'];

function competence_bilan_try_open(callback = null) {
    if (!student_catalog)
        return;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", add_ticket(display_data["Semesters"][get_url_year_semester()], 'competencebilan/' + display_data['Login']), true);
    xhr.onload = function (_event) {
        if (this.readyState == 4 && callback)
            try {
                callback(JSON.parse(this.responseText.replaceAll("'", '"')));
            } catch(e) {
                alert(_("ALERT_no_competence_multi_semester"));
            }
    };
    xhr.send();
}

function DisplayBilanCompetencesPopup(resume) {
    var data = {};
    for (var ue in resume) {
        var ue_code = remove_prefix(ue);
        data[ue_code] = [];
        for (var semester of resume[ue])
            if (semester[7].length)
                data[ue_code].append(semester[7]);
    }
    DisplayBilanCompetencesPopup.data = data;
    create_popup('competence_bilan_popup', _("MSG_comp_multi_semester_bilan"),
        ['<div style="display:flex; flex-direction: column; align-items:center; padding: 0 10%">',
        '<iframe id="popup_file_loader"></iframe>',
        '<div id="competences_bilan_selector"></div><h3 id="comp-bilan-sunburst-title"></h3>',
        // Sunburst
        '<div id="global_sunburst"><canvas width="400" height="400" info="global-sunburst-infos"></canvas></div>',
        '<div id="global-sunburst-infos" style="border:1px solid #999; margin:0; width:100%; text-align:center; font-size: 0.9em">',
        '<p style="min-height:1em; background-color:#E8E8E8"></p>',
        '<div style="border:1px solid #303030; height:0.5em; width:100%; background-color: #CCC"></div>',
        '<p style="padding: 0 0.5em 0 0.5em; min-height: 5em"></p><p></p></div></div>'].join(''), '', false);

    update_competences_bilan_selector();
    if (!window.all_ues)
        document.getElementById('popup_file_loader').contentWindow.document.write([
            '<html><head><script>', UE.toString(), '</script><script src="', url_files, '/all_ues.js"></script>',
            '<script>window.parent.update_competences_bilan_selector(all_ues);</script></head></html>'].join(''))
    document.getElementsByClassName('bilan-competence-selector')[0].firstChild.checked = true;
    sunburst_canvas_set(document.getElementById('global_sunburst'));
    switch_sunburst_bilan('0');
}
function update_competences_bilan_selector(all_ues) {
    if (all_ues)
        window.all_ues = all_ues;
    var selector_html = [];
    var selector = [[0, _("comp_bilan_general_selector")]];
    for (var year of DisplayBilanCompetences.years)
        for (var child of get_ue_children_all(year)) {  // add year only if competences found
            var comps = DisplayBilanCompetencesPopup.data[remove_prefix(child)];
            if (comps && comps.length) {
                selector.push([year, window.all_ues ? window.all_ues[year] || year : year]);
                break;
            }
        }
    for (var [value, text] of selector)
        selector_html.push('<label class="bilan-competence-selector">'
            + '<input type="radio" name="bilan-comp-select" value="' + value +
            '" onclick="switch_sunburst_bilan(this.value)">' + text + '</label>');
    document.getElementById("competences_bilan_selector").innerHTML = selector_html.join('');
}
function switch_sunburst_bilan(val) {
    var data = DisplayBilanCompetencesPopup.data;
    var title = _("MSG_comp_multi_semester_bilan_on");
    if (val === '0') {
        var ue_list = Object.keys(data);
        title += _("MSG_all_educational_background");
    } else {
        var ue_list = [];
        for (var the_ue of get_ue_children_all(val)) {
            var ue_code = remove_prefix(the_ue);
            if (data[ue_code])
                ue_list.push(ue_code);
        }
        title += _("MSG_the_year") + ' ' + val + '.';
    }
    var cells = {};
    for (var ue of ue_list) {
        cells[ue] = {};
        for (var semester of data[ue])
            for (var obs of semester.split(' ')) {
                var [key, grade] = obs.split('o');
                cells[ue][key] = Number(grade);
            }
    };

    document.getElementById('comp-bilan-sunburst-title').innerText = title;
    sunburst_init(document.getElementById('global_sunburst'), student_catalog.build_root_with_grades(cells),
        display_data['Preferences'].sunburst_hide_layers);
}

function get_ue_root(code) {
    if(code)
        return get_ue_root(display_data['UETree'][code]) || code;
}
function get_ues_roots(list) {
    var roots = {};
    for(var code of list)
        roots[get_ue_root(code)] = true;
    return Object.keys(roots);
}
function get_ue_children_all(the_ue) {
    if (!DisplayUETree.all_children) {
        var children = {};
        for (var ue in display_data['UETree']) {
            var parent = display_data['UETree'][ue];
            while (parent) {
                if (children[parent])
                    children[parent].push(ue);
                else
                    children[parent] = [ue];
                parent = display_data['UETree'][parent];
            }
        }
        DisplayUETree.all_children = children;
    }
    return DisplayUETree.all_children[the_ue] || [];
}

// ----- Catalog initialization -----------------

function load_catalog() {
    var catalog_needed = need_catalog();
    if (catalog_needed == null)
        return setTimeout(load_catalog, 100);
    if (catalog_needed == false)
        return;
    var catalog_name = 'INF.js';
    var script_catalog = document.createElement('SCRIPT');
    script_catalog.defer = true;
    script_catalog.src = url + '/files/0/COMPETENCES/' + catalog_name;
    script_catalog.setAttribute('onload', 'this.onloadDone=true');
    script_catalog.onload = init_catalog_in_page;
    document.head.appendChild(script_catalog);
}
function need_catalog() {
    if (!display_data || !display_data["Grades"])
        return null;
    for (var ue of display_data["Grades"][0])
        if (!ue.fake_ue)
            for (var the_col of ue.columns)
                if (the_col.type == "Competences"
                    || the_col.type == "COMPETENCES_RESULT" || the_col.type == "COMPETENCES_GRADE")
                    return true;
    return false;
}
function init_catalog_in_page() {
    if (!display_data || !display_data["Grades"])
        return setTimeout(init_catalog_in_page, 100);

    var cells = {};
    for (var ue of display_data["Grades"][0]) {
        if (ue.fake_ue)
            continue;
        if (!ue.catalog) {
            // Init ue competences grades
            var table_attr = ue
            ue.catalog = student_catalog.copy();
            if (!table_attr.p_competence && table_attr.competence)
                table_attr.p_competence = JSON.parse(table_attr.competence);
            if (table_attr.p_competence && table_attr.p_competence.refine)
                ue.catalog.complete_with_refine(table_attr.p_competence.refine, DisplayGrades.table_attr.ue);
        }
        // Display sunburst
        if (!ue.competence)
            continue;
        var the_ue = remove_prefix(ue.ue);
        cells[the_ue] = {};
        var line = ue.line;
        for (var i in ue.columns)
            if (ue.columns[i]["type"] == "Competences" && line[i] && line[i][0])
                cells[the_ue][i] = line[i][0].split(' ');
    }
    DisplaySunburst.root = student_catalog.build_root_with_grades(get_ue_grades(cells));
    DisplaySunburst.ue_names = getUeNames();
    if (DisplaySunburst.root.children.length)
        setTimeout(try_sunburst_init, 100);
}


var toutes_les_tvl = [
  'TVL1002L',
  'TVL1004L',
  'TVL1006L',
  'TVL1007L',
  'TVL1153L',
  'TVL1184L',
  'TVL1185L',
  'TVL1193L',
  'TVL1194L',
  'TVL1203L',
  'TVL1204L',
  'TVL1205L',
  'TVL1206L',
  'TVL1220L',
  'TVL1221L',
  'TVL2001L',
  'TVL2003L',
  'TVL2004L',
  'TVL2008L',
  'TVL2009L',
  'TVL2022L',
  'TVL2025L',
  'TVL2030L',
  'TVL2031L',
  'TVL2032L',
  'TVL2081L',
  'TVL2082L',
  'TVL2110L',
  'TVL2112L',
  'TVL2120L',
  'TVL2121L',
  'TVL2122L',
  'TVL2123L',
  'TVL2138L',
  'TVL2139L',
  'TVL2143L',
  'TVL2144L',
  'TVL2145L',
  'TVL2147L',
  'TVL2149L',
  'TVL2150L',
  'TVL3006L',
  'TVL3012L',
  'TVL3013L',
  'TVL3014L',
  'TVL3024L',
  'TVL3025L',
  'TVL3026L',
  'TVL3027L',
  'TVL3030L',
  'TVL3040L',
  'TVL3044L',
  'TVL3048L',
  'TVL3054L'
] ;


var tvl_pere = {
  // Si le père n'est pas défini on lui en donne un
  'TVL1195L': 'TVL1193L',
  'TVL1186L': 'TVL1193L',
};

function DisplayUETreeHook(node)
{
  for (var fils in tvl_pere)
      if (node.data[fils] === undefined && node.data[tvl_pere[fils]])
          node.data[fils] = tvl_pere[fils];

  // XXX Cela fonctionne seulement si un seul sport dans le semestre
  var ues = display_data["Grades"][0] ;
  for(var i in ues)
  {
    var ue = remove_prefix(ues[i].ue) ;
    if ( ue.length == 7 && ue.substr(0, 3) == 'TVL' )
    {
      for(var j in ues)
	if ( ues[j].table_title
	     && ues[j].table_title.toLowerCase().indexOf("activité sportive")
	     != -1 )
      {
	node.data[ue] = remove_prefix(ues[j].ue) ;
	return ;
      }
    }
  }
}

function DisplayECUE_ok(node)
{
  if ( ! DisplayGrades.ue.ue )
    return '';
  if ( ! DisplayGrades.ue.ue.match(/TVL[1-3]/)
       || DisplayGrades.ue.ue.match(/^SP-/)
       || DisplayGrades.ue.ue.match(/M$/)
       || DisplayGrades.ue.ue == 'UE-TVL2030L'
     )
    return '' ;
  
  for(var i in display_data['Grades'][0])
  {
    if ( myindex(toutes_les_tvl,
		 display_data['Grades'][0][i].ue.substr(3, 8)) != -1 )
      return '' ;
  }
  return "La note obtenue à cet ECUE ne permettra pas d'obtenir des crédits ce semestre car il n'y a pas d'inscription en transversale." ;
}
DisplayECUE_ok.need_node = [] ;

function university_year()
{
  if ( semester == 'Automne' )
    return year ;
  return year - 1 ;
}

function DisplayIPAnnuelle(node)
{
  var title ;
  var y = node.data['year'] + '-' + (node.data['year'] + 1) ;
  var is_a_referent = display_data["GetStudent"] ;

  if ( node.data.ues === undefined )
  {
    if ( is_a_referent && is_a_teacher && DisplayFST.FST )
      return '<br><a target="_blank" style="border: 2px solid black; width:100%" href="'
      + url + '/=' + ticket + '/interface_ip/' + display_data["Login"]
      + '">Saisir l\'IP annuelle ' + y
      + '</a>' ;
    else
      return '' ;
  }
  if ( is_a_referent && is_a_teacher && DisplayFST.FST )
     title = '<a target="_blank" href="' + url + '/=' + ticket
             + '/interface_ip/' + display_data["Login"]
             + '">Cliquez ici pour faire l\'IP ' + y + '</a>'
             + "<br>IP prévisionnelle :";
  else
     title = "IP " + y + ' prévisionnelle' ;

  var s = '<table class="colored Semesters"><caption>' + title + '</caption>' ;
  var quoi ;
  if ( node.data.cache_ip_automne )
     {
       quoi = ['p'] ;
       s += '<tr><th>Printemps</tr><tr>' ;
     }
  else
     {
       quoi = ['', 'p'] ;
       s += '<tr><th>Automne<th>Printemps</tr><tr>' ;
     }
  var ss = '' ;
  var une_ue = false ;
  node.data.ues.sort() ;
  var code_ue, seq, etape, titre, rougir_sans_sequence ;
  var mois = (new Date()).getMonth() + 1;
  var jour = (new Date()).getDay();
  var date = (new Date()).getDate();
  for(var p in quoi)
     {
        p = quoi[p] ;
        s += '<td>' ;
        if (p === '') {
            ss += 'Automne :\n' ;
             // Du premier lundi de Septembre à juin
             rougir_sans_sequence = (mois >= 9 && date - jour >= 0) || mois < 7 ;
        }
        else {
            ss += 'Printemps :\n' ;
            rougir_sans_sequence = mois < 7 ; // Janvier à juin
        }
        for(ues in node.data.ues)
           {
              code_ue = node.data.ues[ues][0] ;
              seq     = node.data.ues[ues][1] ;
              etape   = node.data.ues[ues][2] ;
              titre   = node.data.ues[ues][3] ;
              au_printemps = seq.toLowerCase().substr(0,1) == 'p' ;
              if ( (p == 'p') != au_printemps )
                 continue ; // not the good semester

              une_ue = true ;
              if ( au_printemps )
                 seq = seq.substr(1) ;
              if ( seq == '')
                 seq = '?' ;
              item = hidden_txt(code_ue + '(' + seq + ')',
                 "Intitulé : " + titre + "<br>Semestre : "
                 + etape + "<br>Séquence : " + seq) + '<br>' ;
              if ( rougir_sans_sequence && seq == '?')
                 item = '<div style="background:#F00;color:#FFF">' + item
                  + "Vous n'êtes pas inscrits car il y a un dépassement d'effectif"
                  + '</div>';
              s += item ;
              ss += '    ' + code_ue + ' Séq. ' + seq + ', Semestre '
                     + etape + ', ' + titre + '\n' ;
           }
     }
  if ( ! une_ue )
      s += "Pas d'IP prévisionnelle" ;
  s += '</tr></table>' ;
  if ( display_data['FFSU'].indexOf("sportif") == -1 )
    s += "Sport niveau 1 : Initiation et perfectionnement" ;
  else
    s += "Sport niveau 2 : Pratique sportive compétitive" ;
  if ( display_data['FFSU'].indexOf("SHN") != -1 )
    s += "<br>Sportif Haut Niveau" ;

  return s ;
}
DisplayIPAnnuelle.need_node = ['IPAnnuelle', 'GetStudent', 'Login', 'FFSU'] ;

function DisplaySOIE(node) // To remove
{
}

/*
function DisplayLogo(node)
{
  return '<a target="_blank" href="http://www.univ-lyon1.fr"><img src="' + url_files + '/logo_ucbl2.png"></a>' ;
}
*/

var groupes_ldap = {
  'CN=SCT': [0, '<b>Licence STS</b>',
            'http://sciences-licence.univ-lyon1.fr/'],
  'CN=DBI': [2, 'Dpt Biologie'    , 'https://ufr-biosciences.univ-lyon1.fr/'],
  'CN=DCB': [2, 'Dpt Chimie/Bioch', 'https://fs-chimie.univ-lyon1.fr/'],
  'CN=DGE': [2, 'Dpt GEGP'        , 'https://fst-gep.univ-lyon1.fr/'],
  'CN=DIN': [2, 'Dpt Informatique', 'https://fst-informatique.univ-lyon1.fr/'],
  'CN=DMA': [2, 'Dpt Mathématique', 'https://fst-mathematiques.univ-lyon1.fr/'],
  'CN=DME': [2, 'Dpt Mécanique'   , 'https://fst-meca.univ-lyon1.fr/'],
  'CN=DPY': [2, 'Dpt Physique'    , 'https://fst-physique.univ-lyon1.fr/'],
  'CN=SPT': [1, 'UFR STAPS'       , 'https://ufr-staps.univ-lyon1.fr/']
} ;

function DisplayFST(node)
{
  var annee = ',OU=Groupes_' + university_year() ;
  var s = ['', '', ''] ;
  
  for(var grp in display_data['MemberOf'][0])
  {
    grp = display_data['MemberOf'][0][grp] ;
    for(var clef in groupes_ldap)
    {
      if (grp.indexOf(clef + annee) != -1 )
      {
	var info = groupes_ldap[clef] ;
        s[info[0]] = '<a class="Display" target="_blank" href="'
          + info[2] + '">' + info[1] + '</a>' ;
        if ( clef == 'N=SCT' )
            DisplayFST.FST = true ; // Même si enseignant non FST
      }
    }
  }
  DisplayFST.s = s ;
  for(var grp in node.data)
  {
    if ( node.data[grp].match('UFR Sciences et Technologies|UFR Biosciences|UFR Faculté Science|UFR Scien. et Techn|PE.OBSERVATOIRE|composante Mécanique|Comp GEP') )
      DisplayFST.FST = true ;
  }
  return '<a target="_blank" href="http://www.univ-lyon1.fr">'
  + 'Université Claude Bernard</a><br>' + s.join('<br>') ;
}
DisplayFST.need_node = ['MemberOf', 'FST'] ;

function DisplaySTS(node)
{
  if ( DisplayFST.s )
    return DisplayFST.s[0] ;
}
DisplaySTS.need_node = ['FST'] ;

function DisplayBilanAPOGEE(node)
{
  if ( ! is_a_teacher || username.match(/^.[0-9]/) )
    return '' ;
  var is_a_referent = display_data["GetStudent"] ;
  if ( ! is_a_referent )
    return '' ;
  return hidden_txt('<a style="color:#F00" href="'
        + add_ticket(node.data.replace(/\/$/,''), display_data['Login'])
        + '" target="_blank">Bilan de notes avant jury</a>',
		 'NE PAS DONNER CES INFORMATIONS AUX ETUDIANTS'
		 ) + '</a><br>' + hidden_txt('<a style="color:#F00" href="'
     + add_ticket('genere_bilan_pdf/Arbre-Note-Resultat-Session-Rang-Credit-BLOC-AN-UE-EC-EPREUVE-DernierResultat-CodeApogee/' + display_data['Login'])
     + '" target="_blank">Extraction Apogée</a>',
    'NE PAS DONNER CES INFORMATIONS AUX ETUDIANTS');
}
DisplayBilanAPOGEE.need_node = ['Login', 'GetStudent', 'BilanAPOGEE'] ;

function DisplayFFSU(node)
{
  var t = [] ;
  if ( node.data.indexOf("sportif") != -1 )
    t.push(hidden_txt('<img style="height:1em" src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/sportif.png">',
		      'Sport niveau 2 : Pratique sportive compétitive')) ;
  if ( node.data.indexOf("SHN") != -1 )
    t.push(hidden_txt('🚲', 'Sportif Haut Niveau')) ;
  if ( node.data.indexOf("team") != -1 )
    {
      var team = node.data.split('team')[1].substr(0, 1) ;
      var label = team == 'A' ? 'j<b>A</b>une' : '<b>B</b>leu' ;
      t.push(hidden_txt('<span class="team' + team + '">' + label + '</span>',
                        'Équipe pour le présentiel')) ;
    }
  return t.join(' ') ;
}
function DisplayRdV(node)
{
  return '<span style="background: #8F8">Rendez-vous IP : ' +
    (node.data === 'NUIT'
     ? "La base de données étant arrêtée la nuit et pendant les vacances, on ne peut savoir si vous avez un rendez-vous IP ou non. Réessayez plus tard."
     : (node.data[0] + ' avec ' + displaynames(node.data[1])
	+ (display_data["Referent"][2] == node.data[1][2]
	   ? ''
	   : '' // " car votre enseignant référent n'est pas disponible."
	   )
	+ (is_a_teacher
	   ? ' (' + node.data[2] + ')'
	   : ''
	  )
	)
    );
}
DisplayRdV.need_node = ['Referent', 'RdV'] ;

function DisplayIA_scol(node)
{
  if ( ! is_a_teacher )
    return '' ;
  var s = ['<table class="colored">',
	  '<tr><th>Date IA<th>Code</tr>'
	  ] ;
  for(var i in node.data)
    s.push("<tr><td>" + node.data[i][0] + "<td>" + node.data[i][1] + '</tr>') ;
  s.push('</table>') ;
  return s.join('') ;
}

function DisplayOfficial(node)
{
  return hidden_txt('<a href="'
    + add_ticket(url_suivi + "/affichage_bilan_etudiant", display_data['Login'])
    + '" target="_blank">'
    + _("MSG_suivi_student_official_bilan")
    + '</a>',
         _("TIP_suivi_student_official_bilan")
         ) ;
}

function update_edt()
{
  var edt = document.getElementById('edt');
  if(edt) {
    if(edt.nextSibling)
      return; // Yet appended
    if (display_data['Grades']) {
      var link = document.createElement('A');
      var ade = [];
      for(var ue of display_data['Grades'][0]) {
        if ( ue.ue.match('.*TVL.*') )
          continue;
        var code = codes_ue_ade[ue.ue.split('-')[1]];
        if(!code)
          continue;
        var grp = ue.line[3][0] || '';
        var seq = (ue.line[4][0] || '').replace('HS', '6');
        var code_ade = code['a' + seq + grp]
            || code[seq + grp]
            || code['a' + seq]
            || code[seq]
            || code['a' + grp]
            || code[grp]
            || code['a']
            || code[''];
        if(code_ade)
          ade.push(code_ade);
      }
      if(ade.length) {
        link.innerText = 'Version alternative';
        link.style.display = 'block';
        link.style.color = '#00F';
        link.style.cursor = 'pointer';
        link.target = '_blank';
        link.href = 'https://edt.univ-lyon1.fr/portal?originPage=calendar&resourcesIds=' + ','.join(ade);
        edt.after(link);
      }
      return;
    }
  }
  setTimeout(update_edt, 1000);
}

setTimeout(update_edt, 3000);


function preferences_hook(preferences)
{
  return preferences
     + '<hr><p>'
     + 'Utilisez le site '
     + '<a target="_blank" '
    + 'href="https://rgpd.univ-lyon1.fr"'
     + '>RGPD</a> pour cacher ou montrer votre photo.' ;
}


codes_ue_ade = {
"ACT1006L":{"2":42389,"2A":42390,"2B":43795,"2C":47643,"2D":54188,"p2A":42390,"p2B":43795,"p2C":47643,"p2D":54188},
"ACT1007L":{"1":42395,"1A":42396,"1B":43800,"1C":47659,"1D":54193,"p1A":42396,"p1B":43800,"p1C":47659,"p1D":54193},
"ACT2003L":{"1":42401,"1A":42402,"1B":43805,"1C":47664,"1D":54323,"p1A":42402,"p1B":43805,"p1C":47664,"p1D":54323},
"ACT2004L":{"5":42407,"5A":42408,"5B":43811,"5C":47669,"5D":54328,"p5A":42408,"p5B":43811,"p5C":47669,"p5D":54328},
"ACT2005L":{"2":42413,"2A":42414,"2B":43816,"2C":47674,"2D":54333,"p2A":42414,"p2B":43816,"p2C":47674,"p2D":54333},
"ACT3203L":{"1":42565,"1A":42566,"1B":43821,"1C":47801,"1D":54338,"p1A":42566,"p1B":43821,"p1C":47801,"p1D":54338},
"ACT3204L":{"5":42571,"5A":42572,"5B":43826,"5C":47806,"5D":54343,"p5A":42572,"p5B":43826,"p5C":47806,"p5D":54343},
"ACT3205L":{"5":42577,"5A":42578,"5B":43900,"5C":47811,"5D":54348,"p5A":42578,"p5B":43900,"p5C":47811,"p5D":54348},
"ACT3206L":{"2":42583,"2A":42584,"2B":43905,"2C":47818,"2D":54353,"p2A":42584,"p2B":43905,"p2C":47818,"p2D":54353},
"ACT3207L":{"1":42589,"1A":42590,"1B":43910,"1C":47823,"1D":54358,"p1A":42590,"p1B":43910,"p1C":47823,"p1D":54358},
"BCH1006L":{"1":42759,"1A":42760,"1B":43930,"1C":45167,"1D":54499,"1E":100012,"1F":100017,"2":38729,"2A":42765,"2B":38730,"2C":45172,"2D":54504,"3":38733,"3A":42770,"3B":38734,"3C":45179,"3D":54509,"3E":99209,"3F":99214,"3G":110174,"p1A":42760,"p1B":43930,"p1C":45167,"p1D":54499,"p1E":100012,"p1F":100017,"p2A":42765,"p2B":38730,"p2C":45172,"p2D":54504,"p3A":42770,"p3B":38734,"p3C":45179,"p3D":54509,"p3E":99209,"p3F":99214,"p3G":110174},
"BCH1007L":{"4":38739,"4A":42775,"4B":38740,"4C":45185,"4D":54514,"4E":99516,"4F":99521,"5":38745,"5A":42780,"5B":38746,"5C":45190,"5D":54519,"5E":99526,"5F":99531,"p4A":42775,"p4B":38740,"p4C":45185,"p4D":54514,"p4E":99516,"p4F":99521,"p5A":42780,"p5B":38746,"p5C":45190,"p5D":54519,"p5E":99526,"p5F":99531},
"BCH1009L":{"1":38751,"1A":42785,"1B":38752,"1C":45195,"1D":54641,"p1A":42785,"p1B":38752,"p1C":45195,"p1D":54641},
"BCH1011L":{"4":38757,"4A":42790,"4B":38758,"4C":45200,"4D":54646,"p4A":42790,"p4B":38758,"p4C":45200,"p4D":54646},
"BCH2003L":{"2":38763,"2A":42795,"2B":38764,"2C":45205,"2D":54651,"p2A":42795,"p2B":38764,"p2C":45205,"p2D":54651},
"BCH2004L":{"4":38769,"4A":42949,"4B":38770,"4C":45356,"4D":54656,"p4A":42949,"p4B":38770,"p4C":45356,"p4D":54656},
"BCH2008L":{"4":38775,"4A":42954,"4B":38776,"4C":45361,"4D":54661,"4E":100025,"5":38784,"5A":42959,"5B":38785,"5C":45366,"5D":54666,"5E":100190,"p4A":42954,"p4B":38776,"p4C":45361,"p4D":54661,"p4E":100025,"p5A":42959,"p5B":38785,"p5C":45366,"p5D":54666,"p5E":100190},
"BCH2009L":{"2":38619,"2A":42964,"2B":38622,"2C":45371,"2D":54671,"p2A":42964,"p2B":38622,"p2C":45371,"p2D":54671},
"BCH2012L":{"2":38627,"2A":42969,"2B":38628,"2C":45376,"2D":51738,"p2A":42969,"p2B":38628,"p2C":45376,"p2D":51738},
"BCH2013L":{"2":38633,"2A":42974,"2B":38636,"2C":45381,"2D":51743,"p2A":42974,"p2B":38636,"p2C":45381,"p2D":51743},
"BCH2014L":{"2":38649,"2A":42979,"2B":38651,"2C":45386,"2D":51753,"p2A":42979,"p2B":38651,"p2C":45386,"p2D":51753},
"BCH3008L":{"6":38662,"6A":43135,"6B":38663,"6C":45545,"6D":51763,"p6A":43135,"p6B":38663,"p6C":45545,"p6D":51763},
"BCH3009L":{"6":38668,"6A":43140,"6B":38669,"6C":45550,"6D":51777,"p6A":43140,"p6B":38669,"p6C":45550,"p6D":51777},
"BCH3010L":{"6":38674,"6A":43145,"6B":38675,"6C":45555,"6D":51797,"p6A":43145,"p6B":38675,"p6C":45555,"p6D":51797},
"BCH3012L":{"6":38686,"6A":43155,"6B":38687,"6C":45565,"6D":51977,"p6A":43155,"p6B":38687,"p6C":45565,"p6D":51977},
"BCH3015L":{"2":38692,"2A":43160,"2B":38693,"2C":45570,"2D":51982,"p2A":43160,"p2B":38693,"p2C":45570,"p2D":51982},
"BCH3022L":{"6":38698,"6A":43165,"6B":38699,"6C":45575,"6D":51987,"p6A":43165,"p6B":38699,"p6C":45575,"p6D":51987},
"BCH3024L":{"1":38706,"1A":39754,"1B":38707,"1C":45717,"1D":51992,"p1A":39754,"p1B":38707,"p1C":45717,"p1D":51992},
"BCH3025L":{"6":38712,"6A":39759,"6B":38713,"6C":45724,"6D":51997,"p6A":39759,"p6B":38713,"p6C":45724,"p6D":51997},
"BIO1002L":{"3":38718,"3A":39764,"3B":38719,"3C":45729,"3D":52002,"3E":96939,"3F":96944,"5":38724,"5A":39769,"5B":38725,"5C":45734,"5D":52007,"5E":96950,"5F":96955,"p3A":39764,"p3B":38719,"p3C":45729,"p3D":52002,"p3E":96939,"p3F":96944,"p5A":39769,"p5B":38725,"p5C":45734,"p5D":52007,"p5E":96950,"p5F":96955},
"BIO1003L":{"1":39774,"1A":39775,"1B":49137,"1C":45739,"1D":52015,"1E":94512,"1F":94517,"4":39780,"4A":39781,"4B":49144,"4C":45744,"4D":52248,"4E":94108,"4F":94508,"p1A":39775,"p1B":49137,"p1C":45739,"p1D":52015,"p1E":94512,"p1F":94517,"p4A":39781,"p4B":49144,"p4C":45744,"p4D":52248,"p4E":94108,"p4F":94508},
"BIO1004L":{"2":39786,"2A":39787,"2B":49149,"2C":45749,"2D":52253,"2E":94522,"2F":94527,"2G":94542,"2H":94547,"5":39792,"5A":39793,"5B":49154,"5C":45754,"5D":52259,"5E":94532,"5F":94537,"p2A":39787,"p2B":49149,"p2C":45749,"p2D":52253,"p2E":94522,"p2F":94527,"p2G":94542,"p2H":94547,"p5A":39793,"p5B":49154,"p5C":45754,"p5D":52259,"p5E":94532,"p5F":94537},
"BIO1011L":{"1":39951,"1A":39952,"1B":49159,"1C":45903,"1D":52264,"1E":100196,"1F":100201,"2":39957,"2A":39958,"2B":49164,"2C":45909,"2D":52269,"2E":100206,"2F":100211,"p1A":39952,"p1B":49159,"p1C":45903,"p1D":52264,"p1E":100196,"p1F":100201,"p2A":39958,"p2B":49164,"p2C":45909,"p2D":52269,"p2E":100206,"p2F":100211},
"BIO1014L":{"1":39963,"1A":39964,"1B":49169,"1C":45916,"1D":52274,"p1A":39964,"p1B":49169,"p1C":45916,"p1D":52274},
"BIO1016L":{"2":39969,"2A":39970,"2B":49174,"2C":45926,"2D":52280,"p2A":39970,"p2B":49174,"p2C":45926,"p2D":52280},
"BIO1018L":{"6":1571,"6A":1572,"6B":104153,"p6A":1572,"p6B":104153},
"BIO2001L":{"1":39975,"1A":39976,"1B":49327,"1C":45931,"1D":52285,"p1A":39976,"p1B":49327,"p1C":45931,"p1D":52285},
"BIO2007L":{"3":39981,"3A":39982,"3B":49333,"3C":45936,"3D":52290,"p3A":39982,"p3B":49333,"p3C":45936,"p3D":52290},
"BIO2008L":{"3":39987,"3A":39988,"3B":49338,"3C":45946,"3D":52539,"p3A":39988,"p3B":49338,"p3C":45946,"p3D":52539},
"BIO2009L":{"4":39993,"4A":39994,"4B":49345,"4C":45951,"4D":52544,"p4A":39994,"p4B":49345,"p4C":45951,"p4D":52544},
"BIO2015L":{"1":39999,"1A":40000,"1B":49352,"1C":45957,"1D":52552,"3":40148,"3A":40149,"3B":49357,"3C":46107,"3D":52558,"3E":95573,"3F":95583,"p1A":40000,"p1B":49352,"p1C":45957,"p1D":52552,"p3A":40149,"p3B":49357,"p3C":46107,"p3D":52558,"p3E":95573,"p3F":95583},
"BIO2020L":{"2":40154,"2A":40156,"2B":49362,"2C":46112,"2D":52563,"p2A":40156,"p2B":49362,"p2C":46112,"p2D":52563},
"BIO2023L":{"5":40167,"5A":40168,"5B":49369,"5C":46117,"5D":52568,"p5A":40168,"p5B":49369,"p5C":46117,"p5D":52568},
"BIO2032L":{"2":40173,"2A":40174,"2B":49393,"2C":46122,"2D":52573,"p2A":40174,"p2B":49393,"p2C":46122,"p2D":52573},
"BIO2040L":{"5":40179,"5A":40180,"5B":49554,"5C":46135,"5D":52578,"p5A":40180,"p5B":49554,"p5C":46135,"p5D":52578},
"BIO2042L":{"4":40185,"4A":40186,"4B":49559,"4C":46140,"4D":52731,"p4A":40186,"p4B":49559,"p4C":46140,"p4D":52731},
"BIO2045L":{"2":40191,"2A":40192,"2B":49565,"2C":46145,"2D":52736,"2E":50734,"2F":96152,"2G":110169,"p2A":40192,"p2B":49565,"p2C":46145,"p2D":52736,"p2E":50734,"p2F":96152,"p2G":110169},
"BIO2049L":{"1":40197,"1A":40198,"1B":49570,"1C":46150,"1D":52741,"1E":8452,"1F":15238,"1G":26312,"3":40522,"3A":40523,"3B":49575,"3C":46274,"3D":52746,"p1A":40198,"p1B":49570,"p1C":46150,"p1D":52741,"p1E":8452,"p1F":15238,"p1G":26312,"p3A":40523,"p3B":49575,"p3C":46274,"p3D":52746},
"BIO2050L":{"1":110809,"1A":110820,"1B":110815,"1C":110810,"1D":110830,"1E":110825,"p1A":110820,"p1B":110815,"p1C":110810,"p1D":110830,"p1E":110825},
"BIO2051L":{"2":40528,"2A":40529,"2B":49580,"2C":46279,"2D":52751,"5":40593,"5A":40600,"5B":49587,"5C":46284,"5D":52756,"5E":98734,"5F":98739,"p2A":40529,"p2B":49580,"p2C":46279,"p2D":52751,"p5A":40600,"p5B":49587,"p5C":46284,"p5D":52756,"p5E":98734,"p5F":98739},
"BIO2052L":{"2":38220,"2A":39396,"2B":38221,"2C":49668,"2D":45146,"2E":96928,"2F":96933,"2G":96935,"2H":96937,"4":38227,"4A":39401,"4B":38228,"4C":49673,"4D":45153,"4E":96909,"4F":96914,"4G":96916,"4H":96918,"4I":96920,"4J":96922,"4K":96924,"4L":96926,"p2A":39396,"p2B":38221,"p2C":49668,"p2D":45146,"p2E":96928,"p2F":96933,"p2G":96935,"p2H":96937,"p4A":39401,"p4B":38228,"p4C":49673,"p4D":45153,"p4E":96909,"p4F":96914,"p4G":96916,"p4H":96918,"p4I":96920,"p4J":96922,"p4K":96924,"p4L":96926},
"BIO2053L":{"3":38234,"3A":39406,"3B":38240,"3C":49678,"3D":45158,"5":38245,"5A":39411,"5B":38246,"5C":49683,"5D":45163,"5E":98881,"5F":98886,"p3A":39406,"p3B":38240,"p3C":49678,"p3D":45158,"p5A":39411,"p5B":38246,"p5C":49683,"p5D":45163,"p5E":98881,"p5F":98886},
"BIO2054L":{"3":38251,"3A":39416,"3B":38252,"3C":49688,"3D":45309,"p3A":39416,"p3B":38252,"p3C":49688,"p3D":45309},
"BIO2055L":{"6":38257,"6A":39421,"6B":38258,"6C":49693,"6D":45314,"p6A":39421,"p6B":38258,"p6C":49693,"p6D":45314},
"BIO2058L":{"1":102067,"1A":102073,"1B":102068,"1C":102083,"1D":102078,"5":110435,"5A":110446,"5B":110451,"5C":110436,"5D":110441,"p1A":102073,"p1B":102068,"p1C":102083,"p1D":102078,"p5A":110446,"p5B":110451,"p5C":110436,"p5D":110441},
"BIO3008L":{"6":38269,"6A":39431,"6B":38270,"6C":49703,"6D":45331,"p6A":39431,"p6B":38270,"p6C":49703,"p6D":45331},
"BIO3009L":{"3":38275,"3A":39436,"3B":38276,"3C":50160,"3D":45336,"p3A":39436,"p3B":38276,"p3C":50160,"p3D":45336},
"BIO3011L":{"4":38281,"4A":39441,"4B":38282,"4C":50165,"4D":45341,"p4A":39441,"p4B":38282,"p4C":50165,"p4D":45341},
"BIO3012L":{"1":38287,"1A":39446,"1B":38288,"1C":50170,"1D":103450,"p1A":39446,"p1B":38288,"p1C":50170,"p1D":103450},
"BIO3013L":{"3":38296,"3A":39451,"3B":38298,"3C":50175,"3D":45351,"p3A":39451,"p3B":38298,"p3C":50175,"p3D":45351},
"BIO3036L":{"4":38303,"4A":39456,"4B":38304,"4C":50180,"4D":45499,"4E":99204,"p4A":39456,"p4B":38304,"p4C":50180,"p4D":45499,"p4E":99204},
"BIO3037L":{"2":38309,"2A":39461,"2B":38310,"2C":50185,"2D":45504,"p2A":39461,"p2B":38310,"p2C":50185,"p2D":45504},
"BIO3038L":{"5":38315,"5A":39466,"5B":38316,"5C":50190,"5D":45509,"p5A":39466,"p5B":38316,"p5C":50190,"p5D":45509},
"BIO3039L":{"1":38321,"1A":39471,"1B":38322,"1C":50195,"1D":45514,"p1A":39471,"p1B":38322,"p1C":50195,"p1D":45514},
"BIO3043L":{"6":38327,"6A":39476,"6B":38328,"6C":50326,"6D":45522,"p6A":39476,"p6B":38328,"p6C":50326,"p6D":45522},
"BIO3060L":{"6":38333,"6A":39481,"6B":38334,"6C":50331,"6D":45527,"p6A":39481,"p6B":38334,"p6C":50331,"p6D":45527},
"BIO3079L":{"5":38339,"5A":39486,"5B":38340,"5C":50336,"5D":45532,"p5A":39486,"p5B":38340,"p5C":50336,"p5D":45532},
"BIO3083L":{"3":38345,"3A":39491,"3B":38346,"3C":50341,"3D":45538,"p3A":39491,"p3B":38346,"p3C":50341,"p3D":45538},
"BIO3085L":{"1":38351,"1A":39496,"1B":38352,"1C":50346,"1D":45673,"p1A":39496,"p1B":38352,"p1C":50346,"p1D":45673},
"BIO3087L":{"2":38357,"2A":39501,"2B":38358,"2C":50351,"2D":45678,"p2A":39501,"p2B":38358,"p2C":50351,"p2D":45678},
"BIO3093L":{"6":38363,"6A":39506,"6B":38364,"6C":50356,"6D":45683,"p6A":39506,"p6B":38364,"p6C":50356,"p6D":45683},
"BIO3100L":{"6":38369,"6A":39511,"6B":38370,"6C":50361,"6D":45691,"p6A":39511,"p6B":38370,"p6C":50361,"p6D":45691},
"BIO3112L":{"3":38375,"3A":39516,"3B":38376,"3C":50528,"3D":45696,"p3A":39516,"p3B":38376,"p3C":50528,"p3D":45696},
"BIO3113L":{"4":38406,"4A":39522,"4B":38407,"4C":50533,"4D":45701,"p4A":39522,"p4B":38407,"p4C":50533,"p4D":45701},
"BIO3114L":{"1":38412,"1A":39527,"1B":38413,"1C":50538,"1D":45706,"p1A":39527,"p1B":38413,"p1C":50538,"p1D":45706},
"BIO3115L":{"5":38418,"5A":39532,"5B":38419,"5C":50543,"5D":45711,"p5A":39532,"p5B":38419,"p5C":50543,"p5D":45711},
"BIO3118L":{"3":38424,"3A":39537,"3B":38425,"3C":50549,"3D":46402,"p3A":39537,"p3B":38425,"p3C":50549,"p3D":46402},
"BIO3119L":{"6":38430,"6A":39542,"6B":38431,"6C":50554,"6D":46408,"p6A":39542,"p6B":38431,"p6C":50554,"p6D":46408},
"BIO3120L":{"2":38436,"2A":39547,"2B":38437,"2C":50559,"2D":46413,"p2A":39547,"p2B":38437,"p2C":50559,"p2D":46413},
"BIO3122L":{"1":38442,"1A":39552,"1B":38443,"1C":50564,"1D":46418,"p1":6577,"p1A":39552,"p1B":38443,"p1C":50564,"p1D":46418},
"BIO3123L":{"1":38448,"1A":39557,"1B":38449,"1C":50704,"1D":46424,"p1A":39557,"p1B":38449,"p1C":50704,"p1D":46424},
"BIO3125L":{"3":38454,"3A":39562,"3B":38455,"3C":50716,"3D":46429,"p3A":39562,"p3B":38455,"p3C":50716,"p3D":46429},
"BIO3126L":{"5":38460,"5A":39567,"5B":38461,"5C":50725,"5D":46434,"p5A":39567,"p5B":38461,"p5C":50725,"p5D":46434},
"BIO3127L":{"4":38466,"4A":39572,"4B":38467,"4C":50735,"4D":46064,"p4A":39572,"p4B":38467,"p4C":50735,"p4D":46064},
"BIO3128L":{"1":38472,"1A":39577,"1B":38473,"1C":50741,"1D":46069,"p1A":39577,"p1B":38473,"p1C":50741,"p1D":46069},
"BIO3132L":{"6":38484,"6A":39278,"6B":38485,"6C":50753,"6D":46079,"p6A":39278,"p6B":38485,"p6C":50753,"p6D":46079},
"BIO3135L":{"6":38490,"6A":39283,"6B":38491,"6C":50759,"6D":46084,"p6A":39283,"p6B":38491,"p6C":50759,"p6D":46084},
"BIO3136L":{"6":38496,"6A":39288,"6B":38497,"6C":50883,"6D":46089,"p6A":39288,"p6B":38497,"p6C":50883,"p6D":46089},
"BIO3144L":{"6":38502,"6A":39293,"6B":38503,"6C":50889,"6D":46095,"p6A":39293,"p6B":38503,"p6C":50889,"p6D":46095},
"BIO3145L":{"4":38508,"4A":39298,"4B":38510,"4C":50894,"4D":46100,"p4A":39298,"p4B":38510,"p4C":50894,"p4D":46100},
"BIO3146L":{"4":38516,"4A":39303,"4B":38517,"4C":50899,"4D":46235,"p4A":39303,"p4B":38517,"p4C":50899,"p4D":46235},
"BIO3148L":{"":38522,"3":38528,"3A":39315,"3B":38529,"3C":50910,"3D":46245,"p3A":39315,"p3B":38529,"p3C":50910,"p3D":46245},
"BIO3149L":{"6":38534,"6A":39320,"6B":38535,"6C":50915,"6D":46250,"p6A":39320,"p6B":38535,"p6C":50915,"p6D":46250},
"BIO3150L":{"5":38540,"5A":39325,"5B":38541,"5C":50920,"5D":46255,"p5A":39325,"p5B":38541,"p5C":50920,"p5D":46255},
"BIO3153L":{"6":38546,"6A":39330,"6B":38547,"6C":51066,"6D":46260,"p6A":39330,"p6B":38547,"p6C":51066,"p6D":46260},
"BIO3155L":{"3":38552,"3A":39337,"3B":38561,"3C":51071,"3D":46265,"p3A":39337,"p3B":38561,"p3C":51071,"p3D":46265},
"BIO3156L":{"5":38567,"5A":39342,"5B":38568,"5C":51076,"5D":45861,"p5A":39342,"p5B":38568,"p5C":51076,"p5D":45861},
"BIO3159L":{"4":38573,"4A":39347,"4B":38574,"4C":51081,"4D":45863,"p4A":39347,"p4B":38574,"p4C":51081,"p4D":45863},
"BIO3161L":{"6":38579,"6A":39353,"6B":38580,"6C":51088,"6D":45868,"6X":1045,"6Y":101247,"6Z":111306,"p6A":39353,"p6B":38580,"p6C":51088,"p6D":45868,"p6X":1045,"p6Y":101247,"p6Z":111306},
"BIO3162L":{"3":38585,"3A":39359,"3B":38586,"3C":51093,"3D":45876,"p3A":39359,"p3B":38586,"p3C":51093,"p3D":45876},
"BIO3166L":{"1":38591,"1A":39364,"1B":38592,"1C":47841,"1D":45881,"p1A":39364,"p1B":38592,"p1C":47841,"p1D":45881},
"BIO3175L":{"6":38597,"6A":39369,"6B":38598,"6C":47843,"6D":45886,"p6A":39369,"p6B":38598,"p6C":47843,"p6D":45886},
"BIO3176L":{"6":38603,"6A":39374,"6B":38604,"6C":47851,"6D":45891,"p6A":39374,"p6B":38604,"p6C":47851,"p6D":45891},
"BIO3177L":{"6":38609,"6A":39379,"6B":38610,"6C":47856,"6D":45896,"p6A":39379,"p6B":38610,"p6C":47856,"p6D":45896},
"BIO3178L":{"6":37806,"6A":39384,"6B":37807,"6C":47862,"6D":45901,"p6A":39384,"p6B":37807,"p6C":47862,"p6D":45901},
"BIO3179L":{"6":37816,"6A":39389,"6B":37817,"6C":47867,"6D":53271,"p6A":39389,"p6B":37817,"p6C":47867,"p6D":53271},
"BIO3180L":{"6":37829,"6A":38938,"6B":37830,"6C":47872,"6D":53276,"p6A":38938,"p6B":37830,"p6C":47872,"p6D":53276},
"BIO3181L":{"6":37835,"6A":38941,"6B":37836,"6C":47877,"6D":53281,"p6A":38941,"p6B":37836,"p6C":47877,"p6D":53281},
"BIO3182L":{"6":37845,"6A":38946,"6B":37846,"6C":47882,"6D":53286,"p6A":38946,"p6B":37846,"p6C":47882,"p6D":53286},
"BIO3183L":{"6":37856,"6A":38951,"6B":37857,"6C":48013,"6D":53291,"p6A":38951,"p6B":37857,"p6C":48013,"p6D":53291},
"CHM1008L":{"2":37863,"2A":38956,"2B":37864,"2C":48018,"2D":53296,"3":37869,"3A":38961,"3B":37870,"3C":48023,"3D":53301,"3E":100871,"3F":100876,"5":37875,"5A":38966,"5B":37876,"5C":48028,"5D":53433,"5E":88545,"5F":100862,"p2A":38956,"p2B":37864,"p2C":48018,"p2D":53296,"p3A":38961,"p3B":37870,"p3C":48023,"p3D":53301,"p3E":100871,"p3F":100876,"p5A":38966,"p5B":37876,"p5C":48028,"p5D":53433,"p5E":88545,"p5F":100862},
"CHM1010L":{"4":40611,"4A":40613,"4B":49593,"4C":46289,"4D":52761,"4E":96498,"4F":96503,"4G":25757,"p4A":40613,"p4B":49593,"p4C":46289,"p4D":52761,"p4E":96498,"p4F":96503,"p4G":25757},
"CHM1012L":{"1":40639,"1A":40641,"1B":50077,"1C":46294,"1D":22663,"1E":52766,"p1A":40641,"p1B":50077,"p1C":46294,"p1D":22663,"p1E":52766},
"CHM1015L":{"1":40666,"1A":40667,"1B":50085,"1C":46299,"1D":52898,"p1A":40667,"p1B":50085,"p1C":46299,"p1D":52898},
"CHM1017L":{"4":40685,"4A":40686,"4B":50092,"4C":46304,"4D":52903,"p4A":40686,"p4B":50092,"p4C":46304,"p4D":52903},
"CHM1019L":{"5":40691,"5A":40692,"5B":50097,"5C":46309,"5D":52915,"p5A":40692,"p5B":50097,"p5C":46309,"p5D":52915},
"CHM2002L":{"3":40965,"3A":40966,"3B":50102,"3C":46441,"3D":52920,"p3A":40966,"p3B":50102,"p3C":46441,"p3D":52920},
"CHM2008L":{"5":40971,"5A":40972,"5B":50109,"5C":46446,"5D":52926,"p5A":40972,"p5B":50109,"p5C":46446,"p5D":52926},
"CHM2012L":{"1":40977,"1A":40978,"1B":50114,"1C":46451,"1D":52931,"p1A":40978,"p1B":50114,"p1C":46451,"p1D":52931},
"CHM2013L":{"2":40983,"2A":40984,"2B":50236,"2C":46456,"2D":52936,"p2A":40984,"p2B":50236,"p2C":46456,"p2D":52936},
"CHM2016L":{"2":40989,"2A":40990,"2B":50241,"2C":46461,"2D":52941,"p2A":40990,"p2B":50241,"p2C":46461,"p2D":52941},
"CHM2022L":{"4":40995,"4A":40996,"4B":50246,"4C":46468,"4D":53070,"p4A":40996,"p4B":50246,"p4C":46468,"p4D":53070},
"CHM2023L":{"2":41001,"2A":41002,"2B":50251,"2C":46473,"2D":53075,"3":41007,"3A":41008,"3B":50256,"3C":46478,"3D":53080,"4":41158,"4A":41159,"4B":50261,"4C":46608,"4D":53085,"p2A":41002,"p2B":50251,"p2C":46473,"p2D":53075,"p3A":41008,"p3B":50256,"p3C":46478,"p3D":53080,"p4A":41159,"p4B":50261,"p4C":46608,"p4D":53085},
"CHM2024L":{"1":41164,"1A":41165,"1B":50268,"1C":46613,"1D":53090,"4":41170,"4A":41171,"4B":50275,"4C":46619,"4D":53095,"p1A":41165,"p1B":50268,"p1C":46613,"p1D":53090,"p4A":41171,"p4B":50275,"p4C":46619,"p4D":53095},
"CHM2025L":{"1":41176,"1A":41177,"1B":50404,"1C":46625,"1D":53100,"3":41182,"3A":41183,"3B":50409,"3C":46631,"3D":53229,"p1A":41177,"p1B":50404,"p1C":46625,"p1D":53100,"p3A":41183,"p3B":50409,"p3C":46631,"p3D":53229},
"CHM2026L":{"2":41188,"2A":41189,"2B":50414,"2C":46636,"2D":53234,"p2A":41189,"p2B":50414,"p2C":46636,"p2D":53234},
"CHM2027L":{"5":41194,"5A":41195,"5B":50419,"5C":46642,"5D":53239,"p5A":41195,"p5B":50419,"p5C":46642,"p5D":53239},
"CHM3001L":{"1":41349,"1A":41350,"1B":50426,"1C":46766,"1D":53244,"p1A":41350,"p1B":50426,"p1C":46766,"p1D":53244},
"CHM3006L":{"4":41361,"4A":41362,"4B":50436,"4C":46778,"4D":53254,"p4A":41362,"p4B":50436,"p4C":46778,"p4D":53254},
"CHM3015L":{"4":41367,"4A":41368,"4B":50441,"4C":46783,"4D":53259,"p4A":41368,"p4B":50441,"p4C":46783,"p4D":53259},
"CHM3017L":{"4":41373,"4A":41374,"4B":50610,"4C":46788,"4D":53264,"p4A":41374,"p4B":50610,"p4C":46788,"p4D":53264},
"CHM3021L":{"4":41379,"4A":41380,"4B":50615,"4C":46793,"4D":53394,"p4A":41380,"p4B":50615,"p4C":46793,"p4D":53394},
"CHM3023L":{"6":41387,"6A":41388,"6B":50620,"6C":46798,"6D":53399,"p6A":41388,"p6B":50620,"p6C":46798,"p6D":53399},
"CHM3036L":{"6":41394,"6A":41395,"6B":50626,"6C":46803,"6D":53404,"p6A":41395,"p6B":50626,"p6C":46803,"p6D":53404},
"CHM3064L":{"2":39798,"2A":39799,"2B":50631,"2C":46927,"2D":53409,"p2A":39799,"p2B":50631,"p2C":46927,"p2D":53409},
"CHM3065L":{"5":39804,"5A":39805,"5B":50636,"5C":46932,"5D":53414,"p5A":39805,"p5B":50636,"p5C":46932,"p5D":53414},
"CHM3066L":{"2":39810,"2A":39811,"2B":50641,"2C":46937,"2D":53420,"p2A":39811,"p2B":50641,"p2C":46937,"p2D":53420},
"CHM3068L":{"2":39816,"2A":39817,"2B":50648,"2C":46943,"2D":53425,"p2A":39817,"p2B":50648,"p2C":46943,"p2D":53425},
"CHM3102L":{"1":39822,"1A":39823,"1B":50805,"1C":46952,"1D":53430,"p1A":39823,"p1B":50805,"p1C":46952,"p1D":53430},
"CHM3106L":{"3":39828,"3A":39829,"3B":50810,"3C":46957,"3D":53557,"p3A":39829,"p3B":50810,"p3C":46957,"p3D":53557},
"CHM3107L":{"5":39835,"5A":39836,"5B":50815,"5C":46962,"5D":53562,"p5A":39836,"p5B":50815,"p5C":46962,"p5D":53562},
"CHM3109L":{"5":40003,"5A":40004,"5B":50825,"5C":47102,"5D":53572,"p5A":40004,"p5B":50825,"p5C":47102,"p5D":53572},
"CHM3110L":{"6":40009,"6A":40010,"6B":50830,"6C":47107,"6D":53577,"p6A":40010,"p6B":50830,"p6C":47107,"p6D":53577},
"CHM3113L":{"3":40015,"3A":40016,"3B":50835,"3C":47136,"3D":53582,"p3A":40016,"p3B":50835,"p3C":47136,"p3D":53582},
"GEP1004L":{"2":40022,"2A":40023,"2B":50964,"2C":47147,"2D":53587,"p2A":40023,"p2B":50964,"p2C":47147,"p2D":53587},
"GEP2001L":{"5":40028,"5A":40029,"5B":50969,"5C":47154,"5D":53592,"p5A":40029,"p5B":50969,"p5C":47154,"p5D":53592},
"GEP2003L":{"4":40034,"4A":40035,"4B":50974,"4C":47159,"4D":53716,"p4A":40035,"p4B":50974,"p4C":47159,"p4D":53716},
"GEP2013L":{"4":40040,"4A":40041,"4B":50979,"4C":47164,"4D":53721,"p4A":40041,"p4B":50979,"p4C":47164,"p4D":53721},
"GEP2014L":{"3":40046,"3A":40047,"3B":50984,"3C":47169,"3D":53726,"3E":99515,"3F":99736,"p3A":40047,"p3B":50984,"p3C":47169,"p3D":53726,"p3E":99515,"p3F":99736},
"GEP3002L":{"2":40218,"2A":40220,"2B":50991,"2C":47310,"2D":53731,"p2A":40220,"p2B":50991,"p2C":47310,"p2D":53731},
"GEP3006L":{"1":40231,"1A":40232,"1B":50996,"1C":47317,"1D":53736,"p1A":40232,"p1B":50996,"p1C":47317,"p1D":53736},
"GEP3019L":{"4":40237,"4A":40238,"4B":51001,"4C":47322,"4D":53741,"p4A":40238,"p4B":51001,"p4C":47322,"p4D":53741},
"GEP3033L":{"3":40243,"3A":40244,"3B":47925,"3C":47327,"3D":53746,"p3A":40244,"p3B":47925,"p3C":47327,"p3D":53746},
"GEP3036L":{"3":40249,"3A":40251,"3B":47930,"3C":47332,"3D":53751,"p3A":40251,"p3B":47930,"p3C":47332,"p3D":53751},
"GEP3038L":{"4":40262,"4A":40263,"4B":47935,"4C":47337,"4D":53875,"p4A":40263,"p4B":47935,"p4C":47337,"p4D":53875},
"GEP3041L":{"5":40268,"5A":40269,"5B":47940,"5C":47344,"5D":53880,"p5A":40269,"p5B":47940,"p5C":47344,"p5D":53880},
"GEP3043L":{"3":40274,"3A":40275,"3B":47945,"3C":47349,"3D":53885,"p3A":40275,"p3B":47945,"p3C":47349,"p3D":53885},
"GEP3044L":{"4":40696,"4A":40697,"4B":47950,"4C":47483,"4D":53890,"p4A":40697,"p4B":47950,"p4C":47483,"p4D":53890},
"GEP3045L":{"4":40702,"4A":40703,"4B":47955,"4C":47488,"4D":53895,"p4A":40703,"p4B":47955,"p4C":47488,"p4D":53895},
"GEP3046L":{"4":40708,"4A":40709,"4B":47960,"4C":47500,"4D":53900,"p4A":40709,"p4B":47960,"p4C":47500,"p4D":53900},
"GEP3047L":{"6":40718,"6A":40719,"6B":48086,"6C":47506,"6D":53905,"p6A":40719,"p6B":48086,"p6C":47506,"p6D":53905},
"GEP3048L":{"6":40724,"6A":40725,"6B":48091,"6C":47511,"6D":53910,"p6A":40725,"p6B":48091,"p6C":47511,"p6D":53910},
"INF1010L":{"3":40731,"3A":40732,"3B":48096,"3C":47517,"3D":54037,"p3A":40732,"p3B":48096,"p3C":47517,"p3D":54037},
"INF1011L":{"2":40737,"2A":40738,"2B":48101,"2C":47522,"2D":54042,"2E":96466,"2F":50714,"2G":96472,"2H":109915,"p2A":40738,"p2B":48101,"p2C":47522,"p2D":54042,"p2E":96466,"p2F":50714,"p2G":96472,"p2H":109915},
"INF1012L":{"1":40752,"1A":40793,"1B":96117,"1C":47527,"1D":54047,"1E":96112,"1F":48106,"1G":96137,"1H":96142,"1I":96147,"1J":96122,"1K":96127,"1L":96132,"p1A":40793,"p1B":96117,"p1C":47527,"p1D":54047,"p1E":96112,"p1F":48106,"p1G":96137,"p1H":96142,"p1I":96147,"p1J":96122,"p1K":96127,"p1L":96132},
"INF1014L":{"1":41012,"1A":41013,"1B":48111,"1C":47679,"1D":54052,"1E":95482,"1G":95492,"1H":95497,"1I":95522,"1J":95507,"1K":95512,"1L":95487,"1N":95527,"1O":95517,"1P":95537,"1Q":95542,"1R":95532,"1T":95502,"1U":95547,"1V":95552,"1W":95557,"1X":95562,"p1A":41013,"p1B":48111,"p1C":47679,"p1D":54052,"p1E":95482,"p1G":95492,"p1H":95497,"p1I":95522,"p1J":95507,"p1K":95512,"p1L":95487,"p1N":95527,"p1O":95517,"p1P":95537,"p1Q":95542,"p1R":95532,"p1T":95502,"p1U":95547,"p1V":95552,"p1W":95557,"p1X":95562},
"INF2012L":{"5":41018,"5A":41019,"5B":48116,"5C":47684,"5D":54057,"p5A":41019,"p5B":48116,"p5C":47684,"p5D":54057},
"INF2013L":{"5":41024,"5A":41025,"5B":48121,"5C":47689,"5D":54062,"p5A":41025,"p5B":48121,"p5C":47689,"p5D":54062},
"INF2015L":{"3":41030,"3A":41031,"3B":48245,"3C":47694,"3D":54067,"3E":50696,"p3A":41031,"p3B":48245,"p3C":47694,"p3D":54067,"p3E":50696},
"INF2016L":{"6":41036,"6A":41037,"6B":48250,"6C":47699,"6D":54195,"p6A":41037,"p6B":48250,"p6C":47699,"p6D":54195},
"INF2028L":{"2":41042,"2A":41043,"2B":48256,"2C":47704,"2D":54200,"p2A":41043,"p2B":48256,"p2C":47704,"p2D":54200},
"INF2030L":{"1":41048,"1A":41049,"1B":48263,"1C":47709,"1D":54205,"1E":94938,"1F":95068,"p1A":41049,"p1B":48263,"p1C":47709,"p1D":54205,"p1E":94938,"p1F":95068},
"INF2032L":{"5":41054,"5V":41055,"p5V":41055},
"INF3001L":{"5":41202,"5A":41203,"5B":48275,"5C":45210,"5D":54215,"p5A":41203,"p5B":48275,"p5C":45210,"p5D":54215},
"INF3002L":{"1":41208,"1A":41209,"1B":48280,"1C":45215,"1D":54220,"p1A":41209,"p1B":48280,"p1C":45215,"p1D":54220},
"INF3007L":{"4":41214,"4A":41215,"4B":48285,"4C":45220,"4D":54225,"p4A":41215,"p4B":48285,"p4C":45220,"p4D":54225},
"INF3035L":{"2":41220,"2A":41221,"2B":48435,"2C":45225,"2D":54230,"p2A":41221,"p2B":48435,"p2C":45225,"p2D":54230},
"INF3040L":{"2":41226,"2A":41227,"2B":48440,"2C":45230,"2D":54361,"p2A":41227,"p2B":48440,"p2C":45230,"p2D":54361},
"INF3041L":{"2":41232,"2A":41233,"2B":48446,"2C":45235,"2D":54366,"p2A":41233,"p2B":48446,"p2C":45235,"p2D":54366},
"INF3046L":{"1":3976,"1A":109905,"1B":4197,"1C":109900,"1D":109910,"1E":109895,"1F":109674,"p1A":109905,"p1B":4197,"p1C":109900,"p1D":109910,"p1E":109895,"p1F":109674},
"INF3050L":{"6":41246,"6A":41247,"6B":48456,"6C":45252,"6D":54376,"p6A":41247,"p6B":48456,"p6C":45252,"p6D":54376},
"INF3051L":{"1":41402,"1A":41403,"1B":103016,"1C":103021,"p1A":41403,"p1B":103016,"p1C":103021},
"INF3054L":{"3":41408,"3A":41409,"3B":48466,"3C":45398,"3D":54386,"3E":14593,"p3A":41409,"p3B":48466,"p3C":45398,"p3D":54386,"p3E":14593},
"INF3055L":{"3":41414,"3A":41415,"3B":48471,"3C":45403,"3D":54391,"3E":98572,"3F":98577,"3G":100361,"p3A":41415,"p3B":48471,"p3C":45403,"p3D":54391,"p3E":98572,"p3F":98577,"p3G":100361},
"INF3056L":{"2":41420,"2A":41421,"2B":48602,"2C":45408,"2D":54396,"p2A":41421,"p2B":48602,"p2C":45408,"p2D":54396},
"INF3057L":{"2":41426,"2A":41427,"2B":48607,"2C":45413,"2D":54521,"p2A":41427,"p2B":48607,"p2C":45413,"p2D":54521},
"INF3058L":{"6":41432,"6A":41433,"6B":48612,"6C":45418,"6D":54526,"p6A":41433,"p6B":48612,"p6C":45418,"p6D":54526},
"MAT1049L":{"6":41439,"6A":41440,"6B":48617,"6C":45423,"6D":54531,"p6A":41440,"p6B":48617,"p6C":45423,"p6D":54531},
"MAT1051L":{"1":41445,"1A":41446,"1B":48622,"1C":45430,"1D":54536,"1E":96843,"1F":105148,"2":41606,"2A":41607,"2B":48627,"2C":45583,"2D":54541,"2E":96853,"2F":105558,"5":41612,"5A":41613,"5B":48632,"5C":45588,"5D":54546,"5E":96858,"5F":96863,"5G":105569,"5K":48762,"p1A":41446,"p1B":48622,"p1C":45430,"p1D":54536,"p1E":96843,"p1F":105148,"p2A":41607,"p2B":48627,"p2C":45583,"p2D":54541,"p2E":96853,"p2F":105558,"p5A":41613,"p5B":48632,"p5C":45588,"p5D":54546,"p5E":96858,"p5F":96863,"p5G":105569,"p5K":48762},
"MAT1052L":{"1":41618,"1A":41619,"1B":48637,"1C":45593,"1D":54551,"1E":96889,"1F":105404,"2":41624,"2A":41625,"2B":48780,"2C":45603,"2D":54556,"2E":96894,"2F":105563,"5":41630,"5A":41631,"5B":48785,"5C":45611,"5D":51849,"5E":96899,"5F":96904,"5G":105574,"5K":54278,"p1A":41619,"p1B":48637,"p1C":45593,"p1D":54551,"p1E":96889,"p1F":105404,"p2A":41625,"p2B":48780,"p2C":45603,"p2D":54556,"p2E":96894,"p2F":105563,"p5A":41631,"p5B":48785,"p5C":45611,"p5D":51849,"p5E":96899,"p5F":96904,"p5G":105574,"p5K":54278},
"MAT1054L":{"3":41636,"3A":41637,"3B":48790,"3C":45616,"3D":51854,"3E":96932,"3F":97226,"3G":97231,"3H":98731,"5":41646,"5A":41647,"5B":48795,"5C":45621,"5D":51859,"5E":99184,"5F":99189,"5G":63157,"p3A":41637,"p3B":48790,"p3C":45616,"p3D":51854,"p3E":96932,"p3F":97226,"p3G":97231,"p3H":98731,"p5A":41647,"p5B":48795,"p5C":45621,"p5D":51859,"p5E":99184,"p5F":99189,"p5G":63157},
"MAT1057L":{"4":41652,"4A":41653,"4B":48802,"4C":45626,"4D":51864,"4E":96849,"4F":96869,"4G":96872,"4H":96913,"6":42068,"6A":42069,"6B":48807,"6C":45765,"6D":51869,"p4A":41653,"p4B":48802,"p4C":45626,"p4D":51864,"p4E":96849,"p4F":96869,"p4G":96872,"p4H":96913,"p6A":42069,"p6B":48807,"p6C":45765,"p6D":51869},
"MAT1058L":{"3":42076,"3A":42077,"3B":48813,"3C":45772,"3D":51874,"3E":99194,"3F":99199,"3G":43875,"p3A":42077,"p3B":48813,"p3C":45772,"p3D":51874,"p3E":99194,"p3F":99199,"p3G":43875},
"MAT1062L":{"4":42082,"4A":42083,"4B":48818,"4C":45777,"4D":51879,"p4A":42083,"p4B":48818,"p4C":45777,"p4D":51879},
"MAT1063L":{"5":42088,"5A":42089,"5B":48948,"5C":45782,"5D":51884,"p5A":42089,"p5B":48948,"p5C":45782,"p5D":51884},
"MAT1066L":{"3":42094,"3A":42095,"3B":48953,"3C":45787,"3D":51889,"p3A":42095,"p3B":48953,"p3C":45787,"p3D":51889},
"MAT1068L":{"1":42100,"1A":42101,"1B":48958,"1C":45792,"1D":52023,"p1A":42101,"p1B":48958,"p1C":45792,"p1D":52023},
"MAT1070L":{"3":42106,"3A":42107,"3B":48963,"3C":45797,"3D":52028,"p3A":42107,"p3B":48963,"p3C":45797,"p3D":52028},
"MAT1072L":{"4":42112,"4A":42113,"4B":48968,"4C":45817,"4D":52033,"p4A":42113,"p4B":48968,"p4C":45817,"p4D":52033},
"MAT1073L":{"4":42267,"4A":42268,"4B":48973,"4C":45962,"4D":52115,"p4A":42268,"p4B":48973,"p4C":45962,"p4D":52115},
"MAT1075L":{"5":99859,"5A":99860,"5B":99980,"5C":99975,"5D":99985,"5E":99990,"5F":99995,"5G":100000,"p5A":99860,"p5B":99980,"p5C":99975,"p5D":99985,"p5E":99990,"p5F":99995,"p5G":100000},
"MAT2007L":{"6":42275,"6A":42276,"6B":48978,"6C":45967,"6D":52120,"p6A":42276,"p6B":48978,"p6C":45967,"p6D":52120},
"MAT2013L":{"1":42283,"1A":42284,"1B":48983,"1C":45972,"1D":52153,"1E":96873,"1F":96878,"2":42289,"2G":42290,"2H":49179,"2I":52161,"2J":45977,"2K":106173,"p1A":42284,"p1B":48983,"p1C":45972,"p1D":52153,"p1E":96873,"p1F":96878,"p2G":42290,"p2H":49179,"p2I":52161,"p2J":45977,"p2K":106173},
"MAT2027L":{"4":42295,"4A":42296,"4B":49184,"4C":45982,"4D":52166,"4E":99847,"p4A":42296,"p4B":49184,"p4C":45982,"p4D":52166,"p4E":99847},
"MAT2072L":{"1":42301,"1A":42302,"1B":49189,"1C":45988,"1D":52295,"p1A":42302,"p1B":49189,"p1C":45988,"p1D":52295},
"MAT2078L":{"2":42307,"2A":42308,"2B":49194,"2C":45993,"2D":52300,"p2A":42308,"p2B":49194,"p2C":45993,"p2D":52300},
"MAT2079L":{"1":42313,"1A":42314,"1B":49199,"1C":45998,"1D":52305,"p1A":42314,"p1B":49199,"p1C":45998,"p1D":52305},
"MAT2086L":{"4":42474,"4A":42475,"4B":49211,"4C":46162,"4D":52315,"p4A":42475,"p4B":49211,"p4C":46162,"p4D":52315},
"MAT2087L":{"5":42480,"5A":42481,"5B":49216,"5C":46167,"5D":52320,"p5A":42481,"p5B":49216,"p5C":46167,"p5D":52320},
"MAT2090L":{"4":42486,"4A":42487,"4B":49401,"4C":46174,"4D":52325,"p4A":42487,"p4B":49401,"p4C":46174,"p4D":52325},
"MAT2093L":{"4":42492,"4A":42493,"4B":49406,"4C":46179,"4D":52330,"p4A":42493,"p4B":49406,"p4C":46179,"p4D":52330},
"MAT2094L":{"2":42498,"2A":42499,"2B":49412,"2C":46184,"2D":52585,"2E":29164,"p2A":42499,"p2B":49412,"p2C":46184,"p2D":52585,"p2E":29164},
"MAT2095L":{"6":42504,"6A":42505,"6B":49417,"6C":46189,"6D":52590,"p6A":42505,"p6B":49417,"p6C":46189,"p6D":52590},
"MAT2096L":{"3":42510,"3A":42511,"3B":49422,"3C":46194,"3D":52595,"p3A":42511,"p3B":49422,"p3C":46194,"p3D":52595},
"MAT3120L":{"6":42662,"6A":42663,"6B":49427,"6C":46314,"6D":52600,"p6A":42663,"p6B":49427,"p6C":46314,"p6D":52600},
"MAT3141L":{"2":42668,"2A":42669,"2B":49432,"2C":46319,"2D":52605,"p2A":42669,"p2B":49432,"p2C":46319,"p2D":52605},
"MAT3147L":{"4":42674,"4A":42675,"4B":49437,"4C":46324,"4D":52610,"p4A":42675,"p4B":49437,"p4C":46324,"p4D":52610},
"MAT3148L":{"2":42680,"2A":42681,"2B":49595,"2C":46329,"2D":52615,"p2A":42681,"p2B":49595,"p2C":46329,"p2D":52615},
"MAT3149L":{"5":42686,"5A":42687,"5B":49600,"5C":46334,"5D":52620,"p5A":42687,"p5B":49600,"p5C":46334,"p5D":52620},
"MAT3150L":{"5":42692,"5A":42693,"5B":49605,"5C":46339,"5D":53107,"p5A":42693,"p5B":49605,"p5C":46339,"p5D":53107},
"MAT3151L":{"6":42698,"6A":42699,"6B":49613,"6C":46344,"6D":53112,"p6A":42699,"p6B":49613,"p6C":46344,"p6D":53112},
"MAT3152L":{"6":42704,"6A":42705,"6B":49624,"6C":45256,"6D":53117,"p6A":42705,"p6B":49624,"p6C":45256,"p6D":53117},
"MAT3154L":{"1":42856,"1A":42857,"1B":49633,"1C":45261,"1D":53122,"p1A":42857,"p1B":49633,"p1C":45261,"p1D":53122},
"MAT3155L":{"5":42862,"5A":42863,"5B":49641,"5C":45266,"5D":53127,"p5A":42863,"p5B":49641,"p5C":45266,"p5D":53127},
"MAT3156L":{"3":42868,"3A":42869,"3B":49647,"3C":45272,"3D":53132,"p3A":42869,"p3B":49647,"p3C":45272,"p3D":53132},
"MAT3157L":{"3":42874,"3A":42875,"3B":49653,"3C":45277,"3D":53137,"p3A":42875,"p3B":49653,"p3C":45277,"p3D":53137},
"MAT3162L":{"3":42880,"3A":42881,"3B":50122,"3C":45282,"3D":52769,"p3A":42881,"p3B":50122,"p3C":45282,"p3D":52769},
"MAT3163L":{"4":42886,"4A":42887,"4B":50127,"4C":45287,"4D":52781,"p4A":42887,"p4B":50127,"p4C":45287,"p4D":52781},
"MAT3164L":{"2":42893,"2A":42894,"2B":50132,"2C":45298,"2D":52786,"p2A":42894,"p2B":50132,"p2C":45298,"p2D":52786},
"MAT3165L":{"3":42899,"3A":42900,"3B":50137,"3C":45303,"3D":52791,"p3A":42900,"p3B":50137,"p3C":45303,"p3D":52791},
"MAT3166L":{"4":43036,"4A":43037,"4B":50142,"4C":45434,"4D":52796,"p4A":43037,"p4B":50142,"p4C":45434,"p4D":52796},
"MAT3167L":{"1":43042,"1A":43043,"1B":50147,"1C":45439,"1D":52801,"p1A":43043,"p1B":50147,"p1C":45439,"p1D":52801},
"MAT3168L":{"4":43048,"4A":43049,"4B":50152,"4C":45447,"4D":52806,"p4A":43049,"p4B":50152,"p4C":45447,"p4D":52806},
"MAT3170L":{"6":43054,"6A":43055,"6B":50278,"6C":45473,"6D":52811,"p6A":43055,"p6B":50278,"p6C":45473,"p6D":52811},
"MAT3171L":{"6":43060,"6A":43061,"6B":50283,"6C":45478,"6D":52816,"p6A":43061,"p6B":50283,"p6C":45478,"p6D":52816},
"MGC1001L":{"2":43066,"2A":43067,"2B":50288,"2C":45483,"2D":52947,"2E":97791,"2F":97797,"p2A":43067,"p2B":50288,"p2C":45483,"p2D":52947,"p2E":97791,"p2F":97797},
"MGC2005L":{"4":43072,"4A":43073,"4B":50296,"4C":45488,"4D":52952,"p4A":43073,"p4B":50296,"p4C":45488,"p4D":52952},
"MGC2009L":{"5":43078,"5A":43079,"5B":50304,"5C":45493,"5D":52957,"p5A":43079,"p5B":50304,"p5C":45493,"p5D":52957},
"MGC2011L":{"4":43217,"4A":43218,"4B":50309,"4C":45631,"4D":52962,"p4A":43218,"p4B":50309,"p4C":45631,"p4D":52962},
"MGC2013L":{"4":43223,"4A":43224,"4B":50314,"4C":45638,"4D":52967,"p4A":43224,"p4B":50314,"p4C":45638,"p4D":52967},
"MGC2025L":{"5":43235,"5A":43236,"5B":50445,"5C":45648,"5D":52977,"p5A":43236,"p5B":50445,"p5C":45648,"p5D":52977},
"MGC2029L":{"5":43241,"5A":43242,"5B":50450,"5C":45653,"5D":51156,"p5A":43242,"p5B":50450,"p5C":45653,"p5D":51156},
"MGC2030L":{"3":43247,"3A":43248,"3B":50476,"3C":45658,"3D":51161,"p3A":43248,"p3B":50476,"p3C":45658,"p3D":51161},
"MGC2031L":{"2":43253,"2A":43254,"2B":50483,"2C":45663,"2D":51166,"p2A":43254,"p2B":50483,"p2C":45663,"p2D":51166},
"MGC3002L":{"1":39656,"1A":39657,"1B":50494,"1C":45668,"1D":51171,"p1A":39657,"p1B":50494,"p1C":45668,"p1D":51171},
"MGC3030L":{"5":39661,"5A":39662,"5B":50503,"5C":45824,"5D":51176,"p5A":39662,"p5B":50503,"p5C":45824,"p5D":51176},
"MGC3047L":{"5":39667,"5A":39668,"5B":50513,"5C":45829,"5D":51181,"p5A":39668,"p5B":50513,"p5C":45829,"p5D":51181},
"MGC3059L":{"6":39673,"6A":39674,"6B":50521,"6C":45834,"6D":51186,"p6A":39674,"p6B":50521,"p6C":45834,"p6D":51186},
"MGC3060L":{"6":39679,"6A":39680,"6B":50651,"6C":45839,"6D":51191,"p6A":39680,"p6B":50651,"p6C":45839,"p6D":51191},
"MGC3062L":{"2":39685,"2A":39686,"2B":50656,"2C":45844,"2D":51241,"p2A":39686,"p2B":50656,"p2C":45844,"p2D":51241},
"MGC3063L":{"4":39691,"4A":39692,"4B":50663,"4C":45849,"4D":51265,"p4A":39692,"p4B":50663,"p4C":45849,"p4D":51265},
"MGC3064L":{"4":39697,"4A":39698,"4B":50668,"4C":45854,"4D":51270,"p4A":39698,"p4B":50668,"p4C":45854,"p4D":51270},
"MGC3081L":{"3":39703,"3A":39704,"3B":50673,"3C":45859,"3D":51275,"p3A":39704,"p3B":50673,"p3C":45859,"p3D":51275},
"MGC3082L":{"4":39855,"4A":39856,"4B":50679,"4C":46003,"4D":51280,"p4A":39856,"p4B":50679,"p4C":46003,"p4D":51280},
"MGC3083L":{"2":39861,"2A":39862,"2B":50688,"2C":46008,"2D":51285,"p2A":39862,"p2B":50688,"p2C":46008,"p2D":51285},
"MGC3084L":{"4":39867,"4A":39868,"4B":50693,"4C":46013,"4D":51290,"p4A":39868,"p4B":50693,"p4C":46013,"p4D":51290},
"MGC3090L":{"6":39873,"6A":39874,"6B":50840,"6C":46018,"6D":51295,"p6A":39874,"p6B":50840,"p6C":46018,"p6D":51295},
"MGC3091L":{"6":39879,"6A":39880,"6B":50845,"6C":46023,"6D":51303,"p6A":39880,"p6B":50845,"p6C":46023,"p6D":51303},
"MGC3092L":{"6":39885,"6A":39886,"6B":50850,"6C":46028,"6D":51354,"p6A":39886,"p6B":50850,"p6C":46028,"p6D":51354},
"MGC3095L":{"6":39891,"6A":39892,"6B":50855,"6C":46056,"6D":51359,"p6A":39892,"p6B":50855,"p6C":46056,"p6D":51359},
"MGC3098L":{"6":39898,"6A":39899,"6B":50860,"6C":46062,"6D":51364,"p6A":39899,"p6B":50860,"p6C":46062,"p6D":51364},
"MGC3102L":{"4":40054,"4A":40055,"4B":50865,"4C":46200,"4D":51369,"p4A":40055,"p4B":50865,"p4C":46200,"p4D":51369},
"MGC3104L":{"1":40060,"1A":40061,"1B":50870,"1C":46205,"1D":51374,"p1A":40061,"p1B":50870,"p1C":46205,"p1D":51374},
"MGC3106L":{"5":40066,"5A":40067,"5B":50875,"5C":46210,"5D":51379,"p5A":40067,"p5B":50875,"p5C":46210,"p5D":51379},
"MGC3107L":{"3":40072,"3A":40073,"3B":51018,"3C":46215,"3D":51385,"p3A":40073,"p3B":51018,"p3C":46215,"p3D":51385},
"PHY1008L":{"1":40078,"1A":40079,"1B":51023,"1C":46220,"1D":51447,"p1A":40079,"p1B":51023,"p1C":46220,"p1D":51447},
"PHY1009L":{"2":40084,"2A":40085,"2B":51028,"2C":46225,"2D":51454,"2E":95073,"2F":95078,"3":104924,"3A":104945,"3B":104925,"3C":104930,"3D":104950,"3E":104940,"3F":104935,"4":40090,"4A":40091,"4B":51033,"4C":46230,"4D":51467,"4E":95083,"4F":95088,"p2A":40085,"p2B":51028,"p2C":46225,"p2D":51454,"p2E":95073,"p2F":95078,"p3A":104945,"p3B":104925,"p3C":104930,"p3D":104950,"p3E":104940,"p3F":104935,"p4A":40091,"p4B":51033,"p4C":46230,"p4D":51467,"p4E":95083,"p4F":95088},
"PHY1010L":{"1":40279,"1A":40280,"1B":51038,"1C":46357,"1D":51472,"1E":98853,"1F":98858,"1G":98863,"1H":98868,"1I":104365,"3":40293,"3A":40299,"3B":51044,"3C":46362,"3D":51477,"4":40319,"4A":40320,"4B":51049,"4C":46367,"4D":51482,"4E":96478,"4F":98880,"4G":110430,"p1A":40280,"p1B":51038,"p1C":46357,"p1D":51472,"p1E":98853,"p1F":98858,"p1G":98863,"p1H":98868,"p1I":104365,"p3A":40299,"p3B":51044,"p3C":46362,"p3D":51477,"p4A":40320,"p4B":51049,"p4C":46367,"p4D":51482,"p4E":96478,"p4F":98880,"p4G":110430},
"PHY1011L":{"1":40336,"1A":40337,"1B":51054,"1C":46372,"1D":51487,"1E":100979,"1F":100984,"2":40382,"2A":40394,"2B":47965,"2C":46377,"2D":51492,"2E":96488,"2F":96493,"4":40408,"4A":40409,"4B":47969,"4C":46382,"4D":51497,"4E":96483,"p1A":40337,"p1B":51054,"p1C":46372,"p1D":51487,"p1E":100979,"p1F":100984,"p2A":40394,"p2B":47965,"p2C":46377,"p2D":51492,"p2E":96488,"p2F":96493,"p4A":40409,"p4B":47969,"p4C":46382,"p4D":51497,"p4E":96483},
"PHY1012L":{"1":40414,"1A":40415,"1B":47974,"1C":46387,"1D":51565,"1E":102091,"1F":102096,"4":40420,"4A":40421,"4B":47979,"4C":46392,"4D":51576,"4E":102101,"p1A":40415,"p1B":47974,"p1C":46387,"p1D":51565,"p1E":102091,"p1F":102096,"p4A":40421,"p4B":47979,"p4C":46392,"p4D":51576,"p4E":102101},
"PHY1013L":{"1":40426,"1A":40427,"1B":47984,"1C":46397,"1D":51586,"2":41451,"2A":41452,"2B":47989,"2C":46525,"2D":51591,"2E":101967,"2F":101972,"4":41457,"4A":41458,"4B":47994,"4C":46530,"4D":51596,"p1A":40427,"p1B":47984,"p1C":46397,"p1D":51586,"p2A":41452,"p2B":47989,"p2C":46525,"p2D":51591,"p2E":101967,"p2F":101972,"p4A":41458,"p4B":47994,"p4C":46530,"p4D":51596},
"PHY1015L":{"1":41463,"1A":41464,"1B":48000,"1C":46535,"1D":51601,"1E":102532,"p1A":41464,"p1B":48000,"p1C":46535,"p1D":51601,"p1E":102532},
"PHY1019L":{"5":41469,"5A":41470,"5B":48005,"5C":46540,"5D":51606,"p5A":41470,"p5B":48005,"p5C":46540,"p5D":51606},
"PHY1021L":{"3":41476,"3A":41477,"3B":48128,"3C":46545,"3D":51611,"p3A":41477,"p3B":48128,"p3C":46545,"p3D":51611},
"PHY1022L":{"2":41482,"2A":41483,"2B":48133,"2C":46550,"2D":51617,"p2A":41483,"p2B":48133,"p2C":46550,"p2D":51617},
"PHY2003L":{"4":41058,"4A":41059,"4B":48144,"4C":46560,"4D":51627,"p4A":41059,"p4B":48144,"p4C":46560,"p4D":51627},
"PHY2004L":{"5":41062,"5A":41063,"5B":48149,"5C":46689,"5D":51632,"5E":98557,"p5A":41063,"p5B":48149,"p5C":46689,"p5D":51632,"p5E":98557},
"PHY2005L":{"1":41068,"1A":41069,"1B":48154,"1C":46694,"1D":51637,"1E":101387,"2":41074,"2A":41075,"2B":48159,"2C":46699,"2D":51642,"2E":101837,"6":103771,"6B":103782,"p1A":41069,"p1B":48154,"p1C":46694,"p1D":51637,"p1E":101387,"p2A":41075,"p2B":48159,"p2C":46699,"p2D":51642,"p2E":101837,"p6B":103782},
"PHY2006L":{"4":41080,"4A":41081,"4B":48164,"4C":46704,"4D":51647,"p4A":41081,"p4B":48164,"p4C":46704,"p4D":51647},
"PHY2018L":{"2":41086,"2A":41087,"2B":48166,"2C":46709,"2D":51652,"p2A":41087,"p2B":48166,"p2C":46709,"p2D":51652},
"PHY3003L":{"2":41092,"2A":41093,"2B":48295,"2C":46714,"2D":51661,"3":41098,"3A":41099,"3B":48300,"3C":46719,"3D":51671,"p2A":41093,"p2B":48295,"p2C":46714,"p2D":51661,"p3A":41099,"p3B":48300,"p3C":46719,"p3D":51671},
"PHY3009L":{"4":41104,"4A":41105,"4B":48305,"4C":46724,"4D":51676,"p4A":41105,"p4B":48305,"p4C":46724,"p4D":51676},
"PHY3012L":{"4":41255,"4A":41256,"4B":48316,"4C":46850,"4D":51681,"p4A":41256,"p4B":48316,"p4C":46850,"p4D":51681},
"PHY3013L":{"4":41261,"4A":41262,"4B":48323,"4C":46855,"4D":51686,"p4A":41262,"p4B":48323,"p4C":46855,"p4D":51686},
"PHY3014L":{"5":41267,"5A":41268,"5B":48337,"5C":46860,"5D":51691,"p5A":41268,"p5B":48337,"p5C":46860,"p5D":51691},
"PHY3016L":{"4":41273,"4A":41274,"4B":48342,"4C":46865,"4D":51696,"p4A":41274,"p4B":48342,"p4C":46865,"p4D":51696},
"PHY3034L":{"4":41281,"4A":41282,"4B":48477,"4C":46870,"4D":51701,"p4A":41282,"p4B":48477,"p4C":46870,"p4D":51701},
"PHY3078L":{"1":41287,"1A":41288,"1B":48483,"1C":46875,"1D":51706,"p1A":41288,"p1B":48483,"p1C":46875,"p1D":51706},
"PHY3081L":{"2":41293,"2A":41294,"2B":48488,"2C":46880,"2D":51711,"p2A":41294,"p2B":48488,"p2C":46880,"p2D":51711},
"PHY3082L":{"1":40822,"1A":40823,"1B":48493,"1C":46885,"1D":51716,"p1A":40823,"p1B":48493,"p1C":46885,"p1D":51716},
"PHY3086L":{"3":40828,"3A":40829,"3B":48498,"3C":47023,"3D":51721,"p3A":40829,"p3B":48498,"p3C":47023,"p3D":51721},
"PHY3087L":{"3":40853,"3A":40854,"3B":48503,"3C":47030,"3D":51726,"p3A":40854,"p3B":48503,"p3C":47030,"p3D":51726},
"PHY3088L":{"6":40859,"6A":40860,"6B":48508,"6C":47035,"6D":51731,"p6A":40860,"p6B":48508,"p6C":47035,"p6D":51731},
"PHY3089L":{"4":40865,"4A":40866,"4B":48641,"4C":47040,"4D":51103,"p4A":40866,"p4B":48641,"p4C":47040,"p4D":51103},
"PHY3094L":{"6":40871,"6A":40872,"6B":48646,"6C":47045,"6D":51106,"p6A":40872,"p6B":48646,"p6C":47045,"p6D":51106},
"PHY3098L":{"4":40879,"4A":40880,"4B":48651,"4C":47050,"4D":51111,"p4A":40880,"p4B":48651,"p4C":47050,"p4D":51111},
"PHY3099L":{"5":37972,"5A":37973,"5B":48656,"5C":47055,"5D":51116,"p5A":37973,"p5B":48656,"p5C":47055,"p5D":51116},
"PHY3101L":{"4":37975,"4A":37976,"4B":48661,"4C":47059,"4D":51121,"p4A":37976,"p4B":48661,"p4C":47059,"p4D":51121},
"STU1003L":{"1":37981,"1A":37982,"1B":48666,"1C":47220,"1D":51126,"3":37987,"3A":37988,"3B":48673,"3C":47225,"3D":51135,"3E":94507,"3F":94930,"p1A":37982,"p1B":48666,"p1C":47220,"p1D":51126,"p3A":37988,"p3B":48673,"p3C":47225,"p3D":51135,"p3E":94507,"p3F":94930},
"STU1006L":{"3":37999,"3A":38000,"3B":48823,"3C":47235,"3D":51153,"p3A":38000,"p3B":48823,"p3C":47235,"p3D":51153},
"STU1007L":{"4":95567,"4A":95568,"4B":95578,"p4A":95568,"p4B":95578},
"STU2008L":{"6":38005,"6A":38006,"6B":48828,"6C":47243,"6D":51198,"p6A":38006,"p6B":48828,"p6C":47243,"p6D":51198},
"STU2018L":{"1":38011,"1A":38012,"1B":48833,"1C":47249,"1D":51203,"p1A":38012,"p1B":48833,"p1C":47249,"p1D":51203},
"STU2024L":{"2":38021,"2A":38022,"2B":48838,"2C":47256,"2D":51208,"p2A":38022,"p2B":48838,"p2C":47256,"p2D":51208},
"STU2025L":{"4":38032,"4A":38033,"4B":48843,"4C":47390,"4D":51215,"p4A":38033,"p4B":48843,"p4C":47390,"p4D":51215},
"STU2029L":{"2":38038,"2A":38039,"2B":48849,"2C":47395,"2D":51223,"p2A":38039,"p2B":48849,"p2C":47395,"p2D":51223},
"STU2030L":{"5":38044,"5A":38045,"5B":48854,"5C":47401,"5D":51228,"p5A":38045,"p5B":48854,"p5C":47401,"p5D":51228},
"STU2031L":{"5":38050,"5A":38051,"5B":48859,"5C":47406,"5D":51233,"p5A":38051,"p5B":48859,"p5C":47406,"p5D":51233},
"STU3001L":{"6":38056,"6A":38057,"6B":48988,"6C":47411,"6D":51238,"p6A":38057,"p6B":48988,"p6C":47411,"p6D":51238},
"STU3027L":{"6":38062,"6A":38063,"6B":48993,"6C":47416,"6D":51309,"p6A":38063,"p6B":48993,"p6C":47416,"p6D":51309},
"STU3046L":{"6":38068,"6A":38069,"6B":48998,"6C":47425,"6D":51316,"p6A":38069,"p6B":48998,"p6C":47425,"p6D":51316},
"STU3048L":{"6":38074,"6A":38075,"6B":49004,"6C":47431,"6D":51323,"p6A":38075,"p6B":49004,"p6C":47431,"p6D":51323},
"STU3060L":{"2":38080,"2A":38081,"2B":49009,"2C":47581,"2D":51328,"p2A":38081,"p2B":49009,"p2C":47581,"p2D":51328},
"STU3064L":{"5":38086,"5A":38087,"5B":49014,"5C":47587,"5D":51333,"p5A":38087,"p5B":49014,"p5C":47587,"p5D":51333},
"STU3066L":{"6":38097,"6A":38100,"6B":49021,"6C":47592,"6D":51338,"p6A":38100,"p6B":49021,"p6C":47592,"p6D":51338},
"STU3074L":{"6":38111,"6A":38112,"6B":49026,"6C":47597,"6D":51343,"p6A":38112,"p6B":49026,"p6C":47597,"p6D":51343},
"STU3084L":{"6":38117,"6A":38118,"6B":49225,"6C":47602,"6D":51348,"p6A":38118,"p6B":49225,"p6C":47602,"p6D":51348},
"STU3085L":{"6":38123,"6A":38124,"6B":49230,"6C":47607,"6D":51395,"p6A":38124,"p6B":49230,"p6C":47607,"p6D":51395},
"STU3086L":{"6":38129,"6A":38130,"6B":49235,"6C":47613,"6D":51410,"p6A":38130,"p6B":49235,"p6C":47613,"p6D":51410},
"STU3087L":{"6":38135,"6A":38136,"6B":49240,"6C":47618,"6D":51417,"p6A":38136,"p6B":49240,"p6C":47618,"p6D":51417},
"STU3088L":{"6":38141,"6A":38142,"6B":49245,"6C":47755,"6D":51422,"p6A":38142,"p6B":49245,"p6C":47755,"p6D":51422},
"STU3089L":{"6":38147,"6A":38148,"6B":49250,"6C":47760,"6D":51427,"p6A":38148,"p6B":49250,"p6C":47760,"p6D":51427},
"STU3090L":{"6":38153,"6A":38154,"6B":49255,"6C":47766,"6D":51433,"p6A":38154,"p6B":49255,"p6C":47766,"p6D":51433},
"STU3091L":{"6":38159,"6A":38160,"6B":49260,"6C":47771,"6D":51438,"p6A":38160,"p6B":49260,"p6C":47771,"p6D":51438},
"STU3092L":{"6":38165,"6A":38166,"6B":49265,"6C":47776,"6D":51443,"p6A":38166,"p6B":49265,"p6C":47776,"p6D":51443},
"STU3093L":{"6":38171,"6A":38172,"6B":49446,"6C":47783,"6D":51503,"p6A":38172,"p6B":49446,"p6C":47783,"p6D":51503},
"STU3094L":{"6":38178,"6A":38179,"6B":49458,"6C":47788,"6D":51508,"p6A":38179,"p6B":49458,"p6C":47788,"p6D":51508},
"STU3095L":{"6":38184,"6A":38185,"6B":49463,"6C":47793,"6D":51513,"p6A":38185,"p6B":49463,"p6C":47793,"p6D":51513},
"STU3096L":{"6":38190,"6A":38191,"6B":49468,"6C":45111,"6D":51519,"p6A":38191,"p6B":49468,"p6C":45111,"p6D":51519},
"STU3097L":{"6":38196,"6A":38197,"6B":49473,"6C":45117,"6D":51524,"p6A":38197,"p6B":49473,"p6C":45117,"p6D":51524},
"STU3101L":{"6":38202,"6A":38203,"6B":49479,"6C":45126,"6D":51530,"p6A":38203,"p6B":49479,"p6C":45126,"p6D":51530},
"STU3102L":{"6":38208,"6A":38209,"6B":49484,"6C":45133,"6D":51535,"p6A":38209,"p6B":49484,"p6C":45133,"p6D":51535},
"STU3103L":{"6":38214,"6A":38215,"6B":49489,"6C":45139,"6D":51540,"p6A":38215,"p6B":49489,"p6C":45139,"p6D":51540},
"TVL001L":{"aA1":18262,"aA2":17053,"aA3":27191,"aA4":4056,"aA5":65814,"pA1":31384,"pA3":31385},
"TVL002L":{"aA1":17607,"aA2":33249,"aA3":45520,"aA4":45521,"aA5":26094,"aA6":26093,"aA7":3966,"aA8":26092,"pA1":63340,"pA2":31387,"pA3":102602,"pA4":101477,"pA5":102542,"pA6":102603,"pA7":102601},
"TVL003L":{"aA1":16273,"aA10":40224,"aA11":40225,"aA12":44852,"aA13":59455,"aA14":59456,"aA2":18177,"aA3":18263,"aA4":17891,"aA5":18204,"aA6":40203,"aA7":18243,"aA8":18178,"aA9":33176,"pA1":31430,"pA10":24314,"pA11":69426,"pA12":31428,"pA2":89219,"pA3":31432,"pA4":31427,"pA5":24315,"pA6":101478,"pA7":31431,"pA8":31429,"pA9":6813},
"TVL005L":{"aA1":17893,"aA10":5374,"aA11":27124,"aA12":18264,"aA13":18206,"aA14":18205,"aA15":33187,"aA16":59457,"aA2":47253,"aA3":18244,"aA4":27123,"aA5":18179,"aA6":18180,"aA7":18245,"aA8":33177,"aA9":27127,"pA1":31443,"pA10":24317,"pA11":31440,"pA12":31441,"pA13":31438,"pA14":31437,"pA15":31434,"pA2":102543,"pA3":31439,"pA5":31426,"pA6":31436,"pA8":31444},
"TVL006L":{"aA1":33178,"pA1":24318},
"TVL007L":{"aA1":18209,"aA2":44857,"aA3":63103,"aA4":65000,"aA5":88128,"pA1":31565,"pA2":13261,"pA3":101569},
"TVL008L":{"aA1":4111,"aA2":8271,"aA3":6272,"aA4":8265,"aA5":42238,"aA6":59458,"aA8":73855,"pA1":102605,"pA2":102606,"pA3":101570},
"TVL009L":{"aA1":27128,"aA2":27130,"aA3":27131,"aA4":18246,"aA6":33250,"aA7":27134,"aA8":1635,"pA1":31552,"pA2":31553,"pA4":31550,"pA5":102544,"pA6":102545,"pA8":31551},
"TVL011L":{"aA1":33302,"pA1":31547},
"TVL013L":{"aA1":18231,"pA1":31531},
"TVL015L":{"aA":6273,"aA1":18182,"aA2":18266,"aA4":18247,"aA5":27138,"aA6":47255,"pA1":31536,"pA4":31533},
"TVL017L":{"aA1":5375,"aA2":18208},
"TVL019L":{"aA1":18299,"aA10":18251,"aA11":18250,"aA12":18186,"aA13":17922,"aA14":18268,"aA15":18275,"aA16":18274,"aA17":18273,"aA18":18272,"aA19":33514,"aA2":18270,"aA20":18269,"aA21":18249,"aA22":18248,"aA23":18214,"aA24":18213,"aA25":18184,"aA3":18212,"aA4":18183,"aA5":17974,"aA6":17936,"aA7":17935,"aA8":17921,"aA9":33277,"pA1":31356,"pA10":31365,"pA11":31381,"pA12":31361,"pA13":31375,"pA16":31358,"pA18":31366,"pA21":31369,"pA6":31372,"pA7":31363,"pA8":31371},
"TVL021L":{"aA1":18054,"aA10":29387,"aA2":18134,"aA3":18215,"aA4":18252,"aA5":27141,"aA6":18276,"aA7":18187,"aA8":18188,"aA9":45924,"pA1":31446,"pA2":31447,"pA3":31453,"pA4":31451,"pA5":31449,"pA6":31452,"pA7":31448,"pA8":90670,"pA9":102893},
"TVL022L":{"aA1":33278},
"TVL023L":{"aA1":18136,"aA2":18233,"pA1":31402},
"TVL025L":{"aA1":47861,"aA10":45939,"aA11":45136,"aA12":45147,"aA13":39273,"aA2":27143,"aA3":18253,"aA4":27144,"aA5":27200,"aA6":27142,"aA7":18138,"aA8":18277,"aA9":45940,"pA1":31411,"pA2":40710,"pA3":102894,"pA4":31413,"pA5":31410,"pA7":6824,"pA8":6821},
"TVL027L":{"aA":33280,"aA1":33279,"aA10":27145,"aA11":18278,"aA12":27129,"aA13":18181,"aA14":83375,"aA2":18140,"aA3":18217,"aA4":33281,"aA5":8481,"aA6":33282,"aA7":18254,"aA8":18190,"aA9":27146,"pA1":31349,"pA10":67077,"pA11":31350,"pA2":31345,"pA3":6825,"pA4":31346,"pA5":31353,"pA6":89220},
"TVL029L":{"aA2":27147,"aA3":33284,"aA5":81795,"pA1":31348,"pA2":31351,"pA4":102555},
"TVL030L":{"aA1":72337},
"TVL031L":{"aA1":33285,"aA2":18218,"aA3":18280,"aA4":18281,"aA5":18236,"pA1":31390,"pA2":31389,"pA3":31391,"pA4":31392},
"TVL033L":{"aA1":18191,"aA2":33286,"aA3":18282,"aA4":18141,"aA5":18219,"aA6":27148,"aA7":16502,"pA1":31456,"pA2":31458,"pA3":31455,"pA5":31457},
"TVL035L":{"aA1":27149,"aA2":18237,"pA1":31400},
"TVL037L":{"aA1":5384,"aA2":33319,"aA3":33324,"aA4":33370,"aA5":33373,"aA6":45941,"aA7":45148,"pA1":18888,"pA2":18890,"pA4":20833,"pA5":20836,"pA6":20835,"pA7":20839},
"TVL039L":{"aA1":18283,"aA2":33377,"aA3":33378,"aA4":18220,"pA2":31567,"pA3":31568},
"TVL041L":{"aA":59465,"aA2":45445,"aA3":12902,"pA2":31556,"pA3":31557},
"TVL043L":{"aA1":18161,"aA10":18192,"aA11":33382,"aA12":18285,"aA13":18286,"aA14":27150,"aA15":18221,"aA16":5309,"aA17":9605,"aA18":14897,"aA2":5307,"aA3":14828,"aA4":27152,"aA5":18193,"aA6":27151,"aA7":27190,"aA8":27153,"aA9":33386,"pA1":31470,"pA10":48465,"pA12":31465,"pA13":31466,"pA14":31467,"pA15":20845,"pA16":31473,"pA17":31472,"pA3":31469,"pA5":31463,"pA7":31474},
"TVL045L":{"aA1":18162,"aA10":33389,"aA11":18287,"aA2":18168,"aA3":18222,"aA4":27157,"aA5":18288,"aA6":18289,"aA7":18194,"aA8":18256,"aA9":27158,"pA1":31478,"pA10":102301,"pA11":31483,"pA2":102895,"pA3":31481,"pA5":31484,"pA7":31480,"pA8":31482},
"TVL047L":{"aA1":18239,"aA2":44855,"aA3":68475,"aA4":60243,"aA5":65004,"pA1":31477,"pA2":102701,"pA3":102700,"pA4":102302,"pA5":31487},
"TVL048L":{"aA1":33183,"pA1":31485},
"TVL049L":{"aA1":18240,"aA2":8347,"pA1":102702,"pA3":31394},
"TVL051L":{"aA1":27161},
"TVL052L":{"aA1":12005,"aA2":15018,"aA3":15019,"aA4":14911,"aA5":65007,"aA6":65006,"pA1":27413,"pA2":102703,"pA3":102382,"pA4":102896},
"TVL053L":{"aA1":33638,"aA2":27163,"aA3":27165,"aA4":18241,"aA6":33422,"pA1":24586,"pA4":31420},
"TVL054L":{"aA1":46132,"aA2":18284,"pA1":31422},
"TVL055L":{"aA1":18169,"pA1":31418},
"TVL057L":{"aA1":33420},
"TVL059L":{"aA1":27193},
"TVL061L":{"aA1":27168,"aA2":33410,"aA3":5961,"pA1":31579},
"TVL063L":{"aA1":18170,"aA10":18198,"aA11":5411,"aA12":46133,"aA13":33303,"aA14":18293,"aA15":27169,"aA16":33387,"aA17":9607,"aA2":33381,"aA3":18223,"aA5":5412,"aA6":33380,"aA7":18257,"aA8":33394,"aA9":27170,"pA10":31517,"pA11":20843,"pA12":31520,"pA17":31523,"pA2":31519,"pA3":31518},
"TVL065L":{"aA1":18171,"aA2":18199,"aA3":18294,"aA4":18224,"pA1":31511,"pA3":31514,"pA4":31513,"pA5":31512},
"TVL067L":{"aA1":18295,"aA2":18225,"aA3":27173,"aA4":18258,"aA5":27172,"aA6":33270,"aA7":14904,"pA1":31561,"pA2":31559,"pA4":31560,"pA5":31562,"pA6":20844},
"TVL069L":{"aA1":5406,"aA2":5409},
"TVL070L":{"aA1":14908,"aA2":29620,"aA3":33276,"pA1":20847,"pA2":89222},
"TVL071L":{"aA1":18172,"aA10":27182,"aA11":27183,"aA12":27185,"aA13":9618,"aA14":46134,"aA15":14909,"aA16":68514,"aA17":68515,"aA18":27166,"aA2":18296,"aA3":18200,"aA4":27178,"aA5":18227,"aA6":18259,"aA7":27186,"aA8":27184,"aA9":27187,"pA1":31489,"pA11":31496,"pA12":31498,"pA13":33451,"pA14":31494,"pA2":31493,"pA3":31490,"pA4":24016,"pA5":31491,"pA7":31499,"pA8":31497,"pA9":31500},
"TVL073L":{"aA1":18228,"aA2":45769,"pA1":31570},
"TVL075L":{"aA1":18173,"aA10":33506,"aA11":8463,"aA2":18229,"aA3":18297,"aA4":27188,"aA5":27189,"aA6":18298,"aA7":33257,"aA8":18201,"aA9":18260,"pA1":31506,"pA10":102217,"pA11":89218,"pA2":31508,"pA4":31504,"pA5":31509,"pA6":31507,"pA8":31503,"pA9":31505},
"TVL076L":{"aA1":68389,"pA1":102608},
"TVL079L":{"aA1":68431,"aA3":65002,"pA1":33667,"pA2":48463,"pA3":48464},
"TVL090L":{"aA1":63990,"aA2":60246},
"TVL1194L":{"":7896},
"TVL1206L":{"":43707},
"TVL2030L":{"":7904},
"TVL2031L":{"":49879},
"TVL2123L":{"":49564},
"TVL2142L":{"":22646,"pA":28277,"pB":29676,"pC":30520,"pD":31043},
"TVL2153L":{"":97239},
"TVL3040L":{"":49994}
}
