from sqoop import client
from sqoop.client.connector import Connector
from sqoop.client.connection import Connection
from sqoop.client.job import Job

CONNECTION_FORM_VALUES = {
  'connection.jdbcDriver': 'org.apache.derby.jdbc.EmbeddedDriver',
  'connection.connectionString':'jdbc%3Aderby%3A%2Ftmp%2Ftest',
  'connection.username':'abe',
  'connection.password':'test',
  'connection.jdbcProperties':None
}

JOB_FORM_VALUES = {
  'table.schemaName': None,
  'table.tableName': 'test',
  'table.sql': None,
  'table.columns': 'name',
  'table.partitionColumn': 'id',
  'table.boundaryQuery': None
}

FRAMEWORK_FORM_VALUES = {
  'output.outputFormat': 'TEXT_FILE',
  'output.outputDirectory': '/tmp/test.out',
  'output.storageType': 'HDFS',
  'throttling.extractors': None,
  'throttling.loaders': None,
  'security.maxConnections': None
}

class TestSqoopBase(object):
  def setupClass(self):
    self.client = client.SqoopClient('http://192.168.92.134:12000/sqoop')

  def create_connection(self):
    conn = Connection("test1", 1)
    conn.framework = self.client.get_framework().con_forms
    conn.connector = self.client.get_connectors()[0].con_forms

    for _connector in conn.connector:
      for _input in _connector.inputs:
        _input.value = CONNECTION_FORM_VALUES[_input.name]

    for _framework in conn.framework:
      for _input in _framework.inputs:
        _input.value = FRAMEWORK_FORM_VALUES[_input.name]

    return self.client.create_connection(conn)

class TestSqoopClientConnections(TestSqoopBase):
  def test_create_connection(self):
    conn = self.create_connection()
    self.client.get_connection(conn.id)

  def test_update_connection(self):
    conn = self.create_connection()
    conn = self.client.get_connection(conn.id)
    conn.name = 'james1'
    self.client.update_connection(conn)
    self.client.get_connection(conn.id).name

  def test_delete_connection(self):
    conn = self.create_connection()
    conn = self.client.get_connection(conn.id)
    c.delete_connection(conn)
    c.get_connection(conn.id)

  def test_get_connections(self):
    conn = self.create_connection()
    conns = self.client.get_connections()

class TestSqoopClientJobs(TestSqoopBase):
  def test_create_job(self):
    job = Job("IMPORT", "test1", 1, 1)
    job.framework = self.client.get_framework().job_forms["IMPORT"]
    job.connector = self.client.get_connectors()[0].job_forms["IMPORT"]

    for _connector in job.connector:
      for _input in _connector.inputs:
        _input.value = JOB_FORM_VALUES[_input.name]

    for _framework in job.framework:
      for _input in _framework.inputs:
        _input.value = FRAMEWORK_FORM_VALUES[_input.name]

    self.client.create_job(job)
    self.client.get_job(job.id)

  def test_update_job(self):
    job = self.create_job()
    job = self.client.get_job(conn.id)
    job.name = 'james1'
    self.client.update_job(job)
    self.client.get_job(job.id).name

  def test_delete_job(self):
    job = self.create_job()
    job = self.client.get_job(conn.id)
    self.client.delete_job(job)
    self.client.get_job(job.id)

  def test_get_jobs(self):
    job = self.create_job()
    jobs = self.client.get_jobs()
