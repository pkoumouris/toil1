import React from "react"
import PropTypes from "prop-types"
class Misc extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      typed_bsb: "",
      bsb_results: null
    };

    this.on_input_bsb = this.on_input_bsb.bind(this);
    this.bsb_server = this.bsb_server.bind(this);

  }

  general_request(){
    fetch("http://api.beliefmedia.com/bsb/"+val+".json", {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      console.log("Request complete");
      console.log(json);
    });
  }

  bsb_server(bsb){
    let start = new Date();
    fetch("/misc/bsb?bsb="+String(bsb), {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      if (json.status == 200){
        console.log("json");
        console.log(json);
        this.setState({
          bsb_results: json.data
        });
        let end = new Date();
        console.log("Milliseconds = " + String(end - start));
      }
    });
  }

  on_input_bsb(e){
    const val = e.target.value.replaceAll('-','');
    if ("1234567890".includes(val.slice(-1))){
      this.setState({
        typed_bsb: val
      });
      if (val.length === 6){
        this.bsb_server(val);
      } else {
        this.setState({
          bsb_results: null
        });
      }
    }
  }

  render () {
    console.log(this.state);
    return (
      <div>
        <input onInput={this.on_input_bsb} value={this.state.typed_bsb.length > 3 ? this.state.typed_bsb.slice(0,3) + '-' + this.state.typed_bsb.slice(3,6) : this.state.typed_bsb} />
        {this.state.bsb_results === null ? (this.state.typed_bsb.length === 6 ? 
        <div>
          Sorry, no BSB could be found.
        </div> : null) : 
        <div>
          <table>
            <tbody>
              <tr>
                <td>
                  Bank
                </td>
                <td>
                  {this.state.bsb_results.instcode}
                </td>
              </tr>
            </tbody>
          </table>
        </div>}
      </div>
    );
  }
}

export default Misc
