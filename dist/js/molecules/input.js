class Input extends Atom {
    
    constructor(values){
        super (values);
        
        this.addIO("output", "number or geometry", this, "geometry");
        
        this.name = "Input" + generateUniqueID();
        this.codeBlock = "";
        this.type = "input";
        this.atomType = "Input";
        this.name = "Input";
        this.height = 16;
        this.radius = 15;
        
        for(var key in values) {
            this[key] = values[key];
        }
        
        //Add a new input to the current molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.addIO("input", this.name, this.parent, "geometry");
        }
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList =  Atom.updateSidebar.call(this); //call the super function
        
        createEditableValueListItem(valueList,this,"name", "Name", false);
        
    }
    
    draw() {
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        
        c.fillStyle = this.color;
        
        c.textAlign = "start"; 
        c.fillText(this.name, this.x + this.radius, this.y-this.radius);

        
        c.beginPath();
        c.moveTo(this.x - this.radius, this.y - this.height/2);
        c.lineTo(this.x - this.radius + 10, this.y);
        c.lineTo(this.x - this.radius, this.y + this.height/2);
        c.lineTo(this.x + this.radius, this.y + this.height/2);
        c.lineTo(this.x + this.radius, this.y - this.height/2);
        c.fill();
        c.closePath();

    }
    
    setValue(theNewName){
        //Called by the sidebar to set the name
        
        //Run through the parent molecule and find the input with the same name
        this.parent.children.forEach(child => {
            if (child.name == this.name){
                console.log("match found for: " + this.name);
                this.name = theNewName;
                child.name = theNewName;
            }
        });
    }
    
    setOutput(newOutput){
        //Set the input's output
        
        this.codeBlock = newOutput;  //Set the code block so that clicking on the input previews what it is 
        
        //Set the output nodes with type 'geometry' to be the new value
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(newOutput);
            }
        });
    } 
    
    updateCodeBlock(){
        //This empty function handles any calls to the normal update code block function which breaks things here
    }
}
