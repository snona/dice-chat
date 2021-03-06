import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

/**
 * ルーム一覧表示部品
 */
class RoomLogin extends Component {
  componentWillMount() {
    this.setState({
      password: '',
      open: false,
      errorText: '',
    });
  }

  _loginRoom = () => {
    const { loginRoom } = this.props;
    loginRoom();
  };

  _closePasswordDialog = () => {
    this.setState({ open: false });
  };

  _checkPassword = (password) => {
    const { checkRoomPassword } = this.props;
    return Promise.resolve(checkRoomPassword(password).then(result => {
      console.log(result);
      if (!result) {
        this.setState({ errorText: 'Password wrong.' });
      }
      return result;
    }));
  };

  _checkAndLogin = () => {
    const { password } = this.state;
    this._checkPassword(password).then(result => {
      if(result) {
        this._closePasswordDialog(); 
        this._loginRoom();
      }
    });
  };

  _inputPassword = (e, value) => {
    this.setState({ password: value });
  };

  _enterKey = (event) => {
    if (event.charCode === 13) {
      this._checkAndLogin();
    }
  };

  _createPasswordDialog(room) {
    const { open, password, errorText } = this.state;
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this._closePasswordDialog}
      />,
      <FlatButton
        label="OK"
        primary={true}
        onTouchTap={this._checkAndLogin}
      />,
    ];
    const title = room !== undefined ? room.name : '';
    return (
      <Dialog
        title={title}
        actions={actions}
        modal={false}
        contentStyle={{ width: 500 }}
        open={open}
        onRequestClose={this._closePasswordDialog}
      >
        <TextField
          floatingLabelText="Password"
          style={{ width: 150 }}
          type="password"
          value={password}
          onChange={this._inputPassword}
          onKeyPress={this._enterKey}
          errorText={errorText}
        />
      </Dialog>
    );
  }

  _openPasswordDialog = () => {
    this.setState({ open: true, password: '', errorText: '' });
  };

  _login = () => {
    const { room } = this.props;
    room.authentication ? this._openPasswordDialog() : this._loginRoom();
  };

  render() {
    const { room } = this.props;
    const passwordDialog = this._createPasswordDialog(room);
    return (
      <span>
        <RaisedButton
          label="Login"
          disabled={room === undefined}
          onTouchTap={this._login}
          style={{ marginBottom: 10 }}
        />
        {passwordDialog}
      </span>
    );
  }
}

RoomLogin.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    authentication: PropTypes.string,
  }),
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  loginRoom: PropTypes.func.isRequired,
  checkRoomPassword: PropTypes.func.isRequired,
};

export default RoomLogin;