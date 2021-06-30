import randomColor from "./RandomColor.js"; 
import { makeCommunitySpecifiStyle } from "./Utils.js"; 

export let appState = {

    algorithms: [], 
    
    algorithm: 'n2v',
    partition: null, 
    communityIndexes: [], 
    interactionEdges: [], 
    communitiesStyle: new Map(),  

    /**
     * Fetch all the algorithms available from the server. 
     * 
     * @returns {Promise}
     */
    fetchAlgorithms: function () {
        return new Promise((resolve, reject) => {
            fetch('/api/algorithms')
                .then(response => response.json())
                .then(algorithms => {
                    this.algorithms = algorithms; 
                    resolve(algorithms); 
                })
                .catch(error => reject(error))    
        })
    }, 

    /**
     * Given a resource (Algorithm identifier), fetch the 
     * partition generated by the algorithm. The partition 
     * is sorted in an ascendant manner. The index of a 
     * community in this sorted partition will be its unique 
     * identifier (communities dimensions are static).  
     * 
     * @param {string} resource 
     * @returns {Promise}
     */
    fetchPartitionFromResource: function(resource) {
        return new Promise((resolve, reject) => {
            fetch(`/api/algorithms/${resource}`)
                .then(response => response.json())
                .then(partition => {
                    this.algorithm = resource; 
                    this.partition = this._sortCommunitiesByDimension(partition);
                    this.removeAllCommunities();
                    this.removeAllInteractions(); 
                    const firstCommunityToDisplay = Math.floor(partition.length / 1.2);
                    this.appendCommunity(firstCommunityToDisplay)
                        .then(() => resolve(this.partition))
                })
                .catch(error => reject(error))
        })
    }, 

    /**
     * Given a community index (with respect to the sorted partition), insert 
     * the community index into the list of community to display. Fetch the interactions
     * between the communities displayed (can be optimized) and set a style (color)
     * for the current community nodes. 
     * 
     * @param {number} index 
     * @returns {Promise}
     */
    appendCommunity: function(index) {
        return new Promise((resolve, reject) => {
            if (index >= this.partition.length) reject(); 
            else {
                this.communityIndexes.push(index)
                this.communitiesStyle.set(index, this.generateCommunityStyle(index))
                this.getCommunitiesInteractions()
                    .then(()  => resolve())
                    .catch(err => reject(err)) 
            }
        }); 
    },

    /**
     * Remove the community from the communities to display,  
     * its interactions, and also its style. 
     * 
     * @param {number} index 
     * @returns {Promise}
     */
    removeCommunity: function(index) {
        return new Promise((resolve, reject) => {
            const idx = this.communityIndexes.indexOf(index); 
            if (idx === -1) reject(); 
            this.communityIndexes.splice(idx, 1); 
            this.communitiesStyle.delete(index);  
            this.removeCommunityInteractionsFrom(index);             
            resolve(); 
        })
    }, 

    /**
     * Remove all the communities. 
     * This is helpfull when we need to change the algorithm, so 
     * we have to clean all the communities to display. 
     */
    removeAllCommunities: function () {
        this.communityIndexes = []; 
    }, 

    /**
     * Fetch the interaction between n communities from the server. 
     * 
     * @returns {Promise}
     */
    getCommunitiesInteractions: function () {
        return new Promise((resolve, reject) => {
            const queryContent = this.communityIndexes.join(','); 
            const resource = this.algorithm; 
            fetch(`/api/algorithms/${resource}/interactions?communities=${queryContent}`)
                .then(response => response.json())
                .then(interactions => {
                    this.interactions = interactions;
                    resolve();  
                })
                .catch(err => reject(err)); 
        }); 
    }, 


    /**
     * Remove interactions from a certain community (specified by its index). 
     * 
     * @param {*} idx 
     */
    removeCommunityInteractionsFrom: function (idx) {
        this.interactions = this.interactions.filter((interaction) => {
            const isInPositionOne = interaction.c1 == idx; 
            const isInPositionTwo = interaction.c2 == idx; 
            return !isInPositionOne && !isInPositionTwo; 
        })
    }, 

    /**
     * Remove all interactions (also helpfull while changing the algorithm). 
     */
    removeAllInteractions: function () {
        this.interactions = []; 
    }, 

    /**
     * Generate the style (node color) for a community.  
     * 
     * @param {*} index 
     * @returns 
     */
    generateCommunityStyle: function (index) {
        if (this.communityIndexes.length < 2) {
            const firstCommunity = this.communityIndexes[0]; 
            return makeCommunitySpecifiStyle(firstCommunity, '#00C8C7'); 
        }
        return makeCommunitySpecifiStyle(index, randomColor({luminosity: 'dark'}));
    }, 

    /**
     * Returns the style for each community to display. 
     * 
     * @returns {Array}
     */
    getCommunitiesStyles: function() {
        return this.communitiesStyle; 
    }, 


    /**
     * Encode the current application state (Communities, intra-edges, inter-edges)
     * to cytoscape elements, in order to make a visualization. 
     * 
     * @returns {array}
     */
    getGraphElements: function() {

        let elements = []; 
        let styles = this.getCommunitiesStyles(); 

        this.communityIndexes.forEach(index => {
            let currentCommunity = this.partition[index]; 

            // if there is only one community, leave the main style to the 
            // community nodes and avoid extra iterations through the graph.
            // Otherwise, for each community, for each node, attach the 
            // respective style class, retrieved through the style map.

            if (this.communityIndexes.length > 1) {
                const communityClass = styles.get(index); 
                currentCommunity = currentCommunity.map(element => {
                    const id = String(element.data.id)
                    if (! id.includes('-')) element.classes = communityClass.class; 
                    return element;                 
                })    
            }

            elements = elements.concat(currentCommunity); 
        })

        // when there are many communities, we want to display the interaction
        // between thoose clusters.
        
        if (this.communityIndexes.length > 1) {
            elements = elements.concat(this.extractEdgesFromInteractions())
        }

        return elements; 
    }, 


    /**
     * Convert the interactions fetched from the server to an array
     * of edges using the cytoscape js format. 
     * 
     * @returns {Array} of cytoscape style edges
     */
    extractEdgesFromInteractions: function () {
        let edges = []; 
        this.interactions.forEach(clusterCouple => {
            let clusterCoupleEdges = clusterCouple.edges.map(edge => {
                return {
                    'data': {
                        'id': `${edge[0]}-${edge[1]}`,
                        'source': parseInt(edge[0]), 
                        'target': parseInt(edge[1]), 
                    }, 
                    'classes': 'intercluster-edge'
                }
            })
            edges = edges.concat(clusterCoupleEdges); 
        })
        return edges; 
    },

    _sortCommunitiesByDimension: (partition) => {
      return partition.sort((a, b) => a.length - b.length)
    }

}