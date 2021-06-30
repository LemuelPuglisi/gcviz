from flask import Flask, jsonify
from app.api import api
from app.views import views

def create_app():
	app = Flask(__name__, static_folder='static', template_folder='templates') 
	app.register_blueprint(api)
	app.register_blueprint(views)
	return app

if __name__ == '__main__':

	app = create_app()
	app.config['CORS_HEADERS'] = 'Content-type'

	@app.errorhandler(400)
	def page_not_found(error):
		return jsonify({'error': 'Bad request'})

	@app.errorhandler(404)
	def page_not_found(error):
		return jsonify({'error': 'Not found'})


	@app.errorhandler(500)
	def page_not_found(error):
		return jsonify({'error': 'Server error'})

	app.run(host="0.0.0.0", debug=False)