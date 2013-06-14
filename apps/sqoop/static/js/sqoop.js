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


//// Menu items
function highlightMainMenu(mainSection) {
  $(".nav-pills li").removeClass("active");
  $("a[href='#" + mainSection + "']").parent().addClass("active");
}

function highlightMenu(section) {
  $(".nav-list li").removeClass("active");
  $("li[data-section='" + section + "']").addClass("active");
}

function showMainSection(mainSection) {
  if ($("#" + mainSection).is(":hidden")) {
    $(".mainSection").hide();
    $("#" + mainSection).show();
    highlightMainMenu(mainSection);
  }
}

function showSection(mainSection, section) {
  showMainSection(mainSection);
  if ($("#" + section).is(":hidden")) {
    $(".section").hide();
    $("#" + section).show();
    highlightMenu(section);
  }
}

function showSubsection(mainSection, section, subSection) {
  showSection(mainSection, section);
  if ($("#" + subSection).is(":hidden")) {
    $(".subSection").hide();
    $("#" + subSection).show();
  }
}


//// Constructors
function create_connector(attrs, options) {
  var options = options || {};
  options.modelDict = attrs;
  var node = new connectors.Connector(options);
  return node;
}

function create_connection(attrs, options) {
  var options = options || {};
  options.modelDict = attrs;
  var node = new connections.Connection(options);
  return node;
}


function create_job(attrs, options) {
  var options = options || {};
  options.modelDict = attrs;
  var node = new jobs.Job(options);
  return node;
}


