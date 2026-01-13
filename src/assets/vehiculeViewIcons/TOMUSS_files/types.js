/*
    TOMUSS: The Online Multi User Simple Spreadsheet
    Copyright (C) 2008-2011 Thierry EXCOFFIER, Universite Claude Bernard

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

var default_title = "Séance";

function update_filters() {
    filters = []; // GLOBAL
    for (var data_col in columns) {
        var column = columns[data_col];
        if (column.filter === '')
            continue;
        filters.push([column.real_filter, data_col, column]);
    }
    if (!column_get_option_running) {
        if (line_offset || the_current_cell != nr_headers) {
            line_offset = 0;
            the_current_cell.jump(nr_headers, the_current_cell.col, true);
        }
    }
    return true;
}


var alert_merged = false;

function alert_append_start() {
    alert_merged = '';
}

function alert_append_stop() {
    if (alert_merged)
        alert(alert_merged);
    alert_merged = false;
}

function alert_append(x) {
    if (alert_merged === false)
        alert(x);
    else
        alert_merged += '\n' + x;
}

/******************************************************************************
When an header change, update cells
******************************************************************************/

function update_column_recursive(column, line) {
    var type = column.real_type;

    if (column.update_done)
        return;
    column.update_done = true;

    if (!column.is_computed())
        return;

    if (column.replace.includes('[')
        || column.test_if.includes('[')
        || column.test_filter.includes('[')
    )
        column.need_update = true;

    if (column.type == 'Ue_Grade')
        ue_grade_update_columns(column);

    for (var c in column.average_columns) {
        update_column_recursive(columns[column.average_columns[c]], line);
        column.need_update |= columns[column.average_columns[c]].need_update;
    }

    if (column.need_update) {
        if (line === undefined) {
            for (var line_id in lines)
                if (lines[line_id][0].value !== '')
                    compute_cell_safe(column.data_col, lines[line_id],
                        type.cell_compute, my_identity);
        }
        else {
            compute_cell_safe(column.data_col, line, type.cell_compute, my_identity);
        }
    }

    return;
}

function update_columns(line) {
    var need_update = false;
    var data_col;

    for (data_col in columns) {
        var column = columns[data_col];
        column.update_done = false;
        if (column.columns.substr(0, 1) == '*')
            column_parse_attr('columns', column.columns, column);
    }

    for (data_col in columns)
        update_column_recursive(columns[data_col], line);

    for (data_col in columns) {
        need_update |= columns[data_col].need_update;
        columns[data_col].need_update = false;
    }
    return need_update;
}

// Give focus to a newly created focus (redondant but necessary)
function my_focus(event) {
    event = the_event(event);
    if (event.target) {
        event.target.focus();
        if (event.target.select !== undefined)
            event.target.select();
        event.target.onmouseup = function () { };
    }
}

/******************************************************************************
Column actions
******************************************************************************/

function column_title_to_data_col(title) {
    for (var data_col in columns)
        if (columns[data_col].title == title)
            return data_col;
}

function column_used_in_average(name) {
    for (var column in columns) {
        column = columns[column];
        if (!column_modifiable_attr('columns', column))
            continue; // Not used
        for (var use in column.average_from)
            if (column.average_from[use] == name)
                return column.title;
    }
    return false;
}

/******************************************************************************
Column Types
******************************************************************************/

function index_to_type(i) {
    // alert('index_to_type ' + i + ' ' + types[i].title);
    return types[i].title;
}

var types = [];

function test_nothing(value, _column) {
    return value;
}

function test_float(value, _column) {
    return Number(value);
}

function unmodifiable(value, _column) {
    // It was "return '' ;" before the 2010-09-13
    // It was modified in order to make the 'import_columns' function work.
    return value;
}

var column_attributes = {
"type":{display_table:1,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:"Note",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_type,visible_for:[],gui_display:"GUI_type",action:"popup_type_chooser",name:"type",what:"column",strokable:1,always_visible:0},
"MCQ_export":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['MCQ'],gui_display:"GUI_a",action:"MCQ_export",name:"MCQ_export",what:"column",strokable:1,always_visible:0},
"abi_is":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { column.need_update = true ; return Number(value) ;},visible_for:['Moy', 'Max', 'COMPETENCES_YEAR_RESULT', 'COMPETENCES_RESULT', 'Ue_Grade', 'Calcul_Repartition', 'Harmonise'],gui_display:"GUI_select",action:"",name:"abi_is",what:"column",strokable:1,always_visible:0},
"abj_is":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { column.need_update = true ; return Number(value) ;},visible_for:['Moy', 'Max', 'Calcul_Repartition', 'Harmonise'],gui_display:"GUI_select",action:"",name:"abj_is",what:"column",strokable:1,always_visible:1},
"alert":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[],formatter:function(column, value) { return JSON.stringify(value) ;},computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value) { if (value.push) return value; return JSON.parse(value);},visible_for:[],gui_display:"GUI_button",action:"configure_alert",name:"alert",what:"column",strokable:1,always_visible:0},
"analyser_config":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"{\n        \"script_G_upload\":0,\n        \"script_G_old_upload\":0,\n        \"script_G_on_upload\":0,\n        \"script_U_upload\":0,\n        \"script_U_old_upload\":0,\n        \"script_G\":\"# Your Python script\",\n        \"script_U\":\"# Your Python script\"}",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:test_nothing,visible_for:['Analyser'],gui_display:"GUI_a",action:"analyser_config",name:"analyser_config",what:"column",strokable:1,always_visible:0},
"annotate":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { if ( value.substr ) value = JSON.parse(value) ; column.annotator = value ; return value ; },visible_for:['Annotate'],gui_display:"GUI_a",action:"annotator_config",name:"annotate",what:"column",strokable:1,always_visible:0},
"annotate_pdf":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['Annotate'],gui_display:"GUI_a",action:"annotator_pdf_get",name:"annotate_pdf",what:"column",strokable:1,always_visible:0},
"author":{display_table:0,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:"",formatter:get_author2,computed:1,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:test_nothing,visible_for:[],gui_display:"GUI_none",action:"",name:"author",what:"column",strokable:1,always_visible:0},
"calendar":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"202305020800:120 202305021000:120 202305021400:120 202305021600:120\n202305030800:120 202305031100:120 202305031500:60 202305031700:120\n202305040800:120 202305041000:120                  202305041600:120\n202305050800:120 202305051000:120 202305051400:120\n202305080800:120 202305081000:120 202305081400:120 202305081600:60 202305081700:60",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_calendar,visible_for:['Calendar'],gui_display:"GUI_a",action:"calendar_configure",name:"calendar",what:"column",strokable:1,always_visible:0},
"calendarexport":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['Calendar'],gui_display:"GUI_a",action:"calendar_export",name:"calendarexport",what:"column",strokable:1,always_visible:0},
"cell_writable":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"= | @ | @=",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:
function(value, column)
{
    column.cell_writable_filter = compile_filter_generic(value, column, true) ;
    return value ;
},visible_for:[],gui_display:"GUI_input",action:"",name:"cell_writable",what:"column",strokable:1,always_visible:1},
"clamp":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { column.need_update = true ; return Number(value) ;},visible_for:['Normalize', 'Moy', 'Max', 'Calcul_Repartition', 'Harmonise'],gui_display:"GUI_select",action:"",name:"clamp",what:"column",strokable:1,always_visible:0},
"columns":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_columns,visible_for:['Surname', 'Weighted_Percent', 'Normalize', 'If_Else', 'Replace', 'Get_Referent', 'Code_Etape', 'Moy', 'Can_Bring_A_Pc', 'Rank', 'Analyser', 'Diff_Date', 'Max', 'Civilite', 'COMPETENCES_YEAR_RESULT', 'Working_Hours', 'COMPETENCES_GRADE', 'Phone', 'COMPETENCES_RESULT', 'Commute_Time', 'Dispatcher', 'Firstname', 'First_Registration', 'Nmbr', 'COW', 'Add', 'Mail', 'Product', 'Status', 'Abis', 'Mail_Resps_Ue_A', 'Responsable_P', 'Grade', 'Mail_Resps_Ue', 'Mcc_Type_Epreuve_2', 'Calcul_Repartition', 'Redoublement', 'Nombre_Etudiants_Automne', 'Population_Rv', 'Responsable_A', 'Moyenne_Courante', 'Nombre_Etudiants', 'Apogee', 'Nbia', 'Discipline', 'Harmonise', 'Nombre_Etudiants_Printemps', 'Preinsiufm', 'Cod_Pru', 'Je_Viens', 'Mcc_Type_Epreuve_1', 'Populations', 'Formation', 'Sportif', 'Credits', 'Intitule_Ue', 'Resultat', 'Mail_Resps_Ue_P', 'Etablissement', 'Nombre_Etudiants_Max', 'Portail', 'Cod_Cat', 'Mcc_Duree_Session_1', 'Mcc_Duree_Session_2'],gui_display:"GUI_input",action:"",name:"columns",what:"column",strokable:1,always_visible:1},
"comment":{display_table:1,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_comment,visible_for:[],gui_display:"GUI_input",action:"",name:"comment",what:"column",strokable:1,always_visible:0},
"competence":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:test_nothing,visible_for:[],gui_display:"GUI_input",action:"",name:"competence",what:"column",strokable:1,always_visible:0},
"competences_grade":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"{\"formulas\":[\"* Average = * Min .\"],\"weights\":{}}",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { column.p_competences_grade = JSON.parse(value); return value;},visible_for:['COMPETENCES_GRADE'],gui_display:"GUI_a",action:"competences_grade_configure",name:"competences_grade",what:"column",strokable:1,always_visible:0},
"completion":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value ; },visible_for:['Text', 'Login'],gui_display:"GUI_a",action:"toggle_completion",name:"completion",what:"column",strokable:1,always_visible:0},
"course_dates":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:course_dates_formatter,computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_course_dates,visible_for:[],gui_display:"GUI_input",action:"",name:"course_dates",what:"column",strokable:1,always_visible:0},
"delete":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:[],gui_display:"GUI_a",action:"column_delete",name:"delete",what:"column",strokable:1,always_visible:0},
"dispatcher_config":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"{\n        \"columns\": [\"25 Mar-08h-Foot\\n25 Mar-08h-Gym\\n25 Mar-10h-Foot\\n25 Mar-10h-Gym\",\n                    \"25 Mer-08h-Foot\\n25 Mer-08h-Gym\\n25 Mer-10h-Foot\\n25 Mer-10h-Gym\"],\n        \"choices\": [ {\"title\": \"Sort your sports by preference\",\n                      \"values\": \"Foot Gym\",\n                      \"repetition\": 1},\n                     {\"title\": \"Sort your time slots by preference\",\n                      \"values\": \"Mar-08h Mar-10h Mer-08h Mer-10h\",\n                      \"repetition\": 10}\n                   ]\n    }",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:test_nothing,visible_for:['Dispatcher'],gui_display:"GUI_a",action:"dispatcher_config",name:"dispatcher_config",what:"column",strokable:1,always_visible:0},
"empty_is":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_empty_is,visible_for:[],gui_display:"GUI_input",action:"",name:"empty_is",what:"column",strokable:1,always_visible:0},
"enumeration":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_test_enumeration,visible_for:['Enumeration'],gui_display:"GUI_input",action:"",name:"enumeration",what:"column",strokable:1,always_visible:0},
"export":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:[],gui_display:"GUI_a",action:"export_column",name:"export",what:"column",strokable:1,always_visible:0},
"fill":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:[],gui_display:"GUI_a",action:"fill_column",name:"fill",what:"column",strokable:1,always_visible:0},
"freezed":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:0,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value ; },visible_for:[],gui_display:"GUI_a",action:"freeze_column",name:"freezed",what:"column",strokable:1,always_visible:0},
"grade_session":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) {
        column.need_update = true ;
        for(var datacol in columns)
            if (columns[datacol].type == 'Ue_Grade')
                columns[datacol].need_update = true ;
        setTimeout(grade_type_in_average, 100);
        return Number(value) ;
        },visible_for:['MCQ', 'Normalize', 'If_Else', 'Replace', 'Moy', 'Analyser', 'Max', 'COMPETENCES_GRADE', 'Notation', 'Nmbr', 'COW', 'Add', 'Product', 'Note', 'Annotate', 'Calcul_Repartition', 'Harmonise'],gui_display:"GUI_select",action:"",name:"grade_session",what:"column",strokable:1,always_visible:1},
"grade_type":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) {
        column.need_update = true ;
        for(var datacol in columns)
            if (columns[datacol].type == 'Ue_Grade')
                columns[datacol].need_update = true ;
        setTimeout(grade_type_in_average, 100);
        return Number(value) ;
        },visible_for:['MCQ', 'Normalize', 'If_Else', 'Replace', 'Moy', 'Analyser', 'Max', 'COMPETENCES_GRADE', 'Notation', 'Nmbr', 'COW', 'Add', 'Product', 'Note', 'Annotate', 'Calcul_Repartition', 'Harmonise'],gui_display:"GUI_select",action:"",name:"grade_type",what:"column",strokable:1,always_visible:1},
"green":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_green,visible_for:[],gui_display:"GUI_input",action:"",name:"green",what:"column",strokable:1,always_visible:0},
"greentext":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_greentext,visible_for:[],gui_display:"GUI_input",action:"",name:"greentext",what:"column",strokable:1,always_visible:0},
"groupcolumn":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_groupcolumn,visible_for:['URL', 'MCQ', 'Competences', 'Text', 'Analyser', 'Date', 'Login', 'Enumeration', 'Bool', 'Prst', 'Upload', 'Notation', 'Dispatcher', 'Note', 'Annotate'],gui_display:"GUI_input",action:"",name:"groupcolumn",what:"column",strokable:1,always_visible:1},
"hidden":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(column, value) { return value ; },computed:1,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { return value ;},visible_for:[],gui_display:"GUI_a",action:"hide_column",name:"hidden",what:"column",strokable:0,always_visible:0},
"highlight":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value ; },visible_for:[],gui_display:"GUI_a",action:"toggle_highlight",name:"highlight",what:"column",strokable:1,always_visible:0},
"import":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:[],gui_display:"GUI_a",action:"import_column",name:"import",what:"column",strokable:1,always_visible:0},
"import_zip":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['Upload'],gui_display:"GUI_a",action:"import_zip",name:"import_zip",what:"column",strokable:1,always_visible:0},
"locked":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { return Number(value) ;},visible_for:[],gui_display:"GUI_select",action:"",name:"locked",what:"column",strokable:1,always_visible:0},
"mcq":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[{}, {}],formatter:function(column, value) { return JSON.stringify(value) ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column, interactive)
    {
    if ( ! value )
        return [{},{}] ;
    if ( value.substr )
        return JSON.parse(value) ;
    return value ;
    },visible_for:['MCQ'],gui_display:"GUI_input",action:"",name:"mcq",what:"column",strokable:1,always_visible:0},
"minmax":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"[0;20] ",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_test_note,visible_for:['Weighted_Percent', 'MCQ', 'Normalize', 'If_Else', 'Replace', 'Moy', 'Rank', 'Analyser', 'Diff_Date', 'Max', 'COMPETENCES_YEAR_RESULT', 'COMPETENCES_GRADE', 'COMPETENCES_RESULT', 'Notation', 'Nmbr', 'COW', 'Add', 'Product', 'Ue_Grade', 'Note', 'Annotate', 'Calcul_Repartition', 'Harmonise', 'Credits'],gui_display:"GUI_input",action:"",name:"minmax",what:"column",strokable:1,always_visible:0},
"modifiable":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:1,default_value:0,formatter:function(column, value) { var e = document.getElementById('t_column_modifiable') ; if ( e ) if ( value >= 2 ) e.style.background = '#F88' ; else e.style.background = '' ; return value ;},computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { return Number(value) ;},visible_for:[],gui_display:"GUI_select",action:"",name:"modifiable",what:"column",strokable:1,always_visible:0},
"multiline":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value ; },visible_for:['Text', 'Login'],gui_display:"GUI_a",action:"toggle_multiline",name:"multiline",what:"column",strokable:1,always_visible:0},
"normalize":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"10 2",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:
function(value, column)
{
  value = value.trim().split(/ +/);
  var average = Number(value[0]);
  var stddev = Number(value[1]);
  if ( isNaN(average) ) {
    average = 10;
    alert(value[0] + ' → ' + average);
  }
  if ( isNaN(stddev) || stddev <= 0 ) {
    stddev = 2;
    alert(value[1] + ' → ' + stddev);
  }
  column.need_update = true ;
  return average + ' ' + stddev ;
},visible_for:['Normalize'],gui_display:"GUI_input",action:"",name:"normalize",what:"column",strokable:1,always_visible:0},
"notation_export":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['Analyser', 'Notation'],gui_display:"GUI_a",action:"notation_export",name:"notation_export",what:"column",strokable:1,always_visible:0},
"notation_import":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['Analyser', 'Notation'],gui_display:"GUI_a",action:"notation_import",name:"notation_import",what:"column",strokable:1,always_visible:0},
"position":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:0,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:test_float,visible_for:[],gui_display:"GUI_select",action:"",name:"position",what:"column",strokable:1,always_visible:0},
"private":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:1,default_value:"",formatter:function(column,value) { if ( value instanceof Array) return value.join(" ") ; else return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:test_nothing,visible_for:[],gui_display:"GUI_input",action:"",name:"private",what:"column",strokable:1,always_visible:0},
"qrcode_prst":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:[],formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['Prst'],gui_display:"GUI_a",action:"qrcode_prst",name:"qrcode_prst",what:"column",strokable:1,always_visible:0},
"red":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_red,visible_for:[],gui_display:"GUI_input",action:"",name:"red",what:"column",strokable:1,always_visible:0},
"redtext":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_redtext,visible_for:[],gui_display:"GUI_input",action:"",name:"redtext",what:"column",strokable:1,always_visible:0},
"repetition":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_repetition,visible_for:['URL', 'MCQ', 'Text', 'Analyser', 'Date', 'Login', 'Enumeration', 'Bool', 'Prst', 'Notation', 'COW', 'Note'],gui_display:"GUI_input",action:"",name:"repetition",what:"column",strokable:1,always_visible:1},
"replace":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"NaN 🡆 DEF ● \x3C10 🡆 AJ ● \x3E=10 🡆 ADM",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:
function(value, column)
{
  column.need_update = true ;
  column.replacements = undefined;
  return value ;
},visible_for:['Replace'],gui_display:"GUI_input",action:"",name:"replace",what:"column",strokable:1,always_visible:0},
"replace_in_avg":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { column.need_update = true ; return Number(value) ;},visible_for:['Note'],gui_display:"GUI_select",action:"",name:"replace_in_avg",what:"column",strokable:1,always_visible:0},
"speak":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { return Number(value) ;},visible_for:[],gui_display:"GUI_select",action:"column_speak",name:"speak",what:"column",strokable:1,always_visible:1},
"stats":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:[],gui_display:"GUI_none",action:"update_histogram",name:"stats",what:"column",strokable:1,always_visible:0},
"test_filter":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:
function(value, column)
{
  column.need_update = true ;
  column.test_filter_filter = compile_filter_generic(value, column, true) ;
  return value ;
},visible_for:['Weighted_Percent', 'Nmbr'],gui_display:"GUI_input",action:"",name:"test_filter",what:"column",strokable:1,always_visible:0},
"test_if":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:
function(value, column)
{
  column.need_update = true ;
  column.test_if_filter = compile_filter_generic(value, column, true) ;
  return value ;
},visible_for:['If_Else'],gui_display:"GUI_input",action:"",name:"test_if",what:"column",strokable:1,always_visible:0},
"title":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value.substr(0,default_title.length) == default_title && !isNaN(value.substr(default_title.length))  ; },check_and_set:set_title,visible_for:[],gui_display:"GUI_input",action:"",name:"title",what:"column",strokable:1,always_visible:0},
"trigger":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[],formatter:function(column, value) { return JSON.stringify(value) ;},computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value) { if (value.push) return value; return JSON.parse(value);},visible_for:[],gui_display:"GUI_button",action:"configure_trigger",name:"trigger",what:"column",strokable:1,always_visible:0},
"upload_max":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"5000",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:
function(value, column)
{
  value = a_float(value) ;
  if ( value > upload_max )
      value = upload_max ;
  if ( column.type == 'Upload' ) {
     column.min = 0;
     column.max = value;
     column.minmax = '[0;' + value + ']';
  }
  return value ;
}
,visible_for:['Upload'],gui_display:"GUI_input",action:"",name:"upload_max",what:"column",strokable:1,always_visible:0},
"upload_zip":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:1,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function() { return 1; },visible_for:['Upload'],gui_display:"GUI_a",action:"upload_zip",name:"upload_zip",what:"column",strokable:1,always_visible:0},
"url_base":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value; },visible_for:['URL'],gui_display:"GUI_input",action:"",name:"url_base",what:"column",strokable:1,always_visible:1},
"url_import":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value; },visible_for:['URL', 'MCQ', 'Competences', 'Text', 'Date', 'Login', 'Enumeration', 'Bool', 'Prst', 'Dispatcher', 'Note'],gui_display:"GUI_input",action:"",name:"url_import",what:"column",strokable:1,always_visible:1},
"url_title":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value; },visible_for:['URL', 'Upload'],gui_display:"GUI_input",action:"",name:"url_title",what:"column",strokable:1,always_visible:1},
"urlimg":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column){ return value ; },visible_for:['URL'],gui_display:"GUI_select",action:"",name:"urlimg",what:"column",strokable:1,always_visible:0},
"visibility":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:1,default_value:0,formatter:column_visibility_formatter,computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:function(value, column) { return Number(value) ;},visible_for:[],gui_display:"GUI_select",action:"",name:"visibility",what:"column",strokable:1,always_visible:0},
"visibility_date":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:1,default_value:"",formatter:
function(column, value)
{
  if ( value === '' ) return '' ;
  if ( isNaN(value) ) return value ;
  return column.visibility_date.substr(6,2) + '/' +
	 column.visibility_date.substr(4,2) + '/' +
	 column.visibility_date.substr(0,4) ;
},computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_visibility_date,visible_for:[],gui_display:"GUI_input",action:"",name:"visibility_date",what:"column",strokable:1,always_visible:0},
"weight":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"1",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_weight,visible_for:['Weighted_Percent', 'MCQ', 'Normalize', 'If_Else', 'Replace', 'Moy', 'Rank', 'Analyser', 'Diff_Date', 'Max', 'COMPETENCES_YEAR_RESULT', 'Enumeration', 'COMPETENCES_GRADE', 'COMPETENCES_RESULT', 'Prst', 'Upload', 'Notation', 'Nmbr', 'COW', 'Add', 'Product', 'Ue_Grade', 'Note', 'Annotate', 'Calcul_Repartition', 'Moyenne_Courante', 'Apogee', 'Harmonise', 'Resultat'],gui_display:"GUI_input",action:"",name:"weight",what:"column",strokable:1,always_visible:1},
"width":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:1,need_authorization:0,default_value:4,formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:test_float,visible_for:[],gui_display:"GUI_select",action:"",name:"width",what:"column",strokable:1,always_visible:0},
"best":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"0",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_best,visible_for:['Moy', 'Calcul_Repartition', 'Harmonise'],gui_display:"GUI_input",action:"",name:"best",what:"column",strokable:1,always_visible:1},
"rounding":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(column, value)
     {
      var e = document.getElementById('t_column_rounding') ;
      if ( e )
        e.style.background = (column.type == 'Moy' && value > rounding_avg)
                             ? '#F88' : '' ;
      return value ;
     },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_rounding,visible_for:['Weighted_Percent', 'MCQ', 'Normalize', 'If_Else', 'Replace', 'Moy', 'Analyser', 'Diff_Date', 'COMPETENCES_YEAR_RESULT', 'COMPETENCES_GRADE', 'COMPETENCES_RESULT', 'Upload', 'Notation', 'Nmbr', 'COW', 'Add', 'Product', 'Ue_Grade', 'Note', 'Annotate', 'Calcul_Repartition', 'Moyenne_Courante', 'Apogee', 'Harmonise', 'Resultat'],gui_display:"GUI_input",action:"",name:"rounding",what:"column",strokable:1,always_visible:1},
"worst":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"0",formatter:function(column, value) { return value ; },computed:0,only_masters:0,empty:function(column, value) { return value === "" ; },check_and_set:set_worst,visible_for:['Moy', 'Calcul_Repartition', 'Harmonise'],gui_display:"GUI_input",action:"",name:"worst",what:"column",strokable:1,always_visible:1}} ;
var table_attributes = {
"masters":{display_table:0,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:[],formatter:
function(value)
{
if ( value instanceof Array )
   value = value.join(' ') ;
else
   table_attr.masters = value.split(/ +/) ;
if ( table_attr.masters.length )
    i_am_the_teacher |= myindex(table_attr.masters, my_identity) != -1 ;
else
    i_am_the_teacher = false ;
return value ;
},computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"masters",what:"table",strokable:1,always_visible:0},
"teachers":{display_table:0,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:[],formatter:
function(value)
{
if ( value instanceof Array )
   return value.join(' ') ;
table_attr.teachers = value.split(/ +/) ;
return value ;
}
,computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"teachers",what:"table",strokable:1,always_visible:0},
"abj":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_button",action:"abj_per_day",name:"abj",what:"table",strokable:1,always_visible:0},
"adeweb":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:{},formatter:function(value) { return value ; },computed:1,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"adeweb",what:"table",strokable:1,always_visible:0},
"autosave":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_autosave_toggle",name:"autosave",what:"table",strokable:0,always_visible:0},
"autowidth":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"autowidth_toggle",name:"autowidth",what:"table",strokable:1,always_visible:0},
"bookmark":{display_table:0,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:1,formatter:table_bookmark,computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"",name:"bookmark",what:"table",strokable:1,always_visible:0},
"code":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"code",what:"table",strokable:1,always_visible:0},
"comment":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"comment",what:"table",strokable:1,always_visible:0},
"competence":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"{\"refine\": {}, \"formulas\":{\"observations\": [], \"subcomps\": []}}",formatter:
function(value)
{
    if(typeof value === 'string')
        table_attr.p_competence = JSON.parse(value);
    else
        table_attr.p_competence = value;
    value = JSON.stringify(table_attr.p_competence);
    return value;
}
,computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"competence",what:"table",strokable:1,always_visible:0},
"contains_users":{display_table:0,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:1,formatter:table_modifiable_toggle,computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"",name:"contains_users",what:"table",strokable:1,always_visible:0},
"dates":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[0, 2000000000],formatter:date_formatter,computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"dates",what:"table",strokable:1,always_visible:0},
"default_nr_columns":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"default_nr_columns",what:"table",strokable:1,always_visible:0},
"default_sort_column":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[0],formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"default_sort_column",what:"table",strokable:1,always_visible:0},
"etapes":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:{},formatter:function(value) { return value ; },computed:1,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"etapes",what:"table",strokable:1,always_visible:0},
"facebook":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_button",action:"tablefacebook",name:"facebook",what:"table",strokable:1,always_visible:0},
"formation":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[],formatter:function(value) { return value ; },computed:1,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"formation",what:"table",strokable:1,always_visible:0},
"forms":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_forms",name:"forms",what:"table",strokable:1,always_visible:0},
"group":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"configure_template",name:"group",what:"table",strokable:1,always_visible:0},
"hiddens":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"hiddens_change",name:"hiddens",what:"table",strokable:1,always_visible:0},
"hide_empty":{display_table:0,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(value)
{
  if ( value == table_attr.hide_empty )
     return Number(value) ;

  if ( ! table_change_allowed() || ! table_attr.modifiable )
    {
      if ( value != 0 )
        change_option('hide_empty', '1') ;
      else
        change_option('hide_empty', '0') ;
    }

  update_filtered_lines() ;
  table_fill(true) ;
  return Number(value) ;
},computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"",name:"hide_empty",what:"table",strokable:1,always_visible:0},
"invitation":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"send_invitation",name:"invitation",what:"table",strokable:1,always_visible:0},
"linear":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_linear",name:"linear",what:"table",strokable:1,always_visible:0},
"mail":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_button",action:"mail_window",name:"mail",what:"table",strokable:1,always_visible:0},
"mails":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:{},formatter:function(value) { return value ; },computed:1,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"mails",what:"table",strokable:1,always_visible:0},
"managers":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[],formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"managers",what:"table",strokable:1,always_visible:0},
"merge_students":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"merge_students",what:"table",strokable:1,always_visible:0},
"modifiable":{display_table:1,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:1,formatter:table_modifiable_toggle,computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"",name:"modifiable",what:"table",strokable:1,always_visible:0},
"nr_columns":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"nr_columns_change",name:"nr_columns",what:"table",strokable:1,always_visible:0},
"nr_lines":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:0,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"nr_lines_change",name:"nr_lines",what:"table",strokable:1,always_visible:0},
"official_ue":{display_table:1,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(v){return Number(v);},computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"",name:"official_ue",what:"table",strokable:1,always_visible:0},
"popup_on_red_line":{display_table:1,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:0,formatter:function(v){return Number(v);},computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"",name:"popup_on_red_line",what:"table",strokable:1,always_visible:0},
"portails":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:{},formatter:function(value) { return value ; },computed:1,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"portails",what:"table",strokable:1,always_visible:0},
"print":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_button",action:"print_selection",name:"print",what:"table",strokable:1,always_visible:0},
"private":{display_table:0,update_horizontal_scrollbar:0,update_headers:1,update_table_headers:0,need_authorization:1,default_value:0,formatter:
function(value)
{
  if ( (table_attr.masters.length == 0 || ! i_am_the_teacher) && value == 1
       && myindex(table_attr.managers, my_identity) == -1
       && myindex(table_attr.teachers, my_identity) == -1
       && ! i_am_root )
    {
      Alert("ALERT_colmunprivate") ;
      return ;
    }
  return Number(value) ;
},computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_select",action:"",name:"private",what:"table",strokable:1,always_visible:0},
"remove_history":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"{\n        \"too_many\":100,\n        \"before_date\":9999,\n        \"auto\":0\n    }",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"",name:"remove_history",what:"table",strokable:1,always_visible:0},
"rounding":{display_table:1,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:0,formatter:
function(value)
{
    var e = document.getElementById('t_table_attr_rounding') ;
    if ( e )
       if ( value == 2 )
            e.style.background = '#F88' ;
       else
            e.style.background = '' ;
    for(var data_col in columns)
    {
        var column = columns[data_col] ;
        column.need_update = true ;
        column_attributes.rounding.check_and_set(column.rounding, column) ;
    }
    return value ;
},computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:['Weighted_Percent', 'MCQ', 'Normalize', 'If_Else', 'Replace', 'Moy', 'Analyser', 'Diff_Date', 'COMPETENCES_YEAR_RESULT', 'COMPETENCES_GRADE', 'COMPETENCES_RESULT', 'Upload', 'Notation', 'Nmbr', 'COW', 'Add', 'Product', 'Ue_Grade', 'Note', 'Annotate', 'Calcul_Repartition', 'Moyenne_Courante', 'Apogee', 'Harmonise', 'Resultat'],gui_display:"GUI_select",action:"",name:"rounding",what:"table",strokable:1,always_visible:0},
"statistics":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:0,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_button",action:"display_statistics",name:"statistics",what:"table",strokable:1,always_visible:0},
"t_copy":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_copy",name:"t_copy",what:"table",strokable:1,always_visible:0},
"t_create":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_create",name:"t_create",what:"table",strokable:1,always_visible:0},
"t_export":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_export",name:"t_export",what:"table",strokable:1,always_visible:0},
"t_import":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_import",name:"t_import",what:"table",strokable:1,always_visible:0},
"table_clean":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_clean",name:"table_clean",what:"table",strokable:1,always_visible:0},
"table_delete":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:1,formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_delete",name:"table_delete",what:"table",strokable:1,always_visible:0},
"table_title":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_input",action:"",name:"table_title",what:"table",strokable:1,always_visible:0},
"theme":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:"",formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_theme",action:"",name:"theme",what:"table",strokable:1,always_visible:0},
"update_content":{display_table:0,update_horizontal_scrollbar:0,update_headers:0,update_table_headers:0,need_authorization:1,default_value:[],formatter:function(value) { return value ; },computed:0,only_masters:0,empty:function(value) { return value === "" ; },check_and_set:undefined,visible_for:[],gui_display:"GUI_a",action:"table_update_content",name:"update_content",what:"table",strokable:1,always_visible:0}} ;



function set_type(value, column, xcolumn_attr) {
    var checked = type_title_to_type(value);

    if (column.real_type
        && column.real_type.cell_compute !== undefined
        && checked.cell_compute === undefined
    ) {
        if (the_current_cell.line[column.data_col]._save !== undefined) {
            // Restore uncomputed values. XXX some may missing if never in client
            for (var line in lines)
                lines[line][column.data_col].restore();
        }
        else {
            // Make values user modifiable
            for (var line in lines) {
                var cell = lines[line][column.data_col];
                if (cell.author.length <= 1) {
                    cell = cell.set_value('')
                    lines[line][column.data_col] = cell
                    cell.date = '20000101010101'
                }
            }
        }
        table_fill(false, false, true);
    }
    if (column.real_type
        && column.real_type.cell_compute === undefined
        && checked.cell_compute !== undefined) {
        /* Save values */
        for (var line in lines)
            lines[line][column.data_col].save();
    }
    column.real_type = checked;
    column.need_update = true;

    if (xcolumn_attr === false && column.columns === '') {
        // Only here on local user interaction
        var use = _('B_' + column.real_type.title).split("(")[1];
        if (use == 'ID)' && data_col_from_col_title('ID') !== undefined)
            column_attr_set(column, 'columns', 'ID');
    }
    if (xcolumn_attr === false && column.real_type.type_change)
        column.real_type.type_change(column);

    for (var datacol in columns)
        if (columns[datacol].type == 'Ue_Grade')
            columns[datacol].need_update = true;

    setTimeout(grade_type_in_average, 100);
    return value;
}

function popup_type_choice_help(element) {
    var type = element.getAttribute('type');
    document.getElementById('type_help').innerHTML = '<b>' + _('B_' + type) + '</b> : '
        + _('H_' + type);
}

function popup_type_choice(t) {
    var type = t.title;
    var e = '<a type="' + type
        + '" onmouseenter="popup_type_choice_help(this)"'
        + ' onclick="javascript:popup_type_choosed(this)">'
        + _('B_' + type).replace(/(\(.*\))/,
            '<small><small>$1</small></small>')
        + '</a>';
    if (type === 'Note' || type === 'Prst' || type === 'Moy')
        e = '<b>' + e + '</b>';
    return e;
}

function type_filter(text) {
    var all_types = popup_get_element().getElementsByTagName('A');
    text = flat(text.toLowerCase());
    for (var type of all_types) {
        var code = type.getAttribute('type');
        if (flat(type.textContent).toLowerCase().indexOf(text) == -1 &&
            flat(_('H_' + code)).toLowerCase().indexOf(text) == -1)
            type.style.opacity = 0.2;
        else
            type.style.opacity = 1;
    }
    document.getElementById('type_help').innerHTML = '';
}

function popup_type_chooser(column, _value) {
    if (!column_change_allowed(column)) {
        Alert("ERROR_value_not_modifiable");
        return;
    }

    var cols = {};
    for (var i in types) {
        t = types[i];
        if (!cols[t.type_type])
            cols[t.type_type] = [];
        cols[t.type_type].push(popup_type_choice(t));
    }
    var t = '<style>#popup A:hover { color: blue; background: #FFF }</style><table class="colored" style="float:left"><tr>';
    for (var i in cols)
        t += '<th>' + _('TH_type_type_' + i);
    t += '</tr><tr>';
    for (var i in cols) {
        // Use try/catch for an unknown IE error
        try {
            cols[i].sort(function (a, b) {
                return a.human_priority
                    - b.human_priority;
            });
        }
        catch (error) {
        }
        t += '<td>' + cols[i].join('<br>');
    }
    t += '</table><div id="type_help"></div>';

    create_popup('type_chooser_div',
        _('TITLE_columntype') + column.title,
        _('MSG_columntype')
        + ' <input placeholder="' + _('filtre2.png') + '" onkeyup="type_filter(this.value)"><br>',
        t,
        false);
}

function popup_type_choosed(element) {
    var type = element.getAttribute('type');
    var t = type_title_to_type(type);
    if (t.type_type != 'data' && t.type_type != 'computed')
        if (!confirm(_('ALERT_columntype')))
            return;

    var button = document.getElementById('t_column_type');
    var td = the_td(button);
    column_attr_set(popup_column(), 'type', type, td, true);
    if (the_current_cell.column == popup_column()) {
        button.innerHTML = _('B_' + type);
        attr_update_user_interface(column_attributes['type'],
            the_current_cell.column);
    }
    popup_close();
    var n = 'ALERT_change_to_' + type;
    if (myindex(column_attributes['columns'].visible_for, type) >= 0) {
        if (the_current_cell.column.columns === '') {
            set_message('type_change', 1,
                _("COL_TITLE_type") + ' → ' + _('B_' + type) + '<br>'
                + (_(n) == n ? _("columns.png") : _(n).replace(/\n/g, '<br>')));
        }
        select_tab("column", _("TAB_formula"));
        document.getElementById('t_column_columns').focus();
        highlight_add(document.getElementById('t_column_columns'));
    }
    else if (_(n) != n)
        set_message('type_change', 1,
            _("COL_TITLE_type") + ' → ' + _('B_' + type) + '<br>'
            + _(n).replace(/\n/g, '<br>'));
    else
        set_message('type_change', 1);

    // Init competences
    if(type === "Competences")
        competenceTable.init_catalog_for(null);
}




// goto_resume()

function compute_abj_per_day(t) {
    var tag = document.getElementById('div_abjs');
    var s, abjs, end;
    var ttam = [], ttpm = [];
    var d = new Date();
    d.setTime(t);
    var t12 = t + 16 * 3600 * 1000;

    for (var login in the_abjs) {
        abjs = the_abjs[login];
        for (var i in abjs) {
            begin = parse_date(abjs[i][0]);
            end = parse_date(abjs[i][1]);
            if (end < t)
                continue; // Before the day
            if (begin > t12)
                continue; // After the day
            s = '<!-- ' + names[login]
                + ' --><tr><td>' + login + '<th align="left">'
                + names[login] +
                '<td>' + abjs[i][0] + '<td>' + abjs[i][1] +
                '<td>' + html(abjs[i][2]) + '</tr>';
            if (begin <= t)
                ttam.push(s);
            if (end > t)
                ttpm.push(s);
        }
    }
    ttam.sort();
    ttpm.sort();
    s = '<h3>' + _("MSG_abjtt_from_before") + ' ' +
        d.formate('%A %d %B %Y') + _("MSG_abjtt_from_after") + '</h3>';
    s += _("MSG_abjtt_begin_end");
    s += '<p>' + _("MSG_abjtt_morning") + '<table class="colored">';
    for (var i = 0; i < ttam.length; i++)
        s += ttam[i];
    s += '</table>';
    s += '<p>' + _("MSG_abjtt_afternoon") + '<table class="colored">';
    for (var i = 0; i < ttpm.length; i++)
        s += ttpm[i];
    s += '</table>';
    tag.innerHTML = s;
}

function abj_per_day() {
    var w = window_open(url + '/files/' + version + '/ok.png');
    w.document.open('text/html');

    var p = html_begin_head();


    var title = _("TITLE_abjtt") + ' ' + ue + ' ' + semester + ' ' + year;

    p += '<script src="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/abj.js" onload="this.onloadDone=true;"></script>' +
        '<title>' + title + '</title>' +
        '<body><h1>' +
        _("MSG_abjtt_P") +
        ' <a href="' + add_ticket(year+'/'+semester+'/'+ue+'/attendance') +
        '">' + _("TITLE_referent_resume") + '</a><h1>' +
        '<h1>' + title + '</h1>' +
        '<script>var the_abjs = {};\n' +
        'function virtual_init() {\n' +
        'if ( ! wait_scripts("virtual_init()") ) return ;\n' +
        'lib_init() ; }\n' +
        // The timeout is for IE (100 is not enough)
        'setTimeout(virtual_init, 200) ;\n';


    var s = '', t, end, names = '';
    var days = [];
    for (var i in the_student_abjs) {
        if (lines[login_to_line_id(i)] === undefined) {
            // A student with ABJ has been removed from the table
            continue;
        }
        if (!lines[login_to_line_id(i)].is_filtered)
            continue;
        s += "the_abjs[" + js(i) + "] = [";
        names += ',' + js(i) + ':'
            + js(lines[login_to_line_id(i)][2].value
                + ' ' + lines[login_to_line_id(i)][1].value);
        i = the_student_abjs[i];
        var t = '';
        for (var j in i[0]) {
            j = i[0][j];
            t += ',[' + js(j[0]) + ',' + js(j[1]) + ',' + js(j[2]) + ']';
            end = parse_date(j[1].replace(ampms[0], ampms[1])).getTime();
            for (var d = parse_date(j[0].replace(ampms[1], ampms[0]));
                d.getTime() < end;
                d.setTime(d.getTime() + 86400 * 1000)
            ) {
                if (d.getHours() == 23)
                    d.setHours(24);
                else if (d.getHours() == 1)
                    d.setHours(0);
                days[d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate()] = d.getTime();
            }

        }
        s += (t + ' ').substr(1) + '] ;\n';
    }
    p += s + '\n' +
        'var names = {' + (names + ' ').substr(1) + '};</script>';

    var mm, first, start, stop, yy, nr, table_abjs = '';

    var i = myindex(semesters, semester);
    yy = year;
    if (i != -1) { start = semesters_months[i][0]; stop = semesters_months[i][1]; }
    else { start = 1; stop = 12; }

    nr = 0;
    start--;
    stop--;
    for (var m = start; m <= stop; m++) {
        first = true;
        mm = m % 12;
        if (mm == 0)
            yy++;
        for (var d = 1; d < 32; d++) {
            if (first) {
                first = false;
                table_abjs += '<tr><th>' + months[mm];
                for (var i = 1; i < d; i++)
                    table_abjs += '<td>&nbsp;';
            }
            if (days[yy + '/' + mm + '/' + d]) {
                table_abjs += '<td><a onclick="javascript:compute_abj_per_day('
                    + days[yy + '/' + mm + '/' + d] + ');">' + d + '</a>';
                nr++;
            }
            else {
                table_abjs += '<td><span style="color:#DDD">' + d;
            }
        }

        if (!first) {
            table_abjs += '</tr>\n';
        }
    }

    if (nr)
        p += '<h2>' + _("TITLE_abjtt_abj") + '</h2>\n'
            + '<p>' + _("MSG_abjtt_choose_day")
            + '<table class="colored abj_table">' + table_abjs + '</table>'
            + _("MSG_abjtt_explanation_before") + ' <b>'
            + nr + "</b> " + _("MSG_abjtt_explanation_after") + "<br>"
            + _("MSG_abjtt_more_before") + ' '
            + '<a href="' + add_ticket(year + '/' + semester
                + '/' + ue + '/resume') + '">' + _("MSG_abjtt_more_link") + '</a> '
            + _("MSG_abjtt_more_after") + '<br>';
    else
        p += "<h2>" + _("TITLE_abjtt_no_abj") + "</h2>";


    var tt = [], tt2 = [], data, line, student, da;
    for (var login in the_student_abjs) {
        data = the_student_abjs[login];
        if (data[1].length == 0 && data[2] == '')
            continue;

        line = lines[login_to_line_id(login)];
        if (line && !line.is_filtered)
            continue;
        student = login;
        if (line)
            student = html(line[2].value) + ' ' + html(line[1].value)
                + '<br>' + login + '<br>'
                + (line[4].value ? _("COL_TITLE_0_4") + ': ' + html(line[4].value) + ' ' : '')
                + (line[3].value ? _("COL_TITLE_0_3") + ': ' + html(line[3].value) : '');

        if (data[2]) // Tiers-temps
            tt.push('<tr><td>' + student
                + '<td>' + html(data[2]).replace(/\n/g, '<br>') + '</tr>');

        for (da in data[1])
            if (data[1][da][0].substr(0, ue.length) == ue)
                tt2.push('<tr><td>' + student + '<td>À partir du '
                    + data[1][da][1] + '<br>'
                    + data[1][da][2] + '</tr>');

    }
    tt.sort();
    tt2.sort();

    if (tt.length == 0)
        tt = '<h2>' + _("TITLE_abjtt_no_tt") + '</h2>';
    else
        tt = '<h2>' + _("TITLE_abjtt_tt") + '</h2>'
            + '<table class="colored abj_table_tt">' + tt.join('\n') + '</table>';

    if (tt2.length == 0)
        tt2 = '<h2>' + _("TITLE_abjtt_no_da") + '</h2>';
    else
        tt2 = '<h2>' + _("TITLE_abjtt_da") + '</h2>'
            + '<table class="colored abj_table_da">' + tt2.join('\n') + '</table>';


    p += '<div id="div_abjs"></div>' + tt + tt2 + '</html></body>';
    w.document.write(p);
    w.document.close();
}




ALERT_RECORDS = { 'filter': 0, 'to': 0, 'cc': 0, 'subject': 0, 'body': 0 };

function configure_alert_record() {
    var new_config = [];
    var nbr = Object.keys(popup_column().alert).length + 1;
    for (var i = 0; i < nbr; i++) {
        var conf = {};
        var record = false;
        for (var name in ALERT_RECORDS) {
            var value = document.getElementById('alert_' + name + '_' + i).value.strip();
            if (value !== '') {
                conf[name] = value;
                record = true;
            }
        }
        if (record)
            new_config.push(conf);
    }
    column_attr_set(popup_column(), 'alert', new_config, undefined, true);
    popup_close();
}

function alert_colorize() {
    var nbr = Object.keys(popup_column().alert).length + 1;
    var errors = [];
    for (var i = 0; i < nbr; i++) {
        for (var name in ALERT_RECORDS) {
            var element = document.getElementById('alert_' + name + '_' + i);
            if (!element)
                continue;
            var value = element.value;
            element.style.color = "#000";
            value = value.split('[');
            for (var j in value) {
                if (j == 0)
                    continue;
                var title = value[j].split(']');
                if (title[1] !== undefined
                    && data_col_from_col_title(title[0]) === undefined) {
                    element.style.color = "#F00";
                    errors.push(_("TITLE_column_attr_alert")
                        + ' «' + html(popup_column().title) + '» : '
                        + _("ALERT_columns_unknown_title") + title[0] + '»<br>');
                }
            }
        }
    }
    set_message('column_alert', 2, errors.join(''));
}

function configure_alert() {
    var column = the_current_cell.column;
    var config = column.alert;
    config.push({});
    var content = [_('TIP_column_attr_alert'), '<table onkeyup="alert_colorize()">'];
    for (var name in ALERT_RECORDS) {
        content.push('</tr><tr><td colspan="' + config.length + '">'
            + _('MSG_alert_' + name) + '</tr><tr>');
        for (var i in config) {
            content.push('<td>');
            id = 'alert_' + name + '_' + i;
            if (name == 'body') {
                content.push('<textarea id="' + id + '" rows="10">');
                content.push(html(config[i][name] || ''));
                content.push('</textarea>');
            }
            else {
                content.push('<input id="' + id + '" value="');
                content.push(encode_value(config[i][name] || ''));
                content.push('">');
            }
        }
    }
    content.push('</tr></table>');
    create_popup('import_div',
        html(column.title) + ' <button onclick="configure_alert_record()">'
        + _('LABEL_save') + '</button>',
        content.join('').replace('</tr>', ''), '', false);
    alert_colorize();
    config.pop();
}





function table_autosave_toggle() {
    var e = document.getElementById('autosavelog');
    var link = document.getElementById('t_table_attr_autosave');
    if (table_attr.autosave) {
        table_attr.autosave = false;
        if (e)
            e.style.display = 'inline';
        link.innerHTML = '<span style="color:red">'
            + _('LABEL_save') + '</span>';
    }
    else {
        if (e)
            e.style.display = 'none';
        link.innerHTML = _("TITLE_table_attr_autosave");
        table_attr.autosave = true;
    }
    the_current_cell.update_table_headers();
}

function table_autosave_save() {
    if (!table_attr.autosave)
        table_autosave_toggle();
}


function autowidth_toggle(e) {
    if (table_attr.autowidth !== 0) {
        if (table_attr.autowidth == 1)
            table_attr.nr_columns = table_attr.default_nr_columns || Math.floor(char_per_line() / 8.5);
        else
            table_attr.nr_columns = table_attr.autowidth;
        table_attr.autowidth = 0;
        table_init();
        table_fill(false, true, false, true);
        update_horizontal_scrollbar();
        setTimeout("the_current_cell.update()", 100);
    }
    else {
        table_attr.autowidth = table_attr.nr_columns;
        update_nr_columns();
    }
    change_option('autowidth', table_attr.autowidth ? '1' : '0');
    document.getElementById(e).className = table_attr.autowidth ? '' : 'linkstroked';
}



var column_get_option_running; // true on table loading

// The value is the value that will be saved in the current column attribute
// because it is not yet fully stored.
function column_update_option(attr, value) {
    if (column_get_option_running)
        return;
    if (the_current_cell === undefined)
        return; // Not in the table editor
    var column, attr_value, save, p = '';

    column = the_current_cell.column;
    if (column['_' + attr] === undefined)
        column['_' + attr] =
            column[attr] === undefined || value === undefined ? ' ' : column[attr];

    for (var data_col in columns) {
        column = columns[data_col];
        if (column.is_empty)
            continue;
        if (value === undefined || data_col != the_current_cell.data_col)
            attr_value = column[attr];
        else
            attr_value = value; // Not yet saved

        if (column_attributes[attr] === undefined) {
            // For column filters
            save = attr_value !== '';
        }
        else {
            save = (!column_change_allowed(column) && column['_' + attr] !== undefined
                && attr_value != column['_' + attr]
            );
        }
        if (save)
            p += column.the_id + ':' + encode_uri_option(attr_value) + '=';
    }
    change_option(attr + 's', p);
}

function column_get_option(attr, alternate_option_name) {
    var h = get_option(attr + 's', '');
    if (h === '')
        h = get_option(alternate_option_name + 's', ''); // Compatibility
    h = h.split('=');
    for (var i in h) {
        var j = h[i].split(':');
        if (j.length != 2)
            break;
        var data_col = data_col_from_col_id(j[0]);
        if (data_col === undefined)
            if (columns[Number(j[0])])
                data_col = Number(j[0]);  // For compatibility with old bookmarks
        if (data_col === undefined)
            continue;
        if (attr !== 'filter')
            column_attr_set(columns[data_col], attr, decode_uri_option(j[1]));
        else {
            init_column(columns[data_col]);
            columns[data_col][attr] = set_filter_generic(decode_uri_option(j[1]),
                columns[data_col]);
        }
    }
}

function table_bookmark(value) {
    change_option('foobar', '');
    return Number(value);
}

function __d(txt) {
    debug_window.document.write(txt);
}

// Called from runlog in lib.js

function get_all_options() {
    var h;
    if (window.location.pathname.search('=debug=') != -1) {
        _d = __d;
        debug_window = window_open('debug');
        debug_window.document.open('text/plain');
    }

    _d('start get_all_options\n');

    if (window.location.pathname.search('=user=') != -1) {
        root = [];
        i_am_root = false;
    }

    if (window.location.pathname.search('=tipfixed=') != -1)
        tip_fixed = 1;

    table_attr.nr_lines = Number(get_option('nr_lines', table_attr.nr_lines));
    table_attr.nr_columns = Number(get_option('nr_cols', table_attr.nr_columns));
    table_attr.autowidth = Number(get_option('autowidth', table_attr.autowidth));
    table_attr.hide_empty = Number(get_option('hide_empty', table_attr.hide_empty));
    column_offset = Number(get_option('column_offset', column_offset));

    h = get_option('hidden', '').split('=');
    for (var i in h)
        if (columns[h[i]])
            columns[h[i]].hidden = 1;

    h = get_option('sort', '');
    if (h !== '') {
        h = h.split('=');
        sort_columns = [];
        for (var i in h) {
            var x = Number(h[i]);
            if (x >= 0) {
                sort_columns.push(columns[x]);
                columns[x].dir = 1;
            }
            else {
                sort_columns.push(columns[-x - 1]);
                columns[-x - 1].dir = -1;
            }
        }
    }

    h = get_option('columns_filter', '', true);
    if (h !== '')
        set_columns_filter(decode_uri_option(h));

    h = get_option('line_filter', '', true);
    if (h !== '') {
        h = decode_uri_option(h);
        var cf = document.getElementById('linefilter');
        cf.className = '';
        cf.value = h;
        line_filter = compile_filter_generic(h);
        if (line_filter.errors)
            cf.className = "attribute_error";
    }

    h = get_option('full_filter', '', true);
    if (h !== '') {
        h = decode_uri_option(h);
        var ff = document.getElementById('fullfilter');
        ff.className = '';
        ff.value = h;
        full_filter = compile_filter_generic(h);
        if (full_filter.errors)
            ff.className = "attribute_error";
    }

    column_get_option('red');
    column_get_option('green');
    column_get_option('redtext');
    column_get_option('greentext');
    column_get_option('position');
    column_get_option('width');
    column_get_option('freezed', 'frozen'); // old option name
    column_get_option('filter');
    update_filters();

    _d('end get_all_options\n');
}







function set_columns(value, column, xcolumn_attr) {
    var cols = [];
    var weight = 0;
    var ok;

    value = value.replace(/ *$/, '').replace(/^ */, '');

    if (value === '') {
        column.average_from = [];
        column.average_columns = [];
        column.need_update = true;
        if (column.type == 'Nmbr') {
            column.minmax = '[0;1]';
            column.min = 0;
            column.max = 1;
        } else if (column.type === "COMPETENCES_RESULT" || column.type === "COMPETENCES_GRADE") {
            var cols = [];
            for (var col of columns)
                if (col.type === "Competences")
                    cols.push(col.title);
            column.columns = cols.join(' ');
        }
        return value;
    }


    column.average_from = value.split(/ +/);
    if (value.substr(0, 1) == '*') {
        column.average_from = [];
        if (value == '*') {
            for (var data_col in columns)
                if (data_col != column.data_col && !columns[data_col].is_empty)
                    column.average_from.push(columns[data_col].title);
        }
        else {
            var search_type = value.substr(1);
            for (var data_col in columns)
                if (data_col != column.data_col && !columns[data_col].is_empty
                    && columns[data_col].type == search_type)
                    column.average_from.push(columns[data_col].title);
        }
    }

    for (var i = 0; i < column.average_from.length; i++) {
        ok = false;
        for (var c in columns)
            if (columns[c].title == column.average_from[i]) {
                cols.push(c);
                weight += columns[c].real_weight;
                if (search_column_in_columns(columns[c], column.title)) {
                    ok = undefined;
                    break;
                }
                ok = true;
                break;
            }
        if (!ok) {
            if (xcolumn_attr === true) {
                // Wait the good value
                // Next time 'xcolumn_attr' will be '1' in place of 'true'
                setTimeout(function () {
                    set_columns(value, column, 1);
                    attr_update_user_interface(column_attributes['columns'],
                        column);
                }, 1000);
                column.average_columns = [];
                return value;
            }
            else {
                if (column_modifiable_attr('columns', column))
                    if (ok === undefined)
                        alert_append(_("ALERT_columns_recursive")
                            + column.title
                            + _("ALERT_columns_unknown_used_by")
                            + column.average_from[i]
                            + _("ALERT_columns_unsaved")
                        );
                    else
                        alert_append(_("ALERT_columns_unknown_title")
                            + column.average_from[i]
                            + _("ALERT_columns_unknown_used_by")
                            + column.title
                            + _("ALERT_columns_unsaved")
                        );
                column.average_columns = [];
                return null; // Do not save, but leaves user input unchanged
            }
        }
    }
    column.average_columns = cols;
    column.average_weight = weight;
    column.need_update = true;
    if (/* xcolumn_attr === false
        && */ column.type == 'Nmbr'
        && column_change_allowed(column)
        && column.max != (cols.length || 1)) {
        column_attr_set(column, 'minmax',
            '[0;' + (cols.length || 1) + ']');
        if (the_current_cell.line !== undefined) {
            the_current_cell.update_headers();
            the_current_cell.do_update_column_headers = true;
        }
    }
    if (xcolumn_attr === false && column.type == 'Add' && column_change_allowed(column)) {
        var min = 0, max = 0;
        for (var data_col in column.average_columns) {
            min += columns[data_col].min;
            max += columns[data_col].max;
        }
        column_attr_set(column, 'minmax',
            '[' + min + ';' + max + ']');
        if (the_current_cell.line !== undefined)
            the_current_cell.update_headers();
    }

    return value;
}

function column_name_completion(input) {
    var completions = [];
    var names = input.value.split(' ');
    var last = names[names.length - 1].toLowerCase();
    for (var column in columns) {
        if (column_empty(column))
            continue;
        column = columns[column];
        if (column.title.substr(0, last.length).toLowerCase() == last) {
            names[names.length - 1] = column.title;
            completions.push([column.title, "", "", "", names.join(' ')]);
        }
    }
    completions.sort();
    names[names.length - 1] = '';
    if (completions.length == 0) {
        completions.push([_("MSG_columns_completion_before"),
            "", last, "", names.join(' ')]);
        completions.push([_("MSG_columns_completion_after"),
            "", "", "", names.join(' ')]);
    }
    if (completions.length > 1)
        completions.splice(0, 0, ["", "", "", "", names.join(' ')]);
    completions.last = last;
    return completions;
}

function filter_column_completion(input) {
    var completions = [];
    // \[ must not be taken into account when splitting
    // The regexp /(?<!\\)\[/ does not work for Safari
    var names = input.value.replace(/\\\[/g, '\x00').split('[');
    for(var i in names)
        names[i] = names[i].replace(/\x00/g, '\\[');
    var last = names[names.length - 1].toLowerCase();
    if (last.includes(']') || names.length == 1)
        return completions;
    for (var column in columns) {
        if (column_empty(column))
            continue;
        column = columns[column];
        if (column.title.substr(0, last.length).toLowerCase() == last) {
            names[names.length - 1] = column.title;
            completions.push([column.title, "", "", "", names.join('[') + ']']);
        }
    }
    completions.sort();
    if (completions.length == 0) {
        completions.push([_("MSG_columns_completion_before"),
            "", '[' + last, "", names.join('[')]);
        completions.push([_("MSG_columns_completion_after"),
            "", "", "", names.join('[')]);
    }
    if (completions.length > 1) {
        names[names.length - 1] = '';
        completions.splice(0, 0, ["", "", "", "", names.join('[')]);
    }
    completions.last = last;
    return completions;
}


// DO NOT TRANSLATE THESE STRING
// IT IS DEPRECATED and only here to read old data files

function set_comment(value, column) {
    if ( value.length > 80 )
        return value; // Performance problems with Notation
    var round_by = value.replace(/.*arrondi[es]* *[aà] *([0-9.,]*).*/i, '$1');
    column.round_by = a_float(round_by);
    if (!isNaN(value) || isNaN(column.round_by)) {
        column.round_by = undefined;
    }

    var best_of = value.replace(/.*oyenne *des *([0-9]*) *meilleur.*/i, '$1');
    if (best_of === '') {
        if (value.search('la meilleure note') == -1)
            column.best_of = undefined;
        else
            column.best_of = 1;
    }
    else {
        column.best_of = a_float(best_of);
        if (isNaN(column.best_of))
            column.best_of = undefined;
    }

    var best_of = value.replace(/.*]([0-9]*),([0-9]*)\[.*/, '][ $1 $2').split(/ /);

    if (best_of.length == 3 && best_of[0] == '][') {
        column.best_of = - a_float(best_of[2]);
        if (isNaN(column.best_of))
            column.best_of = undefined;

        column.mean_of = - a_float(best_of[1]);
        if (isNaN(column.mean_of))
            column.mean_of = undefined;
    }
    else
        column.mean_of = undefined;

    column.need_update = true;

    column.historical_comment = column.best_of || column.mean_of
        || column.round_by;

    return value;
}







function toggle_completion(the_id) {
    var td = the_td(document.getElementById(the_id));
    column_attr_set(the_current_cell.column,
        'completion',
        the_current_cell.column.completion ? 0 : 1,
        td,
        true // Force save		  
    );
    table_fill(false, true);
    the_current_cell.do_update_column_headers = true;
}



function course_dates_formatter(column, value) {
    if (!column.course_dates || !(column.course_dates instanceof CourseDates))
        column.course_dates = new CourseDates(value);
    set_message('duplicate_date', 2,
        column.course_dates.nogrp_dates.length > 1 ? _('MSG_duplicate_date') : '');
    return column.course_dates.format_dates();
}

function set_course_dates(value, column) {
    column.course_dates = new CourseDates(value);
    return column.course_dates.text_dates;
}


function date_formatter(value, external_event) {
    if (value instanceof Array) {
        first_day = new Date();
        first_day.setTime(value[0] * 1000);

        last_day = new Date();
        last_day.setTime(value[1] * 1000);
        var s = formatte_date(last_day);

        last_day.setTime(value[1] * 1000 + 1000 * 86400);

        return formatte_date(first_day) + ' ' + s;
    }

    if (!external_event && table_attr.dates instanceof Array) // Only the first time
        if (!confirm(_("ALERT_tabledates_warning")))
            return date_formatter(table_attr.dates);

    var v = value.replace(/[ ,][ ,]*/g, ' ');
    var vs = v.split(' ');
    if (vs.length != 2) {
        Alert("ALERT_tabledates_2");
        return;
    }
    var d1 = parse_date(vs[0]).getTime();
    var d2 = parse_date(vs[1], true).getTime();
    if (isNaN(d1) || isNaN(d2)) {
        Alert("ALERT_tabledates_bad");
        return;
    }
    if (d1 > d2) {
        Alert("ALERT_tabledates_invert");
        return;
    }
    v = date_to_store(vs[0]).replace(/..$/, '') + ' '
        + date_to_store(vs[1], true).replace(/..$/, '');

    return v;
}




function column_delete() {
    var column = the_current_cell.column;
    if (column.author == '*' && column.data_col < 6) {
        Alert("ALERT_columndelete_forbiden");
        return;
    }
    if (!table_attr.modifiable) {
        Alert("LABEL_table_ro");
        return;
    }
    if (!column_change_allowed(column)) {
        alert(_("ALERT_columndelete_not_master_before") + column.author +
            _("ALERT_columndelete_not_master_after") + table_attr.masters);
        return;
    }

    var empty = column_empty_of_user_cells(column.data_col);
    if (column.real_type.cell_is_modifiable && !empty) {
        Alert("ALERT_columndelete_not_empty");
        return;
    }
    var c = column_used_in_average(column.title);
    if (c) {
        Alert("ALERT_columndelete_used", c);
        return;
    }
    if (column.is_empty) {
        Alert("ALERT_columndelete_void");
        return;
    }
    if (!empty)
        if (!confirm(_("ALERT_columndelete_confirm") + column.title))
            return;

    // The column name can be used in disabled formulas
    // Remove the column name to avoid any future problem
    for (var data_col in columns) {
        for (var use in columns[data_col].average_from) {
            if (columns[data_col].average_from[use] == column.title) {
                column_attr_set(columns[data_col], 'columns',
                    (' ' + columns[data_col].columns + ' ').replace(
                        ' ' + column.title + ' ', ' ').trim()
                );
            }
        }
    }
    append_image(undefined, 'column_delete/' + column.the_id);
    Xcolumn_delete(' ', column.the_id);
    the_current_cell.update_headers();
}



function set_empty_is(value, column) {
    column.need_update = true;
    try {
        for (var i in lines)
            lines[i][column.data_col]._key = undefined;
    }
    catch (e) {
    }
    return value.replace(/^ */, "").replace(/ *$/, "");
}


function set_test_enumeration(value, column)
{
  value = value.replace(/  */g, ' ') ;
  column.possible_values = value.split(' ') ;
  return value ;
}



var columnexport_options;
var abjvalue, ppnvalue, tnrvalue;

function cell_value_export(column) { // allowed_grades ?
    if (this.value === '')
        return column.empty_is;
    var xx = a_float(this.value);
    if (column.type == 'Text' || isNaN(xx)) {
        xx = this.value.toString();
        switch (xx) {
            case 'NaN': return '';
            case abi: return abi_short;
            case abj: return abjvalue;
            case ppn: return ppnvalue;
            case tnr: return tnrvalue;
            default: return encode_lf_tab(xx);
        }
    }
    else {
        if (xx < column.min)
            xx = column.min;
        else if (xx > column.max)
            xx = column.max;
        return local_number(column.do_rounding(xx));
    }
}

function abj_ppn_value() {
    Cell.prototype.value_export = cell_value_export;

    if (columnexport_options.abjvalue) {
        abjvalue = '0';
        ppnvalue = '0';
        tnrvalue = '0';
    }
    else {
        abjvalue = abj_short;
        ppnvalue = ppn_short;
        tnrvalue = tnr_short;
    }
}

function export_column() {
    if (the_current_cell.data_col == 0)
        columnexport_options = { "students": true };
    else
        columnexport_options = { "students": true, "values": true };
    create_popup('export_div',
        _("TITLE_columnexport_before") + the_current_cell.column.title
        + _("TITLE_columnexport_after"),
        _("MSG_columnexport_before")
        + toggle_button(_("B_columnexport_abjvalue"),
            'columnexport_options', 'abjvalue',
            _("TIP_columnexport_abjvalue")
        )
        + ', '
        + toggle_button(_("B_columnexport_unique"),
            'columnexport_options', 'unique',
            _("TIP_columnexport_unique"))
        + _("MSG_columnexport_after")
        + '<table class="colored columnexport">'
        + '<colgroup><col width="10*"><col width="12*"><col width="30*"></colgroup>'
        + '<tr><th>' + _("MSG_columnexport_students")
        + '<th>'
        + toggle_button(_("B_columnexport_students"),
            'columnexport_options', 'students',
            _("TIP_columnexport_students"))
        + ' '
        + toggle_button(_("B_columnexport_values"),
            'columnexport_options', 'values',
            _("TIP_columnexport_values"))
        + ' '
        + toggle_button(_("B_columnexport_comments"),
            'columnexport_options', 'comments',
            _("TIP_columnexport_comments"))
        + ' '
        + toggle_button(_("B_columnexport_dates"),
            'columnexport_options', 'dates',
            _("TIP_columnexport_dates"))
        + '<th>' + _("MSG_columnexport_errors") + '</tr>'
        + '<tr class="content"><td><textarea rows="10" style="width:100%" onscroll="columnexport_scroll(event,0);" onchange="do_printable_display = true ;" onkeyup="do_printable_display = true" onpaste="do_printable_display = true ;"></textarea>'
        + '<td><textarea id="columnexport_output" wrap="off" onscroll="columnexport_scroll(event,1);"></textarea>'
        + '<td><div id="columnexport_errors"></div>'
        + '</tr></table>', '', false
    );
    do_printable_display = false;
    periodic_work_add(do_columnexport);
    columnexport_filtered();
}

function columnexport_filtered() {
    var s = [];
    var d = {};
    for (var lin in filtered_lines) {
        var student_number = filtered_lines[lin][0].value;
        if (student_number && d[student_number] === undefined) {
            d[student_number] = true;
            s.push(student_number);
        }
    }
    popup_text_area().value = s.join('\n');
    do_printable_display = true;
}

function columnexport_scroll(event, dir) {
    if (columnexport_options.unique)
        return;
    event = the_event(event);
    if (dir != 0)
        popup_text_area().scrollTop = event.target.scrollTop;
    else
        document.getElementById("columnexport_output").scrollTop = event.target.scrollTop;
}

function do_columnexport() {
    if (!popup_is_open())
        return; // Stop periodic work
    if (!do_printable_display)
        return true;
    do_printable_display = false;

    abj_ppn_value();
    var column = popup_column();
    var data_col = column.data_col;
    var multiline = popup_value();
    var exported = {};
    var uniques = {};
    var error1 = '', error2 = '';
    var v = [], line, cell, login;

    for (var i in multiline) {
        if (multiline[i] === '') {
            v.push('');
            error1 = _("ALERT_columnexport_no_id") + '<hr>';
            continue;
        }
        cell = [];
        login = login_to_id(multiline[i].replace(/^ */, '').replace(/ *$/, ''));
        line_id = login_to_line_id(login);
        if (line_id === undefined) {
            if (columnexport_options.students && !columnexport_options.unique)
                cell.push(login);
            if (columnexport_options.values)
                cell.push('???');
            if (columnexport_options.comments)
                cell.push('???');
            if (columnexport_options.dates)
                cell.push('???');
            v.push(cell.join('\t'));
            error2 = _("ALERT_columnexport_unfound") + '<hr>';
            continue;
        }
        line = lines[line_id];
        if (columnexport_options.students && !columnexport_options.unique)
            cell.push(encode_lf_tab(line[0].value.toString()));
        if (columnexport_options.values)
            cell.push(line[data_col].value_export(column));
        if (columnexport_options.comments)
            cell.push(encode_lf_tab(line[data_col].comment));
        if (columnexport_options.dates)
            cell.push(encode_lf_tab(line[data_col].date));
        v.push(cell.join('\t'));

        exported[line[0].value] = true;
        if (uniques[cell] === undefined)
            uniques[cell] = [line[0].value];
        else
            uniques[cell].push(line[0].value);
    }

    if (columnexport_options.unique) {
        v = [];
        var t = [];
        for (var i in uniques)
            t.push(i);
        t.sort();
        if (t.length == 1 && t[0].length == 0) {
            v = uniques[t[0]]; // Export unique on ID column
        }
        else {
            for (var i in t) {
                i = t[i];
                if (columnexport_options.students)
                    v.push(i + '\t' + uniques[i].join(' '));
                else
                    v.push(i);
            }
        }
    }
    var co = document.getElementById('columnexport_output');
    co.value = v.join('\n');
    co.scrollTop = popup_text_area().scrollTop;

    var m = '';

    for (var line in filtered_lines)
        if (exported[filtered_lines[line][0].value] != true)
            if (filtered_lines[line][data_col].value !== '')
                m += filtered_lines[line][0].value + ':'
                    + filtered_lines[line][data_col].value + '\n';

    if (m !== '')
        m = _("ALERT_columnexport_unexported") + '\n' + m;

    document.getElementById('columnexport_errors').innerHTML =
        error1 + error2 + html(m).replace(/\n/g, "<br>");
    return true;
}


function facebook_picture(line, more) {
    var url = '<A HREF="' + add_ticket(suivi, line[0].value) + '">';
    var firstname = title_case(line[1].value);
    if (!more)
        more = '';

    return '<DIV CLASS="facebook"><DIV CLASS="content"><IMG CLASS="pic" SRC="'
        + student_picture_url(line[0].value) + '"><BR>' + url
        + firstname + '<BR>' + line[2].value + '</A></DIV>' + more + '</DIV>';
}

function facebook_display() {
    var groups = compute_groups_values(grouped_by);
    var s = [];
    var first = '';

    if (groups.length == 1) {
        s.push('<h2>' + year + ' ' + semester + ' ' + ue + '</h2>');
        for (var i in lines)
            s.push(facebook_picture(lines[i]));
    }
    else {
        var get_key = compute_groups_key_function(grouped_by);
        var grouped_by_sorted = compute_grouped_by_sorted(grouped_by);
        for (var group in groups) {
            group = groups[group];
            s.push('<h2 style="' + first + 'clear:both">'
                + year + ' ' + semester + ' ' + ue);
            first = 'page-break-before:always;';
            for (var g in grouped_by_sorted)
                s.push(' ' + columns[grouped_by_sorted[g]].title
                    + '=' + group.split('\001')[g]);
            s.push("</h2>")
            for (var line_id in lines)
                if (get_key(lines[line_id]) == group)
                    s.push(facebook_picture(lines[line_id]));
        }
    }
    document.getElementById('content').innerHTML = s.join('\n');
}

function facebook_a_toggle(data_col) {
    return '<span class="button_toggle" onclick="button_toggle(grouped_by,'
        + data_col + ',this);facebook_display();">'
        + html(columns[data_col].title) + '</span>';
}

function facebook_click(event) {
    event = the_event(event);
    var value = event.target.innerHTML;
    if (value === '&nbsp;')
        value = '';
    var a = event.target.parentNode.parentNode.parentNode.getElementsByTagName('A')[0];
    var student = a.href.toString().replace(new RegExp(".*/([^?]*).*"), "$1");
    var line_id = login_to_line_id(login_to_id(student));
    var data_col = the_phone_popup_column.data_col;
    if (lines[line_id][data_col].value == value)
        return;
    var items = event.target.parentNode.parentNode.childNodes;
    for (var i = 0; i < items.length; i++)
        items[i].className = items[i].lastChild.textContent == value ? 'selecteditem' : 'item';
    cell_set_value(undefined, value, line_id, data_col);
    update_cell_at(line_id, data_col);
    try {
        the_current_cell.update(true);
    } catch (e) { console.log(e); } // For phone_facebook
    clearTimeout(update_histogram_id); // For phone_facebook
}

var the_phone_popup_column

function phone_facebook(column_id) {
    var cls, v, color;
    var t = [];
    var column;
    if (column_id) // From home page
        column = columns[data_col_from_col_id(column_id)];
    else
        column = the_current_cell.column;
    the_phone_popup_column = column;
    var vals = column.real_type.cell_completions("", column);
    if (vals.length == 0)
        return true;
    if (vals.length <= 4)
        fontsize = 200;
    else if (vals.length <= 6)
        fontsize = 160;
    else if (vals.length <= 8)
        fontsize = 120;
    else
        fontsize = 100;
    for (var line in filtered_lines) {
        line = filtered_lines[line];
        if (line[0].value === '')
            continue;
        var more = '<div class="items" style="font-size:' + fontsize + '%">';
        if (line[column.data_col].modifiable(line, column)) {
            for (var i in vals) {
                if (vals[i] == line[column.data_col].get_value(column))
                    cls = 'selecteditem';
                else
                    cls = 'item';
                if (is_abi[vals[i]])
                    color = "F00";
                else if (is_abj[vals[i]])
                    color = "00F";
                else if (is_pre[vals[i]])
                    color = "0F0";
                else
                    color = "000";
                v = html(vals[i]);
                if (v == '')
                    v = '&nbsp;';
                more += '<div class="' + cls + '" style="color:#' + color
                    + ';border-color: #' + color
                    + '"><span></span><div onclick="facebook_click(event)">'
                    + v + '</div></div>';
            }
        }
        more += '</div>';
        t.push(facebook_picture(line, more));
    }

    create_popup('phone_facebook',
        html(year + ' ' + semester + ' ' + ue
            + ' ' + column.title),
        t.join(''),
        '', false);
    if (column_id) {
        var e = document.getElementById('popup_id');
        e.style.left = 0;
        e.style.right = 0;
        e.style.top = 0;
        e.style.bottom = 0;
        e.style.height = "auto";
        e.getElementsByTagName('BUTTON')[0].style.display = "none";
    }
}

function tablefacebook(replace, column_id) {
    var p;
    /*
    if ( ! phone_facebook() )
      return ;
    */
    if (do_touchstart.touch_device || column_id) {
        if (!phone_facebook(column_id))
            return;
    }
    p = [printable_introduction(),
        '<p class="hidden_on_paper">',
    _("MSG_facebook_grp"), facebook_a_toggle(3), _("MSG_facebook_and"),
    facebook_a_toggle(4), '.<br>',
    _("MSG_facebook_paging"), '</p>',
        '<p class="hidden_on_paper toggles">'
    ];
    for (var data_col in columns) {
        if (columns[data_col].is_empty)
            continue;
        if (columns[data_col].hidden)
            continue;
        if (data_col == 3 || data_col == 4)
            continue;
        p.push(facebook_a_toggle(data_col) + ' ');
    }

    p.push('<div style="clear:both" id="content">');
    p.push('<script>');
    p.push('ue=' + js(ue) + ';');
    p.push('var columns = ');
    p.push(columns_in_javascript());
    p.push(';');
    p.push('var grouped_by=[], lines ;');
    p.push('function initialize()');
    p.push('{');
    p.push('if ( ! wait_scripts("initialize()") ) return ; ');
    p.push('lines = ' + lines_in_javascript() + ';');
    p.push('facebook_display();');
    p.push('}');
    p.push('setTimeout(initialize,200) ;'); // Timeout for IE
    p.push('</script>');
    var w = window_open(url + '/files/' + version + '/ok.png', replace);
    w.document.open('text/html');
    w.document.write(html_begin_head() + p.join('\n'));
    w.document.close();
    return w;
}


function caution_message(no_float) {
    if (table_attr.autosave)
        return '<div id="stop_the_auto_save" style="'
            + (no_float ? '' : 'float:right;')
            + '">'
            + _("MSG_fill_warning_left")
            + ' <a href="#" onclick="select_tab(\'table\', \''
            + _("TAB_column_action")
            + '\');table_autosave_toggle();document.getElementById(\'stop_the_auto_save\').style.display=\'none\';">'
            + _("MSG_fill_warning_middle") + '</a> ' + _("MSG_fill_warning_right")
            + '</div>';
    return '';
}

/****************************************************************************/

function Room(infos) {
    this.id = Room.id++;
    this.name = infos[0];
    this.places = new Places(infos[1] || '1-9999');
    this.url = infos[2] || '';
    this.comment = infos[3] || '';
    this.predefined_places = !!infos[1];
    this.predefined_name = !!infos[0];
    this.clear();
    if (infos[0] === '')
        this.in_value = this.in_comment = true;
}
Room.id = 0;

Room.prototype.clear = function () {
    this.nr_used = 0;         // Number of places yet used
    this.number_used = {};    // Indexed by the place number
    this.nr_will_be_used = 0; // Will be used be the filling
    this.places.iter_start('');       // Goto before the first place
    this.nr_erased = 0;       // Number of value erase

};

function remove_leading_0_and_space(txt) {
    for (; ;) {
        var f = txt.substr(0, 1);
        if (f == '0' || f == ' ')
            txt = txt.substr(1);
        else
            return txt;
    }
}

Room.prototype.add_predefined = function (place) {
    this.nr_used++;
    this.number_used[remove_leading_0_and_space(place)] = true;
};

Room.prototype.get_key = function () {
    return (this.enumeration ? '0' : '1')
        + (this.predefined_places ? '1' : '0')
        + this.name;
};

function fill_column_past_event(event) {
    event = the_event(event);
    var data = event.real_event.clipboardData.getData('text/plain').trim();
    if (data.indexOf('\n') == -1)
        return;
    data = data.split(/[\r\n]+/);

    event.target.value = data[0];
    for (var i in data) {
        var value = data[Number(i) + 1];
        if (value === undefined)
            continue;
        value = value.trim();
        if (value === '')
            continue;
        Filler.filler.add_empty_input().get_name().value = value;
    }
    Filler.filler.update_html();
    stop_event(event);
}

function fill_column_keypress(event) {
    event = the_event(event);
    if (event.keyCode == 13) {
        var room = Filler.filler.next_room(Filler.filler.get_room(event.target));
        if (room !== undefined)
            room.get_name().focus();
    }
}

Room.prototype.new_size = function () {
    return this.nr_used + this.nr_will_be_used - this.nr_erased;
};

Room.prototype.filling = function () {
    // +1 because 0/9 should be more filled than 0/999
    return (this.new_size() + 1) / this.places.nr_places;
};

Room.prototype.yet_overflowed = function () {
    return this.checked && this.nr_used >= this.places.nr_places;
};

Room.prototype.get_place = function (pad0) {
    this.nr_will_be_used++;
    // Search an unused place number
    var place;
    do {
        place = this.places.iter_next([' ', '0', ''][pad0]);
        if (place === undefined || place === null) {
            place = undefined;
            break;
        }
    }
    while (this.number_used[remove_leading_0_and_space(place)]);
    if (place)
        this.number_used[place] = true;
    return place;
};

Room.prototype.name_modifiable = function () {
    return this.nr_used == 0;
};

Room.prototype.html = function () {
    var cb = '<input type="checkbox" class="room_cb">';
    var html_class = (this.predefined_places ? 'room_predefined' :
        (this.created_empty ? 'room_created_empty' :
            (this.enumeration ? 'room_enumeration' :
                'room_yet_used')));
    var name = '<input value="' + encode_lf_tab(encode_value(this.name))
        + '" onpaste="fill_column_past_event(event)'
        + '" onkeypress="fill_column_keypress(event)"'
        + '>';
    return '<tr class="room_line ' + html_class
        + (this.in_comment & !this.in_value ? ' only_comment' : '')
        + (!this.in_comment & this.in_value ? ' only_value' : '')
        + '" id="ROOM_' + this.id
        + '">'
        + '<td class="room_used">'
        + '<td class="room_used">'
        + '<td class="room_used">'
        + '<td class="room_cb">' + cb
        + '<td class="room_name">' + name
        + (this.comment ?
            '<div class="room_comment">'
            + (this.url !== '' ? '<a target="_blank" href="' + this.url + '">' : '')
            + html(this.comment)
            + (this.url !== '' ? '</a>' : '')
            + '</div>'
            : ''
        )
        + '<td class="room_places"><input value="'
        + encode_value(this.places.text) + '">'
        + '</tr>';
};

Room.prototype.get_tr = function () {
    return document.getElementById('ROOM_' + this.id);
};
Room.prototype.get_toggle = function () {
    return this.get_tr().childNodes[3].firstChild;
};
Room.prototype.get_nr_used = function () {
    return this.get_tr().childNodes[0];
};
Room.prototype.get_nr_will_be_used = function () {
    return this.get_tr().childNodes[1];
};
Room.prototype.get_total = function () {
    return this.get_tr().childNodes[2];
};
Room.prototype.get_name = function () {
    return this.get_tr().childNodes[4].firstChild;
};
Room.prototype.get_places = function () {
    return this.get_tr().childNodes[5].firstChild;
};

Room.prototype.update_html = function () {
    this.get_nr_used().innerHTML = this.nr_used
        ? (this.name === '' && this.checked
            ? '<span style="color:#888">' + this.nr_used + '</span>'
            : this.nr_used)
        : ' ';
    var n = this.nr_will_be_used - this.nr_erased;
    if (n > 0)
        n = '+' + n;
    else if (n == 0)
        n = ' ';
    if (this.nr_used)
        this.get_name().disabled = true;

    this.get_nr_will_be_used().innerHTML = n;
    var total = this.nr_used + this.nr_will_be_used - this.nr_erased;
    var overflow = total - this.places.nr_places;
    this.get_total().innerHTML = total
        ? '=' + total + (
            overflow > 0
                ? '<span class="fill_warning">(' + overflow + ')</span>'
                : '')
        : ' ';
};


/****************************************************************************/

function Filler(last_filler) {
    this.column = the_current_cell.column;
    this.data_col = the_current_cell.column.data_col;
    if (last_filler) {
        this.toggles = last_filler.toggles;
        this.index = last_filler.index;
        this.create_rooms(last_filler.rooms);
    }
    else {
        this.toggles = {
            'modify': 0,
            'interleave': 0,
            'unfiltered': 1,
            'comment': 0,
            'pad0': 1,
            'relative': 0
        };
        this.create_rooms();
    }
    this.id = setInterval(this.update_html.bind(this), 100);
}

Filler.prototype.get_room = function (element) {
    while (element.tagName != 'TR')
        element = element.parentNode;
    var id = element.id.split("_")[1];
    for (var room in this.rooms) {
        room = this.rooms[room];
        if (room.id == id)
            return room;
    }
};

Filler.prototype.room_index = function (room) {
    for (var i = 0; i < this.index.length; i++)
        if (this.rooms[this.index[i]] === room)
            break;
    return i;
};

Filler.prototype.next_room = function (room) {
    var i = this.room_index(room);
    while (i++ < this.index.length) {
        var next = this.rooms[this.index[i]];
        if (this.visible(next))
            return next;
    }
};

Filler.prototype.previous_room = function (room) {
    var i = this.room_index(room);
    while (--i >= 0) {
        var next = this.rooms[this.index[i]];
        if (this.visible(next))
            return next;
    }
};

Filler.prototype.menu = function () {
    s = '<div class="fill_menu">';
    for (var key in this.toggles) {
        s += '<select id="select.' + key + '" value="' + this.toggles[key] + '">'
            + '<option' + (this.toggles[key] == 0 ? ' selected' : "")
            + '>' + _("TIP_fill_no_" + key) + '</option>'
            + '<option' + (this.toggles[key] == 1 ? ' selected' : "")
            + '>' + _("TIP_fill_" + key) + '</option>'
            + (key == 'pad0'
                ? '<option' + (this.toggles[key] == 2 ? ' selected' : "")
                + '>' + _("TIP_fill_empty_" + key) + '</option>'
                : ''
            )
            + '</select>';
    }
    s += '</div>';
    return s;
};

function text_to_room_and_place(text) {
    var m = text.match(/(.*[^0-9. ]) ( *[0-9]+)(.*)/);
    if (m)
        return [m[1] + '%%' + m[3], m[2]];
    m = text.match(/^[0-9]+$/);
    if (m)
        return ['%%', text];
    return [text, 'undefined'];
}

Filler.prototype.create_rooms = function (last_rooms) {
    var room;
    this.rooms = {}; // Indexed by room name
    // Initialize wtih previous values
    if (last_rooms) {
        this.example_row_defined = true;
        this.rooms = last_rooms;
    }
    var enumeration = this.column.real_type.cell_completions('', this.column);
    if (this.column.type == 'Note') {
        enumeration = [abi, abj, ppn, tnr]; // Do not want popup menu for grades
        for (var i in enumeration)
            if (allowed_grades[enumeration[i]])
                enumeration.push(enumeration[i]);
    }
    if (!enumeration.toUpperCase) // A table of possible values
    {
        for (var i in enumeration) {
            i = enumeration[i];
            if (this.rooms[i])
                continue;
            this.rooms[i] = new Room([i]);
            this.rooms[i].enumeration = true;
        }
    }

    // Create predefined rooms
    if (this.column.type != 'Note' && this.column.type != 'Prst') {
        for (var i in rooms) {
            room = rooms[i][0];
            if (this.rooms[room])
                continue;
            this.rooms[room] = new Room(rooms[i]);
            if (room.indexOf('%%') != -1)
                this.example_row_defined = true;
        }
        if (rooms.length == 0)
            this.rooms['none'] = new Room([_("MSG_no_rooms"), "", "", ""]);
    }
    else
        this.example_row_defined = true;

    for (var lin_id in lines) {
        if (line_empty(lines[lin_id]))
            continue;
        v = lines[lin_id][this.data_col];

        room = text_to_room_and_place(v.comment)[0];
        if (this.rooms[room] === undefined)
            this.rooms[room] = new Room([room]);
        this.rooms[room].in_comment = true;

        room = text_to_room_and_place(v.value.toString())[0];
        if (this.rooms[room] === undefined)
            this.rooms[room] = new Room([room]);
        this.rooms[room].in_value = true;
    }
    // The list of room in alphabetical order
    this.index = [];
    for (var i in this.rooms)
        this.index.push(i);
    var r = this.rooms;
    this.index.sort(function (a, b) {
        a = r[a].get_key();
        b = r[b].get_key();
        if (a > b)
            return 1;
        if (a < b)
            return -1;
        return 0;
    });
};

Filler.prototype.add_empty_input = function () {
    var table = document.getElementById("fill_table");
    var i = 0;
    if (this.example_row_defined) {
        var room;
        for (i in this.index) {
            room = this.rooms[this.index[i]];
            if (room.get_name().value === '' && room.created_empty) {
                this.the_unamed_room = room;
                return; // Yet an empty input
            }
        }
    }
    var room = new Room(['']);
    room.created_empty = true;

    if (this.the_unamed_room !== undefined)
        i = this.room_index(this.the_unamed_room) + 1;
    else
        i = 0;
    this.rooms[' empty' + i] = room;
    this.index.splice(i, 0, ' empty' + i);

    var d = document.createElement('TBODY');
    d.innerHTML = room.html();
    d = d.firstChild;
    if (table.rows[i + 1])
        table.firstChild.insertBefore(d, table.rows[i + 1]);
    else
        table.firstChild.appendChild(d);
    if (i == 0)
        room.get_name().focus(); // Focus on first empty input
    if (!this.example_row_defined) {
        this.example_row_defined = true;
        room.get_toggle().checked = true;
        room.get_name().value = "Darwin (%%)";
        room.get_name().focus();
        room.get_name().select();
        return this.add_empty_input();
    }
    this.the_unamed_room = room;
    return room;
};

Filler.prototype.count_line = function (line) {
    if (line_empty(line))
        return;
    var v = line[this.data_col];
    if (this.toggles.comment)
        v = v.comment;
    else
        v = v.value.toString();
    var room_and_place = text_to_room_and_place(v);
    var room = room_and_place[0];
    var place = room_and_place[1];
    if ((this.toggles.modify || v === '') && line.is_filtered) {
        this.to_dispatch.push(line);
        this.rooms[room].nr_erased++;
    }
    if (v !== '')
        this.not_empty++;
    this.rooms[room].add_predefined(place);
}

Filler.prototype.rooms_get_usage = function () {
    for (var i in this.rooms)
        this.rooms[i].clear();
    this.to_dispatch = [];
    this.not_empty = 0;
    for (var i in filtered_lines) {
        this.count_line(filtered_lines[i]);
    }
    if (this.toggles.unfiltered)
        for (var i in lines)
            if (!lines[i].is_filtered)
                this.count_line(lines[i]);
};

Filler.prototype.init_rooms = function () {
    var s = [];

    for (var i in this.index) {
        s.push(this.rooms[this.index[i]].html());
        s.push('</tr>');
    }
    return s.join('');
};

function pulsing(element, state) {
    if (state)
        element.classList.add("pulsing");
    else
        element.classList.remove("pulsing")
}

Filler.prototype.use_a_number = function () {
    for (var i in this.rooms)
        if (this.rooms[i].checked && this.rooms[i].name.indexOf("%%") != -1)
            return true;
};

Filler.prototype.state_change = function () {
    var s = '';
    for (var i in this.toggles) {
        var e = document.getElementById('select.' + i);
        if (e)
            this.toggles[i] = e.selectedIndex;
        s += i + ':' + this.toggles[i] + " ";
    }
    for (var i in this.rooms) {
        this.rooms[i].checked = this.rooms[i].get_toggle().checked;
        if (this.rooms[i].get_places().value !== undefined)
            this.rooms[i].places = new Places(this.rooms[i].get_places().value);
        var name = decode_lf_tab(this.rooms[i].get_name().value);
        if (this.rooms[i].name != name) {
            this.rooms[i].name = name;
            this.rooms[i].checked = true;
            this.rooms[i].get_toggle().checked = true;
        }
        s += i
            + ':' + this.rooms[i].checked
            + ':' + this.rooms[i].name
            + ':' + this.rooms[i].places.text
            + "\n"
            ;
    }
    if (s == this.old_state)
        return false;
    this.old_state = s;
    return true;
};

Filler.prototype.visible = function (room) {
    if (!room.in_comment && !room.in_value)
        return true;
    if (this.toggles.comment) {
        if (room.in_comment)
            return true;
    }
    else {
        if (room.in_value)
            return true;
    }
};

Filler.prototype.highlight_option = function (option, bool) {
    document.getElementById("select." + option).style.opacity = bool ? 1 : 0.4;
};


Filler.prototype.nr_visible_lines = function () {
    var nr = 0;
    for (var room in this.rooms)
        if (this.visible(this.rooms[room]))
            nr++;
    return nr;
};

Filler.prototype.update_html = function () {
    var feedback = document.getElementById('fill_result');
    if (!feedback) {
        clearInterval(this.id);
        return;
    }
    if (!this.state_change())
        return;
    feedback.parentNode.parentNode.setAttribute('rowspan', this.index.length + 1);
    var table = document.getElementById("fill_table");
    if (this.toggles.comment)
        table.className = 'show_in_comment';
    else
        table.className = 'show_in_value';
    this.rooms_get_usage(); // Compute to_dispatch, not_empty
    this.add_empty_input();

    pulsing(document.getElementById('select.modify'),
        this.to_dispatch.length == 0);
    for (var room in this.rooms)
        pulsing(this.rooms[room].get_toggle().parentNode, false);

    var messages = [];

    if (this.to_dispatch.length == 0)
        messages.push('<div class="fill_important">' + _("MSG_fill_room_nothing")
            + '</div>');

    this.rooms_to_use = [];
    for (var room in this.rooms) {
        room = this.rooms[room];
        if (room.checked) {
            room.nr_will_be_used = 0;
            this.rooms_to_use.push(room);
        }
        else
            room.nr_will_be_used = '';
    }
    function priority_r(r) { return r.new_size(); }
    function priority_f(r) { return r.filling(); }
    priority = this.toggles.relative ? priority_f : priority_r;

    this.rooms_to_use.sort(function (a, b) { return priority(a) - priority(b); });
    this.highlight_option("interleave", this.rooms_to_use.length >= 2);
    this.highlight_option("relative", this.rooms_to_use.length >= 2);
    this.highlight_option("unfiltered", filters.length != 0
        || full_filter || line_filter);
    this.highlight_option("pad0", this.use_a_number());

    var fill_value = 0;
    var fill_empty_value = 0;
    var overflow = 0;
    var room, place;
    this.todo = [];
    if (this.rooms_to_use.length)
        for (var i in this.to_dispatch) {
            room = this.rooms_to_use[0]
            if (room.name !== '')
                fill_value++;
            else
                fill_empty_value++;

            place = room.get_place(this.toggles.pad0);
            if (place === undefined)
                overflow++;
            this.todo.push([room, place, i]);
            // Sort the rooms by filling
            for (var j = 1; j < this.rooms_to_use.length; j++) {
                if (priority(this.rooms_to_use[j - 1])
                    < priority(this.rooms_to_use[j]))
                    break;
                var tmp = this.rooms_to_use[j - 1];
                this.rooms_to_use[j - 1] = this.rooms_to_use[j];
                this.rooms_to_use[j] = tmp;
            }
        }
    for (var i in this.rooms)
        this.rooms[i].update_html();
    if (this.to_dispatch.length != 0 && this.todo.length == 0) {
        for (var room in this.rooms)
            pulsing(this.rooms[room].get_toggle().parentNode, true);

        messages.push('<div class="fill_important">' + _("MSG_fill_room")
            + '</div>');
    }
    for (var room in this.rooms) {
        if (this.rooms[room].yet_overflowed())
            messages.push('<div class="fill_warning">'
                + '«' + html(this.rooms[room].name) + '» '
                + _("MSG_fill_room_overflow")
                + '</div>');
    }
    if (!this.toggles.interleave)
        this.todo.sort(function (a, b) {
            return a[0].name > b[0].name ? 1
                : (a[0].name < b[0].name ? -1 : a[2] - b[2]);
        })
    if (this.to_dispatch.length != this.todo.length
        && this.todo.length != 0)
        alert("BUG column fill");
    var s = [];
    var unwritable = 0, problems = 0, replacements = 0, changes = 0;
    alert_append_start();
    this.todo_real = [];
    for (var i in this.todo) {
        var room = this.todo[i][0];
        var place = this.todo[i][1];
        var line = this.to_dispatch[i];
        var cell = line[this.data_col];
        var old_val = this.toggles.comment ? cell.comment : cell.value;
        var new_val = place
            ? room.name.replace('%%', place)
            : room.name.replace('%%', '???');
        var tip = '';
        if (old_val === new_val)
            continue;
        this.todo_real.push([new_val, line]);
        var classe;
        if (!cell.modifiable(line, this.column)) {
            classe = "fill_error";
            tip = _("ERROR_value_not_modifiable");
            unwritable++;
        }
        else if (place === undefined) {
            classe = "fill_warning";
            tip = _("MSG_fill_overflow");
        }
        else
            classe = "";
        if (!this.toggles.comment) {
            var v = this.column.real_type.cell_test(new_val, this.column);
            if (new_val != v) {
                if (v !== undefined) {
                    tip = html(new_val) + '→' + html(v);
                    new_val = v;
                    classe += " fill_replace";
                    replacements++;
                }
                else {
                    classe += " fill_error";
                    problems++;
                    tip = alert_merged;
                    alert_merged = '';
                }
            }
        }
        if (old_val != new_val)
            changes++;
        s.push('<tr><td class="old_value">'
            + (tip !== '' ? hidden_txt(html(old_val), tip) : html(old_val))
            + '<td class="' + classe + '">'
            + (tip !== '' ? hidden_txt('→', tip) : '→')
            + '<td class="new_value">'
            + (tip !== '' ? hidden_txt(html(new_val), tip) : html(new_val))
            + '</tr>');
    }
    var button = '';
    if (s.length)
        button = ('<button onclick="Filler.filler.do_fill()">'
            + (this.toggles.comment
                ? _("MSG_fill_the_comments")
                : _("MSG_fill_the_values")
            ) + '</button><p>&nbsp;</p>' + caution_message(true));

    s = '<h3>' + _("MSG_fill_room_simulation")
        + '</h3>'
        + (s.length > 10 ? button : '')
        + '<table class="simulation">'
        + (s.length == 0
            ? '<tr><td colspan="2">' + _("MSG_fill_no_change") + '</tr>'
            : '<tr><td class="old_value">' + _("MSG_fill_room_old_value")
            + '<td>'
            + '<td class="new_value">' + _("MSG_fill_room_new_value") + '</tr>'
            + ''.join(s)
        )
        + '</table><p>&nbsp;</p>' + button;

    if (s === '')
        messages.push('<div class="fill_important">'
            + _("MSG_fill_no_change") + '</div>');
    if (fill_empty_value && fill_value) {
        messages.push('<div class="fill_warning">'
            + _("MSG_fill_empty_not_empty") + '</div>');
        for (var room in this.rooms) {
            if (this.rooms[room].name === ''
                && this.rooms[room].checked
                && fill_empty_value == 1
            )
                pulsing(this.rooms[room].get_toggle().parentNode, true);
            else if (this.rooms[room].name !== ''
                && fill_value == 1
                && this.rooms[room].checked)
                pulsing(this.rooms[room].get_toggle().parentNode, true);
        }
    }
    if (overflow)
        messages.push('<div class="fill_warning">' + overflow + ' '
            + _("MSG_fill_overflow") + '</div>');
    if (unwritable)
        messages.push('<div class="fill_error">' + unwritable + ' '
            + _("MSG_fill_unwritable") + '</div>');
    if (problems)
        messages.push('<div class="fill_error">' + _("MSG_fill_bad_format")
            + '</div>');
    if (replacements)
        messages.push('<div class="fill_replace">' + replacements
            + _("MSG_fill_replace") + '</div>');
    if (changes)
        messages.push('<div class="fill_room_messages">' + changes + ' '
            + _("MSG_modifiable_cells") + '</div>');
    if (this.not_empty && !this.toggles.modify)
        messages.push('<div class="fill_room_messages">' + this.not_empty + ' '
            + _("MSG_unchanged_cells") + '</div>');
    this.highlight_option("modify", this.not_empty > 0);
    s = '<h3>' + _("MSG_fill_room_message")
        + '</h3><div class="fill_room_messages">'
        + (messages.length == 0 // Never true
            ? _("MSG_fill_room_message_none")
            : messages.join('')
        )
        + '</div>' + s;
    feedback.innerHTML = s;
    alert_append_stop();
};

Filler.prototype.do_fill = function () {
    popup_close();
    alert_append_start();
    for (var d in this.todo_real) {
        var new_val = this.todo_real[d][0];
        var line = this.todo_real[d][1];
        if (this.toggles.comment)
            comment_change(line.line_id, this.data_col, new_val);
        else
            cell_set_value_real(line.line_id, this.data_col, new_val);
    }
    alert_append_stop();
    this.column.need_update = true;
    update_columns();
    table_fill();
    Filler.last_state = this; // Only on successful filling
};

/****************************************************************************/

function fill_column(redo) {
    if (!table_attr.modifiable)
        Alert("ERROR_table_read_only");
    Filler.filler = new Filler(redo == 'redo' ? Filler.last_state : undefined);
    create_popup('fill_column_div',
        _("TITLE_fill_before")
        + the_current_cell.column.title + _("TITLE_fill_after")
        + ' (' + _('B_' + the_current_cell.column.real_type.title) + ')'
        ,
        '<div id="fill_is_safe">' + _('MSG_fill_safe') + '</div>'
        + '<table id="fill_table" onmousemove="if ( the_event(event).target.className != \'text\' ) TIP.hide_tip(true)">'
        + '<tr>'
        + '<th>' + hidden_txt(_("COL_TITLE_fill_used"),
            _("TIP_TITLE_fill_used"))
        + '<th>' + hidden_txt(_("COL_TITLE_fill_use"),
            _("TIP_TITLE_fill_use"))
        + '<th>' + hidden_txt(_("COL_TITLE_fill_total"),
            _("TIP_TITLE_fill_total"))
        + '<th>' + hidden_txt(_('?'),
            _("TIP_TITLE_fill_?"))
        + '<th class="nowrap">' + hidden_txt(_("COL_TITLE_fill_name"),
            _("TIP_TITLE_fill_name"))
        + '<th>' + hidden_txt(_("COL_TITLE_fill_possible"),
            _("TIP_TITLE_fill_possible"))
        + '<td class="fill_result" rowspan="'
        + Filler.filler.index.length
        + '">'
        + '<div class="fill_column_right">'
        + '<h3 style="clear: both; margin-top: 0px">'
        + _('MSG_fill') + '</h3>'
        + Filler.filler.menu()
        + '<div id="fill_result"></div>'
        + '</div></tr>'
        + Filler.filler.init_rooms()
        + '</table>',
        '',
        false
    );
    if (redo && Filler.last_state) {
        for (var room in Filler.filler.rooms) {
            room = Filler.filler.rooms[room];
            room.get_toggle().checked = room.checked;
        }
    }
    Filler.filler.update_html();
}



var table_forms_element;
var table_forms_table_fill;
var table_forms_allow_next_table_fill;

function table_forms_resize() {
    if (!table_forms_element)
        return;

    table_header_fill();
    var top_left_e, col = 0;
    var cls = column_list_all();
    for (var data_col in cls) {
        data_col = cls[data_col];
        column = columns[data_col];
        if (!column.freezed && !column.hidden && !column.is_empty) {
            top_left_e = table.childNodes[0].childNodes[Number(col) + 1];
            break;
        }
        if (column.col)
            col = column.col;
    }
    var bottom_right_e = table.childNodes[nr_headers
        + table_attr.nr_lines - 1]
        .childNodes[table_attr.nr_columns - 1];
    var top_left = findPos(top_left_e);
    var bottom_right = findPos(bottom_right_e);

    var form = table_forms_element;
    form.style.left = top_left[0] + 'px';
    form.style.top = top_left[1] + 'px';
    form.style.width = (bottom_right[0] + bottom_right_e.offsetWidth
        - top_left[0]) + 'px';
    form.style.height = (bottom_right[1] + bottom_right_e.offsetHeight
        - top_left[1]) + 'px';
    form.lastChild.style.height = (form.offsetHeight
        - form.firstChild.offsetHeight - 6) + 'px';
}

function table_forms_tr(e) {
    while (e && e.tagName != 'TR')
        e = e.parentNode;
    return e;
}

function table_forms_empty_empty_is() {
    element_focused.value = '';
    var tr = table_forms_tr(element_focused);
    tr.classList.remove('default');
}

function table_forms_goto(event) {
    var input = the_event(event).target;
    if (input.focus_from_select) {
        table_forms_save_input(input);
        return;
    }
    if (element_focused === input)
        return;
    element_focused = input;
    element_focused.id = "table_forms_keypress";
    element_focused.initial_value = element_focused.value;
    var e = table_forms_tr(input);
    var cls_all = column_list(0, columns.length);
    if (e.classList.contains('default')) {
        // Without timeout, this does not work on IE
        // The default value come back
        setTimeout(table_forms_empty_empty_is, 1);
    }

    for (var col in cls_all) {
        if (cls_all[col].data_col == e.data_col) {
            table_forms_allow_next_table_fill = false;
            page_horizontal(0, col, true);
            break;
        }
    }
    table_forms_update(the_current_cell, true);
}

// Save the form cell content in the TOMUSS table
function table_forms_save_input(input) {
    var tr = table_forms_tr(input);
    if (input.value == the_current_cell.cell.value)
        return;
    cell_set_value_real(the_current_cell.line_id, tr.data_col, input.value);
    update_line(the_current_cell.line_id, tr.data_col);
}

function table_forms_blur(event) {
    var tr = table_forms_tr(element_focused);
    if (!tr)
        return;
    var input = the_event(event).target;
    if (input.tagName != 'BUTTON')
        table_forms_save_input(input);
    if (tr.data_col == the_current_cell.data_col)
        input.value = the_current_cell.cell.value; // Oui => OUI
    if (input.value === '') {
        input.value = columns[tr.data_col].empty_is;
        if (input.value)
            tr.classList.add('default');
    }
    element_focused = undefined;
    table_forms_update_computed_values(the_current_cell);
}

function table_forms_update_computed_values(THIS) {
    var t = table_forms_element.getElementsByTagName('tbody')[0];
    for (var i in t.childNodes) {
        tr = t.childNodes[i];
        if (!tr.lastChild)
            continue;
        if (columns[tr.data_col].real_type.cell_compute) {
            cell = THIS.line[tr.data_col];
            tr.lastChild.firstChild.value = cell.value;
        }
    }
}

function tableform_enum(event) {
    var button = the_event(event).target;
    if (button.textContent == '×')
        button.setAttribute('value', '');
    else
        button.setAttribute('value', button.textContent.replace(/ /g, "_"));
    table_forms_save_input(button);
    table_forms_update(the_current_cell, true);
}

function table_forms_keypress(event) {
    var input = the_event(event).target;

    if (event.keyCode == 13 || event.keyCode == 9) {
        if (body_on_mouse_up_doing == 'login_list') {
            input.value = TIP.get_tip_select().childNodes[TIP.get_tip_select().selectedIndex].value;
            login_list_hide();
            setTimeout(function () { table_forms_save_input(input); },
                1);
        }
        if (element_focused.tagName == 'BUTTON')
            return; // Enumeration
        if (input.tagName == 'INPUT' || event.keyCode == 9) {
            var tr;
            if (event.shiftKey)
                tr = input.parentNode.parentNode.previousSibling;
            else
                tr = input.parentNode.parentNode.nextSibling;
            if (tr) {
                var n_input = tr.firstChild.nextSibling.firstChild;
                n_input.id = "table_forms_keypress";
                element_focused = n_input;
                setTimeout(function () { n_input.focus(); }, 1);
            }
        }
        else
            setTimeout(function () { table_forms_save_input(input); },
                1);
    }
}

function table_forms_drop(event) {
    if (element_focused)
        element_focused.blur();
    the_event(event).target.focus();
    table_forms_goto(event);
}

function table_forms_stop_event(event) {
    event = the_event(event);
    if ((event.real_event.key.length === 1
        || event.real_event.key == "Backspace")
        && !event.ctrlKey
    ) {
        Alert("ERROR_value_not_modifiable");
        stop_event(event);
    }
}

function table_forms_update(THIS, keep_img) {
    var t = table_forms_element.getElementsByTagName('tbody')[0];
    var i, tr, cell;
    if (THIS.line[0].value === '') {
        table_forms_element.getElementsByTagName('h1')[0].innerHTML =
            _("TITLE_tableforms");
    }
    else {
        table_forms_element.getElementsByTagName('h1')[0].innerHTML =
            html(THIS.line[0].value)
            + (columns[1].freezed == 'F' ? ' ' + html(THIS.line[1].value) : '')
            + (columns[2].freezed == 'F' ? ' ' + html(THIS.line[2].value) : '')
            ;
    }
    for (i in t.childNodes) {
        tr = t.childNodes[i];
        if (!tr.lastChild)
            continue;
        cell = THIS.line[tr.data_col];
        tr.className = '';
        if (cell.value !== '')
            tr.lastChild.firstChild.value = cell.value;
        else {
            tr.lastChild.firstChild.value = columns[tr.data_col].empty_is;
            if (columns[tr.data_col].empty_is)
                tr.classList.add('default');
        }
        if (!keep_img || the_current_cell.data_col == tr.data_col) {
            var img = tr.getElementsByTagName('IMG');
            if (img.length)
                img[0].parentNode.removeChild(img[0]);
        }
        if (!cell.modifiable(THIS.line, columns[tr.data_col])) {
            tr.classList.add('ro');
            tr.onkeydown = table_forms_stop_event;
        }
        else
            tr.onkeydown = function () { };

        if (columns[tr.data_col].type == 'Enumeration') {
            var buttons = tr.getElementsByTagName("BUTTON");
            var value = THIS.line[tr.data_col].value.replace(/_/g, " ");
            if (value === "")
                value = "×";
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].classList.remove("toggled");
                if (buttons[j].textContent == value)
                    buttons[j].classList.add("toggled");
            }
        }
    }
}

function table_forms_jump(lin, col, do_not_focus, line_id, data_col) {
    this.tr.classList.remove('currentformline');
    var old_lin = the_current_cell.lin;
    this.jump_old(lin, col, do_not_focus, line_id, data_col);
    if (old_lin != lin)
        table_forms_update(this);
    this.tr.classList.add('currentformline');
    this.input.classList.add('currentformline');
}

function table_forms_close() {
    if (element_focused) {
        element_focused.onblur({ target: element_focused });
        element_focused = undefined;
    }
    popup_close = Current.save_popup_close;
    Current.prototype.jump = Current.prototype.jump_old;
    table_fill_real = table_forms_table_fill;

    table_forms_element.parentNode.removeChild(table_forms_element);
    table_forms_element = undefined;
    table_fill(false, true);
}

function table_forms() {
    var data_col, column, line, t, tb, s, td_title, td_value;

    if (table_forms_element) {
        table_forms_resize();
        return;
    }
    Current.prototype.jump_old = Current.prototype.jump;
    Current.prototype.jump = table_forms_jump;
    Current.save_popup_close = popup_close;
    popup_close = table_forms_close;
    table_forms_allow_next_table_fill = true;
    table_forms_table_fill = table_fill_real;

    table_fill_real = function () {
        if (table_forms_allow_next_table_fill) {
            table_forms_table_fill();
            setTimeout(table_forms_resize, 1);
        }
        else
            setTimeout(function () { update_horizontal_scrollbar(column_list()); },
                1);
        table_forms_allow_next_table_fill = true;
    };

    table_forms_element = document.createElement('DIV');
    table_forms_element.innerHTML = '<BUTTON class="close" OnClick="table_forms_close()">&times;</BUTTON><h1></h1><div class="formtable"></div>';
    the_body.appendChild(table_forms_element);
    table_forms_element.className = 'tableform';
    table_forms_element.id = 'popup_id'; // Hide tips outside
    t = document.createElement('table');
    table_forms_element.lastChild.appendChild(t);
    tb = document.createElement('tbody');
    t.appendChild(tb);
    var cls = column_list_all();
    var e = ' onfocus="table_forms_goto(event)" onblur="table_forms_blur(event)" onkeydown="table_forms_keypress(event)" ondrop="table_forms_drop(event)"';
    for (data_col in cls) {
        data_col = cls[data_col];
        column = columns[data_col];
        if (column.freezed)
            continue;
        if (column.is_empty)
            continue;
        if (column.hidden)
            continue;

        line = document.createElement('tr');
        line.data_col = data_col;

        td_title = document.createElement('td');
        line.appendChild(td_title);
        td_title.className = "ctitle";
        td_title.innerHTML = '<tt><span></span></tt><b>' + html(column.title)
            + '</b>. <small><em>'
            + html(column.comment.split('///')[0]) + '</em></small>';

        td_value = document.createElement('td');
        line.appendChild(td_value);
        var attribs = column.comment.split('///');
        var more, nr_line = 1;
        if (column.type == 'Text')
            nr_line = 2;
        if (attribs.length > 1) {
            attribs = attribs[1].split(' ');
            nr_line = Number(attribs[0]);
            more = ' rows="' + nr_line + '"';
            if (attribs[1]) {
                more += ' style="background:#' +
                    attribs[1].replace(/[^0-9A-Z]/g, '') + ';"';
            }
        }
        else
            more = ''
        if (column.type == 'Enumeration' && column) {
            var action = e + ' class="button_toggle clickable" onclick="tableform_enum(event)"';
            var s = '<button' + action + '>×</button>';
            for (var j in column.possible_values)
                s += ' <button' + action + '>'
                    + html(column.possible_values[j].replace(/_/g, " "))
                    + '</button>';
            td_value.innerHTML = s;
        }
        else if (nr_line == 1 || column.type == 'Text' && column.completion)
            td_value.innerHTML = '<INPUT' + e + more + '>';
        else
            td_value.innerHTML = '<TEXTAREA' + e + more + '></TEXTAREA>';
        tb.appendChild(line);
    }
    table_forms_resize();
    table_forms_update(the_current_cell);

    TIP.hide_tip(true);
    the_current_cell.update();
}


function freeze_column(_the_id) {
    var column = the_current_cell.column;
    var freezed;
    if (column.freezed == 'F')
        freezed = '';
    else
        freezed = 'F';
    var line_id = the_current_cell.line_id;
    var data_col = the_current_cell.data_col;
    setTimeout(function () {
        the_current_cell.jump_if_possible(line_id, data_col, true);
    }, periodic_work_period + 10); // XXX look at table_fill_do
    table_fill(true, true);

    column_attr_set(column, 'freezed', freezed,
        document.getElementById("t_column_freezed"),
        true);
    the_current_cell.do_update_column_headers = true;
    var p = '';
    for (var c in columns)
        if (columns[c].freezed == 'F')
            p += columns[c].the_id + ':F=';
    change_option('freezeds', p);
}





function returns_false() { return false; };

function set_green(value, column) {
    if (value === undefined || value === '') {
        column.green_filter = returns_false;
        value = '';
    }
    else {
        if (value === 'NaN') {
            var stats = compute_histogram(column.data_col);
            value = '>' + (stats.average() + stats.standard_deviation());
        }
        else if (!isNaN(value))
            value = '>' + value;
        column.green_filter = compile_filter_generic(value, column, true);
    }
    column_update_option('green', value);
    return value;
}


function set_greentext(value, column) {
    if (value === undefined || value === '') {
        column.greentext_filter = returns_false;
        value = '';
    }
    else {
        if (value === 'NaN') {
            var stats = compute_histogram(column.data_col);
            value = '>' + (stats.average() + stats.standard_deviation() / 2);
        }
        else if (!isNaN(value))
            value = '>' + value;
        column.greentext_filter = compile_filter_generic(value, column, true);
    }
    column_update_option('greentext', value);
    return value;
}


function configure_template()
{
  window_open(add_ticket('0/Variables/_' + table_attr.group)) ;
}

function set_groupcolumn(value, column, xcolumn_attr) {
    if (value === '' || xcolumn_attr !== false)
        return value;
    var data_col = data_col_from_col_title(value);

    if (data_col === undefined) {
        Alert('ALERT_url_import_column');
        return value;
    }
    // Compute stats
    var group_value = {};
    for (var lin_id in lines) {
        var group = lines[lin_id][data_col].value;
        if (group_value[group] === undefined)
            group_value[group] = {};
        var v = lines[lin_id][column.data_col].value;
        if (group_value[group][v] === undefined)
            group_value[group][v] = 1;
        else
            group_value[group][v]++;
    }
    // Display errors
    var errors = [];
    for (var group in group_value)
        if (Object.keys(group_value[group]).length != 1) {
            var error = _("B_print_attr_groupcolumn") + ' ' + group + ':';
            for (var v in group_value[group])
                error += ' ' + (v === '' ? _("COL_TITLE_empty") : v) + ':' + group_value[group][v];
            errors.push(error);
        }
    if (errors.length)
        alert(_('ALERT_columngroup') + '\n' + errors.join('\n'));

    return value;
}


function hide_column()
{
  the_current_cell.column.hidden = 1 ;
  table_fill(false,true) ;
}


function update_hiddens_menu() {
    var s = ['<option>' + _('SELECT_hiddens') + '</option>'];
    for (var data_col in columns) {
        if (!column_empty(data_col) && columns[data_col].hidden)
            s.push('<option value="' + data_col + '">'
                + _('SELECT_hiddens') + ' «' + html(columns[data_col].title)
                + "»</option>");
    }

    document.getElementById('t_table_attr_hiddens').innerHTML = s.join('');
}

function hiddens_change(t) {
    var data_col = t.value;
    var column = columns[data_col];
    if (!column)
        return;
    column.hidden = 0;
    table_fill(false, true);
}



function toggle_highlight(the_id) {
    var td = the_td(document.getElementById(the_id));
    column_attr_set(the_current_cell.column,
        'highlight',
        the_current_cell.column.highlight ? 0 : 1,
        td,
        true // Force save                
    );
    table_fill(false, true);
    the_current_cell.do_update_column_headers = true;
}


function the_data_col_selector() {
    var choices = [];
    for (var data_col in columns)
        if (!columns[data_col].is_empty)
            choices.push(data_col);
    choices.sort(function (a, b) {
        if (columns[a].title < columns[b].title)
            return -1;
        return 1;
    })
    var options = [];
    for (var data_col of choices)
            options.push(
                `<option value="${data_col}"${data_col == 0 ? ' selected' : ''}
                 >${html(columns[data_col].title)}${
                        columns[data_col].comment
                        ? ' «' + html(columns[data_col].comment.substr(0, 40)) + '»'
                        : ''
                 }</option>`);
    if (Object.keys(table_attr.mails).length)
        options.push(`<option value="-1">${_("MSG_columnimport_mail")}</option>`);
    return `<select name="data_col_key" id="data_col_key">${options.join('')}</select>`;
}


function import_column() {
    if (!table_attr.modifiable)
        Alert("ERROR_table_read_only");

    var m = '';

    if (nr_not_empty_lines !== 0)
        m = "<small>" + _("MSG_columnimport_empty") + "</small>";
    else
        m = '<small><a href="javascript:full_import()">'
            + _("MSG_columnimport_link") + '</a></small>';
    var choices = the_data_col_selector();

    var t = caution_message();
    if (the_current_cell.data_col === 0)
        t += _("MSG_columnimport_before")
            + '<BUTTON OnClick="import_column_do();">'
            + _("MSG_columnimport_button") + '</BUTTON>'
            + '/<BUTTON OnClick="import_column_do(true);">'
            + _("MSG_columnimport_button_comments") + '</BUTTON> '
            + _("MSG_columnimport_after");
    else
        t += _("MSG_columnimport_before2").replace('<>', choices)
            .replace(/<min>/g, the_current_cell.column.min)
            .replace(/<max>/g, the_current_cell.column.max)
            + '<BUTTON OnClick="import_column_do();">'
            + _("MSG_columnimport_button2") + '</BUTTON>'
            + '/<BUTTON OnClick="import_column_do(true);">'
            + _("MSG_columnimport_button_comments") + '</BUTTON> '
            + _("MSG_columnimport_after2");

    create_popup('import_div',
        _("MSG_columnimport_title") + the_current_cell.column.title,
        t, m);
}

function multicol_import(comments, multiline) {
    var nr_cols = -1;
    for (var i in multiline) {
        if (multiline[i].trim() == '')
            continue;
        var n = multiline[i].replace(/[^\t]/g, '').length;
        if (nr_cols == -1)
            nr_cols = n;
        else if (n != nr_cols)
            return; // Not the same number of \t on each line
    }
    if (nr_cols <= 1)
        return;

    var cls_all = column_list(0, columns.length);
    var col_id = myindex(cls_all, popup_get_element().column);
    var names = [];
    for (var i = 0; i < nr_cols; i++)
        names.push('\n  * ' + cls_all[col_id + i].title)

    if (!confirm(_('ALERT_import_multicol') + names.join('')))
        return;

    var col = [];
    for (var c = 1; c <= nr_cols; c++)
        col[c] = [];
    for (var i in multiline) {
        if (multiline[i].trim() == '')
            continue;
        var line = multiline[i].split(/\t/);
        for (var c = 1; c <= nr_cols; c++)
            col[c].push(line[0] + '\t' + line[c]);
    }
    for (var c = 1; c <= nr_cols; c++) {
        popup_text_area().value = col[c].join('\n');
        popup_get_element().column = cls_all[col_id + c - 1];
        import_column_do(comments, c != nr_cols);
    }
    return true;
}

function import_column_do(comments, do_not_close_popup) {
    var multiline = popup_value();
    if (multicol_import(comments, multiline))
        return;
    var column = popup_column();
    var data_col = column.data_col;
    if (column_empty(data_col) && column.the_local_id !== undefined) {
        create_column(column);
    }

    var line_id, line_ids;
    var replace = '';
    var todo = [];
    var i, j;
    var problems = '';
    var import_overwrite = document.getElementById('import_overwrite');
    if (import_overwrite)
        import_overwrite = import_overwrite.checked;
    var import_clamp = document.getElementById('import_clamp');
    if (import_clamp)
        import_clamp = import_clamp.checked;
    if (data_col === 0 && !comments) {
        // Import in ID column
        for (i in multiline) {
            if (multiline[i] === '')
                continue;
            var m = multiline[i].split(/[\t ]+/);
            if (m.length != 1) {
                problems += _("MSG_columnimport_add") + m[0]
                    + _("MSG_columnimport_instead_of") + multiline[i] + '\n';
            }
            m[0] = login_to_id(m[0]);
            if (login_to_line_id(m[0]) !== undefined) {
                problems += _("MSG_columnimport_yet") + m[0] + "\n";
                continue;
            }
            replace += _("MSG_columnimport_add2") + ' ' + m[0] + ' ';
            todo.push([-1, 0, m[0]]);
        }
        if (problems !== '') {
            element_focused = undefined;
            if (!confirm(problems + '\n' + _("MSG_columnimport_confirm")))
                return;
        }
    }
    else {
        /* Test 'copy' content */
        var key_select = document.getElementById('data_col_key');
        var data_col_key = Number(key_select.value);
        var val;
        var twin = [];
        var key_to_line_id = {};
        var group_import = data_col_key > 0 && column.groupcolumn == columns[data_col_key].title;
        for (var line in filtered_lines) {
            if (data_col_key == -1)
                val = table_attr.mails[login_to_id(filtered_lines[line][0].value)];
            else
                val = filtered_lines[line][data_col_key].value.toString();
            if (val === undefined)
                continue;
            val = login_to_id(val.toLowerCase()).replace(/ /g, '_');
            if (key_to_line_id[val] === undefined)
                key_to_line_id[val] = [];
            else if (group_import)
                continue; // Only one group member is needed
            key_to_line_id[val].push(filtered_lines[line].line_id);
        }
        for (i in multiline) {
            if (multiline[i] === '')
                continue;
            var login = multiline[i].replace(/[\t ].*/, '');
            if (login === '')
                continue;
            var value = multiline[i].replace(RegExp(protect_regexp(login) + '[\t ]*'), '');
            value = decode_lf_tab(value.trim());
            if (import_clamp && !isNaN(a_float(value))) {
                if (a_float(value) < column.min)
                    value = column.min.toString();
                else if (a_float(value) > column.max)
                    value = column.max.toString();
            }
            line_ids = key_to_line_id[login_to_id(login.toLowerCase())];
            if (line_ids === undefined) {
                replace += login + _("MSG_columnimport_not_found") + value + '\n';
                continue;
            }
            if (line_ids.replace)
                line_ids = [line_ids];
            for (j in line_ids) {
                line_id = line_ids[j];
                if (comments)
                    val = lines[line_id][data_col].comment;
                else
                    val = lines[line_id][data_col].value;
                if (val !== '' && value !== '' && a_float(val) == a_float(value))
                    continue; // Import same float value
                if (val === value)
                    continue; // Import same string value
                if (val !== '') {
                    if (!import_overwrite)
                        continue;
                    replace += lines[line_id][0].value + ' : ' + val + ' ==> ' + value + '\n';
                }
                if (twin[line_id] !== undefined && data_col_key == 0) {
                    replace += login + _("MSG_columnimport_multiple") + '\n';
                    continue;
                }
                twin[line_id] = value;
                todo.push([line_id, data_col, value]);
            }
        }
    }

    if (replace !== '') {
        element_focused = undefined;
        if (!confirm(_("MSG_columnimport_confirm") + "\n" + replace))
            return;
    }
    alert_append_start();
    for (i in todo) {
        i = todo[i];
        if (i[0] == -1)
            i[0] = add_a_new_line();
        i[2] = decode_lf_tab(i[2]);
        if (comments)
            comment_change(i[0], i[1], i[2]);
        else
            cell_set_value_real(i[0], i[1], i[2]);
    }
    alert_append_stop();

    column.need_update = true;
    if (!do_not_close_popup) {
        popup_close();
        update_columns();
        table_fill();
    }
}

function full_import() {
    var import_lines = popup_value();
    var line, nr_cols, new_lines;
    new_lines = [];
    for (var a in import_lines) {
        line = parseLineCSV(import_lines[a]);
        if (nr_cols === undefined)
            nr_cols = line.length;
        else
            if (line.length > nr_cols) {
                alert(_("MSG_columnimport_max_first") + '\n' + line);
                return;
            }
            else {
                while (line.length != nr_cols)
                    line.push('');
            }
        new_lines.push(line);
    }
    if (!confirm(_("MSG_columnimport_confirm") + "\n"
        + new_lines.length + _("MSG_columnimport_lines")
        + nr_cols + _("MSG_columnimport_columns")
    ))
        return;

    alert_append_start();
    for (var data_col = 0; data_col < nr_cols; data_col++) {
        if (columns[data_col] === undefined)
            add_empty_column();
        if (columns[data_col].the_local_id !== undefined) // Just created
        {
            column_attr_set(columns[data_col], 'type', 'Text');
            // column_attr_set(columns[data_col], 'title', 'csv_' + data_col) ;
            create_column(columns[data_col]);
        }
    }
    var cls = column_list(0, columns.length);
    for (line in new_lines) {
        add_a_new_line(line.toString());
        // From right to left in order to not have a race between
        // the firstname and surname stored from the CSV and the sames
        // extracted from database.
        // If the race is lost, the user try to write a system computed data
        // and an error is displayed (one for each race lost)
        for (var data_col = nr_cols - 1; data_col >= 0; data_col--)
            cell_set_value_real(line, cls[data_col].data_col,
                decode_lf_tab(new_lines[line][data_col]));
    }
    alert_append_stop();

    the_current_cell.jump(nr_headers, 0, false, 0, 0);
    popup_close();
    table_init();
    table_fill(false, true);
}


/*REDEFINE
  Send the url allowing to jump over a web frontend not allowing big files.
  It is only used for importing zip file.
  It is not used for the student file uploading.
*/
function get_the_upload_url() {
    return url;
}

function upload_file_choosed(t) {
    TIP.hide_tip(true);
    var pdf = t.value.match(RegExp("[.]pdf$", "i"));
    if (!pdf)
        t.parentNode.className = "scrollable_div";
    t.nextSibling.value = t.value;
    var div = t.parentNode;
    progress_submit(t.parentNode, pdf,
        function () {
            setTimeout(function () { div.nextSibling.scrollTop = 1000000; }, 100);
        });
    var e = t.parentNode.parentNode.firstChild;
    while (e !== t.parentNode) {
        var next = e.nextSibling;
        e.parentNode.removeChild(e);
        e = next;
    }
    popup_after_close = window.stop.bind(window);
}

function import_zip() {
    create_popup("import_zip", _("TITLE_column_attr_import_zip"),
        '<form action="' + add_ticket(get_the_upload_url(),
            year + '/' + semester
            + '/' + ue + '/import_zip/' + the_current_cell.column.the_id)
        + '" method="POST" enctype="multipart/form-data">'
        + _("TIP_column_attr_import_zip").replace('«»', the_data_col_selector())
            .replace('«O»', '<input type="checkbox" name="overwrite">')
        + '<h2>' + _('MSG_upload_file') + '</h2>'
        + '<input type="file" name="data" onchange="upload_file_choosed(this)">'
        + '<input type="text" name="filename" hidden=1>'
        + '</form>'
        + '<style>.scrollable_div + DIV { height: 100% ; overflow: auto }</style>'
        + '<div id="iframe_pdf"></div>',
        '', false);
}


function ImportPDF(name, nr_pages) {
    TIP.hide_tip(true);

    var local_this = this;
    this.iframe = document.getElementById("iframe_pdf");
    this.name = name;
    this.nr_pages = nr_pages;
    this.scroll_left = 10;
    this.scroll_top = 50;
    this.scroll_done = true;
    this.page_height = 6;
    this.iframe.innerHTML = (
        "<style>"
        + "#pdfimport { width: 100% ; position: relative; }"
        + "#pdfimport .page {"
        + "    height: " + this.page_height + "em ;"
        + "    overflow: scroll ;"
        + "    margin: 0px ;"
        + "    right: 0px ; left: 0px ;"
        + "    transition: top 0.5s ; "
        + "    position: absolute ;"
        + "}"
        + "#pdfimport .student {"
        + "    font-size: 150% ;"
        + "    color: #00F ;"
        + "    width: 110% ;" // Negative margin-right
        + "    height: 1.2em ;"
        + "    background: #DDF ;"
        + "    transition: top 0.5s ; "
        + "    right: 0px ; left: 0px ;"
        + "    position: absolute ;"
        + "    z-index: 1 ;"
        + "}"
        + "#pdfimport .highlight_allowed:hover,"
        + "#pdfimport .moving {"
        + "    background: #BBF ;"
        + "}"
        + "#pdfimport .student SPAN {"
        + "    cursor: pointer;"
        + "    position: absolute;"
        + "    width: 5%;"
        + "    text-align: center;"
        + "    transition: opacity 0.5s;"
        + "}"
        + "#pdfimport > *:first-child *"
        + "    { pointer-events: none ; }"
        + "#pdfimport > *:first-child .pdfup,"
        + "#pdfimport > *:first-child .pdfdown,"
        + "#pdfimport > *:first-child .student_swap"
        + "    { display: none }"
        + "#pdfimport .pdfup { left: 0% }"
        + "#pdfimport .pdfdown { left: 5% }"
        + "#pdfimport .student_swap { left: 10% }"
        + "#pdfimport .student_swap B {"
        + "    margin-right: -0.5em; font-size:120%"
        + "}"
        + "#pdfimport .student .name {"
        + "    left: 15% ;"
        + "    font-size: 80% ;"
        + "    color: #000 ;"
        + "    width: 80% ;"
        + "    pointer-events: none ;"
        + "    bottom: 0px ;"
        + "    text-align: left;"
        + "}"
        + "#pdfimport .empty .name { opacity: 0.25 }"
        + "#pdfimport > *:first-child .pdfup,"
        + "#pdfimport > *:first-child .pdfdown,"
        + "#pdfimport > *:first-child .swap"
        + "    { display: none }"
        + "#pdfimport .previous_empty .pdfdown,"
        + "#pdfimport .next_empty .pdfup"
        + "    { opacity: 0.2 ; pointer-events: none ; }"
        + "#pdf_button_import { position: fixed; top: 11%; z-index: 2 }"
        + "</style>"
        + '<button id="pdf_button_import">'
        + _("MSG_column_attr_import_zip_pdf") + '</button><br><br>'
        + '<div id="pdfimport"></div>');
    var the_lines = [];
    for (var i in filtered_lines) {
        line = filtered_lines[i];
        if (!line_empty(line))
            the_lines.push(line);
    }
    var pages_per_student = nr_pages / the_lines.length;
    if (pages_per_student < 1)
        pages_per_student = 1;
    this.blocks = document.getElementById("pdfimport");
    this.blocks.onmousedown = function (event) { local_this.mousedown(event); };
    this.button = document.getElementById("pdf_button_import");
    this.button.onclick = this.send.bind(this);
    this.button.disabled = 1;
    this.iframe.onmousemove = this.mousemove.bind(this);
    this.iframe.onmouseup = this.mouseup.bind(this);
    this.iframe_container = this.iframe.parentNode;
    this.will_scroll();
    var last_page = 0;

    function student_onclick(event) {
        local_this.click(event);
    };
    function page_onscroll(event) {
        var target = the_event(event).target
        local_this.scroll_top = target.scrollTop;
        local_this.scroll_left = target.scrollLeft;
        local_this.will_scroll();
    };
    for (var i in the_lines) {
        var line = the_lines[i];
        var student = document.createElement("DIV");
        student.is_student = true;
        student.innerHTML =
            '<span class="student_swap"><b>↑</b>↓</span>'
            + '<span class="pdfdown">▲</span>'
            + '<span class="pdfup">▼</span>'
            + '<span class="name">'
            + html(line[0].value) + " " + html(line[1].value) + " " + html(line[2].value)
            + '</span>';
        student.pdfline = line;
        student.onclick = student_onclick;
        this.blocks.appendChild(student);
        var new_page = Math.min(Math.floor(pages_per_student * (Number(i) + 1)),
            nr_pages);
        for (var j = last_page; j < new_page; j++) {
            var page = document.createElement("DIV");
            var img = document.createElement("IMG");
            page.appendChild(img);
            page.onscroll = page_onscroll;
            this.blocks.appendChild(page);
            if (j == 0)
                this.to_load = page;
        }
        last_page = new_page;
    }
    this.to_load_number = 1;
    this.update();
}

ImportPDF.prototype.mousedown = function (event) {
    event = the_event(event);
    if (!event.target.is_student)
        return;
    if (event.target !== this.blocks.firstChild)
        this.move_student = event.target;
    stop_event(event);
};

ImportPDF.prototype.mouseup = function (event) {
    if (this.move_student) {
        this.move_student = undefined;
        stop_event(event);
    }
};

ImportPDF.prototype.move_before = function (block, other) {
    if (other)
        this.blocks.insertBefore(block, other);
    else
        this.blocks.appendChild(block);
};

ImportPDF.prototype.move_after = function (block, other) {
    if (other.nextSibling)
        this.blocks.insertBefore(block, other.nextSibling);
    else
        this.blocks.appendChild(block);
};

ImportPDF.prototype.mousemove = function (event) {
    if (!this.move_student)
        return;
    event = the_event(event);
    var y = event.y - findPosY(this.blocks) - this.height_page / 2;
    for (var block = this.blocks.firstChild; block; block = block.nextSibling) {
        if (block.offsetTop > y) {
            if (this.move_student !== block) {
                this.move_before(this.move_student, block);
                this.update_later();
            }
            break;
        }
        if (block === this.blocks.lastChild && this.move_student !== block) {
            this.move_after(this.move_student, block);
            this.update_later();
        }
    }
    var scroll = this.blocks.parentNode;
    if (y < scroll.scrollTop)
        scroll.scrollTop -= 10;
    if (y > scroll.scrollTop + this.iframe_container.offsetHeight)
        scroll.scrollTop += 10;
};


ImportPDF.prototype.scroll = function () {
    for (var block = this.blocks.firstChild; block; block = block.nextSibling) {
        if (!block.is_student) {
            block.scrollTop = this.scroll_top;
            block.scrollLeft = this.scroll_left;
        }
    }
    this.scroll_done = true;
};

ImportPDF.prototype.student_empty = function (student) {
    return !student.nextSibling || student.nextSibling.is_student;
};

ImportPDF.prototype.previous_student = function (student) {
    do
        student = student.previousSibling;
    while (student && !student.is_student);
    return student;
};

ImportPDF.prototype.next_student = function (student) {
    do
        student = student.nextSibling;
    while (student && !student.is_student);
    return student;
};

ImportPDF.prototype.translate = function (student, direction) {
    for (; student; student = this.next_student(student)) {
        if (direction == 1
            && student.nextSibling && !student.nextSibling.is_student)
            this.move_after(student, student.nextSibling);
        if (direction == -1
            && student.previousSibling && !student.previousSibling.is_student)
            this.move_before(student, student.previousSibling);
    }
};

ImportPDF.prototype.click = function (event) {
    var t = the_event(event).target;
    var student = t;
    while (!student.is_student)
        student = student.parentNode;
    if (t.className == 'pdfup')
        this.translate(student, 1);
    else if (t.className == 'pdfdown')
        this.translate(student, -1);
    else if (t.className == 'student_swap') {
        var previous_student = this.previous_student(student);
        var s1 = previous_student.nextSibling;
        if (s1 === student)
            this.move_before(student, previous_student);
        else {
            var s2 = student.nextSibling;
            this.move_before(student, s1);
            this.move_before(previous_student, s2);
        }
    }
    this.update_later();
};

ImportPDF.prototype.update = function () {
    var cls;
    var top = 0;
    for (var block = this.blocks.firstChild; block; block = block.nextSibling) {
        block.style.top = top + "px";
        if (block.is_student) {
            if (!this.height_student && block.offsetHeight > 20)
                this.height_student = block.offsetHeight;
            top += this.height_student || 20;
            cls = ["student"];
            if (block.previousSibling && block.previousSibling.is_student)
                cls.push('previous_empty');
            if (!block.nextSibling || block.nextSibling.is_student)
                cls.push('next_empty');
            if (this.move_student == block)
                cls.push("moving");
            if (!this.move_student && block !== this.blocks.firstChild)
                cls.push("highlight_allowed");
        }
        else {
            if (!this.height_page && block.offsetHeight > 20)
                this.height_page = block.offsetHeight;
            top += this.height_page || 60;
            cls = ["page"];
        }
        block.className = cls.join(' ');
    }
};

ImportPDF.prototype.update_later = function () {
    periodic_work_add(this.update.bind(this));
    // setTimeout(this.update.bind(this), 100) ;
};

ImportPDF.prototype.will_scroll = function () {
    if (this.scroll_done) {
        this.scroll_done = false;
        setTimeout(this.scroll.bind(this),
            this.button.disabled != 0 ? 1000 : 100);
    }
};

ImportPDF.prototype.add = function () {
    var page = "00000" + this.to_load_number++;
    this.to_load.firstChild.src = add_ticket('tmp/' + this.name
        + '/p' + page.substr(page.length - 6) + '.png');
    do
        this.to_load = this.to_load.nextSibling;
    while (this.to_load && this.to_load.is_student);
    this.will_scroll();

    if (!this.to_load)
        this.button.disabled = 0;

    this.update_later();
};

ImportPDF.prototype.send = function () {
    var d = {};
    var page = 1;
    for (var block = this.blocks.firstChild; block;) {
        var nr_pages = -1;
        var student = block;
        do {
            block = block.nextSibling;
            nr_pages++;
        }
        while (block && !block.is_student);
        if (nr_pages)
            d[student.pdfline.line_id] = page + '\001' + nr_pages;
        page += nr_pages;
    }
    create_popup("import_zip", _("TITLE_column_attr_import_zip"),
        '<iframe style="width:100%; height:90% ; border:0px" name="iframe_pdf"></iframe>',
        '', false);

    do_post_data(d,
        add_ticket(year + '/' + semester + '/' + ue
            + '/upload_pdf/' + page_id + '/' + popup_column().the_id),
        "iframe_pdf");
};


function send_invitation() {
    var subject = localStorage['invitation.subject.' + ue]
        || (_("MSG_invitation_subject_default") + ' '
            + ue + ' ' + table_attr.table_title);
    var message = localStorage['invitation.message.' + ue]
        || _("MSG_invitation_message_default");
    var mails = localStorage['invitation.mails.' + ue]
        || "john.doe@example.org\nfrancois.chirac@example.org";

    create_popup('invitation_div',
        _("MSG_invitation_title"),
        _("MSG_invitation_subject")
        + '<input id="invitation_subject" style="width:100%" value="'
        + encode_value(subject) + '"><br>'
        + _("MSG_invitation_message")
        , _("MSG_invitation_mails")
        + '<textarea id="invitation_mails">'
        + encode_value(mails) + '</textarea>'
        + '<button onclick="invitation_do()">'
        + _("MSG_invitation_send") + '</button>'
        + ' <input id="invitation_days" style="width:2em" value="2">'
        + ' ' + _("ALERT_columnvisibility_date_far_futur2")
        + ' <select id="invitation_type" style="font-size:140%">'
        + '<option value="sharable" default>'
        + _("MSG_invitation_sharable") + "</option>"
        + '<option value="one_shot" default>'
        + _("MSG_invitation_one_shot") + "</option>"
        + '<option value="sharable_suivi" default>'
        + _("MSG_invitation_sharable_suivi") + "</option>"
        + "</select>"
        , message
    );
    add_ticket_checker(document.getElementById('popup_id'));
}

function invitation_do() {
    var mailing_mail = popup_value();
    var message = mailing_mail.join('\n');
    var subject = document.getElementById('invitation_subject').value;
    var mails = document.getElementById('invitation_mails').value;
    var type = document.getElementById('invitation_type').value;
    localStorage['invitation.subject.' + ue] = subject;
    localStorage['invitation.message.' + ue] = message;
    localStorage['invitation.mails.' + ue] = mails;

    var d = {
        'subject': subject,
        'message': message,
        'type': type,
        "days": document.getElementById('invitation_days').value,
        'recipients': mails.replace(/[\n\t ;,]+/g, "\001")
    };
    do_post_data(d, add_ticket(year + "/" + semester + "/" + ue + '/invitation'));
    popup_close();
}



function table_linear() {
    window.location = add_ticket(year + '/' + semester + '/' + ue + '/=linear=');
}

// XXX: live connection does not work

function Linear() {
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    this.informations_cell =
        [
            new Information
                (this,
                    function () {
                        if (this.L.column().real_type.cell_compute)
                            return this.L.column().type + _("MSG_tablelinear_not_modifiable");
                        else
                            return _("MSG_tablelinear_value");
                    },
                    _("LABEL_tablelinear_value"),
                    function () {
                        var value = this.L.cell().value;
                        if (value.toFixed && value !== 0)
                            value = tofixed(value).replace(/[.]*0*$/, '');
                        return value;
                    },
                    function (value) {
                        cell_set_value_real(this.L.line_id(),
                            this.L.data_col(),
                            value);
                    },
                    function () {
                        if (this.L.column().real_type.cell_compute)
                            return _("ERROR_tablelinear_value_not_modifiable");
                        return this.L.cell().changeable(this.L.line(), this.L.column());
                    },
                    function () {
                        var h = _(this.L.column().real_type.tip_cell);
                        if (this.L.column().type == 'Note')
                            h = _("TIP_tablelinear_grade_between") + this.L.column().min
                                + _("TIP_tablelinear_and") + this.L.column().max
                                + '. ' + h;
                        return h + '.';
                    }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_value_author"); },
                    _("LABEL_tablelinear_value_author"),
                    function () { return this.L.cell().author; }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_value_date") },
                    _("LABEL_tablelinear_value_date"),
                    function () { return date_full(this.L.cell().date); }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_value_comment"); },
                    _("LABEL_tablelinear_value_comment"),
                    function () { return this.L.cell().comment; },
                    function (value) {
                        comment_change(this.L.line_id(),
                            this.L.data_col(),
                            value);
                    },
                    function () {
                        return table_attr.modifiable ? true :
                            _("MSG_tablelinear_table_not_modifiable");
                    }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_registered"); },
                    '',
                    function () {
                        var w;
                        if (this.L.line()[5].value === 'non')
                            w = _("MSG_tablelinear_registered_no");
                        else
                            w = _("MSG_tablelinear_registered_yes");
                        w += '<br>' + student_abjs(this.L.line()[0].value);
                        return '\001' + w.replace(/[.]<br>$/, ''); // \001 indicate HTML code
                    }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_rank"); },
                    _("LABEL_tablelinear_rank"),
                    function () { return compute_table_rank(this.L.line_id(), this.L.column()).replace('&nbsp;', '').replace('/', _("MSG_tablelinear_rank_on")); }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_history") },
                    _("LABEL_tablelinear_history"),
                    function () {
                        var t = [];
                        var h = this.L.cell().history;
                        for (var i in h)
                            t.push(html(h[i][0])
                                + ' ' + _('DisplayCellAuthorBefore') + ' '
                                + html(h[i][2])
                                + ' ' + _("DisplayCellMTimeBefore") + ' '
                                + date_full(h[i][1])
                            );
                        return t.join(', ');
                    }
                )
        ];
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    this.informations_column =
        [
            new Information
                (this,
                    function () { return _("MSG_tablelinear_column_title"); },
                    _("LABEL_tablelinear_column_title"),
                    function () { return this.L.column().title; },
                    function (value) {
                        // this.L.column().real_type.set_title(value, this.L.column());
                        column_attr_set(this.L.column(), 'title', value);
                    },
                    function () { return column_change_allowed_text(this.L.column()); },
                    function () { return _("TIP_tablelinear_column_title"); }
                ),
            new Information
                (this,
                    function () { return _("TIP_column_attr_type"); },
                    _("LABEL_tablelinear_column_type"),
                    function () { return this.L.column().type; },
                    function (value) {
                        column_attr_set(this.L.column(), 'type', value);
                        this.L.update_column();
                    },
                    function () { return column_change_allowed_text(this.L.column()); },
                    function () { return _("TIP_tablelinear_column_type"); }
                ),
            new Information
                (this,
                    function () { return _("TIP_column_attr_weight"); },
                    _("LABEL_tablelinear_column_weight"),
                    function () {
                        var column = this.L.column();
                        if (column.real_type.set_weight != unmodifiable)
                            return column.real_weight;
                        else
                            return "";
                    },
                    function (value) {
                        column_attr_set(this.L.column(), 'weight', value);
                        this.L.update_column();
                    },
                    function () { return column_change_allowed_text(this.L.column()); },
                    function () { return _("MSG_tablelinear_column_weight"); }
                ),
            new Information
                (this,
                    function () { return _("TIP_column_attr_minmax"); },
                    _("LABEL_tablelinear_column_minmax"),
                    function () {
                        var column = this.L.column();
                        if (column.real_type.set_test != unmodifiable)
                            return column.min + ' ' + column.max;
                        else
                            return "";
                    },
                    function (value) {
                        column_attr_set(this.L.column(), 'minmax', value);
                        this.L.update_column();
                    },
                    function () { return column_change_allowed_text(this.L.column()); },
                    function () { return _("MSG_tablelinear_column_minmax"); }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_column_columns"); },
                    _("LABEL_tablelinear_column_columns"),
                    function () {
                        var column = this.L.column();
                        if (column.average_from !== undefined)
                            return column.average_from.toString().replace(/,/g, ' ');
                        else
                            return _("ERROR_tablelinear_column_columns_na");
                    },
                    function (value) {
                        column_attr_set(this.L.column(), 'columns', value);
                        this.L.update_column();
                    },
                    function () {
                        var column = this.L.column();
                        if (column.real_type.set_weight == unmodifiable)
                            return _("ERROR_tablelinear_column_columns_na2") + column.type;
                        return column_change_allowed_text(column);
                    },
                    function () { return _("TIP_tablelinear_column_columns"); }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_column_comment"); },
                    _("LABEL_tablelinear_column_comment"),
                    function () { return this.L.column().comment; },
                    function (value) {
                        column_attr_set(this.L.column(), 'comment', value);
                    },
                    function () { return column_change_allowed_text(this.L.column()); },
                    function () { return _("TIP_tablelinear_column_comment"); }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_column_emptyis"); },
                    'ø',
                    function () { return this.L.column().empty_is; },
                    function (value) {
                        column_attr_set(this.L.column(), 'empty_is', value);
                        this.L.update_column();
                    },
                    function () { return column_change_allowed_text(this.L.column()); },
                    function () {
                        var column = this.L.column();
                        if (column.type == 'Note')
                            return _("TIP_tablelinear_column_emptyis_note");
                        return _("TIP_tablelinear_column_emptyis");
                    }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_column_stats"); },
                    '',
                    function () {
                        var stats = compute_histogram(this.L.data_col());
                        var s;
                        if (stats.nr)
                            s = stats.nr + ' ' + _("grades") + '. '
                                + _("Average") + ' ' + tofixed(stats.average()) + '. '
                                + _("Mediane") + ' ' + tofixed(stats.mediane()) + '. '
                                + _("Standard-deviation") + ' '
                                + tofixed(stats.standard_deviation()) + '. '
                                + _("Minimum") + ' ' + tofixed(stats.min) + '. '
                                + _("Maximum") + ' ' + tofixed(stats.max) + '.';
                        else
                            s = _("MSG_tablelinear_no_grade");
                        if (stats.nr_ppn) s += ' ' + stats.nr_ppn() + ' ' + _("MSG_columnstats_ppn") + '.';
                        if (stats.nr_abi) s += ' ' + stats.nr_abi() + ' ' + _("MSG_columnstats_abi") + '.';
                        if (stats.nr_abj) s += ' ' + stats.nr_abj() + ' ' + _("MSG_columnstats_abj") + '.';
                        if (stats.nr_pre) s += ' ' + stats.nr_pre() + ' ' + _("MSG_columnstats_pre") + '.';
                        if (stats.nr_yes) s += ' ' + stats.nr_yes() + ' ' + _("MSG_columnstats_yes") + '.';
                        if (stats.nr_no) s += ' ' + stats.nr_no() + ' ' + _("MSG_columnstats_no") + '.';
                        if (stats.nr_nan)
                            s += ' ' + stats.nr_nan() + ' ' + _("MSG_columnstats_empty");
                        return s.substr(0, s.length - 1);
                    }
                ),
            new Information
                (this,
                    function () {
                        return _("MSG_tablelinear_filter")
                            + "<a href=\"" + url + '/doc_filtre.html" target="_new_">'
                            + _("MSG_tablelinear_filter_doc") + '</a>.';
                    },
                    _("LABEL_tablelinear_filter"),
                    function () { return this.L.column().filter; },
                    function (value) {
                        var column = this.L.column();
                        column.filter = value;
                        set_filter_generic(value, column);
                        update_filters();
                        update_filtered_lines();
                        this.L.lin = 0;
                    },
                    function () { return true; },
                    function () { return _("TIP_tablelinear_filter"); }
                )
        ];
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    this.informations_table =
        [
            new Information
                (this,
                    function () { return _("MSG_tablelinear_table_stats"); },
                    '',
                    function () {
                        return filtered_lines.length
                            + _("MSG_tablelinear_table_lines") + nr_filtered_not_empty_lines;
                    }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_table_comment"); },
                    _("LABEL_tablelinear_table_comment"),
                    function () { return table_attr.comment; },
                    function (value) {
                        table_attr_set('comment', value);
                    },
                    function () {
                        if (table_attr.modifiable && (i_am_the_teacher || table_attr.masters.length == 0))
                            return true;
                        return _("ERROR_tablelinear_table_comment");
                    },
                    function () { return _("TIP_tablelinear_table_comment"); }
                ),
            new Information
                (this,
                    function () { return _("MSG_tablelinear_table_masters"); },
                    _("LABEL_tablelinear_table_masters"),
                    function () { return table_attr.masters.join(' '); },
                    function (value) {
                        table_attr_set('masters', value);
                    },
                    function () {
                        if (table_attr.modifiable && (i_am_the_teacher || table_attr.masters.length == 0))
                            return true;
                        return _("ERROR_tablelinear_table_masters");
                    },
                    function () { return _("TIP_tablelinear_table_masters"); }
                )
        ];
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    this.informations = this.informations_cell
    this.information = this.informations[0];
    this.col = 3;
    this.lin = 0;
    this.top = document.getElementById('top');
    this.input_edit = false;
    this.w('<h1>' + ue + ' ' + semester + ' ' + year + '</h1>' +
        '<h2>' + table_attr.table_title + '</h2>'
        + _("MSG_tablelinear_welcome"));
}


var linear_w_real_queue = [];

function linear_w_real() {
    if (L === undefined)
        return;
    if (linear_w_real_queue.length !== 0) {
        var c = '';
        while (linear_w_real_queue.length !== 0) {
            c += '<br>' + linear_w_real_queue.splice(0, 1)[0];
        }
        var e = document.createElement('div');
        e.innerHTML = c.substr(4); // Remove first <br>
        L.top.appendChild(e);
        scrollTop(10000000);
    }
    if (L.input_to_init !== undefined) {
        L.input_edit = true;
        L.input.value = L.input_to_init;
        L.input.initial_value = L.input.value;
        L.input_to_init = undefined;
        L.input.style.display = '';
        L.input.select();
        L.input.focus();
        scrollTop(10000000);
    }
}

if (window.location.pathname.search('/=linear=') != -1)
    setInterval(linear_w_real, 100);

function linear_w(x) {
    linear_w_real_queue.push(x);
}


function column_list_all2() {
    var t = column_list_all();
    t.push(add_empty_columns());
    return t;
}

function linear_data_col() { return column_list_all2()[this.col]; }
function linear_line_id() { return this.line().line_id; }
function linear_column() { return columns[this.data_col()]; }
function linear_cell() { return this.line()[this.data_col()]; }
function linear_line() {
    // update_filtered_lines() ;
    if (this.lin < filtered_lines.length)
        return filtered_lines[this.lin];
    else {
        if (this.lin != filtered_lines.length)
            alert('There is a bug');
        add_a_new_line();
        return filtered_lines[this.lin];
    }
}

function linear_column_title() {
    if (this.hide_column_title)
        return '';
    var empty = '';
    if (this.column().is_empty)
        empty = _("MSG_tablelinear_is_empty");
    return _("TAB_column") + ' <i>' + html(this.column().title) + '</i>'
        + empty + ', ';
}

function linear_line_title() {
    if (this.hide_line_title)
        return '';
    var cls = column_list_all2();
    var s = '';
    var line = this.line();
    for (var data_col in cls) {
        data_col = cls[data_col];
        if (columns[data_col].freezed == 'F')
            s += line[data_col].value + ', ';
    }
    if (s.replace(/, /g, '') === '')
        s = _("MSG_tablelinear_enter_id");
    return s;
}

function linear_update_column() {
    var column = this.column();
    init_column(column);
    column.need_update = true;
    update_columns();
}

function linear_go_right(quiet) {
    this.hide_column_title = this.hide_line_title = this.hide_what = quiet;
    var cls = column_list_all2();
    this.col++;
    if (this.col >= cls.length) {
        this.col = cls.length - 1;
        this.w(_("MSG_tablelinear_nothing_right"));
    }
    this.hide_line_title = true;
    this.display();
    return true;
}

function linear_go_left(quiet) {
    this.hide_column_title = this.hide_line_title = this.hide_what = quiet;
    this.col--;
    this.hide_line_title = true;
    if (this.col < 0) {
        this.col = 0;
        this.w(_("MSG_tablelinear_nothing_left"));
    }
    this.display();
    return true;
}

function linear_go_down(quiet) {
    this.hide_column_title = this.hide_line_title = this.hide_what = quiet;
    // update_filtered_lines() ;
    this.lin++;
    this.hide_column_title = true;
    if (this.lin >= filtered_lines.length) {
        this.lin = filtered_lines.length;
        this.w(_("MSG_tablelinear_nothing_under"));
    }
    this.display();
    return true;
}

function linear_go_up(quiet) {
    this.hide_column_title = this.hide_line_title = this.hide_what = quiet;
    this.lin--;
    this.hide_column_title = true;
    if (this.lin < 0) {
        this.lin = 0;
        this.w(_("MSG_tablelinear_nothing_above"));
    }
    this.display();
    return true;
}

function linear_change_show(quiet) {
    var i = myindex(this.informations, this.information);
    if (i != -1) {
        i = (i + 1) % this.informations.length;
        this.information = this.informations[i];
    }

    this.hide_column_title = this.hide_line_title = true;
    this.hide_what = quiet;
    this.display();
    return true;
}

function linear_set_show(quiet, table, n, col) {
    var c;

    if (this.informations == table && n === undefined) {
        this.change_show();
        return true;
    }
    if (n === undefined)
        c = 0;
    else {
        c = n;
        this.informations_save = this.informations;
        this.information_save = this.information;
        this.col_save = this.col;
        if (col !== undefined) {
            var cls = column_list_all();
            for (var i in cls) {
                if (columns[cls[i]].title == col) {
                    this.col = i;
                    break;
                }
            }
        }
    }

    this.informations = table;
    this.information = table[c];

    if (!quiet)
        this.display();
    if (n !== undefined)
        this.edit(quiet);
    return true;
}

function linear_onkeypress(event) {
    event = the_event(event);
    if (event.keyCode == 13) {
        stop_event(event);
        L.stop_edit();
        return false;
    }
    if (event.keyCode != 27)
        return true;
    L.w(_("MSG_tablelinear_cancel"));
    L.stop_edit(true);
    stop_event(event);
}

function linear_edit(quiet) {
    var changeable = this.information.is_changeable();
    if (changeable != true) {
        this.w(changeable);
        return true;
    }
    if (quiet != true && this.information.content)
        this.w(this.information.content());
    this.input_to_init = this.information.get_value();
    return true;
}

function linear_stop_edit(abort) {
    if (!this.input_edit) // OPERA
        return;
    if (this.input.value != this.input.initial_value && abort === undefined)
        this.information.change(this.input.value);
    this.input_edit = false;
    this.input.value = '';
    this.input.style.display = 'none';

    if (this.informations_save !== undefined) {
        if (!abort)
            this.display();

        this.informations = this.informations_save;
        this.information = this.information_save;
        this.col = this.col_save;
        this.informations_save = undefined;
        this.information_save = undefined;
        this.col_save = undefined;

        if (abort)
            return;
    }
    else {
        if (abort)
            return;

        this.hide_column_title = this.hide_line_title = true;
    }
    this.display();

    update_line(this.line_id(), this.data_col());

    if (this.informations == this.informations_column) {
        columns[this.data_col()].need_update = true;
        update_columns();
    }
}

function linear_display() {
    this.w(this.information.value());
    this.hide_column_title = false;
    this.hide_line_title = false;
    this.hide_what = false;
}

function linear_tip() {
    var r = this.information.help();

    if (this.information.is_changeable
        && this.information.is_changeable() == true)
        r += _("MSG_tablelinear_enter_to_edit");

    this.w(r);
    return true;
}

function linear_sort(dir) {
    var sorted = false;
    if (this.column() != sort_columns[0]) {
        sort_column(this.data_col());
        sorted = true;
    }
    if (this.column().dir != dir) {
        sort_column(this.data_col());
        sorted = true;
    }
    if (!sorted) // force the sort (the user modified the table)
    {
        sort_column(this.data_col());
        sort_column(this.data_col());
    }
    var s = _("MSG_tablelinear_sort_before") + "<i>"
        + this.column().title + "</i>" + _("MSG_tablelinear_sort_after");
    if (dir == 1)
        s += _("MSG_tablelinear_sort_up");
    else
        s += _("MSG_tablelinear_sort_down");
    this.w(s);
    update_filtered_lines();
    this.display();
    return true;
}

function linear_freeze() {
    if (this.column().freezed)
        this.w(_("MSG_tablelinear_freezed"));
    else
        this.w(_("MSG_tablelinear_unfreezed"));
    freeze_column(this.column());
    return true;
}

function linear_hide() {
    this.w(_("MSG_tablelinear_hide_before") + "<i>" + html(this.column().title)
        + "</i>" + _("MSG_tablelinear_hide_after"));
    this.column().hidden = 1;
    this.display();
    return true;
}

function linear_print() {
    print_selection();
    return true;
}

function linear_suivi() {
    window.open(add_ticket(suivi, this.line()[0].value + '/*'));
}


function linear_help() {
    this.w(_("MSG_tablelinear_doc"));
    return true;
}

Linear.prototype.data_col = linear_data_col;
Linear.prototype.line_id = linear_line_id;
Linear.prototype.cell = linear_cell;
Linear.prototype.line = linear_line;
Linear.prototype.column = linear_column;
Linear.prototype.update_column = linear_update_column;
Linear.prototype.column_title = linear_column_title;
Linear.prototype.line_title = linear_line_title;
Linear.prototype.display = linear_display;
Linear.prototype.edit = linear_edit;
Linear.prototype.stop_edit = linear_stop_edit;
Linear.prototype.onkeypress = linear_onkeypress;
Linear.prototype.go_right = linear_go_right;
Linear.prototype.go_left = linear_go_left;
Linear.prototype.go_down = linear_go_down;
Linear.prototype.go_up = linear_go_up;
Linear.prototype.help = linear_help;
Linear.prototype.w = linear_w;
Linear.prototype.change_show = linear_change_show;
Linear.prototype.set_show = linear_set_show;
Linear.prototype.tip = linear_tip;
Linear.prototype.sort = linear_sort;
Linear.prototype.freeze = linear_freeze;
Linear.prototype.hide = linear_hide;
Linear.prototype.print = linear_print;
Linear.prototype.suivi = linear_suivi;

function Information(L, help, value_info, get_value, change_value, changeable,
    content) {
    this.L = L;
    this.help = help;
    this.value_info = value_info;
    this.get_value = get_value;
    this.change_value = change_value;
    this.changeable = changeable;
    this.content = content;
}

function information_value() {
    var prepend;

    if (this.L.hide_what || this.value_info === '')
        prepend = '&nbsp;';
    else
        prepend = '<u>' + this.value_info + '</u> ';

    if (this.L.informations != this.L.informations_cell) {
        this.L.hide_line_title = true;
        if (this.L.information == this.L.informations_column[0]
            || this.L.informations == this.L.informations_table)
            this.L.hide_column_title = true;
    }

    var value = this.get_value();
    if (value.substr !== undefined && value.substr(0, 1) == '\001')
        value = value.substr(1);
    else
        value = html(value);

    return this.L.line_title() + this.L.column_title() + prepend
        + '<b>' + value + '</b>.';
}

function information_change(value) {
    this.change_value(value);
}

function information_is_changeable() {
    if (this.change_value === undefined)
        return _("MSG_tablelinear_unmodifiable");
    return this.changeable();
}

Information.prototype.value = information_value;
Information.prototype.change = information_change;
Information.prototype.is_changeable = information_is_changeable;

var L;
var key_history = '';

/* The problem is that the server must not answer because it is impossible */
function send_key_history() {
    if (key_history === '')
        return;

    L.w('<img src="' + add_ticket(year + '/' + semester
        + '/' + ue + '/' + page_id + '/key_history/'
        + encode_uri(key_history))
        + '">');
    key_history = ''; // Do not send history more than once
}

function dispatch(x) {
    setTimeout(function () { window.scrollTo(0, document.body.scrollHeight); }, 100);
    if (x == 'init') {
        L = new Linear();
        L.input = document.getElementsByTagName('INPUT')[0];
        L.input.style.width = '100%';
        L.input.style.display = 'none';
        L.display();
        return;
    }
    if (L.input_edit) {
        L.onkeypress(x);
        return;
    }
    if (x.keyCode == 13 && L.input_edit === false) {
        // Do not take into account the 'Return' just after a 'stop_edit'
        L.input_edit = 0;
        return;
    }
    L.input_edit = 0;

    if (x.altKey || x.ctrlKey)
        return;

    var k = '';
    if (x.which)
        k = String.fromCharCode(x.which);
    else
        k = String.fromCharCode(x.keyCode);
    if (k == null)
        k = '';
    k = k.toLowerCase();



    switch (x.keyCode) {
        case 39: k = 'R'; break;
        case 37: k = 'L'; break;
        case 40: k = 'D'; break;
        case 38: k = 'U'; break;
        case 13: k = 'C'; break;
    }

    r = k == '?' && L.help()
        || k == 'R' && L.go_right(x.shiftKey)
        || k == 'r' && L.go_right(x.shiftKey)
        || k == 'L' && L.go_left(x.shiftKey)
        || k == 'l' && L.go_left(x.shiftKey)
        || k == 'D' && L.go_down(x.shiftKey)
        || k == 'd' && L.go_down(x.shiftKey)
        || k == 'U' && L.go_up(x.shiftKey)
        || k == 'u' && L.go_up(x.shiftKey)
        || k == 'C' && L.edit(x.shiftKey)
        || k == 'i' && L.change_show(x.shiftKey)
        || k == 'h' && L.tip()
        || k == 'a' && L.tip()
        || k == '1' && L.set_show(false, L.informations_cell)
        || k == '2' && L.set_show(false, L.informations_column)
        || k == '3' && L.set_show(false, L.informations_table)
        || k == '>' && L.sort(1)
        || k == '<' && L.sort(-1)
        || k == '.' && L.freeze()
        || k == 'f' && L.set_show(x.shiftKey, L.informations_column, 8)
        || k == 'n' && L.set_show(x.shiftKey, L.informations_column, 8, 'Nom')
        || k == 'p' && L.set_show(x.shiftKey, L.informations_column, 8, 'Prénom')
        || k == 'x' && L.hide()
        || k == 't' && L.print()
        || k == 's' && L.suivi()
        ;

    if (x.shiftKey)
        key_history += '_';
    key_history += k;

    if (r && x.keyCode !== undefined) {
        stop_event(x);
    }
    else {
        L.input.value = '';
        if (my_identity == 'thierry.excoffier')
            L.w('<small><small>' + k + ':' + x.keyCode + '</small></small>');
    }
}

function dispatch2(x) {
    if (x.keyCode == 39 || x.keyCode == 37 ||
        x.keyCode == 40 || x.keyCode == 38) {
        dispatch(x);
    }
}



function students_mails(missing) {
    var s = '', i, student, done = {};

    for (var i in filtered_lines) {
        line = filtered_lines[i];
        if (line[0].value !== '') {
            student = login_to_id(line[0].value);
            if (done[student])
                continue;
            done[student] = true;
            if (table_attr.mails[student]
                && table_attr.mails[student].indexOf('@') != -1)
                // s += table_attr.mails[line[0].value].replace(/'/g,"\\'") + ',' ;
                s += table_attr.mails[student] + ',';
            else
                if (missing)
                    missing.push(line[0].value);
        }

    }
    return s;
}

function authors_mails(missing, not_me) {
    var cls = column_list_all();
    var cols = [];
    for (var column in cls)
        cols.push(cls[column]);

    var a = {};
    for (var i in filtered_lines) {
        line = filtered_lines[i];
        for (data_col in cols) {
            cell = line[cols[data_col]];
            if (cell.author !== '' && cell.author != '*'
                && cell.author != '?' && cell.value !== '') {
                var student_id = login_to_id(cell.author);
                if (student_id != cell.author)
                    continue; // is a student
                if (login_to_line_id(student_id) !== undefined)
                    continue; // is a student in the table
                a[cell.author] = true;
            }
        }
    }
    if (add_masters_mails) {
        for (var i in table_attr.masters)
            a[table_attr.masters[i]] = true;
        for (var i in table_attr.teachers)
            a[table_attr.teachers[i]] = true;
    }
    if (not_me && a[my_identity])
        delete a[my_identity];
    var s = '';
    for (var i in a) {
        if (table_attr.mails[i] && table_attr.mails[i].indexOf('@') != -1)
            s += table_attr.mails[i] + ',';
        else
            if (missing)
                missing.push(i);
    }
    return s;
}

var mail_separator = '\n';
var add_masters_mails = false;

function mail_div_box(mails) {
    return '<textarea readonly="1" class="mails" onclick="this.select()">'
        + mails.replace(/,/g, mail_separator) + '</textarea>';
}

function mail_quick_link(mails, link) {
    return hidden_txt('<a href="javascript: window.location=\'mailto:?bcc=' +
        mails.replace(RegExp("'", "g"), "\\'")
        + '\'">' + link + ' ' + _("MSG_mail_quick_link") + '</a>',
        _("TIP_mail_quick_link"));
}

function mail_window() {
    var missing = [];
    var the_student_mails = students_mails(missing);
    var nr_student_mails = the_student_mails.split(',').length - 1;
    var the_author_mails = authors_mails(missing);
    var nr_author_mails = the_author_mails.split(',').length - 1;

    if (the_student_mails.search('@') == -1
        && the_author_mails.search('@') == -1) {
        Alert("ALERT_mail_none");
        return;
    }

    var link_students = nr_student_mails + ' ' + _("MSG_mail_students");
    if (mailto_url_usable(the_student_mails))
        link_students = mail_quick_link(the_student_mails, link_students);

    var link_authors = nr_author_mails + ' ' + _("MSG_mail_teachers");
    if (mailto_url_usable(the_author_mails))
        link_authors = mail_quick_link(the_author_mails, link_authors);

    var missing_text;
    if (missing.length) {
        missing_text = '<p class="unknown_mails">' + missing.length
            + ' ' + _("MSG_mail_unknow");
        if (missing.length > 20)
            missing_text += '.';
        else
            missing_text += ' : ' + missing;
        missing_text += '</p>';
    }
    else
        missing_text = '';

    create_popup('mails_div',
        _("TITLE_mail_popup"),
        _("MSG_mail_popup") + '<table class="colored"><tr>' +
        '<th>' + link_students +
        '<th>' + link_authors +
        '</tr><tr><td>' +
        mail_div_box(the_student_mails) +
        '</td><td>' +
        mail_div_box(the_author_mails) +
        '</td></tr></table>' + missing_text
        ,
        _("MSG_mail_massmail"));
}

function archive_receivers() {
    var missing = [];
    add_masters_mails = true;
    return authors_mails(missing, true);
}

function personal_mailing() {
    add_ticket_checker(the_body);

    var the_author_mails = archive_receivers();

    var nb = 0;
    for (var i in filtered_lines)
        if (filtered_lines[i][0].value)
            nb++;

    var subject = localStorage['personal_mailing.subject.' + ue]
        || (ue + ' ' + table_attr.table_title + _("MSG_mail_massmail_subject"));
    var message = localStorage['personal_mailing.message.' + ue]
        || _("MSG_mail_massmail_message");

    var addresses = [' ' + _('MSG_mail_students') + ' '];
    for (var data_col in columns) {
        var contain_mails = columns[data_col].contain_mails(true);
        if (contain_mails) {
            if ( contain_mails.length == 0)
                addresses.push(columns[data_col].title);
            else
                addresses.push(columns[data_col].title + ' ⚠️' + contain_mails[0]);
        }
    }
    var buttons;
    if (addresses.length == 1)
        buttons = '';
    else {
        buttons = _('TO:') + ' <select id="mail_to">';
        for (var i in addresses)
            buttons += ' <option>' + html(addresses[i]) + '</option>';
        buttons += "</select> " + _("CC:")
            + ' <select id="mail_cc"><option></option>';
        for (var i in addresses)
            buttons += ' <option>' + html(addresses[i]) + '</option>';
        buttons += "</select><br>";
    }
    buttons += '<label><input id="noreply" type="checkbox"><b>noreply.</b>'
        + (table_attr.mails[my_identity] || (my_identity + '@...'))
        + '</label><br>'
        + '<label><input id="mail_archive" type="checkbox" onclick="document.getElementById(\'mail_archive_receiver\').disabled = !this.checked">'
        + _("MSG_mail_massmail_archive") + '</label>'
        + '<input disabled="disabled" id="mail_archive_receiver" '
        + 'style="width:100%" value="'
        + encode_value(the_author_mails) + '"><br>';
    personal_mailing.filtered_lines = filtered_lines;
    create_popup('personal_mailing_div',
        _("MSG_mail_massmail_title"),
        _("MSG_mail_massmail_text")
        + '<input id="personal_mailing" style="width:100%" value="'
        + encode_value(subject) + '"><br>'
        + _("MSG_mail_massmail_your_message"),
        buttons
        + _("MSG_mail_massmail_to_send") + nb
        + _("MSG_mail_massmail_to_send_2")
        ,
        message
    );
}

function get_mail_data_col(id) {
    id = document.getElementById(id);
    if (!id)
        return 0;
    if (id.value === '')
        return -1;
    if (id.value === ' ' + _('MSG_mail_students') + ' ')
        return 0;
    return data_col_from_col_title(id.value.split(' ')[0]);
}

function personal_mailing_do() {
    var mailing_mail = popup_value(true);
    var message = mailing_mail.join('\n');
    var subject = document.getElementById('personal_mailing').value;
    localStorage['personal_mailing.subject.' + ue] = subject;
    localStorage['personal_mailing.message.' + ue] = message;
    var data_cols = [];
    var t, col_name, line, data_col;
    var what, last_char, value, yet_in;

    nr = 0;
    var unknown_titles = [];

    // Compute used data_cols
    var t = (subject + message).split('[');
    for (var i in t) {
        if (i == 0)
            continue;
        col_name = t[i].split(']')[0];
        data_col = column_title_to_data_col(col_name);
        if (data_col == undefined) {
            unknown_titles.push(col_name);
            continue;
        }
        last_char = t[i - 1].substr(t[i - 1].length - 1);
        if (last_char.match(/[#?@]/))
            what = last_char;
        else
            what = '';
        yet_in = false;
        for (var j in data_cols)
            if (data_cols[j].data_col == data_col
                && data_cols[j].what == what) {
                yet_in = true;
                break;
            }
        if (!yet_in) {
            v = { data_col: data_col, what: what, title: col_name };
            if (what === '')
                data_cols.push(v);
            else
                data_cols.splice(0, 0, v);
        }
    }
    if (unknown_titles.length != 0)
        if (!confirm(_("ALERT_mail_unknown_column") + unknown_titles.join(', ')))
            return;

    if(!allow_to_send_this_mail(subject, message))
        return;

    // Compute recipients and their data
    var students = [];
    var cc = [];
    var data_col_to = get_mail_data_col("mail_to");
    var data_col_cc = get_mail_data_col("mail_cc");
    if (data_col_cc == data_col_to)
        data_col_cc = -1;
    if (filtered_lines !== personal_mailing.filtered_lines
        && !confirm(_("ALERT_filter_change"))) {
        popup_close();
        return;
    }
    for (var i in filtered_lines) {
        line = filtered_lines[i];
        if (line[0].value) {
            var v = line[data_col_to].value.toString().replace("mailto:", "");
            for (data_col in data_cols) {
                t = data_cols[data_col];
                switch (t.what) {
                    case '':
                        value = (line[t.data_col].value === ''
                            ? columns[t.data_col].empty_is
                            : line[t.data_col].value);
                        break;
                    case '@': value = line[t.data_col].author; break;
                    case '?': value = date(line[t.data_col].date); break;
                    case '#': value = line[t.data_col].comment; break;
                    // case ':' : value = line[t.data_col].history ; break ;
                }
                v += '\002' + value;
            }
            students.push(v);
            if (data_col_cc >= 0)
                cc.push(line[data_col_cc].value.toString().replace("mailto:", ""));
        }
    }
    v = [];
    for (var i in data_cols)
        v.push(data_cols[i].what + '[' + data_cols[i].title + ']');
    var d = {
        'subject': subject,
        'message': message,
        'recipients': students.join("\001"),
        'titles': v.join("\001"),
        'filters': the_filters(),
        'noreply': document.getElementById('noreply').checked ? '1' : ''
    };
    var mail_archive = document.getElementById('mail_archive');
    if (mail_archive && mail_archive.checked)
        d['archive'] = document.getElementById('mail_archive_receiver').value
            .replace(/[ ,;]*$/, '').replace(/[ ,;]+/g, "\001");
    if (data_col_cc >= 0)
        d["cc"] = cc.join("\001");
    do_post_data(d, add_ticket('send_mail'));
    popup_close();
}







function set_test_note(v, column, xattr) {
    column.min = 0;
    column.max = 20;

    if (v === '')   // Should never be here except for old tables
        v = '[0;20]';

    var value = v.replace(/;/g, ' ').replace(/\[/g, ' ').replace(/]/g, ' ').replace(/^ */, '').replace(/ *$/, '').split(/  */);

    if (value.length != 2) {
        alert_append(_("ALERT_columnminmax_syntax")
            + column.title + '(' + column.type + ')"'
        );
        return column.minmax;
    }

    if (a_float(value[0]) >= a_float(value[value.length - 1])) {
        alert_append(_("ALERT_columnminmax_order") + column.title);
        return column.minmax;
    }

    column.need_update = true;
    column.min = a_float(value[0]);
    if (isNaN(column.min))
        column.min = 0;

    column.max = a_float(value[1]);
    if (isNaN(column.max)) {
        compute_column_stat(column);
        column.max = column.computed_max;
    }
    value = '[' + column.min + ';' + column.max + ']';

    if (xattr === false
        && column.type == 'Nmbr'
        && column.max < column.average_columns.length
        && column.rounding == 1
    ) {
        column_attr_set(column, 'rounding', rounding_default);
        the_current_cell.update_headers();
        the_current_cell.do_update_column_headers = true;
    }
    column.need_update = true;

    return value;
}


function table_modifiable_toggle(value) {
    var e = document.getElementById('tablemodifiableFB');
    if (!e)
        return 0;
    if (value == 1)
        e.style.display = 'none';
    else if (value == 0)
        e.style.display = 'inline';

    return Number(value);
}





function toggle_multiline(the_id) {
    var td = the_td(document.getElementById(the_id));
    column_attr_set(the_current_cell.column,
        'multiline',
        the_current_cell.column.multiline ? 0 : 1,
        td,
        true // Force save
    );
    table_fill(false, true);
    the_current_cell.do_update_column_headers = true;
}





function update_column_menu() {
    update_a_menu(2, table_attr.nr_columns,
        add_empty_columns() - (tr_classname !== undefined),
        columns.length,
        document.getElementById('t_table_attr_nr_columns'));
}

function nr_columns_change(t) {
    change_table_size(t);
    update_column_menu();
    change_option('nr_cols', table_attr.nr_columns);
}


function update_line_menu() {
    var nr;

    if (filtered_lines)
        nr = filtered_lines.length;
    else
        nr = lines.length;

    update_a_menu(2, table_attr.nr_lines, nr, Math.max(nr * 1.5,
        table_attr.nr_lines * 1.1),
        document.getElementById('t_table_attr_nr_lines'));
}

function nr_lines_change(t) {
    change_table_size(t);
    update_line_menu();
    change_option('nr_lines', table_attr.nr_lines);
}






var free_print_headers;
var textual_table = '';

function printable_display_page(lines, title, page_break) {

    var v, i, cell, line_id, tt = [], nr_lines;
    var sorted = [];
    for (var c in columns)
        sorted.push(c);
    sorted.sort(function (a, b) { return columns[a].position - columns[b].position; });

    for (var i = 0; ; i++) {
        var input = document.getElementById('free' + i);
        if (!input)
            break;
        if (input.value)
            sorted.push([input.value, i]);
    }

    var s = [];
    var html_class = 'colored', th_class;
    var is_uniform = uniform == _("B_print_yes");

    if (is_uniform)
        html_class += ' tdnowrap';

    if (page_break)
        th_class = ' style="page-break-before:always;"';
    else
        th_class = '';

    s.push('<h2' + th_class + '>' + year + ' ' + semester + ' ' + ue
        + ': ' + table_title + ' ' + title + '</h2>');

    nr_lines = 0;
    tt = [];
    for (var line_id in lines) {
        cell = lines[line_id][columns.length];
        if (cell)
            tt.push(lines[line_id][0].value + ' '
                + lines[line_id][1].value + ' '
                + lines[line_id][2].value + '<ul>'
                + cell + '</ul>');
        nr_lines++;
    }
    if (print_header == _("B_print_header")) {
        if (tt.length)
            v = ' ' + _("MSG_print_nr_tt_before") + ' <b>' + tt.length + ' '
                + _("MSG_print_nr_tt_after") + '</b>';
        else
            v = _("B_print_no_tt");
        s.push(
            '<table width="100%" style="white-space: pre ;">'
            + '<tr style="vertical-align:top;"><td>'
            + '<p>' + _("MSG_print_date")
            + "<p>" + _("MSG_print_supervisors")
            + "<p>" + _("MSG_print_room")
            + "</td>"
            + '<td><p>' + _("MSG_print_nr_present")
            + "<p>" + _("MSG_print_nr_signature")
            + "<p>" + _("MSG_print_nr_paper")
            + "</td></tr></table>"
            + "<p>" + _("MSG_print_nr_students")
            + " <b>" + nr_lines + "</b>" + v
        );
    }
    if (tierstemps != _("B_print_only")) {
        var t = [], txt_line;
        s.push('<table id="table_to_print" class="' + html_class + '"><thead>');
        for (var header in headers_to_display) {
            if (!headers_to_display[header])
                continue;
            s.push('<tr><td class="hidden_on_paper smaller" onclick="button_toggle('
                + 'headers_to_display,\'' + header
                + '\',document.getElementById(\'headers_to_display_'
                + header + '\'));'
                + 'do_printable_display=true;">'
                + header
                + '</td>');
            txt_line = [];
            for (var c in sorted) {
                if (c != 0 && c <= 2 && picture != _("B_no_picture"))
                    continue;
                c = sorted[c];
                if (isNaN(c)) {
                    if (header == 'title') {
                        s.push('<th onclick="do_printable_display=true;'
                            + 'document.getElementById(\'free'
                            + c[1] + '\').value = \'\'">'
                            + html(c[0])
                            + '</th>');
                        txt_line.push(c[0]);
                    }
                    else {
                        txt_line.push('');
                        s.push('<th>&nbsp;</th>');
                    }
                    continue;
                }
                if (!columns_to_display[c])
                    continue;

                v = columns[c][header];
                txt_line.push(v);
                th_class = find_col_class(columns[c]);
                if (v.length > 30)
                    th_class += ' smaller';
                else if (v.length > 10)
                    th_class += ' smaller';

                if (!column_modifiable_attr(header, columns[c]))
                    v = '';

                if (v === '')
                    v = '&nbsp;';

                s.push('<th onclick="button_toggle(columns_to_display,'
                    + c + ',document.getElementById(\'columns_to_display\').getElementsByTagName(\'SPAN\')['
                    + columns[c].ordered_index + ']);do_printable_display=true" class="'
                    + th_class + '">'
                    + v + '</th>');
            }
            s.push('</tr>');
            t.push(txt_line.join('\t'));
        }
        s.push('</thead><tbody>');
        i = 1;
        for (var line_id in lines) {
            line = lines[line_id];
            if (tr_classname === undefined)
                html_class = '';
            else
                html_class = line[tr_classname].value;
            if (i % preferences.zebra_step === 1)
                html_class += ' separator';
            s.push('<tr class="' + html_class + '"><td class="hidden_on_paper" onclick="delete lines[\'' + line_id + '\'];do_printable_display=true;">'
                + i + '</td>');
            i++;
            txt_line = [];
            var firstname = _("COL_TITLE_firstname");
            for (var ic in sorted) {
                var c = sorted[ic];
                if (isNaN(c)) {
                    txt_line.push('');
                    s.push('<td>&nbsp;</td>');
                    continue;
                }
                if (!columns_to_display[c])
                    continue;
                cell = line[c];
                html_class = '';
                if (cell.value.toFixed) {
                    html_class += ' number';
                    v = columns[c].do_rounding(cell.value);
                    if (separator == _("B_print_comma"))
                        v = v.replace('.', ',');
                }
                else {
                    v = cell.value;
                    if (columns[c].title == firstname)
                        v = title_case(v);
                    v = html(encode_lf_tab(v));
                    if (!is_uniform)
                        v = v.replace(/⏎/g, "<br>");
                }
                if (v === '') {
                    v = html(columns[c].empty_is);
                    html_class += ' default';
                }
                txt_line.push(v);
                if (v === '')
                    v = '&nbsp;';
                html_class += ' ' + cell_class(columns[c], line, cell);
                if (columns[c].type == 'URL' && columns[c].urlimg & 1) {
                    v = '<img class="urlimg" onerror="this.style.display=\'none\'"  src="'
                        + encode_value(columns[c].url_base + v) + '">';
                    html_class += ' urlimg';
                }
                if (picture != _("B_no_picture"))
                    switch (ic) {
                        case '0':
                            var snc = sorted[Number(ic) + 1];
                            var sn = line[snc].value;
                            if (columns[snc].title == firstname)
                                sn = title_case(sn);
                            var fnc = sorted[Number(ic) + 2];
                            var fn = line[fnc].value;
                            if (columns[fnc].title == firstname)
                                fn = title_case(fn);
                            v = '<table class="print"><td><IMG SRC="' + student_picture_url(line[0].value)
                                + '"><td>' + v + '<br>'
                                + html(sn) + '<br>' + html(fn) + '</table>';
                            html_class += ' nowrap';
                            break;
                        case '1':
                        case '2':
                            continue;
                    }
                s.push('<td class="' + html_class + '">' + v + '</td>');
            }
            t.push(txt_line.join('\t').replace(/<br>/g, '⏎'));
            s.push('</tr>');
        }
        s.push('</table>');
        textual_table = t.join('\n');
    }
    if (tierstemps != _("B_print_no") && tt.length)
        s.push('<h2 style="page-break-before:always;">' + _("MSG_print_tt_title")
            + '</h2>' + tt.join('\n'));

    return s.join('\n');
}

function printable_display() {
    if (!do_printable_display)
        return;
    do_printable_display = false;

    var groups = compute_groups_values(grouped_by);
    var x, selected_lines, title;

    if (groups.length == 1)
        x = printable_display_page(lines, '', false);
    else {
        var get_key = compute_groups_key_function(grouped_by);
        var grouped_by_sorted = compute_grouped_by_sorted(grouped_by);
        var t = [];
        for (var group in groups) {
            group = groups[group];
            title = [];
            for (var g in grouped_by_sorted)
                title.push(columns[grouped_by_sorted[g]].title
                    + '=' + group.split('\001')[g]);
            title = html(' ' + title.join(', '));
            selected_lines = {};
            for (var j in lines)
                if (get_key(lines[j]) == group)
                    selected_lines[j] = lines[j];
            t.push(printable_display_page(selected_lines,
                title,
                t.length != 0));
        }
        x = t.join('\n');
    }

    document.getElementById('content').innerHTML = x;
}

function display_button(data_col, title, selected, table_name, tip, not_escape,
    html_class) {
    if (selected)
        selected = 'toggled';
    else
        selected = '';
    if (!html_class)
        html_class = '';
    if (!not_escape)
        title = html(title);
    if (tip)
        title = hidden_txt(title, tip);
    return '<span class="clickable button_toggle ' + selected + ' ' + html_class
        + '" onclick="button_toggle(' + table_name + ','
        + data_col + ',this);do_printable_display=true;"'
        + ' id="' + table_name + '_'
        + data_col.replace(/\'/g, '') + '">'
        + title + '</span>' + '<script>'
        + table_name + '[' + data_col + '] =' + !!selected + ';</script>';
}

function first_line_of_tip(attr) {
    var tip_name = 'TIP_column_attr_' + attr;
    var tip = _(tip_name);
    if (tip == tip_name)
        tip = _(tip_name + '__'); // Generic comment on the attribute
    return tip;
}

function print_add_free_column() {
    var i = free_print_headers.length - 1;
    var o = document.getElementById('free' + i);
    var e = document.createElement("INPUT");
    o.parentNode.insertBefore(e, o.nextSibling);
    e.id = 'free' + (i + 1);
    e.style.width = "5em";
    e.onkeyup = function () { do_printable_display = true; };
    e.value = "--" + i + "--";
    free_print_headers.push(e.value);
    do_printable_display = true;
}

function hide_columns() {
    for (var data_col in columns_to_display) {
        if ((data_col < 3) != columns_to_display[data_col])
            button_toggle(columns_to_display, data_col,
                document.getElementById('columns_to_display_' + data_col)
            );
    }
}

function do_emargement() {
    for (var i in free_print_headers)
        document.getElementById('free' + i).value = free_print_headers[i];
    hide_columns();
    for (var header in headers_to_display) {
        if ((header == 'title') != headers_to_display[header])
            button_toggle(headers_to_display, header,
                document.getElementById('headers_to_display_' + header)
            );
    }
    set_radio('print_header', 'B_print_header');
}

function do_page_per_group() {
    for (var data_col in grouped_by) {
        if ((data_col == 3 || data_col == 4) != grouped_by[data_col])
            button_toggle(grouped_by, data_col,
                document.getElementById('grouped_by_' + data_col)
            );
    }
    do_printable_display = true;
}

function print_choice_line(p, title, title_tip, choices, the_id) {
    if (the_id)
        the_id = ' id="' + the_id + '"';
    else
        the_id = '';
    p.push('<tr><td class="nowrap">' + hidden_txt(title, title_tip)
        + '</td><td class="toggles"' + the_id + '>'
        + choices + '</td></tr>');
}

function popup_export_window() {
    create_popup('textual_table', _("MSG_print_popup_title"),
        _("MSG_print_popup_content"),
        '');
    popup_set_value(textual_table);
}

function load_xls() {
    window_open(add_ticket(year + '/' + semester + '/' + ue
        + '/export_xls/' + sort_columns_txt + '/'
        + (uniform != _("B_print_yes") ? 'wrap/' : '')
        + year + '_' + semester + '_' + ue + '.xlsx'));
}

function print_selection(_event, emargement, replace) {
    free_print_headers = [_("MSG_print_present"), _("MSG_print_given")];
    var p = [printable_introduction()];
    p.push('<style>' + document.getElementById('template_style').textContent
        + 'TABLE.print IMG { height: 3.6em ; }'
        + 'TABLE.print TD { border: 0px ; }'
        + 'TABLE.print { border-spacing: 0px ; }'
        + '</style>');
    p.push('<script>');
    p.push('var do_printable_display = true ;');
    p.push('var columns_to_display = {};');
    p.push('var headers_to_display = {};');
    p.push('var grouped_by = {};');
    p.push('var sort_columns_txt = "' + sort_columns_list().join(',') + '";');
    p.push('var tr_classname = "' + tr_classname + '";');
    p.push('var popup_on_red_line = ' + popup_on_red_line + ';');
    p.push('var ue = ' + js(ue) + ';');
    var t = [];
    for (var i in free_print_headers)
        t.push(js(free_print_headers[i]));
    p.push('var free_print_headers = [' + t.join(',') + '];');

    p.push('var table_title = ' + js(table_attr["table_title"]) + ';');
    p.push('var columns = ' + columns_in_javascript() + ';');
    p.push('var tr_classname = ' + tr_classname + ';');

    // Move competence catalog into print page
    try {
        let x = student_catalog.get_json();
        p.push('var competenceTable = new CompetenceTable();');
        p.push('var student_catalog = new Catalog();');
        p.push('student_catalog.parse_dict(' + x + ');');
        p.push('competenceTable.catalog = student_catalog;');
        p.push('competenceTable.table_verify();');
        p.push('competenceTable.catalog.complete_with_refine(table_attr.p_competence.refine, ue);');
    } catch(e) {}

    p.push('var lines ;');
    p.push(cell_class.toString());
    p.push('function initialize() {');
    p.push('if ( ! wait_scripts("initialize()") ) return ;');
    var lines_js = lines_in_javascript();
    p.push('lines = ' + lines_js + ';');
    if (emargement)
        p.push('do_emargement();');
    p.push('for(var i in lines) lines[i].line_id = i ;');
    p.push('initialise_columns() ;');
    p.push('lib_init();');
    p.push('setInterval("printable_display()", 200);');
    p.push('}');
    p.push('</script>');
    p.push('<p class="hidden_on_paper"><a href="javascript:do_emargement()">'
        + _("MSG_print_do_attendance_sheet") + '</a>');
    p.push('<p class="hidden_on_paper"><a href="javascript:do_page_per_group()">'
        + _("MSG_print_do_one_sheet_per_group") + '</a>');
    p.push('<p class="hidden_on_paper"><A href="javascript:popup_export_window()">'
        + _("MSG_print_do_spreadsheet_export") + '</a> (<a href="javascript:load_xls()">XLS</a>)');
    p.push('<p class="hidden_on_paper">' + _("MSG_print_hide_title"));
    p.push('<table class="hidden_on_paper print_options">');
    print_choice_line(p, _("MSG_print_display_tt"),
        _("TIP_print_display_tt"),
        radio_buttons('tierstemps',
            [_("B_print_yes"),
            _("B_print_no"),
            _("B_print_only")],
            _("B_print_no"))
    );
    print_choice_line(p, _("MSG_print_display_separator"),
        _("TIP_print_display_separator"),
        radio_buttons('separator',
            [_("B_print_comma"),
            _("B_print_dot")],
            _("B_print_comma")));
    print_choice_line(p, _("MSG_print_display_line"),
        _("TIP_print_display_line"),
        radio_buttons('uniform', [_("B_print_yes"),
        _("B_print_no")],
            lines_js.indexOf('\\n') == -1
                ? _("B_print_yes") : _("B_print_no")));

    var t = [], cols = column_list_all();
    for (var data_col in cols) {
        data_col = cols[data_col].toString();
        if (!columns[data_col].is_empty)
            t.push(display_button(data_col, columns[data_col].title,
                !columns[data_col].hidden,
                'columns_to_display',
                html(columns[data_col].comment)));
    }
    print_choice_line(p, _("MSG_print_display_columns"),
        _("TIP_print_display_columns"),
        '<a onclick="hide_columns()">×</a> ' + t.join(' '),
        'columns_to_display');

    t = [];
    for (var data_col in cols) {
        data_col = cols[data_col].toString();
        if (!columns[data_col].is_empty)
            t.push(display_button(data_col, columns[data_col].title,
                false,
                'grouped_by',
                html(columns[data_col].comment)));
    }
    print_choice_line(p, _("MSG_print_display_paging"),
        _("TIP_print_display_paging"),
        t.join(' '),
        'grouped_by');

    t = [];
    t.push(hidden_txt('<a onclick="print_add_free_column()">+</a>',
        _("TIP_print_add_column")));
    for (var i in free_print_headers)
        t.push(hidden_txt('<input id="free' + i + '" style="width:15em" onkeyup="do_printable_display=true;">', _("TIP_print_column_name")));
    print_choice_line(p, _("MSG_print_display_add_columns"),
        _("TIP_print_display_add_columns"),
        '<small>' + t.join(' '),
        'columns_to_display');


    var attrs = ['title', 'type', 'red', 'green', 'weight', 'minmax', 'empty_is',
        'comment', 'columns', 'enumeration', 'test_filter',
        'visibility_date', 'rounding', 'repetition', 'groupcolumn',
        'course_dates'];

    t = [];
    for (var attr in attrs) {
        attr = attrs[attr];
        t.push(display_button("'" + attr + "'", _('B_print_attr_' + attr),
            attr == 'title', 'headers_to_display',
            first_line_of_tip(attr)));
    }
    print_choice_line(p, _("MSG_print_display_headers"),
        _("TIP_print_display_headers"),
        t.join(' '),
        'headers_to_display');
    print_choice_line(p, _("MSG_print_header"),
        _("TIP_print_header"),
        radio_buttons('print_header',
            [_("B_print_no_header"),
            _("B_print_header")
            ],
            _("B_print_no_header")));
    print_choice_line(p, _("MSG_print_picture"),
        _("TIP_print_picture"),
        radio_buttons('picture',
            [_("B_no_picture"),
            _("B_picture")
            ],
            _("B_no_picture")));

    p.push('</table>');
    p.push('<div style="clear:both" id="content"></div>');
    p.push('</div>');
    p.push('<script>');
    p.push('setTimeout(initialize, 200) ;'); // Timeout for IE
    p.push('</script>');

    var w = window_open(url + '/files/' + version + '/ok.png', replace);
    w.document.open('text/html');
    w.document.write(html_begin_head() + p.join('\n'));
    w.document.close();
    return w;
}





function set_red(value, column) {
    if (value === undefined || value === '') {
        column.red_filter = returns_false;
        value = '';
    }
    else {
        if (value === 'NaN') {
            var stats = compute_histogram(column.data_col);
            value = '<' + (stats.average() - stats.standard_deviation());
        }
        else if (!isNaN(value))
            value = '<' + value;
        column.red_filter = compile_filter_generic(value, column, true);
    }
    column_update_option('red', value);
    return value;
}


function set_redtext(value, column) {
    if (value === undefined || value === '') {
        column.redtext_filter = returns_false;
        value = '';
    }
    else {
        if (value === 'NaN') {
            var stats = compute_histogram(column.data_col);
            value = '<' + (stats.average() - stats.standard_deviation() / 2);
        }
        else if (!isNaN(value))
            value = '<' + value;
        column.redtext_filter = compile_filter_generic(value, column, true);
    }
    column_update_option('redtext', value);
    return value;
}


function remove_history() {
    let popup_div = document.createElement('div');
    popup_div.id = 'remove_history';
    popup_div.style.width = '100%';
    popup_div.style.height = '25em';
    popup_div.style.fontSize = '1.1em';
    popup_div.innerHTML = get_remove_history_content();
    create_popup('import_div', '', popup_div.outerHTML, '', false);
    load_values();
}

function get_remove_history_content() {
    let content = '<h1 style="font-size:1.4em;">' + _("MSG_remove_history") + '</h1><br>';
    if (!table_attr.masters.includes(my_identity))
        content += _("MSG_extension_not_master");
    else if (!table_attr.modifiable)
        content += _("TIP_table_attr_modifiable");
    else
        content += get_popup_content();
    return content;
}

function get_popup_content() {
    return get_open_pages() + _('MSG_remove_history_nr_input') + '<br>'
        + '<label><input type="radio" name="remove_too_many" value="0"/>'
        + _('MSG_remove_history_nr_0') + '</label><br>'
        + '<label><input type="radio" name="remove_too_many" value="1"/>'
        + _('MSG_remove_history_nr_1') + '</label><br>'
        + '<label><input type="radio" name="remove_too_many" value="2"/>'
        + _('MSG_remove_history_nr_2') + '</label><br>'
        + '<label><input type="radio" name="remove_too_many" value="3"/>'
        + _('MSG_remove_history_nr_3') + '</label><br>'
        + '<label><input type="radio" name="remove_too_many" value="10"/>'
        + _('MSG_remove_history_nr_10') + '</label><br>'
        + '<label><input type="radio" name="remove_too_many" value="100"/>'
        + _('MSG_remove_history_nr_100') + '</label><br><br>'
        + '<label>' + _('MSG_remove_history_date_input').replace('%s',
        '<input id="remove_before_date" type="number" min="0" max="99999"/>')
        + '</label><br><br>'
        + _('MSG_remove_history_auto_input')
        + '<label><input type="radio" name="remove_auto" value="1"/>Oui</label>'
        + '<label><input type="radio" name="remove_auto" value="0"/>Non</label>'
        + '</label><br><br>'
        + '<p><a href="javascript:get_args_and_remove_history()">'
        + _('MSG_remove_history_confirm')
        + '</a></p><p style="font-size:0.9em;color:grey">'
        + _('MSG_remove_history_warning') + '</p>';
}

function get_open_pages() {
    let req = new XMLHttpRequest();
    let res = '';
    req.open("GET", add_ticket(year + '/' + semester + '/' + ue + '/open_pages/' + millisec()), false);
    req.send();
    let pages = [];
    for (let page of JSON.parse(req.responseText))
        pages.push('<li>' + page[0] + _("MSG_remove_history_pages_date")
            + get_date_tomuss(page[1]).formate('%d/%m/%Y %H:%M') + '</li>');
    if (pages.length > 1)
        res = _('MSG_open_pages').replace('%s',
                '<ul>' + pages.join('') + '</ul><br>'
            ) + _('MSG_remove_history_open') + '<br>';
    return res;
}

function load_values() {
    let dict = JSON.parse(table_attr.remove_history)
    document.getElementsByName('remove_too_many').forEach(elt => {
        if (elt.value == dict.too_many) elt.checked = true});
    document.getElementsByName('remove_auto').forEach(elt => {
        if (elt.value == dict.auto) elt.checked = true});
    document.getElementById('remove_before_date').value = Math.round(dict.before_date);
}

function get_args_and_remove_history() {
    let old_dict = JSON.parse(table_attr.remove_history);
    let dict = {};
    dict.too_many = parseInt(document.querySelector('input[name="remove_too_many"]:checked').value);
    dict.auto = parseInt(document.querySelector('input[name="remove_auto"]:checked').value);
    let days = document.getElementById('remove_before_date').value;
    if (days != '')
        dict.before_date = parseFloat(days);
    else
        dict.before_date = 9999.0;
    if (JSON.stringify(dict) === JSON.stringify(old_dict))
        dict.before_date += 0.00001; // To run the attribute setter even if values are the same as before
    table_attr_set('remove_history', JSON.stringify(dict));
    document.getElementById('remove_history').innerHTML = _("MSG_remove_history_done");
}

function set_repetition(value, column)
{
  column.real_repetition = Math.floor(Number(value)) ;
  if ( isNaN(column.real_repetition) )
    column.real_repetition = 0 ;

  return column.real_repetition ;
}





function column_speak(select)
{
  var action = select.selectedIndex ;
  var a = document.getElementsByTagName("AUDIO") ;
  if ( a.length )
    {
    a[0].parentNode.removeChild(a[0]) ;
    if ( action == 0 )
        return ;
    }
  a = document.createElement("AUDIO") ;
  var t = year + '/' + semester + '/' + ue + '/column_speak/'
          + the_current_cell.column.data_col + '/' + action ;
  for(var line in filtered_lines)
     t += '/' + filtered_lines[line][0].value ;
  a.controls = true ;
  a.autoplay = true ;
  a.onended = function() { a.parentNode.removeChild(a) ; } ;
  a.innerHTML = '<source src="'
              + add_ticket(t)
              + '" type="audio/x-wav"/>' ;
  the_body.appendChild(a) ;
}


var stat_svg_height = 35;
var stat_svg_width = 120;

// all_values is a table of table of pairs(value, nr)
// There is a line per table
function a_graph(all_values, zoom) {
    var s, all, rgb, values, max;

    if (zoom === undefined)
        zoom = 1;

    var width = stat_svg_width * zoom;
    var height = stat_svg_height * zoom;
    var lw = Math.pow(zoom, 0.5);
    var c;
    function X(c) { return (width * (Number(c) + 0.5) / values.length).toFixed(1); };
    function Y(c) { return (height * (1 - c)).toFixed(1); };

    all = [];
    for (var i in all_values) {
        if (zoom == 1)
            rgb = hls2rgb(i / all_values.length, 0.3, 1);
        else
            rgb = '#000';
        s = '<path d="M ';
        values = all_values[i];
        for (c in values)
            if (!isNaN(values[c][0]))
                s += X(c) + ' ' + Y(values[c][0]) + ' L ';
        all.push(s.replace(/ L $/, '') + '" style="stroke-width:' + lw
            + ';fill:none;stroke:' + rgb + '"/>\n');

        s = '<path d="M ';
        max = 0;
        for (c in values)
            if (values[c][1] > max)
                max = values[c][1];
        for (c in values)
            if (!isNaN(values[c][1]))
                s += X(c) + ' ' + Y(values[c][1] / max) + ' L ';
        all.push(s.replace(/ L $/, '') + '" style="stroke-width:' + lw +
            ';fill:none; stroke-dasharray: ' + 2 * zoom + ',' + zoom
            + ';stroke:' + rgb + '"/>\n');
    }

    if (zoom != 1) {
        c = 0.1;
        all.push('<text transform="rotate(-90),translate(' + (-height)
            + ')" style="font-size:70%">');
        for (var column in sorted_cols) {
            if (!columns[sorted_cols[column]])
                continue; // TOTAL
            all.push('<tspan x="0" y="' + X(c) + '">'
                + html(columns[sorted_cols[column]].title) + '</tspan>');
            c += 1;
        }
        all.push('</text>');
        all.push('<path style="stroke:#F00" d="M ' + X(0) + ' ' + 3 * height / 4
            + ' L ' + width + ' ' + 3 * height / 4 + '"/>');
        all.push('<path style="stroke:#888" d="M ' + X(0) + ' ' + height / 2
            + ' L ' + width + ' ' + height / 2 + '"/>');
        all.push('<path style="stroke:#0F0" d="M ' + X(0) + ' ' + height / 4
            + ' L ' + width + ' ' + height / 4 + '"/>');
        all.push('<text style="font-size:70%">');
        all.push('<tspan x="0" y="' + Y(0.25) + '">5</tspan>');
        all.push('<tspan x="0" y="' + Y(0.5) + '">10</tspan>');
        all.push('<tspan x="0" y="' + Y(0.75) + '">15</tspan>');
        all.push('<tspan x="0" y="' + Y(0) + '">0</tspan>');
        all.push('</text>');
    }

    svg = '<div class="s_graph"><object type="image/svg+xml;charset=utf-8" height="'
        + height + 'px" width="' + width + 'px" data="data:text/xml;charset=utf-8,' +
        base64('<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
            '<svg xmlns="http://www.w3.org/2000/svg" style="background:white">' +
            '<g>' + all.join('\n') + '</g>' + '</svg>')
        + '"></object><div>';

    return svg;
}

var stat_current_zoom;
var stat_current_zoom_t;

function stat_tip_window(t, x) {
    if (stat_current_zoom_t) {
        if (stat_current_zoom_t.parentNode)
            stat_current_zoom_t.parentNode.style.background = '';
        else {
            // The object was destroyed by a content change
            stat_current_zoom = undefined;
        }
    }
    if (stat_current_zoom == x) {
        stat_current_zoom = undefined;
        // Not display='none' : bad first positionning because the width
        // is not computed.
        TIP.reset_tip();
        return;
    }
    stat_current_zoom_t = t;
    stat_current_zoom = x;
    t.parentNode.style.background = '#FF6';
}

function stat_flower_zoom(t, column) {
    stat_tip_window(t, column);
    if (!TIP.tip)
        return;
    var html = stat_zoom_header(column) + '<br>'
        + _("MSG_stat_flower_horizontal") + '<br>'
        + _("MSG_stat_flower_vertical") + '</div>'
        + stat_display_flower(stats_groups, all_stats, column, 12);
    TIP.show_tip(html, t, true);
}

function stat_display_one_flower(s, v, p, x, y, stat, group, zoom, hide_histo) {
    if (stat === undefined)
        return '';
    var o, t;
    var r = Math.log(stat.nr + 1) / 2 * zoom;
    if (zoom > 2)
        o = 0.2;
    else
        o = 1;
    v.push('<circle style="fill:#000;opacity:' + o + '" cx="'
        + x + '" cy="' + y + '" r="' + r + '"/>');
    if (zoom > 2) {
        t = group.replace(/\001/g, ' ').split('\n');
        if (group.length / t.length > 30)
            fs = 8;
        else if (group.length / t.length > 20)
            fs = 10;
        else if (group.length / t.length > 10)
            fs = 12;
        else
            fs = 14;
        s.push('<text style="fill:#000;font-size:' + fs
            + 'px;text-anchor:middle;dominant-baseline:middle" x="' + x
            + '" y="' + y + '">');
        for (var i in t)
            s.push('<tspan x="' + x + '" dy="' + (i == 0 ? -fs * (t.length - 1.5) : (fs + 1)) + 'px"'
                + '>' + html(t[i]) + '</tspan>');
        s.push('</text>');
        if (!hide_histo) {
            x = Number(x);
            y = Number(y);
            var rh = 20 * r / stat.nr;
            var sw = (r / 3.14).toFixed(2);
            for (var i in stat.histogram) {
                a = i * 3.14 / 10 + 3.14 / 2;
                p.push('<path style="opacity:0.6;stroke-width:'
                    + sw + 'px;stroke-linecap:round;stroke:#' +
                    s_colors[i] + '" d="M '
                    + x + ' ' + y +
                    ' L ' + (x + Math.cos(a) * stat.histogram[i] * rh)
                    + ' ' + (y + Math.sin(a) * stat.histogram[i] * rh)
                    + '"/>');
            }
        }
    }
    return r;
}

function stat_display_flower(groups, all_stats, column, zoom) {
    if (zoom === undefined)
        zoom = 1;

    var width = stat_svg_height * zoom;
    var height = stat_svg_height * zoom;
    var v = [], stat;
    function X(c) { return (width * c).toFixed(1); };
    function Y(c) { return (height * (1 - c)).toFixed(1); };
    var s, p;

    v.push('<path style="stroke:#F00" d="M ' + X(0.25) + ' ' + Y(0) +
        ' L ' + X(0.25) + ' ' + Y(1) + '"/>');
    v.push('<path style="stroke:#888" d="M ' + X(0.5) + ' ' + Y(0) +
        ' L ' + X(0.5) + ' ' + Y(1) + '"/>');
    v.push('<path style="stroke:#0F0" d="M ' + X(0.75) + ' ' + Y(0) +
        ' L ' + X(0.75) + ' ' + Y(1) + '"/>');

    s = [];
    p = [];
    for (var group in groups) {
        group = groups[group];
        stat = all_stats[group + '\001' + column];
        if (stat && stat.nr != 0 && group != _("MSG_stat_TOTAL_row"))
            stat_display_one_flower(s, v, p,
                X(stat.normalized_average()),
                Y(2 * stat.standard_deviation() / stat.size),
                stat, group, zoom);
    }
    if (zoom > 2) {
        v = p.concat(v.concat(s));
    }
    return '<object type="image/svg+xml" height="' + height
        + 'px" width="' + width + 'px" data="data:text/xml;charset=utf-8,' +
        base64('<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
            '<svg xmlns="http://www.w3.org/2000/svg" style="background:white">' +
            '<g>' + v.join('\n') + '</g>' + '</svg>') + '"></object><div>';

}

function stat_display_fractal_flower(groups, sorted_cols, all_stats, zoom) {
    var s = [], v = [], p = [];
    var stat, size = .4;

    if (zoom === undefined)
        zoom = 1;

    var width = stat_svg_height * zoom;
    var height = stat_svg_height * zoom;
    function X(c) { return (width * c).toFixed(1); };
    function Y(c) { return (height * (1 - c)).toFixed(1); };

    var title = '';
    if (zoom > 2)
        title = html(ue) + '\n' + html(semester) + '\n' + html(year);

    stat = all_stats[_("MSG_stat_TOTAL_row") + '\001TOTAL'];
    if (stat === undefined)
        for (var i in groups) {
            stat = all_stats[groups[i] + '\001TOTAL'];
            break;
        }

    var central_radius = stat_display_one_flower(s, v, p, X(0.5), Y(0.5),
        stat, title, zoom);
    p.push('<circle style="fill:none;stroke:#888" cx="' + X(0.5) + '" cy="' + Y(0.5) + '" r="'
        + (central_radius + width / 2 * size) + '"/>');
    p.push('<circle style="fill:none;stroke:#F00" cx="' + X(0.5) + '" cy="' + Y(0.5) + '" r="'
        + (central_radius + width / 4 * size) + '"/>');
    p.push('<circle style="fill:none;stroke:#0F0" cx="' + X(0.5) + '" cy="' + Y(0.5) + '" r="'
        + (central_radius + 3 * width / 4 * size) + '"/>');
    p.push('<circle style="fill:none;stroke:#FF0" cx="' + X(0.5) + '" cy="' + Y(0.5) + '" r="'
        + (central_radius + width * size) + '"/>');

    var flowers_s = [];
    var flowers_v = [];
    var flowers_p = [];
    var flowers_nr = [];
    var s2, v2, p2;
    var hide_histo = sorted_cols.length > 7;

    for (var column in sorted_cols) {
        column = sorted_cols[column];
        if (column == 'TOTAL')
            continue;

        stat = all_stats[_("MSG_stat_TOTAL_row") + '\001' + column];
        if (stat === undefined || stat.nr == 0)
            continue;

        s2 = [];
        v2 = [];
        p2 = [];
        stat_display_one_flower(s2, v2, p2, 0., 0., stat,
            columns[column].title, zoom / 4,
            hide_histo);
        flowers_nr.push(stat.normalized_average());
        flowers_s.push(s2.join('\n'));
        flowers_v.push(v2.join('\n'));
        flowers_p.push(p2.join('\n'));
    }


    for (var j = -2; j < columns.length; j++) {
        var _all_stats = {};
        var _stats_groups = [];
        var _grouped_by;
        var title = '';
        var data_col = j;

        _grouped_by = grouped_by;
        switch (j) {
            case -2: statistics_author(sorted_cols, _all_stats, _stats_groups);
                break;
            case -1: statistics_date(sorted_cols, _all_stats, _stats_groups);
                break;
            default:
                if (data_col == 'TOTAL')
                    continue;
                var stat = compute_stats(lines, data_col);
                var nr_uniques = stat.nr_uniques();
                if (data_col != 3 && data_col != 4
                    && (nr_uniques > 10 || nr_uniques <= 1))
                    continue;
                grouped_by = {};
                grouped_by[data_col] = true;
                statistics_values(sorted_cols, _all_stats, _stats_groups);
                title = columns[data_col].title + '\n';
                break;
        }
        compute_column_totals(_stats_groups, sorted_cols, _all_stats);
        compute_line_totals(_stats_groups, sorted_cols, _all_stats);
        for (var group in _stats_groups) {
            group = _stats_groups[group];
            stat = _all_stats[group + '\001TOTAL'];
            if (stat && stat.nr != 0 && group != _("MSG_stat_TOTAL_row")) {
                s2 = [];
                v2 = [];
                p2 = [];
                stat_display_one_flower(s2, v2, p2, 0., 0.,
                    stat, title + group, zoom / 4,
                    hide_histo);
                flowers_nr.push(stat.normalized_average());
                flowers_s.push(s2.join('\n'));
                flowers_v.push(v2.join('\n'));
                flowers_p.push(p2.join('\n'));
            }
        }
        grouped_by = _grouped_by;
    }

    var angle, teta = 2 * 3.14 / flowers_s.length;
    var translate, d;
    angle = 0;
    for (var i = 0; i < flowers_s.length; i++) {
        d = central_radius + width * size * flowers_nr[i];
        translate = '<g transform="translate('
            + (width / 2 + Math.cos(angle) * d) + ','
            + (height / 2 + Math.sin(angle) * d) + ')">';
        s.push(translate + flowers_s[i] + '</g>');
        v.push(translate + flowers_v[i] + '</g>');
        p.push(translate + flowers_p[i] + '</g>');
        angle += teta;
    }

    if (zoom > 2) {
        v = p.concat(v.concat(s));
    }
    v = '<g>' + v.join('\n') + '</g>';

    return '<object type="image/svg+xml;charset=utf-8" height="' + height
        + 'px" width="' + width + 'px" data="data:text/xml;charset=utf-8,' +
        base64('<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
            '<svg onclick="w=window.open();w.document.write(html(base64_decode(\'' + base64('<svg xmlns="http://www.w3.org/2000/svg">' + v + '</svg>') + '\')))" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background:white">' +
            '<script xlink:href="' + url + '/utilities.js"></script>' +
            v + '</svg>') + '"></object>';

}

function stat_fractal_flower_zoom() {
    var w = window_open(ue + '_flower');
    w.document.open('text/html;charset=utf-8');
    w.document.write
        (_("MSG_stat_flower_explanations")
            + stat_display_fractal_flower(stats_groups, sorted_cols,
                all_stats,
                window_width() / stat_svg_height
            )
        );
    w.document.close();
}


function stat_display_flowers(s, groups, sorted_cols, all_stats) {
    s.push('<tr><th>' +
        hidden_txt(_("TH_stat_last_line"), _("TIP_stat_last_line")));
    for (var column in sorted_cols) {
        column = sorted_cols[column];
        s.push('<td><div class="s_graph">'
            + stat_display_flower(groups, all_stats, column)
            + '<div class="s_clickable" onclick="stat_flower_zoom(this,'
            + js2(column) + ');setTimeout(\'scrollTop(10000000);\',100) ;"></div></div></td>');
    }
    s.push('<td><div class="s_graph">'
        + stat_display_fractal_flower(groups, sorted_cols, all_stats)
        + '<div class="s_clickable" onclick="stat_fractal_flower_zoom()'
        + '"></div></div></td>');

    s.push('</tr>');
}


function compute_stats(lines, data_col) {
    var column = columns[data_col];
    var s = new Stats(Number(column.min), Number(column.max), column.empty_is);
    s = new Stats(column.min, column.max, column.empty_is);
    for (var line in lines)
        s.add(lines[line][data_col].value);
    return s;
}

var colorations = {
    "B_stat_colorles": 100,
    "B_stat_colored": 1.5,
    "B_stat_very_colored": 1
};

function stat_span(s, value_type, value, html_class) {
    if (values_to_display[_('B_' + value_type)])
        s.push('<span class="' + value_type + ' ' + html_class + '">'
            + value + "</span>");
}

function stat_graph_zoom(t, group) {
    stat_tip_window(t, '\002' + group);
    if (!TIP.tip)
        return;

    var td = [], stats, key;
    for (var column in sorted_cols) {
        column = sorted_cols[column];
        key = group + '\001' + column;
        stats = all_stats[key];
        if (stats == undefined)
            td.push(0);
        else
            if (!isNaN(column)) // Not the TOTAL
                td.push([stats.normalized_average(),
                stats.nr + (stats.all_values[pre]
                    ? stats.all_values[pre] : 0)]);
    }

    var html = '<div class="s_graph_zoomed">'
        + _("MSG_stat_line_help") + '<br>' + a_graph([td], 4) + '</div>';
    TIP.show_tip(html, t, true);
}

function stat_zoom_header(data_col, group) {
    var s = '<div class="s_stat_tip">';
    if (data_col == 'TOTAL')
        s += _("MSG_stat_TOTAL_col");
    else
        s += _("MSG_stat_column") + '<b>' + html(columns[data_col].title) + '</b>';

    if (group !== undefined) {
        if (regrouping == _("B_stat_group_author"))
            s += _("MSG_stat_author") + '<b>' + group + '</b>';
        else
            if (group != _("MSG_stat_TOTAL_row")) {
                s += _("MSG_stat_lines");
                j = 0;
                for (var i in grouped_by)
                    if (grouped_by[i])
                        s += ' ' + html(columns[i].title) +
                            '=<b>' + group.split('\001')[j++] + '</b>';
            }
    }
    else {
        if (regrouping == _("B_stat_group_author"))
            s += _("MSG_stat_author_grouping");
        else {
            s += _("MSG_stat_grouped_by") + '<b>';
            for (var i in grouped_by)
                if (grouped_by[i])
                    s += ' ' + html(columns[i].title);
            s += '</b>';
        }
    }

    return s;
}

function stat_zoom(t, data_col, group) {
    stat_tip_window(t, '\003' + data_col + group);
    if (!TIP.tip)
        return;
    var stats = all_stats[group + '\001' + data_col];
    var s, value;
    s = stat_zoom_header(data_col, group);
    if (stats.nr) {
        s += '<table><tr><td>';
        s += _("B_s_minimum") + ': ' + stats.min.toFixed(3)
            + ', ' + _("B_s_maximum") + ': ' + stats.max.toFixed(3)
            + '<br>' + _("B_s_average") + ': ' + stats.average().toFixed(3)
            + ', ' + _("B_s_mediane") + ': ' + stats.mediane().toFixed(3)
            + '<br>' + _("B_s_variance") + ': ' + stats.variance().toFixed(3)
            + ', ' + _("B_s_stddev") + ': ' + stats.standard_deviation().toFixed(3)
            + '<br>' + _("B_s_sum_1") + ' ' + stats.nr + ' ' + _("B_s_sum_2")
            + ': ' + stats.sum.toFixed(3)
            + '<td class="s_enumeration">';

        for (var i in stats.all_values)
            if (stats.all_values[i]) {
                if (i === '')
                    s += 'vide';
                else
                    s += i;
                s += ':' + stats.all_values[i] + '<br>';
            }
        s += '</tr></table>';
    }

    var max;
    if (stats.nr) {
        s += '<div class="s_zoomed_histogram s_zoomed_histogram_note">\n';
        max = stats.histo_max();
        for (var i in stats.histogram) {
            if (stats.histogram[i])
                value = stats.histogram[i];
            else
                value = '';
            s += '<div style="height:' + (100 * stats.histogram[i] / max)
                + '%;left:' + (2 * i)
                + 'em;background:#' + s_colors[i] + '"><span>'
                + value + '</span><div>'
                + (stats.v_min + i / 20. * stats.size).toFixed(1).replace(/[.]*0*$/, '')
                + '</div></div>';
        }
        s += '<div style="left:40em;border:0px"><div>'
            + stats.v_max + '</div></div>';
    }
    else {
        s += '<div class="s_zoomed_histogram s_zoomed_histogram_enum">\n';
        max = stats.maxmax();
        var nr_cols = 0
        for (var ii in all_values)
            if (stats.all_values[ii])
                nr_cols++;
        i = 0;
        for (var ii in all_values) {
            if (stats.all_values[ii])
                value = stats.all_values[ii];
            else
                continue;
            s += '<div style="height:' + (100 * stats.all_values[ii] / max)
                + '%;width:' + 100. / nr_cols + '%; left:' + 100 * i / nr_cols
                + '%;background:#' + s_colors[ii] + '"><span>'
                + value + '</span><div>' + ii + '</div></div>';
            i++;
        }
    }
    s += '</div></div>\n';
    TIP.show_tip(s, t, true);
}

function display_stats_td(s, stats, data_col, group) {
    var z = 2;
    if (group == _("MSG_stat_TOTAL_row"))
        z /= stats_groups.length;
    if (data_col == 'TOTAL')
        z /= sorted_cols.length;

    if (stats.nr == 0) {
        s.push('<td><div class="stat_enum" onclick="stat_zoom(this,\''
            + data_col + "'," + js2(group) + ')">');
        for (var i in stats.all_values)
            if (stats.all_values[i])
                s.push(i + ':' + stats.all_values[i] + '<br>');
        s.push('</div></td>');
        return;
    }
    s.push('<td><div class="s_td" onclick="stat_zoom(this,\''
        + data_col + "'," + js2(group) + ')">');

    if (values_to_display[_('B_s_histogram')])
        s.push(stats_histogram(stats, z));

    s.push('<div class="s_center">');
    stat_span(s, 's_average', stats.average().toFixed(nr_decimals),
        stats.average_class
    );
    stat_span(s, 's_mediane', stats.mediane().toFixed(nr_decimals), '');
    s.push('</div>');
    stat_span(s, 's_nr', stats.nr, stats.nr_class);
    stat_span(s, 's_minimum', stats.min.toFixed(nr_decimals), '');
    stat_span(s, 's_maximum', stats.max.toFixed(nr_decimals), '');
    stat_span(s, 's_stddev', stats.standard_deviation().toFixed(nr_decimals),
        stats.stddev_class);
    s.push('</td>');
}

var s_colors = {};

for (i = 0; i < 20; i++)
    s_colors[i] = i < 5 ? 'F44' : (i < 10 ? 'DA0' : (i < 15 ? '9C9' : '0F0'));
s_colors[pre] = '8F8';
s_colors[abi] = 'F88';
s_colors[tnr] = 'FAA';
s_colors[abj] = '88F';
s_colors[ppn] = '0FF';

var all_stats = {};

function stats_histogram(stats, z) {
    var s = '<div class="s_histogram">';
    var color;

    for (var i in stats.histogram) {
        if (values_to_display[_('B_s_histogram')])
            color = s_colors[i];
        else
            color = 'BBB';

        s += '<div style="height:' + (stats.histogram[i] * z).toFixed(0)
            + 'px;left:' + (2 * (i - 10)) + 'px;background:#' + color + '"></div>';
    }

    return s + '</div>';
}

function a_value_button(s, attr, title, tip, not_escape) {
    s.push(display_button("'" + _('B_' + attr) + "'", title,
        values_to_display[_('B_' + attr)],
        'values_to_display', tip, not_escape, attr));
}

function horizontal_coloring(all_stats, groups, sorted_cols) {
    var key, stats;

    for (var group in groups) {
        group = groups[group];
        stats = new Stats(0, 20, '');
        for (var column in sorted_cols) {
            if (isNaN(sorted_cols[column])) // TOTAL
                continue;
            key = group + '\001' + sorted_cols[column];
            if (!all_stats[key])
                continue;
            stats.add(all_stats[key].nr);
        }

        for (var column in sorted_cols) {
            if (isNaN(sorted_cols[column])) // TOTAL
                continue;
            key = group + '\001' + sorted_cols[column];
            td = all_stats[key];
            if (!td)
                continue;
            if (td.nr < stats.average() - color_coef * stats.standard_deviation())
                td.nr_class = 's_stat_red';
            else
                if (td.nr > stats.average()
                    + color_coef * stats.standard_deviation())
                    td.nr_class = 's_stat_green';
        }
    }
}

function vertical_coloring(all_stats, sorted_groups, sorted_cols) {
    var td, stats, s;

    for (var column in sorted_cols) {
        column = sorted_cols[column];

        stats = new Stats(0, 20, '');
        for (var group in sorted_groups) {
            if (sorted_groups[group] == _("MSG_stat_TOTAL_row"))
                continue;
            s = all_stats[sorted_groups[group] + '\001' + column];
            if (s)
                stats.add(s.average());
        }

        for (var group in sorted_groups) {
            if (sorted_groups[group] == _("MSG_stat_TOTAL_row"))
                continue;
            td = all_stats[sorted_groups[group] + '\001' + column];
            if (!td)
                continue;
            if (td.average() < stats.average()
                - color_coef * stats.standard_deviation())
                td.average_class = 's_stat_red';
            else
                if (td.average() > stats.average()
                    + color_coef * stats.standard_deviation())
                    td.average_class = 's_stat_green';
        }

        stats = new Stats(0, 20, '');
        for (var group in sorted_groups) {
            if (sorted_groups[group] == _("MSG_stat_TOTAL_row"))
                continue;
            s = all_stats[sorted_groups[group] + '\001' + column];
            if (s)
                stats.add(all_stats[sorted_groups[group] + '\001'
                    + column].standard_deviation());
        }

        for (var group in sorted_groups) {
            if (sorted_groups[group] == _("MSG_stat_TOTAL_row"))
                continue;
            td = all_stats[sorted_groups[group] + '\001' + column];
            if (!td)
                continue;
            if (td.standard_deviation() < stats.average()
                - color_coef * stats.standard_deviation())
                td.stddev_class = 's_stat_red';
            else
                if (td.standard_deviation() > stats.average()
                    + color_coef * stats.standard_deviation())
                    td.stddev_class = 's_stat_green';
        }
    }
}

function statistics_values(sorted_cols, all_stats, groups) {
    var grouped_lines = {};
    var key;
    var get_key = compute_groups_key_function(grouped_by);
    for (var i in lines) {
        key = get_key(lines[i]);
        if (grouped_lines[key] === undefined)
            grouped_lines[key] = [];
        grouped_lines[key].push(lines[i]);
    }

    for (var i in grouped_lines)
        groups.push(i);
    groups.sort();

    for (var group in grouped_lines) {
        i++;
        for (var column in sorted_cols)
            if (sorted_cols[column] != 'TOTAL')
                all_stats[group + '\001' + sorted_cols[column]] =
                    compute_stats(grouped_lines[group], sorted_cols[column]);
    }
}

function statistics_author(sorted_cols, all_stats, groups) {
    var authors_name = {}, cell, col, key, author;

    for (var line in lines) {
        line = lines[line];
        for (var column in sorted_cols) {
            if (sorted_cols[column] == "TOTAL")
                continue;
            column = sorted_cols[column];
            cell = line[column];
            col = columns[column];
            key = cell.author + '\001' + column;
            if (all_stats[key] === undefined)
                all_stats[key] = new Stats(col.min, col.max, col.empty_is);
            all_stats[key].add(cell.value);
            authors_name[cell.author] = true;
        }
    }
    for (var author in authors_name)
        if (author.length > 1)
            groups.push(author);
    groups.sort();
}

function statistics_date(sorted_cols, all_stats, groups) {
    var days = {}, cell, col, key, day;

    for (var line in lines) {
        line = lines[line];
        for (var column in sorted_cols) {
            if (sorted_cols[column] == "TOTAL")
                continue;
            column = sorted_cols[column];
            cell = line[column];
            col = columns[column];
            day = cell.date.substr(0, 4) + ' ' + cell.date.substr(4, 2);
            // + (cell.date.substr(6,2)/10).toFixed(0) ;
            key = day + '\001' + column;
            if (all_stats[key] === undefined)
                all_stats[key] = new Stats(col.min, col.max, col.empty_is);
            all_stats[key].add(cell.value);
            days[day] = true;
        }
    }
    for (day in days)
        groups.push(day);
    groups.sort();
}

function stat_display_line(s, i_group, group, sorted_cols, all_stats, td, groups) {
    var key, stats, tds;

    s.push('<tr><th>' + group.replace(/[\001\002]/g, ' ') + '</th>');
    for (var column in sorted_cols) {
        column = sorted_cols[column];
        key = group + '\001' + column;
        stats = all_stats[key];
        if (stats == undefined) {
            s.push('<td>&nbsp;</td>');
            td.push(0);
        }
        else {
            display_stats_td(s, stats, column, group);
            if (!isNaN(column)) // Not the TOTAL
                td.push([stats.normalized_average(), stats.nr]);
        }
    }

    tds = new Array(groups.length);
    tds[i_group] = td;

    s.push('<td><div class="s_graph">' + a_graph(tds)
        + '<div class="s_clickable" onclick="stat_graph_zoom(this,'
        + js2(group) + ')"></div></div></td>');
    s.push('</tr>');
}


function stat_display_table(s, groups, sorted_cols, all_stats, all_values) {
    var td;

    for (var i_group in groups) {
        td = [];
        group = groups[i_group];
        stat_display_line(s, i_group, groups[i_group], sorted_cols,
            all_stats, td, groups)
        all_values.push(td);
    }
}

function compute_column_totals(groups, sorted_cols, all_stats) {
    var stats, key;

    for (var column in sorted_cols) {
        column = sorted_cols[column];
        if (column != 'TOTAL')
            stats = new Stats(columns[column].min, columns[column].max, '');
        else
            stats = new Stats(0, 20, '');
        for (var group in groups) {
            key = groups[group] + '\001' + column;
            if (all_stats[key])
                stats.merge(all_stats[key]);
        }
        all_stats[_("MSG_stat_TOTAL_row") + '\001' + column] = stats;
    }
}

function compute_line_totals(groups, sorted_cols, all_stats) {
    var stats, key;

    for (var group in groups) {
        stats = new Stats(0, 20, '');
        for (var column in sorted_cols) {
            key = groups[group] + '\001' + sorted_cols[column];
            if (all_stats[key])
                stats.merge(all_stats[key]);
        }
        all_stats[groups[group] + '\001TOTAL'] = stats;
    }
}

var sorted_cols;
var stat_groups;

function statistics_display() {
    if (!do_printable_display)
        return;
    do_printable_display = false;

    sorted_cols = [];
    for (var c in columns)
        if (columns_to_display[c])
            sorted_cols.push(c);
    sorted_cols.sort(function (a, b) { return columns[a].position - columns[b].position; });

    var s = ['<div style="text-align:center;font-weight:bold">'
        + ue + ' ' + semester + ' ' + year + '</div>'];
    var td_width = 0;
    nr_decimals = Number(nr_decimals);
    if (values_to_display[_('B_s_average')])
        td_width += 2 + nr_decimals;
    if (values_to_display[_('B_s_mediane')])
        td_width += (2 + nr_decimals) * 0.7;
    if (td_width < 3.5)
        td_width = 3.5;

    td_width /= 1.5;

    s.push('<table class="colored">');
    s.push('<tr><th>');

    var t = [];

    t.push('<div class="s_td">');
    t.push('<div class="s_center">');
    a_value_button(t, 's_average', _('B_s_average_'));
    a_value_button(t, 's_mediane', _("B_s_mediane_"));
    t.push('</div>');
    a_value_button(t, 's_histogram', _("B_s_histogram_"));
    a_value_button(t, 's_stddev', _("B_s_stddev_"));
    a_value_button(t, 's_nr', _("B_s_nr_"));
    a_value_button(t, 's_minimum', _("B_s_minimum_"));
    a_value_button(t, 's_maximum', _("B_s_maximum_"));
    t.push('</div>');

    s.push(hidden_txt(t.join('\n'), _("TIP_stat_explanation")));

    for (var column in sorted_cols)
        s.push('<th onclick="button_toggle(columns_to_display,'
            + sorted_cols[column] +
            ',document.getElementById(\'columns_to_display\').getElementsByTagName(\'SPAN\')['
            + columns[sorted_cols[column]].ordered_index
            + ']); do_printable_display=true"><div style="min-width:'
            + td_width + 'em">'
            + hidden_txt(html(columns[sorted_cols[column]].title),
                _("TIP_stat_th_column"))
            + '</div></th>');
    s.push('<th>'
        + hidden_txt(_("MSG_stat_TOTAL_col"), _("TIP_stat_th_column_total"))
        + '<th>'
        + hidden_txt(_("TH_stat_th_trend"), _("TIP_stat_th_trend"))
    );
    s.push('</tr>');

    // Creates statistics table

    all_stats = {};
    stats_groups = [];
    if (regrouping == _("B_stat_group_author"))
        statistics_author(sorted_cols, all_stats, stats_groups);
    else if (regrouping == _("B_stat_group_month"))
        statistics_date(sorted_cols, all_stats, stats_groups);
    else
        statistics_values(sorted_cols, all_stats, stats_groups);

    // Compute line/column totals
    compute_column_totals(stats_groups, sorted_cols, all_stats);
    if (stats_groups.length != 1)
        stats_groups.push(_("MSG_stat_TOTAL_row"));
    compute_line_totals(stats_groups, sorted_cols, all_stats);
    sorted_cols.push('TOTAL');

    // Coloring

    for (var i in colorations)
        if (_(i) == coloration)
            color_coef = colorations[i];
    vertical_coloring(all_stats, stats_groups, sorted_cols);
    horizontal_coloring(all_stats, stats_groups, sorted_cols);

    // Display table

    var all_values = [];
    stat_display_table(s, stats_groups, sorted_cols, all_stats, all_values);

    stat_display_flowers(s, stats_groups, sorted_cols, all_stats);

    s.push('</table>');

    document.getElementById('content').innerHTML = s.join('\n');
}

//////////////////////////////////////////////////////////////////////////////

function strange_grades() {
    var stats = [], v;
    for (var column in sorted_cols) {
        var data_col = sorted_cols[column];
        column = columns[data_col];
        if (!column)
            continue;
        if (column.type !== 'Note' && column.type !== 'Notation'
            && column.type !== 'MCQ' && column.type !== "Analyser"
	    && column.type !== 'Annotate')
            continue;
        if (column.weight.substr(0, 1) === '+'
            || column.weight.substr(0, 1) === '-')
            continue;
        var s = 0, s2 = 0, n = 0;
        for (var line in lines) {
            v = lines[line][data_col].value;
            if (v !== '') {
                v = Number(v);
                if (!isNaN(v)) {
                    s += v;
                    s2 += v * v;
                    n++;
                }
            }
        }
        if (n > 2)
            stats.push([data_col, s / n, Math.pow((s * s - s2) / n, 0.5), 1000, -1000]);
    }
    if (stats.length < 3) {
        Alert("ALERT_stat_need_more_data");
        return;
    }

    var students = [];
    for (var line in lines) {
        line = lines[line];
        var norms = [];
        var sum = 0, n = 0;
        for (var s in stats) {
            s = stats[s];
            v = line[s[0]].value;
            if (v !== '' && !isNaN(v)) {
                v = (v - s[1]) / s[2];
                norms.push(v);
                sum += v;
                n++;
            }
            else
                norms.push('');
        }
        if (n > 2) {
            sum /= n;
            var maxi = 0;
            for (var i in norms) {
                if (isNaN(norms[i]) || norms[i] === '')
                    continue;
                norms[i] -= sum;
                maxi = Math.max(maxi, Math.abs(norms[i]));
                if (norms[i] < stats[i][3])
                    stats[i][3] = norms[i];
                if (norms[i] > stats[i][4])
                    stats[i][4] = norms[i];
            }
            students.push([maxi, line].concat(norms));
        }
    }
    students.sort(function (a, b) { return b[0] - a[0]; });

    v = _("MSG_stat_strange_grade_help")
        + '<style>.alignright { text-align: right }</style>'
        + '<table class="colored alignright" style="width:10%"><tr><th><th><th>';
    for (var i in stats)
        v += '<th>' + columns[stats[i][0]].title + '<br>'
            + stats[i][1].toFixed(2);
    for (var s in students) {
        s = students[s];
        var lin = s[1], color;
        v += '<tr><td>' + lin[0].value + '<td>' + lin[1].value + '<td>' + lin[2].value;
        for (var c in s) {
            if (c < 2)
                continue;
            if (s[c] > 0) {
                color = "FEDCBA9876543210".substr(Math.floor(15.99 * s[c] / stats[c - 2][4]), 1);
                color = color + "F" + color;
            }
            else if (s[c] <= 0) {
                color = "FEDCBA9876543210".substr(Math.floor(15.99 * s[c] / stats[c - 2][3]), 1);
                color = "F" + color + color;
            }
            else
                color = "#FFF";
            var value = lin[stats[c - 2][0]].value;
            if (value !== '' && !isNaN(value))
                value = Number(value).toFixed(2);
            v += '<td style="background:#' + color + '">' + value;
        }
        v += '</tr>\n';
    }
    v += '</table>';

    create_popup('strange_grades export_div', _("TITLE_stat_strange_grades"), v, '', false);

}

//////////////////////////////////////////////////////////////////////////////
// Generate full statistic page
//////////////////////////////////////////////////////////////////////////////

function display_statistics(_the_id) {
    var p = [printable_introduction()];
    p.push('<script>');
    p.push('var do_printable_display = true ;');
    p.push('var columns_to_display = {};');
    p.push('var values_to_display={};');
    p.push('var grouped_by = {};');
    p.push('var coloration = "";');
    p.push('var nr_decimals = "1";');
    p.push('var regrouping;');
    p.push('var color_coef ;');
    p.push('var ue = ' + js(ue) + ';');
    p.push('var columns = ' + columns_in_javascript() + ';');
    p.push('var lines ;');
    p.push('function initialize() {');
    p.push('if ( ! wait_scripts("initialize()") ) return ;');
    p.push('lib_init();');
    p.push('values_to_display[_("B_s_average")]=true;')
    p.push('regrouping = _("B_stat_group_value");');
    p.push('lines = ' + lines_in_javascript() + ';');
    p.push('setInterval("statistics_display()", 200);');
    p.push('}');
    p.push('</script>');
    p.push('<p class="hidden_on_paper">' + _("MSG_stat_export_spreadsheet"));
    p.push('<br><a class="hidden_on_paper" href="javascript:strange_grades()">' + _("MSG_stat_strange_grades")
        + '</a>');
    p.push('<table class="hidden_on_paper">');

    var t = [], cols = column_list_all();
    for (var data_col in cols) {
        data_col = cols[data_col].toString();
        if (!columns[data_col].is_empty)
            t.push(display_button(data_col, columns[data_col].title,
                !columns[data_col].hidden
                && (columns[data_col].type == 'Note'
                    || columns[data_col].type == 'Notation'
                    || columns[data_col].type == 'MCQ'
                    || columns[data_col].type == 'Analyser'
                    || columns[data_col].type == 'Annotate')
                ,
                'columns_to_display',
                html(columns[data_col].comment)));
    }
    print_choice_line(p, _("MSG_stat_columns_to_display"),
        _("TIP_stat_columns_to_display"),
        t.join(' '),
        'columns_to_display');

    t = [];
    var column;
    for (var data_col in cols) {
        data_col = cols[data_col].toString();
        column = columns[data_col];
        if (column.is_empty)
            continue;
        var stats = compute_stats(filtered_lines, data_col);
        var comment = html(column.comment);
        if (comment)
            comment += '<br>';
        comment += stats.nr_uniques() + ' ' + _("MSG_stat_uniq_values")
        t.push(display_button(data_col, column.title,
            column.title == 'Seq' || column.title == 'Grp',
            'grouped_by', comment));
    }
    print_choice_line(p, _("MSG_stat_group_by"), _("TIP_stat_group_by"),
        t.join(' '),
        'grouped_by');

    print_choice_line(p, _("MSG_stat_nr_digit"), _("TIP_stat_nr_digit"),
        radio_buttons('nr_decimals', ['0', '1', '2', '3'], '1'),
        'nr_decimals');

    t = [];
    for (var i in colorations)
        t.push([_(i), _(i.replace('B', 'TIP'))]);
    print_choice_line(p, _("MSG_stat_coloring"), _("TIP_stat_coloring"),
        radio_buttons('coloration', t, _("B_stat_colored")),
        'coloration');

    print_choice_line(p, _("MSG_stat_group_by"), _("TIP_stat_group_by"),
        radio_buttons('regrouping',
            [[_("B_stat_group_value"),
            _("TIP_stat_group_value")],
            [_("B_stat_group_author"),
            _("TIP_stat_group_author")],
            [_("B_stat_group_month"),
            _("TIP_stat_group_month")],
            ], _("B_stat_group_value")),
        'regrouping');

    p.push('</table>');
    p.push('<div style="clear:both" id="content"></div>');
    p.push('<script>');
    // The timeout is for IE (100 is not enough)
    p.push('setTimeout(initialize, 200) ;');
    p.push('</script>');

    var w = window_open(url + '/files/' + version + '/ok.png');
    w.document.open('text/html');
    w.document.write(html_begin_head() + p.join('\n'));
    w.document.close();
    return w;
}


function svg_rect(x, y, width, height, classe) {
    var r = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    if (width < 0)
        width = 0;
    r.setAttribute('width', width);
    r.setAttribute('height', height);
    if (classe)
        r.setAttribute('class', classe);
    return r;
}

function svg_text(text) {
    var r = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    if (r.textContent !== undefined)
        r.textContent = text;
    else
        r.innerText = text;
    return r;
}

function histogram_bar(cls, x, dx, dy, maxmax, v, is_note, val_min, val_max,
    container) {
    var label, h = (dy * v) / maxmax;

    if (is_note) {
        label = (val_max - val_min) * cls / 20. + val_min;
        if (isNaN(label))
            label = '';
        else
            if (val_max - val_min >= 20)
                label = label.toFixed(0);
            else
                label = label.toFixed(1);
    }
    else
        label = cls;

    var r = svg_rect(x, dy - h, dx, h, 'a' + cls);
    container.appendChild(r);
    r = svg_text(label);
    r.setAttribute('transform', 'translate(' + (x + dx / 1.5) + ',0),rotate(-90)');
    container.appendChild(r);
}

var update_histogram_data_col = -1;
var update_histogram_id;
var svg_object, svg_style;
var t_column_histogram;
var t_column_average;
var current_histogram;

function update_histogram_real() {
    // Update stats toggle in column header
    do_update_histogram = false;
    if (the_current_cell.data_col == update_histogram_data_col)
        return;
    if (!t_column_histogram)
        return;
    update_histogram_data_col = the_current_cell.data_col;

    var dx = (t_column_histogram.the_width - 1) / 27;
    var dy = t_column_histogram.the_height;
    var font_size = Math.min((dx / 0.9).toFixed(0), (dy / 2.4).toFixed(0));
    var the_style =
        'g { pointer-events: none;}' +
        'rect { stroke: #000 ; stroke-opacity: 0.5 ; stroke-width:1 }' +
        '.a0, .a1, .a2, .a3, .a4 { fill: #F00 }' +
        '.a5, .a6, .a7, .a8, .a9 { fill: #FA0 }' +
        '.a10, .a11, .a12, .a13, .a14 { fill: #AFA }' +
        '.a15, .a16, .a17, .a18, .a19 { fill: #0F0 }' +
        '.appn { fill: #F8F }' +
        '.anan { fill: #FFF }' +
        '.aabi { fill: #F88 }' +
        '.aabj { fill: #88F }' +
        '.apre { fill: #8F8 }' +
        '.aoui { fill: #8FF }' +
        '.anon  { fill: #FF8 }' +
        'text { text-anchor:end; font-size:' + font_size + 'px; }';
    var stats = compute_histogram(the_current_cell.data_col);
    var i;
    var maxmax = stats.maxmax();

    if (!svg_object) {
        var d;
        try {
            d = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
            d.setAttribute('width', 1000);
        }
        catch (err) {
            return;
        }
        t_column_histogram.appendChild(d);
        svg_style = document.createElementNS("http://www.w3.org/2000/svg", 'style');
        d.appendChild(svg_style);
        svg_object = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        d.appendChild(svg_object);
    }
    if (svg_style.textContent !== undefined)
        svg_style.textContent = the_style;
    else
        svg_style.innerText = the_style;

    while (svg_object.firstChild)
        svg_object.removeChild(svg_object.firstChild);

    // allowed_grades?
    histogram_bar('ppn', 0 * dx, dx, dy, maxmax, stats.nr_ppn(), false, 0, 0, svg_object);
    histogram_bar('abi', 1 * dx, dx, dy, maxmax, stats.nr_abi(), false, 0, 0, svg_object);
    histogram_bar('abj', 2 * dx, dx, dy, maxmax, stats.nr_abj(), false, 0, 0, svg_object);
    histogram_bar('pre', 3 * dx, dx, dy, maxmax, stats.nr_pre(), false, 0, 0, svg_object);
    histogram_bar('oui', 4 * dx, dx, dy, maxmax, stats.nr_yes(), false, 0, 0, svg_object);
    histogram_bar('non', 5 * dx, dx, dy, maxmax, stats.nr_no(), false, 0, 0, svg_object);
    histogram_bar('nan', 6 * dx, dx, dy, maxmax, stats.nr_nan(), false, 0, 0, svg_object);

    for (i = 0; i < 20; i++)
        histogram_bar(i, (i + 7) * dx, dx, dy, maxmax, stats.histogram[i],
            true, stats.v_min, stats.v_max, svg_object
        );

    var average = stats.average();
    if (average > 1)
        average = average.toFixed(1);
    else
        average = average.toFixed(2);
    t_column_average.innerHTML = average;
    current_histogram = stats;

    var col_type = the_current_cell.column.type;
    if (competenceTable && (col_type == "Competences" || col_type == "COMPETENCES_RESULT"))
        competenceTable.update_stats();
    else
        update_column_stats(average);

    if (TIP.is_tip_visible())
        TIP.update_current_tip();
}

function graph_th(element) {
    column_graph_zoom_redraw_needed = [0, 0, false, element.cells[0].innerText];
}

var graph_just_selected = 'nothing is selected';

function update_column_graph(canvas, size, mouse_x, mouse_y, selected) {
    if (the_current_cell.data_col_previous === undefined)
        return '';
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, size, size);

    graph_just_selected = 'nothing is selected';
    var xmin = 1e50, xmax = -1e50, ymin = 1e50, ymax = -1e50;
    var selectors = {};
    var nrx = 0, sumx = 0, sumx2 = 0;
    var nry = 0, sumy = 0, sumy2 = 0;
    var nr_values = {}, sum_values = {};
    for (var line_id in filtered_lines) {
        var line = filtered_lines[line_id];
        var value_x_txt = line[the_current_cell.data_col_previous].value;
        var value_x = Number(value_x_txt)
        if (!isNaN(value_x) && value_x_txt !== '') {
            xmin = Math.min(xmin, value_x);
            xmax = Math.max(xmax, value_x);
            nrx++;
            sumx += value_x;
            sumx2 += value_x * value_x;
        }
        var value_y_txt = line[the_current_cell.data_col_current].value;
        value_y = Number(value_y_txt);
        if (!isNaN(value_y) && value_y_txt !== '') {
            ymin = Math.min(ymin, value_y);
            ymax = Math.max(ymax, value_y);
            nry++;
            sumy += value_y;
            sumy2 += value_y * value_y;
        }
        if (the_current_cell.data_col_previous_previous) {
            value = line[the_current_cell.data_col_previous_previous].value;
            selectors[value] = true;
            if (!isNaN(value_y) && value_y !== '') {
                if (nr_values[value] === undefined) {
                    nr_values[value] = 1;
                    sum_values[value] = value_y;
                }
                else {
                    nr_values[value]++;
                    sum_values[value] += value_y;
                }
            }
        }
    }
    var nr_selectors = Object.keys(selectors).length;
    if (nr_selectors < 32) {
        var i = 0;
        for (var selector in selectors)
            selectors[selector] = hls2rgb(i++ / nr_selectors, 0.5, 1);
    }
    else {
        for (var selector in selectors)
            selectors[selector] = "#000";
    }
    var radius = 10;
    var disks = [];
    var stddev_x = Math.pow((sumx2 / nrx) - (sumx / nrx) * (sumx / nrx), 0.5);
    var stddev_y = Math.pow((sumy2 / nry) - (sumy / nry) * (sumy / nry), 0.5);
    var stddev_xn = stddev_x * Math.pow(nrx / (nrx - 1), 0.5);
    var stddev_yn = stddev_y * Math.pow(nry / (nry - 1), 0.5);
    var infos = [
        '<style id="graphstyle"></style>',
        '<table class="colored" style="table-layout: fixed">',
        '<tr><th style="width:8em"><th><p style="overflow:auto">',
        html(columns[the_current_cell.data_col_previous].title),
        '<th><p style="overflow:auto">',
        html(columns[the_current_cell.data_col_current].title),
        '</tr>',
        '<tr><th>', _("B_s_minimum"), '<td>', xmin.toFixed(4), '<td>', ymin.toFixed(4), '</tr>',
        '<tr><th>', _("B_s_average"),
        '<td>', (sumx / nrx).toFixed(4),
        '<td>', (sumy / nry).toFixed(4), '</tr>',
        '<tr><th>', _("B_s_maximum"), '<td>', xmax.toFixed(4), '<td>', ymax.toFixed(4), '</tr>',
        '<tr><th>', _("B_s_stddev"), '<td>', stddev_x.toFixed(4), '<td>', stddev_y.toFixed(4), '</tr>',
        '<tr><th>', _("B_s_stddev_sample"), '<td>', stddev_xn.toFixed(4), '<td>', stddev_yn.toFixed(4), '</tr>',
        '</table>'
    ];

    if (Object.keys(selectors).length > 0 && Object.keys(selectors).length < nrx / 2) {
        infos.push(html(columns[the_current_cell.data_col_current].title) + ' :');
        infos.push('<table class="colored selector"><tr><th>')
        infos.push(html(columns[the_current_cell.data_col_previous_previous].title));
        infos.push('<th>');
        infos.push(_("B_s_nr_"));
        infos.push('<th>');
        infos.push(_("B_s_average_"));
        infos.push('</tr>');
        var sorted_keys = [];
        for (var i in nr_values)
            sorted_keys.push(i);
        sorted_keys.sort();
        for (var i in sorted_keys) {
            i = sorted_keys[i];
            infos.push('<tr class="_');
            infos.push(i.replace(/[^a-zA-Z0-9]/g, '_'));
            infos.push('" onmouseenter="graph_th(this)"><th style="background:');
            infos.push(selectors[i]);
            infos.push('"><p style="background:rgba(255,255,255,0.7)">')
            infos.push(i);
            infos.push('<td>');
            infos.push(nr_values[i]);
            infos.push('<td>');
            infos.push((sum_values[i] / nr_values[i]).toFixed(2));
            infos.push('</tr>');
        }
        infos.push('</table>');
    }

    if (xmax < columns[the_current_cell.data_col_previous].max)
        xmax = columns[the_current_cell.data_col_previous].max;
    if (ymax < columns[the_current_cell.data_col_current].max)
        ymax = columns[the_current_cell.data_col_current].max;
    xmin = Math.min(0, xmin);
    ymin = Math.min(0, ymin);

    for (var line_id in filtered_lines) {
        var line = filtered_lines[line_id];
        var x = line[the_current_cell.data_col_previous].value;
        var y = line[the_current_cell.data_col_current].value;
        var color = the_current_cell.data_col_previous_previous
            ? selectors[line[the_current_cell.data_col_previous_previous].value]
            : "#000";
        x = (x - xmin) / (xmax - xmin) * size;
        y = size - (y - ymin) / (ymax - ymin) * size;
        disks.push([line[the_current_cell.data_col_previous_previous].value, x, y]);
        if ((x - mouse_x) * (x - mouse_x) + (y - mouse_y) * (y - mouse_y) < radius * radius) {
            graph_just_selected = selected = line[the_current_cell.data_col_previous_previous].value.toString();
            ctx.fillStyle = "#000";
            ctx.font = '12px sans-serif';
            if (mouse_x < size * 0.7)
                label_x = mouse_x + 30;
            else
                label_x = mouse_x - 150;
            if (mouse_y < size * 0.9)
                label_y = mouse_y + 13;
            else
                label_y = mouse_y - 49;
            var lines = [
                line[1].value + ' ' + line[2].value,
                columns[the_current_cell.data_col_previous].title + '=' + line[the_current_cell.data_col_previous].value,
                columns[the_current_cell.data_col_current].title + '=' + line[the_current_cell.data_col_current].value,
                the_current_cell.data_col_previous_previous
                    ? columns[the_current_cell.data_col_previous_previous].title + '=' + line[the_current_cell.data_col_previous_previous].value
                    : ''
            ];
            ctx.fillText(lines[0], label_x, label_y);
            ctx.fillText(lines[1], label_x, label_y + 13);
            ctx.fillText(lines[2], label_x, label_y + 26);
            ctx.fillText(lines[3], label_x, label_y + 39);
            infos.push('<p>');
            for (var i in lines)
                infos.push('<div style="background:' + color + '2">' + html(lines[i]) + '</div>');
        }
        ctx.fillStyle = color + '3';
        if (isNaN(x) || isNaN(y))
            continue;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    if (selected !== undefined) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        for (var i in disks) {
            if (disks[i][0] == selected) {
                ctx.beginPath();
                ctx.arc(disks[i][1], disks[i][2], radius - 2, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    }
    ctx.fillStyle = "#000";
    ctx.font = '24px sans-serif';
    ctx.fillText(columns[the_current_cell.data_col_previous].title, size / 2, size - 10);
    ctx.fillText(xmin, 40, size - 10);
    ctx.fillText(xmax, 9 * size / 10, size - 10);

    ctx.fillText(columns[the_current_cell.data_col_current].title, 10, size / 2);
    ctx.fillText(ymin, 10, size - 40);
    ctx.fillText(ymax, 10, 20);

    ctx.strokeStyle = "#00F4";
    ctx.moveTo(0, size);
    ctx.lineTo(size, 0);
    ctx.stroke();

    return infos.join('');
}

var column_graph_zoom_redraw_needed;

function column_graph_zoom_redraw() {
    var canvas = document.getElementById("column_zoomed_graph");
    if (!canvas) {
        change_option('graph');
        return; // stop job
    }
    if (column_graph_zoom_redraw_needed == undefined)
        return true;
    var x = column_graph_zoom_redraw_needed[0];
    var y = column_graph_zoom_redraw_needed[1];
    var click = column_graph_zoom_redraw_needed[2];
    var selected = column_graph_zoom_redraw_needed[3];
    column_graph_zoom_redraw_needed = undefined;
    var infos = update_column_graph(canvas, window_height(), x, y, selected);
    if (click)
        document.getElementById('graph_infos').innerHTML = infos;
    document.getElementById('graphstyle').textContent =
     'TABLE.colored.selector TR._' + graph_just_selected.replace(/[^a-zA-Z0-9]/g, '_') + ' TD {background: #FF0}';

    document.getElementById('graphx').value = the_current_cell.data_col_previous;
    document.getElementById('graphy').value = the_current_cell.data_col_current;
    document.getElementById('graphc').value = the_current_cell.data_col_previous_previous;
    change_option('graph',
        the_current_cell.data_col_previous_previous
        + '=' + the_current_cell.data_col_previous
        + '=' + the_current_cell.data_col_current);
    return true;
}

function graph_change(select) {
    switch (select.id) {
        case 'graphx': the_current_cell.data_col_previous = Number(select.value); break;
        case 'graphy': the_current_cell.data_col_current = Number(select.value); break;
        case 'graphc': the_current_cell.data_col_previous_previous = Number(select.value); break;
    }
    column_graph_zoom_redraw_needed = [0, 0, true];
}

function column_graph_zoom() {
    var options = [];
    var cols = column_list_all();
    for (var i in cols)
        options.push('<option value="' + cols[i] + '">' + html(columns[cols[i]].title) + '</option>');
    options = options.join('');

    create_popup(
        'column_zoomed_graph', '',
        '<canvas id="column_zoomed_graph"></canvas>'
        + '<div>'
        + 'X : <select id="graphx" onchange="graph_change(this)">' + options + '</select><br>'
        + 'Y : <select id="graphy" onchange="graph_change(this)">' + options + '</select><br>'
        + 'C : <select id="graphc" onchange="graph_change(this)">' + options + '</select><br>'
        + '<div id="graph_infos"></div>'
        + '</div>'
        ,
        '',
        false);
    var canvas = document.getElementById("column_zoomed_graph");
    canvas.onmousemove = function (event) {
        event = the_event(event);
        column_graph_zoom_redraw_needed = [event.x, event.y];
    };
    canvas.onmousedown = function (event) {
        event = the_event(event);
        column_graph_zoom_redraw_needed = [event.x, event.y, true];
    };
    column_graph_zoom_redraw_needed = [0, 0, true];
    periodic_work_add(column_graph_zoom_redraw, 100);
}

function update_histogram(force) {
    t_column_histogram = document.getElementById('t_column_histogram');
    t_column_average = document.getElementById('t_column_stats');
    if (!t_column_average)
        return;
    if (force)
        update_histogram_data_col = -1;

    if (t_column_histogram && t_column_histogram.offsetWidth) {
        t_column_histogram.the_height = t_column_histogram.offsetHeight - 1;
        t_column_histogram.the_width = t_column_histogram.offsetWidth;
    }

    if (update_histogram_id)
        clearTimeout(update_histogram_id);

    update_histogram_id = setTimeout(update_histogram_real, 300);
}

function update_column_stats(average) {
    var stats_area = document.getElementById("content_Stats");
    if (average == 'NaN' || !current_histogram)
        return stats_area.innerHTML = '';

    var stats_lines = current_histogram.stats_resume();
    for (var line in stats_lines)
        stats_lines[line] = stats_lines[line].replaceAll(' ', '&nbsp');

    var stats_html = ['<table class="stats_table"><thead><tr><td colspan="2">Moyenne des résultats : ', average, ' sur ',
        current_histogram.nr, _("MSG_columnstats_values"), '</td></tr></thead><tbody>'];
    for (var i in stats_lines)
        stats_html.push(i % 2 == 0 ? '<tr><td>' + stats_lines[i] + '</td>' : '<td>' + stats_lines[i] + '</td></tr>');
    stats_html.push((stats_lines.length % 2 == 1 ? '</tr>' : '') + '</tbody></table>');

    stats_area.innerHTML = '<canvas id="t_column_graph" onclick="column_graph_zoom()"></canvas>' + stats_html.join('');
    update_column_graph(document.getElementById("t_column_graph"), 256);
}

function table_copy_button(id, text, help, toggled, unsensitive) {
    id = 'table_copy_' + id;
    if (toggled)
        toggled = ' toggled';
    else
        toggled = '';
    if (unsensitive === undefined)
        return '&nbsp;<span id="' + id
            + '" class="button_toggle' + toggled
            + '" onclick="tablecopy_do(this)"> '
            + hidden_txt(text, help) + ' </span>&nbsp;';
    else {
        if (unsensitive)
            unsensitive = ' disabled="disabled" ';
        else
            unsensitive = '';
        return hidden_txt('<input type="button" onclick="tablecopy_do(this)" '
            + 'id="' + id + '" ' + unsensitive
            + 'style="width:auto" '
            + 'value="' + text + '">', help);
    }
}

function tablecopy_toggle(id, toggle) {
    var e = document.getElementById('table_copy_' + id);
    var toggled = e.classList.contains('toggled');
    if (toggle) {
        if (toggled)
            e.className = 'button_toggle';
        else
            e.classList.add('toggled');
    }
    return toggled;
}

function tablecopy_do(t) {
    var id = t.id.replace('table_copy_', '');
    var option = 'columns';
    if (tablecopy_toggle('U'))
        option = 'upload';
    else if (tablecopy_toggle('H'))
        option = 'history';
    else if (tablecopy_toggle('C'))
        option = 'content';

    var iframe = '<iframe width="100%" style="height:10em" src="';
    if (t.type == 'button')
        switch (id) {
            case 'TS':
                create_popup('export_div', _("TITLE_tablecopy_export"),
                    _("MSG_tablecopy_export") +
                    '<h3><span class="gui_button" '
                    + 'onmouseup="popup_close();print_selection()">'
                    + _("B_tablecopy_export") + '</span></h3>'
                    , '', false);
                break;
            case 'ST':
                create_popup('export_div', _("TITLE_tablecopy_import"),
                    "<p>" + _("MSG_tablecopy_import"), '', false);
                break;
            case 'F':
                var next_ys = next_year_semester(year, semester);
                create_popup('export_div', _("TITLE_tablecopy_to_future"),
                    _("MSG_tablecopy_feedback")
                    + iframe + add_ticket(
                        year + '/' + semester + '/' + ue + '/tablecopy/'
                        + next_ys[0] + '/' + next_ys[1] + '/' + option)
                    + '">' + '</iframe>',
                    "", false);
                break;
            case 'P':
                var previous_ys = previous_year_semester(year, semester);
                create_popup('export_div', _("TITLE_tablecopy_from_past"),
                    _("MSG_tablecopy_feedback")
                    + iframe + add_ticket(
                        previous_ys[0] + '/' + previous_ys[1] + '/' + ue
                        + '/tablecopy/' + year + '/' + semester + '/' + option)
                    + '">' + '</iframe>',
                    "", false);
                break;
            case 'PY':
                create_popup('export_div', _("TITLE_tablecopy_from_past_year"),
                    _("MSG_tablecopy_feedback")
                    + iframe + add_ticket(
                        (year - 1) + '/' + semester + '/' + ue
                        + '/tablecopy/' + year + '/' + semester + '/' + option)
                    + '">' + '</iframe>',
                    "", false);
                break;
            case 'NY':
                create_popup('export_div', _("TITLE_tablecopy_to_future"),
                    _("MSG_tablecopy_feedback")
                    + iframe + add_ticket(
                        year + '/' + semester + '/' + ue + '/tablecopy/'
                        + (Number(year) + 1) + '/' + semester + '/' + option)
                    + '">' + '</iframe>',
                    "", false);
                break;
            case 'R':
                var newname = document.getElementById('newname').value;
                if (newname == ue)
                    Alert("ALERT_tablecopy_copy_same");
                else
                    create_popup('export_div', _("TITLE_tablecopy_copy"),
                        _("MSG_tablecopy_feedback")
                        + iframe + add_ticket(
                            year + '/' + semester + '/' + ue + '/tablecopy/'
                            + year + '/' + semester + '/' + option + '/' + newname)
                        + '">' + '</iframe>',
                        "", false);
                break;
        }
    else {
        tablecopy_toggle(id, true);

        if (!tablecopy_toggle('c')) {
            tablecopy_toggle('c', true);
            Alert("ALERT_tablecopy_columns");
        }
        if (tablecopy_toggle('U') && !tablecopy_toggle('H')) {
            if (id != 'U')
                Alert("ALERT_tablecopy_upload_without_history");
            tablecopy_toggle('H', true);
            tablecopy_toggle('C', true);
        }
        if (tablecopy_toggle('H') && !tablecopy_toggle('C')) {
            if (id != 'H')
                Alert("ALERT_tablecopy_history_without_content");
            tablecopy_toggle('C', true);
        }
    }
}

function table_copy() {
    var future, past, ts, st, current, previous, next, rename;
    var future_year, past_year, next_year;
    var next_ys = next_year_semester(year, semester);
    var previous_ys = previous_year_semester(year, semester);

    current = year + '<br>' + semester + '<br>' + ue + '<br>';
    previous_year = '<b>' + (year - 1) + '</b><br>' + semester + '<br>' + ue;
    previous = previous_ys[0] + '<br><b>' + previous_ys[1] + '</b><br>' + ue;
    next = next_ys[0] + '<br><b>' + next_ys[1] + '</b><br>' + ue;

    future = table_copy_button('F', '&nbsp;→&nbsp;',
        _("TITLE_tablecopy_to_future") + '<br>'
        + _("TIP_tablecopy_warning_from"), false, false);

    next_year = '<b>' + (Number(year) + 1) + '</b><br>' + semester + '<br>' + ue;
    future_year = table_copy_button('NY', '&nbsp;→&nbsp;',
        _("TITLE_tablecopy_to_future") + '<br>'
        + _("TIP_tablecopy_warning_from"),
        false, false);

    past_year = table_copy_button('PY', '&nbsp;→&nbsp;',
        _("TITLE_tablecopy_from_past_year") + '<br>'
        + _("TIP_tablecopy_warning_to"),
        false, false);

    past = table_copy_button('P', '&nbsp;→&nbsp;',
        _("TITLE_tablecopy_from_past") + '<br>'
        + _("TIP_tablecopy_warning_to"),
        false, false);

    rename = table_copy_button('R', '&darr;',
        _("TITLE_tablecopy_copy") + '<br>'
        + _("TIP_tablecopy_warning_from"),
        false, false);

    st = table_copy_button('ST', '&darr;', _("TITLE_tablecopy_import"), false, false);
    ts = table_copy_button('TS', '&uarr;', _("TITLE_tablecopy_export"), false, false);

    create_popup('import_div', _("TITLE_tablecopy"),
        _("MSG_tablecopy") + '<br>'
        + table_copy_button('c', _("B_tablecopy_columns"),
            _("TIP_tablecopy_columns"), true)
        + _("TIP_tablecopy_and")
        + table_copy_button('C', _("B_tablecopy_content"),
            _("TIP_tablecopy_content"))
        + _("TIP_tablecopy_and")
        + table_copy_button('H', _("TIP_tablecopy_history"),
            _("TIP_tablecopy_history"))
        + _("TIP_tablecopy_and")
        + table_copy_button('U', _("B_Upload"),
            _("B_Upload"))
        + '<br>&nbsp;<br>'
        + '<table border class="table_copy_diagram">'
        + '<colgroup>'
        + '<col width="30%"><col width="3%"><col width="30%"><col width="3%"><col width="30%">'
        + '</colgroup>'
        + '<tr><td colspan="2">'
        + _("MSG_tablecopy_arrow")
        + '<th>' + _("MSG_tablecopy_spreadsheet") + '<td><td></tr>'
        + '<tr><td><td><td>' + st + '&nbsp;' + ts + '<td><td></tr>'

        + '<tr><th>' + previous_year + '<td>' + past_year
        + '<th rowspan="2" style="background:#FF0"><b>' + current
        + '<td>' + future + '<th>' + next + '</tr>'

        + '<tr><th>' + previous + '<td>' + past
        + '<td>' + future_year + '<th>' + next_year + '</tr>'

        + '<tr><td><td><td>' + rename + '</tr>'
        + '<tr><td><td><th colspan="3">'
        + year + '<br>' + semester + '<br>'
        + '<input id="newname" style="font-weight:bold" value="'
        + encode_value(ue) + '"></tr>'
        + '</table>'
        , '', false);
}


var table_create_slot = ["TD", "TP", "", "", "", "", "", ""];

function table_create_columns(columns_list) {
    for (var i in columns_list) {
        i = columns_list[i];
        var column = columns[add_empty_columns()];

        column_attr_set(column, 'title', i.title);
        column_attr_set(column, 'type', i.type, undefined, true);
        for (var k in i)
            if (k != "title" && k != "type")
                column_attr_set(column, k, i[k]);
    }
    update_columns();
    table_fill(true, true, true);
    popup_close();
}

function table_create_compute_columns() {
    var nr = Number(document.getElementById('table_create_nr').value);
    var c = [];
    var used = {};
    var all = [];

    for (var n = 1; n <= nr; n++) {
        for (var i in table_create_slot) {
            var title = document.getElementById('table_create_' + i).value;
            if (title !== '') {
                title = title.replace(/ /g, '_') + n;
                all.push(title);
                if (used[title] === undefined
                    && data_col_from_col_title(title) === undefined) {
                    c.push({ title: title, type: "Prst" });
                    used[title] = true;
                }
            }
        }
    }
    if (data_col_from_col_title("#" + abi) === undefined)
        c.splice(0, 0,
            {
                title: "#" + abi, type: "Nmbr", test_filter: abi, rounding: 1,
                columns: all.join(' ')
            });
    return c;
}

function table_create_columns_do() {
    table_create_columns(table_create_compute_columns());
}

function table_create_update() {
    var c = table_create_compute_columns();
    var s = [];
    for (var i in c)
        s.push(c[i].title);
    document.getElementById('table_create_button').innerHTML =
        _("MSG_table_create_do") + html(s.join(', '));
}

function table_create() {
    var c = [];
    for (var i in table_create_slot)
        c.push('<input id="table_create_' + i
            + '" style="width:4em" value="' + table_create_slot[i] + '">');
    var t = caution_message()
        + '<div onkeyup="table_create_update()">'
        + _("MSG_table_create_slot") + "<br>"
        + c.join(' ') + '<br>'
        + _("MSG_table_create_number")
        + '<input id="table_create_nr" value="4" size="2" maxlength="2"><br>'
        + '<button id="table_create_button" onclick="table_create_columns_do()">'
        + '</button> '
        + '</div>'
        ;
    create_popup("popup_tc", _("MSG_table_create"), t, '', false);
    table_create_update();
}




function get_attr_localized(name) {
    var x = 'LABEL_tablelinear_column_' + name;
    if (x != _(x))
        return _(x);
    x = 'BEFORE_column_attr_' + name;
    if (x != _(x))
        return _(x);
    return '';
}

function table_export() {
    // Compute columns list to exports
    var cols = [];
    var cls = column_list_all();
    for (var column in cls) {
        column = columns[cls[column]];
        if (column.is_empty)
            continue;
        if (column.author == '*') // ro_user
            continue;
        cols.push(column);
    }
    // In order to put the title first
    var attr_order = ['type', 'title', 'weight', 'columns', 'minmax'];
    for (var c in column_attributes) {
        if (column_attributes[c].computed || c == 'position' || c == 'qrcode_prst')
            continue;
        if (myindex(attr_order, c) != -1)
            continue;
        attr_order.push(c);
    }

    // Compute attributes having at least one value != default
    var attrs = [];

    for (var c in attr_order) {
        c = attr_order[c];
        for (var column in cols) {
            column = cols[column];
            if (column[c] != column_attributes[c].default_value || c == 'type') {
                attrs.push(column_attributes[c]);
                break;
            }
        }
    }

    var s = '<div style="height:15em;width:100%;overflow:auto"><table class="colored"><tr>';
    for (var c in attrs)
        s += '<th>' + attrs[c].name + ' '
            + get_attr_localized(attrs[c].name).replace(/ /g, ' ');

    for (var column in cols) {
        column = cols[column];
        s += '<tr>';
        for (var c in attrs)
            s += bs + html(attrs[c].formatter(column, column[attrs[c].name]).toString()).replace(/[+]/g, "ᐩ").replace(/[/]/g, "∕"); // Disable spreadsheet evaluation
        ;
        s += '\n</tr>';
    }
    s += '\n</table></div>\n' + _("MSG_tableexport_after");
    create_popup('export_div', _('TIP_table_attr_t_export'),
        _("MSG_tableexport"), s, false);
    var t = popup_get_element().getElementsByTagName('TABLE')[0];
    if (window.getSelection)
        window.getSelection().selectAllChildren(t);
}


function table_import() {
    create_popup('import_div', _("TITLE_tableimport"),
        _("MSG_tableimport_before"), _("MSG_tableimport_after")
        + '<BUTTON OnClick="import_columns_do();">'
        + _("B_tableimport") + '</BUTTON>.');
}

function import_columns_do() {
    // Do not remove padding here (IE bug on split)
    var import_lines = popup_value(true);
    var lines = [];
    var item;
    var attr, attrs;
    for (var line in import_lines) {
        line = import_lines[line];
        // Disable spreadsheet evaluation
        line = line.replace(/ᐩ/g, "+").replace(/∕/g, "/");
        item = line.split('\t');
        if (attrs) {
            if (item.length == attrs.length && type_title_to_type(item[0]))
                lines.push(item);
        }
        else {
            attrs = [];
            for (var i in item) {
                attr = column_attributes[item[i].split(' ')[0]];
                if (attr)
                    attrs.push(attr);
            }
            if (attrs.length != item.length)
                // Did not found the line with column attributes
                // So will retry on the next line
                attrs = undefined;
        }
    }
    if (lines.length == 0) {
        Alert("ALERT_tableimport");
        return;
    }
    var cols = [];
    alert_append_start();
    for (var line in lines) {
        line = lines[line];
        var column = columns[add_empty_columns()];
        var title;
        for (var i in attrs) {
            if (attrs[i].name == 'title') {
                title = line[i].replace(/ /g, '_');
                break;
            }
        }
        if (data_col_from_col_title(title) === undefined)
            create_column(column, title);

        for (var i in attrs) {
            attr = attrs[i].name;
            if (attr != 'type' && !column_modifiable_attr(attr, column))
                continue;
            if (attr == 'title')
                continue;
            if (attr == 'visibility_date') {
                var v = line[i] !== '' && get_date(line[i])
                if (v && v.getTime() < millisec())
                    continue; // Do not record old dates
            }
            column_attr_set(column, attr, line[i], undefined, true);
        }

        cols.push(column);
    }
    // 3 loops because of the formula (dependencies)
    for (var i in cols) {
        init_column(cols[i]);
    }
    popup_close();
    alert_append_stop();
    table_fill(true, true);
}



function table_clean_do() {
    alert_append_start();
    for (var i in filtered_lines)
        if (filtered_lines[i][5].value == 'non') {
            for (var datacol in columns) {
                if (filtered_lines[i][datacol].comment !== '')
                    comment_change(filtered_lines[i].line_id, datacol, '');
                if (filtered_lines[i][datacol].value !== '')
                    cell_set_value_real(filtered_lines[i].line_id, datacol, '');
                columns[datacol].need_update = true;
            }
        }
    alert_append_stop();
    update_columns();
    table_init();
    table_fill(false, true);
}

function table_clean() {
    var nr = 0;
    for (var i in filtered_lines)
        if (filtered_lines[i][5].value == 'non')
            nr++;
    if (nr == 0)
        Alert("MSG_table_clean_nothing");
    else if (confirm(_("CONFIRM_table_clean").replace('{}', nr)))
        table_clean_do();
}


function table_delete_do() {
    create_popup('import_div', _("TITLE_table_attr_table_delete"),
        '<IFRAME SRC="' +
        add_ticket(year + '/' + semester
            + '/' + ue + '/delete_this_table')
        + '"></IFRAME>', '', false);
    is_a_virtual_ue = true; // To not recreate the UE immediatly
}

function table_delete() {
    if (confirm(_("CONFIRM_table_delete") + ' ' +
        year + '/' + semester + '/' + ue))
        table_delete_do();
}






/*
 * Set the column title and change formula if necessary.
 * Returns the new title.
 */

function replace_recursive(value, old_value, new_value) {
    if (value.toLowerCase) {
        return (' ' + value + ' ').replace(old_value, new_value).trim();
    }
    if (value.slice) {
        var result = [];
        for (var i in value) {
            result.push(replace_recursive(value[i], old_value, new_value));
        }
    } else {
        var result = {};
        for (var i in value) {
            result[i] = replace_recursive(value[i], old_value, new_value);
        }
    }
    return result;
}

function column_attr_try_replace(formula_column, attr, old_value, new_value,
    job_to_do, old_value2, new_value2) {
    var value = formula_column[attr];
    if (value.trim)
        value = value.trim();
    var w = replace_recursive(value, old_value, new_value);
    if (old_value2)
        w = replace_recursive(w, old_value2, new_value2);
    // Will assume that dictionnary order do not change
    if (!value.trim) {
        w = JSON.stringify(w);
        value = JSON.stringify(value);
    }
    if (w != value) {
        if (!column_change_allowed(formula_column))
            return true;
        job_to_do.push([formula_column, attr, w]);
    }
}

function protect_regexp(re) {
    return re.replace(/([*\\[.$+?()])/g, '\\$1');
}

function protect_regexp_right(re) {
    return re.replace(/\$/g, '\\$');
}

function set_title(value, column, xcolumn_attr) {
    value = value.trim().replace(/[[\] ]/g, '_');
    if (value === '')
        value = ".";

    for (var data_col in columns)
        if (data_col != column.data_col
            && column.data_col // For display_suivi()
            && !xcolumn_attr
            && columns[data_col].title == value) {
            return column_attributes.title.check_and_set(value + '_bis', column,
                xcolumn_attr);
        }

    if (xcolumn_attr === false && column.title !== '') {
        var job_to_do = [];
        var title = protect_regexp(column.title);

        for (var data_col in columns) {
            var formula_column = columns[data_col];
            var new_name = protect_regexp_right(value);
            var s1 = RegExp("\\[" + title + "\\]", "g");
            var s2 = "[" + new_name + "]";
            var ss1 = RegExp(' ' + title + ' ', "g");
            var space_name = ' ' + new_name + ' ';
            var changes = [
                ['visibility_date', s1, s2],
                ['columns', ss1, space_name],
                ['groupcolumn', ss1, space_name],
                ['green', s1, s2],
                ['greentext', s1, s2],
                ['red', s1, s2],
                ['redtext', s1, s2],
                ['cell_writable', s1, s2],
                ['alert', s1, s2],
                ['trigger', s1, s2, ss1, space_name]
            ];
            for (var i in changes) {
                i = changes[i];
                if (column_attr_try_replace(formula_column, i[0],
                    i[1], i[2], job_to_do, i[3], i[4])) {
                    alert_append(_("ALERT_columntitle_unchangeable")
                        + '\n\n' + column.title + ' ∈ '
                        + formula_column.title + '('
                        + formula_column.author + ')');
                    return column.title;
                }
            }
        }
        // Title change is possible
        column.title = value; // Now to enable filter compilation
        for (var i in job_to_do) {
            if(job_to_do[i][1] == 'trigger')
                column.trigger = job_to_do[i][2];
            column_attr_set(job_to_do[i][0], job_to_do[i][1], job_to_do[i][2],undefined,true);
        }
    }
    column.title = value;
    slash_in_title();
    return column.title;
}


TRIGGER_RECORDS = { 'filter': 0, 'column': '', 'value': ''};

function configure_trigger_record() {
    var new_config = [];
    var nbr = Object.keys(popup_column().trigger).length + 1;
    for (var i = 0; i < nbr; i++) {
        var conf = {};
        var record = false;
        for (var name in TRIGGER_RECORDS) {
            var value = document.getElementById('trigger_' + name + '_' + i).value.strip();
            if (value !== '') {
                conf[name] = value;
                record = true;
            }
        }
        if (record)
            new_config.push(conf);
    }
    column_attr_set(popup_column(), 'trigger', new_config, undefined, true);
    popup_close();
}

function trigger_colorize() {
    var nbr = Object.keys(popup_column().trigger).length + 1;
    var errors = [];
    for (var i = 0; i < nbr; i++) {
        for (var name in TRIGGER_RECORDS) {
            var element = document.getElementById('trigger_' + name + '_' + i);
            if (!element)
                continue;
            var value = element.value;
            element.style.color = "#000";
            if(name == 'column' && value !== '')
                value = '[' + value + ']';
            value = value.split('[');
            for (var j in value) {
                if (j == 0)
                    continue;
                var title = value[j].split(']');
                if (title[1] !== undefined
                    && data_col_from_col_title(title[0]) === undefined) {
                    element.style.color = "#F00";
                    errors.push(_("TITLE_column_attr_trigger")
                        + ' «' + html(popup_column().title) + '» : '
                        + _("ALERT_columns_unknown_title") + title[0] + '»<br>');
                }
            }
        }
    }
    set_message('column_trigger', 2, errors.join(''));
}

function configure_trigger() {
    var column = the_current_cell.column;
    var config = column.trigger;
    config.push({});
    var content = ['<p style="margin:2em">', _('TIP_column_attr_trigger'), '<table onkeyup="trigger_colorize()">'];
    for (var name in TRIGGER_RECORDS) {
        content.push('</tr><tr><td colspan="' + config.length + '">'
            + _('MSG_trigger_' + name) + '</tr><tr>');
        for (var i in config) {
            content.push('<td>');
            id = 'trigger_' + name + '_' + i;
            content.push('<input id="' + id + '" value="');
            content.push(encode_value(config[i][name] || ''));
            content.push('">');
        }
    }
    content.push('</tr></table>');
    create_popup('import_div',
        html(column.title) + ' <button onclick="configure_trigger_record()">'
        + _('LABEL_save') + '</button>',
        content.join('').replace('</tr>', ''), '', false);
    trigger_colorize();
    config.pop();
}

function do_table_update_content() {
    var form = popup_get_element();
    var inputs = form.getElementsByTagName('INPUT');
    var s = '';
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].name == 'merge_students') {
            table_attr.merge_students = inputs[i].value;
            s += '/merge_students=' + encode_uri(inputs[i].value);
        }
        else if (inputs[i].checked)
            s += '/' + inputs[i].name;
    }
    if (s === '')
        Alert("ALERT_table_update_nothing");
    else
        append_image(undefined, 'update_content' + s);
    popup_close();
}

function table_update_content(_the_id) {
    function input(name, more) {
        return '<div style="margin: 1em">'
            + '<label><input type="checkbox" name="' + name + '"' + more
            + ' style="vertical-align: top">'
            + '<div style="display: inline-block;">'
            + _('MSG_table_update_' + name) + '</div></label></div>';
    }
    create_popup('import_div', _("TITLE_table_attr_update_content"),
        '<p>' + _("MSG_table_update_intro")
        + input('remove', '')
        + input('add', '')
        + input('mail', ' checked')
        + input('abj', ' checked')
        + input('column', ' checked')
        + '<div style="margin: 1em"><input name="merge_students" style="width:50%" value="'
        + encode_value(table_attr.merge_students) + '"'
        + (i_am_the_teacher ? '' : ' disabled')
        + '> '
        + _("TIP_table_merge_students")
        + (i_am_the_teacher ? '' :
           ' <span style="color:#800">' + _("ERROR_value_not_modifiable") + '</span>')
        + '</div>'
        + '<p><button onclick="do_table_update_content()">'
        + _('TITLE_table_attr_update_content') + '</button>'
        , '', false);
}



function upload_zip() {
    var s = year + '/' + semester + '/' + ue
        + '/upload_zip/' + the_current_cell.column.the_id
        + '/';
    var t = [];
    if (Object.keys(lines).length == filtered_lines.length)
        t.push('*');
    else
        for (var i in filtered_lines)
            t.push(filtered_lines[i].line_id);
    var size = 0;
    var data_col = the_current_cell.column.data_col;
    for (var i in filtered_lines)
        size += Number(filtered_lines[i][data_col].value);
    size /= 1000000; // GB
    if (size > 1) {
        if (!confirm(_("TITLE_column_attr_upload_zip") + ' : ' + size.toFixed(1) + ' Giga'))
            return;
    }
    t.push(ue + "_" + safe_url(the_current_cell.column.title) + ".zip");
    s += t.join('/');

    window.open(add_ticket(s));
}






function column_visibility_formatter(_column, value) {
    var input = document.getElementById('t_column_visibility_date');
    var s = document.getElementById('t_column_visibility');
    if (input) {
        set_editable(input, value == 0);
        if (value == 0) {
            input.style.position = "initial";
            input.style.top = 'initial';

        } else {
            input.style.position = "absolute";
            input.style.top = '-100px';
        }
        switch (value) {
            case 0:
            case 6:
                s.style.width = "var(--widthleft)";
                break;
            case 1:
            case 2:
            case 5:
                s.style.width = "100%";
                break;
            case 3:
            case 4:
                s.style.width = "50%";
                break;
        }
        if (value == 3 || value == 4) {
            var e = document.getElementById("visibility_link");
            e.href = suivi.split('/=')[0]
                + (value == 3 ? "/public/" : "/public_login/")
                + year + "/" + semester + "/" + ue;
            e.innerHTML = value == 3 ? _("MSG_visibility_link") : _("MSG_visibility_login");
        }
    }
    return value;
}


function set_visibility_date(value, column, xcolumn_attr) {
    column.visibility_date_filter = undefined;
    if (value === '')
        return value;
    v = get_date(value);
    if (v == false) {
        column.visibility_date_filter = compile_filter_generic(value, column, true);
        var errors = column.visibility_date_filter.get_filter_errors();
        if (errors) {
            if ( xcolumn_attr !== false ) {
                // This columns visibility depends on an unknown column
                // If we are here then the server agree to make this column visible.
                // It may happen when importing column definition
                return value;}
            Alert("ALERT_columnvisibility_date_invalid", value
                + '\n' + errors.replace(/<br>/g, '\n'));
            return value;
        }
        return value;
    }
    if (xcolumn_attr === false) {
        // Interactive change
        var now = new Date();
        if ((v.getTime() - now.getTime()) / (86400 * 1000) > max_visibility_date) {
            alert(_("ALERT_columnvisibility_date_far_futur") + ' '
                + max_visibility_date + ' '
                + _("ALERT_columnvisibility_date_far_futur2")
            );
            v.setTime(now.getTime() + (max_visibility_date-1) * 86400 * 1000);
        }
        if (v.getTime() + 86400 * 1000 - now.getTime() < 0) {
            Alert("ALERT_columnvisibility_date_past");
            v = now;
        }
    }
    v = '' + v.getFullYear() + two_digits(v.getMonth() + 1) + two_digits(v.getDate());
    return v;
}


/******************************************************************************
Check the 'weight' of a column.
******************************************************************************/

function set_weight(value, column) {
    value = value.replace(',', '.'); // To send the good value to the server
    var v = a_float(value);

    column.real_weight_add = true; // Pondered average

    if (isNaN(v)) {
        v = 0;
        value = '0';
    }
    else if (value === '') {
        v = 1;
        value = '1';
    }
    else {
        if (value.substr(0, 1) == '+' || value.substr(0, 1) == '-')
            column.real_weight_add = false;
    }

    column.real_weight = v;
    column.need_update = true;

    return value;
}



function best_worst_value(value, column) {
    if (column.historical_comment)
        return '';

    column.need_update = true;
    value = Number(value);
    if (isNaN(value))
        value = 0;
    if (value < 0)
        value = 0;
    else
        value = Math.floor(value);
    return value;
}

function set_best(value, column) {
    value = best_worst_value(value, column);
    if (value !== '')
        column.best_of = -value;
    return value;
}

function set_worst(value, column) {
    value = best_worst_value(value, column);
    if (value !== '')
        column.mean_of = -value;
    return value;
}


function set_rounding(value, column, xattr) {
    column.need_update = true;
    if (value === '' || isNaN(value))
        value = rounding_default;
    else {
        value = a_float(value);
        if (value < 0)
            value = -value;
        if (value < rounding_min)
            value = rounding_min;
    }
    if (xattr === false && value > rounding_avg && column.type == "Moy")
        alert(_("ALERT_avg_rounding") + ' ' + rounding_avg);

    column.round_by = value;

    var digit = Math.max(0, -Math.floor(Math.log(value) / Math.log(10)));

    column.do_rounding = function (v) {
        return v.toFixed ? do_round(v, value, column.table.rounding,
            column.old_function).toFixed(digit) : v;
    };

    return value;
}



// FOLLOWING CODE IS COMPUTED FROM 'COLUMN_TYPES' content


/* Check of the 'type' cell in the header. */

function type_title_to_type(title) {
    for (var v in types)
        if (types[v].title == title)
            return types[v];
    // alert_append('bug type_title_to_type : ' + title);
}

function compile_filter_generic(value, column, error_if_hidden) {
    var column_type;
    if (column)
        column_type = column.type;
    else
        column_type = 'Text';
    var g = new Filter(value, column_type);
    function get_filter_errors() {
        errors = this.the_filter.get_errors() || '';
        if (error_if_hidden) {
            var used = this.the_filter.other_data_col();
            for (var i in used) {
                if (!columns[used[i]].is_visible()) {
                    errors += html('«' + columns[used[i]].title + '» '
                        + _("MSG_depends_on_invisible")) + '<br>';
                }
            }
        }
        return errors === '' ? undefined : errors;
    }
    var fct = g.compiled_js();
    fct.the_filter = g;
    fct.filter = value;
    fct.errors = g.get_errors(); // XXX Should remove
    fct.get_filter_errors = get_filter_errors.bind(fct);
    fct.error_if_hidden = error_if_hidden;
    return fct;
}

function set_filter_generic(value, column) {
    column.real_filter = compile_filter_generic(value, column);
    column.filter_error = column.real_filter.errors;
    column_update_option('filter', value);
    return value;
}

function cell_select(event) {
    event = the_event(event);
    stop_event(event);
    the_current_cell.change();
    _d('cell select');
    cell_goto(the_td(event), false);
}

function text_format(c) {
    return c.toString();
}

function student_input(column) {
    return '_cell(this,\'' + year + '/' + semester
        + '/' + DisplayGrades.ue.ue + '/cell/' + column.the_id
        + '/' + DisplayGrades.ue.line_id + "');";
}

function submit_the_input_change(input, event, submit) {
    if (!input.has_been_updated) {
        input.has_been_updated = true;
        input.style.width = "40em";
        var enter = document.createElement('DIV');
        enter.innerHTML = '<button style="border-radius:1em;margin:0.5em;">'
            + _("MSG_cancel")
            + '</button><button style="border-radius:1em;margin:0.5em;">'
            + _("MSG_enter") + '</button>';
        enter.firstChild.onclick = hide_cellbox_tip;
        enter.lastChild.onclick = submit;
        input.parentNode.insertBefore(enter, input.nextSibling);
    }
    return the_event(event).real_event.key == 'Enter';
}

function create_suivi_input(submit) {
    if (submit)
        submit += ';';
    else
        submit = '';
    submit += student_input(DisplayGrades.column);
    submit = 'function submit(){' + submit + ';} ; submit = submit.bind(this)';

    var common = ' class="hidden"'
        + ' style="width:100%;box-sizing: border-box;"'
        + ' onpaste="this.onkeydown(event)"'
        + ' onfocus="this.onkeydown(event)"';

    if (DisplayGrades.column.multiline != 0)
        return '<textarea' + common
            + ' onkeydown="' + submit + ';submit_the_input_change(this, event, submit)"'
            + ' rows="4"'
            + '>' + html(DisplayGrades.value.toString()) + '</textarea>';
    return '<input' + common
        + ' onkeydown="' + submit
        + ';if ( submit_the_input_change(this, event, submit))'
        + '{ this.blur() ; submit() ; }'
        + '" value="' + encode_value(DisplayGrades.value.toString())
        + '"></input>';
}

function text_format_suivi() {
    if (cell_modifiable_on_suivi())
        return create_suivi_input('');

    var v = html(DisplayGrades.value.toString()).replace(/\n/g, '<br>');
    // To avoid non breaking long strings, replace _ by spaces
    if (v.indexOf(' ') == -1 && v.replace(/[^_]/g, '').length > 5)
        v = v.replace(/_/g, ' ');
    return v;
}

function _Text() {
    types.push({
        title: 'Text',
        tip_column_title: "TIP_column_title",
        tip_filter: "TIP_filter_Text",
        tip_cell: "TIP_cell_Text MSG_no_private_data",
        cell_test: test_nothing,
        cell_completions: test_nothing,
        cell_compute: undefined,
        cell_is_modifiable: 1,
        onmousedown: cell_select,
        formatte: text_format,
        formatte_suivi: text_format_suivi,
        should_be_a_float: 0,
        type_type: "data",
        type_change: undefined,
        human_priority: 0,
        hide_cell_comment: 0,
        hide_column_comment: 0
    });
    types[types.length - 1].index = types.length - 1;
    return types[types.length - 1];
}


function follow_url(in_value) {
    var url_base = the_current_cell.column.comment.split('BASE(');
    if (url_base.length == 1)
        url_base = the_current_cell.column.url_base;
    else {
        url_base = url_base[1].split(')')[0];
    }

    value = url_base + in_value.split(' ', 1)[0];
    var safe = value.replace(/[&%?]/, '');
    if (safe != value || (
        value.substr(0, 5) != 'http:' && value.substr(0, 5) != 'https:')) {
        if (!confirm(_("ALERT_follow_url") + "\n" + value)) {
            return value;
        }
    }

    window.open(value);
    return in_value;
}

function url_check_url(t) {
    create_popup("check_suivi_url", "",
        '<IFRAME src="' + t.value + '"></IFRAME>', '', false);
}

function url_format_suivi() {
    if (cell_modifiable_on_suivi())
        return create_suivi_input('url_check_url(this)');

    if (DisplayGrades.value === '' && DisplayGrades.column.url_base === '')
        return ' ';

    var value = DisplayGrades.value.toString().split(' ');
    var title;
    if (value.length > 1)
        title = value.slice(1).join(' ');
    else {
        if (DisplayGrades.column.url_title)
            title = DisplayGrades.column.url_title;
        else
            title = _("MSG_URL");
    }

    title = html(title);
    if (DisplayGrades.column.urlimg & 1)
        return '<img class="urlimg" src="' + encode_value(DisplayGrades.column.url_base + value[0]) + '">';
    return '<a target="_blank" href="' + encode_value(DisplayGrades.column.url_base
        + value[0]) + '">' + title + '</a>';
}


function _URL()
{
  var t = _Text() ;
  t.title = 'URL' ;
  t.attributes_visible = ['url_base', 'url_title', 'repetition', 'url_import', 'groupcolumn', 'urlimg'] ;
  t.formatte_suivi = url_format_suivi ;
  t.human_priority = 10 ;
  t.ondoubleclick = follow_url ;
  t.tip_cell = "TIP_cell_URL" ;
  return t ;
}

function _Rank()
{
  var t = _Text() ;
  t.title = 'Rank' ;
  t.attributes_visible = ['columns', 'weight', 'minmax'] ;
  t.cell_compute = compute_rank ;
  t.cell_is_modifiable = 0 ;
  t.human_priority = 8 ;
  t.tip_cell = "" ;
  t.type_change = 
function(column)
{
 column_attr_set(column, 'minmax', '[0;' + Object.keys(lines).length + '] ');
 column_attr_set(column, 'rounding', 1) ;
} ;
  t.type_type = "computed" ;
  return t ;
}

function test_date(value, _column) {
    if (value === '')
        return value;

    var date = value.split(/[- :_]+/, 1)[0];
    var v = date.split('/');
    if (v.length > 3) {
        alert_append(_('ALERT_date_format'));
        return;
    }

    var day, month, year;
    var today = new Date();
    if (v.length < 3)
        year = today.getFullYear();
    else {
        year = Number(v[2]);
        if (year < 100)
            if (year <= (today.getFullYear() - 2000) + 5) // 5 year in future
                year += 2000;
            else
                year += 1900;
    }
    if (year >= 2100) {
        alert_append(_('ALERT_date_invalid') + value);
        return;
    }
    if (v.length < 2)
        month = today.getMonth() + 1;
    else
        month = Number(v[1]);

    day = Number(v[0]);

    var d = new Date(year, month - 1, day);
    if (d.getDate() != day || d.getMonth() != month - 1 || d.getFullYear() != year) {
        alert_append(_('ALERT_date_invalid') + value);
        return;
    }
    day = two_digits(day);
    month = two_digits(month);

    var h = value.substr(date.length + 1);
    if (h !== '') {
        var hms = h.split(/[h:]/);
        var hour_ok = true;
        for (var i in hms)
            if (isNaN(hms[i]) || hms[i] < 0 || hms[i] >= 60) {
                hour_ok = false;
                hms[i] = 0;
            }
        if (hms[0] > 24)
            hour_ok = false;
        if (!hour_ok) {
            alert_append(_('ALERT_date_invalid') + value);
        }
        h = ' ' + two_digits(Number(hms[0])) + ':' + two_digits(Number(hms[1]) || 0)
            + (hms[2] !== undefined ? ':' + two_digits(Number(hms[2])) : '');
    }

    return day + '/' + month + '/' + year + h;
}

function _Date()
{
  var t = _Text() ;
  t.title = 'Date' ;
  t.attributes_visible = ['repetition', 'url_import', 'groupcolumn'] ;
  t.cell_test = test_date ;
  t.human_priority = 5 ;
  t.tip_cell = "TIP_cell_Date" ;
  t.tip_filter = "TIP_filter_Date" ;
  return t ;
}

function _Login()
{
  var t = _Text() ;
  t.title = 'Login' ;
  t.human_priority = 7 ;
  t.tip_cell = "TIP_cell_Login" ;
  return t ;
}

function completions_enumeration(value, column) {
    var c = [];
    for (var v in column.possible_values)
        if (column.possible_values[v].substr(0, value.length).toUpperCase()
            == value.toUpperCase())
            c.push(column.possible_values[v]);
    return c;
}

// Search the best approximation
function test_enumeration(value, column) {
    if (value === '')
        return '';

    for (var v in column.possible_values)
        if (column.possible_values[v] == value)
            return column.possible_values[v];

    for (var v in column.possible_values)
        if (column.possible_values[v].toUpperCase() == value.toUpperCase())
            return column.possible_values[v];

    alert_append(_('ALERT_invalid_value') + value
        + '\n\n' + column.possible_values.join(' ' + _('or') + ' ')
    );
    return;
}


function toggle_enumeration(value, column) {
    return toggle_PA(test_enumeration, value, column.possible_values, column);
}

function enumeration_format_suivi() {
    return enumeration_suivi(DisplayGrades.cellstats.enumeration);
}

function _Enumeration()
{
  var t = _Text() ;
  t.title = 'Enumeration' ;
  t.attributes_visible = ['enumeration', 'weight', 'repetition', 'url_import', 'groupcolumn'] ;
  t.cell_completions = completions_enumeration ;
  t.cell_test = test_enumeration ;
  t.formatte_suivi = enumeration_format_suivi ;
  t.ondoubleclick = toggle_enumeration ;
  t.tip_cell = "TIP_cell_Enumeration" ;
  return t ;
}

function safe_url(t) {
    return t.replace(RegExp('[#$%&?/\\\\: `]', 'g'), '_');
}

function upload_filename(t) {
    return safe_url(t.replace(/^[^;]*; [^ ]* */, ''));
}

function iframe_write(iframe, hook, content) {
    var iframew = iframe.contentWindow
        ? iframe.contentWindow
        : (iframe.contentDocument.document
            ? iframe.contentDocument.document
            : iframe.contentDocument);
    iframew.document.open();
    iframew.upload_file_choosed = hook;
    iframew.document.write(content);
    iframew.document.close();
}

function upload_popup(t, ue, col_id, lin_id, title) {
    add_ticket_checker(t);
    function answer(txt) {
        var length_type = txt.split('--OK--');
        if (length_type.length != 3)
            return;
        length_type = eval(length_type[1]);
        for (var i in display_data['Grades'][0]) {
            var obj_ue = display_data['Grades'][0][i];
            if (obj_ue.ue == ue)
                for (var j in obj_ue.columns)
                    if (obj_ue.columns[j].the_id == col_id) {
                        var cell = obj_ue.line[j];
                        cell[0] = length_type[0];
                        cell[1] = display_data['Login'];
                        cell[2] = (new Date()).formate('%Y%m%d%H%M%S');
                        cell[3] = length_type[1];
                        DisplayGrades.no_hover = false;
                        display_update_real();
                        return;
                    }
        }
    }
    function upload_file_choosed(t) {
        if (t.files[0].size > t.getAttribute('maxsize') * 1024) {
            alert(_("MSG_upload_fail_max") + '\n\n'
                + Math.floor(t.files[0].size / 1024) + _('Kb') + ' > '
                + t.getAttribute('maxsize') + _('Kb'));
            return;
        }
        t.nextSibling.value = t.value;
        progress_submit(t.parentNode, undefined, window.url_suivi ? answer : undefined);
    }
    var width = 24; // em
    var pos = findPos(t);
    var div = document.createElement('DIV');
    div.style.position = "absolute";
    div.style.background = "#FFF";
    div.style.width = width + 'em';
    div.style.border = "4px solid #000";
    div.style.zIndex = 100000;
    div.style.opacity = 0.9;
    div.innerHTML = '<button style="float:right;margin:0px" onclick="the_body.removeChild(this.parentNode)">×</button>'
        + '<span style="font-size: 150%">' + _("MSG_upload_new") + '</span>'
        + (title ? title : '');
    the_body.appendChild(div);
    if (pos[1] - scrollTop() < window_height() / 2)
        div.style.top = (pos[1] + (the_current_cell.input ? the_current_cell.input.offsetHeight : 0)) + "px";
    else
        div.style.bottom = (window_height() - pos[1]) + "px";
    if (pos[0] + div.offsetWidth > window_width())
        div.style.right = '0px';
    else
        div.style.left = pos[0] + 'px';

    var iframe = document.createElement('IFRAME');
    iframe.style.width = (width + 0.5) + 'em';
    iframe.style.height = "15em";
    div.appendChild(iframe);
    var column;
    if (t == the_current_cell.input)
        column = the_current_cell.column;
    else
        column = DisplayGrades.column;
    iframe_write(iframe,
        upload_file_choosed,
        '<body style="width:' + (width - 1) + 'em">'
        + '<form action="' + add_ticket(year + '/' + semester
            + '/' + ue + '/upload_post/' + col_id + '/' + lin_id)
        + '" method="POST" enctype="multipart/form-data">'
        + _('MSG_upload_file')
        + '<br>'
        + '<input type="file" name="data" maxsize="'
        + column.upload_max + '" onchange="upload_file_choosed(this)">'
        + '<input type="text" name="filename" hidden=1><br>'
        + column.upload_max + "KB " + _("Maximum")
        + (column.type == 'Annotate' ? '<br><b>' + _("ERROR_PDF_required") + '</b>' : '')
        + '</form>');
}

function upload_double_click(value) {
    if (value === '') {
        var ok = the_current_cell.cell.changeable(the_current_cell.line,
            the_current_cell.column);
        if (ok !== true) {
            alert(ok);
            return value;
        }
        upload_popup(the_current_cell.input, ue,
            the_current_cell.column.the_id, the_current_cell.line_id,
            '→' + html(the_current_cell.column.title) + '<br>'
            + html(the_current_cell.line[1].value + ' '
                + the_current_cell.line[2].value));
        return value;
    }
    var more = "";
    if (the_current_cell.cell.history_length('V') > 1) {
        if (!confirm(_("CONFIRM_upload_last")))
            more = "~";
    }
    var filename = the_current_cell.cell.comment;
    if (filename === '') {
        var g = lines_of_the_group(the_current_cell.column,
            the_current_cell.line_id);
        for (var i in g) {
            var comment = g[i][the_current_cell.column.data_col].comment;
            if (comment !== '') {
                filename = comment;
                break;
            }
        }
    }
    var url = add_ticket(year + '/' + semester + '/' + ue
        + '/upload_get/' + the_current_cell.column.the_id
        + '/' + the_current_cell.line_id + more
        + '/' + encodeURIComponent(the_current_cell.line[1].value) + '%20'
        + encodeURIComponent(the_current_cell.line[2].value)
        + '%20' + encodeURIComponent(upload_filename(filename)));
    if (filename.startsWith('video/'))
        display_video(url, filename.split(' ')[0]);
    else
        window.open(url);
    return value;
}

function display_video(download_url, mimetype) {
    create_popup('video_popup', '',
        '<style>DIV.video_popup { position: fixed; top: 0px; left: auto; right: 0px;}</style>'
        + '<video controls autoplay preload="auto" style="width:50vw;max-height:100vh;"><source src="' + download_url
        + '" type="' + mimetype
        + '"></video>', '', false);
}

function upload_format_suivi() {
    var value = DisplayGrades.value;
    if (value.toString().match(/^https?:\/\//))
        return url_format_suivi();
    var empty = (value === ''
        || value == DisplayGrades.column.empty_is
        || isNaN(value)
    );
    var s = [];
    var title = upload_filename(DisplayGrades.cell.comment);
    var download_url = url
        + (ticket == 'none' ? '' : '/=' + ticket) + '/'
        + DisplayGrades.ue.year + '/' + DisplayGrades.ue.semester
        + '/' + DisplayGrades.ue.ue
        + (ticket == 'none' ? '/upload_get_public/' : '/upload_get/')
        + DisplayGrades.column.the_id
        + '/' + DisplayGrades.ue.line_id
        + '/' + DisplayGrades.ue.ue + "_" + encodeURIComponent(safe_url(DisplayGrades.column.title))
        + "_" + encodeURIComponent(title);
    if (!empty) {
        if (DisplayGrades.column.url_title)
            DisplayGrades.cell.comment = DisplayGrades.cell.comment.replace(
                /^([^ ]* [^ ]* ).*/, "$1" + DisplayGrades.column.url_title);
        if (DisplayGrades.cell.comment.indexOf('video/') == 0)
            s.push('<a href="javascript:display_video(\'' + download_url
                + "','" + DisplayGrades.cell.comment.split(' ')[0] + '\')">'
                + _('MSG_upload_get') + ' ' + title + '</a>');
        else
            s.push('<a target="_blank" href="' + download_url + '">'
                + (display_data["Login"] ? _('MSG_upload_get') + ' ' : '')
                + title + '</a> '
                + DisplayGrades.column.do_rounding(DisplayGrades.value) + "KB");
    }
    if (cell_modifiable_on_suivi()) {
        s.push(
            '<a class="clickable" style="color:blue" onclick="upload_popup(this,'
            + js2(DisplayGrades.ue.ue)
            + ',' + js2(DisplayGrades.column.the_id)
            + ',' + js2(DisplayGrades.ue.line_id)
            + ',' + js2('→' + DisplayGrades.column.title) + ')">'
            + (empty
                ? _('MSG_upload_new')
                : _('MSG_upload_change')
            )
            + '</a>');
    }
    if (s.length === 0)
        return _('MSG_no_file_uploaded');

    return s.join('<br>');
}

function _Upload()
{
  var t = _Text() ;
  t.title = 'Upload' ;
  t.attributes_visible = ['rounding', 'weight', 'upload_max', 'upload_zip', 'groupcolumn', 'import_zip', 'url_title'] ;
  t.formatte = function(v, column) { if ( column.rounding === "" && v.toFixed ) return v.toFixed(3) ; else return column.do_rounding(v) ; } ;
  t.formatte_suivi = upload_format_suivi ;
  t.human_priority = 20 ;
  t.ondoubleclick = upload_double_click ;
  t.tip_cell = "TIP_cell_Upload" ;
  return t ;
}

// TODO : if the choice order is not defined by the student,
//        then do not take a random choice order.

var dispatch_debug = 'x12209214';

function dispatcher_format_suivi() {
    var key = DisplayGrades.ue.year + '/' + DisplayGrades.ue.semester + '/' + DisplayGrades.ue.ue
        + '/' + DisplayGrades.column.the_id + '/' + DisplayGrades.ue.line_id;
    dispatcher_format_suivi.infos[key] = {
        'column': DisplayGrades.column,
        'value': DisplayGrades.cell.value,
        'modifiable': cell_modifiable_on_suivi(),
        'cellbox': DisplayGrades.cellbox,
        'html_object': DisplayGrades.html_object
    };
    return '<button onclick="dispatcher_open(\'' + key + '\')">'
        + _("COL_TITLE_your_choice") + '</button>';
}

dispatcher_format_suivi.infos = {};

function dispatch_record(button) {
    var td = document.getElementById('dispatcher').rows[1].cells;
    var content = [];
    for (var i = 0; i < td.length; i++) {
        var items = dispatch_sorted(td[i]);
        var line = [];
        for (var j = 0; j < items.length; j++)
            line.push(items[j].lastChild.textContent);
        content.push(line.join(' '));
    }
    var where = dispatch_record.key.split('/');
    var infos = dispatcher_format_suivi.infos[dispatch_record.key];
    DisplayGrades.html_object = infos.html_object;
    DisplayGrades.cellbox = infos.cellbox;
    DisplayGrades.html_object.value = content.join('\n');
    DisplayGrades.column = infos.column;
    _cell(infos.html_object,
        where[0] + '/' + where[1] + '/' + where[2] + '/cell/' + where[3] + '/' + where[4]
    );
    popup_close();
}

function dispatch_sorted(td) {
    var content = [];
    for (var div of td.childNodes)
        content.push(div);
    content.sort(function (a, b) {
        return Number(a.style.top.replace('px', ''))
            - Number(b.style.top.replace('px', ''));
    });
    return content;
}

function dispatch_button(event) {
    if (event.target.tagName != 'BUTTON')
        return;
    var div = event.target.parentNode;
    var items = dispatch_sorted(div.parentNode);
    var i = items.indexOf(div);
    switch (event.target.textContent) {
        case '↑':
            if (i) {
                var y = items[i - 1].style.top;
                items[i - 1].style.top = div.style.top;
                div.style.top = y;
            }
            break;
        case '⤒':
            var y = items[0].style.top;
            for (var j = 0; j < i; j++)
                items[j].style.top = items[j + 1].style.top;
            items[j].style.top = y;
            break;
        case '⤓':
            var y = items[items.length - 1].style.top;
            for (var j = items.length - 1; j > i; j--)
                items[j].style.top = items[j - 1].style.top;
            items[i].style.top = y;
            break;
    }
}

function dispatcher_open(key) {
    var infos = dispatcher_format_suivi.infos[key];
    var config = JSON.parse(infos.column.dispatcher_config);
    dispatch_record.key = key;


    var content = [
        '<style>',
        'DIV.import_export { position: fixed; top: 5%; max-height: 90% }',
        '.dispatcher TD { vertical-align: top; position: relative}',
        '.dispatcher TD DIV { position: absolute; transition: top 1s }',
        '.dispatcher TR:first-child { height: 1.1em }',
        '.dispatcher { table-layout: fixed }',
        '.dispatcher TD { position: relative; }',
        '.dispatcher TR TD DIV:last-child { width: 100%; height: 0.5em }',
        '.export_div BUTTON { text-align: right; font-size: 100% }',
        '</style>',
        '<div style="max-height: 80vh;overflow: auto;">',
        '<table id="dispatcher" onclick="dispatch_button(event)" class="colored dispatcher"><tbody><tr>'
    ];
    var sorted = infos.value.split('\n');
    for (var i in config.choices)
        content.push('<th>' + html(config.choices[i].title));
    content.push('</tr><tr>');
    for (var i in config.choices) {
        content.push('<td>');
        var done = {};
        var todo = ((sorted[i] || '') + ' ' + config.choices[i].values).trim().split(/ +/);
        for (var j in todo) {
            if (!done[todo[j]]) {
                content.push('<div>');
                if (infos.modifiable)
                    content.push('<button>⤒</button> <button>↑</button> <button>⤓</button> ');
                content.push('<span>' + html(todo[j]) + '</span></div>');
                done[todo[j]] = true;
            }
        }
    }
    content.push('</tr></table></div>');
    create_popup('export_div', html(infos.column.title)
        + (infos.modifiable
            ? ' <button onclick="dispatch_record(this)">' + _("LABEL_save") + '</button>'
            : ''
        ),
        content.join(''), '', false);
    var dispatcher = document.getElementById('dispatcher');
    dispatcher.rows[1].style.height = dispatcher.rows[1].offsetHeight + 'px';

    for (var td of dispatcher.getElementsByTagName('TD')) {
        var y = 0;
        for (var div of td.childNodes) {
            div.style.top = y + 'px';
            y += 30;
        }
        td.style.height = y + 'px';
    }
}
function DispatchConfig() {
    // Get current configuration from current page content
    var tables = popup_get_element().getElementsByTagName('TABLE');
    this.columns = [];
    this.choices = [];
    var cols = tables[0].rows[1].cells;
    for (var i = 0; i < cols.length; i++) {
        cols[i].style.color = '#000';
        var values = cols[i].firstChild.value.trim().split(/ *\n[ \n]*/);
        var column = [];
        this.columns.push(column);
        for (var j in values) {
            var nr_slots = Number(values[j].replace(/ .*/, ''));
            if (isNaN(nr_slots)) {
                cols[i].style.color = '#F00';
                continue;
            }
            column.push([nr_slots, values[j].replace(/^[^ ]* /, '')]);
        }
    }
    var choices = tables[1].rows;
    for (var i = 1; i < choices.length; i++) {
        var values = choices[i].cells[2].firstChild.value.trim();
        if (values === '')
            continue;
        values = values.split(/ +/);
        var for_columns = {};
        for (var j in this.columns)
            for (var k in this.columns[j]) {
                for (var v in values)
                    if (this.columns[j][k][1].indexOf(values[v]) != -1) {
                        for_columns[j] = true;
                        break;
                    }
                if (for_columns[j])
                    break;
            }
        this.choices.push(
            {
                'title': choices[i].cells[1].firstChild.value.trim(),
                'values': values,
                'repetition': Number(choices[i].cells[3].firstChild.value),
                'weight': Number(choices[i].cells[4].firstChild.value),
                'for_columns': for_columns
            });
    }
}
DispatchConfig.prototype.record = function () {
    var config = { 'columns': [], 'choices': [] };
    for (var i in this.columns) {
        var values = [];
        for (var j in this.columns[i])
            values.push(this.columns[i][j][0] + ' ' + this.columns[i][j][1]);
        config.columns.push(values.join('\n'));
    }
    for (var i in this.choices)
        config.choices.push({
            'title': this.choices[i].title,
            'values': this.choices[i].values.join(' '),
            'repetition': this.choices[i].repetition,
            'weight': this.choices[i].weight
        });
    column_attr_set(
        popup_column(),
        'dispatcher_config',
        JSON.stringify(config),
        undefined, true);
    popup_close();
};

function dispatcher_change() {
    document.getElementById("start_stop").disabled = true;
}

function dispatcher_config() {
    if (!the_current_cell.column.columns.length) {
        Alert("MSG_analyser_no_columns");
        return;
    }
    var config = JSON.parse(the_current_cell.column.dispatcher_config);
    var content = [
        '<style>',
        '.import_div TEXTAREA { height: 22em; font-size: 100%; font-family: monospace,monospace }',
        'DIV.import_div { top: 5%; right: 5%; }',
        'E { font-family: emoji ; margin-left: -0.7em ; }',
        '</style>',
        _('MSG_dispatcher_columns'),
        '<table class="colored"><tr>'];
    for (var i in the_current_cell.column.average_from)
        content.push('<th>' + html(the_current_cell.column.average_from[i]));
    content.push('</tr><tr>');
    for (var i in the_current_cell.column.average_from)
        content.push('<td><textarea oninput="dispatcher_change()">' + (config.columns[i] || '') + '</textarea>');
    content.push('</tr></table>');
    content.push(_('MSG_dispatcher_choices'));
    content.push('<table class="colored"><tr><th><th>');
    content.push(_("MSG_dispatcher_title"));
    content.push('<th>');
    content.push(_("MSG_dispatcher_values"));
    content.push('<th>');
    content.push(_("BEFORE_column_attr_repetition"));
    content.push('<th>');
    content.push(_("BEFORE_column_attr_weight"));
    content.push('<th><button id="start_stop" onclick="DISPATCHER.run(true)">');
    content.push(_("MSG_dispatcher_do"));
    content.push('</button> <span id="nr_tries">0</span> ');
    content.push(_("MSG_dispatcher_do_tries"));
    content.push('</tr>');
    config.choices.push({});
    for (var i in config.choices) {
        var choice = config.choices[i];
        content.push('<tr>');
        content.push('<th>');
        content.push(Number(i) + 1);
        content.push('<td>');
        content.push('<input value="' + encode_value(choice.title || '') + '" oninput="dispatcher_change()">');
        content.push('<td>');
        content.push('<input value="' + encode_value(choice.values || '') + '" oninput="dispatcher_change()">');
        content.push('<td style="width:1em">');
        content.push('<input value="' + encode_value((choice.repetition || '1').toString()) + '" oninput="dispatcher_change()">');
        content.push('<td style="width:2em">');
        content.push('<input value="' + encode_value((choice.weight || '1').toString()) + '" oninput="dispatcher_change()">');
        if (i == config.choices.length - 1)
            content.push('<th style="width:20em"><button id="do_fill" disabled onclick="DISPATCHER.fill()">'
                + _("MSG_dispatcher_do_fill") + '</button>');
        else
            content.push('<td id="stats' + i + '" style="white-space:nowrap">');
        content.push('</tr>');
    }
    content.push('</table>');
    create_popup('import_div',
        html(the_current_cell.column.title)
        + ' <button onclick="(new DispatchConfig()).record()"'
        + (column_change_allowed(the_current_cell.column) ? '' : ' disabled')
        + '>'
        + _('LABEL_save') + '</button> '
        ,
        content.join(''), '', false);
    DISPATCHER.init();
}
function DStudent(line, choices) {
    // choices = [  [ word1, word2, ...], ...  ]
    this.line = line;
    this.choices = choices;
    this.login = this.line[0].value;
}

function Dispatcher() {
}

Dispatcher.prototype.init = function () {
    // Called on popup open
    this.column = popup_column(); // The dispatcher column
    this.datacol = this.column.data_col

    // Get filtered lines containing a missing choice
    this.lines = [];
    for (var i in filtered_lines) {
        var datacol_to_fill = this.column.average_columns;
        for (var j in datacol_to_fill)
            if (filtered_lines[i][datacol_to_fill[j]].value === '') {
                this.lines.push(filtered_lines[i]);
                break;
            }
    }
    this.students = undefined;
    this.state = undefined;
};

Dispatcher.prototype.run = function (click) {
    // Start or stop the search.
    if (!document.getElementById('start_stop')) {
        clearInterval(this.interval);
        this.interval = undefined;
        return;
    }
    if (click && this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
        document.getElementById('start_stop').textContent = _("MSG_dispatcher_do");
        this.state = 'suspended';
        document.getElementById('do_fill').removeAttribute('disabled');
        return;
    }
    switch (this.state) {
        case undefined:
            document.getElementById('do_fill').setAttribute('disabled', 'true');
            if (this.students) {
                document.getElementById('start_stop').removeAttribute('disabled');
                this.state = 'step';
            }
            else {
                document.getElementById('start_stop').setAttribute('disabled', 'true');
                this.config = new DispatchConfig();
                this.state = 'init';
                this.init_students();
                this.init_counters();
                this.init_all_possibilities();
                this.initialize = 0;
                this.nr_tries = 0;
                this.min_weight = 1e50;
            }
            this.interval = setInterval(this.run.bind(this), 1);
            return;
        case 'init':
            if (this.initialize < this.students.length) {
                this.students[this.initialize].select_value(this, true);
                document.getElementById('start_stop').textContent = this.initialize + '/' + this.students.length;
                this.initialize++;
            }
            else {
                this.state = 'step';
                document.getElementById('start_stop').textContent = _("MSG_dispatcher_do_stop");
                document.getElementById('start_stop').removeAttribute('disabled');
            }
            return;
        case 'step':
            this.step();
            return;
        case 'suspended':
            this.state = 'step';
            document.getElementById('do_fill').setAttribute('disabled', 'true');
            document.getElementById('start_stop').textContent = _("MSG_dispatcher_do_stop");
            this.interval = setInterval(this.run.bind(this), 1);
            return;
    }
};

Dispatcher.prototype.step = function () {
    function cmp(a, b) {
        return a.selected_weight - b.selected_weight;
    }
    document.getElementById('nr_tries').innerHTML = ++this.nr_tries;
    this.students.sort(cmp);

    // Search the worst case
    for (var i = this.students.length - 1; i >= 0; i--) {
        var worst = this.students[i];
        if (!worst.no_choice && Math.random() > 0.1)
            break;
    }
    // Record if it is the best dispatching found
    var weight = this.get_weight();
    if (weight < this.min_weight) {
        console.log(weight);
        this.min_weight = weight;
        // Record best choices
        for (var student of this.students)
            student.selected_best = student.selected;

        // Display stats
        for (var choice in this.config.choices) {
            var counters = [];
            for (var i in this.config.choices[choice].values)
                counters.push(0);

            for (var student of this.students) {
                if (student.no_choice)
                    continue;
                for (var i in student.choices[choice]) {
                    var word = student.choices[choice][i];
                    for (var value of student.selected)
                        if (value.indexOf(word) >= 0)
                            counters[i]++;
                }
            }
            document.getElementById('stats' + choice).textContent = ' '.join(counters) + ' ' + worst.stars(choice);
        }
    }

    var dream = {}; // What the worst choices needs
    worst.erase(this);
    worst.select_value(this, false);
    for (var value of worst.selected)
        dream[value] = true;
    worst.erase(this);

    var todo = [worst]
    // Erase the student choices needed to enhance the dream of the worst
    for (var i in this.column.average_columns) {
        for (var best of this.students) {
            if (best.selected && dream[best.selected[i]]) {
                best.erase(this);
                todo.push(best);
            }
        }
    }
    // Reaffectation (no choices done in last)
    for (var student of todo)
        if (!student.no_choice)
            student.select_value(this, true);
    for (var student of todo)
        if (student.no_choice)
            student.select_value(this, true);
};

Dispatcher.prototype.get_weight = function () {
    // We minimize the worst case, not the average
    var weight = 0, max_weight = 0;
    for (var student of this.students) {
        if (!student.no_choice) {
            // Only student who ordered choices
            weight += student.selected_weight;
            if (student.selected_weight > max_weight)
                max_weight = student.selected_weight;
        }
    }
    return max_weight + weight / 10000;
}
Dispatcher.prototype.init_students = function () {
    var students = this.students = [];
    for (var line of this.lines) {
        if (line[0].value === '')
            continue;
        var choices = line[this.datacol].value.split(/ *\n[\n ]*/);
        var clean = [];
        for (var j in this.config.choices) {
            var default_order = this.config.choices[j].values;
            default_order = default_order.slice();
            // Shuffle order for not answering students
            for (var n = 0; n < 3; n++) {
                var k = Math.round(Math.random() * (default_order.length - 1));
                var tmp = default_order[n];
                default_order[n] = default_order[k];
                default_order[k] = tmp;
            }
            if (line[0].value === dispatch_debug)
                console.log([this.config.choices[j].values, default_order]);
            // Search the good line of choices.
            // May not be the expected one if a criterium
            // was added after student answering
            var items;
            for (var k = 0; k < choices.length; k++) {
                items = (choices[k] || '').trim();
                if (items !== '') {
                    items = items.split(/ +/);
                    if (myindex(default_order, items[0]) != -1)
                        break; // Seems to match
                }
            }
            if (k === choices.length)
                items = [];
            // Add missing items
            for (var k in default_order)
                if (myindex(items, default_order[k]) == -1)
                    items.push(default_order[k]);
            if (line[0].value === dispatch_debug)
                console.log(JSON.stringify(items));
            clean.push(items);
        }
        students.push(new DStudent(line, clean));
        students[students.length - 1].no_choice = line[this.datacol].value === '' ? 1 : 0;
    }
    function no_choice_last(a, b) {
        return a.no_choice - b.no_choice;
    }
    students.sort(no_choice_last);
};

Dispatcher.prototype.init_counters = function () {
    this.free_slot = [];
    for (var i in this.column.average_columns) {
        var datacol = this.column.average_columns[i];
        var free_slot = {}
        // Initialise start values
        for (var slot of this.config.columns[i])
            free_slot[slot[1]] = slot[0];
        // Decremente on each usage
        for (var line in lines) {
            line = lines[line];
            if (line[0].value === '')
                continue;
            var value = line[datacol].value;
            if (value === '')
                continue;
            if (free_slot[value] !== undefined)
                free_slot[value]--;
        }
        this.free_slot.push(free_slot);
    }
};

Dispatcher.prototype.init_all_possibilities = function () {
    var possibilities = [''];
    for (var free_slot of this.free_slot) {
        var new_possibilities = [];
        for (var old of possibilities)
            for (var i in free_slot)
                if (free_slot[i])
                    new_possibilities.push(old + '\x00' + i);
        possibilities = new_possibilities;
    }
    this.possibilities = [];
    for (var i of possibilities)
        this.possibilities.push(i.substr(1).split('\x00'));
};

DISPATCHER = new Dispatcher();


DStudent.prototype.create_index = function (dispatcher) {
    // XXX Assume only one possible word
    // Speed up table, get all criterion
    // selected value → [ [index1, criterion1, word1], [index2, criterion2, word2], ]
    var indexes = {};
    for (var free_slot of dispatcher.free_slot)
        for (var value in free_slot) {
            var words = [];
            for (var j in dispatcher.config.choices) // Every criterion
                for (var k in this.choices[j])
                    if (value.indexOf(this.choices[j][k]) != -1) {
                        words.push([Math.pow(4, Number(k)) * dispatcher.config.choices[j].weight, Number(j), this.choices[j][k]]);
                        break;
                    }
            indexes[value] = words;
        }
    return indexes;
};

DStudent.prototype.select_value = function (dispatcher, check_max) {
    var repetitions = [];
    for (var choice of dispatcher.config.choices)
        repetitions.push(choice.repetition);
    var indexes = this.create_index(dispatcher);
    this.selected_weight = 1e100;
    this.selected = undefined;
    for (var dispatch of dispatcher.possibilities) {
        var weight = 0;
        var choosen = {};
        for (var i in dispatcher.column.average_columns) {
            var value = dispatch[i];
            var datacol = dispatcher.column.average_columns[i];
            if (this.line[datacol].value) { // Yet defined
                if (this.line[datacol].value != value) {
                    weight = 1e101;
                    break;
                }
                continue;
            }
            if (check_max && dispatcher.free_slot[i][value] <= 0) {
                weight = 1e102;
                break
            }
            for (var [k, j, val] of indexes[value]) {
                if ((choosen[val] || 0) < repetitions[j]) {
                    weight += k;
                    choosen[val] = (choosen[val] || 0) + 1;
                }
                else {
                    weight += 1e10;
                }
                if (weight > this.selected_weight)
                    break;
            }
            if (weight > this.selected_weight)
                break;
        }
        if (weight < this.selected_weight) {
            this.selected = dispatch;
            this.selected_weight = weight;
        }
    }
    if (this.selected)
        for (var i in this.selected)
            dispatcher.free_slot[i][this.selected[i]]--;
};

DStudent.prototype.erase = function (dispatcher) {
    if (this.selected) {
        for (var i in this.selected)
            dispatcher.free_slot[i][this.selected[i]]++;
        this.selected = undefined;
    }
};

DStudent.prototype.stars = function (choice) {
    var stars = '';
    for (var word of this.choices[choice]) {
        var i = '.';
        for (var value of this.selected)
            if (value.indexOf(word) >= 0)
                i = '*';
        stars += i;
    }
    return stars;
};

DStudent.prototype.toString = function () {
    var stars = '';
    for (var choice in this.choices) {
        stars += this.stars(choice) + ' | ';
    }
    return ' '.join([this.login, stars, this.selected_weight, this.selected]);
};

Dispatcher.prototype.fill = function () {
    var datacols = popup_column().average_columns;
    alert_append_start();
    for (var student of this.students) {
        var lin_id = login_to_line_id(student.login);
        if (student.selected_best)
            for (var j in datacols)
                cell_set_value_real(lin_id, datacols[j], student.selected_best[j]);
    }
    for (var j in datacols)
        columns[datacols[j]].need_update = true;
    columns[popup_column().data_col].need_update = true;
    alert_append_stop();
    popup_close();
    update_columns();
    table_init();
    table_fill(false, true);
}
function _Dispatcher()
{
  var t = _Text() ;
  t.title = 'Dispatcher' ;
  t.attributes_visible = ['columns', 'url_import', 'groupcolumn', 'dispatcher_config'] ;
  t.formatte_suivi = dispatcher_format_suivi ;
  t.human_priority = 9 ;
  t.tip_cell = "" ;
  return t ;
}

function Calendar(v, no_alert) {
    this.days = {};
    this.slots = {};
    this.day_slots = [];
    this.sorted_slots = [];
    this.start_minute = 24 * 60;
    this.end_minute = 0;
    var days = [];
    v = v.split(/[ \t\n]+/);
    for (var i in v) {
        if (v[i] === '')
            continue;
        var slot = v[i].split(':');
        if (slot.length != 2 || slot[0].length != 12 || isNaN(slot[0]) || isNaN(slot[1])) {
            this.error = _("ALERT_invalid_value") + v[i];
            if (!no_alert)
                alert(this.error);
            return;
        }
        var day = slot[0].substr(0, 8);
        if (this.days[day] === undefined) {
            var date = get_date_tomuss(day);
            this.days[day] = {
                name: date.formate('%a<br>%d %b'),
                slots: [],
                day: day
                // index will by added at the end
            };
            days.push(day);
        }
        var start_minute = 60 * Number(slot[0].substr(8, 2)) + Number(slot[0].substr(10));
        var duration = Number(slot[1]);
        this.slots[slot[0].substr(8)] = start_minute;
        day_slot = {
            index: i,
            start_label: slot[0].substr(8),
            start_minute: start_minute,
            duration: duration,
            day: this.days[day]
        };
        this.days[day].slots.push(day_slot);
        this.day_slots.push(day_slot);
        this.sorted_slots.push(day_slot);
        if (start_minute < this.start_minute)
            this.start_minute = start_minute;
        if (start_minute + duration > this.end_minute)
            this.end_minute = start_minute + duration;
    }
    days.sort();
    for (var i in days)
        this.days[days[i]].index = Number(i);
    this.error = '';

    function cmp_slots(a, b) {
        a = a.day.day + a.start_label;
        b = b.day.day + b.start_label;
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }
    this.sorted_slots.sort(cmp_slots);
}

Calendar.prototype.compute_stats = function (data_col) {
    this.stats = [];
    for (var j in this.day_slots)
        this.stats.push({});
    for (var i in filtered_lines) {
        var value = filtered_lines[i][data_col].value;
        for (var j in this.day_slots) {
            var char = value.substr(j, 1) || 'x';
            this.stats[j][char] = (this.stats[j][char] || 0) + 1;
        }
    }
};

Calendar.prototype.compute_export = function (data_col) {
    var content = ['<table><tr><td>'];
    for (var i in this.sorted_slots)
        content.push('<th>' + this.sorted_slots[i].day.day + this.sorted_slots[i].start_label);
    content.push('</tr><tr><td>');
    for (var i in this.sorted_slots)
        content.push('<th>' + this.sorted_slots[i].day.name + '<br>'
            + this.sorted_slots[i].start_label);
    content.push('</tr>');
    var translate = {
        'U': no, 'S': yes,
        'u': no.toLowerCase(), 's': yes.toLowerCase(),
        'x': ''
    }
    for (var i in filtered_lines) {
        content.push('<tr><th>' + filtered_lines[i][0].value);
        var value = filtered_lines[i][data_col].value;
        for (var j in this.sorted_slots)
            content.push('<td>' + translate[value.substr(this.sorted_slots[j].index, 1) || 'x']);
        content.push('</tr>');
    }
    content.push('</table>');
    return content.join('');
};

Calendar.prototype.html_content = function (selection, small, width, height,
    modifiable, stats) {
    var nr_columns = Object.keys(this.days).length;
    var header_height = small ? 0 : 27;
    var header_width = small ? 0 : 29;
    var start_minute = this.start_minute;
    var scale_x = (width - header_width) / nr_columns;
    var scale_y = (height - header_height) / (this.end_minute - this.start_minute);
    function div(char, x, y, height, text, modifiable) {
        content.push('<div class="slot slot' + char
            + '" '
            + ((modifiable && !small)
                ? 'onmousemove="calendar_action(the_event(event),' + slot.index + ',0)" '
                + 'onmousedown="calendar_action(the_event(event),' + slot.index + ',1)" '
                : '')
            + 'style="left:' + (x == -1 ? 0 : header_width + x * scale_x)
            + 'px;top:' + (y == -1 ? 0 : header_height + (y - start_minute) * scale_y)
            + 'px;height:' + scale_y * height
            + 'px;width:' + scale_x
            + 'px;' + ((modifiable || x == -1 || y == -1 || stats) ? '' : 'opacity:0.3;')
            + '">' + text + '</div>');
    }
    var content = [], text = '';
    if (!small)
        for (var i in this.slots)
            div('slotname', -1, this.slots[i], 60, i);
    for (var i in this.days) {
        var day = this.days[i];
        if (!small)
            div('dayname', day.index, -1, 60, day.name);
        for (var j in day.slots) {
            var slot = day.slots[j];
            var char = selection.substr(slot.index, 1) || 'x';
            if (stats && this.stats) {
                var counts = this.stats[slot.index];
                if (counts) {
                    text = '<span class="slots">' + ((counts['s'] || 0) + (counts['S'] || 0)) + '</span>';
                    text += '<span class="slotu">' + ((counts['u'] || 0) + (counts['U'] || 0)) + '</span>';
                }
                else
                    text = '';
            }
            div(char,
                day.index, slot.start_minute, slot.duration, text,
                modifiable && char == char.toLowerCase());
        }
    }
    return content.join('');
};

Calendar.prototype.html_div = function (selection, small, width, height, modifiable, stats) {
    return '<div ' + (small ? '' : 'id="the_calendar" ')
        + 'style="width:' + width + 'px;height:' + height
        + 'px;" class="the_calendar ' + (small ? 'calendar_small' : 'calendar_big')
        + '">' + this.html_content(selection, small, width, height, modifiable, stats) + '</div>';
};

Calendar.prototype.html = function (selection, small, width, height, modifiable, stats) {
    var div = document.createElement('DIV');
    div.innerHTML = this.html_content(selection, small, width, height, modifiable, stats);
    div.className = 'the_calendar ' + (small ? 'calendar_small' : 'calendar_big');
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    return div;
};

function calendar_save_configuration(event) {
    column_attr_set(popup_column(), 'calendar',
        popup_value().join('\n'), event.target, true);
    table_fill(true, true);
}

function calendar_update(_event, stats) {
    var calendar = new Calendar(popup_text_area().value, true);
    if (stats)
        calendar.stats = stats;
    popup_text_area().style.background = calendar.error ? "#FDD" : "#FFF";
    if (calendar.error === '')
        document.getElementById('the_calendar').outerHTML =
            calendar.html_div('', false, 3 * window_width() / 4, window_height() / 4, false, true);
    document.getElementById('calendar_feedback').innerHTML = calendar.error;
}

function calendar_configure() {
    var column = the_current_cell.column;
    column.Calendar.compute_stats(column.data_col);
    create_popup('import_div calendar_popup', _('B_Calendar')
        + ' «' + html(column.title) + '» '
        + '<button onclick="calendar_save_configuration(the_event(event))">' + _('LABEL_save')
        + '</button><span id="calendar_feedback"></span>',
        _("TIP_column_attr_calendar__").replace(/\n/g, '<br>'),
        '<div id="the_calendar"></div>',
        column.calendar);
    popup_text_area().onkeyup = calendar_update;
    calendar_update(undefined, column.Calendar.stats);
}

function calendar_export() {
    var column = the_current_cell.column;
    create_popup('import_div calendar_popup', _('B_Calendar')
        + ' «' + html(column.title) + '» ',
        column.Calendar.compute_export(column.data_col), '', false
    );
}

function set_calendar(v, column, xattr) {
    var old_cal = column.calendar.replace(/[ \n\t]+/, ' ');
    var new_cal = v.replace(/[ \n\t]+/, ' ');
    if (xattr === false // Interactive
        && !column_empty_of_cells(column.data_col)
        && (new_cal.length < old_cal.length || new_cal.substr(0, old_cal.length) != old_cal)
    ) {
        Alert('ALERT_calendar_slots')
        return column.calendar;
    }
    column.Calendar = new Calendar(v);
    return v;
}

var calendar_state = 'x';

function calendar_action(event, index, action) {
    var value = calendar_current
        ? calendar_current.value
        : (the_current_cell.input.value === ''
            ? the_current_cell.column.empty_is
            : the_current_cell.input.value)
    while (value.length <= index)
        value += 'x';
    if (action == 1)
        calendar_state = { 'x': 's', 's': 'u', 'u': 'x' }[value.substr(index, 1) || 'x'];
    else if (!event.buttons)
        return;
    value = value.substr(0, index) + calendar_state + value.substr(index + 1);
    if (calendar_current) {
        calendar_current.value = value;
        document.getElementById('the_calendar').outerHTML = calendar_patch();
    }
    else {
        the_current_cell.input.value = value;
        the_current_cell.update_cell_headers();
    }
    stop_event(event);
}

function calendar_save(event) {
    _cell({ value: calendar_current.value, parentNode: event.target.parentNode },
        year + '/' + semester + '/' + calendar_current.ue.ue
        + '/cell/' + calendar_current.column.the_id
        + '/' + calendar_current.ue.line_id);
}

var calendar_current;

function calendar_patch() {
    return calendar_current.html_div(
        calendar_current.value, false,
        600, 300, calendar_current.modifiable);
}

function calendar_suivi(nr) {
    calendar_current = all_calendars[nr];
    create_popup('import_div calendar_div', _('B_Calendar')
        + ' «' + html(calendar_current.column.title) + '» '
        + '<div><button onclick="calendar_save(the_event(event))">' + _('LABEL_save') + '</button></div>',
        calendar_patch(), '', false);
}

var all_calendars = [];

function calendar_format_suivi() {
    var calendar = DisplayGrades.column.Calendar;
    calendar.column = DisplayGrades.column;
    calendar.value = DisplayGrades.value;
    calendar.ue = DisplayGrades.ue;
    calendar.modifiable = cell_modifiable_on_suivi();
    all_calendars.push(calendar);
    return DisplayGrades.column.Calendar.html_div(
        DisplayGrades.value, true, 100, 20)
        .replace('<div', '<div onclick="calendar_suivi('
            + (all_calendars.length - 1) + ')"');
}

function _Calendar()
{
  var t = _Text() ;
  t.title = 'Calendar' ;
  t.attributes_visible = ['calendar', 'calendarexport'] ;
  t.formatte_suivi = calendar_format_suivi ;
  t.human_priority = 5 ;
  t.tip_cell = "" ;
  return t ;
}

function CompetenceTable() {
    this.display_state = 0;         // 0=Formation 1=UE 2=Column in observations and subcompetences
    this.do_update = false;         // true if the table need to be updated
    this.catalog = undefined;       // the current catalog
    this.list_sort = { type: 'name', ascending: true }    // sorting method : [str: sort type, bool: is ascending]
    this.catalog_exist = false;      // a catalog is loaded
    this.update_id = undefined;     // ID of the periodic popup update
    this.jump_old = undefined;      // The normal value for Current.prototype.jump()
    this.popup_close_jump_old = undefined;  // The normal value for popup_close()
    this.current_datas = null;              // The value of the current cell to update
    this.unknow_datas = null;       // Data uncomputable

    // HTML elements of the popup
    this.searchbar = undefined;     // Search INPUT
    this.detailed_line = null;      // The key of the unique detailed line if exist

    // Aggregation popups
    this.aggr_state = "average";            // Values : "average", "min", "max", "special"
    this.subcomps_aggr_state = "average";   // Values : "average", "min", "max", "special"
};

CompetenceTable.prototype.init_catalog_for = function (callback = null) {
    if (this.catalog)
        return callback ? callback(callback) : null;

    var catalog_name = 'INF.js';
    var script_catalog = document.createElement('SCRIPT');
    script_catalog.src = url + '/files/0/COMPETENCES/' + catalog_name;
    script_catalog.setAttribute('onload', "this.onloadDone=true");
    var THIS = this;
    script_catalog.onload = function (_event) {
        THIS.catalog = student_catalog;
        THIS.table_verify();
        THIS.catalog.complete_with_refine(table_attr.p_competence.refine, ue);
        update_comp_table_header();
        THIS.update_warnings();
        return callback ? callback(callback) : null;
    }
    document.head.appendChild(script_catalog);
};
CompetenceTable.prototype.try_open = function (comp_popup_opener) { 
    comp_popup_opener = this[comp_popup_opener].bind(this);
    this.init_catalog_for(comp_popup_opener);
    if (this.catalog)
        this.update_warnings();
};
CompetenceTable.prototype.init_popup_open = function () {
    this.popup_close_old = popup_close;
    popup_close = this.close.bind(this);
    this.do_update = true;
    this.update_id = setInterval(this.update.bind(this), 100);
};
CompetenceTable.prototype.init_line_popup = function () {
    the_current_cell.tr.classList.add('currentformline');
    the_current_cell.input.classList.add('currentformline');
    this.jump_old = Current.prototype.jump.bind(the_current_cell);
    Current.prototype.jump = this.jump.bind(this);
    document.body.addEventListener("keyup", this.onkey);
    this.init_popup_open();
};

CompetenceTable.prototype.state = function () {
    var popup = document.getElementById("popup_id");
    if (!popup)
        return null;

    var popup_classes = [...document.getElementById("popup_id").classList];

    if (popup_classes.includes("observations_content"))
        return "observations";
    if (popup_classes.includes("subcomps_content"))
        return "subcomps";
    if (popup_classes.includes("aggregate_content"))
        return "aggregate";
    if (popup_classes.includes("subcomps_aggregate_content"))
        return "subcomps_aggregate";
    if (popup_classes.includes("catalog_aggregate_content"))
        return "catalog_aggregate";
    if (popup_classes.includes("comp_result_content"))
        return "comp_result";
    if (popup_classes.includes("comp_grade_content"))
        return "comp_grade";
    return false;
};
CompetenceTable.prototype.table_verify = function () {
    update_table_competence(convert_table_attr(table_attr.p_competence));
    update_table_competence({}, 'subcompetences');
    update_table_competence([], 'keys');
    update_table_competence({}, 'grades_vocab');
    if (!table_attr.p_competence.formulas
        || !table_attr.p_competence.formulas.observations
        || !table_attr.p_competence.formulas.subcomps)
        update_table_competence({ 'observations': [], 'subcomps': [] }, 'formulas');

    // Grades weights
    var grades_weights = table_attr.p_competence.grades_weights;
    if (!grades_weights)
        grades_weights = new Array(OBSERVATION_COLORS.length);
    else
        grades_weights = [...grades_weights];
    for (var i in OBSERVATION_COLORS)
        if (!grades_weights[i] && grades_weights[i] !== 0)
            grades_weights[i] = i === '0' ? null : (i - 1) * 5;
    update_table_competence(grades_weights, 'grades_weights');

    // Catalog exist
    if (!Object.keys(this.catalog.items).length)
        return this.catalog_exist = false;
    this.catalog_exist = true;

    // Verify if the table has no misakes values
    var allowed_keys_ue = this.catalog.get_allowed_keys_ue(ue_code(ue));
    var table = table_attr.p_competence.refine;
    for (var key in allowed_keys_ue) {
        var [voc, voc_index] = key_last_word(key);
        var word = voc + voc_index;
        if (!table[word])
            table[word] = create_refine_item(word);
    }
    // Clear references of removed subcompetences
    for (var key in table) {
        for (var i = table[key].content.length - 1; i >= 0; i--)
            if (!table[table[key].content[i]])
                table[key].content.splice(i, 1);
        if (this.catalog.items[key] && table[key].title)
            delete table[key]['title'];
    }
    update_table_competence(table);

    // Columns verification
    for (var col of get_columns_of_type("Competences"))
        this.column_verify(col);
    for (var col of get_columns_of_type("COMPETENCES_GRADE"))
        if (typeof col.p_competences_grade !== "object")
            column_attr_set(col, "competences_grade", column_attributes['competences_grade'].default_value, undefined, true);
};
CompetenceTable.prototype.column_verify = function (column) {
    var items = this.catalog.items;
    var table = table_attr.p_competence.refine;
    var comps = column.competence.split(' ');
    for (var i = comps.length - 1; i >= 0; i--) {
        var [voc, index] = key_last_word(comps[i]);
        var item = items[voc + index];
        if (voc + index !== comps[i])
            comps[i] = voc + index;
        if ((voc === '+' && !table[index])
            || (voc !== '+' && !item)
            || comps.indexOf(voc + index) !== i)
            comps.splice(i, 1);
    }
    column_attr_set(column, "competence", comps.sort().join(' '));
};
CompetenceTable.prototype.update_warnings = function () {
    if (!this.catalog_exist)
        return;
    var items = this.catalog.items;
    var ue_keys = Object.keys(this.catalog.get_allowed_words_ue(ue_code(ue)));
    var warns = [];
    for (var col of get_columns_of_type("Competences")) {
        var col_comps = col.competence ? col.competence.split(/ +/) : [];
        // Competences in columns but not in table
        var added_comps = [];
        for (var key of col_comps)
            if (!ue_keys.includes(key))
                added_comps.push('"' + truncate_text(items[key].title) + '"'); 

        // Grades for comps not in the column and unknow keys
        var warn_comps = {};
        var lost_keys = [];
        for (var line of filtered_lines) {
            var grades = line[col.data_col].value.trim() || [];
            if (grades.length)
                grades = check_keys(grades.split(/ +/), this.catalog)[0];
            for (var grade of grades) {
                var key = grade.split('o')[0];
                var comp = items[key];
                if (!comp && !lost_keys.includes(key))
                    lost_keys.push(key);
                else if (!col_comps.includes(key) && !warn_comps[key])
                    warn_comps[key] = '"' + truncate_text(items[key].title) + '"';
            }
        }
        var col_warns = [];
        if (added_comps.length)
            col_warns.push(_("WARNMSG_target_competences"), added_comps.join(', '), _("WARNMSG_comp_not_in_table"));
        if (Object.keys(warn_comps).length)
            col_warns.push(_("WARNMSG_target_competences"), Object.entries(warn_comps).join(', '), _("WARNMSG_comp_not_in_column"));
        if (lost_keys.length)
            col_warns.push(_("WARNMSG_unknow_key_found_1"), lost_keys.join(', '), _("WARNMSG_unknow_key_found_2"));
        if (col_warns.length)
            warns.push([_("WARNMSG_columns"), col.title, ':', col_warns.join(' ')].join(' '));
    }
    set_message('column_alert', 2, warns.join('\n\n'));
};
CompetenceTable.prototype.jump = function (lin, col, do_not_focus, line_id, data_col) {
    var state = this.state();
    if (!['observations', 'catalog_aggregate', 'comp_result'].includes(this.state()))
        return;
    // Switch the popup to an other line
    if (state === 'catalog_aggregate')
        this.alert_register(state);
    this.clear_current_line();
    var old_line_id = the_current_cell.line_id;
    this.jump_old(lin, col, do_not_focus, line_id, data_col);
    if (!line_id)
        line_id = line_id_from_lin(lin);    // get line_id after the update of filtered_lines

    // Update the content
    if (line_id && old_line_id != line_id)
        switch (state) {
            case 'observations':
                var line = lines[line_id];
                this.do_update = true;
                this.update_cell(old_line_id, popup_column().data_col);
                this.current_datas = line[popup_column().data_col].value;
                document.getElementById('comp_student_infos').innerHTML = line[1].value + " " + line[2].value;
                document.getElementById('comp_student_id').innerHTML = line[0].value;
                this.searchbar.focus();
                break;
            case 'catalog_aggregate':
                this.close();
                this.catalog_open_aggr();
                break;
            case 'comp_result':
                this.close();
                this.comp_result_open(popup_column());
                break;
        }
    the_current_cell.tr.classList.add('currentformline');
    the_current_cell.input.classList.add('currentformline');
};
CompetenceTable.prototype.onkey = function (event) {
    if (event.key == "ArrowUp" || event.key == "PageUp")
        the_current_cell.cursor_up();
    else if (event.key == "ArrowDown" || event.key == "PageDown")
        the_current_cell.cursor_down();
};
CompetenceTable.prototype.update = function () {
    // Update popup content
    if (popup_is_open()) {
        if (this.do_update) {
            var state = this.state();
            switch (state) {
                case "subcomps":
                    this.update_subcomps_popup();
                    break;
                case "aggregate":
                    this.update_aggr_popup();
                    break;
                case "subcomps_aggregate":
                    this.update_subcomps_aggr_popup();
                    break;
                case "catalog_aggregate":
                    this.update_catalog_aggr_popup();
                    break;
                case "comp_grade":
                    this.update_grade_configure_popup();
                    break;
                default:
                    this.update_observations_popup();
            }
            this.need_register_check(state);
            this.do_update = false;
        }
    } else {
        clearInterval(this.update_id);
        this.update_id = undefined;
    }
};
CompetenceTable.prototype.close = function () {
    update_table_data(this.catalog.items);

    // Close the popup
    document.body.removeEventListener("keyup", this.onkey);
    this.clear_current_line();
    popup_close = this.popup_close_old;
    var state = this.state();

    switch (state) {
        case 'observations':
            Current.prototype.jump = this.jump_old;
            this.update_cell(the_current_cell.line_id, popup_column().data_col);
            break;
        case 'catalog_aggregate':
            Current.prototype.jump = this.jump_old;
            this.alert_register('catalog_aggregate');
            break;
        case 'comp_result':
            Current.prototype.jump = this.jump_old;
            break;
        default:
            this.alert_register(state);
            break;
    }

    // Formulas verification
    var aggr_formulas = table_attr.p_competence.formulas;
    if (!aggr_formulas.observations.length) {
        aggr_formulas.observations.push("* Average = * Min .");
        update_table_competence(aggr_formulas, 'formulas');
    }
    if (!aggr_formulas.subcomps.length) {
        aggr_formulas.subcomps.push("* Average = * Min .");
        update_table_competence(aggr_formulas, 'formulas');
    }
    this.update_warnings();
    this.detailed_line = null;
    this.display_state = 0;
    update_cols_comp_results();
    popup_close();
};
CompetenceTable.prototype.clear_current_line = function () {
    the_current_cell.tr.classList.remove('currentformline');
};
CompetenceTable.prototype.line_description = function (key, detailed, clickable = true) {
    var [voc, voc_index] = key_last_word(key);
    var desc = this.catalog.items[voc + voc_index] ?
        this.catalog.items[voc + voc_index].title : this.catalog.vocabulary_name[voc];

    return ['<p class="line_desc" ', detailed ? '' : 'style="white-space: nowrap"',
        clickable ? ' onclick="competenceTable.switch_details(event)">' : '>', desc, '</p>'].join("");
};
// ------ Handlers ----------------------------------------------------------------------------- //
CompetenceTable.prototype.edit_text_handler = function (event) {
    // The button need to be placed before a editable object
    var edit_obj = event.target;
    while (edit_obj.nodeName !== "BUTTON")
        edit_obj = edit_obj.parentElement;
    edit_obj = edit_obj.nextSibling;
    if (edit_obj.classList.contains("editable")) {
        edit_obj.contentEditable = true;
        edit_obj.focus();
    }
};
CompetenceTable.prototype.grade_text_handler = function (event, default_value) {
    if (event.code === 'Enter')
        event.target.blur();
    if (event.type === "blur") {
        var in_text = event.target.innerText.split('\n').join('');
        if (in_text !== default_value) {
            var word = get_parent_attribute(event, "competence");
            var index = Number(event.target.getAttribute("index"));
            var items = competenceTable.catalog.items;
            var observations = items[word].observations();

            if (in_text === "") {
                var unvalid_students = [];
                var observ = word + 'o' + index;
                for (var line of filtered_lines) {
                    var cell = line[the_current_cell.data_col];
                    var values = cell.value.split(' ');
                    if (values.includes(observ))
                        unvalid_students.push(line[1].value + " " + line[2].value);
                }
                if (unvalid_students.length) {
                    alert(_("ALERT_grade_vocab_can_not_be_removed") + "\n" + unvalid_students.join(', '));
                    event.target.innerText = default_value;
                    return;
                }
            }
            // if(observations && in_text === observations[index])
            //     in_text = null; // Commented because Enter and then Blur → null
            if (!observations)
                observations = [...this.catalog.get_allowed_keys_observations(word)];
            observations[index] = in_text;
            items[word].set_observations(observations);

            // Observation checkbox updating
            var lines = [...document.getElementsByClassName('comp_line')];
            for (var line of lines)
                if (line.getAttribute('competence') === word) {
                    var checkbox = line.getElementsByClassName('grade_input')[index];
                    if (in_text.length > 0)
                        checkbox.removeAttribute('disabled');
                    else
                        checkbox.setAttribute('disabled', '');
                    break;
                }
        }
        event.target.contentEditable = false;
    }
};
CompetenceTable.prototype.subcomp_text_handler = function (event, default_value) {
    if (event.code === 'Enter' || event.type === "blur") {
        var in_text = event.target.innerText.split("\n").join("").trim();
        if (in_text === "")
            event.target.innerText = default_value;
        else if (in_text !== default_value) {
            var index = get_parent_attribute(event, "competence").split("+")[1];
            this.current_datas.subcompetences['+' + index] = in_text;
            this.do_update = true;
        }
    }
};

CompetenceTable.prototype.toggle_top_FUC = function (value) {
    /*  Possible values for filter:
        0-> all formation
        1-> UE only
        2-> the current column only
    */
    this.display_state = value;
    this.do_update = true;
};
CompetenceTable.prototype.toggle_FUC = function (checkbox, key, value) {
    /*  Desc:
            When a param box is checked,
            update table infos or column infos.

        Args:
            this checkbox
        Return: nothing
    */
    for (var key in this.current_datas.weights)
        this.catalog.items[key].set_ue_weights(Object.assign({}, this.current_datas.weights[key]));

    if (value === "column") {    // Is a column checkbox
        var col = popup_column();
        var key_list = col.competence.split(" ");
        var ue_weights = this.catalog.items[key].ue_weights();
        var key_index = key_list.indexOf(key);
        if (checkbox.checked && key_index == -1) {
            key_list.push(key);
            if (!ue_weights[col.data_col]) {
                ue_weights[col.data_col] = 1;
                this.catalog.items[key].set_ue_weights(ue_weights);
            }
        } else if (!checkbox.checked && key_index != -1) {
            key_list.splice(key_index, 1);
            if (ue_weights[col.data_col]) {
                delete ue_weights[col.data_col];
                this.catalog.items[key].set_ue_weights(ue_weights);
            }
        } else
            return; // No change

        key_list = this.trim_bad_keys(key_list);
        column_attr_set(col, "competence", key_list.join(" "));
    } else {
        var item = this.catalog.items[key];
        var in_the_ue = item.ue_match(ue_code(ue));
        if (checkbox.checked && !in_the_ue) {
            item.add_ue(ue);
            this.current_datas.competences[key] = [...item.children()];
        } else if (!checkbox.checked && in_the_ue) {
            item.remove_ue(ue);
            delete this.current_datas.competences[key];
        } else
            return; // No change
    }
    this.do_update = true;
};
CompetenceTable.prototype.toggle_observation = function (checkbox, competence, index) {
    /*  Desc:
            When a observation box is checked,
            uncheck all other checkboxes on this line and save the observation in the cell

        Arg:    this checkbox
        Return: nothing
    */
    // Uncheck others boxes
    var toggles = checkbox;
    while (!toggles.className.split(" ").includes("toggle_observations"))
        toggles = toggles.parentNode;
    toggles = toggles.childNodes;
    for (var i = 0; i < toggles.length; i++) {
        var label = toggles[i].getElementsByClassName('grade_input')[0];
        if (label !== checkbox)
            label.checked = false;
    }
    // Update cell infos
    var cell_keys = this.current_datas.split(/ +/);
    var key_find = false;
    for (var cell_index in cell_keys) {
        if (cell_keys[cell_index].split('o')[0] == competence) {
            if (checkbox.checked)
                cell_keys[cell_index] = competence + 'o' + index;
            else
                cell_keys.splice(cell_index, 1);
            key_find = true;
            break;
        }
    }
    if (!popup_column().competence.split(/ +/).includes(competence) && !checkbox.checked)
        checkbox.disabled = true;

    if (!key_find && checkbox.checked)
        cell_keys.push(competence + 'o' + index);
    this.current_datas = cell_keys.sort().join(' ').trim();
};
CompetenceTable.prototype.toggle = function (event) {
    if (event.target.tagName != 'INPUT'
        || event.target.disabled
        || event.target.className.split(' ').includes('untoggle')
    )
        return;

    var competence = get_parent_attribute(event, "competence");
    var toggle = event.target, active_child;
    while (!toggle.className.split(" ").includes("toggle")) {
        active_child = toggle;
        toggle = toggle.parentNode;
    }
    var local_child = toggle.firstChild;

    if (toggle.className.split(' ').includes('toggle_FUC'))
        this.toggle_FUC(event.target, competence, event.target.value);
    else if (toggle.className.split(' ').includes('toggle_observations')) {
        var index = 0;
        while (local_child != active_child) {
            local_child = local_child.nextSibling;
            index++;
        }
        this.toggle_observation(event.target, competence, index);
    }
    event.stopPropagation();
};
CompetenceTable.prototype.trim_bad_keys = function (keys) {
    /*  Returns only the keys found in the catalog
 
        Args:
            str : a list of keys
        Return:
            str : the same text without invalid keys
    */
    var keys_verified = [];
    for (var index in keys) { // XXX should create:   this.catalog.key_is_valid()
        var key = key_words(keys[index]);
        var is_valid = true;
        for (var word of key)
            if (!this.catalog.items[word])
                is_valid = false;

        if (key.length == 0)
            is_valid = false;
        if (is_valid)
            keys_verified.push(keys[index]);
    }
    return keys_verified.sort();
};

CompetenceTable.prototype.use_searchbar = function (competences) {
    var searchbar_area = document.getElementById('comp_searchbar_area');
    if (competences.length >= 15) {
        searchbar_area.style.display = 'block';
        var searchbar = text_simplify(this.searchbar.value);
        if (searchbar !== '') {
            // Add competences only if they have all the searched words
            var filtered_comps = [];
            var inputed = searchbar.split(/ +/);
            var stack = [];
            for (var competence of competences) {
                while (stack.length && !competence.includes(stack.at(-1)))
                    stack.pop();
                stack.push(competence);
                var [voc, voc_index] = key_last_word(competence);
                var desc_split = text_simplify(this.catalog.items[voc + voc_index].title).split(/ +/);

                if (all_texts_in_list(inputed, desc_split, 4)) {
                    for (ancestor of stack)
                        filtered_comps.push(ancestor);
                    stack = [];
                }
            }
            return filtered_comps;
        }
    } else
        searchbar_area.style.display = 'none';
    return [...competences]
};
CompetenceTable.prototype.find_filtered_comps = function () {
    var code = ue_code(ue);
    var competences = [];
    if (this.display_state == 0)
        competences = Object.keys(this.catalog.get_allowed_keys(code));
    else if (this.display_state == 1)
        competences = Object.keys(this.catalog.get_allowed_words_ue(code));
    else
        competences = popup_column().competence.length ? popup_column().competence.split(' ') : [];
    competences = competences.filter((a) => !a.includes('+'));

    // Get last word of competences
    for (var i in competences)
        competences[i] = key_last_word(competences[i]).join('');

    // Delete double lines
    for (var i = competences.length - 1; i >= 0; i--)
        if (!is_competence(competences[i]) || competences.indexOf(competences[i]) != i)
            competences.splice(i, 1);

    return competences;
};

// ------ Register datas ----------------------------------------------------------------------- //
CompetenceTable.prototype.register_button = function () {
    return '<button class="comp_aggr_register sorted" onclick="competenceTable.register_datas()" disabled>'
        + _("Save") + '</button>';
};
CompetenceTable.prototype.need_register_check = function (state) {
    // return true if find unsaved datas
    var items = this.catalog.items;
    var table_formulas;
    var new_datas = this.current_datas;
    var unsaved_found = false;

    switch (state) {
        case "aggregate":
            table_formulas = table_attr.p_competence.formulas.observations;
            for (var key in new_datas.weights) {
                var weights = items[key].ue_weights();
                for (var col in new_datas.weights[key])
                    if (!are_equals(weights[col], new_datas.weights[key][col]))
                        unsaved_found = true;
            }
            break;
        case "subcomps_aggregate":
            table_formulas = table_attr.p_competence.formulas.subcomps;
            for (var key in new_datas.weights) {
                var weights = items[key].children_weights();
                for (var child in weights)
                    if (!are_equals(weights[child], new_datas.weights[key][child])) {
                        unsaved_found = true;
                        break;
                    }
                for (var child in new_datas.weights[key])
                    if (!are_equals(weights[child], new_datas.weights[key][child])) {
                        unsaved_found = true;
                        break;
                    }
            }
            break;
        case "subcomps":
            for (var key in new_datas.subcompetences)
                if (!items[key] || items[key].title !== new_datas.subcompetences[key])
                    unsaved_found = true;
            for (var key in new_datas.competences)
                if (items[key].children().sort().join(' ') !== new_datas.competences[key].sort().join(' '))
                    unsaved_found = true;
            for (var key in items)
                if (key[0] === '+' && !new_datas.subcompetences[key])
                    unsaved_found = true;
            break;
        case "catalog_aggregate":
            for (var [val, this_lin, this_col] of this.current_datas) {
                var cell_val = lines[this_lin][this_col].value;
                if (this_col == 6) {
                    if (cell_val === '') cell_val = '1';
                    if (val === '') val = '1';
                }
                if (val != cell_val)
                    unsaved_found = true;
            }
            break;
        case "comp_grade":
            var col_data = popup_column().p_competences_grade;
            if (this.current_datas.formulas.length !== col_data.formulas.length)
                unsaved_found = true;
            else for (var formula of this.current_datas.formulas)
                if (!col_data.formulas.includes(formula))
                    unsaved_found = true;
            for (var key in this.current_datas.weights)
                if (!are_equals(this.current_datas.weights[key], col_data.weights[key]))
                    unsaved_found = true;
    }
    if (table_formulas && table_formulas.join('|') !== new_datas.formulas.join('|'))
        unsaved_found = true;

    // Update register button
    var register_button = document.getElementsByClassName('comp_aggr_register')[0];
    if (register_button)
        if (unsaved_found)
            register_button.removeAttribute('disabled');
        else
            register_button.setAttribute('disabled', '');

    return unsaved_found;
};
CompetenceTable.prototype.alert_register = function (state) {
    if (this.need_register_check(state))
        if (confirm('Des changements ont étés détectés, voulez vous sauvegarder les modifications ?'))
            this.register_datas();
        else if (state === "catalog_aggregate")
            this.catalog_aggr_undo_changes(this.catalog_table_get_word());
};
CompetenceTable.prototype.register_datas = function () {
    var state = this.state();
    var items = this.catalog.items;
    switch (state) {
        case "aggregate":
            var updated = table_attr.p_competence.formulas;
            updated.observations = [...this.current_datas.formulas];
            for (var key in this.current_datas.weights)
                this.catalog.items[key].set_ue_weights(Object.assign({}, this.current_datas.weights[key]));
            update_table_competence(updated, 'formulas');
            break;
        case "subcomps_aggregate":
            var updated = table_attr.p_competence.formulas;
            updated.subcomps = [...this.current_datas.formulas];
            for (var key in this.current_datas.weights)
                this.catalog.items[key].set_children_weights(Object.assign({}, this.current_datas.weights[key]));
            update_table_competence(updated, 'formulas');
            break;
        case "subcomps":
            for (var key in this.current_datas.subcompetences) {
                if (!items[key]) {
                    items[key] = new CatalogItem(key, [_("MSG_new_subcompetence"), '', '', '', '', '']);
                    items[key].update();
                    // Set Params
                    if (!items[key].ue_match(ue_code(ue)))
                        items[key].add_ue(ue);
                    var cols_keys = {};
                    for (var col of get_columns_of_type("Competences"))
                        cols_keys[col.data_col] = col.competence.split(/ +/);
                    for (var data_col in cols_keys) {
                        var col_comp_index = cols_keys[data_col].indexOf(key);
                        if (col_comp_index !== -1) {
                            cols_keys[data_col].push(key);
                            column_attr_set(columns[data_col], "competence", cols_keys[data_col].join(" "));
                        }
                    }
                }
                items[key].title = this.current_datas.subcompetences[key];
            }
            for (var key in this.current_datas.competences) {
                var children = items[key].children();
                for (var child of this.current_datas.competences[key])
                    if (!children.includes(child))
                        items[key].add_child(child)
                for (var child of children)
                    if (!this.current_datas.competences[key].includes(child))
                        items[key].remove_child(child);
            }
            for (var key in items)
                if (key[0] == '+' && !this.current_datas.subcompetences[key])
                    delete items[key];
            update_comp_table_header();
            break;
        case "catalog_aggregate":
            for (var [val, this_lin, this_col] of this.current_datas)
                if (this_col === 6) {
                    cell_set_value_real(this_lin, this_col, val + "");
                    update_cell_at(this_lin, this_col);
                    the_current_cell.update_cell_headers();
                } else
                    this.update_cells_for_comp(key_words(lines[this_lin][0].value).at(-1), this_col, val);
            break;
        case "comp_grade":
            var new_comps_grade = {};
            new_comps_grade.formulas = this.current_datas.formulas;
            new_comps_grade.weights = Object.assign({}, this.current_datas.weights)
            column_attr_set(popup_column(), "competences_grade", JSON.stringify(new_comps_grade), undefined, true);
            break;
    }
    this.need_register_check(state);
};

//----- Popup Observations ----------------------------------------------------------------------//
CompetenceTable.prototype.open = function () {
    if (!this.catalog_exist)
        return alert(_("ALERT_catalog_empty"));

    // Create a popup for grading student's competences.
    var color_observations = '';
    for (var index in OBSERVATION_COLORS) {
        var color = observation_color(index);
        color_observations += '.color_observations > LI:nth-child(' + (Number(index) + 1)
            + ') {color:' + color + '; margin-left: 2em;}'
            + '.color_observations > :nth-child(' + (Number(index) + 1)
            + ') INPUT{background-color:' + color + '; --form-control-color: ' + color + '}'
    }
    var head_popup = [
        '<style>' + color_observations + '</style>',
        // Head :
        '<div id="competences_content">',
        '<div id="competences_head">',
        '<div style="display: flex">',
        '<select class="toggle_top_FUC" onchange="competenceTable.toggle_top_FUC(Number(this.selectedOptions[0].value))">',
        '<option class="top_FUC" value="0">', _("MSG_comp_formation"), '</option>',
        '<option class="top_FUC" value="1">', _("MSG_comp_ue"), '</option>',
        '<option class="top_FUC" value="2">', _("MSG_comp_column"), '</option>',
        '</select>',
        '<div class="sort_area"><p>', _("MSG_comp_sorted_by"), '</p>',
        '<select class="toggle_sort" onchange="competenceTable.toggle_top_sort(this.selectedOptions[0].value)">',
        '<option value="name">', _("MSG_name"), '</option>',
        '<option value="weight">', _("MSG_weights"), '</option>',
        '</select>',
        '<button class="sort_direction" onclick="competenceTable.toggle_top_sort_ascending()">↓</button>',
        '</div></div>',
        '<div id="comp_searchbar_area">',
        hidden_txt('<input id="comp_searchbar" type="text" onkeyup="competenceTable.do_update = true" placeholder="'
            + _("MSG_comp_searchbar") + '"/>', _("TIP_comp_searchbar")),
        '</div>',
        '<p class="observations_infos" style="max-height: 30px; width: 220px; margin: 0 5px 0 15px; font-size: 0.7em">',
        _("MSG_competences_infos"),
        '</p>',
        '</div>',
        '<div id="competences_table" onclick="competenceTable.toggle(event)">',
        '</div>',
        '</div>'];
    create_popup('competences_content observations_content', this.student_popup_head(), head_popup.join(''), '', false);

    this.column_verify(popup_column());
    var content = check_keys(the_current_cell.line[the_current_cell.data_col].value.split(/ +/), this.catalog);
    this.current_datas = content[0].join(' ');
    this.unknow_datas = [];
    for (var unknow of content[1])
        this.unknow_datas.push(unknow[0]);
    this.searchbar = document.getElementById("comp_searchbar");
    this.searchbar.focus();
    this.select_default_filter();
    this.list_sort.type = 'name';

    this.init_line_popup();
};
CompetenceTable.prototype.student_popup_head = function () {
    var line = the_current_cell.line;
    return [the_current_cell.column.title,
        '<div id="comp_student_infos" style="padding-left: 30px; max-width: 60%">', line[1].value, " ", line[2].value, '</div>',
        '<p id="comp_student_id" style="text-align:right; margin-right: 35px; font-size: 0.5em">', line[0].value, '</p>'].join('');
};
CompetenceTable.prototype.update_cell = function (lin = null, col = null) {
    var unknows = this.unknow_datas.length ? ' ' + this.unknow_datas.join(' ') : '';
    this.current_datas = this.current_datas.split(' ').sort(
        (a, b) => flat_key_order(key_words(a)[0], key_words(b)[0])).join(' ');
    var content = (this.current_datas + unknows).trim();
    if (content !== lines[lin][col].value) {
        cell_set_value_real(lin, col, content);
        update_cell_at(lin, col);
        the_current_cell.update_cell_headers();
    }
};
CompetenceTable.prototype.select_default_filter = function () {
    // Activate one of the category buttons depend to the most short competences list
    if (this.state() === "observations" && popup_column().competence.trim().length)
        this.display_state = 2;
    else if (Object.keys(this.catalog.get_allowed_words_ue(ue_code(ue))).length)
        this.display_state = 1;
    else
        this.display_state = 0;

    var top_fuc = document.getElementsByClassName("top_FUC");
    top_fuc[this.display_state].setAttribute('selected', 'true');
};
CompetenceTable.prototype.line_of_toggles_observation = function (key, checkable_col, checked_col, observations, notation) {
    /*  Desc:
            Return the HTML for a table line for observations popup.

        Args:
            str:        a key
            bool:       the column is checkable
            bool:       the column is checked
            list[5 bools]: observations are checkable
            int:        the notation for this line, -1 if no observation
        Return:
            str: a html printable line
    */
    // observations -> null, true, intitulé d'observation
    var html = [
        '<div class="comp_line" competence="', key, '">',
        '<div class="toggle_FUC toggle">',
        '<div class="FUC_input_area">',
        '<input type="checkbox" class="FUC_input" value="column"'
    ];

    // Col box state
    if (!checkable_col)
        html.push(' disabled');
    if (checked_col)
        html.push(' checked');
    html.push('></div></div>');

    // Grades
    var lin = the_current_cell.line_id;
    var cell_modifiable = lines[lin][popup_column().data_col].modifiable(lines[lin], popup_column());
    html.push('<div class="grades_container">');
    var grades_form = '<div class="toggle_observations color_observations toggle">';
    for (var box in observations) {
        grades_form += '<div class="grade_line"><input type="checkbox" class="grade_input"';
        if (observations[box]) {
            if (box == notation)
                grades_form += ' checked';
            if (!cell_modifiable || (!checked_col && box != notation))
                grades_form += ' disabled';
        } else
            grades_form += ' disabled';
        grades_form += '></div>';
    }
    var grade_descs = this.catalog.items[key].observations()
        || display_grades_desc(this.catalog, key);
    html.push(hidden_txt(grades_form + '</div>', grade_descs.join('<br>')))
    html.push('</div>'); // grades container closure
    html.push(this.line_description(key, false) + '</div>'); // line closure

    return html.join("");
};
CompetenceTable.prototype.observations_table = function (competences) {
    /*  Generate the HTML table of competences which are displayed in the "competences_table" div.

        Args:
            list[(str, list[str])]: (key, [observations "o0" to "o4"]) -> make one line per key
        Return:
            str: HTML for the table of competences and observations.
    */
    if (competences.length == 0)
        return '<h3 style="margin: 20px">' + _("MSG_no_competences") + '</h3>';

    var html = [];
    var checkable_col = column_change_allowed(popup_column());
    var observed = {};
    for (var observation of this.current_datas.split(/ +/) || []) {
        var key_observation = observation.split('o');
        // Remove value left to the subcompetence.
        // XXX it is a hack to be removed
        var key = key_observation[0].replace(/.*([a-z][0-9]+[+][0-9]+)$/, '$1');
        observed[key] = key_observation[1];
    }
    for (var comp of competences) {
        var key = comp[0];
        var checked_col = popup_column().competence.split(' ').includes(key);
        var active_observation = [...this.catalog.items[key].observations()
            || display_grades_desc(this.catalog, key)];
        while (active_observation.length < 6)
            active_observation.push(true);

        html.push(this.line_of_toggles_observation(key, checkable_col, checked_col,
            active_observation, observed[key]));
    }
    html.push('<div style="height:50px"></div>');

    return html.join('');
};
CompetenceTable.prototype.update_observations_popup = function () {
    //  Update the table, using FUC toggles and searchbar.
    var competences = this.find_filtered_comps();

    // Define subcompetences
    var subcomps = this.display_state == 2 ?
        popup_column().competence.split(/ +/).filter((a) => a.includes('+')) : [];
    if (!subcomps.length)
        for (var word of competences)
            for (var child of this.catalog.items[word].children())
                if (child.includes('+') && !subcomps.includes(child))
                    subcomps.push(child);

    // Delete refined competences
    var table_keys = this.catalog.get_allowed_words_ue(ue_code(ue));
    var table_subcomps = [];
    for (var key in table_keys)
        if (key.includes('+'))
            table_subcomps.push(key);
    for (var i = competences.length - 1; i >= 0; i--)
        if (table_keys[competences[i]]) {
            var is_title = false;
            for (var key of this.catalog.items[competences[i]].children())
                if (table_subcomps.includes(key))
                    is_title = true;
            if (is_title)
                competences.splice(i, 1);
        }
    for (var subcomp of subcomps)
        competences.push(subcomp);
    competences = this.sort_competences(competences);
    competences = this.use_searchbar(competences);

    // Limited observations
    var checkable_observations = [];
    var allowed_keys = this.catalog.get_allowed_keys(ue_code(ue));
    for (var i in competences)
        checkable_observations.push([competences[i], allowed_keys[competences[i]]]);
    document.getElementById('competences_table').innerHTML = this.observations_table(checkable_observations);
    this.detailed_line = null;
};

CompetenceTable.prototype.toggle_top_sort = function (value) {
    /*  Possible values for sorting:
        'name'  -> Alphabetical order
        'weight'-> Observation's weight order
    */
    this.list_sort.type = value;
    this.do_update = true;
};
CompetenceTable.prototype.toggle_top_sort_ascending = function () {
    this.list_sort.ascending = !this.list_sort.ascending;
    this.do_update = true;
};
CompetenceTable.prototype.sort_competences = function (comps) {
    var sorted_comps = [];
    switch (this.list_sort.type) {
        case 'name':
            sorted_comps = [...comps].sort(flat_key_order);
            if (!this.list_sort.ascending)
                sorted_comps.reverse();
            break;
        case 'weight':
            var data_col = popup_column().data_col;
            var weights = {};
            for (var comp of comps) {
                var comp_weights = this.catalog.items[comp].ue_weights();
                var tot_weights = 0;
                for (var col in comp_weights) tot_weights += comp_weights[col];
                var weight = tot_weights ? comp_weights[data_col] / tot_weights : 0;
                if (!weights[weight]) weights[weight] = [];
                weights[weight].push(comp);
            }
            var weight_order = Object.keys(weights).sort();
            if (!this.list_sort.ascending)
                weight_order.reverse();
            for (var weight of weight_order)
                sorted_comps.push(...weights[weight].sort(flat_key_order));
    }
    document.getElementsByClassName('sort_direction')[0].innerText = this.list_sort.ascending ? '↓' : '↑';
    return sorted_comps;
};
CompetenceTable.prototype.switch_details = function (event) {
    if (!event)
        return false;

    var line = event.target;
    while (![...line.classList].includes('comp_line'))
        line = line.parentNode;
    var index = Array.prototype.indexOf.call(line.parentNode.children, line);

    var closed_line = null;
    if (this.detailed_line !== null) {
        closed_line = document.getElementsByClassName("comp_line")[this.detailed_line];
        this.close_line(closed_line);
    }

    if (this.detailed_line === index)
        this.detailed_line = null;
    else
        this.detail_line(index);

    if (!line)
        return false;

    if (closed_line) {
        var word = key_last_word(closed_line.getAttribute("competence")).join('');
        var data_grade = this.current_datas.split(word + 'o')
        var checked_index = data_grade.length == 2 ? Number(data_grade[1][0]) : -1;
        var close_inputs = closed_line.getElementsByClassName('grade_input');
        for (var i in close_inputs)
            close_inputs[i].checked = checked_index == i;
    }
    return true;
};
CompetenceTable.prototype.detail_line = function (line_index) {
    var line = document.getElementsByClassName("comp_line")[line_index];
    if (!line)
        return false;
    var key = line.getAttribute("competence");

    // FUC
    var toggle_fuc = line.getElementsByClassName("toggle_FUC")[0];
    toggle_fuc.style.flexDirection = "column";

    var FUC_inputs = toggle_fuc.getElementsByClassName("FUC_input_area");
    for (var area of FUC_inputs)
        area.innerHTML = '<p>' + _("MSG_comp_" + area.childNodes[0].value) + '</p>' + area.innerHTML;

    // Grades
    var grades_container = line.getElementsByClassName("grades_container")[0];
    var desc = this.line_description(key, true);

    grades_container.innerHTML = '<div style="display: flex">'
        + '<p class="observations_title">' + _("MSG_comp_grades") + '</p>'
        + desc + '</div>' + grades_container.innerHTML;
    var toggle_observations = line.getElementsByClassName("toggle_observations")[0];
    toggle_observations.style.flexDirection = "column";

    var word = line.getAttribute("competence");
    var observations = this.catalog.items[word].observations()
        || display_grades_desc(this.catalog, word);

    // Checked box index
    var data_grade = this.current_datas.split(word + 'o')
    var checked_index = data_grade.length == 2 ? Number(data_grade[1][0]) : -1;

    var grade_lines = [...grades_container.getElementsByClassName("grade_line")];
    for (var i in grade_lines) {
        var grade_desc = observations[i];
        var input_handler = "competenceTable.grade_text_handler(event, '" + grade_desc + "')";
        var grade_button = table_is_modifiable() ?
            '<button class="desc_edit_btn" onclick="competenceTable.edit_text_handler(event)">✎</button>'
            : "";
        var grade_details = [grade_button, '<p class="editable" index=', i,
            ' onKeyDown="', input_handler, '" onBlur="', input_handler, '">',
            grade_desc, '</p>'].join('');

        grade_lines[i].innerHTML += grade_details;

        var observation_box = grade_lines[i].getElementsByClassName('grade_input')[0];
        observation_box.checked = checked_index == i;
    }

    var line_elems = [...line.childNodes];
    for (var i in line_elems)
        if (i >= 2)      // Is not toggle_fuc or grades_container
            line.removeChild(line_elems[i]);

    // Do transition
    setTimeout(() => {
        line.getElementsByClassName("toggle_observations")[0].style.height = '160px';
        line.getElementsByClassName("toggle_FUC")[0].style.height = 'fit-content';
    }, 1);
    this.detailed_line = line_index;
    return true;
};
CompetenceTable.prototype.close_line = function (line) {
    // Close a detailed line
    if (!line) return false;
    var key = line.getAttribute("competence");
    var desc = this.line_description(key, false);

    // FUC
    var toggle_fuc = line.getElementsByClassName("toggle_FUC")[0];
    toggle_fuc.style.flexDirection = "row";

    var FUC_areas = toggle_fuc.getElementsByClassName("FUC_input_area");
    for (var area of FUC_areas)
        area.removeChild(area.childNodes[0]);

    // Grades
    var grades_container = line.getElementsByClassName("grades_container")[0];
    grades_container.removeChild(grades_container.childNodes[0]);
    var toggle_observations = line.getElementsByClassName("toggle_observations")[0];
    toggle_observations.style.flexDirection = "row";

    var grade_lines = grades_container.getElementsByClassName("grade_line");
    for (var grade_line of grade_lines) {
        var elems = [...grade_line.childNodes];
        for (var i in elems)
            if (i > 0)
                grade_line.removeChild(elems[i]);
    }
    line.innerHTML += desc;

    // Do transition
    setTimeout(() => {
        line.getElementsByClassName("toggle_observations")[0].style.height = '2em';
        line.getElementsByClassName("toggle_FUC")[0].style.height = '27px';
    }, 1);
    return true;
};

// ------ Popup Competences result ------------------------------------------------------------- //
CompetenceTable.prototype.comp_result_open = function (column) {
    var cell_values = the_current_cell.line[the_current_cell.data_col].value.split(';')[0];
    if (!cell_values.length)
        return;
    var key_list = {};
    for (var obs of cell_values.split(/ +/)) {
        var [key, grade] = obs.split('o');
        key_list[key] = grade;
    }
    var merge_why = comp_result_compute_why(this.catalog, the_current_cell.line,
        column || the_current_cell.column, columns, table_attr.p_competence)
    var [aggr_values, aggr_why] = comp_result_aggr_grades(this.catalog, key_list);
    var comps_list = [];
    function comp_result_line(key, grade, why, THIS) {
        var observations = THIS.catalog.items[key].observations()
            || display_grades_desc(THIS.catalog, key);
        var expl_table = [];
        var hide_weights = why[0] && !formulas_needs_weights([why[0].join(' ')]);
        if (why.length > 2) {
            expl_table.push('<table class="explain_result_table">');
            for (var [why_grade, col, weight] of why.slice(1).sort((a, b) => a[0] > b[0]))
                expl_table.push('<tr><th style="background: ', addAlpha(observation_color(why_grade), 0.6), '; width: 200px">',
                    observations[why_grade], '</th>', (hide_weights ? '' : '<th>' + weight + '</th>'), '<th class="title">', col, '</th></tr>');
            expl_table.push('</table>');
        }
        return ['<div class="comp_line_area">', THIS.line_description(key, true, false),
            '<div style="padding: 20px 0">',
            '<div class="grade_line"><div class="comp_result_grade" style="background-color: ', observation_color(grade), '">',
            observations[grade], '</div><div>', aggr_explain(grade, why, observations), '</div></div>',
            expl_table.join(''), '</div></div>'].join('');
    }
    for (var key of Object.keys(key_list).sort((a, b) => flat_key_order(a.split('o')[0], b.split('o')[0])))
        comps_list.push(comp_result_line(key, key_list[key], merge_why[key], this));
    if (Object.keys(aggr_values).length)
        comps_list.push('<h3>Résultats d\'agrégations des notes du bilan</h3>');
    for (var key in aggr_values)
        comps_list.push(comp_result_line(key, rint(aggr_values[key]), aggr_why[key], this));

    create_popup('competences_content comp_result_content', this.student_popup_head(), [
        '<div id="competences_table">', ...comps_list, '</div>'].join(''), '', false);

    this.init_line_popup();
    this.do_update = false;
};

// ------ Popup Add subcompetences ------------------------------------------------------------- //
CompetenceTable.prototype.open_subcomps = function () {
    if (!this.catalog_exist)
        return alert(_("ALERT_catalog_empty"));

    // Create a popup for define all subcompetences and her parents
    var head_popup = [
        '<div id="competences_content">',
        '<div id="competences_head">',
        '<div style="display: flex">',
        '<select class="toggle_top_FUC sorted" onchange="competenceTable.toggle_top_FUC(Number(this.selectedOptions[0].value))">',
        '<option class="top_FUC" value="0">', _("MSG_comp_formation"), '</option>',
        '<option class="top_FUC" value="1">', _("MSG_comp_ue"), '</option>',
        '</select>',
        '</div>',
        '<div id="comp_searchbar_area">',
        hidden_txt('<input id="comp_searchbar" type="text" onkeyup="competenceTable.do_update = true" placeholder="'
            + _("MSG_comp_searchbar") + '"/>', _("TIP_comp_searchbar")),
        '</div>',
        '</div>',
        '<div id="competences_table" onclick="competenceTable.toggle(event)"></div>',
        '</div>'];

    var header = ['<p style="width: 100%">', _("TITLE_popup_subcompetences"), '</p>', this.register_button()].join('');
    create_popup('competences_content subcomps_content', header, head_popup.join(''), '', false);

    this.current_datas = { 'competences': {}, 'subcompetences': {} };
    var subcomps = Object.keys(this.catalog.items).filter((a) => a.includes('+'));
    for (var key of Object.keys(this.catalog.get_allowed_words_ue(ue_code(ue))))
        if (!key.includes('+'))
            this.current_datas.competences[key] = [...this.catalog.items[key].children()];
    for (var key of subcomps)
        this.current_datas.subcompetences[key] = this.catalog.items[key].title;

    this.searchbar = document.getElementById("comp_searchbar");
    this.searchbar.focus();
    this.select_default_filter();
    this.init_popup_open();
};
CompetenceTable.prototype.line_of_toggles_refine = function (key, checkable_ue, checked_ue, parent_key = null) {
    /*  Desc:
            Return the HTML for a refine popup table line.

        Args:
            str:        a key
            bool: UE is checkable
            bool: UE is checked
        Return:
            str: a html printable line
    */
    var voc = key_last_word(key)[0];
    var is_subcomp = voc === '+';
    var html = [
        '<div class="comp_line', is_subcomp ? ' depth2' : '', '" competence="', key, '">',
        '<div class="toggle_FUC toggle">',
        '<div class="FUC_input_area">',
        '<input type="checkbox" class="FUC_input" value="ue"'
    ];
    // UE Box state
    if (!checkable_ue)
        html.push(' disabled');
    if (checked_ue)
        html.push(' checked');
    html.push('></div></div>');

    // Desc
    if (is_subcomp)
        var desc = this.current_datas.subcompetences[key];
    else
        var desc = this.catalog.items[key] ?
            this.catalog.items[key].title : this.catalog.vocabulary_name[voc];
    html.push(table_is_modifiable() ? is_subcomp ?
        hidden_txt('<button class="subcompetence-remove"'
            + 'onclick="competenceTable.remove_subcomp(\'' + parent_key + '\', \'' + key + '\')">×</button>',
            _("TIP_remove_subcompetence"))
        : hidden_txt('<button class="subcompetence-add"'
            + 'onclick="competenceTable.add_subcomp_handler(event, \'' + key + '\')">+</button>',
            _("TIP_add_subcompetence"))
        : '');

    if (is_subcomp && table_attr.modifiable) {
        var input_handler = 'competenceTable.subcomp_text_handler(event, `' + desc + '`)';
        html.push('<p class="line_desc untoggle" onKeyDown="', input_handler, '" onBlur="', input_handler, '" contenteditable="',
            table_is_modifiable() ? 'true' : 'false', '">', desc, '</p>');
    } else
        html.push('<p class="line_desc">', desc, '</p>');

    html.push('</div>');
    return html.join("");
};
CompetenceTable.prototype.subcomps_table = function (competences) {
    /*  Generate the HTML table of competences and subcompetences
        which are displayed in the "competences_table" div.

        Args:
            list[str]: list of words
        Return:
            str: HTML for the table of competences and observations.
    */
    if (competences.length == 0)
        return '<h3 style="margin: 20px">' + _("MSG_no_competences") + '</h3>';

    var html = [];
    var subcomps = Object.keys(this.current_datas.subcompetences);
    var allowed_keys_ue = [];
    for (var key in this.catalog.get_allowed_keys_ue(ue_code(ue)))
        allowed_keys_ue.push(key_last_word(key).join(''));

    var parent_key = null;
    for (var key of competences) {
        var is_subcomp = key[0] === '+';
        if (is_subcomp && subcomps.includes(key))
            subcomps.splice(subcomps.indexOf(key), 1);
        var checkable_ue = is_subcomp
            || allowed_keys_ue.includes(key)
            || this.catalog.items[key].children().length ?
            false : table_is_modifiable();
        var checked_ue = is_subcomp || this.catalog.items[key].ue_match(ue_code(ue)) ?
            true : false

        html.push(this.line_of_toggles_refine(key, checkable_ue, checked_ue, parent_key));
        parent_key = is_subcomp ? parent_key : key;
    }
    if (subcomps.length) {
        html.push('<div id="lost_subcomps_table" onclick="competenceTable.toggle(event)">',
            '<h3>', _("TITLE_subcompetences_no_parent"), '</h3>');
        for (var key of subcomps)
            html.push('<div class="comp_line depth2" competence="', key, '">',
                table_is_modifiable() ? hidden_txt(
                    '<button class="subcompetence-delete" onclick="competenceTable.delete_subcomp(\''
                    + key + '\')">×</button>', _("TIP_delete_subcompetence")) : '',
                '<p class="line_desc">', this.current_datas.subcompetences[key], '</p></div>');
        html.push('</div>');
    }

    return html.join('');
};
CompetenceTable.prototype.update_subcomps_popup = function () {
    // Update the table, using FUC toggles and searchbar.
    var competences = this.find_filtered_comps();
    competences = competences.sort(flat_key_order);
    var subcomps = this.current_datas.subcompetences;
    for (var i = competences.length - 1; i >= 0; i--) {
        var children = this.current_datas.competences[competences[i]];
        if (children && children.length)
            competences.splice(i + 1, 0, ...children.sort((a, b) => flat_descs_order(subcomps[a], subcomps[b])));
    }
    competences = this.use_searchbar(competences);
    document.getElementById('competences_table').innerHTML = this.subcomps_table(competences);
};

CompetenceTable.prototype.add_subcomp_handler = function (event, key) {
    var button = event.target;
    while (button.className != "subcompetence-add")
        button = button.parentNode;

    var selector = button.getElementsByClassName('comp-selector')[0];
    if (selector) {
        // Add the subcompetence
        var val = event.target.value || null;
        if (!val)
            return;
        if (val == 'new')
            this.add_subcomp(key);
        else if (val.includes('+'))
            this.add_subcomp(key, val);
        button.innerHTML = '+';
    } else {
        // Check if the competence is used nowhere
        var observed = false;
        var cols_with_key = [];
        var observations = {};
        for (var col of get_columns_of_type("Competences")) {
            observations[col.data_col] = [];
            if (col.competence.split(' ').includes(key))
                cols_with_key.push(col.title);
        }
        for (var line of filtered_lines)
            for (var col in observations)
                if (line[col].value.includes(key + 'o')) {
                    observations[col].push(line.line_id);
                    observed = true
                }
        if (cols_with_key.length || observed) {
            var message = ['Vous ne pouvez pas affiner cette compétence car :\n'];
            if (cols_with_key.length)
                message.push('- Elle est contenu dans la/les colonne(s) ',
                    cols_with_key.join(', '), '\n');
            if (observed) {
                message.push('- Elle est observée dans la/les cellule(s) ');
                for (var col in observations)
                    if (observations[col].length)
                        message.push(observations[col].join(', '),
                            'de la colonne ', columns[col].title, '\n');
            }
            return alert(message.join(' '));
        }

        // Display the subcomp selector
        var sub_keys = Object.keys(this.current_datas.subcompetences);
        var children = this.current_datas.competences[key] || [];
        for (var child of children) {
            var child_index = sub_keys.indexOf(child);
            if (child_index !== -1)
                sub_keys.splice(child_index, 1);
        }
        sub_keys.sort(flat_key_order);

        selector = ['<div class="comp-selector" >',
            '<button value="cancel" class="cancel_button">×</button>',
            '<div>',
            '<button value="new" class="sorted">' + _("MSG_add_new_subcompetence") + '</button>'];
        for (var word of sub_keys)
            selector.push('<button value="', word, '">', this.catalog.items[word].title, '</button>');
        selector.push('</div></div>');
        event.target.innerHTML = selector.join('');
    }
};
CompetenceTable.prototype.add_subcomp = function (key, subcomp_key = null) {
    var comp = key_last_word(key).join('');
    var subcomp_word;
    if (subcomp_key)
        subcomp_word = subcomp_key;
    else {
        var subcomp_name = prompt(_("MSG_add_subcomp_name"), _("MSG_new_subcompetence"));
        if (!subcomp_name)
            return
        var index = 0;
        while (this.current_datas.subcompetences['+' + index]) index++;
        subcomp_word = '+' + index;
        this.current_datas.subcompetences[subcomp_word] = subcomp_name;
    }
    if (!this.current_datas.competences[comp])
        this.current_datas.competences[comp] = [];
    this.current_datas.competences[comp].push(subcomp_word);
    this.do_update = true;


};
CompetenceTable.prototype.remove_subcomp = function (key, subcomp_key) {
    var word = key_last_word(subcomp_key).join('');
    var child_index = this.current_datas.competences[key].indexOf(word);
    if (child_index !== -1)
        this.current_datas.competences[key].splice(child_index, 1)
    this.do_update = true;
};
CompetenceTable.prototype.delete_subcomp = function (key) {
    // Verify if the subcompetence is observed
    var parent_cols = [];
    var parent_cells = [];
    for (var col of get_columns_of_type("Competences")) {
        if (col.competence.split(/ +/).includes(key))
            parent_cols.push(col.title);
        for (var line of filtered_lines)
            if (line[col.data_col].value.includes(key + 'o'))
                parent_cells.push(line[1].value + ' ' + line[2].value + ' colonne ' + col.title);
    }
    var alert_msg = [];
    if (parent_cols.length)
        alert_msg.push(_("ALERT_subcomp_cant_be_deleted_column"), parent_cols.join(', '), '\n\n');
    if (parent_cells.length) {
        if (parent_cells[4])
            parent_cells = parent_cells.slice(0, 3).concat('...');
        alert_msg.push(_("ALERT_subcomp_cant_be_deleted_cell"), parent_cells.join(', '), '\n\n');
    }
    if (alert_msg.length)
        return alert(alert_msg.concat(_("ALERT_subcomp_cant_be_deleted_final")).join(' '));

    if (!confirm(_("CONFIRM_delete_subcompetence") + ' "'
        + this.current_datas.subcompetences[key] + '" ?'))
        return;
    delete this.current_datas.subcompetences[key];
    this.do_update = true;
};

// ------ Popups Aggregate --------------------------------------------------------------------- //
CompetenceTable.prototype.switch_aggr_state = function (value, aggr) {
    // aggr = 'observation' | 'subcomps' | 'grade'
    if (aggr == 'subcomps')
        this.subcomps_aggr_state = value;
    else
        this.aggr_state = value;

    var states = {
        "average": '* Average = * Min .',
        "min": '. Observed = * Max .',
        "max": '. Observed = * Min .'
    };
    this.current_datas.formulas = states[value] ? [states[value]] : []; // nothing -> "special" state
    this.do_update = true;
};
CompetenceTable.prototype.get_aggr_state = function (formulas) {
    if (!formulas)
        return null;
    if (formulas.length == 1) {
        var states = {
            '* Average = * Min .': "average",
            '. Observed = * Max .': "min",
            '. Observed = * Min .': "max"
        };
        if (states[formulas[0]])
            return states[formulas[0]];
    }
    return "special";
};

CompetenceTable.prototype.init_aggr_formulas = function (state, formulas, special_keys = null, grades_descs = null) {
    var special_area = document.getElementById('comp_aggr_special_area');
    var popup_state = this.state();
    if (!state || state != "special") {
        special_area.innerHTML = "";
        return;
    }
    var is_modifiable = table_is_modifiable();
    var key_list = special_keys || Object.keys(this.catalog.get_allowed_words_ue(ue_code(ue)));
    if (grades_descs)
        var grade_vocabs = grades_descs;
    else {
        var parent;
        if (key_list[0])
            for (var key in this.catalog.items)
                if (this.catalog.items[key].children().includes(key_list[0])) { parent = key; break; }
        if (!parent)
            parent = '';
        var grade_vocabs = display_grades_desc(this.catalog, parent);
    }
    // Formula possible values :    Cf PYTHON_JS/aggregate.py - aggregate_compute 
    var formulas_list = "";
    for (var f of formulas)
        formulas_list += ['<div class="comp_aggr_formula" value="', f, '">',
            is_modifiable ? '<button onclick="competenceTable.remove_aggr_formula(event.target)">×</button>' : '',
            this.get_aggr_formula_text(f, grade_vocabs), '</div>'].join('');

    var handler = ' onchange="competenceTable.aggr_selector_update(event.target.value)"';
    var comps_choices = [];
    switch (popup_state) {
        case "aggregate":
            comps_choices.push(['.', _("OPTION_aggr_formula_the_comp")]);
            break;
        case "subcomps_aggregate":
            comps_choices.push(['.', _("OPTION_aggr_formula_a_expected")]);
            comps_choices.push(['*', _("OPTION_aggr_formula_all_comps")]);
            break;
        case "catalog_aggregate":
            comps_choices.push(['.', _("OPTION_aggr_formula_the_comp")]);
            comps_choices.push(['*', _("OPTION_aggr_formula_all_comps")]);
        case "comp_grade":
            comps_choices.push(['.', _("OPTION_aggr_formula_a_comp")]);
            comps_choices.push(['*', _("OPTION_aggr_formula_all_comps")]);
            break;
    }
    var comps = ['<select class="aggr_selector" style="width: 16em; margin-top: 5px"', handler, '>'];
    for (var [choice, txt] of comps_choices)
        comps.push('<option value="', choice, '">', txt, '</option>');
    for (var key of key_list.sort(flat_key_order))
        comps.push('<option value="' + key + '">' + this.catalog.items[key].title + '</option>');
    comps.push('</select>');

    var grades = '';
    for (var i in grade_vocabs)
        grades += '<option value="' + i + '">' + grade_vocabs[i] + '</option>';

    var evaluator_selector = [];
    for (var evaluator of Object.keys(AGGREGATE_EVALUATORS).sort())
        evaluator_selector.push('<option value="', evaluator, '"',
            (evaluator == 'Observed' ? ' selected' : ''), '>',
            _("OPTION_aggr_formula_" + evaluator), '</option>')
    var formulas_template = '';
    if (table_is_modifiable())
        formulas_template = ['<h3>', _("TITLE_comp_aggr_template"), ' :</h3><div id="aggr_formula_template">',
            '<button class="comp_aggr_add_formula" onclick="competenceTable.add_aggr_formula()">+</button>',
            // Formula
            _("MSG_aggr_formula_if"), ' ', comps.join(''),
            ' ', _("MSG_aggr_formula_have"), ' <select class="aggr_selector" style="width: 16em; margin-top: 5px">',
            evaluator_selector.join(''),
            '</select>',
            '<select class="aggr_selector" style="width: 3.5em; margin-top: 5px">',
            '<option value="≤">≤</option>',
            '<option value="=">=</option>',
            '<option value="≥">≥</option>',
            '</select>',
            ' ', _("MSG_aggr_formula_a"), ' <select class="aggr_selector" style="width: 17.5em; margin-top: 5px">',
            '<option value="*">', _("OPTION_aggr_formula_any"), '</option>',
            grades,
            '</select><br>',
            _("MSG_aggr_formula_the_result"), ' <select class="aggr_selector" style="width: 7em">',
            '<option value="Min">', _("OPTION_aggr_formula_min"), '</option>',
            '<option value="Max">', _("OPTION_aggr_formula_max"), '</option>',
            '</select> ',
            '<select class="aggr_selector" style="width: 17.5em">',
            '<option value=".">', _("OPTION_aggr_formula_the_value"), '</option>',
            '<option value="..">', _("OPTION_aggr_formula_the_value_or_nothing"), '</option>',
            grades,
            '</select>.',
            '</div>'].join('');

    special_area.innerHTML = [formulas_template,
        '<h3>', _("TITLE_comp_aggr_parameters"), ' :</h3>',
        '<div id="comp_aggr_advanced_methods">', formulas_list, '</div>',
    ].join('');
};
CompetenceTable.prototype.init_aggr_states_list = function (title, state, str_handler) {
    var aggr_states = {
        "average": _("Average"),
        "min": _("B_s_minimum"),
        "max": _("B_s_maximum"),
        "special": _("MSG_aggr_type_special")
    };
    if(competenceTable.state() === "catalog_aggregate")
        aggr_states["null"] = _("MSG_aggr_type_inherit");

    var is_disabled = !table_is_modifiable();
    var states_list = ['<div class="aggr_title"><h3>', title, ' :</h3></div><p class="aggr_states_list">'];
    for (var value in aggr_states)
        states_list.push('<label class="comp_aggr_method"><input type="radio" name="comp-aggr-type" value="',
            value, '" onClick="', str_handler, '"', (state == value ? " checked " : ""),
            is_disabled ? 'disabled' : '', '/>', aggr_states[value], '</label>');
    states_list.push('</p>');
    return states_list.join('');
};
CompetenceTable.prototype.update_aggr_states_list = function (formulas) {
    var states_list = document.getElementsByClassName('aggr_states_list')[0];
    var state = this.get_aggr_state(formulas);
    for (var label of states_list.childNodes) {
        var state_input = label.childNodes[0];
        if (state_input.value === state)
            state_input.setAttribute('checked', '');
        else
            state_input.removeAttribute('checked');
    }
    if (this.state().includes("subcomps"))
        this.subcomps_aggr_state = state;
    else
        this.aggr_state = state;
};
CompetenceTable.prototype.formula_exist = function (formula) {
    // Return true if the formula exist
    var split_formula = formula.split(' ');
    if (split_formula.length !== 6) return false;

    var [comp, cond, equal, obs1, minmax, obs2] = split_formula;
    var conds = Object.keys(AGGREGATE_EVALUATORS);
    if ((!["*", "."].includes(comp) && !this.catalog.items[comp])
        || !conds.includes(cond)
        || !["≤", "=", "≥"].includes(equal)
        || !["*", "0", "1", "2", "3", "4", "5"].includes(obs1)
        || !["Min", "Max"].includes(minmax)
        || ![".", "..", "0", "1", "2", "3", "4", "5"].includes(obs2)
    )
        return false;
    return true;
};
CompetenceTable.prototype.get_aggr_formula_text = function (formula, grade_descs) {
    var [sel, eval, compare, val, dir, res] = formula.split(' ');

    // Selected values
    var a_competence;
    switch (sel) {
        case '.':
            a_competence = this.state() === 'subcomps_aggregate' ?
                _("OPTION_aggr_formula_a_expected") : _("OPTION_aggr_formula_the_comp");
            break;
        case '*': a_competence = _("OPTION_aggr_formula_all_comps"); break;
        default: a_competence = this.catalog.items[sel] ?
            '"' + this.catalog.items[sel].title + '"' : "Bug";
    }
    var an_observation = val.isdigit() && val <= 5 ? grade_descs[val] : _("OPTION_aggr_formula_any");
    var the_limit = dir == 'Max' ? _("OPTION_aggr_formula_max") : _("OPTION_aggr_formula_min");
    var final_grade = !res.isdigit() || res > 5 ? res == '.' ?
        _("OPTION_aggr_formula_the_value") : _("OPTION_aggr_formula_the_value_or_nothing")
        : grade_descs[res];
    return [_("MSG_aggr_formula_if"), a_competence,
        _("MSG_aggr_formula_have"), _("OPTION_aggr_formula_" + eval), compare,
        _("MSG_aggr_formula_a"), an_observation, '<br>',
        _("MSG_aggr_formula_the_result"), the_limit, final_grade + '.'
    ].join(' ');
};
CompetenceTable.prototype.add_aggr_formula = function () {
    selectors = [...document.getElementById('aggr_formula_template').getElementsByClassName('aggr_selector')];
    var formula = [];
    for (var i in selectors) {
        var option = selectors[i].selectedOptions[0];
        formula.push(option.getAttribute('value'));
        selectors[i] = option.innerText;
    }
    if (this.state() == "catalog_aggregate") {
        var cell_data = find_json_oject(this.current_datas[0][0]) || {};
        layer = this.catalog_aggr_get_layer();
        var formulas = cell_data[layer] || [];
        formulas.push(formula.join(' '));
        cell_data[layer] = formulas;
        this.current_datas[0][0] = JSON.stringify(cell_data);
        this.catalog.items[this.catalog_table_get_word()].set_aggregate(cell_data);
    } else
        this.current_datas.formulas.push(formula.join(' '));
    this.do_update = true;
    return true;
};
CompetenceTable.prototype.remove_aggr_formula = function (elem) {
    var formula = elem;
    while (formula.className !== 'comp_aggr_formula')
        formula = formula.parentNode;
    formula.remove();

    // Save aggregation formulas
    var formulas_list = document.getElementsByClassName('comp_aggr_formula');
    var formulas = [];
    for (var form of formulas_list)
        formulas.push(form.getAttribute('value'));

    if (this.state() == "catalog_aggregate") {
        var cell_data = find_json_oject(this.current_datas[0][0]) || {};
        cell_data[this.catalog_aggr_get_layer()] = formulas;
        this.current_datas[0][0] = JSON.stringify(cell_data);
        this.catalog.items[this.catalog_table_get_word()].set_aggregate(cell_data);
    } else
        this.current_datas.formulas = formulas;
    this.do_update = true;
    return true;
};
CompetenceTable.prototype.aggr_update_weight = function (elem, parent_key = null) {
    var line = elem;
    while (!line.getAttribute('competence'))
        line = line.parentNode;
    var comp = line.getAttribute('competence');
    if (parent_key)  // Subcomp agregation
        this.current_datas.weights[parent_key][comp] = Number(elem.value);
    else            // Observations agregation
        this.current_datas.weights[comp][elem.getAttribute('col')] = Number(elem.value);
    this.do_update = true;
};
CompetenceTable.prototype.aggr_selector_update = function (val) {
    var template = document.getElementById('aggr_formula_template');
    var selector = template.getElementsByClassName('aggr_selector')[1];
    if (val === '*' || val === '.' || true)
        selector.removeAttribute('disabled');
    else {
        selector.setAttribute('disabled', '');
        selector.childNodes[0].selected = 'selected';
    }
};
CompetenceTable.prototype.aggr_export = async function (evt) {
    var table_settings = JSON.stringify(table_attr.p_competence);
    await copy_to_clipboard(table_settings).then(() => {
        display_copied_bubble(evt.target);
    }).catch((err) => {});
    window.open().document.write("<h3>" + _("ALERT_export_datas") + " :</h3><p>" + table_settings + "</p>");
};
CompetenceTable.prototype.aggr_import = function () {
    for (var key in table_attr.p_competence.refine)
        if (key === '0' || Number(key))
            return alert(_("ALERT_impossible_import_context"));

    var imported = prompt(_("ALERT_enter_data_import") + " :");
    if (!imported)
        return;
    try {
        imported = JSON.parse(imported);
    } catch (err) {
        return alert(_("ALERT_unexpected_data_imported") + " : " + imported);
    }
    if (!imported)
        return alert(_("ALERT_unexpected_data_imported") + " : " + imported);

    var attr_table = {
        formulas: { observations: [], subcomps: [] }, grades_vocab: {},
        grades_weights: [], keys: [], refine: {}, subcompetences: {}
    };
    for (var attr of Object.keys(attr_table))
        if (imported[attr])
            attr_table[attr] = imported[attr];
    for (var attr of ['observations', 'subcomps'])
        if (!attr_table.formulas[attr])
            attr_table.formulas[attr] = [];

    update_table_competence(attr_table, null);
    this.table_verify();
    this.catalog.complete_with_refine(table_attr.p_competence.refine, ue);
    update_comp_table_header();
    this.update_warnings();
    return alert(_("ALERT_comp_succes_import"));
};

CompetenceTable.prototype.aggr_simulator = function (formulas) {
    function list_all_cases(grades_number, pos = 0) {
        var results = [];
        if (pos + 1 == grades_number)
            for (var i = 0; i < OBSERVATION_COLORS.length; i++)
                results.push([Number(i)]);
        else
            for (var result of list_all_cases(grades_number, pos + 1))
                for (var i = 0; i < OBSERVATION_COLORS.length; i++)
                    results.push(result.concat(Number(i)));
        return results;
    }
    const OBS_NUMBER = 6;
    var compiled_formulas = aggregate_formulas_compile(formulas);
    var competences = [];
    for (var f of compiled_formulas)
        if (this.catalog.items[f[0]] && !competences.includes(f[0]))
            competences.push(f[0]);
    for (var i = competences.length + 1; i <= OBS_NUMBER; i++)
        competences.push('comp');
    competences = competences.slice(0, OBS_NUMBER);
    var uncovered_cases = [];
    for (var grade_case of list_all_cases(competences.length)) {
        var grades = [];
        for (var i in grade_case)
            grades.push([competences[i], 1, grade_case[i]]);
        if (aggregate_compute(grades, compiled_formulas) == 99)
            uncovered_cases.push(grades);
    }
    return uncovered_cases;
};
CompetenceTable.prototype.merge_simulator = function (formulas, competences) {
    // competence = a word
    function list_all_cases(grades_number, results = [], curr = null, pos = 0) {
        curr = curr || new Array(OBSERVATION_COLORS.length).fill(0);
        if (pos === OBSERVATION_COLORS.length - 1) {
            curr[pos] = grades_number;
            results.push([...curr]);
        } else
            for (var i = 0; i <= grades_number; i++) {
                curr[pos] = i;
                list_all_cases(grades_number - i, results, curr, pos + 1);
            }
        return results;
    }
    const OBS_NUMBER = 4;
    var compiled_formulas = aggregate_formulas_compile(formulas);
    var uncovered_cases = {};
    for (var word of competences) {
        uncovered_cases[word] = [];
        for (var grade_case of list_all_cases(OBS_NUMBER)) {
            var grades = [];
            for (var grade in grade_case)
                for (var i = 0; i < grade_case[grade]; i++)
                    grades.push([word, 1, Number(grade)]);
            if (aggregate_compute(grades, compiled_formulas) == 99 && grade_case[0] != OBS_NUMBER)
                uncovered_cases[word].push(grade_case);
        }
    }
    return uncovered_cases;
};
CompetenceTable.prototype.aggregate_alert = function (uncovered, grades_descs = null) {
    var f_alert = document.getElementById("formulas-alert");
    f_alert.style.display = uncovered.length ? 'block' : 'none'; 
    var examples = [];
    for (var i = 0; i < 3 && i < uncovered.length; i++) {
        var ex_case = [];
        var previous = null;
        for (var [word, _w, grade] of uncovered[i]) {
            if (!grades_descs)
                grades_descs = display_grades_desc(this.catalog, word);
            if (word == previous) {
                ex_case[ex_case.length - 1] += ', ' + grades_descs[grade];
                continue;
            }
            var title = this.catalog.items[word] ? truncate_text(this.catalog.items[word].title) : _("MSG_any_competence");
            ex_case.push(title + ' → ' + grades_descs[grade]);
            previous = word;
        }
        examples.push(_("MSG_grades_set") + " :<br>" + ex_case.join('; '));
    }
    f_alert.innerHTML = "<h4>/!\\ " + _("MSG_formulas_not_valid") + ".</h4>"
        + "<p>" + _("MSG_uncovered_examples") + " :</p>" + examples.join('<br>');
};
CompetenceTable.prototype.merge_alert = function (word, uncovered, grades_descs = null) {
    var f_alert = document.getElementById("formulas-alert");
    f_alert.style.display = uncovered.length ? 'block' : 'none'; 

    if (!grades_descs)
        grades_descs = display_grades_desc(this.catalog, word);
    var examples = [];
    for (var i = 0; i < 3 && i < uncovered.length; i++) {
        var ex_case = [];
        for (var grade in uncovered[i]) {
            var grade_count = uncovered[i][grade];
            if (!grade_count)
                continue;
            ex_case.push(grade_count + "x " + grades_descs[grade]);
        }
        var title = this.catalog.items[word] ? truncate_text(this.catalog.items[word].title) : word;
        examples.push(_("MSG_grades_set") + " : " + title + " → " + ex_case.join(', '));
    }
    f_alert.innerHTML = "<h4>/!\\ " + _("MSG_formulas_not_valid") + ".</h4>"
        + "<p>" + _("MSG_uncovered_examples") + " :</p>" + examples.join('<br>');
};
// ------ Observations Aggregate --------------------------------------------------------------- //
CompetenceTable.prototype.open_aggregate = function () {
    if (!this.catalog_exist)
        return alert(_("ALERT_catalog_empty"));
    popup_close();

    // Create a popup for define how to calculate all final grades.
    var title = _("TITLE_aggr_observations") + this.register_button();

    // Datas init :
    var weights = {}
    for (var key in this.catalog.get_allowed_words_ue(ue_code(ue)))
        if (is_competence(key))
            weights[key] = Object.assign({}, this.catalog.items[key].ue_weights());
    this.current_datas = {
        'formulas': [...table_attr.p_competence.formulas.observations] || [], 'weights': weights
    };
    this.aggr_state = this.get_aggr_state(this.current_datas.formulas);

    // Table
    var comp_columns = {}
    for (var col of get_columns_of_type("Competences"))
        comp_columns[col.title] = col.competence.split(' ');
    var cols_html = [];
    for (var col in comp_columns)
        cols_html.push(hidden_txt('<th class="comp_weight">' + col + '</th>', col));
    if (!Object.keys(comp_columns).length)
        cols_html.push('<th class="comp_weight">-</th>');

    var popup = ['<div class="aggr_popup_area">',
        this.init_aggr_states_list(_("TITLE_comp_observations_aggr_type"), this.aggr_state,
            "competenceTable.switch_aggr_state(this.value, 'observations')"),
        '<div id="comp_aggr_special_area"></div>',

        // Table
        '<div id="formulas-alert" style="display: none"></div>',
        '<div class="comp_table_list"><table id="comp_aggr_table"><thead><tr>',
        '<th style="box-shadow: 0px -1px 0 black inset; background: none; padding: 10px"></th>',
        '<th colspan="', cols_html.length, '">', _("MSG_evaluation"), '</th>',
        '<th rowspan="2" class="aggr_preview_area">', _("MSG_comp_aggr_results_preview"), '</th></tr>',
        '<tr><th>', _("MSG_table_comp_aggr_list"), '</th>', cols_html.join(''), '</tr></thead><tbody id="cmp_aggr_list"></tbody></table></div></div>'
    ].join('');

    create_popup('competences_content aggregate_content', title, popup, '', false);
    this.init_popup_open();
};
CompetenceTable.prototype.update_aggr_popup = function () {
    // Get formulas
    var formulas = [...this.current_datas.formulas];
    this.init_aggr_formulas(this.aggr_state, formulas);

    // Aggregations
    var comp_columns = {}
    for (var col of get_columns_of_type("Competences"))
        comp_columns[col.data_col] = col.competence.split(' ');
    var all_grades = merge_comps_by_lines(comp_filtered_cells_values(), formulas,
        this.current_datas.weights, table_attr.p_competence.grades_weights, true);
    var keys = Object.keys(this.current_datas.weights);
    for (var i = keys.length - 1; i >= 0; i--)
        if (this.catalog.items[keys[i]].children().join('').includes('+'))
            keys.splice(i, 1);
    var comps = compute_grade_repartition(all_grades, keys);
    var list = [];
    for (var key of keys.sort(flat_key_order))
        list.push(this.line_aggr_comp(key, comp_columns, comps[key]));
    if (!list.length)
        list.push('<tr><th class="aggr_line" colspan="3">'
            + '<p style="font-size: 2.5em; font-weight: bold"> Aucune compétence </p></th></tr>');

    document.getElementById('cmp_aggr_list').innerHTML = list.join('');

    var uncovered = this.merge_simulator(formulas, keys);
    var unco_keys = Object.keys(uncovered);
    uncovered = unco_keys.length ? uncovered[unco_keys[0]] : [];
    this.merge_alert(unco_keys[0], uncovered);
};
CompetenceTable.prototype.line_aggr_comp = function (key, cols, parts) {
    // Return the html of a line, with description, weights and preview
    var [voc, index] = key_last_word(key);
    var weights = [];
    for (var col in cols)
        if (!cols[col].includes(key))
            weights.push(0);
        else
            weights.push([col, this.current_datas.weights[key][col] === undefined ? 1 : this.current_datas.weights[key][col]]);
    for (var i in weights)
        if (weights[i])
            weights[i] = !formulas_needs_weights(this.current_datas.formulas) ?
                '<th class="comp_weight aggr_line"><p>×</p></th>'
                : '<th class="comp_weight aggr_line"><input type="number" min="0" max="100"'
                + ' value="' + weights[i][1] + '" col="' + weights[i][0] + '"'
                + ' onchange="competenceTable.aggr_update_weight(event.target)"'
                + (table_is_modifiable() ? '' : ' readonly') + '></th>';
        else
            weights[i] = '<th class="aggr_line" style="background: #777"><p style="color: #666">1</p></th>';

    return [
        '<tr competence="', key, '">',
        '<th class="aggr_line"><p class="comp_aggr_description depth2">',
        this.catalog.items[voc + index].title, '</p></th>',
        weights.join(''),
        '<th class="aggr_preview_area"><div class="comp_aggr_preview">', draw_line_pie_chart(parts), '</div></th>',
        '</tr>'].join('');
};

// ------ Subcomps Aggregate ------------------------------------------------------------------- //
CompetenceTable.prototype.open_subcomps_aggregate = function () {
    if (!this.catalog_exist)
        return alert(_("ALERT_catalog_empty"));
    // Create a popup for define how to calculate all final grades.
    var title = _("TITLE_aggr_subcompetences") + this.register_button();

    // init datas :
    var keys = {}
    for (var key in this.catalog.items) {
        var children = this.catalog.items[key].children();
        var weights = this.catalog.items[key].children_weights();
        if (children.join('').includes('+')) {
            keys[key] = {};
            for (var child of children)
                keys[key][child] = weights[child];
        }
    }
    popup_close();
    this.current_datas = { 'formulas': [...table_attr.p_competence.formulas.subcomps] || [], 'weights': keys };
    this.subcomps_aggr_state = this.get_aggr_state(this.current_datas.formulas);
    var popup = ['<div class="aggr_popup_area">',
        this.init_aggr_states_list(_("TITLE_comp_aggr_type"), this.subcomps_aggr_state,
            "competenceTable.switch_aggr_state(this.value, 'subcomps')"),
        '<div id="comp_aggr_special_area"></div>',

        // Table
        '<div id="formulas-alert" style="display: none"></div>',
        '<div class="comp_table_list"><table id="comp_aggr_table"><thead><tr>',
        '<th style="box-shadow: 0px -1px 0 black inset; background: none"></th>',
        '<th class="comp_weight sorted">', _("MSG_weights"), '</th>',
        '<th class="aggr_preview_area sorted">', _("MSG_comp_aggr_results_preview"), '</th>',
        '</tr></thead><tbody id="cmp_aggr_list"></tbody></table>',
        '</div></div>'].join('');

    create_popup('competences_content subcomps_aggregate_content', title, popup, '', false);
    this.init_popup_open();
};
CompetenceTable.prototype.update_subcomps_aggr_popup = function () {
    // Get formulas
    var formulas = [...this.current_datas.formulas];
    var cells_values = comp_filtered_cells_values();
    var comp_grades = {}
    for (var key in this.catalog.items)
        comp_grades[key] = this.catalog.items[key];
    var table = table_attr.p_competence;
    var all_grades = merge_comps_by_lines(cells_values, table.formulas.observations,
        comp_grades, table.grades_weights, true);
    
    var lines_comps_grades = {};
    for (var line in all_grades)
        lines_comps_grades[line] = aggregate_subcomps(all_grades[line], formulas,
            this.current_datas.weights, table.grades_weights, true, false, 0);
    var comps = Object.keys(this.current_datas.weights).sort(flat_key_order);
    var comps_grades = compute_grade_repartition(lines_comps_grades, comps);

    var subcomps_keys = [];
    var list = [];
    for (var comp of comps) {
        list.push(this.line_subcomps_aggr(comp, comps_grades[comp]));
        var children = this.current_datas.weights[comp];
        for (var key of Object.keys(children))
            if (!subcomps_keys.includes(key))
                subcomps_keys.push(key);
        var grades = compute_grade_repartition(all_grades, Object.keys(children));
        for (var child of Object.keys(children).sort(flat_key_order))
            list.push(this.line_subcomps_aggr(child, grades[child], children[child], comp));
    }
    this.init_aggr_formulas(this.subcomps_aggr_state, formulas, subcomps_keys);
    if (!comps.length)
        list.push('<tr><th class="aggr_line" colspan="3">'
            + '<p style="font-size: 2.5em; font-weight: bold"> Aucune compétence </p></th></tr>');

    document.getElementById('cmp_aggr_list').innerHTML = list.join('');
    this.aggregate_alert(this.aggr_simulator(formulas), display_grades_desc(this.catalog, comps[0]));
};
CompetenceTable.prototype.line_subcomps_aggr = function (key, parts, weight = null, parent_key = null) {
    var preview = draw_line_pie_chart(parts);

    // Is title
    if (!parent_key)
        return ['<tr competence="', key, '">',
            '<th><p class="comp_aggr_description">',
            this.catalog.items[key].title, '</p></th>',
            '<th></th>',
            '<th class="aggr_preview_area"><div class="comp_aggr_preview">' + preview + '</div></th>'].join('');

    // Subcompetence
    var weight_cell = !formulas_needs_weights(this.current_datas.formulas) ? '<p>×</p>'
        : '<input type="number" min="0" max="100" value="' + weight + '"'
        + ' onchange="competenceTable.aggr_update_weight(event.target, \'' + parent_key + '\')"'
        + (table_is_modifiable() ? '' : ' readonly') + '/>';
    return [
        '<tr competence="', key, '">',
        '<th class="aggr_line"><p class="comp_aggr_description depth2">', this.catalog.items[key].title, '</p></th>',
        '<th class="comp_weight aggr_line">', weight_cell, '</th>',
        '<th class="aggr_line aggr_preview_area"><div class="comp_aggr_preview">', preview, '</div></th>',
        '</tr>'].join('');
};

// ------ Catalog table Aggregate -------------------------------------------------------------- //
CompetenceTable.prototype.catalog_open_aggr = function () {
    // Create a popup for define how to calculate all final grades.
    this.verify_catalog_consistency();
    var layer_area = this.init_layer_area(the_current_cell.line[0].value);
    if (!layer_area)
        return;

    create_popup('competences_content catalog_aggregate_content',
        _("TITLE_catalog_aggregate") + this.register_button(),

        ['<div class="aggr_popup_area">',
            '<div style="display: flex">',
            '<div id="aggr_layer_area">', layer_area, '</div>',
            '<div><div id="comp_aggr_methods_list"></div>',
            '<div id="comp_aggr_special_area"></div>',
            '</div></div>',
            '<div id="formulas-alert" style="display: none"></div>',
            '<div class="comp_table_list"><table id="comp_aggr_table">',
            '<thead class="comp_table_head"></thead><tbody class="comp_table_body"></tbody></table>',
            '</div></div>'].join(''), '', false);
    this.current_datas = this.catalog_aggr_get_cells_values();

    this.init_line_popup();
};
CompetenceTable.prototype.init_layer_area = function (key) {
    var word = key_last_word(key).join('');
    if (!word.length || !this.catalog.items[word])
        return null;
    function tree_layers(tree, layer = 0) {
        var vocs = {};
        vocs[tree[0][0]] = layer;
        for (var child of tree.slice(1)) {
            var child_vocs = tree_layers(child, layer + 1);
            for (var child_voc in child_vocs)
                vocs[child_voc] = child_vocs[child_voc];
        }
        return vocs;
    }
    var vocs_dict = tree_layers(this.catalog.get_tree(word));
    var vocs = [];
    for (var voc in vocs_dict)
        vocs.push([voc, vocs_dict[voc]]);

    var path_name = [];
    for (var path_word of key_split(key))
        path_name.push(path_word[0].toUpperCase() + ' : ' + truncate_text(this.catalog.items[path_word.join('')].title, 25));

    // Aggregation layer :
    var layer_area = ['<div class="comp_aggr_key"><p>', path_name.join('</p><p>'), '</p></div>'];
    if (vocs.length > 1) {
        layer_area.push('<p style="margin-top: 5px"> Niveau d\'agrégation : </p>',
            '<select id="aggr_layer" onchange="competenceTable.do_update = true">');
        for (var voc of vocs.sort((a, b) => a[1] > b[1]))
            layer_area.push('<option value="', voc[0], '">',
                this.catalog.vocabulary_name[voc[0]], ' "', voc[0], '"</option>');
        layer_area.push('</select>');
    }
    return layer_area.join('');
};
CompetenceTable.prototype.update_catalog_aggr_popup = function () {
    var path = the_current_cell.line[0].value;
    var comp_key = key_words(path).at(-1);
    var voc_key = comp_key[0];
    var layer = this.catalog_aggr_get_layer();
    var formulas = null;
    var parent = null;
    for (var key of key_words(path)) {
        var key_aggregate = this.catalog.items[key].aggregate()[layer];
        if (key_aggregate) {
            formulas = key_aggregate;
            parent = key;
        }
    }
    var title_detail = (!parent || parent === comp_key) ?
        '' : ' (' + _("MSG_method_inherited_from_comp") + ' ' + parent + ')';

    // Echo buttons
    var state = this.get_aggr_state(formulas);
    document.getElementById('comp_aggr_methods_list').innerHTML =
        this.init_aggr_states_list(_("TITLE_comp_aggr_type") + title_detail, state,
            "competenceTable.catalog_aggr_update_formula(this.value)");

    // Table :
    var table_head = [];
    var table = [];
    if (this.catalog_aggr_get_layer() === voc_key) { // In the current layer
        var item = this.catalog.items[comp_key];
        table_head.push('<tbody><tr>',
            '<th><div class="aggr_comp_selector">',
            '<button onclick="competenceTable.comp_selector_handler()">◀</button>',
            '<p>', item.title, '</p>',
            '<button onclick="competenceTable.comp_selector_handler(false)">▶</button></div></th>',
            '<th class="comp_weight">', _("MSG_weights"), '</th></tr></tbody>');
        var list = [];
        var children = item.children();
        var weights = item.children_weights();
        if (children.length) {
            for (var child of children.sort(flat_key_order))
                list.push(this.line_catalog_aggr(child, weights[child]));
            this.init_aggr_formulas(state, formulas, children);
            var keys = competenceTable.current_datas.slice(1);
            for (var i in keys)
                keys[i] = keys[i][1];
            this.aggregate_alert(this.aggr_simulator(formulas), display_grades_desc(this.catalog, comp_key));
        } else {
            this.init_aggr_formulas(state, formulas, [], display_grades_desc(this.catalog, item.word));
            var ue_list = this.current_datas[1][0].split(' ');
            for (var the_ue of ue_list) {
                if (!the_ue.length) continue;
                var [ue_code, weight] = the_ue.split(':');
                list.push(this.line_catalog_aggr(ue_code, weight));
            }
            if (table_is_modifiable())
                list.push('<tr><th colspan="2"><input type="text" class="aggr_add_ue" placeholder="', _("MSG_new_table"),
                    '" onKeyDown="competenceTable.catalog_add_ue_handler(event)">',
                    '</th></tr>');
            var keys = competenceTable.current_datas[1][0];
            keys = keys.length ? keys.split(' ') : [];
            var uncovered = this.merge_simulator(formulas, keys);
            var unco_keys = Object.keys(uncovered);
            uncovered = unco_keys.length ? uncovered[unco_keys[0]] : [];
            this.merge_alert(unco_keys[0], uncovered, display_grades_desc(this.catalog, comp_key));
        }
        table.push('<tbody id="cmp_aggr_list">', list.join(''), '</tbody>');
    }
    document.getElementsByClassName('comp_table_head')[0].innerHTML = table_head.join('');
    document.getElementsByClassName('comp_table_body')[0].innerHTML = table.join('');
};
CompetenceTable.prototype.line_catalog_aggr = function (code, weight) {
    // Subcompetence
    var final_weight = !weight && weight !== 0 ? 1 : weight;

    var is_modifiable = table_is_modifiable();
    var is_ue = this.catalog.items[code] ? false : true;
    var title = is_ue ? code : this.catalog.items[code].title;
    var weight_cell = this.aggr_state == "min" || this.aggr_state == "max" ? '<p>×</p>'
        : '<input type="number" min="0" max="100" value="' + final_weight + '"'
        + ' onchange="competenceTable.catalog_aggr_update_weight(this)"'
        + (is_modifiable ? '' : ' readonly') + '/>';

    var button_delete = is_ue && is_modifiable ? '<button onclick="competenceTable.catalog_remove_ue_handler(event)">×</button>' : '';
    return [
        '<tr code="', code, '">',
        '<th class="aggr_line"><div style="display: flex"><p class="comp_aggr_description">', title, '</p>', button_delete, '</div></th>',
        '<th class="comp_weight aggr_line">', weight_cell, '</th></tr>'].join('');
};
CompetenceTable.prototype.catalog_table_get_word = function () {
    return key_words(the_current_cell.line[0].value).at(-1);
};
CompetenceTable.prototype.catalog_aggr_undo_changes = function (key) {
    var item = this.catalog.items[key];
    var children_w = item.children_weights();
    for (var i in this.current_datas) {
        var [val, this_lin, this_col] = this.current_datas[i];
        var table_val = lines[this_lin][this_col].value;
        if (val !== table_val)
            if (this_col === 6) {
                var cell_key = key_words(lines[this_lin][0].value).at(-1);
                var curr_val = table_val;
                children_w[cell_key] = curr_val === '' ? 1 : curr_val;
            } else
                item.set_aggregate(table_val.length ? JSON.parse(table_val) : []);
        this.current_datas[i][0] = table_val;
    }
    item.set_child_weight(children_w);
};

CompetenceTable.prototype.catalog_aggr_get_layer = function () {
    var layer = document.getElementById("aggr_layer");
    layer = layer ? layer.selectedOptions[0].value
        : key_split(the_current_cell.line[0].value).at(-1)[0];
    return layer;
};
CompetenceTable.prototype.catalog_aggr_get_cells_values = function () {
    var comp = the_current_cell.line[0].value;
    var lin = the_current_cell.line_id;
    var cells_content = [[lines[lin][4].value, lin, 4]];
    var children = this.catalog.items[key_words(comp).at(-1)].children().sort();
    var comp_lines = Object.values(lines).sort((a, b) => a[0].value > b[0].value ? 1 : -1);
    if (children.length) {
        var i = 0;
        while (comp_lines[i][0].value !== comp) i++;
        for (var child of children) {
            while (comp_lines[i][0].value !== comp + child) i++;
            cells_content.push([comp_lines[i][6].value, comp_lines[i].line_id, 6]);
        }
    } else
        cells_content.push([lines[lin][3].value, lin, 3]);

    return cells_content;
};
CompetenceTable.prototype.catalog_aggr_update_formula = function (value) {
    var formulas = [];
    var states = {
        "average": '* Average = * Min .',
        "min": '. Observed = * Max .',
        "max": '. Observed = * Min .'
    };
    if (states[value]) // "special" -> nothing
        formulas.push(states[value]);
    if (value == "null") {
        this.catalog.items[this.catalog_table_get_word()].set_aggregate([]);
        this.current_datas[0][0] = "";
    } else {
        var cell_data = find_json_oject(this.current_datas[0][0]) || {};
        cell_data[this.catalog_aggr_get_layer()] = formulas;
        this.catalog.items[this.catalog_table_get_word()].set_aggregate(cell_data);
        this.current_datas[0][0] = JSON.stringify(cell_data);
    }
    this.do_update = true;
};
CompetenceTable.prototype.catalog_aggr_update_weight = function (elem) {
    var value = Number(elem.value);
    var line = elem;
    while (!line.getAttribute('code'))
        line = line.parentNode;
    var code = line.getAttribute('code');

    if (this.catalog.items[code]) {
        var curr_path = the_current_cell.line[0].value;
        this.catalog.items[key_words(curr_path).at(-1)].set_child_weight(code, value)
        var i = 0;
        while (filtered_lines[i][0].value !== curr_path + code) i++;
        var lin = filtered_lines[i].line_id;
        for (var cell of this.current_datas)
            if (cell[1] == lin)
                cell[0] = value;
    } else {
        var ue_list = this.current_datas[1][0].split(' ');
        for (var i in ue_list) {
            var the_ue = ue_list[i].split(':')[0];
            if (the_ue === code)
                ue_list[i] = the_ue + ':' + value;
        }
        this.current_datas[1][0] = ue_list.join(' ');
    }
    this.do_update = true;
};
CompetenceTable.prototype.comp_selector_handler = function (go_bottom = true) {
    if (go_bottom) the_current_cell.cursor_up();
    else the_current_cell.cursor_down();
};
CompetenceTable.prototype.catalog_add_ue_handler = function (event) {
    if (event.code !== 'Enter')
        return;
    var elem = event.target;
    while (elem.className != "aggr_add_ue")
        elem = elem.parentNode;

    // Add the UE
    var val = event.target.value || null;
    if (!val)
        return;

    var ue_list = this.current_datas[1][0].split(' ');
    ue_list.push(val);
    ue_list.sort();
    this.current_datas[1][0] = ue_list.join(' ');
    elem.innerText = '';
    this.do_update = true;
};
CompetenceTable.prototype.catalog_remove_ue_handler = function (event) {
    var line = event.target;
    while (!line.getAttribute('code'))
        line = line.parentNode;
    var ue_code = line.getAttribute('code');
    var ue_list = this.current_datas[1][0].split(' ');

    var index = ue_list.length - 1;
    while (index >= 0 && ue_list[index].split(':')[0] !== ue_code)
        index--;
    if (index !== -1)
        ue_list.splice(index, 1);
    this.current_datas[1][0] = ue_list.join(' ');
    this.do_update = true;
};

CompetenceTable.prototype.verify_catalog_consistency = function () {
    // Verify all line of the same competence in catalog table have the same datas inside.
    var console_prompt = [];
    var comp_list = {};
    for (var line of filtered_lines) {
        var comp = key_words(line[0].value).at(-1);
        if (!this.catalog.items[comp])
            continue;
        if (!comp_list[comp])
            comp_list[comp] = [];
        comp_list[comp].push([line.line_id, line[3].value, line[4].value, line[6].value]);
    }
    for (var comp in comp_list) {
        var need_update = false;
        var expected_values = comp_list[comp][0].slice(1, 3);
        for (var line of comp_list[comp]) {
            // UE list
            if (line[1] !== expected_values[0]) {
                need_update = true;
                var ue_list = expected_values[0].length ? expected_values[0].split(' ') : [];
                for (var the_ue of line[1].split(' '))
                    if (the_ue.length) {
                        var ue_code = the_ue.split(':')[0];
                        var index = ue_list.length - 1;
                        while (index >= 0 && ue_list[index].split(':')[0] !== ue_code) index--;
                        if (index === -1)
                            ue_list.push(the_ue);
                    }
                expected_values[0] = ue_list.sort().join(' ');
            }
            // Formulas
            if (line[2] !== expected_values[1]) {
                need_update = true;
                var formulas = find_json_oject(expected_values[1]) || {};
                var line_formulas = find_json_oject(line[2]) || {};
                for (var voc in line_formulas)
                    if (!formulas[voc])
                        formulas[voc] = line_formulas[voc];
                expected_values[1] = JSON.stringify(formulas);
            }
            // Weights
            var weight = Number(line[3]);
            if (!weight && weight !== 0) {
                console_prompt.push('Remove unexpected weight "', line[3], '" at line ', line[0], '\n');
                cell_set_value_real(line[0], 6, '');
                update_cell_at(line[0], 6);
            }
        }
        if (need_update)
            for (var line of comp_list[comp]) {
                console_prompt.push('update comp ', comp, ' at line ', line[0],
                    '\n\t', expected_values[0], '\n\t', expected_values[1], '\n\n');
                cell_set_value_real(line[0], 3, expected_values[0]);
                cell_set_value_real(line[0], 4, expected_values[1]);
                update_cell_at(line[0], 3);
                update_cell_at(line[0], 4);
            }
    }
    if (console_prompt.length)
        console.log(console_prompt.join(''));
};
CompetenceTable.prototype.update_cells_for_comp = function (comp, data_col, value) {
    var comp_lines = [];
    for (var line of filtered_lines) {
        if (key_words(line[0].value).at(-1) !== comp)
            continue;
        comp_lines.push(line.line_id);
    }
    for (var lin of comp_lines) {
        cell_set_value_real(lin, data_col, value);
        update_cell_at(lin, data_col);
    }
};

// ------ Competences grade aggregate ---------------------------------------------------------- //
CompetenceTable.prototype.open_grade_configure = function () {
    var title = _("TITLE_comp_grade_configure") + this.register_button();
    popup_close();

    // Init datas
    var comps_grade = columns[the_current_cell.data_col].p_competences_grade;
    this.current_datas = {
        'formulas': comps_grade.formulas,
        'weights': Object.assign({}, comps_grade.weights)
    };
    this.aggr_state = this.get_aggr_state(this.current_datas.formulas);

    // Table
    var popup = ['<div class="aggr_popup_area">',
        this.init_aggr_states_list(_("TITLE_calculation_method"), this.aggr_state,
            "competenceTable.switch_aggr_state(this.value, 'grade')"),
        '<div id="comp_aggr_special_area"></div>',
        '<div class="comp_table_list"><table id="comp_aggr_table">',
        '<thead><tr><th>', _("TITLE_table_grade_configure"), '</th>',
        '<th class="comp_weight">', _("MSG_weights"), '</th></tr></thead>',
        '<tbody id="cmp_aggr_list"></tbody></table></div></div>'].join('');

    create_popup('competences_content comp_grade_content', title, popup, '', false);
    this.init_popup_open();
};
CompetenceTable.prototype.update_grade_configure_popup = function () {
    var cols = [];
    for (var data_col of get_comp_cols_from_col(popup_column().data_col))
        cols.push(data_col);
    for (var i = cols.length - 1; i >= 0; i--)
        if (columns[cols[i]].type === "COMPETENCES_RESULT") {
            cols = cols.concat(columns[cols[i]].average_columns);
            cols.splice(i, 1);
        } else if (!columns[cols[i]].type === "Competences")
            cols.splice(i, 1);

    var comps = [];
    for (var data_col of cols)
        comps = comps.concat(columns[data_col].competence.trim().split(/ +/));

    this.init_aggr_formulas(this.aggr_state, this.current_datas.formulas, comps);
    var lines = [];
    for (var key of comps.sort(flat_key_order))
        lines.push(this.line_grade_configure(key));
    document.getElementById('cmp_aggr_list').innerHTML = lines.join('');
};
CompetenceTable.prototype.line_grade_configure = function (key) {
    var weight = this.current_datas.weights[key];
    if (weight === undefined) weight = 1;
    var weight_cell = this.aggr_state == "min" || this.aggr_state == "max" ?
        '<th class="comp_weight aggr_line"><p>×</p></th>'
        : ['<th class="comp_weight aggr_line"><input type="number" min="0" max="100" value="', weight, '"',
            ' onchange="competenceTable.grade_configure_update_weight(event.target)"',
            (table_is_modifiable() ? '' : ' readonly'), '/></th>'].join('');

    return ['<tr competence="', key, '"><th class="aggr_line"><p class="comp_aggr_description depth2">',
        this.catalog.items[key].title, '</p></th>', weight_cell, '</tr>'].join('');
};
CompetenceTable.prototype.grade_configure_update_weight = function (elem) {
    var line = elem;
    while (!line.getAttribute('competence'))
        line = line.parentNode;
    var comp = line.getAttribute('competence');
    this.current_datas.weights[comp] = Number(elem.value);
    this.do_update = true;
};

CompetenceTable.prototype.update_stats = function () {
    var data_col = the_current_cell.column.data_col;
    var stats_area = document.getElementById("content_Stats");
    stats_area.innerHTML = ['<canvas width="400" height="400" info="sunburst-infos" style="width: 100px"></canvas>',
        '<div id="sunburst-infos" style="border:1px solid #999; margin:0; width:100%; text-align:center; font-size: 0.9em">',
        '<p style="min-height:1em; background-color:#E8E8E8"></p>',
        '<div style="border:1px solid #303030; height:0.5em; width:100%; background-color: #CCC"></div>',
        '<p style="padding: 0 0.5em 0 0.5em; min-height: 5em"></p></div>'].join('');

    var cells = {}
    for (var line_id in lines) {
        var val = lines[line_id][data_col].value;
        if (val.length)
            cells[line_id] = val.split(' ');
    }
    var ue_comp = table_attr.p_competence;
    var comp_weights = {};
    var subcomp_weights = {};
    for (var key in competenceTable.catalog.items) {
        item = competenceTable.catalog.items[key]
        comp_weights[item.word] = item.ue_weights();
        if (item.children().join('').indexOf('+') !== -1)
            subcomp_weights[item.word] = item.children_weights();
    }

    var comps_grades = merge_comps(cells, comp_weights, aggregate_formulas_compile(ue_comp.formulas.observations),
        ue_comp.grades_weights, true, true)[0];
    var merged_comps_grades = aggregate_subcomps(comps_grades, ue_comp.formulas.subcomps, subcomp_weights, null, false, true)[0];
    var grades = {};
    for (var key in comps_grades)
        if (student_catalog.items[key])
            grades[key] = comps_grades[key];
    for (var key in merged_comps_grades)
        grades[key] = merged_comps_grades[key];

    sunburst_canvas_set(stats_area);
    sunburst_init(stats_area, competenceTable.catalog.build_root_with_grades({[ue_code(ue)]: grades}), 2);
}

// --------------------------------------------------------------------------------------------- //
function get_parent_by_class(obj, the_class) {
    var parent = obj;
    while (parent && !parent.className.split(/ +/).includes(the_class))
        parent = parent.parentNode;
    return parent || null;
}
function get_parent_attribute(event, attr_name) {
    var obj = event.target;
    var lim = 1000;
    while (!obj.getAttribute(attr_name)) {
        obj = obj.parentNode;
        lim -= 1;
        if (lim <= 0)
            return null;
    }
    return obj.getAttribute(attr_name);
}
function get_columns_of_type(type) {
    var cols = [];
    for (var data_col of column_list_all()) {
        var col = columns[data_col];
        if (col.type === type)
            cols.push(col);
    }
    return cols;
}
function is_competence(key) {
    // Return true if the key is a competence or subcompetence
    var word = key_last_word(key).join('');
    var first_child = competenceTable.catalog.items[word].children()[0];
    return !first_child || first_child.indexOf('+') == 0;
}
function compute_grade_repartition(lines_grades, keys, hide_empty_grades = false) {
    var comps = {};
    for (var key of keys) {
        // Index 6 is empty value
        var grades = [0, 0, 0, 0, 0, 0, 0]
        for (var line in lines_grades) {
            var grade = lines_grades[line][key];
            if (!grade && grade !== 0) {
                if (hide_empty_grades)
                    continue;
                grade = 6;
            } else if (grade === 99)
                grade = 0;
            grades[rint(grade)]++;
        }
        var parts = [];
        for (var grade in grades)
            parts.push(Array(grades[grade]));

        comps[key] = parts;
    }
    return comps;
}
function display_grades_desc(catalog, word = '') {
    var descs = [...catalog.get_allowed_keys_observations(word)];
    for (var i in descs)
        descs[i] = descs[i].replace(/\(([^]+)\)/, '').trim('');
    return descs;
}
function toggle_tip_details(obj) {
    var area = obj;
    while (!area.className.includes("line_area"))
        area = area.parentNode;
    var logo = area.childNodes[0].childNodes[0];
    logo.innerText = area.childNodes[1].classList.toggle('closed') ? '▶' : '▼';
}
function find_json_oject(str) {
    "return the parsed string if it is a parsable dictionnary, else return null"
    var obj;
    try {
        obj = JSON.parse(str);
    } catch (e) {
        return null;
    }
    if (typeof obj === "object" && obj !== null
        && !(obj instanceof Array) && !(obj instanceof Date))
        return obj;
    return null;

}
function are_equals(a, b, default_value = 1) {
    // Compare two numbers by replacing undefined by default value
    var final_a = a === undefined ? default_value : Number(a);
    var final_b = b === undefined ? default_value : Number(b);
    return final_a == final_b;
}
function truncate_text(desc, threshold = 50) {
    return desc.slice(0, threshold) + (desc.length > threshold ? '…' : '');
}
function comp_observation_span(g) {
    return '<span class="an_observation" style="background-color:' + observation_color(rint(Number(g))) + ';"></span>';
}
function comp_result_aggr_grades(catalog, key_list, threshold = 0) {
    var parents = [];
    var formulas = aggregate_formulas_compile(table_attr.p_competence.formulas.subcomps);
    for (var key in key_list)
        for (var parent of catalog.get_parents(key))
            if (!parents.includes(parent))
                parents.push(parent);
    var aggr_grades = {};
    var aggr_why = {};
    for (var parent of parents) {
        aggr_why[parent] = [];
        var children = catalog.items[parent].children();
        var weights = catalog.items[parent].children_weights();
        var grades = [];
        for (var child of children)
            if (key_list[child] !== undefined) {
                var weight = weights[child];
                grades.push([child, weight, Number(key_list[child])]);
                aggr_why[parent].push([Number(key_list[child]), catalog.items[child].title, weight]);
            }
        if (grades.length / children.length < threshold) {
            delete aggr_why[parent];
            continue;
        }
        var why;
        [aggr_grades[parent], why] = aggregate_compute_why(grades, formulas);
        aggr_why[parent].unshift(why);
    }
    return [aggr_grades, aggr_why];
}
function formulas_needs_weights(formulas) {
    if (!formulas || formulas.length !== 1)
        return true;
    if (formulas[0] !== ". Observed = * Max ." && formulas[0] !== ". Observed = * Min .")
        return true;
    return false;
}
function aggr_explain(grade, explanations, descs, hide_unevaluated = false) {
    // explanations : [cutted formula (ex : [".","Observed","=","*","Max","."]), eval 1 : [grade, col], eval 2, ...]
    // formula can be null
    if (!explanations[0])
        return hide_unevaluated ? '' : _("MSG_competence_no_evaluated")         // No evaluation
    if (explanations.length == 2)
        return _("MSG_grade_come_from") + ' «' + explanations[1][1] + '» : '
            + descs[explanations[1][0]]                                         // Only one evaluation
    return formula_explain(explanations[0], descs, grade, _("MSG_evaluations")) // More than one evaluation
}
function table_is_modifiable() {
    return i_am_the_teacher && table_attr.modifiable;
}

function is_catalog_table() {
    return ue === 'INF';
}

// Table_attr :
function create_refine_item(word = null) {
    var item = {
        'observations': null,
        'content': [],
        'aggregate_self': [],
        'aggregate_content': {},
        'column_weights': {}
    }
    if (word && key_words(word).length == 1)
        item.title = competenceTable.catalog.items[word].title;
    return item;
}
function update_table_data(items) {
    // Create «table_attr.p_competence.refine» from all catalogItem
    var refine = {};
    for (var key in items) {
        var item = items[key];
        if (key.includes('+')) {
            var index = key.split('+')[1];
            refine[index] = create_refine_item(key);
            refine[index].title = item.title;
            refine[index].observations = item.observations();
            refine[index].aggregate_self = item.aggregate();
            refine[index].column_weights = item.ue_weights();
            refine[index].aggregate_content = item.children_weights();
        } else {
            var children = [];
            for (var child of item.children()) {
                var i = Number(child.split('+')[1]);
                if (isNaN(i))
                    break;
                children.push(i);
            }
            if (children.length || item.ue_match(ue_code(ue))
                || item.observations_redefined()) {
                refine[key] = create_refine_item();
                if (item.observations_redefined())
                    refine[key].observations = item.observations();
                if (children.length)
                    refine[key].content = children;
                refine[key].aggregate_self = item.aggregate();
                refine[key].column_weights = item.ue_weights();
                refine[key].aggregate_content = item.children_weights();
            }
        }
    }
    update_table_competence(refine);
}
function update_table_competence(value, section = 'refine') {
    if (!i_am_the_teacher) {
        if (!section) {
            table_attr.competence = JSON.stringify(value);
            table_attr.p_competence = value
        } else {
            table_attr.p_competence[section] = value;
            table_attr.competence = JSON.stringify(table_attr.p_competence);
        }
        return table_attr.competence;
    }
    if (!section)
        return table_attr_set('competence', value);
    var table_comp = table_attr.p_competence;
    table_comp[section] = value;
    return table_attr_set('competence', table_comp);
}

// Sort orders :
function human_key_order(aaa, bbb) {
    var a = key_split(aaa);
    var b = key_split(bbb);
    for (var i in a) {
        if (!b[i])
            return 1; // a longer than b
        if (a[i][0] < b[i][0])
            return -1; // a vocabulary smaller than b
        if (a[i][0] > b[i][0])
            return 1; // a vocabulary greater than b
        if (a[i][1] != b[i][1]) {
            // Same vocabulary: alphabetical order
            var aa = competenceTable.catalog.items[a[i].join('')].title;
            var bb = competenceTable.catalog.items[b[i].join('')].title;
            if (aa <= bb)
                return -1;
            else
                return 1;
        }
    }
    // a shorter than b
    return -1;
}
function flat_key_order(a, b, catalog = competenceTable.catalog) {
    var items = catalog.items;
    var desc_a = items[key_last_word(a).join('')].title;
    var desc_b = items[key_last_word(b).join('')].title;
    return flat_descs_order(desc_a, desc_b)
}
function flat_descs_order(desc_a, desc_b) {
    simplified_a = text_simplify(desc_a);
    simplified_b = text_simplify(desc_b);
    if (simplified_a > simplified_b)
        return 1; // a vocabulary is longer than b
    if (simplified_a === simplified_b)
        return 0; // vocabularies are equals
    return -1; // a vocabulary is smaller than b
}

const OBSERVATION_COLORS = ['#7E7979', '#EB707F', '#EEE592', '#BAE291', '#84A661', '#578DCB'];

function observation_color(index) {
    return OBSERVATION_COLORS[index] || OBSERVATION_COLORS[0];
}
function competences_get_cells() {
    /*
    Return a list of all non empty competences cells
    with : [object, line_id, data_col]
    */
    var cells = [];
    for (var col of get_columns_of_type("Competences")) {
        var data_col = col.data_col;
        for (var line_id in lines)
            if (lines[line_id][data_col].value.length)
                cells.push([lines[line_id][data_col], line_id, data_col]);
    }
    return cells;
}
function comp_filtered_cells_values() {
    var cells_values = [];
    for (var cell of competences_get_cells()) {
        var cell_keys = cell[0].value.split(/ +/);
        var col_keys = columns[cell[2]].competence.split(' ');
        for (var i = cell_keys.length - 1; i >= 0; i--)
            if (!col_keys.includes(cell_keys[i].split('o')[0]))
                cell_keys.splice(i, 1);
        if (cell_keys.length)
            cells_values.push([cell_keys.join(' '), cell[1], cell[2]]);
    }
    return cells_values;
}
function check_keys(key_list, catalog = null) {
    // Sort expected keys and unknows. return in index 0 the list of keys and the others in index 1.
    // ex : " f0o0 e0o4 toto s2o2 unknow" -> [["f0o0", "e0o4", "s2o2"], ["toto", "unknow"]]
    var keys = [];
    var unknows = [];
    var grades_length = catalog ? catalog.get_allowed_keys_observations('').length : 10000; // considering infinite grades if catalog is undef
    for (var observation of key_list) {
        var key_end = key_last_word(observation);
        var key = key_subtract_word(observation, 'o' + key_end[1]);
        var [voc, voc_index] = key_last_word(key)
        if (key_end[0] != 'o' || key_end[1] === null || key_end[1] >= grades_length)
            unknows.push([observation, _("ALERT_no_observation_key")]);
        else if (catalog && !catalog.items[voc + voc_index])
            unknows.push([key, _("ALERT_lost_key")]);
        else if (keys.includes(key))
            unknows.push([key, _("ALERT_double_key")]);
        else
            keys.push(key + key_end[0] + (key_end[1] === null ? '' : key_end[1]));
    }
    return [keys, unknows];
}
function competences_test_cell(value, _column) {
    /*  Desc:
        Verify observations keys inputed in a competences cell by the user
        return cell content unchanged
    */
    if (value === '')
        return '';
    var errors = check_keys(value.split(/ +/), competenceTable.catalog)[1];
    var warns = [];
    for (var err of errors)
        warns.push(_('ALERT_invalid_value') + err.join(' '));
    if (warns.length)
        set_message('column_alert', 2, warns.join('\n\n'));
    return value;
}
function competences_recap(cell_keys, catalog = null, textual = false, only_tip = false) {
    // Return a HTML observations recap with colored squares
    var observations = [], tip = ['<table>'];
    var items;
    var keys_list = check_keys(cell_keys, catalog)[0];
    if (catalog) {
        keys_list.sort((a, b) => flat_key_order(a.split('o')[0], b.split('o')[0], catalog));
        items = catalog.items;
    }
    for (var i in keys_list) {
        var comp = keys_list[i].split("o");
        if (isNaN(comp[1]))
            continue
        var last_word = key_last_word(comp[0]).join('');
        if (!items || !items[last_word]) {
            observations.push(comp_observation_span(comp[1]));
            continue;
        }
        var color = observation_color(comp[1]);
        var desc = items[last_word].title;
        var grade_desc = display_grades_desc(catalog, last_word);
        if (grade_desc.length < 6) {
            var all_descs = display_grades_desc(catalog);
            for (var i in grade_desc)
                if (grade_desc[i])
                    all_descs[i] = grade_desc[i];
            grade_desc = all_descs;
        }
        grade_desc = grade_desc[comp[1]].replace(/[(][^(]*$/, '');
        if (textual)
            observations.push(
                '<div style="margin: 5px; display: flex; flex-direction: row">',
                '<p style="white-space: normal; width: 250px; border: 3px solid ',
                color, '; padding: 3px">', grade_desc, '</p>',
                '<p style="white-space: normal; flex: 1; margin: 6px;">',
                desc, '</p></div>'
            );
        else {
            observations.push(comp_observation_span(comp[1]));
            tip.push('<tr><td style="text-align: right">', grade_desc, '</td><td>',
                comp_observation_span(comp[1]), '</td><td>', desc, '</td></tr>');
        }
    }
    if (only_tip)
        return tip.join('');
    observations = observations.join('');
    tip.push('</table>');
    if (!textual)
        observations = hidden_txt(observations, tip.join('')
        ).replace('<div class="text">', '<div class="text" instanttip="1">');
    return observations;
}
function competences_format_suivi() {
    // catalog defined in TMP/0/COMPETENCES/catalog and refined by UE
    return competences_recap(DisplayGrades.value.split(/ +/),
        DisplayGrades.ue.catalog, display_update.top == 'Textual');
}
function get_line_why(catalog, line, column, columns, table_comp) {
    // aggregate a line
    var comp_cols = [];
    for (var data_col of column.average_columns)
        comp_cols.append(data_col);
    if (!comp_cols.length)
        for (var i in columns)
            if (columns[i].type === 'Competences')
                comp_cols.push(i);
    var formulas = aggregate_formulas_compile(table_comp.formulas.observations);
    var grades_weights = table_comp.grades_weights || (null, 0, 5, 10, 15, 20);
    var [grades, why] = aggregate_line(catalog.items, formulas, line, comp_cols, grades_weights);
    return [grades, why, comp_cols];
}
function get_comp_top_parent(catalog, word) {
    var the_word = word;
    var parents = catalog.get_parents(word);
    while (parents.length && parents[0]) {
        the_word = parents[0];
        parents = catalog.get_parents(the_word);
    }
    return the_word;
}

var competenceTable = new CompetenceTable();

function comp_observations_open(value, _column) {
    competenceTable.try_open('open');
    return value;
}
function comp_subcomps_open(value, _column) {
    competenceTable.try_open('open_subcomps');
    return value;
}
function comp_agregate_open(value, _column) {
    competenceTable.try_open('open_aggregate');
    return value;
}
function subcomps_agregate_open(value, _column) {
    competenceTable.try_open('open_subcomps_aggregate');
    return value;
}
function update_cols_comp_results() {
    var result_comps = [];
    for (var col of columns)
        if (col.type == 'COMPETENCES_RESULT' || col.type == 'COMPETENCES_GRADE') {
            col.need_update = true;
            result_comps.push(col.data_col);
        }
    update_columns();
    table_fill(true, false, true);
}
function update_comp_table_header() {
    // Grades weights
    var inputs = [];
    for (var area of document.getElementsByClassName('comp_head_grade_area'))
        inputs.push(area.childNodes[1])
    var grades_weights = table_attr.p_competence.grades_weights;
    if (grades_weights)
        for (var i in inputs)
            inputs[i].value = grades_weights[Number(i) + 1];

    if (!grades_weights || !i_am_the_teacher)
        for (var i in inputs)
            inputs[i].setAttribute('disabled', '');
    else
        for (var i in inputs)
            inputs[i].removeAttribute('disabled');

    // Active Disabled buttons
    var comp_agregate = document.getElementById('comp_agregate_button');
    var subcomps_agregate = document.getElementById('subcomps_agregate_button');
    if (!comp_agregate || !subcomps_agregate)
        return;

    subcomps_agregate.setAttribute('disabled', '');
    if (!competenceTable.catalog_exist)
        return comp_agregate.setAttribute('disabled', '');

    comp_agregate.removeAttribute('disabled', '');
    for (var item of Object.values(competenceTable.catalog.items))
        if (item.children().join('').includes('+')) {
            subcomps_agregate.removeAttribute('disabled');
            break;
        }
}
function update_grade_weight(obj) {
    // Update the observation weight with a value
    var val = Number(obj.value);
    val = isNaN(val) ? 0 : val;
    obj.value = val;
    var index = obj.parentNode.getAttribute('index');
    var grades_weights = [...table_attr.p_competence.grades_weights];
    grades_weights[index] = val;
    for (var i in grades_weights) {
        if (i == 0)
            continue;
        else if (i < index)
            grades_weights[i] = Math.min(grades_weights[i], val);
        else
            grades_weights[i] = Math.max(grades_weights[i], val);
    }
    update_table_competence(grades_weights, 'grades_weights');
    update_comp_table_header();
    update_cols_comp_results();
    competenceTable.do_update = true;
}

async function copy_to_clipboard(text) {    // Untestable in dev environment
    if (!navigator.userAgent.includes('Firefox')) {
        await navigator.permissions.query({ name: 'clipboard-write' });
    }
    await navigator.clipboard.writeText(text);
}
async function display_copied_bubble(obj) {
    var content = obj.innerHTML;
    obj.innerHTML += '<div class="copy_bubble">copié !</div>';
    await new Promise(r => setTimeout(r, 2000));
    obj.innerHTML = content;
}

// ------ Graphics ----------------------------------------------------------------------------- //
function addAlpha(color, opacity) {
    var opacity = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
    return color + opacity.toString(16).toUpperCase();
}
function draw_pie_chart(ctx, parts, size, x, y, selected = null) {
    var pie_length = 0;
    for (var p of parts)
        pie_length += p[1].length;

    // sum of parts sizes is equal to 2*PI
    var pie_slice = Math.PI * 2 / pie_length;
    var pie_parts = [];
    for (var part of parts)
        pie_parts.push([part[0], part[1].length * pie_slice])
    ctx.lineCap = 'round';

    // Selected graph
    var selected_grade;
    if (selected)
        for (var i in pie_parts)
            if (parts[i][1].includes(selected))
                selected_grade = parts[i][0];
    if (Number.isInteger(selected_grade)) { // select_grade !== undefined ?
        ctx.fillStyle = observation_color(selected_grade);
        ctx.moveTo(x, y);
        ctx.beginPath();
        ctx.arc(x, y, size * 0.75, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        return parts;
    }

    // Draw chart
    var rota_gap = -Math.PI / 2;
    for (var i in pie_parts) {
        var [grade, part_size] = pie_parts[i];

        ctx.fillStyle = observation_color(grade);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, size, rota_gap, rota_gap + part_size, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        rota_gap += part_size;
    }

    return parts;
}
function draw_line_pie_chart(parts, selected = null, mouseon_evt = "", mouseout_evt = "") {
    // parts : [[student, student, ...], []]
    // -> index define the grade with index 0 = ungraded and index 6 = no grade
    // return the html of a line pie chart

    var pie_length = 0;
    for (var p of parts)
        pie_length += p.length;
    var pie_slice = 100 / pie_length;
    var line_parts = [];
    for (var elements of parts)
        line_parts.push([elements.length * pie_slice]);

    // Draw chart
    var html = ['<div class="line_pie_chart" onmouseenter="' + mouseon_evt + '" onmouseout="' + mouseout_evt + '">'];
    for (var grade in line_parts)
        if (line_parts[grade])
            html.push('<div style="', grade == 6 ? '' : 'background-color: ' + observation_color(grade), '; width: ',
                line_parts[grade], '%;', parts[grade].includes(selected) ? ' border-width: 3px;' : '', '"></div>');
    html.push("</div>");
    return html.join('');
}

// Sunburst : 
function get_ue_grades(cells) {
    // Get the grades from UE to use for compute catalog.build_root_with_grades
    // cells = {ue: [obs, obs, obs], ue: [...]}
    var ue_grades = {};
    for (var ue of display_data["Grades"][0]) {
        if (ue.fake_ue || !ue.competence || !ue.catalog)
            continue;
        var the_ue = remove_prefix(ue.ue);
        var ue_comp = JSON.parse(ue.competence);
        var formulas = ue_comp.formulas;
        var grades_weights = ue_comp.grades_weights;
        var comp_weights = {};
        var subcomp_weights = {};
        for (var key in ue.catalog.items) {
            item = ue.catalog.items[key]
            comp_weights[item.word] = item.ue_weights();
            if (item.children().join('').indexOf('+') !== -1)
                subcomp_weights[item.word] = item.children_weights();
        }
        var [comps_grades, comp_why] = merge_comps(cells[the_ue], comp_weights,
            aggregate_formulas_compile(formulas.observations), grades_weights, true, true);
        var [merged_comps_grades, subcomps_why] = aggregate_subcomps(comps_grades,
            formulas.subcomps, subcomp_weights, null, false, true);

        // Write grades explanation
        var why = {};
        Object.assign(why, comp_why);
        Object.assign(why, subcomps_why);
        if (!ue.comp_why)
            ue.comp_why = {};
        for (var key in why)
            ue.comp_why[key] = [why[key]];

        var grades = {};
        for (var key in comps_grades)
            if (student_catalog.items[key])
                grades[key] = comps_grades[key];
        for (var key in merged_comps_grades)
            grades[key] = merged_comps_grades[key];
        ue_grades[the_ue] = grades;
    }
    return ue_grades;
}
function grade_tree_simplify(target_tree, tot_depth, layer) {
    var tree = JSON.parse(JSON.stringify(target_tree));
    if (layer + 1 >= tot_depth)
        for (var i = tree.children.length - 1; i >= 0; i--)
            if (tree.children[i].rate == 0)
                tree.children.splice(i, 1);

    for (var i = tree.children.length - 1; i >= 0; i--) {
        if (tree.children[i].key.indexOf('+') !== -1)
            tree.children.splice(i, 1);
        else if (tree.children[i].rate == 0)
            tree.children[i].children = [];
        else
            tree.children[i] = grade_tree_simplify(tree.children[i], tot_depth, layer + 1);
    }
    return tree;
}

function root_get_key(key, root) {
    if (root.key === key)
        return root;
    for (var child of root.children) {
        var child_result = root_get_key(key, child);
        if (child_result)
            return child_result;
    }
    return null;
}

// Draw sunburst
function tree_depth(tree) {
    var depth = 0;
    for (child of tree.children)
        depth = Math.max(depth, tree_depth(child));
    return depth + 1;
}
function slice_path(ctx, layer, button_height, size, gap) {
    var distance = layer * button_height;
    ctx.beginPath();
    if (layer > 0 || size < Math.PI * 2)
        ctx.arc(0, 0, distance, gap, gap + size, false);
    ctx.arc(0, 0, button_height + distance, gap + size, gap, true);
    ctx.closePath();
}
function draw_branch(ctx, info_name, root, size, global_gap, depth, button_height, x, y) {
    var focused;
    var leaves = 0;
    if (root.children.length) {
        for (var child of root.children) {
            var gap = global_gap + size * leaves;
            var branch = draw_branch(ctx, info_name, child, size, gap, depth + 1, button_height, x, y)
            leaves += branch[0];
            if (!focused)
                focused = branch[1];
        }
    } else
        leaves = 1;

    // Competence button draw
    var grade = rint(root.rate || 0);
    ctx.fillStyle = grade == 0 ? 'rgb(0, 0, 0, 0)' : addAlpha(observation_color(grade), Math.sqrt(root.precision));
    slice_path(ctx, depth, button_height, size * leaves, global_gap);
    var mouse_on = x && ctx.isPointInPath(x, y);
    if (mouse_on) {
        update_comp_infos(info_name, root);
        mouse_on = root.key;
    }
    ctx.fill();
    ctx.stroke();
    if (draw_sunburst.focused == root.key)
        draw_sunburst.highlight_cells.push([depth, size * leaves, global_gap]);
    return [leaves, focused || mouse_on];
}
function draw_sunburst(canvas, root, x, y, clicked = false) {
    var info_name = canvas.getAttribute('info');
    var button_height = 0.95 / tree_depth(root);
    var ctx = canvas.getContext("2d");
    var focused = false;
    draw_sunburst.highlight_cells = [];
    var STROKE_DEFAULT_COLOR = "rgb(100, 100, 100)";

    ctx.clearRect(-2, -2, 4, 4);
    var size = Math.PI * 2 / get_tree_leaves(root, false).length;
    ctx.lineWidth = 0.005;
    ctx.strokeStyle = STROKE_DEFAULT_COLOR;
    focused = draw_branch(ctx, info_name, root, size, 0, 0, button_height, x, y)[1];
    ctx.lineWidth = 0.02;
    ctx.strokeStyle = "black";
    for (var [depth, c_size, c_gap] of draw_sunburst.highlight_cells) {
        slice_path(ctx, depth, button_height, c_size, c_gap);
        ctx.stroke();
    }
    ctx.strokeStyle = STROKE_DEFAULT_COLOR;

    // Cursor
    if (focused)
        canvas.style.cursor = 'pointer';
    else {
        canvas.style.cursor = 'auto';
        update_comp_infos(info_name);
    }
    if (focused != draw_sunburst.focused) {
        draw_sunburst.focused = focused;
        draw_sunburst(canvas, root, x, y, clicked);
    }
}

// Init and update
function update_comp_infos(info_name, comp = null, why = true) {
    var [grade, banner, desc, why_area] = document.getElementById(info_name).childNodes;
    if (!comp)
        return [grade.innerText, banner.style.backgroundColor, desc.innerText] =
            [_('TITLE_competences'), observation_color(0), _("MSG_comp_description")];
    var obs = rint(comp.rate || 0);
    var comp_grades = draw_sunburst.grades[comp.key];
    var grade_names = student_catalog.get_allowed_keys_observations(comp.key);
    for (var i in grade_names)
        grade_names[i] = grade_names[i].replace(/[(][^(]*$/, '');
    var grade_text = comp_grades && comp_grades[obs] ? comp_grades[obs] : grade_names[obs];
    var precision_text = comp.precision < 1 ?
        " - " + (comp.precision * 100).toFixed() + '% ' + _("MSG_of_grades") : '';    
    [grade.innerText, banner.style.backgroundColor, desc.innerText] =
        [grade_text + precision_text, observation_color(obs), student_catalog.items[comp.key].title];
    if (why && why_area)
        why_area.innerHTML = display_branch_grade_why(comp, grade_names, student_catalog, draw_sunburst.ue_names);
}
function display_branch_grade_why(branch, grade_names, catalog, ue_names = {}) {
    if (!branch.why[0])
        return '';
    var children = [...branch.children];
    var why_from = children.length ? _("TITLE_competences") : 'UE';
    var explanations = [branch.why[0]];
    for (var [key_grade, the_ue, weight] of branch.why.slice(1).sort((a, b) => a[0] > b[0]))
        explanations.push([rint(key_grade), ue_names[the_ue] || the_ue, weight]);
    for (var child of children.sort((a, b) => a.rate < b.rate))
        if (child.rate)
            explanations.push([rint(child.rate), catalog.items[child.key].title, child.weight]);
    return '<div class="why">'
        + comp_result_explain_comp(children.length ? _("TITLE_competences") : 'UE', rint(branch.rate || 0), explanations, grade_names)
        + '</div>';
}

function sunburst_init(display, root, preference) {
    var canvas = display.firstChild;
    draw_sunburst.grades = {};
    draw_sunburst.focused = null;
    if (preference === 3)
        display.className = 'hidden';
    else {
        display.className = '';
        var printed_root = grade_tree_simplify(root, tree_depth(root), preference);
        while (printed_root.children.length == 1)
            printed_root = printed_root.children[0];
        draw_sunburst(display.firstChild, printed_root, 0, 0);
    }

    // Set mouse on events
    var scale = canvas.height / canvas.getBoundingClientRect().height;
    function draw(event) {
        var x = Math.round(event.offsetX * scale);
        var y = Math.round(event.offsetY * scale);
        draw_sunburst(canvas, printed_root, x, y, event.type == 'click');
    }
    canvas.addEventListener("mousemove", draw, false);
    canvas.addEventListener("click", draw, false);
}
function sunburst_canvas_set(display) {
    var canvas = display.firstChild;
    if (!canvas.getContext)
        return;
    var ctx = canvas.getContext("2d");
    
    ctx.restore();
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(canvas.width * 0.48, canvas.width * 0.48);
}

// ------ Transition functions ------------------------------------------------------------------//
function convert_subcomps_keys() {
    var console_prompt = "";
    // Table subcompetences
    if (table_attr.p_competence.subcompetences) {
        var subcomps = table_attr.p_competence.subcompetences;
        for (var key in subcomps)
            if (key_words(key).length > 1) {
                var word = key_last_word(key).join("")
                console_prompt += "subcomps " + key + " -> " + word + "\n";
                subcomps[word] = subcomps[key];
                delete subcomps[key];
            }
        update_table_competence(subcomps, "subcompetences");
    }
    // Table keys list
    if (table_attr.p_competence.keys) {
        var table_keys = table_attr.p_competence.keys;
        for (var i in table_keys)
            if (table_keys[i].includes("+") && key_words(table_keys[i]).length > 2) {
                var old = table_keys[i]
                table_keys[i] = key_words(old).slice(-2).join('');
                console_prompt += "table keys " + old + " -> " + table_keys[i];
            }
        update_table_competence(table_keys, "keys");
    }
    if (columns[the_current_cell.data_col].type === "Competences") {
        // Column keys list
        var col_keys = popup_column().competence.split(/ +/);
        for (var i in col_keys)
            if (col_keys[i].includes("+") && key_words(col_keys[i]).length > 2) {
                var old = col_keys[i]
                col_keys[i] = key_words(old).slice(-2).join('');
                console_prompt += "column keys " + old + " -> " + col_keys[i] + "\n";
            }
        if (column_change_allowed(popup_column()))
            column_attr_set(popup_column(), "competence", col_keys.join(" "));
        else
            popup_column().competence = col_keys.join(" ");
    }
    // Cells table Scan
    var cells = competences_get_cells();
    for (var cell of cells) {
        var values = cell[0].value.split(/ +/);
        var update_cell = false;
        for (var i in values) {
            var is_subcomp = values[i].includes("+");
            var splited = key_words(values[i]);
            if (is_subcomp && splited.length > 3) {
                var old = values[i];
                values[i] = key_words(old).slice(-3).join('');
                console_prompt += "cell " + cell[1] + "/" + cell[2] + " " + old + " -> " + values[i] + "\n";
                update_cell = true;
            } else if (!is_subcomp && splited.length > 2) {
                var old = values[i];
                values[i] = key_words(old).slice(-2).join('');
                console_prompt += "cell " + cell[1] + "/" + cell[2] + " " + old + " -> " + values[i] + "\n";
                update_cell = true;
            }
        }
        if (update_cell) {
            cell_set_value_real(cell[1], cell[2], values.join(' ').trim());
            update_cell_at(cell[1], cell[2]);
        }
    }
    if (console_prompt.length)
        console.log(console_prompt);
}
function convert_table_attr(old_table) {
    var table = { 'refine': old_table.refine || {} };

    // Add table competences
    if (old_table.keys)
        for (var key of old_table.keys)
            if (!table.refine[word] && !key.includes('+')) {
                var word = key_last_word(key).join('');
                table.refine[word] = create_refine_item(word);
            }

    // Add subcompetences
    var modified_subcomps = {};
    var subcomps_nbr = 0;
    while (table.refine[subcomps_nbr])
        subcomps_nbr++;

    if (old_table.subcompetences)
        for (var key in old_table.subcompetences) {
            if (key.includes('+'))
                continue;

            var word = key_last_word(key).join('');
            for (var i in old_table.subcompetences[word]) {
                var desc = old_table.subcompetences[word][i];
                if (desc) {
                    if (!table.refine[word])
                        table.refine[word] = create_refine_item(word);
                    table.refine[subcomps_nbr] = create_refine_item();
                    table.refine[subcomps_nbr].title = desc;
                    table.refine[word].content =
                        table.refine[word].content.concat(subcomps_nbr);
                    modified_subcomps[key + '+' + i] = '+' + subcomps_nbr;
                    subcomps_nbr++;
                }
            }
        }
    // Transform subcomps in cells :
    var cells = competences_get_cells();
    for (var cell of cells) {
        var values = cell[0].value.split(/ +/);
        var update_cell = false;
        for (var i in values) {
            var [val_key, grade] = values[i].split('o');
            if (val_key in modified_subcomps) {
                values[i] = modified_subcomps[val_key] + 'o' + grade;
                update_cell = true;
            }
        }
        if (update_cell) {
            cell_set_value_real(cell[1], cell[2], values.join(' ').trim());
            update_cell_at(cell[1], cell[2]);
        }
    }

    if (old_table.grades_vocab)
        for (var key in old_table.grades_vocab) {
            if (!key.includes('+'))
                continue;

            var word = key_last_word(key).join('');
            if (!competenceTable.catalog.items[word])
                continue;
            if (!table.refine[word])
                table.refine[word] = create_refine_item(word);
            table.refine[word].observations = old_table.grades_vocab[word];
        }

    return table.refine;
}

function formula_explain_list(display_formulas = false) {   // Used for debug
    var sentences = [];
    var obs_grades = ['', 'Observation 1', 'Observation 2', 'Observation n+1', 'n+2', 'n+3'];
    var conds = ["Observed", "Average", "MostFrequent", "MoreFrequentThanBetters", "AverageNeNa"];

    // Default formulas :
    sentences.push((display_formulas ? 'Minimum' + '\t: ' : '') + '\n• Plus petite des notes observées.\n• '
        + formula_explain([".", "Observed", "=", "*", "Max", "."], obs_grades, 1) + ' [liste des compétences]');
    sentences.push((display_formulas ? 'Maximum' + '\t: ' : '') + '\n• Plus grande des notes observées.\n• '
        + formula_explain([".", "Observed", "=", "*", "Min", "."], obs_grades, 1) + ' [liste des compétences]');
    // Special formulas :
    for (var cond of conds)
        for (var [compar, minmax] of [["=", "Min"], ["=", "Max"], ["≥", "Min"]]) {
            var f = ['*', cond, compar, "*", minmax, "1"];
            var f_display = ['*', cond, compar, "X", minmax, "Y"]
            sentences.push((display_formulas ? f_display.join(' ') + '\t: ' : '')
                + '\n' + competenceTable.get_aggr_formula_text(f.join(' '), obs_grades).replace('<br> ', '')
                + '\n• ' + formula_explain(f, obs_grades, 1) + ' [liste des compétences]');
        }
    return (display_formulas ? "Code de formule\t:\n" : "")
        + "• Description de la méthode d'évaluation\n• Description du résultat obtenu\n\n"
        + sentences.join('\n\n');
}
function _Competences()
{
  var t = _Text() ;
  t.title = 'Competences' ;
  t.attributes_visible = ['url_import', 'groupcolumn'] ;
  t.cell_test = competences_test_cell ;
  t.formatte_suivi = competences_format_suivi ;
  t.human_priority = 5 ;
  t.ondoubleclick = comp_observations_open ;
  t.tip_cell = "" ;
  return t ;
}
function comp_result_open() {
    competenceTable.comp_result_open();
}

function comp_result_recap(cell_val, catalog = null, data_why = null, textual = false, only_tip = false) {
    // Return a HTML grades repartitions recap in a line_pie_chart
    // data_why : dict of explanation. For all keys, 1st element is the formulas used and others are observation's provenance
    // data_why in table side = [line, column] : data_why is computed to be a dict
    var cell_keys = cell_val.split(';')[0];
    cell_keys = cell_keys ? cell_keys.split(/ +/) : [];
    if (!cell_keys.length)
        return ' ';
    var tip = [];
    var parts = [[], [], [], [], [], [], []];
    var key_list = {};
    var first_key = null;
    for (var obs of cell_keys) {
        if (obs === '')
            continue;
        var [key, grade] = obs.split("o");
        key_list[key] = Number(grade);
        if (!first_key) first_key = key;
        parts[grade].push(key);
    }
    var result = draw_line_pie_chart(parts);
    if (!catalog)
        return result;

    // tips datas
    why = data_why || {};
    var descs = display_grades_desc(catalog, first_key ? catalog.get_parents(first_key)[0] : '');
    var [aggr_grades, aggr_why] = comp_result_aggr_grades(catalog, key_list);
    var aggr_keys = Object.keys(aggr_grades).sort((a, b) => flat_key_order(a.split('o')[0], b.split('o')[0], catalog));

    if (textual) {
        result = [];
        for (var key of Object.keys(key_list).sort((a, b) => flat_key_order(a, b, catalog))) {
            if(!why[key])
                continue;
            var detail = aggr_explain(key_list[key], why[key], descs);
            if (why[key].length > 2)
                for (var [key_grade, col, weight] of why[key].slice(1).sort((a, b) => a[0] > b[0]))
                    detail += '<br>' + descs[key_grade] + ' coef. ' + weight + ' : ' + col;
            result.push('<div style="margin: 5px"><section style="border: 3px solid ', observation_color(key_list[key]),
                '; padding: 3px; white-space: normal;">', descs[key_list[key]], ' : ', catalog.items[key].title, '</section>',
                '<section style="white-space: normal; flex: 1; padding-left: 30px;">', detail, '</section></div>');
        }
        if (aggr_keys.length)
            result.push('<div><hr></div>');
        for (var key of aggr_keys) {
            var g = rint(aggr_grades[key])
            result.push('<section style="border: 3px solid ', observation_color(g), '; padding: 3px; white-space: normal;">',
                descs[g], ' : ', (catalog.items[key] ? catalog.items[key].title : '?'), '</section>');
        }
        return result.join('');
    } else if (!data_why)
        return result;

    // Merged grades
    for (var key of Object.keys(key_list).sort((a, b) => flat_key_order(a, b, catalog)))
        tip.push('<div class="line_area" onclick="toggle_tip_details(this)"><div class="comp_tip_line">',
            '<p>▶</p>', comp_observation_span(key_list[key]), (catalog.items[key] ? catalog.items[key].title : '?'),
            '</div><div class="comp_tip_line_detail closed">',
            comp_result_explain_comp(_("MSG_evaluations"), key_list[key], why[key], descs), '</div></div>');
    // Aggregated grades
    if (aggr_keys.length)
        tip.push('<div><hr></div>');
    for (var key of aggr_keys)
        tip.push('<div class="line_area" onclick="toggle_tip_details(this)"><div class="comp_tip_line">',
            '<p>▶</p>', comp_observation_span(aggr_grades[key]), (catalog.items[key] ? catalog.items[key].title : '?'),
            '</div><div class="comp_tip_line_detail closed">',
            comp_result_explain_comp(_("TITLE_competences"), aggr_grades[key], aggr_why[key], descs), '</div></div>');
    if (only_tip)
        return tip.join('');
    return hidden_txt(result, tip.join('')).replace('<div class="text">', '<div class="text" instanttip="1">');
}
function comp_result_format_table(val, catalog, line, column, textual = false, only_tip = false) {
    var data_why = comp_result_compute_why(catalog, line, column, columns, table_attr.p_competence);
    return comp_result_recap(val, catalog, data_why, textual, only_tip);
}
function comp_result_format_suivi() {
    var line = [];
    for (var cell of DisplayGrades.ue.line)
        line.push({ value: cell[0] || "" });
    var why = DisplayGrades.ue.catalog ? comp_result_compute_why(DisplayGrades.ue.catalog, line,
        DisplayGrades.column, DisplayGrades.ue.columns, DisplayGrades.ue.p_competence) : null;
    return comp_result_recap(DisplayGrades.value,
        DisplayGrades.ue.catalog, why, display_update.top == 'Textual');
}
function comp_result_format_suivi_no_details() {
    return comp_result_recap(DisplayGrades.value, DisplayGrades.ue.catalog, null, display_update.top == 'Textual');
}

function comp_result_compute_why(catalog, line, column, columns, table_comp) {
    var [aggr_grades, why, comp_cols] = get_line_why(catalog, line, column, columns, table_comp);
    var threshold = 0.75;
    var aggr_why = catalog.aggregate_parent_of(aggr_grades, threshold, true);
    while (aggr_grades.length) {
        for (key in aggr_grades)
            if (key in aggr_why)
                why[key] = [aggr_why[key]];
        aggr_grades, aggr_why = catalog.aggregate_parent_of(aggr_grades, threshold, True);
    }
    for (var col of comp_cols)
        for (var obs of check_keys(line[col].value.strip().split(/ +/), catalog)[0]) {
            var [key, grade] = obs.split('o');
            var weights = catalog.items[key].ue_weights();
            if (why[key])
                why[key].push([Number(grade), columns[col].title, typeof weights[col] == "number" ? weights[col] : 1]);
        }
    return why;
}

function comp_result_explain_comp(why_from, grade, explanations, descs) {
    // explanations = [formula, [grade, col, weight], [grade, col, weight], ...] || null
    if (!explanations)
        return '';
    var why = [aggr_explain(grade, explanations, descs)];
    var hide_weights = explanations[0] && !formulas_needs_weights([explanations[0].join(' ')]);
    var from = why_from.charAt(0).upper() + why_from.slice(1);
    if (explanations.length > 2) {
        why.push('<table class="explain_result_table"><thead><tr style="background:rgb(0, 0, 0, .2)"><th>', _("MSG_result"),
            '</th>', (hide_weights ? '' : '<th>' + _("MSG_coefficient") + '</th>'), '<th>', from, '</th></tr></thead>');
        for (var [grade, col, weight] of explanations.slice(1))
            why.push('<tr><th style="background: ', addAlpha(observation_color(grade), 0.6), '">',
                descs[grade], '</th>', (hide_weights ? '' : '<th>' + weight + '</th>'), '<th class="title">', col, '</th></tr>');
        why.push('</table>');
    }
    return why.join('');
}

function _COMPETENCES_RESULT()
{
  var t = _Competences() ;
  t.title = 'COMPETENCES_RESULT' ;
  t.attributes_visible = ['minmax', 'columns', 'abi_is', 'rounding', 'weight'] ;
  t.cell_compute = comp_result_cell_compute ;
  t.cell_is_modifiable = 0 ;
  t.formatte_suivi = comp_result_format_suivi ;
  t.human_priority = -7 ;
  t.ondoubleclick = comp_result_open ;
  t.type_change = function(column) {column_attr_set(column, 'columns', "*Competences");} ;
  t.type_type = "computed" ;
  return t ;
}

function _Code_Etape()
{
  var t = _Text() ;
  t.title = 'Code_Etape' ;
  t.attributes_visible = ['columns'] ;
  t.human_priority = 12 ;
  t.tip_cell = "" ;
  t.type_type = "people" ;
  return t ;
}

function _Mail()
{
  var t = _Code_Etape() ;
  t.title = 'Mail' ;

  return t ;
}

function _Surname()
{
  var t = _Mail() ;
  t.title = 'Surname' ;

  return t ;
}

function _Get_Referent()
{
  var t = _Mail() ;
  t.title = 'Get_Referent' ;

  return t ;
}

function _Can_Bring_A_Pc()
{
  var t = _Mail() ;
  t.title = 'Can_Bring_A_Pc' ;

  return t ;
}

function _Civilite()
{
  var t = _Mail() ;
  t.title = 'Civilite' ;
  t.human_priority = 1300 ;
  return t ;
}

function _COMPETENCES_YEAR_RESULT()
{
  var t = _Mail() ;
  t.title = 'COMPETENCES_YEAR_RESULT' ;
  t.attributes_visible = ['minmax', 'columns', 'abi_is', 'rounding', 'weight'] ;
  t.cell_is_modifiable = 0 ;
  t.formatte_suivi = comp_result_format_suivi_no_details ;
  t.human_priority = -7 ;
  t.type_change = function(column) {column_attr_set(column, 'columns', "*Competences");
        column_attr_set(column, 'comment', "attention, notes calculées avec une journée de retard");
    } ;
  t.type_type = "computed" ;
  return t ;
}

function _Working_Hours()
{
  var t = _Mail() ;
  t.title = 'Working_Hours' ;

  return t ;
}

function _Phone()
{
  var t = _Mail() ;
  t.title = 'Phone' ;

  return t ;
}

function _Commute_Time()
{
  var t = _Mail() ;
  t.title = 'Commute_Time' ;

  return t ;
}

function _Firstname()
{
  var t = _Mail() ;
  t.title = 'Firstname' ;

  return t ;
}

function _First_Registration()
{
  var t = _Mail() ;
  t.title = 'First_Registration' ;

  return t ;
}

function _Status()
{
  var t = _Mail() ;
  t.title = 'Status' ;
  t.human_priority = 3000 ;
  return t ;
}

function _Abis()
{
  var t = _Mail() ;
  t.title = 'Abis' ;

  return t ;
}

function _Grade()
{
  var t = _Mail() ;
  t.title = 'Grade' ;
  t.human_priority = 2000 ;
  return t ;
}

function _Redoublement()
{
  var t = _Mail() ;
  t.title = 'Redoublement' ;
  t.human_priority = 1300 ;
  return t ;
}

function _Nbia()
{
  var t = _Mail() ;
  t.title = 'Nbia' ;
  t.human_priority = 1200 ;
  return t ;
}

function _Preinsiufm()
{
  var t = _Mail() ;
  t.title = 'Preinsiufm' ;
  t.human_priority = 2000 ;
  return t ;
}

function _Cod_Pru()
{
  var t = _Mail() ;
  t.title = 'Cod_Pru' ;
  t.human_priority = 3000 ;
  return t ;
}

function _Je_Viens()
{
  var t = _Mail() ;
  t.title = 'Je_Viens' ;
  t.human_priority = 1 ;
  t.type_change = 
    function(column) {
        if ( column.title.substr(0, default_title.length) == default_title ) {
            column_attr_set(column, 'title', 'Je_viens');
            table_header_fill();
        }
    } ;
  return t ;
}

function _Formation()
{
  var t = _Mail() ;
  t.title = 'Formation' ;
  t.human_priority = 10000 ;
  t.type_type = "ue" ;
  return t ;
}

function _Sportif()
{
  var t = _Mail() ;
  t.title = 'Sportif' ;
  t.human_priority = 1000 ;
  return t ;
}

function _Credits()
{
  var t = _Mail() ;
  t.title = 'Credits' ;
  t.attributes_visible = ['minmax', 'columns'] ;
  t.human_priority = 100 ;
  t.type_type = "ue" ;
  return t ;
}

function _Resultat()
{
  var t = _Mail() ;
  t.title = 'Resultat' ;
  t.attributes_visible = ['weight', 'rounding', 'columns'] ;
  t.cell_is_modifiable = 0 ;
  t.formatte = note_format ;
  t.human_priority = 1200 ;
  return t ;
}

function _Etablissement()
{
  var t = _Mail() ;
  t.title = 'Etablissement' ;
  t.human_priority = 2000 ;
  return t ;
}

function _Cod_Cat()
{
  var t = _Mail() ;
  t.title = 'Cod_Cat' ;
  t.human_priority = 1300 ;
  return t ;
}

function _Apogee()
{
  var t = _Mail() ;
  t.title = 'Apogee' ;
  t.attributes_visible = ['weight', 'rounding', 'columns'] ;
  t.formatte = note_format ;
  t.human_priority = 1100 ;
  t.type_change = function(column)
    {
    column_attr_set(column, 'visibility', 2) ;
    table_header_fill() ;
    } ;
  return t ;
}

function _Moyenne_Courante()
{
  var t = _Apogee() ;
  t.title = 'Moyenne_Courante' ;

  return t ;
}

function _Mail_Resps_Ue_P()
{
  var t = _Mail() ;
  t.title = 'Mail_Resps_Ue_P' ;
  t.human_priority = 1000 ;
  t.type_type = "ue" ;
  return t ;
}

function _Mail_Resps_Ue_A()
{
  var t = _Mail_Resps_Ue_P() ;
  t.title = 'Mail_Resps_Ue_A' ;

  return t ;
}

function _Mail_Resps_Ue()
{
  var t = _Mail_Resps_Ue_P() ;
  t.title = 'Mail_Resps_Ue' ;

  return t ;
}

function _Responsable_P()
{
  var t = _Mail() ;
  t.title = 'Responsable_P' ;
  t.human_priority = 100 ;
  t.type_type = "ue" ;
  return t ;
}

function _Population_Rv()
{
  var t = _Responsable_P() ;
  t.title = 'Population_Rv' ;
  t.type_type = "people" ;
  return t ;
}

function _Responsable_A()
{
  var t = _Responsable_P() ;
  t.title = 'Responsable_A' ;

  return t ;
}

function _Nombre_Etudiants()
{
  var t = _Responsable_P() ;
  t.title = 'Nombre_Etudiants' ;

  return t ;
}

function _Discipline()
{
  var t = _Responsable_P() ;
  t.title = 'Discipline' ;
  t.type_type = "people" ;
  return t ;
}

function _Populations()
{
  var t = _Responsable_P() ;
  t.title = 'Populations' ;
  t.type_type = "people" ;
  return t ;
}

function _Intitule_Ue()
{
  var t = _Responsable_P() ;
  t.title = 'Intitule_Ue' ;

  return t ;
}

function _Nombre_Etudiants_Max()
{
  var t = _Responsable_P() ;
  t.title = 'Nombre_Etudiants_Max' ;

  return t ;
}

function _Portail()
{
  var t = _Responsable_P() ;
  t.title = 'Portail' ;
  t.type_type = "people" ;
  return t ;
}

function _Nombre_Etudiants_Printemps()
{
  var t = _Responsable_P() ;
  t.title = 'Nombre_Etudiants_Printemps' ;

  return t ;
}

function _Nombre_Etudiants_Automne()
{
  var t = _Nombre_Etudiants_Printemps() ;
  t.title = 'Nombre_Etudiants_Automne' ;

  return t ;
}

function _Mcc_Duree_Session_1()
{
  var t = _Responsable_P() ;
  t.title = 'Mcc_Duree_Session_1' ;

  return t ;
}

function _Mcc_Duree_Session_2()
{
  var t = _Mcc_Duree_Session_1() ;
  t.title = 'Mcc_Duree_Session_2' ;

  return t ;
}

function _Mcc_Type_Epreuve_1()
{
  var t = _Mcc_Duree_Session_1() ;
  t.title = 'Mcc_Type_Epreuve_1' ;

  return t ;
}

function _Mcc_Type_Epreuve_2()
{
  var t = _Mcc_Type_Epreuve_1() ;
  t.title = 'Mcc_Type_Epreuve_2' ;

  return t ;
}

function compute_column_stat(column) {
    var data_col = column.data_col;
    var max = -1e40;
    var v, sum, sum2, nr;

    sum = 0;
    sum2 = 0;
    nr = 0;
    for (var lin in lines) {
        v = lines[lin][data_col].value;
        if (v === '')
            v = column.empty_is;
        if (v > max)
            max = v;
        v = a_float(v);
        if (isNaN(v))
            continue;
        nr++;
        sum += v;
        sum2 += v * v;
    }
    v = 1;
    while (v < max) {
        v *= 2;         // 2
        if (v >= max)
            break;
        v *= 2;         // 4
        if (v >= max)
            break;
        v = Math.round((v / 4) * 5);  // 5
        if (v >= max)
            break;
        v *= 2;         // 10
    }

    column.computed_max = v;
    if (nr) {
        column.computed_avg = sum / nr;
        column.computed_var = Math.pow(sum2 / nr - sum * sum / (nr * nr), 0.5);
    }
    else {
        column.computed_avg = 0;
        column.computed_var = 0;
    }
}


function test_note(value, column) {
    var v = value.toUpperCase();
    var vv = test_prst(v, column, true);
    if (vv && vv !== pre)
        return vv;
    if (v === ppn_char || v === ppn || v === ppn_short)
        return ppn;
    if (v === tnr_char || v === tnr || v === tnr_short)
        return tnr;
    if (v === '')
        return v;
    if (allowed_grades[v])
        return v;
    v = a_float(v);
    if (column.round_by) {
        v = Math.round(v * (1 / column.round_by)) / (1 / column.round_by);
    }
    if (isNaN(v) || v < column.min || v > column.max) {
        var more = [];
        for (var i in allowed_grades)
            more.push(i + ' : ' + allowed_grades[i][1] + '\n');

        alert_append('«' + value + '»' + _("ALERT_bad_grade") + column.minmax + "\n"
            + abi + " (" + abi_char + ") : " + _("MSG_T_abi") + "\n"
            + abj + " (" + abj_char + ") : " + _("MSG_T_abj") + "\n"
            + ppn + " (" + ppn_char + ") : " + _("MSG_T_ppn") + "\n"
            + tnr + " (" + tnr_char + ") : " + _("MSG_T_tnr") + "\n"
            + more.join("")
        )
        return;
    }

    return v;
}

function note_format(c, column) {
    return column.do_rounding(c);
}

function note_format_suivi() {
    if (cell_modifiable_on_suivi())
        return text_format_suivi();
    if (DisplayGrades.value === '')
        return '';
    var s = DisplayGrades.column.min === 0
        ? '/' + DisplayGrades.column.max
        : '[' + DisplayGrades.column.min + ';' + DisplayGrades.column.max + ']';
    if (DisplayGrades.column.min == 0 && DisplayGrades.column.max == 20)
        s = '<span class="displaygrey">' + s + '</span>';

    return DisplayGrades.column.do_rounding(DisplayGrades.value)
        + '<small style="font-size:60%">' + s + '</small>';
}

function _Note()
{
  var t = _Text() ;
  t.title = 'Note' ;
  t.attributes_visible = ['minmax', 'weight', 'rounding', 'repetition', 'url_import', 'groupcolumn', 'grade_type', 'grade_session', 'replace_in_avg'] ;
  t.cell_test = test_note ;
  t.formatte = note_format ;
  t.formatte_suivi = note_format_suivi ;
  t.human_priority = -10 ;
  t.should_be_a_float = 1 ;
  t.tip_cell = "TIP_cell_Note" ;
  t.tip_filter = "TIP_filter_Note" ;
  return t ;
}

mathjaxurl = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";

function Rand(seed) {
    this.seed = 1;
    for (var i = 0; i < seed.length; i++)
        this.seed = (2 * this.seed + seed.charCodeAt(i)) & 0x7fffffff;
    this.int();
}

Rand.prototype.int = function () {
    return this.seed = (1664525 * this.seed + 1013904223) & 0x7FFFFFFF;
};

function uncheck_if_checked(label) {
    // Use setTimeout to let the default behaviour some time to run
    var input = label.getElementsByTagName('INPUT')[0];
    if (input.checked && !input.disabled)
        setTimeout(function () { input.checked = false; }, 100);
    setTimeout(function () { mcq_from_element(input).update_html_student(); }, 200);
}

function mcq_use_bad_answer_value(x) {
    var p = x.option('progressive');
    return p != '±' && p != 'AMC';
};

/**************************************************************************/

function MCQ_Choice(args, parent, key) {
    this.choice = args[0];
    this.options = args[1];
    this.parent = parent;
    this.key = key;
    this.full_key = this.parent.full_key + '\001' + key;
    if (this.options === undefined)
        this.options = {};
}

MCQ_Choice.prototype.html_student = function (hide_answers) {
    var choice = this.choice;
    if (!this.option('html_choice'))
        choice = html(choice);
    choice = this.obfuscate(choice);
    var type;
    if (this.option('radio'))
        type = 'radio';
    else
        type = 'checkbox';
    var show_answers = this.parent.options.grade !== undefined && !hide_answers;
    var checked = this.parent.parent.checked[this.parent.key + '=' + this.key];
    var grade = show_answers && this.parent.options.grade[0][0];
    if (!show_answers
        && (this.parent.parent.options.gui == 'print'
            || this.parent.parent.options.gui == 'preview'
        ))
        checked = false;

    var expected = show_answers && (myindex(grade, this.key) != -1
        || myindex(grade, Number(this.key)) != -1);
    var color = (show_answers
        ? (!!expected == !!checked && checked ?
            'border:3px solid #0F0;' : '')
        +
        (!expected & checked ? 'border:1px solid #F00;' : '')
        : ''
    );
    return '<label onmouseup="uncheck_if_checked(this)">'
        + '<table class="mcqchoice">'
        + '<tr><td>'
        + '<input type="' + type
        + '" name="' + this.parent.full_key
        + '"' + (show_answers || !this.parent.parent.modifiable ? ' disabled' : '')
        + ' value="' + this.key + '"'
        + (checked ? ' checked' : '')
        + '>'
        + '<td style="'
        + (show_answers && !expected ? 'opacity: 0.3;' : '')
        + color
        + encode_value(this.option('choice_CSS') || '')
        + '">'
        + choice
        + (show_answers && (expected || checked)
            ? ' <span class="expected">'
            + (expected && checked
                ? _("LABEL_MCQ_expected_yes")
                : (expected && !checked
                    ? _("LABEL_MCQ_expected")
                    : _("LABEL_MCQ_expected_no")
                )
            ) + '</span>'
            : '')
        + '</td></table></label>\n';
};

MCQ_Choice.prototype.json = function () {
    if (Object.keys(this.options).length == 0)
        return [this.choice];
    return [this.choice, this.options];
};

MCQ_Choice.prototype.html_table = function (checked) {
    var answer = '';
    var key = this.parent.key + '=' + this.key;
    var active = '';
    if (mcq_filter_active(key))
        active = ' ×' + _('filtre.png');
    if (this.option('show_answers')) {
        var student = this.parent.parent.checked[key];
        if (student)
            if (!checked)
                answer = '#F00"';
            else
                answer = '#0F0"';
        else
            answer = '#DDD';
        answer = ' style="border: 2px solid ' + answer + '"';
    }
    return '<tr id="' + this.full_key + '" class="mcq_choice">'
        + '<td><span' + (this.previous ? '' : ' style="color: transparent"')
        + '>↑</span>&nbsp;<span' + (this.next ? '' : ' style="color: transparent"')
        + '>↓</span>'
        + '<td><input type="checkbox"' + (checked ? ' checked' : '')
        + '>'
        + '<td' + answer + '><input value="' + encode_value(this.choice)
        + '">'
        + (this.parent.parent.options.stats
            ? '<td><span onclick="mcq_filter(\'' + key + '\')">' + this.nr_checked + active
            : '')
        + '</tr>';
};

MCQ_Choice.prototype.option = function (name) {
    if (this.options[name] === undefined)
        return this.parent.option(name);
    return this.options[name];
};

MCQ_Choice.prototype.next_priority = function () {
    if (!this.next)
        return;
    if (this.next.next)
        this.options.priority = (this.next.options.priority
            + this.next.next.options.priority) / 2;
    else
        this.options.priority = this.next.options.priority + 1;
}

MCQ_Choice.prototype.previous_priority = function () {
    if (!this.previous)
        return;
    if (this.previous.previous)
        this.options.priority = (this.previous.options.priority
            + this.previous.previous.options.priority) / 2;
    else
        this.options.priority = this.previous.options.priority - 1;
}

/**************************************************************************/

function MCQ_Question(args, parent, key) {
    this.question = args[0];
    var choices = args[1];
    this.options = JSON.parse(JSON.stringify(args[2]));
    this.parent = parent;
    this.key = key;
    this.full_key = this.parent.key + '\001' + key;
    if (this.options == undefined)
        this.options = {};
    this.choices = {};
    for (var key in choices)
        this.choices[key] = new MCQ_Choice(choices[key], this, key);
    this.sorted_choices = sorted_dictionary(this.choices);
    var sc = this.sorted_choices;
    for (var i = 0; i < sc.length; i++) {
        sc[i].previous = i ? sc[i - 1] : undefined;
        sc[i].next = i != sc.length - 1 ? sc[i + 1] : undefined;
        sc[i].options.priority = Number(i);
    }
}

MCQ_Question.prototype.get_student_choices = function (rand) {
    return sorted_dictionary(
        this.choices,
        this.option('shuffle_choices') && rand)
};

function obfuscate(txt) {
    if (txt.length <= 4) // Do not touch 2 firsts and 2 lasts
        return txt;
    var rand = new Rand(txt + millisec());
    var t = [txt.substr(0, 2)];
    for (var i = 2; i < txt.length - 1; i++) {
        if (rand.int() % 3 == 0)
            t.push('<H>'
                + txt.substr(rand.int() % txt.length, 1).replace(/[&<> ]/, ' ')
                + '</H>');
        t.push(txt.substr(i, 1));
    }
    t.push(txt.substr(txt.length - 1));
    return t.join('');
}

MCQ_Question.prototype.obfuscate = function (txt) {
    if (this.option('obfuscate') != 2)
        return txt;
    if (!this.option('math') == 'no')
        return txt.replace(/(>|^|;)([^<>&;]*)(<|&|$)/g, obfuscate);
    if (txt.match(/\$\$/))
        return txt;
    return txt.replace(/(>|^|\\\)|\\\]|;)([^<>\\&;]*)(<|\\\(|\\\[|&|$)/g, obfuscate);
}
MCQ_Choice.prototype.obfuscate = MCQ_Question.prototype.obfuscate;

MCQ_Question.prototype.html_student = function (hide_answers) {
    var question = this.question;
    if (!this.option('html_question'))
        question = html(question).replace(/\n\n/g, '<br>');
    question = this.obfuscate(question);
    var use_bad = mcq_use_bad_answer_value(this);

    var s = ['<section class="mcqquestion" id="', this.full_key, '" style="',
        this.option('obfuscate') ? 'user-select: none;' : '',
        encode_value(this.option('question_CSS') || ''),
        '">',
        '<div role="heading">'];
    if (this.option('scoring_scale'))
        s.push(
            (this.option('good_answer') != this.parent.option('good_answer')
                ? '<span class="grading">' + _('MSG_mcq_good_answer') + ':' + _('MSG_mcq_good_answer_' + this.option('good_answer')) + '</span>' : ''),
            (this.option('no_answer') != this.parent.option('no_answer')
                ? '<span class="grading">' + _('MSG_mcq_no_answer') + ':' + _('MSG_mcq_no_answer_' + this.option('no_answer')) + '</span>' : ''),
            ((this.option('bad_answer') != this.parent.option('bad_answer') && use_bad)
                ? '<span class="grading">' + _('MSG_mcq_bad_answer') + ':' + _('MSG_mcq_bad_answer_' + this.option('bad_answer')) + '</span>' : ''),
            (this.option('progressive') != this.parent.option('progressive')
                ? '<span class="grading">' + hidden_txt(_('MSG_mcq_progressive') + ':' + _('MSG_mcq_progressive_' + this.option('progressive')),
                    _('MSG_mcq_progressive_' + this.option('progressive') + '_help')) + '</span>' : ''),
            hide_answers || !this.option('grade') ? '' : '<span class="question_grade">' + this.grade().toFixed(2) + '</span>'
        );
    s.push(question, '</div>');
    var choices = this.get_student_choices(this.parent.get_student_rand(undefined, this.key));
    for (var i in choices)
        s.push(choices[i].html_student(hide_answers));
    s.push('</section>\n');

    return s.join('');
};

MCQ_Question.prototype.html_table = function () {
    var stats = this.parent.options.stats;
    if (stats) {
        stats = ['<td><table class="stats colored"><tr><th>' + _("B_Note")];
        var grades = [];
        for (var k in this.grade_sum)
            grades.push(k);
        grades.sort(function (a, b) { return Number(a) - Number(b); });
        for (var k in grades)
            stats.push('<td>' + Number(grades[k]).toFixed(2).replace('.00', ''));
        stats.push('</tr><tr><th>' + _("B_s_nr_"));
        for (var k in grades)
            stats.push('<td>' + this.grade_sum[grades[k]]);
        stats.push('</tr></table>');
        stats = stats.join('');
    }
    else
        stats = '';
    var s = [
        '<table id="' + this.key + '" ',
        'onclick="mcq.update_question(this, event)" ',
        'onkeyup="mcq.update_question(this, event)" ',
        'onchange="mcq.update_question(this, event)" ',
        'ondrop="mcq.update_question(this, event)" ',
        'onblur="mcq.update_question(this, event)">',
        '<tr class="question_menu"><td colspan="3">',
        this.parent.options_html(this.parent.question_options, this.parent.options, this.options),
        '<td>', _("TITLE_table_attr_statistics"),
        '</tr>',
        '<tr class="question"><td><span',
        (this.previous ? '' : ' style="color:transparent"'),
        '>↑</span>&nbsp;<span',
        (this.next ? '' : ' style="color:transparent"'),
        '>↓</span>',
        '<td colspan="2"><textarea rows="',
        Math.max(this.question.split('\n').length + 1, 3), '">',
        html(this.question), '</textarea>',
        stats,
        '</tr>'
    ];
    var checked = this.get_checked();

    for (var i in this.sorted_choices)
        s.push(this.sorted_choices[i].html_table(checked[this.sorted_choices[i].key]));
    s.push('<tr><td><td colspan="2" style="text-align:left"><button');
    if (this.parent.freezed)
        s.push(' disabled');
    s.push('>+</button><td></tr></table>');
    return s.join('');
};

MCQ_Question.prototype.get_checked = function () {
    // Analyse only the first grading option
    var checked = {};
    if (this.options.grade && this.options.grade.length == 1)
        for (var j in this.options.grade[0][0])
            checked[this.options.grade[0][0][j]] = true;
    return checked;
};

MCQ_Question.prototype.multiple_choice = function () {
    var formula = this.option('grade');
    if (!formula || formula.length == 0)
        return false;
    return formula[0][0].length > 1;
};

MCQ_Question.prototype.grade_no_answer = function () {
    if (isNaN(this.option('no_answer')))
        return - Number(this.option('good_answer')) / (this.sorted_choices.length - 1);
    return Number(this.option('no_answer'));
};

MCQ_Question.prototype.grade = function () {
    var formula = this.option('grade');
    if(!formula)
        return 0;
    var ok, f0, f1, f2;
    var nr_checked = 0;
    var checked = {};
    for (var choice in this.choices) {
        if ((checked[choice] = this.parent.checked[this.key + '=' + choice]))
            nr_checked++;
    }
    if (nr_checked == 0)
        return this.grade_no_answer();

    for (var f in formula) {
        f0 = formula[f][0];
        ok = true;
        for (var require in f0)
            if (!checked[f0[require]]) { ok = false; break; }
        if (!ok)
            continue;
        f1 = formula[f][1];
        for (var reject in f1)
            if (checked[f1[reject]]) { ok = false; break; }
        if (ok) {
            f2 = formula[f][2];
            if (f2 !== undefined && f2 !== null)
                return f2;
            else
                return Number(this.option('good_answer'));
        }
    }
    if (formula.length && this.option('progressive') != 'bad') {
        var nr_checked_good = 0, nr_checked_bad = 0;
        f0 = formula[0][0];
        for (var require in f0)
            if (checked[f0[require]])
                nr_checked_good++;
        f1 = formula[0][1];
        for (var reject in f1)
            if (checked[f1[reject]])
                nr_checked_bad++;
        if (this.option('progressive') == '±' && nr_checked)
            return Number(this.option('good_answer'))
                * (nr_checked_good / f0.length - nr_checked_bad / f1.length);
        if (this.option('progressive') == 'AMC' && nr_checked) {
            var nr_unchecked_bad = f0.length - nr_checked_good;
            var nr_unchecked_good = f1.length - nr_checked_bad;
            return Number(this.option('good_answer'))
                * (nr_checked_good + nr_unchecked_good
                    - nr_checked_bad - nr_unchecked_bad) / this.sorted_choices.length;
        }
        if (nr_checked_good > 0 && nr_checked_bad == 0) {
            if (this.option('progressive') == 'good')
                return Number(this.option('good_answer'));
            if (this.option('progressive') == 'progressive')
                return nr_checked_good * Number(this.option('good_answer')) / f0.length;
            return this.grade_no_answer();
        }
    }
    if (isNaN(this.option('bad_answer')))
        return - Number(this.option('good_answer')) / (this.sorted_choices.length - 1);
    return Number(this.option('bad_answer'));
};

MCQ_Question.prototype.json = function () {
    var choices = {};
    for (choice in this.choices)
        if (this.choices[choice].choice !== '')
            choices[choice] = this.choices[choice].json();
    return [this.question, choices, this.options];
};

MCQ_Question.prototype.amc = function () {
    function multiline(txt) {
        return txt.trim().replace(/\n([^ ])/g, '\n $1');
    }
    function options(obj) {
        var opts = obj.options;
        var s = ['id=' + obj.key];
        for (var opt in opts) {
            if (opts[opt] === undefined)
                continue;
            if (opt == 'grade' || opt == 'priority' || opt == 'radio')
                continue;
            if (opt == 'no_answer')
                s.push('v=' + obj.parent.encode_amc(opts[opt]));
            else if (opt == 'bad_answer')
                s.push('m=' + obj.parent.encode_amc(opts[opt]));
            else if (opt == 'good_answer')
                s.push('b=' + obj.parent.encode_amc(opts[opt]));
            else if (opt == 'shuffle_choices' && !opts[opt])
                s.push('ordered');
            else
                s.push(opt + '=' + opts[opt]);
        }
        return s.join(',');
    }
    var checked = this.get_checked();
    var t = [this.options.radio === 0 ? '*' : '',
        '*[', options(this), '] ', multiline(this.question), '\n'];
    for (var choice in this.sorted_choices) {
        choice = this.sorted_choices[choice];
        if (choice.choice !== '')
            t.push((checked[choice.key] ? '+' : '-') + '[' + options(choice)
                + '] '
                + multiline(choice.choice)
                + '\n');
    }
    return t.join('');
};

MCQ_Question.prototype.add_choice = function () {
    var last_key = 0;
    for (choice in this.choices) {
        choice = Number(choice.substr(1));
        if (choice > last_key)
            last_key = choice;
    }
    var key = this.parent.get_new_id(this.choices);
    this.choices[key] = new MCQ_Choice([_("MSG_MCQ_choice"),
    { 'priority': this.sorted_choices[this.sorted_choices.length - 1].options.priority + 1 }],
        key);
};

MCQ_Question.prototype.option = MCQ_Choice.prototype.option;
MCQ_Question.prototype.next_priority = MCQ_Choice.prototype.next_priority;
MCQ_Question.prototype.previous_priority = MCQ_Choice.prototype.previous_priority;

/**************************************************************************/

function MCQ(args, initial_value, key) {
    this.mcq_options = [
        ['gui', ['beginner', 'amc', 'wooclap', 'expert', 'preview', 'print']],
        ['shuffle_questions', [0, 1]],
        ['same_questions', [0, 1]],
        ['show_answers', [0, 1]],
        ['math', ['no', 'mathjax']],
        ['scoring_scale', [0, 1]]
    ];
    this.question_options = [
        ['good_answer', [0, 0.5, 1, 1.5, 2, 2.5, 3, 4]],
        ['bad_answer', ['0', '-0.5', '-1', '-1/(#-1)']],
        ['no_answer', ['0', '-0.5', '-1', '-1/(#-1)']],
        ['progressive', ['bad', 'no', 'progressive', 'good', '±', 'AMC']],
        ['shuffle_choices', [0, 1]],
        ['html_question', [0, 1]],
        ['html_choice', [0, 1]],
        ['group', []],
        ['obfuscate', [0, 1, 2]]
    ];

    var questions = args[0];
    this.options = JSON.parse(JSON.stringify(args[1]));
    this.key = key;

    this.table_rand = new Rand(millisec().toString());
    if (key)
        this.rand = new Rand(this.key || ''); // Student

    this.update_checked(initial_value);
    MCQ.dict[this.key] = this;
    if (Object.keys(questions).length == 0) {
        questions = {
            'q1': [_("MSG_MCQ_question"), this.empty_choices(), { priority: 1, grade: [] }],
            'q2': [_("MSG_MCQ_question"), this.empty_choices(), { priority: 2, grade: [] }]
        }
    }
    var defaults = {
        'radio': 1, 'gui': 'beginner',
        'shuffle_questions': 1, 'shuffle_choices': 1,
        'same_questions': 0,
        'good_answer': 1, 'no_answer': 0, 'bad_answer': '-1/(#-1)',
        'progressive': 'bad', 'group': '', 'obfuscate': 1,
        'choice_CSS': '', 'question_CSS': '', 'scoring_scale': 1
    };
    if (this.options.same_questions === undefined)
        this.options.same_questions = this.options.shuffle_questions != 0 ? 0 : 1;
    for (var i in defaults)
        if (this.options[i] === undefined)
            this.options[i] = defaults[i];
    this.questions = {};
    for (var key in questions)
        this.questions[key] = new MCQ_Question(questions[key], this, key);
    this.sorted_questions = sorted_dictionary(this.questions);
    var sq = this.sorted_questions;
    for (var i = 0; i < sq.length; i++) {
        sq[i].previous = i ? sq[i - 1] : undefined;
        sq[i].next = i != sq.length - 1 ? sq[i + 1] : undefined;
        sq[i].options.priority = Number(i);
    }
}
MCQ.dict = {};

MCQ.prototype.multiple_choice = function () {
    for (var key in this.sorted_questions)
        if (this.sorted_questions[key].multiple_choice())
            return true;
};

MCQ.prototype.button_label = function () {
    return this.options.show_answers ? _("MSG_MCQ_expected") : _("MSG_MCQ_answer");
};

MCQ.prototype.update_checked = function (checked) {
    this.checked = {};
    if (checked && checked !== '') {
        checked = checked.split(/&/g);
        for (var i in checked)
            this.checked[checked[i]] = true;
    }
};

MCQ.prototype.option = function (name) {
    return this.options[name];
};

MCQ.prototype.student_select_group = function (questions) {
    var group, question;
    var counters = {};
    var selected_questions = [];
    for (var key in questions) {
        question = questions[key];
        if (!question._take)
            continue;
        group = question.options.group || '';
        if (counters[group] === undefined)
            counters[group] = 1;
        else
            counters[group]++;
        if (this.options.nr_question_in_group === undefined
            || this.options.nr_question_in_group[group] === undefined
            || counters[group] <= this.options.nr_question_in_group[group])
            selected_questions.push(question);
        else
            question._take = false;
    }
    return selected_questions;
};

MCQ.prototype.student_questions = function (rand) {
    var questions;
    for (var q in this.questions)
        this.questions[q]._take = true;
    if (this.options.same_questions || !this.options.shuffle_questions) {
        questions = sorted_dictionary(
            this.questions,
            this.options.same_questions
                ? new Rand(this.year + '/' + this.semester + '/' + this.ue + '/' + this.column.the_id)
                : rand
        );
        this.student_select_group(questions);
    }
    questions = sorted_dictionary(this.questions,
        this.options.shuffle_questions && rand);
    return this.student_select_group(questions);
};

MCQ.prototype.html_student = function (hide_answers) {
    var use_bad = mcq_use_bad_answer_value(this);
    var t = ['<div id="' + this.key + '" style="font-weight: normal"'
        + ' onclick="mcq_from_element(this).click_student(event)">',
    (this.column.comment ? '<p>' + html(this.column.comment) + '</p>' : '')];
    if (this.options.scoring_scale)
        t.push(
            _("MSG_MCQ_scoring"),
            '<ul>',
            '<li>' + _('MSG_mcq_good_answer') + ' : ' + _('MSG_mcq_good_answer_' + this.options.good_answer),
            '<li>' + _('MSG_mcq_no_answer') + ' : ' + _('MSG_mcq_no_answer_' + this.options.no_answer),
            use_bad
                ? '<li>' + _('MSG_mcq_bad_answer') + ' : ' + _('MSG_mcq_bad_answer_' + this.options.bad_answer)
                : '',
            '<li>' + _('MSG_mcq_progressive') + ' : ' + _('MSG_mcq_progressive_' + this.options.progressive + '_help'),
            '</ul><br>');
    var questions = this.student_questions(this.get_student_rand());
    for (var key in questions)
        t.push(questions[key].html_student(hide_answers));
    t.push('</div>');
    return t.join('\n');
};

MCQ.prototype.update_math = function () {
    try { MathJax.Hub.Queue(["Typeset", MathJax.Hub]); }
    catch (e) { try { this.window.MathJax.Hub.Startup.onload(); } catch (e2) { }; }
};

MCQ.prototype.update_html_student = function () {
    var i;

    if (this.options.math == 'mathjax') {
        var preview = document.getElementById("mcqpreview");
        var doc = preview ? preview.contentDocument : document;
        var script = doc.getElementById("mcqmath");
        if (script)
            this.update_math();
        else {
            if (preview)
                this.window = preview.contentWindow;
            else
                this.window = window;
            script = doc.createElement('SCRIPT');
            script.id = "mcqmath";
            script.async = '';
            script.src = mathjaxurl;
            script.onload = this.update_math.bind(this);
            doc.getElementsByTagName('HEAD')[0].appendChild(script);
        }
    }
    var questions = this.student_questions(this.get_student_rand());
    for (var key in questions) {
        var e = document.getElementById(questions[key].full_key);
        if (!e)
            return; // Popup not opened
        var checkboxes = e.getElementsByTagName('INPUT');
        for (i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                e.className = "mcqquestion";
                break;
            }
        }
        var tag = document.getElementById('TAG/' + e.id);
        var tagclass;
        if (i == checkboxes.length) {
            e.className = "mcqquestion unanswered";
            tagclass = 'mcqtag unanswered';
        }
        else
            tagclass = 'mcqtag';
        if (tag) // Safari bug
            tag.className = tagclass;
    }
};

MCQ.prototype.options_html = function (mcq_options, globals, locals) {
    var t = [], disabled;
    var global_option = globals === locals;
    for (var i in mcq_options) {
        var values = mcq_options[i][1];
        var name = mcq_options[i][0];
        var not_defined = (locals[name] === undefined || locals[name] === '') && !global_option;
        t.push('<div class="vertical');
        if (not_defined)
            t.push(' use_default');
        t.push('" x="' + locals[name]);
        t.push('">');
        t.push(_('MSG_mcq_' + name));
        t.push('<br>');
        if (values.length == 0) {
            t.push('<input class="group" get_completion_list="mcq_group_completion" name="');
            t.push(name);
            t.push('" value="');
            t.push(encode_value((locals[name] === '' || locals[name] === undefined
                ? globals[name] : locals[name]).toString()));
            t.push('" onfocus="element_focused=this" onblur="mcq.mcq_option_change(this)" onchange="mcq.mcq_option_change(this)"></div>');
            continue;
        }
        if (this.freezed && (name == 'shuffle_questions'
            || name == 'same_questions'
        ))
            disabled = ' disabled';
        else
            disabled = '';
        t.push('<select name="'
            + name + '"' + disabled
            + ' onchange="mcq.mcq_option_change(this)">');
        var first = true;
        for (var j in values) {
            var value = values[j];
            t.push('<option');
            if (locals[name] == value
                || global_option && first && globals[name] === undefined
            )
                t.push(' selected');
            t.push(' value="' + value + '">');
            t.push(_('MSG_mcq_' + name + '_' + value));
            t.push('</option>');
            first = false;
        }
        if (!global_option) {
            t.push('<optgroup label="⤒"></optgroup><option value=" undefined "');
            if (not_defined)
                t.push(' selected')
            t.push('>' + _('MSG_mcq_' + name + '_' + (globals[name] || values[0]))
                + '</option>');
        }
        t.push('</select>');
        t.push('</div>');
    }
    return t.join('');
}

MCQ.prototype.html_table = function () {
    this.freezed = this.column.is_visible();
    for (var i in lines)
        if (lines[i][this.column.data_col].comment !== '')
            this.freezed = true;

    var t = [
        '<style>',
        '.mcq { width: 100% }',
        '.mcqhead { width: 100% }',
        '.mcq_choice:hover * { text-decoration: underline }',
        '.mcq_choice:hover *:focus { text-decoration: none }',
        'DIV.import_export.mcq_editor { left:10%; right:2em; top:5%; bottom:5%; border: 2px solid #000; z-index:30; padding: 0px }',
        '#mcq_content > TABLE { width: 100% ; margin-bottom: 1em ; border-spacing: 0px }',
        '#mcq_content > TABLE[id] { border-spacing: 0.2em }',
        '#mcq_content TR.question_menu > TD { vertical-align: bottom }',
        '.mcq_choice TD:first-child, .mcq_choice TD:nth-child(2)',
        '   { width: 1% ; text-align: center ; white-space: pre; padding-right: 0.5em }',
        '#mcq_content TR.question TD { background: #EEE ; vertical-align: top }',
        '#mcq_content TD:nth-child(3) { vertical-align: top ; width: 85%; white-space: pre }',
        '#mcq_content TD:nth-child(4) { width: 14%; }',
        '#mcq_content TABLE.stats TD { text-align: right; padding: 0.2em; width: 3em }',
        '#mcq_content SPAN { color: #00F; cursor: pointer ; font-weight: normal }',
        '#mcq_content TABLE SELECT { width: initial }',
        '#mcq_content TEXTAREA { background: inherit ; border: 0px; box-sizing: border-box; width:100%; height: 99% }',
        '#mcq_content INPUT { vertical-align: middle ; background: initial;',
        '                     border: 0px;}',
        '#mcq_content INPUT:focus, #mcq_content TEXTAREA:focus { background: #FFF }',
        '#mcq_content INPUT, #mcq_content TEXTAREA {font-family: monospace; font-size: 120% }',
        '#mcq_content { position:absolute; overflow: auto;',
        '       top:10em ; left:0.3em ; right:0px ; bottom:0px ; }',
        '#mcq_content {padding: 0.5em}',
        '.vertical, #mcq_groups, #mcq_groups SELECT { display: inline-block ; font-size: 80%; text-align: center; vertical-align: bottom }',
        '#mcqpreview { box-sizing: border-box; width: 100%; height: 99% ;',
        'border: 0px; }',
        '.mcqhead { background: #FFF; padding: 0.5em; position: sticky; top: 0px }',
        'DIV.use_default, DIV.use_default SELECT, DIV.use_default INPUT  { color: #AAA }',
        'DIV.use_default:hover, DIV.use_default:hover SELECT, DIV.use_default:hover INPUT { color: #000 }',
        '#mcq_content DIV.use_default INPUT { border: 1px solid #AAA; }',
        '#mcq_content DIV.use_default:hover INPUT { border: 1px solid #000; }',
        '#mcq_groups { overflow: auto; white-space: pre; width: 100%; text-align: left; margin-top: 0.2em }',
        '#mcq_content INPUT.group, INPUT.group { font-size: 150%; border: 1px solid black;',
        '    padding: 1.5px; width: 4em; background: #FFF;  }',
        "#mcq_histo { white-space: initial }",
        "#mcq_histo DIV { display: inline-block; width: 2em; position: relative; }",
        "#mcq_histo DIV SPAN { position: absolute; bottom: 0px; color: #888; font-size: 60% }",
        ".mcq_editor *[onclick] {user-select: initial;}",
        '</style>',
        '<div class="mcq">',
        '<div class="mcqhead">',
        '<button onclick="mcq.save(this)">', _("LABEL_mcq_save"), '</button> ',
        '<button onclick="mcq.store_grades()">', _("LABEL_mcq_grade"), '</button> ',
    ];
    if (!column_change_allowed(this.column))
        t.push('<span style="color:red">'
            + _("SELECT_table_modifiable_false")
            + '. '
            + (this.column.author != my_identity
                ? _("ALERT_columndelete_not_master_before")
                + this.column.author
                : '')
            + '</span>');
    if (!this.column.is_visible())
        t.push(_("SELECT_column_visibility_no"));
    else if (this.column.modifiable != 2)
        t.push(_("SELECT_column_modifiable_by_nobody"));
    else if (the_current_cell.cell.value != yes
        && myindex(this.column.cell_writable, yes) != -1)
        t.push(_("ALERT_change_to_MCQ").replace(/.*\n *\**/g, ''));
    t.push(
        '<br>',
        this.options_html(this.mcq_options, this.options, this.options),
        '\n<div id="mcq_groups">init</div>\n',
        this.options_html(this.question_options, this.options, this.options),
        '<div id="mcq_histo"></div>',
        '</div>');
    t.push('<div id="mcq_content">');
    t.push(this.html_content());
    t.push('</div></div>');
    return t.join('');
};
/*
MCQ.prototype.incomplete_mcq = function()
{
  for( var group in this.groups)
    if ( this.options.nr_question_in_group[group] > 0
         && this.options.nr_question_in_group[group] < this.groups[group] )
      return true ;
} ;
*/
MCQ.prototype.contains_html = function () {
    for (var q in this.questions) {
        if (this.questions[q].option('html_question'))
            return true;
        for (var c in this.questions[q].choices)
            if (this.questions[q].choices[c].option('html_choice'))
                return true;
    }
};

MCQ.prototype.disable_html = function () {
    for (var q in this.questions) {
        this.questions[q].options.html_question = 0;
        for (var c in this.questions[q].choices)
            this.questions[q].choices[c].options.html_choice = 0;
    }
};

MCQ.prototype.export = function () {
    var csv = [];
    var csv_line = [_('COL_TITLE_0_0'), _('COL_TITLE_0_1'), _('COL_TITLE_0_2')];
    for (var i in this.questions)
        csv_line.push(this.questions[i].key,
            encode_lf_tab(this.questions[i].question));
    csv.push(csv_line.join('\t'));
    for (var i in filtered_lines) {
        var line = filtered_lines[i];
        if (line[0].value === '')
            continue;
        csv_line = [html(line[0].value), html(line[1].value), html(line[2].value)];
        this.update_checked(line[this.data_col].comment);
        for (var j in this.questions)
            this.questions[j].is_asked = false;
        var asked_questions = this.student_questions(this.get_student_rand(line));
        for (var j in asked_questions)
            asked_questions[j].is_asked = true;
        for (var j in this.questions) {
            var q = this.questions[j];
            var s = [];
            for (var choice in q.choices) {
                if (this.checked[q.key + '=' + choice])
                    s.push(choice);
            }
            csv_line.push(s.join('&'), q.is_asked ? q.grade() : '');
        }
        csv.push(csv_line.join('\t'));
    }
    return csv.join('\n');
};
MCQ.prototype.update_stat = function () {
    for (var i in this.questions) {
        this.questions[i].grade_sum = {};
        for (var choice in this.questions[i].choices)
            this.questions[i].choices[choice].nr_checked = 0;
    }
    this.options.multiple_choice = this.multiple_choice();
    this.options.stats = 0;
    var histo = new Stats(0, this.max_grade());
    for (var line in filtered_lines) {
        if (filtered_lines[line][0].value == '')
            continue;
        this.update_checked(filtered_lines[line][this.data_col].comment);
        for (var question_choice in this.checked) {
            question_choice = question_choice.split('=');
            var q = this.questions[question_choice[0]];
            if (q) {
                var c = q.choices[question_choice[1]];
                if (c) {
                    c.nr_checked++;
                    continue;
                }
            }
            console.log(filtered_lines[line][0].value + ' ' + question_choice);
        }
        var grade_sum = 0;
        var questions = this.student_questions(this.get_student_rand(filtered_lines[line]));
        for (var q in questions) {
            q = questions[q];
            var grade = q.grade();
            if (q.grade_sum[grade] === undefined)
                q.grade_sum[grade] = 0;
            q.grade_sum[grade] += 1;
            grade_sum += grade;
            if (grade != 0)
                this.options.stats = 1;
        }
        histo.add(grade_sum);
    }
    this.update_stat_group();
    setTimeout(function () {
        var e = document.getElementById('mcq_histo');
        var max = histo.histo_max();
        if (e && max > 1) {
            var t = [];
            var colors = ['FDD', 'FEE', 'FFF', 'EFE', 'DFD', 'CFC'];
            var colorsborder = ['F00', '0F0'];
            for (var i = 0; i < 20; i++)
                t.push('<div style="height:' + 1.7 * histo.histogram[i] / max + 'em;background-color:#'
                    + colors[Math.floor(i / 4)] + ';border-top:1px solid #'
                    + colorsborder[Math.floor(i / 10)] + '"><span>'
                    + i + '</span></div>');
            e.innerHTML = t.join('')
                + ' ' + _("Average") + '=' + (20 * histo.average() / histo.v_max).toFixed(2)
                + ' ' + _("Mediane") + '=' + (20 * histo.mediane() / histo.v_max).toFixed(2);
        }
    }, 1000);
};
MCQ.prototype.update_stat_group = function () {
    var groups = {};
    var grades = {};
    var problem = {};
    for (var i in this.questions) {
        var q = this.questions[i];
        var grp = q.options.group;
        if (grp === undefined)
            grp = this.options.group || '';
        if (!groups[grp]) {
            groups[grp] = 1;
            grades[grp] = q.option('good_answer');
        }
        else {
            groups[grp]++;
            if (grades[grp] != q.option('good_answer'))
                problem[grp] = true;
        }
    }
    setTimeout(function () {
        if (!document.getElementById('mcq_groups'))
            return;
        var s = [];
        if (this.options.nr_question_in_group === undefined)
            this.options.nr_question_in_group = {};
        for (var group in groups) {
            var nr = this.options.nr_question_in_group[group];
            var ss = [' ', html(group),
                '<select onchange="mcq.options.nr_question_in_group[',
                js2(group),
                ']=this.value===\'\'?undefined:Number(this.value);mcq.update_stat_group()"',
                problem[group] && nr && nr != groups[group] ? ' style="background:red": ' : '',
                this.freezed ? ' disabled' : '',
                '>'];
            var one_selected = false;
            var selected;
            for (var i = 0; i <= groups[group]; i++) {
                if (nr === i || i == groups[group] && !one_selected) {
                    selected = " selected";
                    one_selected = true;
                }
                else
                    selected = '';

                ss.push('<option value="' + (i === groups[group] ? '' : i) + '"' + selected + '>'
                    + i + '/' + groups[group] + '</option>');
            }
            ss.push('</select>');
            s.push(ss.join(''));
        }
        s.sort();
        document.getElementById('mcq_groups').innerHTML = _('MSG_mcq_groups_label') + ': ' + s.join('');
    }.bind(this), 2000);
    this.groups = groups;
};

MCQ_Choice.prototype.update_class = function (element) {
    element.style.color =
        (this.option('html_choice') && !valid_html(element.value))
            ? '#F00' : '#000';
};
MCQ_Question.prototype.update_class = function (element) {
    element.style.color =
        (this.option('html_question') && !valid_html(element.value))
            ? '#F00' : '#000';
};

MCQ.prototype.get_id = function (element) {
    while (!element.id)
        element = element.parentNode;
    return element.id;
};

MCQ.prototype.update_classes = function () {
    var content = document.getElementById('mcq_content');
    var inputs = content.getElementsByTagName('TEXTAREA');
    for (var i = 0; i < inputs.length; i++)
        this.questions[this.get_id(inputs[i])].update_class(inputs[i]);

    var inputs = content.getElementsByTagName('INPUT');
    for (var i = 0; i < inputs.length; i++) {
        var key = this.get_id(inputs[i]).split(/\001/);
        if (key.length == 2)
            this.questions[key[1]].choices[key[2]].update_class(inputs[i]);
    }
};

MCQ.prototype.autofocus = function () {
    var content = document.getElementById('mcq_content');
    if (!content)
        return;
    this.update_classes();
    var inputs = content.getElementsByTagName('TEXTAREA');
    for (var i = 0; i < inputs.length; i++)
        if (inputs[i].value == _('MSG_MCQ_question')) {
            inputs[i].focus();
            inputs[i].select();
            return;
        }
    var inputs = content.getElementsByTagName('INPUT');
    for (var i = 0; i < inputs.length; i++)
        if (inputs[i].value == _('MSG_MCQ_choice')) {
            inputs[i].focus();
            inputs[i].select();
            return;
        }
};

MCQ.prototype.iframe_content = function (to_print) {
    this.modifiable = this.column.modifiable != 0;
    return '<html><head>'
        + '<link rel="stylesheet" href="https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/style.css" charset="UTF-8"/>'
        + '</head><body>'
        + '<div class="mcq">'
        + mcq_suivi_style
        + (to_print
            ? '<style>'
            + '.mcq_content { position: initial ; }'
            + '.mcq_buttons { display: none ; }'
            + '</style>'
            + '<script src="' + mathjaxurl + '"></script>'
            : '')
        + '<script>'
        + 'function uncheck_if_checked() { }'
        + 'function mcq_from_element() { return {click_student: function() {}} ; }'
        + 'var MCQ = { "undefined": { "terminate": function(){} } } ;'
        + '</script>'
        + (to_print ? '' : this.get_record_button_student())
        + this.get_content_student(!this.option('show_answers'), to_print)
        + '</div>';
};

MCQ.prototype.fill_iframe = function () {
    var mcqpreview = document.getElementById("mcqpreview").contentWindow.document;
    mcqpreview.write(this.iframe_content());
};

MCQ.prototype.encode_amc = function (v) {
    return v.toString().replace('1/(#-1)', '1/(N-1)');
};

MCQ.prototype.decode_amc = function (v) {
    v = v.toString().replace('1/(N-1)', '1/(#-1)');
    if (!isNaN(v) && v !== '')
        v = Number(v);
    return v;
};

MCQ.prototype.html_content = function () {
    this.update_stat();
    this.update_checked(this.cell.comment);
    var t = [];
    if (this.options.gui == 'expert') {
        t.push('<textarea>');
        t.push(JSON.stringify(this.json(), null, 2));
        t.push('</textarea>');
    }
    else if (this.options.gui == 'amc') {
        t.push('<textarea>');
        t.push('# AMC-TXT file\n');
        t.push('Lang: ' + languages[0].toUpperCase() + '\n');
        t.push('ShuffleQuestions: ' + this.options.shuffle_questions + '\n');
        t.push('DefaultScoringS:v=' + this.encode_amc(this.options.no_answer)
            + ',b=' + this.encode_amc(this.options.good_answer)
            + ',m=' + this.encode_amc(this.options.bad_answer)
            + ',e=0\n');
        t.push('\n');
        t.push(this.amc());
        t.push('</textarea>');
    }
    else if (this.options.gui == 'wooclap') {
        t.push('<textarea>');
        t.push(this.wooclap());
        t.push('</textarea>');
    }
    else if (this.options.gui == 'preview') {
        t.push('<iframe id="mcqpreview" src="javascript:window.parent.mcq.fill_iframe()">');
        t.push('</iframe>');
    }
    else if (this.options.gui == 'print') {
        var w = window_open('MCQ');
        w.document.open('text/html');
        w.document.write(this.iframe_content(true));
        w.document.close();
        t.push('Ok !');
    }
    else {
        for (var key in this.sorted_questions)
            t.push(this.sorted_questions[key].html_table());
        t.push('<table><tr><td><button ');
        if (mcq.column.is_visible())
            t.push('disabled');
        else
            t.push('onclick="mcq.add_question()"');
        t.push('>+</button><td><td></tr></table>');
        setTimeout("mcq.autofocus()", 100);
    }
    return t.join('');
};

MCQ.prototype.update_mcq_content = function () {
    document.getElementById('mcq_content').innerHTML = this.html_content();
}

MCQ.prototype.save = function (element) {
    if (this.options.gui != 'beginner') {
        alert(_("ALERT_MCQ_verify"));
        return;
    }
    var data = this.json();
    column_attr_set(this.column, 'mcq', data, element);
    MCQ.initial_value = JSON.stringify(data);
}

MCQ.prototype.get_new_id = function (yet_used) {
    var key;
    do
        key = 'c' + (100 + this.table_rand.int() % 900);
    while (yet_used[key] !== undefined);
    return key;
}

MCQ.prototype.get_new_ids = function (nr) {
    var yet_used = {}, new_ids = [];
    for (var i = 0; i < nr; i++) {
        var id = this.get_new_id(yet_used);
        new_ids.push(id);
        yet_used[id] = true;
    }
    return new_ids;
}

MCQ.prototype.parse_AMC = function (content) {
    // Parse AMC view
    var questions = {};
    content = content.split(/\n/);
    content.push('*');
    var question, priority = 0, choices, choice_priority, good, bad, choice_id;
    function amc_parse(THIS, txt) {
        var options = {};
        if (txt.substr(0, 1) == '*') {
            txt = txt.substr(1);
            options['radio'] = 0;
        }
        if (txt.substr(0, 1) != '[')
            return [options, txt];
        txt = txt.trim();
        var opts = txt.substr(1).replace(/].*/, '').split(/,/);
        for (var i in opts) {
            i = opts[i].split('=', 2);
            if (i.length != 2)
                continue;
            if (i[0] == 'v')
                options['no_answer'] = THIS.decode_amc(i[1]);
            else if (i[0] == 'm')
                options['bad_answer'] = THIS.decode_amc(i[1]);
            else if (i[0] == 'b')
                options['good_answer'] = THIS.decode_amc(i[1]);
            else if (i[0] == 'ordered')
                options['shuffle_choices'] = 0;
            else
                options[i[0]] = THIS.decode_amc(i[1]);
        }
        return [options, txt.replace(/^[^\]]*]/, '').trim()];
    }

    for (var i in content) {
        var first_char = content[i].substr(0, 1);
        if (first_char == '*') {
            priority++;
            if (question) { // Save the last question
                var key = question[0].id || 'q' + priority;
                delete question[0].id;
                while (questions[key] !== undefined)
                    key = 'q' + ++priority;
                if (choice_id !== undefined)
                    choices[choice_id][0] = choices[choice_id][0].replace(/\n*$/, '');
                if (question[0].radio === undefined)
                    question[0].radio = good.length == 1 ? 1 : 0;
                else
                    question[0].radio = (question[0].radio && good.length == 1) ? 1 : 0;
                question[0].grade = [[good, bad, undefined]];
                question[0].priority = priority;
                questions[key] = [question[1], choices, question[0]];
            }
            question = amc_parse(this, content[i].substr(1));
            choices = {};
            good = [];
            bad = [];
            choice_priority = 0;
            choice_id = undefined;
        }
        else if (first_char == '+' || first_char == '-') {
            choice = amc_parse(this, content[i].substr(1));
            choice_id = choice[0].id;
            if (choice_id == undefined || choices[choice_id] !== undefined)
                choice_id = this.get_new_id(choices);
            choices[choice_id] = [choice[1], { priority: choice_priority++ }];
            (first_char == '+' ? good : bad).push(choice_id);
        }
        else if (first_char == '#') {
            continue;
        }
        else if (question) {
            if (Object.keys(choices).length == 0)
                question[1] += '\n' + content[i];
            else
                choices[choice_id][0] += '\n' + content[i];
        }
    }
    return questions;
}


MCQ.prototype.mcq_option_change = function (element) {
    var value = isNaN(element.value) || element.value === ''
        ? element.value : Number(element.value);
    var question = this.questions[this.get_id(element)];
    if (question) {
        if (value === ' undefined ' || value === '') {
            value = undefined; // Use global option
            element.parentNode.classList.add('use_default');
        }
        else
            element.parentNode.classList.remove('use_default');
        question.options[element.name] = value;
        if (element.name == "good_answer" || element.name == "group")
            this.update_stat_group();
        return;
    }
    this.options[element.name] = value;
    var content = document.getElementById('mcq_content').firstChild;
    if (element.name == 'gui' && content.tagName == 'TEXTAREA') {
        content = content.value;
        if (content.trim().substr(0, 1) == '[') {
            // Parse expert view
            try {
                content = JSON.parse(content);
                content[1].gui = element.value;
                this.replace_global_mcq(content);
                return;
            }
            catch (e) {
                alert(e);
                element.value = 'expert';
                return;
            }
        }
        else if (content.trim().substr(0, 19) == 'Type\tTitle\tCorrect\t'
            || content.substr(0, 8) == '\tWOOCLAP') {
            var questions = {};
            content = content.split(/\n+/);
            for (var i = 1; i < content.length; i++)
                content[i] = content[i].split(/\t/);
            for (var i = 1; i < content.length; i++) {
                if (content[i][0] != 'MCQ')
                    continue;
                this.parse_wooclap(questions, content[i], content[i + 1]);
            }
            this.replace_global_mcq([questions, this.options]);
            this.options.gui = element.value;
            return;
        }
        else {
            try {
                var questions = this.parse_AMC(content);
            }
            catch (err) {
                alert(err);
                element.value = 'AMC';
            }
            this.options.gui = element.value;
            this.replace_global_mcq([questions, this.options]);
            return;
        }
    }
    this.update_mcq_content();
}

var valid_html_element = undefined;
function valid_html(txt) {
    if (!valid_html_element)
        valid_html_element = document.createElement('DIV');
    txt = txt.replace(/ /g, ' ');
    valid_html_element.innerHTML = txt;
    return valid_html_element.innerHTML == txt;
}

function mcq_group_completion(input) {
    var groups = [];
    for (var group in mcq.groups)
        if (group !== ''
            && group.substr(0, input.value.length).toLocaleLowerCase()
            == input.value.toLocaleLowerCase())
            groups.push([group, '', '', '', group]);
    groups.push([input.value === '' ? '' : ' ' + input.value, '', '', '', input.value]);
    groups.last = '';
    return groups;
}

MCQ.prototype.update_question = function (element, event, do_it) {
    if (!do_it && event.type == 'drop') {
        var THIS = this;
        // Want to get the text value after the drop
        setTimeout(function () { THIS.update_question(element, event, true); }, 0);
        return;
    }
    event = event || window.event;
    var target = event.target;
    if (target.tagName == 'SELECT') {
        if (event.type == 'change') {
            this.update_stat();
            this.update_mcq_content();
        }
        return;
    }

    if ((target.tagName == 'INPUT' && target.type == 'text'
        || target.tagName == 'TEXTAREA')
        && target !== this.focus_on
        && event && event.type == 'click' && event.button == 0) {
        if (target.value == _('MSG_MCQ_question')
            || target.value == _('MSG_MCQ_choice'))
            event.target.select();
        this.focus_on = target;
        return;
    }

    var content = target.textContent;
    if ((target.tagName == 'BUTTON' || target.tagName == 'SPAN')
        && event.type == 'click'
        && (content == '↓' || content == '↑' || content == '+')) {
        while (target.id === undefined || target.id === '')
            target = target.parentNode;
        var question = this.questions[target.id];
        if (question) {
            if (content == '↓')
                question.next_priority();
            else if (content == '↑')
                question.previous_priority();
            else if (content == '+')
                question.add_choice();
        }
        else {
            var keys = target.id.split('\001');
            question = this.questions[keys[1]];
            if (question) {
                var choice = question.choices[keys[2]];
                if (choice) {
                    if (content == '↓')
                        choice.next_priority();
                    else
                        choice.previous_priority();
                }
            }
        }
        this.replace_global_mcq(this.json());
        return;
    }
    this.update_question_real(element);
};

MCQ.prototype.update_question_real = function (element) {
    var q = this.questions[element.id];
    var ok = [];
    var bad = [];
    for (var r = 1; r < element.rows.length; r++) {
        var row = element.rows[r];
        if (r == 1) {
            q.question = row.cells[1].firstChild.value;
            q.update_class(row.cells[1].firstChild);
            continue;
        }
        var key = row.id.split(/\001/)[2];
        if (key === undefined)
            break;
        var choice = q.choices[key];
        choice.choice = row.cells[2].firstChild.value;
        choice.update_class(row.cells[2].firstChild);
        if (row.cells[1].firstChild.checked)
            ok.push(key);
        else
            bad.push(key);
    }
    if (ok.length == 1)
        q.options.radio = 1;
    else
        q.options.radio = 0;
    q.options.grade = [[ok, bad, undefined]];
};


MCQ.prototype.get_answers = function (element) {
    var checked = [];
    var buttons = element.getElementsByTagName('INPUT');
    for (var key = 0; key < buttons.length; key++) {
        var b = buttons[key];
        if (!b.checked)
            continue;
        checked.push([b.name.split(/\001/)[1] + '=' + b.value]);
    }
    checked.sort();
    return checked.join('&');
}

MCQ.prototype.grade = function (checked, rand) {
    var g = 0;
    this.update_checked(checked);
    var questions = this.student_questions(rand);
    for (var key in questions) {
        var grade = questions[key].grade();
        g += grade;
    }
    return g;
};

MCQ.prototype.json = function () {
    var questions = {};
    for (question in this.questions)
        if (this.questions[question].question !== '')
            questions[question] = this.questions[question].json();
    return [questions, this.options];
};

MCQ.prototype.amc = function () {
    var t = [];
    for (question in this.sorted_questions)
        if (this.sorted_questions[question].question !== '')
            t.push(this.sorted_questions[question].amc() + '\n');
    return t.join('');
};

MCQ.prototype.wooclap = function () {
    var t = ['Type', 'Title', 'Correct', 'Choice', 'Choice', 'Choice', 'Choice', 'Choice', 'Choice', 'Choice'];
    t = ['\tWOOCLAP\t', _('MSG_mcq_wooclap'), '\n', t.join('\t'), '\n'];
    for (question in this.sorted_questions)
        if (this.sorted_questions[question].question !== '')
            t.push(this.sorted_questions[question].wooclap() + '\n');
    return t.join('');
};

MCQ.prototype.empty_choices = function () {
    var nr = 2;
    var new_ids = this.get_new_ids(nr);
    var choices = {};
    for (var i = 0; i < nr; i++)
        choices[new_ids[i]] = [_("MSG_MCQ_choice"), { priority: i + 1 }];
    return choices;
}

MCQ.prototype.add_question = function () {
    var last_key = 0;
    for (question in this.questions) {
        question = Number(question.substr(1));
        if (question > last_key)
            last_key = question;
    }
    var key = 'q' + (last_key + 1);

    this.questions[key] =
        new MCQ_Question([_('MSG_MCQ_question'), this.empty_choices(),
        { 'priority': this.sorted_questions[this.sorted_questions.length - 1].options.priority + 1 }],
            this, key);
    this.replace_global_mcq(mcq.json());
    document.getElementById('popup_id').scrollTo(0, 10000000);
};

MCQ.prototype.max_grade = function () {
    var sum_max = 0;
    var questions = this.student_questions(new Rand('anyone'));
    for (var question in questions) {
        grades = questions[question].option('grade');
        var max = questions[question].option('good_answer');
        for (var grade in grades)
            max = Math.max(grades[grade][2] || 0, max);
        sum_max += max;
    }
    return sum_max;
};

MCQ.prototype.get_student_rand = function (line, more) {
    line = line || the_current_cell.line;
    more = more || '';
    var key = this.key || (this.year + '/' + this.semester + '/' + this.ue + '/'
        + this.column.the_id
        + '/' + the_login(line[0].value));
    return new Rand(key + more);
};

MCQ.prototype.store_grades = function () {
    var todo = [];
    column_attr_set(this.column, 'minmax', '[0;' + this.max_grade() + ']');
    for (var line in filtered_lines) {
        line = filtered_lines[line];
        if (line[0].value == '')
            continue;
        var rand = this.get_student_rand(line);
        try {
            var grade = this.grade(line[this.data_col].comment, rand);
            if (grade < 0)
                grade = 0;
            if (line[this.data_col].value === '' || line[this.data_col].value != grade)
                todo.push([line, grade.toString()]);
        }
        catch (e) {
        }
    }
    var changes = [];
    for (var i in todo)
        if (todo[i][0][this.data_col].value !== ''
            && todo[i][0][this.data_col].value != no)
            changes.push(todo[i][0][2].value + ' ' + todo[i][0][1].value + ' : '
                + todo[i][0][this.data_col].value + ' → ' + todo[i][1]);

    var message = '';
    if (changes.length)
        message += _("MSG_fill_room_simulation") + '\n' + changes.join('\n') + '\n\n';
    message += todo.length + ' ' + _("grades") + ' : ' + _("B_unsaved_save");
    if (!confirm(message))
        return;

    alert_append_start();
    for (var i in todo) {
        cell_set_value_real(todo[i][0].line_id, this.data_col, todo[i][1]);
        update_line(todo[i][0].line_id, this.data_col);
    }
    the_current_cell.do_update_column_headers = true;
    table_fill();
    table_header_fill();
    alert_append_stop();
};

MCQ.prototype.replace_global_mcq = function (content) {
    mcq = new MCQ(content);
    mcq.data_col = this.data_col;
    mcq.cell = this.cell;
    mcq.column = this.column;
    mcq.ue = this.ue;
    mcq.year = this.year;
    mcq.semester = this.semester;
    mcq.freezed = this.freezed;
    mcq.update_mcq_content();
};

MCQ.prototype.close_student = function () {
    if (this.modified) {
        if (confirm(_("LABEL_MCQ_save"))) {
            this.record_student(popup_get_element().getElementsByTagName('BUTTON')[0]);
            return;
        }
    }
    popup_close = MCQ.popup_close;
    popup_close();
};

MCQ.prototype.record_ok = function () {
    this.modified = false;
    this.record_button.setAttribute('disabled', true);
    var b = this.record_button.parentNode.getElementsByTagName('BUTTON');
    b[b.length - 1].removeAttribute('disabled');
};

MCQ.prototype.record_student = function (button) {
    if (this.modified) {
        var element = document.getElementById(this.key);
        this.cell.comment = this.get_answers(element);
        this.feedback = button.parentNode.firstChild;
        this.feedback.innerHTML = '<div><div>' + _("LABEL_MCQ_saved") + ':</div></div>';
        DisplayGrades.column = this.column;
        this.record_button = button;
        _cell(this.feedback.firstChild.firstChild,
            this.year + '/' + this.semester + '/' + this.url,
            this.cell.comment,
            this.record_ok.bind(this)
        );
    }
};

MCQ.prototype.terminate = function (button) {
    var feedback = button.parentNode.firstChild;
    feedback.innerHTML = '<div><div>' + _("LABEL_MCQ_terminated") + ':</div></div>';
    // Erase the YES
    feedback.firstChild.firstChild.value = no;
    DisplayGrades.column = this.column;
    _cell(feedback.firstChild.firstChild, this.year + '/' + this.semester + '/'
        + this.url.replace('/comment/', '/cell/'));
    var buttons = button.parentNode.getElementsByTagName('BUTTON');
    for (var i = 0; i < buttons.length; i++)
        buttons[i].setAttribute('disabled', true);
    var inputs = document.getElementById(this.key).getElementsByTagName('INPUT');
    for (var i = 0; i < inputs.length; i++)
        inputs[i].setAttribute('disabled', true);
    this.modifiable = false;

    var buttons = document.getElementsByTagName('BUTTON');
    for (var i = 0; i < buttons.length; i++)
        if (buttons[i].onclick
            && buttons[i].onclick.toString().indexOf(this.key) != -1)
            buttons[i].setAttribute('disabled', '1');
};

MCQ.prototype.click_student = function (event) {
    if (this.modifiable) {
        var element = event.target;
        var in_label = false;
        do {
            in_label = in_label || element.tagName == 'LABEL';
            var button = element.getElementsByTagName('BUTTON');
            if (button.length) {
                if (in_label) {
                    button[0].firstChild.innerHTML = _("LABEL_MCQ_save");
                    button[0].removeAttribute('disabled');
                    button[1].setAttribute('disabled', true);
                    this.modified = true;
                    if (this.feedback) {
                        this.feedback.firstChild.className = 'done';
                        this.feedback = undefined;
                    }
                }
                break;
            }
            element = element.parentNode;
        }
        while (element);
        localStorage[this.key] = this.get_answers(document.getElementById(this.key));
    }
};

MCQ.prototype.add_scrollbar_tags = function () {
    var element = document.getElementById(this.key).parentNode.parentNode;
    var t = [];
    var q, popup_height, scrolled_height, full_height, top;
    function percent(px) {
        return 100 * (scrolled_height * px / full_height + top) / popup_height;
    }
    for (var i in this.questions) {
        var key = this.questions[i].full_key;
        q = document.getElementById(key);
        if (!q)
            continue; // Hidden questions
        t.push('<div class="mcqtag" id="TAG/');
        t.push(key);
        t.push('" onmousedown="mcq_click_on_tag(event)" style="top:');
        if (!popup_height) {
            popup_height = q.parentNode.parentNode.parentNode.offsetHeight;
            scrolled_height = q.parentNode.parentNode.offsetHeight;
            full_height = q.parentNode.offsetHeight;
            top = q.parentNode.parentNode.offsetTop;
        }
        t.push(percent(q.offsetTop));
        t.push('%;height:');
        t.push(percent(q.offsetTop + q.offsetHeight) - percent(q.offsetTop));
        t.push('%"></div>');
    }
    element.innerHTML += t.join('');
};

MCQ.prototype.get_record_button_student = function () {
    var b = '<div class="mcq_buttons">';
    if (this.modifiable)
        b += '<div class="mcqfeedback"></div>'
            + '<button'
            + (this.modified ? '' : ' disabled')
            + ' class="mcq_record" '
            + 'style="border-radius:1em;'
            + '" onclick="MCQ.dict[\'' + this.key
            + '\'].record_student(this)"><span>'
            + _("LABEL_MCQ_save") + '<span></button>'
            + (this.textual ? ' ' + or_keyword() + ' ' : ' ')
            + '<button'
            + (this.modified ? ' disabled' : '')
            + ' class="mcq_terminate" '
            + 'style="border-radius:1em;'
            + '" onclick="MCQ.dict[\'' + this.key
            + '\'].terminate(this)"><span>'
            + _("LABEL_MCQ_terminate") + '<span></button>'
            ;
    else {
        b += '<p>';
        if (this.cell.value === '' || isNaN(this.cell.value))
            b += _('MSG_MCQ_not_open');
        else
            b += _('MSG_MCQ_done');
    }
    b += '</div>';
    return b;
};

MCQ.prototype.get_content_student = function (hide_answers, to_print) {
    if (!to_print)
        setTimeout(this.update_html_student.bind(this), 100);
    return '<div class="mcq_content">'
        + this.html_student(hide_answers)
        + (this.modifiable
            ? (this.textual
                ? this.get_record_button_student()
                : _('MSG_MCQ_end')
            )
            : '')
        + '</div>';
};

MCQ.prototype.get_button_student = function (in_last_grades_list) {
    var label, button;
    label = note_format_suivi();
    button = '';
    if (this.modifiable) {
        if (this.textual) {
            if (in_last_grades_list)
                return '';
            if (isNaN(DisplayGrades.cell.value))
                label = '';
            else
                label += '<br>'
            label += this.get_content_student();
        }
        else {
            label = '';
            button = _("MSG_MCQ_open");
        }
    }
    else {
        if (this.cell.value === no)
            label = _('MSG_MCQ_done');
        else if (this.cell.value === yes)
            label = _('MSG_MCQ_not_open');
        else if (this.cell.value === '')
            label = _('MSG_MCQ_not_open');
        else {
            if (this.textual) {
                if (!in_last_grades_list)
                    label += '<br>' + this.button_label() + this.get_content_student();
            }
            else if (this.options.show_answers)
                button = this.button_label();
        }
    }
    if (button !== '') {
        button = '<button onclick="mcq_open(\'' + this.key + '\')">'
            + button + '</button>';
        if (label !== '')
            label += '<br>';
    }
    return label + button;
};

MCQ_Question.prototype.wooclap = function () {
    function cleanup_options(key, options) {
        opt = JSON.parse(JSON.stringify(options));
        delete opt.priority;
        opt.key = key;
        opt = JSON.stringify(opt);
        if (opt === '{}')
            return '';
        return opt;
    }
    function wooclap(txt) {
        return txt.replace(/\n/g, '   ')
            .replace(/\\\(/g, ' $').replace(/\\\)/g, '$ ')
            .replace(/\\\[/g, '  $').replace(/\\\]/g, '$  ')
            .replace(/\$\$([^$]*)\$\$/g, '   $$$1$$   ');
    }

    var goods = [];
    if (this.options.grade)
        for (var good in this.options.grade[0][0]) {
            good = this.options.grade[0][0][good];
            for (var i in this.sorted_choices)
                if (this.sorted_choices[i].key == good) {
                    goods.push(Number(i) + 1);
                    break;
                }
        }
    var t = ['MCQ', wooclap(this.question), goods.join(' ')];
    for (var choice in this.sorted_choices)
        t.push(wooclap(this.sorted_choices[choice].choice));
    var tt = ['', cleanup_options(this.key, this.options), ''];
    for (var choice in this.sorted_choices) {
        choice = this.sorted_choices[choice];
        tt.push(cleanup_options(choice.key, choice.options));
    }
    return line1 = t.join('\t') + '\n' + tt.join('\t');
};

MCQ.prototype.parse_wooclap = function (questions, values, options) {
    function wooclap(txt) {
        return txt.replace(/   \$([^$]*)\$   /g, '$$$$$1$$$$')
            .replace(/  \$([^$]*)\$  /g, '\\[$1\\]')
            .replace(/ \$([^$]*)\$ /g, '\\($1\\)')
            .replace(/\$([^$]*)\$/g, '\\($1\\)')
            .replace(/   /g, '\n');
    }
    var choices = {}, choices_index = [''];
    var key, opt;
    for (var i = 3; i < values.length; i++) {
        if (values[i] === '')
            break;
        opt = {};
        if (options && options[0] === '' && options[i] !== '' && options[i]) {
            opt = JSON.parse(options[i]);
            key = opt.key;
            delete opt.key;
        }
        else {
            key = undefined;
        }
        opt.priority = i;
        if (!key)
            key = this.get_new_id(choices);
        choices[key] = [wooclap(values[i]), opt];
        choices_index.push(key)
    }
    if (options && options[0] === '' && options[1] !== '' && options[1]) {
        opt = JSON.parse(options[1]);
    }
    else {
        opt = {};
        var goods = [], bads = [];
        var g = values[2].split(/[ ,]/);
        for (var i = 1; i < choices_index.length; i++)
            if (g.indexOf(i.toString()) == -1)
                bads.push(choices_index[i]);
            else
                goods.push(choices_index[i]);
        opt.grade = [[goods, bads, null]];
    }
    key = opt.key;
    delete opt.key;
    opt.priority = Object.keys(questions).length;
    if (!key)
        key = 'q' + opt.priority;
    questions[key] = [wooclap(values[1]), choices, opt];
};

//**************************************************************************

function sorted_dictionary(dict, rand) {
    var list = [];
    for (var key in dict) {
        list.push(dict[key]);
        if (rand)
            dict[key]._priority = rand.int();
        else
            dict[key]._priority = dict[key].options.priority;
    }
    list.sort(function (a, b) { return a._priority - b._priority; });
    return list;
}

var mcq; // The last MCQ on popup: only for the table editor

//**************************************************************************
// TABLE

function mcq_close() {
    if (mcq.options.gui != 'beginner') {
        var save = mcq.options.gui;
        mcq.options.gui = 'beginner';
        if (MCQ.initial_value != JSON.stringify(mcq.json())) {
            mcq.options.gui = save;
            alert(_("ALERT_MCQ_verify"));
            return;
        }
    }
    if (MCQ.initial_value != JSON.stringify(mcq.json())
        && column_change_allowed(mcq.column)
        && confirm(_("LABEL_mcq_save")))
        mcq.save();
    popup_close = MCQ.popup_close;
    popup_close();
    the_current_cell.jump = MCQ.the_current_cell_jump.bind(the_current_cell);
}

function toggle_mcq(value) {
    mcq = new MCQ(the_current_cell.column.mcq, the_current_cell.cell.comment);
    mcq.column = the_current_cell.column;
    mcq.data_col = the_current_cell.data_col;
    mcq.cell = the_current_cell.cell;
    mcq.ue = ue;
    mcq.year = year;
    mcq.semester = semester;
    create_popup('mcq_editor', '', mcq.html_table(), '', false);

    if (MCQ.popup_close === undefined) {
        MCQ.popup_close = popup_close;
        MCQ.the_current_cell_jump = the_current_cell.jump.bind(the_current_cell);
    }
    popup_close = mcq_close;
    MCQ.initial_value = JSON.stringify(mcq.json());

    the_current_cell.jump = mcq_jump;

    return value;
}

function mcq_jump(lin, col, do_not_focus, line_id, data_col) {
    if (do_not_focus === undefined)
        return;
    MCQ.the_current_cell_jump(lin, col, do_not_focus, line_id, data_col);
    mcq.cell = the_current_cell.line[mcq.data_col];
    if (mcq.options.gui == 'beginner' || mcq.options.gui == 'preview')
        mcq.update_mcq_content();
}

function i_am_a_new_mcq(column) {
    column_attr_set(column, 'visibility', 1);
    column_attr_set(column, 'modifiable', 2);
    column_attr_set(column, 'cell_writable',
        "#[] = | #[] @ | #[] =" + no + " | !#[] =" + yes);
    table_header_fill();
}

//**************************************************************************
// SUIVI

var mcq_suivi_color = '444';
var mcq_suivi_style = '<style id="mcqstyle">' // Do not apply to the screen reader interface
    + 'DIV.import_export.mcq { left:150px; right:5%; top:6.5em; bottom:5%;'
    + '   border: 3px solid #' + mcq_suivi_color + '; position: fixed }'
    + 'DIV[role=heading] { background: #FFF }'
    + '.mcq_content { overflow-y: scroll; position: absolute ;'
    + '               top: 40px ; left: 0px; right: 0px; bottom: 40px ;'
    + '               padding-left: 0.5em; padding-right: 0.5em ; }'
    + '.mcq_content p:first-child { margin: 1em; font-weight: bold }'
    + '#popup_id { padding-top: 0px ; }'
    + '.mcqquestion { border: 2px solid #FFF ; border-left-width: 1em;'
    + '               margin-bottom:1em; transition: border-color 1s }'
    + '.mcqquestion.unanswered { border-color: #' + mcq_suivi_color + ' }'
    + '.mcqquestion div:first-child { padding-left: 0.5em }'
    + ".mcqquestion .grading, .mcqquestion .question_grade { margin-left:1em ; float: right; height: 1em }"
    + ".mcqquestion .grading { color: #FFF ; background: #888 }"
    + ".mcqquestion .question_grade { border: 1px solid #000 }"
    + '.mcqchoice { width: 100% }'
    + '.mcqchoice TD { cursor: pointer }'
    + '.mcqchoice TD:first-child { width: 2em; white-space: nowrap; text-align: right; margin-left: 0.2em; padding:1px }'
    + '.mcqchoice:hover { background: #EEE }'
    + '.mcqchoice .expected { float: right }'
    + '.mcq DIV.mcqfeedback IFRAME.feedback { width: 5em; height: 1.2em; background: red }'
    + '.mcq DIV.mcqfeedback > DIV { width: 25em ; transition: width 5s; overflow: hidden }'
    + '.mcq DIV.mcqfeedback > DIV.done { width: 0px; }'
    + '.mcq SECTION { margin-left: 0px }'
    + '.mcq H2, .mcq_buttons { position:absolute; left:0px; right:0px ;'
    + '                        height:38px ;}'
    + '.mcq H2 DIV { height: 100%;box-sizing: border-box; padding-left: 0.5em; padding-top: 4px }'
    + '.mcq H2 { border-bottom: 1px solid #' + mcq_suivi_color + ';}'
    + '.mcq_buttons { border-top: 1px solid #' + mcq_suivi_color
    + '; padding-right: 0.5em; padding-top: 4px ; box-sizing: border-box;  }'
    + '.mcq_buttons { bottom: 0px; right: 0px; text-align: right }'
    + '.mcq_buttons BUTTON { height: 30px; box-sizing: border-box; }'
    + '.mcq_buttons DIV { display: inline-block ; white-space: nowrap }'
    + 'BUTTON.mcq_terminate, BUTTON.mcq_terminate[disabled]:hover { background: #FCC }'
    + 'BUTTON.mcq_terminate:hover { background: #F88 }'
    + 'BUTTON.mcq_record, BUTTON.mcq_record[disabled]:hover  { background: #CFC }'
    + 'BUTTON.mcq_record:hover { background: #8F8 }'
    + '#popup_id .close { z-index: 100 }'
    + 'DIV.Picture DIV.tipped DIV.help { display: block }'
    + 'DIV.Picture DIV.tipped DIV.help IMG { height: auto; width: 150px }'
    + 'DIV.Picture DIV.tipped DIV.text IMG { display: none }'
    + '.mcqtag { position:absolute; right:0.6em; width:0.2em ; cursor: pointer;'
    + '          background: #FFF; transition: background 1s }'
    + '.mcqtag.unanswered { background: #000; }'
    + 'H { font-size: 0px; color:transparent; }'
    + '[onclick] { user-select: initial }'
    + '</style>';

function mcq_open(key) {
    var mcq = MCQ.dict[key];
    if (is_a_teacher && mcq.contains_html() && confirm(_('ALERT_MCQ_safe')))
        mcq.disable_html();

    var data = mcq.cell.comment;
    mcq.modified = false;
    if (localStorage[key] !== undefined && localStorage[key] != data
        && mcq.modifiable // Do not retrieve if closed
        && localStorage[key].length > data.length - 2) // XXX Not clean
        if (confirm(_("CONFIRM_MCQ_retrieve"))) {
            data = localStorage[key];
            mcq.modified = true;
        }
    mcq.update_checked(data);
    add_ticket_checker(the_body);
    window.scrollTo(0, 0);
    create_popup('mcq', mcq_suivi_style
        + '<div>«' + html(mcq.column.title) + '» : '
        + mcq.button_label() + '</div>'
        , mcq.get_record_button_student() + mcq.get_content_student(), '', false);
    if (MCQ.popup_close === undefined)
        MCQ.popup_close = popup_close;
    popup_close = mcq.close_student.bind(mcq);
    var images = document.getElementsByTagName('IMG');
    for (var i = 1; i < images.length; i++)
        if (images[i - 1].className == 'big' && images[i].className == 'small')
            images[i - 1].src = images[i].src.replace('-icon', '');
    mcq.add_scrollbar_tags();
}

function mcq_from_element(element) {
    while (element) {
        if (MCQ.dict[element.id])
            return MCQ.dict[element.id];
        element = element.parentNode;
    }
}

function mcq_filter_active(condition) {
    if (!mcq.column)
        return;
    return mcq.column.filter.match(RegExp(' #~' + condition + '$'));
}

function mcq_filter(condition) {
    var filter = mcq.column.filter.replace(/ *#~.*/, '');
    if (!mcq_filter_active(condition))
        filter += ' #~' + condition;
    filter_change_column(filter, mcq.column);
    table_fill(true, true, true);
}

function mcq_click_on_tag(event) {
    document.getElementById(the_event(event).target.id.substr(4)).scrollIntoView();
}

function mcq_format_suivi() {
    if (Object.keys(DisplayGrades.column.mcq[0]).length == 0)
        return _("LABEL_MCQ_terminated");
    var key = DisplayGrades.ue.year + '/' + DisplayGrades.ue.semester + '/' + DisplayGrades.ue.ue + '/'
        + DisplayGrades.column.the_id + '/' + display_data['Login'];
    var mcq = MCQ.dict[key];
    if (!mcq) {
        mcq = new MCQ(DisplayGrades.column.mcq, DisplayGrades.cell.comment, key);
        mcq.cell = DisplayGrades.cell;
        mcq.column = DisplayGrades.column;
        mcq.ue = DisplayGrades.ue.ue;
        mcq.year = DisplayGrades.ue.year;
        mcq.semester = DisplayGrades.ue.semester;
        mcq.url = DisplayGrades.ue.ue
            + '/comment/' + DisplayGrades.column.the_id
            + '/' + DisplayGrades.ue.line_id;
        mcq.textual = display_update.top == 'Textual'; // Screen reader
        var save = DisplayGrades.column.modifiable;
        if (DisplayGrades.column.modifiable_backup !== undefined)
            DisplayGrades.column.modifiable = DisplayGrades.column.modifiable_backup;
        mcq.modifiable = cell_modifiable_on_suivi(); // 0 is not false
        if (DisplayGrades.column.modifiable)
            mcq.options.show_answers = false;
        DisplayGrades.column.modifiable = save;
        if (!isNaN(DisplayGrades.cell.value) && DisplayGrades.cell.value !== '')
            mcq.modifiable = false; // No more editable if graded
        if (DisplayGrades.cell.value === no)
            mcq.modifiable = false; // No more editable if terminated
    }
    return mcq.get_button_student(DisplayGrades.column.modifiable === false);
}

function test_mcq(value, column) {
    if (value !== '' && !isNaN(value))
        return test_note(value, column);
    return test_bool(value, column, true) || test_note(value, column);
}

function MCQ_export() {
    var mcq = new MCQ(the_current_cell.column.mcq);
    mcq.column = the_current_cell.column;
    mcq.data_col = the_current_cell.data_col;
    mcq.ue = ue;
    mcq.year = year;
    mcq.semester = semester;
    create_popup('mcq_export', html(the_current_cell.column.title),
        _("MSG_print_popup_title"), '', mcq.export());
}
function _MCQ()
{
  var t = _Note() ;
  t.title = 'MCQ' ;
  t.attributes_visible = ['minmax', 'weight', 'rounding', 'repetition', 'url_import', 'groupcolumn', 'mcq', 'MCQ_export', 'grade_type', 'grade_session'] ;
  t.cell_test = test_mcq ;
  t.formatte_suivi = mcq_format_suivi ;
  t.hide_cell_comment = 1 ;
  t.human_priority = 100 ;
  t.ondoubleclick = toggle_mcq ;
  t.tip_cell = "TIP_cell_MCQ" ;
  t.type_change = i_am_a_new_mcq ;
  return t ;
}

function _Normalize()
{
  var t = _Note() ;
  t.title = 'Normalize' ;
  t.attributes_visible = ['minmax', 'columns', 'weight', 'rounding', 'clamp', 'normalize', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_normalize ;
  t.cell_is_modifiable = 0 ;
  t.human_priority = 1000 ;
  t.type_type = "computed" ;
  return t ;
}

function toggle_bool(value) {
    return toggle_PA(test_bool, value, [yes, no]);
}

function bool_completions(value, column) {
    column.possible_values = [yes, no, ''];
    return completions_enumeration(value, column);
}

function test_bool(value, _column, silent) {
    if (value === undefined || value === '')
        return '';
    if (value.toUpperCase)
        value = value.toUpperCase();
    if (value == yes_char || value == '1' || value == yes)
        return yes;
    if (value == no_char || value == '0' || value == no)
        return no;
    if (!silent)
        alert_append(_('ALERT_invalid_value') + value + '\n' + _("TIP_cell_Bool"));
    return;
}

good_select_option = {};

function enumeration_suivi(choices) {
    var current_value = DisplayGrades.value.toString();
    if (!cell_modifiable_on_suivi())
        return html(current_value.replace(/_/g, " "));

    merged_choices = {};
    for (var i in choices) {
        i = choices[i];
        if (i.replace !== undefined) {
            merged_choices[i] = i;
            continue;
        }
        var name = i[0].replace(/_*$/, '');
        if (!merged_choices[name])
            merged_choices[name] = [name, 0];
        merged_choices[name][1] += i[1];
    }
    var value_with_space = current_value.replace(/_*$/, '');
    var code = DisplayGrades.column.the_id + '/' + DisplayGrades.ue.line_id;
    if (good_select_option[code] === undefined)
        good_select_option[code] = value_with_space;
    var v = '<select class="hidden" onmouseenter="select_open=true" onchange="'
        + student_input(DisplayGrades.column) + '" cellcode="'
        + encode_value(code)
        + '">';
    var sel, value, display, found;
    for (var i in merged_choices) {
        i = merged_choices[i];
        value = i.replace !== undefined ? i : i[0];
        if (value == value_with_space)
            found = sel = ' selected="1"';
        else
            sel = "";
        if (i.replace === undefined) {
            if (sel !== '')
                i = [i[0], i[1] - 1];
            value = i[0];
            display = i[0] + ' (' + i[1] + ' ' + _('MSG_free') + ')';
        }
        else
            display = value;
        v += '<option value="' + encode_value(value) + '"' + sel + '>'
            + html(display.replace(/_/g, ' ')) + '</option>';
    }
    if (!found)
        v += '<option value="' + encode_value(current_value) + '" selected="1">'
            + html(current_value) + ' (0 ' + _('MSG_free') + ')' + '</option>';
    v += '</select>';

    return v;
}

function bool_format_suivi() {
    return enumeration_suivi(['', yes, no]);
}

function _Bool()
{
  var t = _Note() ;
  t.title = 'Bool' ;
  t.attributes_visible = ['url_import', 'groupcolumn', 'repetition'] ;
  t.cell_completions = bool_completions ;
  t.cell_test = test_bool ;
  t.formatte = text_format ;
  t.formatte_suivi = bool_format_suivi ;
  t.human_priority = 1 ;
  t.ondoubleclick = toggle_bool ;
  t.should_be_a_float = 0 ;
  t.tip_cell = "TIP_cell_Bool" ;
  t.tip_filter = "TIP_filter_Bool" ;
  return t ;
}

function test_prst(value, _column, silent) {
    var v = value.toUpperCase();
    if (v === abi_char || v === abi_short || v === abi)
        return abi;
    if (v === abj_char || v === abj_short || v === abj)
        return abj;
    if (v === pre_char || v === pre_short || v === pre)
        return pre;
    if (allowed_grades[v])
        return v;
    if (v === '')
        return v;
    if (!silent) {
        var more = [];
        for (var i in allowed_grades)
            more.push(i + ' : ' + allowed_grades[i][1] + '\n');

        alert_append(_('ALERT_invalid_value') + ' « ' + v + ' »\n'
            + pre + " (" + pre_char + ") : " + _("MSG_T_pre") + "\n"
            + abi + " (" + abi_char + ") : " + _("MSG_T_abi") + "\n"
            + abj + " (" + abj_char + ") : " + _("MSG_T_abj") + "\n"
            + more.join("")
        )
    }
    return;
}

function prst_completions(value, column) {
    column.possible_values = [pre, abi, abj, 'DIS'];
    for (var i in allowed_grades)
        if (allowed_grades[i][2] && myindex(column.possible_values, i) == -1)
            column.possible_values.push(i);
    column.possible_values.push('');
    return completions_enumeration(value, column);
}

function toggle_PA(test, v, values, column) {
    if (preferences.disable_dbl_click)
        return v;
    v = test(v, column);

    /* Cycle through values */
    var i = myindex(values, v);
    if (i == -1)
        i = values.length - 1;
    i = (i + 1) % values.length;

    return values[i];
}

function toggle_prst(value) {
    return toggle_PA(test_prst, value, [pre, abi, abj, 'DIS']);
}

function prst_format_suivi() {
    return enumeration_suivi(prst_completions('', DisplayGrades.column));
}

function qrcode_prst() {
    var more = [];
    if (filtered_lines.length != Object.keys(lines).length) {
        for (var lin_id in filtered_lines)
            more.push(filtered_lines[lin_id].line_id);
    }
    window_open(add_ticket(year + '/' + semester + '/' + ue + '/qrcode_new/'
        + the_current_cell.data_col + '/' + more.join('/')));
}

function _Prst()
{
  var t = _Note() ;
  t.title = 'Prst' ;
  t.attributes_visible = ['url_import', 'groupcolumn', 'repetition', 'weight', 'qrcode_prst'] ;
  t.cell_completions = prst_completions ;
  t.cell_test = test_prst ;
  t.formatte = text_format ;
  t.formatte_suivi = prst_format_suivi ;
  t.human_priority = -9 ;
  t.ondoubleclick = toggle_prst ;
  t.should_be_a_float = 0 ;
  t.tip_cell = "TIP_cell_Prst" ;
  t.tip_filter = "TIP_filter_Prst" ;
  return t ;
}

function _Add()
{
  var t = _Note() ;
  t.title = 'Add' ;
  t.attributes_visible = ['minmax', 'columns', 'weight', 'rounding', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_addition ;
  t.cell_is_modifiable = 0 ;
  t.human_priority = -7 ;
  t.type_type = "computed" ;
  return t ;
}

function _Ue_Grade()
{
  var t = _Note() ;
  t.title = 'Ue_Grade' ;
  t.attributes_visible = ['minmax', 'abi_is', 'rounding', 'weight'] ;
  t.cell_compute = compute_ue_grade ;
  t.cell_is_modifiable = 0 ;
  t.human_priority = -7 ;
  t.type_change = 
    function(column) {
        column_attr_set(column, 'rounding', rounding_avg);
        column_attr_set(column, 'abi_is', 1);
        column_attr_set(column, 'comment', _('MSG_Ue_Grade_comment'));
    }
     ;
  t.type_type = "computed" ;
  return t ;
}

annotator_options = {
    'colors': [
        ["#000", 3], ["#F00", 3], ["#0A0", 3], ["#00F", 3],
        ["#0CC", 0], ["#C0C", 0], ["#CC0", 0]],
    'color': [['#000', 1], ["#F00", 2]],
    'widths': [['1', 3], ['4', 3], ['8', 3], ['12', 3]],
    'width': [['1', 3]],
    'sizes': [['18', 3], ['24', 3], ['32', 3], ['48', 3]],
    'size': [['24', 3]],
    'modes': [
        ['Edit', 3, '➚'], ['Text', 3, '<b>T</b>'], ['Draw', 3, '✍'], ['Highlight', 3, '🖍'],
        ['-1', 2, '-1'], ['+1', 2, '+1'], ['-0.5', 2, '-½'], ['+0.5', 2, '+½'],
        ['-0.25', 0, '-¼'], ['+0.25', 0, '+¼'],
        ['😟', 0], ['😊', 0], ['👎', 0], ['👍', 0]],
    'mode': [['Text', 1], ["+1", 2]]
};

/*
'save'
'annotations': 'demo.txt',
*/

function annotator_unused_letter() {
    var used = annotator_configuration().images;
    for (var letter = 'A'; ; letter = String.fromCharCode(letter.charCodeAt(0) + 1))
        if (myindex(used, letter) == -1)
            return letter;
}

function annotator_config_options(column) {
    if (column.annotator == 1) {
        column.annotator = {};
        column.annotator.images = [];
        column.annotator.options = [{}, {}];
        for (var i in annotator_options) {
            var s = [], t = [];
            for (var j in annotator_options[i]) {
                var v = annotator_options[i][j];
                if (v[1] & 1)
                    s.push(v[0]);
                if (v[1] & 2)
                    t.push(v[0]);
            }
            column.annotator.options[0][i] = s.join(',');
            column.annotator.options[1][i] = t.join(',');
        }
    }
}

function year_sem_ue() {
    try {
        return DisplayGrades.ue.year + '/' + DisplayGrades.ue.semester + '/' + DisplayGrades.ue.ue;
    }
    catch (e) {
        return year + '/' + semester + '/' + ue;
    }
}

function annotator_pdf_get() {
    var line_ids = [];
    for (var i in filtered_lines)
        if(filtered_lines[i][0].value !== '')
            line_ids.push(filtered_lines[i].line_id);
    line_ids.push("tomuss.zip")
    window_open(add_ticket(year_sem_ue() + '/annotator_form/' + the_current_cell.column.the_id + '/' + line_ids.join('/')));
}

function annotator_config() {
    var column = the_current_cell.column;
    annotator_config_options(column);
    var t = [
        '<style>',
        'DIV.import_export.annotator { border: 2px solid black ; position: fixed; top: 10%; bottom:10%; z-index: 30 }',
        'TABLE.annotator { --size: 34px }',
        'TABLE.annotator TR { vertical-align: top }',
        'TABLE.annotator .annotator_image { display: inline-block; text-align: center}',
        'TABLE.annotator FORM { display: inline }',
        'TABLE.annotator FORM IFRAME { height: 1.5em ; width: 3em ; border: 0px }',
        'TABLE.annotator DIV.annotator_icons { line-height: 10px }', // Why not 30px ?
        'TABLE.annotator INPUT { width: auto; }',
        'TABLE.annotator DIV.i { width: var(--size) ; height: var(--size) ; display: inline-block;',
        '    overflow: hidden ; text-align: center; line-height: var(--size); user-select: none;',
        '    cursor: pointer; box-sizing: border-box}',
        'TABLE.annotator DIV.i SPAN { vertical-align: middle;}',
        'TABLE.annotator DIV.i:hover { border: 1px solid black }',
        'TABLE.annotator DIV.possible.selected { background:#FFF }',
        'TABLE.annotator DIV.possible { background:#DDD }',
        'TABLE.annotator TD:nth-child(1), TABLE.annotator TD:nth-child(2) { background: #BBB }',
        'TABLE.annotator DIV.impossible { background:#BBB }',
        'TABLE.annotator TH, TABLE.annotator TH BUTTON { font-size: 75%; padding: 0px }',
        'TABLE.annotator TH:nth-child(1) { width: calc(var(--size) * 2 + 1px) }',
        'TABLE.annotator TH:nth-child(2) { width: calc(var(--size) * 2 + 1px) }',
        'TABLE.annotator HR { margin: 0px }',
        '#annotator BUTTON { vertical-align: text-bottom }',
        '#annotator_save.blink { background-color: #8F8 ; }',
        '</style>',
        '<table id="annotator" class="annotator colored"><tr>',
        '<th>', _('TH_student'), '<br><button class="0">', _('Test'), '</button>',
        '<th>', _('COL_TITLE_teacher'), '<br><button class="1">', _('Test'), '</button>',
        '<td>', _('MSG_annotate_add_subject'),
        '<form method="POST" enctype="multipart/form-data" target="annotator_feedback" action="',
        add_ticket(year_sem_ue() + '/annotator_upload/' + column.the_id),
        '">',
        '<input type="file" name="data" accept="application/pdf" onchange="this.nextSibling.value=annotator_unused_letter();this.parentNode.submit()">',
        '<input type="hidden" name="letter">',
        '<iframe name="annotator_feedback"></iframe>',
        '</form>',
        '<button id="annotator_save">', _('LABEL_save'), '</button>',
        ' <button class="2">', _('Form'), '</button>',
        '</tr><tr>',
    ];
    function add(name, style, display) {
        var current = column.annotator.options[i][name];
        var possibles = column.annotator.options[i][name + 's'];
        var options = annotator_options[name + 's'];
        var cls;
        for (var j in options) {
            var value = options[j][0];
            if (possibles.indexOf(value) == -1)
                cls = 'impossible';
            else
                cls = 'possible';
            if (value == current)
                cls += ' selected';
            t.push('<div style="');
            t.push(style.replace(/{}/g, value));
            t.push('" value="');
            t.push(value);
            t.push('" class="i ');
            t.push(cls);
            t.push('"><span>');
            t.push(display.replace('{}', options[j][2] || value));
            t.push("</span></div>");
        }
    }
    for (var i = 0; i < 2; i++) {
        t.push('<td><div class="annotator_icons">');
        add('mode', "font-family:emoji", '{}');
        t.push('<hr>');
        add('color', "color:{}", '⬤');
        t.push('<hr>');
        add('width', "font-size:calc({}px * 1.5)", '⬤');
        t.push('<hr>');
        add('size', "font-size:calc({}px / 1.5)", 'T');
    }
    t.push('<td><div style="width:46em; margin-left: 1em">');
    t.push(_('MSG_annotate_doc'));
    t.push('</div></td>');
    t.push('</tr>');
    t.push('</table>');
    create_popup(
        'annotator',
        '',
        t.join(''),
        '',
        false);
    var a = document.getElementById('annotator');
    a.addEventListener("mousedown", annotator_click);
    a.addEventListener("dblclick", annotator_dblclick);
    for (var i in column.annotator.images)
        annotator_add(column.annotator.images[i]);
    annotator_configuration_is_modified();
}

function annotator_url(column, line, who, timestamp, merge) {
    if (line) {
        annotator_config_options(column);
        var options = column.annotator.options[who];
    }
    else
        var options = annotator_configuration(who).options[who == '2' ? 0 : who];
    var letter, line_id;
    if (line) {
        line_id = line.line_id;
        if (line[column.data_col].comment)
            letter = line[column.data_col].comment.substr(0, 1);
        else
            letter = '';
    } else {
        letter = column.annotator.images[0];
        line_id = my_identity;
        options['save'] = add_ticket(year_sem_ue() + '/annotator_record/'
            + column.the_id + '/' + line_id);
        options['annotations'] = add_ticket(year_sem_ue() + '/annotator_load/'
            + column.the_id + '/' + line_id);
    }
    if (column.annotator.images && column.annotator.images.length)
        options['image'] = annotator_image_url(column, letter, timestamp, line_id);
    else if (line)
        options['image'] = add_ticket(year_sem_ue()
            + '/upload_get/' + column.the_id + '/' + line_id + '/x.png');
    else
        options['image'] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQI12P4DwABAQEAG7buVgAAAABJRU5ErkJggg";
    options['teacher'] = who;
    options['me'] = my_identity;
    options['origin'] = window.location.origin;
    if (merge)
        for (var i in merge)
            options[i] = merge[i];
    if (line && !line[column.data_col].modifiable(line, column))
        options['save'] = undefined;
    return 'https://tomuss.univ-lyon1.fr/files/7.4.0@1768211899/Annotator.html#' + JSON.stringify(options);
}

function annotator_image_url(column, letter, timestamp, line_id) {
    return add_ticket(year_sem_ue()
        + '/annotator_get/' + column.the_id
        + '/' + (letter === '' ? line_id : letter + '.png')
        + '/' + (timestamp || millisec()));
}

function annotator_close() {
    window.onmessage = function (event) {
        if (event.data != 'annotator ok')
            return;
        popup_close = annotator_open.old_close;
        the_current_cell.jump = annotator_open.old_jump;
        if (the_current_cell.tr)
            the_current_cell.tr.classList.remove('currentformline');
        popup_close();
        window.onmessage = function () { };
    };
    var iframe_annotate = document.getElementById('iframe_annotate');
    if (iframe_annotate.src.match(/%22save%22/))
        iframe_annotate.src = iframe_annotate.src.replace('%22save%22', '%22s%22'); // Ask save/cancel
    else
        window.onmessage({ data: 'annotator ok' });
}

function annotator_full_url(column, timestamp, error) {
    return annotator_url(column, the_current_cell.line, 1, timestamp,
        {
            'save': add_ticket(year_sem_ue() + '/annotator_record/'
                + column.the_id + '/' + the_current_cell.line_id),
            'annotations': add_ticket(year_sem_ue() + '/annotator_load/'
                + column.the_id + '/' + the_current_cell.line_id),
            'error': error
        });
}

function annotator_jump(lin, col, do_not_focus, line_id, data_col) {
    the_current_cell.tr.classList.remove('currentformline');
    col = the_current_cell.col;
    data_col = popup_column().data_col;
    annotator_open.old_jump(lin, col, do_not_focus, line_id, data_col);
    the_current_cell.tr.classList.add('currentformline');
    var iframe = document.getElementById('iframe_annotate');
    var msg = annotator_annotable(popup_column(column));
    // Force ok/cancel confirm save question :
    iframe.src = annotator_full_url(popup_column(), annotator_open.timestamp, msg);
    annotator_open.key = url + '/' + year_sem_ue() + '/annotator_record/'
        + popup_column().the_id + '/' + line_id;
}

function annotator_annotable(column) {
    if (the_current_cell.line[column.data_col].comment === '') {
        if (column.annotator.images.length)
            return _('ALERT_annotate_subject').replace('{}', column.annotator.images);
        return _("MSG_annotate_no_file");
    }
    if (the_current_cell.td.classList.contains("suivi_modifiable")) {
        return _("MSG_annotate_not_allowed");
    }
}

function annotator_open(_value, column) {
    annotator_config_options(column);
    create_popup(
        'annotator_grade',
        '',
        '<style>'
        + 'DIV.import_export.annotator_grade'
        + ' { border-left: 2px solid black ; left:auto; width: 1242px; max-width:80%; top:0px; bottom:0px; right: 2em;'
        + '   z-index: 30; overflow: hidden; }'
        + 'DIV.annotator_grade IFRAME { border: 0px ; width: calc(100% - 2em) ; height: 100%; }'
        + '</style>'
        + '<iframe id="iframe_annotate" src="'
        + encodeURI(annotator_full_url(column, 0, annotator_annotable(column)))
        + '"></iframe>'
        + '<p class="zoom_buttons" onclick="popup_zoom(-100)" style="top:3em">←→</p>'
        + '<p class="zoom_buttons" onclick="popup_zoom(100)" style="top: 6em">→←</p>',
        '',
        false);
    annotator_open.old_close = popup_close;
    annotator_open.old_jump = the_current_cell.jump.bind(the_current_cell);
    // XXX modified in annotator_jump
    annotator_open.key = url + '/' + year_sem_ue() + '/annotator_record/'
        + column.the_id + '/' + the_current_cell.line_id;
    annotator_open.timestamp = millisec();
    popup_close = annotator_close;
    the_current_cell.tr.classList.add('currentformline');
    the_current_cell.jump = annotator_jump.bind(the_current_cell);
}

function annotator_configuration(who) {
    var annotator = document.getElementById('annotator');
    var student = annotator.rows[1].cells[0].firstChild.firstChild;
    var teacher = annotator.rows[1].cells[1].firstChild.firstChild;
    var data = JSON.parse(JSON.stringify(popup_column().annotator));
    var A = data.options;
    function test(name) {
        var options = annotator_options[name + 's'];
        var stu = [];
        var tea = [];
        for (var _i in options) {
            if (!student.classList.contains('impossible'))
                stu.push(student.getAttribute('value'));
            if (student.classList.contains('selected'))
                A[0][name] = student.getAttribute('value');
            if (!teacher.classList.contains('impossible'))
                tea.push(teacher.getAttribute('value'));
            if (teacher.classList.contains('selected'))
                A[1][name] = teacher.getAttribute('value');
            do {
                student = student.nextSibling;
                teacher = teacher.nextSibling;
            } while (student && student.tagName != 'DIV');
        }
        A[0][name + 's'] = stu.join(',');
        A[1][name + 's'] = tea.join(',');
    };
    if (who == 2) { // For forms
        A[0].modes = A[0].mode = 'Edit';
        A[0].colors = A[0].color = '#000';
        A[0].widths = A[0].width = '1';
        A[0].sizes = "18,24,32,48";
        A[0].size = '18';
    }
    else {
        test('mode');
        test('color');
        test('width');
        test('size');
    }
    var t = document.getElementById('annotator').rows[1].cells[2];
    data.images = [];
    for (var e = t.firstChild; e; e = e.nextSibling)
        if (e.lastChild.tagName == 'IMG')
            data.images.push(e.firstChild.textContent.substr(0, 1));
    data.images.sort();
    if (who == '2') {
        var cols = [];
        var cls = column_list_all();
        for (var i in cls)
            cols.push(columns[cls[i]].title);
        A[0].columns = A[1].columns = cols;
    }
    return data;
};

function annotator_configuration_is_modified() {
    var on_screen = annotator_configuration();
    var recorded = popup_column().annotator;
    var modified;
    if (on_screen.images.toString() != recorded.images.toString()) {
        modified = true;
    }
    for (var i = 0; i < 2; i++)
        for (var j in on_screen.options[i])
            if (on_screen.options[i][j] != recorded.options[i][j]) {
                modified = true;
            }
    document.getElementById("annotator_save").disabled = !modified;
    document.getElementById("annotator_save").className = modified ? "blink" : '';
    return modified;
}

function annotator_click(event) {
    var t = event.target;
    if (t.tagName == 'BUTTON') {
        if (t.className >= 0 && t.className <= 2)
            window_open(annotator_url(popup_column(), undefined, t.className));
        else {
            var data = annotator_configuration();
            column_attr_set(popup_column(), 'annotate', data, t, true);
            annotator_configuration_is_modified();
        }
        return;
    }
    while (t && t.tagName != 'DIV')
        t = t.parentNode;
    if (t) {
        if (event.target.className == 'annotator_delete')
            t.parentNode.removeChild(t);
        else
            if (!t.classList.contains('selected'))
                t.classList.replace('possible', 'impossible');
    }
    annotator_configuration_is_modified();
}

function annotator_dblclick(event) {
    var t = event.target;
    while (t && t.tagName != 'DIV')
        t = t.parentNode;
    if (!t)
        return;
    for (var o = t; o && o.tagName == 'DIV'; o = o.previousSibling)
        o.classList.remove('selected');
    for (var o = t; o && o.tagName == 'DIV'; o = o.nextSibling)
        o.classList.remove('selected');
    t.classList.replace('impossible', 'possible')
    t.classList.add('selected');
    annotator_configuration_is_modified();
}

function annotator_add(image) {
    var t = document.getElementById('annotator').rows[1].cells[2];
    var div = document.createElement('DIV');
    var img = document.createElement('IMG');
    img.src = annotator_image_url(popup_column(), image);
    img.style.height = '550px';
    div.className = 'annotator_image';
    div.innerHTML = '<p>' + image + ' ' + '<span class="annotator_delete">🗑</span>' + '<br>';
    div.appendChild(img);
    if (t.lastChild && t.lastChild.lastChild.tagName != 'IMG')
        t.removeChild(t.lastChild);
    t.appendChild(div);
    annotator_configuration_is_modified();
}

function i_am_a_new_annotator(column) {
    for (var line_id in lines) {
        var cell = lines[line_id][column.data_col];
        if (cell.value !== '' && cell.comment.match(/^[a-z]*\/.*charset=/)) {
            Alert('ALERT_annotate_impossible');
            break;
        }
    }
    column_attr_set(column, 'visibility', 1);
    column_attr_set(column, 'modifiable', 2);
    column_attr_set(column, 'cell_writable', "= | @ | #[]");
    table_header_fill();
    if (column.annotate === 1)
        setTimeout(annotator_config, 100);
}

function annotator_only_for_teacher(column) {
    return !column.annotator
        || column.annotator == 1
        || !column.annotator.images
        || column.annotator.images.length == 0;
}

function popup_zoom(delta) {
    var e = popup_get_element().firstChild;
    var width = e.offsetWidth - delta;
    if (width < 100)
        width = 100;
    else if (width > 2000) // Should test height > 32000 (fabric.js bug)
        return;
    e.style.width = width + 'px';
}


function annotator_format_suivi() {
    var column = DisplayGrades.column;
    var modifiable = cell_modifiable_on_suivi();
    if (!modifiable && annotator_only_for_teacher(column)
        && !isNaN(DisplayGrades.cell.value))
        return '<a target="_blank" href="'
            + encodeURI(annotator_url(column, DisplayGrades.ue.line_real, is_a_teacher, undefined,
                {
                    'annotations': add_ticket(year_sem_ue() + '/annotator_load/'
                        + column.the_id + '/' + DisplayGrades.ue.line_id)
                }))
            + '">'
            + ((isNaN(DisplayGrades.cell.value) || DisplayGrades.cell.value === '' || modifiable)
                ? ''
                : note_format_suivi() + ' : ')
            + _("MSG_annotate_correction")
            + '</a>';

    if (column.modifiable === false) // Last grade list
        if (DisplayGrades.cell.value === '' || isNaN(DisplayGrades.cell.value))
            return '';
    if (annotator_only_for_teacher(column))
        return upload_format_suivi();
    var merge = {
        'annotations':
            add_ticket(year_sem_ue() + '/annotator_load/'
                + column.the_id + '/' + DisplayGrades.ue.line_id)
    };
    if (modifiable)
        merge['save'] = add_ticket(year_sem_ue() + '/annotator_record/'
            + column.the_id + '/' + DisplayGrades.ue.line_id);

    var graded = (
        column.annotator.options[0].modes
        + column.annotator.options[1].modes).match(/,[-+]/);

    var msg = ((isNaN(DisplayGrades.cell.value) || DisplayGrades.cell.value === ''
        || modifiable || !graded)
        ? ''
        : note_format_suivi() + ' : ')
        + (is_a_teacher ? _("MSG_annotate_grade") :
            (modifiable ? _("MSG_annotate_answer") : _("MSG_annotate_correction")
            ));
    var annotate_url = encodeURI(annotator_url(column, DisplayGrades.ue.line_real, is_a_teacher, undefined, merge));
    if (window_width() < window_height() && window_width() < 1600)
        return '<a target="_blank" href="' + annotate_url + '">' + msg + '</a>';
    else
        return '<a class="clickable" style="color:blue" onclick="'
            + encode_value("create_popup('annotate_suivi','', '"
                + '<style>DIV.import_export.annotate_suivi {position:fixed;top:0px;bottom:0px;max-width:85%;width:1242px;left:auto;right:0px}'
                + '.annotate_suivi IFRAME { width:calc(100% - 2em); height:100%; }</style>'
                + '<p class="zoom_buttons" onclick="popup_zoom(-100)" style="top:3em">←→</p>'
                + '<p class="zoom_buttons" onclick="popup_zoom(100)" style="top: 6em">→←</p>'
                + '<iframe id="iframe_annotate" src="' + annotate_url + "\"></iframe>','',false);"
                + 'annotator_open.old_close=popup_close;popup_close=annotator_close;'
                + 'annotator_open.key =' + js(url + '/' + year_sem_ue() + '/annotator_record/'
                    + column.the_id + '/' + DisplayGrades.ue.line_id)
            ) + '">' + msg + '</a>';
}

function _Annotate()
{
  var t = _Note() ;
  t.title = 'Annotate' ;
  t.attributes_visible = ['minmax', 'weight', 'rounding', 'groupcolumn', 'annotate', 'grade_type', 'grade_session', 'annotate_pdf'] ;
  t.cell_is_modifiable = 0 ;
  t.formatte_suivi = annotator_format_suivi ;
  t.human_priority = 0 ;
  t.ondoubleclick = annotator_open ;
  t.tip_cell = "TIP_cell_Annotate" ;
  t.type_change = i_am_a_new_annotator ;
  return t ;
}

/*

Classes:
  * NotationGrade : grade, max and comment
  * NotationQuestion : question, max, steps, type
    + NotationGrade
  * Notation : question list

The question list and the grade list:
  * are updated on each keystroke
  * are stored on student change
  The grades of all the students are computed on popup close.

Type of question:
  * 0 : Q question
  * 1 : D deleted question
  * 2 : B question bonus
  * 3 : C comment

Priorities:
  * 0, 1, 2, 3... for the original question list
  * ...           for the remote created questions
  * 1000, 1001... for the localy created questions (updated after merging)
  * 9999          for the empty question (updated to 1000... if filled)

  XXX BAD: these comments indicate some lines to be modified synchronously
*/

var notation_debug = false;
var notation_types = "QDBC";

// TODO
// XXX Feedback sauvegarde

function trunc(x) {
    return Number(x.toFixed(3));
}

function NotationGrade(txt) {
    this.comment = '';
    this.stored = '?';
    this.max = 1;
    this.set_comment(txt);
    this.local_change = false;
    this.not_graded = true;
}

NotationGrade.prototype.set_comment = function (value) {
    var g;
    try {
        g = RegExp('^ *([-0-9.]*|[?])[-0-9. ]*/([0-9.]*) *([^]*)').exec(value);
        g = [g[1], g[2], g[1] === '' && g[3] === '' ? this.comment : g[3]];
    }
    catch (e) {
        g = RegExp('^ *([-0-9.]*)([^]*)').exec(value);
        g = [g[1], undefined, g[2] || this.comment];
    }
    var error = this.set_grade(g[0], g[1]);
    this.local_change |= this.old_value != value;
    this.not_graded &= !this.local_change;
    this.comment = g[2];
    this.old_value = value;
    return error;
};

NotationGrade.prototype.uncompress_comment = function () {
    var questions = this.question.notation.questions;
    this.comment = this.comment.replace(/{{{([^}]*)}}}/g,
        function (comment_id) {
            the_id = comment_id.substr(3, comment_id.length - 6);
            if (questions[the_id] === undefined)
                return comment_id;
            return questions[the_id].question;
        });
};

NotationGrade.prototype.set_grade = function (value, max) {
    var old_stored = this.stored;
    var error;
    if (value !== '?' && (isNaN(value) || value === ''))
        value = this.stored;
    if (isNaN(max) || max === '')
        max = this.max;
    this.max = Math.max(0.1, Math.min(100, max));
    if (this.max != max)
        error = "MSG_notation_max_error";
    if (value === '?')
        this.stored = '?';
    else
        this.stored = Math.max(this.min === undefined ? -99999 : this.min,
            Math.min(this.max, value));
    if (this.stored != value)
        error = "MSG_notation_value_error";
    if (value === '?')
        this.grade = '?';
    else
        this.grade = this.stored / this.max;
    this.local_change |= old_stored != this.stored;
    this.not_graded &= !this.local_change;
    return error;
};

NotationGrade.prototype.toJSON = function () {
    var comment = this.comment;
    for (var question_id in this.question.notation.questions) {
        var question = this.question.notation.questions[question_id];
        if (question.is_a_comment())
            comment = comment.replace(question.question, '{{{' + question_id + '}}}');
    }
    return (this.stored + "/" + this.max + " " + comment).trim();
};

function NotationQuestion(dict) {
    this.question = "";
    this.max = 1;
    this.steps = 2;
    this.type = 0;
    this.comment_size = 1; // Minimum number of line for comments

    if (dict.substr) {
        g = RegExp('([^ ]*) ([0-9]*)([' + notation_types
            + '])([0-9.]*) (.*)').exec(dict);
        if (g.length != 6)
            alert("Can not parse: " + dict);
        this.id = g[1];
        this.steps = Number(g[2]);
        this.type = myindex(notation_types, g[3]);
        this.max = Number(g[4]);
        this.question = g[5];
    }
    else {
        for (var key in dict)
            this[key] = dict[key];
    }
    this.initial_value = this.hash();
    this.stats = new Stats();
    this.set_grade();
}

NotationQuestion.prototype.toJSON = function () {
    return this.id + ' ' + this.steps + notation_types.substr(this.type, 1)
        + this.max + ' ' + this.question;
};

NotationQuestion.prototype.hash = function () {
    return this.question + this.max + this.steps + this.type;
};

notation_min_digits = { 1: 0, 2: 1, 4: 2, 5: 1, 10: 1, 20: 2, 25: 2, 50: 2, 100: 2 };

NotationQuestion.prototype.nice_grade = function (v, steps) {
    if (v === undefined) {
        if (this.grade.grade === '?')
            return '?';
        v = this.grade.grade * this.max;
    }
    if (steps === undefined)
        steps = this.steps;
    var i = notation_min_digits[steps];
    if (i === undefined)
        i = 3;
    for (; i < 3; i++) {
        var x = v * Math.pow(10, i);
        if (Math.abs(x - Math.round(x)) < 0.0001)
            break;
    }
    return v.toFixed(i);
};

NotationQuestion.prototype.grade_and_comment = function () {
    var v = '       ' + this.nice_grade();
    v = v.substr(v.length - 7, 7); // Right justify
    return v + '/' + this.max + ' ' + this.grade.comment;
};

NotationQuestion.prototype.set_grade = function (txt) {
    var not_graded = !txt || txt.substr(0, 1) === '?';
    if (!txt) {
        if (this.is_a_question())
            txt = "?/" + this.max;
        else
            txt = "0/" + this.max;
    }
    this.new_grade(txt, not_graded);
};

NotationQuestion.prototype.new_grade = function (txt, not_graded) {
    this.grade = new NotationGrade(txt);
    this.grade.question = this;
    this.grade.not_graded = not_graded;
    this.set_min();
};

NotationQuestion.prototype.set_min = function () {
    if (this.is_a_bonus())
        this.grade.min = -this.grade.max;
    else
        this.grade.min = 0;
}

NotationQuestion.prototype.remove_grade = function () {
    if (this.grade.not_graded)
        return;
    this.stats.remove(this.grade.grade);
};

NotationQuestion.prototype.set_grade_to = function (value) {
    this.remove_grade();
    this.grade.set_grade(this.nice_grade(value), this.max);
    if (this.grade.grade != '?') {
        this.grade.not_graded = false;
        this.stats.add(this.grade.grade);
    }
    else
        this.grade.not_graded = true;
};

NotationQuestion.prototype.html = function (modifiable, questions_modifiable) {
    var q, comment;
    var q_class = "question";
    var c_class = "comment_input";
    if (this.is_fully_empty_question()) {
        q = _("MSG_notation_question");
        q_class += ' empty';
        comment = _("MSG_notation_comment");
        c_class += ' empty';
    }
    else {
        q = this.question;
        comment = this.grade_and_comment();
    }
    var textarea = document.getElementById(this.id);
    var style = '';
    if (textarea)
        style = ' style="height:'
            + textarea.getElementsByTagName('TEXTAREA')[0].style.height
            + '"';
    // XXX BAD
    return '<div id="' + this.id + '" class="type' + this.type + '">'
        + '<input value="' + encode_value(q) + '"'
        + ' class="' + q_class + '"'
        + ' onpaste="Notation.on_paste(event)"'
        + ' ondrop="Notation.on_paste(event)"'
        + ' onfocus="Notation.on_focus(event)"'
        + ' spellcheck="true"'
        + (modifiable ? '' : ' disabled')
        + '><div class="bonus_comment">'
        + (questions_modifiable
            ? hidden_txt('<span class="bonus">Ⓑ</span>', _('TIP_bonus_toggle'))
            : '<span class="bonus not_modifiable">Ⓑ</span>'
        )
        + (questions_modifiable
            ? '<span class="move_up">↑</span><span class="move_down">↓</span>'
            : '')
        + '</div><canvas tabindex="0" onfocus="Notation.on_focus(event)"></canvas>'
        + '<div class="incdec">'
        + (questions_modifiable
            ? '<span class="inc">⊕</span><br><span class="dec">⊖</span>'
            : '&nbsp;<br>&nbsp;')
        + '</div>'
        + '<textarea'
        + (modifiable ? '' : ' disabled')
        + ' onpaste="Notation.on_paste(event)"'
        + ' ondrop="Notation.on_paste(event)"'
        + ' onfocus="Notation.on_focus(event)"'
        + ' rows="' + (this.comment_size + 1) + '"'
        + style // override rows if user resized
        + ' spellcheck="true"'
        + ' class="' + c_class + '">' + html(comment) + '</textarea>'
        + (false && notation_debug
            ? '<br>' + this.id
            + ' priority=' + this.priority
            + ' initial_value=' + this.initial_value
            + ' somebody_is_graded=' + this.somebody_is_graded()
            + ' questions_modifiable=' + questions_modifiable
            : '')
        + '</div>';
};

NotationQuestion.prototype.suivi = function () {
    if (this.is_a_bonus() && this.grade.stored == 0 && this.grade.comment === '')
        return '';
    return '<tr><td style="text-align:right">'
        + (this.is_a_question()
            ? this.nice_grade() + '/' + this.grade.max
            : (this.grade.stored > 0 ? '+' : '') + this.nice_grade())
        + '<td>' + html(this.question)
        + (this.grade.comment !== ''
            ? '<br><em>' + html(this.grade.comment).replace(/\n/g, '<br>') + '</em>'
            : '')
        + '</tr>';
};

NotationQuestion.prototype.suivi_modifiable = function () {
    if (this.is_a_bonus())
        return '';
    return '<tr><td>' + _('MSG_T_on') + this.grade.max
        + '<td>' + html(this.question).replace(/⏎/g, '<br>')
        + '<br><textarea info="' + this.id
        + '" rows="' + Math.max(3, this.grade.comment.split('\n').length)
        + '" onblur="notation_save_textarea(this)">'
        + html(this.grade.comment) + '</textarea>'
        + '</tr>';
};

NotationQuestion.prototype.set_comment = function (value, column_modifiable) {
    this.remove_grade();
    var error = this.grade.set_comment(value);
    if (this.max != this.grade.max && !column_modifiable)
        error = "MSG_notation_not_allowed";
    else {
        this.max = this.grade.max;
        this.set_min();
        if (this.grade.grade != '?')
            this.stats.add(this.grade.grade);
    }

    return error;
};

/*
max = 1.2 steps = 2
  -1       -0.5        0        0.5        1        1.5        2
---|---------|---------|---------|---------|---------|---------|
.  |                   |                   |            .      |
.                                                       .
x_min=-1.2             <--span-->                       x_max=1.2 + 1/2
*/

NotationQuestion.prototype.span = function () {
    return 1 / this.steps;
};
NotationQuestion.prototype.x_min = function () {
    return this.is_a_bonus() ? -this.max : 0;
};
NotationQuestion.prototype.x_max = function () {
    return this.max + this.span();
};
NotationQuestion.prototype.floor = function (x) {
    return Math.floor(x * this.steps) / this.steps;
};
NotationQuestion.prototype.ceil = function (x) {
    return Math.ceil(x * this.steps) / this.steps;
};
NotationQuestion.prototype.get_value01 = function (x) {
    return (x - this.x_min()) / (this.x_max() - this.x_min());
};
NotationQuestion.prototype.x2pixel = function (canvas, x) {
    return this.get_value01(x) * canvas.width;
};

NotationQuestion.prototype.draw_canvas = function () {
    var canvas = document.getElementById(this.id);
    if (!canvas)
        return; // deleted question
    canvas = canvas.getElementsByTagName('CANVAS')[0];
    if (!canvas)
        return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    var c = canvas.getContext("2d");
    var THIS = this;

    function line(x1, y1, x2, y2) {
        c.beginPath();
        c.moveTo(THIS.x2pixel(canvas, x1), canvas.height * y1);
        c.lineTo(THIS.x2pixel(canvas, x2), canvas.height * y2);
        c.closePath();
        c.stroke();
    }
    if (this.grade.not_graded) {
        c.fillStyle = "#FFF";
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
    else if (this.grade.grade < -1 || this.grade.grade > 1) {
        c.fillStyle = "#F88";
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
    else {
        c.fillStyle = '#' + ["F44", "DA4", "888", "AD4", "4F4", "4F4"][
            Math.floor(5 * this.get_value01(this.grade.grade * this.max))];
        c.fillRect(this.x2pixel(canvas, this.grade.grade * this.max), 0,
            this.x2pixel(canvas, this.x_min() + this.span()), canvas.height);
    }
    for (var x = this.ceil(this.x_min()); x <= this.floor(this.x_max()); x += this.span()) {
        line(x, 0, x, Math.abs(x % 1.) < 0.001 ? 1 : 0.5);
    }
    c.fillStyle = "#000";
    c.font = "10px sans";
    for (var x = Math.floor(this.x_min()); x <= Math.ceil(this.x_max()); x++)
        c.fillText(x, this.x2pixel(canvas, x) + 2, canvas.height - 1);
    c.strokeStyle = "#000";
    line(this.x_min(), 0, this.x_max(), 0);
    if (this.stats.nr >= 5) {
        var avg = this.stats.average() * this.max;
        var stddev = this.max * this.stats.standard_deviation() / 2;
        if (this.max_graded == this.stats.nr)
            c.fillStyle = c.strokeStyle = "#44F";
        else
            c.fillStyle = c.strokeStyle = "#0FF";
        line(avg - stddev, 0.2, avg + stddev, 0.2);
        c.beginPath();
        c.arc(this.x2pixel(canvas, avg), canvas.height / 5, canvas.height / 6, 0, 2 * Math.PI);
        c.closePath();
        c.fill();
    }
};

NotationQuestion.prototype.is_a_question = function () {
    return this.type === 0;
};

NotationQuestion.prototype.is_a_bonus = function () {
    return this.type === 2;
};

NotationQuestion.prototype.is_a_comment = function () {
    return this.type === 3;
};

NotationQuestion.prototype.is_a_question_or_bonus = function () {
    return this.is_a_question() || this.is_a_bonus();
};

NotationQuestion.prototype.is_an_empty_question = function () {
    return this.is_a_question() && this.question === '';
};

NotationQuestion.prototype.is_not_an_empty_question = function () {
    return this.is_a_question() && this.question !== '';
};

NotationQuestion.prototype.is_not_an_empty_bonus = function () {
    return this.is_a_bonus() && this.question !== '';
};

NotationQuestion.prototype.is_fully_empty_question = function () {
    return this.is_an_empty_question()
        && (this.grade.grade === 0 || this.grade.grade === '?')
        && this.grade.comment === '';
};

NotationQuestion.prototype.somebody_is_graded = function () {
    return this.stats.nr != 0;
};

function Notation() {
}

Notation.prototype.log = function (txt) {
    if (notation_debug)
        console.log(txt);
};

Notation.prototype.start = function () {
    if (this.notation_window_open)
        return;
    this.notation_window_open = true;
    this.jump_old = the_current_cell.jump.bind(the_current_cell);
    this.shortcuts = {};
    the_current_cell.jump = this.jump.bind(this);
    this.init(the_current_cell.column);
    create_popup(
        'notation_content',
        '<style>'
        + 'DIV.notation_content { border: 2px solid black; top: 10em ; right: 1em; bottom: 0px; left: 25%; padding: 0px }'
        + 'DIV.notation_content .the_completions, DIV.notation_content .the_questions {'
        + '    position: absolute; top: 3em; bottom: 0px; overflow-x: hidden; overflow-y: scroll }'
        + 'DIV.notation_content .the_completions { left:60%; right: 0px ; }'
        + 'DIV.notation_content .the_questions { right: 40%; left: 0px ; }'
        + 'DIV.notation_content .empty { color: #888 }'
        + 'DIV.notation_content INPUT { font-size: 100%; background: #EEE; border: none }'
        + 'DIV.notation_content TEXTAREA { font-size: 100%; background: initial; border: none }'
        + 'DIV.notation_content INPUT.question { width: 60% ; font-weight: bold }'
        + 'DIV.notation_content *:focus { background: #FFF }'
        + 'DIV.notation_content .comment_input { width: 100% ; display: block; margin-top:0.5em ; margin-bottom: 0.5em; }'
        + 'DIV.notation_content CANVAS { position: absolute; left: 67% ; width: 30% ; height: 1.4em ; opacity: 0.5 ; cursor: pointer }'
        + 'DIV.notation_content .incdec { left: 97% ; text-align: center; width: 3% }'
        + 'DIV.notation_content .bonus_comment { left: 60%; right: 33% }'
        + 'DIV.notation_content .incdec { line-height: 0.8em }'
        + 'DIV.notation_content .incdec, DIV.notation_content .bonus_comment {'
        + '   display: inline-block; position: absolute ; }'
        + 'DIV.notation_content .incdec, DIV.notation_content .bonus_comment, .edit_comment {cursor: pointer }'
        + '.edit_comment { font-family: emoji }'
        + 'DIV.notation_content .focus CANVAS { opacity: 1 }'
        + 'DIV.notation_content .incdec, .bonus_comment .bonus,'
        + '.bonus_comment .move_up, .bonus_comment .move_down { opacity:0 ; }'
        + '.bonus_comment .bonus, .bonus_comment .move_up, .bonus_comment .move_down'
        + ' { width: 33%; display: inline-block; text-align: center }'
        + '.notation_shortcut { width: 1em; display: inline-block; text-align: right }'
        + 'DIV.notation_content H1 { position: relative ; height: 1.5em}'
        + 'DIV.type2 .bonus { color: #00F }'
        + 'DIV.notation_content .a_completion { border: 1px solid #888; display: block; margin: 4px ; white-space: normal; font-size: 80% }'
        + 'DIV.notation_content .a_completion:hover { background: #FFF }'
        + 'DIV.notation_content .stat { color: #888 ; margin: 0.2em }'
        + '#the_questions P { margin-top: 0.5em ; font-weight: bold }'
        + '#notation_student { }'
        + '#notation_column { position: absolute ; right: 4em;}'
        + '#notation_grade {  }'
        + 'DIV.notation_content .focus DIV.incdec, DIV.notation_content .focus DIV.bonus_comment *, DIV.notation_content .type2 .bonus_comment .bonus { opacity: 1 }'
        + 'DIV.notation_introduction { background: #FFE }'
        + '</style>'
        + '<h1>'
        + '<span id="notation_column">' + html(this.column.title) + '</span>'
        + '<span id="notation_student"></span>: '
        + '<span id="notation_grade"></span><br>'
        + '<span id="notation_other"></span>'
        + '<span id="notation_error"></span>'
        + '</h1>',
        '<div id="notation_content"'
        + ' onmouseup="Notation.on_mouse_up(event)"'
        + ' onmousedown="Notation.on_mouse_down(event)"'
        + ' onkeyup="Notation.on_keyup(event)"'
        + ' onkeydown="Notation.on_keydown(event)"'
        + ' onmousemove="Notation.on_mouse_move(event)"'
        + '></div>',
        '', false);
    this.local_priority = 1000;
    this.popup_close = popup_close;
    this.notation_student = document.getElementById("notation_student");
    this.notation_grade = document.getElementById("notation_grade");
    this.notation_content = document.getElementById("notation_content");
    this.notation_error = document.getElementById("notation_error");
    this.notation_other = document.getElementById("notation_other");
    popup_close = this.close.bind(this);
    this.select_current_line();
    this.update_popup();
    this.focus(this.question_list()[0], 2 /* XXX BAD */);
};

Notation.prototype.init = function (column) {
    this.column = column;
    this.column_modifiable = column_change_allowed(column);
    this.parse_questions(column.comment);
    this.scrolltop = 0;
};

Notation.prototype.parse_questions = function (txt) {
    this.log("parse questions");
    var questions;
    try {
        questions = JSON.parse(txt);
    } catch (e) {
        questions = [];
    }
    this.questions = {};
    for (var i in questions) {
        var question = new NotationQuestion(questions[i]);
        question.priority = Number(i);
        question.notation = this;
        this.questions[question.id] = question;
    }
    this.nr_empty_questions_added = 0;
};

Notation.prototype.save_current_line = function () {
    this.log("save_current_line " + (this.line ? this.line[0].value : "?"));
    this.save_questions();
    this.save_grades();
};

Notation.prototype.clear_current_line = function () {
    this.log("clear_current_line");
    this.save_current_line();
    the_current_cell.tr.classList.remove('currentformline');
    this.scrolltop = document.getElementById("the_questions").scrollTop;
};

Notation.prototype.parse_grades = function (txt) {
    var grades;
    try { grades = JSON.parse(txt); }
    catch (e) { grades = {}; }
    var questions = this.questions;
    for (var i in questions) {
        var question = questions[i];
        if (question.is_a_comment())
            continue;
        question.set_grade(grades[i]);
        question.grade.uncompress_comment();
    }
};

Notation.prototype.get_the_commented_line = function (line) {
    if (this.column.groupcolumn === '')
        return line;

    var col = data_col_from_col_title(this.column.groupcolumn);
    if (!col)
        return line;

    var group = line[col].value.toString();
    if (group === '')
        return line;
    var group_lines = [];
    for (var line_key in lines) {
        if (lines[line_key][col].value.toString() == group
            && lines[line_key][this.column.data_col].comment !== '')
            group_lines.push(lines[line_key]);
    }
    if (group_lines.length > 1) {
        var message = _("ALERT_notation_conflict") + '\n';
        for (var i in group_lines)
            message += group_lines[i][0].value + ' ' + group_lines[i][1].value
                + ' ' + group_lines[i][2].value + '\n';
        alert(message);
        return group_lines[0];
    }
    return group_lines.length ? group_lines[0] : line;
};

Notation.prototype.init_cell = function (line) {
    this.line = this.get_the_commented_line(line);
    this.cell = this.line[this.column.data_col];
    this.parse_grades(this.cell.comment);
    this.modifiable = this.cell
        && this.cell.changeable(this.line, this.column) === true;
};

Notation.prototype.select_current_line = function () {
    this.log("select_current_line " + the_current_cell.line[0].value);
    the_current_cell.tr.classList.add('currentformline');
    this.init_cell(the_current_cell.line);
    this.notation_error.innerHTML = "";
    this.notation_student.innerHTML = html(this.line[0].value)
        + ' ' + html(this.line[1].value) + ' ' + html(this.line[2].value);
    if (this.line != the_current_cell.line)
        this.notation_other.innerHTML = '→ '
            + html(the_current_cell.line[1].value) + ' '
            + html(the_current_cell.line[2].value) + ' ';
    else
        this.notation_other.innerHTML = '';
};

Notation.prototype.question_list = function (with_deleted) {
    var questions = [];
    for (var i in this.questions)
        if (this.questions[i].is_a_question_or_bonus()
            || with_deleted
        )
            questions.push(this.questions[i]);
    this.sort_questions(questions);
    return questions;
};

Notation.prototype.jump = function (lin, col, do_not_focus, line_id, data_col) {
    this.log("jump");
    this.clear_current_line();
    this.jump_old(lin, col, do_not_focus, line_id, data_col);
    this.select_current_line();
    this.update_popup();
    if (!this.jump_from_notation)
        this.stop_event = false;
};

Notation.prototype.update_all_grades = function () {
    this.log("update_all_grades");
    var cell, v, answer;
    var save = this.column.min;
    this.column.min = -1e9;
    for (var line_id in lines) {
        cell = lines[line_id][this.column.data_col];
        if (cell.comment === '')
            continue;
        this.parse_grades(cell.comment);
        if (!this.fully_graded())
            continue;
        v = this.get_grade() + this.get_bonus();
        if (answer === undefined && v < save)
            answer = confirm(_('ALERT_record_negative'));
        if (v !== cell.value) {
            if(v < save && ! answer )
                v = save;
            cell_set_value_real(line_id, this.column.data_col, v.toString());
            update_line(line_id, this.column.data_col);
        }
    }
    this.column.min = save;
};

Notation.prototype.close = function () {
    this.log("close");
    if (this.cancel_save)
        this.cancel_save = false;
    else
        this.clear_current_line();

    the_current_cell.jump = this.jump_old;
    popup_close = this.popup_close;
    popup_close();
    this.update_all_grades();
    table_fill(true, true, true, true);
    this.notation_window_open = false;
};

Notation.prototype.merge_question_changes = function () {
    var current = this.questions;
    var current_sorted = this.question_list();
    this.parse_questions(this.column.comment);
    var remotes = this.question_list(true);
    this.questions = current;
    this.log("Merge before: " + JSON.stringify(this.questions));
    this.log("Merge remote: " + JSON.stringify(remotes));
    current = this.question_list(true);
    var done = {};
    for (var i in remotes) {
        var remote = remotes[i];
        var local = this.questions[remote.id];
        done[remote.id] = true;
        if (!local) {
            this.log('New question from somebody: ' + remote.id);
            this.questions[remote.id] = remote;
        }
        else if (local.initial_value == local.hash()) {
            this.log('Not changed by local user: ' + remote.id);
            remote.grade = this.questions[remote.id].grade; // Keep grades
            this.questions[remote.id] = remote;
            this.questions[remote.id].priority = local.priority;
        }
        else {
            this.log('Changed by local user: ' + remote.id);
            this.log('initial_hash: ' + local.initial_value);
            this.log('current hash: ' + local.hash());
            this.questions[remote.id].priority = local.priority;
        }
    }
    // Only local questions
    for (var i in current_sorted)
        if (!done[current_sorted[i].id]
            && !this.is_the_last(current_sorted[i]))
            current_sorted[i].priority = this.local_priority++;

    this.log("Merge after: " + JSON.stringify(this.questions));
};

Notation.prototype.save_questions = function () {
    if (!this.column_modifiable)
        return;
    this.log("save questions");
    this.merge_question_changes();
    var questions = [];
    for (var question in this.questions) {
        question = this.questions[question];
        if (!this.is_the_last(question)) {
            questions.push(question);
            question.initial_value = question.hash();
        }
    }
    this.sort_questions(questions);
    var v = JSON.stringify(questions);
    this.log("save questions old: " + this.column.comment);
    this.log("save questions new: " + v);
    if (v != this.column.comment) {
        column_attr_set(this.column, 'comment', v);
        column_attr_set(this.column, 'minmax', '[0;' + this.maximum() + ']');
        the_current_cell.do_update_column_headers = true;
        the_current_cell.update_column_headers();
    }
};

Notation.prototype.is_the_last = function (question) {
    if (question.question !== '')
        return false;
    var questions = this.question_list();
    return question == questions[questions.length - 1];
};


Notation.prototype.merge_grade_changes = function () {
    var grades;
    try { grades = JSON.parse(this.cell.comment); }
    catch (e) { return; }
    this.log("Remote: " + this.cell.comment);
    for (var grade in grades) {
        var question = this.questions[grade];
        if (!question)
            continue;
        if (question.grade.not_graded || !question.grade.local_change) {
            this.log("Merge remote grade: " + grade);
            question.new_grade(grades[grade]);
        }
        else
            this.log("Keep local grade: " + grade);
    }
    for (var i in this.questions) {
        var question = this.questions[i];
        if (!question.grade.local_change && grades[question.id] === undefined) {
            this.log("Remote grade removed: " + question.id);
            if (question.is_a_question())
                question.grade.set_grade('?');
            else
                question.grade.set_grade(0);
        }
    }
};

Notation.prototype.get_json_grades = function () {
    var grades = {};
    for (var i in this.questions) {
        var question = this.questions[i];
        if (question.grade.not_graded && question.grade.comment === '')
            continue;
        if (question.is_a_comment() && question.grade.grade === 0)
            continue;
        grades[i] = question.grade;
    }
    return JSON.stringify(grades);
};

Notation.prototype.save_grades = function () {
    if (!this.modifiable)
        return;
    this.log("save student");
    this.merge_grade_changes();
    var v = this.get_json_grades();
    if (v == '{}')
        v = '';
    this.log("Old: " + this.cell.comment);
    this.log("New: " + v);
    if (v != this.cell.comment) {
        if (this.column.modifiable == 2) {
            alert(_("MSG_annotate_not_allowed") + '\n' + _("ALERT_column_not_saved"));
            return;
        }
        this.log("Store into " + this.line.line_id + ' ' + this.column.data_col);
        comment_change(this.line.line_id, this.column.data_col, v);
        for (var i in this.questions)
            this.questions[i].grade.local_change = false;
    }
};

Notation.prototype.contain_empty_question = function () {
    this.log("contain_empty_question");
    for (var i in this.questions)
        if (this.questions[i].is_an_empty_question())
            return this.questions[i];
    return false;
};

Notation.prototype.add_empty_question_if_needed = function (txt, max) {
    this.log("add_empty_question_if_needed");
    if (!this.column_modifiable)
        return;
    var empty = this.contain_empty_question();
    if (empty)
        return empty;
    var id = this.unused_id();
    this.questions[id] = new NotationQuestion(
        { id: id, priority: 9999 + this.nr_empty_questions_added / 1000 });
    this.questions[id].notation = this;
    this.nr_empty_questions_added++;
    if (txt)
        this.questions[id].question = txt;
    switch (max) {
        case _("MSG_Bonus").toLowerCase():
            this.questions[id].type = 2;
            this.questions[id].max = 5;
            break;
        case undefined:
            break;
        default:
            this.questions[id].max = Number(max.replace('±', ''));
            if (max.substr(0, 1) == '±')
                this.questions[id].type = 2;
            break;
    }

    if (this.notation_error) {
        this.notation_error.innerHTML = '';
        this.update_error();
    }

    return this.questions[id];
};

Notation.prototype.maximum = function () {
    var sum = 0;
    for (var i in this.questions)
        if (this.questions[i].is_not_an_empty_question())
            sum += this.questions[i].max;
    return trunc(sum);
};

Notation.prototype.get_grade = function () {
    var sum = 0;
    for (var i in this.questions)
        if (this.questions[i].is_not_an_empty_question()
            && this.questions[i].grade.grade !== '?'
        )
            sum += this.questions[i].grade.grade * this.questions[i].max;
    return trunc(sum);
};

Notation.prototype.fully_graded = function () {
    for (var i in this.questions)
        if (this.questions[i].is_not_an_empty_question()
            && this.questions[i].grade.not_graded)
            return false;
    return true;
};

Notation.prototype.get_bonus = function () {
    var sum = 0;
    for (var i in this.questions)
        if (this.questions[i].is_not_an_empty_bonus(i)
            && this.questions[i].grade.stored != '?')
            sum += this.questions[i].grade.stored;
    return trunc(sum);
};

Notation.prototype.focus = function (question, what) {
    if (!question)
        return;
    this.log("focus " + question.id + ' what=' + what);
    var e = document.getElementById(question.id);
    if (!e || !e.childNodes)
        return;
    if (!this.modifiable)
        what = 2; // XXX BAD
    if (what != -1)
        e = e.childNodes[what];
    e.focus();
};

Notation.prototype.is_an_empty_value = function (value) {
    return value === '' || value == _("MSG_notation_question")
        || value == _("MSG_notation_comment");
};

Notation.prototype.is_active = function (value) {
    return !!document.getElementById("the_questions");
};

Notation.prototype.queue_update_completion = function (event) {
    var t = this;
    setTimeout(function () { t.update_completions(event); }, 100);
};

Notation.prototype.on_focus = function (event) {
    if (!this.is_active())
        return; // closed
    this.log("on_focus");
    event = this.get_event(event);
    if (this.old_focused)
        this.old_focused.classList.remove('focus');
    this.old_focused = event.line;
    event.line.classList.add('focus');
    if (this.is_an_empty_value(event.target.value)) {
        event.target.value = '';
        event.target.classList.remove("empty");
        return;
    }
    if (event.target.tagName == 'TEXTAREA' && millisec() - this.keyboard_focus < 100) {
        var i = myindex(event.target.value, '/')
        if (i != -1)
            set_selection(event.target, 0, i);
        // Not now because the cursor position is not yet correct.
        this.queue_update_completion(event);
    }
};

Notation.prototype.update_title = function () {
    this.log("update title");
    var s = this.get_grade() + '/' + this.maximum();
    var b = this.get_bonus();
    if (b)
        s += ' → ' + trunc(this.get_grade() + this.get_bonus()) + 'Ⓑ/' + this.maximum();
    this.notation_grade.innerHTML = s;
};

Notation.prototype.sort_questions = function (questions) {
    // JS dictionary order is random
    questions.sort(function (a, b) { return a.priority - b.priority; });
};

function get_scroll_size(e) {
    try { return e.lastChild.offsetTop + e.lastChild.offsetHeight; }
    catch (e) { return 1; }
}

Notation.prototype.update_popup = function () {
    this.log("update");
    var i;
    this.add_empty_question_if_needed();
    this.compute_stats();
    this.update_title();
    var questions = [];
    for (i in this.questions)
        if (this.questions[i].is_a_question_or_bonus())
            questions.push(this.questions[i]);
    this.sort_questions(questions);
    var s = [];
    s.push('<div id="the_questions" class="the_questions">');
    for (i in questions)
        s.push(questions[i].html(this.modifiable, this.column_modifiable));
    s.push('<div class="notation_introduction">');
    s.push(_("MSG_notation_introduction"));
    s.push('</div>');
    s.push('</div>');
    s.push('<div class="the_completions" id="the_completions"></div>');

    questions = [];
    for (i in this.questions)
        if (this.questions[i].is_a_comment())
            questions.push(this.questions[i]);
    questions.sort(function (a, b) {
        return a.question < b.question
            ? -1
            : (a.question > b.question ? 1 : 0);
    });
    this.notation_content.innerHTML = s.join('');
    document.getElementById("the_questions").scrollTo(0, this.scrolltop);
    this.the_completions = document.getElementById("the_completions");
    for (i in this.questions)
        if (this.questions[i].is_a_question_or_bonus())
            if (this.questions[i].is_a_question_or_bonus())
                this.questions[i].draw_canvas();
};

Notation.prototype.unused_id = function () {
    this.log("unused_id");
    var used_ids = {};
    for (var i in this.questions)
        used_ids[this.questions[i].id] = true;
    for (var i = 0; ; i++)
        if (!used_ids[page_id + '_' + i])
            return page_id + '_' + i;
};

Notation.prototype.get_event = function (event) {
    last_user_interaction = millisec();
    event = the_event(event);
    event.line = event.target;
    while (!event.line.id)
        event.line = event.line.parentNode;
    event.question = this.questions[event.line.id];
    event.what = '';
    if (event.question && event.line.childNodes.length >= 5
        && event.line.childNodes[2].tagName == 'CANVAS'
    ) // XXX BAD
    {
        // On a question line
        event.question_input = event.line.childNodes[0]; // XXX BAD
        event.canvas = event.line.childNodes[2]; // XXX BAD
        event.comment_input = event.line.childNodes[4]; // XXX BAD
        event.child_nr = myindex(event.line.childNodes, event.target);
        switch (event.target) {
            case event.question_input: event.what = 'question'; break;
            case event.canvas: event.what = 'canvas'; break;
            case event.comment_input: event.what = 'comment'; break;
        }
    }
    else {
        event.child_nr = -1;
        if (event.target.className == 'stat')
            event.target = event.target.parentNode;
    }
    if (event.what === '')
        event.what = event.target.className.split(' ')[0];
    return event;
};

Notation.prototype.on_mouse_move = function (event, force) {
    event = this.get_event(event);
    if (!force && event.what != 'canvas')
        return;
    if (!event.question)
        return;
    if (this.button_pressed_on != event.question.id)
        return;
    if (!this.modifiable)
        return;

    if (event.what == 'canvas' && event.question.question !== "") {
        // -4 because of borders
        var x = (event.x - findPosX(event.target) - 4) / event.target.offsetWidth;
        x = x * (event.question.x_max() - event.question.x_min()) + event.question.x_min();
        x = event.question.floor(x);
        event.question.set_grade_to(x);
        if (event.comment_input)
            event.comment_input.value = event.question.grade_and_comment();
    }
    event.question.draw_canvas();
    this.update_title();
};

Notation.prototype.move = function (question, direction) {
    var questions = this.question_list();
    var i = myindex(questions, question);
    if (direction == 'move_up') {
        if (i == 0)
            return;
        if (i == 1)
            question.priority = questions[i - 1].priority - 1;
        else
            question.priority = (questions[i - 2].priority + questions[i - 1].priority) / 2;
    }
    else {
        if (i == questions.length - 1)
            return;
        if (i == questions.length - 2)
            question.priority = questions[i + 1].priority + 1;
        else
            question.priority = (questions[i + 1].priority + questions[i + 2].priority) / 2;
    }
    this.update_popup();
    var t = this;
    setTimeout(function () { t.focus(question, 0); }, 200);
};

Notation.prototype.insert_completion = function (completion, event) {
    event.target = this.old_focused.childNodes[4]; // XXX BAD
    event.question = this.questions[this.old_focused.id];
    event.comment_input = event.target;
    event.line = this.old_focused;
    completion = completion.replace(/^<[^ ]* /, "");
    event.target.value = this.update_completions(event, completion);
    event.question.grade.comment = event.target.value;
    event.question.grade.local_change = true;
    event.target.value = event.question.grade_and_comment();
    var cursor = event.target.value.indexOf(completion) + completion.length + 1;
    function do_focus() {
        event.target.focus();
        set_selection(event.target, cursor, cursor);
    }
    setTimeout(do_focus, 100);
};

Notation.prototype.on_mouse_down = function (event) {
    this.log("on_mouse_down");
    event = this.get_event(event);
    this.stop_event = true;

    GUI.add("notation_mouse_down", event, event.what);

    if (!event.question) {
        if (event.target.className == 'a_completion') {
            if (this.modifiable)
                this.insert_completion(event.target.textContent.replace(/[^ ]* /, ''), event);
            else
                alert(_("ERROR_value_defined_by_another_user"));
        }
        return;
    }
    this.button_pressed_on = event.question.id;
    if (event.what == 'canvas') {
        event.target.focus();
        this.queue_update_completion(event);
    }
    else {
        if (!this.column_modifiable)
            return;
        switch (event.what) {
            case 'inc':
                event.question.steps = Math.min(event.question.steps + 1, 10);
                event.question.draw_canvas();
                break;
            case 'dec':
                event.question.steps = Math.max(event.question.steps - 1, 1);
                event.question.draw_canvas();
                break;
            case 'bonus':
                if (event.question.is_a_question()) {
                    event.question.type = 2;
                    if (event.question.grade.stored == '?')
                        event.question.grade.stored = 0;
                }
                else if (event.question.is_a_bonus())
                    event.question.type = 0;
                event.line.className = event.line.className.replace(
                    /type[0-9]/, 'type' + event.question.type);
                event.question.set_min();
                break;
            case 'comment':
                this.queue_update_completion(event);
                break;
            case 'move_up':
            case 'move_down':
                this.move(event.question, event.what);
                break;
            case 'edit_comment':
                var v;
                if (event.question.somebody_is_graded())
                    v = prompt(_("MSG_notation_fix_comment"), event.question.question);
                else
                    v = prompt(_("MSG_notation_edit_comment"), event.question.question);
                if (v !== null) {
                    this.save_grades(); // Compress with the old value
                    event.question.question = v;
                    if (v === '' && !event.question.somebody_is_graded())
                        event.question.type = 1;
                    this.init_cell(the_current_cell.line);
                    this.update_popup();
                }
                break;
        }
    }
    if (this.modifiable)
        this.on_mouse_move(event, true);
};

Notation.prototype.on_mouse_up = function (_event) {
    this.log("on_mouse_up");
    this.button_pressed_on = false;
};

Notation.prototype.on_paste = function (event) {
    this.log("on_paste");
    event = this.get_event(event);
    GUI.add("notation_paste", event, event.what);
    var me = this;
    if (event.what == 'comment')
        setTimeout(function () { me.on_comment_change(event); }, 100);
    else if (event.what == 'question')
        setTimeout(function () { me.on_question_change(event); }, 100);
};

Notation.prototype.compute_stats = function () {
    this.global_comments = {};
    this.global_comments_id = {};
    for (var question_id in this.questions) {
        question = this.questions[question_id];
        question.stats = new Stats();
        if (question.is_a_comment()) {
            this.global_comments[question.question] = 0;
            this.global_comments_id[question.question] = question_id;
        }
        question.comments = {};
    }
    this.max_graded = 0;
    for (var line_id in lines) {
        try {
            g = JSON.parse(lines[line_id][this.column.data_col].comment);
        }
        catch (e) { continue; }
        var a_grade = false;
        for (var id in g) {
            var grade = new NotationGrade(g[id]);
            var question = this.questions[id];
            if (question === undefined) {
                console.log(lines[line_id][0].value + ' ' + id + ':' + g[id]);
                continue;
            }
            grade.question = question;
            grade.uncompress_comment();
            if (question.is_a_question() || question.is_a_bonus()) {
                if (grade.stored != '?') {
                    question.stats.add(grade.stored / grade.max);
                    a_grade = true;
                }
                var comments = grade.comment.split(/\n+/);
                question.comment_size = Math.max(question.comment_size,
                    Math.min(10, comments.length));
                for (var i = 0; i < comments.length; i++) {
                    var comment = comments[i];
                    if (comment === '')
                        continue;
                    if (comment.indexOf('{{{') != -1)
                        continue;
                    if (this.global_comments[comment] === undefined)
                        this.global_comments[comment] = 0;
                    this.global_comments[comment]++;

                    if (question.comments[comment] === undefined)
                        question.comments[comment] = [];

                    if (grade.stored != '?') {
                        var gg = grade.stored / grade.max;
                        question.comments[comment].push(gg);
                        if (this.global_comments_id[comment])
                            this.questions[this.global_comments_id[comment]].stats.add(gg);
                    }
                }
            }
            else if (question.is_a_comment()) {
                question.stats.add(1);
                this.global_comments[question.question]++;
            }
        }
        if (a_grade)
            this.max_graded++;
    }
    this.global_comments_sorted = [];
    for (var i in this.global_comments)
        this.global_comments_sorted.push(i);
    this.global_comments_sorted.sort();
    for (var question in this.questions) {
        var sorted_comments = [];
        for (var comment in this.questions[question].comments)
            sorted_comments.push(comment);
        sorted_comments.sort();
        this.questions[question].sorted_comments = sorted_comments;
    }
    for (var question in this.questions)
        this.questions[question].max_graded = this.max_graded;
    // Create new global comments if allowed
    if (!this.column_modifiable)
        return;
    var empty_question = this.add_empty_question_if_needed();
    var created_comments = {};
    for (var i in this.global_comments)
        if (this.global_comments[i] > 1 && !this.global_comments_id[i]
            && i.length > 10 && i.indexOf('{{{') == -1) {
            empty_question.type = 3;
            empty_question.grade.stored = 0;
            empty_question.question = i;
            empty_question = this.add_empty_question_if_needed();
            created_comments[i] = empty_question.id;
        }
    // Change existing comments.
    // Do not use all the framework in order to not modify the current state
    // XXX So it is really not clean...
    if (Object.keys(created_comments).length) {
        var cell, grade, text, new_grades;
        for (var line_id in lines) {
            if (lines[line_id] == this.line)
                continue;
            cell = lines[line_id][this.column];
            if (!this.cell.changeable(cell, this.column))
                continue;
            try { grades = JSON.parse(cell.comment); }
            catch (e) { continue; }
            for (var question_id in grades) {
                grade = grades[question_id].replace(/ */, '');
                text = grades[question_id].substr(value.length);
                if (text !== '') {
                    for (var comment in created_comments)
                        text = text.replace(comment, '{{{' + created_comments[comment] + '}}}');
                    grades[question_id] = (grade + ' ' + text).trim();
                }
            }
            new_grades = JSON.stringify(grades);
            if (new_grades != cell.comment)
                comment_change(line_id, this.column, new_grades);
        }
    }
};

Notation.prototype.update_error = function (error, element) {
    if (error) {
        this.notation_error.style.color = '#F00';
        if (element)
            element.style.color = this.notation_error.style.color;
        this.notation_error.style.fontSize = "100%";
        this.notation_error.innerHTML = _(error);
    }
    else {
        if (element)
            element.style.color = '#000';
        this.notation_error.innerHTML = '';
    }
};

Notation.prototype.on_comment_change = function (event) {
    this.log("on_comment_change " + event.target.value);
    var error = event.question.set_comment(event.target.value,
        this.column_modifiable);
    this.update_error(error, event.target);
    event.question.draw_canvas();
    this.update_title();
    var completion = this.update_completions(event);
    if (event.keyCode != 8 && completion) {
        do_autocompletion(event.target, event.target.value + completion);
        event.question.set_comment(event.target.value, this.column_modifiable);
    }
};

Notation.prototype.toggle_local_completion = function () {
    this.hide_local_completion = !this.hide_local_completion;
    this.update_completions(this.last_event, this.last_replacement);
};

Notation.prototype.update_completions = function (event, replacement) {
    // Cherche la ligne du commentaire à modifier
    var selection = get_selection(event.comment_input);
    var lines = event.comment_input.value.split(/[\r\n]/);
    var current;
    this.last_event = event;
    this.last_replacement = replacement;
    for (var line = 0, length = 0; ; length += lines[line].length + 1, line++)
        if (selection.start < length)
            break;
    line -= 1;
    if (line == 0)
        current = event.question.grade.comment.split('\n')[0];
    else
        current = lines[line];
    if (replacement) {
        if (line !== 0)
            lines[0] = event.question.grade.comment.split('\n')[0];
        lines[line] = replacement + '\n';
        return '\n'.join(lines);
    }
    current = current.toLowerCase();
    var completions = ['<p>', _('MSG_notation_here'),
        ' <span onclick="Notation.toggle_local_completion()" style="font-style:emoji">',
        this.hide_local_completion ? '⊕' : '⊖',
        '</span></p>'];
    var done = {};
    var nb = 0;
    var shortcuts = {};
    this.shortcuts = shortcuts;
    function shortcut() {
        var k = "0123456789BDEFGHIJKLMOPRSU".substr(nb++, 1);
        if (k !== '') {
            shortcuts[k] = comment;
            k = hidden_txt('<b class="notation_shortcut">' + k + '</b>', 'Ctrl+' + k);
        }
        return k;
    }
    if (!this.hide_local_completion)
        for (var comment in event.question.sorted_comments) {
            comment = event.question.sorted_comments[comment];
            if (comment.substr(0, current.length).toLowerCase() == current) {
                var grades = event.question.comments[comment];
                grades.sort(function (a, b) { return a - b; });
                var m = event.question.grade.max;
                var min = event.question.nice_grade(m * grades[0]);
                var max = event.question.nice_grade(m * grades[grades.length - 1]);
                var g;
                if (min != max)
                    g = min + ';' + max;
                else
                    g = min;
                g = g.toString();
                if (g == 'NaN')
                    g = '';
                completions.push('<div class="a_completion">' + shortcut()
                    + '<span class="stat">['
                    + g + ']</span>'
                    + (this.column_modifiable && this.global_comments_id[comment]
                        ? '<span class="edit_comment" id="'
                        + this.global_comments_id[comment] + '">✍</span>'
                        : '')
                    + ' ' + html(comment) + '</div>');
                done[comment] = 1;
            }
        }
    completions.push('<p>' + _('MSG_notation_other') + '</p>');

    for (var comment in this.global_comments_sorted) {
        comment = this.global_comments_sorted[comment];
        if (comment.substr(0, current.length).toLowerCase() == current)
            completions.push('<div class="a_completion">' + shortcut()
                + '<span class="stat">'
                + this.global_comments[comment]
                + '</span>'
                + (this.column_modifiable && this.global_comments_id[comment]
                    ? '<span class="edit_comment" id="'
                    + this.global_comments_id[comment] + '">✍</span>'
                    : '')
                + ' ' + html(comment) + '</div>');
    }
    this.the_completions.innerHTML = completions.join("");
    if (completions.length == 1)
        return completions[0].split("</span> ")[1]
            .split("<")[0]
            .substr(current.length);
};

Notation.prototype.on_question_change = function (event) {
    this.log("on_question_change " + event.target.value);
    event.question.question = event.target.value;
    if (this.is_the_last(event.question) && event.question.question !== '')
        event.question.priority = this.local_priority++;
};

Notation.prototype.on_keydown = function (event) {
    event = this.get_event(event);
    if (event.keyCode == 27 // Escape
        && !confirm(_("ALERT_notation_save")))
        this.cancel_save = true;

    if (event.ctrlKey) {
        if (event.keyCode == 38) {
            this.move(event.question, "move_up");
            stop_event(event);
            return;
        }
        else if (event.keyCode == 40) {
            this.move(event.question, "move_down");
            stop_event(event);
            return;
        }
        else {
            var completion = this.shortcuts[String.fromCharCode(event.keyCode)];
            if (completion) {
                this.insert_completion(completion, event);
                stop_event(event);
                return;
            }
        }
    }

    if (event.keyCode == 13
        || event.keyCode == 38
        || event.keyCode == 40
        || event.keyCode == 33
        || event.keyCode == 34
        || ((event.keyCode == 37 || event.keyCode == 39)
            && event.what == 'canvas')
    ) {
        if (event.target.tagName == 'TEXTAREA') {
            this.keydown_selection = get_selection(event.target);
            if (event.keyCode == 13 && this.column_modifiable && !this.contain_empty_question()) {
                this.update_popup();
                var t = this;
                function focus_on_last() {
                    var questions = t.question_list();
                    t.focus(questions[questions.length - 1], 0); // XXX BAD
                };
                setTimeout(focus_on_last, 100);
            }
            return;
        }
        stop_event(event);
    }
};

Notation.prototype.on_keyup = function (event) {
    event = this.get_event(event);
    if (event.question === undefined)
        return;
    if (event.ctrlKey)
        return;
    this.log("keyup what=" + event.what + ' question=' + event.question.id
        + " keycode=" + event.keyCode);
    var questions = this.question_list();
    var question_index = myindex(questions, event.question);
    if (event.keyCode <= 40 && event.keyCode != 37 && event.keyCode != 39)
        GUI.add_key(event, "notation_key");

    this.keyboard_focus = millisec();
    switch (event.keyCode) {
        case 38: // Cursor up
        case 40: // Cursor down
        case 13: // Return
            if (event.what == 'comment') {
                if (event.keyCode == 38 && this.keydown_selection.end == 0
                    || event.keyCode == 40 && this.keydown_selection.start == event.target.value.length
                    || event.keyCode != 13 && this.keydown_selection.start == 0 && this.keydown_selection.end
                ) {
                }
                else {
                    this.update_completions(event);
                    break;
                }
            }
            if (event.what == 'question') {
                if (!this.contain_empty_question())
                    this.update_popup();
            }
            questions = this.question_list();
            this.focus(questions[question_index + (event.keyCode == 38 ? -1 : 1)],
                event.child_nr);
            stop_event(event);
            break;
        case 37: // Cursor left
        case 39: // Cursor right
            if (event.what == 'canvas' && event.question.question !== "") {
                if (!this.modifiable)
                    break;
                var x = event.question.grade.grade;
                if (x === '?')
                    x = (event.keyCode == 37 ? event.question.max : 0);
                else
                    x += (event.keyCode == 37 ? -1 : 1)
                        * 1 / (event.question.max * event.question.steps);
                event.question.set_grade_to(x * event.question.max);
                event.comment_input.value = event.question.grade_and_comment();
                event.question.draw_canvas();
                this.update_title();
            }
            break;
        case 34: // Next page
        case 33: // Previous page
            this.jump_from_notation = true;
            if (event.keyCode == 34)
                the_current_cell.cursor_down();
            else
                the_current_cell.cursor_up();
            this.jump_from_notation = false;
            setTimeout(function () {
                Notation.focus(event.question, event.child_nr);
            }, 100);
            break;
        default:
            this.log("keyup default " + event.what);
            if (event.target.value == event.target.old_value)
                break;
            event.target.old_value = event.target.value;
            if (event.what == 'comment')
                this.on_comment_change(event);
            else if (event.what == 'question')
                this.on_question_change(event);
    }

    if (event.what == 'question' && event.target.value === ''
        && !this.is_the_last(event.question)
    ) {
        if (confirm(_("ALERT_delete_line"))) {
            event.question.type = 1;
            this.update_popup();
        }
    }
};

var notation_suivi_first_time = true;

Notation.prototype.init_style = function () {
    if (notation_suivi_first_time) {
        notation_suivi_first_time = false;
        var style = document.createElement('STYLE');
        style.textContent =
            ".DisplayTypeNotation .DisplayCellValue .tipped .text { display: block }"
            + "TABLE.notation_suivi { border-spacing: 0px }"
            + "TABLE.notation_suivi TD"
            + "      { border: 1px solid #888 ; font-size:120%; vertical-align:top ; }"
            + "DIV#tip.notation_suivi_tip { margin-top: -3em }"
            + 'DIV.notation_suivi_modifiable { right: 0px; top:0px;  bottom: 0px; left: 0px; position: fixed;'
            + '   border: 2px solid black ; overflow:hidden }'
            + '.notation_top > DIV {'
            + '  height: calc(100% - 4em); overflow-x: hidden; margin-bottom: 0.5em;}'
            + '.notation_top { height: 100% ; }'
            + ".notation_top TABLE { border-spacing: 0px 1em; width: calc(100% - 1em) }"
            + "DIV.import_export .notation_top TEXTAREA { margin-bottom: 0.5em; width: calc(100% - 1em) }"
            + '.notation_top TD { vertical-align: top ;}'
            + '.notation_top TD:first-child { width: 1%; padding-right: 1em; white-space: nowrap; opacity: 0.5 }'
            + '.notation_footer { text-align: right }'
            + '.Textual .notation_footer { text-align: left }'
            + '.notation_record { background: #8F8 ; }'
            + '.notation_empty { background: #CCC }'
            + '.notation_feedback, .notation_stats { display: inline-block ; }'
            + '.notation_stats { display: inline-block ; }'
            + '.notation_feedback DIV.feedback { display: inline-block ; }'
            ;
        document.getElementsByTagName('HEAD')[0].appendChild(style);
    }
};

Notation.prototype.suivi = function () {
    var questions = this.question_list();
    this.init_style();
    s = ['<div style="overflow:auto;max-height:20em">', // MUST BE INLINE STYLE !
        '<table class="notation_suivi">'];
    for (var question in questions)
        s.push(questions[question].suivi());
    s.push("</table>");
    var c = [];
    for (var question in this.questions) {
        question = this.questions[question];
        if (question.is_a_comment() && question.grade.stored)
            c.push(html(question.question));
    }
    return s.join("") + c.join('<br>') + '</div>';
};

Notation.prototype.suivi_modifiable = function (key) {
    var questions = this.question_list();
    this.init_style();
    this.key = key;
    s = ['<div class="notation_top" info="', key, '"><div><table>'];
    for (var question in questions)
        s.push(questions[question].suivi_modifiable());
    s.push("</table></div>");
    s.push('<div class="notation_footer">');
    s.push('<div class="notation_feedback"></div>');
    s.push('<button id="notation_record" class="notation_record" onclick="notation_record(this)">' + _("LABEL_MCQ_save") + '</button>');
    s.push(' <div class="notation_stats"></div>');
    s.push('</div></div>');
    return s.join('');
};

Notation.prototype.get_question_from_question = function (question) {
    question = question.toLowerCase().replace(/ /g, ' ').replace(/ +/g, ' ');
    for (var j in this.questions)
        if (this.questions[j].question.toLowerCase().replace(/ /g, ' ').replace(/ +/g, ' ') == question)
            return this.questions[j];
};

Notation.prototype.import_do = function (csv) {
    if (csv.length < 2)
        return "???";
    while (csv[0] === '')
        csv.splice(0, 1);
    var question_texts = csv[0].split(/\t/);
    var questions = [];
    var column = popup_column();
    var messages = "";
    this.nr_empty_questions_added = 0;

    this.init(column)
    for (var i = 3; i < question_texts.length; i += 2) {
        var question = question_texts[i + 1];
        var max = question_texts[i].toLowerCase();
        if (question === undefined)
            return _("ALERT_notation_missing_column");
        var q = this.get_question_from_question(question);
        if (q) {
            if (max == _("MSG_Bonus").toLowerCase())
                max = q.max;
            else
                max = Number(max.replace('±', ''));
            if (isNaN(max))
                return q.question + "\n" + max + ' isNaN';
            if (q.max != max)
                return q.question + "\n" + q.max + ' != ' + max;
        }
        else {
            q = this.add_empty_question_if_needed(question, max);
            messages += "\n/" + max + ' ' + question;
        }
        questions.push(q);
    }
    if (messages !== "")
        if (!confirm(_("MSG_notation_confirm_import") + '\n' + messages))
            return _("MSG_tablelinear_cancel");
    csv.splice(0, 2);
    var g;
    for (var i in csv) {
        var grades = csv[i].split(/ *\t */);
        if (grades[0] === '' || !grades[0])
            continue;
        var lin_id = login_to_line_id(grades[0]);
        if (!lin_id)
            return grades[0] + ' ???';
        this.init_cell(lines[lin_id]);
        for (var j in questions) {
            g = grades[3 + 2 * j];
            if (g === '' || g === '???')
                continue;
            if (g != '?') {
                if (isNaN(g))
                    return questions[j].question + ": " + g + "=NaN";
                if (g > questions[j].max)
                    return questions[j].question + ": " + g + ">" + questions[j].max;
            }
            questions[j].set_comment(g + '/' + questions[j].max
                + ' ' + decode_lf_tab(grades[4 + 2 * j]), true);
        }
        this.save_grades();
    }
    this.save_questions(); // Must be after
    this.update_all_grades();
    table_fill(true, true, true, true);
}

Notation = new Notation(); // Only one instance

function notation_open(value, _column) {
    Notation.start();
    return value;
}

function notation_get_key(element) {
    while (element) {
        if (element.tagName == 'DIV' && element.getAttribute('info')) {
            Notation.element_top = element;
            Notation.element_footer = element.lastChild;
            Notation.element_feedback = Notation.element_footer.firstChild;
            Notation.element_record = Notation.element_footer.getElementsByTagName('BUTTON')[0];
            Notation.element_stats = Notation.element_footer.lastChild;
            return element.getAttribute('info');
        }
        element = element.parentNode;
    }
}

function notation_init_state(key, use_textarea) {
    if (!key)
        key = year + '/' + semester + '/' + DisplayGrades.ue.ue
            + '/' + DisplayGrades.column.the_id
            + '/' + DisplayGrades.ue.line_id;

    var info = key.split('/');
    DisplayGrades.column = init_suivi_state(info[2], info[4], info[3]);
    Notation.column = DisplayGrades.column;
    Notation.the_year = info[0];
    Notation.the_semester = info[1];
    Notation.the_ue = info[2];
    Notation.the_line_id = info[4];
    Notation.parse_questions(DisplayGrades.column.comment);
    if (use_textarea)
        notation_update_modifiable();
    else
        Notation.parse_grades(DisplayGrades.cell.comment);
    return key;
}

function notation_save_cell() {
    var cell = DisplayGrades.ue.line[DisplayGrades.column.data_col];
    while (cell.length < 4)
        cell.push('');
    cell[3] = Notation.get_json_grades();
}


function notation_update_modifiable() {
    var nr_full = 0, nr_empty = 0, what;
    var elements = Notation.element_top.getElementsByTagName('TEXTAREA');
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var q = Notation.questions[element.getAttribute('info')];
        q.set_comment('?/1 ' + element.value.trim(), true);
        if (q.grade.comment === '') {
            nr_empty++;
            what = 'notation_empty';
        }
        else {
            nr_full++;
            what = '';
        }
        element.parentNode.parentNode.className = what;
    }
    Notation.element_stats.innerHTML = nr_full + '/' + (nr_empty + nr_full);
}

function notation_update_all_modifiable() {
    t = document.getElementsByTagName('DIV');
    for (var i = 0; i < t.length; i++)
        if (t[i].getAttribute('info')) {
            notation_init_state(notation_get_key(t[i]));
            notation_update_modifiable();
        }
}

function notation_save_textarea(textarea) {
    var key = notation_init_state(notation_get_key(textarea), true);
    var question_id = textarea.getAttribute('info');
    Notation.questions[question_id].set_comment('?/1 ' + textarea.value, true);
    localStorage[key] = Notation.get_json_grades();
    Notation.element_feedback.innerHTML = '';
    notation_update_modifiable();
}

function notation_record_ok(key) {
    notation_init_state(key, true);
    delete localStorage[key];
    notation_save_cell();
}

function notation_record(element) {
    var key = notation_get_key(element);
    notation_init_state(key, true);
    Notation.element_record.previousSibling.innerHTML = _("LABEL_MCQ_saved") + ':';
    _cell(Notation.element_record.previousSibling.lastChild,
        Notation.the_year + '/' + Notation.the_semester
        + '/' + Notation.the_ue + '/comment/' + Notation.column.the_id
        + '/' + Notation.the_line_id,
        Notation.get_json_grades(),
        function () { notation_record_ok(key); }
    );
}

function notation_suivi_popup(key) {
    notation_init_state(key);
    var column = DisplayGrades.column;
    if (localStorage[key]
        && localStorage[key] != line[column.data_col].comment
        && confirm(_("CONFIRM_MCQ_retrieve"))
    )
        Notation.parse_grades(localStorage[key]);
    else
        Notation.parse_grades(line[column.data_col].comment);

    create_popup('notation_suivi_modifiable',
        html(DisplayGrades.ue.ue) + '/' + html(column.title),
        Notation.suivi_modifiable(key), '', false);
    notation_get_key(popup_get_element().getElementsByTagName('TABLE')[0]);
    notation_update_modifiable();
    if (column.comment.match(/\\\(.*\\\)|\\\[.*\\\]/)) {
        var script = document.createElement('SCRIPT');
        script.id = "mcqmath";
        script.async = '';
        script.src = mathjaxurl;
        document.getElementsByTagName('HEAD')[0].appendChild(script);
        setTimeout('MathJax.Hub.Queue(["Typeset",MathJax.Hub])', 100);
    }
    Notation.popup_close = popup_close;
    var cell = DisplayGrades.ue.line[DisplayGrades.column.data_col];
    function close() {
        if (cell[3] != Notation.get_json_grades()) {
            if (confirm(_("LABEL_MCQ_save"))) {
                notation_record(document.getElementById('notation_record'));
                return;
            }
        }
        popup_close = Notation.popup_close;
        popup_close();
    }
    popup_close = close;
}

function notation_format_suivi() {
    var key = notation_init_state();
    if (cell_modifiable_on_suivi()) {
        if (display_update.top == 'Textual') {
            setTimeout(notation_update_all_modifiable, 500);
            return Notation.suivi_modifiable(key);
        }
        return '<button onclick="notation_suivi_popup(' + js2(key) + ')">'
            + _('Answer') + '</button>';
    }
    return hidden_txt(
        html(DisplayGrades.cell.value === ''
            ? (DisplayGrades.column.empty_is || '?')
            : DisplayGrades.cell.value + '/' + DisplayGrades.column.max),
        Notation.suivi(), undefined, undefined,
        "TIP.current_target=undefined;TIP.tip.classList.add('notation_suivi_tip')")
        .replace('<div class="text">', '<div class="text" instanttip="1">')
}

function notation_export() {
    Notation.parse_questions(the_current_cell.column.comment);
    Notation.column = the_current_cell.column;
    var questions = Notation.question_list();
    var data_col = the_current_cell.data_col;
    var csv = [];
    var g;

    t = [_("COL_TITLE_ID"), _("COL_TITLE_surname"), _("COL_TITLE_firstname")];
    for (var question in questions) {
        question = questions[question];
        t.push((question.is_a_bonus() ? '±' : '') + question.max);
        t.push(html(question.question));
    }
    csv.push('<tr><th>' + t.join('<th>') + '</tr>\n');

    t = ['', '', ''];
    for (var question in questions) {
        t.push(_("B_Note"));
        t.push(_("TH_comment"));
    }
    csv.push(['<tr><th>' + t.join('<th>') + '</tr>\n']);

    for (var lin in filtered_lines) {
        line = filtered_lines[lin];
        t = [line[0].value, line[2].value, line[1].value];
        try {
            g = JSON.parse(Notation.get_the_commented_line(line)[data_col].comment);
        }
        catch (e) { g = {}; }
        if (g) {
            for (var question in questions) {
                question = questions[question];
                if (g[question.id]) {
                    var grade = new NotationGrade(g[question.id]);
                    if (grade.grade == '?')
                        t.push('?');
                    else
                        t.push(trunc(grade.grade * question.max));
                    grade.question = question;
                    grade.uncompress_comment();
                    t.push(html(encode_lf_tab(grade.comment)));
                }
                else {
                    t.push("???");
                    t.push("");
                }
            }
            for (var question in g) {
                if (!Notation.questions[question]
                    || !Notation.questions[question].is_a_comment())
                    continue;
                if (g[question] && g[question].substr(0, 1) != '0')
                    t.push(Notation.questions[question].question);
            }
        }
        csv.push('<tr><td>' + t.join('<td>') + '</tr>\n');
    }
    create_popup('notation_export', _("MSG_print_popup_title"),
        '',
        '<style>DIV.import_export.notation_export { bottom: 3em; left: 3em; right: 3em; top: 3em ; border: 4px solid green }</style>'
        + '<table class="colored" style="height: 20em;font-size: 50%;">'
        + csv.join('') + '</table>',
        false);
}

function notation_import_do() {
    var error = Notation.import_do(popup_value(true));
    if (error)
        alert(error);
    else
        popup_close();
}

function notation_import() {
    if (!column_change_allowed(the_current_cell.column)) {
        alert(_("ERROR_value_not_modifiable"));
        return;
    }
    if (the_current_cell.column.modifiable == 2) {
        alert(_("MSG_annotate_not_allowed") + '\n' + _("ALERT_column_not_saved"));
        return;
    }
    var c = _("TH_comment").substr(0, 7);
    var g = _("B_Note").substr(0, 7);
    var example = [
        [_("COL_TITLE_ID"), _("COL_TITLE_surname"), _("COL_TITLE_firstname"),
            2, "Quest X", 2, "Quest Y", _("MSG_Bonus"), "Z"],
        ['', '', '', g, c, g, c, g, c],
        [],
        ["1160000", "", "", 2, "Good!", 1, "Bien", 1, "Super!"],
        ["1160001", "", "", 0.5, "False", 1, "Faux", 0, ""],
        ["1160002", "", "", 0.25, "Bad :-(", 0, "Mauvais", -0.5, "Spelling"]
    ];
    for (var i = 0; i < 3 && i < filtered_lines.length; i++) {
        example[i + 3][0] = filtered_lines[i][0].value.substr(0, 7);
        example[i + 3][1] = filtered_lines[i][2].value.substr(0, 4) + '…';
        example[i + 3][2] = filtered_lines[i][1].value.substr(0, 4) + '…';
    }
    for (var i = 0; i < example.length; i++)
        example[i] = example[i].join("\t");

    var title = _("MSG_notation_import_title") + ' «'
        + the_current_cell.column.title + '»';
    create_popup('import_div', title,
        caution_message() + _("MSG_notation_import"),
        '<button onclick="notation_import_do()">'
        + title + '</button><p>'
        + _("MSG_notation_import_warning"),
        example.join('\n'));
}

function _Notation()
{
  var t = _Note() ;
  t.title = 'Notation' ;
  t.attributes_visible = ['minmax', 'weight', 'rounding', 'repetition', 'groupcolumn', 'notation_export', 'notation_import', 'grade_type', 'grade_session'] ;
  t.cell_is_modifiable = 0 ;
  t.formatte_suivi = notation_format_suivi ;
  t.hide_cell_comment = 1 ;
  t.hide_column_comment = 1 ;
  t.human_priority = 0 ;
  t.ondoubleclick = notation_open ;
  t.tip_cell = "TIP_cell_Notation" ;
  return t ;
}

var analyser_current_attrs = {
    "script_G_upload": 0,
    "script_G_old_upload": 0,
    "script_G_on_upload": 0,
    "script_U_upload": 0,
    "script_U_old_upload": 0,
    "script_U_on_upload": 1,
    "script_G": '',
    "script_U": ''
};

function analyser_read_gui() {
    var value;
    for (var i in analyser_current_attrs) {
        if (document.getElementById(i).tagName == 'INPUT')
            value = Number(document.getElementById(i).checked);
        else
            value = document.getElementById(i).value;
        analyser_current_attrs[i] = value;
    }
}

function analyser_save(button) {
    analyser_read_gui();
    column_attr_set(popup_column(), 'analyser_config',
        JSON.stringify(analyser_current_attrs), button, true);
    analyser_update_gui();
}

function analyser_write_gui() {
    var config = JSON.parse(the_current_cell.column.analyser_config);
    for (var i in analyser_current_attrs) {
        analyser_current_attrs[i] = config[i];
        if (isNaN(config[i]))
            document.getElementById(i).value = config[i];
        else
            document.getElementById(i).checked = config[i];
    }
    analyser_update_gui();
}

function analyser_config_saved() {
    var config = JSON.parse(the_current_cell.column.analyser_config);
    analyser_read_gui();
    for (var i in analyser_current_attrs)
        if (analyser_current_attrs[i] !== config[i]) {
            return false;
        }
    return true;
}

function analyser_update_gui_real() {
    if (!document.getElementById('analyser_grade'))
        return; // Closed popup
    var config_saved = analyser_config_saved();
    document.getElementById('analyser_grade').disabled =
        !config_saved || analyser_grade[0] == 0 || !analyser_savable;
    document.getElementById('analyser_regrade').disabled =
        !config_saved || analyser_regrade[0] == 0 || !analyser_savable;
    document.getElementById('analyser_filtered').disabled =
        !config_saved || analyser_filtered[0] == 0 || !analyser_savable;
    document.getElementById('analyser_record').disabled = config_saved || !analyser_savable;
}

function analyser_update_gui() {
    setTimeout(analyser_update_gui_real, 300);
}

function analyser_do(element) {
    create_popup('import_div', 'Grade',
        '<style>.import_export { bottom: 25% }</style>'
        + '<iframe name="analyser_iframe" style="width:100%; height:calc(100% - 3em)"></iframe>', '', false);

    do_post_data(
        { 'line_ids': window[element.id][0].join(' ') },
        add_ticket(year + "/" + semester + "/" + ue + '/analyser_grade/' + popup_column().data_col),
        "analyser_iframe");
}

var analyser_savable;
var analyser_grade;
var analyser_regrade;
var analyser_filtered;

function analyser_config() {
    var why_not_savable = column_change_allowed_text(the_current_cell.column);
    analyser_savable = why_not_savable === true;

    // [line_ids_possible, line_ids_impossible]
    analyser_grade = [[], []];
    analyser_regrade = [[], []];
    analyser_filtered = [[], []];
    for (var line_id in lines) {
        var line = lines[line_id];
        if (line[0].value === '')
            continue
        var cell = line[the_current_cell.data_col];
        var index = Number(!cell.modifiable(line, the_current_cell.column));
        if (line.is_filtered)
            analyser_filtered[index].push(line_id);
        if (cell.value === '')
            analyser_grade[index].push(line_id);
        analyser_regrade[index].push(line_id);
    }

    function button(name, text) {
        var numbers = window[name];
        return '<button id="' + name + '" onclick="analyser_do(this)">'
            + _("MSG_analyser_grade"
            ).replace('{0}', numbers[0].length.toString()).replace('{1}', text)
            + (numbers[1].length
                ? '<br><span class="red">'
                + _("MSG_analyser_impossible").replace('{}', numbers[1].length.toString())
                + '</span>'
                : '')
            + '</button> ';
    }

    create_popup('import_div',
        html(the_current_cell.column.title)
        + ', '
        + (the_current_cell.column.columns.length
            ? _("MSG_analyser_columns") + ' ' + the_current_cell.column.columns
            : '<span class="red">' + _("MSG_analyser_no_columns") + '</span>'
        ),
        '<style>TABLE.analyser TD { vertical-align: top; padding: 1em }'
        + 'TABLE.analyser TD { width: 50% }'
        + 'TABLE.analyser BUTTON { margin-top: 0.5em }'
        + '.red { color: #F00 }'
        + '</style>'
        + _( "MSG_analyser_intro"),
        '<table class="colored analyser" onmousedown="analyser_update_gui()" onkeydown="analyser_update_gui()"><tr>'
        + '<th>' + _("TH_analyser_grading")
        + '<th>' + _("TH_analyser_checking") + '</tr><tr><td>'
        + '<label><input id="script_G_upload" type="checkbox"> ' + _("MSG_analyser_upload") + '</label><br>'
        + '<label><input id="script_G_old_upload" type="checkbox"> ' + _("MSG_analyser_old_upload") + '</label><br>'
        + '<label><input id="script_G_on_upload" type="checkbox"> ' + _("MSG_analyser_on_upload") + '</label>'
        + '<textarea rows="10" id="script_G"># Python script</textarea>'
        + button('analyser_grade', _('MSG_analyser_gradeless')) + ' '
        + button('analyser_filtered', _('MSG_analyser_filtered')) + ' '
        + button('analyser_regrade', _('MSG_analyser_all'))
        + '<td>'
        + '<label><input id="script_U_upload" type="checkbox"> ' + _("MSG_analyser_upload") + '</label><br>'
        + '<label><input id="script_U_old_upload" type="checkbox"> ' + _("MSG_analyser_old_upload") + '</label><br>'
        + '<label><input id="script_U_on_upload" type="checkbox" checked> ' + _("MSG_analyser_on_upload") + '</label>'
        + '<textarea rows="10" id="script_U"># Your Python script</textarea>'
        + _("MSG_analyser_fast")
        + '</tr></table>'
        + '<p>'
        + '<button id="analyser_record" onclick="analyser_save(this)">' + _('LABEL_save') + '</button> '
        + (analyser_savable ? '' : '<span class="red">' + _("MSG_analyser_ro") + '<span>')
        + '<a href="'
        + add_ticket(year + "/" + semester + "/" + ue + '/analyser_zip/' + the_current_cell.data_col)
        + '">' + _("MSG_analyser_zip") + '</a>'
        , false);
    analyser_write_gui();
    if (!analyser_savable)
        for (var key in analyser_current_attrs)
            document.getElementById(key).disabled = 1;
}
function _Analyser()
{
  var t = _Notation() ;
  t.title = 'Analyser' ;
  t.attributes_visible = ['minmax', 'weight', 'rounding', 'repetition', 'groupcolumn', 'notation_export', 'notation_import', 'grade_type', 'grade_session', 'analyser_config', 'columns'] ;
  t.type_type = "computed" ;
  return t ;
}

function _Moy()
{
  var t = _Note() ;
  t.title = 'Moy' ;
  t.attributes_visible = ['minmax', 'columns', 'weight', 'best', 'worst', 'rounding', 'abj_is', 'abi_is', 'clamp', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_average ;
  t.cell_is_modifiable = 0 ;
  t.human_priority = -8 ;
  t.type_change = function(column)
                    {column_attr_set(column, 'rounding', rounding_avg);} ;
  t.type_type = "computed" ;
  return t ;
}

function _Weighted_Percent()
{
  var t = _Moy() ;
  t.title = 'Weighted_Percent' ;
  t.attributes_visible = ['columns', 'weight', 'rounding', 'test_filter', 'minmax'] ;
  t.cell_compute = compute_weighted_percent ;
  t.human_priority = 3 ;
  t.type_change = undefined ;
  return t ;
}

function _If_Else()
{
  var t = _Moy() ;
  t.title = 'If_Else' ;
  t.attributes_visible = ['minmax', 'test_if', 'columns', 'weight', 'rounding', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_if_else ;
  t.human_priority = 5 ;
  t.type_change = undefined ;
  return t ;
}

function _Replace()
{
  var t = _Moy() ;
  t.title = 'Replace' ;
  t.attributes_visible = ['minmax', 'replace', 'columns', 'weight', 'rounding', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_replace ;
  t.formatte_suivi = text_format_suivi ;
  t.human_priority = 5 ;
  t.type_change = undefined ;
  return t ;
}

function _Diff_Date()
{
  var t = _Moy() ;
  t.title = 'Diff_Date' ;
  t.attributes_visible = ['minmax', 'columns', 'weight', 'rounding'] ;
  t.cell_compute = compute_diff_date ;
  t.human_priority = 100 ;
  t.type_change = undefined ;
  return t ;
}
function competences_grade_configure() {
    competenceTable.open_grade_configure();
}

function comp_grade_recap(val, catalog = null, data_why = null, textual = false, only_tip = false) {
    // Return a HTML grades repartitions recap in a line_pie_chart
    // data_why : dict of explanation. For all keys, 1st element is the formulas used and others are observation's provenance
    // data_why in table side = [line, column] : data_why is computed to be a dict
    if (!catalog || !data_why || textual)
        return val;

    var tip = ['<table>'];
    var keys = Object.keys(data_why);
    keys.splice(keys.indexOf('grade'), 1);
    keys.sort((a, b) => flat_key_order(a, b, catalog));
    var descs = display_grades_desc(catalog, keys.length ? catalog.get_parents(keys[0])[0] : '');

    // Tip
    var scale = [];
    for (var i = 1; i < data_why.grade[1].length; i++)
        scale.push(descs[i] + '&nbsp=&nbsp' + data_why.grade[1][i]);

    if (data_why.grade[0])
        tip.push('<tr><td>', formula_explain(data_why.grade[0], descs, null), '</td></tr>',);
    for (var key of keys) {
        tip.push('<tr><td class="tip_separator">Coef. ', data_why[key][1], ' - ', catalog.items[key].title, '</td></tr>');
        for (var [grade, name] of data_why[key].slice(2))
            tip.push('<tr><td>', name, ' ', comp_observation_span(grade), ' ', descs[grade], '</td></tr>');
    }
    tip.push('<tr><td style="opacity: 0.65">Barème : ', scale.join(', '), '</td></tr></table>');
    var result = hidden_txt(val, tip.join('')).replace('<div class="text">', '<div class="text" instanttip="1">');

    if (only_tip)
        return tip.join('');
    return result;
}
function comp_grade_format_table(val, catalog, line, column, textual = false, only_tip = false) {
    var data_why = comp_grade_compute_why(catalog, line, column, columns, table_attr.p_competence);
    return comp_grade_recap(val, catalog, data_why, textual, only_tip);
}
function comp_grade_format_suivi() {
    // Compute why
    var line = [];
    for (var cell of DisplayGrades.ue.line)
        line.push({ value: cell[0] || "" });
    var why = DisplayGrades.ue.catalog ? comp_grade_compute_why(DisplayGrades.ue.catalog, line,
        DisplayGrades.column, DisplayGrades.ue.columns, DisplayGrades.ue.p_competence) : null;

    var is_textual = display_update.top == 'Textual';
    var val = comp_grade_recap(DisplayGrades.value, DisplayGrades.ue.catalog, why, is_textual);
    var display = is_textual ? _("MSG_tablelinear_rank_on") : '/';
    return [String(val), '<small style="font-size:60%"><span class="displaygrey">',
        display, DisplayGrades.column.max, '</span></small>'].join('');
}
function comp_grade_compute_why(catalog, line, column, columns, table_comp) {
    var comps_grade = column.p_competences_grade;
    var grades_weights = table_comp.grades_weights || (null, 0, 5, 10, 15, 20);
    var [aggr_grades, why, comp_cols] = get_line_why(catalog, line, column, columns, table_comp);
    for (var key in why)
        why[key].push(1);
    var keys = [];
    for (var word in aggr_grades)
        keys.append([word, comps_grade.weights[word] || 1, switch_grade_weight(aggr_grades[word], grades_weights)]);
    why.grade = [aggregate_compute_why(keys, aggregate_formulas_compile(comps_grade.formulas))[1], grades_weights];
    for (var col of comp_cols)
        for (var obs of check_keys(line[col].value.strip().split(/ +/), catalog)[0]) {
            if (!why[key])
                continue;
            var [key, grade] = obs.split('o');
            if(comps_grade.weights[key] || comps_grade.weights[key] == 0)
                why[key][1] = comps_grade.weights[key];
            why[key].push([Number(grade), columns[col].title]);
        }
    return why;
}

function _COMPETENCES_GRADE()
{
  var t = _Moy() ;
  t.title = 'COMPETENCES_GRADE' ;
  t.attributes_visible = ['minmax', 'columns', 'rounding', 'weight', 'grade_type', 'grade_session', 'competences_grade'] ;
  t.cell_compute = comps_grade_cell_compute ;
  t.formatte_suivi = comp_grade_format_suivi ;
  t.human_priority = -7 ;
  return t ;
}

function _Nmbr()
{
  var t = _Moy() ;
  t.title = 'Nmbr' ;
  t.attributes_visible = ['test_filter', 'columns', 'weight', 'minmax', 'rounding', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_nmbr ;
  t.human_priority = -5 ;
  t.type_change = 
function(column)
{
 column_attr_set(column, 'minmax', '[0;' +
                 Math.max(1, column.average_columns.length) + '] ');
 column_attr_set(column, 'rounding', 1) ;
} ;
  return t ;
}

function _Product()
{
  var t = _Moy() ;
  t.title = 'Product' ;
  t.attributes_visible = ['minmax', 'columns', 'weight', 'rounding', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_product ;
  t.human_priority = -1 ;
  return t ;
}

function _Calcul_Repartition()
{
  var t = _Moy() ;
  t.title = 'Calcul_Repartition' ;
  t.cell_compute = compute_repartition ;
  t.human_priority = 12 ;
  return t ;
}

function _Harmonise()
{
  var t = _Moy() ;
  t.title = 'Harmonise' ;
  t.cell_compute = compute_harmonise ;
  t.human_priority = 12 ;
  return t ;
}

function _Max()
{
  var t = _Moy() ;
  t.title = 'Max' ;
  t.attributes_visible = ['columns', 'abj_is', 'grade_session', 'clamp', 'grade_type', 'minmax', 'weight', 'abi_is'] ;
  t.cell_compute = compute_max_real ;
  t.human_priority = -6 ;
  t.type_change = undefined ;
  return t ;
}

function get_original_cow_column(column) {
    while (column.type == 'COW') {
        column = columns[column.average_columns[0]];
        if (column === undefined)
            return;
    }
    return column;
}

function toggle_cow(value) {
    var column = get_original_cow_column(the_current_cell.column);
    if (column && column.real_type.ondoubleclick)
        return column.real_type.ondoubleclick(value);
    else
        return value;
}

function test_cow(value, column) {
    column = get_original_cow_column(column);
    if (column)
        return column.real_type.cell_test(value, column);
    return value;
}

function cow_format(c, column) {
    column = get_original_cow_column(column);
    if (column)
        return column.real_type.formatte(c, column);
    else
        return c;
}

function _COW()
{
  var t = _Max() ;
  t.title = 'COW' ;
  t.attributes_visible = ['minmax', 'columns', 'weight', 'rounding', 'repetition', 'grade_type', 'grade_session'] ;
  t.cell_compute = compute_cow ;
  t.cell_is_modifiable = 1 ;
  t.cell_test = test_cow ;
  t.formatte = cow_format ;
  t.human_priority = 11 ;
  t.ondoubleclick = toggle_cow ;
  t.tip_cell = "TIP_cell_Text" ;
  return t ;
}
_Note() ;
_Prst() ;
_Moy() ;
_Add() ;
_COMPETENCES_GRADE() ;
_COMPETENCES_RESULT() ;
_COMPETENCES_YEAR_RESULT() ;
_Ue_Grade() ;
_Max() ;
_Nmbr() ;
_Product() ;
_Analyser() ;
_Annotate() ;
_Enumeration() ;
_Notation() ;
_Text() ;
_Bool() ;
_Je_Viens() ;
_Weighted_Percent() ;
_Calendar() ;
_Competences() ;
_Date() ;
_If_Else() ;
_Replace() ;
_Login() ;
_Rank() ;
_Dispatcher() ;
_URL() ;
_COW() ;
_Abis() ;
_Calcul_Repartition() ;
_Can_Bring_A_Pc() ;
_Code_Etape() ;
_Commute_Time() ;
_First_Registration() ;
_Firstname() ;
_Get_Referent() ;
_Harmonise() ;
_Mail() ;
_Phone() ;
_Surname() ;
_Working_Hours() ;
_Upload() ;
_Credits() ;
_Diff_Date() ;
_Discipline() ;
_Intitule_Ue() ;
_MCQ() ;
_Mcc_Duree_Session_1() ;
_Mcc_Duree_Session_2() ;
_Mcc_Type_Epreuve_1() ;
_Mcc_Type_Epreuve_2() ;
_Nombre_Etudiants() ;
_Nombre_Etudiants_Automne() ;
_Nombre_Etudiants_Max() ;
_Nombre_Etudiants_Printemps() ;
_Population_Rv() ;
_Populations() ;
_Portail() ;
_Responsable_A() ;
_Responsable_P() ;
_Mail_Resps_Ue() ;
_Mail_Resps_Ue_A() ;
_Mail_Resps_Ue_P() ;
_Normalize() ;
_Sportif() ;
_Apogee() ;
_Moyenne_Courante() ;
_Nbia() ;
_Resultat() ;
_Civilite() ;
_Cod_Cat() ;
_Redoublement() ;
_Etablissement() ;
_Grade() ;
_Preinsiufm() ;
_Cod_Pru() ;
_Status() ;
_Formation() ;
var yes = "OUI", yes_char = "O";
var no = "NON", no_char = "N";
var abi = "ABINJ", abi_short = "ABI", abi_char = "I";
var abj = "ABJUS", abj_short = "ABJ", abj_char = "J";
var pre = "PRST", pre_short = "PRE", pre_char = "P";
var tnr = "TNR", tnr_short = "TNR", tnr_char = "T";
var ppn = "PPNOT", ppn_short = "PPN", ppn_char = "N";
function or_keyword() { return "ou"; }var COL_TITLE_0_2 = "Nom";
var COL_TITLE_0_4 = "Seq";
var server_language = "fr" ;
var special_days = {"14/2":"💕","14/3":"π","8/3":"♀","21/3":"🀦","1/4":"🐟","22/4":"🌍🌎🌏","4/5":"🚀","31/5":"🚭","21/6":"🀧","22/6":"🀧","22/9":"🀨","23/9":"🀨","31/10":"🎃","1/11":"👻","21/12":"🀩","22/12":"🀩","23/12":"🎄","24/12":"🎅","25/12":"🎁","31/12":"🎉","1/1":"😴"} ;
var allowed_grades = {"DIS":['PPN', 'Dispense'],"DEF":['ABI', 'Défaillant'],"V":['PRST', 'Visio conférence'],"ABS":['ABI', 'Absent', 1],"SUPPR":['ABJ', 'Cours supprimé', 1]} ;
/*
  TOMUSS: The Online Multi User Simple Spreadsheet
  Copyright (C) 2011-2019 Thierry EXCOFFIER, Universite Claude Bernard

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

function go_referent_set() {
    create_popup('import_list', _("TITLE_referent_get_set"),
        _("MSG_referent_get_set_before")
        + '<input id="go_referent_set">'
        + _("MSG_referent_get_set_after"),
        _("MSG_referent_get_before_button")
        + '<BUTTON OnClick="go_referent_set_do();">'
        + _("B_referent_get_set") + '</BUTTON>.',
        '');
}

function go_referent_set_do() {
    var values = popup_text_area().value.split(/[ \t\n,;.:]+/);
    var teacher = document.getElementById('go_referent_set').value;

    create_popup('import_list', _("TITLE_referent_get_do"),
        '<iframe width="100%" src="'
        + add_ticket('referent_set/' + teacher + '/' + values.join('/'))
        + '">' + '</iframe>', "", false);
}

function go_referent_set_pairs() {
    create_popup('import_list', _("TITLE_referent_get_set_pairs"),
        _("MSG_referent_get_set_pairs"),
        _("MSG_referent_get_before_button")
        + '<BUTTON OnClick="go_referent_set_pairs_do();">'
        + _("B_referent_get_set") + '</BUTTON>.',
        '');
}

function go_referent_set_pairs_do() {
    do_post_data({ 'lines': popup_value().join('\n') }, add_ticket('referent_set_pairs'));
}

function go_orphan_students() {
    create_popup('import_list', _("TITLE_referent_get_orphan"), "",
        _("MSG_referent_get_before_button")
        + '<BUTTON OnClick="go_orphan_students_do();">'
        + _("B_referent_get_orphan") + '</BUTTON>.',
        '');
}

function go_orphan_students_do() {
    var values = popup_text_area().value.split(/[ \t\n,;.:]+/);

    create_popup('import_list', _("TITLE_referent_get_do"),
        '<iframe width="100%" src="'
        + add_ticket('orphan_students/' + values.join('/'))
        + '">' + '</iframe>', "", false);
}
var rooms = [["Doua Amphi Th\u00e9mis 10, place %%", "4001-4074", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s58", "1-25", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi D\u00e9ambu 1, place %%", "1-78 -16", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Amphi Jordan, place %%", "391-470", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/braconnier.html", "B\u00e2timent Braconnier (math\u00e9matique)"], ["Doua Amphi Grignard, place %%", "631-718", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Salle Th\u00e9mis s51", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi D\u00e9ambu 3, place %%", "157-234 -181", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Salle Grignard s02", "1-40", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Amphi D\u00e9ambu 4, place %%", "235-312", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Salle D\u00e9ambu s3", "1-25", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Amphi Astr\u00e9e 13, place %%", "6001-6119 -6017", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/astree.html", "B\u00e2timent Astr\u00e9e"], ["Doua Salle Grignard s04", "1-24", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Amphi Th\u00e9mis  8, place %%", "2001-2074", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi D\u00e9ambu 5, place %%", "313-390", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Salle Th\u00e9mis s69", "1-25", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s48", "1-21", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s50", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi Th\u00e9mis  7, place %%", "1001-1074", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi Th\u00e9mis 11, place %%", "5001-5074", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s71", "1-25", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi Caullery, place %%", "777-840 -790", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/darwin.html", "B\u00e2timent Darwin (biologie)"], ["Doua Amphi Deperet, place %%", "841-896", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/darwin.html", "B\u00e2timent Darwin (biologie)"], ["Doua Amphi Jussieu, place %%", "713-776", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/darwin.html", "B\u00e2timent Darwin (biologie)"], ["Doua Amphi Gouy, place %%", "551-630", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/lippman.html", "B\u00e2timent Lippman (physique et \u00e9lectronique)"], ["Doua Salle Th\u00e9mis s70", "1-25", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi 6 Marie Curie, place %%", "889-958", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "\u00c0 cot\u00e9 du d\u00e9ambulatoire"], ["Doua Amphi D\u00e9ambu 2, place %%", "79-156 -103", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Amphi Amp\u00e8re, place %%", "471-554", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/lippman.html", "B\u00e2timent Lippman (physique et \u00e9lectronique)"], ["Doua Salle Th\u00e9mis s53", "1-18", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi Th\u00e9mis  9, place %%", "3001-3074", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Grignard s03", "1-22", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Salle Th\u00e9mis s56", "1-19", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s57", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s59", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s68", "1-17", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s66", "1-21", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Gerland", "1-50", "", ""], ["Doua Salle Th\u00e9mis s52", "1-19", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["PasDeSalle", "1-999999", "", ""], ["Doua Salle Th\u00e9mis s49", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s54", "1-18", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s55", "1-18", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s65", "1-21", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Ariane 01", "1-21", "", "Ariane"], ["Doua Salle Th\u00e9mis s62", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s63", "1-18", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Amphi Berthollet, place %%", "1-32", "", "B\u00e2timent Berthollet (chimie)"], ["Mission Handicap", "1-10", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/astree.html", "B\u00e2timent Astr\u00e9e"], ["Doua Salle D\u00e9ambu s2", "1-17", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Salle D\u00e9ambu s5", "1-24", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/deambulatoire.html", "D\u00e9ambulatoire"], ["Doua Darwin D salle 71", "1-14", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/darwin.html", "B\u00e2timent Darwin (biologie)"], ["Doua Salle Th\u00e9mis s61", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Nautibus C1, place %%", "1-28", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/nautibus.html", "B\u00e2timent Nautibus"], ["Doua Salle Nautibus C2, place %%", "1-28", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/nautibus.html", "B\u00e2timent Nautibus"], ["Doua Salle Nautibus C4, place %%", "1-28", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/nautibus.html", "B\u00e2timent Nautibus"], ["Doua Salle Nautibus C5, place %%", "1-28", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/nautibus.html", "B\u00e2timent Nautibus"], ["Introuvable", "1-10", "", ""], ["Doua Salle Ariane 02", "1-21", "", "Ariane"], ["Doua Salle Th\u00e9mis s60", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Salle Th\u00e9mis s67", "1-21", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua Quai43 salle langue 1er", "1-40", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Th\u00e9mis s64", "1-21", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/themis.html", "B\u00e2timent Th\u00e9mis"], ["Doua IUT Amphi deux", "1-33", "", ""], ["Doua Salle Lippman s107", "1-21", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/lippman.html", "B\u00e2timent Lippman (physique et \u00e9lectronique)"], ["Doua Salle Quai43 s109", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s111", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Berthollet Camillo Gorgi", "1-18", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Berthollet Nicole Le Douarin", "1-18", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Berthollet Victor Nigon", "1-18", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Berthollet Suzanne France", "1-10", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Omega salle 12", "1-24", "", ""], ["Doua Darwin D salle 81", "1-21", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/darwin.html", "B\u00e2timent Darwin (biologie)"], ["Doua Omega salle 02", "1-21", "", ""], ["Doua Omega salle 03", "1-22", "", ""], ["Doua Darwin D salle 82", "1-18", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/darwin.html", "B\u00e2timent Darwin (biologie)"], ["Doua Omega salle 109", "1-10", "", ""], ["Doua Omega salle 110", "1-10", "", ""], ["Doua Salle Grignard s01", "1-15", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Salle Grignard s24", "1-27", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Salle Quai43 s101", "1-24", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s102", "1-24", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Grignard s21", "1-15", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Salle Grignard s05", "1-24", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/grignard.html", "B\u00e2timent Grignard (chimie)"], ["Doua Salle Quai43 s112", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s114", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s113", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s116", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Berthollet s202", "1-18", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Salle Quai43 s207", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s209", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s216", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s218", "1-20", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s105", "1-24", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Salle Quai43 s106", "1-24", "http://plan.univ-lyon1.fr/plans/fiches_ucbl/quai43.html", "Quai43"], ["Doua Berthollet s203", "1-22", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Berthollet s204", "1-20", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Berthollet s206", "1-17", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Berthollet s208", "1-17", "", "B\u00e2timent Berthollet (chimie)"], ["Doua Salle Ariane 03", "1-21", "", "Ariane"], ["Doua Salle Ariane 04", "1-21", "", "Ariane"], ["Doua Salle Ariane 05", "1-21", "", "Ariane"], ["Doua Salle Ariane 11", "1-21", "", "Ariane"], ["Doua Salle Ariane 12", "1-21", "", "Ariane"], ["Doua Salle Ariane 13", "1-21", "", "Ariane"], ["Doua Salle Ariane 06", "1-21", "", "Ariane"], ["Doua Salle Ariane 14", "1-21", "", "Ariane"], ["Doua Salle Ariane 15", "1-21", "", "Ariane"], ["Doua Salle Ariane 16", "1-21", "", "Ariane"]];
