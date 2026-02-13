import subprocess
import boto3
import datetime
import os
def lambda_handler(event, context):
   print("Backup started")
   #mongo_uri = os.environ['MONGO_URI']
   backup_file = f"/tmp/backup-{datetime.datetime.now().strftime('%Y-%m-%d')}.gz"
   #print(f"Using URI: {mongo_uri}")
   print(f"Backup path: {backup_file}")
   try:
       print("Launching mongodump...")
       result = subprocess.run(
           [
               '/opt/bin/mongodump',
               '--host', os.environ['MONGODB_HOST'],
               '--port', os.environ['MONGODB_PORT'],
               '--username', os.environ['MONGODB_USERNAME'],
               '--password', os.environ['MONGODB_PASSWORD'],
               '--authenticationDatabase', os.environ['MONGODB_AUTHSOURCE'],
               '--db', os.environ['MONGODB_DBNAME'],
               '--archive=' + backup_file,
               '--gzip'
           ],
           check=False,
           capture_output=True,
           text=True
       )
       print("mongodump exit code:", result.returncode)
       print("STDOUT:", result.stdout.strip() or "<empty>")
       print("STDERR:", result.stderr.strip() or "<empty>")
       if result.returncode != 0:
           raise RuntimeError(
            f"mongodump failed with code {result.returncode}"
            f"STDERR: {result.stderr.strip()}"
           )
       print("Dump succeeded → uploading to S3")
       s3 = boto3.client('s3')
       s3.upload_file(
           backup_file,
           'chatbot-backups44444',
           os.path.basename(backup_file)
       )
       print("Upload complete")
       os.remove(backup_file)
       return {"status": "success"}
   except Exception as e:
       print(f"Backup failed: {str(e)}")
       import traceback
       print(traceback.format_exc())
       raise
