import React from "react"
import PropTypes from "prop-types"
class AccountCircle extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      expanded: false
    };
  }
  render () {
    return (
      <div>
        <div id="account-circle" onClick={() => this.setState({expanded: !this.state.expanded})}>
          <div>
            {this.props.name.split(' ')[0][0] + this.props.name.split(' ')[1][0]}<br />
          </div>
        </div>
        {this.state.expanded ? 
          <div id="account-circle-expanded">
            <div style={{textAlign: 'right'}}>
              <span onClick={() => this.setState({expanded: false})} style={{cursor: 'pointer'}}>
                <b>X</b>
              </span>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>
                    Name
                  </td>
                  <td>
                    {this.props.name}
                  </td>
                </tr>
                <tr>
                  <td>
                    Email
                  </td>
                  <td>
                    {this.props.email}
                  </td>
                </tr>
                <tr>
                  <td>
                    Role
                  </td>
                  <td>
                    {this.props.role}
                  </td>
                </tr>
                <tr>
                  <td>
                    Since
                  </td>
                  <td>
                    {this.props.created_at}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{padding: '20px', textAlign: 'center'}}>
              <button className="general-button" onClick={() => {location.href = "/me"}}>
                Details
              </button>
            </div>
            <div style={{textAlign: 'center'}}>
              <form action="/logout" acceptCharset="UTF-8" method="post">
                <input name="utf8" type="hidden" value="&#x2713" />
                <input type="hidden" name="authenticity_token" value={this.props.auth_token} />
                <input type="submit" value="Logout" className="general-button" />
              </form>
            </div>
          </div> : null}
      </div>
    );
  }
}

export default AccountCircle

/*
  Implement with
  react_component('AccountCircle', {name: current_user.name, email: current_user.email, role: current_user.role, created_at: current_user.created_at.rfc2822, auth_token: form_authenticity_token})
*/
