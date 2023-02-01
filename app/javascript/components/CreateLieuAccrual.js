import React from "react"
import PropTypes from "prop-types"

class CreateLieuAccrual extends React.Component {
  constructor(props){
    super(props);
    const date = new Date();
    const month_index = (new Date()).getMonth();
    const month_lengths = this.month_lengths(date.getFullYear())
    this.state = {
      month_index: month_index,
      year: (new Date()).getFullYear(),
      day: date.getDate(),
      day_of_week: date.getDay(),
      month_names: ["January","February","March","April","May","June","July","August","September","October","November","December"],
      month_start_day: (new Date(date.getFullYear(), date.getMonth(), 0)).getDay()-1,//date.getDay(date.getFullYear(), date.getMonth(), 0),
      day_names: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      month_lengths: month_lengths,
      day_engagements: Array(month_lengths[month_index]),
      selected_day: null,
      show_new_request: false,
      new_request_error: null,
      typed_description: ""
    };

    this.assign_month = this.assign_month.bind(this);
    this.month_lengths = this.month_lengths.bind(this);
    this.day_html = this.day_html.bind(this);
    this.select_day = this.select_day.bind(this);
    this.move_month = this.move_month.bind(this);
    this.get_engagements_month = this.get_engagements_month.bind(this);
    this.make_accrual_request = this.make_accrual_request.bind(this);
    this.accrual_request_all_day = this.accrual_request_all_day.bind(this);
    this.delete_accrual = this.delete_accrual.bind(this);
    this.is_weekend = this.is_weekend.bind(this);
    this.on_type_description = this.on_type_description.bind(this);

    this.DESCRIPTION_LIMIT = 100;
    this.DAY_WIDTH = '40px';
    this.DAY_HEIGHT = '40px';

  }

  componentDidMount(){
    const date = new Date();
    this.assign_month(date.getFullYear(), date.getMonth(), date.getDate());
    this.get_engagements_month(date.getFullYear(), date.getMonth() + 1);
  }

  assign_month(year, month, day){
    const date = new Date(year, month, day);
    const month_index = date.getMonth();// - 1;
    const month_lengths = this.month_lengths(date.getFullYear());
    let month_start_day = (new Date(year, date.getMonth(), 1)).getDay() - 1;
    month_start_day += 7 * (month_start_day < 0);
    this.setState({
      month_index: month_index,
      year: date.getFullYear(),
      day: date.getDate(),
      day_of_week: date.getDay(),
      month_start_day: month_start_day,//date.getDay(year, month, 0)
      month_lengths: month_lengths,
      selected_day: null,
      day_engagements: Array(month_lengths[month_index]).fill([])
    });
  }

  month_lengths(year){
    return [31,28+(year%4===0),31,30,31,30,31,31,30,31,30,31];
  }

  select_day(day_index, row, column){
    let x = {
      day_number: day_index + 1,
      day_index: day_index,
      engagements: this.state.day_engagements[day_index],
      day_of_week: this.state.day_names[column],
      row: row,
      column: column,
      month_index: this.state.month_index,
      month_name: this.state.month_names[this.state.month_index],
      year: this.state.year
    };
    this.setState({
      selected_day: x
    });
  }

  day_html(r, c){
    const day = r*7 + c - this.state.month_start_day + 1;
    const day_style = {
      width: this.DAY_WIDTH,
      height: this.DAY_HEIGHT,
      //backgroundColor: c >= 5 ? '#c9c9c9' : (this.state.day_engagements != undefined && this.state.day_engagements[day-1] != undefined && this.state.day_engagements[day-1].length > 0 ? '#ccf1ff' : '#efefef'),
      backgroundColor: (this.state.day_engagements != undefined && this.state.day_engagements[day-1] != undefined && this.state.day_engagements[day-1].length > 0 ? "#ccf1ff" : (c >= 5 ? "#c9c9c9" : "#efefef")),
      cursor: 'pointer'
    };
    if (day <= 0 || day > this.state.month_lengths[this.state.month_index]){
      return (
        <div style={day_style} onClick={() => this.move_month(c < 7 ? -1 : 1)}>

        </div>
      );
    } else {
      return (
        <div style={day_style} onClick={() => this.select_day(day-1, r, c)}>
          {day}
        </div>
      );
    }
  }

