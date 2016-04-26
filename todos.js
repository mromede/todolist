Router.configure({
  layoutTemplate: 'main'
}); //This will apply to all of the routes in this project
Todos = new Mongo.Collection('todos'); //To store all of our tasks
if(Meteor.isClient){
    // client code goes here
    Template.todos.helpers({
      'todo': function(){
        var currentList = this._id;
        var currentUser = Meteor.userId();
        return Todos.find({ listId: currentList, createdBy: currentUser }, {sort: {createdAt: -1}})
      }
    //new tasks appear at the top of the list a.k.a it's sorted in descending
    });
    Template.login.onCreated(function(){
      console.log("The 'login' template was just created.");
    });

    Template.login.onRendered(function(){
      $('.login').validate();
      //console.log("The 'login' template was just rendered.");
    });
    Template.login.onDestroyed(function(){
      console.log("The 'login' template was just destroyed.");
    });
    Template.addTodo.events({
      'submit form':function(event){
        event.preventDefault();
        var todoName = $('[name="todoName"]').val();
        var currentUser =Meteor.userId();
        var currentList = this._id;
        Todos.insert({
          name: todoName,
          completed: false, 
          createdAt: new Date(),
          createdBy: currentUser,
          listId: currentList
        });
        $('[name="todoName"]').val('');
      }
    });
    Template.todoItem.events({
      'click .delete-todo':function(event){
        event.preventDefault();
        var documentId = this._id; //Saves unique ID of the document
        var confirm = window.confirm("Delete this task?");
        if(confirm==true){
          Todos.remove({_id: documentId}); //removes doc from our collection
        } 
      },
      'keyup [name=todoItem]': function(event){//executes when a key is pressed
        if(event.which == 13 || event.which == 27){
          $(event.target).blur();
        }else {
          var documentId = this._id;
          var todoItem = $(event.target).val();
          Todos.update({ _id: documentId }, {$set: { name: todoItem }});
        }
      },
      'change [type=checkbox]':function(){
        var documentId = this._id;
        var isCompleted = this.completed;
        if(isCompleted){
          Todos.update({_id: documentId}, {$set: {completed: false}})
          console.log("Task marked as incomplete.");
        }else{ 
          Todos.update({_id: documentId}, {$set: {completed: true}})
          console.log("Task marked as complete.");
        }
      },
      'submit form':function(event){
        event.preventDefault();
        var listName = $('[name=listName]').val();
        console.log("submitted");
        Lists.insert({
          name: listName
        });
        $('[name=listName]').val('');
      }
    });
    Template.todoItem.helpers({
      'checked': function(){
        var isCompleted = this.completed;
        if(isCompleted){
            return "checked"; 
        }else {
          return "";
        }
      }
    });
    Template.navigation.events({
      'click .logout':function(event){
        event.preventDefault();
        Meteor.logout(); //Provided to us by Meteor to logout
        Router.go('login');
      }
    });
    Template.login.events({
      'submit form': function(event){
        event.preventDefault();
        /*
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
          if(error){
            console.log(error.reason); //If error, Will display 'user not found'
          } else{
            var currentRoute = Router.current().route.getName();
            if(currentRoute=="login"){
              Router.go("home");
            }
          }
        }); //provided by package*/ 
      }
    });  
    //"meteor reset" wipes the database and starts over
    Template.register.events({
      'submit form': function(){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({ //provided by the meteor package we installed
          email: email,
          password: password
        }, function(eroor){
          if(error){
            console.log(error.reason);
          } else{
            Router.go("home");
          }
        });
        Router.go('home');
      }
    });
    Template.lists.helpers({
      'list': function(){
        var currentUser = Meteor.userId();
        return Lists.find({ createdBy: currentUser }, {sort: {name: 1}})
      }
    });
    Template.todosCount.helpers({
      'totalTodos':function(){
        var currentList = this._id;
        return Todos.find({ listId: currentList }).count();
      },
      'completedTodos':function(){
        var currentList = this._id;
        return Todos.find({ listId: currentList, completed: true }).count(); //For all completed items
      } 
    });
    Template.addList.events({
      'submit form':function(event){
        event.preventDefault();
        var listName = $('[name=listName]').val();
        var currentUser = Meteor.userId(); //Saves id of logged in user
        console.log("hi");
        Lists.insert({
          name: listName,
          createdBy: currentUser 
        }, function(error, results){ //Be able to detect error and define response
            // console.log(results); //results=id of new created document
            Router.go('listPage', {_id: results}); //Redirects users to new page(listPage route)
      });
        $('[name=listName]').val('');
      }
    }); 
    Template.home.events({
      'click [data-social-login]' ( event, template ) {
        const service = event.target.getAttribute( 'data-social-login' ),
            options = {
              requestPermissions: [ 'email' ]
            };

        if ( service === 'loginWithTwitter' ) {
          delete options.requestPermissions;
        }
        
        Accounts.ui.config({
          requestPermissions: {
            facebook: ['email', 'user_location','user_status']
          }
        });

        Meteor[ service ]( options, ( error ) => {
          if ( error ) {
            Bert.alert( error.message, 'danger' );
          }
        });
      } 
    }); 
  Template.signInWithEmailModal.onCreated( () => {
    let template = Template.instance();
    template.createOrSignIn = new ReactiveVar();
  }); 

  Template.signInWithEmailModal.onRendered( () => {
    Modules.client.handleAuthentication({
      form: '#sign-in-with-email',
      template: Template.instance()
    });
  });

  Template.signInWithEmailModal.events({
    'click [data-auth-type]' ( event, template ) {
      let type = event.target.getAttribute( 'data-auth-type' );
      template.createOrSignIn.set( type );
    },
    'submit form' ( event ) { 
      event.preventDefault();
    }
  });
}
/*
meteor add accounts-password created=s a Meteor.users collection
we can store users data there. It gives the foundaton for an account
system: email+password for registration/login
*/
Router.route('/register');
Router.route('/login');
Router.route('/', {
  name: 'home',
  template: 'home'
});
Router.route('/list/:_id', { 
  name: 'listPage',
  template: 'listPage',
  data: function(){
    var currentTournamentId = this.params._tournamentid;
    
  },
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser){
      this.next(); //lets the route have normal behavior if the condition=true
    }else{
      this.render("login");
    }
  },
  onRun: function(){
    console.log("You triggered 'onRun' for 'listPage' route.");
    this.next();
  },
  onRerun: function(){
    console.log("You triggered 'onRerun' for 'listPage' route.");
  },
  onAfterAction: function(){
    console.log("You triggered 'onAfterAction' for 'listPage' route.");
  },
  onStop: function(){
    console.log("You triggered 'onStop' for 'listPage' route.");
  }
});

if(Meteor.isServer){ 
    // server code goes here
}
// Todos.insert({
//     name: "Walk the dog",
//     completed: false,
//     createdAt: new Date()
// });

Lists = new Meteor.Collection('lists');

