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


var submissions = (function($) {
  var SubmissionModel = koify.Model.extend({
    'job': -1,
    'progress': 0.0,
    'status': 'RUNNING',
    'creation_date': null,
    'last_update_date': null,
    'external_id': null,
    'external_link': null,
    'initialize': function(attrs) {
      var self = this;
      var attrs = $.extend(true, attrs, {});
      attrs = transform_keys(attrs, {
        'creation-date': 'creation_date',
        'last-update-date': 'last_update_date',
        'external-id': 'external_id',
        'external-link': 'external_link'
      });
      return attrs;
    }
  });


  var Submission = koify.Node.extend({
    'identifier': 'submission',
    'persists': false,
    'modelClass': SubmissionModel,
    'base_url': '/sqoop/api/submissions/',
    'initialize': function() {
      var self = this;
      self.parent.initialize.apply(self, arguments);
      self.createdFormatted = ko.computed(function() {
        if (self.creation_date()) {
          return moment(self.creation_date()).format('MM/DD/YYYY hh:mm A');
        } else {
          return 0;
        }
      });
      self.updatedFormatted = ko.computed(function() {
        if (self.last_update_date()) {
          return moment(self.last_update_date()).format('MM/DD/YYYY hh:mm A');
        } else {
          return 0;
        }
      });
      self.errors = ko.observableArray();
      self.warnings = ko.observableArray();
      self.selected = ko.observable();
    }
  });

  function fetch_submissions(options) {
    $(document).trigger('load.submissions', [options]);
    var request = $.extend({
      url: '/sqoop/api/submissions/',
      dataType: 'json',
      type: 'GET',
      success: fetcher_success('submissions', Submission, options),
      error: fetcher_error('submissions', options)
    }, options || {});
    $.ajax(request);
  }

  return {
    'SubmissionModel': SubmissionModel,
    'Submission': Submission,
    'fetchSubmissions': fetch_submissions
  }
})($);
