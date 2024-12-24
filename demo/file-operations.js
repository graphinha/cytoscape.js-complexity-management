
function readTxtFile(file, cb) {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    try {
      cb(fileReader.result);
    } catch (error) {
      console.error('Given file is not suitable.', error);
    }
  };
  fileReader.onerror = (error) => {
    console.error('File could not be read!', error);
    fileReader.abort();
  };
  fileReader.readAsText(file);
}

function str2file(str, fileName) {
  const blob = new Blob([str], { type: 'text/plain' });
  const anchor = document.createElement('a');

  anchor.download = fileName;
  anchor.href = (window.URL).createObjectURL(blob);
  anchor.dataset.downloadurl =
    ['text/plain', anchor.download, anchor.href].join(':');
  anchor.click();
}

function loadJson() {
  const inp = document.getElementById('json-file-inp');
  inp.value = '';
  inp.click();
}

function jsonFileSelected() {
  readTxtFile(document.getElementById('json-file-inp').files[0], (s) => {
    cy.$().remove();
    let tempIDs = [];
    let tempNodes = [];
    let nodesToBeAdded = [];
    let data = JSON.parse(s);
    data.nodes.forEach((node) => {
      if(node.data.parent){
        if(tempIDs.includes(node.data.parent)){
          nodesToBeAdded.push(node)
        }else{
          tempNodes.push(node);
        }
      }else{
        nodesToBeAdded.push(node);
        tempIDs.push(node.data.id);
      }
    })
    tempNodes.forEach((node) => {
      nodesToBeAdded.push(node);
    })
    data.nodes = [...nodesToBeAdded]
    cy.add(data);
    cy.elements().forEach((ele) => {
      let randomWeight = Math.floor(Math.random() * 101);
      ele.data('weight', randomWeight);
      ele.data('label', ele.data('id') + '(' + ele.data('weight') + ')');
    });
    if (document.getElementById('cbk-run-layout').checked) {
      cy.layout({ name: 'fcose', animate: true, stop: () => {initializer(cy);} }).run();
    } else {
      cy.fit();
      initializer(cy);
    }
  });
}

function loadGraphML() {
  const inp = document.getElementById('graphml-file-inp');
  inp.value = '';
  inp.click();
}

function graphmlFileSelected() {
  readTxtFile(document.getElementById('graphml-file-inp').files[0], (s) => {
    cy.$().remove();
    cy.graphml({ layoutBy: 'preset' })
    cy.graphml(s);
    cy.elements().forEach((ele) => {
      let randomWeight = Math.floor(Math.random() * 101);
      ele.data('weight', randomWeight);
      ele.data('label', ele.data('id') + '(' + ele.data('weight') + ')');
    });    
    if (document.getElementById('cbk-run-layout').checked) {
      cy.layout({ name: 'fcose', animate: true, stop: () => {initializer(cy);} }).run();
    } else {
      cy.fit();
      initializer(cy);
    }
  });
}

function loadSif() {
  const inp = document.getElementById('sif-file-inp');
  inp.value = '';
  inp.click();
}

function sifFileSelected() {
  readTxtFile(document.getElementById('sif-file-inp').files[0], (s) => {
    cy.$().remove();
    cy.add(sif2cy(s));
    cy.elements().forEach((ele) => {
      let randomWeight = Math.floor(Math.random() * 101);
      ele.data('weight', randomWeight);
      ele.data('label', ele.data('id') + '(' + ele.data('weight') + ')');
    });
    if (document.getElementById('cbk-run-layout').checked) {
      cy.layout({ name: 'fcose', animate: true, stop: () => {initializer(cy);} }).run();
    } else {
      cy.fit();
      initializer(cy);
    }
  });
}

function exportJson() {
  const json = cy.json();
  const elements = json.elements;
  if (!elements.nodes) {
    return;
  }
  str2file(JSON.stringify(elements, undefined, 4), 'sample-graph.json');
}

function exportGraphml() {
  str2file(cy.graphml(), 'sample-graph.graphml');
}

