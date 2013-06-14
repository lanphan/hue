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


function transform_keys(model, keys_dict) {
  $.each(keys_dict, function(key, new_key) {
    if (key in model) {
      model[new_key] = model[key];
      delete model[key];
    }
  });
  return model;
}

function transform_values(model, func_dict) {
  $.each(func_dict, function(key, f) {
    if (key in model) {
      model[key] = f(key, model[key]);
    }
  });
  return model;
}

function to_form(value) {
  return new FormModel(value);
}

function to_forms(key, value) {
  $.each(value, function(index, form_dict) {
    value[index] = to_form(form_dict);
  });
  return value;
}

function to_input(value) {
  return new InputModel(value);
}

function to_inputs(key, value) {
  $.each(value, function(index, input_dict) {
    value[index] = to_input(input_dict);
  });
  return value;
}

var FormModel = ModelModule({
  'id': -1,
  'inputs': [],
  'name': null,
  'type': null,
  'initialize': function(attrs) {
    var self = this;
    var attrs = $.extend(true, attrs, {});
    attrs = transform_values(attrs, {
      'inputs': to_inputs
    });
    return attrs;
  }
});

var InputModel = ModelModule({
  'id': -1,
  'name': null,
  'type': null,
  'size': -1,
  'sensitive': false,
  'values': null,
  'value': null,
  'initialize': function(attrs) {
    var self = this;
    var attrs = $.extend(true, attrs, {});
    if ('values' in attrs) {
      attrs['values'] = attrs['values'].split(',');
    }
    return attrs;
  }
});

var FrameworkModel = ModelModule({
  'id': 1,
  'job_forms': {
    'IMPORT': [],
    'EXPORT': []
  },
  'con_forms': [],
  'initialize': function(attrs) {
    var self = this;
    var attrs = $.extend(true, attrs, {});
    attrs = transform_keys(attrs, {
      'job-forms': 'job_forms',
      'con-forms': 'con_forms'
    });
    attrs = transform_values(attrs, {
      'con_forms': to_forms,
      'job_forms': function(key, value) {
        transform_values(value, {
          'IMPORT': to_forms,
          'EXPORT': to_forms
        });
        return value;
      }
    });
    return attrs;
  }
});

var ConnectorModel = ModelModule({
  'id': -1,
  'name': null,
  'class': null,
  'job_forms': {
    'IMPORT': [],
    'EXPORT': []
  },
  'con_forms': [],
  'version': null,
  'resources': {},
  'initialize': function(attrs) {
    var self = this;
    var attrs = $.extend(true, attrs, {});
    attrs = transform_keys(attrs, {
      'job-forms': 'job_forms',
      'con-forms': 'con_forms'
    });
    attrs = transform_values(attrs, {
      'con_forms': to_forms,
      'job_forms': function(key, value) {
        transform_values(value, {
          'IMPORT': to_forms,
          'EXPORT': to_forms
        });
        return value;
      }
    });
    return attrs;
  }
});

var ConnectionModel = ModelModule({
  'id': -1,
  'updated': null,
  'created': null,
  'name': null,
  'connector': [],
  'connector_id': 0,
  'framework': [],
  'initialize': function(attrs) {
    var self = this;
    var attrs = $.extend(true, attrs, {});
    attrs = transform_keys(attrs, {
      'connector-id': 'connector_id'
    });
    attrs = transform_values(attrs, {
      'connector': to_forms,
      'framework': to_forms
    });
    return attrs;
  }
});

var JobModel = ModelModule({
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

var SubmissionModel = ModelModule({
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
