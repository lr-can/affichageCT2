var unload_element;
var display_data;
var display_do_debug = false; // Do not modify here but in suivi preferences (Dev help)
var node_to_element = {};
var display_suivi ; // Current student being displayed
var pending_display_update = [] ;

function start_display() {
    if (TIP === undefined) {
        pending_display_update.push(start_display);
        return;
    }
    display_create_tree();
    display_data = {};
    display_suivi = document.getElementById('display_suivi');

    // Protect the last DVI.display_suivi in case of multiple student display
    var p = display_suivi.parentNode;
    display_suivi.id = '';
    var e = document.createElement('DIV');
    e.id = 'display_suivi';
    p.appendChild(e);
    display_suivi = e;
    column_get_option_running = true; // Do not set option in URL
}

function display_update(key_values, top) {
    if (TIP === undefined) {
        pending_display_update.push(function () { display_update(key_values, top);});
        return;
    }

    if (display_do_debug)
        console.log("==================== Display update ======================");
    the_body = document.getElementsByTagName('BODY')[0];
    var only_leaf_change = true; // to not redraw whole screen on leaf change
    for (var i in key_values.slice()) {
        var name = key_values[i][0];
        if (!display_definition[name]) {
            console.log("Not found in display_definition: " + name);
            continue;
        }
        display_data[name] = key_values[i][1];
        if (display_definition[name].children.length || !node_to_element[name])
            only_leaf_change = false;
        // Force to redraw leaves XXX DIRECTLY depending on this one
        for (var i in display_definition[name].needed_by) {
            var o = display_definition[name].needed_by[i];
            if (display_definition[o].children.length || !node_to_element[o])
                only_leaf_change = false;
            if (display_data[o] !== undefined)
                key_values.push([o, display_data[o]]);
        }
    }
    display_update.top = top;
    try { display_update_real(only_leaf_change ? key_values : undefined); }
    catch (e) { console.log(e); };
}

function display_create_tree() {
    for (var i in display_definition) {
        var dd = display_definition[i];
        dd.children = [];
        dd.name = i;
        dd.containers = dd[0];
        dd.priority = dd[1];
        dd.js = 'Display' + (dd[2] || i);
        dd.needed_by = [];
        try { dd.fct = eval(dd.js); } catch (e) { }
    }
    for (var i in display_definition)
        for (var j = 0; j < display_definition[i].containers.length; j++)
            if (!display_definition[display_definition[i].containers[j]
            ])
                alert('Unknown parent for ' + i + ' ' + j);
            else
                display_definition[display_definition[i].containers[j]
                ].children.push(display_definition[i]);
    for (var i in display_definition) {
        display_definition[i].children.sort(function (a, b) { return a.priority - b.priority; });
        var need = display_definition[i].need_node;
        for (var i in need)
            display_definition[need[i]].needed_by.push(i);
    }
}

function display_display_debug(event, txt) {
    var t = document.getElementById('display_display_tip');
    if (!t) {
        var e = document.createElement('DIV');
        e.id = 'display_display_tip';
        e.style.position = 'absolute';
        e.style.background = '#000';
        e.style.color = '#FFF';
        e.style.opacity = 0.7;
        e.style.fontSize = "70%";
        e.style.zIndex = 10000;
        the_body.appendChild(e);
        display_display_debug.e = e;
    }
    if (display_display_debug.e.style.visibility === 'hidden')
        display_display_debug.e.style.visibility = 'visible';
    event = the_event(event);
    if (display_display_debug.target !== event.target)
        display_display_debug.e.innerHTML = txt;
    else
        display_display_debug.e.innerHTML += '<hr>' + txt;
    display_display_debug.target = event.target;
    var pos = findPos(event.target);
    display_display_debug.e.style.left = pos[0] + event.target.offsetWidth + 'px';
    display_display_debug.e.style.top = pos[1] + event.target.offsetHeight + 'px';
}

