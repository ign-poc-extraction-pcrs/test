from flask import Blueprint, render_template, request, redirect, url_for, flash


pcrs = Blueprint('pcrs', __name__, url_prefix='/')


@pcrs.route('/')
def index():
    return redirect(url_for('pcrs.version1'))


@pcrs.route('/version1')
def version1():
    return render_template('pages/version1.html')


@pcrs.route('/version2')
def version2():
    return render_template('pages/version2.html')

