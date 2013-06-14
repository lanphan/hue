## Licensed to Cloudera, Inc. under one
## or more contributor license agreements.  See the NOTICE file
## distributed with this work for additional information
## regarding copyright ownership.  Cloudera, Inc. licenses this file
## to you under the Apache License, Version 2.0 (the
## "License"); you may not use this file except in compliance
## with the License.  You may obtain a copy of the License at
##
##     http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an "AS IS" BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.
<%!
  from desktop.views import commonheader, commonfooter
  from django.utils.translation import ugettext as _
%>

<%namespace name="actionbar" file="actionbar.mako" />

${ commonheader(None, "sqoop", user, "100px") | n,unicode }

<div class="subnav subnav-fixed">
  <div class="container-fluid">
    <ul class="nav nav nav-pills">
      <li><a href="#jobs">${ _('Editor') }</a></li>
      <li><a href="#history">${ _('History') }</a></li>
      <li><a href="#server">${ _('Server') }</a></li>
    </ul>
  </div>
</div>


<div class="container-fluid">
  <div id="sqoop-error" class="row-fluid mainSection hide">
    <h2>${_('Sqoop error')}</h2>
    <div class="error message well"></div>
  </div>

  <div id="jobs" class="row-fluid mainSection hide">
    <div id="jobs-list" class="row-fluid section hide">
      <%actionbar:render>
        <%def name="search()">
          <input id="filter" type="text" class="input-xlarge search-query" placeholder="${_('Search for job name or content')}">
        </%def>

        <%def name="actions()">
          <a class="btn fileToolbarBtn" title="${_('Run this job')}" href="#job/run"><i class="icon-play"></i> ${_('Run')}</a>
          <a class="btn fileToolbarBtn" title="${_('Copy this job')}" href="#job/copy"><i class="icon-copy"></i> ${_('Copy')}</a>
          <a class="btn fileToolbarBtn" title="${_('Delete this job')}" href="#job/delete"><i class="icon-trash"></i> ${_('Delete')}</a>
        </%def>

        <%def name="creation()">
          <a class="btn fileToolbarBtn" title="${_('Create a new job')}" href="#job/new"><i class="icon-plus-sign"></i> ${_('New job')}</a>
          <a class="btn fileToolbarBtn" title="${_('Create a new job')}" href="#job/edit"><i class="icon-sort"></i> ${_('Edit job')}</a>
        </%def>
      </%actionbar:render>
      <table class="table table-striped table-condensed tablescroller-disable row-selectable">
        <thead>
          <tr data-bind="visible: filteredJobs().length > 0 && !isLoading()">
            <th width="1%">
              <span id="select-all-jobs" data-bind="click: toggleAllJobsSelected, css: {'hueCheckbox': true, 'icon-ok': allJobsSelected}"></span>
            </th>
            <th width="5%">${_('ID')}</th>
            <th width="55%">${_('Name')}</th>
            <th width="20%">${_('Created')}</th>
            <th width="20%">${_('Updated')}</th>
          </tr>
        </thead>
        <tbody data-bind="foreach: filteredJobs">
          <tr data-bind="">
            <td data-row-selector-exclude="true">
              <span data-bind="css: {'hueCheckbox': true, 'center': true, 'icon-ok': selected}">&nbsp;</span>
            </td>
            <td data-bind="text: id"></td>
            <td data-bind="text: name"></td>
            <td data-bind="text: createdFormatted"></td>
            <td data-bind="text: updatedFormatted"></td>
          </tr>
        </tbody>
        <tfoot>
          <tr data-bind="visible: isLoading">
            <td colspan="3" class="left">
              <img src="/static/art/spinner.gif" />
            </td>
          </tr>
          <tr data-bind="visible: jobs().length == 0 && !isLoading()">
            <td colspan="5">
              <div class="alert">
                  ${_('There are no jobs to display.')}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div id="job-editor" class="row-fluid section hide" data-bind="with: job">
      <div class="well sidebar-nav span2">
        <form id="advanced-settings" method="POST" class="form form-horizontal noPadding">
          <ul class="nav nav-list">
            <li class="nav-header">${_('Job')}</li>
            <li>
              <select name="type"
                      data-bind="'options': ['IMPORT', 'EXPORT'],
                                 'value': $root.job().type"
                      class="span12"></select>
            </li>
            <li class="nav-header">${_('Connector')}</li>
            <li>
              <select name="connector"
                      data-bind="'options': $root.connectors,
                                 'optionsText': function(item) {
                                   return item.name();
                                 },
                                 'value': $root.connector"
                      class="span12"></select>
            </li>
            <li class="nav-header">${_('Connection')}</li>
            <li>
              <select name="connection"
                      data-bind="'options': $root.connections,
                                 'optionsText': function(item) {
                                   return item.name();
                                 },
                                 'value': $root.connection"
                      class="span12"></select>
            </li>
            <li>
              <a href="#connection/new">
                <i class="icon-plus"></i> ${ _('New connection') }
              </a>
            </li>
            <li data-bind="visible: $root.connections().length > 0">
              <a href="#connection/edit">
                <i class="icon-reorder"></i> ${ _('Edit connection') }
              </a>
            </li>
            <li class="nav-header" data-bind="visible: $root.job().persisted">${_('Actions')}</li>
            <li data-bind="visible: $root.job().persisted">
              <a data-placement="right" rel="tooltip" title="${_('Run the job')}" href="#job/run">
                <i class="icon-play"></i> ${_('Run')}
              </a>
            </li>
            <li data-bind="visible: $root.job().persisted">
              <a data-placement="right" rel="tooltip" title="${_('Copy the job')}" href="#job/copy">
                <i class="icon-copy"></i> ${_('Copy')}
              </a>
            </li>
            <li data-bind="visible: $root.job().persisted">
              <a data-placement="right" rel="tooltip" title="${_('Delete the job')}" href="#job/delete">
                <i class="icon-remove"></i> ${_('Delete')}
              </a>
            </li>
          </ul>
        </form>
      </div>

      <div id="job-forms" class="span10">
        <h3>${_('Create a job')}</h3>
        <form method="POST" class="form form-horizontal noPadding">
          <div class="control-group">
            <label class="control-label">${ _('Name') }</label>
            <div class="controls">
              <input name="connection-name" data-bind="value: name">
            </div>
          </div>
          <fieldset data-bind="foreach: connector">
            <div data-bind="foreach: inputs">
              <div data-bind="template: 'connector-' + type().toLowerCase()"></div>
            </div>
          </fieldset>
          <fieldset data-bind="foreach: framework">
            <div data-bind="foreach: inputs">
              <div data-bind="template: 'framework-' + type().toLowerCase()"></div>
            </div>
          </fieldset>
          <a href="#job/save" class="btn btn-primary">${_('Save')}</a>
          <a href="#jobs" class="btn btn-danger">${_('Cancel')}</a>
        </form>
      </div>
    </div>

    <div id="connection-editor" class="row-fluid section hide" data-bind="with: connection">
      <div class="well sidebar-nav span2">
        <form id="advanced-settings" method="POST" class="form form-horizontal noPadding">
          <ul class="nav nav-list">
            <li class="nav-header">${_('Connector')}</li>
            <li>
              <select name="connector"
                      data-bind="'options': $root.connectors,
                                 'optionsText': function(item) {
                                   return item.name();
                                 },
                                 'value': $root.connector"
                      class="span12"></select>
            </li>
            <li>&nbsp;</li>
            <li><a href="#connection/edit-cancel">${_('Back to job')}</a></li>
          </ul>
        </form>
      </div>

      <div id="connection-forms" class="span10">
        <h3>${_('Create a connection')}</h3>
        <form method="POST" class="form form-horizontal noPadding">
          <div class="control-group">
            <label class="control-label">${ _('Name') }</label>
            <div class="controls">
              <input name="connection-name" data-bind="value: name">
            </div>
          </div>
          <fieldset data-bind="foreach: connector">
            <div data-bind="foreach: inputs">
              <div data-bind="template: 'connector-' + type().toLowerCase()"></div>
            </div>
          </fieldset>
          <fieldset data-bind="foreach: framework">
            <div data-bind="foreach: inputs">
              <div data-bind="template: 'framework-' + type().toLowerCase()"></div>
            </div>
          </fieldset>
          <a href="#connection/save" class="btn btn-primary">${_('Save')}</a>
          <a href="#connection/edit-cancel" class="btn btn-danger">${_('Cancel')}</a>
        </form>
      </div>
    </div>
  </div>

  <div id="history" class="row-fluid mainSection hide">
    <table class="table table-striped table-condensed tablescroller-disable row-selectable">
      <thead>
        <tr data-bind="visible: submissions().length > 0">
          <th width="1%"></th>
          <th width="5%">${_('Job ID')}</th>
          <th width="20%">${_('Progress')}</th>
          <th width="15%">${_('Status')}</th>
          <th width="15%">${_('Created')}</th>
          <th width="15%">${_('Last Updated')}</th>
          <th width="30%">${_('External')}</th>
        </tr>
      </thead>
      <tbody data-bind="foreach: submissions()">
        <tr>
          <td data-row-selector-exclude="true"></td>
          <td><a data-bind="attr: {'href': '#job/edit/' + job()}, text: job"></a></td>
          <td data-bind="text: progress"></td>
          <td>
            <span data-bind="if: status() == 'SUCCEEDED'">${_('Succeeded')}</span>
            <span data-bind="if: status() == 'FAILURE_ON_SUBMIT'">${_('Failure upon submission')}</span>
          </td>
          <td data-bind="text: createdFormatted"></td>
          <td data-bind="text: updatedFormatted"></td>
          <td><a data-bind="text: external_id, attr: {'href': external_link}"></a></td>
        </tr>
      </tbody>
      <tfoot>
        <tr data-bind="visible: submissions().length == 0">
          <td colspan="5">
            <div class="alert">
                ${_('There are no submissions to display.')}
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div id="server" class="row-fluid mainSection hide"></div>
</div>

