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



var jobs = (function($) {
  var JobModel = koify.Model.extend({
    'id': -1,
    'name': null,
    'type': 'IMPORT',
    'connector_id': 0,
    'connection_id': 0,
    'connector': [],
    'framework': [],
    'created': null,
    'updated': null,
    'initialize': function(attrs) {
      var self = this;
      var attrs = $.extend(true, attrs, {});
      attrs = transform_keys(attrs, {
        'connector-id': 'connector_id',
        'connection-id': 'connection_id'
      });
      attrs = transform_values(attrs, {
        'connector': to_forms,
        'framework': to_forms
      });
      return attrs;
    }
  });

  var Job = koify.Node.extend({
    'identifier': 'job',
    'persists': true,
    'modelClass': JobModel,
    'base_url': '/sqoop/api/jobs/',
    'initialize': function() {
      var self = this;
      self.parent.initialize.apply(self, arguments);
      self.createdFormatted = ko.computed(function() {
        if (self.created()) {
          return moment(self.created()).format('MM/DD/YYYY hh:mm A');
        } else {
          return 0;
        }
      });
      self.updatedFormatted = ko.computed(function() {
        if (self.updated()) {
          return moment(self.updated()).format('MM/DD/YYYY hh:mm A');
        } else {
          return 0;
        }
      });
      self.errors = ko.observableArray();
      self.warnings = ko.observableArray();
      self.selected = ko.observable();
    },
    'start': function(options) {
      var self = this;
      $(document).trigger('start.job', [options, self]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              var node = new Submission({modelDict: data.submission});
              self.submission(node);
              $(document).trigger('started.job', [node, model, options]);
            break;
            default:
            case 1:
              var error = data.errors[0];
              $(document).trigger('start_fail.job', [self, options, error.exception]);
            break;
          }
        },
        error: function(jqXHR, status, error) {
          var self = this;
          $(document).trigger('start_error.job', [self, options, extract_error_messages(jqXHR, status, error)]);
        }
      }, options);
      self.request('/sqoop/api/jobs/' + self.id() + '/start', options);
    },
    'stop': function(options) {
      var self = this;
      $(document).trigger('start.job', [options, self]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              $(document).trigger('started.job', [self, options, data]);
            break;
            default:
            case 1:
              self.handle_200_messages(self, data);
              $(document).trigger('stop_fail.job', [self, options, data]);
            break;
          }
        },
        error: function(jqXHR, status, error) {
          var self = this;
          $(document).trigger('stop_error.job', [self, options, extract_error_messages(jqXHR, status, error)]);
        }
      }, options);
      self.request('/sqoop/api/jobs/' + self.id() + '/stop', options);
    },
    'getStatus': function(options) {
      var self = this;
      $(document).trigger('get_status.job', [self, options]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              $(document).trigger('got_status.job', [self, options, data]);
            break;
            default:
            case 1:
              self.handle_200_messages(self, data);
              $(document).trigger('get_status_fail.job', [self, options, data]);
            break;
          }
        },
        error: function(jqXHR, status, error) {
          var self = this;
          $(document).trigger('get_status_error.job', [self, options, extract_error_messages(jqXHR, status, error)]);
        }
      }, options);
      self.request('/sqoop/api/jobs/' + self.id() + '/status', options);
    },
    'handle200Messages': function(data) {
      handle_200_messages(this, data);
    }
  });

  function fetch_jobs(options) {
    $(document).trigger('load.jobs', [options]);
    var request = $.extend({
      url: '/sqoop/api/jobs/',
      dataType: 'json',
      type: 'GET',
      success: fetcher_success('jobs', Job, options),
      error: fetcher_error('jobs', options)
    }, options || {});
    $.ajax(request);
  }

  return {
    'JobModel': JobModel,
    'Job': Job,
    'fetchJobs': fetch_jobs
  }
})($);
