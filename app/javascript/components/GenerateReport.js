import React from "react"
import PropTypes from "prop-types"
class GenerateReport extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      subordinates: null,
      selected_subordinate_index: 0,
      selected_report_type_index: 0
    };

    this.get_subordinates = this.get_subordinates.bind(this);
    this.handle_click_subordinate = this.handle_click_subordinate.bind(this);
    this.handle_click_report_type = this.handle_click_report_type.bind(this);

  }

  componentDidMount(){
    this.get_subordinates();
  }

  get_subordinates(){
    fetch("/api/employees/list", {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      this.setState({
        subordinates: json.subordinates
      });
    });
  }

  handle_click_subordinate(e){
    this.setState({
      selected_subordinate_index: Number(e.target.value)
    });
  }

  handle_click_report_type(e){
    this.setState({
      selected_report_type_index: Number(e.target.value)
    });
  }
  
  render () {
    console.log(this.state);
    return (this.state.subordinates === null ? null : 
      <div>
        <div>
          <select onClick={this.handle_click_subordinate}>
            {this.state.subordinates.map(
              (subordinate, index) =>
              <option value={index} key={index}>
                {subordinate.name}
              </option>
            )}
          </select>
        </div>

        <div>
          <select onClick={this.handle_click_report_type}>
            <option value={0}>
              List of accruals for this person
            </option>
            <option value={1}>
              List of expenditures for this person
            </option>
          </select>
        </div>
      </div>
    );
  }
}

export default GenerateReport
