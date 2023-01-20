import React from "react"
import PropTypes from "prop-types"
class AccrualIndex extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      accruals: [],
      loaded: false
    };

    this.get_accruals = this.get_accruals.bind(this);
    this.as_array = this.as_array.bind(this);
    this.download_csv = this.download_csv.bind(this);

  }

  componentDidMount(){
    this.get_accruals();
  }

  get_accruals(){
    fetch("/api/accruals/index", {
      method: 'GET',
      credentials: 'include'
    }).then( (response) => {
      if (response.ok){
        return response.json();
      }
      throw new Error('Request fail');
    }).then(json => {
      this.setState({
        accruals: json.accruals
      });
    });
  }

  as_array(){
    let x = [["ID","Date submitted","Date started","Time started","Time finished","Minutes duration","Status"]];
    let i, accrual;
    for (i = 0 ; i < this.state.accruals.length ; i++){
      accrual = this.state.accruals[i];
      x.push([accrual.id, accrual.created_at.replace(',',''), accrual.date_accrued.replace(',',''), mins2timestr(accrual.start_minutes), mins2timestr(accrual.start_minutes + accrual.duration), accrual.duration, ["Unsubmitted","Pending","Approved","Rejected"][accrual.status]]);
    }
    return x;
  }

  download_csv(){
    let rows = this.as_array();
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    window.open(encodeURI(csvContent));
  }

  render () {
    return (
      <div>
        <button onClick={this.download_csv}>
          Download as CSV
        </button>
        <table>
          <tbody>
            <tr>
              <td style={{width: '50px'}}>
                ID
              </td>
              <td style={{width: '260px'}}>
                Date submitted
              </td>
              <td style={{width: '200px'}}>
                Date started
              </td>
              <td style={{width: '120px'}}>
                Time started
              </td>
              <td style={{width: '120px'}}>
                Time finished
              </td>
              <td style={{width: '150px'}}>
                Minutes duration
              </td>
              <td style={{width: '120px'}}>
                Status
              </td>
            </tr>
            {this.state.accruals.map(
              (accrual, index) =>
              <tr>
                <td>
                  {accrual.id}
                </td>
                <td>
                  {accrual.created_at}
                </td>
                <td>
                  {accrual.date_accrued.slice(0,16)}
                </td>
                <td>
                  {mins2timestr(accrual.start_minutes)}
                </td>
                <td>
                  {mins2timestr(accrual.start_minutes + accrual.duration)}
                </td>
                <td>
                  {accrual.duration} minutes
                </td>
                <td>
                  {["Unsubmitted","Pending","Approved","Rejected"][accrual.status]}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default AccrualIndex

function mins2timestr(mins){
  return (mins/60<10 ? '0' : '') + String(Math.floor(mins / 60)) + ':' + (mins%60<10 ? '0' : '') + String(mins % 60);
}
