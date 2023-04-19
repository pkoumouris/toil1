import React from "react"
import PropTypes from "prop-types"
class GeneralFilter extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loaded: false,
      data: null,
      filter: {
        name_id: null
      }
    };

    this.change_filter = this.change_filter.bind(this);

  }

  componentDidMount(){
    fetch("/api/filterdata", {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      this.setState({
        data: json.data,
        loaded: true
      });
    });
  }

  change_filter(obj){
    console.log('obj');
    console.log(obj);
    let filter = this.state.filter;
    for (const [key, value] of Object.entries(obj)){
      filter[key] = value;
    }
    this.setState({
      filter: filter
    });
  }

  render () {
    console.log(this.state);
    return (this.state.loaded ? 
      <div>
        <h2>
          Generate Filter
        </h2>
        <table><tbody>
          <tr>
            <td>
              Name
            </td>
            <td>
              <select id="user-select" onChange={(e) => {console.log(document.getElementById('user-select').value)}}>
                {this.state.data.users.map(
                  (user, index) =>
                  <option id={"user-selection-id-"+user.id} key={index}>
                    {user.name}
                  </option>
                )}
              </select>
            </td>
          </tr>
        </tbody></table>
      </div>
    : null);
  }
}

export default GeneralFilter
