export let graphHandler = {

    $container: null,

    appState: null, 

    currentLayout: 'circle',

    events: [], 

    style: [{
        selector: 'node',
        style: {
            'background-color': '#00C8C7',
            'color': '#fff',
            'label': 'data(symbol)'
        }
    },
    {
        selector: '.bluenode', 
        style: {
            'background-color': '#0000FF',
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 0.25,
            'line-color': '#FF5F96',
            'curve-style': 'haystack'
        }
    }, 
    {
        selector: '.intercluster-edge',
        style: {
            'width': 1, 
            'line-color': '#00C8C7', 
            'curve-style': 'haystack'
        } 
    }], 


    bindAppState: function(state) {
        this.appState = state; 
    }, 

    getAvailableLayouts: () => [
        'circle', 
        'grid', 
        'breadthfirst',
        'random', 
        'concentric', 
    ], 
    

    updateLayout: function(layout) {
        if (this.getAvailableLayouts().includes(layout))
            this.currentLayout = layout; 
    }, 

     
    setContainer: function($div) {
        this.$container = $div; 
    }, 


    getContainer: function() {
        return this.$container; 
    }, 


    attachEvent: function(event, element, handler) {
        this.events.push({
            event:event, 
            element: element, 
            handler: handler
        }); 
    }, 


    display: function() {
        
        if (!this.appState) return; 
        
        let dinamicStyle = [...this.style.slice()]

        if (this.appState.communityIndexes.length > 1) {
            const styleMap = this.appState.getCommunitiesStyles(); 
            const communityStyles = this.appState.communityIndexes
                .map(index => {
                    const val = styleMap.get(index); 
                    return val ? val.style : {} 
                });

            dinamicStyle = [
                ...dinamicStyle, 
                ...communityStyles
            ]
        }

        const cy = cytoscape({
            container: this.getContainer(),
            elements: this.appState.getGraphElements(),
            style: dinamicStyle,
            layout: { 'name': this.currentLayout },
            zoom: 1,
            motionBlur: true
        });

        this.events.forEach(e => cy.listen(e.event, e.element, e.handler)); 
        return cy; 
    }

}