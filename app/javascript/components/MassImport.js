import React from "react"
import PropTypes from "prop-types"
class MassImport extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      typed: "",
      employees: [],
      messages: [],
      typed_special_password: ""
    };

    this.parse = this.parse.bind(this);
    this.send = this.send.bind(this);

  }
  
  parse(){
    this.setState({
      employees: this.state.typed.split('\n').map((line, i1) => 
        ({
          name: line.split(',')[0],
          email: line.split(',')[1],
          role: line.split(',')[2],
          superior_email: line.split(',')[3],
          password: line.split(',')[4]
        })
      )
    })
  }

  send(){
    fetch("/massimport", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      },
      body: JSON.stringify({employees: this.state.employees, password: this.state.typed_special_password})
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      let messages = this.state.messages;
      messages.push({
        content: "Error encountered when attempting to import.",
        message_type: "error"
      });
      this.setState({
        messages: messages
      });
      throw new Error('Request fail');
    }).then(json => {
      let messages = this.state.messages;
      messages.push({
        content: String(this.state.employees.length)+" employees added successfully.",
        message_type: "success"
      });
      this.setState({
        messages: messages
      });
    });
  }

  render () {
    return (
      <div style={{marginTop: "60px"}}>
        <h2>
          Import users en masse
        </h2>
        {this.state.messages.map(
          (message, index) =>
          <div key={index} style={{backgroundColor: ["red","blue","green"][["danger","info","success"].indexOf(message.message_type)]}}>
            {message.content}
          </div>
        )}
        {this.state.employees.length > 0 ? <div>
          <div>
            Parsed:
          </div>
          <table><tbody>
            <tr>
              <td>
                <i>Name</i>
              </td>
              <td>
                <i>Email</i>
              </td>
              <td>
                <i>Role</i>
              </td>
              <td>
                <i>Superior email</i>
              </td>
              <td>
                <i>Password</i>
              </td>
            </tr>
            {this.state.employees.map(
              (employee, index) =>
              <tr key={index}>
                <td>
                  {employee.name}
                </td>
                <td>
                  {employee.email}
                </td>
                <td>
                  {employee.role}
                </td>
                <td>
                  {employee.superior_email}
                </td>
                <td>
                  {employee.password}
                </td>
              </tr>
            )}
          </tbody></table>
          <input onChange={(e) => this.setState({typed_special_password: e.target.value})} placeholder="Type special admin password to access" />
          <button onClick={this.send}>
            Send
          </button>
        </div> : null}
        <textarea onChange={(e) => this.setState({typed: e.target.value})} style={{width: "600px", height: "300px"}} />
        <button onClick={this.parse}>
          Parse
        </button>
      </div>
    );
  }
}

export default MassImport
