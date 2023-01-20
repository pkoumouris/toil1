import React from "react"
import PropTypes from "prop-types"
class MassImport extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      typed: "",
      employees: []
    };

    this.parse = this.parse.bind(this);

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

  render () {
    return (
      <div style={{marginTop: "60px"}}>
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
