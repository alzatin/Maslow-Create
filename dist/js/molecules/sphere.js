var Sphere = Atom.create({
    name: "Sphere",
    atomType: "Sphere",
    defaultCodeBlock: "sphere({r: ~radius~, center: true, fn: 50})",
    codeBlock: "",
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.addIO("input", "radius", instance, "number");
        instance.addIO("output", "geometry", instance, "geometry");
        
        //generate the correct codeblock for this atom on creation
        instance.updateCodeBlock();
        
        return instance;
    }
});