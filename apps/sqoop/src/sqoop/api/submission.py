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
from decorators import get_submission_or_exception
from desktop.lib.exceptions_renderable import PopupException
from desktop.lib.rest.http_client import RestException
from exception import handle_rest_exception
from utils import list_to_dict


LOG = logging.getLogger(__name__)


def get_submissions(request):
  response = {
    'status': 0,
    'errors': None,
    'submissions': []
  }
  status = request.GET.get('status', 'all').split(',')
  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    submissions = c.get_submissions()
  except RestException, e:
    handle_rest_exception(e, _('Could not get submissions.'))
  response['submissions'] = list_to_dict(submissions)
  return HttpResponse(json.dumps(response), mimetype="application/json")

def submissions(request):
  if request.method == 'GET':
    return get_submissions(request)
  else:
    raise PopupException(_('GET request required.'))
