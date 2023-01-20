import React from "react"
import PropTypes from "prop-types"
class ApproveAccruals extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      subordinates: [],
      show_subordinates: [],
      showing: null,
      constraints: {
        statuses: null
      }
    };

    this.get_accruals = this.get_accruals.bind(this);
    this.toggle_subordinate = this.toggle_subordinate.bind(this);
    this.respond_to_application = this.respond_to_application.bind(this);
    this.calculate_which_to_show = this.calculate_which_to_show.bind(this);
    this.can_show_accrual = this.can_show_accrual.bind(this);
    this.toggle_status_inclusion = this.toggle_status_inclusion.bind(this);

    this.STATUSES = [null,"Pending","Approved","Rejected"];

  }

  componentDidMount(){
    this.get_accruals();
  }

  get_accruals(){
    fetch("/api/lieuaccruals", {
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

  calculate_which_to_show(subordinate, constraints){ // as per this.state.subordinate
    let indices = Array(subordinate.accruals.length).fill(0).map((f,i) => i);
    let i;
    if (constraints.statuses != undefined){
      for (i = 0 ; i < subordinate.accruals.length ; i++){
        if (!constraints.statuses.includes(subordinate.accruals[i].status)){
          indices.splice(indices.indexOf(i), 1);
        }
      }
    } // more after here
    this.setState({
      showing: indices
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
    console.log(subordinate_index);
    console.log(this.state);
    const accrual = this.state.subordinates[subordinate_index].accruals[accrual_index];
    fetch("/api/lieuaccrual/approve", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      },
      body: JSON.stringify({
        id: accrual.id,
        status: new_status
      })
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      if (json.success){
        this.get_accruals();
      }
    });
  }

  /*add_index_to_showing(i){
    let showing = this.state.showing;
  }*/

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

  can_show_accrual(accrual, constraints){
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
        <div style={{backgroundColor: "#efefef", margin: '10px', padding: '10px'}}>
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
          <table>
            <tbody>
              <tr>
                <td>
                  Show only:
                </td>
                {[null,"Pending","Approved","Rejected"].map((x,i) => x === null ? null : 
                  <td key={i} style={{width: '100px'}}>
                    <button onClick={() => this.toggle_status_inclusion(i)} style={{backgroundColor: this.state.constraints.statuses === null || !this.state.constraints.statuses.includes(i) ? "blue" : "#fff", height:'16px', width: '16px', border: 'solid', borderWidth: '2px', borderColor: "#c9c9c9", borderRadius: '3px'}}>
                    </button>
                    <span>
                      {this.STATUSES[i]}
                    </span>
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
                      <h3><a href={"/user/"+subordinate.id}>{subordinate.name}</a></h3>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {this.state.show_subordinates[index] ? 
            <div>
              {subordinate.accruals.map(
                (accrual, index2) => (this.can_show_accrual(accrual, this.state.constraints) ? 
                <div key={index2} style={{width: "400px", borderRadius: "6px", padding: "10px", border: "10px", backgroundColor: "#efefef", margin: "10px"}}>
                  <h4>
                    {accrual.status < 4 ? [null,"Pending","Approved","Rejected"][accrual.status] : null} application for {accrual.date_accrued.slice(0,16)}
                  </h4>
                  <div>
                    {subordinate.name.split(' ')[0]} accrued {accrual.duration} minutes on this day.<br />
                    Reason given: {accrual.description}
                  </div>
                  <div>
                    Status: {[null,"Pending","Approved","Rejected"][accrual.status]}
                  </div>
                  <div>
                    {accrual.status !== 2 ? <button onClick={() => this.respond_to_application(index, index2, 2)} className="general-button">
                      Approve
                    </button> : null}
                    {accrual.status !== 3 ? <button onClick={() => this.respond_to_application(index, index2, 3)} className="general-button">
                      Reject
                    </button> : null}
                  </div>
                </div> : null)
              )}
            </div> : null}
          </div>
        )}
      </div>
    );
  }
}

export default ApproveAccruals
