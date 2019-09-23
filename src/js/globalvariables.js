import { create, all }  from 'mathjs'
import Assembly         from './molecules/assembly.js'
import CutAway          from './molecules/cutaway.js'
import CutList          from './molecules/cutlist.js'
import Circle           from './molecules/circle.js'
import Color            from './molecules/color.js'
import CutLayout        from './molecules/cutlayout.js'
import Rectangle        from './molecules/rectangle.js'
import ShrinkWrap       from './molecules/shrinkwrap.js'
import Translate        from './molecules/translate.js'
import Tag              from './molecules/tag.js'
import RegularPolygon   from './molecules/regularpolygon.js'
import Extrude          from './molecules/extrude.js'
import Scale            from './molecules/scale.js'
import Stl              from './molecules/stl.js'
import Svg              from './molecules/svg.js'
import Union            from './molecules/union.js'
import Intersection     from './molecules/intersection.js'
import Difference       from './molecules/difference.js'
import Constant         from './molecules/constant.js'
import Equation         from './molecules/equation.js'
import ExtractTag       from './molecules/extracttag.js'
import Molecule         from './molecules/molecule.js'
import Input            from './molecules/input.js'
import Readme           from './molecules/readme.js'
import AddBOMTag        from './molecules/BOM.js'
import Rotate           from './molecules/rotate.js'
import GitHubMolecule   from './molecules/githubmolecule.js'
import Output           from './molecules/output.js'
import Stretch          from './molecules/stretch.js'
import Gcode            from './molecules/gcode.js'
import Code             from './molecules/code.js'
import GitHubModule     from './githubOauth'
import { createService } from './lib/service.js'

/**
 * This class defines things which are made available to all objects which import it. It is a singlton which means that each time it is imported the same instance is made available so if it is written to in one place, it can be read somewhere else.
 */
