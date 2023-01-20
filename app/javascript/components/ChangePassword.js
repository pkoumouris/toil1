import React from "react"
import PropTypes from "prop-types"
class ChangePassword extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      typed_old_password: "",
      typed_new_password: "",
      new_password_errors: [],
      errors: [],
      successes: [],
      user_status: Number(this.props.user_status)
    };

    this.on_type_new_password = this.on_type_new_password.bind(this);
    this.on_submit_new_password = this.on_submit_new_password.bind(this);

  }

  on_type_new_password(e){
    const val = e.target.value;
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    let errors = [];
    if (val.length > 0){
      if (strongRegex.test(val)){
        this.setState({
          typed_new_password: val,
          new_password_errors: []
        });
      } else {
        errors.push("Must be at least 1 lowercase alphabetical character, 1 uppercase alphabetical character, 1 numeric character, at least 1 special character, and must be at least 8 characters.");
        this.setState({
          new_password_errors: errors,
          typed_new_password: val
        });
      }
    } else {
      this.setState({
        new_password_errors: [],
        typed_new_password: ""
      })
    }
  }

  on_submit_new_password(){
    fetch("/changepassword", {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      },
      method: 'POST',
      body: JSON.stringify({
        password: this.state.typed_new_password,
        old_password: this.state.typed_old_password
      })
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      if (json.success){
        let successes = this.state.successes;
        successes.push("Password successfully changed. Redirecting you now...");
        setTimeout(function () {
          window.location.replace("/");
        },1500);
      } else {
        let errors = [];
        errors.push(json.errors);
      }
    });
  }

  render () {
    return (
      <div>
        <h3>
          Change password
        </h3>
        {this.state.new_password_errors.map(
          (error, index) =>
          <div key={index} style={{backgroundColor: "red", padding: "10px", margin: "5px", color: "#fff"}}>
            {error}
          </div>
        )}
        {this.state.successes.map(
          (success, index) =>
          <div key={index} style={{backgroundColor: "lightgreen", padding: "10px", margin: "5px"}}>
            {success}
          </div>
        )}
        {this.state.errors.map(
          (error, index) =>
          <div key={index} style={{backgroundColor: "red", padding: "10px", margin: "5px", color: "#fff"}}>
            {error}
          </div>
        )}
        <table>
          <tbody>
            {this.props.user_status >= 2 ? <tr>
              <td>
                Current password
              </td>
              <td>
                <input onInput={(e) => this.setState({typed_old_password: e.target.value})} value={this.state.typed_old_password} type="password" />
              </td>
            </tr> : null}
            <tr>
              <td>
                New password
              </td>
              <td>
                <input onInput={this.on_type_new_password} value={this.state.typed_new_password} type="password" />
              </td>
            </tr>
          </tbody>
        </table>

        <button onClick={this.on_submit_new_password} className="general-button">
          Change
        </button>
        
      </div>
    );
  }
}

export default ChangePassword
