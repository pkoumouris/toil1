import React from "react"
import PropTypes from "prop-types"
class Employee extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: null,
      loaded: false
    };

    this.load_user = this.load_user.bind(this);

  }

  componentDidMount(){
    this.load_user();
  }

  load_user(){
    fetch("/api/user/"+String(this.props.id), {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      this.setState({
        user: json.user,
        loaded: true
      });
    });
  }
  
  render () {
    return ( this.state.loaded ? 
      <div>
        <div>
          <h2>
            General information
          </h2>
          <table>
            <tbody>
              <tr>
                <td>
                  Name:
                </td>
                <td>
                  {this.state.user.name}
                </td>
              </tr>
              <tr>
                <td>
                  Email:
                </td>
                <td>
                  {this.state.user.email}
                </td>
              </tr>
              <tr>
                <td>
                  Role
                </td>
                <td>
                  {this.state.user.role}
                </td>
              </tr>
              <tr>
                <td>
                  Available Leave
                </td>
                <td>
                  {this.state.user.available_leave} minutes
                </td>
              </tr>
            </tbody>
          </table>
          <h4>
            Managers
          </h4>
          {this.state.user.managers.map(
            (manager, index) =>
            <div key={index}>
              {manager.name}, {manager.role}, {manager.email}
            </div>
          )}
          <h4>
            Team members
          </h4>
          {this.state.user.subordinates.map(
            (subordinate, index) =>
            <div>
              {subordinate.name}, {subordinate.role}, {subordinate.email}
            </div>
          )}
        </div>
      </div>
    : <div>Loading...</div>);
  }
}

export default Employee
