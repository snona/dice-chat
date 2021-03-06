import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import { messagesRef } from '../firebase';
import DiceBotAction from '../actions/DiceBotAction';

/**
 * チャットに関わる操作
 */
class ChatAction {

  /**
   * メッセージの自動読込み
   */
  static listenMessages(roomId) {
    this._initMessages();
    messagesRef.child(roomId).on('child_added', (snapshot, id) => this._addMessage(snapshot.key, snapshot.val()));
  }

  static unListenMessages(roomId) {
    messagesRef.child(roomId).off();
  }

  /**
   * ダイスボットの結果メッセージを構築
   * @param {Object} message ダイスボットに送信したメッセージ
   * @param {Object} response ダイスボットの結果
   * @return {Object} メッセージ形式のダイス結果
   */
  static _createResultMessage(message, response) {
    return {
      system: message.system,
      character: message.character,
      text: `${message.system} ${response.result}`,
      userName: message.userName,
    };
  }

  /**
   * メッセージを送信
   * @param {Object} message 送信メッセージ
   */
  static sendMessage(roomId, message) {
    DiceBotAction.getDiceRoll(message.system, message.text).then(response => {
      if (!response.ok) {
        // 正しく処理されていない場合、コマンドが正しくない(または含んでいない)
        // そのまま送信
        messagesRef.child(roomId).push(message);
      } else {
        if (response.secret) {
          // シークレットダイスの場合
          const secretMessage = {
            system: message.system,
            character: message.character,
            text: 'シークレットダイス',
            userName: message.userName,
          };
          messagesRef.child(roomId).push(secretMessage);
        }
        messagesRef.child(roomId).push(message);
        const resultMessage = this._createResultMessage(message, response)
        messagesRef.child(roomId).push(resultMessage);
      }
    });
  }

  static _initMessages() {
    AppDispatcher.dispatch({
      type: ActionTypes.Messages.INIT,
    });
  }

  /**
   * メッセージを Storeに追加
   * @param {string} key メッセージの Key
   * @param {Object} message 追加メッセージ
   */
  static _addMessage(key, message) {
    message.id = key;
    AppDispatcher.dispatch({
      type: ActionTypes.Messages.ADD,
      message,
    });
  }
}
export default ChatAction;
