from flask import Flask
from app.controllers import pcrs, api


app = Flask(__name__)

app.register_blueprint(pcrs.pcrs)
app.register_blueprint(api.api)
