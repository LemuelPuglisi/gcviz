export const UI = {

    graphContainer: {
        element: document.getElementById('graph-display'), 
        initalizer: null, 
        instance: null, 
    },

    communityLegend: {
        element: document.getElementById('legend'), 
        initalizer: null, 
        instance: null, 
    },

    actionButton: {
        element: document.getElementById('action-button'), 
        initalizer: M.FloatingActionButton, 
        instance: null
    }, 

    featureDiscovery: {
        element: document.getElementById('menu-discovery'), 
        initalizer: M.TapTarget, 
        instance: null
    }, 

    algorithmSidenav: {
        element: document.getElementById('algorithm-sidenav'), 
        initalizer: M.Sidenav, 
        instance: null
    }, 

    geneInfoSidenav: {
        element: document.getElementById('gene-info-sidenav'), 
        initalizer: M.Sidenav, 
        instance: null
    }, 

    settingsSidenav: {
        element: document.getElementById('settings-sidenav'), 
        initalizer: M.Sidenav, 
        instance: null
    }, 

    algorithmSelect: {
        element: document.getElementById('algorithm-select'), 
        initalizer: M.FormSelect, 
        instance: null
    }, 

    layoutSelect: {
        element: document.getElementById('layout-select'), 
        initalizer: M.FormSelect, 
        instance: null
    }, 

    communityContainer: {
        element: document.getElementById('communities-container'), 
        initalizer: null, 
        instance: null
    },

    initializeComponent: (component) => {
        component.instance = component.initalizer.init(component.element)
    } 
}