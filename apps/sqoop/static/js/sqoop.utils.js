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


//// Get collections utils
function fetcher_success(name, Node, options) {
  return function(data) {
    switch(data.status) {
      case 0:
        var nodes = [];
        $.each(data[name], function(index, model_dict) {
          var node = new Node({modelDict: model_dict});
          nodes.push(node);
        });
        $(document).trigger('loaded.' + name, [nodes, options]);
      break;
      default:
      case 1:
        $(document).trigger('load_error.' + name, [options, data]);
      break;
    }
  };
}

function fetcher_error(name, options) {
  return function(jqXHR, status, error) {
    switch(jqXHR.getResponseHeader('content-type')) {
      case 'application/json':
      case 'application/x-javascript':
      case 'text/javascript':
      case 'text/x-javascript':
      case 'text/x-json':
      var response = $.parseJSON(jqXHR.responseText);
      if (response.detail == 61) {
        $(document).trigger('connection_error.sqoop', [jqXHR, name, options])
      }
      break;
    }
  };
}

//// Component utils
function handle_200_messages(node, data) {
  var errors = data.errors;
  node.warnings.removeAll();
  node.errors.removeAll();
  $.each(errors, function(component, dict) {
    $.each(dict['messages'], function(resource, message_dict) {
      switch(message_dict.status) {
        case 'ACCEPTABLE':
        node.warnings.push(message_dict.message);
        break;

        default:
        case 'UNACCEPTABLE':
        node.errors.push(message_dict.message);
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