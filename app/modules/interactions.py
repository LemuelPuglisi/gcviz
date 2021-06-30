def get_interactions(sorted_partition, idxc1, idxc2, edges=None): 
    """
    Given a sorted partition (clusters ordered in ascendent manner), two clusters
    are specified through their indexes in the sorted partition. This function 
    returns the interaction (edges inter-cluster) between the two communities.  
    """
    if (edges is None):
        edges = get_edges()

    is_not_edge = lambda uid: '-' not in str(uid)

    # using hashmap instead of lists will guarantee a smaller
    # time complexity. 

    d1 = {}
    for t in sorted_partition[idxc1]:
        key = t.get('data').get('id') 
        if (is_not_edge(key)):
            d1[key] = 1

    d2 = {}
    for t in sorted_partition[idxc2]:
        key = t.get('data').get('id') 
        if (is_not_edge(key)):
            d2[key] = 1    

    c1c2 = {'c1': idxc1, 'c2': idxc2, 'edges': []}

    for edge in edges:
        source = int(edge[0])
        target = int(edge[1])

        if ( (d1.get(source, 0) and d2.get(target, 0)) or (d2.get(source, 0) and d1.get(target, 0))):
            c1c2.get('edges').append((source, target))

    return c1c2


def get_edges():
    with open('dataset/gene_edges.tsv', 'r') as f: 
        edges = f.readlines()
        edges = [ _extract_edge(l) for l in edges[1:] ]
        return edges

def _extract_edge(l: str) -> tuple:
    tokens = l.split('\t')
    source = int(tokens[0])
    target = int(tokens[1])
    return source, target 