// The display function returns a string (html) or an array
// [ "html content",
//   ["html class1", "html class2"...],
//   ["style1", "style2"...],
//   "other attributes"]
function display_display(node) {
    node.data = display_data[node.name];
    if (node.data === "")
        return '';
    var start;
    if (display_do_debug)
        start = millisec();
    if (node.fct === undefined)
        console.log(node);
    var need_node = node.fct.need_node;
    if (node.data === undefined && need_node === undefined)
        return '<div class="Display ' + node.name + '" style="display:none"></div>';
    for (var i in need_node)
        if (display_data[need_node[i]] === undefined)
            return '';
    var content = node.fct(node);
    var classes = ['Display', node.js, node.name];
    var styles = [];
    var more = '';
    if (content instanceof Array) {
        classes = classes.concat(content[1]);
        styles = styles.concat(content[2]);
        more = ' ' + content[3];
        content = content[0];
    }
    if (content === '' || !content)
        content = '';
    else {
        if (styles.length)
            styles = ' style="' + styles.join(';') + '"';
        else
            styles = '';

        if (display_do_debug && content.indexOf("display_display_debug") == -1) {
            var s = [];
            var n = node;
            while (n) {
                s.push(n.name + '(' + n.priority + ')');
                n = display_definition[n.containers[0]];
            }
            more += ' onmouseover="display_display_debug(event,'
                + js2(s.join('<br>')) + ')"';
        }

        content = '<div class="' + classes.join(' ') + '"' + styles + more + '>'
            + content + '</div>';
    }

    if (display_do_debug) {
        var dt = millisec() - start;
        if (dt > 1)
            console.log(node.name + ':' + dt + 'ms');
    }
    return content;
}

function detect_small_screen(force) {
    if (!force && window_width() == detect_small_screen.window_width)
        return;
    detect_small_screen.window_width = window_width();

    var smallscreen, lefts = [], div;
    var divs = document.getElementsByTagName('DIV');
    var top_class = '';
    for (var i = 0; i < divs.length; i++) {
        div = divs[i];
        if (div === undefined || div.classList === undefined)
            continue;
        if (div.classList.contains('BodyLeft')) {
            lefts.push(div);
            continue;
        }
        if (!div.classList.contains('BodyRight'))
            continue;

        if (lefts.length != 0)
            lefts[lefts.length - 1].style.minHeight = (div.offsetHeight + 50) + 'px';
        if (detect_small_screen.initial_width === undefined
            || detect_small_screen.initial_width < div.offsetWidth) {
            detect_small_screen.initial_width = div.offsetWidth;
        }
        smallscreen = detect_small_screen.initial_width / window_width() > 0.35;
    }
    if (is_a_teacher)
        top_class += ' teacher_view';
    else
        top_class += ' student_view';
    if (smallscreen)
        top_class += ' hide_right_column_1';
    var prefs = display_data['Preferences'] || display_data['HomePreferences'];
    for (var item in prefs)
        if (item != 'hide_right_column' || !smallscreen)
            top_class += ' ' + item + '_' + prefs[item];

    // Set the good theme
    if (top_class.indexOf("theme_") == -1)
        top_class = "theme_ " + top_class;
    var s;
    try { s = year_semester().split("/")[1]; }
    catch (e) { s = semester; }
    s = get_theme(s.substr(0, 1));
    top_class = (top_class + ' ').replace(/theme_([^ ]+) /, "theme$1 ")
        .replace("theme_ ", "theme" + s + " ");

    if (top_class.match("black_and_white_1"))
        top_class = top_class.replace(/theme([^ ]+) /, "themeBW ");

    // To not relaunch CSS animation
    if (the_body && the_body.className != top_class) {
        the_body.className = top_class;
        hide_rightclip();
    }
    smallscreen = top_class.indexOf('hide_right_column_1') != -1;
    detect_small_screen.small_screen = smallscreen;
    var twidth = window_width() - (smallscreen
        ? 110
        : (detect_small_screen.initial_width + 30)
    ); // +30 for FireFox
    if (twidth > 100)
        for (var i in lefts)
            lefts[i].style.maxWidth = twidth + 'px';
    try {
        hide_cellbox_tip();
    }
    catch (e) { };
}

var display_update_nb = 0;
var older_students = '';

function display_update_real(key_values) {
    if (display_update.top === undefined)
        return "";
    if (display_update_nb == 0)
        setInterval(detect_small_screen, 100);

    if (key_values) {
        for (var i in key_values) {
            i = key_values[i][0];
            node_to_element[i].outerHTML = display_display(display_definition[i]);
        }
    }
    else {
        if(!display_suivi) // Home page case
            display_suivi = document.getElementById('display_suivi');
        display_suivi.innerHTML = display_display(display_definition[display_update.top]);
        var divs = display_suivi.getElementsByTagName("DIV");
        node_to_element = {};
        for (var i = 0; i < divs.length; i++) {
            var div = divs[i];
            if (div.classList.contains('Display')) {
                var cls = div.className.split(/ +/);
                for (var j = 0; j < cls.length; j++)
                    node_to_element[cls[j]] = div;
            }
        }
    }

    if (document.getElementsByClassName('HomeTop')[0])
        document.getElementsByClassName('HomeTop')[0].style.height =
            (is_screen_large() ? '4' : '7') + 'em';

    display_update_nb++;
    detect_small_screen.window_width = 0; // Force update
    detect_small_screen();
}

