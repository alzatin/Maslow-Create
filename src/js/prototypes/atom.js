import AttachmentPoint from './attachmentpoint'
import GlobalVariables from '../globalvariables'
import showdown  from 'showdown'

/**
 * This class is the prototype for all atoms.
 */
export default class Atom {

    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        //Setup default values
        /** 
         * An array of all of the input attachment points connected to this atom
         * @type {array}
         */
        this.inputs = []
        /** 
         * This atom's output attachment point if it has one
         * @type {object}
         */
        this.output = null
        
        /** 
         * The X cordinate of this atom
         * @type {number}
         */
        this.x = 0
        /** 
         * The Y cordinate of this atom
         * @type {number}
         */
        this.y = 0
        /** 
         * This atom's radius as displayed on the screen is 1/72 width
         * @type {number}
         */
        this.radius = 1/75
        /** 
         * This atom's default color (ie when not selected or processing)
         * @type {string}
         */
        this.defaultColor = '#F3EFEF'
        /** 
         * This atom's color when selected
         * @type {string}
         */
        /** 
         * The color to use for strokes when selected
         * @type {string}
         */
        this.selectedColor = '#484848'
        /** 
         * The color currently used for strokes
         * @type {string}
         */
        this.strokeColor = '#484848'
        /** 
         * A flag to indicate if this atom is curently selected
         * @type {boolean}
         */
        this.selected = false
        /** 
         * This atom's curent color
         * @type {string}
         */
        this.color = '#F3EFEF'
        /** 
         * This atom's name
         * @type {string}
         */
        this.name = 'name'
        /** 
         * This atom's parent, usually the molecule which contains this atom
         * @type {object}
         */
        this.parentMolecule = null
        /** 
         * This atom's value...Is can this be done away with? Are we basically storing the value in the output now?
         * @type {object}
         */
        this.value = null
        /** 
         * A flag to indicate if this atom is currently being draged on the screen.
         * @type {boolean}
         */
        this.isMoving = false
        /** 
         * A flag to indicate if we are hovering over this atom.
         * @type {boolean}
         */
        this.showHover = false
        /** 
         * The X cordinate of this atom now
         * @type {number}
         */

        this.x = 0
        /** 
         * The Y cordinate of this atom now
         * @type {number}
         */
        this.y = 0
        /** 
         * A warning message displayed next to the atom. Put text in here to have a warning automatically show up. Cleared each time the output is regenerated.
         * @type {string}
         */
        this.alertMessage = ''
        /** 
         * A flag to indicate if the atom is currently computing a new output. Turns the molecule blue.
         * @type {boolean}
         */
        this.processing = false

