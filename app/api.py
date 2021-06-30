import json

from flask import Blueprint, request, jsonify, abort, make_response
from flask_cors import CORS, cross_origin
from .modules import ncbi
from .modules.interactions import get_edges, get_interactions

api = Blueprint('api', __name__, url_prefix='/api')
cors = CORS(api)


algorithms = [
    {'name': 'Node2Vec (+kmeans)',      'modularity':0.653, 'resource': 'n2v'},
    {'name': 'Clauset-Newman-Moore',    'modularity':0.616, 'resource': 'cnm'},
    {'name': 'Fluid Communities',       'modularity':0.041, 'resource': 'fluidc'},
    {'name': 'Girvan-Newmann',          'modularity':0.633, 'resource': 'gn'},
    {'name': 'Kernighan–Lin',           'modularity':0.061, 'resource': 'kl'},
    {'name': 'Louvain',                 'modularity':0.688, 'resource': 'lvn'},
    {'name': 'Spectral clustering',     'modularity':0.111, 'resource': 'sc'},
]


def _get_resource(resource):
    with open(f'partitions/{resource}.json', 'r') as res:
        return res.read()


@api.route('/')
@cross_origin()
def status():
    return jsonify({'status': 'up'})


@api.route('/algorithms')
@cross_origin()
def index():
    """
    Returns the list of the algorithms of community detection. 
    Each item of the list contains the name of the algorithm, 
    the modularity obtained and the resource ID to access to
    the graph partition.
    """
    return jsonify(algorithms)


@api.route("/algorithms/<resource>")
@cross_origin()
def show(resource):
    """
    Given a resource that indicates a partition produced by an
    algorithm, returns all the communities of that partition. 
    """
    resources = [ a.get('resource') for a in algorithms ]
    if resource not in resources:
        abort(404)

    partition = _get_resource(resource)
    
    # this is much faster than loading the json file into
    # a dict with json.loads and then transforming the dict
    # to a json response with jsonify (from 200ms to 30ms). 

    try:
        resp = make_response(partition, 200)
        resp.headers['Content-Type'] = 'application/json'
        return resp
    except:
        abort(500)


@api.route("/gene/<geneID>")
@cross_origin()
def show_gene(geneID):
    """
    Retrieve gene informations from NCBI Gene database. 
    """
    info = ncbi.get_gene_informations(geneID)
    return jsonify(info)


@api.route("algorithms/<resource>/interactions")
@cross_origin()
def retrieve_interactions(resource):

    # since the clusters specified in the request
    # are index of an ascending sorting of the partition, 
    # we need to sort the partition. 
    # TODO: associate an index to each community to avoid 
    # this problem and save computational time.
    partition = _get_resource(resource)
    partition = json.loads(partition)
    partition.sort(key=lambda x: len(x))

    # extract the communities from the query and start to 
    # search the interactions between communities. 
    query = request.args.get('communities')
    if (not query):
        abort(400)
    
    communities = query.split(',')
    ncommunities = len(communities)
    interactions = []
    edges = get_edges()

    for i in range(ncommunities):
        for j in range(i+1, ncommunities):
            idx1 = int(communities[i].strip())
            idx2 = int(communities[j].strip())
            c1c2 = get_interactions(partition, idx1, idx2, edges)
            interactions.append(c1c2)            

    return jsonify(interactions)