function DisplayHorizontal(node, separator) {
    var children = [];
    if (separator === undefined)
        separator = '&nbsp;';
    if (node.data !== undefined)
        children.push(node.data);
    var c;
    for (var i in node.children) {
        c = display_display(node.children[i]);
        if (c)
            children.push(c);
    }
    return children.join(separator);
}
DisplayHorizontal.need_node = [];

function DisplayVertical(node) {
    return DisplayHorizontal(node, '');
}
DisplayVertical.need_node = [];

function display_debug_information() {
    return i_am_root;
    /*
    return display_data['Preferences']
      && display_data['Preferences']['debug_suivi']
      || display_data['HomePreferences']
      && display_data['HomePreferences']['debug_home'] ;
    */
}

function DisplayProfiling(node) {
    if (!display_debug_information())
        return '';
    var t = [];
    for (var i in node.data)
        t.push([node.data[i], i]);
    t.sort(function (a, b) { return b[0] - a[0]; });
    return hidden_txt('⌚', _('LINK_profiling') + '<br>' + t.join('<br>'));
}
DisplayProfiling.need_node = [];

function display_display_tree(node, s) {
    if (node === undefined) {
        var s = [];
        for (var node in display_definition) {
            node = display_definition[node];
            if (node.containers.length == 0) {
                s.push("<ul>");
                display_display_tree(node, s);
                s.push("</ul><hr>");
            }
        }
        new_window(s.join(''), "text/html");
        return;
    }
    s.push("<li> [" + node.priority + '] <b>' + html(node.name) + '</b>'
        + ('Display' + node.name != node.js ? ' ' + node.js : '')
        + (display_data[node.name]
            ? (' <span style="font-size: 70%">'
                + html(JSON.stringify(display_data[node.name])
                    .replace(/,/g, ', ').substr(0, 1000))
                + '</span>'
            )
            : '')
    )
        ;
    if (node.children.length) {
        s.push("<ul>");
        for (var i in node.children)
            display_display_tree(node.children[i], s);
        s.push("</ul>");
    }
}

function DisplayTree(_node) {
    if (!display_debug_information())
        return '';
    return '<a href="javascript:display_display_tree()">🌳</a>';
}
DisplayTree.need_node = [];

function DisplayPictureUpload(node)
{
  if ( ! node.data )
    return ;
  return hidden_txt(
       '<a href="javascript:picture_upload()">' + _("MSG_picture_upload")
        + '</a>',_("TIP_picture_upload")) ;
}
function picture_upload()
{
   create_popup("picture_upload", '<h1>' + _("MSG_picture_upload") + '</h1>',
                _("MSG_picture_upload_choose") + ' ' + username
                + '<p>' + _("TIP_picture_upload")
                + '<form action="' + add_ticket('my_picture_upload') + '"'
                + ' target="_blank"'
                + ' enctype="multipart/form-data" method="post">'
                + '<input type="file" name="datafile" size="40"><br>'
                + '<input type="submit" value="'
                + encode_value(_("MSG_picture_upload_send")) + '">'
                + '</form>',
                '', false) ;
}