<script type="text/html" id="framework-enum">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('framework', name())"></label>
  <div class="controls">
    <select data-bind="'options': values, 
                       'value': value, 
                       'optionsCaption': 'Choose...'">
  </div>
</div>
</script>

<script type="text/html" id="framework-map">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('framework', name())"></label>
  <div class="controls">
    <input data-bind="value: value, attr: {'type': (sensitive() ? 'password' : 'text')}">
  </div>
</div>
</script>

<script type="text/html" id="framework-string">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('framework', name())"></label>
  <div class="controls">
    <input data-bind="value: value, attr: {'type': (sensitive() ? 'password' : 'text')}">
  </div>
</div>
</script>

<script type="text/html" id="framework-integer">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('framework', name())"></label>
  <div class="controls">
    <input data-bind="value: value, attr: {'type': (sensitive() ? 'password' : 'text')}">
  </div>
</div>
</script>

<script type="text/html" id="connector-enum">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('connector', name())"></label>
  <div class="controls">
    <select data-bind="'options': values, 
                       'value': value, 
                       'optionsCaption': 'Choose...'">
  </div>
</div>
</script>

<script type="text/html" id="connector-map">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('connector', name())"></label>
  <div class="controls">
    <input data-bind="value: value, attr: {'type': (sensitive() ? 'password' : 'text')}">
  </div>
