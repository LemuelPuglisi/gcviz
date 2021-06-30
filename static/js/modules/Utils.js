/**
 * Returns a color using an interpolation on the gradient 
 * between a special kind of green (c1) and a special kind 
 * of pink (c2). The rescaling method is logarithmic, in order 
 * to see even small size differences. The +1 prevents log 0. 
 * 
 * @param {number} max 
 * @param {number} min 
 * @param {number} val 
 * @returns {Object} rgb values 
 */
export const interpolateColorFromGradient = (max, min, val) => {
    const c1 = { r: 0, g: 200, b: 199 }
    const c2 = { r: 255, g: 95, b: 150 }
    const prc = Math.log((val - min) + 1) / Math.log((max - min) + 1)
    const r = c1.r + prc * (c2.r - c1.r)
    const g = c1.g + prc * (c2.g - c1.g)
    const b = c1.b + prc * (c2.b - c1.b)
    return { r: r, g: g, b: b }
}

/**
 * Create a class that can be placed into the cytoscape.js stylesheet. 
 * This class will be used to identify the nodes from different communities, 
 * using different colors. 
 * 
 * @param {number} communityIndex 
 * @param {string} nodeColor 
 * @returns {Object} cytoscape.js style 
 */
export const makeCommunitySpecifiStyle = (communityIndex, nodeColor) => {
    return {
        class: `community-${communityIndex}`, 
        style: {
            selector: `.community-${communityIndex}`, 
            style: {'background-color': nodeColor}
        }
    }
}