function exportSif() {
  const edges = cy.edges();
  let s = '';
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    let edgeTypes = e.classes().join(' ');
    if (edgeTypes.length < 1) {
      edgeTypes = 'edge';
    }
    s += e.source().id() + '\t' + edgeTypes + '\t' + e.target().id() + '\n';
  }
  const edgelessNodes = cy.nodes().filter(x => x.connectedEdges().length == 0);
  for (let i = 0; i < edgelessNodes.length; i++) {
    s += edgelessNodes[i].id() + '\n';
  }
  str2file(s, 'sample-graph.sif');
}

function exportPNG(){
  let png64 = cy.png({
    scale:2,
    full:true
  });
  var link = document.createElement('a');
  link.download = 'testGraph_visible.png';  
  link.href = png64;
  link.click();
  let png64_main = cyInvisible.png({
    scale:2,
    full:true
  });
  link = document.createElement('a');
  link.download = 'testGraph_main.png';  
  link.href = png64_main;
  link.click();
  if(pngImage.pngExpandGraph!=null){
    link = document.createElement('a');
    link.download = 'testGraph_transition.png';  
    link.href = pngImage.pngExpandGraph;
    link.click();
  }
  if(pngBeforeFinalGraph!=null){
    link = document.createElement('a');
    link.download = 'testGraph_BeforeFinal.png';  
    link.href = pngBeforeFinalGraph;
    link.click();
  }
  if(pngImage.pngSizeProxyGraph!=null){
    link = document.createElement('a');
    link.download = 'testGraph_BoundingBox.png';  
    link.href = pngImage.pngSizeProxyGraph;
    link.click();
  }
  let png64_proxy = cyLayout.png({
    scale:2,
    full:true
  });
  link = document.createElement('a');
  link.download = 'testGraph_proxy.png';  
  link.href = png64_proxy;
  link.click();

}

function exportSVG(){
  // let pngData = cy.png();

  // var canvas = document.createElement('canvas');
  // var context = canvas.getContext('2d');

  // // Create an image element and set the PNG data
  // var image = new Image();
  // image.src = pngData;

  // // After the image is loaded, draw it on the canvas
  // image.onload = function() {
  //   canvas.width = image.width;
  //   canvas.height = image.height;
  //   context.drawImage(image, 0, 0);

  //   // Create a new temporary link element
  //   var link = document.createElement('a');
  //   link.download = "testGraph" + '.svg'; // Set the download filename

  //   // Convert the PNG image to SVG using Potrace
  //   var potrace = new Potrace();
  //   potrace.loadImageFromCanvas(canvas);
  //   var svgData = potrace.getSVG();
  //   var blob = new Blob([svgData], { type: 'image/svg+xml' });
  //   var url = URL.createObjectURL(blob);

  //   // Set the link href to the SVG data
  //   link.href = url;

  //   // Trigger the download by programmatically clicking the link
  //   link.click();
  // }
}

function sif2cy(text) {
  //private members
  const _getNode = function (id, nodes) {
    if (!nodes[id]) {
      nodes[id] = { id: id };
    }
    return nodes[id];
  }

  const _parse = function (line, i, links, nodes) {
    line = (line.split('\t').length > 1) ? line.split('\t') : line.split(' ');
    line = line.filter(x => x); // remove empty strings

    if (line.length < 1) {
      console.warn('SIFJS cannot parse line ' + i + ' "' + line + '"');
      return;
    } else if (line.length >= 3) {
      const source = _getNode(line[0], nodes);
      const edgeType = line[1];
      for (let j = 2; j < line.length; j++) {
        const target = _getNode(line[j], nodes);

        if (source < target) {
          links[source.id + target.id + edgeType] = { target: target.id, source: source.id, edgeType: edgeType };
        } else {
          links[target.id + source.id + edgeType] = { target: target.id, source: source.id, edgeType: edgeType };
        }
      }
    } else if (line.length == 1) {
      _getNode(line[0], nodes);
    }
  };

  let nodes = {}, links = {};

  let lines = text.split('\n').filter(x => x); // remove empty strings
  for (let i = 0; i < lines.length; i++) {
    _parse(lines[i], i, links, nodes);
  }
  let cy_nodes = [];
  let cy_edges = [];
  for (let key in nodes) {
    cy_nodes.push({ 'data': { 'name': nodes[key]['id'], 'id': nodes[key]['id'] } });
  }
  for (let key in links) {
    cy_edges.push({ 'data': links[key] });
  }

  return { 'nodes': cy_nodes, 'edges': cy_edges };
}

