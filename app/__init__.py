from flask import Flask
from app.controllers import pcrs, api, download_lidar


app = Flask(__name__)

app.register_blueprint(pcrs.pcrs)
app.register_blueprint(api.api)
app.register_blueprint(download_lidar.download_lidar)