</div>
</script>

<script type="text/html" id="connector-string">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('connector', name())"></label>
  <div class="controls">
    <input data-bind="value: value, attr: {'type': (sensitive() ? 'password' : 'text')}">
  </div>
</div>
</script>

<script type="text/html" id="connector-integer">
<div class="control-group">
  <label class="control-label" data-bind="text: $root.label('connector', name())"></label>
  <div class="controls">
    <input data-bind="value: value, attr: {'type': (sensitive() ? 'password' : 'text')}">
  </div>
</div>
</script>

<script src="/static/ext/js/datatables-paging-0.1.js" type="text/javascript" charset="utf-8"></script>
<script src="/static/ext/js/routie-0.3.0.min.js" type="text/javascript" charset="utf-8"></script>
<script src="/static/ext/js/moment.min.js" type="text/javascript" charset="utf-8"></script>
<script src="/static/ext/js/knockout-min.js" type="text/javascript" charset="utf-8"></script>
<script src="/static/ext/js/knockout.mapping-2.3.2.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/cclass.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/koify.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.utils.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.models.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.framework.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.connectors.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.connections.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.jobs.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.submissions.js" type="text/javascript" charset="utf-8"></script>
<script src="/sqoop/static/js/sqoop.js" type="text/javascript" charset="utf-8"></script>

<link rel="stylesheet" href="/sqoop/static/css/sqoop.css">

<script type="text/javascript" charset="utf-8">
//// Render all data
viewModel.isLoading.subscribe(function(value) {
  if (!value) {
    ko.applyBindings(viewModel, $('#jobs')[0]);
  }
});
ko.applyBindings(viewModel, $('#history')[0]);

var tableOptions = {
  "sPaginationType": "bootstrap",
  "bLengthChange": false,
  "sDom": "<'row'r>t<'row'<'span8'i><''p>>",
  "bDestroy": true,
  "bAutoWidth": false,
  "aoColumnDefs": [
    { "bSortable": false, "aTargets": [ 0 ] },
  ],
  "iDisplayLength" : 25,
  "oLanguage": {
    "sEmptyTable":     "${_('No data available')}",
    "sInfo":           "${_('Showing _START_ to _END_ of _TOTAL_ entries')}",
    "sInfoEmpty":      "${_('Showing 0 to 0 of 0 entries')}",
    "sInfoFiltered":   "${_('(filtered from _MAX_ total entries)')}",
    "sZeroRecords":    "${_('No matching records')}",
    "oPaginate": {
      "sFirst":    "${_('First')}",
      "sLast":     "${_('Last')}",
      "sNext":     "${_('Next')}",
      "sPrevious": "${_('Previous')}"
    }
  }
};

