import React from "react"
import PropTypes from "prop-types"
class ApproveExtends extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      subordinates: [],
      show_subordinates: [],
      constraints: {
        statuses: null
      }
    };

    this.get_expends = this.get_expends.bind(this);
    this.toggle_subordinate = this.toggle_subordinate.bind(this);
    this.respond_to_application = this.respond_to_application.bind(this);
    this.toggle_status_inclusion = this.toggle_status_inclusion.bind(this);
    this.can_show_expend = this.can_show_expend.bind(this);

    this.STATUSES = [null,"Pending","Approved","Rejected"];

  }

  componentDidMount(){
    this.get_expends();
  }

  get_expends(){
    fetch("/api/lieuexpends", {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      if (json.success){
        this.setState({
          subordinates: json.subordinates
        });
        if (json.subordinates.length !== this.state.show_subordinates.length){
          let arr = Array(json.subordinates.length);
          let i;
          for (i = 0 ; i < json.subordinates.length ; i++){
            arr[i] = false;
          }
          this.setState({
            show_subordinates: arr
          })
        }
      }
    });
  }

  toggle_subordinate(index){
    let arr = this.state.show_subordinates;
    arr[index] = !arr[index];
    this.setState({
      show_subordinates: arr
    });
  }

  respond_to_application(subordinate_index, accrual_index, new_status){
    const expend = this.state.subordinates[subordinate_index].expends[accrual_index];
    fetch("/api/lieuexpend/approve", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      },
      body: JSON.stringify({
        id: expend.id,
        status: new_status
      })
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      if (json.success){
        this.get_expends();
      }
    });
  }

  toggle_status_inclusion(index){
    let statuses = this.state.constraints.statuses;
    if (statuses === null){
      statuses = [index];
      //this.calculate_which_to_show()
    } else if (statuses.includes(index)){
      statuses.splice(statuses.indexOf(index), 1);
    } else {
      statuses.push(index);
    }
    let constraints = this.state.constraints;
    constraints.statuses = statuses;
    this.setState({
      constraints: constraints
    });
  }

  can_show_expend(accrual, constraints){
    let r = true;
    if (constraints.statuses != null && constraints.statuses.includes(accrual.status)){
      r = false;
    }
    return r;
  }

  render () {
    console.log(this.state);
    return (
      <div>
        <h2>
          Subordinates
        </h2>
        <h4>
          Apply following constraints
        </h4>
        <table><tbody>
          <tr>
            <td>
              Statuses
            </td>
          </tr>
        </tbody></table>
        <div style={{backgroundColor: "#efefef", padding: '10px'}}>
          <table>
            <tbody>
              <tr>
                <td>
                  Show only:
                </td>
                {[null,"Pending","Approved","Rejected"].map((x,i) => x === null ? null : 
                    <td key={i}>
                      <button onClick={() => this.toggle_status_inclusion(i)} style={{backgroundColor: this.state.constraints.statuses === null || !this.state.constraints.statuses.includes(i) ? "blue" : "#fff", height: '14px', width: '14px', border: 'solid', borderWidth: '2px', borderRadius: '6px', margin: '3px'}} key={i}>
                      </button>
                      {this.STATUSES[i]}
                    </td>
                  )}
              </tr>
            </tbody>
          </table>
        </div>
        {this.state.subordinates.map(
          (subordinate, index) =>
          <div style={{padding: '20px', border: 'solid', borderColor: 'grey', borderWidth: '1px', borderRadius: '5px'}} key={index}>
            <div>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <button onClick={() => this.toggle_subordinate(index)} className="general-button">
                        {this.state.show_subordinates[index] ? "Collapse" : "Expand"}
                      </button>
                    </td>
                    <td>
                      <h3>{subordinate.name}</h3>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {this.state.show_subordinates[index] ? 
            <div>
              {subordinate.expends.map(
                (expend, index2) => this.can_show_expend(expend, this.state.constraints) ? 
                <div key={index2} style={{width: "400px", backgroundColor: "#efefef", padding: '20px', border: 'solid', borderColor: 'grey', borderWidth: '1px', borderRadius: '5px', margin: '10px'}}>
                  <h4>
                    {expend.status < 4 ? [null,"Pending","Approved","Rejected"][expend.status] : null} application for leave on {expend.start_at.slice(0,16)}
                  </h4>
                  <div>
                    {subordinate.name.split(' ')[0]} applied for {expend.duration} minutes starting at {mins2timestr(expend.start_minutes)}
                  </div>
                  <div>
                    {expend.status !== 2 ? <button onClick={() => this.respond_to_application(index, index2, 2)} className="general-button">
                      Approve
                    </button> : null}
                    {expend.status !== 3 ? <button onClick={() => this.respond_to_application(index, index2, 3)} className="general-button">
                      Reject
                    </button> : null}
                  </div>
                </div>
              : null)}
            </div> : null}
          </div>
        )}
      </div>
    );
  }
}

export default ApproveExtends

function mins2timestr(mins){
  return (mins/60<10 ? '0' : '') + String(Math.floor(mins / 60)) + ':' + (mins%60<10 ? '0' : '') + String(mins % 60);
}