function loadSample(globalVarName) {
  cy.$().remove();
  cy.add(window[globalVarName]);
  cy.elements().forEach((ele) => {
    let randomWeight = Math.floor(Math.random() * 101);
    ele.data('weight', randomWeight);
    ele.data('label', ele.data('id') + '(' + ele.data('weight') + ')');
  });
  if (document.getElementById('cbk-run-layout').checked) {
    cy.layout({ name: 'fcose', animate: true, stop: () => {initializer(cy);} }).run();
  } else {
      cy.fit();
      initializer(cy);
  }
}


function initializer(cy) {
  cyVisible.remove(cyVisible.elements());
  cyInvisible.remove(cyInvisible.elements());

  let nodesToAddVisible = [];
  (cy)
  instance.getCompMgrInstance('get').visibleGraphManager.nodesMap.forEach((nodeItem, key) => {
    nodesToAddVisible.push({ data: { id: nodeItem.ID, parent: instance.getCompMgrInstance().visibleGraphManager.rootGraph === nodeItem.owner ? null : nodeItem.owner.parent.ID }, position: !cy.getElementById(nodeItem.ID).isParent() ? cy.getElementById(nodeItem.ID).position() : null });
  });
  cyVisible.add(nodesToAddVisible);
  instance.getCompMgrInstance('get').visibleGraphManager.edgesMap.forEach((edgeItem, key) => {
    cyVisible.add({ data: { id: edgeItem.ID, source: edgeItem.source.ID, target: edgeItem.target.ID } });
  });
  cyVisible.fit(cyVisible.elements(), 30);

  let nodesToAddInvisible = [];
  let nodePosInBothCyAndInvisible = [];
  instance.getCompMgrInstance('get').mainGraphManager.nodesMap.forEach((nodeItem, key) => {
    nodesToAddInvisible.push({ data: { id: nodeItem.ID , visible : nodeItem.isVisible?'T':"F", filtered : nodeItem.isFiltered?'T':"F", hidden : nodeItem.isHidden?'T':"F", label: nodeItem.ID + (nodeItem.isFiltered ? "(f)" : "") + (nodeItem.isHidden ? "(h)" : "") + (nodeItem.isCollapsed ? "(-)" : "") + (nodeItem.isVisible ? "" : "(i)"), parent: instance.getCompMgrInstance().visibleGraphManager.rootGraph === nodeItem.owner ? null : nodeItem.owner.parent.ID }});
  });
  cyInvisible.add(nodesToAddInvisible);
  instance.getCompMgrInstance('get').mainGraphManager.edgesMap.forEach((edgeItem, key) => {
    cyInvisible.add({ data: { id: edgeItem.ID, visible : edgeItem.isVisible?'T':"F", filtered : edgeItem.isFiltered?'T':"F", hidden : edgeItem.isHidden?'T':"F", label: (edgeItem.isFiltered ? "(f)" : "") + (edgeItem.isHidden ? "(h)" : "") + (edgeItem.isVisible ? "" : "(i)"), source: edgeItem.source.ID, target: edgeItem.target.ID } });
  });
  cyInvisible.nodes().forEach((node) => {
    let cyNode = cy.getElementById(node.id());
    if(cyNode.length > 0 && !node.isParent()) {
      nodePosInBothCyAndInvisible.push({nodeId: cyNode.id(), position: cyNode.position()});
    }
  });
  cyInvisible.layout({name: 'fcose', animate: false, fixedNodeConstraint: nodePosInBothCyAndInvisible}).run();

  var radioButtons = document.getElementsByName('cbk-flag-display-node-label-pos');

  // Attach event listeners to the radio buttons
  radioButtons.forEach(function(radio) {
    if(radio.checked){
      setLabelPosition(radio.value);
    }
  });

  function setLabelPosition(position) {
    var cyChildlessNodes = cy.nodes().filter(function(element) {
      return element.isChildless();
    });
    var cyVisibleChildlessNodes = cyVisible.nodes().filter(function(element) {
      return element.isChildless();
    });
    var cyInVisibleChildlessNodes = cyInvisible.nodes().filter(function(element) {
      return element.isChildless();
    });
    
    cyChildlessNodes.style('text-valign', position);
    cyVisibleChildlessNodes.style('text-valign', position);
    cyInVisibleChildlessNodes.style('text-valign', position);
  }
}