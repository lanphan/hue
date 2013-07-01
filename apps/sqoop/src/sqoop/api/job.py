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
from sqoop.client.exception import SqoopException
from decorators import get_job_or_exception
from desktop.lib.exceptions import StructuredException
from desktop.lib.exceptions_renderable import PopupException
from desktop.lib.rest.http_client import RestException
from exception import handle_rest_exception
from utils import list_to_dict


LOG = logging.getLogger(__name__)


def get_jobs(request):
  response = {
    'status': 0,
    'errors': None,
    'jobs': []
  }
  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    jobs = c.get_jobs()
  except RestException, e:
    handle_rest_exception(e, _('Could not get jobs.'))
  response['jobs'] = list_to_dict(jobs)
  return HttpResponse(json.dumps(response), mimetype="application/json")

def create_job(request):
  if request.method != 'POST':
    raise PopupException(_('POST request required.'))

  response = {
    'status': 0,
    'errors': None,
    'job': None
  }
  
  if 'job' not in request.POST:
    raise StructuredException(code="INVALID_REQUEST_ERROR", message=_('Error saving job'), data={'errors': 'job is missing.'}, error_code=400)
  
  d = json.loads(request.POST['job'])
  job = client.Job.from_dict(d)
  
  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    response['job'] = c.create_job(job).to_dict()
  except RestException, e:
    handle_rest_exception(e, _('Could not create job.'))
  except SqoopException, e:
    response['status'] = 1
    response['errors'] = e.to_dict()
  return HttpResponse(json.dumps(response), mimetype="application/json")

def update_job(request, job):
  if request.method != 'POST':
    raise PopupException(_('POST request required.'))

  response = {
    'status': 0,
    'errors': None,
    'job': None
  }

  if 'job' not in request.POST:
    raise StructuredException(code="INVALID_REQUEST_ERROR", message=_('Error saving job'), data={'errors': 'job is missing.'}, error_code=400)
  
  job.update_from_dict(json.loads(request.POST['job']))
  
  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    response['job'] = c.update_job(job).to_dict()
  except RestException, e:
    handle_rest_exception(e, _('Could not update job.'))
  except SqoopException, e:
    response['status'] = 1
    response['errors'] = e.to_dict()
  return HttpResponse(json.dumps(response), mimetype="application/json")


def jobs(request):
  if request.method == 'GET':
    return get_jobs(request)
  elif request.method == 'POST':
    return create_job(request)
  else:
    raise PopupException(_('GET or POST request required.'))

@get_job_or_exception()
def job(request, job):
  response = {
    'status': 0,
    'errors': None,
    'job': None
  }
  if request.method == 'GET':
    response['job'] = job.to_dict()
    return HttpResponse(json.dumps(response), mimetype="application/json")
  elif request.method == 'POST':
    return update_job(request, job)
  else:
    raise PopupException(_('GET or POST request required.'))

@get_job_or_exception()
def job_clone(request, job):
  if request.method != 'POST':
    raise PopupException(_('POST request required.'))

  response = {
    'status': 0,
    'errors': None,
    'job': None
  }

  job.id = -1
  job.name = '%s-copy' % job.name
  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    response['job'] = c.create_job(job).to_dict()
  except RestException, e:
    handle_rest_exception(e, _('Could not clone job.'))
  except SqoopException, e:
    response['status'] = 1
    response['errors'] = e.to_dict()
  return HttpResponse(json.dumps(response), mimetype="application/json")

@get_job_or_exception()
def job_delete(request, job):
  if request.method != 'POST':
    raise PopupException(_('POST request required.'))

  response = {
    'status': 0,
    'errors': None,
    'job': None
  }

  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    c.delete_job(job)
  except RestException, e:
    handle_rest_exception(e, _('Could not delete job.'))
  except SqoopException, e:
    response['status'] = 1
    response['errors'] = e.to_dict()
  return HttpResponse(json.dumps(response), mimetype="application/json")

@get_job_or_exception()
def job_start(request, job):
  if request.method != 'POST':
    raise PopupException(_('POST request required.'))

  response = {
    'status': 0,
    'errors': None,
    'submission': None
  }

  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    response['submission'] = c.start_job(job).to_dict()
  except RestException, e:
    handle_rest_exception(e, _('Could not start job.'))
  except SqoopException, e:
    response['status'] = 1
    response['errors'] = [e.to_dict()]
  return HttpResponse(json.dumps(response), mimetype="application/json")

@get_job_or_exception()
def job_stop(request, job):
  if request.method != 'POST':
    raise PopupException(_('POST request required.'))

  response = {
    'status': 0,
    'errors': None,
    'submission': None
  }

  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    response['submission'] = c.stop_job(job).to_dict()
  except RestException, e:
    handle_rest_exception(e, _('Could not stop job.'))
  except SqoopException, e:
    response['status'] = 1
    response['errors'] = e.to_dict()
  return HttpResponse(json.dumps(response), mimetype="application/json")

@get_job_or_exception()
def job_status(request, job):
  if request.method != 'GET':
    raise PopupException(_('GET request required.'))

  response = {
    'status': 0,
    'errors': None,
    'submission': None
  }

  try:
    c = client.SqoopClient(conf.SERVER_URL.get())
    response['submission'] = c.get_job_status(job).to_dict()
  except RestException, e:
    handle_rest_exception(e, _('Could not get job status.'))
  except SqoopException, e:
    response['status'] = 1
    response['errors'] = e.to_dict()
  return HttpResponse(json.dumps(response), mimetype="application/json")
