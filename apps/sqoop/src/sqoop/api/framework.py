#!/usr/bin/env python
# Licensed to Cloudera, Inc. under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  Cloudera, Inc. licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

try:
  import json
except ImportError:
  import simplejson as json
import logging
import socket

from django.http import HttpResponse
from django.utils.translation import ugettext as _

from sqoop import client, conf
from desktop.lib.exceptions_renderable import PopupException
from desktop.lib.rest.http_client import RestException
from exception import handle_rest_exception


LOG = logging.getLogger(__name__)


def framework(request):
  response = {
    'status': 0,
    'errors': None,
    'framework': None
  }
  if request.method == 'GET':
    try:
      c = client.SqoopClient(conf.SERVER_URL.get())
      response['framework'] = c.get_framework().to_dict()
    except RestException, e:
      handle_rest_exception(e, _('Could not get framework.'))
    return HttpResponse(json.dumps(response), mimetype="application/json")
  else:
    raise PopupException(_('GET request required.'))
