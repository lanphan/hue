// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


//// Get collections
function fetcher_success(Name, Model, Node, Options) {
  return function(data) {
    switch(data.status) {
      case 0:
        var nodes = [];
        $.each(data[Name], function(index, model_dict) {
          var model = new Model(model_dict);
          var node = new Node({model: model});
          nodes.push(node);
        });
        $(document).trigger('loaded.' + Name, [Options, nodes]);
      break;
      default:
      case 1:
        $(document).trigger('load_error.' + Name, [Options, data]);
      break;
    }
  };
}

function fetcher_error(Name, Options) {
  return function(jqXHR, status, error) {
    switch(jqXHR.getResponseHeader('content-type')) {
      case 'application/json':
      case 'application/x-javascript':
      case 'text/javascript':
      case 'text/x-javascript':
      case 'text/x-json':
      var response = $.parseJSON(jqXHR.responseText);
      if (response.detail == 61) {
        $(document).trigger('connection_error.sqoop', [Name, Options, jqXHR])
      }
      break;
    }
  };
}

function fetch_connectors(options) {
  $(document).trigger('load.connectors', [options]);
  var request = $.extend({
    url: '/sqoop/api/connectors/',
    dataType: 'json',
    type: 'GET',
    success: fetcher_success('connectors', ConnectorModel, Connector, options),
    error: fetcher_error('connectors', options)
  }, options || {});
  $.ajax(request);
}

function fetch_connections(options) {
  $(document).trigger('load.connections', [options]);
  var request = $.extend({
    url: '/sqoop/api/connections/',
    dataType: 'json',
    type: 'GET',
    success: fetcher_success('connections', ConnectionModel, Connection, options),
    error: fetcher_error('connections', options)
  }, options || {});
  $.ajax(request);
}

function fetch_jobs(options) {
  $(document).trigger('load.jobs', [options]);
  var request = $.extend({
    url: '/sqoop/api/jobs/',
    dataType: 'json',
    type: 'GET',
    success: fetcher_success('jobs', JobModel, Job, options),
    error: fetcher_error('jobs', options)
  }, options || {});
  $.ajax(request);
}

function fetch_submissions(options) {
  $(document).trigger('load.submissions', [options]);
  var request = $.extend({
    url: '/sqoop/api/submissions/',
    dataType: 'json',
    type: 'GET',
    success: fetcher_success('submissions', SubmissionModel, Submission, options),
    error: fetcher_error('submissions', options)
  }, options || {});
  $.ajax(request);
}