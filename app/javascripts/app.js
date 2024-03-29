import '../stylesheets/app.css'
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import notebook_artifacts from '../../build/contracts/Notebook.json'

var Notebook = contract(notebook_artifacts);

var accounts;
var account;


window.App = {
  start: function() {
    var self = this;

    Notebook.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.getCurrentAddress(account);
      self.refreshNotes();
    });
  },

   getCurrentAddress: function (acc) {
     var addr = document.getElementById("own_address");
     addr.innerText = acc.valueOf();
   },

   showNotes: function(message) {
     var self = this;
     var status = document.getElementById("status");
    if (message[0] === "" || message.length == 0) {
      status.innerHTML = "";
    }
    else
     {
       status.innerHTML = "";

       for (var i = 0; i < message.length; i++) {
         console.log('appending html on index ' + i);
         status.innerHTML += self.createNotesHtml(message[i], i);
       }
     }
  },

  getNumberOfNotes : function() {
    return Notebook.deployed().then(function (instance) {
      return instance.getNumberOfNotes()
        .then(data => {
          console.log("number of notes: " + data.toLocaleString());
          return data.valueOf();
        })
    })
  },

  refreshNotes : function() {
    return this.getNumberOfNotes()
      .then(numberOfNotes => {
        let promises = [];
        for (let i = 0; i < numberOfNotes; i++) {
          promises.push(Notebook.deployed().then(function (instance) {
            return instance.getNote(i, {from:account});
          }))
        }
        Promise.all(promises).then(promises => {
          App.showNotes(promises);
        })
      })
  },

   addNote : function() {
    var self = this;
    var text = document.getElementById("note_text").value;
    var status = document.getElementById("check_status");

    Notebook.deployed().then(function(instance) {
    return instance.addNote(text, {from:account});
    }).then(function() {
    self.refreshNotes();
    }).catch(function (e) {
      console.log(e);
      status.innerText = "Out of gas error!";
     });
  },


  editNote : function(index, text) {
    var self = this;

    console.log('editing note ' + index);
    Notebook.deployed().then(function(instance) {
      return instance.editNote(index, text, {from:account});
    }).then(function() {
      self.refreshNotes();
    }).catch(function (e) {
      console.log(e);
    });
  },

  getText : function (index) {
    var self = this;

    var elem = document.getElementById(index);
    var text = elem.innerText;
    elem.addEventListener("submit", self.editNote(index, text), false);
    console.log(text.innerText);
  },

  createNotesHtml : function(textItem, idItem) {
    console.log('creating html');
    var notesHtml =
      "<br/>"
    + "<div class=\"note-item\">"
    +   "<div><p class=\"text-left\"><h4 contenteditable='true' id='"+ idItem +"'>" + textItem + "</h4></p></div>"
    +   "<p class=\"text-right\">"
    +     "<button type='submit' class=\"btn btn-default\" onClick=\"App.getText("+idItem+")\">Сохранить измения</button>"
    +     "<button class=\"btn btn-default\" \">Удалить</button>"
    +   "</p>"
    + "</div>";
    return notesHtml;
  },

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});