var jobTable = $('#jobs table').dataTable( tableOptions );
var historyTable = $('#history table').dataTable( tableOptions );

$(document).on('load.jobs', function() { jobTable.fnDestroy(); });
$(document).on('loaded.jobs', function() { jobTable = $('#jobs table').dataTable( tableOptions ); });
$(document).on('load.submissions', function() { historyTable.fnDestroy(); });
$(document).on('loaded.submissions', function() { historyTable = $('#history table').dataTable( tableOptions ); });

//// Events
$(document).on('connection_error.sqoop', function(e, name, options, jqXHR) {
  $('#sqoop-error .message').text("${ _('Cannot connect to sqoop server.') }");
  routie('error');
});

$(document).on('start_error.job', function(e, job, options, message) {
  $.jHueNotify.error("${ _('Could not start job: ') }" + response.message);
});

$(document).on('start_fail.job', function(e, job, options, message) {
  $.jHueNotify.error("${ _('Could not start job: ') }" + message);
});

$(document).on('started.job', function(e, submission, model, options) {
  $.jHueNotify.info("${ _('Started job.') }");
});

$('#filter').on('keyup', function() {
  viewModel.filter($('#filter').val());
});

$("#jobs-list tbody").on('click', 'tr', function() {
  var job = ko.dataFor(this);
  job.selected(!job.selected());
});

//// Load all the data
// TODO: Load at the beginning and with view models.
var framework = new framework.Framework({modelDict: {}});
framework.load();
connectors.fetchConnectors();
connections.fetchConnections();
jobs.fetchJobs();
submissions.fetchSubmissions();


//// Routes
$(document).ready(function () {
  routie({
    "error": function() {
      showMainSection("sqoop-error");
    },
    "jobs": function() {
      showSection("jobs", "jobs-list");
    },
    "job/edit": function() {
      if (!viewModel.job()) {
        window.history.back();
      }
      showSection("jobs", "job-editor");
    },
    "job/edit/:id": function(id) {
      viewModel.chooseJobById(id);
      showSection("jobs", "job-editor");
    },
    "job/new": function() {
      viewModel.newJob();
      showSection("jobs", "job-editor");
    },
    "job/save": function() {
      viewModel.saveJob();
      $(document).one('saved.job', function(){routie('jobs');});
    },
    "job/run": function() {
      if (viewModel.job()) {
        viewModel.job().start();
        window.history.back();
      } else {
        window.history.back();
      }
    },
    "job/stop": function() {
      if (viewModel.job()) {
        viewModel.job().stop();
        window.history.back();
      } else {
        window.history.back();
      }
    },
    "job/copy": function() {
      if (viewModel.job()) {
        viewModel.job().clone();
      } else {
        routie('jobs');
      }
      $(document).one('cloned.job', function(){routie('jobs');});
    },
    "job/delete": function() {
      if (viewModel.job()) {
        viewModel.job().delete();
      } else {
        routie('jobs');
      }
      $(document).one('deleted.job', function(){routie('jobs');});
    },
    "connection/edit": function() {
      showSection("jobs", "connection-editor");
    },
    "connection/edit/:id": function(id) {
      viewModel.chooseConnectionById(id);
      showSection("jobs", "connection-editor");
    },
    "connection/edit-cancel": function() {
      if (viewModel.createConnection()) {
        viewModel.connections.pop();
      }
      viewModel.createConnection(false);
      window.history.back();
      window.history.back();
    },
    "connection/new": function() {
      viewModel.newConnection();
      showSection("jobs", "connection-editor");
    },
    "connection/save": function() {
      viewModel.saveConnection();
      $(document).one('saved.connection', function(){window.history.back();});
    },
    "connection/copy": function() {
      if (viewModel.connection()) {
        viewModel.connection().clone();
      } else {
        window.history.back();
      }
      $(document).one('cloned.connection', function(){window.history.back();});
    },
    "connection/delete": function() {
      if (viewModel.connection()) {
        viewModel.connection().delete();
      } else {
        window.history.back();
      }
      $(document).one('deleted.connection', function(){window.history.back();});
    },
    "history": function() {
      showMainSection("history");
    },
    "server": function() {
      showMainSection("server");
    },
  });
  routie('jobs');
});
</script>

${ commonfooter(messages) | n,unicode }