class GlobalVariables{
    /**
     * The constructor creates a new instance of the Global Variables object.
     */
    constructor(){
        /** 
         * The canvas object on which the atoms are drawn.
         * @type {object}
         */
        this.canvas = null
        /** 
         * The 2D reference to the canvas object on which the atoms are drawn.
         * @type {object}
         */
        this.c = null
        /** 
         * An array of all of the secret types of atoms which can not be placed by the user.
         * @type {array}
         */
        this.secretTypes = {
            output:        {creator: Output, atomType: 'Output'}
        }
        /** 
         * The current amount by which the canvas has been scaled.
         * @type {number}
         */
        this.scale1 = 1 
        /** 
         * An array of all of the available types of atoms which can be placed with a right click.
         * @type {array}
         */
        this.availableTypes = {
            assembly:           {creator: Assembly, atomType: 'Assembly', atomCategory: 'Actions'},
            circle:             {creator: Circle, atomType: 'Circle', atomCategory: 'Actions'},
            color:              {creator: Color, atomType: 'Color'},
            cutLayout:          {creator: CutLayout, atomType: "Cut Layout"},
            rectangle:          {creator: Rectangle, atomType: 'Rectangle'},
            shirinkwrap:        {creator: ShrinkWrap, atomType: 'ShrinkWrap'},
            translate:          {creator: Translate, atomType: 'Translate'},
            tag:                {creator: Tag, atomType: 'Tag'},
            regularPolygon:     {creator: RegularPolygon, atomType: 'RegularPolygon'},
            extrude:            {creator: Extrude, atomType: 'Extrude'},
            extracttag:         {creator: ExtractTag, atomType: 'ExtractTag'},
            scale:              {creator: Scale, atomType: 'Scale'},
            stl:                {creator: Stl, atomType: 'Stl'},
            svg:                {creator: Svg, atomType: 'Svg'},
            intersection:       {creator: Intersection, atomType: 'Intersection'},
            difference:         {creator: Difference, atomType: 'Difference'},
            costant:            {creator: Constant, atomType: 'Constant'},
            equation:           {creator: Equation, atomType: 'Equation'},
            molecule:           {creator: Molecule, atomType: 'Molecule'},
            input:              {creator: Input, atomType: 'Input'},
            readme:             {creator: Readme, atomType: 'Readme'},
            addBOMTag:          {creator: AddBOMTag, atomType: 'Add BOM Tag'},
            rotate:             {creator: Rotate, atomType: 'Rotate'},
            githubmolecule:     {creator: GitHubMolecule, atomType: 'GitHubMolecule'},
            union:              {creator: Union, atomType: 'Union'},
            stretch:            {creator: Stretch, atomType: 'Stretch'},
            gcode:              {creator: Gcode, atomType: 'Gcode'},
            code:               {creator: Code, atomType: 'Code'},
            cutAway:            {creator: CutAway, atomType: 'CutAway'},
            CutList:            {creator: CutList, atomType: 'CutList'}
        }
        /** 
         * A reference to the molecule curently being displayed on the screen.
         * @type {object}
         */
        this.currentMolecule
        /** 
         * A reference to the top level molecule of the project.
         * @type {object}
         */
        this.topLevelMolecule
        /** 
         * A flag to indicate if the program is running in run mode (ie a shared link).
         * @type {boolean}
         */
        this.runMode = false
        /** 
         * A flag to indicate if the evaluation of molecules is blocked. Used to prevent evaluation until all molecules have been placed.
         * @type {boolean}
         */
        this.evalLock = true
        /** 
         * The github object which is used to interact with GitHub.
         * @type {object}
         */
        this.gitHub = new GitHubModule()
        /** 
         * The size (in mm) of segments to use for circles.
         * @type {number}
         */
        this.circleSegmentSize = 2
        
        const agent = async ({ question }) => `Secret ${question}`
        createService({ webWorker: '../maslowWorker.js', agent }).then(result => {
            /** 
             * A worker thread which can do computation.
             * @type {object}
             */
            this.ask = result.ask
        })
        createService({ webWorker: '../maslowWorker.js', agent }).then(result => {
            /** 
             * The threejs renderer which displays things on the screen.
             * @type {object}
             */
            this.render = result.ask
        })
        createService({ webWorker: '../maslowWorker.js', agent }).then(result => {
            /** 
             * The worker which is used during the saving process.
             * @type {object}
             */
            this.saveWorker = result.ask
        })
        
        const math = create(all)
        /** 
         * An evaluator for strings as mathmatical equations which is sandboxed and secure.
         * @type {function}
         */
        this.limitedEvaluate = math.evaluate
        math.import({
            'import':     function () { throw new Error('Function import is disabled') },
            'createUnit': function () { throw new Error('Function createUnit is disabled') },
            'evaluate':   function () { throw new Error('Function evaluate is disabled') },
            'parse':      function () { throw new Error('Function parse is disabled') },
            'simplify':   function () { throw new Error('Function simplify is disabled') },
            'derivative': function () { throw new Error('Function derivative is disabled') }
        }, { override: true })
    }
    
    /** 
     * A function to generate a unique ID value. Currently uses random which does not gurintee that it will be unique.
     */
    generateUniqueID(){
        return Math.floor(Math.random()*900000) + 100000
    }
    
    /**
     * Computes the distance between two points on a plane. This is a duplicate of the one in utils which should probably be deleted.
     * @param {number} x1 - The x cordinate of the first point.
     * @param {number} x2 - The x cordinate of the second point.
     * @param {number} y1 - The y cordinate of the first point.
     * @param {number} y2 - The y cordinate of the second point.
     */ 
    distBetweenPoints(x1, x2, y1, y2){
        var a2 = Math.pow(x1 - x2, 2)
        var b2 = Math.pow(y1 - y2, 2)
        var dist = Math.sqrt(a2 + b2)
        
        return dist
    }
}

/**
 * Because we want global variables to be the same every time it is imported we export an instance of global variables instead of the constructor.
 */
export default (new GlobalVariables)