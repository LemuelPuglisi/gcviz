import requests 

from xml.etree import ElementTree

def get_gene_informations(geneID):
    """
    Get gene informations from the NCBI database using 
    esummary e-util. 
    """
    xml = fetch_from_ncbi(geneID)
    tree = ElementTree.fromstring(xml)
    info = extract_info_from_xml(tree)
    info['Entrez ID'] = geneID
    return info    


def fetch_from_ncbi(geneID):
    """
    Make a call to the NCBI esummary endpoint and retrieve
    the XML response
    """
    headers = {'Content-Type': 'application/xml'}
    base_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&'
    gene_url = base_url + f'id={geneID}'
    response = requests.get(gene_url, headers=headers)
    return response.content
    
    
def extract_info_from_xml(tree):
    """
    Parse the XML response to retrieve informations 
    """
    dss = tree.find('DocumentSummarySet')
    ds  = dss.find('DocumentSummary')
    return {
        'name': ds.find('Name').text, 
        'description': ds.find('Description').text, 
        'chromosome': ds.find('Chromosome').text, 
        'genetic_source': ds.find('GeneticSource').text, 
        'map_location': ds.find('MapLocation').text,
        'alias': ds.find('OtherAliases').text, 
        'nomenclature_symbol': ds.find('NomenclatureSymbol').text, 
        'nomenclature_name': ds.find('NomenclatureName').text, 
        'organism': ds.find('Organism').find('ScientificName').text
    }