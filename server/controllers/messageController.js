import * as firebase from "firebase";

class messageController {
  static createMessage(request, response){
    const newMessage = request.body.message;
    const priority = request.body.priority;
    const groupId = request.params.id
    const database = firebase.database();
    const user = firebase.auth().currentUser;

    if(!user) {
      response.send({
        message: 'You are not currently signed in'
      });
    }
    if(!newMessage) {
      response.send({
        message: 'Input field, message mustn\'t be null.'
      })
    }
    const message = database.ref(`messages`).push({
      message: newMessage,
      author: user.displayName,
      date: new Date().toString(),
      profilePicture: user.photoURL,
      priority,
      groupId
    });
    response.status(201).send({
      message: 'Message successfully created'
    });
  }
  static updateMessage(request, response) {
    let user = firebase.auth().currentUser;

    const messageId = request.params.id;
    const updatedMessage = request.body.message;
    const database = firebase.database();

    if(!user) {
      response.send({
        message: 'You are not currently signed in'
      });
    }
    if(!updatedMessage) {
      response.send({
        message: 'Input field, message mustn\'t be null.'
      })
    }
    let author;
    database.ref(`messages/${messageId}`)
      .once('value')
      .then((snapshot) => {
        author= snapshot.val().author;
        return author
      })
      .then((author) => {
        if(author === user.displayName) {
          database.ref(`messages/${messageId}`).update({
            message: updatedMessage
          });
          response.status(200).send({
            message: "Message was sucessfully updated"
          });
        }else {
          response.status(401).send({
            message: 'You are not authorized to edit'
          })
        }
      })
  }
  static deleteMessage(request, response) {
    const user = firebase.auth().currentUser;
    let messageId = request.params.id;
    const database = firebase.database();

    if(!user) {
      response.send({
        message: 'You are not currently signed in'
      });
    }
    let author;
    database.ref(`messages/${messageId}`)
      .once('value')
      .then((snapshot) => {
        author= snapshot.val().author;
        return author
      })
      .then((author) => {
        if(author === user.displayName) {
          console.log(messageId);
          const database = firebase.database();
          database.ref(`messages/${messageId}`).remove();
          response.status(200).send({
            message: `Message ${messageId} was successfully deleted`
          });
        }else {
          response.status(401).send({
            message: 'You are not authorized to delete this message'
          })
        }
      })
  }
}

module.exports = messageController;