import { UI } from "./modules/UI.js"
import { appState } from './modules/State.js'
import { graphHandler } from './modules/Graph.js'
import { interpolateColorFromGradient } from './modules/Utils.js'

window.UI = UI;
window.appState = appState;
window.graphHandler = graphHandler;

var app = () => {

  /**
   * Initialize the graph handler setting the div container, 
   * binding the application state, and attaching all the events 
   * related the interaction with cytoscape. 
   */
  window.graphHandler.setContainer(window.UI.graphContainer.element)
  window.graphHandler.bindAppState(window.appState)
  window.graphHandler.attachEvent('tap', 'node', handleShowGene)

  /**
   * Initialize the ready-to-go components, hence every component 
   * that doesn't need modifications before the MaterizalizeCSS 
   * initialization. 
   */
  window.UI.initializeComponent(window.UI.actionButton);
  window.UI.initializeComponent(window.UI.featureDiscovery);
  window.UI.initializeComponent(window.UI.algorithmSidenav);
  window.UI.initializeComponent(window.UI.geneInfoSidenav);
  window.UI.initializeComponent(window.UI.settingsSidenav);
 
 /**
  * Set the callback function to call whenever the user choose 
  * one algorithm from the select. 
  */
  window.UI.algorithmSelect.element.onchange = changeAlgorithm;

  /**
   * Fill the layout select (in settings sidenav) with the available 
   * layouts. This is a sync function, because the layouts are hardcoded
   * into the graph handler module. This is an example of HTML element 
   * that needs modifications before initialization. 
   */
  fillLayoutSelect();
  window.UI.layoutSelect.element.onchange = changeLayout;
  window.UI.initializeComponent(window.UI.layoutSelect);

  /**
   * Asynchronously fetch all the available algorithms from the server
   * and, on server response, initialize the algorithm select. Finally, 
   * call changeAlgorithm() to initialize the application with the first 
   * algorithm returned. 
   */
  window.appState.fetchAlgorithms()
    .then(algorithms => {
      initializeAlgorithmSelect(algorithms)
      changeAlgorithm()
    })

  // algorithmSidenavInstance.open();
  slowInstantiateFeatureDiscovery(window.UI.featureDiscovery.instance);
}


var slowInstantiateFeatureDiscovery = (tapTarget) => {
  setTimeout(() => tapTarget.open(), 500)
}


var initializeAlgorithmSelect = (algorithms) => {
  let $select = window.UI.algorithmSelect.element;
  algorithms.forEach(makeSelectOption)
  selectFirstOption();
  window.UI.initializeComponent(window.UI.algorithmSelect)
}

var makeSelectOption = (algorithm) => {
  let option = document.createElement('option')
  option.text = algorithm.name
  option.value = algorithm.resource
  window.UI.algorithmSelect.element.appendChild(option)
}

var selectFirstOption = () => {
  const options = window.UI.algorithmSelect.element.querySelectorAll('option')
  if (options.length < 1) return;
  options[1].selected = true;
}


var changeAlgorithm = () => {
  const resource = window.UI.algorithmSelect.element.value;
  window.appState.fetchPartitionFromResource(resource)
    .then((partition) => {
      loadCommunities(partition)
      // in order to make the first-to-display community glow 
      const firstCommunityToDisplay = window.appState.communityIndexes[0]; 
      addPulseToCommunity(firstCommunityToDisplay); 
      window.graphHandler.display(); 
      updateLegend(); 
    })
}


var loadCommunities = (partition) => {
  window.UI.communityContainer.element.innerHTML = '';

  const lengths = partition.map(community => community.length)
  const minLen = Math.min(...lengths)
  const maxLen = Math.max(...lengths)

  for (let i = 0; i < partition.length; ++i) {
    const partitionLen = partition[i].length
    const color = interpolateColorFromGradient(maxLen, minLen, partitionLen)
    let $community = document.createElement('div')
    $community.classList.add('community-item')
    $community.setAttribute('style', `background-color: rgb(${color.r}, ${color.g}, ${color.b})`)
    $community.innerHTML = i
    $community.onclick = () => handleCommunityClick(i)
    window.UI.communityContainer.element.appendChild($community)
  }
}

var handleCommunityClick = (index) => {

  const isCommunityDisplayed = window.appState.communityIndexes.includes(index); 

  // since we changed the community inside the state, 
  // we need to update the graph visualization and 
  // the legend. 
  const updateVisualization = () => {
    window.graphHandler.display(); 
    updateLegend(); 
  } 

  if (isCommunityDisplayed) {
    removePulseFromCommunity(index); 
    window.appState.removeCommunity(index)
      .then(() => updateVisualization())
  }
  else {
    addPulseToCommunity(index); 
    window.appState.appendCommunity(index)
      .then(() => updateVisualization())
  }
}

var addPulseToCommunity = (index) => {
  const communitiesDivs = window.UI.communityContainer.element.querySelectorAll('div');
  communitiesDivs[index].classList.add('pulse', 'active-community-item')
}

var removePulseFromCommunity = (index) => {
  const communitiesDivs = window.UI.communityContainer.element.querySelectorAll('div');
  communitiesDivs[index].classList.remove('pulse', 'active-community-item')
}


var fillLayoutSelect = () => {
  const layouts = window.graphHandler.getAvailableLayouts()
  const $select = window.UI.layoutSelect.element;
  const currentLayout = window.graphHandler.layout;

  layouts.forEach(layout => {
    let option = document.createElement('option')
    option.text = layout
    option.value = layout
    option.selected = layout == currentLayout;
    $select.appendChild(option)
  })
}


var changeLayout = (event) => {
  const layout = event.target.value;
  window.graphHandler.updateLayout(layout);
  window.graphHandler.display();
}


var handleShowGene = (event) => {
  M.toast({ html: 'Fetching gene information from NCBI database.' })
  fetchGeneInformations(event.target.data().id)
    .then(fillGeneInfoTable)
    .then(() => window.UI.geneInfoSidenav.instance.open())
}


var fetchGeneInformations = (geneID) => {
  return new Promise((resolve, reject) => {
    fetch(`/api/gene/${geneID}`)
      .then(response => response.json())
      .then(geneInfo => resolve(geneInfo))
      .catch(err => reject(err))
  })
}


var fillGeneInfoTable = (infos) => {
  return new Promise((resolve, reject) => {
    const table = document.getElementById('gene-info-table')
    table.innerHTML = '';
    Object.entries(infos)
      .forEach(info => {
        const key = info[0].replace('_', ' ')
        const value = info[1]
        let tr = document.createElement('tr')
        let th = document.createElement('th')
        let td = document.createElement('td')
        th.innerHTML = key
        td.innerHTML = value
        tr.appendChild(th)
        tr.appendChild(td)
        table.appendChild(tr)
      })
    resolve();
  })
}


var updateLegend = () => {
  const map = window.appState.getCommunitiesStyles();
  const communities = window.appState.communityIndexes; 
  const $legend = window.UI.communityLegend.element; 
  $legend.innerHTML = '<p style="text-align: center">Legend</p>'; 

  communities.forEach(community => {
    const style = map.get(community)
    const color = style.style.style['background-color']; 

    let p = document.createElement('p'); 
    let colorblock = document.createElement('div'); 
    colorblock.classList.add('colorblock'); 
    colorblock.style = 'background-color:' + color; 
    let text = document.createTextNode(`[${community}]`)

    p.appendChild(colorblock); 
    p.appendChild(text);
    $legend.append(p); 
  })  
}


document.addEventListener('DOMContentLoaded', () => { app() })