//// View Models
var viewModel = new (function() {
  var self = this;

  self.framework = ko.observable();
  self.connectors = ko.observableArray();
  self.connector = ko.observable();
  self.connections = ko.observableArray();
  self.connection = ko.observable();
  self.jobs = ko.observableArray();
  self.filter = ko.observable("");
  self.filteredJobs = ko.computed(function() {
    return ko.utils.arrayFilter(self.jobs(), function (job) {
      return job.name().toLowerCase().indexOf(self.filter().toLowerCase()) > -1;
    });
  });
  self.selectedJobs = ko.computed(function() {
    return ko.utils.arrayFilter(self.jobs(), function (job) {
      return job.selected();
    });
  });
  self.job = ko.computed(function() {
    if (self.selectedJobs().length > 0) {
      return self.selectedJobs()[0];
    }
    return null;
  });
  self.allJobsSelected = ko.computed(function () {
    return self.selectedJobs().length > 0 && self.selectedJobs().length == self.jobs().length;
  });
  self.submissions = ko.observableArray();
  self.createConnection = ko.observable();
  self.isDirty = ko.observable(false);
  self.isLoading = ko.computed(function() {
    return !self.framework() && self.connectors().length == 0;
  });


  // Update forms for connectors, jobs, and connections.
  // In sqoop, the connector and framework provides
  // attributes that need to be filled in for connections 
  // and jobs. The framework and connector will provide
  // different forms for IMPORT and EXPORT jobs.
  self.framework.subscribe(function(value) {
    // We assume that the framework components
    // are not going to change so we do not update connection
    // and job objects unless they lack forms.
    if (value) {
      if (self.connection() && self.connection().framework().length == 0) {
        self.connection().framework(value.con_forms());
      }
      if (self.job() && self.job().framework().length == 0) {
        var type = self.job().type().toUpperCase();
        self.job().framework(value.job_forms[type]());
      }
    }
  });

  self.connector.subscribe(function(value) {
    // We assume that the connectors component
    // are not going to change so we do not update connection
    // and job objects unless they lack forms.
    if (value) {
      if (self.connection() && self.connection().connector().length == 0) {
        self.connection().connector(value.con_forms());
      }
      if (self.job() && self.job().connector().length == 0) {
        var type = self.job().type().toUpperCase();
        self.job().connector(value.job_forms[type]());
      }
    }
  });

  // Forms are swapped between IMPORT and EXPORT types.
  // Use of "beforeChange" subscription event to 
  // remove subscriptions and help with swapping.
  var job_type_subscriptions = [];
  var old_connector_forms = {
    'IMPORT': null,
    'EXPORT': null
  };
  var old_framework_forms = {
    'IMPORT': null,
    'EXPORT': null
  };
  self.job.subscribe(function(old_job) {
    if (job_type_subscriptions) {
      $.each(job_type_subscriptions, function(index, subscription) {
        subscription.dispose();
      });
    }
  }, self, "beforeChange");
  self.job.subscribe(function(job) {
    if (job) {
      var type = job.type().toUpperCase();

      if (self.connector() && job.connector().length == 0) {
        job.connector(self.connector().job_forms[type]());
      }

      if (self.framework() && job.framework().length == 0) {
        job.framework(self.framework().job_forms[type]());
      }

      job_type_subscriptions.push(job.type.subscribe(function(new_type) {
        var connector = old_connector_forms[new_type] || self.connector().job_forms[new_type]();
        var framework = old_framework_forms[new_type] || self.framework().job_forms[new_type]();
        old_connector_forms[new_type] = null;
        old_framework_forms[new_type] = null;
        job.connector(connector);
        job.framework(framework);
      }));

      job_type_subscriptions.push(job.type.subscribe(function(old_type) {
        if (job.connector().length > 0) {
          old_connector_forms[old_type] = job.connector();
        }
        if (job.framework().length > 0) {
          old_framework_forms[old_type] = job.framework();
        }
      }, self, "beforeChange"));
    }
  });

  self.connection.subscribe(function() {
    if (self.connection()) {
      if (self.connector() && self.connection().connector().length == 0) {
        self.connection().connector(self.connector().con_forms());
      }
      if (self.framework() && !self.connection().framework().length == 0) {
        self.connection().framework(self.framework().con_forms());
      }
    }
  });


  self.newConnection = function() {
    var self = this;
    var conn = create_connection();
    self.connections.push(conn);
    self.connection(conn);
    self.createConnection(true);
  };

  self.saveConnection = function() {
    var connection = self.connection();
    if (connection) {
      connection.connector_id(self.connector().id());
      connection.save();
      $(document).one('saved.connection', function(){window.history.back();});
    }
  };

  self.chooseConnectionById = function(id) {
    $.each(self.connections(), function(index, conn) {
      if (conn.id() == id) {
        self.connection(conn)
      }
    });
  };

  self.newJob = function() {
    var self = this;
    self.job(create_job());
  };

  self.saveJob = function() {
    var job = self.job();
    if (job) {
      job.connector_id(self.connector().id());
      job.connection_id(self.connection().id());
      job.save();
    }
  };

  self.chooseJobById = function(id) {
    $.each(self.jobs(), function(index, job) {
      if (job.id() == id) {
        job.selected(true);
      }
    });
  };

  self.toggleAllJobsSelected = function() {
    if (!self.allJobsSelected()) {
      self.selectAllJobs();
    } else {
      self.deselectAllJobs();
    }
  }

  self.selectAllJobs = function() {
    $.each(self.jobs(), function(index, value) {
      value.selected(true);
    });
  },
  self.deselectAllJobs = function() {
    $.each(self.jobs(), function(index, value) {
      value.selected(false);
    });
  },

  self.label = function(component, name) {
    var self = this;
    return self[component]().resources[name + '.label'];
  };
})();

//// Event handling
function set_framework(e, framework, options) {
  viewModel.framework(framework);
}

function set_connectors(e, connectors, options) {
  viewModel.connectors(connectors);
  if (viewModel.connectors().length > 0) {
    viewModel.connector(viewModel.connectors()[0]);
  }
}

function set_connections(e, connections, options) {
  viewModel.connections(connections);
  if (viewModel.connections().length > 0) {
    viewModel.connection(viewModel.connections()[0]);
  }
}

function set_jobs(e, jobs, options) {
  viewModel.jobs.removeAll();
  viewModel.jobs(jobs);
}

function set_submissions(e, submissions, options) {
  viewModel.submissions.removeAll();
  viewModel.submissions(submissions);
}

$(document).on('loaded.framework', set_framework);
$(document).on('loaded.connectors', set_connectors);
$(document).on('loaded.connections', set_connections);
$(document).on('loaded.jobs', set_jobs);
$(document).on('loaded.submissions', set_submissions);

$(document).on('saved.connection', function(){ connections.fetchConnections(); });
$(document).on('saved.job', function() { jobs.fetchJobs(); });
$(document).on('cloned.connection', function(){ connections.fetchConnections(); });
$(document).on('cloned.job', function() { jobs.fetchJobs(); });
$(document).on('deleted.connection', function(){ connections.fetchConnections(); });
$(document).on('deleted.job', function() { jobs.fetchJobs(); });
