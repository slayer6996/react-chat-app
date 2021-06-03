import React, {useEffect, useRef, useState} from 'react'
import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  apiKey: "AIzaSyA8WXi9-MZQGRmPO_w7gV6PSdXRDDALZq4",
  authDomain: "nitc-chat.firebaseapp.com",
  projectId: "nitc-chat",
  storageBucket: "nitc-chat.appspot.com",
  messagingSenderId: "764767308037",
  appId: "1:764767308037:web:470286dfe7332a6b478f6c",
  measurementId: "G-XFKCHTYMKN"
})

const auth=firebase.auth()
const firestore=firebase.firestore()
const db=firebase.firestore()

function App() {

  const [user]=useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>NITC lyf</h1>
        <SignOut />
      </header>

      <section>
        {user? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn(){

    function signInWithGoogle(){
        const provider= new firebase.auth.GoogleAuthProvider()
        auth.signInWithPopup(provider)
    }

    return(
      <button onClick={signInWithGoogle} >sign in with Google</button>
    )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} >Sign Out</button>
  )
}

function clearTexts(){
    db.collection('messages').where('uid', '!=',null).get()
    .then(querySnapshot => {
      querySnapshot.docs[0].ref.delete()
    })
}

function ChatRoom(){
    const dummy= useRef()
    const messagesRef= firestore.collection('messages')
    const query= messagesRef.orderBy('createdAt')

    const [messages]=useCollectionData(query, {idField:'id'})

    const [formValue, setFormValue] = useState('')



    const sendMessage = async(e) => {
      e.preventDefault()
      
      const {uid, photoURL}= auth.currentUser

      await messagesRef.add({
        text:formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })

      setFormValue('')

      console.log(messages.length)
      dummy.current.scrollIntoView({behaviour: 'smooth'})
    }

    return(
      <>
        <main>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={dummy} ></div>
        </main>

        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message..." />
          <button type="submit" disabled={!formValue} >Send</button>
        </form>
      </>
    )
}

function ChatMessage(props){
  const {text, uid, photoURL}=props.message
  const messageClass=uid === auth.currentUser.uid ? 'sent' : 'received'

  return(
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  ) 
}

export default App;
