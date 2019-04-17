import Molecule from './molecules/molecule.js'
import GlobalVariables from './globalvariables'
import { readFileSync } from './JSxCAD.js';

export default function GitHubModule(){
    
    var octokit = new Octokit();
    var popup = document.getElementById('projects-popup');
    var currentRepoName = null;
    var currentUser = null;
    var bomHeader = "###### Note: Do not edit this file directly, it is automatically generated from the CAD model \n# Bill Of Materials \n |Part|Number Needed|Price|Source| \n |----|----------|-----|-----|";

    var intervalTimer;
    
    document.getElementById("loginButton").addEventListener("mousedown", (e) => {
       this.tryLogin();
    });
    

    this.tryLogin = function(){
        // Initialize with OAuth.io app public key
        OAuth.initialize('BYP9iFpD7aTV9SDhnalvhZ4fwD8');
        // Use popup for oauth
        OAuth.popup('github').then(github => {
            
            octokit.authenticate({
                type: "oauth",
                token: github.access_token
            })
            
            //Test the authentication 
            octokit.users.getAuthenticated({}).then(result => {
                currentUser = result.data.login;
                this.showProjectsToLoad();
            });
        });
    }

    this.showProjectsToLoad = function(){
        //Remove everything in the popup now
        while (popup.firstChild) {
            popup.removeChild(popup.firstChild);
        }
        
        popup.classList.remove('off');
        popup.setAttribute("style", "text-align: center");
        
        var tabButtons = document.createElement("DIV");
        tabButtons.setAttribute("class", "tab");
        tabButtons.setAttribute("style", "display: inline-block;");
        popup.appendChild(tabButtons);
        
        var yoursButton = document.createElement("button");
        yoursButton.setAttribute("class", "tablinks");
        yoursButton.appendChild(document.createTextNode("Your Projects"));
        yoursButton.style.fontSize = "xx-large";
        yoursButton.setAttribute("id", "yoursButton");
        yoursButton.addEventListener("click", (e) => {
            this.openTab(e, "yoursButton");
        });
        tabButtons.appendChild(yoursButton);
        
        var githubButton = document.createElement("button");
        githubButton.setAttribute("class", "tablinks");
        githubButton.appendChild(document.createTextNode("All Projects"));
        githubButton.style.fontSize = "xx-large";
        githubButton.setAttribute("id", "githubButton");
        githubButton.addEventListener("click", (e) => {
            this.openTab(e, "githubButton");
        });
        tabButtons.appendChild(githubButton);
        
        popup.appendChild(document.createElement("br"));
        
        var searchBar = document.createElement("input");
        searchBar.setAttribute("type", "text");
        searchBar.setAttribute("placeholder", "Search for project..");
        searchBar.setAttribute("class", "menu_search");
        searchBar.setAttribute("id", "project_search");
        searchBar.setAttribute("style", "width: 50%");
        popup.appendChild(searchBar);
        searchBar.addEventListener('keyup', (e) => {
           this.loadProjectsBySearch(e, searchBar.value);
        });
        
        
        this.projectsSpaceDiv = document.createElement("DIV");
        this.projectsSpaceDiv.setAttribute("class", "float-left-div{");
        popup.appendChild(this.projectsSpaceDiv);
        
        yoursButton.click()
    }
    
    this.loadProjectsBySearch = function(ev, searchString){

        if(ev.key == "Enter"){
            //Remove projects shown now
            while (this.projectsSpaceDiv.firstChild) {
                this.projectsSpaceDiv.removeChild(this.projectsSpaceDiv.firstChild);
            }
            
            //Add the create a new project button
            this.addProject("New Project", null, true, "newProject.svg");
            
            //Load projects
            var query;
            var owned;
            if(document.getElementsByClassName("tablinks active")[0].id == "yoursButton"){
                owned = true;
                query = searchString + ' ' + 'fork:true user:' + currentUser + ' topic:maslowcreate';
            }
            else{
                owned = false;
                query = searchString + ' topic:maslowcreate';
            }
            
            //Figure out how many repos this user has, search will throw an error if they have 0;
            octokit.repos.list({
                affiliation: 'owner',
            }).then(({data, headers, status}) => {
                if(data.length == 0){                   //If the user has no repos at all, the search will fail so we want to spawn a popup here and clone the example
                    this.cloneExampleProjectPopup();
                }
            });
            
            octokit.search.repos({
                q: query,
                sort: "stars",
                per_page: 100,
                page: 1,
                headers: {
                    accept: 'application/vnd.github.mercy-preview+json'
                }
            }).then(result => {
                result.data.items.forEach(repo => {
                    const thumbnailPath = "https://raw.githubusercontent.com/"+repo.full_name+"/master/project.svg?sanitize=true";
                    this.addProject(repo.name, repo.id, owned, thumbnailPath);
                });
                if(result.data.items.length == 0 && searchString == ''){ //If the empty search returned no results on loading
                    this.cloneExampleProjectPopup();
                }
            }); 
        } 
    }
    
    this.cloneExampleProjectPopup = function(){
        this.forkByID(177732883); //This is the ID of the example project
    }
    
    this.addProject = function(projectName, id, owned, thumbnailPath){
        //create a project element to display
        
        var project = document.createElement("DIV");
        
        var projectPicture = document.createElement("IMG");
        projectPicture.setAttribute("src", thumbnailPath);
        projectPicture.setAttribute("style", "width: 100%; height: 100%;");
        project.appendChild(projectPicture);
        project.appendChild(document.createElement("BR"));
        
        var shortProjectName;
        if(projectName.length > 9){
            shortProjectName = document.createTextNode(projectName.substr(0,7)+"..");
        }
        else{
            shortProjectName = document.createTextNode(projectName);
        }
        project.setAttribute("class", "project");
        project.setAttribute("id", projectName);
        project.appendChild(shortProjectName); 
        this.projectsSpaceDiv.appendChild(project); 
        
        document.getElementById(projectName).addEventListener('click', event => {
            this.projectClicked(projectName, id, owned);
        })

    }

    this.projectClicked = function(projectName, projectID, owned){
        //runs when you click on one of the projects
        if(projectName == "New Project"){
            this.createNewProjectPopup();
        }
        else if(owned){
            this.loadProject(projectName);
        }
        else{
            window.open('/run?'+projectID);
        }
    }
    
    this.openTab = function(evt, tabName) {
      
      // Declare all variables
      var i, tabcontent, tablinks;

      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      // Get all elements with class="tablinks" and remove the class "active"
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      // Show the current tab, and add an "active" class to the button that opened the tab
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
      
      //Click on the search bar so that when you start typing it shows updateCommands
      document.getElementById('menuInput').focus();
      
      
      this.loadProjectsBySearch({key: "Enter"}, document.getElementById("project_search").value);
    }
    
    this.createNewProjectPopup = function(){
        //Clear the popup and populate the fields we will need to create the new repo
        
        while (popup.firstChild) {
            popup.removeChild(popup.firstChild);
        }
        
        //Project name
        // <div class="form">
        var createNewProjectDiv = document.createElement("DIV");
        createNewProjectDiv.setAttribute("class", "form");
        
        //Add a title
        var header = document.createElement("H1");
        var title = document.createTextNode("Create a new project");
        header.appendChild(title);
        createNewProjectDiv.appendChild(header);
        
        //Create the form object
        var form = document.createElement("form");
        form.setAttribute("class", "login-form");
        createNewProjectDiv.appendChild(form);
        
        //Create the name field
        var name = document.createElement("input");
        name.setAttribute("id","project-name");
        name.setAttribute("type","text");
        name.setAttribute("placeholder","Project name");
        form.appendChild(name);
        
        //Add the description field
        var description = document.createElement("input");
        description.setAttribute("id", "project-description");
        description.setAttribute("type", "text");
        description.setAttribute("placeholder", "Project description");
        form.appendChild(description);
        
        //Add the button
        var createButton = document.createElement("button");
        createButton.setAttribute("type", "button");
        createButton.addEventListener('click', (e) => {
           this.createNewProject();
        });
        var buttonText = document.createTextNode("Create Project");
        createButton.appendChild(buttonText);
        form.appendChild(createButton);
        

        popup.appendChild(createNewProjectDiv);

    }
    
    this.shareOpenedProject = function(){
        alert("A page with a shareable url to this project will open in a new window. Share the link to that page with anyone you would like to share the project with.");
            
        octokit.repos.get({
            owner: currentUser,
            repo: currentRepoName
        }).then(result => {
            var ID = result.data.id;
            window.open('/run?'+ID);
        });
    }
    
    this.openGitHubPage = function(){
        //Open the github page for the current project in a new tab
        octokit.repos.get({
            owner: currentUser,
            repo: currentRepoName
        }).then(result => {
            var url = result.data.html_url;
            window.open(url);
        });
    }
    
    this.createNewProject = function(){
        
        if(typeof intervalTimer != undefined){
            clearInterval(intervalTimer); //Turn of auto saving
        }
        
        //Get name and description
        var name = document.getElementById('project-name').value;
        var description = document.getElementById('project-description').value;
        
        //Load a blank project
        GlobalVariables.topLevelMolecule = new Molecule({
            x: 0, 
            y: 0, 
            topLevel: true, 
            name: name,
            atomType: "Molecule",
            uniqueID: GlobalVariables.generateUniqueID()
        });
        
        GlobalVariables.currentMolecule = GlobalVariables.topLevelMolecule;
        
        //Create a new repo
        octokit.repos.createForAuthenticatedUser({
            name: name,
            description: description
        }).then(result => {
            //Once we have created the new repo we need to create a file within it to store the project in
            currentRepoName = result.data.name;
            var path = "project.maslowcreate";
            var content = window.btoa(JSON.stringify(GlobalVariables.topLevelMolecule.serialize(null), null, 4)); // create a file with the new molecule in it and base64 encode it
            octokit.repos.createFile({
                owner: currentUser,
                repo: currentRepoName,
                path: path,
                message: "initialize repo", 
                content: content
            }).then(result => {
                //Then create the BOM file
                content = window.btoa(bomHeader); // create a file with just the header in it and base64 encode it
                octokit.repos.createFile({
                    owner: currentUser,
                    repo: currentRepoName,
                    path: "BillOfMaterials.md",
                    message: "initialize BOM", 
                    content: content
                }).then(result => {
                    //Then create the README file
                    content = window.btoa("readme init"); // create a file with just the word "init" in it and base64 encode it
                    octokit.repos.createFile({
                        owner: currentUser,
                        repo: currentRepoName,
                        path: "README.md",
                        message: "initialize README", 
                        content: content
                    }).then(result => {
                        console.log("Readme created");
                        
                        var _this = this;
                        intervalTimer = setInterval(function() { _this.saveProject(); }, 30000); //Save the project regularly
                    });
                });
            });
            
            //Update the project topics
            octokit.repos.replaceTopics({
                owner: currentUser,
                repo: currentRepoName,
                names: ["maslowcreate", "maslowcreate-project"],
                headers: {
                    accept: 'application/vnd.github.mercy-preview+json'
                }
            })
        });
        
        GlobalVariables.currentMolecule.backgroundClick();
        
        //Clear and hide the popup
        while (popup.firstChild) {
            popup.removeChild(popup.firstChild);
        }
        popup.classList.add('off');
        
        
    }

    this.saveProject = function(){
        //Save the current project into the github repo
        if(currentRepoName != null){
            
            GlobalVariables.api.writeStl({ path: 'github' },GlobalVariables.topLevelMolecule.value);
            const stlContent = readFileSync('github');
            
            const project = GlobalVariables.topLevelMolecule.value.rotate([90,0,0]);
            GlobalVariables.api.writeSvg({ path: 'github' }, project);
            const contentSvg = readFileSync('github');
            
            var bomContent = bomHeader;
            GlobalVariables.topLevelMolecule.requestBOM().forEach(item => {
                bomContent = bomContent + "\n|" + item.BOMitemName + "|" + item.numberNeeded + "|" + item.costUSD + "|" + item.source + "|";
            });
            
            var readmeContent = "# " + currentRepoName + "\n\n![](/project.svg)\n\n";
            GlobalVariables.topLevelMolecule.requestReadme().forEach(item => {
                readmeContent = readmeContent + item + "\n\n\n"
            });
            
            const projectContent = JSON.stringify(GlobalVariables.topLevelMolecule.serialize(null), null, 4);
            
            this.createCommit(octokit,{
              owner: currentUser,
              repo: currentRepoName,
              base: 'master', /* optional: defaults to default branch */
              changes: {
                files: {
                  'project.stl': stlContent,
                  'project.svg': contentSvg,
                  'BillOfMaterials.md': bomContent,
                  'README.md': readmeContent,
                  'project.maslowcreate': projectContent
                },
                commit: 'Autosave'
              }
            }); 
        }
    }
    
    this.createCommit = async function(octokit, { owner, repo, base, changes }) {
      let response;

      if (!base) {
        response = await octokit.repos.get({ owner, repo })
        base = response.data.default_branch
      }

      response = await octokit.repos.listCommits({
        owner,
        repo,
        sha: base,
        per_page: 1
      })
      let latestCommitSha = response.data[0].sha
      const treeSha = response.data[0].commit.tree.sha
      
      response = await octokit.git.createTree({
        owner,
        repo,
        base_tree: treeSha,
        tree: Object.keys(changes.files).map(path => {
          return {
            path,
            mode: '100644',
            content: changes.files[path]
          }
        })
      })
      const newTreeSha = response.data.sha

      response = await octokit.git.createCommit({
        owner,
        repo,
        message: changes.commit,
        tree: newTreeSha,
        parents: [latestCommitSha]
      })
      latestCommitSha = response.data.sha
      
      await octokit.git.updateRef({
        owner,
        repo,
        sha: latestCommitSha,
        ref: `heads/master`,
        force: true
      })
      
      console.log("Project saved");

    }
    
    this.loadProject = function(projectName){
        
        if(typeof intervalTimer != undefined){
            clearInterval(intervalTimer); //Turn off auto saving
        }
        
        currentRepoName = projectName;
        
        octokit.repos.getContents({
            owner: currentUser,
            repo: projectName,
            path: 'project.maslowcreate'
        }).then(result => {
                
            //content will be base64 encoded
            let rawFile = atob(result.data.content);
            
            
            var moleculesList = JSON.parse(rawFile).molecules;
            
            //Load a blank project
            GlobalVariables.topLevelMolecule = new Molecule({
                x: 0, 
                y: 0, 
                topLevel: true, 
                atomType: "Molecule"
            });
            
            GlobalVariables.currentMolecule = GlobalVariables.topLevelMolecule;
            
            //Load the top level molecule from the file
            GlobalVariables.topLevelMolecule.deserialize(moleculesList, moleculesList.filter((molecule) => { return molecule.topLevel == true; })[0].uniqueID);
            
            GlobalVariables.currentMolecule.backgroundClick();

            //Clear and hide the popup
            while (popup.firstChild) {
                popup.removeChild(popup.firstChild);
            }
            popup.classList.add('off');
            
            var _this = this;
            intervalTimer = setInterval(function() { _this.saveProject(); }, 30000); //Save the project regularly
        })
        
    }

    this.exportCurrentMoleculeToGithub = function(molecule){
        
        //Get name and description
        var name = molecule.name;
        var description = "A stand alone molecule exported from Maslow Create";
        
        //Create a new repo
        octokit.repos.createForAuthenticatedUser({
            name: name,
            description: description
        }).then(result => {
            //Once we have created the new repo we need to create a file within it to store the project in
            var repoName = result.data.name;
            var id       = result.data.id;
            var path     = "project.maslowcreate";
            var content  = window.btoa("init"); // create a file with just the word "init" in it and base64 encode it
            octokit.repos.createFile({
                owner: currentUser,
                repo: repoName,
                path: path,
                message: "initialize repo", 
                content: content
            }).then(result => {
                
                //Save the molecule into the newly created repo
                
                var path = "project.maslowcreate";
                
                molecule.topLevel = true; //force the molecule to export in the long form as if it were the top level molecule
                var content = window.btoa(JSON.stringify(molecule.serialize(null), null, 4)); //Convert the passed molecule object to a JSON string and then convert it to base64 encoding
                
                //Get the SHA for the file
                octokit.repos.getContents({
                    owner: currentUser,
                    repo: repoName,
                    path: path
                }).then(result => {
                    var sha = result.data.sha
                    
                    //Save the repo to the file
                    octokit.repos.updateFile({
                        owner: currentUser,
                        repo: repoName,
                        path: path,
                        message: "export Molecule", 
                        content: content,
                        sha: sha
                    }).then(result => {
                        console.log("Molecule Exported.");
                        
                        //Replace the existing molecule now that we just exported
                        molecule.replaceThisMoleculeWithGithub(id);
                    })
                })

            });
            
            //Update the project topics
            octokit.repos.replaceTopics({
                owner: currentUser,
                repo: repoName,
                names: ["maslowcreate", "maslowcreate-molecule"],
                headers: {
                    accept: 'application/vnd.github.mercy-preview+json'
                }
            })
            
        });
    }

    this.forkByID = function(id){
        
        //Authenticate - Initialize with OAuth.io app public key
        OAuth.initialize('BYP9iFpD7aTV9SDhnalvhZ4fwD8');
        // Use popup for oauth
        OAuth.popup('github').then(github => {
            
            octokit.authenticate({
                type: "oauth",
                token: github.access_token,
                headers: {
                    accept: 'application/vnd.github.mercy-preview+json'
                }
            })
            
            octokit.request('GET /repositories/:id', {id}).then(result => {
                //Find out the information of who owns the project we are trying to fork
                var user     = result.data.owner.login;
                var repoName = result.data.name;
                
                octokit.repos.listTopics({
                    owner: user, 
                    repo: repoName,
                    headers: {
                        accept: 'application/vnd.github.mercy-preview+json'
                    }
                }).then(result => {
                    var topics = result.data.names;
                    
                    //Create a fork of the project with the found user name and repo name under your account
                    octokit.repos.createFork({
                        owner: user, 
                        repo: repoName,
                        headers: {
                            accept: 'application/vnd.github.mercy-preview+json'
                        }
                    }).then(result => {
                        var repoName = result.data.name;
                        //Manually copy over the topics which are lost in forking
                        octokit.repos.replaceTopics({
                            owner: result.data.owner.login,
                            repo: result.data.name,
                            names: topics,
                            headers: {
                                accept: 'application/vnd.github.mercy-preview+json'
                            }
                        }).then(result => {
                            
                            
                            //Remove everything in the popup now
                            while (popup.firstChild) {
                                popup.removeChild(popup.firstChild);
                            }
                            
                            popup.classList.remove('off');
                            popup.setAttribute("style", "text-align: center");

                            var subButtonDiv = document.createElement('div');
                            subButtonDiv.setAttribute("class", "form");
                            
                             //Add a title
                            var titleDiv = document.createElement("DIV");
                            var title = document.createElement("H3");
                            title.appendChild(document.createTextNode("A copy of the project '" + repoName + "' has been copied and added to your projects. You can view it by clicking the button below."));
                            subButtonDiv.appendChild(title);
                            subButtonDiv.appendChild(document.createElement("br"));
                            
                            var form = document.createElement("form");
                            subButtonDiv.appendChild(form);
                            var button = document.createElement("button");
                            button.setAttribute("type", "button");
                            button.appendChild(document.createTextNode("View Projects"));
                            button.addEventListener("click", (e) => {
                                window.location.href = '/';
                            });
                            form.appendChild(button);
                            popup.appendChild(subButtonDiv);
                        });
                    });
                });
            });
        });
    }
}
