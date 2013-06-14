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


function handle_200_messages(self, data) {
  var errors = data.errors;
  self.warnings.removeAll();
  self.errors.removeAll();
  $.each(errors, function(component, dict) {
    $.each(dict['messages'], function(resource, message_dict) {
      switch(message_dict.status) {
        case 'ACCEPTABLE':
        self.warnings.push(message_dict.message);
        break;

        default:
        case 'UNACCEPTABLE':
        self.errors.push(message_dict.message);
        break;
      }
    });
  });
}

function extract_error_messages(jqXHR, status, error) {
  var error_response = {
    status_code: jqXHR.status_code,
    message: null,
    detail: null
  };
  if (jqXHR.responseJSON) {
    var response = jqXHR.responseJSON;
    console.log(response);
    if (response.detail) {
      try {
        // See if we received an error from sqoop server
        detail = $.parseJSON(response.detail);
        error_response.message = detail.message;
        error_response.detail = detail.cause;
        return error_response;
      } catch(ex) {
        // not a sqoop server error so it is not JSON.
        error_response.message = response.message;
        error_response.message = response.detail;
      }
    }
  }
  error_response.message = jqXHR.responseText;
  return error_response;
}

function request(url, options) {
  var self = this;
  var request = $.extend({
    url: url,
    dataType: 'json',
    type: 'GET',
    success: $.noop,
    error: $.noop
  }, options || {});
  $.ajax(request);
}

function initialize(options) {
  var self = this;
  self.model = options.model;
  if (options.model) {
    if ('__ko_mapping__' in self) {
      ko.mapping.fromJS(self.model, {}, self);
    } else {
      $.extend(self, ko.mapping.fromJS(self.model));
    }
  }
}

function _load(Model, name, base_url, check_id) {
  return function(options) {
    var self = this;
    if (!check_id || self.id() > -1) {
      $(document).trigger('load.' + name, [options, self]);
      var options = $.extend({
        success: function(data) {
          switch(data.status) {
            case 0:
              self.initialize({modelDict: data[name]});
              $(document).trigger('loaded.' + name, [options, self]);
            break;
            default:
            case 1:
              handle_200_messages(self, data);
              $(document).trigger('load_error.'  + name, [options, self, data]);
            break;
          }
        }
      }, options);
      var _url = base_url + (('id' in self) ? self.id() : '');
      self.request(_url, options);
      return true;
    } else {
      return false;
    }
  }
}

function _save(name, base_url) {
  return function(options) {
    var self = this;
    $(document).trigger('save.' + name, [options, self]);
    var _data = {};
    _data[name] = ko.mapping.toJSON(self);
    var options = $.extend({
      type: 'POST',
      data: _data,
      success: function(data) {
        switch(data.status) {
          case 0:
            $(document).trigger('saved.' + name, [options, self, data]);
          break;
          default:
          case 1:
            handle_200_messages(self, data);
            $(document).trigger('save_fail.' + name, [options, self, data]);
          break;
        }
      }
    }, options);
    var _url = base_url + (('id' in self && self.id() > 0) ? self.id() : '');
    self.request(_url, options);
  }
}

function _clone(name, base_url) {
  return function(options) {
    var self = this;
    if (self.id() > -1) {
      $(document).trigger('clone.' + name, [options, self]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              $(document).trigger('cloned.' + name, [options, self, data]);
            break;
            default:
            case 1:
              handle_200_messages(self, data);
              $(document).trigger('clone_fail.' + name, [options, self, data]);
            break;
          }
        }
      }, options);
      var _url = base_url + (('id' in self && self.id() > 0) ? self.id() : '') + '/clone';
      self.request(_url, options);
      return true;
    } else {
      return false;
    }
  }
}

