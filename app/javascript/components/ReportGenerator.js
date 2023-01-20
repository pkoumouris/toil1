import React from "react"
import PropTypes from "prop-types"
class ReportGenerator extends React.Component {
  //https://jeromezng.com/how-to-deploy-a-rails-app-using-digital-ocean#install-postgres
  constructor(props){
    super(props);
    this.state = {
      constraints: {
        start_at: [0,2147483647],
        duration: [0,1440],
        user_ids: []
      }
    };

    this.build_constraints = this.build_constraints.bind(this);
    this.search = this.search.bind(this);

  }

  to_sql_date(unix){
    let date = new Date(unix * 1000);
    return String(date.getUTCFullYear()) + "-" + String(date.getUTCMonth() + 1) + "-" + String(date.getUTCDate());
  }

  build_constraints(){
    let str = "";
    str += ("start_at BETWEEN "+String(this.to_sql_date(this.state.constraints.start_at[0]))+" AND "+String(this.to_sql_date(this.state.constraints.start_at[1])));
    str += (" AND duration BETWEEN "+String(this.state.constraints.duration[0])+" AND "+String(this.state.constraints.duration[1]));
    str += (" AND user_id in ("+this.state.constraints.user_ids.join(',')+")");
    console.log(str);
    return str;
  }

  search(){
    ///api/accrual/search
    fetch('/api/accrual/search', {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      console.log(json);
    });
  }

  componentDidMount(){
    //allsubordinates
    fetch('/allsubordinates', {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      let constraints = this.state.constraints;
      let user_ids = json.subordinates.map((s,i) => s.id);
      user_ids.push(json.myself.id);
      constraints.user_ids = user_ids;
      this.setState({
        constraints: constraints
      });
    });
  }

  render () {
    return (
      <div style={{marginTop: '40px'}}>
        {this.state.constraints.user_ids.map((i,ii) => i)}
        <button onClick={this.build_constraints}>
          Log str
        </button>
        <button onClick={this.search}>
          Search
        </button>
      </div>
    );
  }
}

export default ReportGenerator
