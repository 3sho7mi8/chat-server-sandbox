// Firebase Functions SDK
// HTTPリクエストをトリガするために使用
const functions = require('firebase-functions');

// Firebase Admin SDK
// Realtime Databaseの処理および認証をするために使用
const admin = require('firebase-admin');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const express = require('express');
const app = express();
const cors = require('cors')({origin: true});

app.use(cors);

// 引数cnameでRealtimeDatabaseのパスchannels/:cnameにデータを挿入
// Admin SDkによるRealtimeDatabaseの操作 => admin.database()
//   特定のノードを参照する場合は.refをつける
//   子ノードの参照は.child()
//   データの挿入は.set()
function createChannel(cname){
  let channelsRef = admin.database().ref('channels');
  let date1 = new Date();
  let date2 = new Date();
  date2.setSeconds(date2.getSeconds() + 1);

  const defaultData = `{
    "messages" : {
      "1" : {
        "body" : "Welcome to #${cname} channel!",
        "data" : "${date1.toJSON()}",
        "user" : {
          "avatar" : "",
          "id" : "robot",
          "name" : "Robot"
        }
      },
      "2" : {
        "body" : "はじめてのメッセージを投稿してみましょう。",
        "date" : "${date2.toJSON()}",
        "user" : {
          "avatar" : "".
          "id" : "robot",
          "name" : "Robot"
        }
      }
    }
  }`;
  channelsRef.child(cname).set(JSON.parse(defaultData));
}

app.post('/channels', (req, res) => {
  let cname = req.body.cname;
  createChannel(cname);
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.status(201).json({result: 'ok'});
});

// RealtimeDatastoreからチャンネル名を取得し、一覧をJSONで返す
// データを読み出す時はvalueイベントを使う
// 1回だけコールバック .once
app.get('/channels', (req, res) => {
  let channelsRef = admin.database().ref('channels');
  channelsRef.once('value', function(snapshot) {
    let items = new Array();
    snapshot.forEach(function(childSnapshot) {
      let cname = childSnapshot.key;
      items.push(cname);
    });
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send({channels: items});
  });
});

// :cnameの値はPOSTリクエストが行われた際にパス位置の値をreq.params.cnameにセットする
// .push()によってmessageオブジェクトをセットしている
app.post('/channels/:cname/messages', (req, res) => {
  let cname = req.params.cname;
  let message = {
    date: new Date().toJSON(),
    body: req.body.body,
    user: req.user
  };
  let messagesRef = admin.database().ref(`channels/${cname}/messages`);
  messagesRef.push(message);
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.status(201).send({result: 'ok'})
});

// RealtimeDatabaseはクエリを使うことで並べ替えや取得数の制限を行う
// .orderByChild() => 子キーdateによる並べ替え
// .limitToLastは最後から20件取得
app.get('/channels/:cname/messages', (req, res) => {
  let cname = req.params.cname;
  let messagesRef = admin.database().ref(`channels/${cname}/messages`).orderByChild('date').limitToLast(20);
  messagesRef.once('value', function(snapshot) {
    let items = new Array();
    snapshot.forEach(function(childSnapshot) {
      let message = childSnapshot.val();
      message.id = childSnapshot.key;
      items.push(message);
    });
    items.reverse();
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send({messages: items});
  });
});
