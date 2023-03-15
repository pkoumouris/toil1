import React from "react"
import PropTypes from "prop-types"
class AccountCircle extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      expanded: false
    };

    this.handle_click = this.handle_click.bind(this);
    this.handle_open = this.handle_open.bind(this);
    this.handle_close = this.handle_close.bind(this);

  }

  componentDidMount(){
    //document.addEventListener('click',this.handle_click);
  }

  handle_open(){
    console.log("handle_open");
    this.setState({expanded: !this.state.expanded});
    setTimeout(() => {
      document.addEventListener('click',this.handle_click);
    },500);
  }

  handle_close(){
    console.log("handle_close");
    this.setState({expanded: false});
    document.removeEventListener('click',this.handle_click);
  }

  handle_click(e){
    console.log("handle_click");
    if (this.state.expanded){
      if (e.target.className !== "ace-in" && e.target.parentElement != undefined && e.target.parentElement.className !== "ace-in"){
        this.handle_close();
      }
    }
  }

  componentWillUnmount(){
    document.removeEventListener('click',this.handle_click);
  }

  render () {
    console.log(this.state);
    return (
      <div>
        <div id="account-circle" onClick={this.state.expanded ? this.handle_close : this.handle_open}>
          <div>
            {this.props.name.split(' ')[0][0] + this.props.name.split(' ')[1][0]}<br />
          </div>
        </div>
        {this.state.expanded ? 
          <div id="account-circle-expanded" className="ace-in">
            <div style={{textAlign: 'right'}} className="ace-in">
              <span onClick={this.handle_close} style={{cursor: 'pointer'}} className="ace-in">
                <b className="ace-in">X</b>
              </span>
            </div>
            <table className="ace-in">
              <tbody className="ace-in">
                <tr className="ace-in">
                  <td className="ace-in">
                    Name
                  </td>
                  <td className="ace-in">
                    {this.props.name}
                  </td>
                </tr>
                <tr className="ace-in">
                  <td className="ace-in">
                    Email
                  </td>
                  <td className="ace-in">
                    {this.props.email}
                  </td>
                </tr>
                <tr className="ace-in">
                  <td className="ace-in">
                    Role
                  </td>
                  <td className="ace-in">
                    {this.props.role}
                  </td>
                </tr>
                <tr className="ace-in">
                  <td className="ace-in">
                    Since
                  </td>
                  <td className="ace-in">
                    {this.props.created_at}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{padding: '20px', textAlign: 'center'}} className="ace-in">
              <button className="general-button" onClick={() => {location.href = "/me"}}>
                Details
              </button>
            </div>
            <div style={{textAlign: 'center'}} className="ace-in">
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