  move_month(delta){
    if (this.state.month_index + delta > 11){
      this.assign_month(this.state.year + 1, 0, 1);
      this.get_engagements_month(this.state.year + 1, 1);
    } else if (this.state.month_index + delta < 0){
      this.assign_month(this.state.year - 1, 11, 1);
      this.get_engagements_month(this.state.year - 1, 12);
    } else {
      this.assign_month(this.state.year, this.state.month_index + delta + 1, 0);
      this.get_engagements_month(this.state.year, this.state.month_index + delta + 1);
    }
  }

  get_engagements_month(year, month){
    // month is 1-indexed here
    fetch("/api/monthengagements?year="+String(year)+"&month="+String(month), {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      let engagements = Array(this.state.month_lengths[month]);
      let i;
      for (i = 0 ; i < engagements.length ; i++){
        engagements[i] = [];
      }
      for (i = 0 ; i < json.results.length ; i++){
        engagements[json.results[i].day_of_month-1].push({
          id: json.results[i].id,
          status: json.results[i].status,
          duration: json.results[i].duration,
          start_minutes: json.results[i].start_minutes
        });
      }
      this.setState({
        day_engagements: engagements,
        selected_day: null
      })
    });
  }

  // additional method
  make_accrual_request(){
    const start_time = Number(document.getElementById('new-toil-start').value);
    const end_time = Number(document.getElementById('new-toil-end').value);
    if (start_time >= end_time){
      this.setState({
        new_request_error: "End time must be after start time."
      });
    } else {
      this.setState({
        new_request_error: null
      });
      const server_data = {
        status: 1,
        start_at: new Date(this.state.year, this.state.month_index, this.state.selected_day.day_number).toString().slice(4,23),
        start_minutes: start_time,
        duration: end_time - start_time,
        description: this.state.typed_description
      };
      const local_data = {
        status: 1,
        start_minutes: start_time,
        duration: (end_time - start_time)
      }
      /*console.log("Make accrual request");
      console.log(server_data);
      console.log(local_data);*/
      fetch("/api/lieuaacrual/create", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-csrf-token': this.props.auth_token
        },
        body: JSON.stringify({
          lieuaccrual: server_data
        })
      }).then( (response) => {
        if (response.ok){
          return response.json();
        }
        throw new Error('Request fail');
      }).then(json => {
        if (json.created){
          let engagements = this.state.day_engagements;
          local_data.id = json.id;
          engagements[this.state.selected_day.day_index].push(local_data);
          this.setState({
            day_engagements: engagements
          });
        }
      })
    }
  }

  // additional method
  accrual_request_all_day(){
    document.getElementById('new-toil-start').value = 540;
    document.getElementById('new-toil-end').value = 1020;
  }

  // additional method
  delete_accrual(engagement){
    fetch("/api/accrual/delete?id="+String(engagement.id), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      }
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      console.log("JSON");
      console.log(json);
      if (json.success){
        this.get_engagements_month(this.state.year, this.state.month_index + 1);
      }
    });
  }

  is_weekend(){
    return ["Saturday","Sunday"].includes(this.state.selected_day.day_of_week);
  }

  on_type_description(e){
    if (e.target.value.length <= this.DESCRIPTION_LIMIT){
      this.setState({
        typed_description: e.target.value
      });
    }
  }

  render () {
    console.log(this.state);
    return (
      <div>

        <table><tbody>
          <tr>
            <td style={{paddingLeft: "20px"}}>

        <div>
          <table style={{margin: "auto"}}><tbody>
            <tr>
              <td>
                <button onClick={() => this.move_month(-1)}>
                  Prev
                </button>
              </td>
              <td>
                <h3>
                  {this.state.month_names[this.state.month_index]} {this.state.year}
                </h3>
              </td>
              <td>
                <button onClick={() => this.move_month(1)}>
                  Next
                </button>
              </td>
            </tr>
          </tbody></table>
        </div>
        <table>
          <tbody>
            <tr>
              {this.state.day_names.map((day, index) => 
              <td key={index}>
                <div style={{width: this.DAY_WIDTH, height: this.DAY_HEIGHT}}>
                  {day[0]}
                </div>
              </td>)}
            </tr>
            {Array.from(Array(6).keys()).map(
              (r, i) =>
              <tr key={i}>
                {Array.from(Array(7).keys()).map(
                  (c, j) =>
                  <td key={j}>
                    <div style={{width: this.DAY_WIDTH, height: this.DAY_HEIGHT, backgroundColor: "#efefef"}}>
                      {this.day_html(r, c)}
                    </div>
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>

            </td>
            <td>

              <div style={{padding: "20px", backgroundColor: "#efefef", width: "500px", marginLeft: "40px"}}>
        {this.state.selected_day === null ? 
        <div>
          Click on a day
        </div> :
        <div>
          <h3>
            {this.state.selected_day.day_of_week} {this.state.selected_day.day_number} {this.state.selected_day.month_name} {this.state.year}
          </h3>
          {this.state.selected_day.engagements.length === 0 ?
          <div>
            You have no applications for TOIL made on this day.
          </div> : 
          <div>
            Here are your applications for TOIL for this day:
          </div>}
          {this.state.selected_day.engagements.map(
            (engagement, index) =>
            <div key={index} style={{border: 'solid', borderWidth: '1px', margin: '10px', fontSize: '13px', padding: '5px', borderRadius: '5px', backgroundColor: "#fff"}}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      Status:
                    </td>
                    <td>
                      {['','Pending approval','Approved','Rejected'][engagement.status]}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Time start:
                    </td>
                    <td>
                      {mins2timestr(engagement.start_minutes)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Time end:
                    </td>
                    <td>
                      {mins2timestr(engagement.start_minutes + engagement.duration)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Duration:
                    </td>
                    <td>
                      {engagement.duration / 60} hours
                    </td>
                  </tr>
                </tbody>
              </table>
              <button onClick={() => this.delete_accrual(engagement)} className="general-button">
                Delete
              </button>
            </div>
          )}

          {this.state.show_new_request ? 
            <div>
              <h4>
                Create new request for {this.state.selected_day.day_number} {this.state.selected_day.month_name}
              </h4>
              {this.state.new_request_error === null ? null : 
              <div style={{backgroundColor: "red", color: "white", padding: '5px', fontSize: '12px'}}>
                {this.state.new_request_error}
              </div>}
              <table>
                <tbody>
                  <tr>
                    <td>
                      Start time
                    </td>
                    <td>
                      <select id="new-toil-start">
                        {(Array.from(Array(96).keys())).map((v,i) => 
                          <option value={i*15} key={i}>
                            {mins2timestr(i*15)}
                          </option>
                        )}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      End time
                    </td>
                    <td>
                      <select id="new-toil-end">
                        {(Array.from(Array(96).keys())).map((v,i) => 
                          <option value={i*15} key={i}>
                            {mins2timestr(i*15)}
                          </option>
                        )}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <textarea onChange={this.on_type_description} value={this.state.typed_description} style={{margin: '5px', padding: '5px'}} placeholder="Reason" /><br />
              <div>
                {this.DESCRIPTION_LIMIT - this.state.typed_description.length}
              </div>
              {/*<button onClick={this.accrual_request_all_day} className="general-button">
                Make all day
              </button>*/}
              <button onClick={this.make_accrual_request} className="general-button">
                Submit
              </button>
            </div> : 
            <button onClick={() => this.setState({show_new_request: true, new_request_error: null})} className="general-button">
              Make new request
            </button>}

          <button onClick={() => this.setState({selected_day: null})} className="general-button">
            Close
          </button>
        </div>}

              </div>
            </td>
          </tr>
        </tbody></table>
      </div>
    );
  }
}

export default CreateLieuAccrual

function mins2timestr(mins){
  return (mins/60<10 ? '0' : '') + String(Math.floor(mins / 60)) + ':' + (mins%60<10 ? '0' : '') + String(mins % 60);
}
