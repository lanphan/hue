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

var Module = (function($, undefined) {
  return function(extend) {
    var module = function(options) {
      var self = this;
      self.options = options;
      self.initialize(options);
    };

    $.extend(module.prototype, {
      initialize: function(options) {
        var self = this;
        if (options.modelDict) {
          self.model = new self.modelClass(options.modelDict);
        } else {
          self.model = $.extend(true, options.model, {});
        }
      }
    }, extend);

    return module;
  };
})($, undefined);

var ModelModule = (function($, undefined) {
  return function(extend) {
    var module = function(attrs) {
      var self = this;
      var attrs = attrs || {};
      $.extend(self, self.initialize(attrs));
      $.extend(self, self);
    };

    $.extend(module.prototype, {
      initialize: function(attrs) {
        return attrs;
      },

      toString: function() {
        var self = this;
        return JSON.stringify(self, null, '\t');
      },

      copy: function() {
        var self = this;
        var model = $.extend(true, {}, self);
        return model;
      }
    }, extend);

    return module;
  };
})($, undefined);

var CollectionModule = (function($, undefined) {
  return function(extend) {
    var module = function(options) {
      var self = this;
      self.nodes = options.nodes;
      self.options = options;
      self.initialize(options);
    };

    $.extend(module.prototype, extend);

    return module;
  };
})($, undefined);
