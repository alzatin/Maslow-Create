class Molecule extends Atom{

    constructor(values){
        
        super(values);
        
        this.nodesOnTheScreen = [];
        this.children = [];
        this.name = "Molecule";
        this.atomType = "Molecule";
        this.centerColor = "#949294";
        this.topLevel = false; //a flag to signal if this node is the top level node
        
        this.setValues(values);
        
        //Add the molecule's output
        this.placeAtom({
            parentMolecule: this, 
            x: canvas.width - 50,
            y: canvas.height/2,
            parent: this,
            name: "Output",
            atomType: "Output"
        }, null, secretTypes);
        
        this.updateCodeBlock();
    }
    
    draw(){
        super.draw(); //Super call to draw the rest
        
        //draw the circle in the middle
        c.beginPath();
        c.fillStyle = this.centerColor;
        c.arc(this.x, this.y, this.radius/2, 0, Math.PI * 2, false);
        c.closePath();
        c.fill();
        
    }
    
    doubleClick(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            currentMolecule = this; //set this to be the currently displayed molecule
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }
    
    backgroundClick(){
        
        this.updateSidebar();
        
        //var toRender = "function main () {\n    return molecule" + this.uniqueID + ".code()\n}\n\n" + this.serialize()
        
        //window.loadDesign(toRender,"MaslowCreate");
    }
    
    updateCodeBlock(){
        //Grab the code from the output object
        
        //Grab values from the inputs and push them out to the input objects
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'input'){
                this.nodesOnTheScreen.forEach(atom => {
                    if(atom.atomType == "Input" && child.name == atom.name){
                        atom.setOutput(child.getValue());
                    }
                });
            }
        });
        
        //Grab the value from the Molecule's output and set it to be the molecule's code block so that clicking on the molecule will display what it is outputting
        this.nodesOnTheScreen.forEach(atom => {
            if(atom.atomType == 'Output'){
                this.codeBlock = atom.codeBlock;
            }
        });
        
        //Set the output nodes with type 'geometry' to be the generated code
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(this.codeBlock);
            }
        });
        
        //If this molecule is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender();
        }
    }
    
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.updateSidebar(); //call the super function
        
        this.createEditableValueListItem(valueList,this,"name", "Name", false);
        
        if(!this.topLevel){
            this.createButton(valueList,this,"Go To Parent",this.goToParentMolecule);
            
            this.createButton(valueList,this,"Export To GitHub", this.exportToGithub)
        }
        else{
            this.createButton(valueList,this,"Load A Different Project",showProjectsToLoad)
        }
        
        this.createBOM(valueList,this,this.BOMlist);
        
        return valueList;
        
    }
    
    goToParentMolecule(self){
        //Go to the parent molecule if there is one
        
        currentMolecule.updateCodeBlock();
        
        if(!currentMolecule.topLevel){
            currentMolecule = currentMolecule.parent; //set parent this to be the currently displayed molecule
        }
    }
    
    exportToGithub(self){
        //Export this molecule to github
        exportCurrentMoleculeToGithub(self);
    }
    
    replaceThisMoleculeWithGithub(githubID){
        console.log(githubID);
        
        //If we are currently inside the molecule targeted for replacement, go up one
        if (currentMolecule.uniqueID == this.uniqueID){
            currentMolecule = this.parent;
        }
        
        //Create a new github molecule in the same spot
        currentMolecule.placeAtom({
            x: this.x, 
            y: this.y, 
            parent: currentMolecule,
            name: this.name,
            atomType: "GitHubMolecule",
            projectID: githubID,
            uniqueID: generateUniqueID()
        }, null, availableTypes);
        
        
        //Then delete the old molecule which has been replaced
        this.deleteNode();

    }
    
    serialize(savedObject){
        //Save this molecule.
        
        //This one is a little confusing. Basically each molecule saves like an atom, but also creates a second object 
        //record of itself in the object "savedObject" object. If this is the topLevel molecule we need to create the 
        //savedObject object here to pass to lower levels.
        
        if(this.topLevel == true){
            //Create a new blank project to save to
            savedObject = {molecules: []}
        }
            
        var allElementsCode = new Array();
        var allAtoms = [];
        var allConnectors = [];
        
        
        this.nodesOnTheScreen.forEach(atom => {
            if (atom.codeBlock != ""){
                allElementsCode.push(atom.codeBlock);
            }
            
            allAtoms.push(JSON.stringify(atom.serialize(savedObject)));
            
            atom.children.forEach(attachmentPoint => {
                if(attachmentPoint.type == "output"){
                    attachmentPoint.connectors.forEach(connector => {
                        allConnectors.push(connector.serialize());
                    });
                }
            });
        });
        
        var thisAsObject = {
            atomType: this.atomType,
            name: this.name,
            uniqueID: this.uniqueID,
            topLevel: this.topLevel,
            allAtoms: allAtoms,
            allConnectors: allConnectors
        }
        
        //Add an object record of this object
        
        savedObject.molecules.push(thisAsObject);
            
        if(this.topLevel == true){
            //If this is the top level, return the generated object
            return savedObject;
        }
        else{
            //If not, return just a placeholder for this molecule
            var object = {
                atomType: this.atomType,
                name: this.name,
                x: this.x,
                y: this.y,
                uniqueID: this.uniqueID,
                BOMlist: this.BOMlist
            }
            
            return object;
        }
    }
        
    deserialize(moleculeList, moleculeID){
        
        //Find the target molecule in the list
        var moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID;})[0];
        
        //Grab the name and ID
        this.uniqueID = moleculeObject.uniqueID;
        this.name = moleculeObject.name;
        this.topLevel = moleculeObject.topLevel;
        
        //Place the atoms
        moleculeObject.allAtoms.forEach(atom => {
            this.placeAtom(JSON.parse(atom), moleculeList, availableTypes);
        });
        
        //reload the molecule object to prevent persistence issues
        moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID;})[0];
        
        //Place the connectors
        this.savedConnectors = moleculeObject.allConnectors; //Save a copy of the connectors so we can use them later if we want
        this.savedConnectors.forEach(connector => {
            this.placeConnector(JSON.parse(connector));
        });
        
        this.updateCodeBlock();
    }
    
    placeAtom(newAtomObj, moleculeList, typesList){
        //Place the atom - note that types not listed in availableTypes will not be placed with no warning (ie go up one level)
        
        for(var key in typesList) {
            if (typesList[key].atomType == newAtomObj.atomType){
                newAtomObj.parent = this;
                var atom = new typesList[key].creator(newAtomObj);
                
                //reassign the name of the Inputs to preserve linking
                if(atom.atomType == "Input" && typeof newAtomObj.name !== 'undefined'){
                    atom.setValue(newAtomObj.name);
                }

                //If this is a molecule, deserialize it
                if(atom.atomType == "Molecule" && moleculeList != null){
                    atom.deserialize(moleculeList, atom.uniqueID);
                }
                
                this.nodesOnTheScreen.push(atom);
            }
        }
        
        if(newAtomObj.atomType == "Output"){
            //re-asign output ID numbers if a new one is supposed to be placed
            this.nodesOnTheScreen.forEach(atom => {
                if(atom.atomType == "Output"){
                    atom.setID(newAtomObj.uniqueID);
                }
            });
        }
    }
    
    placeConnector(connectorObj){
        var connector;
        var cp1NotFound = true;
        var cp2NotFound = true;
        var ap2;
        
        this.nodesOnTheScreen.forEach(atom => {
            //Find the output node
            
            if (atom.uniqueID == connectorObj.ap1ID){
                atom.children.forEach(child => {
                    if(child.name == connectorObj.ap1Name && child.type == "output"){
                        connector = new Connector({
                            atomType: "Connector",
                            attachmentPoint1: child,
                            parentMolecule:  atom
                        });
                        cp1NotFound = false;
                    }
                });
            }
            //Find the input node
            if (atom.uniqueID == connectorObj.ap2ID){
                atom.children.forEach(child => {
                    if(child.name == connectorObj.ap2Name && child.type == "input" && child.connectors.length == 0){
                        cp2NotFound = false;
                        ap2 = child;
                    }
                });
            }
        });
        
        if(cp1NotFound || cp2NotFound){
            console.log("Unable to create connector");
            return;
        }
        
        connector.attachmentPoint2 = ap2;
        
        //Store the connector
        connector.attachmentPoint1.connectors.push(connector);
        connector.attachmentPoint2.connectors.push(connector);
        
        //Update the connection
        connector.propogate();
    }
}

