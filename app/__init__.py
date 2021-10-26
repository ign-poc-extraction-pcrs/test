from flask import Flask
from app.controllers import pcrs


app = Flask(__name__)

app.register_blueprint(pcrs.pcrs)