function _delete(name, base_url) {
  return function(options) {
    var self = this;
    if (self.id() > -1) {
      $(document).trigger('delete.' + name, [options, self]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              $(document).trigger('deleted.' + name, [options, data, self]);
            break;
            default:
            case 1:
              handle_200_messages(self, data);
              $(document).trigger('delete_fail.' + name, [options, data, self]);
            break;
          }
        }
      }, options);
      var _url = base_url + (('id' in self && self.id() > 0) ? self.id() : '') + '/delete';
      self.request(_url, options);
      return true;
    } else {
      return false;
    }
  }
}


var NodeModule = (function($, undefined) {
  return function(name, model_class, url_base, crud, persisted, extend) {
    var extend = extend || {};
    extend.modelClass = model_class;
    extend.errors = ko.observableArray();
    extend.warnings = ko.observableArray();
    extend.request = request;
    extend.initialize = initialize;
    extend.load = _load(model_class, name, url_base, persisted);
    if (crud) {
      extend.save = _save(name, url_base);
      extend.delete = _delete(name, url_base);
      extend.clone = _clone(name, url_base);
      if (persisted) {
        extend.persisted = ko.computed(function() {
          return 'id' in self && self.id() > -1;
        });
      }
    }
    module.prototype = new (Module())();
    module.prototype.constructor = module;
    function module() {
      var self = this;
      self.options = options;
      self.initialize(options);
    };
    $.extend(module.prototype, extend);
    return module;
  };
})($, undefined);

var Framework = NodeModule('framework', FrameworkModel, '/sqoop/api/framework/', false, false);

var Connector = NodeModule('connector', ConnectorModel, '/sqoop/api/connectors/', false, true);

var Connection = NodeModule('connection', ConnectionModel, '/sqoop/api/connections/', true, true);

var Job = NodeModule('job', JobModel, '/sqoop/api/jobs/', true, true, {
  initialize: function() {
    var self = this;
    initialize.apply(self, arguments);
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
  },
  start: function(options) {
    var self = this;
    if (self.id() > -1) {
      $(document).trigger('start.job', [options, self]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              var model = new SubmissionModel(data.submission);
              var node = new Submission({model: model});
              self.submission(node);
              $(document).trigger('started.job', [options, model, node]);
            break;
            default:
            case 1:
              var error = data.errors[0];
              $(document).trigger('start_fail.job', [options, error.exception, self]);
            break;
          }
        },
        error: function(jqXHR, status, error) {
          var self = this;
          $(document).trigger('start_error.job', [options, extract_error_messages(jqXHR, status, error), self]);
        }
      }, options);
      self.request('/sqoop/api/jobs/' + self.id() + '/start', options);
      return true;
    } else {
      return false;
    }
  },
  stop: function(options) {
    var self = this;
    if (self.id() > -1) {
      $(document).trigger('start.job', [options, self]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              $(document).trigger('started.job', [options, data, self]);
            break;
            default:
            case 1:
              handle_200_messages(self, data);
              $(document).trigger('stop_fail.job', [options, data, self]);
            break;
          }
        },
        error: function(jqXHR, status, error) {
          var self = this;
          $(document).trigger('stop_error.job', [options, extract_error_messages(jqXHR, status, error), self]);
        }
      }, options);
      self.request('/sqoop/api/jobs/' + self.id() + '/stop', options);
      return true;
    } else {
      return false;
    }
  },
  getStatus: function(options) {
    var self = this;
    if (self.id() > -1) {
      $(document).trigger('get_status.job', [options, self]);
      var options = $.extend({
        type: 'POST',
        success: function(data) {
          switch(data.status) {
            case 0:
              $(document).trigger('got_status.job', [options, data, self]);
            break;
            default:
            case 1:
              handle_200_messages(self, data);
              $(document).trigger('get_status_fail.job', [options, data, self]);
            break;
          }
        },
        error: function(jqXHR, status, error) {
          var self = this;
          $(document).trigger('get_status_error.job', [options, extract_error_messages(jqXHR, status, error), self]);
        }
      }, options);
      self.request('/sqoop/api/jobs/' + self.id() + '/status', options);
    return true;
    } else {
      return false;
    }
  },
});

var Submission = NodeModule({

});
