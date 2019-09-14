import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'

/**
 * The Cut Layout atom extracts a copy of each shape on the cutlist and places them optimally on a cut sheet.
 */
export default class CutLayout extends Atom{
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Cut Layout'
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'cutLayout'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Cut Layout'
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * A placeholder to keep updateValue from doing anything
     */ 
    updateValue(){
        
    }
    
    /**
     * Create a button to download the .svg file.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        this.createButton(list, this, "Download .SVG Sheet", ()=>{this.generateStl()})
    }
    
    /**
     * Extracts all of the elements with the cutList tag, centers each one, generates a .svg file from each one, then lays out all the .svg files on a sheet
     */ 
    generateStl(){
        const values = [this.findIOValue('geometry')]
        
        const computeValue = async (values, key) => {
            try{
                return await GlobalVariables.ask({values: values, key: key})
            }
            catch(err){
                this.setAlert(err)
            }
        }
        
        computeValue(values, "getLayoutSvgs").then(result => {
            if (result != -1 ){
                console.log("Returned from worker: ")
                console.log(result)
                //const blob = new Blob([result], {type: 'text/plain;charset=utf-8'})
                //saveAs(blob, GlobalVariables.topLevelMolecule.name+'.svg')
            }else{
                this.setAlert("Unable to compute")
            }
        })
    }
    
}
