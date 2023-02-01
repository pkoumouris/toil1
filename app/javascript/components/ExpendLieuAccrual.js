import React from "react"
import PropTypes from "prop-types"
class ExpendLieuAccrual extends React.Component {
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
      today_day: null,
      today_month_index: null,
      today_year: null,
      general_message: "",
      start_time: 540,
      end_time: 570,
      selection_errors: [],
      expenditure: {
        show: false,
        expends: []
      },
      errors: []
    };

    this.assign_month = this.assign_month.bind(this);
    this.month_lengths = this.month_lengths.bind(this);
    this.day_html = this.day_html.bind(this);
    this.select_day = this.select_day.bind(this);
    this.move_month = this.move_month.bind(this);
    this.get_engagements_month = this.get_engagements_month.bind(this);
    this.get_available_leave_day = this.get_available_leave_day.bind(this);
    this.in_the_future = this.in_the_future.bind(this);
    this.expend_leave = this.expend_leave.bind(this);
    //this.make_expend_request = this.make_expend_request.bind(this);
    //this.expend_request_all_day = this.expend_request_all_day.bind(this);
    this.change_start_time = this.change_start_time.bind(this);
    this.change_end_time = this.change_end_time.bind(this);
    this.calculate_expends = this.calculate_expends.bind(this);
    this.send_expends = this.send_expends.bind(this);
    this.is_weekend = this.is_weekend.bind(this);
    this.perform_checks = this.perform_checks.bind(this);
    this.delete_expend = this.delete_expend.bind(this);

  }

  componentDidMount(){
    const date = new Date();
    this.assign_month(date.getFullYear(), date.getMonth(), date.getDate());
    this.get_engagements_month(date.getFullYear(), date.getMonth() + 1);
    // Work out what today is
    const now = new Date(Date.now());
    this.setState({
      today_day: now.getDate(),
      today_month_index: now.getMonth(),
      today_year: now.getFullYear()
    });
  }

  assign_month(year, month, day){
    const date = new Date(year, month, day);
    const month_index = date.getMonth();
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

  in_the_future(day_index){
    // <0 is in the past
    // ==0 is today
    // >0 is in the future
    console.log("Future test (day index "+String(day_index) + ")");
    console.log((this.state.year*10000+this.state.month_index*100+(day_index+1)) - (this.state.today_year*10000+this.state.today_month_index*100+this.state.today_day))
    return (this.state.year*10000+this.state.month_index*100+(day_index+1)) - (this.state.today_year*10000+this.state.today_month_index*100+this.state.today_day);
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
      year: this.state.year,
      available_leave: []
    };
    this.setState({
      selected_day: x
    });
    if (this.in_the_future(day_index)){
      this.get_available_leave_day(this.state.year, this.state.month_index + 1, day_index + 1)
    } else {
      console.log("In the past");
    }
  }

  day_html(r, c){
    const day = r*7 + c - this.state.month_start_day + 1;
    let backgroundColor = null;
    // first test is_today
    // second test engagements
    // then test weekends
    if (this.state.month_index === this.state.today_month_index && day === this.state.today_day && this.state.year === this.state.today_year){
      backgroundColor = "yellow";
    } else if (this.state.day_engagements != undefined && this.state.day_engagements[day-1] != undefined && this.state.day_engagements[day-1].length > 0){
      backgroundColor = "#ccf1ff";
    } else if (c >= 5){
      backgroundColor = "#c9c9c9";
    } else {
      backgroundColor = "#efefef";
    }
    const day_style = {
      width: '30px',
      height: '30px',
      backgroundColor: backgroundColor,
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
    fetch("/api/monthexpends?year="+String(year)+"&month="+String(month), {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      // Commented because not sure if we really need this?
      /*let engagements = Array(this.state.month_lengths[month]);
      let i;
      for (i = 0 ; i < engagements.length ; i++){
        engagements[i] = [];
      }
      for (i = 0 ; i < json.results.length ; i++){
        engagements[json.results[i].day_of_month-1].push({
          status: json.results[i].status,
          duration: json.results[i].duration,
          start_minutes: json.results[i].start_minutes
        });
      }
      this.setState({
        day_engagements: engagements
      });*/
    });
  }

  get_available_leave_day(year, month, day){
    console.log("Year: "+String(year)+", month: "+String(month)+", day: "+String(day));
    fetch("/api/expends/dayquery?year="+String(year)+"&month="+String(month)+"&day="+String(day), {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      if (json.success){
        console.log("JSON");
        console.log(json);
        let day = this.state.selected_day;
        let available_leave = [];
        let i;
        for (i = 0 ; i < json.lieuaccruals.length ; i++){
          if (json.lieuaccruals[i].duration > json.lieuaccruals[i].leave_booked){
            available_leave.push(json.lieuaccruals[i]);
          }
        }
        day.available_leave = available_leave;
        day.available_leave.sort(function(a,b){
          return a.date_accrued - b.date_accrued;
        });
        day.leave_available = json.available_leave;
        day.engagements = json.lieuexpends;
        this.setState({
          selected_day: day
        });
        /*let accrual = 0;
        let expend = 0;
        let i;
        for (i = 0 ; i < json.lieuaccruals.length ; i++){
          accrual += json.lieuaccruals[i].duration;
        }
        for (i = 0 ; i < json.lieuexpends.length ; i++){
          expend += json.lieuexpends[i].duration;
        }
        day.available_leave = accrual - expend;
        this.setState({
          selected_day: day
        });*/
      }
    });
  }

  // expend new method
  expend_leave(leave){
    const data = {
      accrualID: leave.id,
      year: this.state.selected_day.year,
      month: this.state.selected_day.month_index + 1,
      day: this.state.selected_day.day_number,
      duration: leave.duration - leave.leave_booked,
      minutes: Number(document.getElementById('new-expend-start').value)
    };
    console.log("data");
    console.log(data);
    console.log(leave);
    fetch("/api/expends/create", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      },
      body: JSON.stringify(data)
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      let day = this.state.selected_day;
      let available_leave = [];
      let i;
      for (i = 0 ; i < day.available_leave.length ; i++){
        if (day.available_leave[i].id !== leave.id){
          available_leave.push(day.available_leave[i]);
        }
      }
      day.available_leave = available_leave;
      this.setState({
        selected_day: day,
        general_message: "Leave expenditure application was successful"
      });
    });
  }

  // additional method
  make_expend_request(){
    const start_time = Number(document.getElementById('new-toil-start').value);
    const end_time = Number(document.getElementById('new-toil-end').value);
    if (start_time > end_time){
      this.setState({
        new_request_error: "Start time cannot be after end time."
      });
    } else {
      this.setState({
        new_request_error: null
      })
      const server_data = {
        status: 1,
        start_at: new Date(this.state.year, this.state.month_index, this.state.selected_day.day_number).toString().slice(4,23),
        start_minutes: start_time,
        duration: end_time - start_time
      };
      const local_data = {
        status: 1,
        start_minutes: start_time,
        duration: (end_time - start_time)
      }
      fetch("/api/expends/create", {
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
        /*let engagements = this.state.day_engagements;
        engagements[this.state.selected_day.day_index].push(local_data);
        this.setState({
          day_engagements: engagements
        });*/
        //window.href = "/expends/index";
        this.setState({
          general_message: "In lieu expenditure approved!"
        });
      });
    }
  }

  // additional method
  expend_request_all_day(){
    document.getElementById('new-toil-start').value = 540;
    document.getElementById('new-toil-end').value = 1020;
  }

  change_start_time(e){
    const start_time = Number(e.target.value);
    let errors = [];
    if (start_time >= this.state.end_time){
      errors.push("Start time must be before end time.");
    } else if (this.state.end_time - start_time > this.state.selected_day.leave_available){
      errors.push("You only have "+String(this.state.selected_day.leave_available/60)+" hours of leave available. You are requesting "+String((this.state.end_time - start_time) / 60)+" hours.")
    }
    this.setState({
      start_time: start_time,
      errors: errors
    });
  }

  /*change_end_time(e){
    const end_time = Number(e.target.value);
    let errors = [];
    if (end_time >= this.state.start_time){
      errors.push("Start time must be before end time.");
    } else if (end_time - this.state.start_time > this.state.selected_day.leave_available){
      errors.push("You only have "+String(this.state.selected_day.leave_available/60)+" hours of leave available. You are requesting "+String((end_time - start_time) / 60)+" hours.")
    }
    this.setState({
      end_time: end_time,
      errors: errors
    });
  }*/

  change_end_time(e){
    const end_time = Number(e.target.value);
    let errors = [];
    if (this.state.start_time >= end_time){
      errors.push("Start time must be before end time");
    } else if (end_time - this.state.start_time > this.state.selected_day.leave_available){
      errors.push("You only have "+String(this.state.selected_day.leave_available/60)+" hours of leave available. You are requesting "+String((end_time - this.state.start_time) / 60)+ " hours.");
    }
    this.setState({
      end_time: end_time,
      errors: errors
    });
  }

  perform_checks(){
    let errors = [];
    if (this.state.start_time >= this.state.end_time){
      errors.push("Start time must be before end time.");
    }
    if (this.state.selected_day.leave_available < this.state.end_time - this.state.start_time){
      errors.push("You do not have sufficient leave available.");
    }
    this.setState({
      errors: errors
    });
    console.log(errors);
    return errors.length === 0;
  }

  calculate_expends(){
    let sum = 0;
    const minutes = this.state.end_time - this.state.start_time;
    let list = [];
    let i = 0;
    while (sum < minutes){
      list.push({
        id: this.state.selected_day.available_leave[i].id,
        minutes: Math.min(minutes - sum, this.state.selected_day.available_leave[i].duration)
      });
      sum += this.state.selected_day.available_leave[i].duration;
      i++;
    }
    console.log(list);
    return list;
  }

  send_expends(list){
    const data = {
      lieuaccrual_id_list: list.map((l,i) => l.id).join(','),
      minutes: Number(this.state.end_time) - Number(this.state.start_time),
      start_minutes: Number(this.state.start_time),
      day: this.state.selected_day.day_number,
      month: this.state.month_index + 1,
      year: this.state.year
    };
    console.log(data);
    if (true){
    fetch("/api/executeexpends", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      },
      body: JSON.stringify(data)
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      console.log("Lieuexpends return API");
      console.log(json);
      //this.get_engagements_month(this.state.year, this.state.month_index + 1);
      this.get_available_leave_day(this.state.year, this.state.month_index + 1, this.state.selected_day.day_number);
    });
  }
  }

  delete_expend(id){
    console.log("id = "+String(id));
    fetch("/api/expends/destroy", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': this.props.auth_token
      },
      body: JSON.stringify({id: id})
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      if (json.success){
        let i;
        let engagements = [];
        for (i = 0 ; i < this.state.selected_day.engagements.length ; i++){
          if (this.state.selected_day.engagements[i].id !== id){
            available_leave.push(this.state.selected_day.engagements[i]);
          }
        }
        let selected_day = this.state.selected_day;
        selected_day.engagements = engagements;
        console.log("available_leave");
        console.log(engagements);
        this.setState({
          selected_day: selected_day
        });
      } else {
        this.setState({
          errors: ['Could not delete. Contact administrator.']
        });
      }
    });
  }

  is_weekend(){
    return ["Saturday","Sunday"].includes(this.state.selected_day.day_of_week);
  }

  render () {
    console.log("State");
    console.log(this.state);
    return (
      <div>
        {this.state.general_message.length > 0 ? 
        this.state.general_message : null}

        <table><tbody>
          <tr>
            <td>

        <div>
          <table><tbody>
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
                <div style={{width: '30px', height: '30px'}}>
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
                    <div style={{width: '30px', height: '30px', backgroundColor: "#efefef"}}>
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

        {this.state.selected_day === null ? 
        <div>
          Click on a day
        </div> : 
        <div>
          <h3>
            {this.state.selected_day.day_of_week} {this.state.selected_day.day_number} {this.state.selected_day.month_name} {this.state.year}
          </h3>
          {this.in_the_future(this.state.selected_day.day_index) > 0 && !this.is_weekend() ? 
          <div>
            <h4>
              Expenditures today
            </h4>
            {this.state.selected_day.engagements.map(
              (engagement, index) =>
              <div key={index} style={{margin: '5px', padding: '5px', border: 'solid', borderWidth: '1px', borderColor: 'black'}}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        Start at:
                      </td>
                      <td>
                        {mins2timestr(engagement.start_minutes)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Finish at:
                      </td>
                      <td>
                        {mins2timestr(engagement.start_minutes + engagement.duration)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Status:
                      </td>
                      <td>
                        {["Undefined","Awaiting approval","Approved","Rejected"][engagement.status]}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button onClick={() => this.delete_expend(engagement.id)}>
                  Delete
                </button>
              </div>
            )}

            <div>
              You have {this.state.selected_day.leave_available / 60} hours ({this.state.selected_day.leave_available} minutes) of leave available on this day.
            </div>
            {this.state.errors.map(
              (error, index) =>
              <div style={{padding: '5px', fontSize: '12px', margin: '5px', backgroundColor: '#ffc2c2', color: 'red'}} key={index}>
                {error}
              </div>
            )}
            <table>
                <tbody>
                  <tr>
                    <td>
                      Start time
                    </td>
                    <td>
                      <select id="new-toil-start" onChange={this.change_start_time}>
                        {(Array.from(Array(16).keys())).map((v,i) => 
                          <option value={i*30+540} key={i}>
                            {mins2timestr(i*30+540)}
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
                      <select id="new-toil-end" onChange={this.change_end_time}>
                        {(Array.from(Array(16).keys())).map((v,i) => 
                          <option value={i*30+570} key={i}>
                            {mins2timestr(i*30+570)}
                          </option>
                        )}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>

              <button onClick={() => {
                if (this.perform_checks()){
                  const list = this.calculate_expends();
                  this.send_expends(list);
                }
                //const list = this.calculate_expends();
                //this.send_expends(list);
              }}>
                Send through
              </button>
              
              {this.state.expenditure.show ? 
              <div>
                <h4>
                  Suggested
                </h4>
                {this.state.selected_day.available_leave.map(
                  (leave, index) =>
                  <div>
                    {leave.available_minutes} minutes ({leave.date_accrued})
                  </div>
                )}
              </div> : null}
          </div> : "Not available to book leave on this day."}
        </div>}

        {/*this.state.selected_day === null ? 
        <div>
          Click on a day
        </div> :
        <div>
          <h3>
            {this.state.selected_day.day_of_week} {this.state.selected_day.day_number} {this.state.selected_day.month_name} {this.state.year}
          </h3>
          {this.in_the_future(this.state.selected_day.day_index) > 0 ? 
          <div>
            {this.state.selected_day.available_leave.map(
              (leave, index) =>
              <div key={index} style={{border: "solid", borderWidth: '1px', borderColor: 'black', padding: '10px'}}>
                <h4>
                  Leave accrued on {leave.date_accrued.slice(0,16)} - {leave.duration - leave.leave_booked} minutes
                </h4>
                <div>
                  <b>
                    Use this leave here
                  </b>
                  <table><tbody>
                    <tr>
                      <td>
                        Start at
                      </td>
                      <td>
                      <select id="new-expend-start">
                        {(Array.from(Array(96).keys())).map((v,i) => 
                          <option value={i*15} key={i}>
                            {mins2timestr(i*15)}
                          </option>
                        )}
                      </select>
                      </td>
                    </tr>
                  </tbody></table>
                  <button onClick={() => this.expend_leave(leave)}>
                    Submit here
                  </button>
                </div>
              </div>
            )}
          </div> : "In the past"}
          {this.state.selected_day.engagements.map(
            (engagement, index) =>
            <div key={index} style={{border: 'solid', borderWidth: '1px', margin: '10px'}}>
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
            </div>
          )}

          {this.state.show_new_request && false ? 
            <div>
              <h4>
                Take leave
              </h4>
              {this.state.new_request_error === null ? null : 
              <div style={{backgroundColor: "red", color: "white"}}>
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
              <button onClick={this.expend_request_all_day}>
                Make all day
              </button>
              <button onClick={this.make_expend_request}>
                Submit
              </button>
            </div> : 
            (true ? null : <button onClick={() => this.setState({show_new_request: true, new_request_error: null})}>
              Make new request
            </button>)}

          <button onClick={() => this.setState({selected_day: null, general_message: ""})}>
            Close
          </button>
        </div>*/}

            </td>
          </tr>
        </tbody></table>
      </div>
    );
  }
}

export default ExpendLieuAccrual

function mins2timestr(mins){
  return (mins/60<10 ? '0' : '') + String(Math.floor(mins / 60)) + ':' + (mins%60<10 ? '0' : '') + String(mins % 60);
}