var display_definition = {"ECUE_ok": [["UE"], 0.5], "choix_TVL": [["BodyRight"], -1, "Horizontal"], "FFSU": [["TopLine"], 3.5], "Compte": [["Top"], 0, "Vertical"], "FST": [["Logo"], 1], "BilanAPOGEE": [["LinksTable"], 2.01], "STS": [["LinksTable"], 11], "IA_scol": [["BodyRight"], 3.5], "EDT": [["LinksTable"], 10, "Horizontal"], "Home": [[], 0, "Vertical"], "HomeTop": [["Home"], 1, "Horizontal"], "HomeMessage": [["Home"], 2], "HomeColumns": [["Home"], 3], "HomeTitle": [["HomeTop"], 0], "HomeSemesters": [["HomeTop"], 1], "HomeSearch": [["HomeTop"], 5], "HomeRight": [["HomeTop"], 6, "Horizontal"], "HomeIdentity": [["HomeRight"], 1, "Vertical"], "HomeFeed": [["HomeRight"], 2], "HomeHelp": [["HomeRight"], 3], "HomePreferences": [["HomeRight"], 4], "HomePreferencesLanguages": [["HomePreferences"], 0], "HomePreferencesSize": [["HomePreferences"], 1], "HomePreferencesYearSemester": [["HomePreferences"], 3], "HomePreferences3ScrollBars": [["HomePreferences"], 4], "HomePreferencesForgetInput": [["HomePreferences"], 4.5], "HomePreferencesCompressed": [["HomePreferences"], 4.75], "HomePreferencesThemes": [["HomePreferences"], 5], "HomePreferencesDebug": [["HomePreferences"], 9], "HomeLogout": [["HomeIdentity"], 0], "HomeLogin": [["HomeIdentity"], 1], "HomeUE": [["HomeColumns"], 0], "HomeStudents": [["HomeColumns"], 1], "HomeActions": [["HomeColumns"], 2], "HomeUEUnsaved": [["HomeUE"], 0], "HomeUENrAccess": [["HomeUE"], 1], "HomeUETeacher": [["HomeUE"], 2], "HomeUEAcceded": [["HomeUE"], 3], "HomeUEBookmarked": [["HomeUE"], 4], "HomeUEMasterOf": [["HomeUE"], 5], "HomeUEMenu": [[], 0, "Vertical"], "HomeUEMenuActions": [["HomeUEMenu"], 0, "Horizontal"], "HomeUEMenuColumns": [["HomeUEMenu"], 1], "HomeUEOpenRO": [["HomeUEMenuActions"], 0], "HomeUEOpen": [["HomeUEMenuActions"], 1], "HomeUESignature": [["HomeUEMenuActions"], 2], "HomeUEPrint": [["HomeUEMenuActions"], 3], "HomeUEUnsemestrialize": [["HomeUEMenuActions"], 8], "HomeUESemestrialize": [["HomeUEMenuActions"], 8.5], "HomeUEClose": [["HomeUEMenuActions"], 9], "HomeStudentStudents": [["HomeStudents"], 0], "HomeStudentTeachers": [["HomeStudents"], 1], "HomeStudentVisited": [["HomeStudents"], 2], "HomeStudentFavorites": [["HomeStudents"], 3], "HomeStudentRefered": [["HomeStudents"], 4], "HomeStudentMenu": [[], 0, "Vertical"], "HomeStudentMenu1": [["HomeStudentMenu"], 1, "Horizontal"], "HomeStudentMenu2": [["HomeStudentMenu"], 2, "Horizontal"], "HomeStudentMenu3": [["HomeStudentMenu"], 3, "Horizontal"], "HomeStudentPicture": [["HomeStudentMenu1"], 1], "HomeStudentMail": [["HomeStudentMenu1"], 2], "HomeStudentBilan": [["HomeStudentMenu2"], 1], "HomeStudentSuivi": [["HomeStudentMenu2"], 2], "HomeStudentGet": [["HomeStudentMenu2"], 3], "HomeStudentTimeline": [["HomeStudentMenu2"], 4], "PictureUpload": [["LinksTable"], 20], "RdV": [["BodyLeft"], 2.5], "DateDeNaissance": [["BodyLeft"], 2.51, "Vertical"], "Notes": [["BodyLeft"], 1, "Vertical"], "Questionnaire": [["BodyLeft"], 2.6, "Vertical"], "IPAnnuelle": [["BodyRight"], 2.1], "HomeMailList": [["HomeActions"], 0], "HomeUEEtapes": [["HomeUE"], 2.5], "HomeUESpiral": [["HomeUEMenuActions"], 7], "HomeStudentIP_annuelle": [["HomeStudentMenu3"], 2], "HomeStudentApogee": [["HomeStudentMenu3"], 1], "Top": [[], 0, "Vertical"], "Private": [[], 0, "Vertical"], "Question": [[], 0, "Vertical"], "User": [["Top", "Private", "Question"], -3, "Horizontal"], "Preamble": [["Top", "Private", "Question"], -2], "Message": [["Top"], -1, "Horizontal"], "Messages": [["Top"], -0.5], "GrpMessages": [["Top"], -0.1], "Body": [["Top"], 1, "Horizontal"], "BodyLeft": [["Body"], 0, "Vertical"], "RightClip": [["Body"], 1], "BodyRight": [["RightClip"], 0, "Vertical"], "TopLine": [["BodyLeft", "Private", "Question"], 0, "Horizontal"], "Student": [["BodyLeft", "Private", "Question"], 1, "Horizontal"], "ReferentNP": [["BodyLeft"], 2, "Horizontal"], "LastGrades": [["BodyLeft"], 3], "UETree": [["BodyLeft"], 3.5], "Grades": [["BodyLeft"], 4], "Students": [["BodyLeft"], 5], "Tables": [["BodyLeft"], 6], "Semesters": [["BodyRight"], 1], "LinksTable": [["BodyRight", "T_LinksTable"], 2], "Abjs": [["BodyRight"], 3], "DA": [["BodyRight"], 4], "TT": [["BodyRight"], 5], "RSSStream": [["BodyRight"], 7], "P_template": [["BodyRight"], 8], "MoreOnSuivi": [["BodyRight"], 9], "ACLS": [["BodyRight"], 12], "Advertising": [["BodyRight"], 99], "ToTextual": [["User"], -10], "Logo": [["User"], 0], "YearSemester": [["User"], 1.9], "GoHome": [["User"], 1.95], "Reload": [["User"], 2], "Profiling": [["User", "HomeTop"], 3], "Tree": [["User", "HomeTop"], 4], "IdentityR": [["User"], -1, "Horizontal"], "Explanation": [["IdentityR"], 0], "Preferences": [["IdentityR"], 1], "IsPrivate": [["Private"], 5], "AskQuestion": [["Question"], 6], "Picture": [["TopLine"], 0], "Login": [["TopLine", "T_Title"], 1, "Vertical"], "Names": [["TopLine"], 2], "Civilite": [["TopLine"], 2.1], "GetStudent": [["TopLine"], 3], "UserInfo": [["TopLine"], 9], "Referent": [["LinksTable"], 0], "SetReferent": [["LinksTable"], 0.5], "Mails": [["LinksTable"], 1], "Official": [["LinksTable"], 2], "Bilan": [["LinksTable"], 3], "BilanCompetences": [["LinksTable"], 3.5], "StudentView": [["LinksTable"], 4], "NewSignature": [["LinksTable"], 5], "Charte": [["LinksTable"], 6], "Signature": [["LinksTable"], 7], "RSS": [["LinksTable"], 8], "MemberOf": [["LinksTable"], 10], "Sunburst": [["BodyRight"], 11], "UE": [[], 0], "UEHeader": [["UE"], 0, "Horizontal"], "UEComment": [["UE"], 1], "UEGrades": [["UE"], 2], "UEToggle": [["UEHeader"], -1], "UETitle": [["UEHeader"], 0], "UEMasters": [["UEHeader"], 1], "Cell": [[], 0, "Vertical"], "CellTop": [["Cell"], 0, "Vertical"], "CellBox": [["Cell"], 1], "CellBottom": [["Cell"], 2, "Vertical"], "CellAuthorLine": [["CellBottom"], 0, "Horizontal"], "CellComment": [["CellBottom"], 1], "CellColumn": [["CellBottom"], 2], "CellGroupMembers": [["CellBottom"], 3], "CellAuthor": [["CellAuthorLine"], 0], "CellMTime": [["CellAuthorLine"], 1], "CellTitle": [["CellBox"], 0], "CellValue": [["CellBox"], 1], "CellTypeLine": [["CellTop"], 0, "Vertical"], "CellDate": [["CellTop"], 1], "CellStatLine": [["CellTop"], 2, "Horizontal"], "CellRank": [["CellStatLine"], 0], "CellAvg": [["CellStatLine"], 1], "CellType": [["CellTypeLine"], 0], "CellFormula": [["CellTypeLine"], 1], "Textual": [[], 0, "Vertical"], "T_Title": [["Textual"], 1], "T_Names": [["T_Title"], 2], "T_Message": [["Textual"], 10], "T_Messages": [["Textual"], 20], "T_Grades_Lasts": [["Textual"], 30], "T_Grades": [["Textual"], 40], "T_Abjs": [["Textual"], 50], "T_DA": [["Textual"], 60], "T_TT": [["Textual"], 70], "T_LinksTable": [["Textual"], 80], "T_Semesters": [["Textual"], 90]};