        for(var key in values) {
            /** 
             * Assign each of the values in values as this.value
             */
            this[key] = values[key]
        }
        
    }
    
    /**
     * Applies each of the passed values to this as this.x
     * @param {object} values - A list of values to set
     */ 
    setValues(values){
        //Assign the object to have the passed in values
        
        for(var key in values) {
            this[key] = values[key]
        }
        
        if (typeof this.ioValues !== 'undefined') {
            this.ioValues.forEach(ioValue => { //for each saved value
                this.inputs.forEach(io => {  //Find the matching IO and set it to be the saved value
                    if(ioValue.name == io.name && io.type == 'input'){
                        io.value = ioValue.ioValue
                    }
                })
            })
        }
    }
   
    /**
     * Draws the atom on the screen
     */ 
    draw(drawType) {

        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        let radiusInPixels = GlobalVariables.widthToPixels(this.radius)

        this.inputs.forEach(child => {
            child.draw()       
        })

        GlobalVariables.c.beginPath()
        GlobalVariables.c.font = '10px Work Sans'

        if(this.processing){
            GlobalVariables.c.fillStyle = 'blue'
        }
        else if(this.selected){
            GlobalVariables.c.fillStyle = this.selectedColor
            GlobalVariables.c.strokeStyle = this.selectedColor
            this.color = this.selectedColor
            this.strokeColor = this.defaultColor
        }
        else{
            GlobalVariables.c.fillStyle = this.defaultColor
            GlobalVariables.c.strokeStyle = this.selectedColor
            this.color = this.defaultColor
            this.strokeColor = this.selectedColor
        }

        GlobalVariables.c.beginPath()
        if (drawType == "rect"){
            GlobalVariables.c.rect(xInPixels - radiusInPixels, yInPixels - this.height/2, 2* radiusInPixels, this.height)
        }
        else{
            GlobalVariables.c.arc(xInPixels, yInPixels, radiusInPixels, 0, Math.PI * 2, false)
        }
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fill()
        GlobalVariables.c.strokeStyle = this.strokeColor
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.textAlign = 'start'
        GlobalVariables.c.fillText(this.name, xInPixels + radiusInPixels, yInPixels - radiusInPixels)
        GlobalVariables.c.fill()
        GlobalVariables.c.strokeStyle = this.strokeColor
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()

        if (this.showHover){
           
            if (this.alertMessage.length > 0){
                this.color = "red"

                //Draw Alert block  
                GlobalVariables.c.beginPath()
                const padding = 10
                GlobalVariables.c.fillStyle = 'red'
                GlobalVariables.c.rect(
                    xInPixels + radiusInPixels - padding/2, 
                    yInPixels - radiusInPixels + padding/2, 
                    GlobalVariables.c.measureText(this.alertMessage.toUpperCase()).width + padding, 
                    - (parseInt(GlobalVariables.c.font) + padding))
                GlobalVariables.c.fill()
                GlobalVariables.c.strokeStyle = 'black'
                GlobalVariables.c.lineWidth = 1
                GlobalVariables.c.stroke()
                GlobalVariables.c.closePath()

                GlobalVariables.c.beginPath()
                GlobalVariables.c.fillStyle = 'black'
                GlobalVariables.c.fillText(this.alertMessage.toUpperCase(), xInPixels + radiusInPixels, yInPixels - radiusInPixels) 
                GlobalVariables.c.closePath()
                
            } 
        }
    }
    
    /**
     * Adds a new attachment point to this atom
     * @param {boolean} type - The type of the IO (input or output)
     * @param {string} name - The name of the new attachment point
     * @param {object} target - The attom to attach the new attachment point to. Should we force this to always be this one?
     * @param {string} valueType - Describes the type of value the input is expecting options are number, geometry, array
     * @param {object} defaultValue - The default value to be used when the value is not yet set
     */ 
    addIO(type, name, target, valueType, defaultValue, ready = false, primary = false){
        
        if(target.inputs.find(o => (o.name === name && o.type === type))== undefined){ //Check to make sure there isn't already an IO with the same type and name
            //compute the baseline offset from parent node
            var offset
            if (type == 'input'){
                offset = -1* target.scaledRadius
            }
            else{
                offset = target.scaledRadius
            }
            var newAp = new AttachmentPoint({
                parentMolecule: target,
                defaultOffsetX: offset,
                defaultOffsetY: 0,
                type: type,
                valueType: valueType,
                name: name,
                primary: primary,
                value: defaultValue,
                defaultValue: defaultValue,
                uniqueID: GlobalVariables.generateUniqueID(),
                atomType: 'AttachmentPoint',
                ready: ready
            })
            
            if(type == 'input'){
                target.inputs.push(newAp)
            }else{
                target.output = newAp
            }
        }
    }
    
    /**
     * Removes an attachment point from an atom.
     * @param {boolean} type - The type of the IO (input or output).
     * @param {string} name - The name of the new attachment point.
     * @param {object} target - The attom which the attachment point is attached to. Should this be forced to be this.?
     */ 
    removeIO(type, name, target){
        //Remove the target IO attachment point
        target.inputs.forEach(input => {
            if(input.name == name && input.type == type){
                target.inputs.splice(target.inputs.indexOf(input),1)
                input.deleteSelf()
            }
        })
    }
    
    /**
     * Set an alert to display next to the atom.
     * @param {string} message - The message to display.
     */ 
    setAlert(message){
        this.color = 'orange'
        this.alertMessage = String(message)

    }
    
    /**
     * Clears the alert message attached to this atom.
     */ 
    clearAlert(){
        this.color = this.defaultColor
        this.alertMessage = ''
    }

    /**
     * Delineates bounds for selection box.
     */ 
    selectBox(x,y,xEnd,yEnd){
        let xIn = Math.min(x, xEnd)
        let xOut = Math.max(x, xEnd)
        let yIn = Math.min(y, yEnd)
        let yOut = Math.max(y, yEnd)
        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        if(xInPixels >= xIn && xInPixels <= xOut){
            if(yInPixels >= yIn && yInPixels <= yOut){
                //this.isMoving = true
                this.selected = true
                this.updateSidebar()
                this.sendToRender()
            }
        }
    }

    /**
     * Set the atom's response to a mouse click. This usually means selecting the atom and displaying it's contents in 3D
     * @param {number} x - The X cordinate of the click
     * @param {number} y - The Y cordinate of the click
     * @param {boolean} clickProcessed - A flag to indicate if the click has already been processed
     */ 
    clickDown(x,y, clickProcessed){
        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        let radiusInPixels = GlobalVariables.widthToPixels(this.radius)

        //If none of the inputs processed the click see if the atom should, if not clicked, then deselect
        if(!clickProcessed && GlobalVariables.distBetweenPoints(x, xInPixels, y, yInPixels) < radiusInPixels){
            this.isMoving = true
            this.selected = true
            this.updateSidebar()
            this.sendToRender()
            clickProcessed = true
        }
        //needs to check if control is down so it doesn't deselect molecules thinking it's a background click
        else if (!GlobalVariables.ctrlDown){
            this.selected = false
        }         
        //Returns true if something was done with the click
        this.inputs.forEach(child => {
            if(child.clickDown(x,y, clickProcessed) == true){
                clickProcessed = true
            }
        })
        if(this.output){
            if(this.output.clickDown(x,y, clickProcessed) == true){
                clickProcessed = true
            }
        }
           
        return clickProcessed 
    }

    /**
     * Set the atom's response to a mouse double click. By default this isn't to do anything other than mark the double click as handled.
     * @param {number} x - The X cordinate of the click
     * @param {number} y - The Y cordinate of the click
     */ 
    doubleClick(x,y){
        //returns true if something was done with the click
        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        var clickProcessed = false
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, xInPixels, y, yInPixels)
        
        if (distFromClick < xInPixels){
            clickProcessed = true
        }
        
        return clickProcessed 
    }

    /**
     * Set the atom's response to a mouse click up. If the atom is moving this makes it stop moving.
     * @param {number} x - The X cordinate of the click
     * @param {number} y - The Y cordinate of the click
     */ 
    clickUp(x,y){
        this.isMoving = false
        
        this.inputs.forEach(child => {
            child.clickUp(x,y)     
        })
        if(this.output){
            this.output.clickUp(x,y)
        }
    }
    
    /**
     * Set the atom's response to a mouse click and drag. Moves the atom around the screen.
     * @param {number} x - The X cordinate of the click
     * @param {number} y - The Y cordinate of the click
     */ 
    clickMove(x,y){

        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        let radiusInPixels = GlobalVariables.widthToPixels(this.radius)
        if (this.isMoving == true){
            this.x = GlobalVariables.pixelsToWidth(x)
            this.y = GlobalVariables.pixelsToHeight(y)
        }
        
        this.inputs.forEach(child => {
            child.clickMove(x,y)       
        })
        if(this.output){
            this.output.clickMove(x,y)
        }
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, xInPixels, y, yInPixels)
        
        //If we are close to the attachment point move it to it's hover location to make it accessible
        if (distFromClick < radiusInPixels ){
            this.showHover = true
        }  
        else { this.showHover = false}
    }
    
    /**
     * Set the atom's response to a key press. Is used to delete the atom if it is selected.
     * @param {string} key - The key which has been pressed.
     */ 
    keyPress(key){ 

      
        this.inputs.forEach(child => {
            child.keyPress(key)
        })
    }
    
    /**
     * Updates the side bar to display information about the atom. By default this is just add a title and to let you edit any unconnected inputs.
     */ 
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = this.initializeSideBar()
        
        //Add options to set all of the inputs
        this.inputs.forEach(input => {
            if(input.type == 'input' && input.valueType != 'geometry' && input.connectors.length == 0){
                if(input.valueType == 'number'){
                    this.createEditableValueListItem(valueList,input,'value', input.name, true)
                }
                else{
                    this.createEditableValueListItem(valueList,input,'value', input.name, false)
                }
            }
        })
        
        return valueList
    }
    
    /**
     * Initialized the sidebar with a title and create the HTML object.
     */ 
    initializeSideBar(){

        //remove everything in the sideBar now
        let sideBar = document.querySelector('.sideBar')
        //Updates sidebar values before erasing
        var editables = document.querySelectorAll(".editing-item")
        editables.forEach(function(value) {
            value.blur()
        })

        while (sideBar.firstChild) { 
            sideBar.removeChild(sideBar.firstChild)
        }

        //adds the name of the molecule to sideBar
        var name2 = document.createElement('p')
        name2.textContent = this.name
        sideBar.appendChild(name2)
        name2.setAttribute('class','molecule_title')
        

        //add the name as of project title 
        if (this.atomType == 'Molecule' ){
            let headerBar_title = document.querySelector('#headerBar_title')
            if(headerBar_title){
                while (headerBar_title.firstChild) {
                    headerBar_title.removeChild(headerBar_title.firstChild)
                }
               
                var name1 = document.createElement('p')
                name1.textContent = "- " + GlobalVariables.topLevelMolecule.name
                headerBar_title.appendChild(name1)
            }
        }

        //Create a list element
        var valueList = document.createElement('ul')
        sideBar.appendChild(valueList)
        valueList.setAttribute('class', 'sidebar-list')

        
        return valueList

    }

    /**
     * Delete this atom.
     */ 
    deleteNode(){
        //deletes this node and all of it's inputs
        
        this.inputs.forEach(input => { //disable the inputs before deleting
            input.ready = false
        })
        
        this.inputs.forEach(input => {
            input.deleteSelf()
        })
        if(this.output){
            this.output.deleteSelf()
        }
        
        this.parent.nodesOnTheScreen.splice(this.parent.nodesOnTheScreen.indexOf(this),1) //remove this node from the list
        
        GlobalVariables.currentMolecule.backgroundClick()

    }
    
    /**
     * Runs with each frame to draw the atom.
     */ 
    update() {
        
        this.inputs.forEach(child => {
            child.update()     
        })
        if(this.output){
            this.output.update()
        }
        
        this.draw()
    }

    /**
     * Create an object containing the information about this atom that we want to save. 
     */ 
    serialize(){
        
        var ioValues = []
        this.inputs.forEach(io => {
            if (typeof io.getValue() == 'number' || typeof io.getValue() == 'string'){
                //We only want to save inputs values with nothing connected to them
                if(io.connectors.length == 0){
                    var saveIO = {
                        name: io.name,
                        ioValue: io.getValue()
                    }
                    ioValues.push(saveIO)
                }
            }
        })
        
        var object = {
            atomType: this.atomType,
            name: this.name,
            x: this.x,
            y: this.y,
            uniqueID: this.uniqueID,
            ioValues: ioValues
        }
        
        return object
    }
    
    /**
     * Return any contribution from this atom to the README file
     */ 
    requestReadme(){
        //request any contributions from this atom to the readme
        
        return []
    }
    
    /**
     * Set's the output value and shows the atom output on the 3D view.
     */ 
    decreaseToProcessCountByOne(){
        
        GlobalVariables.topLevelMolecule.census()
        
    }
    
    /**
     * Token update value function to give each atom one by default
     */ 
    updateValue(){
    
    }
    
    /**
     * Used to walk back out the tree generating a list of constants
     */ 
    walkBackForConstants(callback){
        //Pass the call further up the chain
        this.inputs.forEach(input => {
            input.connectors.forEach(connector => {
                connector.walkBackForConstants(callback)
            })
        })
    }
    
    /**
     * Displays the atom in 3D and sets the output.
     */ 
    displayAndPropogate(){
        //If this has an output write to it
        if(this.output){
            this.output.setValue(this.value)
            this.output.ready = true
        }
        
        //If this atom is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender()
        }
    }
    
    /**
     * Calls a worker thread to compute the atom's value.
     */ 
    basicThreadValueProcessing(values, key){
        //If the inputs are all ready
        var go = true
        this.inputs.forEach(input => {
            if(!input.ready){
                go = false
            }
        })
        if(go){     //Then we update the value
            this.processing = true
            this.decreaseToProcessCountByOne()
            
            //console.log("Processing: " + key)
            //console.log(GlobalVariables.pool.stats())
            
            if(this.output){  //If this atom has an ouput
                this.output.waitOnComingInformation() //This sends a chain command through the tree to lock all the inputs which are down stream of this one.
            }
            
            this.clearAlert()
            const computeValue = async (values, key) => {
                let promise = new Promise( resolve =>{
                    GlobalVariables.pool.exec(key, [values]).then((result) => {
                        resolve(result)
                    })
                })
                let result1 = await promise
                    
                return result1
            }
            
            computeValue(values, key).then((result) => {
                if (result != -1 ){
                    this.value = result

                    this.displayAndPropogate()
                }else{
                    this.setAlert("Unable to compute")
                }
                this.processing = false
            })
        }
    }
    
    /**
     * Starts propagation from this atom if it is not waiting for anything up stream.
     */ 
    beginPropagation(){
        //If anything is connected to this it shouldn't be a starting point
        this.inputs.forEach(input => {
            input.beginPropagation()
        })
    }
    
    /**
     * Returns an array of length two indicating that this is one atom and if it is waiting to be computed
     */ 
    census(){
        var waiting = 0
        this.inputs.forEach(input => {
            if(input.ready != true){
                waiting = 1
            }
        })
        return [1,waiting]
    }
    
    /**
     * Send the value of this atom to the 3D display.
     */ 
    sendToRender(){
        //Send code to JSxCAD to render
        try{
            GlobalVariables.display.writeToDisplay(this.value)
        }
        catch(err){
            this.setAlert(err)
        }

    }
    
    /**
     * Find the value of an input for with a given name.
     * @param {string} ioName - The name of the target attachment point.
     */ 
    findIOValue(ioName){
        ioName = ioName.split('~').join('')
        var ioValue = null
        
        this.inputs.forEach(child => {
            if(child.name == ioName && child.type == 'input'){
                ioValue = child.getValue()
            }
        })
        
        return ioValue
    }
    
    /**
     * Dump the stored copies of any geometry in this atom to free up ram.
     */ 
    dumpBuffer(){
        this.inputs.forEach(input => {
            input.dumpBuffer()
        })
        if(this.output){
            this.output.dumpBuffer()
        }
        this.value = null
    }
    
    /**
     * Creates an editable HTML item to set the value of an object element. Used in the sidebar.
     * @param {object} list - The HTML object to attach the new item to.
     * @param {object} object - The object with the element we are editing.
     * @param {string} key - The key of the element to edit.
     * @param {string} label - The label to display next to the editable value.
     * @param {boolean} resultShouldBeNumber - A flag to indicate if the input should be converted to a number.
     * @param {object} callBack - Optional. A function to call with the new value when the value changes.
     */ 
    createEditableValueListItem(list,object,key, label, resultShouldBeNumber, callBack){

        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'sidebar-item sidebar-editable-div')
        
        //Left div which displays the label
        var labelDiv = document.createElement('label')
        div.appendChild(labelDiv)
        var labelText = document.createTextNode(label + ':')
        labelDiv.appendChild(labelText)
        labelDiv.setAttribute('class', 'sidebar-subitem label-item')
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement('span')
        labelDiv.appendChild(valueTextDiv)
        var valueText = document.createTextNode(object[key])
        valueTextDiv.appendChild(valueText)
        valueTextDiv.setAttribute('contenteditable', 'true')
        valueTextDiv.setAttribute('class', 'editing-item')
        var thisID = label+GlobalVariables.generateUniqueID()
        valueTextDiv.setAttribute('id', thisID)
        
        
        document.getElementById(thisID).addEventListener('focusout',() =>{
            var valueInBox = document.getElementById(thisID).textContent.trim()
            if(resultShouldBeNumber){
                valueInBox = GlobalVariables.limitedEvaluate(valueInBox)
            }
            
            //If the target is an attachmentPoint then call the setter function
            if(object instanceof AttachmentPoint){
                object.setValue(valueInBox)
            }
            else{
                object[key] = valueInBox
                callBack(valueInBox)
            }
        })
        
        //prevent the return key from being used when editing a value
        document.getElementById(thisID).addEventListener('keypress', function(evt) {
            if (evt.which === 13) {
                evt.preventDefault() 
                document.getElementById(thisID).blur() //shift focus away if someone presses enter
            }
        })

    }
    
    /**
     * Creates an non-editable HTML item to set the value of an object element. Used in the sidebar.
     * @param {object} list - The HTML object to attach the new item to.
     * @param {object} object - The object with the element we are displaying.
     * @param {string} key - The key of the element to display.
     * @param {string} label - The label to display next to the displayed value.
     */ 
    createNonEditableValueListItem(list,object,key, label){
        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'sidebar-item sidebar-editable-div')
        
        //Left div which displays the label
        var labelDiv = document.createElement('div')
        div.appendChild(labelDiv)
        var labelText = document.createTextNode(label + ':')
        labelDiv.appendChild(labelText)
        labelDiv.setAttribute('class', 'sidebar-subitem label-item')
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement('div')
        div.appendChild(valueTextDiv)
        var valueText = document.createTextNode(object[key])
        valueTextDiv.appendChild(valueText)
        valueTextDiv.setAttribute('contenteditable', 'false')
        valueTextDiv.setAttribute('class', 'sidebar-subitem noediting-item')
        var thisID = label+GlobalVariables.generateUniqueID()
        valueTextDiv.setAttribute('id', thisID)
        

    }
    
    /**
     * Creates a html representation of the passed text. Used in the sidebar.
     * @param {object} list - The HTML object to attach the new item to.
     * @param {string} texxt - The text used to generate the markdown html.
     */ 
    createMarkdownListItem(list, text){
        
        var converter = new showdown.Converter()
        //var text      = '# hello, markdown!'
        var html      = converter.makeHtml(text)
        
        var markdownTextDiv = document.createElement('div')
        markdownTextDiv.innerHTML = html
        
        //var valueText = document.createTextNode(text)
        //valueTextDiv.appendChild(valueText)
        list.appendChild(markdownTextDiv)       
    }
    
    /**
     * Creates dropdown with multiple options to select. Used in the sidebar.
     * @param {object} list - The HTML object to attach the new item to.
     * @param {object} parent - The parent which has the function to call on the change...this should really be done with a callback function.
     * @param {array} options - A list of options to display in the drop down.
     * @param {number} selectedOption - The zero referenced index of the selected option.
     * @param {string} description - A description of what the dropdown does.
     * @param {object} Callback function
     */ 
    createDropDown(list,parent,options,selectedOption, description, callback){
        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'sidebar-item')
        
        //Left div which displays the label
        var labelDiv = document.createElement('div')
        div.appendChild(labelDiv)
        var labelText = document.createTextNode(description)
        labelDiv.appendChild(labelText)
        labelDiv.setAttribute('class', 'sidebar-subitem')
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement('div')
        div.appendChild(valueTextDiv)
        var dropDown = document.createElement('select')
        options.forEach(option => {
            var op = new Option()
            op.value = options.findIndex(thisOption => thisOption === option)
            op.text = option
            dropDown.options.add(op)
        })
        valueTextDiv.appendChild(dropDown)
        valueTextDiv.setAttribute('class', 'sidebar-subitem')
        
        dropDown.selectedIndex = selectedOption //display the current selection
        
        dropDown.addEventListener(
            'change',
            function() { callback(dropDown.value) },
            false
        )
    }
    
    /**
     * Creates button. Used in the sidebar.
     * @param {object} list - The HTML object to attach the new item to.
     * @param {object} parent - The parent which has the function to call on the change...this should really be done with a callback function.
     * @param {string} buttonText - The text on the button.
     * @param {object} functionToCall - The function to call when the button is pressed.
     */ 
    createButton(list,parent,buttonText,functionToCall){
        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'runSideBarDiv')
        
        
        //Right div which is button
        var valueTextDiv = document.createElement('div')
        div.appendChild(valueTextDiv)
        var button = document.createElement('button')
        var buttonTextNode = document.createTextNode(buttonText)
        button.setAttribute('class', ' browseButton')
        button.setAttribute('id', buttonText.replace(/\s+/g, "") + "-button")
        button.appendChild(buttonTextNode)
        valueTextDiv.appendChild(button)
        valueTextDiv.setAttribute('class', 'sidebar-subitem')
        
        button.addEventListener(
            'mousedown',
            function() { functionToCall() } ,
            false
        )
    }
    
    /**
     * Creates button. Used in the sidebar.
     * @param {object} list - The HTML object to attach the new item to.
     * @param {string} buttonText - The text on the button.
     * @param {boolean} - Flag to see if checkbox is checked
     * @param {object} functionToCall - The function to call when the button is pressed.
     */ 
    createCheckbox(sideBar,text,isChecked,callback){
        var gridDiv = document.createElement('div')
        sideBar.appendChild(gridDiv)
        gridDiv.setAttribute('id', text + "-parent")
        gridDiv.setAttribute('class', "sidebar-checkbox")
        var gridCheck = document.createElement('input')
        gridDiv.appendChild(gridCheck)
        gridCheck.setAttribute('type', 'checkbox')
        gridCheck.setAttribute('id', text)
        
        if (isChecked){
            gridCheck.setAttribute('checked', 'true')
        }
        

        var gridCheckLabel = document.createElement('label')
        gridDiv.appendChild(gridCheckLabel)
        gridCheckLabel.setAttribute('for', 'gridCheck')
        gridCheckLabel.setAttribute('style', 'margin-right:1em;')
        gridCheckLabel.textContent = text

        gridCheck.addEventListener('change', event => {
            callback(event)
        })
    }
}