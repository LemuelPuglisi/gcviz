import pickle
import json

def partition_to_cytospace_json(G, partition):
    smap = get_node_symbols_mapper()
    json_partition = [] 
    for cluster in partition:
        subgraph = G.subgraph(cluster)
        nodes = [ node for node in subgraph.nodes() ]
        edges = [ edge for edge in subgraph.edges() ]
        cluster_data =  [ _make_node_data(u, smap) for u in nodes ]
        cluster_data += [ _make_edge_data(u, v) for u, v in edges ]
        json_partition.append(cluster_data)
    return json.dumps(json_partition)


def get_node_symbols_mapper():
    with open('hugo-map/gene-id-symbol-map.pickle', 'rb') as f:
        return pickle.load(f)


def _make_node_data(u, smap):
    return {'data': {'id': int(u), 'symbol': smap.get(u)}}


def _make_edge_data(u, v):
    return {'data': {
        'id': f'{u}-{v}', 
        'source': u, 
        'target': v
    }}