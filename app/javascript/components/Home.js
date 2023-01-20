import React from "react"
import PropTypes from "prop-types"
class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: null,
      loaded: false
    };

    this.get_user_details = this.get_user_details.bind(this);

  }

  componentDidMount(){
    this.get_user_details();
  }

  get_user_details(){
    fetch("/api/me", {
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
      <div style={{margin: "auto"}}>
        <table>
          <tbody>
            <tr>
              <td style={{verticalAlign: "top"}}>
                <div className="home-section">
                  <h2>
                    My details
                  </h2>
                  <table style={{fontSize: '13px'}}>
                    <tbody>
                      <tr>
                        <td style={{width: '130px'}}>
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
                          Leave accumulated
                        </td>
                        <td>
                          {this.state.user.available_leave / 60.0} hours ({this.state.user.available_leave} minutes)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    If you have any issues with any of the above, contact Parris Koumouris at parris.koumouris@acl.org.au.
                  </p>
                </div>
              </td>
              <td style={{verticalAlign: "top"}}>
                <div className="home-section">
                  <h2>
                    Manager
                  </h2>
                  {this.state.user.managers.map(
                    (manager, index) =>
                    <div key={index}>
                      {manager.name}, {manager.role}
                    </div>
                  )}
                  <h2>
                    Team Member
                  </h2>
                  {this.state.user.subordinates.map(
                    (subordinate, index) =>
                    <div key={index}>
                      <a href={"/user/"+subordinate.id}>{subordinate.name}, {subordinate.role}</a>
                    </div>
                  )}
                  {this.state.user.subordinates.length === 0 ?
                  <div>
                    You have no subordinates at this time.
                  </div> : null}
                </div>
                <div className="home-section">
                  <h2>
                    Quick links
                  </h2>
                  <a href="/accruals/new">
                    Register a new In Lieu time worked
                  </a><br />
                  <a href="/expends/new">
                    Request time off
                  </a><br />
                  <a href="/accruals/index">
                    See an index of your accruals
                  </a><br />
                  {this.state.user.subordinates.length > 0 ? 
                  <div>
                    <a href="/accruals/approve">
                      Approve accrual of TOIL request (managers only)
                    </a><br />
                    <a href="/expends/approve">
                      Approve leave request of TOIL (managers only)
                    </a>
                  </div> : null}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div> : <div>Loading...</div>
    );
  }
}

export default Home
